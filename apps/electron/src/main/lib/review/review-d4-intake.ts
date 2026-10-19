/** P1-C native-picker intake. Renderer never supplies arbitrary host paths. */
import { randomUUID } from 'node:crypto'
import { closeSync, existsSync, mkdirSync, mkdtempSync, openSync, readSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { extname, join } from 'node:path'
import { dialog, type BrowserWindow } from 'electron'
import { recommendD4Intake, type D4RouteFile, type D4RouteResult } from './review-d4-routing'
import { stageD4NativeBatch, type D4BatchSkip } from './review-d4-batch-staging'

const TTL_MS = 20 * 60 * 1000
const TEXT_TYPES = new Set(['.md', '.txt', '.csv', '.json', '.html', '.htm', '.eml'])
interface StagedFile { name: string; sourcePath: string; sizeBytes: number; originLabel: string; sha256: string }
interface StagedIntake {
  token: string
  ownerWebContentsId: number
  directory: string
  files: StagedFile[]
  expiresAt: number
  inUse: boolean
  route: D4RouteResult
  skipped: D4BatchSkip[]
}
const STAGED = new Map<string, StagedIntake>()
function forget(intake: StagedIntake): void {
  STAGED.delete(intake.token)
  rmSync(intake.directory, { recursive: true, force: true })
}
function reap(): void {
  for (const intake of STAGED.values()) if (!intake.inUse && intake.expiresAt < Date.now()) forget(intake)
}
// Reap unused temporary originals even if no further user action occurs.
const reapInterval = setInterval(reap, 60_000)
reapInterval.unref()
process.once('exit', () => { for (const entry of [...STAGED.values()]) forget(entry) })
export interface D4IntakePreview {
  token: string
  expiresAt: number
  files: Array<{ name: string; sizeBytes: number; originLabel?: string }>
  route: D4RouteResult
  skipped: D4BatchSkip[]
}
export async function stageD4Intake(ownerWebContentsId: number, parent?: BrowserWindow, mode: 'files' | 'folder' = 'files'): Promise<D4IntakePreview | null> {
  reap()
  if (mode !== 'files' && mode !== 'folder') throw new Error('D4_INTAKE_PICKER_MODE_INVALID')
  const opts = mode === 'folder'
    ? { title: '选择同一审核事项的材料文件夹（支持子目录和 ZIP）', properties: ['openDirectory'] as Array<'openDirectory'> }
    : { title: '选择审核材料或 ZIP 压缩包（单批最多 100 份）',
      properties: ['openFile', 'multiSelections'] as Array<'openFile' | 'multiSelections'> }
  const selection = parent ? await dialog.showOpenDialog(parent, opts) : await dialog.showOpenDialog(opts)
  if (selection.canceled || !selection.filePaths.length) return null
  return stageD4TrustedRoots(ownerWebContentsId, selection.filePaths)
}
async function stageD4TrustedRoots(ownerWebContentsId: number, roots: readonly string[], providedDir?: string): Promise<D4IntakePreview> {
  const dir = providedDir ?? mkdtempSync(join(tmpdir(), 'cdut-d4-intake-'))
  try {
    // The only permissible roots are Main-picked originals or private copies
    // of explicit File bytes. Arbitrary Renderer paths are never accepted.
    const expanded = await stageD4NativeBatch(roots, dir)
    if (!expanded.files.length) {
      throw new Error('D4_INTAKE_NO_VALID_FILES: 全部材料被过滤或无法解析，请检查文件类型与大小')
    }
    const routeInputs: D4RouteFile[] = []
    const files: StagedFile[] = []
    for (const descriptor of expanded.files) {
      const route: D4RouteFile = { name: descriptor.name }
      if (TEXT_TYPES.has(extname(descriptor.name).toLowerCase())) {
        const handle = openSync(descriptor.sourcePath, 'r')
        try {
          const raw = Buffer.alloc(16 * 1024)
          const bytes = readSync(handle, raw, 0, raw.byteLength, 0)
          route.textSample = raw.subarray(0, bytes).toString('utf8')
        } finally { closeSync(handle) }
      }
      routeInputs.push(route)
      files.push({ name: descriptor.name, sourcePath: descriptor.sourcePath, sizeBytes: descriptor.sizeBytes,
        originLabel: descriptor.originLabel, sha256: descriptor.sha256 })
    }
    const { listD4ClientTemplates } = require('./review-d4-client') as typeof import('./review-d4-client')
    const route = recommendD4Intake(routeInputs, listD4ClientTemplates())
    const token = randomUUID()
    const entry: StagedIntake = { token, ownerWebContentsId, directory: dir, files,
      expiresAt: Date.now() + TTL_MS, inUse: false, route, skipped: expanded.skipped }
    STAGED.set(token, entry)
    return { token, expiresAt: entry.expiresAt,
      files: expanded.files.map(file => ({ name: file.name, sizeBytes: file.sizeBytes, originLabel: file.originLabel })),
      route, skipped: expanded.skipped }
  } catch (error) {
    rmSync(dir, { recursive: true, force: true })
    throw error
  }
}
/** Browser/Electron drag-and-drop materializes user-supplied bytes, NOT paths.
 * Lower drag caps control IPC copies and prevent UI freezes. The normal Main
 * staging pipeline still performs ZIP expansion, content hashes, dedup and route.
 */
export const D4_DROP_MAX_FILES = 16
export const D4_DROP_MAX_BYTES_PER_FILE = 10 * 1024 * 1024
export const D4_DROP_MAX_TOTAL_BYTES = 40 * 1024 * 1024
export function isValidD4DropName(name: unknown): name is string {
  return typeof name === 'string' && !!name && name.length <= 220 &&
    name !== '.' && name !== '..' && !name.includes('/') &&
    !name.includes(String.fromCharCode(92)) && !name.includes(String.fromCharCode(0)) &&
    !/[<>:"|?*]/.test(name) && !/[. ]$/.test(name) &&
    !/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(name)
}
export async function stageD4DroppedBytes(ownerWebContentsId: number,
  items: Array<{ name: string; bytes: Uint8Array }>): Promise<D4IntakePreview> {
  if (!Array.isArray(items) || items.length < 1 || items.length > D4_DROP_MAX_FILES)
    throw new Error('D4_DROP_FILE_COUNT_INVALID')
  let total = 0
  for (const item of items) {
    if (!item || !isValidD4DropName(item.name) || !(item.bytes instanceof Uint8Array) ||
        item.bytes.byteLength < 1 || item.bytes.byteLength > D4_DROP_MAX_BYTES_PER_FILE)
      throw new Error('D4_DROP_FILE_INVALID')
    total += item.bytes.byteLength
    if (total > D4_DROP_MAX_TOTAL_BYTES) throw new Error('D4_DROP_TOTAL_BYTES_EXCEEDED')
  }
  const dir = mkdtempSync(join(tmpdir(), 'cdut-d4-drop-'))
  try {
    const roots: string[] = []
    for (let i = 0; i < items.length; i++) {
      const item = items[i]!
      const folder = join(dir, 'original-' + i)
      mkdirSync(folder)
      const dest = join(folder, item.name)
      writeFileSync(dest, item.bytes, { flag: 'wx' })
      roots.push(dest)
    }
    return await stageD4TrustedRoots(ownerWebContentsId, roots, dir)
  } catch (error) {
    rmSync(dir, { recursive: true, force: true })
    throw error
  }
}

/** Acquire token for a single Main-owned create operation, preventing double-submit replay. */
/** Read-only inspection for a Main-owned token. Never send staged disk paths over IPC. */
export function inspectD4Intake(token: string, ownerWebContentsId: number): StagedIntake {
  reap()
  const entry = STAGED.get(token)
  if (!entry || entry.ownerWebContentsId !== ownerWebContentsId ||
      entry.expiresAt <= Date.now() || entry.inUse ||
      entry.route.status === 'multiple-tasks' ||
      !entry.files.every(file => existsSync(file.sourcePath) && statSync(file.sourcePath).size === file.sizeBytes)) {
    throw new Error('D4_INTAKE_TOKEN_INVALID')
  }
  return entry
}
export function claimD4Intake(token: string, ownerWebContentsId: number): StagedIntake {
  reap()
  const entry = STAGED.get(token)
  if (!entry || entry.ownerWebContentsId !== ownerWebContentsId || entry.expiresAt <= Date.now() ||
      entry.inUse || entry.route.status === 'multiple-tasks' ||
      !entry.files.every(file => existsSync(file.sourcePath) && statSync(file.sourcePath).size === file.sizeBytes)) {
    throw new Error('D4_INTAKE_TOKEN_INVALID: 材料暂存已过期、含多任务或未获当前窗口授权')
  }
  entry.inUse = true
  return entry
}
export function releaseD4Intake(entry: StagedIntake, consumed: boolean): void {
  if (consumed) forget(entry)
  else entry.inUse = false
}
export function discardD4Intake(token: string, ownerWebContentsId: number): boolean {
  const entry = STAGED.get(token)
  if (!entry || entry.ownerWebContentsId !== ownerWebContentsId || entry.inUse) return false
  forget(entry)
  return true
}

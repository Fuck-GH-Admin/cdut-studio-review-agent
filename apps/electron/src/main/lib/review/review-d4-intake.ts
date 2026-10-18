/** P1-C native-picker intake. Renderer never supplies arbitrary host paths. */
import { randomUUID } from 'node:crypto'
import { closeSync, existsSync, mkdtempSync, openSync, readSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { extname, join } from 'node:path'
import { dialog, type BrowserWindow } from 'electron'
import { recommendD4Intake, type D4RouteFile, type D4RouteResult } from './review-d4-routing'
import { stageD4NativeBatch, type D4BatchSkip } from './review-d4-batch-staging'

const TTL_MS = 20 * 60 * 1000
const TEXT_TYPES = new Set(['.md', '.txt', '.csv', '.json', '.html', '.htm', '.eml'])
interface StagedFile { name: string; sourcePath: string; sizeBytes: number }
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
  const dir = mkdtempSync(join(tmpdir(), 'cdut-d4-intake-'))
  try {
    // Native-selected roots only. This helper handles recursive folders/ZIP,
    // size caps, symlinks, basename preservation and duplicate byte hashes.
    const expanded = await stageD4NativeBatch(selection.filePaths, dir)
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
      files.push({ name: descriptor.name, sourcePath: descriptor.sourcePath, sizeBytes: descriptor.sizeBytes })
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
/** Acquire token for a single Main-owned create operation, preventing double-submit replay. */
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

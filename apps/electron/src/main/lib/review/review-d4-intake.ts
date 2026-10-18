/** P1-C native-picker intake. Renderer never supplies arbitrary host paths. */
import { randomUUID } from 'node:crypto'
import { copyFileSync, existsSync, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, extname, join } from 'node:path'
import { dialog, type BrowserWindow } from 'electron'
import { listD4ClientTemplates } from './review-d4-client'
import { recommendD4Intake, type D4RouteFile, type D4RouteResult } from './review-d4-routing'

const TTL_MS = 20 * 60 * 1000
const MAX_FILES = 8
const MAX_FILE_BYTES = 50 * 1024 * 1024
const MAX_TOTAL = 100 * 1024 * 1024
const TEXT_TYPES = new Set(['.md', '.txt', '.csv', '.json', '.html', '.htm', '.eml'])
const ALLOWED_TYPES = new Set([
  ...TEXT_TYPES, '.pdf', '.doc', '.docx', '.docm', '.dot', '.dotx', '.wps', '.xls', '.xlsx',
  '.xlsm', '.et', '.ppt', '.pptx', '.pptm', '.dps', '.rtf', '.odt', '.ods', '.odp',
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp',
])
interface StagedFile { name: string; sourcePath: string; sizeBytes: number }
interface StagedIntake {
  token: string
  ownerWebContentsId: number
  directory: string
  files: StagedFile[]
  expiresAt: number
  inUse: boolean
  route: D4RouteResult
}
const STAGED = new Map<string, StagedIntake>()
function forget(intake: StagedIntake): void {
  STAGED.delete(intake.token)
  rmSync(intake.directory, { recursive: true, force: true })
}
function reap(): void {
  for (const intake of STAGED.values()) if (!intake.inUse && intake.expiresAt < Date.now()) forget(intake)
}
export interface D4IntakePreview {
  token: string
  expiresAt: number
  files: Array<{ name: string; sizeBytes: number }>
  route: D4RouteResult
}
export async function stageD4Intake(ownerWebContentsId: number, parent?: BrowserWindow): Promise<D4IntakePreview | null> {
  reap()
  const opts = { title: '选择同一审核事项的申请材料（最多 8 份）',
    properties: ['openFile', 'multiSelections'] as Array<'openFile' | 'multiSelections'> }
  const selection = parent ? await dialog.showOpenDialog(parent, opts) : await dialog.showOpenDialog(opts)
  if (selection.canceled || !selection.filePaths.length) return null
  if (selection.filePaths.length > MAX_FILES) throw new Error('D4_INTAKE_TOO_MANY: 单次最多 8 份文件')
  const descriptors = selection.filePaths.map(sourcePath => {
    const sizeBytes = statSync(sourcePath).size
    const name = basename(sourcePath)
    if (!ALLOWED_TYPES.has(extname(name).toLowerCase()) || sizeBytes > MAX_FILE_BYTES || sizeBytes < 1) {
      throw new Error('D4_INTAKE_FILE_INVALID: 不支持、空文件或单文件超过 50 MB：' + name)
    }
    return { name, sourcePath, sizeBytes }
  })
  if (descriptors.reduce((n, item) => n + item.sizeBytes, 0) > MAX_TOTAL) {
    throw new Error('D4_INTAKE_TOO_LARGE: 总体积超过 100 MB')
  }
  const dir = mkdtempSync(join(tmpdir(), 'cdut-d4-intake-'))
  try {
    const routeInputs: D4RouteFile[] = []
    const files: StagedFile[] = []
    for (const [i, descriptor] of descriptors.entries()) {
      const dest = join(dir, String(i) + '-' + descriptor.name)
      copyFileSync(descriptor.sourcePath, dest)
      const route: D4RouteFile = { name: descriptor.name }
      if (TEXT_TYPES.has(extname(descriptor.name).toLowerCase())) {
        // Classification-only bounded sampling; no text or absolute file path crosses IPC.
        const raw = readFileSync(dest)
        route.textSample = raw.subarray(0, 16 * 1024).toString('utf8')
      }
      routeInputs.push(route)
      files.push({ name: descriptor.name, sourcePath: dest, sizeBytes: descriptor.sizeBytes })
    }
    const route = recommendD4Intake(routeInputs, listD4ClientTemplates())
    const token = randomUUID()
    const entry: StagedIntake = { token, ownerWebContentsId, directory: dir, files,
      expiresAt: Date.now() + TTL_MS, inUse: false, route }
    STAGED.set(token, entry)
    return { token, expiresAt: entry.expiresAt,
      files: files.map(file => ({ name: file.name, sizeBytes: file.sizeBytes })), route }
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

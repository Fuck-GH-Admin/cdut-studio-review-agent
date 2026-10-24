/** Main-owned T08/F16 report snapshot, immutable archive, and native export service. */
import { createHash, randomUUID } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'node:fs'
import { join, relative, resolve, sep, isAbsolute } from 'node:path'
import type {
  T08Audience, T08Report, T08ReportArchiveSummary,
  T08ReportExportFormat, T08ReportExportReceipt, T08ReportProjection, T08ReportSnapshot,
} from '@profer/shared'
import { makeT08CaseReport, t08ReportWorkbookSheets } from '@profer/shared'
import { getConfigDir } from '../config-paths'
import { getCaseV2Aggregate } from './application-service'
import { assertSafeReviewStorageId } from './review-storage-id'
import { LOCAL_REVIEWER_ACTOR } from './review-ipc-actor-guard'
import { reconcilePiReviewRunsWithReadReceipts } from './pi-case-review-service'
import { listRunsV2 } from './run-store-v2'
import { getTemplate } from './template-store'
import { isWorkspaceRunStaleV2 } from './workspace-business-service-v2'

const REPORT_SNAPSHOT_SCHEMA = 'review-v3-t08-report-snapshot/1' as const
const REPORT_RENDER_VERSION = 't08-report-renderer/2' as const
const AUDIENCES = new Set<T08Audience>(['student', 'reviewer', 'organizer'])
const FORMATS = new Set<T08ReportExportFormat>(['md', 'json', 'html', 'xlsx', 'pdf', 'bundle'])
const EXTENSION: Record<T08ReportExportFormat, string> = {
  md: 'md', json: 'json', html: 'html', xlsx: 'xlsx', pdf: 'pdf', bundle: 'zip',
}

export interface T08ReportServiceDependencies {
  rootDir?: string
  now?: () => string
  chooseDestination?: (defaultName: string, format: T08ReportExportFormat) => Promise<string | undefined>
  renderPdf?: (html: string) => Promise<Uint8Array>
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (value && typeof value === 'object') {
    const object = value as Record<string, unknown>
    return Object.fromEntries(Object.keys(object).sort().map((key) => [key, canonicalize(object[key])]))
  }
  return value
}

function canonicalJson(value: unknown): string { return JSON.stringify(canonicalize(value)) }
function sha256(value: string | Uint8Array): string { return createHash('sha256').update(value).digest('hex') }

export function calculateT08ProjectionHash(value: Pick<T08ReportProjection,
  'caseId' | 'caseTitle' | 'caseRevision' | 'runId' | 'audience' | 'inputHash' |
  'templateId' | 'templateVersion' | 'templateDigest' | 'decisionIds' | 'decisionDigest' |
  'historical' | 'renderVersion' | 'report'>): string {
  return sha256(canonicalJson({
    caseId: value.caseId, caseTitle: value.caseTitle, caseRevision: value.caseRevision,
    runId: value.runId, audience: value.audience, inputHash: value.inputHash,
    templateId: value.templateId, templateVersion: value.templateVersion,
    templateDigest: value.templateDigest, decisionIds: value.decisionIds,
    decisionDigest: value.decisionDigest, historical: value.historical,
    renderVersion: value.renderVersion, report: value.report,
  }))
}

function assertAudience(value: unknown): asserts value is T08Audience {
  if (typeof value !== 'string' || !AUDIENCES.has(value as T08Audience)) throw new Error('报告受众无效')
}
function assertFormat(value: unknown): asserts value is T08ReportExportFormat {
  if (typeof value !== 'string' || !FORMATS.has(value as T08ReportExportFormat)) throw new Error('报告导出格式无效')
}
function validateReportInput(input: { caseId: string; runId: string; audience: T08Audience }): void {
  assertSafeReviewStorageId(input?.caseId, 'caseId')
  assertSafeReviewStorageId(input?.runId, 'runId')
  assertAudience(input?.audience)
}

export function getT08ReportPreviewV3(input: {
  caseId: string; runId: string; audience: T08Audience
}): T08ReportProjection {
  validateReportInput(input)
  const aggregate = getCaseV2Aggregate(input.caseId)
  if (!aggregate) throw new Error('案卷聚合不存在：' + input.caseId)
  const runs = reconcilePiReviewRunsWithReadReceipts(input.caseId, listRunsV2(input.caseId))
  const run = runs.find((item) => item.id === input.runId)
  if (!run || run.caseId !== input.caseId) throw new Error('所选运行不存在或不属于当前案卷')
  const template = getTemplate(run.templateId, run.templateVersion) ?? null
  const stale = isWorkspaceRunStaleV2(aggregate, run.id)
  const historical = stale || runs[0]?.id !== run.id
  const report = makeT08CaseReport({ aggregate, run, template, audience: input.audience, stale: historical })
  const decisions = aggregate.decisions.filter((item) => item.basedOnRunId === run.id).sort((a, b) => a.at.localeCompare(b.at))
  const projectionBase = {
    schema: 'review-v3-t08-report-projection/1' as const,
    caseId: input.caseId,
    caseTitle: aggregate.caseV2.title,
    caseRevision: aggregate.caseV2.revision ?? 0,
    runId: run.id,
    audience: input.audience,
    inputHash: run.inputManifest.hash,
    templateId: run.templateId,
    templateVersion: run.templateVersion,
    templateDigest: template ? sha256(canonicalJson(template)) : null,
    decisionIds: decisions.map((item) => item.id),
    decisionDigest: sha256(canonicalJson(decisions)),
    historical,
    renderVersion: REPORT_RENDER_VERSION,
    report,
  }
  return { ...projectionBase, projectionHash: calculateT08ProjectionHash(projectionBase) }
}

export function makeT08ReportSnapshot(
  projection: T08ReportProjection,
  options: { reportId?: string; createdAt?: string; createdBy?: T08ReportSnapshot['createdBy'] } = {},
): T08ReportSnapshot {
  if (projection.projectionHash !== calculateT08ProjectionHash(projection)) throw new Error('报告预览指纹无效')
  const snapshotBase: Omit<T08ReportSnapshot, 'snapshotHash'> = {
    ...projection,
    schema: REPORT_SNAPSHOT_SCHEMA,
    reportId: options.reportId ?? 'report-' + randomUUID(),
    createdAt: options.createdAt ?? new Date().toISOString(),
    createdBy: options.createdBy ?? { actorId: LOCAL_REVIEWER_ACTOR.actorId, actorSource: 'local', role: 'reviewer' },
  }
  return { ...snapshotBase, snapshotHash: sha256(canonicalJson(snapshotBase)) }
}

export function verifyT08ReportSnapshot(snapshot: T08ReportSnapshot): boolean {
  if (!snapshot || snapshot.schema !== REPORT_SNAPSHOT_SCHEMA || !snapshot.reportId ||
    !snapshot.caseId || !snapshot.runId || !snapshot.snapshotHash || !snapshot.projectionHash ||
    !snapshot.report || snapshot.report.caseId !== snapshot.caseId ||
    snapshot.report.runId !== snapshot.runId || snapshot.report.audience !== snapshot.audience ||
    snapshot.report.stale !== snapshot.historical) return false
  let reportData: { caseId?: string; audience?: string; historical?: boolean; run?: { id?: string; inputHash?: string; status?: string; templateId?: string; templateVersion?: number } }
  try { reportData = JSON.parse(snapshot.report.json) as typeof reportData } catch { return false }
  if (reportData.caseId !== snapshot.caseId || reportData.audience !== snapshot.audience ||
    reportData.historical !== snapshot.historical || reportData.run?.id !== snapshot.runId ||
    reportData.run?.inputHash !== snapshot.inputHash || reportData.run?.status !== snapshot.report.status ||
    reportData.run?.templateId !== snapshot.templateId || reportData.run?.templateVersion !== snapshot.templateVersion) return false
  if (snapshot.projectionHash !== calculateT08ProjectionHash(snapshot)) return false
  const { snapshotHash, ...snapshotBase } = snapshot
  return snapshotHash === sha256(canonicalJson(snapshotBase))
}

function reportRoot(rootDir: string, caseId: string): string {
  assertSafeReviewStorageId(caseId, 'caseId')
  return join(rootDir, 'review-cases', caseId, 'reports-v3')
}
function reportArchivePath(rootDir: string, caseId: string, reportId: string): string {
  assertSafeReviewStorageId(reportId, 'reportId')
  return join(reportRoot(rootDir, caseId), reportId)
}

function writeAtomicNewFile(path: string, content: string | Uint8Array): void {
  const temporary = path + '.' + randomUUID() + '.tmp'
  try {
    writeFileSync(temporary, content, { flag: 'wx', mode: 0o600 })
    if (existsSync(path)) throw new Error('不可变报告文件已存在，拒绝覆盖：' + path)
    renameSync(temporary, path)
  } catch (error) {
    if (existsSync(temporary)) unlinkSync(temporary)
    throw error
  }
}

export function persistT08ReportSnapshot(snapshot: T08ReportSnapshot, rootDir = getConfigDir()): string {
  if (!verifyT08ReportSnapshot(snapshot)) throw new Error('报告快照完整性验证失败，拒绝归档')
  const root = reportRoot(rootDir, snapshot.caseId)
  mkdirSync(root, { recursive: true, mode: 0o700 })
  const directory = reportArchivePath(rootDir, snapshot.caseId, snapshot.reportId)
  mkdirSync(directory, { recursive: false, mode: 0o700 })
  writeAtomicNewFile(join(directory, 'snapshot.json'), JSON.stringify(snapshot, null, 2) + '\n')
  writeAtomicNewFile(join(directory, 'report.md'), snapshot.report.markdown)
  writeAtomicNewFile(join(directory, 'report.json'), snapshot.report.json)
  return directory
}

export function getT08ReportArchiveV3(
  input: { caseId: string; reportId: string },
  rootDir = getConfigDir(),
): T08ReportSnapshot {
  assertSafeReviewStorageId(input?.caseId, 'caseId')
  assertSafeReviewStorageId(input?.reportId, 'reportId')
  const path = join(reportArchivePath(rootDir, input.caseId, input.reportId), 'snapshot.json')
  if (!existsSync(path)) throw new Error('报告档案不存在：' + input.reportId)
  let snapshot: T08ReportSnapshot
  try { snapshot = JSON.parse(readFileSync(path, 'utf-8')) as T08ReportSnapshot }
  catch { throw new Error('报告档案损坏或无法解析：' + input.reportId) }
  if (snapshot.caseId !== input.caseId || snapshot.reportId !== input.reportId || !verifyT08ReportSnapshot(snapshot)) {
    throw new Error('报告档案完整性校验失败：' + input.reportId)
  }
  const directory = reportArchivePath(rootDir, input.caseId, input.reportId)
  if (!existsSync(join(directory, 'report.md')) || !existsSync(join(directory, 'report.json')) ||
    readFileSync(join(directory, 'report.md'), 'utf-8') !== snapshot.report.markdown ||
    readFileSync(join(directory, 'report.json'), 'utf-8') !== snapshot.report.json) {
    throw new Error('报告档案基线文件与不可变快照不一致：' + input.reportId)
  }
  return snapshot
}

export function listT08ReportArchivesV3(caseId: string, rootDir = getConfigDir()): T08ReportArchiveSummary[] {
  const root = reportRoot(rootDir, caseId)
  if (!existsSync(root)) return []
  return readdirSync(root, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => {
    const archivePath = join(root, entry.name)
    try {
      const snapshot = getT08ReportArchiveV3({ caseId, reportId: entry.name }, rootDir)
      const files = readdirSync(archivePath).filter((name) => name !== 'snapshot.json').sort()
      const hasBaseFiles = files.includes('report.md') && files.includes('report.json')
      return {
        reportId: snapshot.reportId, caseId: snapshot.caseId, caseTitle: snapshot.caseTitle,
        runId: snapshot.runId, audience: snapshot.audience, inputHash: snapshot.inputHash,
        templateId: snapshot.templateId, templateVersion: snapshot.templateVersion,
        historical: snapshot.historical, createdAt: snapshot.createdAt,
        snapshotHash: snapshot.snapshotHash, archivePath, files,
        valid: hasBaseFiles, ...(!hasBaseFiles ? { error: '报告档案缺少 MD/JSON 基线文件' } : {}),
      }
    } catch (error) {
      return {
        reportId: entry.name, caseId, caseTitle: '无法读取的报告档案', runId: 'unknown',
        audience: 'reviewer' as const, inputHash: '', templateId: 'unknown', templateVersion: 0,
        historical: true, createdAt: '', snapshotHash: '', archivePath,
        files: existsSync(archivePath) ? readdirSync(archivePath).filter((name) => name !== 'snapshot.json').sort() : [],
        valid: false, error: error instanceof Error ? error.message : String(error),
      }
    }
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

export function renderT08ReportHtml(report: T08Report): string {
  return '<!doctype html><html lang="zh"><head><meta charset="utf-8">' +
    '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\';">' +
    '<title>' + escapeHtml('审核报告 · ' + report.caseId + ' · ' + report.runId) + '</title>' +
    '<style>@page{size:A4;margin:18mm}body{font:14px/1.65 system-ui,"Noto Sans CJK SC",sans-serif;margin:0;white-space:pre-wrap;overflow-wrap:anywhere;color:#111}pre{font:inherit;white-space:pre-wrap;overflow-wrap:anywhere;margin:0}@media print{body{margin:0}}</style>' +
    '</head><body><pre>' + escapeHtml(report.markdown) + '</pre></body></html>'
}

function safeSheetValue(value: string): string {
  return /^[\s\u0000-\u001f]*[=+@-]/u.test(value) ? "'" + value : value
}

async function encodeT08Workbook(report: T08Report): Promise<Uint8Array> {
  const XLSX = await import('xlsx')
  const book = XLSX.utils.book_new()
  for (const sheet of t08ReportWorkbookSheets(report)) {
    const rows = sheet.rows.map((row) => row.map(safeSheetValue))
    const worksheet = XLSX.utils.aoa_to_sheet(rows)
    worksheet['!cols'] = rows[0]?.map((_, index) => ({ wch: index === 0 ? 24 : 48 }))
    XLSX.utils.book_append_sheet(book, worksheet, sheet.name)
  }
  return new Uint8Array(XLSX.write(book, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer)
}

function manifestFor(snapshot: T08ReportSnapshot, files: Array<{ name: string; bytes: Uint8Array }>) {
  return {
    schema: 'review-v3-f16-delivery/2',
    kind: 'read-only-report',
    reportId: snapshot.reportId,
    snapshotHash: snapshot.snapshotHash,
    caseId: snapshot.caseId,
    runId: snapshot.runId,
    audience: snapshot.audience,
    inputHash: snapshot.inputHash,
    template: snapshot.templateId + '@' + snapshot.templateVersion,
    runStatus: snapshot.report.status,
    historical: snapshot.historical,
    createdAt: snapshot.createdAt,
    files: files.map((file) => ({ name: file.name, size: file.bytes.byteLength, sha256: sha256(file.bytes) })),
    notice: '本包的 SHA-256 只校验文件与清单内容一致，不是数字签名、身份认证、学校审批或外部收件回执。',
  }
}

async function encodeT08Bundle(snapshot: T08ReportSnapshot, renderPdf: (html: string) => Promise<Uint8Array>): Promise<Uint8Array> {
  const report = snapshot.report
  const files = [
    { name: 'report.md', bytes: new TextEncoder().encode(report.markdown) },
    { name: 'report.json', bytes: new TextEncoder().encode(report.json) },
    { name: 'report.html', bytes: new TextEncoder().encode(renderT08ReportHtml(report)) },
    { name: 'report.xlsx', bytes: await encodeT08Workbook(report) },
    { name: 'report.pdf', bytes: await renderPdf(renderT08ReportHtml(report)) },
  ]
  const JSZip = (await import('jszip')).default
  const archive = new JSZip()
  for (const file of files) archive.file(file.name, file.bytes)
  archive.file('manifest.json', JSON.stringify(manifestFor(snapshot, files), null, 2))
  archive.file('README.txt', [
    'CDUT Studio V3 · F16 只读报告交付包',
    '报告档案：' + snapshot.reportId,
    '案卷：' + snapshot.caseId,
    '运行：' + snapshot.runId,
    '受众：' + snapshot.audience,
    snapshot.historical ? '此报告基于历史或过期运行，不代表案卷当前状态。' : '此报告绑定生成时的输入与决定版本。',
    'PDF 为可检索文字，HTML 使用内嵌样式且不加载远端资源。',
    'manifest.json 中的 SHA-256 用于完整性校验，不是数字签名或发送者认证。',
    '本包不包含原件本体，不构成学校审批、离线回复或外部系统已收件证明。',
  ].join('\n'))
  return new Uint8Array(await archive.generateAsync({ type: 'uint8array', compression: 'DEFLATE', compressionOptions: { level: 5 } }))
}

export async function encodeT08ReportFormat(
  report: T08Report,
  format: T08ReportExportFormat,
  renderPdf: (html: string) => Promise<Uint8Array>,
  snapshot?: T08ReportSnapshot,
): Promise<Uint8Array> {
  assertFormat(format)
  if (format === 'md') return new TextEncoder().encode(report.markdown)
  if (format === 'json') return new TextEncoder().encode(report.json)
  if (format === 'html') return new TextEncoder().encode(renderT08ReportHtml(report))
  if (format === 'xlsx') return encodeT08Workbook(report)
  if (format === 'pdf') return renderPdf(renderT08ReportHtml(report))
  if (!snapshot) throw new Error('生成 F16 交接包必须绑定已归档 ReportSnapshot')
  if (snapshot.report.caseId !== report.caseId || snapshot.report.runId !== report.runId ||
    snapshot.report.audience !== report.audience || snapshot.report.markdown !== report.markdown ||
    snapshot.report.json !== report.json || !verifyT08ReportSnapshot(snapshot)) {
    throw new Error('F16 交接包输入与已归档 ReportSnapshot 不一致')
  }
  return encodeT08Bundle(snapshot, renderPdf)
}

async function renderPdfWithBrowserWindow(html: string): Promise<Uint8Array> {
  const { BrowserWindow } = require('electron') as typeof import('electron')
  const window = new BrowserWindow({
    show: false, width: 900, height: 1200,
    webPreferences: { sandbox: true, contextIsolation: true, nodeIntegration: false },
  })
  try {
    await window.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html))
    return new Uint8Array(await window.webContents.printToPDF({
      pageSize: 'A4', printBackground: true, preferCSSPageSize: true, marginsType: 0,
    }))
  } finally {
    if (!window.isDestroyed()) window.destroy()
  }
}

async function chooseDestination(defaultName: string, format: T08ReportExportFormat): Promise<string | undefined> {
  const { dialog } = require('electron') as typeof import('electron')
  const { getMainWindow } = require('../main-window-state') as typeof import('../main-window-state')
  const window = getMainWindow()
  const options = {
    title: '导出审核报告',
    defaultPath: defaultName,
    filters: [{ name: format === 'bundle' ? 'ZIP 交接包' : format.toUpperCase() + ' 报告', extensions: [EXTENSION[format]] }],
  }
  const result = window ? await dialog.showSaveDialog(window, options) : await dialog.showSaveDialog(options)
  return result.canceled ? undefined : result.filePath
}

function safeFilename(value: string): string {
  const cleaned = value.replace(/[^\p{L}\p{N}._-]+/gu, '_').replace(/^\.+/, '').slice(0, 100)
  return cleaned || 'review-report'
}

function assertDestinationOutsideArchive(archivePath: string, destinationPath: string): void {
  const base = resolve(archivePath)
  const target = resolve(destinationPath)
  const rel = relative(base, target)
  const inside = rel === '' || (!rel.startsWith('..' + sep) && rel !== '..' && !isAbsolute(rel))
  if (inside) throw new Error('导出目标不能覆盖内部不可变报告档案')
}

function writeExportedFile(path: string, bytes: Uint8Array): void {
  writeFileSync(path, bytes, { flag: 'w', mode: 0o600 })
}

export async function exportT08ReportV3(
  input: { caseId: string; runId: string; audience: T08Audience; format: T08ReportExportFormat; expectedProjectionHash: string },
  dependencies: T08ReportServiceDependencies = {},
): Promise<T08ReportExportReceipt> {
  assertFormat(input?.format)
  const projection = getT08ReportPreviewV3(input)
  if (projection.projectionHash !== input.expectedProjectionHash) {
    throw new Error('报告预览已过期：案卷、输入、模板或决定发生变化，请刷新后重新导出')
  }
  return exportT08ReportProjectionV3(projection, input.format, dependencies)
}

export async function exportT08ReportProjectionV3(
  projection: T08ReportProjection,
  format: T08ReportExportFormat,
  dependencies: T08ReportServiceDependencies = {},
): Promise<T08ReportExportReceipt> {
  assertFormat(format)
  if (projection.projectionHash !== calculateT08ProjectionHash(projection)) throw new Error('报告预览指纹无效')
  const snapshotOptions = dependencies.now ? { createdAt: dependencies.now() } : {}
  const snapshot = makeT08ReportSnapshot(projection, snapshotOptions)
  const rootDir = dependencies.rootDir ?? getConfigDir()
  const archivePath = persistT08ReportSnapshot(snapshot, rootDir)
  const renderPdf = dependencies.renderPdf ?? renderPdfWithBrowserWindow
  const bytes = await encodeT08ReportFormat(snapshot.report, format, renderPdf, snapshot)
  const archiveFilePath = join(archivePath, 'delivery.' + EXTENSION[format])
  writeAtomicNewFile(archiveFilePath, bytes)
  const destination = await (dependencies.chooseDestination ?? chooseDestination)(
    safeFilename(snapshot.caseId + '-' + snapshot.runId + '-' + snapshot.audience) + '.' + EXTENSION[format], format,
  )
  if (!destination) {
    return { status: 'cancelled', reportId: snapshot.reportId, snapshotHash: snapshot.snapshotHash,
      caseId: snapshot.caseId, runId: snapshot.runId, audience: snapshot.audience, format,
      archivePath, archiveFilePath }
  }
  assertDestinationOutsideArchive(archivePath, destination)
  writeExportedFile(destination, bytes)
  return { status: 'saved', reportId: snapshot.reportId, snapshotHash: snapshot.snapshotHash,
    caseId: snapshot.caseId, runId: snapshot.runId, audience: snapshot.audience, format,
    archivePath, archiveFilePath, filePath: destination, savedAt: (dependencies.now ?? (() => new Date().toISOString()))() }
}

export async function exportT08ReportArchiveV3(
  input: { caseId: string; reportId: string; format: T08ReportExportFormat },
  dependencies: T08ReportServiceDependencies = {},
): Promise<T08ReportExportReceipt> {
  assertFormat(input?.format)
  const rootDir = dependencies.rootDir ?? getConfigDir()
  const snapshot = getT08ReportArchiveV3(input, rootDir)
  const archivePath = reportArchivePath(rootDir, input.caseId, input.reportId)
  const renderPdf = dependencies.renderPdf ?? renderPdfWithBrowserWindow
  const bytes = await encodeT08ReportFormat(snapshot.report, input.format, renderPdf, snapshot)
  const destination = await (dependencies.chooseDestination ?? chooseDestination)(
    safeFilename(snapshot.caseId + '-' + snapshot.runId + '-' + snapshot.audience) + '.' + EXTENSION[input.format], input.format,
  )
  if (!destination) {
    return { status: 'cancelled', reportId: snapshot.reportId, snapshotHash: snapshot.snapshotHash,
      caseId: snapshot.caseId, runId: snapshot.runId, audience: snapshot.audience, format: input.format, archivePath }
  }
  assertDestinationOutsideArchive(archivePath, destination)
  writeExportedFile(destination, bytes)
  return { status: 'saved', reportId: snapshot.reportId, snapshotHash: snapshot.snapshotHash,
    caseId: snapshot.caseId, runId: snapshot.runId, audience: snapshot.audience, format: input.format,
    archivePath, filePath: destination, savedAt: (dependencies.now ?? (() => new Date().toISOString()))() }
}

import { afterEach, expect, test } from 'bun:test'
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import * as XLSX from 'xlsx'
import JSZip from 'jszip'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { T08Report, T08ReportProjection } from '@profer/shared'
import {
  calculateT08ProjectionHash, encodeT08ReportFormat, exportT08ReportProjectionV3, getT08ReportArchiveV3,
  listT08ReportArchivesV3, makeT08ReportSnapshot, persistT08ReportSnapshot,
  renderT08ReportHtml, verifyT08ReportSnapshot,
} from './review-v3-report-service'

const tempRoots: string[] = []
function root(): string {
  const value = mkdtempSync(join(tmpdir(), 't08-report-'))
  tempRoots.push(value)
  return value
}
afterEach(() => { for (const path of tempRoots.splice(0)) rmSync(path, { recursive: true, force: true }) })

function fixtureReport(): T08Report {
  return {
    audience: 'student', runId: 'run-1', caseId: 'case-1', status: 'completed', stale: false,
    markdown: '# 报告\n安全文本 <script>alert(1)</script>',
    json: JSON.stringify({ schema: 'review-v3-t08-report/2', caseId: 'case-1', audience: 'student', historical: false,
      run: { id: 'run-1', status: 'completed', inputHash: 'input-1', templateId: 'template-1', templateVersion: 2,
        coverage: { plannedChecks: 1, completedChecks: 1, effectiveVerdicts: 1, pendingChecks: 0 } },
      sources: [], decision: null, subjects: [], supplements: [] }),
    rows: [{ kind: 'check', id: 'c1', status: 'compliant', detail: '=HYPERLINK("x")', source: '来源' }],
  }
}
function fixtureProjection(): T08ReportProjection {
  const report = fixtureReport()
  const base = {
    schema: 'review-v3-t08-report-projection/1' as const, caseId: 'case-1', caseTitle: '测试案卷',
    caseRevision: 3, runId: 'run-1', audience: 'student' as const, inputHash: 'input-1',
    templateId: 'template-1', templateVersion: 2, templateDigest: 'template-digest',
    decisionIds: ['decision-1'], decisionDigest: 'decision-digest', historical: false,
    renderVersion: 't08-report-renderer/2' as const, report,
  }
  return { ...base, projectionHash: calculateT08ProjectionHash(base) }
}

test('T08 snapshot is immutable, binds the projected report and can be reopened after restart', () => {
  const projection = fixtureProjection()
  const snapshot = makeT08ReportSnapshot(projection, { reportId: 'report-fixed', createdAt: '2026-10-24T00:00:00.000Z' })
  expect(verifyT08ReportSnapshot(snapshot)).toBe(true)
  const rootDir = root()
  persistT08ReportSnapshot(snapshot, rootDir)
  const reopened = getT08ReportArchiveV3({ caseId: snapshot.caseId, reportId: snapshot.reportId }, rootDir)
  expect(reopened.snapshotHash).toBe(snapshot.snapshotHash)
  expect(reopened.report.markdown).toBe(snapshot.report.markdown)
  expect(listT08ReportArchivesV3(snapshot.caseId, rootDir)[0]?.valid).toBe(true)
})

test('T08 snapshot rejects changed report bytes and changed binding metadata', () => {
  const snapshot = makeT08ReportSnapshot(fixtureProjection(), { reportId: 'report-fixed', createdAt: '2026-10-24T00:00:00.000Z' })
  expect(verifyT08ReportSnapshot({ ...snapshot, report: { ...snapshot.report, markdown: '# Tampered' } })).toBe(false)
  expect(verifyT08ReportSnapshot({ ...snapshot, inputHash: 'different-input' })).toBe(false)
})

test('T08 HTML is text-searchable content with no script execution or remote resource dependency', () => {
  const html = renderT08ReportHtml(fixtureReport())
  expect(html).toContain('default-src \'none\'')
  expect(html).toContain('&lt;script&gt;')
  expect(html).not.toContain('<script>')
  expect(html).not.toContain('https://')
})

test('F16 spreadsheet export neutralizes formula-like content; PDF and bundle consume the same projection', async () => {
  const report = fixtureReport()
  const pdfRenderer = async (html: string) => new TextEncoder().encode('%PDF-1.7\n' + html + '\n%%EOF')
  const workbookBytes = await encodeT08ReportFormat(report, 'xlsx', pdfRenderer)
  expect(workbookBytes.byteLength).toBeGreaterThan(0)
  const workbook = XLSX.read(workbookBytes, { type: 'array' })
  const detail = workbook.Sheets['检查与来源']!['D2']!
  expect(detail.t).toBe('s')
  expect(detail.f).toBeUndefined()
  expect(detail.v).toContain('HYPERLINK')
  const pdf = await encodeT08ReportFormat(report, 'pdf', pdfRenderer)
  expect(new TextDecoder().decode(pdf)).toContain('%PDF-1.7')
  const snapshot = makeT08ReportSnapshot(fixtureProjection(), { reportId: 'report-fixed', createdAt: '2026-10-24T00:00:00.000Z' })
  const zipBytes = await encodeT08ReportFormat(report, 'bundle', pdfRenderer, snapshot)
  const zip = await JSZip.loadAsync(zipBytes)
  expect(Object.keys(zip.files).sort()).toEqual(['README.txt', 'manifest.json', 'report.html', 'report.json', 'report.md', 'report.pdf', 'report.xlsx'])
  const manifest = JSON.parse(await zip.file('manifest.json')!.async('string')) as { snapshotHash: string; reportId: string }
  expect(manifest.snapshotHash).toBe(snapshot.snapshotHash)
  expect(manifest.reportId).toBe(snapshot.reportId)
})

test('F16 cancellation keeps the immutable archive but does not claim an external save', async () => {
  const rootDir = root()
  const receipt = await exportT08ReportProjectionV3(fixtureProjection(), 'md', {
    rootDir, now: () => '2026-10-24T00:00:00.000Z', chooseDestination: async () => undefined,
  })
  expect(receipt.status).toBe('cancelled')
  expect(receipt.filePath).toBeUndefined()
  expect(existsSync(join(receipt.archivePath, 'snapshot.json'))).toBe(true)
  expect(existsSync(receipt.archiveFilePath!)).toBe(true)
  expect(listT08ReportArchivesV3(receipt.caseId, rootDir)[0]?.valid).toBe(true)
})

test('F16 successful save returns the actual destination and saved bytes', async () => {
  const rootDir = root()
  const destination = join(rootDir, 'saved-report.md')
  const receipt = await exportT08ReportProjectionV3(fixtureProjection(), 'md', {
    rootDir, now: () => '2026-10-24T00:00:00.000Z', chooseDestination: async () => destination,
  })
  expect(receipt.status).toBe('saved')
  expect(receipt.filePath).toBe(destination)
  expect(readFileSync(destination, 'utf-8')).toBe(fixtureReport().markdown)
})

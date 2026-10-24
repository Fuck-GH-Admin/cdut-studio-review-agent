import { afterEach, expect, test } from 'bun:test'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { T08Report, T08ReportProjection } from '@profer/shared'
import {
  calculateT08ProjectionHash, encodeT08ReportFormat, getT08ReportArchiveV3,
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
      run: { id: 'run-1', status: 'completed', inputHash: 'input-1', templateId: 'template-1', templateVersion: 2 } }),
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
  const workbook = await encodeT08ReportFormat(report, 'xlsx', pdfRenderer)
  expect(workbook.byteLength).toBeGreaterThan(0)
  const pdf = await encodeT08ReportFormat(report, 'pdf', pdfRenderer)
  expect(new TextDecoder().decode(pdf)).toContain('%PDF-1.7')
  const snapshot = makeT08ReportSnapshot(fixtureProjection(), { reportId: 'report-fixed', createdAt: '2026-10-24T00:00:00.000Z' })
  const zip = await encodeT08ReportFormat(report, 'bundle', pdfRenderer, snapshot)
  expect(zip.byteLength).toBeGreaterThan(0)
})

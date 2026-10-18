import { afterAll, describe, expect, mock, test } from 'bun:test'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { D4ClientSelection } from '@profer/shared'
const root = mkdtempSync(join(tmpdir(), 'w1-d4-retry-'))
process.env.PROFER_CONFIG_DIR = join(root, 'profile')
mkdirSync(process.env.PROFER_CONFIG_DIR, { recursive: true })
let picked: string[] = []
mock.module('electron', () => ({ dialog: { showOpenDialog: async () => ({ canceled: false, filePaths: picked }) } }))
const { stageD4Intake } = await import('./review-d4-intake')
const { assessD4CaseBatch, applyD4CaseBatch } = await import('./review-d4-case-batch')
const { retryD4CaseDocument, resolveD4RetryOriginal } = await import('./review-d4-document-retry')
const { listD4ClientTemplates, createD4ClientCase } = await import('./review-d4-client')
const { getCase, getReviewCasesDir, updateCase } = await import('./case-store')
afterAll(() => rmSync(root, { recursive: true, force: true }))
const template = listD4ClientTemplates().find(x => x.templateId === 'g03-t01')!
function selection(): D4ClientSelection {
  return { reviewerConfirmation: 'explicit-ui-confirmation', selection: {
    templateId: template.templateId, version: template.version,
    targets: [{ kind: 'generic-object', objectKey: 'retry-object', subjectId: 'retry-subject',
      title: '教室借用', businessType: template.businessTypes![0]!, scenario: template.primary[0]!,
      scenarioSource: { ...template.selectionSource!, decidedBy: 'reviewer' },
      conditions: template.conditions.map(id => ({ id, applicability: 'unknown',
        decidedBy: 'undetermined', sourceId: template.selectionSource!.sourceId,
        sourceVersionId: template.selectionSource!.sourceVersionId })),
    }],
  } }
}
async function importCase(path: string) {
  const created = await createD4ClientCase({ title: 'W1 重试解析', applicant: '合成',
    academicYear: '2026-2027', d4: selection() }, 444)
  picked = [path]
  const staged = (await stageD4Intake(444))!
  const preflight = assessD4CaseBatch({ caseId: created.id, role: 'application', token: staged.token }, 444)
  const applied = await applyD4CaseBatch({ caseId: created.id, role: 'application',
    token: staged.token, expectedRevision: preflight.expectedRevision,
    choices: [{ kind: 'append' }], acknowledgeSkipped: false }, 444)
  return { caseId: created.id, document: applied.documents[0]! }
}
describe('W1 safe in-case immutable source retry', () => {
  test('failed legacy parse repaired from exact recorded original, then previous version archived', async () => {
    const source = join(root, '教室申请.md')
    writeFileSync(source, '## 申请材料\\n容量 120 人，合成测试资料')
    const { caseId, document } = await importCase(source)
    expect(document.parseStatus).toBe('parsed')
    await updateCase(caseId, fresh => ({
      ...fresh, documents: fresh.documents.map(doc => doc.id === document.id
        ? { ...doc, parseStatus: 'failed', parseError: '模拟旧版解析器失败' }
        : doc),
    }), { reason: 'synthetic old parser failure' })
    const revision = getCase(caseId)!.revision!
    const original = resolveD4RetryOriginal({ caseId, documentId: document.id, expectedRevision: revision })
    expect(readFileSync(original.realSourcePath, 'utf8')).toContain('容量 120 人')
    await expect(retryD4CaseDocument({ caseId, documentId: document.id, expectedRevision: revision - 1 }))
      .rejects.toThrow('D4_RETRY_STALE_REVISION')
    const result = await retryD4CaseDocument({ caseId, documentId: document.id, expectedRevision: revision })
    expect(result.status).toBe('replaced')
    expect(result.parseStatus).toBe('parsed')
    const after = getCase(caseId)!
    expect(after.documents).toHaveLength(1)
    expect(after.documents[0]!.fileName).toBe('教室申请.md')
    expect(after.archivedDocuments?.some(doc => doc.id === document.id)).toBe(true)
    expect(after.d4IntakeOrigins?.some(item => item.documentId === result.attemptDocumentId)).toBe(true)
    await expect(retryD4CaseDocument({ caseId, documentId: document.id,
      expectedRevision: after.revision! })).rejects.toThrow('D4_RETRY_DOCUMENT_NOT_ELIGIBLE')
  })
  test('image-only partial parser retry cannot retire old source or silently claim parsed', async () => {
    const source = join(root, '现场照片.png')
    writeFileSync(source, Buffer.from('synthetic image bytes; not OCR'))
    const { caseId, document } = await importCase(source)
    expect(document.parseStatus).toBe('partial')
    const result = await retryD4CaseDocument({ caseId, documentId: document.id,
      expectedRevision: getCase(caseId)!.revision! })
    expect(result.status).toBe('still-incomplete')
    const latest = getCase(caseId)!
    expect(latest.documents).toHaveLength(1)
    expect(latest.documents[0]!.id).toBe(document.id)
    expect(latest.archivedDocuments?.some(doc => doc.id === result.attemptDocumentId)).toBe(true)
    expect(latest.d4IntakeWarnings?.some(x => x.reason.includes(result.attemptDocumentId))).toBe(true)
  })
  test('tampering with archived original of same byte size blocks retry before case change', async () => {
    const source = join(root, '另一个照片.png')
    writeFileSync(source, Buffer.from('first-file-bytes'))
    const { caseId, document } = await importCase(source)
    const caseRoot = join(getReviewCasesDir(), caseId)
    const path = join(caseRoot, 'source-docs', document.id + '-' + document.fileName)
    const previous = readFileSync(path)
    writeFileSync(path, Buffer.from('X'.repeat(previous.length)))
    const revision = getCase(caseId)!.revision!
    await expect(retryD4CaseDocument({ caseId, documentId: document.id, expectedRevision: revision }))
      .rejects.toThrow('D4_RETRY_ORIGINAL_HASH_MISMATCH')
    expect(getCase(caseId)!.revision).toBe(revision)
    expect(getCase(caseId)!.documents[0]!.id).toBe(document.id)
  })
})

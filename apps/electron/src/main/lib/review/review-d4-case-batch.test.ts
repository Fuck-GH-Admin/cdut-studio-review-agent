/**
 * W1 post-case batch: genuine D2 creation, Main native picker, source persistence,
 * archived predecessor and digest conflict. Only Electron's OS file dialog is mocked.
 */
import { afterAll, describe, expect, mock, test } from 'bun:test'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { D4ClientSelection } from '@profer/shared'

const root = mkdtempSync(join(tmpdir(), 'd4-w1-case-batch-'))
process.env.PROFER_CONFIG_DIR = join(root, 'profile')
mkdirSync(process.env.PROFER_CONFIG_DIR, { recursive: true })
const path = join(root, '教室用途申请.md')
writeFileSync(path, '# 首份教室用途申请\n材料是合成测试输入，不是校方证明。')
let selected = [path]
mock.module('electron', () => ({ dialog: { showOpenDialog: async () => ({ canceled: false, filePaths: selected }) } }))
const { stageD4Intake, claimD4Intake } = await import('./review-d4-intake')
const { assessD4CaseBatch, applyD4CaseBatch } = await import('./review-d4-case-batch')
const { createD4ClientCase, listD4ClientTemplates } = await import('./review-d4-client')
const { getCase, updateCase } = await import('./case-store')
afterAll(() => rmSync(root, { recursive: true, force: true }))
const template = listD4ClientTemplates().find(item => item.templateId === 'g03-t01')!
const selection = (): D4ClientSelection => ({
  reviewerConfirmation: 'explicit-ui-confirmation',
  selection: { templateId: template.templateId, version: template.version,
    targets: [{ kind: 'generic-object', objectKey: 'case-batch-object', subjectId: 'case-batch-subject',
      title: '教学活动场地', businessType: template.businessTypes![0]!,
      scenario: template.primary[0]!,
      scenarioSource: { ...template.selectionSource!, decidedBy: 'reviewer' },
      conditions: template.conditions.map(id => ({
        id, applicability: 'unknown', decidedBy: 'undetermined',
        sourceId: template.selectionSource!.sourceId,
        sourceVersionId: template.selectionSource!.sourceVersionId,
      })),
    }],
  },
})
async function create() {
  return createD4ClientCase({ title: 'W1 案卷追加与替换',
    applicant: '合成申请人', academicYear: '2026-2027', d4: selection() }, 903)
}
describe('W1 post-case native append and revision-aware replacement', () => {
  test('append, duplicate refusal, stale revision, then only-successful-new-version replacement archives old source', async () => {
    const originalCase = await create()
    const first = (await stageD4Intake(903))!
    const assess1 = assessD4CaseBatch({ caseId: originalCase.id, role: 'application', token: first.token }, 903)
    expect(assess1.files[0]!.nameConflicts).toEqual([])
    expect(() => assessD4CaseBatch({ caseId: originalCase.id, role: 'application', token: first.token }, 904))
      .toThrow('D4_INTAKE_TOKEN_INVALID')
    const added = await applyD4CaseBatch({ caseId: originalCase.id, role: 'application',
      token: first.token, expectedRevision: assess1.expectedRevision, choices: [{ kind: 'append' }],
      acknowledgeSkipped: false }, 903)
    expect(added.documents).toHaveLength(1)
    const oldDocId = added.documents[0]!.id
    await updateCase(originalCase.id, fresh => ({ ...fresh, items: [...fresh.items, {
      id: 'w1-stale-v1-item', title: '旧原件识别的历史申报条目', category: '合成场景',
      declaredScore: 0, anchor: { documentId: oldDocId, precision: 'document' as const },
      evidenceDocumentIds: [], status: 'identified' as const, identifiedBy: 'manual' as const,
    }] }), { reason: 'W1 synthetic old-file anchored item' })
    const duplicated = (await stageD4Intake(903))!
    const assessDuplicate = assessD4CaseBatch({ caseId: originalCase.id, role: 'application', token: duplicated.token }, 903)
    expect(assessDuplicate.files[0]!.duplicateOf).toBe(oldDocId)
    await expect(applyD4CaseBatch({ caseId: originalCase.id, role: 'application',
      token: duplicated.token, expectedRevision: assessDuplicate.expectedRevision,
      choices: [{ kind: 'append' }], acknowledgeSkipped: false }, 903))
      .rejects.toThrow('D4_BATCH_DUPLICATE_MUST_SKIP')
    const skip = await applyD4CaseBatch({ caseId: originalCase.id, role: 'application',
      token: duplicated.token, expectedRevision: assessDuplicate.expectedRevision,
      choices: [{ kind: 'skip' }], acknowledgeSkipped: false }, 903)
    expect(skip.skipped).toHaveLength(1)

    writeFileSync(path, '# 第二版教室用途申请\n更正后的合成数据')
    const replacement = (await stageD4Intake(903))!
    const assess2 = assessD4CaseBatch({ caseId: originalCase.id, role: 'application', token: replacement.token }, 903)
    expect(assess2.files[0]!.nameConflicts[0]!.documentId).toBe(oldDocId)
    await expect(applyD4CaseBatch({ caseId: originalCase.id, role: 'application',
      token: replacement.token, expectedRevision: assess2.expectedRevision - 1,
      choices: [{ kind: 'replace', documentId: oldDocId }], acknowledgeSkipped: false }, 903))
      .rejects.toThrow('D4_BATCH_STALE_CASE_REVISION')
    await expect(applyD4CaseBatch({ caseId: originalCase.id, role: 'application',
      token: replacement.token, expectedRevision: assess2.expectedRevision,
      choices: [{ kind: 'replace', documentId: 'not-old-source' }], acknowledgeSkipped: false }, 903))
      .rejects.toThrow('D4_BATCH_REPLACEMENT_TARGET_INVALID')
    const result = await applyD4CaseBatch({ caseId: originalCase.id, role: 'application',
      token: replacement.token, expectedRevision: assess2.expectedRevision,
      choices: [{ kind: 'replace', documentId: oldDocId }], acknowledgeSkipped: false }, 903)
    expect(result.replacements).toHaveLength(1)
    const latest = getCase(originalCase.id)!
    expect(latest.documents).toHaveLength(1)
    expect(latest.documents[0]!.id).not.toBe(oldDocId)
    expect(latest.archivedDocuments?.some(doc => doc.id === oldDocId)).toBe(true)
    expect(latest.items.some(item => item.anchor.documentId === oldDocId)).toBe(false)
    expect(latest.d4IntakeOrigins).toHaveLength(2)
    expect(new Set(latest.d4IntakeOrigins?.map(x => x.sha256)).size).toBe(2)
    expect(() => claimD4Intake(replacement.token, 903)).toThrow('D4_INTAKE_TOKEN_INVALID')
  })
  test('nonempty skipped file manifest requires explicit human permission after case exists', async () => {
    const created = await create()
    const folder = join(root, 'post-case-folder')
    mkdirSync(folder)
    writeFileSync(join(folder, '有效材料.md'), 'material after case')
    writeFileSync(join(folder, 'unsafe.exe'), 'unsafe')
    selected = [folder]
    const staged = (await stageD4Intake(903, undefined, 'folder'))!
    const assessed = assessD4CaseBatch({ caseId: created.id, role: 'evidence', token: staged.token }, 903)
    expect(assessed.skipped).toHaveLength(1)
    await expect(applyD4CaseBatch({ caseId: created.id, role: 'evidence', token: staged.token,
      choices: [{ kind: 'append' }], expectedRevision: assessed.expectedRevision, acknowledgeSkipped: false }, 903))
      .rejects.toThrow('D4_BATCH_SKIPS_ACK_REQUIRED')
    const applied = await applyD4CaseBatch({ caseId: created.id, role: 'evidence', token: staged.token,
      choices: [{ kind: 'append' }], expectedRevision: assessed.expectedRevision, acknowledgeSkipped: true }, 903)
    expect(applied.documents).toHaveLength(1)
    expect(getCase(created.id)!.d4IntakeWarnings?.some(w => w.originLabel.includes('unsafe.exe'))).toBe(true)
    expect(getCase(created.id)!.documents[0]!.role).toBe('evidence')
  })
})

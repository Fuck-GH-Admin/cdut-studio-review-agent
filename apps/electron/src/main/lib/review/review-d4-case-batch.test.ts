/**
 * W1 post-case batch: genuine D2 creation, Main native picker, source persistence,
 * archived predecessor and digest conflict. Only Electron's OS file dialog is mocked.
 */
import { afterAll, describe, expect, mock, test } from 'bun:test'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import JSZip from 'jszip'
import type { D4ClientSelection } from '@profer/shared'

const root = mkdtempSync(join(tmpdir(), 'd4-w1-case-batch-'))
process.env.PROFER_CONFIG_DIR = join(root, 'profile')
mkdirSync(process.env.PROFER_CONFIG_DIR, { recursive: true })
const path = join(root, '教室用途申请.md')
writeFileSync(path, '# 首份教室用途申请\n材料是合成测试输入，不是校方证明。')
let selected = [path]
mock.module('electron', () => ({ dialog: { showOpenDialog: async () => ({ canceled: false, filePaths: selected }) } }))
const { stageD4Intake, stageD4DroppedBytes, claimD4Intake, discardD4Intake } = await import('./review-d4-intake')
const { assessD4CaseBatch, applyD4CaseBatch } = await import('./review-d4-case-batch')
const { createD4ClientCase, listD4ClientTemplates } = await import('./review-d4-client')
const { getCase, updateCase } = await import('./case-store')
const { readAggregate } = await import('./case-store-v2')
const { correctObservation } = await import('./application-service')
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
    expect(latest.d4MaterialTransitions).toContainEqual({
      previousDocumentId: oldDocId, newDocumentId: result.replacements[0]!.newDocumentId,
      kind: 'replace', status: 'archived', originLabel: assess2.files[0]!.originLabel,
    })
    expect(new Set(latest.d4IntakeOrigins?.map(x => x.sha256)).size).toBe(2)
    expect(() => claimD4Intake(replacement.token, 903)).toThrow('D4_INTAKE_TOKEN_INVALID')
  })
  test('real D4 Subject observation correction retains current original-version SourceRef and audit receipt', async () => {
    selected = [path]
    writeFileSync(path, '# 教室容量说明\\n可供 120 人使用，合成测试资料')
    const created = await create()
    const staged = (await stageD4Intake(903))!
    const assessment = assessD4CaseBatch({ caseId: created.id, role: 'application', token: staged.token }, 903)
    await applyD4CaseBatch({ caseId: created.id, role: 'application',
      token: staged.token, expectedRevision: assessment.expectedRevision,
      choices: [{ kind: 'append' }], acknowledgeSkipped: false }, 903)
    const before = readAggregate(created.id)!
    const doc = before.caseV2.documents.find(item => item.role === 'application' && item.active !== false)!
    expect(doc.parseStatus).toBe('parsed')
    const subjectId = before.d2RuntimePlan!.targets[0]!.subjectId
    const changed = await correctObservation(created.id, {
      requestId: 'w1-actual-source-correction-' + created.id,
      actor: { actorId: 'local-reviewer', actorSource: 'local', role: 'reviewer' },
      expectedRevision: before.caseV2.revision,
      payload: {
        subjectId, fieldKey: 'capacity', value: { kind: 'text', value: '120 人（待进一步核验）' },
        sourceRefs: [{ caseId: created.id, documentVersionId: doc.versionId,
          parseRevision: doc.parseRevision, location: { kind: 'file' }, quote: '可供 120 人使用' }],
        reason: '审核员选择当前原件并人工更正，保留引用和原因',
      },
    })
    expect(changed.ok).toBe(true)
    const after = readAggregate(created.id)!
    expect(after.observations.some(item => item.subjectId === subjectId && item.fieldKey === 'capacity' &&
      item.confirmed && item.sourceRefs[0]?.documentVersionId === doc.versionId &&
      item.sourceRefs[0]?.parseRevision === doc.parseRevision)).toBe(true)
    expect(after.receiptLog.some(item => item.type === 'CorrectObservation')).toBe(true)
  })

  test('untrusted drag bytes undergo Main-owned native staging, hashing and same-case conflict preflight', async () => {
    const created = await create()
    const preview = await stageD4DroppedBytes(903, [
      { name: '拖放申请.md', bytes: new TextEncoder().encode('# 原始申报材料\\n多对象不可自动认定') },
      { name: '重复字节.md', bytes: new TextEncoder().encode('# 原始申报材料\\n多对象不可自动认定') },
      { name: 'unsafe.exe', bytes: new TextEncoder().encode('not allowed') },
    ])
    expect(preview.files).toHaveLength(1)
    expect(preview.files[0]!.name).toBe('拖放申请.md')
    expect(preview.skipped).toHaveLength(2)
    expect(preview.skipped.some(item => item.reason.includes('SHA-256'))).toBe(true)
    expect(() => assessD4CaseBatch({ caseId: created.id, token: preview.token,
      role: 'application' }, 904)).toThrow('D4_INTAKE_TOKEN_INVALID')
    const assessment = assessD4CaseBatch({ caseId: created.id, token: preview.token,
      role: 'application' }, 903)
    await expect(applyD4CaseBatch({ caseId: created.id, role: 'application',
      token: preview.token, expectedRevision: assessment.expectedRevision,
      choices: [{ kind: 'append' }], acknowledgeSkipped: false }, 903))
      .rejects.toThrow('D4_BATCH_SKIPS_ACK_REQUIRED')
    const result = await applyD4CaseBatch({ caseId: created.id, role: 'application',
      token: preview.token, expectedRevision: assessment.expectedRevision,
      choices: [{ kind: 'append' }], acknowledgeSkipped: true }, 903)
    expect(result.documents).toHaveLength(1)
    expect(getCase(created.id)!.d4IntakeOrigins?.some(item => item.documentId === result.documents[0]!.id)).toBe(true)
    expect(getCase(created.id)!.d4IntakeWarnings).toHaveLength(2)
    expect(getCase(created.id)!.d4IntakeOrigins?.some(item =>
      item.documentId === result.documents[0]!.id && /^[0-9a-f]{64}$/.test(item.sha256))).toBe(true)
    expect(() => claimD4Intake(preview.token, 903)).toThrow('D4_INTAKE_TOKEN_INVALID')
  })
  test('dropped ZIP reuses the bounded Main extraction path and preserves member provenance', async () => {
    const zip = new JSZip()
    zip.file('evidence/合成说明.md', '合成 ZIP 文件内容')
    zip.file('evidence/script.exe', 'must be rejected')
    const bytes = await zip.generateAsync({ type: 'uint8array' })
    const preview = await stageD4DroppedBytes(903, [{ name: '资料.zip', bytes }])
    expect(preview.files).toHaveLength(1)
    expect(preview.files[0]!.originLabel).toBe('资料.zip/evidence/合成说明.md')
    expect(preview.skipped.some(entry => entry.reason.includes('不支持'))).toBe(true)
    expect(discardD4Intake(preview.token, 903)).toBe(true)
    expect(() => claimD4Intake(preview.token, 903)).toThrow('D4_INTAKE_TOKEN_INVALID')
  })
  test('drop rejects path names, invalid shape and oversized count without persisting token', async () => {
    await expect(stageD4DroppedBytes(903, [{ name: '../secret.md', bytes: new Uint8Array([65]) }]))
      .rejects.toThrow('D4_DROP_FILE_INVALID')
    await expect(stageD4DroppedBytes(903, [{ name: 'C:\\\\windows\\\\secret.txt', bytes: new Uint8Array([65]) }]))
      .rejects.toThrow('D4_DROP_FILE_INVALID')
    await expect(stageD4DroppedBytes(903,
      Array.from({ length: 17 }, (_, i) => ({ name: i + '.md', bytes: new Uint8Array([65]) }))))
      .rejects.toThrow('D4_DROP_FILE_COUNT_INVALID')
    await expect(stageD4DroppedBytes(903, [{ name: 'oversize.md', bytes: new Uint8Array(10 * 1024 * 1024 + 1) }]))
      .rejects.toThrow('D4_DROP_FILE_INVALID')
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
  test('durable journal resumes only an exact restaged batch and does not re-execute completed skips', async () => {
    const created = await create()
    const originalFiles = [
      { name: 'first-skipped.md', bytes: new TextEncoder().encode('# 第一份 人工跳过') },
      { name: 'second-imported.md', bytes: new TextEncoder().encode('# 第二份 已入库') },
    ]
    const staged = await stageD4DroppedBytes(903, originalFiles)
    const assessment = assessD4CaseBatch({ caseId: created.id, role: 'evidence', token: staged.token }, 903)
    const run = await applyD4CaseBatch({ caseId: created.id, token: staged.token, role: 'evidence',
      expectedRevision: assessment.expectedRevision, choices: [{ kind: 'skip' }, { kind: 'append' }],
      acknowledgeSkipped: false }, 903)
    expect(run.batchId).toBeDefined()
    const stored = getCase(created.id)!
    expect(stored.d4BatchRuns?.[0]!.status).toBe('completed')
    expect(stored.d4BatchRuns?.[0]!.files.map(f => f.status)).toEqual(['skipped', 'stored'])
    const imported = stored.documents.find(doc => doc.role === 'evidence')!
    // Emulate a durable checkpoint after the second file failed before it was
    // committed. Retire the synthetic attempt; do not delete historical bytes.
    const { removeDocumentsFromCase } = await import('./case-import')
    await removeDocumentsFromCase({ caseId: created.id, role: 'evidence', documentIds: [imported.id] })
    await updateCase(created.id, fresh => ({
      ...fresh, d4BatchRuns: fresh.d4BatchRuns!.map(entry => ({
        ...entry, status: 'needs-reselection' as const,
        files: entry.files.map(file => file.index !== 1 ? file :
          { ...file, status: 'failed' as const, message: '模拟中断前失败' }),
      })),
    }), { reason: 'W1 合成中断场景' })
    const changed = await stageD4DroppedBytes(903, [
      originalFiles[0]!, { ...originalFiles[1]!, bytes: new TextEncoder().encode('# 篡改的第二份') },
    ])
    const changedAssess = assessD4CaseBatch({ caseId: created.id, role: 'evidence', token: changed.token }, 903)
    await expect(applyD4CaseBatch({
      caseId: created.id, token: changed.token, role: 'evidence',
      expectedRevision: changedAssess.expectedRevision, choices: [], acknowledgeSkipped: false,
      resumeBatchId: run.batchId!,
    }, 903)).rejects.toThrow('D4_BATCH_RESUME_DIGEST_OR_MANIFEST_MISMATCH')
    expect(discardD4Intake(changed.token, 903)).toBe(true)
    const same = await stageD4DroppedBytes(903, originalFiles)
    expect(() => assessD4CaseBatch({ caseId: created.id, role: 'evidence', token: same.token }, 904))
      .toThrow('D4_INTAKE_TOKEN_INVALID')
    const sameAssess = assessD4CaseBatch({ caseId: created.id, role: 'evidence', token: same.token }, 903)
    const resumed = await applyD4CaseBatch({
      caseId: created.id, token: same.token, role: 'evidence',
      expectedRevision: sameAssess.expectedRevision, choices: [], acknowledgeSkipped: false,
      resumeBatchId: run.batchId!,
    }, 903)
    expect(resumed.batchId).toBe(run.batchId)
    expect(resumed.documents).toHaveLength(1)
    const finished = getCase(created.id)!
    expect(finished.d4BatchRuns?.[0]?.status).toBe('completed')
    expect(finished.d4BatchRuns?.[0]?.files.map(file => file.status)).toEqual(['skipped', 'stored'])
    expect(finished.archivedDocuments?.some(doc => doc.id === imported.id)).toBeTrue()
    expect(finished.documents[0]?.id).toBe(resumed.documents[0]?.id)
    // Skip warning from the first run must not be duplicated on resume.
    expect(finished.d4IntakeWarnings?.filter(item => item.originLabel === 'first-skipped.md')).toHaveLength(1)
  })

})

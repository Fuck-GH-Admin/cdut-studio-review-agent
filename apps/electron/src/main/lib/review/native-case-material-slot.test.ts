/** 原生案卷材料槽回归：少量缺件允许初审，最终决定仍由材料槽门控。 */
import { afterAll, describe, expect, test } from 'bun:test'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { assessMaterialSlotV2, type MaterialSlotSpec } from '@profer/shared'

const configDir = mkdtempSync(join(tmpdir(), 'slot-'))
process.env.PROFER_CONFIG_DIR = configDir
afterAll(() => rmSync(configDir, { recursive: true, force: true }))

const { createNativeWorkspaceCaseV3, registerNativeWorkspaceMaterialV3, reclassifyNativeWorkspaceMaterialsV3 } =
  await import('./native-workspace-case-v3')
const { readAggregate } = await import('./case-store-v2')
const { saveDraft, publishTemplate } = await import('./template-store')
const { submitCaseV2 } = await import('./stage-workflow')

const actor = { actorId: 'local-reviewer', actorSource: 'local' as const, role: 'reviewer' as const }
const templateId = 'slot-template'
const planSlot: MaterialSlotSpec = {
  id: 'plan', name: '实验计划', purpose: '核验实验计划材料', acceptedKinds: ['text'],
  acceptedRoles: ['evidence'], minCount: 1, maxCount: 1,
  requiredElements: [], allowReuseAcrossSubjects: false, requiredAt: 'submission',
}
const template = {
  templateId, version: 1, schemaVersion: 2, name: '材料槽模板',
  objectType: 'document', displayName: { template: '{{x}}' }, status: 'draft', createdAt: '',
  fields: [],
  sections: [{
    id: 'general', name: '一般检查', order: 1, required: false,
    criteria: [{ id: 'integrity', title: '材料可核验', requirement: '核对申报材料与审核要求', execution: 'semantic', targetScope: 'case' }],
  }],
  policyVersionIds: [], policyRefs: [], outputs: [],
  materialSlots: [planSlot],
  stages: [{ id: 'first', name: '初审', kind: 'manual-review', executorRole: 'reviewer' }],
} as never

async function createCase(title: string): Promise<string> {
  const created = await createNativeWorkspaceCaseV3({
    title, type: '自定义审核', applicant: 'E2E',
    domainPackId: 'contract-review', reviewTemplate: { templateId, version: 1 },
  }, actor)
  return created.aggregate.caseV2.id
}

describe('原生案卷材料槽', () => {
  test('少量必需材料缺件时允许初审并给出待补提示；槽位满足后不再提示缺件', async () => {
    saveDraft(template)
    publishTemplate(templateId, 1)
    const applicationFile = join(configDir, 'application.txt')
    const planFile = join(configDir, 'plan.txt')
    writeFileSync(applicationFile, '申请事项：实验项目', 'utf8')
    writeFileSync(planFile, '实验计划正文', 'utf8')

    const wrongRoleCaseId = await createCase('材料类别不匹配')
    await expect(registerNativeWorkspaceMaterialV3(wrongRoleCaseId, planFile, 'application', actor, undefined, 'plan'))
      .rejects.toThrow('材料类别')

    const missingCaseId = await createCase('少量缺件案卷')
    await registerNativeWorkspaceMaterialV3(missingCaseId, applicationFile, 'application', actor)
    await registerNativeWorkspaceMaterialV3(missingCaseId, planFile, 'evidence', actor)
    const missingSubmission = await submitCaseV2(missingCaseId)
    expect(missingSubmission.ok).toBe(true)
    if (!missingSubmission.ok) throw new Error(missingSubmission.message)
    expect(missingSubmission.receipt.summary).toContain('待补材料')
    expect(readAggregate(missingCaseId)?.caseV2.stage).toBe('submitted')

    const completeCaseId = await createCase('材料完整案卷')
    await registerNativeWorkspaceMaterialV3(completeCaseId, applicationFile, 'application', actor)
    await registerNativeWorkspaceMaterialV3(completeCaseId, planFile, 'evidence', actor, undefined, 'plan')
    expect(readAggregate(completeCaseId)?.caseV2.documents.some((document) =>
      document.active !== false && document.materialSlotId === 'plan')).toBe(true)
    const completeAggregate = readAggregate(completeCaseId)!
    const wrongRoleAggregate = {
      ...completeAggregate,
      caseV2: {
        ...completeAggregate.caseV2,
        documents: completeAggregate.caseV2.documents.map((document) =>
          document.materialSlotId === 'plan' ? { ...document, role: 'application' as const } : document),
      },
    }
    expect(assessMaterialSlotV2(wrongRoleAggregate, planSlot).status).toBe('awaiting-supplement')

    const completeSubmission = await submitCaseV2(completeCaseId)
    expect(completeSubmission.ok).toBe(true)
    if (!completeSubmission.ok) throw new Error(completeSubmission.message)
    expect(completeSubmission.receipt.summary).not.toContain('待补材料')
  })

  test('AI 分类批次以单次事务原子应用，且不能把全部申报材料改成其他类别', async () => {
    const applicationFile = join(configDir, 'atomic-application.txt')
    const evidenceFile = join(configDir, 'atomic-evidence.txt')
    writeFileSync(applicationFile, '申请事项：实验项目', 'utf8')
    writeFileSync(evidenceFile, '证明正文', 'utf8')
    const caseId = await createCase('原子分类案卷')
    await registerNativeWorkspaceMaterialV3(caseId, applicationFile, 'application', actor)
    await registerNativeWorkspaceMaterialV3(caseId, evidenceFile, 'evidence', actor)
    const before = readAggregate(caseId)!
    const application = before.caseV2.documents.find((document) => document.fileName === 'atomic-application.txt')!
    const evidence = before.caseV2.documents.find((document) => document.fileName === 'atomic-evidence.txt')!
    await expect(reclassifyNativeWorkspaceMaterialsV3(caseId, [
      { documentVersionId: application.versionId, role: 'evidence' },
      { documentVersionId: evidence.versionId, role: 'rule' },
    ], actor)).rejects.toThrow('移除本案全部申报材料')
    const afterRejected = readAggregate(caseId)!
    expect(afterRejected.caseV2.revision).toBe(before.caseV2.revision)
    expect(afterRejected.caseV2.documents.find((document) => document.versionId === application.versionId)?.role).toBe('application')
    const result = await reclassifyNativeWorkspaceMaterialsV3(caseId, [
      { documentVersionId: evidence.versionId, role: 'rule' },
    ], actor)
    expect(result.documents.find((document) => document.id === evidence.documentId)?.role).toBe('rule')
    const afterAccepted = readAggregate(caseId)!
    expect(afterAccepted.caseV2.revision).toBe(before.caseV2.revision + 1)
    expect(afterAccepted.caseV2.documents.find((document) => document.versionId === application.versionId)?.role).toBe('application')
  })
})
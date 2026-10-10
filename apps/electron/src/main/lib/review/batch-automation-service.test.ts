import { afterAll, describe, expect, test } from 'bun:test'
import { rmSync } from 'node:fs'
import { join } from 'node:path'
import type { DocumentVersion, ReviewCaseV2, ReviewRunV2, RuleSpec } from '@profer/shared'
import { createAggregate, readAggregate } from './case-store-v2'
import { createBatchV2, configureBatchAutomation, readBatchStateV2, requeueCaseAfterSupplement, updateCaseStatus } from './batch-store'
import { canonicalContentHash, publishPolicy, savePolicyDraft } from './policy-store'
import { publishTemplate, saveDraft, getTemplate } from './template-store'
import { computeRunInputHash } from './run-service-v2'
import { saveRunV2 } from './run-store-v2'
import { runBatchAutomation, finalizeCompletedBatch } from './batch-automation-service'
import { respondSupplementV2, resolveSupplementV2 } from './stage-workflow'
import { getSettings, updateSettings, clearSettingsCache } from '../settings-service'

const root = join(import.meta.dir, '../../../../../../work/tmp', `test-batch-auto-${Date.now()}`)
process.env.PROFER_CONFIG_DIR = root
afterAll(() => { clearSettingsCache(); rmSync(root, { recursive: true, force: true }) })
let n = 0
const id = (prefix: string) => `${prefix}-${++n}`
const owner = { actorId: 'template-owner-test', role: 'template-owner' as const, actorSource: 'local' as const }
const reviewer = { actorId: 'manual-reviewer', role: 'reviewer' as const, actorSource: 'local' as const }

function createTemplate(): void {
  if (getTemplate('batch-auto-test', 1)) return
  const body = '本业务要求：申请应提供有效且能够证明身份与资格的材料'
  const hash = canonicalContentHash(body)
  const rule: RuleSpec = {
    id: 'proof-rule', policyVersionId: 'auto-policy@1', title: '有效材料检查',
    when: { field: 'proof', op: 'exists' }, requirement: '提供能够证明申请资格的有效原件',
    targetScope: 'case', execution: 'semantic', onFail: 'supplement', onUnknown: 'needs-confirmation',
    sourceRefIds: ['clause-1'], priority: 1, confirmation: 'confirmed',
    confirmedBy: owner.actorId, confirmedAt: '2026-10-10T00:00:00Z',
  }
  savePolicyDraft({
    policyId: 'auto-policy', version: 1, title: '测试审核依据', content: body, contentHash: hash,
    origin: { kind: 'owner-statement', text: body, enteredBy: owner.actorId, enteredAt: '2026-10-10T00:00:00Z' },
    status: 'draft', confirmations: [{ actorId: owner.actorId, role: owner.role, at: '2026-10-10T00:00:00Z' }],
    compiledRules: [rule],
  })
  publishPolicy('auto-policy', 1)
  saveDraft({
    templateId: 'batch-auto-test', version: 1, schemaVersion: 2,
    name: '自动化验收专用', objectType: 'person', displayName: { template: '{{title}}' },
    fields: [], materialSlots: [],
    policyVersionIds: ['auto-policy'], policyRefs: [{ policyId: 'auto-policy', version: 1, contentHash: hash }],
    stages: [{ id: 'auto-review', name: '自动审核', kind: 'auto-check', executorRole: 'reviewer' }],
    outputs: [{ id: 'review-output', kind: 'approval', audience: 'reviewer' }],
    autoPassPolicy: { enabled: true },
    status: 'draft', createdAt: '2026-10-10T00:00:00Z',
  })
  publishTemplate('batch-auto-test', 1)
}

async function createCase(status: 'compliant' | 'awaiting-supplement' = 'compliant', withSource = true): Promise<{ caseId: string; run: ReviewRunV2 }> {
  createTemplate()
  const caseId = id('case-auto')
  const doc: DocumentVersion = {
    documentId: 'd1', versionId: `${caseId}-doc-v1`, contentHash: 'content',
    role: 'evidence', fileName: '资格证明.pdf', mimeType: 'application/pdf', sizeBytes: 32,
    assetPath: 'proof.pdf', parseRevision: 1, parseStatus: 'parsed',
    blocks: [{ blockId: 'b1', text: '资格证明', kind: 'text' }], usage: 'read', active: true,
  }
  const caseV2: ReviewCaseV2 = {
    id: caseId, title: caseId, templateId: 'batch-auto-test', templateVersion: 1,
    objectType: 'person', caseFields: {}, subjects: [], documents: [doc], stage: 'reviewing',
    revision: 0, createdAt: '2026-10-10T00:00:00Z', updatedAt: '2026-10-10T00:00:00Z',
  }
  await createAggregate(caseId, caseV2)
  const run: ReviewRunV2 = {
    id: id('run'), caseId, templateId: 'batch-auto-test', templateVersion: 1,
    inputManifest: { hash: computeRunInputHash(caseV2, [], []), templateVersion: 1,
      policyVersions: [{ policyVersionId: 'auto-policy', version: 1 }],
      documentVersions: [{ documentId: doc.documentId, versionId: doc.versionId, contentHash: doc.contentHash }],
      observationIds: [], evidenceLinkIds: [], effectiveRuleIds: ['proof-rule'],
    },
    status: 'completed', checkpoints: [],
    checks: [{ checkId: id('check'), ruleId: 'proof-rule',
      target: { scope: 'case', subjectIds: [] }, status,
      reason: status === 'compliant' ? '材料完整有效' : '缺少证明要素',
      sourceRefs: withSource ? [{ caseId, documentVersionId: doc.versionId, parseRevision: 1, location: { kind: 'file' } }] : [],
      executedBy: 'semantic', executedAt: '2026-10-10T00:00:00Z',
    }],
    opinions: [], coverage: { documents: [{ documentVersionId: doc.versionId, status: 'read' }], plannedChecks: 1,
      completedChecks: 1, effectiveVerdicts: 1, pendingChecks: status === 'compliant' ? 0 : 1 },
    diagnostics: [], startedAt: '2026-10-10T00:00:00Z', completedAt: '2026-10-10T00:00:01Z',
  }
  saveRunV2(run)
  return { caseId, run }
}

function makeBatch(caseIds: string[]): string {
  const batchId = id('auto-batch')
  createBatchV2({ id: batchId, name: batchId, caseIds,
    templateId: 'batch-auto-test', templateVersion: 1,
    policyVersionLock: [{ policyVersionId: 'auto-policy', version: 1 }],
    createdAt: '2026-10-10T00:00:00Z' })
  for (const caseId of caseIds) updateCaseStatus(batchId, caseId, 'done')
  return batchId
}

describe('C 阶段：显式授权的自动通过与退回', () => {
  test('默认辅助模式不能自动执行；未确认或缺少全局授权也不允许开自动通过', async () => {
    const a = await createCase()
    const batchId = makeBatch([a.caseId])
    await expect(runBatchAutomation(batchId)).rejects.toThrow('尚未启用')
    expect(() => configureBatchAutomation(batchId, 'auto-return', false)).toThrow('确认')
    updateSettings({ reviewAgentAutoApproval: false })
    expect(() => configureBatchAutomation(batchId, 'auto-approve', true)).toThrow('全局')
    expect(readAggregate(a.caseId)?.decisions).toHaveLength(0)
  })

  test('授权后自动通过+自动补件使用原 V2 单案事务，重放不会重复生效', async () => {
    const pass = await createCase('compliant')
    const returned = await createCase('awaiting-supplement')
    const batchId = makeBatch([pass.caseId, returned.caseId])
    updateSettings({ reviewAgentAutoApproval: true })
    configureBatchAutomation(batchId, 'auto-approve', true)
    const report = await runBatchAutomation(batchId)
    expect(report.applied).toBe(2)
    expect(report.blocked).toBe(0)
    const approved = readAggregate(pass.caseId)!
    expect(approved.caseV2.stage).toBe('decided')
    expect(approved.decisions.at(-1)?.result).toBe('pass')
    expect(approved.decisions.at(-1)?.actor.actorSource).toBe('system')
    expect(approved.receiptLog.at(-1)?.type).toBe('RecordWorkspaceBusinessDecision')
    const supplemented = readAggregate(returned.caseId)!
    expect(supplemented.caseV2.stage).toBe('awaiting-supplement')
    expect(supplemented.decisions.at(-1)?.result).toBe('return')
    expect(supplemented.supplements.at(-1)?.requiredElements[0]).toContain('证明申请资格')
    const next = await runBatchAutomation(batchId)
    expect(next.applied).toBe(0)
    expect(readAggregate(pass.caseId)?.decisions).toHaveLength(1)
    expect(readAggregate(returned.caseId)?.supplements).toHaveLength(1)
    expect(() => finalizeCompletedBatch(batchId)).toThrow('仍待补件')
  })

  test('自动补件模式绝不自动通过', async () => {
    const a = await createCase('compliant')
    const batchId = makeBatch([a.caseId])
    configureBatchAutomation(batchId, 'auto-return', true)
    const report = await runBatchAutomation(batchId)
    expect(report.applied).toBe(0)
    expect(readAggregate(a.caseId)?.decisions).toHaveLength(0)
  })

  test('自动通过授权撤销后，已存在的批次也不能再自动通过', async () => {
    const a = await createCase('compliant')
    const batchId = makeBatch([a.caseId])
    updateSettings({ reviewAgentAutoApproval: true })
    configureBatchAutomation(batchId, 'auto-approve', true)
    updateSettings({ reviewAgentAutoApproval: false })
    const report = await runBatchAutomation(batchId)
    expect(report.applied).toBe(0)
    expect(report.blocked).toBe(1)
    expect(readAggregate(a.caseId)?.decisions).toHaveLength(0)
  })

  test('证据缺失、旧输入、人工审批门槛或未确认政策不能冒充自动通过', async () => {
    updateSettings({ reviewAgentAutoApproval: true })
    const a = await createCase('compliant', false)
    const batchId = makeBatch([a.caseId])
    configureBatchAutomation(batchId, 'auto-approve', true)
    expect((await runBatchAutomation(batchId)).blocked).toBe(1)
    expect(readAggregate(a.caseId)?.decisions).toHaveLength(0)
  })

  test('补件满足后自动重新入队，重新审核前不沿用旧运行自动批准', async () => {
    const a = await createCase('awaiting-supplement')
    const batchId = makeBatch([a.caseId])
    configureBatchAutomation(batchId, 'auto-return', true)
    expect((await runBatchAutomation(batchId)).applied).toBe(1)
    const request = readAggregate(a.caseId)!.supplements[0]!
    const responded = await respondSupplementV2(a.caseId, {
      requestId: id('respond'), actor: { actorId: 'student', actorSource: 'local', role: 'student' },
      expectedRevision: readAggregate(a.caseId)!.caseV2.revision,
      payload: { supplementId: request.id, note: '已经补齐所需材料' },
    })
    expect(responded.ok).toBeTrue()
    // No requeue while merely responded; a reviewer must resolve supplement.
    expect(requeueCaseAfterSupplement(a.caseId)).toEqual([])
    const resolved = await resolveSupplementV2(a.caseId, {
      requestId: id('resolve'), actor: reviewer, expectedRevision: readAggregate(a.caseId)!.caseV2.revision,
      payload: { supplementId: request.id, outcome: 'satisfied', reason: '核对完成' },
    })
    expect(resolved.ok).toBeTrue()
    expect(requeueCaseAfterSupplement(a.caseId)).toContain(batchId)
    expect(readBatchStateV2(batchId)?.cases[0]?.status).toBe('queued')
    expect((await runBatchAutomation(batchId)).applied).toBe(0)
    expect(readAggregate(a.caseId)?.decisions.filter((d) => d.result === 'pass')).toHaveLength(0)
  })

  test('已真实形成所有最终业务决定后才允许批次定稿', async () => {
    const a = await createCase('compliant')
    const batchId = makeBatch([a.caseId])
    updateSettings({ reviewAgentAutoApproval: true })
    configureBatchAutomation(batchId, 'auto-approve', true)
    expect(() => finalizeCompletedBatch(batchId)).toThrow('未完成正式审批')
    expect((await runBatchAutomation(batchId)).applied).toBe(1)
    expect(finalizeCompletedBatch(batchId).status).toBe('finalized')
    await expect(runBatchAutomation(batchId)).rejects.toThrow('只有已完成')
  })
})

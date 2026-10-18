/**
 * P06 L02-01 development-only: V2 manual supplement response/resolve,
 * exactly-once external batch requeue and revision/idempotency boundaries.
 * No Provider, no Gold, no formal L02-01 LIVE claim.
 */
import { afterAll, describe, expect, test } from 'bun:test'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import type { ReviewCaseV2, TemplateVersion } from '@profer/shared'

const config = mkdtempSync(join(tmpdir(), 'p06-l02-01-offline-'))
process.env.PROFER_CONFIG_DIR = config
afterAll(() => rmSync(config, { recursive: true, force: true }))

const { createAggregate, readAggregate, submitCommand } = await import('./case-store-v2')
const { createBatchV2, readBatchStateV2, updateCaseStatus, selectSupplementRequeueBatch } = await import('./batch-store')
const { ensureInitialTask, recordStageDecision, respondSupplementV2, resolveSupplementV2 } = await import('./stage-workflow')
const { saveRunV2 } = await import('./run-store-v2')
const { computeRunInputHash } = await import('./run-service-v2')

const reviewer = { actorId: 'local-reviewer', actorSource: 'local' as const, role: 'reviewer' as const }
const student = { actorId: 'synthetic-student', actorSource: 'local' as const, role: 'student' as const }
const template: TemplateVersion = {
  templateId: 'p06-l02-manual', version: 1, schemaVersion: 2,
  name: '纯合成两阶段补件', objectType: 'person',
  displayName: { template: '{{title}}' }, fields: [], materialSlots: [],
  policyVersionIds: [], policyRefs: [],
  sections: [{ id: 'all', name: '合成项目', order: 0, required: false,
    criteria: [{ id: 'c1', title: '核对材料', requirement: '仅确认材料存在', execution: 'semantic', targetScope: 'case' }] }],
  stages: [{ id: 'first', name: '人工初审', kind: 'manual-review', executorRole: 'reviewer' }],
  outputs: [], status: 'published', createdAt: new Date().toISOString(),
}

async function seed() {
  const caseId = 'case-' + randomUUID()
  const caseV2: ReviewCaseV2 = {
    id: caseId, templateId: template.templateId, templateVersion: template.version,
    title: '不含真实材料的合成案卷', objectType: 'person',
    caseFields: {}, subjects: [], documents: [], stage: 'submitted',
    revision: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  }
  await createAggregate(caseId, caseV2)
  const runId = 'run-' + caseId
  const inputHash = computeRunInputHash(caseV2, [], [])
  saveRunV2({
    id: runId, caseId, templateId: template.templateId, templateVersion: template.version,
    inputManifest: { hash: inputHash, templateVersion: template.version,
      policyVersions: [], documentVersions: [], observationIds: [], evidenceLinkIds: [] },
    status: 'completed', checkpoints: [],
    checks: [{ checkId: 'l02-fixture', ruleId: 'l02-fixture',
      target: { scope: 'case', subjectIds: [] }, status: 'compliant',
      reason: '合成规则执行成功', sourceRefs: [], executedBy: 'deterministic',
      executedAt: '2026-01-01T00:00:01.000Z' }],
    opinions: [],
    coverage: { documents: [], plannedChecks: 1, completedChecks: 1, effectiveVerdicts: 1, pendingChecks: 0 },
    diagnostics: [], startedAt: '2026-01-01T00:00:00.000Z', completedAt: '2026-01-01T00:00:01.000Z',
  })
  const initialized = await ensureInitialTask(caseId, template, reviewer)
  expect(initialized.ok).toBe(true)
  if (!initialized.ok || !initialized.entity) throw new Error('initial task missing')
  const batchId = 'batch-' + randomUUID()
  createBatchV2({
    id: batchId, name: '合成人工补件批次', templateId: template.templateId,
    templateVersion: template.version, policyVersionLock: [],
    caseIds: [caseId], createdAt: new Date().toISOString(),
  })
  return { caseId, batchId, taskId: initialized.entity.id, runId, inputHash }
}

const command = (id: string, revision: number, actor: typeof reviewer | typeof student, payload: any) =>
  ({ requestId: id, expectedRevision: revision, actor, payload })

describe('L02-01 human supplement is idempotent across V2 and batch projection', () => {
  test('same ResolveSupplement request replay must not requeue a batch already marked done', async () => {
    const { caseId, batchId, taskId } = await seed()
    let current = readAggregate(caseId)!
    const opened = await recordStageDecision(caseId,
      command('return-'+randomUUID(), current.caseV2.revision, reviewer, {
        taskId, action: 'return-for-supplement', reason: '缺证明文件',
        supplementReason: '合成补件通知', supplementRequiredElements: ['原件'],
      }), template)
    expect(opened.ok).toBe(true)
    if (!opened.ok) return
    expect(opened.aggregate.caseV2.stage).toBe('awaiting-supplement')
    const supplementId = opened.aggregate.supplements[0]!.id
    updateCaseStatus(batchId, caseId, 'done')
    const response = await respondSupplementV2(caseId,
      command('response-'+randomUUID(), opened.aggregate.caseV2.revision, student, {
        supplementId, note: '已交合成材料',
      }))
    expect(response.ok).toBe(true)
    if (!response.ok) return
    expect(readBatchStateV2(batchId)!.cases[0]!.status).toBe('done')
    const resolveCommand = command('resolve-'+randomUUID(), response.aggregate.caseV2.revision, reviewer,
      { supplementId, outcome: 'satisfied' as const, reason: '人工确认要素齐全' })
    const first = await resolveSupplementV2(caseId, resolveCommand)
    expect(first.ok).toBe(true)
    if (!first.ok) return
    expect(first.entity).toMatchObject({ id: supplementId, status: 'satisfied' })
    expect(first.aggregate.caseV2.stage).toBe('reviewing')
    expect(readBatchStateV2(batchId)!.cases[0]!.status).toBe('queued')
    const afterFirst = readAggregate(caseId)!
    const receipts = afterFirst.receiptLog.length
    const revision = afterFirst.caseV2.revision

    // Another legitimate batch actor advances the queue after the first
    // supplement resolution, before a delayed duplicate request arrives.
    updateCaseStatus(batchId, caseId, 'done')
    const replay = await resolveSupplementV2(caseId, resolveCommand)
    expect(replay.ok).toBe(true)
    if (replay.ok) expect(replay.entity).toBeUndefined()
    expect(readAggregate(caseId)!.caseV2.revision).toBe(revision)
    expect(readAggregate(caseId)!.receiptLog).toHaveLength(receipts)
    expect(readBatchStateV2(batchId)!.cases[0]!.status).toBe('done')
  })

  test('E03: ambiguous multi-batch membership cannot resurrect an unrelated historical done entry', async () => {
    const { caseId, batchId, taskId } = await seed()
    const otherBatchId = 'batch-historical-' + randomUUID()
    createBatchV2({
      id: otherBatchId, name: '同案历史或并行批次', templateId: template.templateId,
      templateVersion: template.version, policyVersionLock: [],
      caseIds: [caseId], createdAt: new Date().toISOString(),
    })
    const initial = readAggregate(caseId)!
    const opened = await recordStageDecision(caseId,
      command('ambiguous-return-'+randomUUID(), initial.caseV2.revision, reviewer, {
        taskId, action: 'return-for-supplement', reason: '需要新证明',
        supplementReason: '补充真实材料', supplementRequiredElements: ['资料'],
      }), template)
    expect(opened.ok).toBeTrue()
    if (!opened.ok) return
    updateCaseStatus(batchId, caseId, 'done')
    updateCaseStatus(otherBatchId, caseId, 'done')
    const response = await respondSupplementV2(caseId,
      command('ambiguous-response-'+randomUUID(), opened.aggregate.caseV2.revision, student, {
        supplementId: opened.aggregate.supplements[0]!.id, note: '重新提交说明',
      }))
    expect(response.ok).toBeTrue()
    if (!response.ok) return
    const resolved = await resolveSupplementV2(caseId,
      command('ambiguous-resolve-'+randomUUID(), response.aggregate.caseV2.revision, reviewer, {
        supplementId: opened.aggregate.supplements[0]!.id, outcome: 'satisfied', reason: '核验完成',
      }))
    expect(resolved.ok).toBeTrue()
    // 没有批次来源绑定时不能猜测哪个批次可以重新运行。
    expect(readBatchStateV2(batchId)?.cases[0]?.status).toBe('done')
    expect(readBatchStateV2(otherBatchId)?.cases[0]?.status).toBe('done')
    expect(readAggregate(caseId)?.caseV2.stage).toBe('reviewing')
  })


  test('E03: explicit selection queues only one batch once, never revives a later done item', async () => {
    const { caseId, batchId, taskId } = await seed()
    const historicalId = 'batch-old-' + randomUUID()
    createBatchV2({
      id: historicalId, name: '保留历史', templateId: template.templateId,
      templateVersion: template.version, policyVersionLock: [], caseIds: [caseId],
      createdAt: new Date().toISOString(),
    })
    const before = readAggregate(caseId)!
    const opened = await recordStageDecision(caseId,
      command('select-return-'+randomUUID(), before.caseV2.revision, reviewer, {
        taskId, action: 'return-for-supplement', reason: '需补件',
        supplementReason: '补充必要证明', supplementRequiredElements: ['证明'],
      }), template)
    expect(opened.ok).toBeTrue()
    if (!opened.ok) return
    const supplementId = opened.aggregate.supplements[0]!.id
    updateCaseStatus(batchId, caseId, 'done')
    updateCaseStatus(historicalId, caseId, 'done')
    const replied = await respondSupplementV2(caseId,
      command('select-reply-'+randomUUID(), opened.aggregate.caseV2.revision, student,
        { supplementId, note: '已补齐' }))
    expect(replied.ok).toBeTrue()
    if (!replied.ok) return
    const resolved = await resolveSupplementV2(caseId,
      command('select-resolve-'+randomUUID(), replied.aggregate.caseV2.revision, reviewer,
        { supplementId, outcome: 'satisfied', reason: '人工验真' }))
    expect(resolved.ok).toBeTrue()
    if (!resolved.ok) return
    const selected = { actor: reviewer, expectedRevision: resolved.aggregate.caseV2.revision, supplementId }
    expect(() => selectSupplementRequeueBatch(caseId, batchId, {
      ...selected, actor: { actorId: 'synthetic-student', actorSource: 'local', role: 'student' },
    })).toThrow()
    expect(() => selectSupplementRequeueBatch(caseId, batchId, {
      ...selected, expectedRevision: selected.expectedRevision - 1,
    })).toThrow()
    const changed = selectSupplementRequeueBatch(caseId, batchId, selected)
    expect(changed.queued).toBeTrue()
    expect(readBatchStateV2(batchId)?.cases[0]?.status).toBe('queued')
    expect(readBatchStateV2(historicalId)?.cases[0]?.status).toBe('done')
    updateCaseStatus(batchId, caseId, 'done')
    const replay = selectSupplementRequeueBatch(caseId, batchId, selected)
    expect(replay.queued).toBeFalse()
    expect(readBatchStateV2(batchId)?.cases[0]?.status).toBe('done')
    expect(readBatchStateV2(historicalId)?.cases[0]?.status).toBe('done')
    const laterCommand = await submitCommand(caseId, {
      requestId: 'later-'+randomUUID(), actor: reviewer, expectedRevision: selected.expectedRevision,
      type: 'NoopAudit', payload: {},
    }, () => ({ summary: '模拟补件核验后其他业务编辑', mutate: () => undefined }))
    expect(laterCommand.ok).toBeTrue()
    if (!laterCommand.ok) return
    const newerReplay = selectSupplementRequeueBatch(caseId, batchId, {
      ...selected, expectedRevision: laterCommand.aggregate.caseV2.revision,
    })
    expect(newerReplay.queued).toBeFalse()
    expect(readBatchStateV2(batchId)?.cases[0]?.status).toBe('done')
  })

  test('E05 local-only: incomplete → insufficient → new reply → satisfied → one selected requeue, no school-signature pretense', async () => {
    const { caseId, batchId, taskId } = await seed()
    const oldBatchId = 'batch-archived-' + randomUUID()
    createBatchV2({
      id: oldBatchId, name: '旧批次历史记录', templateId: template.templateId,
      templateVersion: template.version, policyVersionLock: [],
      caseIds: [caseId], createdAt: new Date().toISOString(),
    })
    const a0 = readAggregate(caseId)!
    const opened = await recordStageDecision(caseId,
      command('e05-open-'+randomUUID(), a0.caseV2.revision, reviewer, {
        taskId, action: 'return-for-supplement', reason: '缺材料，需要补件',
        supplementReason: '提交原始证明', supplementRequiredElements: ['材料'],
      }), template)
    expect(opened.ok).toBeTrue()
    if (!opened.ok) return
    const supplementId = opened.aggregate.supplements[0]!.id
    updateCaseStatus(batchId, caseId, 'done')
    updateCaseStatus(oldBatchId, caseId, 'done')

    // Reject forged document-version ID without mutating case revision.
    const bad = await respondSupplementV2(caseId,
      command('e05-fake-'+randomUUID(), opened.aggregate.caseV2.revision, student, {
        supplementId, note: '不存在的证据版本', documentVersionIds: ['made-up-document-v1'],
      }))
    expect(bad.ok).toBeFalse()
    if (!bad.ok) expect(bad.code).toBe('NOT_FOUND')
    expect(readAggregate(caseId)?.caseV2.revision).toBe(opened.aggregate.caseV2.revision)

    const firstReply = await respondSupplementV2(caseId,
      command('e05-reply-'+randomUUID(), opened.aggregate.caseV2.revision, student, {
        supplementId, note: '第一次补充仍不完整',
      }))
    expect(firstReply.ok).toBeTrue()
    if (!firstReply.ok) return
    const insufficient = await resolveSupplementV2(caseId,
      command('e05-insufficient-'+randomUUID(), firstReply.aggregate.caseV2.revision, reviewer, {
        supplementId, outcome: 'insufficient', reason: '仍缺少可信证明',
      }))
    expect(insufficient.ok).toBeTrue()
    if (!insufficient.ok) return
    expect(insufficient.aggregate.caseV2.stage).toBe('awaiting-supplement')
    expect(insufficient.aggregate.supplements[0]?.status).toBe('insufficient')
    const replyAgain = await respondSupplementV2(caseId,
      command('e05-reply-again-'+randomUUID(), insufficient.aggregate.caseV2.revision, student, {
        supplementId, note: '再次提供可核对的补充说明（合成测试）',
      }))
    expect(replyAgain.ok).toBeTrue()
    if (!replyAgain.ok) return
    expect(replyAgain.aggregate.supplements[0]?.responses).toHaveLength(2)
    const satisfied = await resolveSupplementV2(caseId,
      command('e05-satisfied-'+randomUUID(), replyAgain.aggregate.caseV2.revision, reviewer, {
        supplementId, outcome: 'satisfied', reason: '本地 reviewer 已核对补件',
      }))
    expect(satisfied.ok).toBeTrue()
    if (!satisfied.ok) return
    expect(satisfied.aggregate.caseV2.stage).toBe('reviewing')
    expect(satisfied.aggregate.tasks.filter((item) => item.status === 'open' && item.stageId === 'first')).toHaveLength(1)
    expect(readBatchStateV2(batchId)?.cases[0]?.status).toBe('done')
    expect(readBatchStateV2(oldBatchId)?.cases[0]?.status).toBe('done')
    expect(satisfied.aggregate.decisions.some((decision) => decision.finality === 'final')).toBe(false)

    // The renderer must explicitly choose ONE destination; backend refuses
    // stale revisions and replay. Old historical batch is not resurrected.
    const selection = { actor: reviewer, expectedRevision: satisfied.aggregate.caseV2.revision, supplementId }
    expect(() => selectSupplementRequeueBatch(caseId, batchId, {
      ...selection, expectedRevision: selection.expectedRevision - 1,
    })).toThrow('案卷版本已变化')
    const requeue = selectSupplementRequeueBatch(caseId, batchId, selection)
    expect(requeue.queued).toBe(true)
    expect(readBatchStateV2(batchId)?.cases[0]?.status).toBe('queued')
    expect(readBatchStateV2(oldBatchId)?.cases[0]?.status).toBe('done')
    updateCaseStatus(batchId, caseId, 'done')
    const replay = selectSupplementRequeueBatch(caseId, batchId, selection)
    expect(replay.queued).toBe(false)
    expect(readBatchStateV2(batchId)?.cases[0]?.status).toBe('done')
    expect(readBatchStateV2(oldBatchId)?.cases[0]?.status).toBe('done')
  })

  test('same request ID with modified outcome and stale independent commands cannot silently write', async () => {
    const { caseId, taskId, runId, inputHash } = await seed()
    let aggregate = readAggregate(caseId)!
    const req = 'decision-'+randomUUID()
    const first = await recordStageDecision(caseId, command(req, aggregate.caseV2.revision, reviewer,
      { taskId, action: 'stage-pass' as const, reason: '人工核验通过', basedOnRunId: runId, inputHash }), template)
    expect(first.ok).toBe(true)
    if (!first.ok) return
    const oldRev = aggregate.caseV2.revision
    aggregate = readAggregate(caseId)!
    const replay = await recordStageDecision(caseId, command(req, oldRev, reviewer,
      { taskId, action: 'stage-pass' as const, reason: '人工核验通过', basedOnRunId: runId, inputHash }), template)
    expect(replay.ok).toBe(true)
    expect(readAggregate(caseId)!.decisions).toHaveLength(1)
    const collision = await recordStageDecision(caseId, command(req, oldRev, reviewer,
      { taskId, action: 'final-reject' as const, reason: '篡改同一请求' }), template)
    expect(collision.ok).toBe(false)
    if (!collision.ok) expect(collision.code).toBe('REQUEST_ID_COLLISION')
    const stale = await recordStageDecision(caseId, command('another-'+randomUUID(), oldRev, reviewer,
      { taskId, action: 'final-reject' as const, reason: '使用过期版本' }), template)
    expect(stale.ok).toBe(false)
    if (!stale.ok) expect(stale.code).toBe('VERSION_CONFLICT')
    expect(readAggregate(caseId)!.caseV2.revision).toBe(aggregate.caseV2.revision)
    expect(readAggregate(caseId)!.decisions).toHaveLength(1)
  })
})

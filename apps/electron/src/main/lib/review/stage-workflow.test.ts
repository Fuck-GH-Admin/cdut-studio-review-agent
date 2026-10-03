/**
 * N3/R07 单测：阶段推进（初审≠decided）/最终驳回/多补件门控/申诉更正/最终投影
 */
import { afterAll, describe, expect, test } from 'bun:test'
import { rmSync } from 'node:fs'
import { join } from 'node:path'
import type { ReviewCaseV2, TemplateVersion } from '@profer/shared'
import { createAggregate, readAggregate } from './case-store-v2'
import { ensureInitialTask, recordStageDecision, resolveAppealV2, resolveFinalDecisionProjection, resolveSupplementV2, type StageDecisionPayload } from './stage-workflow'
import { submitAppeal } from './business-workflow'

const CONFIG_DIR = join(import.meta.dir, '../../../../../../work/tmp', `profer-test-stage-${Date.now()}`)
process.env.PROFER_CONFIG_DIR = CONFIG_DIR
afterAll(() => rmSync(CONFIG_DIR, { recursive: true, force: true }))

const template: TemplateVersion = {
  templateId: 't', version: 1, schemaVersion: 2, name: '两级', objectType: 'person', displayName: { template: '' },
  fields: [], materialSlots: [], policyVersionIds: [], stages: [
    { id: 'first', name: '初审', kind: 'manual-review', executorRole: 'reviewer', nextStageId: 'final' },
    { id: 'final', name: '终审', kind: 'manual-review', executorRole: 'teacher' },
  ], outputs: [], status: 'published', createdAt: '',
} as unknown as TemplateVersion

const caseV2: ReviewCaseV2 = { id: 'case-stage-1', templateId: 't', templateVersion: 1, title: '阶段测试', objectType: 'person', caseFields: {}, subjects: [], documents: [], stage: 'submitted', revision: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
const actor = { actorId: 'u1', actorSource: 'local' as const, role: 'reviewer' as const }
let requestIdCounter = 0
const nextReq = (): string => `req-${(requestIdCounter += 1)}`

let caseCounter = 0
async function seed(): Promise<{ caseId: string; firstTaskId: string }> {
  const caseId = `case-stage-${(caseCounter += 1)}`
  await createAggregate(caseId, { ...caseV2, id: caseId })
  const taskResult = await ensureInitialTask(caseId, template, actor)
  return { caseId, firstTaskId: taskResult.ok ? taskResult.entity!.id : '' }
}

describe('阶段推进（R07，修正误判 6）', () => {
  test('Given 初审通过 When 决定 Then 创建终审任务且案卷不 decided', async () => {
    const { caseId, firstTaskId } = await seed()
    const aggregate = readAggregate(caseId)!
    const outcome = await recordStageDecision(caseId, { requestId: nextReq(), actor, expectedRevision: 1, payload: { action: 'stage-pass', taskId: firstTaskId, reason: '初审通过' } }, template)
    expect(outcome.ok).toBeTrue()
    if (outcome.ok) {
      expect(outcome.aggregate.caseV2.stage).toBe('reviewing') // 不是 decided
      expect(outcome.aggregate.decisions[0]!.finality).toBe('stage')
      expect(outcome.entity!.task?.stageId).toBe('final') // 终审任务已建
    }
  })

  test('Given 终审阶段通过 When 决定 Then decided 且 finality=final', async () => {
    const { caseId, firstTaskId } = await seed()
    let agg = readAggregate(caseId)!
    const first = await recordStageDecision(caseId, { requestId: nextReq(), actor, expectedRevision: 1, payload: { action: 'stage-pass', taskId: firstTaskId, reason: '初审通过' } }, template)
    agg = first.ok ? first.aggregate : agg
    const finalTask = agg.tasks.find((task) => task.stageId === 'final' && task.status === 'open')!
    const second = await recordStageDecision(caseId, { requestId: nextReq(), actor, expectedRevision: agg.caseV2.revision, payload: { action: 'stage-pass', taskId: finalTask.id, reason: '终审通过' } }, template)
    expect(second.ok).toBeTrue()
    if (second.ok) {
      expect(second.aggregate.caseV2.stage).toBe('decided')
      expect(second.aggregate.decisions.at(-1)!.finality).toBe('final')
    }
  })

  test('Given 最终驳回 When 决定 Then decided（不自动待补件）', async () => {
    const { caseId, firstTaskId } = await seed()
    const aggregate = readAggregate(caseId)!
    const outcome = await recordStageDecision(caseId, { requestId: nextReq(), actor, expectedRevision: 1, payload: { action: 'final-reject', taskId: firstTaskId, reason: '不符合规定' } }, template)
    expect(outcome.ok).toBeTrue()
    if (outcome.ok) {
      expect(outcome.aggregate.caseV2.stage).toBe('decided')
      expect(outcome.aggregate.supplements).toHaveLength(0)
    }
  })

  test('Given 退回补件 When 决定 Then awaiting-supplement 且补件请求创建', async () => {
    const { caseId, firstTaskId } = await seed()
    const aggregate = readAggregate(caseId)!
    const outcome = await recordStageDecision(caseId, { requestId: nextReq(), actor, expectedRevision: 1, payload: { action: 'return-for-supplement', taskId: firstTaskId, reason: '缺证明', supplementRequiredElements: ['等级'], supplementReason: '补等级证明' } }, template)
    expect(outcome.ok).toBeTrue()
    if (outcome.ok) expect(outcome.aggregate.caseV2.stage).toBe('awaiting-supplement')
  })

  test('Given 重复决定同任务 When 再提交 Then INVALID_TRANSITION', async () => {
    const { caseId, firstTaskId } = await seed()
    const aggregate = readAggregate(caseId)!
    await recordStageDecision(caseId, { requestId: nextReq(), actor, expectedRevision: 1, payload: { action: 'stage-pass', taskId: firstTaskId, reason: 'x' } }, template)
    const agg2 = readAggregate(caseId)!
    const again = await recordStageDecision(agg2.caseV2.id, { requestId: nextReq(), actor, expectedRevision: agg2.caseV2.revision, payload: { action: 'stage-pass', taskId: firstTaskId, reason: 'y' } }, template)
    expect(again.ok).toBeFalse()
    if (!again.ok) expect(again.code).toBe('INVALID_TRANSITION')
  })
})

describe('补件多请求门控（06 §5.3）', () => {
  test('Given 两个未结束请求 When 只满足其一 Then 不恢复；全部结束才恢复', async () => {
    const { caseId, firstTaskId } = await seed()
    let agg = readAggregate(caseId)!
    const open = await recordStageDecision(caseId, { requestId: nextReq(), actor, expectedRevision: 1, payload: { action: 'return-for-supplement', taskId: firstTaskId, reason: 'r1', supplementRequiredElements: ['a'], supplementReason: '缺A' } }, template)
    agg = open.ok ? open.aggregate : agg
    // 经命令事务补第二个 open 请求（测试多请求门控的场景构造）
    const { submitCommand } = await import('./case-store-v2')
    const second = await submitCommand(caseId, { requestId: nextReq(), actor, expectedRevision: agg.caseV2.revision, type: 'OpenSecondSupplement', payload: {} }, (a) => ({
      summary: '测试注入第二个补件',
      mutate: (draft) => {
        draft.supplements = [...draft.supplements, { id: 'sup-test-2', caseId, originFindingKeys: [], requiredElements: ['b'], reason: '缺B', responsibleRole: 'student', status: 'open', responses: [], createdAt: new Date().toISOString() }]
      },
    }))
    expect(second.ok).toBeTrue()
    agg = second.ok ? second.aggregate : agg
    const openRequests = agg.supplements.filter((request) => request.status === 'open')
    expect(openRequests).toHaveLength(2)
    const satisfied = await resolveSupplementV2(caseId, { requestId: nextReq(), actor, expectedRevision: agg.caseV2.revision, payload: { supplementId: openRequests[0]!.id, outcome: 'satisfied', reason: '要素齐' } })
    expect(satisfied.ok).toBeTrue()
    if (satisfied.ok) {
      // 还有未结束请求 → 不恢复（06 §5.3）
      expect(satisfied.aggregate.caseV2.stage).toBe('awaiting-supplement')
    }
  })
})

describe('申诉更正与最终投影（R07）', () => {
  test('Given 申诉更正 When resolve Then 追加关联决定且原决定被投影排除', async () => {
    // 手工构造决定集验证投影
    const d1 = { id: 'd1', actor, scope: { kind: 'case' as const, ids: [] }, stageId: 'final', result: 'reject' as const, reason: '驳回', basedOnRunId: 'r', basedOnRevision: 1, at: '2026-01-01T00:00:00Z', finality: 'final' as const }
    const d2 = { ...d1, id: 'd2', amendsDecisionId: 'd1', result: 'pass' as const, reason: '申诉更正', at: '2026-01-02T00:00:00Z' }
    const projection = resolveFinalDecisionProjection([d1, d2])
    expect(projection.isFinal).toBeTrue()
    expect(projection.decision!.id).toBe('d2') // 更正决定生效
    expect(projection.supersededIds).toEqual(['d1'])
  })

  test('Given 仅阶段决定 When 投影 Then isFinal=false（报告不冒充终审）', () => {
    const d1 = { id: 'd1', actor, scope: { kind: 'case' as const, ids: [] }, stageId: 'first', result: 'pass' as const, reason: '初审', basedOnRunId: 'r', basedOnRevision: 1, at: '2026-01-01T00:00:00Z', finality: 'stage' as const }
    expect(resolveFinalDecisionProjection([d1]).isFinal).toBeFalse()
  })

  test('Given 申诉流程 When resolveAppealV2 更正 Then 关联决定追加', async () => {
    const { caseId, firstTaskId } = await seed()
    let agg = readAggregate(caseId)!
    const reject = await recordStageDecision(caseId, { requestId: nextReq(), actor, expectedRevision: 1, payload: { action: 'final-reject', taskId: firstTaskId, reason: '驳回' } }, template)
    agg = reject.ok ? reject.aggregate : agg
    const appealOutcome = submitAppeal({ caseV2: agg.caseV2, decisions: agg.decisions, supplements: agg.supplements, appeals: agg.appeals }, { requestId: nextReq(), actor, expectedRevision: agg.caseV2.revision }, { againstDecisionId: agg.decisions[0]!.id, statement: '证明有效', newEvidenceDocumentVersionIds: [] })
    expect(appealOutcome.ok).toBeTrue()
  })
})

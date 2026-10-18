/** Pure UI preflight. Main keeps the authoritative revision, task and batch gates. */
import type { BatchStateV2, CaseAggregateV2 } from '@profer/shared'

export interface SupplementRequeueChoice {
  id: string
  label: string
  originStageId: string
}

export interface SupplementTargetChoice {
  batchId: string
  name: string
  status: BatchStateV2['status']
  entryStatus: BatchStateV2['cases'][number]['status']
  disabledReason: string | null
}

/**
 * Never guess a target batch from case membership or the current BatchPanel tab.
 * A reviewer must explicitly choose both a satisfied supplement and ONE target.
 */
export function getSupplementRequeueChoices(
  caseId: string,
  aggregate: CaseAggregateV2 | null | undefined,
  batches: readonly BatchStateV2[],
): { revision: number | null; readyReason: string | null; supplements: SupplementRequeueChoice[]; targets: SupplementTargetChoice[] } {
  const memberBatches = batches.filter((batch) => batch.batch.caseIds.includes(caseId))
  const targets: SupplementTargetChoice[] = memberBatches.map((batch) => {
    const entry = batch.cases.find((item) => item.caseId === caseId)
    let disabledReason: string | null = null
    if (!entry) disabledReason = '批次没有对应队列记录'
    else if (!aggregate) disabledReason = '无法读取当前案卷修订'
    else if (aggregate.caseV2.templateId !== batch.batch.templateId || aggregate.caseV2.templateVersion !== batch.batch.templateVersion)
      disabledReason = '案卷模板版本与批次锁不一致'
    else if (batch.status === 'running' || batch.status === 'finalized')
      disabledReason = '执行中或已定稿的批次不能回流'
    else if (entry.status === 'queued' || entry.status === 'running')
      disabledReason = '本案已经排队或正在运行'
    return { batchId: batch.batch.id, name: batch.batch.name, status: batch.status,
      entryStatus: entry?.status ?? 'queued', disabledReason }
  })
  if (!aggregate) return { revision: null, readyReason: '当前案卷加载失败', supplements: [], targets }
  const openSupplement = aggregate.supplements.some((item) =>
    item.status === 'open' || item.status === 'responded' || item.status === 'insufficient')
  const supplements: SupplementRequeueChoice[] = aggregate.supplements
    .filter((item) => item.status === 'satisfied' && !!item.originStageId && aggregate.tasks.some((task) =>
      task.status === 'open' && task.stageId === item.originStageId && task.assigneeRole === 'reviewer'
      && (!task.assigneeActorId || task.assigneeActorId === 'local-user')))
    .map((item) => ({ id: item.id, originStageId: item.originStageId!, label: item.reason || item.id }))
  const readyReason = memberBatches.length < 2 ? '该案卷不属于多个批次，无需显式选择'
    : aggregate.caseV2.stage !== 'reviewing' ? '案卷尚未进入补件后重审状态'
      : openSupplement ? '仍有未完成的补件请求'
        : supplements.length === 0 ? '没有已满足补件对应的本地审核员开放任务' : null
  return { revision: aggregate.caseV2.revision, readyReason, supplements, targets }
}

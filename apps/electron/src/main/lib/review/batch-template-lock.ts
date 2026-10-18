/** P06 L02-01: a batch is bound to the published case template VERSION at dispatch time. */
import type { CaseAggregateV2, ReviewBatch, ReviewRunV2 } from '@profer/shared'

export function assertBatchCaseTemplateLock(
  batch: Pick<ReviewBatch, 'templateId' | 'templateVersion' | 'caseIds'>,
  caseId: string,
  aggregate: Pick<CaseAggregateV2, 'caseV2'> | null | undefined,
): void {
  if (!batch.caseIds.includes(caseId)) throw new Error('本案不属于当前批次，拒绝启动审核')
  if (!aggregate) throw new Error('无法读取当前案卷，拒绝启动批次审核')
  if (batch.templateId !== aggregate.caseV2.templateId || batch.templateVersion !== aggregate.caseV2.templateVersion)
    throw new Error('案卷模板版本与批次冻结版本不一致，拒绝运行；请重新核对批次和案卷模板')
}

export function assertBatchRunTemplateLock(
  batch: Pick<ReviewBatch, 'templateId' | 'templateVersion'>,
  run: Pick<ReviewRunV2, 'templateId' | 'templateVersion'>,
): void {
  if (run.templateId !== batch.templateId || run.templateVersion !== batch.templateVersion)
    throw new Error('审核运行使用的模板与批次冻结版本不一致；不得将该结果登记为批次完成')
}

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
  caseId: string,
  run: Pick<ReviewRunV2, 'caseId' | 'templateId' | 'templateVersion' | 'inputManifest'>,
): void {
  if (run.caseId !== caseId) throw new Error('模型返回的运行不属于当前批次案卷，禁止跨案登记完成')
  if (run.templateId !== batch.templateId || run.templateVersion !== batch.templateVersion
    || run.inputManifest?.templateVersion !== batch.templateVersion) {
    throw new Error('审核运行的模板与输入清单不符合批次冻结版本；不得将该结果登记为批次完成')
  }
}

/** A technically failed check must never turn a completed graph into a done batch item. */
export function classifyBatchRunCompletion(
  run: Pick<ReviewRunV2, 'status' | 'checks'>,
): string {
  if (run.status !== 'completed') return run.status
  if (run.checks.some((item) => item.status === 'execution-failed')) return 'technical-check-failed'
  return 'completed'
}

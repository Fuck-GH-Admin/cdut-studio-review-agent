import type { BatchStateV2, BatchTriageRoute, BatchAutomationReceipt, ReviewRunV2 } from '@profer/shared'

/** Electron's transport wrapper is an implementation detail, not a user-facing cause. */
export function reviewBusinessError(error: unknown): string {
  let text = error instanceof Error ? error.message : String(error)
  text = text.replace(/^(?:Error:\s*)?Error invoking remote method ['"][^'"]+['"]:\s*/i, '')
  text = text.replace(/^(?:Error:\s*)+/i, '').trim()
  return text || '操作失败，请检查审核状态并重试'
}

export interface BatchExecutionSummary {
  completed: number
  failed: number
  pending: number
  needsHuman: number
  technical: number
}

export function summarizeBatchExecution(
  state: BatchStateV2,
  routes: ReadonlyMap<string, BatchTriageRoute>,
): BatchExecutionSummary {
  const complete = state.cases.filter((entry) => entry.status === 'done')
  return {
    completed: complete.length,
    failed: state.cases.filter((entry) => entry.status === 'failed').length,
    pending: state.cases.filter((entry) => ['queued', 'running', 'paused'].includes(entry.status)).length,
    needsHuman: complete.filter((entry) => ['manual-review', 'auto-return-candidate', 'auto-pass-candidate']
      .includes(routes.get(entry.caseId) ?? '')).length,
    technical: complete.filter((entry) => routes.get(entry.caseId) === 'technical-exception').length,
  }
}

/** Distinguish a decision applied to THIS run from historic receipts after requeue. */
export function batchAutomationDisplay(
  entryStatus: BatchStateV2['cases'][number]['status'],
  caseStage: string | undefined,
  latestRunId: string | undefined,
  receipt: BatchAutomationReceipt | undefined,
  currentTriageLabel: string,
): { label: string; history?: string } {
  const isCurrent = !!receipt && entryStatus === 'done'
    && receipt.runId === latestRunId && ['decided', 'awaiting-supplement', 'archived'].includes(caseStage ?? '')
  if (isCurrent && receipt) {
    return { label: receipt.action === 'pass' ? '已自动通过（业务已写入）' : '已自动退回补件（业务已写入）' }
  }
  return {
    label: entryStatus === 'queued' && receipt ? '待本轮重新审核' : currentTriageLabel,
    ...(receipt ? { history: `上次动作：${receipt.action === 'pass' ? '自动通过' : '自动退回补件'}（历史记录）` } : {}),
  }
}

/** Only technical incidents are rendered; raw model errors may contain sensitive text. */
export function batchTechnicalFailureMessage(
  entryStatus: BatchStateV2['cases'][number]['status'],
  run: Pick<ReviewRunV2, 'status' | 'error' | 'diagnostics' | 'coverage'> | undefined,
): string | null {
  if (entryStatus !== 'failed') return null
  const signals = [run?.error, ...(run?.diagnostics ?? [])].filter(Boolean).join('；')
  const remaining = run?.coverage?.pendingChecks ?? 0
  if (/max.?turn|maximum.+turn|24.?轮|轮次上限|达到.+轮上限/i.test(signals)) {
    return 'Agent 达到本轮运行上限' + (remaining > 0 ? '，仍有 ' + remaining + ' 项检查未完成' : '') + '；未形成业务审核结论。'
  }
  return '检查运行发生技术异常' + (remaining > 0 ? '，仍有 ' + remaining + ' 项检查未完成' : '')
    + '；请打开案卷核对 Run 记录，不能将失败视为不合规。'
}

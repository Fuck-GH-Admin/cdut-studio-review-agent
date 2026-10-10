import type { BatchStateV2, BatchTriageRoute } from '@profer/shared'

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

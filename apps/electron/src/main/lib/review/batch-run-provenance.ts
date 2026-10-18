/** Strict per-batch Run provenance: a latest case Run is not evidence for another batch. */
import type { BatchStateV2, ReviewRunV2 } from '@profer/shared'

export function validateBoundBatchRun(
  batch: BatchStateV2['batch'], entry: BatchStateV2['cases'][number],
  run: ReviewRunV2 | undefined,
): ReviewRunV2 | undefined {
  if (!batch.caseIds.includes(entry.caseId) || !entry.runId || !entry.runInputHash || !run) return undefined
  if (run.id !== entry.runId || run.caseId !== entry.caseId) return undefined
  if (run.templateId !== batch.templateId || run.templateVersion !== batch.templateVersion
    || run.inputManifest?.templateVersion !== batch.templateVersion) return undefined
  if (!run.inputManifest.hash || run.inputManifest.hash !== entry.runInputHash) return undefined
  return run
}

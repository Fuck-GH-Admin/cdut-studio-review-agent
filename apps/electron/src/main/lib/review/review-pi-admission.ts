/**
 * P03-S02: Main-side acknowledgement seam for a prepared direct Pi review.
 *
 * This is NOT a second runner or task store. The caller provides the existing
 * agent-service runAgent() as execute(input, onRunOwned), and the actual Agent
 * promise remains owned by Main after the admission ACK is returned.
 *
 * No IPC is exposed here: session ownership / desktop / Pocket guards must
 * exist before an external entry point can call this function.
 */
import type { AgentSendInput } from '@profer/shared'
import {
  finishPiReviewRunV2,
  getPiReviewBindingForSession,
  type PiReviewBinding,
} from './pi-case-review-service'
import { findActivePiReviewAssignment, revokeAssignment } from './review-agent-assignment'
import { getRunV2 } from './run-store-v2'

export type ReviewAdmissionReceipt = Readonly<{
  caseId: string
  sessionId: string
  runId: string
  assignmentId: string
}>

export type OwnedReviewExecutor = (input: AgentSendInput, onRunOwned: () => void) => Promise<void>

/** Process-local duplicate admission fence, NOT another persisted task ledger. */
const runningAssignments = new Set<string>()

function isCurrent(binding: PiReviewBinding): boolean {
  const current = getPiReviewBindingForSession(binding.sessionId)
  return current?.caseId === binding.caseId
    && current?.runId === binding.runId
    && current?.assignmentId === binding.assignmentId
    && current?.sessionId === binding.sessionId
}

function closeIfCurrent(binding: PiReviewBinding, error: string): void {
  if (!isCurrent(binding)) return
  finishPiReviewRunV2(binding, { status: 'failed', error })
}

/**
 * Returns as soon as the real Orchestrator grants the run token; the Agent
 * continues in Main after this Promise resolves. Merely having a V2 "running"
 * row is not acceptance. Caller must have already prepared run+assignment.
 */
export function admitPreparedPiReviewTurn(
  input: AgentSendInput,
  binding: PiReviewBinding,
  execute: OwnedReviewExecutor,
): Promise<ReviewAdmissionReceipt> {
  if (input.sessionId !== binding.sessionId || input.agentRuntime !== 'pi'
    || input.triggeredBy !== 'user' || !input.uuid) {
    return Promise.reject(new Error('审核受理参数与可信 Pi 用户轮次不一致'))
  }
  const assignment = findActivePiReviewAssignment(binding.sessionId)
  if (!isCurrent(binding) || !assignment || assignment.id !== binding.assignmentId
    || assignment.turnId !== input.uuid || assignment.activeRunId !== binding.runId) {
    return Promise.reject(new Error('审核指派已失效，不能启动后台审核'))
  }
  if (input.onRunOutcome) {
    return Promise.reject(new Error('审核收尾必须由 Main 统一绑定，不能接收外部 onRunOutcome'))
  }
  if (runningAssignments.has(binding.assignmentId)) {
    return Promise.reject(new Error('该审核指派已经受理或正在启动；不得重复启动'))
  }
  runningAssignments.add(binding.assignmentId)

  let resolveAdmission!: (value: ReviewAdmissionReceipt) => void
  let rejectAdmission!: (error: Error) => void
  const admitted = new Promise<ReviewAdmissionReceipt>((resolve, reject) => {
    resolveAdmission = resolve
    rejectAdmission = reject
  })
  let owned = false
  let finished = false
  let terminalReported = false

  const fail = (error: unknown): void => {
    const message = error instanceof Error ? error.message : String(error)
    closeIfCurrent(binding, message || 'Agent 未获得执行权')
    if (!owned) {
      revokeAssignment(binding.assignmentId)
      rejectAdmission(error instanceof Error ? error : new Error(message))
    }
  }

  // The Main process intentionally owns this Promise. It is always observed,
  // so no unhandled rejection or page-unmount dependency is introduced.
  void Promise.resolve().then(() => execute({
    ...input,
    onRunOutcome: (outcome) => {
      terminalReported = true
      if (isCurrent(binding)) finishPiReviewRunV2(binding, outcome)
    },
  }, () => {
    if (finished || owned) return
    if (!isCurrent(binding)) return
    owned = true
    resolveAdmission({ caseId: binding.caseId, sessionId: binding.sessionId,
      runId: binding.runId, assignmentId: binding.assignmentId })
  })).then(
    () => {
      finished = true
      if (!owned) {
        fail(new Error('Agent 未获得执行权，启动已结束'))
      } else if (!terminalReported && getRunV2(binding.caseId, binding.runId)?.status === 'running') {
        closeIfCurrent(binding, 'Agent 未产生可信的完成回调')
      }
      runningAssignments.delete(binding.assignmentId)
    },
    (error: unknown) => {
      finished = true
      fail(error)
      runningAssignments.delete(binding.assignmentId)
    },
  )
  return admitted
}

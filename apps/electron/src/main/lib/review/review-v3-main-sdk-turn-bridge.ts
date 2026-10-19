/**
 * Dev-A A3-R05: Main-only SDK turn callback bridge for a single Pi turn.
 * No SDK implementation, Renderer IPC, business ReviewRun writer or C ACK.
 * The injected port must be bound in Main to an actual SDK turn callback, not
 * to model text or Renderer JSON. All actions are checked at both await edges.
 */
import {
  C0ContractError, type RunEvidenceIdentity,
} from '@profer/shared'
import type { V3ReviewToolCall } from './review-execution-event-adapter'
import type { V3ReviewOwnerAdapter } from './review-pi-owner-adapter'
import {
  type AExecutionProposal, type ATechnicalStatus, type V3AProposalProducer,
} from './review-v3-execution-proposal-producer'
import {
  type V3ATurnSnapshot, type V3ATurnBudget,
} from './review-v3-execution-turn-budget'

export type V3ASDKMode = 'direct' | 'hidden' | 'graph' | 'batch'
export type V3ATurnInterruption = Extract<
  ATechnicalStatus, 'cancelled' | 'timed-out' | 'failed'
>
export type V3ATurnHostOutcome =
  | { kind: 'completed-turn'; receiptId: string; run: RunEvidenceIdentity }
  | { kind: 'interrupted'; status: V3ATurnInterruption; run: RunEvidenceIdentity }

/**
 * Only the Main-injected SDK Host is allowed to issue a completed-turn receipt.
 * The Run is echoed by Main's binding to prevent accepting a receipt from a
 * different attempt/generation. The bridge never interprets Pi text.
 */
export interface V3AMainSDKTurnPort {
  nextTurn(request: {
    readonly run: RunEvidenceIdentity
    readonly mode: V3ASDKMode
    /** Main lifecycle cancellation; a signal never self-attests a terminal. */
    readonly signal?: AbortSignal
  }): Promise<V3ATurnHostOutcome>
}

export type V3ATurnDriveResult =
  | { kind: 'recorded'; turn: V3ATurnSnapshot }
  | { kind: 'terminal-proposal'; status: V3ATurnInterruption | 'needs-resume';
      event: AExecutionProposal }

/** Main owns this instance and all its dependencies; never expose to IPC. */
export class V3ASDKTurnBridge {
  private busy = false

  constructor(
    private readonly owners: V3ReviewOwnerAdapter,
    private readonly turns: V3ATurnBudget,
    private readonly proposals: V3AProposalProducer,
    private readonly sdk: V3AMainSDKTurnPort,
  ) {
    if (!sdk || typeof sdk.nextTurn !== 'function') {
      throw new C0ContractError('ACTOR_UNTRUSTED', 'Main-attested SDK callback required')
    }
  }

  private authorized(call: V3ReviewToolCall): RunEvidenceIdentity {
    const lease = this.owners.assertAuthorized(
      call.sessionId,call.grantId,call.senderKey,
      call.principal,'review_submit_result',
    )
    if (!lease.runEvidence || !lease.planSnapshot ||
        lease.runEvidence.runId !== lease.runId ||
        lease.runEvidence.attemptId !== lease.attemptId ||
        lease.runEvidence.ownerGeneration !== lease.generation ||
        lease.runEvidence.inputManifestHash !== lease.manifestHash ||
        lease.runEvidence.planFingerprint !== lease.planFingerprint) {
      throw new C0ContractError('RUN_IDENTITY_MISMATCH','Main frozen Run unavailable')
    }
    return lease.runEvidence
  }

  /** Replays a previously exhausted 24-turn technical terminal without rerunning SDK. */
  async closeExhausted(call: V3ReviewToolCall): Promise<AExecutionProposal> {
    if (call.tool !== 'review_submit_result') {
      throw new C0ContractError('CASE_SCOPE_FORBIDDEN','SDK turn needs submit capability')
    }
    const run=this.authorized(call)
    const lease=this.owners.assertAuthorized(
      call.sessionId,call.grantId,call.senderKey,
      call.principal,'review_submit_result',
    )
    if (!this.turns.exhausted(lease)) {
      throw new C0ContractError('CONTRACT_INVALID','24 turns have not been exhausted')
    }
    // C owns formal business completion. The Host supplies its own terminal
    // receipt and V3AProposalProducer fences the final grant at append time.
    const event=await this.proposals.terminal(call,'needs-resume')
    if (event.run.runId !== run.runId || event.run.attemptId !== run.attemptId) {
      throw new C0ContractError('RUN_IDENTITY_MISMATCH','Host terminal Run mismatch')
    }
    return event
  }

  /**
   * Exactly one Host attempt, with its durable result recorded only after a
   * second Main authorization check. A thrown SDK error is not a Host receipt.
   * It must be resolved by Main recovery, not silently billed or called PASS.
   */
  async next(call: V3ReviewToolCall, mode: V3ASDKMode,
    signal?: AbortSignal): Promise<V3ATurnDriveResult> {
    if (signal?.aborted) {
      throw new C0ContractError('CASE_SCOPE_FORBIDDEN',
        'Main cancelled SDK execution before Host invocation')
    }
    if (call.tool !== 'review_submit_result' ||
        !['direct','hidden','graph','batch'].includes(mode)) {
      throw new C0ContractError('CASE_SCOPE_FORBIDDEN','Invalid trusted SDK turn mode')
    }
    if (this.busy) {
      throw new C0ContractError('RECOVERY_REQUIRED','Concurrent SDK turn on same Main driver')
    }
    this.busy=true
    try {
      const frozen=this.authorized(call)
      const lease=this.owners.assertAuthorized(
        call.sessionId,call.grantId,call.senderKey,
        call.principal,'review_submit_result',
      )
      const alreadyTerminal=this.proposals.terminalCandidate(frozen)
      if (alreadyTerminal) {
        if (alreadyTerminal.kind === 'terminal' &&
            alreadyTerminal.terminal.status === 'needs-resume' &&
            alreadyTerminal.permissionGrantId === lease.grantId &&
            this.turns.exhausted(lease)) {
          return {kind:'terminal-proposal',status:'needs-resume',
            event:alreadyTerminal}
        }
        throw new C0ContractError('RUN_IDENTITY_MISMATCH',
          'Attempt already sealed; no further SDK Provider turn permitted')
      }
      if (this.turns.exhausted(lease)) {
        return {kind:'terminal-proposal',status:'needs-resume',
          event:await this.closeExhausted(call)}
      }
      const received=await this.sdk.nextTurn({
        run:structuredClone(frozen),mode,signal,
      })
      if (signal?.aborted) {
        throw new C0ContractError('CASE_SCOPE_FORBIDDEN',
          'Main cancelled in-flight SDK turn; Host return rejected')
      }
      // A legitimate SDK result received after revoke/expiry/cold restart is
      // no longer permission to record a turn, propose an event or run again.
      const current=this.authorized(call)
      if (!received || JSON.stringify(received.run) !== JSON.stringify(frozen) ||
          JSON.stringify(current) !== JSON.stringify(frozen)) {
        throw new C0ContractError('RUN_IDENTITY_MISMATCH',
          'SDK Host receipt bound to a different immutable Run')
      }
      if (received.kind === 'interrupted') {
        if (!['cancelled','timed-out','failed'].includes(received.status)) {
          throw new C0ContractError('CONTRACT_INVALID','Unknown Host interruption')
        }
        const event=await this.proposals.terminal(call,received.status)
        return {kind:'terminal-proposal',status:received.status,event}
      }
      if (received.kind !== 'completed-turn' ||
          typeof received.receiptId !== 'string' || !received.receiptId.trim()) {
        throw new C0ContractError('CONTRACT_INVALID','SDK Host turn receipt absent')
      }
      const turn=this.turns.recordCompletedTurn(call,received.receiptId)
      if (turn.exhausted) {
        return {kind:'terminal-proposal',status:'needs-resume',
          event:await this.closeExhausted(call)}
      }
      return {kind:'recorded',turn}
    } finally {
      this.busy=false
    }
  }
}

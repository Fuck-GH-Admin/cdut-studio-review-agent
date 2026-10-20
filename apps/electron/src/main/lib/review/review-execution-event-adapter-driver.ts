/**
 * V3 Dev-A shared Host seam used by direct, hidden, Graph and batch adapters.
 * It is deliberately NOT an SDK runner or business writer. Each caller must
 * supply the same Main-authenticated lease, exact Plan/Run and Host ports.
 *
 * C0/1 cannot carry check-target/outcome or a completed-technical terminal;
 * this adapter therefore NEVER emits a business-completed event.
 */
import {
  C0ContractError, type CanonicalPlan, type Principal,
  type RunEvidenceIdentity, type SourceIdentity,
} from '@profer/shared'
import {
  type V3ReviewOwnerAdapter, type V3ReviewTool, type V3OwnerLease,
} from './review-pi-owner-adapter'
import {
  V3ExecutionEventAdapter, type V3EventDelivery, type V3ReviewToolCall,
} from './review-execution-event-adapter'
import {
  V3ExecutionCompletenessAdapter, type A3CheckObservation,
  type A3TechnicalSnapshot,
} from './review-execution-event-adapter-completeness'

export type V3ExecutionMode = 'direct' | 'hidden' | 'graph' | 'batch'
export interface V3HostReadReceipt<T> {
  receiptId: string
  actualSource: SourceIdentity
  result: T
}
export interface V3HostSubmissionResult extends A3CheckObservation {
  /** This value can only originate from a trusted Host tool result. */
  hostReceiptId?: string
}
export interface V3ExecutionAdapterConfig {
  mode: V3ExecutionMode
  sessionId: string
  grantId: string
  senderKey: string
  principal: Principal
  run: RunEvidenceIdentity
  plan: CanonicalPlan
  maxTurns?: number
}

/** No model/renderer caller receives an owner/capability object from this API. */
export class V3ExecutionHostAdapter {
  readonly mode: V3ExecutionMode
  private readonly checkCoverage: V3ExecutionCompletenessAdapter
  private readonly submitCall: V3ReviewToolCall
  private readonly attempt: string
  private sealed = false

  constructor(
    private readonly owners: V3ReviewOwnerAdapter,
    private readonly events: V3ExecutionEventAdapter,
    config: V3ExecutionAdapterConfig,
  ) {
    this.mode = config.mode
    if (!['direct', 'hidden', 'graph', 'batch'].includes(this.mode)) {
      throw new C0ContractError('CONTRACT_INVALID', 'Unknown runner mode')
    }
    this.checkCoverage = new V3ExecutionCompletenessAdapter(
      config.plan, config.run, config.maxTurns ?? 24,
    )
    this.submitCall = {
      sessionId: config.sessionId, grantId: config.grantId,
      senderKey: config.senderKey, principal: config.principal,
      tool: 'review_submit_result',
    }
    const lease = owners.assertAuthorized(
      config.sessionId, config.grantId, config.senderKey, config.principal,
      'review_submit_result',
    )
    if (lease.caseId !== config.run.caseId ||
        lease.runId !== config.run.runId ||
        lease.attemptId !== config.run.attemptId ||
        lease.generation !== config.run.ownerGeneration ||
        lease.planFingerprint !== config.plan.fingerprint ||
        lease.manifestHash !== config.run.inputManifestHash) {
      throw new C0ContractError('RUN_IDENTITY_MISMATCH', 'Runner and Main lease identity disagree')
    }
    this.attempt = lease.attemptId
  }

  get attemptId(): string { return this.attempt }
  snapshot(): A3TechnicalSnapshot { return this.checkCoverage.snapshot() }
  private checkOpen(): void {
    if (this.sealed || ['needs-resume', 'cancelled', 'timed-out', 'failed'].includes(
      this.checkCoverage.snapshot().state)) {
      throw new C0ContractError('RUN_IDENTITY_MISMATCH', 'Attempt not accepting new Host results')
    }
  }
  turn(): A3TechnicalSnapshot {
    this.checkOpen()
    this.checkCoverage.recordTurn()
    return this.snapshot()
  }

  async read<T>(
    source: SourceIdentity,
    tool: Extract<V3ReviewTool, 'review_read_documents' | 'review_inspect_document_image' | 'review_inspect_original'>,
    execute: (authorizedSource: SourceIdentity) => Promise<V3HostReadReceipt<T>>,
  ): Promise<{ result: T; delivery: V3EventDelivery }> {
    this.checkOpen()
    const call: V3ReviewToolCall = { ...this.submitCall, tool, source }
    return this.events.guardedRead(call, execute)
  }

  /**
   * Submit is Host-acknowledged: Pi's requested result is NOT enough.
   * The Host must return the exact Check tuple and accepted/rejected state.
   * A rejected/unknown/missing result is kept in local technical diagnostics,
   * never upgraded to an accepted C0 check-proposal.
   */
  async submit(
    request: A3CheckObservation,
    execute: (requested: A3CheckObservation) => Promise<V3HostSubmissionResult>,
  ): Promise<{ observation: A3CheckObservation; delivery: V3EventDelivery | null }> {
    this.checkOpen()
    this.owners.assertAuthorized(
      this.submitCall.sessionId, this.submitCall.grantId,
      this.submitCall.senderKey, this.submitCall.principal, 'review_submit_result',
    )
    const ack = await execute(structuredClone(request))
    this.owners.assertAuthorized(
      this.submitCall.sessionId, this.submitCall.grantId,
      this.submitCall.senderKey, this.submitCall.principal, 'review_submit_result',
    )
    if (!ack || ack.checkKey !== request.checkKey ||
        ack.targetKey !== request.targetKey || ack.objectKey !== request.objectKey ||
        ack.subjectId !== request.subjectId ||
        !['accepted', 'rejected', 'missing', 'unknown'].includes(ack.status)) {
      throw new C0ContractError('CONTRACT_INVALID', 'Host check identity or status mismatch')
    }
    // Validate exact Plan×target before emitting any durable event.
    this.checkCoverage.recordHostOutcome(ack)
    if (ack.status !== 'accepted') {
      return { observation: ack, delivery: null }
    }
    try {
      const delivery = this.events.proposeCheck(this.submitCall, ack.hostReceiptId ?? '')
      return { observation: ack, delivery }
    } catch (error) {
      // A successful Host tool without a durable proposal cannot be completion.
      this.checkCoverage.markFailure('failed')
      this.sealed = true
      throw error
    }
  }

  /**
   * Provider failure/round exhaustion cannot be converted into "completed".
   * A terminal failure proposal requires a still-current Main grant; after
   * revoke, late Provider exceptions have no trusted event write.
   */
  fail(status: 'cancelled' | 'timed-out' | 'failed'): V3EventDelivery {
    this.checkOpen()
    const delivery = this.events.failAttempt(this.submitCall)
    this.checkCoverage.markFailure(status)
    this.sealed = true
    return delivery
  }

  closeTechnical(): A3TechnicalSnapshot {
    this.owners.assertAuthorized(
      this.submitCall.sessionId, this.submitCall.grantId,
      this.submitCall.senderKey, this.submitCall.principal, 'review_submit_result',
    )
    const snapshot = this.snapshot()
    if (snapshot.state !== 'technically-complete') {
      throw new C0ContractError('RUN_IDENTITY_MISMATCH', 'Missing/rejected/unknown Checks still present')
    }
    // No C0 completed event exists. Dev-C is the sole formal run finalizer.
    this.sealed = true
    return snapshot
  }
}

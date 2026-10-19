/**
 * Integrator-I I1 technical-only seam across frozen A/B adapters and C1
 * current-source validation. Not a Main handler, publisher, Case/Run writer,
 * Host credential, or durable Receipt. Never export this as Renderer IPC.
 */
import type { CaseAggregateV2, RunEvidenceIdentity, SourceIdentity } from '@profer/shared'
import {
  compileReviewB1Plan, verifyReviewB1Descriptor,
  type B1AuthorDocument,
} from './review-template-plan-adapter-v3-b1'
import {
  ReviewB2StagingService, type B2MainContext, type B2MaterialCandidate,
} from './review-intake-adapter-v3-b2'
import {
  planB3ConservativeRouting, type B3RouteSuggestion, type B3RouteState,
} from './review-intake-routing-adapter-v3-b3'
import {
  V3ExecutionCompletenessAdapter, type A3CheckObservation,
  type A3TechnicalSnapshot,
} from './review-execution-event-adapter-completeness'
import { currentSourceValidityBlockers } from './source-current-validity-v3'
import { ReviewB2SourceVersionAdapter } from './review-source-version-adapter-v3-b2'
import { V3ExecutionEventAdapter, type V3ReviewToolCall, type V3EventDelivery } from './review-execution-event-adapter'

export interface I1TechnicalPreviewInput {
  /** Main-injected in a future production caller; synthetic in the I1 test. */
  mainContext: B2MainContext
  staging: ReviewB2StagingService
  candidateIds: readonly string[]
  /** An untrusted B1 author draft: candidate compilation is NOT publication. */
  authorDraft: B1AuthorDocument
  /** RunEvidenceIdentity is checked structurally, NOT accepted by C2. */
  proposedRun: RunEvidenceIdentity
  /** Trusted Host must eventually supply these; tests use synthetic fixtures. */
  technicalObservations?: readonly A3CheckObservation[]
  /** Optional C1-owned read-only aggregate snapshot for stale-source diagnosis. */
  currentCaseSnapshot?: CaseAggregateV2
  routing?: {
    startedAtMs: number
    nowMs: number
    automaticSelectionEnabled: boolean
    userInterrupted: boolean
    suggestions: B3RouteSuggestion[]
  }
}

export interface I1TechnicalPreview {
  readonly classification: 'STAGED_ONLY'
  readonly publicationAllowed: false
  readonly canInstallPlan: false
  readonly canCommitRun: false
  readonly canFinalizeDecision: false
  readonly sourceVersionIds: readonly string[]
  readonly planFingerprint: string
  readonly coverage: A3TechnicalSnapshot
  readonly sourceValidityBlockers: readonly string[]
  /** Unattributed/cross-Subject material cannot prove a Check target. */
  readonly subjectSourceBlockers: readonly string[]
  readonly technicalPreviewEligible: boolean
  readonly route?: B3RouteState
}

/**
 * Preview only. Does not grant a Main Principal or vouch for caller-supplied
 * Host observations. No acceptance or business writer can consume the result
 * as an authorization token: the result explicitly denies all write actions.
 */
export function inspectI1TechnicalPreview(input: I1TechnicalPreviewInput): I1TechnicalPreview {
  // A3 validates Plan/Check membership, but it has no knowledge of B2's
  // Main-attested intake owner. Bind the proposal to that owner *before*
  // any candidate/coverage is reported as eligible for a technical preview.
  // In particular, a forged cross-case Run or a previous owner generation
  // cannot borrow a valid physical documentVersionId from this staging scope.
  if (input.proposedRun.caseId !== input.mainContext.caseCandidateId ||
      input.proposedRun.ownerGeneration !== input.mainContext.ownerGeneration) {
    throw new Error('I1_RUN_MAIN_INTAKE_SCOPE_MISMATCH')
  }
  if (!input.candidateIds.length || new Set(input.candidateIds).size !== input.candidateIds.length) {
    throw new Error('I1_CANDIDATE_SET_INVALID')
  }
  // Use B's owner-scoped registry, never trust a renderer-supplied candidate.
  const candidates: B2MaterialCandidate[] = input.candidateIds.map(id =>
    input.staging.getCandidate(input.mainContext, id))
  const versions = new Set(candidates.map(c => c.documentVersionId))
  if (versions.size !== candidates.length) {
    throw new Error('I1_SOURCE_VERSION_COLLISION')
  }

  const descriptor = compileReviewB1Plan(input.authorDraft)
  verifyReviewB1Descriptor(input.authorDraft, descriptor)
  if (descriptor.publicationAllowed !== false) {
    throw new Error('I1_CANDIDATE_MUST_REMAIN_UNPUBLISHED')
  }
  const materialByVersion = new Map(candidates.map(c => [c.documentVersionId, c]))
  const sourceVersions = descriptor.sourceLedger.map(s => s.documentVersionId)
  if (!sourceVersions.length || sourceVersions.some(version => !versions.has(version))) {
    throw new Error('I1_PLAN_SOURCE_NOT_STAGED')
  }
  if (input.proposedRun.sourceVersionIds.some(version => !versions.has(version))) {
    throw new Error('I1_RUN_SOURCE_NOT_STAGED')
  }
  if (input.currentCaseSnapshot &&
      input.currentCaseSnapshot.caseV2.id !== input.proposedRun.caseId) {
    throw new Error('I1_CURRENT_CASE_SCOPE_MISMATCH')
  }
  // A3 checks exact Plan/Run/check-target/subject; it cannot commit a Run.
  const diagnostics = new V3ExecutionCompletenessAdapter(
    descriptor.canonicalPlan, input.proposedRun,
  )
  for (const observation of input.technicalObservations ?? []) {
    diagnostics.recordHostOutcome(observation)
  }
  const coverage = diagnostics.snapshot()
  const subjectSourceBlockers = descriptor.canonicalPlan.bindings.flatMap(binding =>
    binding.sourceVersionIds.filter(versionId => {
      const material = materialByVersion.get(versionId)
      return !material || material.subjectId === null ||
        material.subjectId !== binding.subjectId || material.role === 'unassigned'
    }).map(versionId => `subject-source:${binding.checkKey}:${binding.targetKey}:${versionId}`))
  const blockers = input.currentCaseSnapshot
    ? currentSourceValidityBlockers(input.currentCaseSnapshot)
    : []
  const route = input.routing ? planB3ConservativeRouting({
    ...input.routing,
    materialCandidates: candidates,
  }) : undefined

  return {
    classification: 'STAGED_ONLY',
    publicationAllowed: false,
    canInstallPlan: false,
    canCommitRun: false,
    canFinalizeDecision: false,
    sourceVersionIds: [...versions],
    planFingerprint: descriptor.canonicalPlan.fingerprint,
    coverage,
    sourceValidityBlockers: blockers,
    subjectSourceBlockers,
    technicalPreviewEligible: blockers.length === 0 && subjectSourceBlockers.length === 0 &&
      coverage.state === 'technically-complete',
    ...(route ? { route } : {}),
  }
}

/**
 * Resolve a genuinely parser-registered physical source block from B2-owned
 * staged original bytes. This is an intake-side fact, NOT formal Case admission,
 * approval or a full-document read receipt. Caller may not pass a locator.
 */
export async function inspectI1PhysicalSourceBlock(input: {
  staging: ReviewB2StagingService
  parser: ReviewB2SourceVersionAdapter
  mainContext: B2MainContext
  candidateId: string
  blockId?: string
}): Promise<{
  classification: 'STAGED_ONLY'
  status: 'VERIFIED_BLOCK_ONLY' | 'PARTIAL_BLOCK_ONLY' | 'NEEDS_SOURCE_REVIEW'
  source?: SourceIdentity
  fullDocumentReadProven: false
}> {
  const candidate = input.staging.getCandidate(input.mainContext, input.candidateId)
  const parsed = await input.parser.parse(input.mainContext, candidate)
  if (parsed.status === 'failed' || parsed.blocks.length === 0) {
    return {
      classification: 'STAGED_ONLY', status: 'NEEDS_SOURCE_REVIEW',
      fullDocumentReadProven: false,
    }
  }
  const blockId = input.blockId ?? parsed.blocks[0]!.blockId
  // The parser registry enforces actual block origin and parse revision.
  const source = input.parser.sourceForBlock(
    input.mainContext, candidate.candidateId, parsed.parseRevision, blockId,
  )
  if (source.documentVersionId !== candidate.documentVersionId ||
      source.rawSha256 !== candidate.rawSha256 ||
      source.materialId !== candidate.materialId) {
    throw new Error('I1_PHYSICAL_SOURCE_BINDING_MISMATCH')
  }
  return {
    classification: 'STAGED_ONLY',
    status: parsed.status === 'parsed' ? 'VERIFIED_BLOCK_ONLY' : 'PARTIAL_BLOCK_ONLY',
    source, fullDocumentReadProven: false,
  }
}

/**
 * A1/A2 + B2 physical read seam, wired strictly within Main-side modules.
 * A real Main caller must first create a trusted Owner grant; this adapter
 * cannot mint Principal, Owner, Host receipts, C2 ACK or a business Run.
 */
export async function readI1OwnerBoundBlock<T>(input: {
  staging: ReviewB2StagingService
  parser: ReviewB2SourceVersionAdapter
  mainContext: B2MainContext
  candidateId: string
  blockId?: string
  events: V3ExecutionEventAdapter
  /** Deliberately cannot supply arbitrary source/tool in this argument. */
  mainOwnedCall: Omit<V3ReviewToolCall, 'source' | 'tool'>
  /** The Host attests the exact actualSource AFTER reading it. */
  hostRead: (source: SourceIdentity) => Promise<{
    receiptId: string
    actualSource: SourceIdentity
    result: T
  }>
}): Promise<{
  classification: 'STAGED_ONLY'
  fullDocumentReadProven: false
  source: SourceIdentity
  delivery: V3EventDelivery
  hostResult: T
}> {
  const physical = await inspectI1PhysicalSourceBlock(input)
  if (!physical.source || physical.status === 'NEEDS_SOURCE_REVIEW') {
    throw new Error('I1_VERIFIED_PHYSICAL_BLOCK_REQUIRED')
  }
  const verifiedSource: SourceIdentity = physical.source
  // Dev-A's guardedRead performs before/after-await Main Owner validation,
  // source allowlist checks, Host actualSource matching and durable local append.
  const { result, delivery } = await input.events.guardedRead({
    ...input.mainOwnedCall, tool: 'review_read_documents', source: verifiedSource,
  }, async expectedSource => {
    const hostResult = await input.hostRead(expectedSource)
    // The A1 Owner and B2 staging grants have *separate* lifecycles.
    // A1's after-await authority check alone cannot prove that a B2 input
    // candidate was not revoked while the Host was reading its bytes.
    // Revalidate both the live staging grant and exact parser registry block
    // after await and before A2 can append its local proposal. This is still
    // a staged-only read, never a durable business receipt.
    const current = input.staging.getCandidate(input.mainContext, input.candidateId)
    if (current.caseCandidateId !== verifiedSource.caseId ||
        current.materialId !== verifiedSource.materialId ||
        current.documentVersionId !== verifiedSource.documentVersionId ||
        current.rawSha256 !== verifiedSource.rawSha256 ||
        current.status !== 'accepted') {
      throw new Error('I1_PHYSICAL_SOURCE_REVOKED_OR_REPLACED')
    }
    const registered = input.parser.sourceForBlock(
      input.mainContext, input.candidateId,
      verifiedSource.parseRevision, verifiedSource.blockId,
    )
    if (registered.caseId !== verifiedSource.caseId ||
        registered.materialId !== verifiedSource.materialId ||
        registered.documentVersionId !== verifiedSource.documentVersionId ||
        registered.rawSha256 !== verifiedSource.rawSha256 ||
        registered.parseRevision !== verifiedSource.parseRevision ||
        registered.blockId !== verifiedSource.blockId ||
        registered.location.kind !== verifiedSource.location.kind ||
        registered.location.locator !== verifiedSource.location.locator) {
      throw new Error('I1_PHYSICAL_SOURCE_REGISTRY_CHANGED')
    }
    return hostResult
  })
  return {
    classification: 'STAGED_ONLY',
    fullDocumentReadProven: false,
    source: physical.source,
    delivery,
    hostResult: result,
  }
}

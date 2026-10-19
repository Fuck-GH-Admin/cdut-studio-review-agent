/**
 * I2 A-source slice: a real Dev-A proposal producer against C's independent
 * versioned proposal validator. Synthetic Main + Host fixtures ONLY. This
 * does not invoke C's Run/Case writer or mint a durable C2 ACK.
 */
import { describe, expect, test } from 'bun:test'
import {
  REVIEW_C0_SCHEMA_VERSION, type CanonicalPlan, type Principal,
  type RunEvidenceIdentity, type SourceIdentity,
} from '@profer/shared'
import { V3ReviewOwnerAdapter, type OwnerPersistence } from './review-pi-owner-adapter'
import {
  V3AProposalProducer, type AVerifiedExecutionHost,
} from './review-v3-execution-proposal-producer'
import {
  executionProposalId, validateV3ExecutionProposal,
  type V3TrustedConsumptionContext,
} from './review-v3-execution-contract'

function journal(): OwnerPersistence {
  let content: string | null = null
  return { read: () => content, write: (next: string) => { content = next } }
}
function scenario() {
  const caseId = 'synthetic-c2-case'
  const source: SourceIdentity = {
    schemaVersion: REVIEW_C0_SCHEMA_VERSION, caseId, materialId: 'physical-m1',
    documentVersionId: 'physical-dv1', rawSha256: 'a'.repeat(64),
    parseRevision: 'parse-1', blockId: 'actual-parsed-block',
    location: { kind: 'paragraph', locator: '1' },
  }
  const plan: CanonicalPlan = {
    schemaVersion: REVIEW_C0_SCHEMA_VERSION, planId: 'candidate-plan',
    fingerprint: 'candidate-fingerprint', templateId: 'candidate-t1',
    templateVersion: 'v1', moduleDigests: [],
    bindings: [{ checkKey: 'check-1', targetKey: 'target-1', objectKey: 'object-1',
      subjectId: 'subject-1', sourceVersionIds: [source.documentVersionId],
      applicability: 'applicable', conditionFingerprint: 'condition-1' }],
  }
  const run: RunEvidenceIdentity = {
    schemaVersion: REVIEW_C0_SCHEMA_VERSION, runId: 'synthetic-r1', caseId,
    caseRevision: 2, planFingerprint: plan.fingerprint,
    templateVersion: plan.templateVersion, inputManifestHash: 'b'.repeat(64),
    sourceVersionIds: [source.documentVersionId], checkKeys: ['check-1'],
    attemptId: 'synthetic-attempt', ownerGeneration: 1,
  }
  const principal: Principal = {
    principalId: 'synthetic-main-principal', source: 'local', role: 'reviewer',
    sessionId: 'window-main', assurance: 'local-device',
    scope: { caseIds: [caseId], actions: ['start-review'] },
  }
  let active = true
  const owners = new V3ReviewOwnerAdapter(journal(), {
    authorizeExecution: ({ principal: got, run: current }) => {
      if (!active || got.principalId !== principal.principalId || current.caseId !== caseId)
        throw new Error('FIXTURE_OWNER_DENIED')
    },
    isCurrent: () => active,
  })
  const lease = owners.grant({
    principal, run, plan, sources: [source], sessionId: 'owned-main-session',
    senderKey: 'trusted-main-frame', expiresAt: Date.now() + 60_000,
    permittedTools: ['review_read_documents', 'review_submit_result'],
  })
  const check = { checkKey: 'check-1', targetKey: 'target-1',
    objectKey: 'object-1', subjectId: 'subject-1', status: 'accepted' as const }
  const host: AVerifiedExecutionHost = {
    read: async original => ({ receiptId: 'host-physical-read',
      actualSource: original, extent: 'block' }),
    check: async () => ({ receiptId: 'host-physical-check', actualCheck: check }),
    terminal: async status => ({ receiptId: 'host-physical-terminal', actualStatus: status }),
  }
  const producer = new V3AProposalProducer(journal(), owners, host)
  const call = { principal, sessionId: lease.sessionId, senderKey: lease.senderKey,
    grantId: lease.grantId, tool: 'review_read_documents' as const, source }
  const verifiedHostReceipts = new Map([
    ['host-physical-read', { kind: 'read' as const, permissionGrantId: lease.grantId,
      source, extent: 'block' as const }],
    ['host-physical-check', { kind: 'check' as const, permissionGrantId: lease.grantId,
      check }],
  ])
  const trusted = (): V3TrustedConsumptionContext => ({
    run, plan, permissionGrantId: lease.grantId, grantActive: true,
    currentCaseRevision: run.caseRevision,
    activeSourceVersionIds: [source.documentVersionId],
    verifiedHostReceipts, nextSequence: 1, committedDigests: new Map(),
  })
  return { producer, call, lease, run, plan, source, check, trusted,
    deny: () => { active = false } }
}

describe('I2 A technical Host producer vs C versioned C2 validator (synthetic only)', () => {
  test('real A read+check proposals match C canonical digest and exact sequence without C2 ACK', async () => {
    const h = scenario()
    const read = await h.producer.read(h.call)
    if (read.kind !== 'read') throw new Error('EXPECTED_A_PHYSICAL_READ_PROPOSAL')
    const { eventId: _id, ...payload } = read
    expect(executionProposalId(payload)).toBe(read.eventId)
    expect(validateV3ExecutionProposal(read, h.trusted())).toBe('new')
    const check = await h.producer.check(
      { ...h.call, tool: 'review_submit_result' },
      { checkKey: 'check-1', targetKey: 'target-1', objectKey: 'object-1', subjectId: 'subject-1' },
    )
    if (check.kind !== 'check') throw new Error('EXPECTED_A_EXACT_CHECK_PROPOSAL')
    expect(check.sequence).toBe(2)
    expect(validateV3ExecutionProposal(check, {
      ...h.trusted(), nextSequence: 2, committedDigests: new Map([[1, read.eventId]]),
    })).toBe('new')
    // This API returns only validation verdicts; it never commits a Run or ACK.
    expect(h.producer.replayCandidates()).toHaveLength(2)
  })
  test('C refuses stale grant, forged read extent and conflicting replay despite valid A local journal', async () => {
    const h = scenario()
    const read = await h.producer.read(h.call)
    if (read.kind !== 'read') throw new Error('EXPECTED_A_PHYSICAL_READ_PROPOSAL')
    expect(validateV3ExecutionProposal(read, {
      ...h.trusted(), nextSequence: 2, committedDigests: new Map([[1, read.eventId]]),
    })).toBe('replay')
    expect(() => validateV3ExecutionProposal(read, {
      ...h.trusted(), grantActive: false,
    })).toThrow()
    const changedRead = { ...read, read: { ...read.read, extent: 'full-document' as const } }
    // No recomputed eventId: canonical digest detects payload tampering.
    expect(() => validateV3ExecutionProposal(changedRead, h.trusted())).toThrow()
    const { eventId: _old, ...changedPayload } = changedRead
    const forgedRehashed = { ...changedRead,
      eventId: executionProposalId(changedPayload) }
    // Re-signing the body is not the physical Host's exact extent attestation.
    expect(() => validateV3ExecutionProposal(forgedRehashed, h.trusted())).toThrow()
    expect(() => validateV3ExecutionProposal(read, {
      ...h.trusted(), nextSequence: 2, committedDigests: new Map([[1, 'f'.repeat(64)]]),
    })).toThrow()
    h.deny()
    await expect(h.producer.read(h.call)).rejects.toThrow()
    expect(h.producer.replayCandidates()).toHaveLength(1)
  })
})

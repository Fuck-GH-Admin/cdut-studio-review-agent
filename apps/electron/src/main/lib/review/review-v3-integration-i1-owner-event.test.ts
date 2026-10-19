/**
 * Integrator-I I1 second technical slice: B1/B2 -> A1 Owner -> A2 C0 proposal
 * -> A3 technical diagnostics -> C1 source validity. No Main/IPC adapter,
 * formally persisted Run, or school policy authorization exists here.
 */
import { describe, expect, test } from 'bun:test'
import {
  REVIEW_C0_SCHEMA_VERSION, type Principal, type RunEvidenceIdentity,
  type CanonicalPlan, type SourceIdentity, type CaseAggregateV2,
} from '@profer/shared'
import {
  ReviewB2StagingService, type B2MainContext,
} from './review-intake-adapter-v3-b2'
import { ReviewB2SourceVersionAdapter } from './review-source-version-adapter-v3-b2'
import {
  compileReviewB1Plan, type B1AuthorDocument,
} from './review-template-plan-adapter-v3-b1'
import {
  V3ReviewOwnerAdapter, type OwnerPersistence, type V3MainAuthority,
} from './review-pi-owner-adapter'
import { V3ExecutionEventAdapter } from './review-execution-event-adapter'
import { V3ExecutionCompletenessAdapter } from './review-execution-event-adapter-completeness'
import { currentSourceValidityBlockers } from './source-current-validity-v3'
import { readI1OwnerBoundBlock } from './review-v3-integration-i1-technical'

function memoryJournal(): OwnerPersistence {
  let stored: string | null = null
  return { read: () => stored, write: (text: string) => { stored = text } }
}
const identity: B2MainContext = {
  senderId: 88, frameId: 2, ownerId: 'fixture-main-identity', ownerGeneration: 1,
  caseCandidateId: 'case-from-main',
}
function draft(versionId: string): B1AuthorDocument {
  return {
    schemaVersion: 'review-b1/1', templateId: 'fixture-review', templateVersion: 'v1',
    name: 'Scoped technical integration', purpose: 'I1 source and owner probe',
    status: 'candidate-held', fields: [],
    sources: [{ sourceId: 'physical-source', kind: 'user-declared',
      documentVersionId: versionId, locator: 'original', recordedBy: 'test-main' }],
    targets: [{ targetKey: 'target-1', objectKey: 'object-1', subjectId: 'subject-1',
      scenario: 'technical only', fieldValues: {} }],
    modules: [{ moduleId: 'module-1', version: 'v1', dependsOn: [],
      checks: [{ checkKey: 'check-1', requirement: 'Host must inspect actual bytes',
        sourceIds: ['physical-source'], targetKeys: ['target-1'], condition: { kind: 'always' },
        responsibility: 'reviewer' }] }],
    stages: [{ stageId: 'inspect', role: 'reviewer', mode: 'technical' }],
    outputs: [{ outputId: 'preview', kind: 'candidate-result' }],
  }
}
async function scenario() {
  const staging = new ReviewB2StagingService()
  const candidate = staging.stage(identity, staging.grant(identity).token, {
    requestId: 'original-request', fileName: 'actual-source.txt',
    physicalSourceKey: 'native-test-file-1',
    bytes: Buffer.from('Real source text from staged original.'),
    role: 'supporting', subjectId: 'subject-1',
  })
  const parser = new ReviewB2SourceVersionAdapter(staging)
  const parsed = await parser.parse(identity, candidate)
  expect(parsed.status).toBe('parsed')
  const source = parser.sourceForBlock(identity, candidate.candidateId,
    parsed.parseRevision, parsed.blocks[0]!.blockId)
  const descriptor = compileReviewB1Plan(draft(candidate.documentVersionId))
  const plan: CanonicalPlan = descriptor.canonicalPlan
  const run: RunEvidenceIdentity = {
    schemaVersion: REVIEW_C0_SCHEMA_VERSION, runId: 'synthetic-run-identity',
    caseId: identity.caseCandidateId, caseRevision: 1,
    planFingerprint: plan.fingerprint, templateVersion: plan.templateVersion,
    inputManifestHash: 'a'.repeat(64), sourceVersionIds: [candidate.documentVersionId],
    checkKeys: ['check-1'], attemptId: 'technical-attempt-1', ownerGeneration: 1,
  }
  const principal: Principal = {
    principalId: 'main-only-fixture', source: 'local', role: 'reviewer',
    sessionId: 'window-1', assurance: 'local-device',
    scope: { caseIds: [identity.caseCandidateId], actions: ['start-review'] },
  }
  let current = true
  let currentCase: CaseAggregateV2 | null = null
  const authority: V3MainAuthority = {
    authorizeExecution: ({ principal: actor, run: proposedRun, senderKey }) => {
      if (!current || actor.principalId !== principal.principalId ||
        senderKey !== 'trusted-window:88' || proposedRun.caseId !== source.caseId) {
        throw new Error('FIXTURE_MAIN_AUTH_REJECTED')
      }
    },
    isCurrent: ({ lease }) => current && lease.caseId === source.caseId &&
      (currentCase === null || currentSourceValidityBlockers(currentCase).length === 0),
  }
  const ownerJournal = memoryJournal()
  const eventJournal = memoryJournal()
  const owners = new V3ReviewOwnerAdapter(ownerJournal, authority)
  const lease = owners.grant({
    principal, run, plan, sources: [source], sessionId: 'owned-session-fixture',
    senderKey: 'trusted-window:88', expiresAt: Date.now() + 30_000,
    permittedTools: ['review_read_documents', 'review_submit_result'],
  })
  const events = new V3ExecutionEventAdapter(eventJournal, owners)
  const readCall = {
    sessionId: lease.sessionId, grantId: lease.grantId, senderKey: lease.senderKey,
    principal, tool: 'review_read_documents' as const, source,
  }
  return {
    staging, candidate, parser, parsed, source, plan, run, principal,
    ownerJournal, eventJournal, authority, owners, events, lease, readCall,
    deny: () => { current = false },
    setCaseSnapshot: (snapshot: CaseAggregateV2) => { currentCase = snapshot },
  }
}
describe('I1 A1+A2 with B1/B2 parser identity and C1 fail-closed boundaries', () => {
  test('verified physical B2 source authorizes A1 and A2 Host read without formal business promotion', async () => {
    const h = await scenario()
    const read = await readI1OwnerBoundBlock({
      staging: h.staging, parser: h.parser, mainContext: identity,
      candidateId: h.candidate.candidateId,
      events: h.events,
      mainOwnedCall: {
        sessionId: h.lease.sessionId, grantId: h.lease.grantId,
        senderKey: h.lease.senderKey, principal: h.principal,
      },
      hostRead: async actualSource => ({
        receiptId: 'test-host-read-1', actualSource, result: 'inspected one real parsed block',
      }),
    })
    expect(read.hostResult).toContain('one real parsed block')
    expect(read.classification).toBe('STAGED_ONLY')
    expect(read.fullDocumentReadProven).toBe(false)
    expect(read.delivery.event.eventKind).toBe('read-receipt-proposal')
    expect(read.delivery.event.toolReceipt?.sourceVersionId).toBe(h.candidate.documentVersionId)
    const check = h.events.proposeCheck({
      ...h.readCall, tool: 'review_submit_result',
    }, 'test-host-check-1')
    expect(check.event.eventKind).toBe('check-proposal')
    expect(check.event.sequence).toBe(2)
    const technical = new V3ExecutionCompletenessAdapter(h.plan, h.run)
    technical.recordHostOutcome({ checkKey: 'check-1', targetKey: 'target-1',
      objectKey: 'object-1', subjectId: 'subject-1',
      status: 'accepted', hostReceiptId: 'test-host-check-1' })
    expect(technical.snapshot().state).toBe('technically-complete')
    expect(h.events.pending()).toHaveLength(2)
    // These are Dev-A LOCAL delivery acknowledgements, not C2 Run ACKs.
    expect(h.events.acknowledge(check.deliveryId, check.event)).toBe(false)
    expect(h.events.acknowledge(read.deliveryId, read.delivery.event)).toBe(true)
    expect(h.events.acknowledge(check.deliveryId, check.event)).toBe(true)
    expect(h.events.pending()).toEqual([])
    expect(h.plan.schemaVersion).toBe('review-c0/1')
  })
  test('cross-source, block or scope spoofing cannot generate an A2 read proposal', async () => {
    const h = await scenario()
    for (const forged of [
      { ...h.source, blockId: 'renderer-forged-block' },
      { ...h.source, caseId: 'another-case' },
      { ...h.source, rawSha256: 'b'.repeat(64) },
    ]) {
      await expect(h.events.guardedRead({ ...h.readCall, source: forged },
        async source => ({ receiptId: 'untrusted', actualSource: source, result: '' }))).rejects.toThrow()
    }
    await expect(h.events.guardedRead(h.readCall, async () => ({
      receiptId: 'wrong-host-result', actualSource: { ...h.source, blockId: 'other' },
      result: 'forged',
    }))).rejects.toThrow()
    expect(h.events.pending()).toEqual([])
  })
  test('C1 source invalidation reflected by Main authorization rejects late event', async () => {
    const h = await scenario()
    const staleCase = {
      caseV2: { id: h.run.caseId, documents: [{ versionId: h.source.documentVersionId, active: false }] },
      observations: [],
      evidenceLinks: [{ id: 'confirmed-on-archived', documentVersionId: h.source.documentVersionId,
        status: 'confirmed' }],
    }
    // C1 is read-only; Main port must actually re-read this result.
    expect(currentSourceValidityBlockers(staleCase as never)).toContain('evidence:confirmed-on-archived')
    h.setCaseSnapshot(staleCase as unknown as CaseAggregateV2)
    await expect(h.events.guardedRead(h.readCall, async source => ({
      receiptId: 'after-source-retirement', actualSource: source, result: 'no',
    }))).rejects.toThrow()
    expect(h.events.pending()).toEqual([])
  })
  test('owner revoked after awaited Host read cannot create event and journal stays empty', async () => {
    const h = await scenario()
    let complete!: (result: { receiptId: string; actualSource: SourceIdentity; result: string }) => void
    const awaited = new Promise<{ receiptId: string; actualSource: SourceIdentity; result: string }>(
      resolve => { complete = resolve },
    )
    const task = h.events.guardedRead(h.readCall, async () => awaited)
    h.owners.revoke(h.lease.sessionId)
    complete({ receiptId: 'post-revoke', actualSource: h.source, result: 'late' })
    await expect(task).rejects.toThrow()
    expect(h.events.pending()).toEqual([])
    expect(() => h.owners.assertOrdinarySession(h.lease.sessionId)).toThrow()
  })
  test('outbox replay remains local, cold-start Owner cannot recover grant by replaying journal', async () => {
    const h = await scenario()
    const delivery = h.events.proposeRead(h.readCall, 'recorded-block')
    const reopened = new V3ExecutionEventAdapter(h.eventJournal, h.owners)
    expect(reopened.pending().map(x => x.deliveryId)).toEqual([delivery.deliveryId])
    const newProcessOwner = new V3ReviewOwnerAdapter(h.ownerJournal, h.authority)
    expect(() => newProcessOwner.assertAuthorized(h.lease.sessionId, h.lease.grantId,
      h.lease.senderKey, h.principal, 'review_read_documents', h.source)).toThrow()
    expect(reopened.acknowledge(delivery.deliveryId,
      { ...delivery.event, manifestHash: 'b'.repeat(64) })).toBe(false)
    expect(reopened.pending()).toHaveLength(1)
  })
  test('B2 staging revoked while Host awaits blocks A2 event even if independent A1 grant stays live', async () => {
    const h = await scenario()
    let release!: (receipt: { receiptId: string; actualSource: SourceIdentity; result: string }) => void
    const pendingHost = new Promise<{ receiptId: string; actualSource: SourceIdentity; result: string }>(
      resolve => { release = resolve },
    )
    let notifyEntered!: () => void
    const hostEntered = new Promise<void>(resolve => { notifyEntered = resolve })
    const attempt = readI1OwnerBoundBlock({
      staging: h.staging, parser: h.parser, mainContext: identity,
      candidateId: h.candidate.candidateId, events: h.events,
      mainOwnedCall: {
        sessionId: h.lease.sessionId, grantId: h.lease.grantId,
        senderKey: h.lease.senderKey, principal: h.principal,
      },
      hostRead: async () => {
        notifyEntered()
        return pendingHost
      },
    })
    // Do not race the async B2 parser: the Host callback must actually enter.
    await hostEntered
    h.staging.revoke(identity)
    release({ receiptId: 'late-after-b2-revoke', actualSource: h.source, result: 'stale' })
    await expect(attempt).rejects.toThrow()
    expect(h.events.pending()).toEqual([])
    // B2 staging revoke is independent of A1 grant. Confirm this test proves
    // the bridge's *new* post-await B2 boundary, rather than A1's deny path.
    expect(h.owners.assertAuthorized(h.lease.sessionId, h.lease.grantId,
      h.lease.senderKey, h.principal, 'review_read_documents', h.source).grantId)
      .toBe(h.lease.grantId)
  })

  test('forged parser block never reaches an A2 Host read or local proposal', async () => {
    const h = await scenario()
    let hostInvoked = false
    await expect(readI1OwnerBoundBlock({
      staging: h.staging, parser: h.parser, mainContext: identity,
      candidateId: h.candidate.candidateId, blockId: 'renderer-forged-block',
      events: h.events,
      mainOwnedCall: {
        sessionId: h.lease.sessionId, grantId: h.lease.grantId,
        senderKey: h.lease.senderKey, principal: h.principal,
      },
      hostRead: async actualSource => {
        hostInvoked = true
        return { receiptId: 'should-not-reach-host', actualSource, result: 'not trusted' }
      },
    })).rejects.toThrow('B2_SOURCE_BLOCK_UNVERIFIED')
    expect(hostInvoked).toBe(false)
    expect(h.events.pending()).toEqual([])
  })

})

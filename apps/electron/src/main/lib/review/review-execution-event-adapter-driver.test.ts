import { describe, expect, it } from 'bun:test'
import {
  REVIEW_C0_SCHEMA_VERSION,
  type Principal, type CanonicalPlan, type RunEvidenceIdentity, type SourceIdentity,
} from '@profer/shared'
import { V3ReviewOwnerAdapter, type OwnerPersistence } from './review-pi-owner-adapter'
import { V3ExecutionEventAdapter } from './review-execution-event-adapter'
import { V3ExecutionHostAdapter, type V3ExecutionMode } from './review-execution-event-adapter-driver'

const HASH = 'e'.repeat(64)
class MemoryStore implements OwnerPersistence {
  value: string | null = null
  read() { return this.value }
  write(v: string) { this.value = v }
}
function make(mode: V3ExecutionMode = 'direct') {
  const principal: Principal = {
    principalId: 'main-trusted', source: 'local', assurance: 'local-device',
    role: 'reviewer', sessionId: 'window1',
    scope: { caseIds: ['case1'], actions: ['review'] },
  }
  const plan: CanonicalPlan = {
    schemaVersion: REVIEW_C0_SCHEMA_VERSION,
    planId: 'plan1', fingerprint: 'fingerprint1',
    templateId: 'template1', templateVersion: 'v1', moduleDigests: [],
    bindings: Array.from({ length: 9 }, (_, i) => ({
      checkKey: 'c' + i, targetKey: 't' + i, objectKey: 'object',
      subjectId: 'subject', applicability: 'applicable' as const,
      sourceVersionIds: ['doc1'], conditionFingerprint: 'condition1',
    })),
  }
  const run: RunEvidenceIdentity = {
    schemaVersion: REVIEW_C0_SCHEMA_VERSION, runId: 'run1', caseId: 'case1',
    caseRevision: 1, planFingerprint: 'fingerprint1', templateVersion: 'v1',
    inputManifestHash: HASH, sourceVersionIds: ['doc1'],
    checkKeys: plan.bindings.map(b => b.checkKey), attemptId: 'attempt1', ownerGeneration: 1,
  }
  const source: SourceIdentity = {
    schemaVersion: REVIEW_C0_SCHEMA_VERSION, caseId: 'case1', materialId: 'mat1',
    documentVersionId: 'doc1', rawSha256: HASH, parseRevision: 'parse1',
    blockId: 'block1', location: { kind: 'paragraph', locator: '1' },
  }
  let live = true
  const owners = new V3ReviewOwnerAdapter(new MemoryStore(), {
    authorizeExecution: () => { if (!live) throw Error('not main authorized') },
    isCurrent: () => live,
  })
  const lease = owners.grant({
    principal, run, plan, sources: [source], sessionId: 'review-owner1',
    senderKey: 'real-main-window:9', expiresAt: Date.now() + 90_000,
    permittedTools: ['review_read_documents', 'review_submit_result'],
  })
  const events = new V3ExecutionEventAdapter(new MemoryStore(), owners)
  const adapter = new V3ExecutionHostAdapter(owners, events, {
    mode, sessionId: lease.sessionId, grantId: lease.grantId,
    senderKey: lease.senderKey, principal, run, plan,
  })
  return { adapter, owners, events, source, revoke: () => owners.revoke(lease.sessionId),
    denyMain: () => { live = false } }
}
const check = (i: number) => ({
  checkKey: 'c' + i, targetKey: 't' + i,
  objectKey: 'object', subjectId: 'subject',
  status: 'accepted' as const, hostReceiptId: 'receipt-' + i,
})
describe('V3 A3 shared Host adapter for all runner modes', () => {
  for (const mode of ['direct', 'hidden', 'graph', 'batch'] as const) {
    it('A-RUN-01: ' + mode + ' uses one exact C0 event contract, never a business pass', async () => {
      const h = make(mode)
      const read = await h.adapter.read(h.source, 'review_read_documents', async source => ({
        receiptId: 'host-read-1', actualSource: source, result: 'block text',
      }))
      expect(read.delivery.event.eventKind).toBe('read-receipt-proposal')
      for (let i = 0; i < 9; i++) {
        const result = await h.adapter.submit(check(i), async request => ({
          ...request, hostReceiptId: 'host-submit-' + i,
        }))
        expect(result.delivery?.event.eventKind).toBe('check-proposal')
      }
      expect(h.adapter.snapshot().accepted).toHaveLength(9)
      expect(h.adapter.closeTechnical().state).toBe('technically-complete')
      expect(h.events.pending()).toHaveLength(10)
      expect(h.events.pending().some(x => x.event.eventKind === 'stopped' ||
        x.event.eventKind === 'failed')).toBe(false)
    })
  }

  it('A-RUN-01: rejected, missing and unknown stay technical partial', async () => {
    const h = make()
    for (let i = 0; i < 8; i++) await h.adapter.submit(check(i), async request => request)
    const rejected = await h.adapter.submit(check(8), async request => ({
      ...request, status: 'rejected', hostReceiptId: undefined,
    }))
    expect(rejected.delivery).toBeNull()
    expect(h.adapter.snapshot().rejected).toHaveLength(1)
    expect(() => h.adapter.closeTechnical()).toThrow()
    expect(h.events.pending()).toHaveLength(8)
  })

  it('A-OWN-03: revoked after await cannot emit a Check proposal', async () => {
    const h = make()
    let finish!: (x: ReturnType<typeof check>) => void
    const pending = new Promise<ReturnType<typeof check>>(resolve => { finish = resolve })
    const request = h.adapter.submit(check(0), async () => pending)
    h.revoke()
    finish(check(0))
    await expect(request).rejects.toThrow()
    expect(h.events.pending()).toEqual([])
  })

  it('A-RUN-02: Host check-key substitution never becomes an accepted event', async () => {
    const h = make()
    await expect(h.adapter.submit(check(0), async requested => ({
      ...requested, checkKey: 'c8',
    }))).rejects.toThrow()
    expect(h.events.pending()).toEqual([])
  })

  it('A-RUN-02: Provider failure emits explicit technical failure, not completed', () => {
    const h = make('hidden')
    const failure = h.adapter.fail('timed-out')
    expect(failure.event.eventKind).toBe('failed')
    expect(h.adapter.snapshot().state).toBe('timed-out')
    expect(() => h.adapter.turn()).toThrow()
    expect(h.events.pending()).toHaveLength(1)
  })
})

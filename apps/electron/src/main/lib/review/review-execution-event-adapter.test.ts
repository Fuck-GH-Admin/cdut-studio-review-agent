import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'bun:test'
import {
  REVIEW_C0_SCHEMA_VERSION, type Principal, type CanonicalPlan,
  type RunEvidenceIdentity, type SourceIdentity,
} from '@profer/shared'
import {
  V3ReviewOwnerAdapter, createFileOwnerPersistence, type OwnerPersistence,
} from './review-pi-owner-adapter'
import { V3ExecutionEventAdapter } from './review-execution-event-adapter'

const HASH = 'b'.repeat(64)
class MemoryStore implements OwnerPersistence {
  value: string | null = null
  read() { return this.value }
  write(value: string) { this.value = value }
}
function start(ownerFileStore?: OwnerPersistence) {
  const ownerStore = new MemoryStore()
  const eventStore = new MemoryStore()
  const principal: Principal = {
    principalId: 'local-auth', source: 'local', assurance: 'local-device',
    role: 'reviewer', sessionId: 'window-1',
    scope: { caseIds: ['case-1'], actions: ['start-review'] },
  }
  const run: RunEvidenceIdentity = {
    schemaVersion: REVIEW_C0_SCHEMA_VERSION, caseId: 'case-1', runId: 'run-1',
    caseRevision: 1, planFingerprint: 'plan:1', templateVersion: 't1',
    inputManifestHash: HASH, sourceVersionIds: ['v1'], checkKeys: ['c1', 'c2'],
    attemptId: 'attempt-1', ownerGeneration: 1,
  }
  const plan: CanonicalPlan = {
    schemaVersion: REVIEW_C0_SCHEMA_VERSION, planId: 'p1',
    fingerprint: 'plan:1', templateId: 't1', templateVersion: 't1',
    moduleDigests: [], bindings: [
      { checkKey: 'c1', targetKey: 't1', objectKey: 'o1',
        subjectId: 's1', applicability: 'applicable', sourceVersionIds: ['v1'],
        conditionFingerprint: 'cond' },
    ],
  }
  const source: SourceIdentity = {
    schemaVersion: REVIEW_C0_SCHEMA_VERSION, caseId: 'case-1',
    materialId: 'm1', documentVersionId: 'v1', rawSha256: HASH,
    parseRevision: 'p1', blockId: 'block:1',
    location: { kind: 'paragraph', locator: '1' },
  }
  let current = true
  const authority = {
    authorizeExecution: () => { if (!current) throw new Error('Main denied') },
    isCurrent: () => current,
  }
  const owners = new V3ReviewOwnerAdapter(ownerFileStore ?? ownerStore, authority)
  const lease = owners.grant({
    principal, run, plan, sources: [source], sessionId: 'owned-session-1',
    senderKey: 'main-contents-11', expiresAt: Date.now() + 30_000,
    permittedTools: ['review_read_documents', 'review_submit_result'],
  })
  const call = {
    sessionId: lease.sessionId, grantId: lease.grantId,
    senderKey: lease.senderKey, principal, tool: 'review_read_documents' as const,
    source,
  }
  const adapter = new V3ExecutionEventAdapter(eventStore, owners)
  return { owners, adapter, call, eventStore, setCurrent: (x: boolean) => { current = x } }
}
describe('V3 A2 scoped execution proposals', () => {
  it('A-RUN-02: per-attempt ordered sequence, durable replay, exact ACK and duplicate ACK', () => {
    const h = start()
    const a = h.adapter.proposeRead(h.call, 'read-receipt-1')
    const b = h.adapter.proposeRead(h.call, 'read-receipt-2')
    expect(a.event.sequence).toBe(1)
    expect(b.event.sequence).toBe(2)
    expect(a.deliveryId).not.toEqual(b.deliveryId)
    expect(h.adapter.pending().map(x => x.deliveryId)).toEqual([a.deliveryId, b.deliveryId])
    expect(h.adapter.acknowledge(a.deliveryId, a.event)).toBe(true)
    expect(h.adapter.acknowledge(a.deliveryId, a.event)).toBe(true)
    expect(h.adapter.acknowledge('forged', b.event)).toBe(false)
    const loaded = new V3ExecutionEventAdapter(h.eventStore, h.owners)
    expect(loaded.pending().map(x => x.deliveryId)).toEqual([b.deliveryId])
    expect(loaded.acknowledge(b.deliveryId, b.event)).toBe(true)
    expect(loaded.pending()).toEqual([])
  })

  it('A-RUN-02: duplicate Host receipt is idempotent; cross-kind collision rejected', () => {
    const h = start()
    const a = h.adapter.proposeRead(h.call, 'actual-block-receipt')
    const duplicated = h.adapter.proposeRead(h.call, 'actual-block-receipt')
    expect(duplicated).toEqual(a)
    expect(h.adapter.pending()).toHaveLength(1)
    expect(h.adapter.acknowledge(a.deliveryId, a.event)).toBe(true)
    expect(h.adapter.proposeRead(h.call, 'actual-block-receipt')).toEqual(a)
    expect(h.adapter.pending()).toHaveLength(0)
    expect(() => h.adapter.proposeCheck(
      { ...h.call, tool: 'review_submit_result' }, 'actual-block-receipt')).toThrow()
    expect(h.adapter.proposeRead(h.call, 'new-source-receipt').event.sequence).toBe(2)
  })

  it('A-RUN-02: stale process outbox read and ACK reject external append', () => {
    const h = start()
    const stale = new V3ExecutionEventAdapter(h.eventStore, h.owners)
    const delivery = h.adapter.proposeRead(h.call, 'first')
    expect(() => stale.pending()).toThrow()
    expect(() => stale.acknowledge(delivery.deliveryId, delivery.event)).toThrow()
    expect(new V3ExecutionEventAdapter(h.eventStore, h.owners).pending())
      .toHaveLength(1)
  })

  it('A-OWN-03: cross-PID Owner revoke-lock bars a late event even when grant is still locally active', () => {
    const dir = mkdtempSync(join(tmpdir(), 'review-v3-a-owner-event-lock-'))
    try {
      const file = join(dir, 'owner.json')
      const h = start(createFileOwnerPersistence(file))
      // Represents another PID currently holding the Owner lock for revoke.
      writeFileSync(file + '.write-lock', 'other-writer', { flag: 'wx' })
      expect(() => h.adapter.proposeRead(h.call, 'must-not-persist')).toThrow()
      expect(h.adapter.pending()).toHaveLength(0)
      rmSync(file + '.write-lock')
      expect(h.adapter.proposeRead(h.call, 'authorized-after-lock').event.sequence).toBe(1)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('A-FAIL-02: separate file-backed outbox writers cannot lose another PID event', () => {
    const dir = mkdtempSync(join(tmpdir(), 'review-v3-a-events-'))
    try {
      const h = start()
      const store = createFileOwnerPersistence(join(dir, 'events.json'))
      const writer = new V3ExecutionEventAdapter(store, h.owners)
      const stale = new V3ExecutionEventAdapter(store, h.owners)
      const first = writer.proposeRead(h.call, 'disk-read-1')
      expect(first.event.sequence).toBe(1)
      expect(() => stale.proposeRead(h.call, 'disk-read-2')).toThrow()
      const reloaded = new V3ExecutionEventAdapter(store, h.owners)
      expect(reloaded.pending().map(x => x.deliveryId)).toEqual([first.deliveryId])
      expect(reloaded.proposeRead(h.call, 'disk-read-2').event.sequence).toBe(2)
      expect(() => writer.pending()).toThrow()
      const latest = new V3ExecutionEventAdapter(store, h.owners)
      expect(latest.pending()).toHaveLength(2)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('A-OWN-03: revoke during Host await prevents read receipt event', async () => {
    const h = start()
    let complete!: (x: { receiptId: string; actualSource: typeof h.call.source; result: string }) => void
    const waiting = new Promise<{ receiptId: string; actualSource: typeof h.call.source; result: string }>(resolve => {
      complete = resolve
    })
    const call = h.adapter.guardedRead(h.call, async () => waiting)
    h.owners.revoke(h.call.sessionId)
    complete({ receiptId: 'read-after-revoke', actualSource: h.call.source, result: 'sensitive data' })
    await expect(call).rejects.toThrow()
    expect(h.adapter.pending()).toEqual([])
  })

  it('A-PAUSE-04: a Host read pending across pause/resume cannot reuse the pre-pause grant', async () => {
    const h=start()
    let release!: (x: {receiptId:string;actualSource:typeof h.call.source;result:string})=>void
    const hostPending=new Promise<{receiptId:string;actualSource:typeof h.call.source;result:string}>(
      resolve=>{release=resolve})
    const oldRead=h.adapter.guardedRead(h.call,async()=>hostPending)
    h.owners.pause(h.call.sessionId)
    const next=h.owners.resumePaused(h.call.sessionId,h.call.grantId,
      h.call.senderKey,h.call.principal)
    expect(next.grantId).not.toBe(h.call.grantId)
    release({receiptId:'late-pre-pause-host-result',actualSource:h.call.source,result:'old'})
    await expect(oldRead).rejects.toThrow()
    expect(h.adapter.pending()).toEqual([])
    const fresh=await h.adapter.guardedRead({...h.call,grantId:next.grantId},
      async source=>({receiptId:'new-post-resume-host-result',actualSource:source,result:'new'}))
    expect(fresh.delivery.event.sequence).toBe(1)
    expect(fresh.result).toBe('new')
  })

  it('A-TOOL-01: no cross-case or forged source, no arbitrary generic tool', async () => {
    const h = start()
    const fake = { ...h.call.source, documentVersionId: 'cross-case-version' }
    expect(() => h.adapter.proposeRead({ ...h.call, source: fake }, 'fake')).toThrow()
    expect(() => h.adapter.proposeCheck({ ...h.call, tool: 'review_submit_result' },
      '')).toThrow()
    expect(() => h.adapter.proposeRead({ ...h.call, tool: 'review_submit_result' },
      'receipt')).toThrow()
    h.setCurrent(false)
    await expect(h.adapter.guardedRead(h.call, async () => ({
      receiptId: 'should-not-run', actualSource: h.call.source, result: 'content',
    }))).rejects.toThrow()
  })

  it('A-TOOL-02: Host attestation of a different document/block never becomes read coverage', async () => {
    const h = start()
    await expect(h.adapter.guardedRead(h.call, async () => ({
      receiptId: 'real-read-wrong-source',
      actualSource: { ...h.call.source, blockId: 'other-block' },
      result: 'not trusted',
    }))).rejects.toThrow()
    expect(h.adapter.pending()).toHaveLength(0)
    const good = await h.adapter.guardedRead(h.call, async source => ({
      receiptId: 'real-read-one-block',
      actualSource: source,
      result: 'one actual block',
    }))
    expect(good.delivery.event.eventKind).toBe('read-receipt-proposal')
    expect(good.delivery.event.toolReceipt?.sourceVersionId).toBe('v1')
    // C0 has no full-document coverage field: never claim full read from one block.
  })

  it('A-RUN-02: ACK cannot skip an earlier unacknowledged sequence', () => {
    const h = start()
    const a = h.adapter.proposeRead(h.call, 'first')
    const b = h.adapter.proposeRead(h.call, 'second')
    expect(h.adapter.acknowledge(b.deliveryId, b.event)).toBe(false)
    expect(h.adapter.acknowledge(a.deliveryId, a.event)).toBe(true)
    expect(h.adapter.acknowledge(b.deliveryId, b.event)).toBe(true)
  })

  it('A-RUN-01: terminal failed is technical failure, never a business pass', () => {
    const h = start()
    const a = h.adapter.proposeRead(h.call, 'actual-read')
    const b = h.adapter.failAttempt(h.call)
    expect(b.event.eventKind).toBe('failed')
    expect(b.event.toolReceipt).toBeNull()
    expect(() => h.adapter.proposeRead(h.call, 'too-late')).toThrow()
    expect(h.adapter.pending().map(x => x.event.sequence)).toEqual([1, 2])
    const replay = new V3ExecutionEventAdapter(h.eventStore, h.owners)
    expect(replay.pending().map(x => x.deliveryId)).toEqual([a.deliveryId, b.deliveryId])
  })

  it('A-FAIL-02: corrupt journal fails closed rather than silently starting a new chain', () => {
    const h = start()
    h.adapter.proposeRead(h.call, 'one')
    h.eventStore.value = (h.eventStore.value ?? '') + 'damage'
    expect(() => new V3ExecutionEventAdapter(h.eventStore, h.owners)).toThrow()
  })
})

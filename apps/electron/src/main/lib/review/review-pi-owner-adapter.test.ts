import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'bun:test'
import { C0ContractError, REVIEW_C0_SCHEMA_VERSION, type Principal, type RunEvidenceIdentity, type SourceIdentity, type CanonicalPlan } from '@profer/shared'
import {
  V3ReviewOwnerAdapter, createFileOwnerPersistence, type OwnerPersistence, type V3MainAuthority,
  type V3OwnerGrantRequest,
} from './review-pi-owner-adapter'

const HASH = 'a'.repeat(64)
class MemoryStore implements OwnerPersistence {
  raw: string | null = null
  failWrites = false
  read() { return this.raw }
  write(data: string) {
    if (this.failWrites) throw Object.assign(new Error('ENOSPC'), { code: 'ENOSPC' })
    this.raw = data
  }
}
function fixtures(caseId = 'case-a', sessionId = 'review-session-a') {
  const principal: Principal = {
    principalId: 'main:local-reviewer', source: 'local', role: 'reviewer',
    sessionId: 'main-window-1', assurance: 'local-device',
    scope: { caseIds: [caseId], actions: ['start-review'] },
  }
  const run: RunEvidenceIdentity = {
    schemaVersion: REVIEW_C0_SCHEMA_VERSION, runId: 'run-1', caseId,
    caseRevision: 2, planFingerprint: 'plan-fp-1', templateVersion: '1',
    inputManifestHash: HASH, sourceVersionIds: ['dv-1'],
    checkKeys: ['c-1', 'c-2'], attemptId: 'attempt-1', ownerGeneration: 1,
  }
  const plan: CanonicalPlan = {
    schemaVersion: REVIEW_C0_SCHEMA_VERSION, planId: 'plan-1',
    fingerprint: 'plan-fp-1', templateId: 'g01', templateVersion: '1',
    moduleDigests: ['mod-sha'], bindings: [{
      checkKey: 'c-1', targetKey: 'target-1', objectKey: 'object-1',
      subjectId: 'subject-1', applicability: 'applicable',
      sourceVersionIds: ['dv-1'], conditionFingerprint: 'cond-fp',
    }],
  }
  const source: SourceIdentity = {
    schemaVersion: REVIEW_C0_SCHEMA_VERSION, caseId, materialId: 'material-1',
    documentVersionId: 'dv-1', rawSha256: HASH, parseRevision: 'p1',
    blockId: 'b1', location: { kind: 'paragraph', locator: '1' },
  }
  const request: V3OwnerGrantRequest = {
    principal, run, plan, sources: [source], sessionId, senderKey: 'main-webcontents:11',
    expiresAt: Date.now() + 60_000,
    permittedTools: ['review_read_documents', 'review_submit_result'],
  }
  return { request, source, principal }
}
function host(store = new MemoryStore()) {
  let authorized = true
  const gate: V3MainAuthority = {
    authorizeExecution: ({ principal, senderKey }) => {
      if (!authorized || principal.role !== 'reviewer' || senderKey !== 'main-webcontents:11') {
        throw new C0ContractError('SENDER_UNTRUSTED', 'not Main bound')
      }
    },
    isCurrent: () => authorized,
  }
  return { store, adapter: new V3ReviewOwnerAdapter(store, gate), deny: () => { authorized = false }, gate }
}
describe('V3 A1 Main owner journal + isolation', () => {
  it('A-OWN-01: two reviewers/ordinary chats stay isolated', () => {
    const h = host()
    const a = fixtures()
    const b = fixtures('case-b', 'review-session-b')
    const first = h.adapter.grant(a.request)
    const second = h.adapter.grant(b.request)
    h.adapter.assertAuthorized(first.sessionId, first.grantId, first.senderKey,
      a.principal, 'review_read_documents', a.source)
    h.adapter.assertAuthorized(second.sessionId, second.grantId, second.senderKey,
      b.principal, 'review_read_documents', b.source)
    for (const id of [first.sessionId, second.sessionId]) {
      expect(() => h.adapter.assertOrdinarySession(id)).toThrow()
    }
    h.adapter.assertOrdinarySession('ordinary-chat-1')
    h.adapter.assertOrdinarySession('ordinary-chat-2')
    expect(() => h.adapter.assertAuthorized(first.sessionId, second.grantId,
      first.senderKey, a.principal, 'review_read_documents', a.source)).toThrow()
    expect(() => h.adapter.assertAuthorized(first.sessionId, first.grantId,
      first.senderKey, b.principal, 'review_read_documents', b.source)).toThrow()
  })

  it('A-OWN-02/P02: deleted session cannot revive or be ordinary after late upsert', () => {
    const h = host()
    const { request, source, principal } = fixtures()
    const lease = h.adapter.grant(request)
    h.adapter.deleteSession(lease.sessionId)
    expect(h.adapter.get(lease.sessionId)?.state).toBe('deleted')
    expect(() => h.adapter.assertOrdinarySession(lease.sessionId)).toThrow()
    expect(() => h.adapter.grant(request)).toThrow()
    expect(() => h.adapter.assertAuthorized(lease.sessionId, lease.grantId,
      lease.senderKey, principal, 'review_read_documents', source)).toThrow()
    const afterRestart = new V3ReviewOwnerAdapter(h.store, h.gate)
    expect(() => afterRestart.assertOrdinarySession(lease.sessionId)).toThrow()
  })

  it('A-FAIL-01: cold start never restores a previous process live grant', () => {
    const h = host()
    const { request, source, principal } = fixtures()
    const lease = h.adapter.grant(request)
    const newProcess = new V3ReviewOwnerAdapter(h.store, h.gate)
    expect(() => newProcess.assertAuthorized(lease.sessionId, lease.grantId,
      lease.senderKey, principal, 'review_read_documents', source)).toThrow()
    expect(newProcess.quarantineInterrupted()).toEqual([lease.sessionId])
    expect(newProcess.get(lease.sessionId)?.state).toBe('recovery-required')
    expect(() => newProcess.assertOrdinarySession(lease.sessionId)).toThrow()
  })

  it('A-FAIL-02: disk-full grant has no false ACK; revoke immediately denies in PID', () => {
    const h = host()
    const { request, source, principal } = fixtures()
    h.store.failWrites = true
    expect(() => h.adapter.grant(request)).toThrow('ENOSPC')
    expect(h.adapter.get(request.sessionId)).toBeNull()
    h.store.failWrites = false
    const lease = h.adapter.grant(request)
    h.store.failWrites = true
    expect(() => h.adapter.revoke(lease.sessionId)).toThrow('ENOSPC')
    expect(() => h.adapter.assertAuthorized(lease.sessionId, lease.grantId,
      lease.senderKey, principal, 'review_read_documents', source)).toThrow()
    h.store.failWrites = false
    const restarted = new V3ReviewOwnerAdapter(h.store, h.gate)
    expect(() => restarted.assertAuthorized(lease.sessionId, lease.grantId,
      lease.senderKey, principal, 'review_read_documents', source)).toThrow()
  })

  it('A-FAIL-01/A-FAIL-02: actual atomic journal survives read and fails closed on corruption', () => {
    const dir = mkdtempSync(join(tmpdir(), 'review-v3-a-owner-'))
    try {
      const file = join(dir, 'owner-journal.json')
      const persistence = createFileOwnerPersistence(file)
      const { gate } = host()
      const first = new V3ReviewOwnerAdapter(persistence, gate)
      const { request, source, principal } = fixtures()
      const lease = first.grant(request)
      expect(readFileSync(file, 'utf8')).toContain('v3-dev-a-owner/1')
      const second = new V3ReviewOwnerAdapter(persistence, gate)
      expect(second.get(lease.sessionId)?.state).toBe('recovery-required')
      expect(() => second.assertAuthorized(lease.sessionId, lease.grantId,
        lease.senderKey, principal, 'review_read_documents', source)).toThrow()
      expect(second.quarantineInterrupted()).toEqual([lease.sessionId])
      const persisted = readFileSync(file, 'utf8')
      expect(persisted).toContain('recovery-required')
      writeFileSync(file, persisted.slice(0, Math.max(2, persisted.length - 30)))
      expect(() => new V3ReviewOwnerAdapter(persistence, gate)).toThrow()
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('A-FAIL-02: two Main instances cannot overwrite a stale Owner journal', () => {
    const dir = mkdtempSync(join(tmpdir(), 'review-v3-a-cas-'))
    try {
      const file = join(dir, 'owner-journal.json')
      const persistence = createFileOwnerPersistence(file)
      const { gate } = host()
      const first = new V3ReviewOwnerAdapter(persistence, gate)
      const stale = new V3ReviewOwnerAdapter(persistence, gate)
      const one = fixtures()
      const two = fixtures('case-b', 'review-session-b')
      const lease = first.grant(one.request)
      expect(() => stale.assertOrdinarySession(lease.sessionId)).toThrow()
      expect(() => stale.grant(two.request)).toThrow()
      expect(() => stale.get(lease.sessionId)).toThrow()
      const reopened = new V3ReviewOwnerAdapter(persistence, gate)
      expect(reopened.get(lease.sessionId)?.state).toBe('recovery-required')
      expect(reopened.quarantineInterrupted()).toEqual([lease.sessionId])
      expect(() => first.assertAuthorized(lease.sessionId, lease.grantId,
        lease.senderKey, one.principal, 'review_read_documents', one.source)).toThrow()
      expect(new V3ReviewOwnerAdapter(persistence, gate).get(lease.sessionId)?.state)
        .toBe('recovery-required')
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('A-FAIL-02: contended inter-process lock is recovery-required, not a grant ACK', () => {
    const dir = mkdtempSync(join(tmpdir(), 'review-v3-a-locked-'))
    try {
      const file = join(dir, 'owner-journal.json')
      const persistence = createFileOwnerPersistence(file)
      const { gate } = host()
      const hostA = new V3ReviewOwnerAdapter(persistence, gate)
      writeFileSync(file + '.write-lock', 'other-process', { flag: 'wx' })
      expect(() => hostA.grant(fixtures().request)).toThrow()
      expect(hostA.get(fixtures().request.sessionId)).toBeNull()
      rmSync(file + '.write-lock')
      expect(hostA.grant(fixtures().request).state).toBe('active')
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('A-TOOL-01: cross-case version/block/path and expired or revoked grant denied', () => {
    const h = host()
    const { request, source, principal } = fixtures()
    const lease = h.adapter.grant(request)
    const blockForged = { ...source, blockId: '../other' }
    expect(() => h.adapter.assertAuthorized(lease.sessionId, lease.grantId,
      lease.senderKey, principal, 'review_read_documents', blockForged)).toThrow()
    const versionForged = { ...source, documentVersionId: 'another-dv' }
    expect(() => h.adapter.assertAuthorized(lease.sessionId, lease.grantId,
      lease.senderKey, principal, 'review_read_documents', versionForged)).toThrow()
    expect(() => h.adapter.assertAuthorized(lease.sessionId, lease.grantId,
      lease.senderKey, principal, 'review_inspect_original', source)).toThrow()
    h.deny()
    expect(() => h.adapter.assertAuthorized(lease.sessionId, lease.grantId,
      lease.senderKey, principal, 'review_read_documents', source)).toThrow()
  })
})

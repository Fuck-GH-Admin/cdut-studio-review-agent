/**
 * Integrator-I I3 Stage 2 — A R14 technical Pi witness vs C R03 Host authority.
 *
 * No Electron IPC, real Provider, actual Main admission, school publisher or
 * durable C2 business ACK is created here. The fixtures exercise the *real*
 * imported A port/engine types and frozen C registry/factory classes.
 */
import { describe, expect, test } from 'bun:test'
import {
  REVIEW_C0_SCHEMA_VERSION, type RunEvidenceIdentity, type SourceIdentity,
} from '@profer/shared'
import {
  V3APiHttpSingleRequestEngine, type V3APiHttpSingleRequestFactory,
} from './review-v3-pi-http-provider-engine'
import { V3APhysicalSDKTurnPort } from './review-v3-sdk-physical-turn-port'
import type { V3APhysicalTurnInput } from './review-v3-sdk-physical-turn-port'
import { C2MainPiAgentSessionFactory } from './review-v3-main-pi-factory'
import { C2MainPhysicalHostReceiptRegistry } from './review-v3-main-host-receipt-registry'
import type {
  C2MainHostWitness, C2MainOwnerWitness,
} from './review-v3-main-trust-port'

let serial = 0
function fixture() {
  const id = 'i3-stage2-technical-' + ++serial
  const run: RunEvidenceIdentity = {
    schemaVersion: REVIEW_C0_SCHEMA_VERSION, caseId: id,
    runId: 'run-' + id, attemptId: 'attempt-1',
    caseRevision: 1, ownerGeneration: 1,
    planFingerprint: 'a'.repeat(64), templateVersion: '1',
    inputManifestHash: 'b'.repeat(64),
    sourceVersionIds: ['v1'], checkKeys: ['check-1'],
  }
  const source: SourceIdentity = {
    schemaVersion: REVIEW_C0_SCHEMA_VERSION, caseId: id,
    materialId: 'material-1', documentVersionId: 'v1',
    rawSha256: 'c'.repeat(64), parseRevision: 'parser-1',
    blockId: 'block-1', location: { kind: 'paragraph', locator: 'p1' },
  }
  const input: V3APhysicalTurnInput = {
    run, dispatchId: 'main-dispatch-' + id, mode: 'direct',
  }
  const observer = new Map<string, C2MainHostWitness>()
  let ownerActive = true
  let ownerGrant = 'main-grant-1'
  const getCurrentOwner = (): C2MainOwnerWitness | undefined =>
    ownerActive ? {
      run, permissionGrantId: ownerGrant, active: true,
      ownerGeneration: run.ownerGeneration,
      inputManifestHash: run.inputManifestHash,
    } : undefined
  const registry = new C2MainPhysicalHostReceiptRegistry({
    getObservedPhysicalReceipt: receiptId => observer.get(receiptId),
    getCurrentOwner,
  })
  const host: C2MainHostWitness = {
    run, hostReceiptId: 'host-observed-' + id,
    permissionGrantId: ownerGrant,
    verified: {
      kind: 'read', permissionGrantId: ownerGrant,
      source, extent: 'block',
    },
  }
  return {
    run, source, input, observer, registry, host,
    revoke: () => { ownerActive = false },
    rotate: () => { ownerGrant = 'main-grant-2' },
  }
}

describe('I3 Stage2 A R14 Provider request ≠ C R03 physical Host receipt', () => {
  test('A factory contract accepts C session shape, but absent C Case never creates SDK or Host proof', async () => {
    const f = fixture()
    let called = 0
    const cFactory = new C2MainPiAgentSessionFactory({
      trustedOrigin: 'https://provider.example.test',
      assertPublishedPlan: () => { throw Error('No verified published Plan') },
      getCurrentOwner: () => undefined,
      createFreshSession: async () => {
        called++
        throw Error('No Pi Session without admitted Main Case')
      },
    })
    // This assignment is a compile-time compatibility proof for the *exact*
    // A R14 factory shape and the C R03 inert Main session builder.
    const aFactory: V3APiHttpSingleRequestFactory = {
      create: input => cFactory.create(input),
    }
    const physical = new V3APhysicalSDKTurnPort(
      new V3APiHttpSingleRequestEngine(aFactory),
    )
    await expect(physical.nextTurn(f.input)).rejects.toThrow()
    expect(called).toBe(0)
    expect(f.registry.getPhysicalHostReceipt('unobserved')).toBeUndefined()
  })

  test('A native Provider-completed turn cannot create a C read/check/terminal receipt', async () => {
    const f = fixture()
    // Synthetic SDK witness is technical and deliberately not live Provider.
    const physical = new V3APhysicalSDKTurnPort({
      invoke: async (_input, witness) => {
        witness.requestStarted('https-provider-id-1')
        witness.requestFinished({
          nativeRequestId: 'https-provider-id-1',
          nativeReceiptId: 'https-provider-id-1',
          status: 'completed',
        })
      },
    })
    const turn = await physical.nextTurn(f.input)
    expect(turn.kind).toBe('completed-turn')
    if (turn.kind !== 'completed-turn') throw Error('missing technical turn')
    expect(turn.receiptId).toBe('https-provider-id-1')
    expect(turn.run).toEqual(f.run)
    expect(f.registry.getPhysicalHostReceipt(turn.receiptId)).toBeUndefined()
    expect(() => f.registry.rememberObservedReceipt(turn.receiptId))
      .toThrow('independently observed')
    // There is no A request-id -> C Host proof synthesis path.
    expect(f.registry.getPhysicalHostReceipt(turn.receiptId)).toBeUndefined()
  })

  test('independent Main Host source admits actual scoped read but rejects Provider-ID rebound', () => {
    const f = fixture()
    f.observer.set(f.host.hostReceiptId, structuredClone(f.host))
    f.registry.rememberObservedReceipt(f.host.hostReceiptId)
    expect(f.registry.getPhysicalHostReceipt(f.host.hostReceiptId)?.verified)
      .toMatchObject({ kind: 'read', extent: 'block', source: f.source })
    // A turn receipt or assistant UUID with no Host observer cannot enter C.
    expect(() => f.registry.rememberObservedReceipt('https-provider-id-1'))
      .toThrow('independently observed')
    // A forged new ID pointing to another Host evidence must also fail.
    f.observer.set('https-provider-id-1', structuredClone(f.host))
    expect(() => f.registry.rememberObservedReceipt('https-provider-id-1'))
      .toThrow()
    const cold = new C2MainPhysicalHostReceiptRegistry({
      getObservedPhysicalReceipt: id => f.observer.get(id),
      getCurrentOwner: () => ({
        run: f.run, permissionGrantId: f.host.permissionGrantId,
        active: true, ownerGeneration: f.run.ownerGeneration,
        inputManifestHash: f.run.inputManifestHash,
      }),
    })
    // Cold Main process does not rehydrate an old Host registry entry.
    expect(cold.getPhysicalHostReceipt(f.host.hostReceiptId)).toBeUndefined()
  })

  test('Host evidence becomes unusable after Owner revoke or grant rotation', () => {
    const f = fixture()
    f.observer.set(f.host.hostReceiptId, structuredClone(f.host))
    f.registry.rememberObservedReceipt(f.host.hostReceiptId)
    f.rotate()
    expect(f.registry.getPhysicalHostReceipt(f.host.hostReceiptId)).toBeUndefined()
    const g = fixture()
    g.observer.set(g.host.hostReceiptId, structuredClone(g.host))
    g.registry.rememberObservedReceipt(g.host.hostReceiptId)
    g.revoke()
    expect(g.registry.getPhysicalHostReceipt(g.host.hostReceiptId)).toBeUndefined()
  })
})

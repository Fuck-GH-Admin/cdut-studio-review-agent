import { afterAll, describe, expect, test } from 'bun:test'
import { rmSync } from 'node:fs'
import { join } from 'node:path'
import { REVIEW_IPC_CHANNELS, type ReviewCaseV2, type TemplateVersion } from '@profer/shared'
import { setMainWindow } from '../main-window-state'
import { registerReviewIpc } from './review-ipc'
import { createAggregate, readAggregate } from './case-store-v2'
import { saveDraft, publishTemplate } from './template-store'

const root = join(import.meta.dir, '../../../../../../work/tmp', `v3-c0-ipc-${Date.now()}`)
process.env.PROFER_CONFIG_DIR = root
const handlers = (globalThis.__proferElectronTestHooks as typeof globalThis.__proferElectronTestHooks & {
  ipcMainHandlers: Map<string, (...args: unknown[]) => unknown>
}).ipcMainHandlers
const frame = { id: 1 }
const sender = { id: 91, mainFrame: frame, isDestroyed: () => false }
const event = { sender, senderFrame: frame }
const actor = { actorId: 'renderer-custom-id', actorSource: 'local', role: 'reviewer' }
const spoof = { actorId: 'spoof', actorSource: 'school', role: 'teacher' }
const caseId = 'v3-c0-local-case'
function invoke(channel: string, input: unknown, ev: unknown = event): unknown {
  const handler = handlers.get(channel)
  if (!handler) throw new Error(`Missing handler ${channel}`)
  return handler(ev, input)
}
function command(requestId: string, expectedRevision: number, payload: unknown, claimedActor: unknown = actor) {
  return { requestId, expectedRevision, actor: claimedActor, payload }
}
afterAll(() => { setMainWindow(null); rmSync(root, { recursive: true, force: true }) })

describe('C0 four actual Main IPC handler boundaries (synthetic harness)', () => {
  test('four forged school-teacher commands fail without any Receipt/revision change', async () => {
    handlers.clear()
    setMainWindow({ isDestroyed: () => false, webContents: sender } as never)
    registerReviewIpc()
    const c: ReviewCaseV2 = {
      id: caseId, templateId: 't', templateVersion: 1, title: 'synthetic', objectType: 'person',
      caseFields: {}, subjects: [{ id: 's1', type: 'item', title: 'item', fields: {}, sourceRefs: [],
        correction: 'user-confirmed', status: 'identified' }], documents: [{
        documentId: 'd1', versionId: 'd1', contentHash: 'a'.repeat(64),
        role: 'evidence', fileName: 'c0-harness-evidence.txt',
        mimeType: 'text/plain', sizeBytes: 1, assetPath: 'source-docs/d1/c0-harness-evidence.txt',
        parseRevision: 1, parseStatus: 'parsed', blocks: [], usage: 'registered', active: true,
      }],
      stage: 'draft', revision: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }
    await createAggregate(caseId, c)
    const before = JSON.stringify(readAggregate(caseId))
    const inputs = [
      [REVIEW_IPC_CHANNELS.CREATE_CASE_V2, { caseId: 'v3-c0-spoof-case', templateId: 't', version: 1,
        payload: { title: 'synthetic', fieldValues: {}, subjects: [] }, actor: spoof }],
      [REVIEW_IPC_CHANNELS.UPDATE_FIELDS_V2, { caseId, command: command('sp1', 0, { caseFieldValues: { x: 'y' } }, spoof) }],
      [REVIEW_IPC_CHANNELS.CORRECT_OBSERVATION_V2, { caseId, command: command('sp2', 0, {
        subjectId: 's1', fieldKey: 'x', value: { kind: 'text', value: 'y' }, sourceRefs: [], reason: 'r',
      }, spoof) }],
      [REVIEW_IPC_CHANNELS.SET_EVIDENCE_LINK_V2, { caseId, command: command('sp3', 0, {
        documentVersionId: 'd1', subjectIds: ['s1'], supportsFact: 'x', linkedBy: 'user',
      }, spoof) }],
    ] as const
    for (const [channel, input] of inputs) expect(() => invoke(channel, input)).toThrow('ACTOR_UNTRUSTED')
    expect(() => invoke(REVIEW_IPC_CHANNELS.UPDATE_FIELDS_V2, {
      caseId, command: command('local-role-spoof', 0, { caseFieldValues: {} },
        { actorId: 'someone', actorSource: 'local', role: 'teacher' }),
    })).toThrow('ACTOR_UNTRUSTED')
    expect(JSON.stringify(readAggregate(caseId))).toBe(before)
  })

  test('synthetic legitimate local create, idempotency and changed payload collision', async () => {
    const t: TemplateVersion = {
      templateId: 'c0-template-test', version: 1, schemaVersion: 2,
      name: 'C0 synthetic', objectType: 'person', displayName: { template: 'case' },
      fields: [], materialSlots: [], policyVersionIds: [],
      stages: [{ id: 'end', name: 'End', kind: 'finalize', executorRole: 'reviewer' }],
      outputs: [], status: 'draft', createdAt: new Date().toISOString(),
    }
    saveDraft(t)
    publishTemplate(t.templateId, t.version)
    const input = { caseId: 'v3-c0-created', templateId: t.templateId, version: 1,
      payload: { title: 'Case', fieldValues: {}, subjects: [] }, actor }
    const one = await invoke(REVIEW_IPC_CHANNELS.CREATE_CASE_V2, input) as { ok: boolean; receipt: { actor: { actorSource: string; actorId: string } } }
    expect(one.ok).toBeTrue()
    expect(one.receipt.actor).toMatchObject({ actorSource: 'local', actorId: 'local-reviewer' })
    const before = JSON.stringify(readAggregate(input.caseId))
    const two = await invoke(REVIEW_IPC_CHANNELS.CREATE_CASE_V2, input) as { ok: boolean }
    expect(two.ok).toBeTrue()
    expect(JSON.stringify(readAggregate(input.caseId))).toBe(before)
    await expect(Promise.resolve(invoke(REVIEW_IPC_CHANNELS.CREATE_CASE_V2, {
      ...input, payload: { title: 'Different', fieldValues: {}, subjects: [] },
    }))).rejects.toThrow('REQUEST_ID_COLLISION')
    expect(JSON.stringify(readAggregate(input.caseId))).toBe(before)
    // A matching payload against a different template version is NOT an
    // idempotent replay. Legacy V2 receipt hash alone cannot distinguish it.
    await expect(Promise.resolve(invoke(REVIEW_IPC_CHANNELS.CREATE_CASE_V2, {
      ...input, version: 2,
    }))).rejects.toThrow('REQUEST_ID_COLLISION')
    expect(JSON.stringify(readAggregate(input.caseId))).toBe(before)

    const concurrent = { ...input, caseId: 'v3-c0-concurrent-create' }
    const [a, b] = await Promise.all([
      invoke(REVIEW_IPC_CHANNELS.CREATE_CASE_V2, concurrent),
      invoke(REVIEW_IPC_CHANNELS.CREATE_CASE_V2, concurrent),
    ]) as [{ ok: boolean }, { ok: boolean }]
    expect(a.ok && b.ok).toBeTrue()
    expect(readAggregate(concurrent.caseId)!.receiptLog).toHaveLength(1)
  })

  test('legitimate local three writes, duplicate request, stale CAS, scope and sender reject', async () => {
    const first = await invoke(REVIEW_IPC_CHANNELS.UPDATE_FIELDS_V2, {
      caseId, command: command('f1', 0, { caseFieldValues: { label: 'hello' } }),
    }) as { ok: boolean; receipt: { actor: { actorId: string; actorSource: string } } }
    expect(first.ok).toBeTrue()
    expect(first.receipt.actor).toMatchObject({ actorId: 'local-reviewer', actorSource: 'local' })
    const replay = await invoke(REVIEW_IPC_CHANNELS.UPDATE_FIELDS_V2, {
      caseId, command: command('f1', 0, { caseFieldValues: { label: 'hello' } }),
    }) as { ok: boolean }
    expect(replay.ok).toBeTrue()
    expect(readAggregate(caseId)!.caseV2.revision).toBe(1)

    const corrected = await invoke(REVIEW_IPC_CHANNELS.CORRECT_OBSERVATION_V2, {
      caseId, command: command('o1', 1, { subjectId: 's1', fieldKey: 'name',
        value: { kind: 'text', value: 'corrected' }, sourceRefs: [], reason: 'manual' }),
    }) as { ok: boolean }
    expect(corrected.ok).toBeTrue()
    const linked = await invoke(REVIEW_IPC_CHANNELS.SET_EVIDENCE_LINK_V2, {
      caseId, command: command('l1', 2, { documentVersionId: 'd1', subjectIds: ['s1'],
        linkedBy: 'user', supportsFact: 'synthetic' }),
    }) as { ok: boolean }
    expect(linked.ok).toBeTrue()
    const snapshot = JSON.stringify(readAggregate(caseId))
    expect(await invoke(REVIEW_IPC_CHANNELS.UPDATE_FIELDS_V2, {
      caseId, command: command('f1', 3, { caseFieldValues: { label: 'different' } }),
    })).toMatchObject({ ok: false, code: 'REQUEST_ID_COLLISION' })
    expect(await invoke(REVIEW_IPC_CHANNELS.UPDATE_FIELDS_V2, {
      caseId, command: command('stale', 0, { caseFieldValues: {} }),
    })).toMatchObject({ ok: false, code: 'VERSION_CONFLICT' })
    expect(() => invoke(REVIEW_IPC_CHANNELS.UPDATE_FIELDS_V2, { caseId,
      command: { ...command('scope', 3, {}), caseId: 'other' } })).toThrow('CASE_SCOPE_FORBIDDEN')
    expect(() => invoke(REVIEW_IPC_CHANNELS.UPDATE_FIELDS_V2, {
      caseId, command: command('frame', 3, {}),
    }, { sender, senderFrame: { id: 2 } })).toThrow('SENDER_UNTRUSTED')
    expect(() => invoke(REVIEW_IPC_CHANNELS.UPDATE_FIELDS_V2, {
      caseId, command: command('window', 3, {}),
    }, { sender: { ...sender }, senderFrame: frame })).toThrow('SENDER_UNTRUSTED')
    expect(JSON.stringify(readAggregate(caseId))).toBe(snapshot)
    expect(readAggregate(caseId)!.receiptLog).toHaveLength(3)
  })
})


/**
 * I-LEASE-C-TEST-R01 / Integrator-I additive tests only.
 * Original C0 Main handler cases above remain byte-for-byte unchanged.
 * Source and Owner ports below are synthetic; actual Main sender/frame
 * authentication is exercised only through the pre-existing C0 handler.
 */
describe('I integration: B2 original → A1 Owner → A2 proposal versus actual C0 Main IPC', () => {
  async function technicalInputs(scopeId: string) {
    const [{ ReviewB2StagingService }, { ReviewB2SourceVersionAdapter },
      { compileReviewB1Plan }, { V3ReviewOwnerAdapter },
      { V3ExecutionEventAdapter }, { readI1OwnerBoundBlock }] = await Promise.all([
      import('./review-intake-adapter-v3-b2'),
      import('./review-source-version-adapter-v3-b2'),
      import('./review-template-plan-adapter-v3-b1'),
      import('./review-pi-owner-adapter'),
      import('./review-execution-event-adapter'),
      import('./review-v3-integration-i1-technical'),
    ])
    const context = {
      senderId: 91, frameId: 1, ownerId: 'synthetic-main-local',
      ownerGeneration: 1, caseCandidateId: scopeId,
    }
    const staging = new ReviewB2StagingService()
    const material = staging.stage(context, staging.grant(context).token, {
      requestId: 'i1-native-original-1', fileName: 'verified-original.txt',
      physicalSourceKey: 'synthetic-native-capability-1',
      bytes: Buffer.from('Physical source text with exact parser location'),
      role: 'supporting', subjectId: 'subject-1',
    })
    const parser = new ReviewB2SourceVersionAdapter(staging)
    const parsed = await parser.parse(context, material)
    const source = parser.sourceForBlock(context, material.candidateId,
      parsed.parseRevision, parsed.blocks[0]!.blockId)
    const author = {
      schemaVersion: 'review-b1/1', templateId: 'synthetic.template', templateVersion: '1',
      name: 'Local technical preview', purpose: 'I-only bounded contract test',
      status: 'candidate-held', fields: [],
      sources: [{ sourceId: 'original', kind: 'user-declared', documentVersionId: material.documentVersionId,
        locator: 'paragraph', recordedBy: 'synthetic-author' }],
      targets: [{ targetKey: 'target-1', objectKey: 'object-1', subjectId: 'subject-1',
        scenario: 'synthetic', fieldValues: {} }],
      modules: [{ moduleId: 'module-1', version: '1', dependsOn: [],
        checks: [{ checkKey: 'check-1', requirement: 'Host inspected exact source',
          responsibility: 'reviewer', sourceIds: ['original'], targetKeys: ['target-1'],
          condition: { kind: 'always' } }] }],
      stages: [{ stageId: 'review', role: 'reviewer', mode: 'technical' }],
      outputs: [{ outputId: 'candidate-preview', kind: 'technical' }],
    } as Parameters<typeof compileReviewB1Plan>[0]
    const descriptor = compileReviewB1Plan(author)
    const plan = descriptor.canonicalPlan
    const run = {
      schemaVersion: 'review-c0/1', runId: 'proposal-run-only', caseId: scopeId,
      caseRevision: 1, planFingerprint: plan.fingerprint,
      templateVersion: plan.templateVersion, inputManifestHash: 'a'.repeat(64),
      sourceVersionIds: [material.documentVersionId], checkKeys: ['check-1'],
      attemptId: 'synthetic-attempt', ownerGeneration: 1,
    } as Parameters<InstanceType<typeof V3ReviewOwnerAdapter>['grant']>[0]['run']
    const principal = {
      principalId: 'synthetic-main-principal', source: 'local', role: 'reviewer',
      assurance: 'local-device', sessionId: 'synthetic-main-window',
      scope: { caseIds: [scopeId], actions: ['start-review'] },
    } as Parameters<InstanceType<typeof V3ReviewOwnerAdapter>['grant']>[0]['principal']
    const memory = () => {
      let value: string | null = null
      return { read: () => value, write: (next: string) => { value = next } }
    }
    const owners = new V3ReviewOwnerAdapter(memory(), {
      authorizeExecution: ({ senderKey }) => {
        if (senderKey !== 'synthetic-main-only') throw new Error('SYNTHETIC_GRANT_DENIED')
      },
      isCurrent: () => true,
    })
    const grant = owners.grant({
      principal, run, plan, sources: [source], senderKey: 'synthetic-main-only',
      sessionId: 'synthetic-owner-session', expiresAt: Date.now() + 60_000,
      permittedTools: ['review_read_documents', 'review_submit_result'],
    })
    const events = new V3ExecutionEventAdapter(memory(), owners)
    return { material, source, context, staging, parser, principal, grant, owners,
      events, readI1OwnerBoundBlock, descriptor }
  }

  test('I-C0-IPC-01: real parser and Owner technical event do not confer forged school Main writer authority', async () => {
    const fixture = await technicalInputs('i1-main-no-false-writes')
    expect(fixture.descriptor.publicationAllowed).toBe(false)
    const read = await fixture.readI1OwnerBoundBlock({
      staging: fixture.staging, parser: fixture.parser,
      mainContext: fixture.context, candidateId: fixture.material.candidateId,
      events: fixture.events,
      mainOwnedCall: {
        sessionId: fixture.grant.sessionId, grantId: fixture.grant.grantId,
        senderKey: fixture.grant.senderKey, principal: fixture.principal,
      },
      hostRead: async actualSource => ({
        receiptId: 'synthetic-host-block-receipt', actualSource,
        result: 'only one inspected block',
      }),
    })
    expect(read.classification).toBe('STAGED_ONLY')
    expect(read.fullDocumentReadProven).toBe(false)
    expect(read.delivery.event.eventKind).toBe('read-receipt-proposal')
    expect(fixture.events.pending()).toHaveLength(1)

    // Exercise actual registered Main C0 handler, not a mock command dispatcher.
    handlers.clear()
    setMainWindow({ isDestroyed: () => false, webContents: sender } as never)
    registerReviewIpc()
    const attempt = {
      caseId,
      command: command('i1-forged-school-writer', 3,
        { caseFieldValues: { source: fixture.source.documentVersionId } }, spoof),
    }
    const before = JSON.stringify(readAggregate(caseId))
    expect(() => invoke(REVIEW_IPC_CHANNELS.UPDATE_FIELDS_V2, attempt)).toThrow('ACTOR_UNTRUSTED')
    expect(JSON.stringify(readAggregate(caseId))).toBe(before)
    // A's local event queue is not a C2 durable ReadReceipt or business ACK.
    expect(fixture.events.pending()[0]?.deliveryId).toBe(read.delivery.deliveryId)
  })

  test('I-C0-IPC-02: an original B2 block and A1 Owner grant cannot bypass Main sender-frame attestation', async () => {
    const fixture = await technicalInputs('i1-main-frame-boundary')
    const read = await fixture.readI1OwnerBoundBlock({
      staging: fixture.staging, parser: fixture.parser,
      mainContext: fixture.context, candidateId: fixture.material.candidateId,
      events: fixture.events,
      mainOwnedCall: {
        sessionId: fixture.grant.sessionId, grantId: fixture.grant.grantId,
        senderKey: fixture.grant.senderKey, principal: fixture.principal,
      },
      hostRead: async actualSource => ({
        receiptId: 'host-not-a-main-session', actualSource,
        result: 'technical-local-only',
      }),
    })
    expect(read.delivery.event.eventKind).toBe('read-receipt-proposal')
    handlers.clear()
    setMainWindow({ isDestroyed: () => false, webContents: sender } as never)
    registerReviewIpc()
    const before = JSON.stringify(readAggregate(caseId))
    const commandInput = {
      caseId, command: command('i1-false-window', 3, {
        caseFieldValues: { receiptId: read.delivery.deliveryId },
      }),
    }
    expect(() => invoke(REVIEW_IPC_CHANNELS.UPDATE_FIELDS_V2, commandInput,
      { sender: { ...sender }, senderFrame: frame })).toThrow('SENDER_UNTRUSTED')
    expect(() => invoke(REVIEW_IPC_CHANNELS.UPDATE_FIELDS_V2, commandInput,
      { sender, senderFrame: { id: frame.id + 1 } })).toThrow('SENDER_UNTRUSTED')
    expect(JSON.stringify(readAggregate(caseId))).toBe(before)
    fixture.owners.revoke(fixture.grant.sessionId)
    await expect(fixture.readI1OwnerBoundBlock({
      staging: fixture.staging, parser: fixture.parser,
      mainContext: fixture.context, candidateId: fixture.material.candidateId,
      events: fixture.events,
      mainOwnedCall: {
        sessionId: fixture.grant.sessionId, grantId: fixture.grant.grantId,
        senderKey: fixture.grant.senderKey, principal: fixture.principal,
      },
      hostRead: async actualSource => ({
        receiptId: 'revoke-late', actualSource, result: 'should-not-append',
      }),
    })).rejects.toThrow()
    expect(fixture.events.pending()).toHaveLength(1)
  })
})

/**
 * F07: persisted publication privilege, cold-read business recovery and
 * native V3 isolation from historical V2 decision/appeal writers.
 */
import { afterAll, describe, expect, test } from 'bun:test'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { Actor, CaseAggregateV2, ReviewCaseV2, ReviewRunV2 } from '@profer/shared'
import { createAggregate, readAggregate, writeAggregate } from './case-store-v2'
import { getTemplate, publishTemplate, saveDraft } from './template-store'
import { confirmT05LocalBusinessPublication, readT05LocalBusinessConfirmation, resolveT05BusinessMode } from './review-v3-t05-main-service'
import { decideWorkspaceCaseV2 } from './workspace-business-service-v2'
import { recordStageDecision, resolveAppealV2 } from './stage-workflow'
import { listRunsV2, saveRunV2 } from './run-store-v2'

const root = mkdtempSync(join(tmpdir(), 'review-f07-recovery-'))
process.env.PROFER_CONFIG_DIR = root
afterAll(() => rmSync(root, { recursive: true, force: true }))

const actor: Actor = { actorId: 'local-reviewer', actorSource: 'local', role: 'reviewer' }
let seq = 0
function makeCase(id: string): ReviewCaseV2 {
  const now = '2026-10-24T00:00:00.000Z'
  return {
    id, templateId: 'f07-template', templateVersion: 1, title: 'F07 restart fixture',
    objectType: 'person', caseFields: {}, subjects: [], documents: [],
    stage: 'submitted', revision: 0, createdAt: now, updatedAt: now,
  }
}
function ensurePublishedTemplate(): void {
  if (getTemplate('f07-template', 1)) return
  saveDraft({
    templateId: 'f07-template', version: 1, schemaVersion: 2, name: 'F07 local review',
    objectType: 'person', displayName: { template: '{{title}}' },
    fields: [], materialSlots: [], policyVersionIds: [], policyRefs: [],
    stages: [{ id: 'review', name: '审核', kind: 'manual-review', executorRole: 'reviewer' }],
    outputs: [{ id: 'decision', kind: 'approval', audience: 'reviewer' }],
    status: 'draft', createdAt: '2026-10-24T00:00:00.000Z',
  })
  publishTemplate('f07-template', 1)
}
async function seed(withNativeMarker = false): Promise<string> {
  ensurePublishedTemplate()
  const id = `f07-case-${++seq}`
  await createAggregate(id, makeCase(id))
  const aggregate = readAggregate(id)!
  aggregate.canonicalPlan = {
    planId: 'f07-plan-1', fingerprint: 'fp-1', templateId: 'f07-template',
    templateVersion: '1',
  } as CaseAggregateV2['canonicalPlan']
  if (withNativeMarker) {
    aggregate.receiptLog = [{
      requestId: 'native-create', type: 'CreateNativeWorkspaceCaseV3', payloadHash: 'fixture',
      revision: 0, at: '2026-10-24T00:00:00.000Z', summary: 'native case', actor,
    }]
  }
  writeAggregate(aggregate)
  return id
}

describe('F07 durable T05 local publication', () => {
  test('confirmation + receipt survive disk reload; duplicate request does not change revision', async () => {
    const id = await seed()
    const first = await confirmT05LocalBusinessPublication({
      caseId: id, expectedRevision: 0, requestId: 'confirm-once', reason: '本机审核员明确确认本地发布',
    })
    expect(first.ok).toBe(true)
    expect(readAggregate(id)!.caseV2.revision).toBe(1)
    const disk = JSON.parse(readFileSync(join(root, 'review-cases', id, 'state.v2.json'), 'utf8')) as CaseAggregateV2
    expect(disk.localBusinessConfirmation?.planFingerprint).toBe('fp-1')
    expect(disk.receiptLog.at(-1)?.type).toBe('ConfirmT05LocalBusinessPublication')
    expect(resolveT05BusinessMode(disk).mode).toBe('local-business')
    expect(readT05LocalBusinessConfirmation(id)).toEqual(disk.localBusinessConfirmation)
    // A fresh Bun process has no module-level cache or in-memory Map from
    // this test process. It must independently recover the same authority.
    const modulePath = join(import.meta.dir, 'review-v3-t05-main-service.ts')
    const storePath = join(import.meta.dir, 'case-store-v2.ts')
    const child = spawnSync(process.execPath, ['-e',
      `const {readAggregate}=await import(${JSON.stringify(storePath)}); const {resolveT05BusinessMode}=await import(${JSON.stringify(modulePath)}); const a=readAggregate(${JSON.stringify(id)}); console.log(JSON.stringify({mode:resolveT05BusinessMode(a).mode,fp:a.localBusinessConfirmation?.planFingerprint}));`,
    ], { cwd: process.cwd(), env: { ...process.env, PROFER_CONFIG_DIR: root },
      encoding: 'utf8', timeout: 10000 })
    expect(child.status).toBe(0)
    expect(JSON.parse(child.stdout.trim())).toEqual({ mode: 'local-business', fp: 'fp-1' })
    const replay = await confirmT05LocalBusinessPublication({
      caseId: id, expectedRevision: 0, requestId: 'confirm-once', reason: '本机审核员明确确认本地发布',
    })
    expect(replay.ok).toBe(true)
    expect(readAggregate(id)!.caseV2.revision).toBe(1)
  })

  test('plan replacement and malformed confirmation fail closed after restart', async () => {
    const id = await seed()
    const first = await confirmT05LocalBusinessPublication({
      caseId: id, expectedRevision: 0, requestId: 'confirm-frozen', reason: '人工确认本地发布',
    })
    expect(first.ok).toBe(true)
    const changed = readAggregate(id)!
    changed.canonicalPlan = { ...changed.canonicalPlan!, fingerprint: 'fp-2' }
    writeAggregate(changed)
    expect(resolveT05BusinessMode(readAggregate(id)!).mode).toBe('technical-pre-review')
    const bad = readAggregate(id)!
    bad.canonicalPlan = { ...bad.canonicalPlan!, fingerprint: 'fp-1' }
    bad.localBusinessConfirmation = { ...bad.localBusinessConfirmation!, confirmedBy: 'school-authorized' as never }
    writeAggregate(bad)
    expect(resolveT05BusinessMode(readAggregate(id)!).mode).toBe('technical-pre-review')
  })

  test('missing Plan, stale template and blank reason cannot persist privilege', async () => {
    const id = await seed()
    const noReason = await confirmT05LocalBusinessPublication({
      caseId: id, expectedRevision: 0, requestId: 'blank', reason: ' ',
    })
    expect(noReason.ok).toBe(false)
    const stale = readAggregate(id)!
    stale.canonicalPlan = { ...stale.canonicalPlan!, templateVersion: '2' }
    writeAggregate(stale)
    const denied = await confirmT05LocalBusinessPublication({
      caseId: id, expectedRevision: 0, requestId: 'stale', reason: '批准',
    })
    expect(denied.ok).toBe(false)
    expect(readAggregate(id)!.receiptLog).toHaveLength(0)
  })
})

describe('F07 legacy decisions do not rewrite native V3', () => {
  test('old final-decision, stage and appeal writers reject native marker atomically', async () => {
    const id = await seed(true)
    const before = JSON.stringify(readAggregate(id))
    const final = await decideWorkspaceCaseV2(id, {
      requestId: 'legacy-final', actor, expectedRevision: 0,
      payload: { result: 'pass', reason: '旧最终通过', basedOnRunId: 'run@rev0', inputHash: 'fake' },
    })
    expect(final.ok).toBe(false)
    if (!final.ok) expect(final.code).toBe('INVALID_TRANSITION')
    const stage = await recordStageDecision(id, {
      requestId: 'legacy-stage', actor, expectedRevision: 0,
      payload: { action: 'stage-pass', taskId: 'fake-task', reason: '旧阶段通过' },
    }, getTemplate('f07-template', 1)!)
    expect(stage.ok).toBe(false)
    if (!stage.ok) expect(stage.code).toBe('INVALID_TRANSITION')
    const appeal = await resolveAppealV2(id, {
      requestId: 'legacy-appeal', actor: { ...actor, role: 'teacher' }, expectedRevision: 0,
      payload: { appealId: 'fake-appeal', resolution: 'amend-original', reason: '旧入口改判', amendedResult: 'pass' },
    })
    expect(appeal.ok).toBe(false)
    if (!appeal.ok) expect(appeal.code).toBe('INVALID_TRANSITION')
    expect(JSON.stringify(readAggregate(id))).toBe(before)
  })

  test('material, supplement, Run and decision history are read from persisted stores', async () => {
    const id = await seed(true)
    const current = readAggregate(id)!
    current.caseV2.documents = [{
      documentId: 'doc-1', versionId: 'doc-1-v1', contentHash: 'f07-fixture-hash',
      fileName: '申请.pdf', role: 'application', mimeType: 'application/pdf',
      sizeBytes: 123, assetPath: 'source-docs/doc-1-v1/original.pdf',
      parseRevision: 1, parseStatus: 'parsed', blocks: [], usage: 'registered', active: true,
    }]
    current.supplements = [{
      id: 'sup-1', caseId: id, originFindingKeys: [], requiredElements: ['证明材料'],
      reason: '待补件', responsibleRole: 'student', status: 'open',
      responses: [], createdAt: '2026-10-24T00:00:00.000Z',
    }]
    current.decisions = [{
      id: 'dec-old', actor, scope: { kind: 'case', ids: [] }, stageId: 'review',
      result: 'return', reason: '历史退回', basedOnRunId: 'run-before-supplement',
      basedOnRevision: 0, at: '2026-10-24T00:00:00.000Z', finality: 'stage',
    }]
    writeAggregate(current)
    const run = {
      id: 'run-before-supplement', caseId: id, templateId: 'f07-template', templateVersion: 1,
      status: 'completed', checkpoints: [], checks: [], opinions: [],
      inputManifest: { hash: 'input-old', templateVersion: 1, policyVersions: [],
        documentVersions: ['doc-1-v1'], observationIds: [], evidenceLinkIds: [] },
    } as unknown as ReviewRunV2
    saveRunV2(run)
    const cold = readAggregate(id)!
    expect(cold.caseV2.documents[0]?.versionId).toBe('doc-1-v1')
    expect(cold.supplements[0]?.status).toBe('open')
    expect(cold.decisions[0]?.basedOnRunId).toBe('run-before-supplement')
    expect(listRunsV2(id).some((entry) => entry.id === run.id)).toBe(true)
  })
})

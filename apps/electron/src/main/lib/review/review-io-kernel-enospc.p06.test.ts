/**
 * U1 IO_RECOVERY: real Linux ENOSPC from /dev/full, without privileged mounts.
 * This is kernel-backed controlled fault injection, NOT full-filesystem ENOSPC
 * and NOT an independent Electron process restart acceptance.
 */
import { afterAll, describe, expect, test } from 'bun:test'
import { existsSync, mkdtempSync, readFileSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import type { TemplateVersion } from '@profer/shared'

const config = mkdtempSync(join(tmpdir(), 'p06-u1-kernel-enospc-'))
process.env.PROFER_CONFIG_DIR = config
afterAll(() => rmSync(config, { recursive: true, force: true }))

const { saveDraft, publishTemplate } = await import('./template-store')
const { createCaseFromTemplate } = await import('./application-service')
const { createReviewOwnedAgentSession } = await import('../agent-session-manager')
const { preparePiReviewRunV2, getPiReviewBindingForSession } = await import('./pi-case-review-service')
const { checkAssignment, createAssignment, revokeAssignment } = await import('./review-agent-assignment')
const { markStaleRunsInterrupted, getRunV2 } = await import('./run-store-v2')

const linuxWithFull = process.platform === 'linux' && existsSync('/dev/full')
const linuxTest = linuxWithFull ? test : test.skip

/** Prove this private path really returns the Linux kernel ENOSPC code. */
function verifyKernelFull(tempPath: string): void {
  let code: string | undefined
  try {
    writeFileSync(tempPath, 'synthetic failure probe')
  } catch (error) {
    code = (error as NodeJS.ErrnoException).code
  }
  expect(code).toBe('ENOSPC')
}

async function fixture() {
  const caseId = 'io-' + randomUUID()
  const template: TemplateVersion = {
    templateId: caseId, version: 1, schemaVersion: 2, name: '合成 I/O 恢复',
    objectType: 'person', displayName: { template: '{{title}}' }, fields: [],
    sections: [{
      id: 'all', name: '合成检查', order: 0, required: false,
      criteria: [{ id: 'check', title: '确认来源', requirement: '依据合成材料核验', execution: 'semantic', targetScope: 'case' }],
    }],
    materialSlots: [], policyVersionIds: [], policyRefs: [],
    stages: [{ id: 'review', name: '审核', kind: 'manual-review', executorRole: 'reviewer' }],
    outputs: [], status: 'draft', createdAt: new Date().toISOString(),
  }
  saveDraft(template)
  publishTemplate(caseId, 1)
  const created = await createCaseFromTemplate(template.templateId, 1, {
    title: '合成运行', fieldValues: {}, subjects: [],
  }, { actorId: 'io-local', actorSource: 'local', role: 'reviewer' }, caseId)
  if (!created.ok) throw new Error(created.message)
  const session = createReviewOwnedAgentSession({
    caseId, title: '合成内部 Owner', channelId: 'synthetic-channel', modelId: 'synthetic-model',
  })
  const prepared = preparePiReviewRunV2({
    caseId, sessionId: session.id, turnId: randomUUID(),
  })
  const allowed = () => checkAssignment({
    assignmentId: prepared.assignmentId, sessionId: session.id,
    action: 'submit-result', turnTriggeredBy: 'user',
  }).ok
  const runPath = join(config, 'review-cases', caseId, 'runs-v2', prepared.runId + '.json')
  return { caseId, session, prepared, allowed, runPath }
}

describe('P06 U1 controlled kernel ENOSPC: immutable run and assignment deny', () => {
  linuxTest('recovery saveRunV2 receives genuine OS ENOSPC: disk run stays intact, old binding denied, repair persists failure', async () => {
    const f = await fixture()
    expect(f.allowed()).toBe(true)
    expect(getPiReviewBindingForSession(f.session.id)?.runId).toBe(f.prepared.runId)
    const before = readFileSync(f.runPath)
    const tmp = f.runPath + '.tmp'
    symlinkSync('/dev/full', tmp)
    try {
      verifyKernelFull(tmp)
      // Kernel /dev/full returns ENOSPC on write: not a mocked filesystem error.
      expect(markStaleRunsInterrupted(f.caseId)).toBe(0)
      expect(readFileSync(f.runPath).equals(before)).toBe(true)
      expect(getRunV2(f.caseId, f.prepared.runId)?.status).toBe('running')
      expect(f.allowed()).toBe(false)
      expect(getPiReviewBindingForSession(f.session.id)).toBeUndefined()
    } finally {
      unlinkSync(tmp)
    }
    expect(markStaleRunsInterrupted(f.caseId)).toBe(1)
    expect(getRunV2(f.caseId, f.prepared.runId)?.status).toBe('failed')
    expect(f.allowed()).toBe(false)
    expect(getPiReviewBindingForSession(f.session.id)).toBeUndefined()
    const next = preparePiReviewRunV2({
      caseId: f.caseId, sessionId: f.session.id, turnId: randomUUID(),
    })
    expect(next.runId).not.toBe(f.prepared.runId)
    expect(getPiReviewBindingForSession(f.session.id)?.runId).toBe(next.runId)
  })

  linuxTest('revokeAssignment write hits genuine OS ENOSPC: in-memory deny survives; next successful ledger write persists revocation', async () => {
    const f = await fixture()
    expect(f.allowed()).toBe(true)
    const ledger = join(config, 'review-agent-assignments.json')
    const before = readFileSync(ledger)
    const tmp = ledger + '.tmp'
    symlinkSync('/dev/full', tmp)
    try {
      verifyKernelFull(tmp)
      let errorCode: string | undefined
      try { revokeAssignment(f.prepared.assignmentId) }
      catch (error) { errorCode = (error as NodeJS.ErrnoException).code }
      expect(errorCode).toBe('ENOSPC')
      expect(readFileSync(ledger).equals(before)).toBe(true)
      expect(f.allowed()).toBe(false)
      expect(getPiReviewBindingForSession(f.session.id)).toBeUndefined()
    } finally {
      unlinkSync(tmp)
    }
    const ordinary = createAssignment({
      sessionId: 'synthetic-ordinary-' + randomUUID(), turnId: 'synthetic-turn',
      caseId: f.caseId, actions: ['list'],
    })
    const after = JSON.parse(readFileSync(ledger, 'utf8')) as {
      assignments: Array<{ id: string; revokedAt?: string }>
    }
    expect(after.assignments.find(row => row.id === f.prepared.assignmentId)?.revokedAt).toBeTruthy()
    expect(after.assignments.find(row => row.id === ordinary.id)?.revokedAt).toBeUndefined()
    expect(f.allowed()).toBe(false)
    expect(getPiReviewBindingForSession(f.session.id)).toBeUndefined()
    expect(checkAssignment({
      assignmentId: ordinary.id, sessionId: ordinary.sessionId,
      action: 'list', turnTriggeredBy: 'user',
    }).ok).toBe(true)
  })
})

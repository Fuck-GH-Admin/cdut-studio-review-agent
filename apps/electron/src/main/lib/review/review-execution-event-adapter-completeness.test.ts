import { describe, expect, it } from 'bun:test'
import {
  REVIEW_C0_SCHEMA_VERSION, type CanonicalPlan, type RunEvidenceIdentity,
} from '@profer/shared'
import {
  V3ExecutionCompletenessAdapter, arithmeticDifference,
} from './review-execution-event-adapter-completeness'

const HASH = 'c'.repeat(64)
function fixture(unknown = false) {
  const keys = Array.from({ length: 9 }, (_, i) => 'check-' + (i + 1))
  const plan: CanonicalPlan = {
    schemaVersion: REVIEW_C0_SCHEMA_VERSION, planId: 'plan', fingerprint: 'fp',
    templateId: 't', templateVersion: '1', moduleDigests: [],
    bindings: keys.map((checkKey, i) => ({
      checkKey, targetKey: 'target-' + (i + 1), objectKey: 'obj',
      subjectId: 'subject', conditionFingerprint: 'condition',
      applicability: unknown && i === 8 ? 'unknown' as const : 'applicable' as const,
      sourceVersionIds: ['v1'],
    })),
  }
  const run: RunEvidenceIdentity = {
    schemaVersion: REVIEW_C0_SCHEMA_VERSION, runId: 'r', caseId: 'case',
    caseRevision: 1, planFingerprint: 'fp', templateVersion: '1',
    inputManifestHash: HASH, sourceVersionIds: ['v1'],
    checkKeys: keys, attemptId: 'att', ownerGeneration: 1,
  }
  return { plan, run }
}
const obs = (i: number, status: 'accepted' | 'rejected' | 'unknown' | 'missing') => ({
  checkKey: 'check-' + i, targetKey: 'target-' + i,
  objectKey: 'obj', subjectId: 'subject', status,
  hostReceiptId: status === 'accepted' ? 'real-host-' + i : undefined,
})
describe('V3 A3 exact Plan×target coverage', () => {
  it('A-RUN-01: all nine actual Host-accepted checks => technical only', () => {
    const { plan, run } = fixture()
    const a = new V3ExecutionCompletenessAdapter(plan, run)
    for (let i = 1; i <= 9; i++) a.recordHostOutcome(obs(i, 'accepted'))
    expect(a.snapshot().state).toBe('technically-complete')
    expect(a.snapshot().accepted).toHaveLength(9)
  })
  it('A-RUN-01: eight of nine, rejected and unknown cannot become completed', () => {
    const { plan, run } = fixture()
    const a = new V3ExecutionCompletenessAdapter(plan, run)
    for (let i = 1; i <= 8; i++) a.recordHostOutcome(obs(i, 'accepted'))
    expect(a.snapshot().missing).toHaveLength(1)
    expect(a.snapshot().state).toBe('partial')
    a.recordHostOutcome(obs(9, 'rejected'))
    expect(a.snapshot().rejected).toHaveLength(1)
    expect(a.snapshot().state).toBe('partial')
    const b = fixture(true)
    const u = new V3ExecutionCompletenessAdapter(b.plan, b.run)
    for (let i = 1; i <= 8; i++) u.recordHostOutcome(obs(i, 'accepted'))
    expect(u.snapshot().unknown).toHaveLength(1)
    expect(() => u.recordHostOutcome(obs(9, 'accepted'))).toThrow()
  })
  it('A-RUN-01: 24 rounds exhausted => needs-resume, never passes', () => {
    const { plan, run } = fixture()
    const a = new V3ExecutionCompletenessAdapter(plan, run)
    for (let i = 0; i < 24; i++) a.recordTurn()
    expect(a.snapshot().state).toBe('needs-resume')
    a.markFailure('timed-out')
    expect(a.snapshot().state).toBe('timed-out')
  })
  it('A-RUN-02: Provider failure/cancel do not claim accepted coverage', () => {
    const { plan, run } = fixture()
    const a = new V3ExecutionCompletenessAdapter(plan, run)
    a.markFailure('failed')
    expect(a.snapshot().state).toBe('failed')
    expect(() => a.recordHostOutcome(obs(1, 'accepted'))).toThrow()
    const b = new V3ExecutionCompletenessAdapter(plan, run)
    b.markFailure('cancelled')
    expect(b.snapshot().state).toBe('cancelled')
  })
  it('A-TOOL-01: forged check tuple or unreceipted acceptance refused', () => {
    const { plan, run } = fixture()
    const a = new V3ExecutionCompletenessAdapter(plan, run)
    expect(() => a.recordHostOutcome({ ...obs(1, 'accepted'), objectKey: 'forged' })).toThrow()
    expect(() => a.recordHostOutcome({ ...obs(1, 'accepted'), hostReceiptId: undefined })).toThrow()
  })
  it('A-RUN-01: deterministic 1680 minus 1480 diagnostic is 200', () => {
    expect(arithmeticDifference(1680, 1480)).toBe(200)
  })
})

/**
 * I0 preflight ONLY. This validates a frozen INPUT LOCK and existing C0/1
 * fail-closed semantics; it does not import Dev-A/B/C branches or wire a
 * formal CurrentCase/ReviewRun/Batch/SchoolPort write.
 */
import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import {
  REVIEW_C0_SCHEMA_VERSION, assertC0CanonicalPlan, assertC0ExecutionEvent,
  assertC0SourceIdentity, assertC0BatchBinding,
} from '@profer/shared'

interface FrozenSource {
  pr: number
  sha: string
  mergeBase: string
  changedProduction: string[]
  prCi: { runId: number; conclusion: string }
}
interface InputLock {
  lockVersion: string
  c0: { sha: string; schemaVersion: string; schemaBlob: string }
  sources: { A: FrozenSource; B: FrozenSource; C: FrozenSource }
  permissions: { CExclusivePatterns: string[]; crossBranchModifiedPathCollisions: string[]; sharedOrCOwnerFileTouchedByAB: string[] }
  crs: { CR_A_001: { decision: string }; B_CR_001: { decision: string }; CIntegrationAnchor: { sha: string | null; decision: string } }
  readiness: {
    integrationSha: string | null
    integratedGateO: string
    gateE: string
    gateL: string
    gateP: string
    noIntegratedAPlusBPlusC: boolean
    neverTreatTechnicalAsBusinessCompletion: boolean
    neverTreatCandidateAsPublished: boolean
  }
}
const lockPath = new URL(
  '../../../../../../docs/design/review-agent/acceptance/v3-integrator-i0-r01/INPUT-SNAPSHOT-LOCK.json',
  import.meta.url,
)
const lock = JSON.parse(readFileSync(lockPath, 'utf8')) as InputLock
const sha40 = /^[a-f0-9]{40}$/
const isProtected = (path: string, rule: string): boolean =>
  rule.endsWith('/**') ? path.startsWith(rule.slice(0, -3)) : path === rule

describe('I0 frozen source and ownership gate — STAGED_ONLY', () => {
  test('each exact A/B/C reference shares the immutable C0 merge-base', () => {
    expect(lock.lockVersion).toBe('v3-i0-input-lock/1')
    expect(lock.c0.schemaVersion).toBe(REVIEW_C0_SCHEMA_VERSION)
    expect(sha40.test(lock.c0.schemaBlob)).toBe(true)
    for (const source of Object.values(lock.sources)) {
      expect(sha40.test(source.sha)).toBe(true)
      expect(source.mergeBase).toBe(lock.c0.sha)
      expect(source.prCi.conclusion).toBe('success')
    }
  })
  test('A and B source patches have no overlap or C-exclusive edits', () => {
    const own = [...lock.sources.A.changedProduction, ...lock.sources.B.changedProduction]
    expect(new Set(own).size).toBe(own.length)
    expect(own.filter(p => lock.permissions.CExclusivePatterns.some(rule => isProtected(p, rule)))).toEqual([])
    expect(lock.permissions.sharedOrCOwnerFileTouchedByAB).toEqual([])
    const all = [...own, ...lock.sources.C.changedProduction]
    expect(new Set(all).size).toBe(all.length)
    expect(lock.permissions.crossBranchModifiedPathCollisions).toEqual([])
    // Negative preflight: a malicious C-owned import MUST trip the same guard.
    expect(lock.permissions.CExclusivePatterns.some(rule => isProtected(
      'apps/electron/src/main/lib/review/review-ipc.ts', rule,
    ))).toBe(true)
  })
  test('unapproved CR/anchor cannot be represented as a wired integrated snapshot', () => {
    expect(lock.crs.CR_A_001.decision).toBe('PENDING_C')
    expect(lock.crs.B_CR_001.decision).toBe('PENDING_C')
    expect(lock.crs.CIntegrationAnchor.sha).toBeNull()
    expect(lock.readiness.integrationSha).toBeNull()
    expect(lock.readiness.integratedGateO).toBe('NOT_RUN')
    expect(lock.readiness.gateE).toBe('NOT_RUN')
    expect(lock.readiness.gateL).toBe('BLOCKED_NO_AUTH')
    expect(lock.readiness.gateP).toBe('NOT_RUN')
    expect(lock.readiness.noIntegratedAPlusBPlusC).toBe(true)
    expect(lock.readiness.neverTreatTechnicalAsBusinessCompletion).toBe(true)
    expect(lock.readiness.neverTreatCandidateAsPublished).toBe(true)
  })
})

describe('I0 existing C0 runtime contract probes — not a cross-branch integration', () => {
  const h = 'a'.repeat(64)
  test('multi-object candidate remains unknown; never promoted to PASS', () => {
    const plan = {
      schemaVersion: REVIEW_C0_SCHEMA_VERSION, planId: 'p', fingerprint: h,
      templateId: 'candidate', templateVersion: '1', moduleDigests: [h],
      bindings: ['target1', 'target2'].map(targetKey => ({
        checkKey: 'ck', targetKey, objectKey: 'obj', subjectId: 'sub',
        applicability: 'unknown', sourceVersionIds: ['dv'], conditionFingerprint: h,
      })),
    }
    expect(() => assertC0CanonicalPlan(plan)).not.toThrow()
    expect(() => assertC0CanonicalPlan({ ...plan, bindings: [
      { ...plan.bindings[0], applicability: 'pass' },
    ] })).toThrow()
  })
  test('SourceIdentity requires exact current physical version, hash and locator fields', () => {
    const source = {
      schemaVersion: REVIEW_C0_SCHEMA_VERSION, caseId: 'case', materialId: 'mat',
      documentVersionId: 'dv', rawSha256: h, parseRevision: '1', blockId: 'b',
      location: { kind: 'paragraph', locator: 'p1' },
    }
    expect(() => assertC0SourceIdentity(source)).not.toThrow()
    expect(() => assertC0SourceIdentity({ ...source, documentVersionId: '' })).toThrow()
    expect(() => assertC0SourceIdentity({ ...source, rawSha256: 'forged' })).toThrow()
  })
  test('C0 tool proposal has no final check, extent or authoritative Run ACK', () => {
    const proposal = {
      schemaVersion: REVIEW_C0_SCHEMA_VERSION, attemptId: 'at', generation: 1,
      sequence: 1, eventKind: 'check-proposal',
      toolReceipt: { receiptId: 'tr', permissionGrantId: 'pg' },
      manifestHash: h,
    }
    expect(() => assertC0ExecutionEvent(proposal)).not.toThrow()
    expect('checkKey' in proposal).toBe(false)
    expect('targetKey' in proposal).toBe(false)
    expect('readExtent' in proposal).toBe(false)
    expect('formalRunAck' in proposal).toBe(false)
    expect(lock.crs.CR_A_001.decision).toBe('PENDING_C')
  })
  test('batch must reject an entry with a mismatched bound decision Run', () => {
    const entry = {
      schemaVersion: REVIEW_C0_SCHEMA_VERSION, batchAttemptId: 'ba',
      caseId: 'case', entryRunId: 'run-a', inputHash: h,
      planFingerprint: h, templateVersion: '1', revision: 2,
      decisionId: 'decision', decisionBasedOnRunId: 'run-a',
    }
    expect(() => assertC0BatchBinding(entry)).not.toThrow()
    expect(() => assertC0BatchBinding({ ...entry, decisionBasedOnRunId: 'run-b' })).toThrow()
  })
})

import { describe, expect, test } from 'bun:test'
import type { CaseAggregateV2, D2ExecutionGateV1, D2RuleBinding } from '@profer/shared'
import {
  evaluateD2GateExpression,
  validateD2ExecutionGate,
  validateD2GuardSubmission,
} from './review-d2-execution-gates'

/**
 * Deterministic D2/Pi guard regression. Unlike the independent A/B MD-Q1
 * integration suite, this test has no external checkout, environment variable,
 * material file, or model dependency and MUST run in the full PR CI.
 */
const subjectId = 'archive-item-1-copy-1'
const paper = 'd2:delegation:paper'
const electronic = 'd2:delegation:electronic'
const gate: D2ExecutionGateV1 = {
  when: { kind: 'case-stage', stages: ['submitted', 'reviewing'] },
  material: {
    provider: 'applicant',
    dueStages: ['reviewing'],
    alternatives: [paper, electronic],
  },
}
function aggregate(stage: string, opts?: {
  evidenceLinks?: Array<Record<string, unknown>>
  observations?: Array<Record<string, unknown>>
  active?: boolean
}): CaseAggregateV2 {
  return {
    caseV2: { id: 'case-1', stage, documents: [{ versionId: 'doc-v1', active: opts?.active ?? true }] },
    evidenceLinks: opts?.evidenceLinks ?? [],
    observations: opts?.observations ?? [],
  } as unknown as CaseAggregateV2
}
function mapping(g: D2ExecutionGateV1, target = subjectId): D2RuleBinding {
  return {
    checkId: 'module/copy/delegation',
    ruleId: 'd2-rule',
    sourceIds: ['synthetic-source'],
    authority: 'request-scope',
    objectKey: 'item-1/copy/op-1',
    subjectId: target,
    gate: g,
  }
}
const confirmed = (target = subjectId, supportsFact = electronic, documentVersionId = 'doc-v1') => ({
  status: 'confirmed', linkedBy: 'user', subjectId: target, supportsFact, documentVersionId,
})

describe('D2 execution gates — always-on regression (no external oracle)', () => {
  test('unknown conditions cannot be labelled false, not-applicable or compliant', () => {
    const g: D2ExecutionGateV1 = {
      when: { kind: 'confirmed-observation', fieldKey: 'delegation_valid', equals: 'yes' },
    }
    const a = aggregate('submitted')
    expect(evaluateD2GateExpression(g.when!, a, subjectId, ['doc-v1'])).toBe('unknown')
    expect(validateD2GuardSubmission(a, mapping(g), 'not-applicable', ['doc-v1'])).toContain('D2_GATE_UNKNOWN')
    expect(validateD2GuardSubmission(a, mapping(g), 'non-compliant', ['doc-v1'])).toContain('D2_GATE_UNKNOWN')
    expect(validateD2GuardSubmission(a, mapping(g), 'awaiting-confirmation', [])).toBeUndefined()
  })

  test('a confirmed observation is scoped to the exact subject and current cited version', () => {
    const g: D2ExecutionGateV1 = {
      when: { kind: 'confirmed-observation', fieldKey: 'delegation_valid', equals: 'yes' },
    }
    const fact = {
      subjectId, fieldKey: 'delegation_valid', confirmed: true, extractedBy: 'user',
      value: { kind: 'text', value: 'no' },
      sourceRefs: [{ documentVersionId: 'doc-v1' }],
    }
    expect(evaluateD2GateExpression(g.when!, aggregate('reviewing', { observations: [fact] }), subjectId, ['doc-v1'])).toBe('false')
    expect(validateD2GuardSubmission(aggregate('reviewing', { observations: [fact] }), mapping(g), 'not-applicable', ['doc-v1'])).toBeUndefined()
    expect(evaluateD2GateExpression(g.when!, aggregate('reviewing', { observations: [fact] }), 'other-person', ['doc-v1'])).toBe('unknown')
    expect(evaluateD2GateExpression(g.when!, aggregate('reviewing', { observations: [fact], active: false }), subjectId, ['doc-v1'])).toBe('unknown')
  })

  test('material is not due before the declared stage, and missing alternatives are not compliant', () => {
    expect(validateD2ExecutionGate(gate)).toEqual([])
    expect(validateD2GuardSubmission(aggregate('submitted'), mapping(gate), 'awaiting-supplement', [])).toContain('D2_MATERIAL_NOT_DUE')
    expect(validateD2GuardSubmission(aggregate('reviewing'), mapping(gate), 'compliant', [])).toContain('D2_MATERIAL_ALTERNATIVE_UNVERIFIED')
    expect(validateD2GuardSubmission(aggregate('reviewing'), mapping(gate), 'awaiting-supplement', [])).toBeUndefined()
    expect(validateD2GuardSubmission(aggregate('draft'), mapping(gate), 'not-applicable', [])).toBeUndefined()
    expect(validateD2GuardSubmission(aggregate('reviewing'), mapping(gate), 'not-applicable', [])).toContain('D2_GATE_TRUE')
  })

  test('reviewer-confirmed electronic alternative is sufficient only on its own subject and active cited document', () => {
    const a = aggregate('reviewing', { evidenceLinks: [confirmed()] })
    expect(validateD2GuardSubmission(a, mapping(gate), 'compliant', ['doc-v1'])).toBeUndefined()
    expect(validateD2GuardSubmission(a, mapping(gate), 'awaiting-supplement', ['doc-v1'])).toContain('D2_MATERIAL_ALREADY_SUPPORTED')
    expect(validateD2GuardSubmission(a, mapping(gate, 'other-person'), 'compliant', ['doc-v1'])).toContain('D2_MATERIAL_ALTERNATIVE_UNVERIFIED')
    expect(validateD2GuardSubmission(a, mapping(gate), 'compliant', [])).toContain('D2_MATERIAL_ALTERNATIVE_UNVERIFIED')
    expect(validateD2GuardSubmission(aggregate('reviewing', { evidenceLinks: [confirmed()], active: false }), mapping(gate), 'compliant', ['doc-v1'])).toContain('D2_MATERIAL_ALTERNATIVE_UNVERIFIED')
    expect(validateD2GuardSubmission(aggregate('reviewing', { evidenceLinks: [confirmed(subjectId, 'other-fact')] }), mapping(gate), 'compliant', ['doc-v1'])).toContain('D2_MATERIAL_ALTERNATIVE_UNVERIFIED')
  })

  test('authority-owned material never turns reviewer evidence into formal approval or applicant missing documents', () => {
    const authority: D2ExecutionGateV1 = {
      ...gate,
      material: { ...gate.material!, provider: 'authority' },
    }
    const a = aggregate('reviewing', { evidenceLinks: [confirmed()] })
    expect(validateD2GuardSubmission(a, mapping(authority), 'compliant', ['doc-v1'])).toContain('D2_MATERIAL_AUTHORITY_DECISION_REQUIRED')
    expect(validateD2GuardSubmission(a, mapping(authority), 'awaiting-supplement', [])).toContain('D2_MATERIAL_AUTHORITY_OWNED')
    expect(validateD2GuardSubmission(a, mapping(authority), 'awaiting-confirmation', [])).toBeUndefined()
  })

  test('unknown and malformed structured gates fail closed', () => {
    expect(validateD2ExecutionGate({ when: { kind: 'evidence-any', supportsFacts: [] } })).toContain('D2_GATE_BAD_EVIDENCE_ALTERNATIVES')
    const bad = { ...gate, inventedPrivilege: 'approved' } as unknown as D2ExecutionGateV1
    expect(validateD2ExecutionGate(bad).some(issue => issue.includes('unsupported key'))).toBe(true)
    expect(validateD2GuardSubmission(aggregate('reviewing'), mapping(bad), 'compliant', ['doc-v1'])).toContain('D2_GATE_INVALID')
  })
})

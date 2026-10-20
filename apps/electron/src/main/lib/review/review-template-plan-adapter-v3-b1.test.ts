import { describe, expect, test } from 'bun:test'
import {
  compileReviewB1Plan, diffReviewB1Plans, requireReviewB1UpgradeAck,
  verifyReviewB1Descriptor, adaptLegacyP06Plan,
  type B1AuthorDocument,
} from './review-template-plan-adapter-v3-b1'

function sample(): B1AuthorDocument {
  return {
    schemaVersion: 'review-b1/1', templateId: 'laboratory-access',
    templateVersion: '1.0.0', name: 'Laboratory access (synthetic)',
    purpose: 'Synthetic request scope; not a school policy',
    status: 'candidate-held',
    fields: [
      { key: 'purpose', label: 'Use', type: 'enum', required: true, enumValues: ['academic','other'], sourceId: 'user' },
      { key: 'participants', label: 'Persons', type: 'number', required: true, sourceId: 'user' },
    ],
    sources: [{ sourceId: 'user', kind: 'user-declared', documentVersionId: 'user-v1',
      locator: 'request:1', recordedBy: 'synthetic-author' }],
    targets: [
      { targetKey: 'first', objectKey: 'space-1', subjectId: 'subject-1',
        scenario: 'borrowing', fieldValues: { purpose: 'academic', participants: 3 } },
      { targetKey: 'second', objectKey: 'space-2', subjectId: 'subject-2',
        scenario: 'borrowing', fieldValues: { participants: 4 } },
    ],
    modules: [
      { moduleId: 'base', version: '1.0', dependsOn: [], checks: [
        { checkKey: 'purpose-check', requirement: 'Purpose must be declared',
          responsibility: 'Request owner', sourceIds: ['user'], targetKeys: ['first','second'],
          condition: { kind: 'field-equals', fieldKey: 'purpose', equals: 'academic' } },
        { checkKey: 'people-check', requirement: 'Record participants',
          responsibility: 'Request owner', sourceIds: ['user'], targetKeys: ['first','second'],
          condition: { kind: 'always' } },
      ] },
      { moduleId: 'extra', version: '1.0', dependsOn: ['base'], checks: [
        { checkKey: 'permission-check', requirement: 'Human permission review is required',
          responsibility: 'Reviewer', sourceIds: ['user'], targetKeys: ['first','second'],
          condition: { kind: 'always' } },
      ] },
    ],
    stages: [{ stageId: 'review', role: 'reviewer', mode: 'manual' }],
    outputs: [{ outputId: 'summary', kind: 'report' }],
  }
}
describe('B1 immutable C0 plan compiler (synthetic fixtures only)', () => {
  test('B-TPL-03: two objects and six exact Check x target bindings; unknown preserved', () => {
    const document = sample()
    const first = compileReviewB1Plan(document)
    const second = compileReviewB1Plan(structuredClone(document))
    expect(first).toEqual(second)
    expect(first.publicationAllowed).toBe(false)
    expect(first.canonicalPlan.schemaVersion).toBe('review-c0/1')
    expect(first.canonicalPlan.bindings).toHaveLength(6)
    expect(new Set(first.canonicalPlan.bindings.map((x) => x.checkKey + ':' + x.targetKey)).size).toBe(6)
    expect(first.canonicalPlan.bindings.find((x) => x.checkKey === 'purpose-check' && x.targetKey === 'first')?.applicability).toBe('applicable')
    expect(first.canonicalPlan.bindings.find((x) => x.checkKey === 'purpose-check' && x.targetKey === 'second')?.applicability).toBe('unknown')
    expect(first.canonicalPlan.bindings.every((x) => x.sourceVersionIds[0] === 'user-v1')).toBe(true)
    document.targets[1]!.fieldValues.purpose = 'other'
    const changed = compileReviewB1Plan(document)
    expect(changed.canonicalPlan.bindings.find((x) => x.checkKey === 'purpose-check' && x.targetKey === 'second')?.applicability).toBe('not-applicable')
    expect(changed.canonicalPlan.fingerprint).not.toBe(first.canonicalPlan.fingerprint)
  })
  test('B-TPL-01: missing dependency, dependency cycle and source omission fail closed', () => {
    const missing = sample()
    missing.modules[1]!.dependsOn = ['unavailable']
    expect(() => compileReviewB1Plan(missing)).toThrow('B1_DEPENDENCY_MISSING')
    const cycle = sample()
    cycle.modules[0]!.dependsOn = ['extra']
    expect(() => compileReviewB1Plan(cycle)).toThrow('B1_DEPENDENCY_CYCLE')
    const unbound = sample()
    unbound.modules[0]!.checks[0]!.sourceIds = []
    expect(() => compileReviewB1Plan(unbound)).toThrow('B1_OBLIGATION_INVALID')
    const duplicated = sample()
    duplicated.modules[1]!.checks[0]!.checkKey = 'purpose-check'
    expect(() => compileReviewB1Plan(duplicated)).toThrow('B1_CHECK_COLLISION')
    const lostTarget = sample()
    lostTarget.modules.forEach((m) => m.checks.forEach((c) => { c.targetKeys = ['first'] }))
    expect(() => compileReviewB1Plan(lostTarget)).toThrow('B1_UNUSED_TARGET')
  })
  test('B-TPL-01: content, old digest and source tampering never validate against frozen descriptor', () => {
    const document = sample()
    const frozen = compileReviewB1Plan(document)
    verifyReviewB1Descriptor(document, frozen)
    const altered = structuredClone(frozen)
    altered.bindingDetails[0]!.requirement = 'malicious change'
    expect(() => verifyReviewB1Descriptor(document, altered)).toThrow('B1_FROZEN_DIGEST_MISMATCH')
    const sourceChange = structuredClone(document)
    sourceChange.sources[0]!.documentVersionId = 'user-v2'
    expect(() => verifyReviewB1Descriptor(sourceChange, frozen)).toThrow('B1_FROZEN_DIGEST_MISMATCH')
  })
  test('B-TPL-02: dropped Check needs explicit ACK; prior plan remains unchanged', () => {
    const before = compileReviewB1Plan(sample())
    const changed = sample()
    changed.modules[1]!.checks = [{
      ...changed.modules[1]!.checks[0]!, targetKeys: ['first'],
    }]
    const after = compileReviewB1Plan(changed)
    const expectedKey = 'permission-check::second'
    expect(diffReviewB1Plans(before, after).requiresAck).toContain(expectedKey)
    expect(() => requireReviewB1UpgradeAck(before, after, [])).toThrow('B1_DELETED_CHECK_ACK_REQUIRED')
    expect(requireReviewB1UpgradeAck(before, after, [expectedKey]).removed).toEqual([expectedKey])
    expect(before.canonicalPlan.bindings).toHaveLength(6)
    expect(after.canonicalPlan.bindings).toHaveLength(5)
  })
  test('B-TPL-04: old P06 archive scenario is explicitly unsupported, with stable source digest', () => {
    expect(() => adaptLegacyP06Plan({ version: 'p06/1', scenario: 'archive', checkIds: ['R08','R33'] }))
      .toThrow('UNSUPPORTED_PLAN_MAPPING')
  })
})

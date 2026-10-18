import { describe, expect, test } from 'bun:test'
import type { CaseAggregateV2 } from '@profer/shared'
import { w1AssertEvidenceAssignment } from './w1-evidence-assignment'
const fixture = {
  caseV2: { id: 'd4-source', documents: [
    { versionId: 'doc-current-v1', role: 'evidence', active: true, parseStatus: 'parsed' },
    { versionId: 'doc-history-v1', role: 'evidence', active: false, parseStatus: 'parsed' },
    { versionId: 'doc-application-v1', role: 'application', active: true, parseStatus: 'parsed' },
    { versionId: 'doc-broken-v1', role: 'evidence', active: true, parseStatus: 'failed' },
  ], subjects: [{ id: 'room-a' }, { id: 'room-b' }] },
  d2RuntimePlan: { mapping: [
    { subjectId: 'room-a', evidenceCoverage: { fieldKey: 'capacity', supportsFacts: ['room-proof'] } },
    { subjectId: 'room-b', evidenceCoverage: { fieldKey: 'equipment', supportsFacts: ['gear-proof'] } },
  ] },
  evidenceLinks: [{ id: 'link-a', documentVersionId: 'doc-current-v1', subjectId: 'room-a', supportsFact: 'room-proof', status: 'candidate' }],
} as unknown as CaseAggregateV2
const valid = { documentVersionId: 'doc-current-v1', subjectId: 'room-a', supportsFact: 'room-proof', status: 'confirmed' as const }
describe('W1 per-Subject EvidenceLink safety guards', () => {
  test('same source is explicitly assignable to multiple Subjects with their own fixed fact responsibility', () => {
    expect(() => w1AssertEvidenceAssignment(fixture, valid)).not.toThrow()
    expect(() => w1AssertEvidenceAssignment(fixture, { ...valid, subjectId: 'room-b', supportsFact: 'gear-proof' })).not.toThrow()
    expect(() => w1AssertEvidenceAssignment(fixture, { ...valid, supportsFact: 'capacity' })).not.toThrow()
  })
  test('cross-Subject, stale version, wrong role and failed parse are not accepted', () => {
    expect(() => w1AssertEvidenceAssignment(fixture, { ...valid, subjectId: 'room-b' })).toThrow('W1_EVIDENCE_FACT_OUTSIDE_SUBJECT_SCOPE')
    expect(() => w1AssertEvidenceAssignment(fixture, { ...valid, subjectId: 'another-case' })).toThrow('W1_EVIDENCE_FOREIGN_SUBJECT')
    for (const source of ['doc-history-v1', 'doc-application-v1', 'doc-broken-v1']) {
      expect(() => w1AssertEvidenceAssignment(fixture, { ...valid, documentVersionId: source }))
        .toThrow('W1_EVIDENCE_SOURCE_INACTIVE_OR_UNPARSED')
    }
  })
  test('an existing link cannot be silently rebound to a different subject or document', () => {
    expect(() => w1AssertEvidenceAssignment(fixture, { ...valid, id: 'link-a' })).not.toThrow()
    expect(() => w1AssertEvidenceAssignment(fixture, { ...valid, id: 'link-a', supportsFact: 'capacity' }))
      .toThrow('W1_EVIDENCE_LINK_IDENTITY_MISMATCH')
    expect(() => w1AssertEvidenceAssignment(fixture, { ...valid, id: 'forged' }))
      .toThrow('W1_EVIDENCE_LINK_IDENTITY_MISMATCH')
  })
})

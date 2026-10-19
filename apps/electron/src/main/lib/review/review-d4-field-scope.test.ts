import { describe, expect, test } from 'bun:test'
import type { CaseAggregateV2, SourceRef } from '@profer/shared'
import { assertD4EvidenceLinkScope, assertD4ObservationScope } from './review-d4-field-form'
const source: SourceRef = { caseId: 'd4-test', documentVersionId: 'doc-evidence-v1',
  parseRevision: 3, location: { kind: 'sheet-cell', sheet: '申请清单', row: 8, column: 'AB' },
  quote: '证据条目' }
const aggregate = {
  caseV2: { id: 'd4-test',
    subjects: [{ id: 'scope-a', fields: {} }, { id: 'scope-b', fields: {} }],
    documents: [
      { versionId: 'doc-evidence-v1', role: 'evidence', active: true, parseStatus: 'parsed',
        parseRevision: 3, blocks: [{ text: '证据条目：已核对', location: source.location }] },
      { versionId: 'doc-old-v1', role: 'evidence', active: false, parseStatus: 'parsed',
        parseRevision: 2, blocks: [{ text: 'old', location: { kind: 'file' } }] },
      { versionId: 'doc-app-v1', role: 'application', active: true, parseStatus: 'parsed',
        parseRevision: 1, blocks: [{ text: 'application', location: { kind: 'file' } }] },
    ],
  },
  d2RuntimePlan: { mapping: [
    { subjectId: 'scope-a', evidenceCoverage: { fieldKey: 'approved-fact-a', supportsFacts: ['proof-a'] } },
    { subjectId: 'scope-b', evidenceCoverage: { fieldKey: 'approved-fact-b', supportsFacts: ['proof-b'] } },
  ] },
  evidenceLinks: [{ id: 'existing-a', documentVersionId: 'doc-evidence-v1',
    subjectId: 'scope-a', supportsFact: 'proof-a', status: 'confirmed' }],
} as unknown as CaseAggregateV2
describe('W1 Main authoritative D2 SourceRef and EvidenceLink scope checks', () => {
  test('a real cell coordinate and matching original version are accepted for own Subject', () => {
    expect(() => assertD4ObservationScope(aggregate, {
      subjectId: 'scope-a', fieldKey: 'approved-fact-a', sourceRefs: [source],
    })).not.toThrow()
    expect(() => assertD4EvidenceLinkScope(aggregate, {
      documentVersionId: 'doc-evidence-v1', subjectIds: ['scope-a'], supportsFact: 'proof-a',
      evidenceLinkId: 'existing-a',
    })).not.toThrow()
  })
  test('cross-case, old parse revision, fabricated cell, archived version and unsupported quote fail', () => {
    for (const bad of [
      { ...source, caseId: 'foreign' },
      { ...source, parseRevision: 2 },
      { ...source, location: { kind: 'sheet-cell' as const, sheet: '申请清单', row: 9, column: 'AB' } },
      { ...source, quote: 'this quote is not present' },
      { ...source, documentVersionId: 'doc-old-v1', parseRevision: 2 },
    ]) {
      expect(() => assertD4ObservationScope(aggregate, {
        subjectId: 'scope-a', fieldKey: 'approved-fact-a', sourceRefs: [bad],
      })).toThrow()
    }
    expect(() => assertD4ObservationScope(aggregate, { subjectId: 'scope-b',
      fieldKey: 'approved-fact-a', sourceRefs: [source] }))
      .toThrow('D4_OBSERVATION_FIELD_OUTSIDE_FROZEN_SCOPE')
    expect(() => assertD4ObservationScope(aggregate, { subjectId: 'scope-a',
      fieldKey: 'approved-fact-a', sourceRefs: [] }))
      .toThrow('D4_OBSERVATION_SOURCE_REQUIRED')
  })
  test('proof roles and link identities cannot be forged through Main', () => {
    expect(() => assertD4EvidenceLinkScope(aggregate, {
      documentVersionId: 'doc-app-v1', subjectIds: ['scope-a'], supportsFact: 'proof-a',
    })).toThrow('D4_EVIDENCE_INACTIVE_OR_FOREIGN_VERSION')
    expect(() => assertD4EvidenceLinkScope(aggregate, {
      documentVersionId: 'doc-evidence-v1', subjectIds: ['scope-b'], supportsFact: 'proof-a',
    })).toThrow('D4_EVIDENCE_FACT_OUTSIDE_SUBJECT_SCOPE')
    expect(() => assertD4EvidenceLinkScope(aggregate, {
      documentVersionId: 'doc-evidence-v1', subjectIds: ['scope-b'],
      supportsFact: 'proof-b', evidenceLinkId: 'existing-a',
    })).toThrow('D4_EVIDENCE_LINK_IDENTITY_MISMATCH')
    expect(() => assertD4EvidenceLinkScope(aggregate, {
      documentVersionId: 'doc-evidence-v1', subjectIds: ['not-a-subject'], supportsFact: 'proof-a',
    })).toThrow('D4_EVIDENCE_SUBJECT_OUTSIDE_CASE')
  })
})

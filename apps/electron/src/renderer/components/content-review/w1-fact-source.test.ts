import { describe, expect, test } from 'bun:test'
import type { CaseAggregateV2, D2RuntimePlan } from '@profer/shared'
import { w1CandidateFactKeys, w1ExplicitSourceRef, w1ObservationSources } from './w1-fact-source'

const aggregate = {
  caseV2: { id: 'd4-test-case', documents: [
    { versionId: 'd1-v1', active: true, parseStatus: 'parsed', parseRevision: 3,
      blocks: [{ blockId: 'a', text: '教室容量 120 人', location: { kind: 'paragraph', index: 2 } },
        { blockId: 'b', text: '课程名称 数学', location: { kind: 'paragraph', index: 3 } }] },
    { versionId: 'd2-v1', active: false, parseStatus: 'parsed', parseRevision: 1, blocks: [] },
    { versionId: 'd3-v1', active: true, parseStatus: 'failed', parseRevision: 0, blocks: [] },
  ] },
} as unknown as CaseAggregateV2

describe('W1 explicit subject facts and truthful V2 SourceRef precision', () => {
  test('fact suggestions are strictly scoped to D2 subject, not a global whitelist', () => {
    const plan = { mapping: [
      { subjectId: 'room-1', evidenceCoverage: { fieldKey: 'capacity', supportsFacts: ['classroom-access', 'capacity'] } },
      { subjectId: 'room-2', evidenceCoverage: { fieldKey: 'sensitive-registry', supportsFacts: ['registry-verified'] } },
      { subjectId: 'room-1' },
    ] } as D2RuntimePlan
    expect(w1CandidateFactKeys(plan, 'room-1')).toEqual(['capacity', 'classroom-access'])
    expect(w1CandidateFactKeys(plan, 'room-2')).toEqual(['sensitive-registry', 'registry-verified'])
    expect(w1CandidateFactKeys(plan, 'no-such-subject')).toEqual([])
  })
  test('explicit block yields correct parse revision and paragraph coordinates', () => {
    const ref = w1ExplicitSourceRef(aggregate, 'd1-v1', 'a')
    expect(ref).toMatchObject({ caseId: 'd4-test-case', documentVersionId: 'd1-v1',
      parseRevision: 3, location: { kind: 'paragraph', index: 2 } })
    expect(ref.quote).toContain('教室容量')
  })
  test('file-level fallbacks are honest and never invent coordinates', () => {
    expect(w1ExplicitSourceRef(aggregate, 'd1-v1').location).toEqual({ kind: 'file' })
    expect(w1ObservationSources(aggregate, [{ documentVersionId: 'd1-v1', quote: '教室容量' }])[0]!.location)
      .toEqual({ kind: 'paragraph', index: 2 })
    expect(w1ObservationSources(aggregate, [{ documentVersionId: 'd1-v1', quote: '不存在的引用' }])[0]!.location)
      .toEqual({ kind: 'file' })
    expect(w1ObservationSources(aggregate, [{ documentVersionId: 'd1-v1', quote: '教室' }])[0]!.location)
      .toEqual({ kind: 'paragraph', index: 2 })
  })
  test('rejects forged block, retired source and unparsed source', () => {
    expect(() => w1ExplicitSourceRef(aggregate, 'd1-v1', 'old-document-block')).toThrow('W1_SOURCE_BLOCK_NOT_IN_VERSION')
    expect(() => w1ExplicitSourceRef(aggregate, 'd2-v1')).toThrow('W1_SOURCE_INACTIVE_OR_UNPARSED')
    expect(() => w1ExplicitSourceRef(aggregate, 'd3-v1')).toThrow('W1_SOURCE_INACTIVE_OR_UNPARSED')
    expect(w1ObservationSources(aggregate, [{ documentVersionId: 'd2-v1', quote: 'old' }])).toEqual([])
    expect(w1ObservationSources(aggregate, [{ documentVersionId: 'd1-v1', blockId: '../untrusted' }])).toEqual([])
  })
})

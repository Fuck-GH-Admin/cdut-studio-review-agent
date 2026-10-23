/**
 * L02-U1 preparatory differential boundary checks on the integrated main tree.
 *
 * Ordinary Office Engine v2 anchors (fileId/revision/fN:pN-bN) are lookup data,
 * NOT review evidence grants (documentVersionId/parseRevision/location/quote).
 *
 * This suite tests the actual review tools, NOT the Office ingestion pipeline,
 * and makes no claim about the deferred same-stem indexing defect (#71).
 */
import { describe, expect, test } from 'bun:test'
import type { ReviewToolContext } from './review-tools'
import { buildReviewTools } from './review-tools'

function fixture(): ReviewToolContext {
  return {
    caseId: 'l02-case',
    subjects: [{
      id: 's1', type: 'item', title: '待审事项',
      fields: {}, sourceRefs: [], correction: 'ai-extracted', status: 'identified',
    }],
    documents: [
      {
        documentId: 'doc-a', versionId: 'rev-a', fileName: 'proof.docx',
        role: 'evidence', active: true, contentHash: 'sha256-a',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        sizeBytes: 123, assetPath: '', parseRevision: 1, parseStatus: 'parsed', usage: 'read',
        blocks: [{
          blockId: 'review-a-block', kind: 'text', text: '甲材料独有：成绩 2026',
          location: { kind: 'paragraph', index: 0 },
        }],
      },
      {
        documentId: 'doc-b', versionId: 'rev-b', fileName: 'proof.docx',
        role: 'evidence', active: true, contentHash: 'sha256-b',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        sizeBytes: 124, assetPath: '', parseRevision: 2, parseStatus: 'parsed', usage: 'read',
        blocks: [{
          blockId: 'review-b-block', kind: 'text', text: '乙材料独有：成绩 2027',
          location: { kind: 'paragraph', index: 1 },
        }],
      },
    ],
    rules: [{
      id: 'r-office-ref', policyVersionId: 'policy-l02', title: '材料引用一致性',
      when: { field: 'type', op: 'eq', value: 'item' }, requirement: '引用必须能够对应本案材料原文',
      targetScope: 'subject', execution: 'semantic',
      onFail: 'reject', onUnknown: 'needs-confirmation',
      sourceRefIds: [], priority: 1, confirmation: 'confirmed',
    }],
    observations: [], evidenceLinks: [], results: [], actor: 'l02-reviewer',
  } as ReviewToolContext
}

function submit(context: ReviewToolContext, sourceRefs: unknown[]) {
  const tool = buildReviewTools(context).find(item => item.name === 'submit_check')
  if (!tool) throw new Error('missing review submit_check tool')
  return tool.execute({
    ruleId: 'r-office-ref', subjectIds: ['s1'], status: 'compliant',
    reason: '以真实材料块完成核对', sourceRefs,
  })
}

describe('L02-U1 preparation: Office index must not be treated as review SourceRef', () => {
  test('same filename is allowed only with the correct review document version, block and quote', async () => {
    const context = fixture()
    const accepted = await submit(context, [{
      documentVersionId: 'rev-b', blockId: 'review-b-block', quote: '乙材料独有',
    }])
    expect(accepted.ok).toBe(true)
    expect(context.results).toHaveLength(1)
    expect(context.results[0]?.sourceRefs).toEqual([expect.objectContaining({
      caseId: 'l02-case', documentVersionId: 'rev-b', parseRevision: 2,
      quote: '乙材料独有', location: { kind: 'paragraph', index: 1 },
    })])
    // Same filename on a different registered review version remains distinct.
    const second = await submit(context, [{
      documentVersionId: 'rev-a', blockId: 'review-a-block', quote: '甲材料独有',
    }])
    expect(second.ok).toBe(true)
    expect(context.results[0]?.sourceRefs[0]?.documentVersionId).toBe('rev-a')
    expect(context.results[0]?.sourceRefs[0]?.parseRevision).toBe(1)
  })

  test('ordinary Office fileId / revision / fN anchor never authorizes a definite review result', async () => {
    const ordinaryIndex = { fileId: 'f1', revision: 'sha256-b', blockId: 'f1:p1-b0' }
    const denied: unknown[][] = [
      [{ ...ordinaryIndex, quote: '乙材料独有' }],
      [{ documentVersionId: 'f1', blockId: 'f1:p1-b0', quote: '乙材料独有' }],
      [{ documentVersionId: 'rev-b', blockId: 'f1:p1-b0', quote: '乙材料独有' }],
      [{ documentVersionId: 'rev-b', blockId: 'review-b-block', quote: '甲材料独有' }],
      [{ documentVersionId: 'rev-a', blockId: 'review-b-block', quote: '乙材料独有' }],
      [{ documentVersionId: 'rev-stale', blockId: 'review-b-block', quote: '乙材料独有' }],
    ]
    for (const candidates of denied) {
      const context = fixture()
      expect((await submit(context, candidates)).ok, JSON.stringify(candidates)).toBeFalse()
      expect(context.results).toHaveLength(0)
    }
  })

  test('ordinary fileId cannot read a version and cross-version blocks cannot create observations', async () => {
    const context = fixture()
    const tools = buildReviewTools(context)
    const read = tools.find(item => item.name === 'read_document')!
    const untrusted = await read.execute({ documentVersionId: 'f1', blockIds: ['f1:p1-b0'] })
    expect(untrusted.ok).toBeFalse()

    const record = tools.find(item => item.name === 'record_observation')!
    const refused = await record.execute({
      subjectId: 's1', fieldKey: 'result', kind: 'text', value: '乙材料独有',
      documentVersionId: 'rev-a', blockId: 'review-b-block', quote: '乙材料独有',
    })
    expect(refused.ok).toBeFalse()
    expect(context.observations).toHaveLength(0)

    const granted = await record.execute({
      subjectId: 's1', fieldKey: 'result', kind: 'text', value: '乙材料独有',
      documentVersionId: 'rev-b', blockId: 'review-b-block', quote: '乙材料独有',
    })
    expect(granted.ok).toBeTrue()
    expect(context.observations).toHaveLength(1)
    expect(context.observations[0]?.sourceRefs[0]?.documentVersionId).toBe('rev-b')
  })
})

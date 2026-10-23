/**
 * L02-U1 new-only regression: an inactive review DocumentVersion is NOT an evidence grant.
 * Distinct from #72 tests, which prove Office fN anchors are not review SourceRefs.
 * This is a candidate-bound controlled test, not a true Electron/Main/IPC E2E.
 */
import { describe, expect, test } from 'bun:test'
import type { ReviewToolContext } from './review-tools'
import { buildReviewTools } from './review-tools'

function fixture(): ReviewToolContext {
  return {
    caseId: 'u1-retired-version-case',
    subjects: [{ id: 'item-1', type: 'item', title: '证据关联', fields: {}, sourceRefs: [], correction: 'ai-extracted', status: 'identified' }],
    documents: [{
      documentId: 'doc', versionId: 'retired-v1', fileName: 'proof.docx',
      role: 'evidence', active: false, contentHash: 'content-old',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      sizeBytes: 100, assetPath: '', parseRevision: 1, parseStatus: 'parsed', usage: 'read',
      blocks: [{ blockId: 'retired-block', kind: 'text', text: '旧版本已经失效',
        location: { kind: 'paragraph', index: 0 } }],
    }, {
      documentId: 'doc', versionId: 'active-v2', fileName: 'proof.docx',
      role: 'evidence', active: true, contentHash: 'content-new',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      sizeBytes: 101, assetPath: '', parseRevision: 2, parseStatus: 'parsed', usage: 'read',
      blocks: [{ blockId: 'active-block', kind: 'text', text: '新版本真实内容',
        location: { kind: 'paragraph', index: 0 } }],
    }],
    rules: [{ id: 'r', policyVersionId: 'policy-1', title: '确认依据',
      when: { field: 'type', op: 'eq', value: 'item' }, requirement: '材料必须仍然生效',
      targetScope: 'subject', execution: 'semantic',
      onFail: 'reject', onUnknown: 'needs-confirmation',
      sourceRefIds: [], priority: 1, confirmation: 'confirmed' }],
    observations: [], evidenceLinks: [], results: [], actor: 'u1-validator',
  } as ReviewToolContext
}

function toolsFor(ctx: ReviewToolContext) {
  const all = buildReviewTools(ctx)
  const get = (name: string) => {
    const tool = all.find(x => x.name === name)
    if (!tool) throw new Error('missing review tool '+name)
    return tool
  }
  return { submit: get('submit_check'), record: get('record_observation'), link: get('link_evidence') }
}

describe('L02-U1 retired review document versions must fail closed', () => {
  test('active version remains a valid review sourceRef', async () => {
    const ctx = fixture()
    const { submit } = toolsFor(ctx)
    const out = await submit.execute({
      ruleId: 'r', subjectIds: ['item-1'], status: 'compliant', reason: '活跃材料',
      sourceRefs: [{ documentVersionId: 'active-v2', blockId: 'active-block', quote: '新版本真实内容' }],
    })
    expect(out.ok).toBeTrue()
    expect(ctx.results[0]?.sourceRefs[0]?.documentVersionId).toBe('active-v2')
    expect(ctx.results[0]?.sourceRefs[0]?.parseRevision).toBe(2)
  })
  test('retired version cannot support a definite review conclusion', async () => {
    const ctx = fixture()
    const { submit } = toolsFor(ctx)
    const out = await submit.execute({
      ruleId: 'r', subjectIds: ['item-1'], status: 'compliant', reason: '禁止旧版证据',
      sourceRefs: [{ documentVersionId: 'retired-v1', blockId: 'retired-block', quote: '旧版本已经失效' }],
    })
    expect(out.ok).toBeFalse()
    expect(ctx.results).toHaveLength(0)
  })
  test('retired version cannot create an observation or evidence link', async () => {
    const ctx = fixture()
    const { record, link } = toolsFor(ctx)
    const obs = await record.execute({
      subjectId: 'item-1', fieldKey: 'raw', kind: 'text', value: '旧版本已经失效',
      documentVersionId: 'retired-v1', blockId: 'retired-block', quote: '旧版本已经失效',
    })
    expect(obs.ok).toBeFalse()
    expect(ctx.observations).toHaveLength(0)
    const linked = await link.execute({
      documentVersionId: 'retired-v1', subjectIds: ['item-1'], supportsFact: 'old fact',
    })
    expect(linked.ok).toBeFalse()
    expect(ctx.evidenceLinks).toHaveLength(0)
  })
})

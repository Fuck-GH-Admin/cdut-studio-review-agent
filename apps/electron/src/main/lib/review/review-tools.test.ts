/**
 * 审核业务工具集单测（M3：受控写入/确定引擎接线/非法输入拒绝）
 */
import { describe, expect, test } from 'bun:test'
import type { DocumentVersion, ReviewSubject, RuleSpec } from '@profer/shared'
import { buildReviewTools, type ReviewToolContext } from './review-tools'

const context: ReviewToolContext = {
  caseId: 'c1',
  subjects: [{ id: 's1', type: 'item', title: '省赛一等奖', fields: { declaredScore: { kind: 'number', value: 6 }, category: { kind: 'text', value: 'competition' } }, sourceRefs: [], correction: 'ai-extracted', status: 'identified' }],
  documents: [{ documentId: 'd1', versionId: 'd1-v1', fileName: '证书.pdf', role: 'evidence', blocks: [{ blockId: 'b1', text: '省赛一等奖证书 省教育厅', kind: 'text' }], contentHash: 'h', mimeType: 'application/pdf', sizeBytes: 1, assetPath: '', parseRevision: 1, parseStatus: 'parsed', usage: 'read' }],
  rules: [{ id: 'r1', policyVersionId: 'p', title: '竞赛组上限', when: { field: 'category', op: 'eq', value: 'competition' }, requirement: '', targetScope: 'group', execution: 'deterministic', calculation: { valueFrom: 'confirmedLevelScore', aggregate: 'sum', cap: { value: '10.00', unit: 'point' }, allocation: 'score-desc-then-subject-id' }, onFail: 'reject', onUnknown: 'needs-confirmation', sourceRefIds: [], priority: 1, confirmation: 'confirmed' }],
  observations: [],
  evidenceLinks: [],
  results: [],
  actor: 'tester',
} as unknown as ReviewToolContext

const num = (value: number) => ({ kind: 'number' as const, value })

describe('审核业务工具集（M3）', () => {
  test('Given read_subject_field When 缺失字段 Then 返回 unknown 不当空串', async () => {
    const tools = buildReviewTools(context)
    const read = tools.find((tool) => tool.name === 'read_subject_field')!
    const known = await read.execute({ subjectId: 's1', fieldKey: 'declaredScore' })
    expect(known).toEqual({ ok: true, data: { known: true, value: 6, kind: 'number' } })
    const unknown = await read.execute({ subjectId: 's1', fieldKey: 'ghost' })
    expect(unknown).toEqual({ ok: true, data: { known: false, value: null } })
  })

  test('Given search_document_text When 检索 Then 命中块带引用坐标', async () => {
    const tools = buildReviewTools(context)
    const search = tools.find((tool) => tool.name === 'search_document_text')!
    const hits = (await search.execute({ keyword: '省赛一等奖' })) as { ok: true; data: { hits: Array<{ blockId: string }> } }
    expect(hits.data.hits[0]!.blockId).toBe('b1')
  })

  test('Given record_observation When AI 提取 Then 受控写入并建立 supersedes 链（后续值可追溯）', async () => {
    const tools = buildReviewTools(context)
    const record = tools.find((tool) => tool.name === 'record_observation')!
    const first = await record.execute({ subjectId: 's1', fieldKey: 'confirmedLevelScore', kind: 'number', value: 6, documentVersionId: 'd1-v1' })
    expect(first.ok).toBeTrue()
    const second = await record.execute({ subjectId: 's1', fieldKey: 'confirmedLevelScore', kind: 'number', value: 3, documentVersionId: 'd1-v1' })
    expect(second.ok).toBeTrue()
    expect(context.observations).toHaveLength(2)
    expect(context.observations[1]!.supersedesObservationId).toBe(context.observations[0]!.id)
  })

  test('Given submit_check（确定性规则）When 提交 Then 走确定引擎产出计算明细', async () => {
    const tools = buildReviewTools(context)
    const submit = tools.find((tool) => tool.name === 'submit_check')!
    context.subjects[0]!.fields.confirmedLevelScore = num(6)
    const outcome = (await submit.execute({ ruleId: 'r1', scope: 'group', subjectIds: ['s1'], status: 'compliant', reason: '按确认分计' })) as { ok: true; data: { status: string } }
    expect(outcome.ok).toBeTrue()
    expect(context.results).toHaveLength(1)
    expect(context.results[0]!.executedBy).toBe('deterministic')
    expect(context.results[0]!.calculation!.detailLines.join('')).toContain('组计入总额')
  })

  test('Given 非法规则/状态 When 提交 Then 如实拒绝（不静默通过）', async () => {
    const tools = buildReviewTools(context)
    const submit = tools.find((tool) => tool.name === 'submit_check')!
    expect((await submit.execute({ ruleId: 'ghost', status: 'compliant' })).ok).toBeFalse()
    expect((await submit.execute({ ruleId: 'r1', status: 'magic-status' })).ok).toBeFalse()
  })

  test('Given link_evidence When 绑定 Then candidate 状态进入上下文', async () => {
    const tools = buildReviewTools(context)
    const link = tools.find((tool) => tool.name === 'link_evidence')!
    const outcome = (await link.execute({ documentVersionId: 'd1-v1', subjectIds: ['s1'], supportsFact: '省赛一等奖' })) as { ok: true; data: { links: number } }
    expect(outcome.ok).toBeTrue()
    expect(context.evidenceLinks).toHaveLength(1)
    expect(context.evidenceLinks[0]!.status).toBe('candidate')
  })
})

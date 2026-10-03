/**
 * 批次与评委评分单测（M4，A14：独立/回避/缺评策略/共享名次；A12 版本锁）
 */
import { describe, expect, test } from 'bun:test'
import type { JudgeAssignment, JudgeRating, RubricSpec, TemplateVersion } from '@profer/shared'
import { aggregateCaseRatings, assignJudge, createBatch, finalizeRanking, submitRating } from './judging-service'

const rubric: RubricSpec = {
  dimensions: [
    { id: 'd1', name: '创新性', min: 1, max: 5, weight: 0.4 },
    { id: 'd2', name: '可行性', min: 1, max: 5, weight: 0.6 },
  ],
  totalPrecision: 2,
  missingStrategy: 'exclude',
  tieBreaker: 'shared-rank',
}

const template = { templateId: 'project-judging-v2', version: 1, status: 'published', policyVersionIds: ['p1'], name: '', schemaVersion: 2, objectType: 'project', displayName: { template: '' }, fields: [], materialSlots: [], stages: [], outputs: [], createdAt: '' } as unknown as TemplateVersion

function makeRating(assignmentId: string, reviewerId: string, d1: number | null, d2: number | null, na = false): { rating: JudgeRating } {
  return {
    rating: {
      assignmentId, reviewerId, caseId: 'c1', rubricVersion: 1,
      scores: [
        { dimensionId: 'd1', score: na ? null : d1, na: na && d1 === null },
        { dimensionId: 'd2', score: d2, na: false },
      ],
      publicFeedback: '对学生的公开意见',
      internalNotes: '内部评语',
      submittedAt: new Date().toISOString(),
    },
  }
}

describe('批次（A12）', () => {
  test('Given 已发布模板 When 创建批次 Then 锁定模板与政策版本', () => {
    const batch = createBatch(template, '2026 省赛', ['c1', 'c2'])
    expect(batch.policyVersionLock).toEqual([{ policyVersionId: 'p1', version: 1 }])
    expect(batch.templateVersion).toBe(1)
    expect(() => createBatch({ ...template, status: 'draft' }, 'x', ['c1'])).toThrow('已发布')
  })
})

describe('评分提交（A14）', () => {
  test('Given 维度越界/缺维度/block 缺评 When 提交 Then 拒绝', () => {
    expect(() => submitRating([], { assignmentId: 'a1', reviewerId: 'j1', caseId: 'c1', rubricVersion: 1, rubric, scores: [{ dimensionId: 'd1', score: 9, na: false }], publicFeedback: '' })).toThrow('超出范围')
    expect(() => submitRating([], { assignmentId: 'a1', reviewerId: 'j1', caseId: 'c1', rubricVersion: 1, rubric, scores: [{ dimensionId: 'd1', score: 4, na: false }], publicFeedback: '' })).toThrow('缺少维度评分')
    expect(() => submitRating([], { assignmentId: 'a1', reviewerId: 'j1', caseId: 'c1', rubricVersion: 1, rubric: { ...rubric, missingStrategy: 'block' }, scores: [{ dimensionId: 'd1', score: 4, na: false }, { dimensionId: 'd2', score: null, na: false }], publicFeedback: '' })).toThrow('block')
  })

  test('Given na+给分同时存在 When 提交 Then 拒绝', () => {
    expect(() => submitRating([], { assignmentId: 'a1', reviewerId: 'j1', caseId: 'c1', rubricVersion: 1, rubric, scores: [{ dimensionId: 'd1', score: 4, na: true }, { dimensionId: 'd2', score: 4, na: false }], publicFeedback: '' })).toThrow('N/A')
  })
})

describe('汇总（A14/D05）', () => {
  const assignments: JudgeAssignment[] = [
    { id: 'a1', caseId: 'c1', reviewerId: 'j1', rubricVersion: 1, recused: false, status: 'submitted' },
    { id: 'a2', caseId: 'c1', reviewerId: 'j2', rubricVersion: 1, recused: false, status: 'submitted' },
    { id: 'a3', caseId: 'c1', reviewerId: 'j3', rubricVersion: 1, recused: true, recuseReason: '师生关系', status: 'submitted' },
  ]
  const ratings = [makeRating('a1', 'j1', 4, 5).rating, makeRating('a2', 'j2', 5, 5).rating]

  test('Given 回避评委与两位有效评分 When 汇总 Then 回避排除、均值加权、精度 2', () => {
    const aggregate = aggregateCaseRatings(rubric, assignments, ratings, 'c1')
    expect(aggregate.dimensions.find((dimension) => dimension.dimensionId === 'd1')!.voters).toBe(2)
    expect(aggregate.total).toBeCloseTo((4.5 * 0.4 + 5 * 0.6), 2) // 4.80
  })

  test('Given block 策略且缺评 When 汇总 Then total=null（不定稿）', () => {
    const oneAssigned = [assignments[0]!, assignments[1]!]
    const oneRating = [ratings[0]!]
    const aggregate = aggregateCaseRatings({ ...rubric, missingStrategy: 'block' }, oneAssigned, oneRating, 'c1')
    expect(aggregate.total).toBeNull()
  })

  test('Given 同分 When 排名 Then 共享名次（1,1,3）', () => {
    const a = (caseId: string, total: number | null) => ({ caseId, total, dimensions: [], naDimensions: [] })
    const ranking = finalizeRanking([a('c1', 4.8), a('c2', 4.8), a('c3', 4.2)], rubric)
    expect(ranking.map((entry) => entry.rank)).toEqual([1, 1, 3])
  })
})

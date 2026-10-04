/**
 * 报告与离线往返单测（M4，A15/C01/C02：内部分列/哈希校验/版本冲突）
 */
import { describe, expect, test } from 'bun:test'
import type { BusinessDecision, ReviewCaseV2, RubricSpec, SupplementRequest } from '@profer/shared'
import { buildCaseFeedback, buildRatingMatrix, exportHandoffPackage, importHandoffPackage, type CaseAggregate, type RatingMatrixRow } from './report-service-v2'

describe('案卷反馈（A15）', () => {
  const caseV2 = {
    id: 'c1', title: '张三综测', subjects: [{ id: 's1', title: '省赛一等奖', fields: { declaredScore: { kind: 'number', value: 6 }, internalMemo: { kind: 'text', value: '内部备注' } }, sourceRefs: [], correction: 'user-confirmed', status: 'confirmed' }],
  } as unknown as ReviewCaseV2
  const decisions: BusinessDecision[] = [{ id: 'd1', actor: { actorId: 't', actorSource: 'local', role: 'teacher' }, scope: { kind: 'case', ids: [] }, stageId: 's', result: 'pass', reason: '核对通过', basedOnRunId: 'r1', basedOnRevision: 1, at: '2026-01-01T00:00:00Z' }]
  const supplements: SupplementRequest[] = [{ id: 'sp1', caseId: 'c1', originFindingKeys: [], requiredElements: ['等级'], reason: '补等级证明', responsibleRole: 'student', status: 'open', responses: [], createdAt: '' }]

  test('Given internal 字段与公开字段混合 When 生成学生反馈 Then 仅 public 字段', () => {
    const feedback = buildCaseFeedback(caseV2, decisions, supplements, { declaredScore: 'public', internalMemo: 'internal' })
    expect(feedback.items[0]!.publicFields['declaredScore']).toBe(6)
    expect(feedback.items[0]!.publicFields['internalMemo']).toBeUndefined()
    expect(feedback.decision!.result).toBe('pass')
  })
})

describe('评委矩阵（A14/A15）', () => {
  const rubric: RubricSpec = { dimensions: [{ id: 'd1', name: '创新', min: 1, max: 5, weight: 1 }], totalPrecision: 2, missingStrategy: 'exclude' }
  test('Given 含内部评语的评分 When 生成矩阵 Then 内部列与公开列分列', () => {
    const aggregate: CaseAggregate = { caseId: 'c1', total: 4.5, naDimensions: [], dimensions: [{ dimensionId: 'd1', name: '创新', voters: 1, average: 4.5, weighted: 4.5 }] }
    const rows: RatingMatrixRow[] = buildRatingMatrix(
      rubric,
      [{ id: 'a1', caseId: 'c1', reviewerId: 'j1', rubricVersion: 1, recused: false, status: 'submitted' }],
      [{ assignmentId: 'a1', reviewerId: 'j1', caseId: 'c1', rubricVersion: 1, scores: [], publicFeedback: '表现优秀', internalNotes: '倾向照顾', submittedAt: '' }],
      [aggregate],
      [{ caseId: 'c1', total: 4.5, rank: 1 }],
    )
    expect(rows[0]!.internalNotes[0]!.note).toBe('倾向照顾')
    expect(rows[0]!.publicFeedback[0]!.feedback).toBe('表现优秀')
    expect(rows[0]!.rank).toBe(1)
  })
})

describe('离线往返（C01/C02）', () => {
  const payload = { caseId: 'c1', decision: 'pass', externalRevision: 3 }

  test('Given 导出包 When 原样导入 Then 哈希通过并产出 accepted 回执', () => {
    const pkg = exportHandoffPackage(payload)
    const outcome = importHandoffPackage(pkg, 3)
    expect(outcome.ok).toBeTrue()
  })

  test('Given 包被篡改 When 导入 Then HASH_MISMATCH', () => {
    const pkg = exportHandoffPackage(payload)
    const tampered = { ...pkg, payload: { ...payload, decision: 'reject' } }
    const outcome = importHandoffPackage(tampered, 3)
    expect(outcome.ok).toBeFalse()
    if (!outcome.ok) expect(outcome.code).toBe('HASH_MISMATCH')
  })

  test('Given 外部版本已推进 When 导入 Then CONFLICT（C02）', () => {
    const pkg = exportHandoffPackage(payload)
    const outcome = importHandoffPackage(pkg, 4)
    expect(outcome.ok).toBeFalse()
    if (!outcome.ok) expect(outcome.code).toBe('CONFLICT')
  })
})

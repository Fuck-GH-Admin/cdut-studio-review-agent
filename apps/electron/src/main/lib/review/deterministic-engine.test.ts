/**
 * 确定计算引擎单测（M2，04 §3 固定样本 D04/D05 + 三值未知）
 */
import { describe, expect, test } from 'bun:test'
import type { RuleSpec } from '@profer/shared'
import { computeGroupScore, evaluateCondition, type CalcInput } from './deterministic-engine'

/** D04 规则：同 event 择高 → 聚合 → 组上限 10 → 高分优先分配 */
const d04Rule: RuleSpec = {
  id: 'competition-group-score', policyVersionId: 'p1', title: '竞赛组上限', when: { field: 'category', op: 'eq', value: 'competition' },
  requirement: '', targetScope: 'group', groupBy: ['applicantId'],
  execution: 'deterministic',
  calculation: { deduplicateBy: ['eventId'], select: 'highest-eligible-score', valueFrom: 'confirmedLevelScore', aggregate: 'sum', cap: { value: '10.00', unit: 'point' }, allocation: 'score-desc-then-subject-id' },
  onFail: 'reject', onUnknown: 'needs-confirmation', sourceRefIds: [], priority: 1, confirmation: 'confirmed',
}

const d04Inputs: CalcInput[] = [
  { subjectId: 's1', fields: { confirmedLevelScore: { value: 6, known: true }, eventId: { value: 'E1', known: true } } },
  { subjectId: 's2', fields: { confirmedLevelScore: { value: 3, known: true }, eventId: { value: 'E1', known: true } } },
  { subjectId: 's3', fields: { confirmedLevelScore: { value: 5, known: true }, eventId: { value: 'E2', known: true } } },
]

describe('computeGroupScore（D04 择高+上限）', () => {
  test('Given E1 两证 6/3、E2=5、上限 10 When 计算 Then 总 10，E1=6/E2=4，舍弃项 0（重放一致）', () => {
    const first = computeGroupScore(d04Rule, d04Inputs)
    expect(first.status).toBe('compliant')
    expect(first.total).toBe('10.00')
    const alloc = Object.fromEntries(first.allocation.map((a) => [a.subjectId, a.allocated]))
    expect(alloc['s1']).toBe('6.00') // E1 择高 6
    expect(alloc['s2']).toBe('0.00') // 同 E1 被去重舍弃
    expect(alloc['s3']).toBe('4.00') // 上限余量 4
    expect(first.detailLines.some((line) => line.includes('去重舍弃'))).toBeTrue()
    // 重放一致
    expect(JSON.stringify(computeGroupScore(d04Rule, d04Inputs))).toBe(JSON.stringify(first))
  })

  test('Given 确认分值缺失 When 计算 Then 整组待确认且未知不当零（D05 语义）', () => {
    const outcome = computeGroupScore(d04Rule, [
      { subjectId: 's1', fields: { confirmedLevelScore: { value: 6, known: true }, eventId: { value: 'E1', known: true } } },
      { subjectId: 's4', fields: { confirmedLevelScore: { value: null, known: false }, eventId: { value: 'E2', known: true } } },
    ])
    expect(outcome.status).toBe('awaiting-confirmation')
    expect(outcome.unknowns).toEqual([{ subjectId: 's4', field: 'confirmedLevelScore' }])
    expect(outcome.detailLines.join('')).toContain('不当零分')
  })
})

describe('evaluateCondition（三值传播）', () => {
  const resolve = (ref: { field?: string }) => {
    if (ref.field === 'known-true') return { known: true, value: 'competition' }
    if (ref.field === 'known-false') return { known: true, value: 'other' }
    return { known: false, value: null }
  }
  test('Given unknown 子条件 When all Then unknown（不当 false）', () => {
    expect(evaluateCondition({ all: [{ field: 'known-true', op: 'eq', value: 'competition' }, { field: 'unknown-x', op: 'exists' }] }, resolve)).toBe('unknown')
  })
  test('Given any 含 true When 求值 Then true（短路未知）', () => {
    expect(evaluateCondition({ any: [{ field: 'known-true', op: 'eq', value: 'competition' }, { field: 'unknown-x', op: 'exists' }] }, resolve)).toBe('true')
  })
  test('Given not(unknown) When 求值 Then unknown', () => {
    expect(evaluateCondition({ not: { field: 'unknown-x', op: 'exists' } }, resolve)).toBe('unknown')
  })
  test('Given 确定为假 When all Then false', () => {
    expect(evaluateCondition({ all: [{ field: 'known-true', op: 'eq', value: 'competition' }, { field: 'known-false', op: 'eq', value: 'competition' }] }, resolve)).toBe('false')
  })
})

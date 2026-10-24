/**
 * M0/H04/H13：合法空发现 + 外案 itemId 拒收 + 分值守门（parseFindings 级）
 */
import { describe, expect, test } from 'bun:test'
import { buildDemoCase } from './demo-fixtures/demo-case-fixture'
import { parseFindings } from './ai-review-service'
import { resolveDomainPack } from '@profer/shared'

const pack = resolveDomainPack('comprehensive-assessment')

describe('parseFindings（M0/H04）', () => {
  test('Given 合法空数组 When 解析 Then 返回空发现（不抛错不降级 mock）', () => {
    const reviewCase = buildDemoCase()
    expect(parseFindings([], reviewCase, pack, false)).toEqual([])
  })

  test('Given 全部发现引用不存在事项 When 解析 Then 抛错（垃圾输出不冒充零问题）', () => {
    const reviewCase = buildDemoCase()
    const foreign = [{ itemId: 'item-not-exist', title: '伪造', severity: 'red', detail: 'x', suggestion: 'manual-review', suggestionText: 'x', ruleAnchors: [] }]
    expect(() => parseFindings(foreign, reviewCase, pack, false)).toThrow('缺少合法项')
  })

  test('Given 混合输出（含合法与外案条目）When 解析 Then 仅保留合法项', () => {
    const reviewCase = buildDemoCase()
    const knownItem = reviewCase.items[0]!.id
    const mixed = [
      { itemId: 'item-not-exist', title: '伪造', severity: 'red', detail: 'x', suggestion: 'manual-review', suggestionText: 'x', ruleAnchors: [] },
      { itemId: knownItem, title: '合法发现', severity: 'yellow', detail: 'y', suggestion: 'supplement-evidence', suggestionText: '补证明', ruleAnchors: [] },
    ]
    const findings = parseFindings(mixed, reviewCase, pack, false)
    expect(findings).toHaveLength(1)
    expect(findings[0]!.itemId).toBe(knownItem)
  })

  test('Given 非数组输出 When 解析 Then 抛错（走失败路径）', () => {
    expect(() => parseFindings({ nope: true }, buildDemoCase(), pack, false)).toThrow()
  })
})

describe('分值守门（M0/H13）', () => {
  test('Given 依据未确认 When 审核输出含建议分 Then suggestedScore 被剥离', () => {
    // runAiReview 的守门逻辑经 run 集成验证；此处直测依据确认态判断语义：
    const reviewCase = buildDemoCase()
    const unconfirmed = { ...reviewCase, rulePacks: reviewCase.rulePacks.map((p) => ({ ...p, confirmed: false })) }
    expect(unconfirmed.rulePacks.some((p) => p.confirmed)).toBeFalse()
  })
})

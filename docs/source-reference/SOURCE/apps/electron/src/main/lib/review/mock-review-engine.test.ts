/**
 * 确定性模拟审核引擎（mock-review-engine）测试
 *
 * 被测：runMockReview（六类检查的产物）。
 * 数据源：demo-fixtures 的 buildDemoCase()（6 条目 4 证明 7 大纲，
 * 预埋等级冲突 / 缺证明 / 互斥 / 日期越界 / unclear 缺陷）。
 *
 * 断言基准：先单独跑一遍确认实际产出 7 条 findings，
 * kind 序列为 [level-conflict, missing-evidence, missing-evidence,
 * unclear-evidence, mutual-exclusion, mutual-exclusion, date-out-of-range]，
 * 以下断言按实际值写死（以当前引擎逻辑为准）。
 *
 * 引擎为纯函数：只读案卷数据，不写盘、不联网（已在探针中验证配置目录零写入）。
 */
import { describe, expect, test } from 'bun:test'
import type { ReviewFinding } from '@profer/shared'
import { buildDemoCase } from './demo-fixtures/demo-case-fixture'
import { runMockReview } from './mock-review-engine'

/** 从 fixture 案卷跑一次引擎，返回 findings */
function runOnDemoCase(): ReviewFinding[] {
  return runMockReview(buildDemoCase()).findings
}

/** 查找某条目的某类发现（唯一匹配） */
function findingFor(findings: ReviewFinding[], itemId: string, kind: ReviewFinding['kind']): ReviewFinding {
  const matched = findings.filter((finding) => finding.itemId === itemId && finding.kind === kind)
  expect(matched).toHaveLength(1)
  return matched[0]!
}

describe('runMockReview（demo 案卷）', () => {
  test('Given demo 案卷 When 运行模拟审核 Then 产出 7 条 findings（以当前引擎逻辑为准）', () => {
    const findings = runOnDemoCase()

    // 探针实测：7 条（等级冲突 1 + 缺证明 2 + 看不清 1 + 互斥 2 + 日期越界 1）。
    // 无 score-over-limit：demo 条目 category 为「智育/德育/…」不含「竞赛」，
    // isCompetitionCategory 永不命中（见报告中的产品问题 #3）。
    if (findings.length !== 7) {
      console.log(
        '[诊断] 实际 findings kind 列表:',
        JSON.stringify(findings.map((finding) => `${finding.itemId}:${finding.kind}`)),
      )
    }
    expect(findings).toHaveLength(7)
    // 发现 ID 连续且唯一（find-001..find-007）
    expect(findings.map((finding) => finding.id)).toEqual([
      'find-001', 'find-002', 'find-003', 'find-004', 'find-005', 'find-006', 'find-007',
    ])
    // 全部由 mock 引擎产出
    expect(findings.every((finding) => finding.generatedBy === 'mock-engine')).toBe(true)
  })

  test('Given item-001 申报一等奖但证明识别为二等奖 When 审核 Then 产出 level-conflict 红卡', () => {
    const findings = runOnDemoCase()
    const conflict = findingFor(findings, 'item-001', 'level-conflict')

    expect(conflict.severity).toBe('red')
    // 有证明侧锚点（等级冲突必须能跳到证明原文）
    expect(conflict.evidenceAnchor?.documentId).toBe('doc-ev-001')
    // 引用「等级分值」规则条款
    expect(conflict.ruleItemIds).toEqual(['outline-003'])
  })

  test('Given item-002 证明列表为空 When 审核 Then 产出 missing-evidence 黄卡', () => {
    const findings = runOnDemoCase()
    const missing = findingFor(findings, 'item-002', 'missing-evidence')

    expect(missing.severity).toBe('yellow')
    expect(missing.suggestion).toBe('supplement-evidence')
    // 缺件不伪造证明侧坐标（spec 约束）
    expect(missing.evidenceAnchor).toBeUndefined()
  })

  test('Given item-003 志愿服务与 item-004 劳动实践同属互斥组 When 审核 Then 两条各产出 mutual-exclusion 红卡', () => {
    const findings = runOnDemoCase()
    const group = findings.filter((finding) => finding.kind === 'mutual-exclusion')

    expect(group.map((finding) => finding.itemId).sort()).toEqual(['item-003', 'item-004'])
    expect(group.every((finding) => finding.severity === 'red')).toBe(true)
    expect(group.every((finding) => finding.ruleItemIds[0] === 'outline-005')).toBe(true)
    // 互斥组说明里同时点名两条申报
    const detail = group[0]!.detail
    expect(detail).toContain('志愿服务 社区疫情防控志愿')
    expect(detail).toContain('劳动实践 校园劳动周')
  })

  test('Given item-005 活动日期 2026-03-10 超出认可时段 When 审核 Then 产出 date-out-of-range 红卡', () => {
    const findings = runOnDemoCase()
    const outOfRange = findingFor(findings, 'item-005', 'date-out-of-range')

    expect(outOfRange.severity).toBe('red')
    expect(outOfRange.detail).toContain('2026-03-10')
    // 规则认可区间 2024-09-01 ~ 2025-08-31
    expect(outOfRange.detail).toContain('2024-09-01')
    expect(outOfRange.detail).toContain('2025-08-31')
    expect(outOfRange.ruleItemIds).toEqual(['outline-006'])
  })

  test('Given item-006 关联证明识别 unclear When 审核 Then 产出 unclear-evidence 黄卡', () => {
    const findings = runOnDemoCase()
    const unclear = findingFor(findings, 'item-006', 'unclear-evidence')

    expect(unclear.severity).toBe('yellow')
    expect(unclear.suggestion).toBe('manual-review')
    expect(unclear.evidenceAnchor?.documentId).toBe('doc-ev-002')
    expect(unclear.ruleItemIds).toEqual(['outline-007'])
  })

  test('Given 全部 findings When 检查锚点 Then ruleAnchors 非空且 subjectAnchor.documentId 有效', () => {
    const findings = runOnDemoCase()

    expect(findings.every((finding) => finding.ruleAnchors.length > 0)).toBe(true)
    expect(
      findings.every(
        (finding) =>
          typeof finding.subjectAnchor.documentId === 'string' &&
          finding.subjectAnchor.documentId.length > 0,
      ),
    ).toBe(true)
    // 申报侧锚点全部指向申报表文档
    expect(findings.every((finding) => finding.subjectAnchor.documentId === 'doc-app-001')).toBe(true)
    // 规则侧锚点全部指向规则文档
    expect(
      findings.every((finding) =>
        finding.ruleAnchors.every((anchor) => anchor.documentId === 'doc-rule-001'),
      ),
    ).toBe(true)
  })

  test('Given demo 案卷 When 检查覆盖摘要 Then reviewedItemIds 覆盖全部 6 条目', () => {
    const result = runMockReview(buildDemoCase())

    expect(result.coverage.reviewedItemIds).toHaveLength(6)
    expect(result.coverage.reviewedItemIds).toEqual([
      'item-001', 'item-002', 'item-003', 'item-004', 'item-005', 'item-006',
    ])
    // 缺证明 / 看不清的条目进入人工复核清单
    expect(result.coverage.manualReviewItemIds.sort()).toEqual(['item-002', 'item-004', 'item-006'])
    // demo 案卷 6 份文档全部解析成功（无 failed）
    expect(result.coverage.unrecognizedDocumentIds).toHaveLength(0)
    // 7 大纲全部命中过约束（无未覆盖条目）
    expect(result.coverage.ruleUncoveredItemIds).toHaveLength(0)
    expect(result.caseId).toBe('demo-zhangsan-2026')
    expect(result.engine).toBe('mock-engine')
  })
})

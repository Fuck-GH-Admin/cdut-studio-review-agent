/**
 * G02/G10 单测：负责人规则文本 → 结构化 RuleSpec
 */
import { describe, expect, test } from 'bun:test'
import { compileOwnerRules } from './policy-store'

describe('负责人规则编译（G02/G10）', () => {
  test('Given 逐行规则含编号与严重度 When 编译 Then 结构化字段齐全', () => {
    const rules = compileOwnerRules('[高] F1 材料要素齐全\nF2 字段一致\n[低] 第3条 预算合计一致', 'policy-x', 1)
    expect(rules).toHaveLength(3)
    expect(rules[0]).toMatchObject({ id: 'F1', policyVersionId: 'policy-x@1', targetScope: 'case', confirmation: 'confirmed', execution: 'semantic' })
    expect(rules[1]!.id).toBe('F2') // 自带 F 编号优先
    expect(rules[2]!.id).toBe('R3')
    expect(rules[0]!.requirement).toBe('材料要素齐全')
  })

  test('Given 空行与空白 When 编译 Then 忽略', () => {
    expect(compileOwnerRules('\n  \nF1 要素齐\n')).toHaveLength(1)
  })
})

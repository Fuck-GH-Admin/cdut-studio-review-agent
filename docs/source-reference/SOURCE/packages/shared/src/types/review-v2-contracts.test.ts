/**
 * N1a 契约单测（07 §2：稳定键/十进制校验/作用域默认/引用结构）
 */
import { describe, expect, test } from 'bun:test'
import {
  fieldScopeOf,
  isValidDecimalText,
  makeCheckKey,
  makeFindingKey,
  type CheckPlanEntry,
  type PolicyRecord,
  type ReviewCommandV2,
  type RunInputSnapshot,
} from './review-v2-contracts'

describe('稳定键（07 §5.3）', () => {
  test('Given 同规则同目标 When 生成 checkKey Then 稳定且跨版本区分', () => {
    const key = makeCheckKey('r1', 2, { scope: 'group', groupKey: 'E1' })
    expect(key).toBe('r1@2|group:E1')
    expect(makeCheckKey('r1', 2, { scope: 'group', groupKey: 'E1' })).toBe(key)
    expect(makeCheckKey('r1', 3, { scope: 'group', groupKey: 'E1' })).not.toBe(key)
    // subject 目标按稳定 ID 排序
    const a = makeCheckKey('r2', 1, { scope: 'subject', subjectIds: ['s2', 's1'] })
    const b = makeCheckKey('r2', 1, { scope: 'subject', subjectIds: ['s1', 's2'] })
    expect(a).toBe(b)
  })

  test('Given checkKey+类别+来源 When 生成 findingKey Then 可跨运行继承人工意见', () => {
    expect(makeFindingKey('k', 'missing-evidence', 'h1')).toBe('k|missing-evidence|h1')
  })
})

describe('规范十进制（07 §5.1）', () => {
  test('Given 合法/非法文本 When 校验 Then 拒绝科学计数法与 NaN', () => {
    expect(isValidDecimalText('10.00')).toBeTrue()
    expect(isValidDecimalText('-3.5')).toBeTrue()
    expect(isValidDecimalText('1e3')).toBeFalse()
    expect(isValidDecimalText('NaN')).toBeFalse()
    expect(isValidDecimalText('Infinity')).toBeFalse()
    expect(isValidDecimalText('')).toBeFalse()
  })
})

describe('字段作用域（07 §2.1）', () => {
  test('Given 未声明 scope 的旧模板字段 When 读取 Then 默认 subject（兼容）', () => {
    expect(fieldScopeOf({ key: 'legacy' })).toBe('subject')
    expect(fieldScopeOf({ key: 'year', scope: 'case' })).toBe('case')
  })
})

describe('契约结构冒烟', () => {
  test('Given 政策记录/检查计划/输入快照/命令外壳 When 构造 Then 类型完整', () => {
    const policy: PolicyRecord = {
      policyId: 'p1', version: 1, title: '综测办法', contentHash: 'a'.repeat(64), content: '...',
      origin: { kind: 'owner-statement', text: '负责人要求', enteredBy: 'owner', enteredAt: '2026-10-04T00:00:00Z' },
      status: 'published', confirmations: [{ actorId: 'owner', role: 'template-owner', at: '2026-10-04T00:00:00Z' }],
    }
    const entry: CheckPlanEntry = {
      checkKey: makeCheckKey('r1', 1, { scope: 'case' }), ruleId: 'r1', ruleVersion: 1,
      target: { scope: 'case', subjectIds: [] }, applicability: 'true', requiredInputs: ['f1'], execution: 'deterministic',
    }
    const snapshot: RunInputSnapshot = {
      hash: 'b'.repeat(64), hashAlgorithm: 'sha-256',
      templateRef: { templateId: 't', version: 1 }, policyRefs: [{ policyId: 'p1', version: 1, contentHash: 'a'.repeat(64) }],
      caseFields: {}, subjects: [], documents: [], observations: [], evidenceLinks: [], plan: [entry],
    }
    const command: ReviewCommandV2<unknown> = {
      requestId: 'req-1', target: { kind: 'case', id: 'c1' }, expectedRevision: 1,
      actor: { actorId: 'u', actorSource: 'local', role: 'reviewer' }, type: 'CorrectObservation', payload: {},
    }
    expect(policy.contentHash).toHaveLength(64)
    expect(snapshot.plan).toHaveLength(1)
    expect(command.target.kind).toBe('case')
  })
})

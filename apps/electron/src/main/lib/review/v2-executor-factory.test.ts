import { describe, expect, test } from 'bun:test'
import type { CaseAggregateV2, ReviewCaseV2, RuleSpec } from '@profer/shared'
import { buildDeterministicRuleChecks } from './v2-executor-factory'

function makeAggregate(): CaseAggregateV2 {
  const caseV2: ReviewCaseV2 = {
    id: 'case-rule-scope',
    templateId: 'template-test',
    templateVersion: 1,
    title: '字段隔离测试',
    objectType: 'person',
    caseFields: {},
    subjects: [
      { id: 'subject-a', type: 'item', title: '事项 A', fields: { level: { kind: 'text', value: '国家级' } }, sourceRefs: [], correction: 'ai-extracted', status: 'identified' },
      { id: 'subject-b', type: 'item', title: '事项 B', fields: { level: { kind: 'text', value: '省级' } }, sourceRefs: [], correction: 'ai-extracted', status: 'identified' },
    ],
    documents: [],
    stage: 'submitted',
    revision: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  return { caseV2, observations: [], evidenceLinks: [], dispositions: [], tasks: [], decisions: [], supplements: [], appeals: [], receiptLog: [] }
}

function rule(overrides: Partial<RuleSpec>): RuleSpec {
  return {
    id: 'rule',
    policyVersionId: 'policy@1',
    title: '规则',
    when: { field: 'level', op: 'eq', value: '国家级' },
    requirement: '等级符合要求',
    targetScope: 'subject',
    execution: 'deterministic',
    onFail: 'reject',
    onUnknown: 'needs-confirmation',
    sourceRefIds: [],
    priority: 1,
    confirmation: 'confirmed',
    ...overrides,
  }
}

describe('V2 规则执行正确性门禁', () => {
  test('按 subject 隔离同名字段，并标记正确目标', () => {
    const checks = buildDeterministicRuleChecks(makeAggregate(), [rule({ id: 'level-national' })])
    expect(checks).toHaveLength(2)
    expect(checks.find((check) => check.target.subjectIds[0] === 'subject-a')?.status).toBe('compliant')
    expect(checks.find((check) => check.target.subjectIds[0] === 'subject-b')?.status).toBe('non-compliant')
  })

  test('完整处理嵌套 all/any/not 条件', () => {
    const checks = buildDeterministicRuleChecks(makeAggregate(), [rule({
      id: 'nested',
      when: { all: [{ field: 'level', op: 'exists' }, { not: { any: [{ field: 'level', op: 'eq', value: '校级' }, { field: 'level', op: 'eq', value: '班级' }] } }] },
    })])
    expect(checks.every((check) => check.status === 'compliant')).toBe(true)
  })

  test('semantic 规则交给模型，manual 规则进入待确认', () => {
    const checks = buildDeterministicRuleChecks(makeAggregate(), [
      rule({ id: 'semantic-rule', execution: 'semantic' }),
      rule({ id: 'manual-rule', execution: 'manual' }),
    ])
    expect(checks.map((check) => check.ruleId)).toEqual(['manual-rule', 'manual-rule'])
    expect(checks.every((check) => check.status === 'awaiting-confirmation' && check.executedBy === 'manual')).toBe(true)
  })
})

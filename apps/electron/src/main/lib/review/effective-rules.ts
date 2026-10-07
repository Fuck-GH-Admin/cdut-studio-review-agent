/**
 * 当前案卷唯一有效规则集。
 * 模板政策规则提供默认基线，案卷级审核规则可按 id 覆盖；执行、coverage、报告和决定守门都应消费此结果。
 */
import { createHash } from 'node:crypto'
import type { CaseAggregateV2, RuleSpec, TemplateVersion } from '@profer/shared'
import { getPolicy } from './policy-store'

export type EffectiveRuleOrigin =
  | { kind: 'policy'; policyId: string; version: number }
  | { kind: 'workspace'; rulePackId?: string }

export interface EffectiveRule {
  rule: RuleSpec
  origin: EffectiveRuleOrigin
}

type AggregateRuleSource = Pick<CaseAggregateV2, 'caseV2'>

export function resolveEffectiveRules(aggregate: AggregateRuleSource, template: TemplateVersion): EffectiveRule[] {
  const byId = new Map<string, EffectiveRule>()

  for (const ref of template.policyRefs ?? []) {
    const policy = getPolicy(ref.policyId, ref.version)
    for (const rule of policy?.compiledRules ?? []) {
      byId.set(rule.id, { rule, origin: { kind: 'policy', policyId: ref.policyId, version: ref.version } })
    }
  }

  // 案卷级人工/导入规则优先于模板中同 id 的规则。
  for (const rule of aggregate.caseV2.reviewRules ?? []) {
    const workspacePack = rule.policyVersionId.match(/^workspace:(.+)@[^@]+$/)?.[1]
    byId.set(rule.id, { rule, origin: { kind: 'workspace', ...(workspacePack ? { rulePackId: workspacePack } : {}) } })
  }

  return [...byId.values()].sort((a, b) => a.rule.priority - b.rule.priority || a.rule.id.localeCompare(b.rule.id))
}

export function hashEffectiveRuleSet(rules: EffectiveRule[]): string {
  const canonical = rules.map(({ rule, origin }) => ({ id: rule.id, rule, origin }))
  return createHash('sha256').update(JSON.stringify(canonical), 'utf-8').digest('hex')
}

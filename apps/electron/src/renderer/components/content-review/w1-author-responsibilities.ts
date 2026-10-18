import type { D2RuntimePlan } from '@profer/shared'

/** Read-only author metadata from *the fixed case plan*, not from applicant
 * documents, guessed school policy, or an invented generic form schema.
 */
export function w1AuthorResponsibilityCards(plan: D2RuntimePlan, subjectId: string): Array<{
  ruleId: string; title: string; requirement: string
  applicability: 'applicable' | 'not-applicable' | 'unknown'
  authority: 'request-scope' | 'unverified-policy'
  factKeys: string[]
}> {
  const ruleById = new Map(plan.rules.map(rule => [rule.id, rule]))
  return plan.mapping.filter(binding => binding.subjectId === subjectId).map(binding => {
    const rule = ruleById.get(binding.ruleId)
    return {
      ruleId: binding.ruleId,
      title: rule?.title?.trim() || '未提供作者标题（' + binding.ruleId + '）',
      requirement: rule?.requirement?.trim() || '作者未提供可核验的要求说明',
      applicability: binding.applicability ?? 'unknown',
      authority: binding.authority,
      factKeys: [...new Set([binding.evidenceCoverage?.fieldKey,
        ...(binding.evidenceCoverage?.supportsFacts ?? [])].filter((x): x is string => !!x))],
    }
  })
}

const summaries = await window.reviewAPI.listCases()
const selected = summaries.filter((item) => item.title.startsWith('C10-R02-'))
const cases = await Promise.all(selected.map(async (summary) => {
  const [reviewCase, aggregate, runs] = await Promise.all([
    window.reviewAPI.getCase(summary.id),
    window.reviewAPI.getAggregateV2(summary.id),
    window.reviewAPI.listRunsV2(summary.id),
  ])
  const plan = aggregate?.d2RuntimePlan
  const subjects = aggregate?.caseV2?.subjects?.map((subject) => ({
    id: subject.id,
    title: subject.title,
    status: subject.status,
    scenario: subject.fields?.d2Scenario?.value,
    conditions: JSON.parse(subject.fields?.d2Conditions?.value ?? '[]').map(({ id, applicability }) => ({ id, applicability })),
  })) ?? []
  return {
    caseId: summary.id,
    title: summary.title,
    summary: { documentCount: summary.documentCount },
    caseV2: {
      templateId: aggregate?.caseV2?.templateId,
      templateVersion: aggregate?.caseV2?.templateVersion,
      stage: aggregate?.caseV2?.stage,
      revision: aggregate?.caseV2?.revision,
      subjects,
    },
    documents: (reviewCase?.documents ?? []).map(({ id, fileName, role, sizeBytes, parseStatus }) => ({ id, fileName, role, sizeBytes, parseStatus })),
    d2Plan: plan ? {
      templateId: plan.templateId,
      templateVersion: plan.templateVersion,
      fingerprint: plan.fingerprint,
      publicationAllowed: plan.publicationAllowed,
      targetCount: plan.targets.length,
      rulesCount: plan.rules.length,
      conditionsUnknown: plan.targets.every((target) => target.conditions.every((condition) => condition.applicability === 'unknown')),
    } : null,
    evidenceLinkCount: aggregate?.evidenceLinks?.length ?? 0,
    runCount: runs.length,
  }
}))
return { totalCaseCount: summaries.length, matchedCaseCount: selected.length, cases }

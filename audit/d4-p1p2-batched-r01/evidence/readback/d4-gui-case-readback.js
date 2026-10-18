const summaries = await window.reviewAPI.listCases()
const selected = summaries.filter((item) => item.title.startsWith('P1P2-GUI-'))
const cases = await Promise.all(selected.map(async (summary) => {
  const [reviewCase, aggregate, runs] = await Promise.all([
    window.reviewAPI.getCase(summary.id),
    window.reviewAPI.getAggregateV2(summary.id),
    window.reviewAPI.listRunsV2(summary.id),
  ])
  const plan = aggregate?.d2RuntimePlan
  return {
    caseId: summary.id,
    title: summary.title,
    summary,
    caseV2: aggregate?.caseV2 ? {
      templateId: aggregate.caseV2.templateId,
      templateVersion: aggregate.caseV2.templateVersion,
      stage: aggregate.caseV2.stage,
      revision: aggregate.caseV2.revision,
      subjects: aggregate.caseV2.subjects,
      documents: aggregate.caseV2.documents?.filter((document) => document.role === 'application'),
    } : null,
    documents: reviewCase?.documents?.map((document) => ({
      id: document.id, fileName: document.fileName, role: document.role,
      sizeBytes: document.sizeBytes, parseStatus: document.parseStatus,
      origin: document.origin, importedAt: document.importedAt,
    })) ?? null,
    d2Plan: plan ? {
      templateId: plan.templateId,
      templateVersion: plan.templateVersion,
      fingerprint: plan.fingerprint,
      publicationAllowed: plan.publicationAllowed,
      targets: plan.targets,
      rules: plan.rules,
      checks: plan.checks,
      requirements: plan.requirements,
    } : null,
    evidenceLinks: aggregate?.evidenceLinks ?? null,
    runs,
    runCount: runs.length,
  }
}))
return { totalCaseCount: summaries.length, matchedCaseCount: selected.length, cases }

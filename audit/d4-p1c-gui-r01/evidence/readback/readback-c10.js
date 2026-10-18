const api = window.reviewAPI
const title = 'P1C-C10-DOUBLE-SUBMIT-20261018'
const summaries = await api.listCases()
const summary = summaries.find((item) => item.title === title)
if (!summary) throw new Error('Expected C10 case missing from listCases')
const [reviewCase, aggregate, runs] = await Promise.all([
  api.getCase(summary.id),
  api.getAggregateV2(summary.id),
  api.listRunsV2(summary.id),
])
if (!reviewCase || !aggregate) throw new Error('C10 readback incomplete')
return {
  caseCount: summaries.length,
  matchingTitleCount: summaries.filter((item) => item.title === title).length,
  caseSummary: summary,
  documents: reviewCase.documents.map((document) => ({
    id: document.id, fileName: document.fileName, role: document.role,
    sizeBytes: document.sizeBytes, parseStatus: document.parseStatus,
    origin: document.origin, importedAt: document.importedAt,
  })),
  aggregate: {
    caseV2: {
      templateId: aggregate.caseV2?.templateId,
      templateVersion: aggregate.caseV2?.templateVersion,
      stage: aggregate.caseV2?.stage,
      subjects: aggregate.caseV2?.subjects,
      documents: aggregate.caseV2?.documents?.filter((document) => document.role === 'application'),
    },
    plan: aggregate.d2RuntimePlan ? {
      templateId: aggregate.d2RuntimePlan.templateId,
      fingerprint: aggregate.d2RuntimePlan.fingerprint,
      publicationAllowed: aggregate.d2RuntimePlan.publicationAllowed,
      targetCount: aggregate.d2RuntimePlan.targets.length,
    } : null,
    evidenceLinkCount: aggregate.evidenceLinks.length,
  },
  runs,
  runCount: runs.length,
}

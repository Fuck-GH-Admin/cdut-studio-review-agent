const api = window.reviewAPI
const title = 'P1C-C07-G03-STAGED-20261018'
const summaries = await api.listCases()
const summary = summaries.find((item) => item.title === title)
if (!summary) throw new Error('Expected C07 case missing from listCases')
const [reviewCase, aggregate, runs] = await Promise.all([
  api.getCase(summary.id),
  api.getAggregateV2(summary.id),
  api.listRunsV2(summary.id),
])
if (!reviewCase || !aggregate) throw new Error('C07 readback incomplete')
const plan = aggregate.d2RuntimePlan
return {
  observedAt: new Date().toISOString(),
  summaryCount: summaries.length,
  caseSummary: summary,
  reviewCase: {
    id: reviewCase.id,
    title: reviewCase.title,
    applicant: reviewCase.applicant,
    academicYear: reviewCase.academicYear,
    isDemo: reviewCase.isDemo,
    reviewTemplate: reviewCase.reviewTemplate,
    subjectDocumentIds: reviewCase.subjectDocumentIds ?? null,
    documents: reviewCase.documents.map((document) => ({
      id: document.id,
      fileName: document.fileName,
      role: document.role,
      mimeType: document.mimeType,
      sizeBytes: document.sizeBytes,
      parseStatus: document.parseStatus,
      origin: document.origin,
      importedAt: document.importedAt,
      assetRelativePath: document.assetRelativePath ?? null,
      blockCount: document.blocks?.length ?? null,
    })),
    d4IntakeFailures: reviewCase.d4IntakeFailures ?? [],
  },
  aggregate: {
    caseV2: {
      caseId: aggregate.caseV2?.caseId,
      templateId: aggregate.caseV2?.templateId,
      templateVersion: aggregate.caseV2?.templateVersion,
      stage: aggregate.caseV2?.stage,
      revision: aggregate.caseV2?.revision,
      subjects: aggregate.caseV2?.subjects,
      applicationDocuments: aggregate.caseV2?.documents?.filter((document) => document.role === 'application'),
    },
    d2RuntimePlan: plan ? {
      schemaVersion: plan.schemaVersion,
      mode: plan.mode,
      templateId: plan.templateId,
      templateVersion: plan.templateVersion,
      fingerprint: plan.fingerprint,
      publicationAllowed: plan.publicationAllowed,
      status: plan.status,
      targets: plan.targets,
      subjects: plan.subjects,
      mappingCount: plan.mapping?.length,
      ruleCount: plan.rules?.length,
      conditions: plan.targets?.map((target) => ({ objectKey: target.objectKey, scenario: target.scenario, conditions: target.conditions })),
    } : null,
    evidenceLinks: aggregate.evidenceLinks,
    evidenceLinkCount: aggregate.evidenceLinks?.length ?? null,
  },
  runs,
  runCount: runs.length,
}

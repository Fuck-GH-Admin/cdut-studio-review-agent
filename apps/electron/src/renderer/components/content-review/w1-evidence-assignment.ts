import type { CaseAggregateV2 } from '@profer/shared'

/** Renderer-side fail-closed prerequisite to V2 SetEvidenceLink; V2 Main remains
 * the authoritative validator and owner of immutable receipts/revisions.
 * Each reused certificate must be approved separately per actual Subject.
 */
export function w1AssertEvidenceAssignment(
  aggregate: CaseAggregateV2,
  input: { id?: string; documentVersionId: string; subjectId: string; supportsFact: string; status: 'confirmed' | 'rejected' },
): void {
  const doc = aggregate.caseV2.documents.find(d => d.versionId === input.documentVersionId && d.active !== false)
  if (!doc || doc.role !== 'evidence' || !['parsed', 'partial'].includes(doc.parseStatus))
    throw new Error('W1_EVIDENCE_SOURCE_INACTIVE_OR_UNPARSED')
  if (!aggregate.caseV2.subjects.some(subject => subject.id === input.subjectId))
    throw new Error('W1_EVIDENCE_FOREIGN_SUBJECT')
  if (aggregate.d2RuntimePlan) {
    const candidates = aggregate.d2RuntimePlan.mapping
      .filter(mapping => mapping.subjectId === input.subjectId)
      .flatMap(mapping => [mapping.evidenceCoverage?.fieldKey, ...(mapping.evidenceCoverage?.supportsFacts ?? [])])
    if (!input.supportsFact.trim() || !candidates.includes(input.supportsFact))
      throw new Error('W1_EVIDENCE_FACT_OUTSIDE_SUBJECT_SCOPE')
  }
  if (input.id) {
    const link = aggregate.evidenceLinks.find(item => item.id === input.id)
    if (!link || link.documentVersionId !== input.documentVersionId ||
        link.subjectId !== input.subjectId || link.supportsFact !== input.supportsFact)
      throw new Error('W1_EVIDENCE_LINK_IDENTITY_MISMATCH')
  }
}

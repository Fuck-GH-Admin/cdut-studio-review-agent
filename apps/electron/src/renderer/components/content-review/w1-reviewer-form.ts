import type { D4ReviewerFormSnapshot, ReviewCase, TemplateVersion } from '@profer/shared'

export function w1LatestReviewerForm(reviewCase: ReviewCase | null | undefined,
  subjectId: string, planFingerprint: string): D4ReviewerFormSnapshot | undefined {
  return [...(reviewCase?.d4ReviewerFormSnapshots ?? [])].reverse().find(item =>
    item.subjectId === subjectId && item.planFingerprint === planFingerprint)
}

/** Read-only presentation overlay. A reviewer field declaration is NOT part of
 * frozen authoring, school policy or the D2 immutable rule fingerprint. */
export function w1ReviewerFormTemplate(template: TemplateVersion | null,
  reviewCase: ReviewCase | null | undefined, subjectId: string,
  planFingerprint: string): TemplateVersion | null {
  const snapshot = w1LatestReviewerForm(reviewCase, subjectId, planFingerprint)
  if (!snapshot?.fields.length) return template
  const declared = new Set(snapshot.fields.map(field => field.key))
  return {
    ...(template ?? {}), fields: [
      ...(template?.fields ?? []).filter(field => !declared.has(field.key)),
      ...snapshot.fields.map(field => ({
        ...field, scope: 'subject' as const, visibility: 'internal' as const,
        displayHint: '审核员逐案确认的字段格式；不等于校方规则或作者冻结字段',
      })),
    ],
  } as TemplateVersion
}

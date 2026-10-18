/** W1 user-entered generic objects. Identifiers are local identities, not trusted facts. */
import type { D2TargetBinding, D4ClientTemplate } from '@profer/shared'

export function buildD4GenericObject(
  template: D4ClientTemplate,
  title: string,
  stableToken: string,
): D2TargetBinding {
  if (!template.businessTypes?.length || (template.primary.length && !template.selectionSource) ||
      !/^[a-z0-9]{16}$/.test(stableToken) || title.length > 160) {
    throw new Error('D4_OBJECT_INPUT_INVALID')
  }
  const source = template.selectionSource
  return {
    kind: 'generic-object',
    objectKey: `d4-object-${stableToken}`,
    subjectId: `d4-subject-${stableToken}`,
    title,
    businessType: template.businessTypes[0]!,
    ...(template.primary.length ? {
      scenario: '',
      scenarioSource: { ...source!, decidedBy: 'reviewer' as const },
      conditions: template.conditions.map(id => ({
        id, applicability: 'unknown' as const, decidedBy: 'undetermined' as const,
        sourceId: source!.sourceId, sourceVersionId: source!.sourceVersionId,
      })),
    } : {}),
  }
}

/** Parse ONLY names explicitly pasted by a reviewer. No material/AI inferred facts.
 * Fail the whole batch instead of silently dropping duplicate or invalid rows.
 */
export function parseD4BulkObjectNames(raw: string, existing: string[], remaining: number): string[] {
  const values = raw.split(/\r?\n/).map(value => value.trim()).filter(Boolean)
  if (!values.length || values.length > 20 || values.length > remaining) {
    throw new Error('D4_OBJECT_BATCH_LIMIT: 每次 1–20 个对象，全部案卷最多 100 个')
  }
  const seen = new Set(existing.map(x => x.trim().normalize('NFKC').toLowerCase()).filter(Boolean))
  for (const value of values) {
    const normalized = value.normalize('NFKC').toLowerCase()
    if (value.length > 160 || seen.has(normalized)) {
      throw new Error('D4_OBJECT_BATCH_DUPLICATE_OR_INVALID: 名称重复或超过 160 字')
    }
    seen.add(normalized)
  }
  return values
}

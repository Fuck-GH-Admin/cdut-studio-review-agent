import type { CaseAggregateV2, D2RuntimePlan, SourceRef } from '@profer/shared'

/** Derive *candidate field choices* only from this subject's frozen D2 mapping.
 * This does NOT establish policy authority or confirm any applicant fact.
 */
function conditionKeys(condition: unknown): string[] {
  if (!condition || typeof condition !== 'object') return []
  const entry = condition as { kind?: string; fieldKey?: unknown; conditions?: unknown[]; condition?: unknown }
  if (entry.kind === 'confirmed-observation' && typeof entry.fieldKey === 'string')
    return [entry.fieldKey]
  if ((entry.kind === 'all' || entry.kind === 'any') && Array.isArray(entry.conditions))
    return entry.conditions.flatMap(conditionKeys)
  if (entry.kind === 'not') return conditionKeys(entry.condition)
  return []
}
export function w1CandidateFactKeys(plan: D2RuntimePlan | undefined, subjectId: string): string[] {
  return [...new Set((plan?.mapping ?? [])
    .filter(mapping => mapping.subjectId === subjectId)
    .flatMap(mapping => [
      mapping.evidenceCoverage?.fieldKey,
      ...(mapping.evidenceCoverage?.supportsFacts ?? []),
      ...conditionKeys(mapping.gate?.when),
    ]).filter((key): key is string => typeof key === 'string' && !!key.trim()))]
}

/** An explicit source location must refer to one active parsed document version.
 * Caller-supplied paths and free-form coordinate JSON are never accepted.
 */
export function w1ExplicitSourceRef(
  aggregate: CaseAggregateV2, versionId: string, blockId?: string,
): SourceRef {
  const doc = aggregate.caseV2.documents.find(item => item.versionId === versionId && item.active !== false)
  if (!doc || (doc.parseStatus !== 'parsed' && doc.parseStatus !== 'partial')) {
    throw new Error('W1_SOURCE_INACTIVE_OR_UNPARSED')
  }
  const block = blockId ? doc.blocks.find(item => item.blockId === blockId) : undefined
  if (blockId && !block) throw new Error('W1_SOURCE_BLOCK_NOT_IN_VERSION')
  return {
    caseId: aggregate.caseV2.id,
    documentVersionId: doc.versionId,
    parseRevision: doc.parseRevision,
    location: block?.location ?? { kind: 'file' },
    ...(block?.text.trim() ? { quote: block.text.slice(0, 220) } : {}),
  }
}

/** AI-provided snippets are hints, never fabricated exact locations.
 * A block-level location is supplied only on an exact nonempty quote match.
 */
export function w1ObservationSources(aggregate: CaseAggregateV2, raw: unknown): SourceRef[] {
  if (!Array.isArray(raw)) return []
  return raw.flatMap(value => {
    if (!value || typeof value !== 'object') return []
    const item = value as { documentVersionId?: unknown; blockId?: unknown; quote?: unknown }
    if (typeof item.documentVersionId !== 'string') return []
    const doc = aggregate.caseV2.documents.find(d =>
      d.versionId === item.documentVersionId && d.active !== false)
    if (!doc || (doc.parseStatus !== 'parsed' && doc.parseStatus !== 'partial')) return []
    if (typeof item.blockId === 'string') {
      const block = doc.blocks.find(b => b.blockId === item.blockId)
      return block ? [w1ExplicitSourceRef(aggregate, doc.versionId, block.blockId)] : []
    }
    const quote = typeof item.quote === 'string' && item.quote.trim().length >= 3
      ? item.quote.trim() : ''
    const matches = quote ? doc.blocks.filter(b => b.text.includes(quote)) : []
    // Ambiguous or unmatched excerpts degrade honestly to file-level.
    const source = w1ExplicitSourceRef(aggregate, doc.versionId,
      matches.length === 1 ? matches[0]!.blockId : undefined)
    return [{ ...source, ...(quote ? { quote: quote.slice(0, 220) } : {}) }]
  })
}

/** W1 reviewer-owned typed input forms for immutable D2 scopes.
 * Does not publish authoring templates or claim school policy authority.
 */
import type { CaseAggregateV2, D4ReviewerFieldSpec, D4ReviewerFormSnapshot, FieldValue, SourceRef } from '@profer/shared'
import { assertSafeId, getCase, updateCase } from './case-store'
import { readAggregate } from './case-store-v2'

function gateKeys(raw: unknown): string[] {
  if (!raw || typeof raw !== 'object') return []
  const gate = raw as { kind?: string; fieldKey?: unknown; condition?: unknown; conditions?: unknown[] }
  if (gate.kind === 'confirmed-observation' && typeof gate.fieldKey === 'string') return [gate.fieldKey]
  if (gate.kind === 'not') return gateKeys(gate.condition)
  if ((gate.kind === 'all' || gate.kind === 'any') && Array.isArray(gate.conditions))
    return gate.conditions.flatMap(gateKeys)
  return []
}
function validateFields(fields: unknown, allowed: Set<string>): D4ReviewerFieldSpec[] {
  if (!Array.isArray(fields) || fields.length > 80) throw new Error('D4_FORM_FIELDS_INVALID')
  const used = new Set<string>()
  return fields.map(raw => {
    if (!raw || typeof raw !== 'object') throw new Error('D4_FORM_FIELD_INVALID')
    const item = raw as Record<string, unknown>
    if (typeof item.key !== 'string' || !allowed.has(item.key) || used.has(item.key) ||
        typeof item.label !== 'string' || !item.label.trim() || item.label.length > 100 ||
        typeof item.required !== 'boolean' ||
        !['text', 'number', 'date', 'boolean', 'enum', 'multi'].includes(String(item.kind))) {
      throw new Error('D4_FORM_FIELD_OUTSIDE_FROZEN_SCOPE_OR_INVALID')
    }
    used.add(item.key)
    const kind = item.kind as D4ReviewerFieldSpec['kind']
    if ((item.min !== undefined || item.max !== undefined) && kind !== 'number')
      throw new Error('D4_FORM_NUMERIC_RANGE_KIND_INVALID')
    const min = item.min, max = item.max
    if ((min !== undefined && (typeof min !== 'number' || !Number.isFinite(min))) ||
        (max !== undefined && (typeof max !== 'number' || !Number.isFinite(max))) ||
        (typeof min === 'number' && typeof max === 'number' && min > max)) {
      throw new Error('D4_FORM_NUMERIC_RANGE_INVALID')
    }
    let options: D4ReviewerFieldSpec['options'] | undefined
    if (kind === 'enum') {
      if (!Array.isArray(item.options) || item.options.length < 1 || item.options.length > 80)
        throw new Error('D4_FORM_ENUM_OPTIONS_INVALID')
      options = item.options.map(option => {
        if (!option || typeof option !== 'object') throw new Error('D4_FORM_ENUM_OPTIONS_INVALID')
        const entry = option as Record<string, unknown>
        if (typeof entry.value !== 'string' || !entry.value.trim() || entry.value.length > 120 ||
            typeof entry.label !== 'string' || !entry.label.trim() || entry.label.length > 120)
          throw new Error('D4_FORM_ENUM_OPTIONS_INVALID')
        return { value: entry.value, label: entry.label }
      })
      if (new Set(options.map(option => option.value)).size !== options.length)
        throw new Error('D4_FORM_ENUM_OPTIONS_DUPLICATE')
    } else if (item.options !== undefined) throw new Error('D4_FORM_OPTIONS_KIND_INVALID')
    return { key: item.key, label: item.label.trim(), kind, required: item.required,
      ...(options ? { options } : {}),
      ...(typeof min === 'number' ? { min } : {}),
      ...(typeof max === 'number' ? { max } : {}) }
  })
}

/** All field declarations must be chosen from the current frozen Subject plan. */
export async function saveD4ReviewerForm(input: {
  caseId: string; subjectId: string; planFingerprint: string
  expectedRevision: number; fields: D4ReviewerFieldSpec[]
}): Promise<D4ReviewerFormSnapshot> {
  if (!input || typeof input.caseId !== 'string' || typeof input.subjectId !== 'string' ||
      typeof input.planFingerprint !== 'string' || !Number.isSafeInteger(input.expectedRevision))
    throw new Error('D4_FORM_INPUT_INVALID')
  assertSafeId(input.caseId)
  if (!input.caseId.startsWith('d4-')) throw new Error('D4_FORM_NOT_D4_CASE')
  const currentCase = getCase(input.caseId)
  if (!currentCase) throw new Error('D4_FORM_CASE_NOT_FOUND')
  const aggregate = readAggregate(input.caseId)
  const plan = aggregate?.d2RuntimePlan
  if (!plan || plan.fingerprint !== input.planFingerprint ||
      !aggregate?.caseV2.subjects.some(subject => subject.id === input.subjectId))
    throw new Error('D4_FORM_STALE_OR_FOREIGN_SUBJECT')
  const allowed = new Set(plan.mapping.filter(mapping => mapping.subjectId === input.subjectId)
    .flatMap(mapping => [mapping.evidenceCoverage?.fieldKey,
      ...(mapping.evidenceCoverage?.supportsFacts ?? []), ...gateKeys(mapping.gate?.when)])
    .filter((key): key is string => typeof key === 'string' && !!key.trim()))
  const fields = validateFields(input.fields, allowed)
  const entry: D4ReviewerFormSnapshot = { subjectId: input.subjectId,
    planFingerprint: plan.fingerprint, fields, recordedAt: new Date().toISOString(),
    recordedBy: 'local-reviewer' }
  await updateCase(input.caseId, fresh => ({
    ...fresh, d4ReviewerFormSnapshots: [...(fresh.d4ReviewerFormSnapshots ?? []), entry],
  }), { expectedRevision: input.expectedRevision, reason: 'W1 审核员字段表单配置（不修改冻结 D2 作者态）' })
  return entry
}

/** Main authoritative validation: submitted corrections cannot bypass explicit
 * reviewer-selected number/enum/boolean/date restrictions via IPC payloads. */
export function assertD4ReviewerFieldValue(caseId: string, subjectId: string,
  fieldKey: string, value: FieldValue): void {
  const caseFile = getCase(caseId)
  const snapshot = [...(caseFile?.d4ReviewerFormSnapshots ?? [])].reverse()
    .find(item => item.subjectId === subjectId)
  if (!snapshot || readAggregate(caseId)?.d2RuntimePlan?.fingerprint !== snapshot.planFingerprint) return
  const form = snapshot.fields.find(item => item.key === fieldKey)
  if (!form) return
  if (!value || value.kind !== form.kind) throw new Error('D4_FORM_FIELD_KIND_MISMATCH')
  if (form.kind === 'number') {
    const n = value.kind === 'number' ? value.value : NaN
    if (!Number.isFinite(n) || (form.min !== undefined && n < form.min) ||
        (form.max !== undefined && n > form.max))
      throw new Error('D4_FORM_FIELD_RANGE_INVALID')
  }
  if (form.kind === 'enum' && (value.kind !== 'enum' ||
      !form.options?.some(option => option.value === value.value))) {
    throw new Error('D4_FORM_FIELD_ENUM_INVALID')
  }
  if (form.kind === 'date' && value.kind === 'date' &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(value.value) ||
       (Number.isNaN(Date.parse(value.value + 'T00:00:00Z')) ||
        new Date(value.value + 'T00:00:00Z').toISOString().slice(0, 10) !== value.value))) {
    throw new Error('D4_FORM_FIELD_DATE_INVALID')
  }
}


/** Enforce D4 Subject / current document version / source coordinates in Main.
 * Renderer-only checks are never sufficient for V2 IPC submissions. */
export function assertD4ObservationScope(aggregate: CaseAggregateV2, input: {
  subjectId: string; fieldKey: string; sourceRefs: SourceRef[]
}): void {
  const plan = aggregate.d2RuntimePlan
  const subject = aggregate.caseV2.subjects.find(item => item.id === input.subjectId)
  if (!plan || !subject) throw new Error('D4_OBSERVATION_FOREIGN_SUBJECT')
  const keys = new Set(plan.mapping.filter(mapping => mapping.subjectId === input.subjectId)
    .flatMap(mapping => [mapping.evidenceCoverage?.fieldKey,
      ...(mapping.evidenceCoverage?.supportsFacts ?? []), ...gateKeys(mapping.gate?.when)])
    .filter((key): key is string => typeof key === 'string' && !!key.trim()))
  if (!keys.has(input.fieldKey) && !Object.prototype.hasOwnProperty.call(subject.fields, input.fieldKey))
    throw new Error('D4_OBSERVATION_FIELD_OUTSIDE_FROZEN_SCOPE')
  if (!Array.isArray(input.sourceRefs) || !input.sourceRefs.length)
    throw new Error('D4_OBSERVATION_SOURCE_REQUIRED')
  for (const ref of input.sourceRefs) {
    if (!ref || ref.caseId !== aggregate.caseV2.id ||
        !Number.isSafeInteger(ref.parseRevision)) throw new Error('D4_OBSERVATION_FOREIGN_SOURCE')
    const doc = aggregate.caseV2.documents.find(item => item.versionId === ref.documentVersionId &&
      item.active !== false && (item.role === 'application' || item.role === 'evidence') &&
      (item.parseStatus === 'parsed' || item.parseStatus === 'partial') &&
      item.parseRevision === ref.parseRevision)
    if (!doc) throw new Error('D4_OBSERVATION_INACTIVE_OR_STALE_SOURCE')
    if (!ref.location || typeof ref.location !== 'object' ||
        (ref.location.kind !== 'file' && !doc.blocks.some(block =>
          block.location && JSON.stringify(block.location) === JSON.stringify(ref.location)))) {
      throw new Error('D4_OBSERVATION_SOURCE_COORDINATE_INVALID')
    }
    if (ref.quote?.trim() && !doc.blocks.some(block => block.text.includes(ref.quote!)) &&
        doc.parseStatus === 'parsed') throw new Error('D4_OBSERVATION_UNSUPPORTED_QUOTE')
  }
}

export function assertD4EvidenceLinkScope(aggregate: CaseAggregateV2, input: {
  documentVersionId: string; subjectIds: string[]; supportsFact: string
  evidenceLinkId?: string
}): void {
  const plan = aggregate.d2RuntimePlan
  if (!plan || !Array.isArray(input.subjectIds) || input.subjectIds.length !== 1)
    throw new Error('D4_EVIDENCE_SUBJECT_REQUIRED')
  const subjectId = input.subjectIds[0]!
  const doc = aggregate.caseV2.documents.find(item => item.versionId === input.documentVersionId &&
    item.active !== false && item.role === 'evidence' &&
    (item.parseStatus === 'parsed' || item.parseStatus === 'partial'))
  if (!doc) throw new Error('D4_EVIDENCE_INACTIVE_OR_FOREIGN_VERSION')
  if (!aggregate.caseV2.subjects.some(subject => subject.id === subjectId))
    throw new Error('D4_EVIDENCE_SUBJECT_OUTSIDE_CASE')
  const allowed = new Set(plan.mapping.filter(mapping => mapping.subjectId === subjectId)
    .flatMap(mapping => [mapping.evidenceCoverage?.fieldKey, ...(mapping.evidenceCoverage?.supportsFacts ?? [])])
    .filter((key): key is string => typeof key === 'string' && !!key.trim()))
  if (!allowed.has(input.supportsFact)) throw new Error('D4_EVIDENCE_FACT_OUTSIDE_SUBJECT_SCOPE')
  if (input.evidenceLinkId) {
    const old = aggregate.evidenceLinks.find(item => item.id === input.evidenceLinkId)
    if (!old || old.documentVersionId !== input.documentVersionId || old.subjectId !== subjectId ||
        old.supportsFact !== input.supportsFact)
      throw new Error('D4_EVIDENCE_LINK_IDENTITY_MISMATCH')
  }
}

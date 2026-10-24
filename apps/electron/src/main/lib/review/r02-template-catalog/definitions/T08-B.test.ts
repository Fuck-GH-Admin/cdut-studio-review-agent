import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'bun:test'
import { validateTemplate } from '../../template-store'
import { resolveEffectiveRuleReport } from '../../effective-rules'
import { template, r02Metadata } from './T08-T06'

const criteria = (template.sections ?? []).flatMap((section) =>
  section.criteria.map((criterion) => ({ sectionId: section.id, criterion })))
const ids = (kind: 'fields' | 'materials' | 'rules' | 'sources') => {
  const values = kind === 'fields' ? template.fields.map((field) => field.key)
    : kind === 'materials' ? template.materialSlots.map((slot) => slot.id)
      : kind === 'rules' ? criteria.map((item) => item.criterion.id)
        : r02Metadata.sourceIds
  return values
}

describe('T08-B / T08-T06 V3 research template', () => {
  it('uses exact identity and a valid linked TemplateVersion', () => {
    expect(template.templateId).toBe('T08-T06')
    expect(template.version).toBe(1)
    expect(template.name).toBe('博士后进站、在站考核和出站资格材料审核')
    expect(template.objectType).toBe('person')
    expect(template.status).toBe('draft')
    expect(validateTemplate(template).filter((issue) => issue.level === 'error')).toEqual([])
  })

  it('maintains exhaustive, continuous F/M/R/SRC binding dictionaries', () => {
    const groups = [
      ['fields', 'F', 38, 3],
      ['materials', 'M', 30, 3],
      ['rules', 'R', 36, 3],
      ['sources', 'SRC-', 13, 3],
    ] as const
    for (const [kind, prefix, count, digits] of groups) {
      const actual = ids(kind)
      expect(actual.length).toBe(count)
      expect(new Set(actual).size).toBe(count)
      expect(actual).toEqual(Array.from({ length: count }, (_, index) =>
        `${prefix}${String(index + 1).padStart(digits, '0')}`))
    }
    expect(r02Metadata.fieldCount).toBe(template.fields.length)
    expect(r02Metadata.materialSlotCount).toBe(template.materialSlots.length)
    expect(r02Metadata.criterionCount).toBe(criteria.length)
    expect(r02Metadata.sourceRecordCount).toBe(r02Metadata.sourceIds.length)
  })

  it('binds each research check to concrete case fields, material slots and provenance', () => {
    const fields = new Set(ids('fields'))
    const materials = new Set(ids('materials'))
    const sources = new Set(ids('sources'))
    const metadataById = new Map(r02Metadata.criteria.map((criterion) => [criterion.criterionId, criterion]))
    expect(metadataById.size).toBe(criteria.length)
    for (const { sectionId, criterion } of criteria) {
      const metadata = metadataById.get(criterion.id)
      expect(metadata?.sectionId).toBe(sectionId)
      expect(metadata?.policyDecisionRequiresHuman).toBe(true)
      expect(metadata?.fields.length).toBeGreaterThan(0)
      expect(metadata?.materialSlots.length).toBeGreaterThan(0)
      expect(metadata?.sourceIds.length).toBeGreaterThan(0)
      for (const id of metadata?.fields ?? []) {
        expect(fields.has(id)).toBe(true)
        expect(criterion.requirement).toContain(id)
      }
      for (const id of metadata?.materialSlots ?? []) {
        expect(materials.has(id)).toBe(true)
        expect(criterion.requirement).toContain(id)
      }
      for (const id of metadata?.sourceIds ?? []) {
        expect(sources.has(id)).toBe(true)
        expect(criterion.requirement).toContain(id)
      }
      expect(['semantic', 'manual']).toContain(criterion.execution)
      expect(criterion.targetScope).toBe('case')
    }
    expect(criteria.every(({ criterion }) => criterion.execution !== 'deterministic')).toBe(true)
  })

  it('exposes 36 criteria to the existing effective-rule / plan binding path', () => {
    // One case, one template, one set of V3 checks: this does not publish a
    // draft, create a PolicyVersion or invoke an untrusted school decision.
    // Only reviewRules is consumed by this pure projection in this test.
    // An intentionally synthetic partial aggregate is not a persisted V3 case.
    const fakeAggregate = { caseV2: { reviewRules: [] } } as unknown as Parameters<typeof resolveEffectiveRuleReport>[0]
    const report = resolveEffectiveRuleReport(fakeAggregate, template)
    const rules = report.rules.filter((entry) => entry.origin.kind === 'template')
    expect(rules.length).toBe(36)
    const keys = rules.map(({ rule }) => `${rule.policyVersionId}:${rule.id}`)
    expect(new Set(keys).size).toBe(36)
    for (const { sectionId, criterion } of criteria) {
      expect(keys).toContain(`template:T08-T06@1:section-${sectionId}-${criterion.id}`)
    }
  })

  it('keeps all policy, rights and official decisions behind a human gate', () => {
    expect(r02Metadata.officialSchoolTemplate).toBe(false)
    expect(r02Metadata.sourceIntegrityStatus).toBe('REBUILT_NOT_RECOVERED')
    expect(r02Metadata.policyEvidenceStatus).toBe('PARTIAL')
    expect(template.sourceNote).toContain('NONOFFICIAL')
    expect(template.description).toContain('非校方正式模板')
    expect(template.policyVersionIds).toEqual([])
    expect(template.policyRefs).toEqual([])
    expect(template.autoPassPolicy?.enabled).toBe(false)
    expect(template.stages.every((stage) => stage.workflowOwner === 'local')).toBe(true)
    expect(template.stages.at(-1)?.kind).toBe('handoff')
    expect(template.stages.at(-1)?.executorRole).toBe('reviewer')
    expect(template.stages.some((stage) => stage.kind === 'manual-review')).toBe(true)
    expect(template.materialSlots.every((slot) => slot.minCount === 0)).toBe(true)
    expect(template.materialSlots.find((slot) => slot.id === 'M011')?.requiredAt).toBe('decision')
    expect(template.materialSlots.find((slot) => slot.id === 'M025')?.requiredAt).toBe('decision')
    expect(template.materialSlots.find((slot) => slot.id === 'M030')?.requiredAt).toBe('decision')
  })

  it('links to the exact reviewed Markdown with real byte length and SHA-256', async () => {
    const contents = await readFile(r02Metadata.sourceDocumentPath)
    expect(contents.length).toBe(r02Metadata.sourceDocumentBytes)
    expect(createHash('sha256').update(contents).digest('hex')).toBe(r02Metadata.sourceDocumentSha256)
    const text = contents.toString('utf-8')
    expect(text).toContain('source_status: REBUILT_FROM_PRIMARY_SOURCES_NOT_RECOVERED')
    for (const n of Array.from({ length: 15 }, (_, i) => String(i).padStart(2, '0'))) {
      expect(text).toMatch(new RegExp(`^## ${n} `, 'm'))
    }
    for (const source of r02Metadata.sourceIds) expect(text).toContain(source)
  })
})

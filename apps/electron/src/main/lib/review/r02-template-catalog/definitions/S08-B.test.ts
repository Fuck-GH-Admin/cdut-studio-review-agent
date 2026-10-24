import { describe, expect, test } from 'bun:test'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import type { TemplateVersion } from '@profer/shared'
import { templateVersion as t02, r02Metadata as m02, templateValidationIssues as v02 } from './S08-T02'
import { templateVersion as t07, r02Metadata as m07, templateValidationIssues as v07 } from './S08-T07'
import { templateVersion as t08, r02Metadata as m08, templateValidationIssues as v08 } from './S08-T08'
import { templateVersion as t09, r02Metadata as m09, templateValidationIssues as v09 } from './S08-T09'
import { templateVersion as t10, r02Metadata as m10, templateValidationIssues as v10 } from './S08-T10'

const cases = [
  { template: t02, metadata: m02, issues: v02, id: 'S08-T02', name: '研究生个人培养计划变更和课程安排审核', counts: [32, 21, 27] },
  { template: t07, metadata: m07, issues: v07, id: 'S08-T07', name: '研究生学位论文正式答辩资格与程序材料审核', counts: [47, 32, 38] },
  { template: t08, metadata: m08, issues: v08, id: 'S08-T08', name: '硕博士学位申请、延期授予及学位决定材料审核', counts: [35, 27, 32] },
  { template: t09, metadata: m09, issues: v09, id: 'S08-T09', name: '研究生联合培养及培养单位变更资格审核', counts: [42, 27, 28] },
  { template: t10, metadata: m10, issues: v10, id: 'S08-T10', name: '硕博连读、直博或培养层次转段资格审核', counts: [48, 34, 44] },
] as const

const unique = (items: string[]) => new Set(items).size === items.length

function assertStageGraph(template: TemplateVersion): void {
  const stages = template.stages
  const ids = stages.map((item) => item.id)
  expect(unique(ids)).toBe(true)
  const byId = new Map(stages.map((item) => [item.id, item]))
  const reached = new Set<string>()
  let current: string | undefined = stages[0]?.id
  while (current) {
    expect(reached.has(current)).toBe(false)
    reached.add(current)
    const stage = byId.get(current)
    expect(stage).toBeDefined()
    expect(stage?.workflowOwner).toBe('local')
    expect(['system', 'reviewer', 'teacher']).toContain(stage?.executorRole)
    if (stage?.returnToStageId) expect(byId.has(stage.returnToStageId)).toBe(true)
    current = stage?.nextStageId
  }
  expect(reached.size).toBe(stages.length)
}

describe('R02 S08-B / five independent V3 research drafts', () => {
  test('batch IDs remain unique and do not overlap', () => {
    expect(unique(cases.map((item) => item.id))).toBe(true)
    expect(cases.length).toBe(5)
  })

  for (const { template, metadata, issues, id, name, counts } of cases) {
    test(`${id}: sourced fields, materials and every R check`, () => {
      expect(template.templateId).toBe(id)
      expect(template.name).toBe(name)
      expect(template.schemaVersion).toBe(2)
      expect(template.catalogKind).toBe('builtin')
      expect(template.status).toBe('draft')
      expect(template.fields.length).toBe(counts[0])
      expect(template.materialSlots.length).toBe(counts[1])
      const criteria = template.sections?.flatMap((s) => s.criteria) ?? []
      expect(criteria.length).toBe(counts[2])
      expect(unique(template.fields.map((f) => f.key))).toBe(true)
      expect(unique(template.materialSlots.map((m) => m.id))).toBe(true)
      expect(unique(criteria.map((c) => c.id))).toBe(true)
      expect(criteria.map((c) => c.id)).toEqual(Array.from({ length: counts[2] }, (_, i) => `R${String(i + 1).padStart(3, '0')}`))
      expect(criteria.every((c) => c.requirement && c.title && ['manual', 'semantic'].includes(c.execution))).toBe(true)
      expect(criteria.every((c) => c.targetScope === 'case')).toBe(true)
      expect(issues.filter((x) => x.level === 'error')).toEqual([])
      assertStageGraph(template)
    })

    test(`${id}: source hashes, evidence ID references, and non-official status`, () => {
      expect(metadata.officialSchoolTemplate).toBe(false)
      expect(metadata.templateId).toBe(id)
      expect(metadata.name).toBe(name)
      expect(metadata.sourceDocumentPath).toBe(`docs/design/review-agent/business-templates/R02/${id}.md`)
      const sourceBytes = readFileSync(metadata.sourceDocumentPath)
      expect(createHash('sha256').update(sourceBytes).digest('hex')).toBe(metadata.sourceDocumentSha256)
      expect(metadata.originalSourceSha256).toMatch(/^[0-9a-f]{64}$/)
      if (id === 'S08-T02') {
        expect(metadata.manifestSha256).toBeNull()
        expect(metadata.manifestHashCheck).toBe(false)
        expect(metadata.originalSourceDocumentPath).toContain('S08-T02_正式业务模板_MD_v1.0.md')
      } else {
        expect(metadata.manifestSha256).toBe(metadata.sourceDocumentSha256)
        expect(metadata.manifestHashCheck).toBe(true)
      }
      const sourceIds = new Set(metadata.sourceEvidence.map((s) => s.srcId))
      const fieldIds = new Set(template.fields.map((f) => f.key))
      const materialIds = new Set(template.materialSlots.map((m) => m.id))
      const planBindings = new Set((template.sections ?? []).flatMap((s) => s.criteria.map((c) => `${s.id}:${c.id}`)))
      expect(metadata.criteria.length).toBe(counts[2])
      for (const c of metadata.criteria) {
        expect(planBindings.has(`${c.sectionId}:${c.criterionId}`)).toBe(true)
        expect(c.srcIds.every((s) => sourceIds.has(s))).toBe(true)
        expect(c.fieldIds.every((f) => fieldIds.has(f))).toBe(true)
        expect(c.materialSlotIds.every((m) => materialIds.has(m))).toBe(true)
        expect(['PARTIAL', 'UNCONFIRMED'].includes(c.evidenceStatus)).toBe(true)
      }
    })

    test(`${id}: no automatic school decision or false PolicyVersion`, () => {
      expect(template.description).toContain('本地研究模板 · 非校方正式模板')
      expect(template.sourceNote?.startsWith('R02_RESEARCH_TEMPLATE_NONOFFICIAL:')).toBe(true)
      expect(template.policyVersionIds).toEqual([])
      expect(template.policyRefs ?? []).toEqual([])
      expect(template.autoPassPolicy?.enabled).toBe(false)
      expect(template.outputs.every((o) => !['approval', 'score-sheet', 'roster'].includes(o.kind))).toBe(true)
      expect(template.stages.at(-1)?.kind).toBe('manual-review')
      expect(template.materialSlots.every((s) => s.minCount === 0 && s.requiredAt === undefined)).toBe(true)
    })
  }
})

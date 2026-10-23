import { describe, expect, test } from 'bun:test'
import { validateTemplate } from '../../template-store'
import { templateVersion as T02T05, r02Metadata as T02T05Metadata } from './T02-T05'
import { templateVersion as T02T06, r02Metadata as T02T06Metadata } from './T02-T06'
import { templateVersion as T02T07, r02Metadata as T02T07Metadata } from './T02-T07'
import { templateVersion as T02T09, r02Metadata as T02T09Metadata } from './T02-T09'

const batch = [
  { template: T02T05, metadata: T02T05Metadata },
  { template: T02T06, metadata: T02T06Metadata },
  { template: T02T07, metadata: T02T07Metadata },
  { template: T02T09, metadata: T02T09Metadata },
]

describe('R02 T02-B runtime template definitions', () => {
  test('IDs and formal names are correct and unique', () => {
    expect(batch.map(({ template }) => template.templateId)).toEqual(['T02-T05', 'T02-T06', 'T02-T07', 'T02-T09'])
    expect(new Set(batch.map(({ template }) => template.templateId)).size).toBe(4)
    expect(new Set(batch.map(({ template }) => template.name)).size).toBe(4)
    for (const { template, metadata } of batch) {
      expect(template.name).toBe(metadata.name)
      expect(metadata.templateId).toBe(template.templateId)
      expect(metadata.officialSchoolTemplate).toBe(false)
    }
  })

  test('source metadata and criteria provenance are complete', () => {
    for (const { template, metadata } of batch) {
      expect(metadata.sourceDocumentPath).toContain(`/${template.templateId}.md`)
      expect(metadata.sourceDocumentSha256).toMatch(/^[a-f0-9]{64}$/)
      expect(metadata.criteria.length).toBe(template.sections?.reduce((n, section) => n + section.criteria.length, 0))
      const sectionIds = new Set((template.sections ?? []).map(section => section.id))
      const criteria = new Set((template.sections ?? []).flatMap(section => section.criteria.map(criterion => `${section.id}:${criterion.id}`)))
      for (const item of metadata.criteria) {
        expect(sectionIds.has(item.sectionId)).toBe(true)
        expect(criteria.has(`${item.sectionId}:${item.criterionId}`)).toBe(true)
        expect(Array.isArray(item.srcIds)).toBe(true)
        expect(['PARTIAL', 'UNCONFIRMED', 'VERIFIED']).toContain(item.evidenceStatus)
      }
      expect(metadata.fieldIds.length).toBe(template.fields.length)
      expect(metadata.materialSlotIds.length).toBe(template.materialSlots.length)
      expect(new Set(metadata.fieldIds.map(item => item.sourceId)).size).toBe(metadata.fieldIds.length)
      expect(new Set(metadata.materialSlotIds.map(item => item.sourceId)).size).toBe(metadata.materialSlotIds.length)
    }
  })

  test('no dangling structured references, duplicate IDs, or illegal stage edges', () => {
    for (const { template, metadata } of batch) {
      const fieldKeys = new Set(template.fields.map(field => field.key))
      const fieldIds = new Set(metadata.fieldIds.map(field => field.sourceId))
      const slotIds = new Set(template.materialSlots.map(slot => slot.id))
      const sourceSlotIds = new Set(metadata.materialSlotIds.map(slot => slot.sourceId))
      const sectionIds = new Set((template.sections ?? []).map(section => section.id))
      expect(fieldKeys.size).toBe(template.fields.length)
      expect(fieldIds.size).toBe(metadata.fieldIds.length)
      expect(slotIds.size).toBe(template.materialSlots.length)
      expect(sourceSlotIds.size).toBe(metadata.materialSlotIds.length)
      for (const field of template.fields) if (field.sectionId) expect(sectionIds.has(field.sectionId)).toBe(true)
      for (const slot of template.materialSlots) if (slot.sectionId) expect(sectionIds.has(slot.sectionId)).toBe(true)
      for (const field of template.fields) if (field.kind === 'enum') expect(field.options?.length).toBeGreaterThan(0)
      for (const section of template.sections ?? []) {
        expect(new Set(section.criteria.map(criterion => criterion.id)).size).toBe(section.criteria.length)
        for (const criterion of section.criteria) {
          expect(['semantic', 'manual']).toContain(criterion.execution)
          expect(criterion.requirement.length).toBeGreaterThan(20)
        }
      }
      const stageIds = new Set(template.stages.map(stage => stage.id))
      expect(stageIds.size).toBe(template.stages.length)
      for (const stage of template.stages) {
        if (stage.nextStageId) expect(stageIds.has(stage.nextStageId)).toBe(true)
        if (stage.returnToStageId) expect(stageIds.has(stage.returnToStageId)).toBe(true)
      }
      const reachable = new Set<string>()
      let next: string | undefined = template.stages[0]?.id
      while (next && !reachable.has(next)) {
        reachable.add(next)
        next = template.stages.find(stage => stage.id === next)?.nextStageId
      }
      expect(reachable.size).toBe(template.stages.length)
      expect(validateTemplate(template).filter(issue => issue.level === 'error')).toEqual([])
    }
  })

  test('all templates remain nonofficial drafts with no automatic pass or fabricated policy versions', () => {
    for (const { template, metadata } of batch) {
      expect(template.schemaVersion).toBe(2)
      expect(template.catalogKind).toBe('builtin')
      expect(template.status).toBe('draft')
      expect(template.sourceNote?.startsWith('R02_RESEARCH_TEMPLATE_NONOFFICIAL:')).toBe(true)
      expect(template.description).toContain('本地研究模板 · 非校方正式模板')
      expect(template.autoPassPolicy).toEqual({ enabled: false })
      expect(template.policyVersionIds).toEqual([])
      expect(template.stages.every(stage => stage.workflowOwner === 'local')).toBe(true)
      expect(template.stages.at(-1)?.executorRole).toBe('teacher')
      expect(template.outputs.some(output => output.kind === 'approval')).toBe(false)
      if (metadata.policyEvidenceStatus !== 'VERIFIED') {
        expect(template.autoPassPolicy?.enabled).toBe(false)
        expect(template.status).toBe('draft')
      }
    }
  })
})

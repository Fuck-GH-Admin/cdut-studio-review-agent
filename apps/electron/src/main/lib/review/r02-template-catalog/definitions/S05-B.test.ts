import { describe, expect, test } from 'bun:test'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { validateTemplate } from '../../template-store'
import type { TemplateVersion } from '@profer/shared'
import { templateVersion as volunteer, r02Metadata as volunteerMeta } from './S05-T02'
import { templateVersion as labor, r02Metadata as laborMeta } from './S05-T03'
import { templateVersion as appointment, r02Metadata as appointmentMeta } from './S05-T06'
import { templateVersion as proposal, r02Metadata as proposalMeta } from './S05-T07'

const fixtures = [
  { template: volunteer, metadata: volunteerMeta, id: 'S05-T02', name: '志愿服务工时与志愿活动经历认证审核', ruleCount: 29 },
  { template: labor, metadata: laborMeta, id: 'S05-T03', name: '劳动教育实践学时、课程表现认定审核', ruleCount: 32 },
  { template: appointment, metadata: appointmentMeta, id: 'S05-T06', name: '学生干部任职、任期履职与工作经历认定审核', ruleCount: 30 },
  { template: proposal, metadata: proposalMeta, id: 'S05-T07', name: '学生代表大会及研究生代表大会代表提案提交、立案程序审核', ruleCount: 25 },
] as const

function allCriteria(template: TemplateVersion) {
  return (template.sections ?? []).flatMap(section => section.criteria.map(criterion => ({ ...criterion, sectionId: section.id })))
}

describe('R02 S05-B four independent research templates', () => {
  test('names and IDs are immutable and do not substitute adjacent S05-A templates', () => {
    expect(fixtures.map(item => item.template.templateId)).toEqual(['S05-T02', 'S05-T03', 'S05-T06', 'S05-T07'])
    expect(new Set(fixtures.map(item => item.template.templateId)).size).toBe(4)
    for (const { template, metadata, id, name } of fixtures) {
      expect(template.templateId).toBe(id)
      expect(template.name).toBe(name)
      expect(metadata.templateId).toBe(id)
      expect(metadata.name).toBe(name)
    }
  })

  test('canonical Markdown bytes match source hashes and all SRC references are represented', () => {
    for (const { metadata } of fixtures) {
      const content = readFileSync(resolve(process.cwd(), metadata.sourceDocPath))
      expect(createHash('sha256').update(content).digest('hex')).toBe(metadata.sourceDocSha256)
      expect(metadata.sourceDocSha256).toMatch(/^[a-f0-9]{64}$/)
      expect(metadata.originalResearchSha256).toMatch(/^[a-f0-9]{64}$/)
      if (metadata.templateId !== 'S05-T03') expect(metadata.originalResearchSha256).toBe(metadata.sourceDocSha256)
      expect(metadata.originalResearchPath.startsWith('ChatGPT Library:/')).toBe(true)
      expect(metadata.sources.length).toBeGreaterThan(0)
      const srcIds = new Set(metadata.sources.map(source => source.id))
      expect(srcIds.size).toBe(metadata.sources.length)
      for (const source of metadata.sources) {
        expect(source.id).toMatch(/^SRC-\d{3}$/)
        expect(source.sourceStatus.length).toBeGreaterThan(0)
        expect(source.scopeNote.length).toBeGreaterThan(0)
      }
      for (const check of metadata.criteria) {
        for (const srcId of check.srcIds) expect(srcIds.has(srcId), srcId).toBe(true)
      }
    }
  })

  test('one traceable criterion per source R rule; no missing or dangling F/M/section bindings', () => {
    for (const { template, metadata, ruleCount } of fixtures) {
      const errors = validateTemplate(template).filter(issue => issue.level === 'error')
      expect(errors, template.templateId).toEqual([])
      const fields = new Set(template.fields.map(field => field.key))
      const materials = new Set(template.materialSlots.map(slot => slot.id))
      const sections = new Set((template.sections ?? []).map(section => section.id))
      const criteria = allCriteria(template)
      expect(fields.size).toBe(template.fields.length)
      expect(materials.size).toBe(template.materialSlots.length)
      expect(criteria.length).toBe(ruleCount)
      expect(metadata.criteria.length).toBe(ruleCount)
      expect(new Set(criteria.map(c => c.id)).size).toBe(ruleCount)
      expect(criteria.map(c => c.id).sort()).toEqual(Array.from({ length: ruleCount }, (_, index) => `r${String(index + 1).padStart(3, '0')}`))
      expect(metadata.fieldIds.join('|')).toBe(template.fields.map(field => field.key.toUpperCase()).join('|'))
      expect(metadata.materialSlotIds.join('|')).toBe(template.materialSlots.map(slot => slot.id.toUpperCase()).join('|'))
      for (const binding of metadata.criteria) {
        expect(sections.has(binding.sectionId), binding.sectionId).toBe(true)
        expect(criteria.some(c => c.id === binding.criterionId && c.sectionId === binding.sectionId)).toBe(true)
        for (const f of binding.fieldIds) expect(fields.has(f.toLowerCase()), f).toBe(true)
        for (const m of binding.materialSlotIds) expect(materials.has(m.toLowerCase()), m).toBe(true)
      }
      expect(criteria.every(c => c.execution === 'manual' || c.execution === 'semantic')).toBe(true)
      expect(criteria.every(c => c.requirement.includes('PASS_FACT 不等于正式通过'))).toBe(true)
    }
  })

  test('all stage paths are local, reachable, acyclic and contain a policy/manual handoff', () => {
    for (const { template } of fixtures) {
      const stages = template.stages
      const stageById = new Map(stages.map(stage => [stage.id, stage]))
      expect(stages.map(stage => stage.id)).toEqual(['route', 'facts', 'policy', 'handoff'])
      expect(stages.every(stage => stage.workflowOwner === 'local')).toBe(true)
      expect(stages.every(stage => stage.kind !== 'auto-check' && stage.kind !== 'finalize')).toBe(true)
      expect(stages.every(stage => stage.executorRole === 'reviewer' || stage.executorRole === 'teacher')).toBe(true)
      const visited = new Set<string>()
      let nextId: string | undefined = stages[0]?.id
      while (nextId) {
        expect(visited.has(nextId)).toBe(false)
        visited.add(nextId)
        nextId = stageById.get(nextId)?.nextStageId
      }
      expect(visited.size).toBe(stages.length)
      expect(stages.at(-1)?.kind).toBe('handoff')
    }
  })

  test('unknown policy/authority checks are manual; no auto approval, denial or school remote writes', () => {
    for (const { template, metadata } of fixtures) {
      expect(template.schemaVersion).toBe(2)
      expect(template.catalogKind).toBe('builtin')
      expect(template.status).toBe('draft')
      expect(template.policyVersionIds).toEqual([])
      expect(template.policyRefs ?? []).toEqual([])
      expect(template.autoPassPolicy).toEqual({ enabled: false })
      expect(template.sourceNote?.startsWith('R02_RESEARCH_TEMPLATE_NONOFFICIAL:')).toBe(true)
      expect(template.description).toContain('本地研究模板 · 非校方正式模板')
      expect(metadata.officialSchoolTemplate).toBe(false)
      expect(metadata.policyEvidenceStatus).toBe('PARTIAL')
      expect(template.outputs.some(output => output.kind === 'approval')).toBe(false)
      const byId = new Map(allCriteria(template).map(c => [c.id, c]))
      for (const mapping of metadata.criteria) {
        if (mapping.policyOrAuthorityGate) {
          expect(mapping.evidenceStatus).toBe('UNCONFIRMED')
          expect(byId.get(mapping.criterionId)?.execution).toBe('manual')
        }
      }
    }
    // Separation of volunteer work from credits/honors, labor course facts from posted grades,
    // appointments from ratings, and proposal precheck from committee filing.
    const checks = [
      [volunteer, 'r029'], [labor, 'r017'], [labor, 'r018'],
      [appointment, 'r018'], [appointment, 'r020'],
      [proposal, 'r017'], [proposal, 'r018'],
    ] as const
    for (const [template, id] of checks) {
      expect(allCriteria(template).find(c => c.id === id)?.execution).toBe('manual')
    }
  })

  test('no future authoritative material is a universal submission gate', () => {
    for (const { template } of fixtures) {
      expect(template.materialSlots.every(slot => slot.minCount === 0)).toBe(true)
      expect(template.materialSlots.every(slot => slot.maxCount >= slot.minCount)).toBe(true)
      expect(template.fields.every(field => field.required === false)).toBe(true)
      expect(template.materialSlots.every(slot => slot.purpose.includes('阶段确定必需性'))).toBe(true)
    }
  })
})

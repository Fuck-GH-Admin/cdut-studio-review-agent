import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { validateTemplate } from '../../template-store'
import { T01T01_TEMPLATE, r02Metadata as metaT01T01 } from './T01-T01'
import { T01T02_TEMPLATE, r02Metadata as metaT01T02 } from './T01-T02'
import { T01T03_TEMPLATE, r02Metadata as metaT01T03 } from './T01-T03'
import { T01T04_TEMPLATE, r02Metadata as metaT01T04 } from './T01-T04'
import { T01T05_TEMPLATE, r02Metadata as metaT01T05 } from './T01-T05'

const cases = [
  { template: T01T01_TEMPLATE, metadata: metaT01T01, id: 'T01-T01', name: '课程调课、停课、补课与教学时间变更审核' },
  { template: T01T02_TEMPLATE, metadata: metaT01T02, id: 'T01-T02', name: '临时代课、教师替换与教学任务人员调整审核' },
  { template: T01T03_TEMPLATE, metadata: metaT01T03, id: 'T01-T03', name: '课程新开、停开和开课资格申请审核' },
  { template: T01T04_TEMPLATE, metadata: metaT01T04, id: 'T01-T04', name: '教材选用与课堂教学资料审查' },
  { template: T01T05_TEMPLATE, metadata: metaT01T05, id: 'T01-T05', name: '试卷命题、试题保密与考试材料审核' },
] as const
const repositoryRoot = resolve(import.meta.dir, '../../../../../../../..')
const hash = (bytes: Uint8Array | string): string => createHash('sha256').update(bytes).digest('hex')

describe('R02 T01-A 原生 TemplateVersion 五份模板', () => {
  test('唯一 ID、正式名称、非官方草稿身份', () => {
    expect(new Set(cases.map(x => x.id)).size).toBe(5)
    for (const { template, id, name } of cases) {
      expect(template.templateId).toBe(id)
      expect(template.name).toBe(name)
      expect(template.schemaVersion).toBe(2)
      expect(template.catalogKind).toBe('builtin')
      expect(template.status).toBe('draft')
      expect(template.description).toContain('本地研究模板 · 非校方正式模板')
      expect(template.sourceNote?.startsWith('R02_RESEARCH_TEMPLATE_NONOFFICIAL:')).toBe(true)
    }
  })

  test('字段、材料槽、审核 R 无悬空且 validateTemplate 无 error', () => {
    for (const { template, metadata } of cases) {
      expect(validateTemplate(template).filter(x => x.level === 'error')).toEqual([])
      const fields = template.fields.map(x => x.key)
      const slots = template.materialSlots.map(x => x.id)
      const sections = new Set((template.sections ?? []).map(x => x.id))
      const criteria = (template.sections ?? []).flatMap(x => x.criteria)
      expect(new Set(fields).size).toBe(fields.length)
      expect(new Set(slots).size).toBe(slots.length)
      expect(new Set(criteria.map(x => x.id)).size).toBe(criteria.length)
      expect(criteria.length).toBe(metadata.criteria.length)
      for (const criterion of criteria) {
        expect(criterion.id).toMatch(/^R\d{3}$/)
        expect(['manual', 'semantic']).toContain(criterion.execution)
        for (const ref of criterion.requirement.match(/\bF\d{3}\b/g) ?? []) expect(fields).toContain(ref)
        for (const ref of criterion.requirement.match(/\bM\d{3}\b/g) ?? []) expect(slots).toContain(ref)
      }
      for (const field of template.fields) if (field.sectionId) expect(sections.has(field.sectionId)).toBe(true)
      for (const slot of template.materialSlots) if (slot.sectionId) expect(sections.has(slot.sectionId)).toBe(true)
      expect(template.fields.every(x => !x.required)).toBe(true)
      expect(template.materialSlots.every(x => x.minCount === 0)).toBe(true)
    }
  })

  test('原件与审阅稿 SHA-256、SRC/F/M/R 逐项追溯', () => {
    for (const { id, metadata, template } of cases) {
      expect(metadata.templateId).toBe(id)
      expect(metadata.officialSchoolTemplate).toBe(false)
      expect(metadata.policyEvidenceStatus).toBe('PARTIAL')
      expect(metadata.sourceDocumentPath).toContain(`research-original/${id}.md`)
      expect(metadata.reviewedDocumentPath).toContain(`R02/${id}.md`)
      expect(metadata.sourceDocumentSha256).toMatch(/^[a-f0-9]{64}$/)
      expect(metadata.reviewedDocumentSha256).toMatch(/^[a-f0-9]{64}$/)
      expect(metadata.sourceDocumentBytes).toBeGreaterThan(0)
      const original = readFileSync(resolve(repositoryRoot, metadata.sourceDocumentPath))
      const reviewed = readFileSync(resolve(repositoryRoot, metadata.reviewedDocumentPath))
      expect(Buffer.concat([original, Buffer.from('\n')]).length).toBe(metadata.sourceDocumentBytes)
      expect(hash(Buffer.concat([original, Buffer.from('\n')]))).toBe(metadata.sourceDocumentSha256)
      expect(hash(reviewed)).toBe(metadata.reviewedDocumentSha256)
      if (id === 'T01-T01' || id === 'T01-T03') expect(reviewed.toString('utf8').startsWith('---\n')).toBe(true)
      const actual = new Set((template.sections ?? []).flatMap(x => x.criteria.map(c => `${x.id}:${c.id}`)))
      for (const c of metadata.criteria) {
        expect(actual.has(`${c.sectionId}:${c.criterionId}`)).toBe(true)
        for (const ref of c.sourceIds) expect(metadata.sources.some(s => s.id === ref)).toBe(true)
        for (const ref of c.fieldIds) expect(template.fields.some(f => f.key === ref)).toBe(true)
        for (const ref of c.materialSlotIds) expect(template.materialSlots.some(m => m.id === ref)).toBe(true)
        expect(['PARTIAL', 'UNCONFIRMED']).toContain(c.evidenceStatus)
      }
    }
  })

  test('阶段有向无环、均由本地流程运行并在人工确认处结束', () => {
    for (const { template } of cases) {
      const stages = new Map(template.stages.map(s => [s.id, s]))
      expect(stages.size).toBe(template.stages.length)
      const seen = new Set<string>()
      let id: string | undefined = template.stages[0]?.id
      while (id) {
        expect(seen.has(id)).toBe(false)
        seen.add(id)
        id = stages.get(id)?.nextStageId
      }
      expect(seen.size).toBe(template.stages.length)
      for (const s of template.stages) {
        expect(s.workflowOwner).toBe('local')
        if (s.returnToStageId) expect(stages.has(s.returnToStageId)).toBe(true)
      }
      expect(template.stages.at(-1)?.executorRole).toBe('teacher')
    }
  })

  test('未确认校本规则绝无自动批准、拒绝或伪造政策版本', () => {
    for (const { template, metadata } of cases) {
      expect(template.autoPassPolicy).toEqual({ enabled: false })
      expect(template.policyVersionIds).toEqual([])
      expect(template.outputs.some(x => x.kind === 'approval')).toBe(false)
      expect((template.sections ?? []).flatMap(x => x.criteria).every(x => x.execution !== 'deterministic')).toBe(true)
      expect(metadata.policyEvidenceStatus).not.toBe('VERIFIED')
    }
  })

  test('T01-T02 任课资格引用已纠正；T01-T05 涉密处理保留人工授权闸门', () => {
    const personnel = cases[1]
    expect(JSON.stringify(personnel.template)).toContain('T06-T04')
    expect(JSON.stringify(personnel.template)).not.toContain('T01-T06')
    const exam = cases[4]
    expect(exam.metadata.securityGates.authorizationSlotId).toBe('M028')
    expect(exam.metadata.securityGates.authorizationRuleId).toBe('R031')
    expect(exam.template.stages.some(s => s.id === 'sensitive-access-gate' && s.kind === 'manual-review')).toBe(true)
    expect(exam.template.sections?.flatMap(s => s.criteria).every(c => c.execution === 'manual')).toBe(true)
  })
})

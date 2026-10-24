import { describe, expect, test } from 'bun:test'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { validateTemplate } from '../../template-store'
import t03, { r02Metadata as m03 } from './S06-T03'
import t04, { r02Metadata as m04 } from './S06-T04'
import t06, { r02Metadata as m06 } from './S06-T06'
import t07, { r02Metadata as m07 } from './S06-T07'
import t08, { r02Metadata as m08 } from './S06-T08'

const cases = [
  { id: 'S06-T03', name: '学科竞赛奖项、成绩与参赛角色认定审核', fields: 34, slots: 19, rules: 26, template: t03, metadata: m03 },
  { id: 'S06-T04', name: '学生创新科研成果校级奖励申报审核', fields: 34, slots: 18, rules: 26, template: t04, metadata: m04 },
  { id: 'S06-T06', name: '课程实习、专业实习与毕业实习资格及成果认定', fields: 46, slots: 27, rules: 32, template: t06, metadata: m06 },
  { id: 'S06-T07', name: '学生创业项目孵化、入驻与团队资格审核', fields: 44, slots: 34, rules: 40, template: t07, metadata: m07 },
  { id: 'S06-T08', name: '学生创业扶持资金、创业专项奖励申请审核', fields: 32, slots: 20, rules: 30, template: t08, metadata: m08 },
] as const

describe('R02 S06-B｜五个独立研究模板的 V3 数据合同', () => {
  test('只有指定五个 ID，154 条规则均不合并进相邻模板', () => {
    expect(cases.map(item => item.id)).toEqual(['S06-T03', 'S06-T04', 'S06-T06', 'S06-T07', 'S06-T08'])
    expect(cases.reduce((n, item) => n + item.rules, 0)).toBe(154)
    expect(new Set(cases.map(item => item.metadata.deduplicationBoundary)).size).toBe(cases.length)
  })

  for (const item of cases) {
    test(`${item.id}｜身份、来源 SHA-256 与每个 R 对应的检查`, () => {
      const { template, metadata } = item
      expect(template.templateId).toBe(item.id)
      expect(template.name).toBe(item.name)
      expect(metadata.templateId).toBe(item.id)
      expect(metadata.name).toBe(item.name)
      expect(template.researchSource.path).toBe(metadata.sourcePath)
      expect(template.researchSource.sha256).toBe(metadata.sourceSha256)
      const bytes = readFileSync(resolve(process.cwd(), metadata.sourcePath))
      expect(createHash('sha256').update(bytes).digest('hex')).toBe(metadata.sourceSha256)
      const sourceText = bytes.toString('utf8')
      const sourceIds = new Set(Array.from(sourceText.matchAll(/^\|\s*\*{0,2}(SRC-\d{3})/gm), match => match[1]))
      expect(sourceIds.size).toBeGreaterThan(0)

      expect(template.fields).toHaveLength(item.fields)
      expect(template.materialSlots).toHaveLength(item.slots)
      const criteria = template.sections.flatMap(section => section.criteria)
      expect(criteria).toHaveLength(item.rules)
      const fieldKeys = new Set(template.fields.map(field => field.key))
      const slotIds = new Set(template.materialSlots.map(slot => slot.id))
      const criterionIds = new Set(criteria.map(criterion => criterion.id))
      expect(fieldKeys.size).toBe(item.fields)
      expect(slotIds.size).toBe(item.slots)
      expect(criterionIds.size).toBe(item.rules)
      expect(criteria.map(criterion => criterion.id)).toEqual(
        Array.from({ length: item.rules }, (_, idx) => 'R' + String(idx + 1).padStart(3, '0')),
      )
      const metaById = new Map<string, { fields: readonly string[]; materials: readonly string[]; researchSources: readonly string[] }>()
      for (const rule of metadata.ruleBindings) metaById.set(rule.id, rule)
      for (const criterion of criteria) {
        expect(criterion.requirement.length).toBeGreaterThan(5)
        expect(['semantic', 'manual']).toContain(criterion.execution)
        expect(criterion.policyEvidenceStatus).toBe('UNCONFIRMED')
        expect(criterion.researchBindings.fieldKeys.length + criterion.researchBindings.materialSlotIds.length).toBeGreaterThan(0)
        expect(criterion.researchBindings.fieldKeys.every(key => fieldKeys.has(key))).toBe(true)
        expect(criterion.researchBindings.materialSlotIds.every(id => slotIds.has(id))).toBe(true)
        expect(criterion.researchBindings.researchSourceIds.every(id => sourceIds.has(id))).toBe(true)
        const binding = metaById.get(criterion.id)
        expect(binding).toBeDefined()
        if (!binding) throw new Error(`缺少 ${criterion.id} 的来源绑定元数据`)
        expect(criterion.researchBindings).toEqual({
          fieldKeys: [...binding.fields],
          materialSlotIds: [...binding.materials],
          researchSourceIds: [...binding.researchSources],
        })
      }
      expect(validateTemplate(template).filter(issue => issue.level === 'error')).toEqual([])
    })

    test(`${item.id}｜政策未确认、无自动正式决定与阶段图人工门禁`, () => {
      const { template, metadata } = item
      expect(template.schemaVersion).toBe(2)
      expect(template.status).toBe('draft')
      expect(template.officialSchoolTemplate).toBe(false)
      expect(metadata.officialSchoolTemplate).toBe(false)
      expect(template.policyEvidenceStatus).toBe('UNCONFIRMED')
      expect(metadata.policyEvidenceStatus).toBe('UNCONFIRMED')
      expect(template.policyVersionIds).toEqual([])
      expect(template.policyRefs).toEqual([])
      expect(template.autoPassPolicy?.enabled).toBe(false)
      expect(template.stages.map(stage => stage.id)).toEqual(['intake', 'review', 'decision-review'])
      expect(template.stages.at(-1)?.kind).toBe('manual-review')
      expect(template.stages.at(-1)?.nextStageId).toBeUndefined()
      expect(template.stages.every(stage => stage.workflowOwner !== 'school')).toBe(true)
      expect(template.outputs.every(output => output.kind !== 'approval')).toBe(true)
      expect(template.materialSlots.every(slot => slot.requiredAt === 'decision' && slot.minCount === 0)).toBe(true)
    })
  }
})

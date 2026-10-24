import { describe, expect, it } from 'bun:test'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import type { CaseAggregateV2 } from '@profer/shared'
import { validateTemplate } from '../../template-store'
import { compileTemplatePlanForCase } from '../../review-v3-main-template-plan-bridge'
import { evaluateT04Plan } from '../../review-v3-t04-rules-scoring'
import { r02Metadata, templateVersion } from './T03-T08'

const criteria = templateVersion.sections?.flatMap((section) => section.criteria) ?? []
const fields = new Set(templateVersion.fields.map((field) => field.key))
const slots = new Set(templateVersion.materialSlots.map((slot) => slot.id))
const source = readFileSync(new URL('../../../../../../../../docs/design/review-agent/business-templates/R02/T03-T08.md', import.meta.url))

describe('R02 T03-C 科研外协与委托研究', () => {
  it('保持唯一业务身份、研究稿字节与真实来源元数据', () => {
    expect(templateVersion.templateId).toBe('T03-T08')
    expect(templateVersion.name).toBe('科研外协、技术合作及委托研究立项审核')
    expect(templateVersion.templateId).toBe(r02Metadata.templateId)
    expect(templateVersion.name).toBe(r02Metadata.name)
    expect(r02Metadata.sourceDocumentPath).toBe('docs/design/review-agent/business-templates/R02/T03-T08.md')
    expect(createHash('sha256').update(source).digest('hex')).toBe(r02Metadata.sourceDocumentSha256)
    expect(source.byteLength).toBe(r02Metadata.sourceDocumentBytes)
    expect(Array.from({ length: 18 }, (_, index) => `SRC-${String(index + 1).padStart(3, '0')}`)).toEqual([...r02Metadata.sourceIds])
  })

  it('48 F / 25 M / 27 R 完整、唯一且双向引用可解析', () => {
    expect(fields.size).toBe(48)
    expect(slots.size).toBe(25)
    expect(templateVersion.fields.map((field) => field.key)).toEqual(
      Array.from({ length: 48 }, (_, index) => `f${String(index + 1).padStart(3, '0')}`),
    )
    expect(templateVersion.materialSlots.map((slot) => slot.id)).toEqual(
      Array.from({ length: 25 }, (_, index) => `m${String(index + 1).padStart(3, '0')}`),
    )
    expect(criteria.map((criterion) => criterion.id)).toEqual(
      Array.from({ length: 27 }, (_, index) => `R${String(index + 1).padStart(3, '0')}`),
    )
    expect(r02Metadata.criteria.length).toBe(27)
    const sourceIds = new Set<string>(r02Metadata.sourceIds)
    for (const criterion of criteria) {
      const section = templateVersion.sections?.find((item) => item.criteria.includes(criterion))
      const binding = r02Metadata.criteria.find((item) => item.criterionId === criterion.id)
      expect(section).toBeDefined()
      expect(binding).toBeDefined()
      expect(section?.id).toBe(binding?.sectionId)
      expect(binding?.fieldIds.length).toBeGreaterThan(0)
      expect(binding?.materialSlotIds.length).toBeGreaterThan(0)
      expect(binding?.srcIds.length).toBeGreaterThan(0)
      for (const id of binding?.fieldIds ?? []) expect(fields.has(id.toLowerCase())).toBe(true)
      for (const id of binding?.materialSlotIds ?? []) expect(slots.has(id)).toBe(true)
      for (const id of binding?.srcIds ?? []) expect(sourceIds.has(id)).toBe(true)
    }
  })

  it('V3 原生结构和流程有效，规则均有稳定且唯一的计划标识', () => {
    expect(validateTemplate(templateVersion).filter((issue) => issue.level === 'error')).toEqual([])
    const keys = criteria.map((criterion) => {
      const section = templateVersion.sections?.find((item) => item.criteria.includes(criterion))
      return `section-${section?.id}-${criterion.id}`
    })
    expect(new Set(keys).size).toBe(27)
    expect(criteria.every((criterion) => criterion.execution === 'semantic' || criterion.execution === 'manual')).toBe(true)
    expect(criteria.every((criterion) => criterion.targetScope === 'case')).toBe(true)
    expect(templateVersion.stages.every((stage) => stage.workflowOwner === 'local')).toBe(true)
    expect(templateVersion.stages.every((stage) => ['reviewer', 'teacher'].includes(stage.executorRole))).toBe(true)
  })

  it('合成案卷能冻结 27 条真实 V3 Plan 检查；未知语义不能变成确定通过', () => {
    // 仅为证明编译路径，绝不将仓库草稿实际发布或写入学校后台。
    const syntheticPublished = { ...templateVersion, status: 'published' as const }
    const aggregate = {
      caseV2: {
        id: 'synthetic-t03-t08', templateId: templateVersion.templateId,
        templateVersion: templateVersion.version, caseFields: {}, documents: [], subjects: [],
        reviewRules: [],
      },
      tasks: [], decisions: [], supplements: [], dispositions: [], receiptLog: [],
      observations: [], evidenceLinks: [],
    } as unknown as CaseAggregateV2
    const result = compileTemplatePlanForCase({ aggregate, template: syntheticPublished })
    expect(result.unresolved).toEqual([])
    expect(result.compiled).toBeDefined()
    const compiled = result.compiled!
    expect(compiled.plan.planId.startsWith('plan-')).toBe(true)
    expect(compiled.plan.fingerprint).toMatch(/^[0-9a-f]{64}$/)
    const ruleBindings = compiled.bindings.filter((binding) => binding.rule.id.startsWith('section-'))
    expect(ruleBindings).toHaveLength(27)
    expect(new Set(ruleBindings.map((binding) => binding.binding.checkKey)).size).toBe(27)
    for (const binding of ruleBindings) {
      expect(binding.policyVersionId).toBe(`template:${templateVersion.templateId}@${templateVersion.version}`)
      expect(binding.operation.kind).toBe('unresolved')
      expect(binding.binding.targetKey).toBe('case:synthetic-t03-t08')
      expect(binding.binding.sourceVersionIds).toEqual([])
    }
    const proposals = evaluateT04Plan(compiled.plan, compiled.checks)
    const proposedCriteria = proposals.filter((proposal) => proposal.ruleId.startsWith('section-'))
    expect(proposedCriteria).toHaveLength(27)
    expect(proposedCriteria.every((proposal) => proposal.outcome.status !== 'compliant')).toBe(true)
  })

  it('未知政策与有权决定均保持人工门禁，绝不预设正式通过或拒绝', () => {
    expect(r02Metadata.officialSchoolTemplate).toBe(false)
    expect(r02Metadata.policyEvidenceStatus).toBe('PARTIAL')
    expect(templateVersion.status).toBe('draft')
    expect(templateVersion.policyVersionIds).toEqual([])
    expect(templateVersion.policyRefs).toEqual([])
    expect(templateVersion.autoPassPolicy?.enabled).toBe(false)
    expect(templateVersion.description).toContain('非校方正式模板')
    expect(templateVersion.sourceNote).toContain('R02_RESEARCH_TEMPLATE_NONOFFICIAL')
    expect(templateVersion.outputs.every((output) => output.kind !== 'approval')).toBe(true)
    const byId = (id: string) => criteria.find((criterion) => criterion.id === id)
    for (const id of ['R001', 'R005', 'R007', 'R014', 'R016', 'R018', 'R019', 'R020', 'R024', 'R027']) {
      expect(byId(id)?.execution).toBe('manual')
    }
    expect(byId('R007')?.requirement).toContain('50%')
    expect(byId('R007')?.requirement).toContain('不自动拒绝')
    expect(byId('R014')?.requirement).toContain('T04')
    expect(byId('R020')?.requirement).toContain('不自己产生批准')
  })

  it('涉密与支付仅接受脱敏令牌/元数据；未来签发与验收不作初审缺件', () => {
    for (const id of ['m013', 'm025']) {
      const slot = templateVersion.materialSlots.find((item) => item.id === id)
      expect(slot?.purpose).toContain('禁止上传任何国家秘密原件')
      expect(slot?.acceptedKinds).toEqual(['text'])
      expect(slot?.minCount).toBe(0)
    }
    const paymentSlot = templateVersion.materialSlots.find((item) => item.id === 'm018')
    expect(paymentSlot?.purpose).toContain('不收集或展示完整银行账号')
    for (const id of ['m015', 'm016', 'm017', 'm018', 'm019', 'm020']) {
      const slot = templateVersion.materialSlots.find((item) => item.id === id)
      expect(slot?.minCount).toBe(0)
      expect(slot?.requiredAt).toBe('decision')
    }
    for (const id of ['m003', 'm004', 'm005', 'm008', 'm010']) {
      expect(templateVersion.materialSlots.find((slot) => slot.id === id)?.requiredAt).toBe('decision')
    }
  })
})

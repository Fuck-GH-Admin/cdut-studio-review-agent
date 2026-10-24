import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, test } from 'bun:test'
import { validateTemplate } from '../../template-store'
import { r02Metadata, templateVersion as template } from './T07-T07'

const criteria = template.sections?.flatMap((section) => section.criteria) ?? []
const criterionById = new Map(criteria.map((criterion) => [criterion.id, criterion]))
const fields = new Set(template.fields.map((field) => field.key))
const slots = new Set(template.materialSlots.map((slot) => slot.id))
const sources = new Set(r02Metadata.sources.map((source) => source.sourceId))

describe('R02 T07-C｜校内信息公开申请和保密披露范围审核', () => {
  test('唯一身份、研究稿哈希和 SRC/F/M/R 与正式原稿一致', () => {
    expect(template.templateId).toBe('T07-T07')
    expect(template.name).toBe('校内信息公开申请和保密披露范围审核')
    expect(template.version).toBe(1)
    expect(template.schemaVersion).toBe(2)
    expect(template.catalogKind).toBe('builtin')
    expect(template.status).toBe('draft')
    expect(r02Metadata.templateId).toBe(template.templateId)
    expect(r02Metadata.name).toBe(template.name)
    expect(r02Metadata.sourceDocumentPath).toBe('docs/design/review-agent/business-templates/R02/T07-T07.md')

    const file = resolve(import.meta.dir, '../../../../../../../../', r02Metadata.sourceDocumentPath)
    const source = readFileSync(file)
    expect(createHash('sha256').update(source).digest('hex')).toBe(r02Metadata.sourceDocumentSha256)
    const text = source.toString('utf8')
    expect(text).toContain('`template_id` | `T07-T07`')
    expect(text).toContain('RESEARCH_HANDOFF_READY')
    expect(text.match(/^\| SRC-\d{3} \|/gm)).toHaveLength(15)
    expect(text.match(/^\| F\d{3} \|/gm)).toHaveLength(34)
    expect(text.match(/^\| M\d{3} \|/gm)).toHaveLength(22)
    expect(text.match(/^\| R\d{3} \|/gm)).toHaveLength(29)
  })

  test('29项均为真实 criterion，引用字段、材料和来源有效', () => {
    expect(template.fields).toHaveLength(34)
    expect(template.materialSlots).toHaveLength(22)
    expect(criteria).toHaveLength(29)
    expect(r02Metadata.sources).toHaveLength(15)
    expect(r02Metadata.criteria).toHaveLength(29)
    expect(fields.size).toBe(34)
    expect(slots.size).toBe(22)
    expect(new Set(criteria.map((criterion) => criterion.id)).size).toBe(29)

    const metadataKeys = new Set<string>()
    for (const entry of r02Metadata.criteria) {
      const key = entry.sectionId + ':' + entry.criterionId
      expect(metadataKeys.has(key)).toBe(false)
      metadataKeys.add(key)
      expect(entry.sectionId).toBe('rule-checks')
      expect(criterionById.has(entry.criterionId)).toBe(true)
      expect(entry.sourceIds.length).toBeGreaterThan(0)
      expect(entry.sourceIds.every((sourceId) => sources.has(sourceId))).toBe(true)
      expect(['VERIFIED', 'PARTIAL', 'UNCONFIRMED']).toContain(entry.evidenceStatus)
    }
    for (const criterion of criteria) {
      expect(criterion.targetScope).toBe('case')
      expect(['semantic', 'manual']).toContain(criterion.execution)
      expect(criterion.dataCheck).toBeUndefined()
      for (const fieldId of criterion.requirement.match(/\bF\d{3}\b/g) ?? []) expect(fields.has(fieldId)).toBe(true)
      for (const slotId of criterion.requirement.match(/\bM\d{3}\b/g) ?? []) expect(slots.has(slotId)).toBe(true)
      expect(criterion.requirement).toContain('PASS_FACT 仅为事实成立')
    }
    expect(validateTemplate(template).filter((issue) => issue.level === 'error')).toEqual([])
  })

  test('把受理、定位、保密/隐私审查、签发与实际送达分成不同阶段', () => {
    expect(template.stages.map((stage) => stage.id)).toEqual(['intake', 'locate', 'scope', 'reply', 'delivery', 'archive'])
    expect(template.stages.map((stage) => stage.kind)).toEqual([
      'manual-review', 'manual-review', 'manual-review', 'manual-review', 'manual-review', 'finalize',
    ])
    expect(template.stages.every((stage) => stage.workflowOwner === 'local')).toBe(true)
    expect(template.stages.every((stage, i) => stage.nextStageId === template.stages[i + 1]?.id)).toBe(true)
    expect(template.stages.every((stage) => ['reviewer', 'teacher'].includes(stage.executorRole))).toBe(true)
    for (const id of ['R010', 'R011', 'R012', 'R013', 'R014', 'R015', 'R016', 'R017', 'R018', 'R019', 'R020', 'R021', 'R022', 'R027', 'R028']) {
      expect(criterionById.get(id)?.execution).toBe('manual')
    }
  })

  test('保密原件与校方后置签批材料不可作为普通模型附件或P1缺件门槛', () => {
    for (const id of ['M002', 'M007', 'M008', 'M009', 'M012', 'M013', 'M014', 'M015', 'M022']) {
      const slot = template.materialSlots.find((item) => item.id === id)
      expect(slot?.acceptedKinds).toEqual(['text'])
      expect(slot?.minCount).toBe(0)
      expect(slot?.requiredAt).toBe('decision')
      expect(slot?.requiredElements.join(' ')).toContain('不得上传身份证影像、涉密原件')
    }
    expect(template.materialSlots.every((slot) => slot.minCount === 0)).toBe(true)
    expect(template.fields.every((field) => field.required === false)).toBe(true)
    expect(template.sourceNote).toContain('涉密原件和完整身份证明禁止进入通用模型')
  })

  test('政策未确认不自动批准、不自动拒绝、不发布或送达', () => {
    expect(r02Metadata.officialSchoolTemplate).toBe(false)
    expect(r02Metadata.researchStatus).toBe('RESEARCH_HANDOFF_READY')
    expect(r02Metadata.policyEvidenceStatus).toBe('PARTIAL')
    expect(template.description).toContain('本地研究模板 · 非校方正式模板')
    expect(template.sourceNote?.startsWith('R02_RESEARCH_TEMPLATE_NONOFFICIAL:')).toBe(true)
    expect(template.policyVersionIds).toEqual([])
    expect(template.policyRefs).toBeUndefined()
    expect(template.autoPassPolicy?.enabled).toBe(false)
    expect(template.outputs.every((output) => output.kind !== 'approval')).toBe(true)
    expect(criteria.every((criterion) => criterion.execution !== 'deterministic')).toBe(true)
    expect(criterionById.get('R018')?.requirement).toContain('POLICY_UNCONFIRMED')
    expect(criterionById.get('R022')?.requirement).toContain('送达')
    expect(template.stages.every((stage) => stage.workflowOwner !== 'school')).toBe(true)
  })
})

import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'bun:test'
import { validateTemplate } from '../../template-store'
import { r02Metadata, templateVersion } from './S01-T04'

const reviewSourcePath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../../../../../../',
  r02Metadata.sourceDocumentPath,
)
const everyCriterion = (templateVersion.sections ?? []).flatMap((section) =>
  section.criteria.map((criterion) => ({ sectionId: section.id, criterion })))

describe('R02 S01-C / S01-T04', () => {
  test('唯一 ID、名称与 36F/24M/29R/15SRC 完整覆盖研究稿', () => {
    expect(templateVersion.templateId).toBe('S01-T04')
    expect(templateVersion.name).toBe('转专业及专业身份变更申请审核')
    expect(templateVersion.fields).toHaveLength(36)
    expect(templateVersion.materialSlots).toHaveLength(24)
    expect(everyCriterion).toHaveLength(29)
    expect(r02Metadata.sources).toHaveLength(15)
    expect(r02Metadata.scenarios).toHaveLength(11)

    const source = readFileSync(reviewSourcePath, 'utf8')
    for (const [prefix, expected] of [['F', 36], ['M', 24], ['R', 29]] as const) {
      const idPattern = new RegExp('^\\| (' + prefix + '\\d{3})\\b', 'gm')
      expect([...source.matchAll(idPattern)]).toHaveLength(expected)
    }
    expect([...source.matchAll(/^\| SRC-\d{3} \|/gm)]).toHaveLength(15)
    expect(new Set(templateVersion.fields.map((f) => f.key)).size).toBe(36)
    expect(new Set(templateVersion.materialSlots.map((m) => m.id)).size).toBe(24)
    expect(new Set(everyCriterion.map((c) => c.criterion.id)).size).toBe(29)
    expect(new Set(r02Metadata.sources.map((s) => s.srcId)).size).toBe(15)
  })

  test('校验器无错误、材料及规则关联均存在', () => {
    expect(validateTemplate(templateVersion).filter((issue) => issue.level === 'error')).toEqual([])
    const fields = new Set(templateVersion.fields.map((field) => field.key))
    const slots = new Set(templateVersion.materialSlots.map((slot) => slot.id))
    const sections = new Set((templateVersion.sections ?? []).map((section) => section.id))
    const sourceIds = new Set(r02Metadata.sources.map((item) => item.srcId))
    expect(r02Metadata.criteria).toHaveLength(everyCriterion.length)

    for (const mapping of r02Metadata.criteria) {
      expect(sections.has(mapping.sectionId)).toBe(true)
      expect(everyCriterion.some((entry) => entry.sectionId === mapping.sectionId && entry.criterion.id === mapping.criterionId)).toBe(true)
      expect(mapping.fieldIds.length).toBeGreaterThan(0)
      expect(mapping.materialSlotIds.length).toBeGreaterThan(0)
      for (const id of mapping.fieldIds) expect(fields.has(id)).toBe(true)
      for (const id of mapping.materialSlotIds) expect(slots.has(id)).toBe(true)
      for (const id of mapping.srcIds) expect(sourceIds.has(id)).toBe(true)
      expect(mapping.evidenceStatus).toBe('PARTIAL')
      expect(mapping.policyDecisionGate).toBe('NEEDS_HUMAN_DECISION')
    }
    for (const entry of everyCriterion) {
      const mappings = r02Metadata.criteria.filter((m) => m.sectionId === entry.sectionId && m.criterionId === entry.criterion.id)
      expect(mappings).toHaveLength(1)
      const mapping = mappings[0]!
      for (const id of entry.criterion.requirement.match(/\bF\d{3}\b/g) ?? []) expect(fields.has(id)).toBe(true)
      for (const id of entry.criterion.requirement.match(/\bM\d{3}\b/g) ?? []) expect(slots.has(id)).toBe(true)
      for (const id of mapping.fieldIds) expect(entry.criterion.requirement).toContain(id)
      for (const id of mapping.materialSlotIds) expect(entry.criterion.requirement).toContain(id)
    }
  })

  test('SHA-256 指向真正纳入 PR 的 canonical 全文', () => {
    const sourceBytes = readFileSync(reviewSourcePath)
    expect(r02Metadata.sourceDocumentPath).toBe('docs/design/review-agent/business-templates/R02/S01-T04.md')
    expect(createHash('sha256').update(sourceBytes).digest('hex')).toBe(r02Metadata.sourceDocumentSha256)
    expect(r02Metadata.sourceDocumentSha256).toMatch(/^[a-f0-9]{64}$/)
    expect(String(r02Metadata.templateId)).toBe(String(templateVersion.templateId))
    expect(String(r02Metadata.name)).toBe(String(templateVersion.name))
    expect(r02Metadata.officialSchoolTemplate).toBe(false)
    expect(r02Metadata.policyEvidenceStatus).toBe('PARTIAL')
  })

  test('流程阶段唯一、可达、无顺向循环且没有学校角色冒充', () => {
    const ids = templateVersion.stages.map((stage) => stage.id)
    expect(new Set(ids).size).toBe(ids.length)
    const graph = new Map(templateVersion.stages.map((stage) => [stage.id, stage]))
    let cursor: string | undefined = ids[0]
    const seen = new Set<string>()
    while (cursor) {
      expect(seen.has(cursor)).toBe(false)
      seen.add(cursor)
      cursor = graph.get(cursor)?.nextStageId
    }
    expect(seen.size).toBe(ids.length)
    for (const stage of templateVersion.stages) {
      expect(stage.workflowOwner).toBe('local')
      expect(['reviewer', 'system']).toContain(stage.executorRole)
      if (stage.returnToStageId) expect(graph.has(stage.returnToStageId)).toBe(true)
    }
  })

  test('C07 学校调整不伪造自愿申报、后置 M013–M020 不阻断首次预审', () => {
    expect(r02Metadata.scenarios).toContain('C07')
    const application = templateVersion.materialSlots.find((slot) => slot.id === 'M001')!
    expect(application.minCount).toBe(0)
    for (let n = 13; n <= 20; n++) {
      const id = 'M' + String(n).padStart(3, '0')
      const slot = templateVersion.materialSlots.find((item) => item.id === id)!
      expect(slot.requiredAt).toBe('decision')
      expect(slot.minCount).toBe(0)
    }
    expect(everyCriterion.find((c) => c.criterion.id === 'R026')?.criterion.execution).toBe('manual')
  })

  test('校本规则未知不得自动准入/拒绝，不伪造 PolicyVersion 和学校决定', () => {
    expect(templateVersion.status).toBe('draft')
    expect(templateVersion.schemaVersion).toBe(2)
    expect(templateVersion.policyVersionIds).toEqual([])
    expect(templateVersion.policyRefs ?? []).toEqual([])
    expect(templateVersion.autoPassPolicy).toEqual({ enabled: false })
    expect(templateVersion.outputs.every((output) => output.kind !== 'approval')).toBe(true)
    expect(everyCriterion.every((entry) => entry.criterion.execution !== 'deterministic')).toBe(true)
    expect(templateVersion.description).toContain('非校方正式模板')
    expect(templateVersion.sourceNote).toContain('R02_RESEARCH_TEMPLATE_NONOFFICIAL:')
    expect(templateVersion.stages.at(-1)?.kind).toBe('handoff')
    expect(r02Metadata.policyBinding).toBe('UNBOUND')
    expect(r02Metadata.schoolApproval).toBe('NOT_GRANTED')
    expect(JSON.stringify(templateVersion)).not.toMatch(/"workflowOwner":"school"/)
  })
})

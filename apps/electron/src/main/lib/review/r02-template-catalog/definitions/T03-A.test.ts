import { describe, expect, it } from 'bun:test'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { validateTemplate } from '../../template-store'
import { templateVersion as t01, r02Metadata as m01 } from './T03-T01'
import { templateVersion as t02, r02Metadata as m02 } from './T03-T02'
import { templateVersion as t03, r02Metadata as m03 } from './T03-T03'
import { templateVersion as t04, r02Metadata as m04 } from './T03-T04'
import { templateVersion as t05, r02Metadata as m05 } from './T03-T05'

const batch = [
  { template: t01, metadata: m01, expectedId: 'T03-T01', expectedName: '纵向科研项目申报、负责人资格和推荐审核' },
  { template: t02, metadata: m02, expectedId: 'T03-T02', expectedName: '纵向科研项目立项任务书与责任承担审核' },
  { template: t03, metadata: m03, expectedId: 'T03-T03', expectedName: '横向科研合同立项与研究合同内容审核' },
  { template: t04, metadata: m04, expectedId: 'T03-T04', expectedName: '科研项目预算调整申请与变更权限审核' },
  { template: t05, metadata: m05, expectedId: 'T03-T05', expectedName: '科研项目研究内容、成员、负责人及期限变更审核' },
]

describe('R02 T03-A template definitions', () => {
  it('preserves the five fixed template IDs and official names', () => {
    expect(batch.map((entry) => entry.template.templateId)).toEqual(batch.map((entry) => entry.expectedId))
    expect(batch.map((entry) => entry.template.name)).toEqual(batch.map((entry) => entry.expectedName))
    expect(new Set(batch.map((entry) => entry.template.templateId)).size).toBe(5)
    expect(new Set(batch.map((entry) => entry.template.name)).size).toBe(5)
  })

  for (const { template, metadata, expectedId, expectedName } of batch) {
    it(`${expectedId} has a valid, conservative draft definition`, () => {
      expect(template.schemaVersion).toBe(2)
      expect(template.name).toBe(expectedName)
      expect(template.catalogKind).toBe('builtin')
      expect(template.status).toBe('draft')
      expect(template.policyVersionIds).toEqual([])
      expect(template.policyRefs ?? []).toEqual([])
      expect(template.autoPassPolicy?.enabled).toBe(false)
      expect(template.sourceNote?.startsWith('R02_RESEARCH_TEMPLATE_NONOFFICIAL:')).toBe(true)
      expect(template.description).toContain('本地研究模板 · 非校方正式模板')
      expect(template.stages.length).toBeGreaterThan(0)
      expect(template.stages.every((stage) => stage.workflowOwner === 'local')).toBe(true)
      expect(template.stages.every((stage) => stage.executorRole === 'reviewer' || stage.executorRole === 'teacher')).toBe(true)
      expect(template.sections?.length).toBeGreaterThan(0)
      expect(validateTemplate(template).filter((issue) => issue.level === 'error')).toEqual([])

      const fields = new Set(template.fields.map((field) => field.key))
      expect(fields.size).toBe(template.fields.length)
      const slots = new Set(template.materialSlots.map((slot) => slot.id))
      expect(slots.size).toBe(template.materialSlots.length)
      expect(template.fields.every((field) => !field.sectionId || template.sections?.some((section) => section.id === field.sectionId))).toBe(true)
      expect(template.materialSlots.every((slot) => !slot.sectionId || template.sections?.some((section) => section.id === slot.sectionId))).toBe(true)

      const stages = new Map(template.stages.map((stage) => [stage.id, stage]))
      expect(stages.size).toBe(template.stages.length)
      for (const stage of template.stages) {
        expect(!stage.nextStageId || stages.has(stage.nextStageId)).toBe(true)
        expect(!stage.returnToStageId || stages.has(stage.returnToStageId)).toBe(true)
      }
      const reached = new Set<string>()
      let cursor: string | undefined = template.stages[0]?.id
      while (cursor) {
        expect(reached.has(cursor)).toBe(false)
        reached.add(cursor)
        cursor = stages.get(cursor)?.nextStageId
      }
      expect(reached.size).toBe(template.stages.length)

      const criteria = template.sections?.flatMap((section) => section.criteria) ?? []
      expect(criteria.length).toBeGreaterThan(0)
      expect(criteria.every((criterion) => criterion.execution === 'semantic' || criterion.execution === 'manual')).toBe(true)
      expect(new Set(criteria.map((criterion) => criterion.id)).size).toBe(criteria.length)
      expect(String(metadata.templateId)).toBe(expectedId)
      expect(String(metadata.name)).toBe(template.name)
      expect(metadata.officialSchoolTemplate).toBe(false)
      expect(metadata.policyEvidenceStatus).toBe('PARTIAL')
      expect(metadata.sourceDocumentPath).toContain(`/R02/${expectedId}.md`)
      expect(metadata.sourceDocumentSha256).toMatch(/^[a-f0-9]{64}$/)
      expect(Number(metadata.criteria.length)).toBe(criteria.length)
      for (const criterion of criteria) {
        const evidence = metadata.criteria.find((entry) => entry.criterionId === criterion.id)
        expect(evidence).toBeDefined()
        expect(evidence?.sectionId).toBe('review-rules')
        expect(evidence?.srcIds.every((srcId) => /^SRC-\d{3}$/.test(srcId))).toBe(true)
        expect(['VERIFIED', 'PARTIAL', 'UNCONFIRMED']).toContain(String(evidence?.evidenceStatus))
      }
    })
  }

  it('T03-T03 P1 gate keeps unknown school authority out of formal decisions', () => {
    expect(t03.status).toBe('draft')
    expect(t03.autoPassPolicy?.enabled).toBe(false)
    expect(t03.policyVersionIds).toEqual([])
    expect(t03.policyRefs ?? []).toEqual([])
    expect(m03.officialSchoolTemplate).toBe(false)
    expect(m03.authoringStatus).toBe('ROUND3_DRAFT')
    expect(m03.policyEvidenceStatus).toBe('PARTIAL')
    expect(m03.policySafetyGate.mode).toBe('DRAFT_FACT_REVIEW_ONLY')
    expect(m03.policySafetyGate.unknownAuthorityResult).toBe('POLICY_UNCONFIRMED')
    expect(m03.policySafetyGate.finalDecisionOwner).toBe('VERIFIED_SCHOOL_AUTHORITY_ONLY')
    expect(m03.policySafetyGate.signatureAndSeal).toBe('HUMAN_VERIFICATION_REQUIRED')
    expect(m03.policySafetyGate.unconfirmedSourceIds).toEqual(['SRC-002', 'SRC-003', 'SRC-004', 'SRC-006', 'SRC-008'])
    expect(m03.policySafetyGate.forbiddenOutputs).toEqual([
      'FORMAL_APPROVAL', 'FORMAL_REJECTION', 'SIGNATURE_AUTHORIZATION', 'SEAL_AUTHORIZATION',
    ])
    expect(t03.outputs.every((output) => String(output.kind) !== 'decision')).toBe(true)
    expect(t03.sourceNote).toContain('签字或用印决定')

    const criteria = new Map((t03.sections ?? []).flatMap((section) => section.criteria).map((criterion) => [criterion.id, criterion] as const))
    for (const ruleId of m03.policySafetyGate.humanOnlyCriterionIds) {
      const criterion = criteria.get(ruleId)
      expect(criterion?.execution).toBe('manual')
      expect(criterion?.requirement).toContain('POLICY_UNCONFIRMED')
      expect(criterion?.requirement).toContain('NEEDS_HUMAN_DECISION')
      expect(m03.criteria.find((entry) => entry.criterionId === ruleId)?.evidenceStatus).not.toBe('VERIFIED')
    }
    for (const ruleId of ['R017', 'R018', 'R019', 'R020']) {
      expect(criteria.get(ruleId)?.requirement).toMatch(/不得|不可|不签发/)
    }
  })

  it('T03-T03 source hashes and F/M/R/SRC IDs remain traceable after the P1 amendment', () => {
    const repoRoot = resolve(import.meta.dir, '../../../../../../../../')
    const source = readFileSync(resolve(repoRoot, m03.sourceDocumentPath))
    const original = readFileSync(resolve(repoRoot, m03.sourceOriginalPath))
    const sha256 = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex')
    expect(source.byteLength).toBe(m03.sourceDocumentBytes)
    expect(sha256(source)).toBe(m03.sourceDocumentSha256)
    expect(sha256(Buffer.concat([original, Buffer.from('\n')]))).toBe(m03.sourceOriginalNormalizedSha256)
    const markdown = source.toString('utf8')
    expect(markdown).toContain('template_id: T03-T03')
    expect(markdown).toContain('name: 横向科研合同立项与研究合同内容审核')
    expect(markdown).toContain('authoring_status: ROUND3_DRAFT')
    expect(markdown).toContain('T03-A-005 安全返修')
    expect(t03.fields.map((field) => field.key)).toEqual(Array.from({ length: 44 }, (_, i) => `f${String(i + 1).padStart(3, '0')}`))
    expect(t03.materialSlots.map((slot) => slot.id)).toEqual(Array.from({ length: 20 }, (_, i) => `m${String(i + 1).padStart(3, '0')}`))
    expect(m03.criteria.map((criterion) => criterion.criterionId)).toEqual(Array.from({ length: 26 }, (_, i) => `R${String(i + 1).padStart(3, '0')}`))
    for (const criterion of m03.criteria) {
      expect(markdown).toContain(criterion.criterionId)
      for (const sourceId of criterion.srcIds) expect(markdown).toContain(sourceId)
    }
  })
})

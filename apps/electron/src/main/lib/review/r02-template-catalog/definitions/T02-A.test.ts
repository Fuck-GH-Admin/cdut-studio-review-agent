import { describe, expect, test } from 'bun:test'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import type { TemplateVersion } from '@profer/shared'
import { validateTemplate } from '../../template-store'
import { r02Metadata as m01, templateVersion as t01 } from './T02-T01'
import { r02Metadata as m02, templateVersion as t02 } from './T02-T02'
import { r02Metadata as m03, templateVersion as t03 } from './T02-T03'
import { r02Metadata as m04, templateVersion as t04 } from './T02-T04'

const entries = [
  { template: t01, metadata: m01, name: '新教职工入职资格和入职材料审核', counts: [49, 30, 32, 20], manifestSha: '223367af99159d053d5fde29a2eafbe29aa0f7e0a31a4b1bc9fef2c0e458e54c' },
  { template: t02, metadata: m02, name: '教职工试用期考核、转正申请审核', counts: [41, 21, 30, 16], manifestSha: '2b4e21fed022dc6d112d8f6bb828454a639f627ccc6092708b3512bb5e367baa' },
  { template: t03, metadata: m03, name: '教职工岗位聘任、等级晋升及岗位调整审核', counts: [43, 26, 32, 24], manifestSha: '4b729564b5635237828baaf5f84eb1ebbf2a2b069ad044cf0fb7864f7ef94194' },
  { template: t04, metadata: m04, name: '专业技术职称评审与申报材料审核', counts: [41, 29, 36, 22], manifestSha: '3aebb4d189003e8c065f56c97c54a62b6ea1d66658d4e813cfc481fabcacecdd' },
] as const

function fileHash(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

function sourceReferences(requirement: string): string[] {
  const result = new Set<string>()
  for (const matched of requirement.matchAll(/SRC-\d{3}(?:\s*\/\s*\d{3})*/g)) {
    const parts = matched[0].replaceAll(' ', '').split('/')
    result.add(parts[0]!)
    for (const shortId of parts.slice(1)) result.add(`SRC-${shortId}`)
  }
  return [...result].sort()
}

describe('R02 T02-A 四项教师人事研究模板', () => {
  test('唯一身份与来源字节校验，不混入未取得正式研究稿的 T02-T08', () => {
    expect(entries.map(e => e.template.templateId)).toEqual(['T02-T01', 'T02-T02', 'T02-T03', 'T02-T04'])
    expect(new Set(entries.map(e => e.template.templateId)).size).toBe(4)
    expect(new Set(entries.map(e => e.template.name)).size).toBe(4)

    for (const { template, metadata, name, counts, manifestSha } of entries) {
      expect(template.name).toBe(name)
      expect(template.templateId).toBe(metadata.templateId)
      expect(template.name).toBe(metadata.name)
      expect(String(metadata.sourceDocumentPath)).toBe(`docs/design/review-agent/business-templates/R02/${template.templateId}.md`)
      expect(String(metadata.originalSourceDocumentPath)).toBe(`docs/design/review-agent/business-templates/R02/research-original/${template.templateId}.md`)
      expect(metadata.sourceDocumentSha256).toMatch(/^[a-f0-9]{64}$/)
      expect(metadata.originalSourceSha256).toMatch(/^[a-f0-9]{64}$/)
      expect(fileHash(metadata.sourceDocumentPath)).toBe(metadata.sourceDocumentSha256)
      expect(metadata.sourceDocumentSha256).toBe(manifestSha)
      expect(fileHash(metadata.originalSourceDocumentPath)).toBe(metadata.originalSourceSha256)
      expect(readFileSync(metadata.sourceDocumentPath).equals(Buffer.concat([readFileSync(metadata.originalSourceDocumentPath), Buffer.from('\n')]))).toBe(true)
      expect([template.fields.length, template.materialSlots.length, template.sections?.[0]?.criteria.length, metadata.sources.length]).toEqual([...counts])
    }
  })

  test('V3 原生 TemplateVersion 结构与人工决定门禁', () => {
    for (const { template, metadata } of entries) {
      expect(template.schemaVersion).toBe(2)
      expect(template.catalogKind).toBe('builtin')
      expect(template.status).toBe('draft')
      expect(template.policyVersionIds).toEqual([])
      expect(template.autoPassPolicy?.enabled).toBe(false)
      expect(template.description).toContain('本地研究模板 · 非校方正式模板')
      expect(template.sourceNote?.startsWith('R02_RESEARCH_TEMPLATE_NONOFFICIAL:')).toBe(true)
      expect(metadata.officialSchoolTemplate).toBe(false)
      expect(metadata.policyEvidenceStatus).toBe('PARTIAL')
      expect(validateTemplate(template).filter(i => i.level === 'error')).toEqual([])
      expect(template.stages.every(s => s.workflowOwner === 'local')).toBe(true)
      expect(template.stages.every(s => s.executorRole === 'reviewer' || s.executorRole === 'teacher')).toBe(true)
      expect(template.stages.at(-1)?.kind).toBe('finalize')
    }
  })

  test('F/M/R/SRC 唯一且逐条有真实源稿绑定，不把研究来源当案卷 SourceRef', () => {
    for (const { template, metadata } of entries) {
      const fields = new Set(template.fields.map(f => f.key))
      const slots = new Set(template.materialSlots.map(m => m.id))
      const sourceIds = new Set(metadata.sources.map(s => s.id))
      const criteria = template.sections?.flatMap(s => s.criteria) ?? []
      const criterionIds = new Set(criteria.map(c => c.id))
      expect(fields.size).toBe(template.fields.length)
      expect(slots.size).toBe(template.materialSlots.length)
      expect(criterionIds.size === criteria.length).toBe(true)
      expect(metadata.criteria.length === criteria.length).toBe(true)
      expect(sourceIds.size).toBe(metadata.sources.length)
      expect(metadata.restrictedReferenceOnlySlotIds.length).toBeGreaterThan(0)

      for (const item of criteria) {
        expect(item.execution).toBe('manual')
        expect(item.requirement).toContain(item.id)
        const ref = metadata.criteria.find(c => c.sectionId === 'rules' && c.criterionId === item.id)
        expect(ref).toBeDefined()
        expect(ref!.sourceIds.length).toBeGreaterThan(0)
        expect(ref!.evidenceStatus).toBe('UNCONFIRMED')
        expect([...ref!.sourceIds].sort().join(',')).toBe(sourceReferences(item.requirement).join(','))
        for (const id of ref!.sourceIds) expect(sourceIds.has(id)).toBe(true)
        for (const id of item.requirement.match(/\bF\d{3}\b/g) ?? []) expect(fields.has(id)).toBe(true)
        for (const id of item.requirement.match(/\bM\d{3}\b/g) ?? []) expect(slots.has(id)).toBe(true)
      }
      const restrictedIds = new Set<string>(metadata.restrictedReferenceOnlySlotIds)
      for (const slot of template.materialSlots) {
        expect(slot.minCount).toBe(0) // 后置记录和条件项不可被错误地强制上传
        expect(slot.allowReuseAcrossSubjects).toBe(false)
        if (restrictedIds.has(slot.id)) {
          expect(slot.acceptedKinds).toEqual([])
          expect(slot.purpose).toContain('禁止向通用上传/模型提交敏感原文')
        }
      }
    }
  })

  test('阶段图线性可达且没有悬空引用；非主线撤回、申诉由规则人工处理', () => {
    for (const { template } of entries) {
      const stages = template.stages
      const ids = new Set(stages.map(s => s.id))
      expect(ids.size).toBe(stages.length)
      let current: string | undefined = stages[0]?.id
      const visited = new Set<string>()
      while (current) {
        expect(ids.has(current)).toBe(true)
        expect(visited.has(current)).toBe(false)
        visited.add(current)
        current = stages.find(s => s.id === current)?.nextStageId
      }
      expect(visited.size).toBe(stages.length)
      for (const stage of stages) if (stage.returnToStageId) expect(ids.has(stage.returnToStageId)).toBe(true)
    }
  })
})

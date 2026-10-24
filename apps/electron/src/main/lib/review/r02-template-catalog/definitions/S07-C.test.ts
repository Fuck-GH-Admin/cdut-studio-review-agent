import { describe, expect, test } from 'bun:test'
import { validateTemplate } from '../../template-store'
import { templateVersion, r02Metadata } from './S07-T09'

describe('R02 S07-C · 推免资格本地研究模板', () => {
  test('源稿的唯一正式 ID、名称与 47/26/36 连续引用', () => {
    expect(templateVersion.templateId).toBe('S07-T09')
    expect(templateVersion.name).toBe("优秀应届本科毕业生推荐免试攻读研究生（推免）资格审核")
    expect(templateVersion.fields.map(x=>x.key)).toEqual(Array.from({length:47},(_,i)=>'F'+String(i+1).padStart(3,'0')))
    expect(templateVersion.materialSlots.map(x=>x.id)).toEqual(Array.from({length:26},(_,i)=>'M'+String(i+1).padStart(3,'0')))
    const criteria = templateVersion.sections?.flatMap(x=>x.criteria) ?? []
    expect(criteria.map(x=>x.id)).toEqual(Array.from({length:36},(_,i)=>'R'+String(i+1).padStart(3,'0')))
    expect(r02Metadata.criteria.map(x=>x.criterionId)).toEqual(criteria.map(x=>x.id))
  })
  test('结构校验、来源/材料/字段均无悬空引用', () => {
    expect(validateTemplate(templateVersion).filter(x=>x.level==='error')).toEqual([])
    const fs = new Set(templateVersion.fields.map(x=>x.key))
    const ms = new Set(templateVersion.materialSlots.map(x=>x.id))
    for(const criterion of templateVersion.sections?.flatMap(x=>x.criteria) ?? []) {
      for(const match of criterion.requirement.matchAll(/\b(F\d{3})\b/g)) expect(fs.has(match[1]!)).toBe(true)
      for(const match of criterion.requirement.matchAll(/\b(M\d{3})\b/g)) expect(ms.has(match[1]!)).toBe(true)
      const meta = r02Metadata.criteria.find(x=>x.criterionId===criterion.id)
      expect(meta?.sectionId).toBe('rules')
      expect(meta?.sourceIds.length).toBeGreaterThan(0)
      for(const src of meta?.sourceIds ?? []) expect(r02Metadata.sourceStatus[src]).toBeDefined()
    }
  })
  test('阶段图全覆盖且无校方工作流写入', () => {
    const stages=templateVersion.stages, ids=new Set(stages.map(x=>x.id))
    expect(ids.size).toBe(7)
    expect(stages[0]?.id).toBe('p0-policy')
    expect(stages[stages.length-1]?.id).toBe('p6-local-review')
    for(const stage of stages) {
      if(stage.nextStageId) expect(ids.has(stage.nextStageId)).toBe(true)
      if(stage.returnToStageId) expect(ids.has(stage.returnToStageId)).toBe(true)
      expect(stage.workflowOwner).toBe('local')
      expect(['reviewer','teacher']).toContain(stage.executorRole)
    }
  })
  test('年度政策、材料形成阶段、学院/学校/平台分立且无自动正式结论', () => {
    expect(templateVersion.schemaVersion).toBe(2)
    expect(templateVersion.catalogKind).toBe('builtin')
    expect(templateVersion.status).toBe('draft')
    expect(templateVersion.policyVersionIds).toEqual([])
    expect(templateVersion.autoPassPolicy?.enabled).toBe(false)
    expect(templateVersion.outputs.every(x=>x.kind!=='approval')).toBe(true)
    expect(r02Metadata.officialSchoolTemplate).toBe(false)
    expect(r02Metadata.policyEvidenceStatus).toBe('PARTIAL')
    expect(templateVersion.sourceNote?.startsWith('R02_RESEARCH_TEMPLATE_NONOFFICIAL:')).toBe(true)
    expect(r02Metadata.sourceDocumentSha256).toBe('9d9f48542f61b89d9b46f44ed9485271a632c0912ac2aaa4408002a421aea8d0')
    expect(r02Metadata.researchOriginalSha256).toBe('9d9f48542f61b89d9b46f44ed9485271a632c0912ac2aaa4408002a421aea8d0')
    const criteria=templateVersion.sections?.flatMap(x=>x.criteria) ?? []
    expect(criteria.every(x=>x.execution==='manual' && x.targetScope==='case')).toBe(true)
    expect(criteria.every(x=>x.requirement.includes('其他届别必须先取得新政策'))).toBe(true)
    for(const id of ['M017','M018','M020']) {
      expect(templateVersion.materialSlots.find(x=>x.id===id)?.minCount).toBe(0)
      expect(templateVersion.materialSlots.find(x=>x.id===id)?.requiredAt).toBe('decision')
    }
    expect(criteria.find(x=>x.id==='R010')?.requirement).toContain('2026年9月1日')
    expect(criteria.find(x=>x.id==='R021')?.requirement).toContain('当届')
    expect(criteria.find(x=>x.id==='R024')?.requirement).toContain('校级审定')
    expect(criteria.find(x=>x.id==='R026')?.requirement).toContain('系统备案')
    expect(criteria.find(x=>x.id==='R033')?.requirement).toContain('接收隔离')
  })
})

import { describe, expect, test } from 'bun:test'
import type { DemoModule, DemoTemplate, DemoTransaction } from './semantic-module-demo'
import {
  applyDemoTransaction, checkDemoCoverage, emptyDemoState, previewDemo, projectSimpleDemoDraft, validateDemoState,
} from './semantic-module-demo'
import { validateTemplate } from './template-store'
import { resolveEffectiveRules } from './effective-rules'
import { emptyAggregate } from './case-store-v2'

const synthetic = { kind: 'synthetic' as const, note: '合成业务数据，仅供 D0.5 技术验证，不代表任何学校规定' }
const task = (id: string, requirement: string) => ({
  id, title: id, requirement, completion: '记录逐项状态、证据位置及不能判断的原因',
  limits: '不得作出行政审批决定',
})
function moduleOf(moduleId: string, requirement: string): DemoModule {
  return {
    moduleId, version: 1, name: moduleId, purpose: '独立完成局部核对',
    scope: '本次审核的已确定对象', source: synthetic,
    limits: '通过局部核对不代表整案具备业务资格',
    tasks: [task('check', requirement)],
  }
}
function templateOf(templateId = 'text-proof'): DemoTemplate {
  return {
    templateId, version: 1, name: '普通文本审核（合成）',
    purpose: '检查一份文本是否包含必要章节', limits: '只输出材料预审意见，禁止自动审批',
    source: synthetic, modules: [], localTasks: [],
  }
}
function setup(modules: DemoModule[], template: DemoTemplate) {
  return applyDemoTransaction(emptyDemoState(), {
    expectedRevision: 0,
    operations: [
      ...modules.map((mod) => ({ op: 'create-module' as const, module: mod })),
      { op: 'create-template' as const, template },
    ],
  })
}

describe('D0.5 Agent-first 轻量语义模块（BDD）', () => {
  test('Given 简单文本责任 When Agent 批量建模 Then 可投影到现有 TemplateVersion/RuleSpec 而无节点图', () => {
    const module = moduleOf('text-structure', '核对摘要、正文、参考文献三部分，并指出实际缺失位置')
    const template = { ...templateOf(), modules: [{ id: 'text', moduleId: 'text-structure', version: 1 }] }
    const state = setup([module], template)
    const preview = previewDemo(state, 'text-proof', 1)
    expect(preview.blocked).toBeFalse()
    expect(preview.tasks).toHaveLength(1)
    expect(preview.tasks[0]?.requirement).toContain('摘要、正文、参考文献')
    const draft = projectSimpleDemoDraft(state, 'text-proof', 1)
    expect(draft.status).toBe('draft')
    expect(draft.outputs[0]?.kind).toBe('item-feedback')
    expect(draft.outputs.some((it) => it.kind === 'approval')).toBeFalse()
    expect(validateTemplate(draft).filter((it) => it.level === 'error')).toEqual([])
    const aggregate = emptyAggregate({
      id: 'simple-text', templateId: draft.templateId, templateVersion: draft.version,
      title: '合成文档', objectType: 'document', caseFields: {}, subjects: [], documents: [],
      stage: 'submitted', revision: 0, createdAt: '', updatedAt: '',
    })
    const rules = resolveEffectiveRules(aggregate, draft).map((it) => it.rule)
    expect(rules).toHaveLength(1)
    expect(rules[0]?.execution).toBe('semantic')
    expect(rules[0]?.requirement).toContain(preview.tasks[0]!.checkId)
    expect(rules[0]?.confirmation).toBe('confirmed') // 模板结构，不等同校规权威已确认
  })

  test('Given 固定引用 When 新建模块版本与局部切换 Then 原模块、旧引用和历史预览不变', () => {
    const module = moduleOf('source-consistency', '核对文本作者名称')
    const template = { ...templateOf(), modules: [{ id: 'identity', moduleId: module.moduleId, version: 1 }] }
    const original = setup([module], template)
    const before = previewDemo(original, template.templateId, 1)
    const updated = applyDemoTransaction(original, {
      expectedRevision: 1,
      operations: [
        { op: 'revise-module', moduleId: module.moduleId, fromVersion: 1, toVersion: 2, changes: { tasks: [task('check', '核对文本作者姓名及签署日期')] } },
        { op: 'replace-module-use', templateId: template.templateId, version: 1, use: { id: 'identity', moduleId: module.moduleId, version: 2 } },
      ],
    })
    expect(original.modules).toHaveLength(1)
    expect(original.templates[0]?.modules[0]?.version).toBe(1)
    expect(previewDemo(original, template.templateId, 1).fingerprint).toBe(before.fingerprint)
    expect(previewDemo(updated, template.templateId, 1).tasks[0]?.requirement).toContain('签署日期')
    expect(updated.modules.find((it) => it.version === 1)?.tasks[0]?.requirement).toBe('核对文本作者名称')
    expect(() => applyDemoTransaction(updated, { expectedRevision: 1, operations: [{ op: 'patch-template', templateId: template.templateId, version: 1, changes: { name: '覆盖' } }] })).toThrow('VERSION_CONFLICT')
  })

  test('Given 错误引用、环和越权参数 When 事务写入 Then 原子拒绝、不提升 revision', () => {
    const original = setup([moduleOf('core-review', '核对本次材料')], templateOf())
    const wrong: DemoTransaction = {
      expectedRevision: 1, operations: [
        { op: 'add-module-use', templateId: 'text-proof', version: 1, use: { id: 'missing', moduleId: 'not-found', version: 2 } },
      ],
    }
    expect(() => applyDemoTransaction(original, wrong)).toThrow('VALIDATION_FAILED')
    expect(original.revision).toBe(1)
    expect(original.templates[0]?.modules).toEqual([])
    expect(() => applyDemoTransaction(original, {
      expectedRevision: 1, operations: [
        { op: 'add-module-use', templateId: 'text-proof', version: 1, use: { id: 'params', moduleId: 'core-review', version: 1, bindings: { secret: '绕过正式审核' } } },
      ],
    })).toThrow('不允许传入未开放参数')
    const self = moduleOf('recursive', '递归节点')
    self.references = [{ id: 'self', moduleId: 'recursive', version: 1 }]
    expect(() => applyDemoTransaction(original, { expectedRevision: 1, operations: [{ op: 'create-module', module: self }] })).toThrow('循环')
    const official = moduleOf('official-claim', '假设校规必须通过')
    official.source = { kind: 'official-policy', note: '无可验证来源' }
    expect(() => applyDemoTransaction(original, { expectedRevision: 1, operations: [{ op: 'create-module', module: official }] })).toThrow('不支持在 D0.5 中认证正式校规')
  })

  test('Given 特殊校园卡双分支 When 未知/家属/服务人员切换 Then 不互相引入资格规则', () => {
    const relation = moduleOf('relation-evidence', '核对申请人、持卡人与关联人的关系证明；关系不等于代办许可')
    const proxy = moduleOf('agent-authorization', '核对代理人是否有权代办当前对象及该办理事项；只报告授权范围')
    const card: DemoTemplate = {
      ...templateOf('special-campus-card'), name: '特殊校园卡资格预审（合成）',
      scenarios: ['family', 'temporary-service'],
      modules: [
        { id: 'family-relation', moduleId: 'relation-evidence', version: 1, scenario: 'family' },
        { id: 'family-proxy', moduleId: 'agent-authorization', version: 1, scenario: 'family' },
        { id: 'temporary-proxy', moduleId: 'agent-authorization', version: 1, scenario: 'temporary-service' },
      ],
      localTasks: [task('authority', '校园卡资格批准状态须由校方有效依据确认，不能只凭亲属或用工事实推定')],
    }
    const state = setup([relation, proxy], card)
    const unknown = previewDemo(state, card.templateId, 1)
    expect(unknown.blocked).toBeTrue()
    expect(unknown.issues.join()).toContain('需要明确业务情景')
    const family = previewDemo(state, card.templateId, 1, 'family')
    const temporary = previewDemo(state, card.templateId, 1, 'temporary-service')
    expect(family.blocked).toBeFalse()
    expect(family.tasks).toHaveLength(3)
    expect(temporary.tasks).toHaveLength(2)
    expect(family.tasks.some((it) => it.requirement.includes('关系证明'))).toBeTrue()
    expect(temporary.tasks.some((it) => it.requirement.includes('关系证明'))).toBeFalse()
    expect(() => projectSimpleDemoDraft(state, card.templateId, 1)).toThrow('复杂业务情景只能预览')
  })

  test('Given 同档案件查阅和复制 When 两个实例引用同一授权模块 Then 每项的覆盖和权限相互隔离', () => {
    const auth = moduleOf('agent-authorization', '核查授权凭证仅覆盖 {{action}} 操作，不得借另一操作的许可推定本操作已授权')
    auth.parameters = [{ key: 'action', description: '当前档案件的独立申请操作' }]
    const archive: DemoTemplate = {
      ...templateOf('archive-access'), name: '档案利用申请（合成）',
      modules: [
        { id: 'read', moduleId: 'agent-authorization', version: 1, objectKey: 'item-1/read', bindings: { action: '查阅' } },
        { id: 'copy', moduleId: 'agent-authorization', version: 1, objectKey: 'item-1/copy', bindings: { action: '复制' } },
      ],
    }
    const state = setup([auth], archive)
    const preview = previewDemo(state, archive.templateId, 1)
    expect(preview.blocked).toBeFalse()
    expect(preview.tasks).toHaveLength(2)
    const read = preview.tasks.find((it) => it.objectKey === 'item-1/read')!
    const copy = preview.tasks.find((it) => it.objectKey === 'item-1/copy')!
    expect(read.checkId).not.toBe(copy.checkId)
    expect(read.requirement).toContain('查阅')
    expect(copy.requirement).toContain('复制')
    const receipt = checkDemoCoverage(preview, [
      { checkId: read.checkId, status: 'compliant', sourceIds: ['synthetic-document:authorization-read'], reason: '仅授权查阅' },
      { checkId: copy.checkId, status: 'awaiting-confirmation', reason: '复制授权缺少可靠凭证' },
    ])
    expect(receipt.complete).toBeTrue() // 记录齐全，不代表两个操作均已获准
    expect(() => projectSimpleDemoDraft(state, archive.templateId, 1)).toThrow('复杂业务情景只能预览')
  })

  test('Given 审核覆盖账本 When 缺少某个责任或无引证就宣称符合 Then 拒绝完成', () => {
    const state = setup([moduleOf('text-structure', '核对正文')], { ...templateOf(), modules: [{ id: 'text', moduleId: 'text-structure', version: 1 }] })
    const preview = previewDemo(state, 'text-proof', 1)
    expect(checkDemoCoverage(preview, []).problems.join()).toContain('审核责任漏项')
    expect(checkDemoCoverage(preview, [{ checkId: preview.tasks[0]!.checkId, status: 'compliant', reason: '自称完成' }]).problems.join()).toContain('缺少真实来源引用')
    expect(checkDemoCoverage(preview, [{ checkId: preview.tasks[0]!.checkId, status: 'execution-failed', reason: '无法读取' }]).complete).toBeFalse()
    expect(checkDemoCoverage(preview, [{ checkId: preview.tasks[0]!.checkId, status: 'not-applicable', reason: '' }]).complete).toBeFalse()
    expect(validateDemoState(state)).toEqual([])
  })
})

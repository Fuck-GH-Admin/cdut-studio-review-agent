import { afterAll, describe, expect, test } from 'bun:test'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { ReviewAuthoringWorkspaceV1 } from '@profer/shared'
import {
  compileReviewAuthoringCandidateV1, validateReviewAuthoringV1, verifyReviewAuthoringManifestV1,
} from './review-authoring-v1'
import {
  diffReviewAuthoringRevisionsV1, getReviewAuthoringRevisionV1, saveReviewAuthoringRevisionV1,
} from './review-authoring-store-v1'
import { publishTemplate, saveDraft } from './template-store'

const synthetic = { kind: 'synthetic' as const, note: '仅供 D1 验证，非任何学校现行政策' }
const task = (requirement: string) => ({
  id: 'check', title: '核对章节', requirement,
  completion: '记录检查状态、出处与待确认项', limits: '不得作行政批准',
})
function basic(): ReviewAuthoringWorkspaceV1 {
  return {
    schemaVersion: 1, workspaceId: 'simple-d1', revision: 1,
    definitions: {
      modules: [{
        moduleId: 'text-structure', version: 1, name: '普通文本核对', purpose: '核对文章必要章节',
        scope: '提交的当前文章', limits: '不是学校审批', source: synthetic,
        tasks: [task('核对摘要、正文和结论；不可读时不能判定合格')],
      }],
      templates: [{
        templateId: 'simple-text', version: 1, name: '普通文本审核', purpose: '判断文本章节是否符合作者要求',
        limits: '只提供修改意见', source: synthetic,
        modules: [{ id: 'text', moduleId: 'text-structure', version: 1 }], localTasks: [],
      }],
    },
    sources: [{
      sourceId: 'request', kind: 'user-request', label: '委托人明确要求', note: '仅适用于本次文本审阅',
      verification: 'unverified', applicability: 'request-scope',
    }],
    sourceBindings: [{ checkId: 'simple-text@1:module/text/check', sourceIds: ['request'] }],
  }
}

describe('D1 作者态真实映射与来源治理（BDD）', () => {
  test('Given 自然语言责任 When 编译候选 Then 每条标准都与原 RuleSpec 同一真值且有来源映射', () => {
    const workspace = basic()
    expect(validateReviewAuthoringV1(workspace)).toEqual([])
    const result = compileReviewAuthoringCandidateV1(workspace, 'simple-text', 1)
    expect(result.preview.blocked).toBeFalse()
    expect(result.manifest.status).toBe('review-candidate')
    expect(result.manifest.publicationAllowed).toBeFalse()
    expect(result.manifest.mapping).toHaveLength(1)
    expect(result.manifest.mapping[0]?.checkId).toBe('module/text/check')
    expect(result.manifest.mapping[0]?.ruleId).toBe('section-semantic-tasks-' + result.manifest.mapping[0]?.criterionId)
    expect(result.manifest.mapping[0]?.sourceIds).toEqual(['request'])
    expect(result.manifest.mapping[0]?.sourceKinds).toEqual(['user-request'])
    expect(verifyReviewAuthoringManifestV1(result.template, result.manifest)).toEqual([])
  })

  test('Given 运行候选被改写 When 重新核验 Then 不得再复用旧有效规则映射', () => {
    const result = compileReviewAuthoringCandidateV1(basic(), 'simple-text', 1)
    result.template.sections![0]!.criteria[0]!.requirement = '只核对摘要；擅自忽略正文'
    expect(verifyReviewAuthoringManifestV1(result.template, result.manifest).join('；')).toContain('模板内容或版本与作者态 manifest 不符')
    expect(verifyReviewAuthoringManifestV1(result.template, result.manifest).join('；')).toContain('生效规则集与作者态 manifest 不符')
  })

  test('Given 缺来源绑定或引用错误 When 静态验证 Then 不以隐式来源生成规则', () => {
    const workspace = basic()
    workspace.sourceBindings = []
    expect(validateReviewAuthoringV1(workspace).join('；')).toContain('审核责任缺少来源绑定')
    expect(() => compileReviewAuthoringCandidateV1(workspace, 'simple-text', 1)).toThrow('AUTHORING_INVALID')
    workspace.sourceBindings = [{ checkId: 'simple-text@1:module/text/check', sourceIds: ['not-exists'] }]
    expect(validateReviewAuthoringV1(workspace).join('；')).toContain('不存在的来源')
  })

  test('Given 跨校制度与本校未核政策 When 申请编译 Then 未授权规则不能被提升为可执行审查标准', () => {
    const workspace = basic()
    workspace.sources[0] = {
      sourceId: 'request', kind: 'cross-school-reference', label: '他校制度样例',
      note: '用于分析而非当前学校强制依据', verification: 'content-checked', applicability: 'reference-only',
      reference: { documentVersionId: 'unrelated-school-document-v1', locator: '§3' },
    }
    expect(validateReviewAuthoringV1(workspace)).toEqual([])
    expect(() => compileReviewAuthoringCandidateV1(workspace, 'simple-text', 1)).toThrow('UNVERIFIED_AUTHORITY')
    workspace.sources[0] = { ...workspace.sources[0]!, kind: 'policy-candidate', applicability: 'unknown' }
    expect(validateReviewAuthoringV1(workspace)).toEqual([])
    expect(() => compileReviewAuthoringCandidateV1(workspace, 'simple-text', 1)).toThrow('UNVERIFIED_AUTHORITY')
    workspace.sources[0]!.applicability = 'request-scope'
    expect(validateReviewAuthoringV1(workspace).join('；')).toContain('制度候选不得直接宣称适用于本案')
  })

  test('Given 高级证据或条件结构 When 旧 RuleSpec 没有无损映射 Then 明确拒绝，允许只有基础语义的模板', () => {
    const workspace = basic()
    workspace.advanced = { claimKeys: ['claim-person'] }
    expect(validateReviewAuthoringV1(workspace)).toEqual([])
    expect(() => compileReviewAuthoringCandidateV1(workspace, 'simple-text', 1)).toThrow('UNMAPPABLE_ADVANCED')
    workspace.advanced = undefined
    const nested = workspace.definitions.modules[0]!
    nested.references = [{ id: 'nested', moduleId: nested.moduleId, version: 1 }]
    expect(validateReviewAuthoringV1(workspace).join('；')).toContain('循环')
  })

  test('Given 校园卡双分支和档案逐操作 When 映射作者态 Then 可以验证来源覆盖，但不能错误投影成无条件审核', () => {
    const workspace = basic()
    const templates = workspace.definitions.templates
    templates[0]!.scenarios = ['family', 'temporary-service']
    templates[0]!.modules = [
      { id: 'family', moduleId: 'text-structure', version: 1, scenario: 'family' },
      { id: 'service', moduleId: 'text-structure', version: 1, scenario: 'temporary-service' },
    ]
    workspace.sourceBindings = [
      { checkId: 'simple-text@1:module/family/check', sourceIds: ['request'] },
      { checkId: 'simple-text@1:module/service/check', sourceIds: ['request'] },
    ]
    expect(validateReviewAuthoringV1(workspace)).toEqual([])
    expect(() => compileReviewAuthoringCandidateV1(workspace, 'simple-text', 1)).toThrow('复杂业务情景只能预览')
    templates[0]!.scenarios = undefined
    templates[0]!.modules = [
      { id: 'read', moduleId: 'text-structure', version: 1, objectKey: 'item-1/read' },
      { id: 'copy', moduleId: 'text-structure', version: 1, objectKey: 'item-1/copy' },
    ]
    workspace.sourceBindings = [
      { checkId: 'simple-text@1:module/read/check', sourceIds: ['request'] },
      { checkId: 'simple-text@1:module/copy/check', sourceIds: ['request'] },
    ]
    expect(validateReviewAuthoringV1(workspace)).toEqual([])
    expect(() => compileReviewAuthoringCandidateV1(workspace, 'simple-text', 1)).toThrow('逐对象作用范围')
  })
})

describe('D1 作者态修订存储与候选发布隔离', () => {
  const previous = process.env.PROFER_CONFIG_DIR
  const home = mkdtempSync(join(tmpdir(), 'review-d1-test-'))
  process.env.PROFER_CONFIG_DIR = home
  afterAll(() => {
    if (previous === undefined) delete process.env.PROFER_CONFIG_DIR
    else process.env.PROFER_CONFIG_DIR = previous
    rmSync(home, { recursive: true, force: true })
  })

  test('Given 草稿连续两次修改 When 记录版本 Then 草稿修订号与发布模板版本不同、历史可读', () => {
    const draft = basic()
    const first = saveReviewAuthoringRevisionV1(draft, 0, 'author-agent')
    expect(first.workspace.revision).toBe(1)
    expect(first.parentDigest).toBeUndefined()
    const changed = structuredClone(draft)
    changed.revision = 2
    changed.definitions.modules[0]!.tasks[0]!.requirement += '；还要明确文章标题'
    const second = saveReviewAuthoringRevisionV1(changed, 1, 'author-agent')
    expect(second.parentDigest).toBe(first.digest)
    expect(getReviewAuthoringRevisionV1('simple-d1')?.workspace.revision).toBe(2)
    expect(getReviewAuthoringRevisionV1('simple-d1', 1)?.workspace.definitions.modules[0]?.tasks[0]?.requirement).not.toContain('标题')
    expect(diffReviewAuthoringRevisionsV1(draft, changed).changedModules).toContain('text-structure@1')
    expect(() => saveReviewAuthoringRevisionV1(changed, 1, 'another-agent')).toThrow('AUTHORING_REVISION_CONFLICT')
    const old = getReviewAuthoringRevisionV1('simple-d1', 1)!
    const path = join(home, 'review-authoring-v1', 'simple-d1', 'revisions', '1.json')
    const altered = JSON.parse(readFileSync(path, 'utf8')) as typeof old
    altered.workspace.definitions.modules[0]!.tasks[0]!.requirement = '历史被改写'
    writeFileSync(path, JSON.stringify(altered))
    expect(() => getReviewAuthoringRevisionV1('simple-d1', 1)).toThrow('内容摘要不匹配')
  })

  test('Given D1 已编译候选 When 经老模板服务试图发布 Then 必须拒绝', () => {
    const result = compileReviewAuthoringCandidateV1(basic(), 'simple-text', 1)
    saveDraft(result.template)
    expect(() => publishTemplate('simple-text', 1)).toThrow('D1 作者态候选尚未经过制度治理')
    expect(result.template.status).toBe('draft')
  })
})

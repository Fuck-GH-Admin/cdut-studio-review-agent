/**
 * D1 作者态 -> 既有 TemplateVersion / RuleSpec 的可验证候选快照。
 * 复用 D0.5 已验证组合；运行时仍只有现有 resolveEffectiveRules/Pi 服务。
 * 不确认真实校规，不生成审批结论；高级约束不能映射时 fail-closed。
 */
import { createHash } from 'node:crypto'
import type {
  CaseAggregateV2, ReviewAuthoringManifestV1, ReviewAuthoringRuleMapV1,
  ReviewAuthoringWorkspaceV1, ReviewAuthoringSourceV1, TemplateVersion,
} from '@profer/shared'
import { previewDemo, projectSimpleDemoDraft, validateDemoState, type DemoState, type DemoPreview } from './semantic-module-demo'
import { resolveEffectiveRules, hashEffectiveRuleSet } from './effective-rules'
import { validateTemplate } from './template-store'

const ID = /^[a-z][a-z0-9-]{0,79}$/
const sha = (value: unknown): string => createHash('sha256').update(JSON.stringify(value), 'utf8').digest('hex')
const toDemo = (workspace: ReviewAuthoringWorkspaceV1): DemoState => ({
  revision: workspace.revision,
  modules: workspace.definitions.modules,
  templates: workspace.definitions.templates,
})

const sourceUsableInCandidate = (source: ReviewAuthoringSourceV1): boolean =>
  (source.kind === 'synthetic' || source.kind === 'user-request') &&
  source.applicability === 'request-scope'

/** 不使用模型语义推测来填补 sourceBindings，未映射一律报告。 */
export function validateReviewAuthoringV1(workspace: ReviewAuthoringWorkspaceV1): string[] {
  const issues: string[] = []
  if (workspace?.schemaVersion !== 1) return ['作者态 schemaVersion 必须为 1']
  if (!ID.test(workspace.workspaceId)) issues.push('作者态 workspaceId 非法')
  if (!Number.isSafeInteger(workspace.revision) || workspace.revision < 0) issues.push('草稿修订号无效')
  if (!workspace.definitions || !Array.isArray(workspace.definitions.modules) || !Array.isArray(workspace.definitions.templates)) {
    return [...issues, '作者态定义列表缺失']
  }
  if (!Array.isArray(workspace.sources) || !Array.isArray(workspace.sourceBindings)) {
    return [...issues, '来源或责任绑定列表缺失']
  }
  issues.push(...validateDemoState(toDemo(workspace)))
  const sourceMap = new Map<string, ReviewAuthoringSourceV1>()
  for (const source of workspace.sources) {
    if (!ID.test(source.sourceId)) issues.push('来源 ID 非法：' + source.sourceId)
    if (sourceMap.has(source.sourceId)) issues.push('重复来源 ID：' + source.sourceId)
    sourceMap.set(source.sourceId, source)
    if (!source.label?.trim() || !source.note?.trim()) issues.push('来源缺少标签或性质说明：' + source.sourceId)
    if (!['synthetic', 'user-request', 'cross-school-reference', 'policy-candidate'].includes(source.kind)) issues.push('未知来源性质：' + source.sourceId)
    if (!['unverified', 'content-checked'].includes(source.verification)) issues.push('来源内容核验状态无效：' + source.sourceId)
    if (!['unknown', 'reference-only', 'request-scope'].includes(source.applicability)) issues.push('来源适用状态无效：' + source.sourceId)
    if (source.reference && (!source.reference.documentVersionId?.trim() || !source.reference.locator?.trim())) {
      issues.push('来源文件引用缺少原件版本或段落定位：' + source.sourceId)
    }
    if (source.kind === 'policy-candidate' && source.applicability !== 'unknown') {
      issues.push('未由政策治理确认的制度候选不得直接宣称适用于本案：' + source.sourceId)
    }
    if (source.kind === 'cross-school-reference' && source.applicability === 'request-scope') {
      issues.push('跨校参考规则不得自动作为本案生效要求：' + source.sourceId)
    }
  }

  // 多分支在制作阶段逐个展开以获得全部责任；不把未选择情景当成无责任。
  const expected = new Set<string>()
  for (const template of workspace.definitions.templates) {
    const scenarios = template.scenarios?.length ? template.scenarios : [undefined]
    for (const scenario of scenarios) {
      const preview = previewDemo(toDemo(workspace), template.templateId, template.version, scenario)
      issues.push(...preview.issues.map((item) => template.templateId + '@' + template.version + ': ' + item))
      for (const task of preview.tasks) expected.add(template.templateId + '@' + template.version + ':' + task.checkId)
    }
  }
  const bindings = new Map<string, string[]>()
  for (const binding of workspace.sourceBindings) {
    // 业务模板 ID 和 checkId 分开连接；同一模块可被不同模板引用。
    const id = binding.checkId
    if (bindings.has(id)) issues.push('同一责任出现重复来源绑定：' + id)
    bindings.set(id, binding.sourceIds)
    if (!expected.has(id)) issues.push('来源绑定指向不存在的责任：' + id)
    if (!binding.sourceIds?.length) issues.push('审核责任必须有明确来源性质或待核来源：' + id)
    if (new Set(binding.sourceIds).size !== binding.sourceIds.length) issues.push('来源列表重复：' + id)
    for (const sourceId of binding.sourceIds ?? []) {
      if (!sourceMap.has(sourceId)) issues.push('来源绑定引用不存在的来源：' + id + ' -> ' + sourceId)
    }
  }
  for (const id of expected) if (!bindings.has(id)) issues.push('审核责任缺少来源绑定：' + id)
  if (workspace.advanced?.evidenceRelations?.length) {
    const sourceIds = new Set(workspace.sources.map((item) => item.sourceId))
    const claims = new Set(workspace.advanced.claimKeys ?? [])
    for (const relation of workspace.advanced.evidenceRelations) {
      if (!claims.has(relation.claimKey) || !relation.requiredSourceIds?.length ||
          relation.requiredSourceIds.some((id) => !sourceIds.has(id))) {
        issues.push('高级证据关系引用无效：' + relation.claimKey)
      }
    }
  }
  return [...new Set(issues)]
}

export interface ReviewAuthoringCandidateV1 {
  template: TemplateVersion
  manifest: ReviewAuthoringManifestV1
  preview: DemoPreview
}

/**
 * 不支持的条件、逐操作对象、高级 Claim/Evidence 关系不能静默降级。
 * 以现有 resolveEffectiveRules 的结果为真值，验证 ID/要求/数量与作者责任一一对应。
 */
export function compileReviewAuthoringCandidateV1(
  workspace: ReviewAuthoringWorkspaceV1,
  templateId: string,
  version: number,
): ReviewAuthoringCandidateV1 {
  const issues = validateReviewAuthoringV1(workspace)
  if (issues.length) throw new Error('AUTHORING_INVALID: ' + issues.join('；'))
  if (workspace.advanced && Object.values(workspace.advanced).some((value) => Array.isArray(value) && value.length > 0)) {
    throw new Error('UNMAPPABLE_ADVANCED: 高级角色/Claim/Evidence 关系尚未映射至有效规则，不得静默投影')
  }
  const preview = previewDemo(toDemo(workspace), templateId, version)
  if (preview.blocked) throw new Error('审核责任预览仍被阻断：' + preview.issues.join('；'))

  const sourceMap = new Map(workspace.sources.map((item) => [item.sourceId, item]))
  const links = new Map(workspace.sourceBindings.map((item) => [item.checkId, item.sourceIds]))
  for (const task of preview.tasks) {
    const key = templateId + '@' + version + ':' + task.checkId
    const ids = links.get(key) ?? []
    if (ids.some((id) => !sourceUsableInCandidate(sourceMap.get(id)!))) {
      throw new Error('UNVERIFIED_AUTHORITY: 跨校参考、制度候选或未知适用范围不得编译成当前生效要求：' + key)
    }
  }
  const template = projectSimpleDemoDraft(toDemo(workspace), templateId, version)
  template.description = '[D1 作者态候选，非已发布学校制度] ' + (template.description ?? '')
  template.sourceNote = 'D1_AUTHORING_CANDIDATE: 只有制作与运行投影校验，禁止无授权发布'
  const templateIssues = validateTemplate(template).filter((issue) => issue.level === 'error')
  if (templateIssues.length) throw new Error('TEMPLATE_INVALID: ' + templateIssues.map((item) => item.message).join('；'))
  const criteria = template.sections?.flatMap((section) => section.criteria.map((criterion) => ({ section, criterion }))) ?? []
  const effective = resolveEffectiveRules({ caseV2: { reviewRules: [] } } as unknown as Pick<CaseAggregateV2, 'caseV2'>, template)
  const ruleMap = new Map(effective.map(({ rule }) => [rule.id, rule]))
  if (criteria.length !== preview.tasks.length || effective.length !== preview.tasks.length) {
    throw new Error('RULE_TRUTH_MISMATCH: 作者责任、模板标准与运行规则数量不一致')
  }

  const mapping: ReviewAuthoringRuleMapV1[] = preview.tasks.map((task) => {
    const id = 'demo-' + sha(task.checkId).slice(0, 16)
    const criterion = criteria.find((item) => item.criterion.id === id)
    if (!criterion) throw new Error('RULE_TRUTH_MISMATCH: 审核责任未生成标准 ' + task.checkId)
    const ruleId = 'section-' + criterion.section.id + '-' + id
    const rule = ruleMap.get(ruleId)
    if (!rule || rule.title !== criterion.criterion.title || rule.requirement !== criterion.criterion.requirement ||
        rule.execution !== criterion.criterion.execution || rule.targetScope !== criterion.criterion.targetScope) {
      throw new Error('RULE_TRUTH_MISMATCH: 生效 RuleSpec 与编辑器 criterion 不一致：' + task.checkId)
    }
    const sourceIds = links.get(templateId + '@' + version + ':' + task.checkId)!
    return {
      checkId: task.checkId,
      criterionId: id,
      ruleId,
      ruleDigest: sha(rule),
      sourceIds,
      sourceKinds: sourceIds.map((sourceId) => sourceMap.get(sourceId)!.kind),
    }
  })
  const manifest: ReviewAuthoringManifestV1 = {
    schemaVersion: 1, workspaceId: workspace.workspaceId, revision: workspace.revision,
    templateId, templateVersion: version, previewFingerprint: preview.fingerprint,
    templateDigest: digestAuthoringTemplateV1(template),
    effectiveRuleDigest: hashEffectiveRuleSet(effective),
    mapping, status: 'review-candidate', publicationAllowed: false,
  }
  return { template, manifest, preview }
}

/** 不包含时间戳/状态；有且只有模板内容修改才改变结构 digest。 */
export function digestAuthoringTemplateV1(template: TemplateVersion): string {
  const { createdAt: _createdAt, publishedAt: _publishedAt, status: _status, ...content } = template
  return sha(content)
}

/** 检查作者态 Sidecar 是否仍与实际模板和运行规则一致；修改后不能用旧 manifest。 */
export function verifyReviewAuthoringManifestV1(
  template: TemplateVersion,
  manifest: ReviewAuthoringManifestV1,
): string[] {
  const issues: string[] = []
  if (manifest.publicationAllowed !== false || manifest.status !== 'review-candidate') {
    issues.push('作者态候选不得伪装成已获发布授权')
  }
  if (manifest.templateId !== template.templateId || manifest.templateVersion !== template.version ||
      manifest.templateDigest !== digestAuthoringTemplateV1(template)) {
    issues.push('模板内容或版本与作者态 manifest 不符')
  }
  const effective = resolveEffectiveRules({ caseV2: { reviewRules: [] } } as unknown as Pick<CaseAggregateV2, 'caseV2'>, template)
  if (manifest.effectiveRuleDigest !== hashEffectiveRuleSet(effective)) issues.push('生效规则集与作者态 manifest 不符')
  const rules = new Map(effective.map(({ rule }) => [rule.id, rule]))
  if (manifest.mapping.length !== rules.size || new Set(manifest.mapping.map((it) => it.ruleId)).size !== manifest.mapping.length) {
    issues.push('规则来源映射存在遗漏或重复')
  }
  for (const entry of manifest.mapping) {
    const rule = rules.get(entry.ruleId)
    if (!rule || entry.ruleDigest !== sha(rule)) issues.push('生效规则内容或来源映射不匹配：' + entry.checkId)
  }
  return issues
}

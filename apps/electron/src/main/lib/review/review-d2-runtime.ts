/**
 * D2：D1 作者态条件/对象实例 → 现有 RuleSpec/Pi 审核。
 * 没有第二套 Agent 内核；发布资格、行政决定与模型结果严格分离。
 */
import { createHash } from 'node:crypto'
import type {
  Actor, CaseAggregateV2, D2RuntimePlan, D2ScenarioSelection, D2RuleBinding, D2TargetBinding,
  ReviewAuthoringWorkspaceV1, ReviewCaseV2, ReviewCommandResult, ReviewRunV2,
  ReviewSubject, RuleSpec, TemplateVersion,
} from '@profer/shared'
import { previewDemo, type DemoState } from './semantic-module-demo'
import { validateReviewAuthoringV1 } from './review-authoring-v1'
import { CommandValidationError, submitCommand } from './case-store-v2'
import { getTemplate, isAuthoringCandidateDraft } from './template-store'
import { hashEffectiveRuleSet, resolveEffectiveRules } from './effective-rules'
import { computeRunInputHash } from './run-service-v2'

const sha = (value: unknown): string => createHash('sha256').update(JSON.stringify(value) ?? 'undefined', 'utf8').digest('hex')
const ID = /^[a-z][a-z0-9-]{0,79}$/
const safe = (value: string): boolean => ID.test(value)
const toDemo = (workspace: ReviewAuthoringWorkspaceV1): DemoState => ({
  revision: workspace.revision,
  modules: workspace.definitions.modules,
  templates: workspace.definitions.templates,
})
const sectionFor = (key: string): string => 'd2-scope-' + sha(key).slice(0, 16)
const runtimeRuleId = (checkId: string): string => 'd2-' + sha(checkId).slice(0, 20)
const runtimeCheckId = (ruleId: string, subjectId: string | undefined, allSubjects: string[]): string =>
  `check-${ruleId}-${subjectId ? 'subject-' + subjectId : 'case-' + (allSubjects.join('-') || 'case')}`
const scopeRef = (binding: D2TargetBinding): ReviewSubject => ({
  id: binding.subjectId, title: binding.title, type: 'custom',
  sectionId: sectionFor(binding.objectKey),
  fields: {
    d2ObjectKey: { kind: 'text', value: binding.objectKey },
    ...(binding.itemId ? { d2ItemId: { kind: 'text' as const, value: binding.itemId } } : {}),
    ...(binding.operation ? { d2Operation: { kind: 'text' as const, value: binding.operation } } : {}),
    ...(binding.scenario ? { d2Scenario: { kind: 'text' as const, value: binding.scenario } } : {}),
  },
  sourceRefs: [], correction: 'user-confirmed', status: 'confirmed',
})
const digestPlan = (plan: Omit<D2RuntimePlan, 'fingerprint'>): string => sha(plan)

/** D2 固定为技术预审，提供可被真实 Pi 案卷加载的最小草稿壳，不是校规。 */
export function makeD2CandidateShell(workspace: ReviewAuthoringWorkspaceV1, templateId: string, version: number): TemplateVersion {
  const problems = validateReviewAuthoringV1(workspace)
  if (problems.length) throw new Error('D2_AUTHORING_INVALID: ' + problems.join('；'))
  const source = workspace.definitions.templates.find((item) => item.templateId === templateId && item.version === version)
  if (!source) throw new Error('D2_TEMPLATE_NOT_FOUND')
  return {
    templateId, version, schemaVersion: 2, name: source.name,
    description: 'D2 作者态技术预审壳：动态分支/逐操作由案卷级不可变规则快照承载',
    sourceNote: 'D1_AUTHORING_CANDIDATE: D2 技术预审，不得发布为正式校规',
    catalogKind: 'custom', objectType: 'document', displayName: { template: source.name },
    fields: [], materialSlots: [], policyVersionIds: [], policyRefs: [],
    sections: [], stages: [{ id: 'review', name: 'Pi Agent 材料预审', kind: 'manual-review', executorRole: 'reviewer' }],
    outputs: [{ id: 'review-feedback', kind: 'item-feedback', audience: 'reviewer' }],
    status: 'draft', createdAt: new Date().toISOString(),
  }
}

function validateTargets(selection: D2ScenarioSelection): void {
  const keys = new Set<string>(), subjects = new Set<string>()
  for (const target of selection.targets) {
    if (!target.objectKey?.trim() || !safe(target.subjectId) || !target.title?.trim() || keys.has(target.objectKey) || subjects.has(target.subjectId)) {
      throw new Error('D2_TARGET_INVALID: 对象键/主体 ID 重复、非法或缺少标题')
    }
    keys.add(target.objectKey)
    subjects.add(target.subjectId)
    if (target.kind === 'archive-operation') {
      if (!target.itemId || !target.operation || target.objectKey !== target.itemId + '/' + target.operation) {
        throw new Error('D2_TARGET_INVALID: 档案件与操作必须精确对应 itemId/operation')
      }
    } else if (target.kind === 'archive-item') {
      if (!target.itemId || target.objectKey !== target.itemId || target.operation) throw new Error('D2_TARGET_INVALID: 档案级目标不能冒充具体操作')
    } else if (target.kind === 'campus-card') {
      if (!selection.scenario || target.scenario !== selection.scenario || target.operation) {
        throw new Error('D2_TARGET_INVALID: 校园卡主体必须绑定已选择的分支')
      }
    } else throw new Error('D2_TARGET_INVALID: 未知目标种类')
  }
}

/**
 * 仅选择已确认情景，展开所有应审责任并严格绑定业务对象。
 * policy-candidate/跨校参考可以作为待核责任，但不得编译成已确认的校规。
 */
export function compileD2RuntimePlan(
  workspace: ReviewAuthoringWorkspaceV1,
  selection: D2ScenarioSelection,
  caseV2: ReviewCaseV2,
): D2RuntimePlan {
  const errors = validateReviewAuthoringV1(workspace)
  if (errors.length) throw new Error('D2_AUTHORING_INVALID: ' + errors.join('；'))
  if (workspace.advanced && Object.values(workspace.advanced).some((value) => Array.isArray(value) && value.length)) {
    throw new Error('D2_UNMAPPED_ADVANCED: 高级 Claim/Evidence 关系尚无无损执行映射，不得忽略')
  }
  const template = workspace.definitions.templates.find((item) => item.templateId === selection.templateId && item.version === selection.version)
  if (!template || caseV2.templateId !== selection.templateId || caseV2.templateVersion !== selection.version) {
    throw new Error('D2_TEMPLATE_MISMATCH: 案卷模板与作者态不一致')
  }
  if (template.scenarios?.length && (!selection.scenario || !template.scenarios.includes(selection.scenario))) {
    throw new Error('D2_SCENARIO_REQUIRED: 未知分支不能当作不适用')
  }
  if (!template.scenarios?.length && selection.scenario) throw new Error('D2_SCENARIO_INVALID: 无条件模板不接受分支')
  validateTargets(selection)
  const preview = previewDemo(toDemo(workspace), selection.templateId, selection.version, selection.scenario)
  if (preview.blocked || !preview.tasks.length) throw new Error('D2_PREVIEW_BLOCKED: ' + preview.issues.join('；'))
  const registry = new Map(selection.targets.map((target) => [target.objectKey, target]))
  if (selection.scenarioObjectKey && !registry.has(selection.scenarioObjectKey)) {
    throw new Error('D2_SCOPE_MISSING: 分支对象未登记')
  }
  const sources = new Map(workspace.sources.map((source) => [source.sourceId, source]))
  const links = new Map(workspace.sourceBindings.map((link) => [link.checkId, link.sourceIds]))
  const rules: RuleSpec[] = [], mapping: D2RuleBinding[] = []
  const usedKeys = new Set<string>()
  for (const [index, task] of preview.tasks.entries()) {
    const objectKey = task.objectKey ?? (task.checkId.startsWith('module/') ? selection.scenarioObjectKey : undefined)
    const target = objectKey ? registry.get(objectKey) : undefined
    if (objectKey && !target) throw new Error('D2_SCOPE_MISSING: 未登记业务对象 ' + objectKey)
    if (target) usedKeys.add(target.objectKey)
    const sourceIds = links.get(selection.templateId + '@' + selection.version + ':' + task.checkId)
    if (!sourceIds?.length) throw new Error('D2_SOURCE_MISSING: ' + task.checkId)
    const authority: D2RuleBinding['authority'] = task.source.kind === 'cross-school-reference' ||
      sourceIds.some((id) => {
        const source = sources.get(id)
        return !source || source.kind === 'cross-school-reference' || source.kind === 'policy-candidate' ||
          source.applicability !== 'request-scope'
      }) ? 'unverified-policy' : 'request-scope'
    const id = runtimeRuleId(selection.templateId + '@' + selection.version + ':' + task.checkId)
    const requirement = [
      task.requirement,
      '完成标准：' + task.completion,
      '责任边界：' + task.limits,
      'D2 技术预审来源：' + sourceIds.map((sourceId) => {
        const source = sources.get(sourceId)!
        return source.sourceId + '/' + source.kind + '/' + source.applicability
      }).join('；'),
      '行政边界：技术核验结果不能代替学校制度确认、授权或最终批准。',
      ...(authority === 'unverified-policy' ? ['校规/外校参考适用性未获确认：只能报告 awaiting-confirmation。'] : []),
    ].join('\n')
    rules.push({
      id, policyVersionId: `workspace:d2-${workspace.workspaceId}@${workspace.revision}`,
      title: task.title, requirement, when: { all: [] },
      ...(target ? { sectionId: sectionFor(target.objectKey) } : {}),
      targetScope: target ? 'subject' : 'case', execution: 'semantic',
      semanticOutputEnum: ['compliant', 'non-compliant'],
      onFail: 'manual-review', onUnknown: 'needs-confirmation', sourceRefIds: [...sourceIds],
      priority: 50000 + index, confirmation: authority === 'request-scope' ? 'confirmed' : 'unconfirmed',
    })
    mapping.push({
      checkId: task.checkId, ruleId: id,
      ...(target ? { objectKey: target.objectKey, subjectId: target.subjectId } : {}),
      sourceIds: [...sourceIds], authority,
    })
  }
  for (const target of selection.targets) if (!usedKeys.has(target.objectKey)) {
    throw new Error('D2_UNUSED_TARGET: 对象登记没有对应检查责任 ' + target.objectKey)
  }
  if (new Set(rules.map((rule) => rule.id)).size !== rules.length) throw new Error('D2_RULE_COLLISION')
  const bare: Omit<D2RuntimePlan, 'fingerprint'> = {
    schemaVersion: 1, mode: 'technical-pre-review', publicationAllowed: false,
    workspaceId: workspace.workspaceId, revision: workspace.revision,
    templateId: selection.templateId, templateVersion: selection.version,
    ...(selection.scenario ? { scenario: selection.scenario } : {}),
    authoringDigest: sha(workspace), previewFingerprint: preview.fingerprint,
    targets: structuredClone(selection.targets), subjects: selection.targets.map(scopeRef),
    rules, mapping,
  }
  return { ...bare, fingerprint: digestPlan(bare) }
}

/** 同一个案卷/运行只允许精确的任务与对象快照，人工改写规则或丢失模块关系都将拒止。 */
export function verifyD2InstalledPlan(aggregate: CaseAggregateV2): string[] {
  const plan = aggregate.d2RuntimePlan
  if (!plan) return []
  const problems: string[] = []
  const { fingerprint, ...bare } = plan
  if (plan.schemaVersion !== 1 || plan.mode !== 'technical-pre-review' || plan.publicationAllowed !== false || fingerprint !== digestPlan(bare)) {
    problems.push('D2 作者态任务包指纹不匹配或伪造发布资格')
  }
  if (aggregate.caseV2.templateId !== plan.templateId || aggregate.caseV2.templateVersion !== plan.templateVersion ||
      aggregate.caseV2.caseFields.d2PlanFingerprint?.kind !== 'text' ||
      aggregate.caseV2.caseFields.d2PlanFingerprint.value !== fingerprint) {
    problems.push('D2 任务包没有绑定当前案卷模板/固定指纹')
  }
  const storedRules = new Map((aggregate.caseV2.reviewRules ?? []).map((item) => [item.id, item]))
  for (const rule of plan.rules) if (sha(storedRules.get(rule.id)) !== sha(rule)) problems.push('D2 生效 RuleSpec 被更改：' + rule.id)
  if ((aggregate.caseV2.reviewRules ?? []).some((rule) => rule.id.startsWith('d2-') && !plan.rules.some((entry) => entry.id === rule.id))) {
    problems.push('出现不属于当前 D2 任务包的额外规则')
  }
  const storedSubjects = new Map(aggregate.caseV2.subjects.map((item) => [item.id, item]))
  for (const subject of plan.subjects) if (sha(storedSubjects.get(subject.id)) !== sha(subject)) {
    problems.push('D2 业务对象或操作范围被改写：' + subject.id)
  }
  for (const item of plan.mapping) {
    const rule = storedRules.get(item.ruleId)
    const expected = item.objectKey ? plan.targets.find((target) => target.objectKey === item.objectKey) : undefined
    if (!rule || sha(item.sourceIds) !== sha(rule.sourceRefIds) ||
        (expected ? expected.subjectId !== item.subjectId || rule.sectionId !== sectionFor(expected.objectKey) : !!item.subjectId || !!rule.sectionId)) {
      problems.push('D2 来源/业务对象映射失效：' + item.checkId)
    }
  }
  return problems
}

/**
 * 通过既有 submitCommand 事务持久化真实案卷的业务对象及 RuleSpec；
 * 只允许尚未执行的 D1 技术草稿壳，不产生发布或决定。更新需要新案卷/明确重新编译。
 */
export function attachD2RuntimePlan(input: {
  caseId: string
  requestId: string
  actor: Actor
  expectedRevision: number
  workspace: ReviewAuthoringWorkspaceV1
  selection: D2ScenarioSelection
}): Promise<ReviewCommandResult<D2RuntimePlan>> {
  return submitCommand<{ workspace: ReviewAuthoringWorkspaceV1; selection: D2ScenarioSelection }, D2RuntimePlan>(
    input.caseId, {
      requestId: input.requestId, actor: input.actor, expectedRevision: input.expectedRevision,
      type: 'AttachD2TechnicalReviewPlan', payload: { workspace: input.workspace, selection: input.selection },
    }, (aggregate, payload) => {
      if (aggregate.caseV2.stage !== 'draft' || aggregate.d2RuntimePlan) {
        throw new CommandValidationError('INVALID_TRANSITION', 'D2 只能绑定未开始审核且没有已固定计划的草稿案卷')
      }
      const template = getTemplate(aggregate.caseV2.templateId, aggregate.caseV2.templateVersion)
      if (!template || template.status !== 'draft' || !isAuthoringCandidateDraft(template.templateId, template.version)) {
        throw new CommandValidationError('AGENT_DECISION_DISABLED', 'D2 仅支持不可发布的技术预审候选壳')
      }
      const plan = compileD2RuntimePlan(payload.workspace, payload.selection, aggregate.caseV2)
      const otherRules = aggregate.caseV2.reviewRules ?? []
      if (otherRules.some((rule) => rule.id.startsWith('d2-') || plan.rules.some((item) => item.id === rule.id))) {
        throw new CommandValidationError('VALIDATION_FAILED', '同案已有冲突或未登记的 D2 规则')
      }
      if (aggregate.caseV2.subjects.some((subject) => plan.subjects.some((item) => item.id === subject.id || item.sectionId === subject.sectionId))) {
        throw new CommandValidationError('VALIDATION_FAILED', '同案已有相同 D2 业务对象或分项')
      }
      return {
        summary: '固定 D2 技术预审计划：' + plan.templateId + (plan.scenario ? '/' + plan.scenario : '') + '，' + plan.mapping.length + ' 项检查',
        mutate: (draft) => {
          draft.caseV2.subjects.push(...structuredClone(plan.subjects))
          draft.caseV2.reviewRules = [...(draft.caseV2.reviewRules ?? []), ...structuredClone(plan.rules)]
          draft.caseV2.caseFields = { ...draft.caseV2.caseFields, d2PlanFingerprint: { kind: 'text', value: plan.fingerprint } }
          draft.d2RuntimePlan = structuredClone(plan)
          return structuredClone(plan)
        },
      }
    },
  )
}

/**
 * 档案类「逐操作已授权/未授权」不能只看 Agent 找到的相关段落。
 * 必须有审核员在既有证据绑定事务中对这一主体、这一具体操作做了确认；
 * 一份查阅授权不会解锁复制，目录公开亦不会解锁实际开放状态。
 * 技术预审仍不产生法律/行政授权，只对可断言结论建立最低独立来源门禁。
 */
export function validateD2OperationEvidence(
  aggregate: CaseAggregateV2,
  ruleId: string,
  status: string,
  documentVersionIds: string[],
): string | undefined {
  const mapping = aggregate.d2RuntimePlan?.mapping.find((entry) => entry.ruleId === ruleId)
  const target = aggregate.d2RuntimePlan?.targets.find((item) => item.objectKey === mapping?.objectKey)
  if (!mapping || !target || target.kind === 'campus-card') return undefined
  if (!['compliant', 'non-compliant', 'not-applicable'].includes(status)) return undefined
  const factKey = target.kind === 'archive-operation' ? 'd2:archive:' + target.operation : 'd2:archive:open-status'
  const proven = aggregate.evidenceLinks.some((link) =>
    link.status === 'confirmed' && link.linkedBy === 'user' &&
    link.subjectId === target.subjectId && link.supportsFact === factKey &&
    documentVersionIds.includes(link.documentVersionId) &&
    aggregate.caseV2.documents.some((doc) => doc.versionId === link.documentVersionId && doc.active !== false),
  )
  if (!proven) return '档案逐操作/开放状态缺少审核员确认的独立证据绑定：' + target.objectKey + '（' + factKey + '）；不得挪用其他操作的授权'
  return undefined
}

/** 覆盖判定直接读取 Pi 的真实运行回执及 SourceRef，不能使用独立的演示回执冒充。 */
export function verifyD2PiRun(aggregate: CaseAggregateV2, run: ReviewRunV2): { complete: boolean; problems: string[] } {
  const plan = aggregate.d2RuntimePlan
  if (!plan) return { complete: false, problems: ['案卷没有 D2 固定任务包'] }
  const problems = verifyD2InstalledPlan(aggregate)
  if (run.status !== 'completed') problems.push('Pi 当前运行尚未完整完成')
  const snapshots = {
    observations: aggregate.observations.map((item) => item as unknown as Record<string, unknown>),
    evidence: aggregate.evidenceLinks.map((item) => item as unknown as Record<string, unknown>),
  }
  if (run.caseId !== aggregate.caseV2.id || run.inputManifest.hash !== computeRunInputHash(aggregate.caseV2, snapshots.observations, snapshots.evidence)) {
    problems.push('Pi 审核运行的案卷/材料输入哈希已过期')
  }
  const template = getTemplate(aggregate.caseV2.templateId, aggregate.caseV2.templateVersion)
  if (!template || run.inputManifest.effectiveRuleSetHash !== hashEffectiveRuleSet(resolveEffectiveRules(aggregate, template))) {
    problems.push('Pi 当前生效 RuleSpec 与运行时版本指纹不一致')
  }
  const checkMap = new Map(run.checks.map((check) => [check.checkId, check]))
  const validDocuments = new Map(run.inputManifest.documentVersions.map((entry) => [entry.versionId, entry.contentHash]))
  for (const mapping of plan.mapping) {
    const allSubjects = aggregate.caseV2.subjects.map((item) => item.id).sort()
    const id = runtimeCheckId(mapping.ruleId, mapping.subjectId, allSubjects)
    const check = checkMap.get(id)
    if (!check || check.ruleId !== mapping.ruleId ||
        sha(check.target.subjectIds) !== sha(mapping.subjectId ? [mapping.subjectId] : allSubjects)) {
      problems.push('Pi 运行遗漏或错误复用了业务对象检查：' + mapping.checkId)
      continue
    }
    if (check.status === 'execution-failed' || check.status === 'not-executed') problems.push('检查仍未完成：' + mapping.checkId)
    if (mapping.authority === 'unverified-policy' && check.status !== 'awaiting-confirmation') {
      problems.push('未经核实的制度来源不能生成确定性结论：' + mapping.checkId)
    }
    if (!check.reason?.trim()) problems.push('审核结果缺少理由：' + mapping.checkId)
    const operationIssue = validateD2OperationEvidence(aggregate, mapping.ruleId, check.status, check.sourceRefs.map((ref) => ref.documentVersionId))
    if (operationIssue) problems.push(operationIssue)

    if (['compliant', 'non-compliant'].includes(check.status)) {
      if (!check.sourceRefs.length) problems.push('确定结果缺少真实 SourceRef：' + mapping.checkId)
      for (const ref of check.sourceRefs) {
        const doc = aggregate.caseV2.documents.find((entry) => entry.versionId === ref.documentVersionId && entry.active !== false)
        if (!doc || doc.parseRevision !== ref.parseRevision || !doc.contentHash || validDocuments.get(doc.versionId) !== doc.contentHash) {
          problems.push('材料版本/哈希/解析修订不匹配：' + mapping.checkId)
        }
      }
    }
  }
  return { complete: problems.length === 0, problems }
}

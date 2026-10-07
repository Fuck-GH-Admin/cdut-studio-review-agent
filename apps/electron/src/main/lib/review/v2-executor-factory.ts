/**
 * V2 真实执行器装配（G02 核心，docs/design/review-agent/07 §4.4 + 复查报告 §5.1）
 *
 * 修正"执行器只有节点 ID/hash、complete 结果未使用、固定返回空"：
 * - 输入装配：案卷字段值 + 负责人规则（compiledRules 逐条）+ 材料解析文本（有则注入、无则如实标注）
 * - extract：Pi complete 返回 JSON → 引用校验（sourceRefs 必须指向已解析材料）→ observations
 * - check：确定性引擎逐条评估（规则 when 条件 + 字段已知值）
 * - summarize：Pi 基于发现生成结论 JSON → opinions
 * - ocr：NullOcrPort 如实标注不可用（Tesseract 适配另批交付），不冒充已读
 * 全部节点走 executeRunGraph 的产物/检查点管线（A11）。
 */

import { readFileSync, statSync } from 'node:fs'
import { extname, isAbsolute, join, relative, resolve } from 'node:path'
import type { AiOpinion, CaseAggregateV2, CheckResult, CheckStatus, DocumentVersion, RuleSpec, SourceRef, TemplateVersion } from '@profer/shared'
import type { NodeExecutor, NodeKind } from './review-run-graph'
import type { ReviewModelClient } from './pi-review-executor'
import { REVIEW_SYSTEM_PROMPT } from './pi-review-executor'
import { evaluateCondition } from './deterministic-engine'
import { computeGroupScore } from './deterministic-engine'
import { buildTextSourceIndex } from './source-index'
import { getConfigDir } from '../config-paths'
import { extractJson } from './review-model-gateway'
import { resolveEffectiveRules } from './effective-rules'
import { subjectsForRule } from './rule-section-scope'

const MAX_REVIEW_VISION_IMAGES = 8
const MAX_REVIEW_VISION_IMAGE_BYTES = 8 * 1024 * 1024

/** 从当前激活材料的 image blocks 取受案卷目录约束的图片，作为 V2 模型视觉输入。 */
export function collectV2VisionImages(aggregate: CaseAggregateV2, caseRoot: string): string[] {
  const root = resolve(caseRoot)
  const images: string[] = []
  for (const document of aggregate.caseV2.documents) {
    if (document.active === false) continue
    for (const block of document.blocks) {
      if (block.kind !== 'image' || !block.imageAssetPath) continue
      if (images.length >= MAX_REVIEW_VISION_IMAGES) return images
      const assetPath = isAbsolute(block.imageAssetPath) ? resolve(block.imageAssetPath) : resolve(root, block.imageAssetPath)
      const relation = relative(root, assetPath)
      if (relation.startsWith('..') || isAbsolute(relation)) continue
      try {
        const size = statSync(assetPath).size
        if (size <= 0 || size > MAX_REVIEW_VISION_IMAGE_BYTES) continue
        const extension = extname(assetPath).toLowerCase()
        const mime = extension === '.jpg' || extension === '.jpeg' ? 'image/jpeg'
          : extension === '.webp' ? 'image/webp'
            : extension === '.gif' ? 'image/gif'
              : extension === '.png' ? 'image/png'
                : null
        if (!mime) continue
        images.push(`data:${mime};base64,${readFileSync(assetPath).toString('base64')}`)
      } catch {
        // A missing image must not prevent the text path from completing.
      }
    }
  }
  return images
}

/** 解析材料真实文本：PDF/Office 走 document-parser，文本直读；图片走 OCR 端口（不可用则如实空） */
async function materialTextOf(doc: DocumentVersion, caseId: string, ocr?: { available: boolean; recognize(req: { documentVersionId: string; pageAssetPath: string; language: string }): Promise<{ blocks: Array<{ text: string }> }> }): Promise<string> {
  const ext = doc.fileName.toLowerCase().split('.').pop() ?? ''
  // assetPath 已含 source-docs/{versionId}/{fileName} 相对段（material-service 写入），基于案卷目录拼接
  const absolute = join(getConfigDir(), 'review-cases', caseId, doc.assetPath)
  try {
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'].includes(ext)) {
      // 阶段 A：OCR 由注入端口承担（系统 tesseract 真实引擎）；不可用返回空（不冒充已读）
      if (!ocr?.available) return ''
      const result = await ocr.recognize({ documentVersionId: doc.versionId, pageAssetPath: absolute, language: 'chi_sim' })
      return result.blocks.map((block) => block.text).join(' ')
    }
    if (ext === 'pdf' || ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) {
      const { extractTextFromFile } = await import('../document-parser')
      const text = await extractTextFromFile(absolute)
      return text
    }
    const raw = readFileSync(absolute, 'utf-8')
    return raw
  } catch (error) {
    console.warn(`[executor] 材料解析失败 ${doc.fileName}:`, error instanceof Error ? error.message : error)
    return ''
  }
}

function truncate(text: string, max = 6000): string {
  return text.length > max ? `${text.slice(0, max)}\n…（截断）` : text
}

/** 构建注入给 Pi 的材料/规则/字段上下文（内容仅作为数据，指令边界由 REVIEW_SYSTEM_PROMPT 承担） */
async function buildMaterialContext(aggregate: CaseAggregateV2, template: TemplateVersion, rules: RuleSpec[], caseId: string, ocr?: { available: boolean; recognize(req: { documentVersionId: string; pageAssetPath: string; language: string }): Promise<{ blocks: Array<{ text: string }> }> }): Promise<string> {
  const parts: string[] = []
  const sectionById = new Map((template.sections ?? []).map((section) => [section.id, section.name]))
  const slotById = new Map(template.materialSlots.map((slot) => [slot.id, slot]))
  parts.push('【案卷字段】')
  for (const [key, value] of Object.entries(aggregate.caseV2.caseFields)) {
    parts.push(`- ${key} = ${JSON.stringify((value as { value: unknown }).value ?? null)}`)
  }
  for (const subject of aggregate.caseV2.subjects) {
    const sectionName = subject.sectionId ? sectionById.get(subject.sectionId) : undefined
    parts.push(`【${sectionName ? `分项「${sectionName}」·` : ''}事项 ${subject.id}】${subject.title}`)
    for (const [key, value] of Object.entries(subject.fields)) {
      parts.push(`- ${key} = ${JSON.stringify((value as { value: unknown }).value ?? null)}`)
    }
  }
  parts.push('【负责人规则】')
  for (const rule of rules) parts.push(`- ${rule.id}: ${rule.requirement}`)
  parts.push('【材料内容】')
  for (const doc of aggregate.caseV2.documents) {
    if (doc.active === false) continue
    const slot = doc.materialSlotId ? slotById.get(doc.materialSlotId) : undefined
    const sectionName = slot?.sectionId ? sectionById.get(slot.sectionId) : undefined
    const materialScope = sectionName ? `分项：${sectionName}` : '全案共用材料'
    const text = truncate(await materialTextOf(doc, caseId, ocr))
    const visualPages = doc.blocks.filter((block) => block.kind === 'image' && block.imageAssetPath).length
    const visualNote = visualPages > 0 ? `\n[含 ${visualPages} 张图像页；模型收到的页面范围会在提示中明确]` : ''
    parts.push(text
      ? `--- ${doc.fileName}（${doc.versionId}；${materialScope}） ---\n${text}${visualNote}`
      : visualPages > 0
        ? `--- ${doc.fileName}（${doc.versionId}；${materialScope}）--- [无可提取文本；图像页已附加供视觉识别]${visualNote}`
        : `--- ${doc.fileName}（${doc.versionId}；${materialScope}）--- [非文本或未可读：不作为已读依据]`)
  }
  return parts.join('\n')
}

export interface AssembleOptions {
  client: ReviewModelClient
  signal?: AbortSignal
  /** OCR 端口（真实引擎注入；缺省=图片不可读，如实标注） */
  ocrPort?: { available: boolean; unavailableReason?: string; recognize(req: { documentVersionId: string; pageAssetPath: string; language: string }): Promise<{ engine: string; engineVersion: string; blocks: Array<{ text: string; rect: { x: number; y: number; w: number; h: number }; confidence: number }>; imageWidth: number; imageHeight: number }> }
}

function fieldValueOf(value: unknown): unknown {
  if (value && typeof value === 'object' && 'value' in value) return (value as { value: unknown }).value
  return value
}

/** 唯一事实优先级：已确认人工值 → 人工录入 → 最新申报字段 → AI/其他识别 → 未知。 */
export function resolveEffectiveFieldValue(
  aggregate: CaseAggregateV2,
  observations: Array<Record<string, unknown>>,
  fieldKey: string,
  subjectId?: string,
): { known: boolean; value: unknown; observationId?: string; sourceRefs: SourceRef[] } {
  const matching = [...observations].reverse().filter((candidate) => candidate.subjectId === subjectId && candidate.fieldKey === fieldKey && 'value' in candidate)
  const humanConfirmed = matching.find((candidate) => candidate.extractedBy === 'user' && candidate.confirmed === true)
  const humanEntered = matching.find((candidate) => candidate.extractedBy === 'user')
  const selectedHuman = humanConfirmed ?? humanEntered
  if (selectedHuman) return {
    known: true,
    value: fieldValueOf(selectedHuman.value),
    observationId: typeof selectedHuman.id === 'string' ? selectedHuman.id : undefined,
    sourceRefs: sourceRefsFromUnknown(selectedHuman.sourceRefs),
  }
  if (subjectId) {
    const subject = aggregate.caseV2.subjects.find((candidate) => candidate.id === subjectId)
    const subjectValue = subject?.fields[fieldKey]
    if (subjectValue !== undefined) return { known: true, value: fieldValueOf(subjectValue), sourceRefs: [] }
    const observation = matching.find((candidate) => candidate.extractedBy !== 'user')
    if (observation) return {
      known: true,
      value: fieldValueOf(observation.value),
      observationId: typeof observation.id === 'string' ? observation.id : undefined,
      sourceRefs: sourceRefsFromUnknown(observation.sourceRefs),
    }
    return { known: false, value: null, sourceRefs: [] }
  }
  const caseValue = aggregate.caseV2.caseFields[fieldKey]
  if (caseValue !== undefined) return { known: true, value: fieldValueOf(caseValue), sourceRefs: [] }
  const observation = matching.find((candidate) => candidate.extractedBy !== 'user')
  if (observation) return {
    known: true,
    value: fieldValueOf(observation.value),
    observationId: typeof observation.id === 'string' ? observation.id : undefined,
    sourceRefs: sourceRefsFromUnknown(observation.sourceRefs),
  }
  return { known: false, value: null, sourceRefs: [] }
}

function sourceRefsFromUnknown(value: unknown): SourceRef[] {
  if (!Array.isArray(value)) return []
  return value.filter((ref): ref is SourceRef => !!ref && typeof ref === 'object' && typeof (ref as SourceRef).documentVersionId === 'string' && typeof (ref as SourceRef).caseId === 'string' && typeof (ref as SourceRef).location === 'object')
}

function makeCheckBasis(
  aggregate: CaseAggregateV2,
  resolved: Array<ReturnType<typeof resolveEffectiveFieldValue>> = [],
  evidenceLinks: CaseAggregateV2['evidenceLinks'] = [],
  extraRefs: SourceRef[] = [],
): NonNullable<CheckResult['basis']> {
  const observationIds = [...new Set(resolved.flatMap((item) => item.observationId ? [item.observationId] : []))]
  const refs = [...resolved.flatMap((item) => item.sourceRefs), ...extraRefs]
  const referencedVersions = new Set(refs.map((ref) => ref.documentVersionId))
  const links = evidenceLinks.filter((link) => referencedVersions.has(link.documentVersionId))
  const sourceRefs = [...refs]
  for (const link of links) {
    if (link.blockRef) sourceRefs.push(link.blockRef)
    else {
      const document = aggregate.caseV2.documents.find((candidate) => candidate.versionId === link.documentVersionId)
      if (document) sourceRefs.push({ caseId: aggregate.caseV2.id, documentVersionId: document.versionId, parseRevision: document.parseRevision, location: { kind: 'file' } })
    }
  }
  return {
    observationIds,
    evidenceLinkIds: [...new Set(links.map((link) => link.id))],
    sourceRefs: sourceRefs.filter((ref, index) => sourceRefs.findIndex((candidate) => candidate.documentVersionId === ref.documentVersionId && JSON.stringify(candidate.location) === JSON.stringify(ref.location)) === index),
  }
}

function conditionFields(condition: RuleSpec['when']): string[] {
  if ('all' in condition) return condition.all.flatMap(conditionFields)
  if ('any' in condition) return condition.any.flatMap(conditionFields)
  if ('not' in condition) return conditionFields(condition.not)
  return ['field' in condition ? condition.field : condition.fact]
}

function statusFromTriState(status: 'true' | 'false' | 'unknown', rule: RuleSpec): CheckStatus {
  if (status === 'true') return 'compliant'
  if (status === 'false') return 'non-compliant'
  return rule.onUnknown === 'pending' ? 'not-executed' : 'awaiting-confirmation'
}

function sourceRefsForRule(aggregate: CaseAggregateV2, rule: RuleSpec): SourceRef[] {
  return (rule.sourceRefIds ?? []).flatMap((sourceId) => {
    const document = aggregate.caseV2.documents.find((candidate) => candidate.versionId === sourceId || candidate.documentId === sourceId)
    return document ? [{ caseId: aggregate.caseV2.id, documentVersionId: document.versionId, parseRevision: document.parseRevision, location: { kind: 'file' as const } }] : []
  })
}

function checkIdFor(rule: RuleSpec, target: { scope: string; subjectIds: string[] }): string {
  return `check-${rule.id}-${target.scope}-${[...target.subjectIds].sort().join('-') || 'case'}`
}

/** 按规则作用域生成确定性/人工检查草稿，避免不同事项共享同一个字段值。 */
export function buildDeterministicRuleChecks(
  aggregate: CaseAggregateV2,
  rules: RuleSpec[],
  observations: Array<Record<string, unknown>> = [],
): CheckResult[] {
  const checks: CheckResult[] = []
  for (const rule of rules) {
    const scopedSubjects = subjectsForRule(aggregate.caseV2.subjects, rule)
    if (rule.execution === 'semantic') continue
    if (rule.execution === 'manual') {
      const targets = rule.targetScope === 'subject' ? scopedSubjects.map((subject) => [subject.id]) : [scopedSubjects.map((subject) => subject.id)]
      for (const subjectIds of targets) {
        const target = { scope: rule.targetScope === 'subject' ? 'subject' as const : rule.targetScope === 'group' ? 'group' as const : 'case' as const, subjectIds }
        checks.push({ checkId: checkIdFor(rule, target), ruleId: rule.id, status: 'awaiting-confirmation', reason: `需要人工核对：${rule.requirement}`, target, sourceRefs: sourceRefsForRule(aggregate, rule), executedBy: 'manual', executedAt: new Date().toISOString() })
      }
      continue
    }
    if (rule.targetScope === 'group') {
      if (!rule.calculation) {
        const target = { scope: 'group' as const, subjectIds: scopedSubjects.map((subject) => subject.id) }
        checks.push({ checkId: checkIdFor(rule, target), ruleId: rule.id, status: 'awaiting-confirmation', reason: `组级规则需要人工确认：${rule.requirement}`, target, sourceRefs: sourceRefsForRule(aggregate, rule), executedBy: 'deterministic', executedAt: new Date().toISOString() })
        continue
      }
      const resolvedInputs = scopedSubjects.map((subject) => {
        const keys = new Set([...Object.keys(subject.fields), rule.calculation!.valueFrom, ...(rule.calculation!.deduplicateBy ?? [])])
        const resolved = Object.fromEntries([...keys].map((key) => [key, resolveEffectiveFieldValue(aggregate, observations, key, subject.id)]))
        return {
          subject,
          resolved,
          input: {
            subjectId: subject.id,
            fields: Object.fromEntries(Object.entries(resolved).map(([key, item]) => [key, {
              value: typeof item.value === 'number' || typeof item.value === 'string' ? item.value : null,
              known: item.known,
            }])),
          },
        }
      })
      const inputs = resolvedInputs.map((item) => item.input)
      const outcome = computeGroupScore(rule, inputs)
      const target = { scope: 'group' as const, subjectIds: scopedSubjects.map((subject) => subject.id) }
      const basis = makeCheckBasis(aggregate, resolvedInputs.flatMap((item) => Object.values(item.resolved)), aggregate.evidenceLinks, sourceRefsForRule(aggregate, rule))
      checks.push({ checkId: checkIdFor(rule, target), ruleId: rule.id, status: outcome.status, reason: outcome.status === 'compliant' ? `组计入 ${outcome.total}` : `存在未知输入：${rule.requirement}`, target, sourceRefs: basis.sourceRefs, basis, executedBy: 'deterministic', executedAt: new Date().toISOString(), calculation: { inputs: [], result: String(outcome.total), detailLines: outcome.detailLines } })
      continue
    }
    const workspaceConstraint = rule.workspaceConstraint
    if (workspaceConstraint?.kind === 'score-value') {
      const condition = workspaceConstraint.appliesWhen
      if (!condition || typeof workspaceConstraint.value !== 'number') {
        const target = { scope: 'subject' as const, subjectIds: scopedSubjects.map((subject) => subject.id) }
        checks.push({ checkId: checkIdFor(rule, target), ruleId: rule.id, status: 'awaiting-confirmation', reason: '固定分值缺少明确适用条件，需人工核对', target, sourceRefs: sourceRefsForRule(aggregate, rule), executedBy: 'manual', executedAt: new Date().toISOString() })
        continue
      }
      for (const subject of scopedSubjects) {
        const applicability = resolveEffectiveFieldValue(aggregate, observations, condition.field, subject.id)
        const actualScore = resolveEffectiveFieldValue(aggregate, observations, 'declaredScore', subject.id)
        const applies = condition.equals !== undefined
          ? String(applicability.value) === String(condition.equals)
          : condition.includes !== undefined && typeof applicability.value === 'string'
            ? applicability.value.includes(condition.includes)
            : false
        const status: CheckStatus = !applicability.known || (condition.equals === undefined && condition.includes === undefined)
          ? 'awaiting-confirmation'
          : !applies ? 'not-applicable'
            : !actualScore.known || typeof actualScore.value !== 'number' ? 'awaiting-confirmation'
              : actualScore.value === workspaceConstraint.value ? 'compliant' : 'non-compliant'
        const target = { scope: 'subject' as const, subjectIds: [subject.id] }
        const basis = makeCheckBasis(aggregate, [applicability, actualScore], aggregate.evidenceLinks.filter((link) => link.subjectId === subject.id), sourceRefsForRule(aggregate, rule))
        checks.push({ checkId: checkIdFor(rule, target), ruleId: rule.id, status, reason: status === 'not-applicable'
          ? `该事项不符合固定分值适用条件（${condition.field}）`
          : status === 'awaiting-confirmation' ? `需要确认适用条件或申报分值（固定分值 ${workspaceConstraint.value}）`
            : `适用固定分值 ${workspaceConstraint.value}，申报 ${actualScore.value} 分`, target, sourceRefs: basis.sourceRefs, basis, executedBy: 'deterministic', executedAt: new Date().toISOString() })
      }
      continue
    }
    if (workspaceConstraint?.kind === 'level-mapping') {
      const subjectIds = rule.targetScope === 'subject' ? scopedSubjects.map((subject) => subject.id) : [undefined]
      for (const subjectId of subjectIds) {
        const levelValue = resolveEffectiveFieldValue(aggregate, observations, 'level', subjectId)
        const scoreValue = resolveEffectiveFieldValue(aggregate, observations, 'declaredScore', subjectId)
        const rawLevel = String(levelValue.value ?? '').trim()
        const mappingKeys = Object.keys(workspaceConstraint.levels ?? {}).sort((left, right) => right.length - left.length)
        const mappedKey = mappingKeys.find((level) => level === rawLevel)
          ?? Object.entries(workspaceConstraint.levelKeywords ?? {}).sort(([left], [right]) => right.length - left.length).find(([keyword]) => rawLevel.includes(keyword))?.[1]
          ?? mappingKeys.find((level) => rawLevel.includes(level))
        const expectedScore = mappedKey ? workspaceConstraint.levels?.[mappedKey] : undefined
        const actualScore = scoreValue.value
        const known = rawLevel.length > 0 && typeof expectedScore === 'number' && typeof actualScore === 'number'
        const status: CheckStatus = !known ? 'awaiting-confirmation' : expectedScore === actualScore ? 'compliant' : 'non-compliant'
        const target = subjectId
          ? { scope: 'subject' as const, subjectIds: [subjectId] }
          : { scope: 'case' as const, subjectIds: scopedSubjects.map((subjectItem) => subjectItem.id) }
        const relatedLinks = aggregate.evidenceLinks.filter((link) => (!subjectId || link.subjectId === subjectId) && link.status !== 'rejected')
        const linkedRefs = relatedLinks.flatMap((link) => {
          if (link.blockRef) return [link.blockRef]
          const document = aggregate.caseV2.documents.find((candidate) => candidate.versionId === link.documentVersionId)
          return document ? [{ caseId: aggregate.caseV2.id, documentVersionId: document.versionId, parseRevision: document.parseRevision, location: { kind: 'file' as const } }] : []
        })
        const basis = makeCheckBasis(aggregate, [levelValue, scoreValue], relatedLinks, [...sourceRefsForRule(aggregate, rule), ...linkedRefs])
        checks.push({
          checkId: checkIdFor(rule, target), ruleId: rule.id, status,
          reason: !known ? `无法将等级“${rawLevel || '未提供'}”映射到已确认标准或缺少申报分值` : `等级“${rawLevel}”对应 ${expectedScore} 分，申报 ${actualScore} 分`,
          target, sourceRefs: basis.sourceRefs, basis, executedBy: 'deterministic', executedAt: new Date().toISOString(),
        })
      }
      continue
    }
    if (workspaceConstraint?.kind === 'required-evidence') {
      const requiredTypes = workspaceConstraint.requiredEvidenceTypes ?? []
      const subjectIds = rule.targetScope === 'subject' ? scopedSubjects.map((subject) => subject.id) : [undefined]
      const normalize = (value: string): string => value.toLocaleLowerCase().replace(/[\s\-_.、，,。:：()（）]/g, '')
      for (const subjectId of subjectIds) {
        const matchedDocuments = aggregate.caseV2.documents.filter((document) => document.active !== false && requiredTypes.some((required) => {
          const wanted = normalize(required)
          return [document.fileName, document.materialSlotId ?? ''].some((value) => {
            const actual = normalize(value)
            return actual.length > 0 && (actual.includes(wanted) || wanted.includes(actual))
          })
        }))
        const links = aggregate.evidenceLinks.filter((link) => link.subjectId === subjectId && matchedDocuments.some((document) => document.versionId === link.documentVersionId))
        const confirmed = links.some((link) => link.status === 'confirmed')
        const candidate = links.some((link) => link.status === 'candidate')
        const status: CheckStatus = confirmed ? 'compliant' : candidate || matchedDocuments.length > 0 ? 'awaiting-confirmation' : 'awaiting-supplement'
        const target = subjectId
          ? { scope: 'subject' as const, subjectIds: [subjectId] }
          : { scope: 'case' as const, subjectIds: scopedSubjects.map((subject) => subject.id) }
        const names = matchedDocuments.map((document) => document.fileName)
        const matchedRefs = matchedDocuments.map((document) => ({ caseId: aggregate.caseV2.id, documentVersionId: document.versionId, parseRevision: document.parseRevision, location: { kind: 'file' as const } }))
        const basis = makeCheckBasis(aggregate, [], links, [...sourceRefsForRule(aggregate, rule), ...matchedRefs])
        checks.push({
          checkId: checkIdFor(rule, target), ruleId: rule.id, status,
          reason: confirmed ? `已确认所需证明：${names.join('、')}` : candidate || names.length ? `发现证明候选，需人工确认：${names.join('、') || requiredTypes.join('、')}` : `缺少所需证明：${requiredTypes.join('、')}`,
          target,
          sourceRefs: basis.sourceRefs,
          basis,
          executedBy: 'deterministic', executedAt: new Date().toISOString(),
        })
      }
      continue
    }
    const subjectIds = rule.targetScope === 'subject' ? scopedSubjects.map((subject) => subject.id) : [undefined]
    for (const subjectId of subjectIds) {
      const resolvedByField = new Map([...new Set(conditionFields(rule.when))].map((field) => [field, resolveEffectiveFieldValue(aggregate, observations, field, subjectId)]))
      const resolvedFields = [...resolvedByField.values()]
      const status = evaluateCondition(rule.when, (ref) => resolvedByField.get(ref.field ?? ref.fact ?? '') ?? { known: false, value: null })
      const target = rule.targetScope === 'subject' && subjectId
        ? { scope: 'subject' as const, subjectIds: [subjectId] }
        : { scope: 'case' as const, subjectIds: scopedSubjects.map((subject) => subject.id) }
      const basis = makeCheckBasis(aggregate, resolvedFields, aggregate.evidenceLinks.filter((link) => !subjectId || link.subjectId === subjectId), sourceRefsForRule(aggregate, rule))
      checks.push({
        checkId: checkIdFor(rule, target),
        ruleId: rule.id,
        status: statusFromTriState(status, rule),
        reason: rule.requirement,
        target,
        sourceRefs: basis.sourceRefs,
        basis,
        executedBy: 'deterministic',
        executedAt: new Date().toISOString(),
      })
    }
  }
  return checks
}

/** 装配 11 个节点的真实执行器（extract/summarize 走 Pi；check/calculate 走确定性引擎） */
export async function assembleV2Executors(aggregate: CaseAggregateV2, template: TemplateVersion, options: AssembleOptions): Promise<Record<NodeKind, NodeExecutor>> {
  const caseId = aggregate.caseV2.id
  const rules = resolveEffectiveRules(aggregate, template).map((item) => item.rule)
  const subjectIds = aggregate.caseV2.subjects.map((subject) => subject.id)
  let extractedObservations: Array<Record<string, unknown>> = aggregate.observations.map((observation) => observation as unknown as Record<string, unknown>)
  let latestDeterministicChecks: Array<Record<string, unknown>> = []
  const semanticRules = rules.filter((rule) => rule.execution === 'semantic')
  // 材料上下文按需构建（PDF/Office 为异步解析）
  const materialContext = await buildMaterialContext(aggregate, template, rules, caseId, options.ocrPort)
  const visionImages = collectV2VisionImages(aggregate, join(getConfigDir(), 'review-cases', caseId))
  const visualPageCount = aggregate.caseV2.documents.filter((document) => document.active !== false)
    .reduce((count, document) => count + document.blocks.filter((block) => block.kind === 'image' && block.imageAssetPath).length, 0)
  const visualLimitNote = visualPageCount > visionImages.length
    ? `\n【图像覆盖提示】当前案卷有 ${visualPageCount} 张图像页，本次模型请求实际附带 ${visionImages.length} 张；未附带或无法读取的页面必须保留人工核对，不得据此形成完整结论。`
    : ''
  if (visualPageCount > visionImages.length) {
    // Run-level material ledger must prevent an all-clear verdict when visual pages were omitted.
    for (const document of aggregate.caseV2.documents) {
      if (document.active === false || !document.blocks.some((block) => block.kind === 'image' && block.imageAssetPath)) continue
      document.usage = 'partially-read'
      document.unusedReason = '本次审核未能把全部图像页送入模型，需人工核对未覆盖页面'
    }
  }

  const piExtract: NodeExecutor = async (node, inputHash) => {
    if (options.signal?.aborted) throw new Error('已取消（模型调用前）')
    const prompt = [
      `任务：从下列案卷材料中抽取事实（observations）。`,
      `输出 JSON 数组，每项 {"subjectId":"…","fieldKey":"…","value":…,"sourceRefs":[{"documentVersionId":"…","quote":"原文引用"}],"confidence":0~1}。`,
      `要求：sourceRefs 的 documentVersionId 必须来自下方材料清单；无对应材料的事实不得输出。`,
      materialContext,
      visualLimitNote,
    ].join('\n')
    const { content } = await options.client.complete({ prompt, system: REVIEW_SYSTEM_PROMPT, signal: options.signal, images: visionImages })
    if (options.signal?.aborted) throw new Error('已取消（模型调用后）')
    const parsed = extractJson(content)
    const items = Array.isArray(parsed) ? parsed : (parsed as { observations?: unknown[] })?.observations
    const observations = (Array.isArray(items) ? items : []).map((raw) => {
      const item = raw as { subjectId?: string; fieldKey?: string; value?: unknown; sourceRefs?: Array<{ documentVersionId?: string; quote?: string }>; confidence?: number }
      // 引用校验：指向不存在/未激活材料的 observation 丢弃（防伪造引用）
      const refs = (item.sourceRefs ?? []).flatMap((ref) => {
        const document = aggregate.caseV2.documents.find((candidate) => candidate.versionId === ref.documentVersionId && candidate.active !== false)
        if (!document) return []
        const matched = ref.quote ? document.blocks.find((block) => block.text.includes(ref.quote!) || ref.quote!.includes(block.text)) : undefined
        return [{
          caseId,
          documentVersionId: document.versionId,
          parseRevision: document.parseRevision,
          location: matched?.location ?? { kind: 'file' as const },
          ...(ref.quote ? { quote: ref.quote } : {}),
        }]
      })
      const subject = item.subjectId ? aggregate.caseV2.subjects.find((candidate) => candidate.id === item.subjectId) : undefined
      const fieldSpec = item.fieldKey ? template.fields.find((field) => field.key === item.fieldKey) : undefined
      const fieldBelongsToSubject = !!fieldSpec
        && (fieldSpec.scope ?? 'subject') === 'subject'
        && (!fieldSpec.sectionId || fieldSpec.sectionId === subject?.sectionId)
      if (!subject || !item.fieldKey || !fieldBelongsToSubject || refs.length === 0) return null
      return { subjectId: item.subjectId, fieldKey: item.fieldKey, value: item.value ?? null, sourceRefs: refs, extractedBy: 'ai' as const, confirmed: false, confidence: item.confidence }
    }).filter(Boolean)
    const latestConfirmedByField = new Map<string, Record<string, unknown>>()
    for (const observation of [...aggregate.observations].sort((a, b) => a.createdAt.localeCompare(b.createdAt))) {
      if (observation.extractedBy === 'user' && observation.confirmed) {
        latestConfirmedByField.set(`${observation.subjectId}::${observation.fieldKey}`, observation as unknown as Record<string, unknown>)
      }
    }
    const aiCandidates = observations as Array<Record<string, unknown>>
    const effectiveCandidates = aiCandidates.filter((candidate) => !latestConfirmedByField.has(`${String(candidate.subjectId)}::${String(candidate.fieldKey)}`))
    extractedObservations = [...effectiveCandidates, ...latestConfirmedByField.values()]
    return { status: 'done' as const, inputHash, artifact: { sourceIds: [caseId], observations: [...aiCandidates, ...latestConfirmedByField.values()], parseIndex: [] } }
  }

  const piSummarize: NodeExecutor = async (node, inputHash) => {
    if (options.signal?.aborted) throw new Error('已取消（模型调用前）')
    const findingsText = rules.map((rule) => {
      const section = rule.sectionId ? template.sections?.find((candidate) => candidate.id === rule.sectionId) : undefined
      const subjectIds = subjectsForRule(aggregate.caseV2.subjects, rule).map((subject) => subject.id)
      return `- ${rule.id}${section ? `（分项：${section.name}；适用事项：${subjectIds.join('、') || '无'}）` : ''}（${rule.execution}，${rule.targetScope}）：${rule.requirement}`
    }).join('\n')
    const prompt = [
      '任务：基于案卷字段、材料与规则清单，给出审核结论。',
      '分项规则只适用于标明的分项事项；分项材料按材料清单标注使用，全案共用材料可供各分项参考。不得把另一分项的专属证明当成本分项的依据。',
      '输出 JSON：{"opinion":"…简短结论…","checks":[{"ruleId":"…","status":"compliant|non-compliant|awaiting-confirmation|not-applicable","reason":"…","subjectIds":["…"]}]}。只为 semantic 规则输出 checks；deterministic/manual 规则由系统提供。',
      `当前已生成的规则检查：${JSON.stringify(latestDeterministicChecks)}`,
      `规则清单：\n${findingsText}`,
      materialContext,
      visualLimitNote,
    ].join('\n')
    const { content } = await options.client.complete({ prompt, system: REVIEW_SYSTEM_PROMPT, signal: options.signal, images: visionImages })
    if (options.signal?.aborted) throw new Error('已取消（模型调用后）')
    const parsed = (extractJson(content) ?? {}) as { opinion?: string; checks?: Array<{ ruleId?: string; status?: string; reason?: string; subjectIds?: string[] }> }
    const validRuleIds = new Set(semanticRules.map((rule) => rule.id))
    const semanticChecks = (parsed.checks ?? []).flatMap((check) => {
      if (!check.ruleId || !validRuleIds.has(check.ruleId)) return []
      const rule = semanticRules.find((candidate) => candidate.id === check.ruleId)!
      const applicableSubjects = subjectsForRule(aggregate.caseV2.subjects, rule)
      const applicableSubjectIds = new Set(applicableSubjects.map((subject) => subject.id))
      const allowed: CheckStatus[] = ['compliant', 'non-compliant', 'awaiting-confirmation', 'not-applicable']
      if (!check.status || !allowed.includes(check.status as CheckStatus)) return []
      const subjectIds = rule.targetScope === 'subject'
        ? ((check.subjectIds?.length ? check.subjectIds : [...applicableSubjectIds]).filter((subjectId) => applicableSubjectIds.has(subjectId)))
        : applicableSubjects.map((subject) => subject.id)
      const targets = rule.targetScope === 'subject'
        ? subjectIds.map((subjectId) => ({ scope: 'subject' as const, subjectIds: [subjectId] }))
        : [{ scope: rule.targetScope === 'group' ? 'group' as const : 'case' as const, subjectIds }]
      return targets.map((target) => ({
        checkId: checkIdFor(rule, target),
        ruleId: rule.id,
        status: check.status as CheckStatus,
        reason: check.reason || rule.requirement,
        target,
        sourceRefs: sourceRefsForRule(aggregate, rule),
        executedBy: 'semantic' as const,
        executedAt: new Date().toISOString(),
      }))
    })
    const opinion = parsed.opinion || (latestDeterministicChecks.length > 0 ? `已完成 ${latestDeterministicChecks.length} 项规则检查。` : '已完成材料整理，暂无可执行规则。')
    const aiOpinion: AiOpinion = { id: `opinion-${caseId}-${Date.now()}`, kind: 'summary', severity: 'yellow', title: 'AI 审核意见', detail: opinion, suggestion: 'manual-review', suggestionText: '请审核员结合待办和依据作出最终决定', sourceRefs: [], verification: 'unverified' }
    return { status: 'done' as const, inputHash, artifact: { sourceIds: [caseId], checks: semanticChecks as Array<Record<string, unknown>>, opinions: [aiOpinion as unknown as Record<string, unknown>], summary: opinion } }
  }

  const deterministicCheck: NodeExecutor = async (node, inputHash) => {
    const checks = buildDeterministicRuleChecks(aggregate, rules, extractedObservations)
    latestDeterministicChecks = checks as unknown as Array<Record<string, unknown>>
    return { status: 'done' as const, inputHash, artifact: { sourceIds: [caseId], checks: latestDeterministicChecks } }
  }

  const parse: NodeExecutor = async (_node, inputHash) => {
    // 解析：文本材料建段落索引（图片材料如实 unread）
    const parseIndex: Array<Record<string, unknown>> = []
    for (const doc of aggregate.caseV2.documents) {
      if (doc.active === false) continue
      const text = await materialTextOf(doc, caseId, options.ocrPort)
      if (!text) continue
      const index = buildTextSourceIndex(doc.versionId, text)
      parseIndex.push({ documentVersionId: doc.versionId, segments: index.entries.length, kind: 'text' })
    }
    return { status: 'done' as const, inputHash, artifact: { sourceIds: [caseId], parseIndex } }
  }

  const ocr: NodeExecutor = async (_node, inputHash) => {
    // OCR：有真实端口（系统 tesseract）则逐图识别产出块级文本索引；不可用如实标注——不冒充已读
    const images = aggregate.caseV2.documents.filter((doc) => doc.active !== false && /\.(png|jpg|jpeg|gif|webp|bmp)$/i.test(doc.fileName))
    const ocrPort = options.ocrPort
    const parseIndex: Array<Record<string, unknown>> = []
    for (const doc of images) {
      const absolute = join(getConfigDir(), 'review-cases', caseId, doc.assetPath)
      if (!ocrPort?.available) {
        parseIndex.push({ documentVersionId: doc.versionId, kind: 'image', ocr: 'unavailable', reason: ocrPort?.unavailableReason ?? '未注入 OCR 端口' })
        continue
      }
      try {
        const result = await ocrPort.recognize({ documentVersionId: doc.versionId, pageAssetPath: absolute, language: 'chi_sim' })
        parseIndex.push({ documentVersionId: doc.versionId, kind: 'image', ocr: 'done', engine: result.engine, blocks: result.blocks.length })
      } catch (error) {
        parseIndex.push({ documentVersionId: doc.versionId, kind: 'image', ocr: 'failed', reason: error instanceof Error ? error.message : String(error) })
      }
    }
    return { status: 'done' as const, inputHash, artifact: { sourceIds: [caseId], parseIndex } }
  }

  const trivial = (extra: Record<string, unknown> = {}): NodeExecutor => async (_node, inputHash) => ({ status: 'done' as const, inputHash, artifact: { sourceIds: [caseId], ...extra } })

  const map: Record<NodeKind, NodeExecutor> = {
    register: trivial({ registered: aggregate.caseV2.documents.filter((doc) => doc.active !== false).map((doc) => doc.versionId) }),
    parse,
    ocr,
    extract: piExtract,
    bind: trivial(),
    plan: trivial({ plannedRules: rules.map((rule) => rule.id) }),
    check: deterministicCheck,
    calculate: trivial(),
    verify: trivial(),
    summarize: piSummarize,
    task: trivial(),
  }
  void subjectIds
  return map
}

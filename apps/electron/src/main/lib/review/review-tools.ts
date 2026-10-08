/**
 * 审核业务工具集（M3，设计 03 §5 Agent 工具与受控执行 + §2 复用边界）
 *
 * Pi 执行器只装配"本案业务工具"（不暴露通用文件/网络工具）；全部写入经由
 * 受控函数（Observation/EvidenceLink/CheckResult 追加），不直接写盘、不触碰主进程状态。
 * 工具边界：read 前缀为只读；record / link / submit 前缀为受控写入（返回新数组，由执行器决定持久化）。
 */

import type { CheckResult, EvidenceLink, FieldSpec, FieldValue, Observation, ReviewSubject, SourceRef, DocumentVersion, RuleSpec } from '@profer/shared'
import { buildEvidenceLinks, recordObservation } from './evidence-service'
import { computeGroupScore, toCalculationResult, type CalcInput } from './deterministic-engine'

/** 工具运行上下文：受控内存态（执行器持引用，持久化在 checkpoint 完成时统一处理） */
export interface ReviewToolContext {
  caseId: string
  subjects: ReviewSubject[]
  documents: DocumentVersion[]
  rules: RuleSpec[]
  fields?: FieldSpec[]
  observations: Observation[]
  evidenceLinks: EvidenceLink[]
  results: CheckResult[]
  actor: string
}

export interface ReviewTool {
  name: string
  description: string
  /** 输入摘要（Prompt 可见；真实 schema 由执行器校验） */
  input: string
  execute(input: Record<string, unknown>): Promise<{ ok: true; data: unknown } | { ok: false; error: string }>
}

function findSubject(context: ReviewToolContext, subjectId: string): ReviewSubject | undefined {
  return context.subjects.find((subject) => subject.id === subjectId)
}

/** 装配本案业务工具（Pi 执行器在 run 开始时调用；工具集固定，不随 Prompt 变化） */
export function buildReviewTools(context: ReviewToolContext): ReviewTool[] {
  const ref = (documentVersionId: string, blockId?: string, quote?: string): SourceRef | undefined => {
    const document = context.documents.find((candidate) => candidate.versionId === documentVersionId)
    if (!document) return undefined
    const block = blockId ? document.blocks.find((candidate) => candidate.blockId === blockId) : undefined
    if (blockId && !block) return undefined
    if (block?.kind === 'image' && quote) return undefined
    if (block && quote && block.text && !block.text.includes(quote)) return undefined
    return {
      caseId: context.caseId,
      documentVersionId,
      parseRevision: document.parseRevision,
      location: block?.location ?? { kind: 'file' },
      ...(quote || block?.text ? { quote: (quote || block?.text || '').slice(0, 400) } : {}),
    }
  }

  const tools: ReviewTool[] = [
    {
      name: 'read_subject_field',
      description: '读取指定主体的字段当前值（含确认态），缺失返回 unknown 而不是空串',
      input: '{ subjectId, fieldKey }',
      async execute(input) {
        const subject = findSubject(context, String(input.subjectId ?? ''))
        if (!subject) return { ok: false, error: `主体不存在: ${String(input.subjectId)}` }
        const fieldKey = String(input.fieldKey ?? '')
        const value = subject.fields[fieldKey]
        return {
          ok: true,
          data: value === undefined ? { known: false, value: null } : { known: true, value: value.kind === 'number' ? (value as { value: number }).value : (value as { value: unknown }).value, kind: value.kind },
        }
      },
    },
    {
      name: 'search_document_text',
      description: '在案卷文档（依据/待审/证明）中按关键词检索文本块，返回 documentId/blockId/文本（供引用）',
      input: '{ keyword, role? }',
      async execute(input) {
        const keyword = String(input.keyword ?? '')
        const role = input.role as string | undefined
        if (!keyword) return { ok: false, error: 'keyword 不能为空' }
        const hits: Array<{ documentVersionId: string; blockId: string; fileName: string; location: unknown; text: string }> = []
        const visualBlocks: Array<{ documentVersionId: string; blockId: string; fileName: string; location: unknown; imageAlt?: string }> = []
        for (const document of context.documents) {
          if (role && document.role !== role) continue
          for (const block of document.blocks) {
            if (block.kind === 'image') {
              visualBlocks.push({ documentVersionId: document.versionId, blockId: block.blockId, fileName: document.fileName, location: block.location ?? { kind: 'file' }, ...(block.imageAlt ? { imageAlt: block.imageAlt } : {}) })
              continue
            }
            if (block.text.includes(keyword)) {
              hits.push({ documentVersionId: document.versionId, blockId: block.blockId, fileName: document.fileName, location: block.location ?? { kind: 'file' }, text: block.text.slice(0, 400) })
            }
          }
        }
        return { ok: true, data: { hits, visualBlocks, truncated: hits.length > 50 } }
      },
    },
    {
      name: 'read_rule',
      description: '读取指定审核规则的要求、执行方式、作用范围、确认状态和适用期限；不存在或未确认规则不得推断为自动通过',
      input: '{ ruleId }',
      async execute(input) {
        const rule = context.rules.find((candidate) => candidate.id === String(input.ruleId ?? ''))
        if (!rule) return { ok: false, error: `规则不存在: ${String(input.ruleId ?? '')}` }
        return { ok: true, data: { id: rule.id, title: rule.title, requirement: rule.requirement, execution: rule.execution, targetScope: rule.targetScope, sectionId: rule.sectionId ?? null, confirmation: rule.confirmation, effectiveFrom: rule.effectiveFrom ?? null, effectiveUntil: rule.effectiveUntil ?? null, onFail: rule.onFail, onUnknown: rule.onUnknown } }
      },
    },
    {
      name: 'record_observation',
      description: '记录从材料提取的事实（受控写入；人工确认值不被覆盖，生成 supersedes 链）',
      input: '{ subjectId, fieldKey, kind, value, documentVersionId }',
      async execute(input) {
        const subjectId = String(input.subjectId ?? '')
        const subject = findSubject(context, subjectId)
        if (!subject) return { ok: false, error: `主体不存在: ${subjectId}` }
        const fieldKey = String(input.fieldKey ?? '')
        const fieldSpec = context.fields?.find((candidate) => candidate.key === fieldKey)
        if (context.fields && !fieldSpec) return { ok: false, error: `字段不在模板中: ${fieldKey}` }
        if (fieldSpec && (fieldSpec.scope ?? 'subject') !== 'subject') return { ok: false, error: `字段不是事项字段: ${fieldKey}` }
        if (fieldSpec?.sectionId && fieldSpec.sectionId !== subject.sectionId) return { ok: false, error: `字段 ${fieldKey} 不属于分项 ${subject.sectionId ?? '(未分项)'}` }
        const kind = String(input.kind ?? fieldSpec?.kind ?? 'text') as FieldValue['kind']
        if (fieldSpec && fieldSpec.kind !== kind) return { ok: false, error: `字段 ${fieldKey} 类型不匹配: 需要 ${fieldSpec.kind}` }
        const rawValue = input.value
        const documentVersionId = String(input.documentVersionId ?? '')
        const blockId = typeof input.blockId === 'string' ? input.blockId : undefined
        const quote = typeof input.quote === 'string' ? input.quote : undefined
        const sourceRef = ref(documentVersionId, blockId, quote)
        if (!sourceRef) return { ok: false, error: `材料版本或引用块不存在，或引用内容与原文不一致: ${documentVersionId}${blockId ? `/${blockId}` : ''}` }
        if (!blockId) return { ok: false, error: '记录审核事实必须引用材料块 blockId；请先搜索材料或定位图像页' }
        let value: FieldValue
        if (kind === 'number') {
          const number = typeof rawValue === 'number' ? rawValue : Number(rawValue)
          if (!Number.isFinite(number)) return { ok: false, error: `数字字段 ${fieldKey} 的值无效` }
          value = { kind, value: number, ...(fieldSpec?.unit ? { unit: fieldSpec.unit } : {}) }
        } else if (kind === 'boolean') {
          if (typeof rawValue !== 'boolean') return { ok: false, error: `布尔字段 ${fieldKey} 必须提交 true/false` }
          value = { kind, value: rawValue }
        } else if (kind === 'multi') {
          if (!Array.isArray(rawValue) || rawValue.some((item) => typeof item !== 'string')) return { ok: false, error: `多选字段 ${fieldKey} 必须是字符串列表` }
          value = { kind, value: rawValue as string[] }
        } else if (kind === 'text' || kind === 'date' || kind === 'enum') {
          if (typeof rawValue !== 'string') return { ok: false, error: `字段 ${fieldKey} 必须提交文本` }
          value = { kind, value: rawValue }
        } else {
          return { ok: false, error: `暂不支持由 Agent 抽取 ${kind} 类型字段` }
        }
        const updated = recordObservation(context.observations, {
          subjectId,
          fieldKey,
          value,
          sourceRefs: [sourceRef],
          extractedBy: 'ai',
        })
        context.observations.length = 0
        context.observations.push(...updated)
        return { ok: true, data: { recorded: true, fieldKey, sourceRef, observations: updated.length } }
      },
    },
    {
      name: 'link_evidence',
      description: '把证明材料绑定到主体事实（candidate；人工确认走命令信封）',
      input: '{ documentVersionId, subjectIds, supportsFact }',
      async execute(input) {
        const documentVersionId = String(input.documentVersionId ?? '')
        if (!context.documents.some((document) => document.versionId === documentVersionId)) return { ok: false, error: `材料版本不存在: ${documentVersionId}` }
        const subjectIds = Array.isArray(input.subjectIds) ? (input.subjectIds as string[]) : []
        const missingSubject = subjectIds.find((subjectId) => !findSubject(context, subjectId))
        if (missingSubject) return { ok: false, error: `主体不存在: ${missingSubject}` }
        const updated = buildEvidenceLinks(context.evidenceLinks, {
          documentVersionId,
          subjectIds,
          supportsFact: String(input.supportsFact ?? ''),
          linkedBy: 'ai',
        })
        context.evidenceLinks.length = 0
        context.evidenceLinks.push(...updated)
        return { ok: true, data: { links: updated.length } }
      },
    },
    {
      name: 'submit_check',
      description: '提交确定性检查结果（组级计分走确定引擎，语义/人工检查附理由；不直接写盘）',
      input: '{ ruleId, scope, subjectIds, status, reason, detailLines? }',
      async execute(input) {
        const rule = context.rules.find((candidate) => candidate.id === String(input.ruleId ?? ''))
        if (!rule) return { ok: false, error: `规则不存在: ${String(input.ruleId)}` }
        const status = String(input.status ?? '') as CheckResult['status']
        if (!['compliant', 'non-compliant', 'awaiting-supplement', 'awaiting-confirmation', 'not-applicable'].includes(status)) {
          return { ok: false, error: `非法检查状态: ${status}` }
        }
        const subjectIds = Array.isArray(input.subjectIds) ? (input.subjectIds as string[]) : []
        if (subjectIds.some((subjectId) => !findSubject(context, subjectId))) return { ok: false, error: '检查主体列表包含未知事项' }
        if (rule.sectionId && subjectIds.some((subjectId) => findSubject(context, subjectId)?.sectionId !== rule.sectionId)) return { ok: false, error: `规则 ${rule.id} 不能检查其他分项的事项` }
        const rawSourceRefs = Array.isArray(input.sourceRefs) ? input.sourceRefs : []
        const sourceRefs = rawSourceRefs.flatMap((candidate) => {
          if (!candidate || typeof candidate !== 'object') return []
          const refValue = candidate as { documentVersionId?: unknown; blockId?: unknown; quote?: unknown }
          if (typeof refValue.documentVersionId !== 'string') return []
          const resolved = ref(refValue.documentVersionId, typeof refValue.blockId === 'string' ? refValue.blockId : undefined, typeof refValue.quote === 'string' ? refValue.quote : undefined)
          return resolved ? [resolved] : []
        })
        if (rule.execution === 'semantic' && ['compliant', 'non-compliant'].includes(status) && sourceRefs.length === 0) {
          return { ok: false, error: '符合/不符合结论必须引用至少一个真实材料块；否则应提交待人工确认或补件' }
        }
        if (sourceRefs.length !== rawSourceRefs.length) {
          return { ok: false, error: 'sourceRefs 含不存在的材料块或与原文不匹配的引用；请重新搜索并提交准确定位' }
        }
        let result: CheckResult
        if (rule.execution === 'deterministic' && rule.calculation) {
          const inputs: CalcInput[] = subjectIds.map((subjectId) => ({
            subjectId,
            fields: Object.fromEntries(
              Object.entries(findSubject(context, subjectId)?.fields ?? {}).map(([key, value]) => [
                key,
                value.kind === 'number' ? { value: value.value as number, known: true } : { value: null, known: false },
              ]),
            ),
          }))
          const outcome = computeGroupScore(rule, inputs)
          result = toCalculationResult(rule, outcome, { scope: rule.targetScope, subjectIds })
        } else {
          result = {
            checkId: `chk-${rule.id}-${Date.now()}`,
            ruleId: rule.id,
            target: { scope: rule.targetScope, subjectIds },
            status,
            reason: String(input.reason ?? ''),
            sourceRefs,
            executedBy: rule.execution === 'semantic' ? 'semantic' : 'manual',
            executedAt: new Date().toISOString(),
          }
        }
        context.results.push(result)
        return { ok: true, data: { checkId: result.checkId, status: result.status } }
      },
    },
  ]
  const byName = new Map(tools.map((tool) => [tool.name, tool]))
  const search = byName.get('search_document_text')!
  const record = byName.get('record_observation')!
  const submit = byName.get('submit_check')!
  tools.push(
    {
      name: 'search_document_text_batch',
      description: '一次按多个关键词检索材料块，返回带 documentVersionId/blockId 的命中；优先批量搜索，避免逐词重复调用。',
      input: '{ keywords: string[], role? }',
      async execute(input) {
        const keywords = Array.isArray(input.keywords)
          ? [...new Set(input.keywords.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean))].slice(0, 32)
          : []
        if (keywords.length === 0) return { ok: false, error: 'keywords 必须包含至少一个非空搜索词' }
        const role = typeof input.role === 'string' ? input.role : undefined
        const results = []
        for (const keyword of keywords) {
          const outcome = await search.execute({ keyword, role })
          results.push({ keyword, ...outcome })
        }
        return { ok: true, data: { results } }
      },
    },
    {
      name: 'record_observations',
      description: '一次受控记录多条材料事实；每条都必须带真实 documentVersionId、blockId 和准确 quote。',
      input: '{ observations: Array<{ subjectId, fieldKey, kind, value, documentVersionId, blockId, quote? }> }',
      async execute(input) {
        const observations = Array.isArray(input.observations) ? input.observations.slice(0, 50) : []
        if (observations.length === 0) return { ok: false, error: 'observations 必须包含至少一条事实' }
        const results = []
        for (const observation of observations) {
          if (!observation || typeof observation !== 'object' || Array.isArray(observation)) {
            results.push({ ok: false, error: '事实必须是对象' })
            continue
          }
          results.push(await record.execute(observation as Record<string, unknown>))
        }
        return { ok: true, data: { results } }
      },
    },
    {
      name: 'submit_checks',
      description: '一次受控提交多条规则检查；每条语义符合/不符合结论都须附真实材料块引用。',
      input: '{ checks: Array<{ ruleId, scope?, subjectIds, status, reason, detailLines?, sourceRefs? }> }',
      async execute(input) {
        const checks = Array.isArray(input.checks) ? input.checks.slice(0, 50) : []
        if (checks.length === 0) return { ok: false, error: 'checks 必须包含至少一项检查' }
        const results = []
        for (const check of checks) {
          if (!check || typeof check !== 'object' || Array.isArray(check)) {
            results.push({ ok: false, error: '检查项必须是对象' })
            continue
          }
          results.push(await submit.execute(check as Record<string, unknown>))
        }
        return { ok: true, data: { results } }
      },
    },
  )
  return tools
}

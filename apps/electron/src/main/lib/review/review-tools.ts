/**
 * 审核业务工具集（M3，设计 03 §5 Agent 工具与受控执行 + §2 复用边界）
 *
 * Pi 执行器只装配"本案业务工具"（不暴露通用文件/网络工具）；全部写入经由
 * 受控函数（Observation/EvidenceLink/CheckResult 追加），不直接写盘、不触碰主进程状态。
 * 工具边界：read 前缀为只读；record / link / submit 前缀为受控写入（返回新数组，由执行器决定持久化）。
 */

import type { CheckResult, EvidenceLink, FieldValue, Observation, ReviewSubject, SourceRef, DocumentVersion, RuleSpec } from '@profer/shared'
import { buildEvidenceLinks, recordObservation } from './evidence-service'
import { computeGroupScore, toCalculationResult, type CalcInput } from './deterministic-engine'

/** 工具运行上下文：受控内存态（执行器持引用，持久化在 checkpoint 完成时统一处理） */
export interface ReviewToolContext {
  caseId: string
  subjects: ReviewSubject[]
  documents: DocumentVersion[]
  rules: RuleSpec[]
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
  const ref = (documentVersionId: string): SourceRef => ({ caseId: context.caseId, documentVersionId, parseRevision: 1, location: { kind: 'file' } })

  return [
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
        const hits: Array<{ documentId: string; blockId: string; fileName: string; text: string }> = []
        for (const document of context.documents) {
          if (role && document.role !== role) continue
          for (const block of document.blocks) {
            if (block.text.includes(keyword)) {
              hits.push({ documentId: document.documentId, blockId: block.blockId, fileName: document.fileName, text: block.text.slice(0, 200) })
            }
          }
        }
        return { ok: true, data: { hits, truncated: hits.length > 50 } }
      },
    },
    {
      name: 'record_observation',
      description: '记录从材料提取的事实（受控写入；人工确认值不被覆盖，生成 supersedes 链）',
      input: '{ subjectId, fieldKey, kind, value, documentVersionId }',
      async execute(input) {
        const subjectId = String(input.subjectId ?? '')
        if (!findSubject(context, subjectId)) return { ok: false, error: `主体不存在: ${subjectId}` }
        const kind = String(input.kind ?? 'text') as 'text' | 'number' | 'date'
        const rawValue = input.value
        const value = kind === 'number' ? ({ kind, value: Number(rawValue) } as FieldValue) : ({ kind, value: String(rawValue) } as FieldValue)
        const documentVersionId = String(input.documentVersionId ?? '')
        const updated = recordObservation(context.observations, {
          subjectId,
          fieldKey: String(input.fieldKey ?? ''),
          value,
          sourceRefs: [ref(documentVersionId)],
          extractedBy: 'ai',
        })
        context.observations.length = 0
        context.observations.push(...updated)
        return { ok: true, data: { recorded: true, observations: updated.length } }
      },
    },
    {
      name: 'link_evidence',
      description: '把证明材料绑定到主体事实（candidate；人工确认走命令信封）',
      input: '{ documentVersionId, subjectIds, supportsFact }',
      async execute(input) {
        const updated = buildEvidenceLinks(context.evidenceLinks, {
          documentVersionId: String(input.documentVersionId ?? ''),
          subjectIds: Array.isArray(input.subjectIds) ? (input.subjectIds as string[]) : [],
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
            sourceRefs: [],
            executedBy: rule.execution === 'semantic' ? 'semantic' : 'manual',
            executedAt: new Date().toISOString(),
          }
        }
        context.results.push(result)
        return { ok: true, data: { checkId: result.checkId, status: result.status } }
      },
    },
  ]
}

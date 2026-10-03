/**
 * 角色投影与独立副本往返（N6，docs/design/review-agent/07 §7.3/§8 + 06 §8；U12/R12）
 *
 * - 角色投影：student 只见 public 字段+公开反馈+本人补件清单；judge 只见本人任务；
 *   organizer 全量。**未知字段默认 internal**（不靠 UI 隐藏，服务层过滤）
 * - 往返包：student-reply / judge-rating-reply 两类；导出（投影+哈希）→ 独立副本填写 → 导回
 *   （哈希校验 → 去重：同 actionId 返回原回执；载荷漂移拒绝）
 * - 内部意见/其他评委评分/匿名映射不出包
 */

import type { CaseAggregateV2, FieldValue, ReviewCommandResult, ReviewCaseV2 } from '@profer/shared'
import { exportHandoffPackage, importHandoffPackage } from './report-service-v2'

export type AudienceRole = 'student' | 'reviewer' | 'teacher' | 'judge' | 'organizer'

/** 字段可见性解析：未知字段默认 internal（R12：服务层过滤，不靠 UI 隐藏） */
function isPublicField(visibility: unknown): boolean {
  return visibility === 'public'
}

function projectFieldValue(value: FieldValue): unknown {
  // 'unknown' 为 N1a FieldValueV2 扩展；V1 联合类型无此分支，运行时防御
  if ((value as { kind: string }).kind === 'unknown') return null
  return (value as { value: unknown }).value
}

export interface CaseProjection {
  caseId: string
  title: string
  stage: string
  fields: Record<string, unknown>
  subjects: Array<{ id: string; title: string; fields: Record<string, unknown> }>
  decisions: Array<{ id: string; result: string; reason: string; finality?: string; at: string }>
  supplements: Array<{ id: string; reason: string; requiredElements: string[]; status: string }>
  /** judge 专用：本人评分（其他评委不可见） */
  ownRating?: unknown
  /** reviewer/teacher 专用：内部意见 */
  internalNotes?: string[]
}

/** 按角色投影案卷聚合（07 §8：未知字段默认内部可见） */
export function projectForRole(
  aggregate: CaseAggregateV2,
  role: AudienceRole,
  fieldVisibility: Record<string, 'public' | 'internal'>,
  viewerId?: string,
): CaseProjection {
  const base: CaseProjection = {
    caseId: aggregate.caseV2.id,
    title: aggregate.caseV2.title,
    stage: aggregate.caseV2.stage,
    fields: {},
    subjects: aggregate.caseV2.subjects.map((subject) => ({ id: subject.id, title: subject.title, fields: {} })),
    decisions: aggregate.decisions.map((decision) => ({ id: decision.id, result: decision.result, reason: decision.reason, finality: decision.finality, at: decision.at })),
    supplements: aggregate.supplements.map((request) => ({ id: request.id, reason: request.reason, requiredElements: request.requiredElements, status: request.status })),
  }
  // 字段投影：public 才出（student/judge）；审核侧全量
  const showAllFields = role === 'reviewer' || role === 'teacher' || role === 'organizer'
  if (showAllFields) {
    base.fields = Object.fromEntries(Object.entries(aggregate.caseV2.caseFields).map(([key, value]) => [key, projectFieldValue(value)]))
    base.subjects = aggregate.caseV2.subjects.map((subject) => ({ id: subject.id, title: subject.title, fields: Object.fromEntries(Object.entries(subject.fields).map(([key, value]) => [key, projectFieldValue(value)])) }))
  } else {
    base.fields = Object.fromEntries(
      Object.entries(aggregate.caseV2.caseFields)
        .filter(([key]) => isPublicField(fieldVisibility[key]))
        .map(([key, value]) => [key, projectFieldValue(value)]),
    )
    base.subjects = aggregate.caseV2.subjects.map((subject) => ({
      id: subject.id,
      title: subject.title,
      fields: Object.fromEntries(Object.entries(subject.fields).filter(([key]) => isPublicField(fieldVisibility[key])).map(([key, value]) => [key, projectFieldValue(value)])),
    }))
  }
  // judge 只见本人评分
  if (role === 'judge' && viewerId) {
    const own = aggregate.dispositions.find((entry) => entry.actor === viewerId)
    base.ownRating = own ?? null
  }
  // 内部意见仅审核/组织者
  if (role === 'reviewer' || role === 'teacher' || role === 'organizer') {
    base.internalNotes = aggregate.dispositions.map((entry) => entry.reason)
  }
  return base
}

// ===== 独立副本往返包（07 §7.3） =====

export type RoundTripKind = 'student-reply' | 'judge-rating-reply'

export interface RoundTripPayload {
  kind: RoundTripKind
  caseId: string
  /** 独立副本标识（本地来源，不冒充校方） */
  actor: { actorId: string; actorSource: 'local' | 'mock' | 'school' }
  projection: CaseProjection
  /** 副本填写内容：补件材料说明 / 评分 */
  reply: Record<string, unknown>
  externalRevision?: number
}

export interface RoundTripReceipt {
  actionId: string
  caseId: string
  status: 'accepted' | 'duplicate' | 'rejected'
  message?: string
}

/** 导出往返包（投影过滤 + 哈希随包） */
export function exportRoundTripPackage(aggregate: CaseAggregateV2, kind: RoundTripKind, actor: { actorId: string; actorSource: 'local' | 'mock' | 'school' }, fieldVisibility: Record<string, 'public' | 'internal'>, reply: Record<string, unknown>) {
  const projection = projectForRole(aggregate, kind === 'judge-rating-reply' ? 'judge' : 'student', fieldVisibility, actor.actorId)
  return exportHandoffPackage<Omit<RoundTripPayload, never>>({ kind, caseId: aggregate.caseV2.id, actor, projection, reply })
}

const importedReceipts = new Map<string, RoundTripReceipt>()

/** 导入回复包（独立副本回传）：哈希校验 → 载荷一致去重 → 应用（R11/R12） */
export function importRoundTripPackage(pkg: ReturnType<typeof exportHandoffPackage>): RoundTripReceipt {
  const checked = importHandoffPackage<RoundTripPayload>(pkg as never)
  if (!checked.ok && checked.code === 'HASH_MISMATCH') {
    return { actionId: pkg.packageId, caseId: '', status: 'rejected', message: checked.message }
  }
  const payload = checked.ok ? checked.payload : (pkg.payload as RoundTripPayload)
  const receiptKey = `${payload.kind}:${payload.caseId}:${payload.actor.actorId}:${JSON.stringify(payload.reply)}`
  const existing = importedReceipts.get(receiptKey)
  if (existing) return { ...existing, status: 'duplicate', message: '重复包：已应用过相同回复（不重复计票）' }
  const receipt: RoundTripReceipt = { actionId: pkg.packageId, caseId: payload.caseId, status: 'accepted', message: '回复已应用' }
  importedReceipts.set(receiptKey, receipt)
  return receipt
}

/** 测试/重置辅助：清空进程内去重表（持久化由 outbox 承担） */
export function resetRoundTripDedup(): void {
  importedReceipts.clear()
}

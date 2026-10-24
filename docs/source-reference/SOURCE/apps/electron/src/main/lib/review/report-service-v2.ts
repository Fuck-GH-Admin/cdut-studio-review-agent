/**
 * M4 报告与离线往返（设计 02 §5.6 报告矩阵 + 03 §3 SyncReceipt；A15/C01）
 *
 * 原则：
 * - 面向学生的反馈只含 public 可见字段与公开意见；internalNotes 绝不出学生报告（A15）
 * - 评委矩阵/名次表面向组织者：含内部评语列
 * - 离线包：canonical JSON sha1 哈希随包携带；导入先验哈希（防篡改），外部版本不符 → conflict（C02）
 */

import { createHash } from 'node:crypto'
import type { BusinessDecision, JudgeAssignment, JudgeRating, ReviewCaseV2, RubricSpec, SupplementRequest, SyncReceipt } from '@profer/shared'
import type { CaseAggregate, RankingEntry } from './judging-service'

export type { CaseAggregate, RankingEntry }

// ===== 报告 =====

export interface CaseFeedback {
  caseId: string
  title: string
  decision: { result: BusinessDecision['result']; reason: string; at: string } | null
  supplements: Array<{ reason: string; requiredElements: string[]; status: SupplementRequest['status'] }>
  items: Array<{ subjectId: string; title: string; publicFields: Record<string, unknown> }>
}

/** 案卷反馈（学生视角）：仅 public 字段 + 最终决定 + 补件清单；内部意见不出（A15） */
export function buildCaseFeedback(
  caseV2: ReviewCaseV2,
  decisions: BusinessDecision[],
  supplements: SupplementRequest[],
  templateFieldVisibility: Record<string, 'public' | 'internal'>,
): CaseFeedback {
  const last = [...decisions].sort((a, b) => a.at.localeCompare(b.at)).at(-1) ?? null
  return {
    caseId: caseV2.id,
    title: caseV2.title,
    decision: last ? { result: last.result, reason: last.reason, at: last.at } : null,
    supplements: supplements.map((request) => ({ reason: request.reason, requiredElements: request.requiredElements, status: request.status })),
    items: caseV2.subjects.map((subject) => ({
      subjectId: subject.id,
      title: subject.title,
      publicFields: Object.fromEntries(
        Object.entries(subject.fields)
          .filter(([key]) => (templateFieldVisibility[key] ?? 'public') === 'public')
          .map(([key, value]) => [key, value.kind === 'number' ? (value as { value: unknown }).value : (value as { value: unknown }).value]),
      ),
    })),
  }
}

export interface RatingMatrixRow {
  caseId: string
  total: number | null
  rank: number | null
  dimensions: Array<{ dimensionId: string; average: number | null; voters: number }>
  /** 组织者可见：内部评语 */
  internalNotes: Array<{ reviewerId: string; note: string }>
  publicFeedback: Array<{ reviewerId: string; feedback: string }>
}

/** 评委矩阵（组织者视角）：含内部评语；total/rank 来自汇总与排名（A14/A15） */
export function buildRatingMatrix(
  rubric: RubricSpec,
  assignments: JudgeAssignment[],
  ratings: JudgeRating[],
  aggregates: CaseAggregate[],
  ranking: RankingEntry[],
): RatingMatrixRow[] {
  const rankByCase = new Map(ranking.map((entry) => [entry.caseId, entry.rank]))
  return aggregates.map((aggregate) => {
    const caseRatings = ratings.filter((rating) => rating.caseId === aggregate.caseId && assignments.some((assignment) => assignment.id === rating.assignmentId && !assignment.recused))
    return {
      caseId: aggregate.caseId,
      total: aggregate.total,
      rank: rankByCase.get(aggregate.caseId) ?? null,
      dimensions: aggregate.dimensions.map((dimension) => ({ dimensionId: dimension.dimensionId, average: dimension.average, voters: dimension.voters })),
      internalNotes: caseRatings.filter((rating) => rating.internalNotes?.trim()).map((rating) => ({ reviewerId: rating.reviewerId, note: rating.internalNotes! })),
      publicFeedback: caseRatings.filter((rating) => rating.publicFeedback.trim()).map((rating) => ({ reviewerId: rating.reviewerId, feedback: rating.publicFeedback })),
    }
  })
}

// ===== 离线往返包（C01/C02） =====

export interface HandoffPackage<TPayload> {
  packageId: string
  payload: TPayload
  /** canonical JSON sha1（导出时计算，导入时校验） */
  contentHash: string
  exportedAt: string
}

export function canonicalHash(value: unknown): string {
  return createHash('sha1').update(JSON.stringify(value), 'utf-8').digest('hex')
}

export function exportHandoffPackage<TPayload>(payload: TPayload): HandoffPackage<TPayload> {
  return {
    packageId: `pkg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    payload,
    contentHash: canonicalHash(payload),
    exportedAt: new Date().toISOString(),
  }
}

export type ImportOutcome<TPayload> =
  | { ok: true; payload: TPayload; receipt: SyncReceipt }
  | { ok: false; code: 'HASH_MISMATCH' | 'CONFLICT'; message: string }

/** 导入离线包：先验哈希（防篡改）；期望外部版本不符 → conflict（C02） */
export function importHandoffPackage<TPayload extends { externalRevision?: number }>(
  pkg: HandoffPackage<TPayload>,
  expectedExternalRevision?: number,
): ImportOutcome<TPayload> {
  if (canonicalHash(pkg.payload) !== pkg.contentHash) {
    return { ok: false, code: 'HASH_MISMATCH', message: '离线包内容与哈希不符：文件可能被修改或损坏（C01）' }
  }
  if (expectedExternalRevision !== undefined && pkg.payload.externalRevision !== undefined && pkg.payload.externalRevision !== expectedExternalRevision) {
    return {
      ok: false,
      code: 'CONFLICT',
      message: `外部系统版本已推进（期望 ${expectedExternalRevision}，包内 ${pkg.payload.externalRevision}），需重新导出（C02）`,
    }
  }
  const receipt: SyncReceipt = {
    id: `rcp-${Date.now()}`,
    actionId: pkg.packageId,
    externalSystem: 'offline-package',
    caseId: (pkg.payload as { caseId?: string }).caseId ?? '',
    expectedExternalRevision: expectedExternalRevision,
    payloadHash: pkg.contentHash,
    status: 'accepted',
    externalReceipt: { receivedAt: new Date().toISOString() },
  }
  return { ok: true, payload: pkg.payload, receipt }
}

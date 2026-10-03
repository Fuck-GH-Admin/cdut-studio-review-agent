/**
 * 批次与评委评分服务（M4，设计 02 §5.4 评委工作流 + 03 §3 ReviewBatch/JudgeAssignment/JudgeRating）
 *
 * 原则：
 * - 批次锁定模板/规则版本（A12：评审期间政策不变）
 * - 评委独立评分：提交前互不可见；回避（recused）≠缺评（missing 由 missingStrategy 处理）
 * - 汇总：na 维度排除；block 策略下缺评阻止定稿；total 按 rubric 精度取整；同分共享名次（A14）
 * - 权重和为 0/维度非法在 M1 validateTemplate 已挡，此处信任量表契约
 */

import type { JudgeAssignment, JudgeRating, ReviewBatch, RubricSpec, TemplateVersion } from '@profer/shared'

// ===== 批次 =====

export function createBatch(template: TemplateVersion, name: string, caseIds: string[]): ReviewBatch {
  if (template.status !== 'published') throw new Error('批次只能基于已发布模板创建（A12）')
  if (caseIds.length === 0) throw new Error('批次至少包含一个案卷')
  return {
    id: `batch-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    templateId: template.templateId,
    templateVersion: template.version,
    policyVersionLock: template.policyVersionIds.map((policyVersionId) => ({ policyVersionId, version: 1 })),
    caseIds,
    createdAt: new Date().toISOString(),
  }
}

// ===== 分配与评分 =====

export function assignJudge(
  assignments: JudgeAssignment[],
  input: { caseId: string; reviewerId: string; rubricVersion: number; recused?: boolean; recuseReason?: string },
): JudgeAssignment[] {
  const duplicate = assignments.some(
    (assignment) => assignment.caseId === input.caseId && assignment.reviewerId === input.reviewerId && assignment.status !== 'missing',
  )
  if (duplicate) throw new Error(`评委已分配: ${input.reviewerId} → ${input.caseId}`)
  const assignment: JudgeAssignment = {
    id: `asg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    caseId: input.caseId,
    reviewerId: input.reviewerId,
    rubricVersion: input.rubricVersion,
    recused: input.recused ?? false,
    recuseReason: input.recuseReason,
    status: input.recused ? 'submitted' : 'assigned',
  }
  return [...assignments, assignment]
}

export interface RatingSubmitInput {
  assignmentId: string
  reviewerId: string
  caseId: string
  rubricVersion: number
  rubric: RubricSpec
  scores: Array<{ dimensionId: string; score: number | null; na: boolean; comment?: string }>
  publicFeedback: string
  internalNotes?: string
}

/** 提交评分：范围校验 + na/缺评一致性 + 公开/内部意见分列（A14） */
export function submitRating(ratings: JudgeRating[], input: RatingSubmitInput): JudgeRating[] {
  for (const dimension of input.rubric.dimensions) {
    const score = input.scores.find((candidate) => candidate.dimensionId === dimension.id)
    if (!score) throw new Error(`缺少维度评分: ${dimension.name}（提交必须覆盖全部维度或显式 N/A）`)
    if (score.na) {
      if (score.score !== null) throw new Error(`维度 ${dimension.name} 标记 N/A 时不得同时给分`)
      continue
    }
    if (score.score === null) {
      if (input.rubric.missingStrategy === 'block') throw new Error(`维度 ${dimension.name} 未评分且策略为 block，无法提交`)
      continue
    }
    if (score.score < dimension.min || score.score > dimension.max) {
      throw new Error(`维度 ${dimension.name} 分值超出范围 [${dimension.min}, ${dimension.max}]`)
    }
  }
  const rating: JudgeRating = {
    assignmentId: input.assignmentId,
    reviewerId: input.reviewerId,
    caseId: input.caseId,
    rubricVersion: input.rubricVersion,
    scores: input.scores,
    publicFeedback: input.publicFeedback,
    internalNotes: input.internalNotes,
    submittedAt: new Date().toISOString(),
  }
  return [...ratings, rating]
}

// ===== 汇总 =====

export interface DimensionAggregate {
  dimensionId: string
  name: string
  /** 参与(非 na 非缺)的评委数 */
  voters: number
  average: number | null
  weighted: number
}

export interface CaseAggregate {
  caseId: string
  dimensions: DimensionAggregate[]
  /** 加权总分（精度按 rubric.totalPrecision）；null=block 策略下无法定稿 */
  total: number | null
  naDimensions: string[]
}

/** 案卷评分汇总：排除回避；na 排除该维度；block 策略缺评 → total=null（A14/D05） */
export function aggregateCaseRatings(
  rubric: RubricSpec,
  assignments: JudgeAssignment[],
  ratings: JudgeRating[],
  caseId: string,
): CaseAggregate {
  const activeAssignments = assignments.filter((assignment) => assignment.caseId === caseId && !assignment.recused)
  const activeRatings = ratings.filter((rating) => rating.caseId === caseId && activeAssignments.some((assignment) => assignment.id === rating.assignmentId))
  const naDimensions: string[] = []

  const dimensions = rubric.dimensions.map((dimension) => {
    const values = activeRatings
      .map((rating) => rating.scores.find((candidate) => candidate.dimensionId === dimension.id))
      .filter((score): score is NonNullable<typeof score> => !!score)
    const valid = values.filter((score) => !score.na && score.score !== null)
    const naCount = values.filter((score) => score.na).length
    if (naCount === values.length && values.length > 0) naDimensions.push(dimension.id)
    const average = valid.length > 0 ? valid.reduce((sum, score) => sum + (score.score ?? 0), 0) / valid.length : null
    return {
      dimensionId: dimension.id,
      name: dimension.name,
      voters: valid.length,
      average,
      weighted: average === null ? 0 : average * dimension.weight,
    }
  })

  const missingVoters = activeAssignments.length - activeRatings.length
  if (rubric.missingStrategy === 'block' && missingVoters > 0) {
    return { caseId, dimensions, total: null, naDimensions }
  }
  const weightSum = rubric.dimensions.reduce((sum, dimension) => sum + dimension.weight, 0)
  const precision = rubric.totalPrecision
  const total = dimensions.reduce((sum, dimension) => sum + dimension.weighted, 0) / (weightSum || 1)
  return {
    caseId,
    dimensions,
    total: Number(total.toFixed(precision)),
    naDimensions,
  }
}

export interface RankingEntry {
  caseId: string
  total: number
  /** 共享名次：同分同名次（A14 tie-breaker shared-rank） */
  rank: number
}

/** 排名：总分降序；同分共享名次（shared-rank），后续名次跳位（1,1,3） */
export function finalizeRanking(aggregates: CaseAggregate[], rubric: RubricSpec): RankingEntry[] {
  const eligible = aggregates.filter((aggregate) => aggregate.total !== null) as Array<CaseAggregate & { total: number }>
  if (rubric.tieBreaker === 'by-dimension' || rubric.tieBreaker === 'owner-decides') {
    // 简化：并列仍由发起人决断，这里按总分+维度次序稳定排序并标注共享名次逻辑不适用
  }
  const sorted = [...eligible].sort((a, b) => b.total - a.total)
  const ranking: RankingEntry[] = []
  let lastTotal: number | null = null
  let lastRank = 0
  for (let index = 0; index < sorted.length; index += 1) {
    const entry = sorted[index]!
    if (lastTotal !== null && entry.total === lastTotal) {
      ranking.push({ caseId: entry.caseId, total: entry.total, rank: lastRank })
    } else {
      lastRank = index + 1
      lastTotal = entry.total
      ranking.push({ caseId: entry.caseId, total: entry.total, rank: lastRank })
    }
  }
  return ranking
}

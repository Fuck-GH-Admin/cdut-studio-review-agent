/**
 * 业务闭环状态机（M4，设计 02 §7 业务工作流 + 03 §3 BusinessDecision/SupplementRequest/Appeal）
 *
 * 原则：
 * - BusinessDecision 追加式：更正=追加新决定，不覆盖旧记录（A09 可回溯）
 * - AI 建议不是决定：决定必须由 actor 做出并携带 basedOnRunId/revision
 * - 补件：回复≠满足（responded 后仍需人工判定 satisfied/insufficient）；取消需理由
 * - 申诉：必须关联既有决定；成立/不成立另起复核任务，不改写原决定内容
 * - 全部变更走命令信封（expectedRevision 冲突返回 VERSION_CONFLICT）
 */

import type {
  Actor,
  Appeal,
  BusinessDecision,
  ReviewAppCommandError,
  ReviewCaseV2,
  SupplementRequest,
} from '@profer/shared'
import { assertExpectedRevision } from '@profer/shared'

/** 业务工作流状态容器（纯函数进出，落盘由调用方负责） */
export interface WorkflowState {
  caseV2: ReviewCaseV2
  decisions: BusinessDecision[]
  supplements: SupplementRequest[]
  appeals: Appeal[]
}

export type WorkflowResult<TEntity> = { ok: true; state: WorkflowState; entity: TEntity } | ({ ok: false } & ReviewAppCommandError)

const now = (): string => new Date().toISOString()
const nextRevision = (state: WorkflowState): ReviewCaseV2 => ({ ...state.caseV2, revision: state.caseV2.revision + 1, updatedAt: now() })

// ===== 决定 =====

export interface DecisionInput {
  scope: BusinessDecision['scope']
  stageId: string
  result: BusinessDecision['result']
  finalScores?: BusinessDecision['finalScores']
  reason: string
  basedOnRunId: string
}

/** 记录业务决定（追加式；expectedRevision 冲突拒绝） */
export function recordDecision(state: WorkflowState, command: { requestId: string; actor: Actor; expectedRevision: number }, input: DecisionInput): WorkflowResult<BusinessDecision> {
  const conflict = assertExpectedRevision({ expectedRevision: command.expectedRevision }, state.caseV2.revision)
  if (conflict) return { ...conflict, ok: false as const }
  if (!input.reason.trim()) return { ok: false, code: 'VALIDATION_FAILED', message: '决定必须附理由（AI 建议不是决定）' }
  if (!input.basedOnRunId) return { ok: false, code: 'VALIDATION_FAILED', message: '决定必须基于一次运行（basedOnRunId）' }
  const caseV2 = nextRevision(state)
  const decision: BusinessDecision = {
    id: `dec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    actor: command.actor,
    scope: input.scope,
    stageId: input.stageId,
    result: input.result,
    finalScores: input.finalScores,
    reason: input.reason.trim(),
    basedOnRunId: input.basedOnRunId,
    basedOnRevision: state.caseV2.revision,
    at: now(),
  }
  // 阶段推进：通过→decided；退回/驳回→awaiting-supplement（补件流程接管）
  if (input.result === 'pass' || input.result === 'partial-pass') caseV2.stage = 'decided'
  if (input.result === 'return' || input.result === 'reject') caseV2.stage = 'awaiting-supplement'
  if (input.result === 'withdraw') caseV2.stage = 'archived'
  return { ok: true, state: { ...state, caseV2, decisions: [...state.decisions, decision] }, entity: decision }
}

// ===== 补件 =====

export function openSupplementRequest(
  state: WorkflowState,
  command: { requestId: string; actor: Actor; expectedRevision: number },
  input: { originFindingKeys: string[]; materialSlotId?: string; requiredElements: string[]; reason: string; responsibleRole: SupplementRequest['responsibleRole']; deadline?: string },
): WorkflowResult<SupplementRequest> {
  const conflict = assertExpectedRevision({ expectedRevision: command.expectedRevision }, state.caseV2.revision)
  if (conflict) return { ...conflict, ok: false as const }
  if (!input.reason.trim() || input.requiredElements.length === 0) {
    return { ok: false, code: 'VALIDATION_FAILED', message: '补件必须说明原因与所需要素（A09）' }
  }
  const caseV2 = nextRevision(state)
  caseV2.stage = 'awaiting-supplement'
  const request: SupplementRequest = {
    id: `sup-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    caseId: state.caseV2.id,
    originFindingKeys: input.originFindingKeys,
    materialSlotId: input.materialSlotId,
    requiredElements: input.requiredElements,
    reason: input.reason.trim(),
    responsibleRole: input.responsibleRole,
    deadline: input.deadline,
    status: 'open',
    responses: [],
    createdAt: now(),
  }
  return { ok: true, state: { ...state, caseV2, supplements: [...state.supplements, request] }, entity: request }
}

/** 回复补件（提交材料/说明）：只到 responded，满足与否由审核侧判定（回复≠满足） */
export function respondSupplement(state: WorkflowState, supplementId: string, input: { documentVersionIds: string[]; note: string; actor: string }): WorkflowResult<SupplementRequest> {
  const target = state.supplements.find((request) => request.id === supplementId)
  if (!target) return { ok: false, code: 'NOT_FOUND', message: `补件请求不存在: ${supplementId}` }
  if (target.status !== 'open' && target.status !== 'responded') {
    return { ok: false, code: 'VALIDATION_FAILED', message: `补件请求已关闭（${target.status}），不能再回复` }
  }
  if (input.documentVersionIds.length === 0 && !input.note.trim()) {
    return { ok: false, code: 'VALIDATION_FAILED', message: '回复必须包含材料或说明' }
  }
  const supplements = state.supplements.map((request) =>
    request.id === supplementId
      ? { ...request, status: 'responded' as const, responses: [...request.responses, { id: `res-${Date.now()}`, documentVersionIds: input.documentVersionIds, note: input.note, at: now(), actor: input.actor }] }
      : request,
  )
  return { ok: true, state: { ...state, supplements }, entity: supplements.find((request) => request.id === supplementId)! }
}

/** 判定补件结果：满足 → 回到 reviewing；不足 → 保持 awaiting-supplement；取消需理由 */
export function resolveSupplement(state: WorkflowState, supplementId: string, outcome: 'satisfied' | 'insufficient' | 'cancelled', reason: string): WorkflowResult<SupplementRequest> {
  const target = state.supplements.find((request) => request.id === supplementId)
  if (!target) return { ok: false, code: 'NOT_FOUND', message: `补件请求不存在: ${supplementId}` }
  if (outcome === 'cancelled' && !reason.trim()) {
    return { ok: false, code: 'VALIDATION_FAILED', message: '取消补件必须说明理由' }
  }
  const supplements = state.supplements.map((request) => (request.id === supplementId ? { ...request, status: outcome } : request))
  let caseV2 = state.caseV2
  if (outcome === 'satisfied') {
    caseV2 = { ...caseV2, stage: 'reviewing', revision: caseV2.revision + 1, updatedAt: now() }
  }
  return { ok: true, state: { ...state, caseV2, supplements }, entity: supplements.find((request) => request.id === supplementId)! }
}

// ===== 申诉 =====

export function submitAppeal(state: WorkflowState, command: { requestId: string; actor: Actor; expectedRevision: number }, input: { againstDecisionId: string; statement: string; newEvidenceDocumentVersionIds: string[] }): WorkflowResult<Appeal> {
  const conflict = assertExpectedRevision({ expectedRevision: command.expectedRevision }, state.caseV2.revision)
  if (conflict) return { ...conflict, ok: false as const }
  if (!state.decisions.some((decision) => decision.id === input.againstDecisionId)) {
    return { ok: false, code: 'VALIDATION_FAILED', message: '申诉必须关联既有决定（A10）' }
  }
  if (!input.statement.trim()) return { ok: false, code: 'VALIDATION_FAILED', message: '申诉必须陈述理由' }
  const caseV2 = nextRevision(state)
  const appeal: Appeal = {
    id: `app-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    caseId: state.caseV2.id,
    againstDecisionId: input.againstDecisionId,
    appellant: command.actor,
    statement: input.statement.trim(),
    newEvidenceDocumentVersionIds: input.newEvidenceDocumentVersionIds,
    status: 'submitted',
    createdAt: now(),
  }
  return { ok: true, state: { ...state, caseV2, appeals: [...state.appeals, appeal] }, entity: appeal }
}

/** 申诉复核结果：成立 → 案卷回到复审；不成立 → 维持；均不改写原决定（追加式） */
export function resolveAppeal(state: WorkflowState, appealId: string, outcome: 'upheld' | 'overturned' | 'withdrawn', reviewDecisionId?: string): WorkflowResult<Appeal> {
  const target = state.appeals.find((appeal) => appeal.id === appealId)
  if (!target) return { ok: false, code: 'NOT_FOUND', message: `申诉不存在: ${appealId}` }
  if (target.status !== 'submitted' && target.status !== 'in-review') {
    return { ok: false, code: 'VALIDATION_FAILED', message: `申诉已关闭（${target.status}）` }
  }
  const appeals = state.appeals.map((appeal) => (appeal.id === appealId ? { ...appeal, status: outcome, reviewDecisionId } : appeal))
  let caseV2 = state.caseV2
  if (outcome === 'upheld') {
    caseV2 = { ...caseV2, stage: 'awaiting-review', revision: caseV2.revision + 1, updatedAt: now() }
  }
  return { ok: true, state: { ...state, caseV2, appeals }, entity: appeals.find((appeal) => appeal.id === appealId)! }
}

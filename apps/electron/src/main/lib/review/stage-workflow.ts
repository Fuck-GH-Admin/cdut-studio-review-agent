/**
 * 阶段任务推进与业务闭环（N3，docs/design/review-agent/07 §7.1 + 06 §5.2；R07）
 *
 * 修正误判 6（旧 business-workflow 阶段映射过简）：
 * - 初审通过 ≠ decided：推进下一阶段任务；只有最终阶段才形成最终决定
 * - 最终驳回 → decided（不自动待补件）；退回补件才开补件请求；退回前级 → 新任务轮次（原意见保留）
 * - 撤回 → archived
 * - 补件：多个未结束请求全部结束才恢复阶段；"已回复"≠"已满足"
 * - 申诉：resolution 明确 maintain-original/amend-original/withdrawn；更正=追加关联决定（不改写原判）
 * - 最终决定投影：按 finality/范围计算，不取时间最后一条
 *
 * 全部变更走 case-store-v2 命令事务（幂等回执、revision 事务统一 +1）。
 */

import type { Appeal, BusinessDecision, CaseAggregateV2, ReviewCommandResult, SupplementRequest, TemplateVersion, WorkflowTask } from '@profer/shared'
import { CommandValidationError, submitCommand } from './case-store-v2'
import type { Actor } from '@profer/shared'

// ===== 任务创建（提交案卷时按模板首阶段建任务） =====

export async function ensureInitialTask(caseId: string, template: TemplateVersion, actor: Actor): Promise<ReviewCommandResult<WorkflowTask>> {
  const firstStage = template.stages[0]
  if (!firstStage) throw new CommandValidationError('VALIDATION_FAILED', '模板没有阶段')
  return submitCommand<Record<string, never>, WorkflowTask>(caseId, { requestId: `task-init-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, actor, expectedRevision: 0, type: 'EnsureInitialTask', payload: {} }, (aggregate) => {
    if (aggregate.tasks.length > 0) throw new CommandValidationError('INVALID_TRANSITION', '任务已初始化')
    return {
      summary: `创建初审任务（${firstStage.name}）`,
      mutate: (draft) => {
        const created: WorkflowTask = { id: `task-${Date.now()}`, caseId: draft.caseV2.id, stageId: firstStage.id, round: 1, assigneeRole: firstStage.executorRole, status: 'open', inputRevision: draft.caseV2.revision, createdAt: new Date().toISOString() }
        draft.tasks = [...draft.tasks, created]
        return created
      },
    }
  })
}

// ===== 阶段决定（06 §5.2 动作表） =====

export type StageDecisionAction = 'stage-pass' | 'item-pass' | 'item-partial-pass' | 'return-for-supplement' | 'return-to-previous-stage' | 'final-reject' | 'withdraw'

export interface StageDecisionPayload {
  action: StageDecisionAction
  taskId: string
  reason: string
  /** 终审分值（仅终审阶段） */
  finalScores?: BusinessDecision['finalScores']
  /** 退回补件所需要素 */
  supplementRequiredElements?: string[]
  supplementReason?: string
}

const isFinalStage = (aggregate: CaseAggregateV2, stageId: string, template: TemplateVersion): boolean => {
  const stage = template.stages.find((candidate) => candidate.id === stageId)
  return stage?.nextStageId === undefined
}

/** 记录阶段决定（命令事务；动作→状态映射按 06 §5.2 表） */
export function recordStageDecision(
  caseId: string,
  command: { requestId: string; actor: Actor; expectedRevision: number; payload: StageDecisionPayload },
  template: TemplateVersion,
): Promise<ReviewCommandResult<{ decision: BusinessDecision; task?: WorkflowTask; supplement?: SupplementRequest }>> {
  return submitCommand<StageDecisionPayload, { decision: BusinessDecision; task?: WorkflowTask; supplement?: SupplementRequest }>(caseId, { ...command, type: 'RecordStageDecision' }, (aggregate, payload) => {
    const task = aggregate.tasks.find((candidate) => candidate.id === payload.taskId && candidate.status === 'open')
    if (!task) throw new CommandValidationError('INVALID_TRANSITION', '当前阶段没有开放任务（或已处理）')
    if (!payload.reason.trim()) throw new CommandValidationError('VALIDATION_FAILED', '决定必须附理由')
    if (!aggregate.decisions.every((decision) => decision.taskId !== task.id)) throw new CommandValidationError('INVALID_TRANSITION', '该任务已有决定')

    const now = new Date().toISOString()
    const finality: BusinessDecision['finality'] = payload.action === 'final-reject' || (payload.action === 'stage-pass' && isFinalStage(aggregate, task.stageId, template)) ? 'final' : 'stage'
    return {
      summary: `阶段决定：${payload.action}（${task.stageId}）`,
      mutate: (draft): { decision: BusinessDecision; task?: WorkflowTask; supplement?: SupplementRequest } => {
        let decision: BusinessDecision | undefined
        let nextTask: WorkflowTask | undefined
        let supplement: SupplementRequest | undefined

        // 关闭当前任务
        draft.tasks = draft.tasks.map((candidate) => (candidate.id === task.id ? { ...candidate, status: 'completed', completedAt: now } : candidate))
        const result: BusinessDecision['result'] = payload.action === 'final-reject' ? 'reject' : payload.action === 'withdraw' ? 'withdraw' : payload.action === 'return-for-supplement' || payload.action === 'return-to-previous-stage' ? 'return' : payload.action === 'item-partial-pass' ? 'partial-pass' : 'pass'
        decision = {
          id: `dec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          actor: command.actor,
          scope: { kind: 'case', ids: [] },
          stageId: task.stageId,
          result,
          finalScores: payload.finalScores,
          reason: payload.reason.trim(),
          basedOnRunId: `run@rev${aggregate.caseV2.revision}`,
          basedOnRevision: aggregate.caseV2.revision,
          at: now,
          finality,
          taskId: task.id,
          round: task.round,
        }
        draft.decisions = [...draft.decisions, decision!]

        switch (payload.action) {
          case 'stage-pass': {
            const stage = template.stages.find((candidate) => candidate.id === task.stageId)
            if (stage?.nextStageId) {
              // 初审通过 → 下一阶段任务（不是 decided）
              const nextStage = template.stages.find((candidate) => candidate.id === stage.nextStageId)
              nextTask = { id: `task-${Date.now() + 1}`, caseId: draft.caseV2.id, stageId: stage.nextStageId, round: task.round, assigneeRole: nextStage?.executorRole ?? 'teacher', status: 'open', prerequisiteTaskId: task.id, inputRevision: draft.caseV2.revision, createdAt: now }
              draft.tasks = [...draft.tasks, nextTask!]
              draft.caseV2.stage = 'reviewing'
            } else {
              draft.caseV2.stage = 'decided'
            }
            break
          }
          case 'item-pass':
          case 'item-partial-pass':
            // 事项级决定：案卷是否结束由模板要求计算；保持当前阶段开放（其他事项继续）
            draft.tasks = draft.tasks.map((candidate) => (candidate.id === task.id ? { ...candidate, status: 'open', completedAt: undefined } : candidate))
            break
          case 'return-for-supplement': {
            if (!payload.supplementRequiredElements?.length || !payload.supplementReason?.trim()) throw new CommandValidationError('VALIDATION_FAILED', '退回补件必须指定要素与原因')
            supplement = { id: `sup-${Date.now()}`, caseId: draft.caseV2.id, originFindingKeys: [], materialSlotId: undefined, requiredElements: payload.supplementRequiredElements, reason: payload.supplementReason, responsibleRole: 'student', status: 'open', responses: [], createdAt: now }
            draft.supplements = [...draft.supplements, supplement!]
            draft.caseV2.stage = 'awaiting-supplement'
            // 补件回流：创建同阶段新轮次任务（等待补件核验后开放处理）
            break
          }
          case 'return-to-previous-stage': {
            const stage = template.stages.find((candidate) => candidate.id === task.stageId)
            const returnTo = stage?.returnToStageId
            if (!returnTo) throw new CommandValidationError('INVALID_TRANSITION', '该阶段没有退回目标')
            const previousStage = template.stages.find((candidate) => candidate.id === returnTo)
            nextTask = { id: `task-${Date.now() + 2}`, caseId: draft.caseV2.id, stageId: returnTo, round: task.round + 1, assigneeRole: previousStage?.executorRole ?? 'reviewer', status: 'open', prerequisiteTaskId: task.id, inputRevision: draft.caseV2.revision, createdAt: now }
            draft.tasks = [...draft.tasks, nextTask!]
            draft.caseV2.stage = 'reviewing'
            break
          }
          case 'final-reject':
            // 最终驳回 → decided（不自动待补件，修正误判 6）
            draft.caseV2.stage = 'decided'
            break
          case 'withdraw':
            draft.caseV2.stage = 'archived'
            break
        }
        if (!decision) throw new CommandValidationError('VALIDATION_FAILED', '决定未生成')
        return { decision, task: nextTask, supplement }
      },
    }
  })
}

// ===== 补件核验（多请求门控） =====

/** 补件判定：satisfied → 全部未结束请求结束才恢复 reviewing（06 §5.3：一项完成不解除其他等待） */
export function resolveSupplementV2(caseId: string, command: { requestId: string; actor: Actor; expectedRevision: number; payload: { supplementId: string; outcome: 'satisfied' | 'insufficient' | 'cancelled'; reason: string } }): Promise<ReviewCommandResult<SupplementRequest>> {
  return submitCommand<{ supplementId: string; outcome: 'satisfied' | 'insufficient' | 'cancelled'; reason: string }, SupplementRequest>(caseId, { ...command, type: 'ResolveSupplement' }, (aggregate, payload) => {
    const target = aggregate.supplements.find((request) => request.id === payload.supplementId)
    if (!target) throw new CommandValidationError('NOT_FOUND', `补件请求不存在: ${payload.supplementId}`)
    if (target.status !== 'open' && target.status !== 'responded') throw new CommandValidationError('INVALID_TRANSITION', `补件已关闭（${target.status}）`)
    if (payload.outcome === 'cancelled' && !payload.reason.trim()) throw new CommandValidationError('VALIDATION_FAILED', '取消补件必须说明理由')
    return {
      summary: `补件判定：${payload.outcome}`,
      mutate: (draft) => {
        draft.supplements = draft.supplements.map((request) => (request.id === payload.supplementId ? { ...request, status: payload.outcome } : request))
        // 多请求门控：所有未结束请求结束才恢复
        const stillOpen = draft.supplements.some((request) => request.status === 'open' || request.status === 'responded')
        if (payload.outcome === 'satisfied' && !stillOpen) draft.caseV2.stage = 'reviewing'
      },
      entity: payload.outcome === 'satisfied' ? { ...target, status: 'satisfied' } : { ...target, status: payload.outcome },
    }
  })
}

// ===== 申诉 resolution（06 §5.4） =====

export function resolveAppealV2(caseId: string, command: { requestId: string; actor: Actor; expectedRevision: number; payload: { appealId: string; resolution: Appeal['resolution'] & ('maintain-original' | 'amend-original' | 'withdrawn'); reason: string; amendedResult?: BusinessDecision['result'] } }): Promise<ReviewCommandResult<Appeal>> {
  return submitCommand<{ appealId: string; resolution: string; reason: string; amendedResult?: BusinessDecision['result'] }, Appeal>(caseId, { ...command, type: 'ResolveAppeal' } as never, (aggregate, payload) => {
    const appeal = aggregate.appeals.find((candidate) => candidate.id === payload.appealId)
    if (!appeal) throw new CommandValidationError('NOT_FOUND', `申诉不存在: ${payload.appealId}`)
    if (appeal.status === 'upheld' || appeal.status === 'overturned' || appeal.status === 'withdrawn') throw new CommandValidationError('INVALID_TRANSITION', '申诉已关闭')
    if (!payload.reason.trim()) throw new CommandValidationError('VALIDATION_FAILED', '复核必须附结论理由')
    let amended: BusinessDecision | undefined
    return {
      summary: `申诉复核：${payload.resolution}`,
      mutate: (draft) => {
        const appealIndex = draft.appeals.findIndex((candidate) => candidate.id === payload.appealId)
        const original = draft.appeals[appealIndex]!
        draft.appeals[appealIndex] = { ...original, resolution: payload.resolution as Appeal['resolution'], status: payload.resolution === 'withdrawn' ? 'withdrawn' : 'in-review', reviewDecisionId: payload.resolution === 'amend-original' ? `dec-${Date.now()}` : original.reviewDecisionId }
        if (payload.resolution === 'amend-original') {
          // 更正 = 追加关联决定（不改写原判，07 §7.1）
          const originalDecision = draft.decisions.find((decision) => decision.id === original.againstDecisionId)
          if (!originalDecision) throw new CommandValidationError('NOT_FOUND', '原决定不存在')
          amended = { ...originalDecision, id: draft.appeals[appealIndex]!.reviewDecisionId!, amendsDecisionId: originalDecision.id, result: payload.amendedResult ?? 'pass', reason: `申诉更正：${payload.reason}`, at: new Date().toISOString(), finality: originalDecision.finality }
          draft.decisions = [...draft.decisions, amended!]
        }
        if (payload.resolution === 'withdrawn') {
          draft.appeals[appealIndex] = { ...draft.appeals[appealIndex]!, status: 'withdrawn' }
        }
      },
      entity: aggregate.appeals.find((candidate) => candidate.id === payload.appealId),
    }
  })
}

// ===== 最终决定投影（07 §7.1：不取时间最后一条） =====

/**
 * 最终决定：优先 finality='final' 的最新一条；否则最新 stage 决定（标注未终审）。
 * 被更正（amendsDecisionId 指向）的决定不再是有效结论。
 */
export function resolveFinalDecisionProjection(decisions: BusinessDecision[]): { decision: BusinessDecision | null; isFinal: boolean; supersededIds: string[] } {
  const supersededIds = decisions.filter((decision) => decision.amendsDecisionId).map((decision) => decision.amendsDecisionId!)
  const effective = decisions.filter((decision) => !supersededIds.includes(decision.id))
  const final = [...effective].filter((decision) => decision.finality === 'final').sort((a, b) => a.at.localeCompare(b.at)).at(-1)
  if (final) return { decision: final, isFinal: true, supersededIds }
  const latestStage = [...effective].sort((a, b) => a.at.localeCompare(b.at)).at(-1) ?? null
  return { decision: latestStage, isFinal: false, supersededIds }
}

/**
 * 单案工作台业务动作：待办处置、补件和人工最终决定均走 V2 聚合事务。
 */
import type { Actor, BusinessDecision, CaseAggregateV2, ReviewCommandResult, SupplementRequest } from '@profer/shared'
import { CommandValidationError, submitCommand } from './case-store-v2'
import { getRunV2 } from './run-store-v2'
import { computeRunInputHash } from './run-service-v2'

type WorkspaceDisposition = 'confirmed-issue' | 'false-positive' | 'supplement-requested' | 'waived' | 'escalated'
type WorkspaceDecision = BusinessDecision['result']

function assertCurrentRun(aggregate: CaseAggregateV2, runId: string, inputHash: string) {
  const run = getRunV2(aggregate.caseV2.id, runId)
  if (!run || run.inputManifest.hash !== inputHash) throw new CommandValidationError('STALE_INPUT', '审核运行已过期，请重新运行后再处理')
  const currentHash = computeRunInputHash(aggregate.caseV2, aggregate.observations as unknown as Array<Record<string, unknown>>, aggregate.evidenceLinks as unknown as Array<Record<string, unknown>>)
  if (currentHash !== inputHash) throw new CommandValidationError('STALE_INPUT', '案卷输入已变化，请重新运行后再处理')
  const completedAt = run.completedAt ?? run.startedAt
  const supplementChangedAfterRun = aggregate.supplements.some((supplement) =>
    supplement.createdAt > completedAt || supplement.responses.some((response) => response.at > completedAt))
  if (supplementChangedAfterRun) throw new CommandValidationError('STALE_INPUT', '补件状态在审核运行后发生变化，请重新审核后再处理')
  return run
}

export function recordWorkspaceDispositionV2(
  caseId: string,
  command: { requestId: string; actor: Actor; expectedRevision: number; payload: { findingKey: string; disposition: WorkspaceDisposition; reason: string; runId: string; inputHash: string } },
): Promise<ReviewCommandResult<CaseAggregateV2['dispositions'][number]>> {
  return submitCommand(caseId, { ...command, type: 'RecordWorkspaceFindingDisposition' }, (aggregate, payload) => {
    const run = assertCurrentRun(aggregate, payload.runId, payload.inputHash)
    const exists = run.checks.some((check) => check.checkId === payload.findingKey || check.ruleId === payload.findingKey)
      || run.opinions.some((opinion) => opinion.id === payload.findingKey || opinion.checkId === payload.findingKey)
    if (!exists) throw new CommandValidationError('NOT_FOUND', `本次运行中不存在待办: ${payload.findingKey}`)
    if (!payload.reason.trim()) throw new CommandValidationError('VALIDATION_FAILED', '处理待办必须填写理由')
    if (!['confirmed-issue', 'false-positive', 'supplement-requested', 'waived', 'escalated'].includes(payload.disposition)) {
      throw new CommandValidationError('VALIDATION_FAILED', '待办处置状态无效')
    }
    return {
      summary: `审核员处置待办：${payload.disposition}`,
      mutate: (draft) => {
        const record = {
          findingKey: payload.findingKey,
          disposition: payload.disposition,
          actor: command.actor.actorId,
          actorSource: command.actor.actorSource,
          role: command.actor.role,
          reason: payload.reason.trim(),
          at: new Date().toISOString(),
          runId: run.id,
          inputHash: run.inputManifest.hash,
        }
        draft.dispositions = [...draft.dispositions, record]
        return record
      },
    }
  })
}

export function openWorkspaceSupplementV2(
  caseId: string,
  command: { requestId: string; actor: Actor; expectedRevision: number; payload: { findingKey: string; runId: string; inputHash: string; requiredElements: string[]; reason: string } },
): Promise<ReviewCommandResult<SupplementRequest>> {
  return submitCommand(caseId, { ...command, type: 'OpenWorkspaceSupplement' }, (aggregate, payload) => {
    const run = assertCurrentRun(aggregate, payload.runId, payload.inputHash)
    if (!run.checks.some((check) => check.checkId === payload.findingKey || check.ruleId === payload.findingKey)
      && !run.opinions.some((opinion) => opinion.id === payload.findingKey || opinion.checkId === payload.findingKey)) {
      throw new CommandValidationError('NOT_FOUND', `本次运行中不存在待办: ${payload.findingKey}`)
    }
    const requiredElements = payload.requiredElements.map((item) => item.trim()).filter(Boolean)
    if (!requiredElements.length || !payload.reason.trim()) throw new CommandValidationError('VALIDATION_FAILED', '补件必须填写缺少要素和原因')
    return {
      summary: `审核员要求补件：${payload.reason.trim()}`,
      mutate: (draft) => {
        const now = new Date().toISOString()
        const supplement: SupplementRequest = {
          id: `sup-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          caseId,
          originFindingKeys: [payload.findingKey],
          requiredElements,
          reason: payload.reason.trim(),
          responsibleRole: 'student',
          status: 'open',
          responses: [],
          createdAt: now,
          documentVersionIdsAtRequest: aggregate.caseV2.documents.map((document) => document.versionId),
        }
        draft.supplements = [...draft.supplements, supplement]
        draft.caseV2.stage = 'awaiting-supplement'
        draft.dispositions = [...draft.dispositions, {
          findingKey: payload.findingKey,
          disposition: 'supplement-requested',
          actor: command.actor.actorId,
          actorSource: command.actor.actorSource,
          role: command.actor.role,
          reason: payload.reason.trim(),
          at: now,
          runId: run.id,
          inputHash: run.inputManifest.hash,
        }]
        return supplement
      },
    }
  })
}

export function acknowledgeWorkspaceMaterialV2(
  caseId: string,
  command: { requestId: string; actor: Actor; expectedRevision: number; payload: { documentVersionId: string; action: 'read' | 'ignore'; reason: string } },
): Promise<ReviewCommandResult<CaseAggregateV2['caseV2']['documents'][number]>> {
  return submitCommand(caseId, { ...command, type: 'AcknowledgeWorkspaceMaterial' }, (aggregate, payload) => {
    const document = aggregate.caseV2.documents.find((item) => item.versionId === payload.documentVersionId && item.active !== false)
    if (!document) throw new CommandValidationError('NOT_FOUND', `材料版本不存在: ${payload.documentVersionId}`)
    if (!payload.reason.trim()) throw new CommandValidationError('VALIDATION_FAILED', '人工检查材料必须填写处理说明')
    return {
      summary: payload.action === 'ignore' ? `人工忽略材料：${document.fileName}` : `人工检查材料：${document.fileName}`,
      mutate: (draft) => {
        const changed = {
          ...document,
          usage: 'read' as const,
          unusedReason: payload.action === 'ignore' ? `[审核员忽略] ${payload.reason.trim()}` : undefined,
        }
        draft.caseV2.documents = draft.caseV2.documents.map((item) => item.versionId === payload.documentVersionId ? changed : item)
        return changed
      },
    }
  })
}

function unresolvedCheckKeys(aggregate: CaseAggregateV2, runId: string, inputHash: string): string[] {
  const run = getRunV2(aggregate.caseV2.id, runId)
  if (!run) return ['运行记录不存在']
  const actionable = run.checks.filter((check) => !['compliant', 'not-applicable'].includes(check.status))
  const unresolved = actionable.filter((check) => {
    const disposition = [...aggregate.dispositions].reverse().find((entry) =>
      entry.findingKey === check.checkId && entry.runId === run.id && entry.inputHash === inputHash)
    if (!disposition) return true
    if (disposition.disposition === 'supplement-requested') {
      const related = aggregate.supplements.filter((item) => item.originFindingKeys.includes(check.checkId))
      return related.length === 0 || related.some((item) => ['open', 'responded', 'insufficient'].includes(item.status))
    }
    return false
  })
  return unresolved.map((check) => check.checkId)
}

export function decideWorkspaceCaseV2(
  caseId: string,
  command: { requestId: string; actor: Actor; expectedRevision: number; payload: { result: WorkspaceDecision; reason: string; basedOnRunId: string; inputHash: string; requiredElements?: string[]; supplementReason?: string } },
): Promise<ReviewCommandResult<BusinessDecision>> {
  return submitCommand(caseId, { ...command, type: 'RecordWorkspaceBusinessDecision' }, (aggregate, payload) => {
    const run = assertCurrentRun(aggregate, payload.basedOnRunId, payload.inputHash)
    if (!['completed', 'partially-completed'].includes(run.status)) throw new CommandValidationError('INVALID_TRANSITION', '运行未完成，不能形成最终决定')
    if (!payload.reason.trim()) throw new CommandValidationError('VALIDATION_FAILED', '最终决定必须填写理由')
    if (aggregate.caseV2.stage === 'decided' || aggregate.caseV2.stage === 'archived') throw new CommandValidationError('INVALID_TRANSITION', '案卷已结束')

    if (payload.result !== 'return') {
      if (run.coverage.plannedChecks === 0) throw new CommandValidationError('DEPENDENCY_UNRESOLVED', '当前运行没有有效的规则检查计划，不能形成通过/部分通过/驳回决定')
      const unresolved = unresolvedCheckKeys(aggregate, run.id, run.inputManifest.hash)
      if (unresolved.length) throw new CommandValidationError('DEPENDENCY_UNRESOLVED', `仍有待处理审核项：${unresolved.join('、')}`)
      if (aggregate.evidenceLinks.some((link) => link.status === 'candidate')) throw new CommandValidationError('DEPENDENCY_UNRESOLVED', '仍有未确认的证明关联')
      if (aggregate.observations.some((observation) => !observation.confirmed)) throw new CommandValidationError('DEPENDENCY_UNRESOLVED', '仍有未确认的事实')
      if (aggregate.caseV2.documents.some((document) => document.active !== false && document.usage !== 'read')) throw new CommandValidationError('DEPENDENCY_UNRESOLVED', '仍有未完整读取或未人工确认的材料')
      if (aggregate.supplements.some((item) => ['open', 'responded', 'insufficient'].includes(item.status))) throw new CommandValidationError('DEPENDENCY_UNRESOLVED', '仍有未完成补件')
    }
    if (payload.result === 'return' && (!(payload.requiredElements?.some((item) => item.trim())) || !payload.supplementReason?.trim())) {
      throw new CommandValidationError('VALIDATION_FAILED', '退回补件必须指定缺少要素和原因')
    }

    return {
      summary: `审核员作出最终决定：${payload.result}`,
      mutate: (draft) => {
        const now = new Date().toISOString()
        const decision: BusinessDecision = {
          id: `dec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          actor: command.actor,
          scope: { kind: 'case', ids: [] },
          stageId: draft.caseV2.stage,
          result: payload.result,
          reason: payload.reason.trim(),
          basedOnRunId: run.id,
          basedOnRevision: aggregate.caseV2.revision,
          at: now,
          finality: 'final',
        }
        draft.decisions = [...draft.decisions, decision]
        if (payload.result === 'return') {
          draft.supplements = [...draft.supplements, {
            id: `sup-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            caseId,
            originFindingKeys: [],
            requiredElements: payload.requiredElements!.map((item) => item.trim()).filter(Boolean),
            reason: payload.supplementReason!.trim(),
            responsibleRole: 'student',
            status: 'open',
            responses: [],
            createdAt: now,
            documentVersionIdsAtRequest: aggregate.caseV2.documents.map((document) => document.versionId),
          }]
          draft.caseV2.stage = 'awaiting-supplement'
        } else {
          draft.caseV2.stage = 'decided'
          draft.tasks = draft.tasks.map((task) => task.status === 'open' ? { ...task, status: 'completed', completedAt: now } : task)
        }
        return decision
      },
    }
  })
}

/** 与工作台共用的新鲜度查询；历史运行可留存，但不能作为当前结论。 */
export function isWorkspaceRunStaleV2(aggregate: CaseAggregateV2, runId: string): boolean {
  const run = getRunV2(aggregate.caseV2.id, runId)
  if (!run?.inputManifest.hash) return true
  if (computeRunInputHash(aggregate.caseV2, aggregate.observations as unknown as Array<Record<string, unknown>>, aggregate.evidenceLinks as unknown as Array<Record<string, unknown>>) !== run.inputManifest.hash) return true
  const completedAt = run.completedAt ?? run.startedAt
  return aggregate.supplements.some((supplement) => supplement.createdAt > completedAt || supplement.responses.some((response) => response.at > completedAt))
}

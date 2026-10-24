import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import type { AgentGoalState, AgentGoalStatus, AgentGoalIterationRecord, AgentGoalUsage } from '@profer/shared'
import { GOAL_HISTORY_LIMIT } from './goal-loop'

const CURRENT_SCHEMA_VERSION = 2
const LEGACY_SCHEMA_VERSION = 1
const VALID_STATUSES: AgentGoalStatus[] = ['active', 'paused', 'completed', 'blocked', 'failed', 'stopped', 'stopping', 'budget_limited']

interface GoalStorePayload { version: number; goals: unknown[]; history?: unknown[] }

function nonNegativeInteger(value: unknown): value is number { return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 }
function positiveNumber(value: unknown): value is number { return typeof value === 'number' && Number.isFinite(value) && value > 0 }
function record(value: unknown): value is Record<string, unknown> { return Boolean(value && typeof value === 'object' && !Array.isArray(value)) }
function nonEmptyString(value: unknown): value is string { return typeof value === 'string' && value.trim().length > 0 }
function evidence(value: unknown): value is string[] { return Array.isArray(value) && value.every((item) => typeof item === 'string') }
function validUsage(value: unknown): value is AgentGoalUsage {
  return record(value) && nonNegativeInteger(value.inputTokens) && nonNegativeInteger(value.outputTokens) && nonNegativeInteger(value.totalTokens)
}
function validHistoryRecord(value: unknown): value is AgentGoalIterationRecord {
  if (!record(value)) return false
  return nonNegativeInteger(value.iteration) && value.iteration > 0
    && nonNegativeInteger(value.startedAt) && nonNegativeInteger(value.finishedAt) && value.finishedAt >= value.startedAt
    && ['continue', 'complete', 'blocked'].includes(String(value.status))
    && typeof value.summary === 'string' && evidence(value.evidence)
    && (value.outcome === undefined || ['success', 'failed', 'stopped', 'deferred'].includes(String(value.outcome)))
    && (value.error === undefined || typeof value.error === 'string')
    && (value.usage === undefined || validUsage(value.usage))
}
function isGoalState(value: unknown): value is AgentGoalState {
  if (!record(value)) return false
  if (!nonEmptyString(value.id) || !nonEmptyString(value.sessionId) || !nonEmptyString(value.goal) || !VALID_STATUSES.includes(value.status as AgentGoalStatus)) return false
  if (!nonNegativeInteger(value.iteration) || !nonNegativeInteger(value.consecutiveFailures) || !nonNegativeInteger(value.startedAt) || !nonNegativeInteger(value.updatedAt)) return false
  const limits = value.limits
  if (!record(limits) || !nonNegativeInteger(limits.maxIterations) || limits.maxIterations === 0 || !nonNegativeInteger(limits.maxConsecutiveFailures) || limits.maxConsecutiveFailures === 0 || !positiveNumber(limits.maxDurationMs)) return false
  if (limits.maxTokens !== undefined && (!nonNegativeInteger(limits.maxTokens) || limits.maxTokens === 0)) return false
  if (value.revision !== undefined && !nonNegativeInteger(value.revision)) return false
  if (value.elapsedMs !== undefined && !nonNegativeInteger(value.elapsedMs)) return false
  if (value.usage !== undefined && !validUsage(value.usage)) return false
  if (value.history !== undefined && (!Array.isArray(value.history) || !value.history.every(validHistoryRecord))) return false
  if (value.lastEvidence !== undefined && !evidence(value.lastEvidence)) return false
  for (const key of ['activeRunId', 'runtimeSessionId', 'runtimeSessionFile', 'blockedTodoId', 'lastSummary', 'stopReason']) {
    if (value[key] !== undefined && typeof value[key] !== 'string') return false
  }
  if (value.contract !== undefined) {
    if (!record(value.contract)) return false
    for (const key of ['verification', 'constraints', 'stopWhen']) {
      if (value.contract[key] !== undefined && typeof value.contract[key] !== 'string') return false
    }
  }
  return true
}

function sanitize(state: AgentGoalState): AgentGoalState {
  const history = Array.isArray(state.history) ? state.history.slice(-GOAL_HISTORY_LIMIT) : []
  // v1 没有净执行时间，只迁移可确认的历史轮次时长；不使用 startedAt 的墙钟时间。
  const elapsedMs = state.elapsedMs ?? (state.history ?? []).reduce((total, item) => total + item.finishedAt - item.startedAt, 0)
  return { ...state, history, revision: state.revision ?? 1, elapsedMs }
}

function readPayload(filePath: string): GoalStorePayload | undefined {
  try {
    const parsed: unknown = JSON.parse(readFileSync(filePath, 'utf8'))
    if (!parsed || typeof parsed !== 'object') return undefined
    const payload = parsed as Partial<GoalStorePayload>
    if (payload.version !== CURRENT_SCHEMA_VERSION && payload.version !== LEGACY_SCHEMA_VERSION) return undefined
    if (!Array.isArray(payload.goals)) return undefined
    return { version: payload.version, goals: payload.goals, history: Array.isArray(payload.history) ? payload.history : [] }
  } catch { return undefined }
}

export function loadGoalStates(filePath: string): AgentGoalState[] {
  const payload = readPayload(filePath)
  if (!payload) return []
  return payload.goals.filter(isGoalState).map(sanitize)
}

export function loadGoalHistory(filePath: string, sessionId?: string): AgentGoalState[] {
  const payload = readPayload(filePath)
  if (!payload?.history) return []
  return payload.history.filter(isGoalState).map(sanitize).filter((state) => sessionId === undefined || state.sessionId === sessionId)
}

function writePayload(filePath: string, payload: GoalStorePayload): void {
  // 损坏或未知版本不是空仓库：保留原文件，禁止恢复/保存默默覆盖数据。
  if (existsSync(filePath) && !readPayload(filePath)) throw new Error('Goal 状态文件损坏或版本不受支持，已保留原文件')
  mkdirSync(dirname(filePath), { recursive: true })
  const tempPath = `${filePath}.${process.pid}.tmp`
  writeFileSync(tempPath, JSON.stringify(payload, null, 2), 'utf8')
  renameSync(tempPath, filePath)
}

export function saveGoalStates(filePath: string, states: AgentGoalState[]): void {
  if (!states.every(isGoalState)) throw new Error('Goal 状态不符合持久化 schema')
  const existing = readPayload(filePath)
  writePayload(filePath, { version: CURRENT_SCHEMA_VERSION, goals: states.map(sanitize), history: existing?.history?.filter(isGoalState).map(sanitize) ?? [] })
}

/** 归档按 Goal id 去重；允许旧 Goal 归档，不依赖 sessionId 当前 live 槽位。 */
export function archiveGoalState(filePath: string, state: AgentGoalState): void {
  if (!isGoalState(state)) throw new Error('归档 Goal 不符合持久化 schema')
  const existing = readPayload(filePath)
  const history = (existing?.history?.filter(isGoalState).map(sanitize) ?? []).filter((item) => item.id !== state.id)
  writePayload(filePath, { version: CURRENT_SCHEMA_VERSION, goals: existing?.goals?.filter(isGoalState).map(sanitize) ?? [], history: [...history, sanitize(state)] })
}

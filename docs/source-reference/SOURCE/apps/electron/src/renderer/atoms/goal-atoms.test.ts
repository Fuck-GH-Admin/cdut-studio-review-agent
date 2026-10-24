import { describe, expect, test } from 'bun:test'
import { createStore } from 'jotai/vanilla'
import type { AgentGoalState } from '@profer/shared'
import {
  agentGoalAtomFamily, agentGoalsAtom, mergeAgentGoalAtom, hydrateAgentGoalsAtom,
  getGoalActions, startGoalWithReplacement, goalEditorAtomFamily,
} from './goal-atoms'

const goal = (patch: Partial<AgentGoalState> = {}): AgentGoalState => ({
  id: 'goal-a', sessionId: 'session-a', goal: '完成改造', status: 'paused',
  iteration: 2, consecutiveFailures: 0, startedAt: 100, updatedAt: 200, revision: 2,
  limits: { maxIterations: 20, maxDurationMs: 7200000, maxConsecutiveFailures: 3 },
  ...patch,
})

describe('Goal 状态归并', () => {
  test('拒绝旧 revision 和重复事件，即使其时间戳更晚', () => {
    const store = createStore()
    const current = goal({ revision: 5 })
    store.set(mergeAgentGoalAtom, { sessionId: 'session-a', state: current })
    expect(store.set(mergeAgentGoalAtom, { sessionId: 'session-a', state: goal({ revision: 4, updatedAt: 999 }) })).toBe(false)
    expect(store.set(mergeAgentGoalAtom, { sessionId: 'session-a', state: current })).toBe(false)
    expect(store.get(agentGoalAtomFamily('session-a'))).toBe(current)
  })

  test('旧 goal 的高 revision/迟到停止不能覆盖新 owner', () => {
    const store = createStore()
    store.set(mergeAgentGoalAtom, { sessionId: 'session-a', state: goal() })
    const next = goal({ id: 'goal-b', startedAt: 300, updatedAt: 300, revision: 1, status: 'active' })
    store.set(mergeAgentGoalAtom, { sessionId: 'session-a', state: next })
    store.set(mergeAgentGoalAtom, { sessionId: 'session-a', state: goal({ revision: 99, updatedAt: 500, status: 'stopped' }) })
    expect(store.get(agentGoalAtomFamily('session-a'))).toBe(next)
  })

  test('拒绝跨 session 快照及无 owner 的 null 事件', () => {
    const store = createStore()
    store.set(mergeAgentGoalAtom, { sessionId: 'session-a', state: goal() })
    expect(store.set(mergeAgentGoalAtom, { sessionId: 'session-b', state: goal() })).toBe(false)
    expect(store.set(mergeAgentGoalAtom, { sessionId: 'session-a', state: null })).toBe(false)
    expect(store.get(agentGoalsAtom).size).toBe(1)
  })

  test('水合不能覆盖 live 变更或删除其他 session', () => {
    const store = createStore()
    const live = goal({ revision: 5, status: 'active' })
    store.set(mergeAgentGoalAtom, { sessionId: 'session-a', state: live })
    store.set(hydrateAgentGoalsAtom, [goal(), goal({ id: 'other', sessionId: 'session-b' })])
    expect(store.get(agentGoalAtomFamily('session-a'))).toBe(live)
    expect(store.get(agentGoalAtomFamily('session-b'))?.id).toBe('other')
  })

  test('clear 保留 tombstone，迟到 hydrate/同 owner 事件不得复活 Goal', () => {
    const store = createStore()
    store.set(mergeAgentGoalAtom, { sessionId: 'session-a', state: goal() })
    store.set(mergeAgentGoalAtom, { sessionId: 'session-a', state: goal({ revision: 3, stopReason: 'cleared' }) })
    store.set(hydrateAgentGoalsAtom, [goal()])
    store.set(mergeAgentGoalAtom, { sessionId: 'session-a', state: goal({ revision: 4 }) })
    expect(store.get(agentGoalAtomFamily('session-a'))).toBeUndefined()
    const next = goal({ id: 'goal-b', startedAt: 300, revision: 1 })
    store.set(mergeAgentGoalAtom, { sessionId: 'session-a', state: next })
    store.set(mergeAgentGoalAtom, { sessionId: 'session-a', state: goal({ revision: 99, stopReason: 'cleared', updatedAt: 900 }) })
    expect(store.get(agentGoalAtomFamily('session-a'))).toBe(next)
  })

  test('legacy 无 revision 仅按时间向前，不能覆盖已版本化状态', () => {
    const store = createStore()
    store.set(mergeAgentGoalAtom, { sessionId: 'session-a', state: goal({ revision: undefined }) })
    store.set(mergeAgentGoalAtom, { sessionId: 'session-a', state: goal({ revision: undefined, updatedAt: 150 }) })
    expect(store.get(agentGoalAtomFamily('session-a'))?.updatedAt).toBe(200)
    store.set(mergeAgentGoalAtom, { sessionId: 'session-a', state: goal({ revision: 1 }) })
    store.set(mergeAgentGoalAtom, { sessionId: 'session-a', state: goal({ revision: undefined, updatedAt: 999 }) })
    expect(store.get(agentGoalAtomFamily('session-a'))?.revision).toBe(1)
  })

  test('编辑器按会话隔离，不影响 Goal 快照', () => {
    const store = createStore()
    store.set(goalEditorAtomFamily('session-a'), goal())
    expect(store.get(goalEditorAtomFamily('session-a'))?.id).toBe('goal-a')
    expect(store.get(goalEditorAtomFamily('session-b'))).toBeNull()
    expect(store.get(agentGoalsAtom).size).toBe(0)
  })
})

describe('Goal 状态操作', () => {
  test('blocked/failed/stopped/paused 可恢复，active/stopping/completed 不可恢复', () => {
    for (const status of ['blocked', 'failed', 'stopped', 'paused'] as const) {
      expect(getGoalActions(goal({ status })).canResume).toBe(true)
    }
    for (const status of ['active', 'stopping', 'completed'] as const) {
      expect(getGoalActions(goal({ status })).canResume).toBe(false)
    }
  })

  test('停止超时或 deadline 后仍有 owner 时不能恢复/编辑', () => {
    for (const status of ['paused', 'stopped', 'budget_limited'] as const) {
      expect(getGoalActions(goal({ status, activeRunId: 'still-running' }))).toMatchObject({ canResume: false, canEdit: false })
    }
  })

  test('active owner 仍可暂停/停止，只有编辑和恢复需等待 owner 释放', () => {
    expect(getGoalActions(goal({ status: 'active', activeRunId: 'running' }))).toMatchObject({ canPause: true, canStop: true, canEdit: false, canResume: false })
  })

  test('预算耗尽必须先编辑，不能盲目 resume；运行中不可编辑', () => {
    expect(getGoalActions(goal({ status: 'budget_limited' }))).toMatchObject({ canResume: false, canEdit: true, budgetEditRequired: true })
    expect(getGoalActions(goal({ status: 'paused', iteration: 20 })).canResume).toBe(false)
    expect(getGoalActions(goal({ status: 'active' }))).toMatchObject({ canEdit: false, canPause: true, canStop: true })
    expect(getGoalActions(goal({ status: 'stopping' }))).toMatchObject({ canEdit: false, canPause: false, canStop: false })
  })
})

describe('Goal 替换流程', () => {
  function api(initial: AgentGoalState | null) {
    let state = initial
    const calls: string[] = []
    return {
      calls,
      getGoal: async () => state,
      stopGoal: async () => { calls.push('stop'); state = goal({ ...state, status: 'stopped' }); return state },
      clearGoal: async () => { calls.push('clear'); state = null },
      startGoal: async () => { calls.push('start'); return goal({ id: 'new' }) },
    }
  }

  test('未完成目标先请求确认，不触发停止/清除/新建', async () => {
    for (const status of ['active', 'paused', 'blocked', 'failed', 'stopped', 'budget_limited'] as const) {
      const backend = api(goal({ status }))
      expect((await startGoalWithReplacement(backend, 'session-a', { goal: '新目标' })).confirmation?.id).toBe('goal-a')
      expect(backend.calls).toEqual([])
    }
  })

  test('确认 active owner 后按 stop → clear → start 顺序执行', async () => {
    const backend = api(goal({ status: 'active' }))
    await startGoalWithReplacement(backend, 'session-a', { goal: '新目标' }, 'goal-a')
    expect(backend.calls).toEqual(['stop', 'clear', 'start'])
  })

  test('completed 可直接开始，后台负责归档；不存在目标可直接开始', async () => {
    for (const state of [goal({ status: 'completed' }), null]) {
      const backend = api(state)
      await startGoalWithReplacement(backend, 'session-a', { goal: '新目标' })
      expect(backend.calls).toEqual(['start'])
    }
  })

  test('确认后 owner 已改变或 stopping 时拒绝破坏性操作', async () => {
    const changed = api(goal({ id: 'goal-b', status: 'paused' }))
    await expect(startGoalWithReplacement(changed, 'session-a', { goal: '新目标' }, 'goal-a')).rejects.toThrow('已变化')
    expect(changed.calls).toEqual([])
    const stopping = api(goal({ status: 'stopping' }))
    await expect(startGoalWithReplacement(stopping, 'session-a', { goal: '新目标' }, 'goal-a')).rejects.toThrow('正在停止')
    expect(stopping.calls).toEqual([])
    const busy = api(goal({ status: 'stopped', activeRunId: 'unsettled' }))
    await expect(startGoalWithReplacement(busy, 'session-a', { goal: '新目标' }, 'goal-a')).rejects.toThrow('正在停止')
    expect(busy.calls).toEqual([])
  })
})

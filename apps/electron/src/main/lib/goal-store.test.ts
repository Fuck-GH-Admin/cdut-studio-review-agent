import { describe, expect, test } from 'bun:test'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { archiveGoalState, loadGoalHistory, loadGoalStates, saveGoalStates } from './goal-store'
import { createGoalState, DEFAULT_GOAL_LIMITS } from './goal-loop'

describe('goal store', () => {
  test('round-trips goal states', () => {
    const dir = mkdtempSync(join(tmpdir(), 'goal-store-'))
    try {
      const file = join(dir, 'goals.json')
      const goal = createGoalState('session-1', '完成登录页', 1000, DEFAULT_GOAL_LIMITS, { verification: '测试通过' })
      saveGoalStates(file, [{ ...goal, status: 'paused' }])
      const loaded = loadGoalStates(file)
      expect(loaded).toHaveLength(1)
      expect(loaded[0]).toMatchObject({ sessionId: 'session-1', goal: '完成登录页', status: 'paused', contract: { verification: '测试通过' }, history: [] })
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  test('returns empty list for missing or corrupt files', () => {
    const dir = mkdtempSync(join(tmpdir(), 'goal-store-'))
    try {
      expect(loadGoalStates(join(dir, 'missing.json'))).toEqual([])
      const corrupt = join(dir, 'corrupt.json')
      writeFileSync(corrupt, '{not json', 'utf8')
      expect(loadGoalStates(corrupt)).toEqual([])
      const invalid = join(dir, 'invalid.json')
      writeFileSync(invalid, JSON.stringify({ goals: [{ foo: 1 }] }), 'utf8')
      expect(loadGoalStates(invalid)).toEqual([])
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  test('strictly validates schema and version while accepting old v1', () => {
    const dir = mkdtempSync(join(tmpdir(), 'goal-store-'))
    try {
      const file = join(dir, 'goals.json')
      const goal = createGoalState('s', '目标', 1000)
      writeFileSync(file, JSON.stringify({ version: 1, goals: [goal, { ...goal, id: 'bad', limits: { ...goal.limits, maxIterations: -1 } }, { ...goal, id: 'bad2', status: 'arbitrary' }, { ...goal, id: 'bad3', iteration: '20' }, { ...goal, id: 'bad4', usage: { inputTokens: -1, outputTokens: 0, totalTokens: 0 } }] }))
      expect(loadGoalStates(file).map((state) => state.id)).toEqual([goal.id])
      writeFileSync(file, JSON.stringify({ version: 99, goals: [goal] }))
      expect(loadGoalStates(file)).toEqual([])
      writeFileSync(file, JSON.stringify({ goals: [goal] }))
      expect(loadGoalStates(file)).toEqual([])
    } finally { rmSync(dir, { recursive: true, force: true }) }
  })

  test('archives by goalId idempotently and live save preserves archives', () => {
    const dir = mkdtempSync(join(tmpdir(), 'goal-store-'))
    try {
      const file = join(dir, 'goals.json')
      const old = { ...createGoalState('s', '旧目标', 1000), status: 'blocked' as const }
      saveGoalStates(file, [old])
      archiveGoalState(file, old)
      archiveGoalState(file, old)
      const next = createGoalState('s', '新目标', 2000)
      saveGoalStates(file, [next])
      expect(loadGoalStates(file).map((state) => state.id)).toEqual([next.id])
      expect(loadGoalHistory(file, 's').map((state) => state.id)).toEqual([old.id])
      expect(loadGoalHistory(file, 'other')).toEqual([])
    } finally { rmSync(dir, { recursive: true, force: true }) }
  })

  test('严格拒绝坏 history、contract、owner 和非有限预算', () => {
    const dir = mkdtempSync(join(tmpdir(), 'goal-store-'))
    try {
      const file = join(dir, 'goals.json')
      const goal = createGoalState('s', '目标', 1000)
      const bad = [
        { ...goal, id: '', },
        { ...goal, contract: { verification: 123 } },
        { ...goal, activeRunId: {} },
        { ...goal, history: [{ iteration: 1 }] },
        { ...goal, history: [{ iteration: 1, startedAt: 1, finishedAt: 2, status: 'wrong', summary: 'x', evidence: [] }] },
        { ...goal, lastEvidence: [123] },
      ]
      writeFileSync(file, JSON.stringify({ version: 2, goals: bad }))
      expect(loadGoalStates(file)).toEqual([])
    } finally { rmSync(dir, { recursive: true, force: true }) }
  })

  test('v1 elapsedMs 从已存执行记录迁移，不能包括暂停时间', () => {
    const dir = mkdtempSync(join(tmpdir(), 'goal-store-'))
    try {
      const file = join(dir, 'goals.json')
      const { elapsedMs: _elapsed, revision: _revision, ...goal } = createGoalState('s', '目标', 1000)
      writeFileSync(file, JSON.stringify({ version: 1, goals: [{ ...goal, history: [{ iteration: 1, startedAt: 1000, finishedAt: 1050, status: 'continue', summary: '进展', evidence: ['证据'] }], updatedAt: 10000000 }] }))
      expect(loadGoalStates(file)[0]?.elapsedMs).toBe(50)
    } finally { rmSync(dir, { recursive: true, force: true }) }
  })

  test('save 非法状态不覆盖原子文件', () => {
    const dir = mkdtempSync(join(tmpdir(), 'goal-store-'))
    try {
      const file = join(dir, 'goals.json')
      const goal = createGoalState('s', '目标', 1000)
      saveGoalStates(file, [goal])
      expect(() => saveGoalStates(file, [{ ...goal, limits: { ...goal.limits, maxDurationMs: NaN } }])).toThrow()
      expect(loadGoalStates(file)[0]?.id).toBe(goal.id)
    } finally { rmSync(dir, { recursive: true, force: true }) }
  })

  test('损坏或未知版本文件不能被恢复保存覆盖，归档不按全局20条丢历史', () => {
    const dir = mkdtempSync(join(tmpdir(), 'goal-store-'))
    try {
      const file = join(dir, 'goals.json')
      writeFileSync(file, '{broken')
      expect(() => saveGoalStates(file, [])).toThrow('已保留原文件')
      expect(readFileSync(file, 'utf8')).toBe('{broken')
      writeFileSync(file, JSON.stringify({ version: 999, goals: [] }))
      expect(() => archiveGoalState(file, createGoalState('s', '目标'))).toThrow()
      writeFileSync(file, JSON.stringify({ version: 2, goals: [], history: [] }))
      for (let i = 0; i < 25; i++) archiveGoalState(file, createGoalState('s', `目标${i}`))
      expect(loadGoalHistory(file, 's')).toHaveLength(25)
    } finally { rmSync(dir, { recursive: true, force: true }) }
  })

  test('caps persisted history to the limit', () => {
    const dir = mkdtempSync(join(tmpdir(), 'goal-store-'))
    try {
      const file = join(dir, 'goals.json')
      const goal = createGoalState('session-1', '长跑', 1000)
      const history = Array.from({ length: 40 }, (_, index) => ({
        iteration: index + 1,
        startedAt: 1000 + index,
        finishedAt: 1001 + index,
        status: 'continue' as const,
        summary: `第 ${index + 1} 轮`,
        evidence: [],
      }))
      saveGoalStates(file, [{ ...goal, history }])
      const loaded = loadGoalStates(file)
      expect(loaded[0]?.history).toHaveLength(20)
      expect(loaded[0]?.history?.[19]?.iteration).toBe(40)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

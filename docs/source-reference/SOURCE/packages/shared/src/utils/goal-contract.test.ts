import { describe, expect, test } from 'bun:test'
import { isGoalIterationMessage, isGoalUpdateToolName, parseGoalCommand, parseGoalContractInput, parseGoalLimitsInput, getGoalBudgetExhaustedReasons, stripGoalResultBlocks } from './goal-contract'
import type { AgentGoalState } from '../types/agent'

describe('Goal 预算编辑解析', () => {
  const input = { maxIterations: '20', maxDurationMinutes: '120', maxConsecutiveFailures: '3', maxTokens: '' }

  test('分钟转换为毫秒，空 token 字段保留原有限制', () => {
    expect(parseGoalLimitsInput(input)).toEqual({ maxIterations: 20, maxDurationMs: 7200000, maxConsecutiveFailures: 3 })
    expect(parseGoalLimitsInput({ ...input, maxTokens: ' 50000 ', maxDurationMinutes: '0.5' })).toMatchObject({ maxTokens: 50000, maxDurationMs: 30000 })
  })

  test('非法、零、负值、无穷或不安全整数不可悄悄变为不限额', () => {
    for (const value of ['', '0', '-1', 'NaN', 'Infinity', '1e3', '1.5', '20x', '9007199254740992']) {
      expect(() => parseGoalLimitsInput({ ...input, maxIterations: value })).toThrow()
    }
    for (const value of ['0', '-2', 'abc', '1.5', 'Infinity']) {
      expect(() => parseGoalLimitsInput({ ...input, maxTokens: value })).toThrow()
    }
    expect(() => parseGoalLimitsInput({ ...input, maxDurationMinutes: '9007199254740991' })).toThrow()
    expect(() => parseGoalLimitsInput({ ...input, maxDurationMinutes: '0.000001' })).toThrow()
  })

  test('只按累计净执行时间和用量检查预算，不包含暂停的墙钟时间', () => {
    const state: AgentGoalState = {
      id: 'g', sessionId: 's', goal: '目标', status: 'paused', iteration: 20,
      consecutiveFailures: 0, startedAt: 0, updatedAt: 999999999, elapsedMs: 7200000,
      limits: { maxIterations: 20, maxDurationMs: 7200000, maxConsecutiveFailures: 3, maxTokens: 100 },
      usage: { inputTokens: 60, outputTokens: 40, totalTokens: 100 },
    }
    expect(getGoalBudgetExhaustedReasons(state)).toHaveLength(3)
    expect(getGoalBudgetExhaustedReasons({ ...state, iteration: 1, elapsedMs: 100, usage: undefined })).toEqual([])
  })
})

describe('goal contract parsing', () => {
  test('parses subcommands case-insensitively', () => {
    expect(parseGoalCommand('/goal STATUS')).toEqual({ type: 'status' })
    expect(parseGoalCommand('/goal resume')).toEqual({ type: 'resume' })
  })

  test('subcommand inside a multiline goal stays a start command', () => {
    const command = parseGoalCommand('/goal status 页面重做\n把旧状态页替换成新设计')
    expect(command.type).toBe('start')
    if (command.type === 'start') expect(command.goal).toContain('status 页面重做')
  })

  test('contract markers are extracted and removed from the goal text', () => {
    const { goal, contract } = parseGoalContractInput('优化首屏加载\n@verify: LCP < 2s\n@constraints: 不动鉴权逻辑\n@stop: 需要生产数据时')
    expect(goal).toBe('优化首屏加载')
    expect(contract).toEqual({ verification: 'LCP < 2s', constraints: '不动鉴权逻辑', stopWhen: '需要生产数据时' })
  })

  test('duplicate or overlong markers keep the first valid value', () => {
    const long = 'x'.repeat(241)
    const { contract } = parseGoalContractInput(`目标\n@verify: ${long}\n@verify: 第一条有效\n@verify: 第二条忽略`)
    expect(contract?.verification).toBe('第一条有效')
  })

  test('goal without markers has no contract', () => {
    expect(parseGoalContractInput('优化性能').contract).toBeUndefined()
    expect(parseGoalCommand('/goal 优化性能')).toEqual({ type: 'start', goal: '优化性能', contract: undefined })
  })

  test('stripGoalResultBlocks removes machine protocol from display text', () => {
    const text = '本轮完成了修改。\n\n<goal_result>{"status":"continue","summary":"x","evidence":[]}</goal_result>\n'
    expect(stripGoalResultBlocks(text)).toBe('本轮完成了修改。')
    // 未闭合的尾部块（流式中途）一并剥离
    expect(stripGoalResultBlocks('正文<goal_result>{"stat')).toBe('正文')
    expect(stripGoalResultBlocks('没有协议块的文本')).toBe('没有协议块的文本')
  })

  test('isGoalIterationMessage only matches marked messages', () => {
    expect(isGoalIterationMessage({ type: 'user', _goalIteration: 3 })).toBe(true)
    expect(isGoalIterationMessage({ type: 'user', _goalIteration: true })).toBe(true)
    expect(isGoalIterationMessage({ type: 'user' })).toBe(false)
    expect(isGoalIterationMessage(null)).toBe(false)
  })

  test('isGoalUpdateToolName recognizes Claude MCP and Pi names', () => {
    expect(isGoalUpdateToolName('update_goal')).toBe(true)
    expect(isGoalUpdateToolName('mcp__goal__update_goal')).toBe(true)
    expect(isGoalUpdateToolName('mcp__planning__update_todo')).toBe(false)
  })
})

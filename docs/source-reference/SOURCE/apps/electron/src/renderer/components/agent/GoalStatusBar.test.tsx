import * as React from 'react'
import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { Provider, createStore } from 'jotai'
import type { AgentGoalState } from '@profer/shared'
import { mergeAgentGoalAtom } from '../../atoms/goal-atoms'
import { allPendingAskUserRequestsAtom, allPendingPermissionRequestsAtom } from '../../atoms/agent-atoms'
import { GoalStatusBar, GoalHistoryDetails } from './GoalStatusBar'

const goal = (status: AgentGoalState['status']): AgentGoalState => ({
  id: 'g', sessionId: 's', goal: '交付目标', status, revision: 1, iteration: 2,
  consecutiveFailures: 0, startedAt: 100, updatedAt: 200, elapsedMs: 4000,
  limits: { maxIterations: 20, maxDurationMs: 7200000, maxConsecutiveFailures: 3 },
})
function render(state: AgentGoalState) {
  const store = createStore()
  store.set(mergeAgentGoalAtom, { sessionId: 's', state })
  return renderToStaticMarkup(<Provider store={store}><GoalStatusBar sessionId="s" /></Provider>)
}

describe('Goal 状态栏渲染', () => {
  test('blocked/failed/stopped 都提供恢复入口', () => {
    for (const status of ['blocked', 'failed', 'stopped'] as const) {
      expect(render(goal(status))).toContain('恢复 Goal')
    }
  })

  test('预算耗尽显示原因和预算编辑，而非盲目恢复按钮', () => {
    const html = render({ ...goal('budget_limited'), iteration: 20, stopReason: 'max_iterations' })
    expect(html).toContain('预算已耗尽')
    expect(html).toContain('已达到轮次上限')
    expect(html).toContain('修改预算后恢复')
    expect(html).not.toContain('title="恢复 Goal"')
  })

  test('stopping 不能再次停止或编辑，不伪装已经结束', () => {
    const html = render(goal('stopping'))
    expect(html).toContain('正在停止')
    expect(html).not.toContain('title="停止 Goal"')
    expect(html).not.toContain('title="编辑目标、契约与预算"')
  })

  test('耗时采用累计净执行时间，明确同会话接续', () => {
    const html = render(goal('paused'))
    expect(html).toContain('4s')
    expect(html).toContain('沿用当前会话上下文')
  })

  test('等待空闲与交互请求不伪装成正在执行', () => {
    expect(render(goal('active'))).toContain('等待会话空闲')
    const store = createStore()
    store.set(mergeAgentGoalAtom, { sessionId: 's', state: { ...goal('active'), activeRunId: 'run' } })
    store.set(allPendingAskUserRequestsAtom, new Map([['s', [{ requestId: 'ask', sessionId: 's', questions: [], toolInput: {} }]]]))
    expect(renderToStaticMarkup(<Provider store={store}><GoalStatusBar sessionId="s" /></Provider>)).toContain('等待你的回答')
    store.set(allPendingAskUserRequestsAtom, new Map())
    store.set(allPendingPermissionRequestsAtom, new Map([['s', [{ requestId: 'permission', sessionId: 's', toolName: 'Bash', toolInput: {}, description: '运行命令', dangerLevel: 'normal' }]]]))
    expect(renderToStaticMarkup(<Provider store={store}><GoalStatusBar sessionId="s" /></Provider>)).toContain('等待审批')
  })

  test('轮次历史显示失败与证据，归档目标可展开', () => {
    const archived = {
      ...goal('failed'),
      history: [{ iteration: 1, startedAt: 100, finishedAt: 200, status: 'continue' as const, summary: '运行失败', evidence: ['test.log'], outcome: 'failed' as const, error: '连接中断' }],
    }
    const html = renderToStaticMarkup(<GoalHistoryDetails goals={[archived]} />)
    expect(html).toContain('<details')
    expect(html).toContain('交付目标')
    expect(html).toContain('运行失败')
    expect(html).toContain('test.log')
    expect(html).toContain('连接中断')
  })
})

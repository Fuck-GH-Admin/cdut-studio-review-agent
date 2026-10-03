/**
 * 运行图执行器单测（M3，A11/A18：检查点续跑/等待/取消/失败重试）
 */
import { describe, expect, test } from 'bun:test'
import type { TemplateVersion } from '@profer/shared'
import { executeRunGraph, planRunGraph, restoreCheckpoints, type NodeExecutor, type RunGraphNode } from './review-run-graph'

const template = (stages: TemplateVersion['stages']): TemplateVersion =>
  ({ templateId: 't', version: 1, schemaVersion: 2, name: 't', objectType: 'person', displayName: { template: '' }, fields: [], materialSlots: [], policyVersionIds: [], stages, outputs: [], status: 'published', createdAt: '' }) as unknown as TemplateVersion

const ok: NodeExecutor = async (_node, hash) => ({ status: 'done', inputHash: hash })

describe('planRunGraph', () => {
  test('Given 两级流程模板 When 生成 Then 节点线性依赖', () => {
    const nodes = planRunGraph(template([
      { id: 'auto', name: '自动', kind: 'auto-check', executorRole: 'system' },
      { id: 'review', name: '初审', kind: 'manual-review', executorRole: 'reviewer' },
      { id: 'final', name: '终审', kind: 'manual-review', executorRole: 'teacher' },
    ]))
    expect(nodes.map((node) => node.id)).toEqual(['node-auto', 'node-review', 'node-final'])
    expect(nodes[1]!.dependsOn).toEqual(['node-auto'])
    expect(nodes[2]!.dependsOn).toEqual(['node-review'])
  })
})

describe('executeRunGraph（A18）', () => {
  test('Given 全部成功 When 执行 Then completed 且事件含 started/completed', async () => {
    const outcome = await executeRunGraph(planRunGraph(template([
      { id: 'a', name: 'a', kind: 'auto-check', executorRole: 'system' },
      { id: 'b', name: 'b', kind: 'manual-review', executorRole: 'teacher' },
    ])), { parse: ok, extract: ok, bind: ok, check: ok, compute: ok, summarize: ok })
    expect(outcome.status).toBe('completed')
    expect(outcome.checkpoints).toHaveLength(2)
    expect(outcome.events.some((event) => event.kind === 'node-started')).toBeTrue()
    expect(outcome.events.some((event) => event.kind === 'run-completed')).toBeTrue()
  })

  test('Given 第二节点等待输入 When 执行 Then awaiting-input 且第三节点不执行（分支暂停）', async () => {
    const waiting: NodeExecutor = async (_node, hash) => (_node.id === 'node-b' ? { status: 'waiting-input', reason: '缺证明材料' } : { status: 'done', inputHash: hash })
    const outcome = await executeRunGraph(planRunGraph(template([
      { id: 'a', name: 'a', kind: 'auto-check', executorRole: 'system' },
      { id: 'b', name: 'b', kind: 'manual-review', executorRole: 'teacher' },
      { id: 'c', name: 'c', kind: 'summary', executorRole: 'organizer' },
    ])), { parse: waiting, extract: waiting, bind: waiting, check: waiting, compute: waiting, summarize: waiting })
    expect(outcome.status).toBe('awaiting-input')
    expect(outcome.waiting).toEqual([{ nodeId: 'node-b', reason: '缺证明材料' }])
    // c 是 b 的下游，未执行
    const cCheckpoint = outcome.checkpoints.find((checkpoint) => checkpoint.nodeId === 'node-c')
    expect(cCheckpoint).toBeUndefined()
  })

  test('Given 检查点 When 恢复 Then done+同 hash 跳过（不重做），failed 转回 pending', async () => {
    const nodes: RunGraphNode[] = [
      { id: 'n1', kind: 'parse', stageId: 'a', dependsOn: [], status: 'pending', attempts: 0, inputHash: 'h1' },
      { id: 'n2', kind: 'check', stageId: 'b', dependsOn: ['n1'], status: 'pending', attempts: 1, lastError: '上次失败' },
    ]
    const restored = restoreCheckpoints(nodes, [
      { nodeId: 'n1', inputHash: 'h1', status: 'done', attempts: 1 },
      { nodeId: 'n2', inputHash: 'h1', status: 'failed', attempts: 1, lastError: '上次失败' },
    ])
    expect(restored.skipped).toEqual(['n1'])
    expect(restored.nodes[0]!.status).toBe('done')
    expect(restored.nodes[1]!.status).toBe('pending') // failed 可重试
  })

  test('Given 执行中取消 When 执行 Then 未启动节点不执行且 run=cancelled（K18）', async () => {
    let calls = 0
    const counting: NodeExecutor = async (node, hash) => {
      calls += 1
      return ok(node, hash)
    }
    const outcome = await executeRunGraph(planRunGraph(template([
      { id: 'a', name: 'a', kind: 'auto-check', executorRole: 'system' },
      { id: 'b', name: 'b', kind: 'manual-review', executorRole: 'teacher' },
      { id: 'c', name: 'c', kind: 'summary', executorRole: 'organizer' },
    ])), { parse: counting, extract: counting, bind: counting, check: counting, compute: counting, summarize: counting }, { cancelled: () => calls >= 1 })
    expect(outcome.status).toBe('cancelled')
    expect(outcome.events.some((event) => event.kind === 'run-cancelled')).toBeTrue()
    expect(outcome.checkpoints.length).toBeLessThan(3) // 未全部执行
    expect(outcome.events.some((event) => event.kind === 'run-completed')).toBeFalse()
  })

  test('Given 节点抛错 When 执行 Then failed + attempts 递增 + lastError 落 checkpoint', async () => {
    const boom: NodeExecutor = async () => {
      throw new Error('模型超时')
    }
    const outcome = await executeRunGraph(planRunGraph(template([{ id: 'a', name: 'a', kind: 'auto-check', executorRole: 'system' }])),
      { parse: boom, extract: ok, bind: ok, check: ok, compute: ok, summarize: ok })
    expect(outcome.status).toBe('failed')
    expect(outcome.checkpoints[0]!.attempts).toBe(1)
    expect(outcome.checkpoints[0]!.lastError).toContain('模型超时')
  })
})

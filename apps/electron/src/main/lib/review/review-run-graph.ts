/**
 * 审核运行图执行器（M3，设计 03 §6 自动运行图 + §11.1 M3）
 *
 * - 计划：从模板阶段生成节点图（parse→extract→bind→check→compute→summarize，按依赖串联）
 * - 检查点：节点完成落 checkpoint（inputHash + status）；续跑时 done 且 hash 一致 → 跳过不重做（A11/A18）
 * - 暂停：节点声明 waiting-input → 该分支暂停，其他分支继续（避免整跑卡死）；run 进入 awaiting-input
 * - 取消：取消后不再启动新节点；进行中节点完成后 run=cancelled，禁止后续决定/写回（A18/K18）
 * - 事件：节点级事件流（订阅者驱动 UI 阶段进度），不替代持久化
 */

import type { CheckpointRecord, RunV2Status, TemplateVersion, WorkflowStageSpec } from '@profer/shared'

export type NodeKind = 'parse' | 'extract' | 'bind' | 'check' | 'compute' | 'summarize'

export interface RunGraphNode {
  id: string
  kind: NodeKind
  stageId: string
  dependsOn: string[]
  status: CheckpointRecord['status']
  inputHash?: string
  attempts: number
  lastError?: string
}

export type RunEventKind = 'node-started' | 'node-completed' | 'node-failed' | 'node-waiting' | 'node-skipped' | 'run-cancelled' | 'run-completed'

export interface RunEvent {
  kind: RunEventKind
  nodeId?: string
  at: string
  detail?: string
}

/** 节点执行体：返回 done 或 waiting（业务等待，如缺材料/待确认） */
export type NodeExecutor = (node: RunGraphNode, inputHash: string) => Promise<{ status: 'done'; inputHash: string } | { status: 'waiting-input'; reason: string }>

/** 由模板阶段生成节点图（同一 stage.kind → 对应节点 kind；依赖线性串联） */
export function planRunGraph(template: TemplateVersion): RunGraphNode[] {
  const kindByStage: Record<WorkflowStageSpec['kind'], NodeKind> = {
    'auto-check': 'parse',
    'manual-review': 'check',
    'independent-rating': 'check',
    'supplement-wait': 'extract',
    summary: 'compute',
    finalize: 'summarize',
    handoff: 'summarize',
  }
  const nodes: RunGraphNode[] = []
  let previous: string | null = null
  for (const stage of template.stages) {
    const id = `node-${stage.id}`
    nodes.push({
      id,
      kind: kindByStage[stage.kind],
      stageId: stage.id,
      dependsOn: previous ? [previous] : [],
      status: 'pending',
      attempts: 0,
    })
    previous = id
  }
  return nodes
}

/** 恢复检查点：done 且 hash 一致 → 跳过（不重做已完成检查） */
export function restoreCheckpoints(
  nodes: RunGraphNode[],
  checkpoints: CheckpointRecord[],
): { nodes: RunGraphNode[]; skipped: string[] } {
  const checkpointById = new Map(checkpoints.map((checkpoint) => [checkpoint.nodeId, checkpoint]))
  const skipped: string[] = []
  const restored = nodes.map((node) => {
    const checkpoint = checkpointById.get(node.id)
    if (checkpoint && checkpoint.status === 'done' && node.inputHash !== undefined && node.inputHash === checkpoint.inputHash) {
      skipped.push(node.id)
      return { ...node, status: 'done' as const, inputHash: checkpoint.inputHash }
    }
    if (checkpoint && checkpoint.status === 'failed') {
      return { ...node, status: 'pending' as const, attempts: checkpoint.attempts, lastError: checkpoint.lastError }
    }
    return node
  })
  return { nodes: restored, skipped }
}

export interface RunOutcome {
  status: RunV2Status
  checkpoints: CheckpointRecord[]
  events: RunEvent[]
  /** waiting-input 的节点与原因（供 UI 待办） */
  waiting: Array<{ nodeId: string; reason: string }>
}

/**
 * 执行运行图：
 * - 逐节点（按依赖就绪顺序）；done 检查点跳过并发 node-skipped 事件
 * - executor 返回 waiting-input → checkpoint waiting-input，run=awaiting-input，跳过其下游
 * - 取消：cancelled=true 时不启动新节点（已完成的保留），run=cancelled
 * - executor 抛错 → attempts+1 落 failed checkpoint，run=failed（可重试：重跑时 failed 转回 pending）
 */
export async function executeRunGraph(
  inputNodes: RunGraphNode[],
  executors: Record<NodeKind, NodeExecutor>,
  options: { cancelled?: () => boolean; now?: () => string } = {},
): Promise<RunOutcome> {
  const now = options.now ?? (() => new Date().toISOString())
  const nodes = inputNodes.map((node) => ({ ...node }))
  const checkpoints: CheckpointRecord[] = []
  const events: RunEvent[] = []
  const waiting: Array<{ nodeId: string; reason: string }> = []
  const emit = (kind: RunEventKind, nodeId?: string, detail?: string): void => {
    events.push({ kind, nodeId, at: now(), detail })
  }

  const byId = new Map(nodes.map((node) => [node.id, node]))
  let anyWaiting = false
  let anyFailed = false

  // 依赖就绪循环：每轮执行所有依赖满足且 pending 的节点（waiting 节点的下游本轮跳过）
  let progress = true
  while (progress) {
    progress = false
    for (const node of nodes) {
      if (node.status !== 'pending') continue
      if (options.cancelled?.()) break
      const depsReady = node.dependsOn.every((depId) => byId.get(depId)?.status === 'done')
      if (!depsReady) continue
      progress = true

      emit('node-started', node.id)
      node.status = 'running'
      try {
        const result = await executors[node.kind](node, node.inputHash ?? 'no-input')
        if (result.status === 'done') {
          node.status = 'done'
          node.inputHash = result.inputHash
          checkpoints.push({ nodeId: node.id, inputHash: result.inputHash, status: 'done', attempts: node.attempts + 1 })
          emit('node-completed', node.id)
        } else {
          node.status = 'waiting-input'
          node.lastError = result.reason
          checkpoints.push({ nodeId: node.id, inputHash: node.inputHash ?? 'no-input', status: 'waiting-input', attempts: node.attempts + 1, lastError: result.reason })
          waiting.push({ nodeId: node.id, reason: result.reason })
          anyWaiting = true
          emit('node-waiting', node.id, result.reason)
        }
      } catch (error) {
        node.attempts += 1
        node.status = 'failed'
        node.lastError = error instanceof Error ? error.message : String(error)
        checkpoints.push({ nodeId: node.id, inputHash: node.inputHash ?? 'no-input', status: 'failed', attempts: node.attempts, lastError: node.lastError })
        anyFailed = true
        emit('node-failed', node.id, node.lastError)
      }
    }
  }

  // 取消语义：cancelled 时未启动节点保持 pending，run=cancelled；不产生完成事件（K18）
  const cancelled = options.cancelled?.() ?? false
  if (cancelled) {
    emit('run-cancelled', undefined, '取消后未启动新节点；进行中节点结果保留')
    return { status: 'cancelled', checkpoints, events, waiting }
  }
  if (anyFailed) {
    return { status: 'failed', checkpoints, events, waiting }
  }
  if (anyWaiting) {
    return { status: 'awaiting-input', checkpoints, events, waiting }
  }
  const allDone = nodes.every((node) => node.status === 'done' || node.status === 'waiting-input')
  emit('run-completed', undefined, allDone ? '全部节点完成' : '无可执行节点')
  return { status: 'completed', checkpoints, events, waiting }
}

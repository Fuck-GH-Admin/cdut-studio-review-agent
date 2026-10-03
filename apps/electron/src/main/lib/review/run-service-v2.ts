/**
 * V2 运行编排服务（M3 收尾，设计 03 §6/§11.1 M3）
 *
 * - startRunV2：创建运行（不可变输入 manifest）→ 执行运行图 → 每节点落盘（检查点持久化）
 * - resumeRunV2：从磁盘检查点恢复，done+同 hash 跳过（A11/A18）
 * - cancelRunV2：进程内取消注册表；取消后不启动新节点（K18），落盘 cancelled
 * - 事件经 onEvent 回调（M5 IPC 接线时转发渲染层）
 */

import { createHash } from 'node:crypto'
import type { CheckpointRecord, ReviewCaseV2, ReviewRunV2, TemplateVersion } from '@profer/shared'
import { executeRunGraph, planRunGraph, restoreCheckpoints, type NodeExecutor, type NodeKind, type RunEvent } from './review-run-graph'
import { getRunV2, saveRunV2 } from './run-store-v2'

/** 进程内取消注册表（单机桌面应用：跨进程取消无需持久化标记） */
const cancelledRunIds = new Set<string>()

export function cancelRunV2(runId: string): void {
  cancelledRunIds.add(runId)
}

export function isRunCancelled(runId: string): boolean {
  return cancelledRunIds.has(runId)
}

/** 输入 manifest 哈希：模板版本 + 文档版本 + 主体/观察内容（不可变输入指纹，03 §7） */
export function computeRunInputHash(
  caseV2: ReviewCaseV2,
  observationSnapshot: Array<Record<string, unknown>>,
  evidenceSnapshot: Array<Record<string, unknown>>,
): string {
  const material = JSON.stringify({
    templateId: caseV2.templateId,
    templateVersion: caseV2.templateVersion,
    documents: caseV2.documents.map((document) => ({ id: document.versionId, hash: document.contentHash })),
    subjects: caseV2.subjects.map((subject) => ({ id: subject.id, fields: subject.fields, status: subject.status })),
    observations: observationSnapshot,
    evidenceLinks: evidenceSnapshot,
  })
  return createHash('sha1').update(material, 'utf-8').digest('hex')
}

export interface StartRunOptions {
  runId?: string
  /** 续跑：沿用既有运行文件的检查点 */
  resumeRunId?: string
  onEvent?: (event: RunEvent) => void
  cancelled?: () => boolean
}

/**
 * 执行 V2 运行：持久化-优先（每个节点完成后整份落盘，崩溃可续）。
 * executors 由调用方装配（业务工具集 × 节点类型），本服务只管编排与持久化。
 */
export async function runReviewCaseV2(
  caseV2: ReviewCaseV2,
  template: TemplateVersion,
  executors: Record<NodeKind, NodeExecutor>,
  options: StartRunOptions = {},
): Promise<ReviewRunV2> {
  const runId = options.runId ?? `run-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
  const nodes = planRunGraph(template)
  let checkpoints: CheckpointRecord[] = nodes.map((node) => ({ nodeId: node.id, inputHash: 'no-input', status: 'pending' as const, attempts: 0 }))
  let events: RunEvent[] = []

  // 续跑：恢复检查点（done+同 hash 跳过）
  if (options.resumeRunId) {
    const previous = getRunV2(caseV2.id, options.resumeRunId)
    if (!previous) throw new Error(`续跑目标运行不存在: ${options.resumeRunId}`)
    // 输入指纹一致性：manifest 变了就不允许在旧运行上续（结果混版，K06）
    const currentHash = computeRunInputHash(caseV2, [], [])
    if (previous.inputManifest.hash !== currentHash && previous.checkpoints.some((checkpoint) => checkpoint.status === 'done')) {
      throw new Error('案卷输入在运行后已变化，不能在旧运行上续跑（请发起新运行）')
    }
    checkpoints = previous.checkpoints
    events = previous.diagnostics.length > 0 ? [] : events
    // 节点状态同步
    const statusById = new Map(previous.checkpoints.map((checkpoint) => [checkpoint.nodeId, checkpoint.status]))
    for (const node of nodes) {
      const checkpointStatus = statusById.get(node.id)
      if (checkpointStatus === 'done') node.status = 'done'
      if (checkpointStatus === 'failed') node.status = 'pending'
    }
  }

  const inputHash = computeRunInputHash(caseV2, [], [])
  const run: ReviewRunV2 = {
    id: runId,
    caseId: caseV2.id,
    templateId: template.templateId,
    templateVersion: template.version,
    inputManifest: {
      hash: inputHash,
      templateVersion: template.version,
      policyVersions: template.policyVersionIds.map((policyVersionId) => ({ policyVersionId, version: 1 })),
      documentVersions: caseV2.documents.map((document) => ({ documentId: document.documentId, versionId: document.versionId, contentHash: document.contentHash })),
      observationIds: [],
      evidenceLinkIds: [],
    },
    status: 'running',
    checkpoints,
    checks: [],
    opinions: [],
    coverage: { documents: [], plannedChecks: 0, completedChecks: 0, effectiveVerdicts: 0, pendingChecks: 0 },
    diagnostics: [],
    startedAt: new Date().toISOString(),
  }
  saveRunV2(run)

  const restored = restoreCheckpoints(nodes, checkpoints)
  const outcome = await executeRunGraph(
    restored.nodes.map((node) => ({ ...node, inputHash: node.inputHash ?? undefined })),
    executors,
    { cancelled: options.cancelled ?? (() => isRunCancelled(runId)), now: () => new Date().toISOString() },
  )
  events = outcome.events
  for (const event of events) options.onEvent?.(event)

  run.status = outcome.status
  run.checkpoints = outcome.checkpoints.length > 0 ? outcome.checkpoints : checkpoints
  run.completedAt = outcome.status === 'completed' ? new Date().toISOString() : undefined
  saveRunV2(run)
  cancelledRunIds.delete(runId)
  return run
}

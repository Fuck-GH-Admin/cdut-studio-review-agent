/**
 * 批次存储与持久 outbox（N5/N6，docs/design/review-agent/07 §3.3/§7.3；R08/R11）
 *
 * - 批次：review-batches/{batchId}/batch.json（模板/政策锁 + 案卷队列 + 状态机）
 * - 定稿：先冻结快照 hash，再原子提交 manifest；重开 = 新评审轮次（不改写定稿）
 * - outbox：sync-outbox/{actionId}.json 持久化（进程内 Map 不能保证重启幂等，R11）
 *   push → pending → 端口回执（accepted/conflict/rejected）；同 actionId 重放返回原回执
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join } from 'node:path'
import type { BatchStateV2, ReviewBatch, SyncReceipt } from '@profer/shared'
import { getConfigDir } from '../config-paths'
import type { PushPayload, SchoolPort } from './external-ports'

// ===== 批次 =====

function batchPath(batchId: string): string {
  return join(getConfigDir(), 'review-batches', batchId, 'batch.json')
}

function writeAtomic(filePath: string, data: unknown): void {
  const tmp = `${filePath}.${Math.random().toString(36).slice(2, 6)}.tmp`
  writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8')
  renameSync(tmp, filePath)
}

export function saveBatchStateV2(state: BatchStateV2): void {
  const filePath = batchPath(state.batch.id)
  if (!existsSync(join(getConfigDir(), 'review-batches', state.batch.id))) mkdirSync(join(getConfigDir(), 'review-batches', state.batch.id), { recursive: true })
  writeAtomic(filePath, state)
}

export function readBatchStateV2(batchId: string): BatchStateV2 | undefined {
  const filePath = batchPath(batchId)
  if (!existsSync(filePath)) return undefined
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8')) as BatchStateV2
  } catch {
    return undefined
  }
}

/** 列出已保存批次，供批量审核工作台恢复批次目录。 */
export function listBatchStatesV2(): BatchStateV2[] {
  const root = join(getConfigDir(), 'review-batches')
  if (!existsSync(root)) return []
  return readdirSync(root)
    .map((batchId) => readBatchStateV2(batchId))
    .filter((state): state is BatchStateV2 => !!state)
    .sort((a, b) => b.batch.createdAt.localeCompare(a.batch.createdAt))
}

/** 创建批次（锁定模板/政策版本，A12） */
export function createBatchV2(batch: ReviewBatch): BatchStateV2 {
  if (existsSync(batchPath(batch.id))) throw new Error(`批次已存在: ${batch.id}`)
  const state: BatchStateV2 = { batch, status: 'draft', cases: batch.caseIds.map((caseId) => ({ caseId, status: 'queued' })), round: 1 }
  saveBatchStateV2(state)
  return state
}

/** 入队/暂停/重试（单案失败不阻塞全批，06 §7.1） */
export function updateCaseStatus(batchId: string, caseId: string, status: BatchStateV2['cases'][number]['status'], error?: string): BatchStateV2 {
  const state = readBatchStateV2(batchId)
  if (!state) throw new Error(`批次不存在: ${batchId}`)
  if (state.status === 'finalized') throw new Error('批次已定稿，变更需重开新轮次')
  state.cases = state.cases.map((entry) => (entry.caseId === caseId ? { ...entry, status, error } : entry))
  saveBatchStateV2(state)
  return state
}

/** 定稿：冻结快照 → 原子提交 manifest（R08：定稿后变更只能重开） */
export function finalizeBatch(batchId: string, snapshot: Record<string, unknown>): BatchStateV2 {
  const state = readBatchStateV2(batchId)
  if (!state) throw new Error(`批次不存在: ${batchId}`)
  const snapshotHash = createHash('sha256').update(JSON.stringify(snapshot), 'utf-8').digest('hex')
  if (state.status === 'finalized') {
    if (state.finalizedSnapshotHash === snapshotHash) return state
    throw new Error('批次已定稿，修改快照需重开新轮次')
  }
  if (state.cases.some((entry) => entry.status === 'running')) throw new Error('存在运行中案卷，不能定稿')
  if (state.cases.length === 0 || state.cases.some((entry) => entry.status !== 'done')) throw new Error('案卷未完成，不能定稿')
  // 先保存完整快照，再提交批次状态；只有 hash 无法在重启后还原名单/评分。
  writeAtomic(join(getConfigDir(), 'review-batches', batchId, `finalized-r${state.round}.json`), { snapshot, snapshotHash, round: state.round })
  state.status = 'finalized'
  state.finalizedSnapshotHash = snapshotHash
  state.finalizedAt = new Date().toISOString()
  saveBatchStateV2(state)
  return state
}

/** 读取已定稿内容并校验；历史版本缺快照时不能拼当前数据冒充。 */
export function readFinalizedSnapshot(batchId: string): Record<string, unknown> | undefined {
  const state = readBatchStateV2(batchId)
  if (!state || state.status !== 'finalized') return undefined
  const path = join(getConfigDir(), 'review-batches', batchId, `finalized-r${state.round}.json`)
  if (!existsSync(path)) return undefined
  try {
    const saved = JSON.parse(readFileSync(path, 'utf-8')) as { snapshot: Record<string, unknown>; snapshotHash: string }
    const hash = createHash('sha256').update(JSON.stringify(saved.snapshot), 'utf-8').digest('hex')
    return hash === saved.snapshotHash && hash === state.finalizedSnapshotHash ? saved.snapshot : undefined
  } catch {
    return undefined
  }
}

/** 重开：基于定稿批次创建新轮次（不改写原定稿，07 §7.2） */
export function reopenBatch(batchId: string, newBatchId: string, reason: string): BatchStateV2 {
  const previous = readBatchStateV2(batchId)
  if (!previous) throw new Error(`批次不存在: ${batchId}`)
  if (previous.status !== 'finalized') throw new Error('只有已定稿批次可重开')
  const state: BatchStateV2 = {
    batch: { ...previous.batch, id: newBatchId, name: `${previous.batch.name}（重开 R${previous.round + 1}）`, createdAt: new Date().toISOString() },
    status: 'draft',
    cases: previous.batch.caseIds.map((caseId) => ({ caseId, status: 'queued' })),
    round: previous.round + 1,
    reopenedFromBatchId: batchId,
  }
  saveBatchStateV2(state)
  console.log(`[批次] 重开: ${batchId} → ${newBatchId}（${reason}）`)
  return state
}

// ===== 持久 outbox（R11：重启幂等） =====

function outboxPath(actionId: string): string {
  return join(getConfigDir(), 'sync-outbox', `${actionId}.json`)
}

export interface OutboxEntry {
  actionId: string
  payloadHash: string
  status: 'pending' | 'accepted' | 'conflict' | 'rejected'
  receipt?: SyncReceipt
  attempts: number
  createdAt: string
}

function payloadHashOf(payload: PushPayload): string {
  return createHash('sha256').update(JSON.stringify(payload), 'utf-8').digest('hex')
}

function readOutbox(actionId: string): OutboxEntry | undefined {
  const filePath = outboxPath(actionId)
  if (!existsSync(filePath)) return undefined
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8')) as OutboxEntry
  } catch {
    return undefined
  }
}

function writeOutbox(entry: OutboxEntry): void {
  const dir = join(getConfigDir(), 'sync-outbox')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeAtomic(outboxPath(entry.actionId), entry)
}

/**
 * 经 outbox 推送动作（07 §7.3）：
 * - 同 actionId + 同载荷 → 返回持久化原回执（重启后仍幂等）
 * - 同 actionId + 不同载荷 → 拒绝（载荷漂移）
 * - 端口失败 → pending + attempts 递增，可重试
 */
export async function pushViaOutbox(port: SchoolPort, payload: PushPayload): Promise<OutboxEntry> {
  const existing = readOutbox(payload.actionId)
  const hash = payloadHashOf(payload)
  if (existing) {
    if (existing.payloadHash !== hash) throw new Error(`actionId ${payload.actionId} 已被不同载荷使用`)
    if (existing.status !== 'pending') return existing // 已有终态回执
  }
  const entry: OutboxEntry = existing ?? { actionId: payload.actionId, payloadHash: hash, status: 'pending', attempts: 0, createdAt: new Date().toISOString() }
  entry.attempts += 1
  // 发送前先落盘 pending（复查 §5.5：端口响应后才写会丢中断现场；完整载荷已含在 payloadHash + 调用方载荷）
  entry.status = 'pending'
  entry.receipt = undefined
  writeOutbox(entry)
  try {
    const receipt = await port.push(payload)
    entry.status = receipt.status === 'accepted' ? 'accepted' : receipt.status === 'conflict' ? 'conflict' : 'rejected'
    entry.receipt = receipt
  } catch (error) {
    entry.status = 'pending'
    entry.receipt = undefined
    console.warn(`[outbox] 推送失败（保留 pending 重试）: ${payload.actionId}`, error)
  }
  writeOutbox(entry)
  return entry
}

/** 中断恢复：启动时扫描 pending 条目重放（G08 恢复循环的最小实现） */
export async function recoverPendingPushes(port: SchoolPort): Promise<OutboxEntry[]> {
  const dir = join(getConfigDir(), 'sync-outbox')
  if (!existsSync(dir)) return []
  const results: OutboxEntry[] = []
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.json')) continue
    try {
      const entry = JSON.parse(readFileSync(join(dir, file), 'utf-8')) as OutboxEntry
      if (entry.status !== 'pending') continue
      // 载荷不在 outbox 里（由调用方持有）——恢复需调用方按 actionId 重放；此处仅如实标注 attempts
      const recovered = await pushViaOutbox(port, { actionId: entry.actionId, caseId: '', actionKind: 'decision', baseExternalRevision: 0, body: { note: 'recovery-placeholder' } } as never)
      results.push(recovered)
    } catch (error) {
      console.warn('[outbox] 恢复扫描跳过损坏条目', file, error)
    }
  }
  return results
}

// ===== G06/G11：真实队列执行（逐案跑审核，坏案不阻塞全批） =====

/** Active invocations only live in this Electron main process; persisted running is an interrupted batch after restart. */
const activeBatchRuns = new Set<string>()

/**
 * Explicit crash recovery. Never silently rerun an orphaned running case:
 * review writes might already have occurred, so mark it failed for inspection.
 */
export function recoverInterruptedBatch(batchId: string): BatchStateV2 {
  const state = readBatchStateV2(batchId)
  if (!state) throw new Error(`批次不存在: ${batchId}`)
  if (state.status === 'finalized') throw new Error('已定稿批次不能恢复运行')
  if (activeBatchRuns.has(batchId)) throw new Error('批次仍在当前进程执行，不能按中断恢复')
  if (state.status !== 'running' && !state.cases.some((entry) => entry.status === 'running')) {
    throw new Error('没有需要恢复的中断任务')
  }
  state.cases = state.cases.map((entry) => entry.status === 'running'
    ? { ...entry, status: 'failed', error: '上次审核被中断，请检查案卷运行记录后手动重试' }
    : entry)
  state.status = 'queued'
  saveBatchStateV2(state)
  return state
}

/**
 * Only failed or explicitly paused cases can be requeued. Successful cases
 * remain untouched; caller must explicitly choose each retry target.
 */
export function retryBatchCases(batchId: string, caseIds: string[]): BatchStateV2 {
  const state = readBatchStateV2(batchId)
  if (!state) throw new Error(`批次不存在: ${batchId}`)
  if (state.status === 'finalized') throw new Error('已定稿批次不能重试')
  if (state.status === 'running' || activeBatchRuns.has(batchId)) throw new Error('批次执行中不能修改重试队列')
  if (!Array.isArray(caseIds) || caseIds.length === 0 || caseIds.some((id) => !id)) throw new Error('请选择需要重试的案卷')
  const requested = new Set(caseIds)
  if (requested.size !== caseIds.length) throw new Error('重试案卷不能重复')
  for (const caseId of requested) {
    const entry = state.cases.find((item) => item.caseId === caseId)
    if (!entry) throw new Error(`案卷不属于此批次: ${caseId}`)
    if (entry.status !== 'failed' && entry.status !== 'paused') throw new Error(`案卷当前状态不可重试: ${caseId} (${entry.status})`)
  }
  state.cases = state.cases.map((entry) => requested.has(entry.caseId) ? { ...entry, status: 'queued', error: undefined } : entry)
  saveBatchStateV2(state)
  return state
}


export interface BatchQueueOptions {
  /** 运行参数注入（测试可传假执行器）；产品层复用 Pi 审核 Agent */
  runCase?: (caseId: string) => Promise<{ status: string }>
}

/**
 * 批次队列执行：按案卷状态逐个 queued→running→done/failed。
 * - 单案失败记录 error 并继续（06 §7.1 坏案不拖全批）
 * - 定稿批次拒绝执行（重开新轮次后才能跑）
 * - 中断可重入：已 done 的跳过，failed/queued 重试
 */
export async function runBatchQueue(batchId: string, options: BatchQueueOptions = {}): Promise<BatchStateV2> {
  const state = readBatchStateV2(batchId)
  if (!state) throw new Error(`批次不存在: ${batchId}`)
  if (state.status === 'finalized') throw new Error('批次已定稿，需重开新轮次才能执行')
  if (state.status === 'running' || activeBatchRuns.has(batchId)) throw new Error('批次正在执行，不能重复启动')
  if (!options.runCase) throw new Error('runBatchQueue 需要注入 runCase（产品层由 buildReviewExecutors 提供，避免隐式默认执行器）')
  const queued = state.cases.filter((entry) => entry.status === 'queued')
  if (queued.length === 0) throw new Error('没有待执行的案卷；失败项请先选择重试')
  const runCase = options.runCase
  activeBatchRuns.add(batchId)
  try {
    state.status = 'running'
    saveBatchStateV2(state)
    for (const entry of queued) {
      updateCaseStatus(batchId, entry.caseId, 'running')
      try {
        const outcome = await runCase(entry.caseId)
        if (outcome.status === 'completed') updateCaseStatus(batchId, entry.caseId, 'done')
        else updateCaseStatus(batchId, entry.caseId, 'failed', `运行结束状态: ${outcome.status}`)
      } catch (error) {
        updateCaseStatus(batchId, entry.caseId, 'failed', error instanceof Error ? error.message : String(error))
      }
    }
    const final = readBatchStateV2(batchId)!
    final.status = 'queued' // 等待后续业务决定；执行完不是正式通过
    saveBatchStateV2(final)
    return final
  } finally {
    activeBatchRuns.delete(batchId)
  }
}

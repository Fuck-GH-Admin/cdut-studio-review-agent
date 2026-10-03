/**
 * 批次存储与持久 outbox（N5/N6，docs/design/review-agent/07 §3.3/§7.3；R08/R11）
 *
 * - 批次：review-batches/{batchId}/batch.json（模板/政策锁 + 案卷队列 + 状态机）
 * - 定稿：先冻结快照 hash，再原子提交 manifest；重开 = 新评审轮次（不改写定稿）
 * - outbox：sync-outbox/{actionId}.json 持久化（进程内 Map 不能保证重启幂等，R11）
 *   push → pending → 端口回执（accepted/conflict/rejected）；同 actionId 重放返回原回执
 */

import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
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
  if (state.cases.some((entry) => entry.status === 'running')) throw new Error('存在运行中案卷，不能定稿')
  const snapshotHash = createHash('sha256').update(JSON.stringify(snapshot), 'utf-8').digest('hex')
  state.status = 'finalized'
  state.finalizedSnapshotHash = snapshotHash
  state.finalizedAt = new Date().toISOString()
  saveBatchStateV2(state)
  return state
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

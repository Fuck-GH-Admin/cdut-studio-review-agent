/**
 * 外部系统端口（M5，设计 03 §8 端口合同 + C 类本地模拟验收）
 *
 * 同一合同两种实现（S 类真实联调待外部条件，不在本轮）：
 * - MockSchoolAdapter：进程内模拟校方（幂等动作 ID、外部版本推进、可制造冲突）
 * - LocalPackageAdapter：离线包往返（U 盘场景），复用 exportHandoffPackage/importHandoffPackage
 * 合同：动作幂等（actionId 重复回放返回同一回执）、期望外部版本不符 → conflict（C02）
 */

import type { SyncReceipt } from '@profer/shared'
import { exportHandoffPackage, importHandoffPackage } from './report-service-v2'

/** 推送载荷：一次业务动作（决定/补件/名次）的离线可序列化快照 */
export interface PushPayload {
  caseId: string
  actionId: string
  actionKind: 'decision' | 'supplement' | 'roster' | 'rating-matrix'
  /** 推送方持有的外部版本；mock 校方版本更高 → conflict */
  baseExternalRevision: number
  body: Record<string, unknown>
}

/** 校方端口合同（Mock/Local/未来真实 SDK 共用） */
export interface SchoolPort {
  readonly kind: 'mock' | 'offline-package' | 'school'
  push(payload: PushPayload): Promise<SyncReceipt>
}

/** Mock 校方：内存状态（caseId → externalRevision），动作幂等 */
export class MockSchoolAdapter implements SchoolPort {
  readonly kind = 'mock' as const
  private revisions = new Map<string, number>()
  private receipts = new Map<string, SyncReceipt>()
  /** 测试注入口：把某案卷的外部版本拨到指定值（制造冲突） */
  seedRevision(caseId: string, revision: number): void {
    this.revisions.set(caseId, revision)
  }

  async push(payload: PushPayload): Promise<SyncReceipt> {
    // 幂等：同一 actionId 重放返回同一回执（不重复执行）
    const existing = this.receipts.get(payload.actionId)
    if (existing) return existing
    const current = this.revisions.get(payload.caseId) ?? 0
    if (payload.baseExternalRevision !== current) {
      const receipt: SyncReceipt = {
        id: `rcp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        actionId: payload.actionId,
        externalSystem: 'mock-school',
        caseId: payload.caseId,
        expectedExternalRevision: payload.baseExternalRevision,
        payloadHash: '',
        status: 'conflict',
        externalReceipt: { receivedAt: new Date().toISOString(), message: `外部版本已推进：当前 ${current}，推送方持有 ${payload.baseExternalRevision}` },
      }
      return receipt
    }
    this.revisions.set(payload.caseId, current + 1)
    const receipt: SyncReceipt = {
      id: `rcp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      actionId: payload.actionId,
      externalSystem: 'mock-school',
      caseId: payload.caseId,
      expectedExternalRevision: current,
      payloadHash: String(payload.body.hash ?? ''),
      status: 'accepted',
      externalReceipt: { receivedAt: new Date().toISOString(), externalId: `ext-${payload.caseId}-${current + 1}` },
    }
    this.receipts.set(payload.actionId, receipt)
    return receipt
  }
}

/** 离线包适配器：推送=导出带哈希的包；确认=导入验哈希+版本（U 盘往返，C01） */
export class LocalPackageAdapter implements SchoolPort {
  readonly kind = 'offline-package' as const
  constructor(private readonly externalRevision: (caseId: string) => number) {}

  async push(payload: PushPayload): Promise<SyncReceipt> {
    const pkg = exportHandoffPackage({ ...payload, externalRevision: this.externalRevision(payload.caseId) })
    // 本地包场景：包内携带校方当前版；导入校验对照推送方持有版（不符=推送方信息过期，C02）
    const outcome = importHandoffPackage(pkg, payload.baseExternalRevision)
    return {
      id: `rcp-${pkg.packageId}`,
      actionId: payload.actionId,
      externalSystem: 'offline-package',
      caseId: payload.caseId,
      expectedExternalRevision: payload.baseExternalRevision,
      payloadHash: pkg.contentHash,
      status: outcome.ok ? 'accepted' : outcome.code === 'CONFLICT' ? 'conflict' : 'rejected',
      externalReceipt: outcome.ok
        ? { receivedAt: new Date().toISOString(), externalId: pkg.packageId }
        : { receivedAt: new Date().toISOString(), message: outcome.message },
    }
  }
}

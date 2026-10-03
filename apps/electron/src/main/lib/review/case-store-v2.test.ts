/**
 * N1c 聚合事务单测（07 §3.3 / R01：幂等回执、冲突、一次递增、重启保留）
 * 隔离：PROFER_CONFIG_DIR 唯一临时目录。
 */
import { afterAll, describe, expect, test } from 'bun:test'
import { rmSync } from 'node:fs'
import { join } from 'node:path'
import type { ReviewCaseV2 } from '@profer/shared'
import { CommandValidationError, createAggregate, readAggregate, submitCommand } from './case-store-v2'

const CONFIG_DIR = join(import.meta.dir, '../../../../../../work/tmp', `profer-test-agg-${Date.now()}`)
process.env.PROFER_CONFIG_DIR = CONFIG_DIR
afterAll(() => rmSync(CONFIG_DIR, { recursive: true, force: true }))

const caseV2: ReviewCaseV2 = {
  id: 'case-agg-1', templateId: 't', templateVersion: 1, title: '聚合测试', objectType: 'person',
  caseFields: {}, subjects: [], documents: [], stage: 'draft', revision: 0,
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
}
const actor = { actorId: 'u1', actorSource: 'local' as const, role: 'reviewer' as const }

async function setup(): Promise<void> {
  await createAggregate(caseV2.id, caseV2)
}

const bumpStage = (aggregate: import('./case-store-v2').CaseAggregateV2): void => {
  aggregate.caseV2.stage = 'submitted'
}

describe('submitCommand（07 §3.3 事务）', () => {
  test('Given 正常命令 When 提交 Then revision+1 一次且回执同事务落盘', async () => {
    await setup()
    const outcome = await submitCommand<{ note: string }, undefined>(caseV2.id,
      { requestId: 'r1', actor, expectedRevision: 0, type: 'UpdateFields', payload: { note: 'x' } },
      (_aggregate, payload) => ({ summary: payload.note, mutate: bumpStage }))
    expect(outcome.ok).toBeTrue()
    if (outcome.ok) {
      expect(outcome.aggregate.caseV2.revision).toBe(1)
      expect(outcome.aggregate.receiptLog).toHaveLength(1)
      const persisted = readAggregate(caseV2.id)!
      expect(persisted.caseV2.revision).toBe(1)
      expect(persisted.receiptLog).toHaveLength(1) // 回执与业务同事务
    }
  })

  test('Given 同 requestId 同载荷重试 When 提交 Then 返回原回执不重复执行（R01）', async () => {
    const command = { requestId: 'r-idem', actor, expectedRevision: 1, type: 'UpdateFields', payload: { note: 'same' } }
    const first = await submitCommand<{ note: string }, undefined>(caseV2.id, command, (_a, p) => ({ summary: p.note, mutate: bumpStage }))
    const second = await submitCommand<{ note: string }, undefined>(caseV2.id, command, (_a, p) => ({ summary: p.note, mutate: bumpStage }))
    expect(first.ok && second.ok).toBeTrue()
    if (first.ok && second.ok) {
      expect(second.receipt.revision).toBe(first.receipt.revision) // 原回执
      expect(second.aggregate.caseV2.revision).toBe(first.aggregate.caseV2.revision) // 未再递增
    }
  })

  test('Given 同 requestId 不同载荷 When 提交 Then REQUEST_ID_COLLISION', async () => {
    const first = await submitCommand<{ note: string }, undefined>(caseV2.id, { requestId: 'r-coll', actor, expectedRevision: readAggregate(caseV2.id)!.caseV2.revision, type: 'UpdateFields', payload: { note: 'a' } }, (_a, p) => ({ summary: p.note, mutate: bumpStage }))
    expect(first.ok).toBeTrue()
    const second = await submitCommand<{ note: string }, undefined>(caseV2.id, { requestId: 'r-coll', actor, expectedRevision: readAggregate(caseV2.id)!.caseV2.revision, type: 'UpdateFields', payload: { note: 'DIFFERENT' } }, (_a, p) => ({ summary: p.note, mutate: bumpStage }))
    expect(second.ok).toBeFalse()
    if (!second.ok) expect(second.code).toBe('REQUEST_ID_COLLISION')
  })

  test('Given 过期 expectedRevision When 提交 Then VERSION_CONFLICT 携当前版且不写数据', async () => {
    const current = readAggregate(caseV2.id)!.caseV2.revision
    const outcome = await submitCommand(caseV2.id, { requestId: 'r-stale', actor, expectedRevision: current - 1, type: 'UpdateFields', payload: { note: 'x' } }, () => ({ summary: 'x', mutate: bumpStage }))
    expect(outcome.ok).toBeFalse()
    if (!outcome.ok) {
      expect(outcome.code).toBe('VERSION_CONFLICT')
      expect(outcome.currentRevision).toBe(current)
    }
    expect(readAggregate(caseV2.id)!.caseV2.revision).toBe(current) // 未写
  })

  test('Given handler 校验失败 When 提交 Then 拒绝且无部分写入', async () => {
    const current = readAggregate(caseV2.id)!.caseV2.revision
    const outcome = await submitCommand(caseV2.id, { requestId: 'r-fail', actor, expectedRevision: current, type: 'UpdateFields', payload: {} }, () => { throw new CommandValidationError('VALIDATION_FAILED', '字段不合法') })
    expect(outcome.ok).toBeFalse()
    if (!outcome.ok) expect(outcome.code).toBe('VALIDATION_FAILED')
    expect(readAggregate(caseV2.id)!.caseV2.revision).toBe(current)
  })
})

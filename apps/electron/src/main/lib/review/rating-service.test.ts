/**
 * G06/G11 单测：唯一票 / 缺评 / N-A 策略 / 最低人数
 */
import { afterAll, describe, expect, test } from 'bun:test'
import { rmSync } from 'node:fs'
import { join } from 'node:path'
import type { ReviewCaseV2, RubricSpec } from '@profer/shared'
import { emptyAggregate } from './case-store-v2'
import { aggregateRatings, castRating } from './rating-service'

const CONFIG_DIR = join(import.meta.dir, '../../../../../../work/tmp', `profer-test-rate-${Date.now()}`)
process.env.PROFER_CONFIG_DIR = CONFIG_DIR
afterAll(() => rmSync(CONFIG_DIR, { recursive: true, force: true }))

const rubric: RubricSpec = {
  dimensions: [
    { id: 'd1', name: '质量', min: 1, max: 5, weight: 3 },
    { id: 'd2', name: '合规', min: 1, max: 5, weight: 1 },
  ],
  totalPrecision: 2, missingStrategy: 'block', minEffectiveJudges: 2,
}
const rating = (actor: string, scores: Record<string, number | 'N/A'>) => ({ id: actor, caseId: 'c', stageId: 'rating', actor, scores, at: '', round: 1 })

describe('评分聚合（G06）', () => {
  test('Given 两位评委有效评分 When 聚合 Then 加权平均与有效人数正确', () => {
    const result = aggregateRatings([rating('a', { d1: 4, d2: 2 }), rating('b', { d1: 5, d2: 4 })], rubric)
    expect(result.effectiveJudges).toBe(2)
    expect(result.average).toBe(4.13) // (4*3+2)/4=3.5 与 (5*3+4)/4=4.75 → 平均 4.125 → 两位小数 4.13
  })

  test('Given N/A（block 策略）When 聚合 Then 阻断并给原因', () => {
    const result = aggregateRatings([rating('a', { d1: 4, d2: 'N/A' }), rating('b', { d1: 5, d2: 4 })], rubric)
    expect(result.blocked.join()).toContain('N/A')
    expect(result.effectiveJudges).toBe(1)
  })

  test('Given N/A（exclude-renormalize 策略）When 聚合 Then 剔除维度按剩余权重归一', () => {
    const renorm: RubricSpec = { ...rubric, naStrategy: 'exclude-renormalize', minEffectiveJudges: 1 }
    const result = aggregateRatings([rating('a', { d1: 4, d2: 'N/A' })], renorm)
    expect(result.perJudge[0]!.total).toBe(4) // 只剩 d1，归一后 4
    expect(result.blocked).toHaveLength(0)
  })

  test('Given 缺评 When 聚合 Then 阻断（缺维度=缺评，不冒充完成）', () => {
    const result = aggregateRatings([rating('a', { d1: 4 })], rubric)
    expect(result.blocked.join()).toContain('缺评')
    expect(result.average).toBeNull()
  })

  test('Given 只有一人 When 聚合 Then 低于最低人数阻断', () => {
    const result = aggregateRatings([rating('a', { d1: 4, d2: 2 })], rubric)
    expect(result.blocked.join()).toContain('最低人数')
  })

  test('Given 同人重复票 When 聚合 Then 唯一票阻断', () => {
    const result = aggregateRatings([rating('a', { d1: 4, d2: 2 }), rating('a', { d1: 5, d2: 3 })], { ...rubric, minEffectiveJudges: 1 })
    expect(result.blocked.join()).toContain('重复票')
  })
})

describe('提交评分事务（G06）', () => {
  test('Given 同评委重复提交 When castRating Then INVALID_TRANSITION（事务内查重）', async () => {
    const caseV2: ReviewCaseV2 = { id: 'case-rate-1', templateId: 't', templateVersion: 1, title: '评分测试', objectType: 'person', caseFields: {}, subjects: [], documents: [], stage: 'reviewing', revision: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    await import('./case-store-v2').then((mod) => mod.createAggregate('case-rate-1', caseV2))
    const actor = { actorId: 'judge-1', actorSource: 'local' as const, role: 'judge' as const }
    const first = await castRating('case-rate-1', { requestId: 'r1', actor, expectedRevision: 0, payload: { stageId: 'rating', scores: { d1: 4, d2: 3 } } })
    expect(first).toHaveProperty('ok')
    const second = await castRating('case-rate-1', { requestId: 'r2', actor, expectedRevision: 1, payload: { stageId: 'rating', scores: { d1: 5, d2: 2 } } })
    expect((second as { ok: boolean }).ok).toBeFalse()
    if (!(second as { ok: boolean }).ok) expect((second as { code: string }).code).toBe('INVALID_TRANSITION')
  })
})

describe('评分轮次隔离（复查 §5.4）', () => {
  test('Given R1 与 R2 的评分 When 按 R2 汇总 Then 只算 R2', () => {
    const r1 = rating('j1', { d1: 1, d2: 1 }); const r2 = rating('j2', { d1: 5, d2: 5 })
    const r1e = { ...r1, round: 1 }; const r2e = { ...r2, round: 2 }
    const result = aggregateRatings([r1e, r2e], { ...rubric, minEffectiveJudges: 1 }, 2)
    expect(result.effectiveJudges).toBe(1)
    expect(result.average).toBe(5)
  })

  test('Given 同人不同轮次 When castRating Then 新轮次可提交', async () => {
    const actor = { actorId: 'judge-9', actorSource: 'local' as const, role: 'judge' as const }
    const r1 = await castRating('case-rate-1', { requestId: 'rr1', actor, expectedRevision: 1, payload: { stageId: 'rating', scores: { d1: 3, d2: 3 }, round: 1 } })
    expect((r1 as { ok: boolean }).ok).toBeTrue()
    const again = await castRating('case-rate-1', { requestId: 'rr2', actor, expectedRevision: 2, payload: { stageId: 'rating', scores: { d1: 4, d2: 4 }, round: 2 } })
    expect((again as { ok: boolean }).ok).toBeTrue() // 跨轮次合法新票
  })
})

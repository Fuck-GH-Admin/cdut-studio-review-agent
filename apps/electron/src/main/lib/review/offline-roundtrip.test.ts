/**
 * N6 单测（U12/R12：角色投影不泄漏、独立副本往返、重复包去重）
 */
import { afterAll, describe, expect, test } from 'bun:test'
import { rmSync } from 'node:fs'
import { join } from 'node:path'
import type { ReviewCaseV2 } from '@profer/shared'
import { emptyAggregate } from './case-store-v2'
import type { Actor } from '@profer/shared'
const localActor: Actor = { actorId: 't', actorSource: 'local', role: 'reviewer' }
import { anonymizeName, buildPublicReport, exportRoundTripPackage, importRoundTripPackage, projectForRole } from './offline-roundtrip'

const CONFIG_DIR = join(import.meta.dir, '../../../../../../work/tmp', `profer-test-rt-${Date.now()}`)
process.env.PROFER_CONFIG_DIR = CONFIG_DIR
afterAll(() => rmSync(CONFIG_DIR, { recursive: true, force: true }))

const caseV2: ReviewCaseV2 = {
  id: 'case-rt-1', templateId: 't', templateVersion: 1, title: '往返测试', objectType: 'person',
  caseFields: { studentName: { kind: 'text', value: '张三' }, internalMemo: { kind: 'text', value: '内部备注' } },
  subjects: [{ id: 's1', type: 'item' as const, title: '省赛一等奖', fields: { declaredScore: { kind: 'number', value: 8 }, internalFlag: { kind: 'text', value: '内部' } }, sourceRefs: [], correction: 'user-confirmed', status: 'confirmed' }],
  documents: [], stage: 'reviewing', revision: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
}
const aggregate = { ...emptyAggregate(caseV2), dispositions: [{ findingKey: 'f1', disposition: 'waived', actor: 'judge-9', reason: '内部豁免理由', at: new Date().toISOString() }] }
const visibility = { studentName: 'public', internalMemo: 'internal', declaredScore: 'public', internalFlag: 'internal' } as Record<string, 'public' | 'internal'>

describe('角色投影（R12）', () => {
  test('Given student 视角 When 投影 Then 内部字段与内部意见不出现（未知默认 internal）', () => {
    const projection = projectForRole(aggregate, 'student', visibility)
    expect(projection.fields.studentName).toBe('张三')
    expect(projection.fields.internalMemo).toBeUndefined()
    expect(projection.subjects[0]!.fields.internalFlag).toBeUndefined()
    expect(projection.internalNotes).toBeUndefined()
  })

  test('Given 未声明可见性的新字段 When student 投影 Then 默认 internal（不泄漏）', () => {
    const withNew = { ...aggregate, caseV2: { ...caseV2, caseFields: { ...caseV2.caseFields, ghostNewField: { kind: 'text' as const, value: 'x' } } } }
    const projection = projectForRole(withNew, 'student', visibility)
    expect(projection.fields.ghostNewField).toBeUndefined()
  })

  test('Given organizer 视角 When 投影 Then 内部意见可见', () => {
    const projection = projectForRole(aggregate, 'organizer', visibility)
    expect(projection.internalNotes).toContain('内部豁免理由')
  })
})

describe('独立副本往返（G07/G08：事务应用 + 持久 outbox）', () => {
  test('Given 学生副本回复补件 When 导出→导入 Then 事务应用真实落盘；重复导入 duplicate（持久回执）', async () => {
    const { createAggregate, readAggregate, submitCommand } = await import('./case-store-v2')
    const caseV2b: ReviewCaseV2 = { ...caseV2, id: 'case-rt-sup' }
    await createAggregate('case-rt-sup', caseV2b)
    await submitCommand('case-rt-sup', { requestId: 'seed-sup', actor: localActor, expectedRevision: caseV2b.revision, type: 'SeedSup', payload: {} }, () => ({ summary: '种子补件', mutate: (draft) => { draft.supplements = [{ id: 'sup-1', caseId: 'case-rt-sup', originFindingKeys: [], requiredElements: ['等级'], reason: '缺', responsibleRole: 'student', status: 'open', responses: [], createdAt: new Date().toISOString() }] } }))
    const pkg = exportRoundTripPackage({ ...aggregate, caseV2: { ...caseV2, id: 'case-rt-sup' } }, 'student-reply', { actorId: 'student-1', actorSource: 'local' }, visibility, { note: '已补交证明', supplementId: 'sup-1', documentVersionIds: ['d9-v1'] })
    const first = await importRoundTripPackage(pkg)
    expect(first.status).toBe('accepted')
    const after = readAggregate('case-rt-sup')!
    expect(after.supplements[0]!.responses).toHaveLength(1) // G07：事务真实落盘，不冒充已应用
    expect(after.supplements[0]!.status).toBe('responded')
    const second = await importRoundTripPackage(pkg)
    expect(second.status).toBe('duplicate')
    expect(second.message).toContain('不重复计票')
    expect(readAggregate('case-rt-sup')!.supplements[0]!.responses).toHaveLength(1) // 不重复计
  })

  test('Given 缺少补件目标 When 导入 Then rejected（不冒充已应用）', async () => {
    const pkg = exportRoundTripPackage(aggregate, 'student-reply', { actorId: 'student-9', actorSource: 'local' }, visibility, { note: '无目标回复' })
    const outcome = await importRoundTripPackage(pkg)
    expect(outcome.status).toBe('rejected')
  })

  test('Given 包被篡改 When 导入 Then rejected（哈希校验）', async () => {
    const pkg = exportRoundTripPackage(aggregate, 'student-reply', { actorId: 's2', actorSource: 'local' }, visibility, { note: 'a' })
    const tampered = { ...pkg, payload: { ...pkg.payload, reply: { note: '被改' } } }
    const outcome = await importRoundTripPackage(tampered)
    expect(outcome.status).toBe('rejected')
  })
})

describe('公开报告投影（G09）', () => {
  const reportInput = {
    title: '张三',
    fields: { studentName: '张三' },
    decisions: [{ result: 'pass', reason: '符合规定', finality: 'final' }],
    supplements: [{ reason: '补等级证明', status: 'satisfied' }],
    internalNotes: ['内部：该生曾处分记录'],
  }

  test('Given student 视角 When 生成公开报告 Then 内部意见不出现', () => {
    const report = buildPublicReport(reportInput, 'student')
    expect(report).toContain('符合规定')
    expect(report).not.toContain('处分记录')
    expect(report).toContain('内部审核意见不在公开版本')
  })

  test('Given judge 视角 When 生成公开报告 Then 实名匿名化', () => {
    const report = buildPublicReport(reportInput, 'judge')
    expect(report).not.toContain('张三')
    expect(report).toMatch(/学员#[0-9a-f]{6}/)
  })

  test('Given 同名多次导出 When 匿名 Then 映射稳定', () => {
    expect(anonymizeName('张三')).toBe(anonymizeName('张三'))
  })
})

describe('投影共用策略（复查 §5.6）', () => {
  test('Given student 视角 When 投影 Then 决定 reason 不输出（内部细节不公开）', () => {
    const withReason = { ...aggregate, decisions: [{ id: 'd1', actor: localActor, scope: { kind: 'case', ids: [] }, stageId: 'final', result: 'reject', reason: '内部调查：该生曾有处分记录', basedOnRunId: 'r', basedOnRevision: 1, at: new Date().toISOString(), finality: 'final' }] } as typeof aggregate
    const projection = projectForRole(withReason, 'student', visibility)
    expect(projection.decisions[0]!.result).toBe('reject')
    expect(projection.decisions[0]!.reason).toBe('')
  })

  test('Given judge 视角带 ratings When 投影 Then ownRating 来自 ratings 而非 dispositions', () => {
    const withRating = { ...aggregate, ratings: [{ id: 'r1', caseId: aggregate.caseV2.id, stageId: 'rating', actor: 'judge-9', scores: { d1: 4 }, at: new Date().toISOString(), round: 1 }] } as typeof aggregate
    const projection = projectForRole(withRating, 'judge', visibility, 'judge-9')
    expect(projection.ownRating).toMatchObject({ scores: { d1: 4 } })
  })
})

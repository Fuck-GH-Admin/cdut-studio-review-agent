import { afterAll, describe, expect, test } from 'bun:test'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createCaseFromTemplate } from './application-service'
import { readAggregate, submitCommand } from './case-store-v2'
import { publishComprehensiveFixture } from './fixtures/comprehensive-fixture'
import { registerMaterial } from './material-service'
import { submitCaseV2 } from './stage-workflow'
import { getTemplate, publishTemplate, saveDraft } from './template-store'

const config = mkdtempSync(join(tmpdir(), 'cdut-submit-case-test-'))
process.env.PROFER_CONFIG_DIR = config
afterAll(() => rmSync(config, { recursive: true, force: true }))
const actor = { actorId: 'reviewer', actorSource: 'local', role: 'reviewer' } as const
publishComprehensiveFixture({ getTemplate, saveDraft, publish: publishTemplate })
const material = join(config, 'evidence.txt')
writeFileSync(material, '虚构提交测试材料')

async function seed(caseId: string): Promise<void> {
  await createCaseFromTemplate('comprehensive-assessment-v2', 2, {
    title: '提交测试', fieldValues: { studentName: '测试学生', studentId: '001', academicYear: '2025-2026', applicant: '测试学生' }, subjects: [],
  }, actor, caseId)
  await registerMaterial(caseId, { requestId: 'register', actor, expectedRevision: 0, payload: { sourcePath: material, role: 'evidence' } })
}

describe('提交案卷的原子事务', () => {
  test('Given 已登记材料且 revision 非零 When 提交 Then 状态和首任务一次落盘', async () => {
    await seed('normal')
    const before = readAggregate('normal')!
    const result = await submitCaseV2('normal')
    expect(result.ok).toBe(true)
    const after = readAggregate('normal')!
    expect(after.caseV2.stage).toBe('submitted')
    expect(after.caseV2.revision).toBe(before.caseV2.revision + 1)
    expect(after.tasks).toHaveLength(1)
    expect(after.tasks[0]!.stageId).toBe('auto-check')
    expect(after.receiptLog.at(-1)!.type).toBe('SubmitCase')
  })

  test('Given 旧实现留下 submitted 但无任务 When 恢复提交 Then 补任务且不重建案卷', async () => {
    await seed('legacy')
    await submitCommand('legacy', { requestId: 'legacy-submit', actor, expectedRevision: 1, type: 'SubmitCase', payload: {} }, () => ({
      summary: '模拟旧实现的中间状态', mutate: draft => { draft.caseV2.stage = 'submitted' },
    }))
    const result = await submitCaseV2('legacy')
    expect(result.ok).toBe(true)
    const after = readAggregate('legacy')!
    expect(after.tasks).toHaveLength(1)
    expect(after.caseV2.documents).toHaveLength(1)
    expect(after.caseV2.revision).toBe(3)
  })

  test('Given 提交重试 When 连续调用 Then 只有一个首任务和一次业务 revision', async () => {
    await seed('retry')
    const first = await submitCaseV2('retry')
    expect(first.ok).toBe(true)
    const revision = readAggregate('retry')!.caseV2.revision
    const second = await submitCaseV2('retry')
    expect(second.ok).toBe(true)
    expect(readAggregate('retry')!.caseV2.revision).toBe(revision)
    expect(readAggregate('retry')!.tasks).toHaveLength(1)
  })
})

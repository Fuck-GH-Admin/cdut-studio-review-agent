import { afterAll, describe, expect, test } from 'bun:test'
import { rmSync } from 'node:fs'
import { join } from 'node:path'
import type { Actor, ReviewCaseV2, ReviewRunV2 } from '@profer/shared'
import { createAggregate, readAggregate, submitCommand } from './case-store-v2'
import { computeRunInputHash } from './run-service-v2'
import { saveRunV2 } from './run-store-v2'
import { decideWorkspaceCaseV2, isWorkspaceRunStaleV2, openWorkspaceSupplementV2, recordWorkspaceDispositionV2 } from './workspace-business-service-v2'

const CONFIG_DIR = join(import.meta.dir, '../../../../../../work/tmp', `profer-test-workspace-business-${Date.now()}`)
process.env.PROFER_CONFIG_DIR = CONFIG_DIR
afterAll(() => rmSync(CONFIG_DIR, { recursive: true, force: true }))

const actor: Actor = { actorId: 'reviewer-1', actorSource: 'local', role: 'reviewer' }
let caseCounter = 0
let requestCounter = 0
const request = (): string => `workspace-command-${++requestCounter}`

async function seed(): Promise<{ caseId: string; run: ReviewRunV2 }> {
  const caseId = `workspace-business-${++caseCounter}`
  const caseV2: ReviewCaseV2 = {
    id: caseId, templateId: 'workspace-test', templateVersion: 1, title: '工作台业务服务测试', objectType: 'person', caseFields: {}, subjects: [], documents: [],
    stage: 'reviewing', revision: 0, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
  }
  await createAggregate(caseId, caseV2)
  const aggregate = readAggregate(caseId)!
  const reviewRun: ReviewRunV2 = {
    id: `run-${caseId}`, caseId, templateId: caseV2.templateId, templateVersion: 1,
    inputManifest: { hash: computeRunInputHash(caseV2, [], []), templateVersion: 1, policyVersions: [], documentVersions: [], observationIds: [], evidenceLinkIds: [] },
    status: 'completed', checkpoints: [],
    checks: [{ checkId: 'check-a', ruleId: 'rule-a', target: { scope: 'case', subjectIds: [] }, status: 'non-compliant', reason: '需要审核员确认', sourceRefs: [], executedBy: 'deterministic', executedAt: '2026-01-01T00:00:01.000Z' }],
    opinions: [], coverage: { documents: [], plannedChecks: 1, completedChecks: 1, effectiveVerdicts: 1, pendingChecks: 1 }, diagnostics: [], startedAt: '2026-01-01T00:00:00.000Z', completedAt: '2026-01-01T00:00:02.000Z',
  }
  saveRunV2(reviewRun)
  expect(aggregate.caseV2.id).toBe(caseId)
  return { caseId, run: reviewRun }
}

describe('三栏单案的 V2 业务闭环事务', () => {
  test('Given 未处理检查 When 直接决定 Then 阻断；处置后决定持久化为最终业务决定', async () => {
    const { caseId, run } = await seed()
    const blocked = await decideWorkspaceCaseV2(caseId, {
      requestId: request(), actor, expectedRevision: 0,
      payload: { result: 'pass', reason: '审核通过', basedOnRunId: run.id, inputHash: run.inputManifest.hash },
    })
    expect(blocked.ok).toBeFalse()
    if (!blocked.ok) expect(blocked.code).toBe('DEPENDENCY_UNRESOLVED')

    const disposition = await recordWorkspaceDispositionV2(caseId, {
      requestId: request(), actor, expectedRevision: 0,
      payload: { findingKey: 'check-a', disposition: 'false-positive', reason: '核对申报字段与证明后确认规则误报', runId: run.id, inputHash: run.inputManifest.hash },
    })
    expect(disposition.ok).toBeTrue()
    const after = readAggregate(caseId)!
    expect(after.dispositions[0]?.actorSource).toBe('local')
    expect(after.dispositions[0]?.inputHash).toBe(run.inputManifest.hash)

    const decision = await decideWorkspaceCaseV2(caseId, {
      requestId: request(), actor, expectedRevision: after.caseV2.revision,
      payload: { result: 'pass', reason: '材料符合当前审核依据', basedOnRunId: run.id, inputHash: run.inputManifest.hash },
    })
    expect(decision.ok).toBeTrue()
    if (decision.ok) {
      expect(decision.aggregate.caseV2.stage).toBe('decided')
      expect(decision.entity?.result).toBe('pass')
      expect(decision.aggregate.decisions.at(-1)?.basedOnRunId).toBe(run.id)
    }
  })

  test('Given 案卷输入变更 When 处理旧运行 Then 明确拒绝过期处置', async () => {
    const { caseId, run } = await seed()
    await submitCommand(caseId, { requestId: request(), actor, expectedRevision: 0, type: 'InputChanged', payload: {} }, (_aggregate) => ({
      summary: '测试输入变化', mutate: (draft) => { draft.caseV2 = { ...draft.caseV2, caseFields: { applicant: { kind: 'text', value: '修改后的申请人' } } } },
    }))
    const current = readAggregate(caseId)!
    const result = await recordWorkspaceDispositionV2(caseId, {
      requestId: request(), actor, expectedRevision: current.caseV2.revision,
      payload: { findingKey: 'check-a', disposition: 'confirmed-issue', reason: '人工确认', runId: run.id, inputHash: run.inputManifest.hash },
    })
    expect(result.ok).toBeFalse()
    if (!result.ok) expect(result.code).toBe('STALE_INPUT')
  })

  test('Given 发现缺材料 When 要求补件 Then 写入 Supplement、处置和等待补件状态', async () => {
    const { caseId, run } = await seed()
    const result = await openWorkspaceSupplementV2(caseId, {
      requestId: request(), actor, expectedRevision: 0,
      payload: { findingKey: 'check-a', runId: run.id, inputHash: run.inputManifest.hash, requiredElements: ['证书日期'], reason: '证明文件没有日期' },
    })
    expect(result.ok).toBeTrue()
    if (result.ok) {
      expect(result.aggregate.caseV2.stage).toBe('awaiting-supplement')
      expect(result.aggregate.supplements[0]?.status).toBe('open')
      expect(result.aggregate.dispositions[0]?.disposition).toBe('supplement-requested')
      expect(isWorkspaceRunStaleV2(result.aggregate, run.id)).toBeTrue()
    }
  })
})

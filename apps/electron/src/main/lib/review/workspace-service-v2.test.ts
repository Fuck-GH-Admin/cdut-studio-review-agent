import { afterAll, describe, expect, test } from 'bun:test'
import { rmSync } from 'node:fs'
import { join } from 'node:path'
import type { Actor } from '@profer/shared'
import { buildDemoCase } from './demo-fixtures/demo-case-fixture'
import { saveCase } from './case-store'
import { ensureBuiltinTemplateDrafts } from './builtin-templates'
import { getTemplate as getTemplateStored, saveDraft as saveDraftStored } from './template-store'
import { readAggregate } from './case-store-v2'
import { ensureWorkspaceAggregateV2, syncWorkspaceProjectionV2 } from './workspace-service-v2'
import { correctObservation } from './application-service'

const CONFIG_DIR = join(import.meta.dir, '../../../../../../work/tmp', `profer-test-workspace-v2-${Date.now()}`)
process.env.PROFER_CONFIG_DIR = CONFIG_DIR
afterAll(() => rmSync(CONFIG_DIR, { recursive: true, force: true }))

const reviewer: Actor = { actorId: 'reviewer-test', actorSource: 'local', role: 'reviewer' }

describe('单一工作台案卷映射到 V2 聚合', () => {
  test('首次打开时以同一 caseId 建立聚合，并投影材料、申报项与来源', async () => {
    ensureBuiltinTemplateDrafts({ getTemplate: getTemplateStored, saveDraft: saveDraftStored })
    const legacy = buildDemoCase()
    saveCase(legacy)

    const aggregate = await ensureWorkspaceAggregateV2(legacy.id)
    expect(aggregate.caseV2.id).toBe(legacy.id)
    expect(aggregate.caseV2.subjects).toHaveLength(legacy.items.length)
    expect(aggregate.caseV2.documents).toHaveLength(legacy.documents.length)
    expect(aggregate.caseV2.subjects[0]?.sourceRefs[0]?.caseId).toBe(legacy.id)
    expect(aggregate.caseV2.subjects[0]?.sourceRefs[0]?.documentVersionId).toBe(`${legacy.items[0]?.anchor.documentId}-v1`)
    expect(readAggregate(legacy.id)?.receiptLog[0]?.actor?.actorSource).toBe('system')
  })

  test('同步新申报输入时保留人工事实与操作回执', async () => {
    ensureBuiltinTemplateDrafts({ getTemplate: getTemplateStored, saveDraft: saveDraftStored })
    const legacy = buildDemoCase()
    saveCase(legacy)
    const initial = await ensureWorkspaceAggregateV2(legacy.id)
    const subjectId = legacy.items[0]!.id
    const corrected = await correctObservation(legacy.id, {
      requestId: 'workspace-manual-correction',
      actor: reviewer,
      expectedRevision: initial.caseV2.revision,
      payload: { subjectId, fieldKey: 'level', value: { kind: 'text', value: '人工确认等级' }, sourceRefs: [], reason: '核对原件后修正' },
    })
    expect(corrected.ok).toBeTrue()

    const nextLegacy = { ...legacy, items: legacy.items.map((item, index) => index === 0 ? { ...item, title: '更新后的申报事项' } : item) }
    saveCase(nextLegacy)
    const synced = await syncWorkspaceProjectionV2(legacy.id)
    expect(synced.caseV2.subjects[0]?.title).toBe('更新后的申报事项')
    expect(synced.observations.some((observation) => observation.value.kind === 'text' && observation.value.value === '人工确认等级')).toBeTrue()
    expect(synced.receiptLog.some((receipt) => receipt.type === 'CorrectObservation')).toBeTrue()
  })

  test('审核依据按约束结构化编译，未确认内容仍保持人工检查', async () => {
    ensureBuiltinTemplateDrafts({ getTemplate: getTemplateStored, saveDraft: saveDraftStored })
    const demo = buildDemoCase()
    const unconfirmed = { ...demo, rulePacks: demo.rulePacks.map((pack) => ({ ...pack, confirmed: false })) }
    saveCase(unconfirmed)
    const manual = await ensureWorkspaceAggregateV2(unconfirmed.id)
    expect(manual.caseV2.reviewRules?.length).toBeGreaterThan(0)
    expect(manual.caseV2.reviewRules?.every((rule) => rule.execution === 'manual' && rule.confirmation === 'unconfirmed')).toBeTrue()

    saveCase({ ...unconfirmed, rulePacks: unconfirmed.rulePacks.map((pack) => ({ ...pack, confirmed: true })) })
    const confirmed = await syncWorkspaceProjectionV2(unconfirmed.id)
    expect(confirmed.caseV2.reviewRules?.every((rule) => rule.confirmation === 'confirmed')).toBeTrue()
    expect(confirmed.caseV2.reviewRules?.some((rule) => rule.execution === 'deterministic')).toBeTrue()
    expect(confirmed.caseV2.reviewRules?.some((rule) => rule.execution === 'manual')).toBeTrue()
    expect(confirmed.caseV2.reviewRules?.[0]?.sourceRefIds[0]).toEndWith('-v1')
  })
})

/**
 * V2 运行编排单测（M3：持久化/续跑跳过/取消 K18）
 * 隔离：PROFER_CONFIG_DIR 唯一临时目录。
 */
import { afterAll, describe, expect, test } from 'bun:test'
import { rmSync } from 'node:fs'
import { join } from 'node:path'
import type { ReviewCaseV2, TemplateVersion } from '@profer/shared'
import { cancelRunV2, runReviewCaseV2 } from './run-service-v2'
import type { NodeExecutor } from './review-run-graph'
import { getRunV2, listRunsV2 } from './run-store-v2'
import { ensureBuiltinTemplateDrafts } from './builtin-templates'
import { getTemplate as getTemplateStored, saveDraft as saveDraftStored } from './template-store'

const CONFIG_DIR = join(import.meta.dir, '../../../../../../work/tmp', `profer-test-runv2-${Date.now()}`)
process.env.PROFER_CONFIG_DIR = CONFIG_DIR
afterAll(() => rmSync(CONFIG_DIR, { recursive: true, force: true }))

const template = (() => {
  ensureBuiltinTemplateDrafts({ getTemplate: getTemplateStored, saveDraft: saveDraftStored })
  return getTemplateStored('document-checklist-v2', 1)!
})()

const caseV2: ReviewCaseV2 = {
  id: 'case-runv2-1', templateId: 'document-checklist-v2', templateVersion: 1, title: '测试案卷',
  objectType: 'document', caseFields: {}, subjects: [], documents: [], stage: 'submitted',
  revision: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
}

import type { NodeKind } from './review-run-graph'
const ALL_KINDS: NodeKind[] = ['register', 'parse', 'ocr', 'extract', 'bind', 'plan', 'check', 'calculate', 'verify', 'summarize', 'task']
const done = async (_n: Parameters<NodeExecutor>[0], hash: string) => ({ status: 'done' as const, inputHash: hash })
const okExecutors: Record<NodeKind, NodeExecutor> = Object.fromEntries(ALL_KINDS.map((kind) => [kind, done])) as Record<NodeKind, NodeExecutor>

describe('runReviewCaseV2（M3 编排）', () => {
  test('Given 正常执行 When 运行 Then completed 且检查点落盘（可读回）', async () => {
    const events: string[] = []
    const run = await runReviewCaseV2(caseV2, template, okExecutors, { runId: 'r-ok', onEvent: (event) => events.push(event.kind) })
    expect(run.status).toBe('completed')
    expect(run.checkpoints.length).toBeGreaterThan(0)
    expect(run.completedAt).toBeString()
    expect(events).toContain('node-completed')
    // 落盘可读回
    const persisted = getRunV2(caseV2.id, 'r-ok')!
    expect(persisted.status).toBe('completed')
    expect(listRunsV2(caseV2.id)).toHaveLength(1)
  })

  test('Given 已完成运行 When 同 hash 续跑 Then done 节点跳过不重做（A11）', async () => {
    let parseCalls = 0
    const counting: typeof okExecutors = { ...okExecutors, parse: async (node, hash) => { parseCalls += 1; return okExecutors.parse(node, hash) } }
    await runReviewCaseV2(caseV2, template, okExecutors, { runId: 'r-resume' })
    const resumed = await runReviewCaseV2(caseV2, template, counting, { runId: 'r-resume-2', resumeRunId: 'r-resume' })
    expect(resumed.status).toBe('completed')
    expect(parseCalls).toBe(0) // 全部节点跳过
  })

  test('Given 输入变化 When 续跑旧运行 Then 拒绝（防混版，K06）', async () => {
    const changed = { ...caseV2, subjects: [{ id: 's-new', type: 'item', title: 'x', fields: {}, sourceRefs: [], correction: 'ai-extracted', status: 'identified' }] } as ReviewCaseV2
    await expect(runReviewCaseV2(changed, template, okExecutors, { runId: 'r-x', resumeRunId: 'r-resume' })).rejects.toThrow('不能在旧运行上续跑')
  })

  test('Given 执行前取消 When 运行 Then cancelled 且不产生完成事件（K18）', async () => {
    cancelRunV2('r-cancel')
    const run = await runReviewCaseV2(caseV2, template, okExecutors, { runId: 'r-cancel' })
    expect(run.status).toBe('cancelled')
    const persisted = getRunV2(caseV2.id, 'r-cancel')!
    expect(persisted.status).toBe('cancelled')
    expect(persisted.completedAt).toBeUndefined()
  })
})

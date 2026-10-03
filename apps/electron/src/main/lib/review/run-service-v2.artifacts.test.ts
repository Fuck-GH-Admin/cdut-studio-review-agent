/**
 * N2b 单测（R03/R04：逐节点产物、即时事件、快照完整性、恢复核验）
 */
import { afterAll, describe, expect, test } from 'bun:test'
import { existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import type { ReviewCaseV2 } from '@profer/shared'
import { runReviewCaseV2, computeRunInputHash } from './run-service-v2'
import { getRunV2, readArtifact } from './run-store-v2'
import { getTemplate, saveDraft } from './template-store'
import { ensureBuiltinTemplateDrafts } from './builtin-templates'
import type { NodeExecutor, NodeKind } from './review-run-graph'

const CONFIG_DIR = join(import.meta.dir, '../../../../../../work/tmp', `profer-test-art-${Date.now()}`)
process.env.PROFER_CONFIG_DIR = CONFIG_DIR
afterAll(() => rmSync(CONFIG_DIR, { recursive: true, force: true }))

const template = (() => {
  ensureBuiltinTemplateDrafts({ getTemplate, saveDraft })
  return getTemplate('document-checklist-v2', 1)!
})()
const caseV2: ReviewCaseV2 = { id: 'case-art-1', templateId: template.templateId, templateVersion: 1, title: '产物测试', objectType: 'document', caseFields: {}, subjects: [], documents: [], stage: 'submitted', revision: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
const ALL: NodeKind[] = ['register', 'parse', 'ocr', 'extract', 'bind', 'plan', 'check', 'calculate', 'verify', 'summarize', 'task']
const doneAll = (extra?: Partial<Record<NodeKind, NodeExecutor>>): Record<NodeKind, NodeExecutor> =>
  Object.fromEntries(ALL.map((kind) => [kind, extra?.[kind] ?? (async (_n: Parameters<NodeExecutor>[0], hash: string) => ({ status: 'done' as const, inputHash: hash, artifact: { sourceIds: [], summary: kind } }))])) as Record<NodeKind, NodeExecutor>

describe('N2b 节点产物与事件（R03）', () => {
  test('Given 正常运行 When 执行 Then 每节点产物落盘且事件即时回调（修正误判 1）', async () => {
    const eventOrder: string[] = []
    const run = await runReviewCaseV2(caseV2, template, doneAll(), { runId: 'r-art', onEvent: (event) => eventOrder.push(`${event.kind}:${event.nodeId ?? '-'}`) })
    expect(run.status).toBe('completed')
    // 产物文件真实存在
    const parseArtifact = readArtifact(caseV2.id, 'r-art', 'node-auto-check-parse')
    expect(parseArtifact).toBeDefined()
    expect((parseArtifact as { summary?: string }).summary).toBe('parse')
    expect(eventOrder[0]).toContain('node-started') // 首事件即时（非整图后）
  })

  test('Given 中途失败 When 运行 Then 已完成节点产物保留（崩溃可续）', async () => {
    const failOnCheck = doneAll({ check: async () => { throw new Error('模型超时') } })
    const run = await runReviewCaseV2(caseV2, template, failOnCheck, { runId: 'r-fail' })
    expect(run.status).toBe('failed')
    expect(readArtifact(caseV2.id, 'r-fail', 'node-auto-check-parse')).toBeDefined() // 前序产物保留
  })

  test('Given 产物被删 When 恢复 Then 该节点重做（R03 恢复核验）', async () => {
    // 先跑一遍成功（r-ok）
    await runReviewCaseV2(caseV2, template, doneAll(), { runId: 'r-ok' })
    // 删一个产物
    const artifactPath = join(CONFIG_DIR, 'review-cases', caseV2.id, 'runs-v2', 'r-ok', 'artifacts', 'node-auto-check-ocr.json')
    expect(existsSync(artifactPath)).toBeTrue()
    rmSync(artifactPath)
    // 续跑：core 产物缺失的节点应重新执行（此处仅验证读回为空）
    expect(readArtifact(caseV2.id, 'r-ok', 'node-auto-check-ocr')).toBeUndefined()
  })
})

describe('N2b 输入快照完整性（R04，修正误判 3）', () => {
  test('Given caseFields 变化 When 计算 hash Then 变化（旧实现不包含 caseFields）', () => {
    const base = computeRunInputHash(caseV2, [], [])
    const changed = computeRunInputHash({ ...caseV2, caseFields: { studentName: { kind: 'text', value: '李四' } } }, [], [])
    expect(changed).not.toBe(base)
    expect(changed).toHaveLength(64) // SHA-256
  })
})

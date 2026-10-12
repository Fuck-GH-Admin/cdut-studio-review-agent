/** Main 薄接线：真实 V2/会话/IPC，受控执行器；Electron A0 另行记录。 */
import { afterAll, describe, expect, mock, test } from 'bun:test'
import { randomUUID } from 'node:crypto'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { AgentSendInput, TemplateVersion } from '@profer/shared'
import { REVIEW_IPC_CHANNELS } from '@profer/shared'
import type { BrowserWindow, WebContents } from 'electron'

const configDir = mkdtempSync(join(tmpdir(), 'review-main-bridge-'))
process.env.PROFER_CONFIG_DIR = configDir
afterAll(() => rmSync(configDir, { recursive: true, force: true }))
const executions: Array<{ input: AgentSendInput; owned(): void; end(status: 'completed' | 'failed' | 'stopped'): void }> = []
const active = new Set<string>()
mock.module('../agent-service', () => ({
  isAgentSessionActive: (id: string) => active.has(id),
  runAgent: (input: AgentSendInput, _wc: WebContents, _promotion: unknown, owned: () => void) => new Promise<void>((resolve) => {
    executions.push({ input, owned: () => { active.add(input.sessionId); owned() }, end: (status) => {
      input.onRunOutcome?.({ status, ...(status === 'failed' ? { error: '合成执行失败' } : {}) })
      active.delete(input.sessionId)
      resolve()
    } })
  }),
  stopAgentAndWait: async (id: string) => { executions.findLast((run) => run.input.sessionId === id)?.end('stopped') },
}))
const { startBackgroundPiReview, stopBackgroundPiReview } = await import('./review-pi-run-bridge')
const { createChannel, updateChannel } = await import('../channel-manager')
const { updateSettings } = await import('../settings-service')
const { createCaseFromTemplate } = await import('./application-service')
const { saveDraft, publishTemplate } = await import('./template-store')
const { getBackgroundPiReviewState } = await import('./review-background-state')
const { listAgentSessions, getAgentSessionMeta } = await import('../agent-session-manager')
const { saveReviewModuleSettings } = await import('./module-settings-store')
const { getRunV2 } = await import('./run-store-v2')
const { getPiReviewBindingForSession } = await import('./pi-case-review-service')
const { registerReviewIpc } = await import('./review-ipc')
const { setMainWindow } = await import('../main-window-state')
const windowContents = { isDestroyed: () => false, send() {} } as unknown as WebContents
const channel = createChannel({ name: '合成审核渠道', provider: 'deepseek', baseUrl: 'https://example.invalid', apiKey: 'synthetic-test-key', enabled: true,
  models: [{ id: 'synthetic-model', name: '合成模型', enabled: true }] })
updateSettings({ agentChannelId: channel.id, agentModelId: 'synthetic-model' })

async function fixture() {
  const id = `bridge-${randomUUID()}`
  const template: TemplateVersion = { templateId: id, version: 1, schemaVersion: 2, name: '合成后台接线', objectType: 'person', displayName: { template: '{{title}}' },
    fields: [], sections: [{ id: 'all', name: '核验', order: 0, required: false, criteria: [{ id: 'check', title: '内容检查', requirement: '核对材料中的申请内容', execution: 'semantic', targetScope: 'case' }] }],
    materialSlots: [], policyVersionIds: [], policyRefs: [], stages: [{ id: 'review', name: '审核', kind: 'manual-review', executorRole: 'reviewer' }],
    outputs: [], status: 'draft', createdAt: new Date().toISOString() }
  saveDraft(template)
  publishTemplate(id, 1)
  const created = await createCaseFromTemplate(id, 1, { title: '合成案卷', fieldValues: {}, subjects: [] }, { actorId: 'local-reviewer', actorSource: 'local', role: 'reviewer' }, id)
  if (!created.ok) throw new Error(created.message)
  return id
}
async function pendingExecution() {
  const caseId = await fixture()
  const count = executions.length
  const admission = startBackgroundPiReview({ caseId }, windowContents)
  while (executions.length === count) await Bun.sleep(0)
  const execution = executions.at(-1)!
  return { caseId, admission, execution }
}

describe('后台 Main 入口与受理边界', () => {
  test('真实执行权之前保持 preparing，ACK 不泄漏内部 ID，Main 在页面无等待时继续收尾', async () => {
    const context = await pendingExecution()
    const before = getBackgroundPiReviewState(context.caseId)
    expect(before.phase).toBe('preparing')
    let settled = false
    void context.admission.then(() => { settled = true })
    await Bun.sleep(0)
    expect(settled).toBeFalse()
    context.execution.owned()
    const receipt = await context.admission
    expect(receipt.phase).toBe('accepted')
    expect('sessionId' in receipt).toBeFalse()
    expect('assignmentId' in receipt).toBeFalse()
    const meta = getAgentSessionMeta(context.execution.input.sessionId)!
    expect(meta.owner).toEqual({ kind: 'review-case', caseId: context.caseId })
    expect(meta.workspaceId).toBeUndefined()
    expect(meta.attachedDirectories).toHaveLength(1)
    context.execution.end('completed')
    await Bun.sleep(0)
    expect(getBackgroundPiReviewState(context.caseId).phase).toBe('incomplete')
    expect(getRunV2(context.caseId, receipt.runId!)?.status).toBe('partially-completed')
  })

  test('忙碌和重复启动不产生第二个运行或结束原运行', async () => {
    const context = await pendingExecution()
    await expect(startBackgroundPiReview({ caseId: context.caseId }, windowContents)).rejects.toThrow('正在启动或停止')
    context.execution.owned()
    const receipt = await context.admission
    await expect(startBackgroundPiReview({ caseId: context.caseId }, windowContents)).rejects.toThrow('已有审核正在进行')
    expect(getRunV2(context.caseId, receipt.runId!)?.status).toBe('running')
    context.execution.end('failed')
    await Bun.sleep(0)
    expect(getRunV2(context.caseId, receipt.runId!)?.error).toBe('合成执行失败')
  })

  test('停止只接受当前案卷/运行，错误身份不触发执行器，正确停止持久 cancelled', async () => {
    const context = await pendingExecution()
    context.execution.owned()
    const receipt = await context.admission
    await expect(stopBackgroundPiReview({ caseId: context.caseId, runId: 'run-pi-unknown' })).rejects.toThrow('运行已变化')
    const other = await fixture()
    await expect(stopBackgroundPiReview({ caseId: other, runId: receipt.runId! })).rejects.toThrow('运行已变化')
    expect(active.has(context.execution.input.sessionId)).toBeTrue()
    const state = await stopBackgroundPiReview({ caseId: context.caseId, runId: receipt.runId! })
    expect(state.runStatus).toBe('cancelled')
    expect(active.has(context.execution.input.sessionId)).toBeFalse()
    expect(getPiReviewBindingForSession(context.execution.input.sessionId)).toBeUndefined()
  })

  test('模型停用和非法请求在建内部会话前拒绝', async () => {
    const caseId = await fixture()
    const count = listAgentSessions(true).length
    updateChannel(channel.id, { enabled: false })
    await expect(startBackgroundPiReview({ caseId }, windowContents)).rejects.toThrow('停用')
    updateChannel(channel.id, { enabled: true })
    await expect(startBackgroundPiReview({ caseId: '../../bad' }, windowContents)).rejects.toThrow('非法 caseId')
    await expect(startBackgroundPiReview({ caseId, mode: 'bad' as 'update' }, windowContents)).rejects.toThrow('模式非法')
    expect(listAgentSessions(true)).toHaveLength(count)
  })

  test('审核独立模型优先，运行中改设置不改变当前执行输入', async () => {
    const selected = createChannel({ name: '独立合成渠道', provider: 'deepseek', baseUrl: 'https://example.invalid', apiKey: 'synthetic-key', enabled: true, models: [{ id: 'selected-model', name: '选定模型', enabled: true }] })
    saveReviewModuleSettings({ agentModelSelection: { channelId: selected.id, modelId: 'selected-model' } })
    const context = await pendingExecution()
    context.execution.owned()
    await context.admission
    saveReviewModuleSettings({ agentModelSelection: null })
    expect(context.execution.input.channelId).toBe(selected.id)
    expect(context.execution.input.modelId).toBe('selected-model')
    context.execution.end('completed')
    await Bun.sleep(0)
  })

  test('实际注册 IPC 拒绝非主窗口，旧 prepare/abort/指派入口不能操作新 owner', async () => {
    const hooks = globalThis.__proferElectronTestHooks as typeof globalThis.__proferElectronTestHooks & { ipcMainHandlers: Map<string, (...args: any[]) => any> }
    hooks.ipcMainHandlers.clear()
    registerReviewIpc()
    setMainWindow({ isDestroyed: () => false, webContents: windowContents } as unknown as BrowserWindow)
    const handlers = hooks.ipcMainHandlers
    expect(() => handlers.get(REVIEW_IPC_CHANNELS.START_BACKGROUND_PI_REVIEW_V2)!({ sender: { isDestroyed: () => false } }, {})).toThrow('仅允许')
    expect(() => handlers.get(REVIEW_IPC_CHANNELS.STOP_BACKGROUND_PI_REVIEW_V2)!({ sender: { isDestroyed: () => false } }, {})).toThrow('仅允许')
    const context = await pendingExecution()
    context.execution.owned()
    const receipt = await context.admission
    const binding = getPiReviewBindingForSession(context.execution.input.sessionId)!
    expect(() => handlers.get(REVIEW_IPC_CHANNELS.PREPARE_PI_REVIEW_V2)!({}, { caseId: context.caseId, sessionId: binding.sessionId, turnId: randomUUID() })).toThrow()
    expect(() => handlers.get(REVIEW_IPC_CHANNELS.ABORT_PI_REVIEW_V2)!({}, binding)).toThrow()
    expect(() => handlers.get(REVIEW_IPC_CHANNELS.ASSIGNMENT_REVOKE_V2)!({}, binding.assignmentId)).toThrow()
    expect(handlers.get(REVIEW_IPC_CHANNELS.GET_PI_REVIEW_SESSION_V2)!({}, context.caseId)).toBeNull()
    expect(handlers.get(REVIEW_IPC_CHANNELS.ASSIGNMENT_LIST_V2)!({})).not.toContainEqual(expect.objectContaining({ sessionId: binding.sessionId }))
    expect(getRunV2(context.caseId, receipt.runId!)?.status).toBe('running')
    context.execution.end('completed')
    await Bun.sleep(0)
    setMainWindow(null)
  })
})

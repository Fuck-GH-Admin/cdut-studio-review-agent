/**
 * P06 L02 U1：真实 Main Orchestrator + 当前 V2 指派 + Pi Adapter 入口。
 * WitnessAdapter 不联系外部 provider，故只能宣称受控接线/准入，不能宣称 PI_PROVIDER LIVE。
 */
import { afterAll, describe, expect, test } from 'bun:test'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import type { Actor, SDKMessage, TemplateVersion } from '@profer/shared'
import { PiAgentAdapter, type PiAgentQueryOptions } from './adapters/pi-agent-adapter'

const profile = mkdtempSync(join(tmpdir(), 'p06-u1-review-tools-'))
process.env.PROFER_CONFIG_DIR = profile
afterAll(() => rmSync(profile, { recursive: true, force: true }))
await import('./agent-service')
const { AgentOrchestrator } = await import('./agent-orchestrator')
const { AgentEventBus } = await import('./agent-event-bus')
const { createReviewOwnedAgentSession, createAgentSession } = await import('./agent-session-manager')
const { createChannel } = await import('./channel-manager')
const { createCaseFromTemplate } = await import('./review/application-service')
const { saveDraft, publishTemplate } = await import('./review/template-store')
const { preparePiReviewRunV2, getPiReviewBindingForSession } = await import('./review/pi-case-review-service')
const { revokeAssignment } = await import('./review/review-agent-assignment')
const { isAuthorizedDirectReviewTool } = await import('./review/review-strict-pi-tools')

const channel = createChannel({
  name: 'P06-U1 合成 Pi 渠道（无网络）', provider: 'deepseek',
  baseUrl: 'https://example.invalid', apiKey: 'synthetic-no-secret', enabled: true,
  models: [{ id: 'synthetic-model', name: '合成模型', enabled: true }],
})
const actor: Actor = { actorId: 'u1-review-tool-test', actorSource: 'local', role: 'reviewer' }
const expectedFour = [
  'review_read_documents',
  'review_inspect_document_image',
  'review_submit_result',
  'review_inspect_original',
].sort()
const forbidden = ['Read', 'Write', 'Bash', 'Edit', 'AskUser', 'MCP', 'inspect_preview', 'review_list_cases']

class WitnessAdapter extends PiAgentAdapter {
  calls = 0
  action: (input: PiAgentQueryOptions) => Promise<void> = async () => {}
  override async *query(input: PiAgentQueryOptions): AsyncIterable<SDKMessage> {
    this.calls++
    await this.action(input)
    yield {
      type: 'result', subtype: 'success', session_id: 'p06-synthetic-session',
      result: '合成工具接线检查结束',
    } as SDKMessage
  }
}
const callbacks = { onError() {}, onComplete() {}, onTitleUpdated() {} }
const permissionOptions = { signal: new AbortController().signal, toolUseID: 'u1-controlled-call' }

async function liveFixture(label: string) {
  const slug = 'u1-t-' + label + '-' + randomUUID().slice(0, 8)
  const templateId = 'template-' + slug
  const template: TemplateVersion = {
    templateId, version: 1, schemaVersion: 2,
    name: '仅合成五工具安全验证', objectType: 'person',
    displayName: { template: '{{title}}' }, fields: [],
    sections: [{
      id: 'all', name: '合成整案检查', order: 0, required: false,
      criteria: [{ id: 'budget', title: '预算阈值检查',
        requirement: '核对合成预算数字是否符合 100 元限制',
        execution: 'semantic' as const, targetScope: 'case' as const }],
    }],
    materialSlots: [], policyVersionIds: [], policyRefs: [],
    stages: [{ id: 'review', name: '审核', kind: 'manual-review', executorRole: 'reviewer' }],
    outputs: [], status: 'draft', createdAt: new Date().toISOString(),
  }
  saveDraft(template)
  publishTemplate(templateId, 1)
  const caseId = 'case-' + slug
  const created = await createCaseFromTemplate(templateId, 1,
    { title: '不包含任何真实用户数据', fieldValues: {}, subjects: [] }, actor, caseId)
  if (!created.ok) throw new Error('create case: ' + created.message)
  const session = createReviewOwnedAgentSession({
    caseId, title: '仅五工具合成内部会话', channelId: channel.id, modelId: 'synthetic-model',
  })
  const turnId = randomUUID()
  const prepared = preparePiReviewRunV2({ caseId, sessionId: session.id, turnId })
  const binding = getPiReviewBindingForSession(session.id)
  expect(binding).toMatchObject({
    caseId, runId: prepared.runId, assignmentId: prepared.assignmentId,
  })
  return { session, caseId, turnId, prepared, binding: binding! }
}

function messageInput(sessionId: string, triggeredBy: 'user' | 'goal' = 'user') {
  return {
    sessionId, channelId: channel.id, modelId: 'synthetic-model',
    agentRuntime: 'pi' as const, triggeredBy,
    uuid: randomUUID(), userMessage: '仅本机合成核验，不触发 provider',
    permissionModeOverride: 'bypassPermissions' as const,
  }
}

describe('U1 T01–T05：Main 真实当前案卷绑定与 Adapter 输入受控核验', () => {
  test('有效审核绑定只向 Adapter 传四个受控 customTools + 内核 CompactContext；Host 拒绝非白名单，即使 bypass', async () => {
    const f = await liveFixture('valid')
    const adapter = new WitnessAdapter()
    adapter.action = async input => {
      expect(input.toolProfile).toBe('review')
      expect(input.contextPolicy).toMatchObject({ kind: 'review', caseId: f.caseId, runId: f.prepared.runId })
      expect(input.customTools?.map(x => x.name).sort()).toEqual(expectedFour)
      expect(new Set(input.customTools?.map(x => x.name)).size).toBe(4)
      expect(typeof input.canUseTool).toBe('function')
      for (const name of [...expectedFour, 'CompactContext']) {
        expect((await input.canUseTool!(name, {}, permissionOptions)).behavior).toBe('allow')
      }
      for (const name of forbidden) {
        const denied = await input.canUseTool!(name, {}, permissionOptions)
        expect(denied.behavior).toBe('deny')
      }
      expect(isAuthorizedDirectReviewTool(f.binding, 'CompactContext')).toBe(true)
    }
    await new AgentOrchestrator(adapter, new AgentEventBus())
      .sendMessage(messageInput(f.session.id), callbacks)
    expect(adapter.calls).toBe(1)
  })

  test('已经撤销的真实 V2 指派同时拒绝 SDK 回调和原件工具，普通权限模式不接管', async () => {
    const f = await liveFixture('revoke')
    const adapter = new WitnessAdapter()
    adapter.action = async input => {
      expect(input.toolProfile).toBe('review')
      expect(revokeAssignment(f.prepared.assignmentId)).toBe(true)
      expect(getPiReviewBindingForSession(f.session.id)).toBeUndefined()
      for (const name of [...expectedFour, 'CompactContext', ...forbidden]) {
        expect((await input.canUseTool!(name, {}, permissionOptions)).behavior).toBe('deny')
      }
      const inspect = input.customTools?.find(t => t.name === 'review_inspect_original')
      expect(inspect).toBeDefined()
      const result = await inspect!.execute('synthetic-call', {
        documentVersionId: 'forged-cross-case-document', scope: 'overview',
      } as never, new AbortController().signal)
      expect(result.isError).toBe(true)
      expect(JSON.stringify(result.details)).toContain('已经变化')
    }
    await new AgentOrchestrator(adapter, new AgentEventBus())
      .sendMessage(messageInput(f.session.id), callbacks)
    expect(adapter.calls).toBe(1)
  })

  test('用户没有触发本轮、绑定已撤销时，内部 owner 在 Adapter 前立即拒绝', async () => {
    const f = await liveFixture('stale')
    revokeAssignment(f.prepared.assignmentId)
    const adapter = new WitnessAdapter()
    await expect(new AgentOrchestrator(adapter, new AgentEventBus())
      .sendMessage(messageInput(f.session.id), callbacks))
      .rejects.toThrow('拒绝降级为普通 Agent 权限')
    expect(adapter.calls).toBe(0)
  })

  test('同一有效内部 owner 遭 goal 触发时不静默降级为普通工具', async () => {
    const f = await liveFixture('goal')
    const adapter = new WitnessAdapter()
    await expect(new AgentOrchestrator(adapter, new AgentEventBus())
      .sendMessage(messageInput(f.session.id, 'goal'), callbacks))
      .rejects.toThrow('拒绝降级为普通 Agent 权限')
    expect(adapter.calls).toBe(0)
  })

  test('普通 Pi profile 始终不是内部审核白名单，合法普通工具权限依旧保留', async () => {
    const session = createAgentSession('仅合成普通 Agent', channel.id, undefined, 'synthetic-model', 'pi')
    const adapter = new WitnessAdapter()
    adapter.action = async input => {
      expect(input.toolProfile).not.toBe('review')
      expect(input.contextPolicy?.kind).not.toBe('review')
      expect(input.customTools?.map(tool => tool.name)).not.toEqual(expectedFour)
      expect((await input.canUseTool!('Read', { file_path: 'synthetic.txt' }, permissionOptions)).behavior)
        .toBe('allow')
    }
    await new AgentOrchestrator(adapter, new AgentEventBus())
      .sendMessage(messageInput(session.id), callbacks)
    expect(adapter.calls).toBe(1)
  })
})

/**
 * P06 L02-U1 P02：验证真实持久会话删除与 Main 投影事件的接线。
 * 不启动 Electron/provider；必须与 #105 的真实 IPC 失败并列验收。
 */
import { afterAll, describe, expect, test } from 'bun:test'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'

const config = mkdtempSync(join(tmpdir(), 'p06-p02-session-delete-'))
process.env.PROFER_CONFIG_DIR = config
afterAll(() => rmSync(config, { recursive: true, force: true }))

const { AgentEventBus } = await import('./agent-event-bus')
const {
  createAgentSession, createReviewOwnedAgentSession, deleteAgentSession, getAgentSessionMeta,
} = await import('./agent-session-manager')
const {
  configureAgentSessionProjectionPublisher, deleteAgentSessionAndPublish,
} = await import('./agent-session-ui-projection-publisher')

describe('P02 Main 持久删除后才发布普通 session_projection/delete', () => {
  test('普通会话成功删除：广播的唯一 delete 具有高于旧 meta 的修订号', () => {
    const bus = new AgentEventBus()
    const events: Array<{ id: string; payload: Record<string, unknown> }> = []
    bus.on((id, payload) => events.push({ id, payload: payload as unknown as Record<string, unknown> }))
    configureAgentSessionProjectionPublisher(bus)
    const session = createAgentSession('P02 合成普通会话', 'synthetic-channel')
    const before = getAgentSessionMeta(session.id)!
    expect(before?.id).toBe(session.id)
    deleteAgentSessionAndPublish(session.id, id => deleteAgentSession(id, { backgroundDiskCleanup: false }))
    expect(getAgentSessionMeta(session.id)).toBeUndefined()
    const notifications = events.filter(e => e.id === session.id && e.payload.kind === 'session_projection')
    expect(notifications).toHaveLength(1)
    expect(notifications[0]?.payload).toMatchObject({
      kind: 'session_projection', operation: 'delete', sessionId: session.id,
      revision: (before.revision ?? 0) + 1,
    })
    expect(JSON.stringify(notifications[0])).not.toContain('review-case')
  })

  test('删除失败必须保留已有会话且不得广播假删除', () => {
    const bus = new AgentEventBus()
    const events: string[] = []
    bus.on((id, payload) => { if (payload.kind === 'session_projection') events.push(id) })
    configureAgentSessionProjectionPublisher(bus)
    const session = createAgentSession('P02 合成失败', 'synthetic-channel')
    expect(() => deleteAgentSessionAndPublish(session.id, () => { throw new Error('synthetic disk denied') }))
      .toThrow('synthetic disk denied')
    expect(getAgentSessionMeta(session.id)?.id).toBe(session.id)
    expect(events).toEqual([])
  })

  test('审核 owner 删除不向普通 UI 投影私有会话 ID', () => {
    const bus = new AgentEventBus()
    const events: string[] = []
    bus.on((id, payload) => { if (payload.kind === 'session_projection') events.push(id) })
    configureAgentSessionProjectionPublisher(bus)
    const owner = createReviewOwnedAgentSession({
      caseId: 'p02-hidden-' + randomUUID(), title: '私有审核', channelId: 'synthetic-channel',
    })
    deleteAgentSessionAndPublish(owner.id, id => deleteAgentSession(id, { backgroundDiskCleanup: false }))
    expect(getAgentSessionMeta(owner.id)).toBeUndefined()
    expect(events).toEqual([])
  })
})

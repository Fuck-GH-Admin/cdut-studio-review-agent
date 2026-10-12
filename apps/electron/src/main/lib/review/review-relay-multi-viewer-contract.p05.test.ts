/**
 * P05-S06: desktop -> real loopback Relay-adapter contract and deep event-ID guard.
 * The Relay fixture is NOT production center routing (its server code is absent).
 */
import { afterAll, beforeAll, describe, expect, spyOn, test } from 'bun:test'
import { randomUUID } from 'node:crypto'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createServer } from 'node:http'
import { createServer as createNetServer } from 'node:net'
import WebSocket, { WebSocketServer } from 'ws'
import * as authService from '../auth-service'
import { agentEventBus } from '../agent-service'
import { createAgentSession, createReviewOwnedAgentSession, deleteAgentSession } from '../agent-session-manager'
import { mayPublishAgentEventToRemote, getRemoteServiceStatus, selectOrdinaryRemoteReplayRecords, startRemoteService, stopRemoteService } from '../remote-service'

const directory = mkdtempSync(join(tmpdir(), 'p05-s06-relay-'))
process.env.PROFER_CONFIG_DIR = directory
process.env.PROFER_REMOTE = '1'
process.env.PROFER_REMOTE_HOST = '127.0.0.1'
process.env.PROFER_REMOTE_TOKEN = 'p05-s06-local-' + randomUUID()
process.env.PROFER_REMOTE_RELAY = '1'

type Frame = Record<string, unknown>
type Viewer = { socket: WebSocket; frames: Frame[]; send: (command: Frame) => void }
const sleep = (n: number) => new Promise<void>(resolve => setTimeout(resolve, n))
async function until<T>(find: () => T | undefined | false, limit = 8000): Promise<T> {
  const start = Date.now()
  while (Date.now() - start < limit) {
    const value = find()
    if (value) return value
    await sleep(10)
  }
  throw new Error('P05-S06 simulated center timeout')
}
async function reservePort(): Promise<number> {
  const server = createNetServer()
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })
  const addr = server.address()
  const port = typeof addr === 'object' && addr ? addr.port : 0
  await new Promise<void>(resolve => server.close(() => resolve()))
  return port
}

let http = createServer()
let hub: WebSocketServer
let port = 0
let normal = ''
let hidden = ''
let desktop: WebSocket | undefined
let authenticated = false
let tickets: ReturnType<typeof spyOn> | undefined
const sockets = new Set<WebSocket>()
const pending = new Map<string, WebSocket>()
const outbound: Frame[] = []
const protocolErrors: string[] = []

beforeAll(async () => {
  const publicSession = createAgentSession('P05-S06 ordinary', 'mock')
  const owner = createReviewOwnedAgentSession({ caseId: 'p05s06-' + randomUUID().slice(0, 8), title: 'private', channelId: 'mock' })
  normal = publicSession.id
  hidden = owner.id
  hub = new WebSocketServer({ server: http })
  hub.on('connection', (socket, req) => {
    sockets.add(socket)
    if (req.url === '/remote/ws') {
      desktop = socket
      socket.on('message', raw => {
        let frame: Frame
        try { frame = JSON.parse(String(raw)) as Frame } catch { return }
        outbound.push(frame)
        if (frame.kind === 'relay_auth') {
          authenticated = frame.ticket === 'local-synthetic-ticket'
          socket.send(JSON.stringify({ kind: 'relay_hello' }))
          return
        }
        if (frame.kind === 'command_result' || frame.kind === 'agent_events_resumed') {
          const id = typeof frame.commandId === 'string' ? frame.commandId : frame.requestId
          if (typeof id !== 'string') {
            protocolErrors.push('uncorrelated response')
            return
          }
          const target = pending.get(id)
          if (!target) {
            protocolErrors.push('unmatched command ' + id)
            return
          }
          pending.delete(id)
          if (target.readyState === WebSocket.OPEN) target.send(JSON.stringify(frame))
          return
        }
        if (frame.kind === 'agent_event') {
          for (const viewer of sockets) {
            if (viewer !== desktop && viewer.readyState === WebSocket.OPEN) viewer.send(JSON.stringify(frame))
          }
        }
      })
    } else {
      socket.on('message', raw => {
        let command: Frame
        try { command = JSON.parse(String(raw)) as Frame } catch { return }
        const id = command._cmdId
        if (typeof id !== 'string' || !id || pending.has(id)) {
          protocolErrors.push('missing/duplicate viewer command ID')
          return
        }
        pending.set(id, socket)
        if (desktop?.readyState === WebSocket.OPEN) desktop.send(JSON.stringify(command))
      })
    }
    socket.on('close', () => {
      sockets.delete(socket)
      for (const [id, owner] of pending) if (owner === socket) pending.delete(id)
    })
  })
  await new Promise<void>((resolve, reject) => {
    http.once('error', reject)
    http.listen(0, '127.0.0.1', resolve)
  })
  const addr = http.address()
  port = typeof addr === 'object' && addr ? addr.port : 0
  process.env.PROFER_REMOTE_RELAY_URL = 'ws://127.0.0.1:' + port + '/remote/ws'
  process.env.PROFER_REMOTE_PORT = String(await reservePort())
  tickets = spyOn(authService, 'getRemoteRelayTicket').mockResolvedValue({ ticket: 'local-synthetic-ticket', expiresAt: Date.now() + 120000 })
  startRemoteService()
  await until(() => authenticated && outbound.some(x => x.kind === 'hello') && getRemoteServiceStatus().running)
})
afterAll(async () => {
  stopRemoteService()
  tickets?.mockRestore()
  for (const socket of sockets) socket.terminate()
  await new Promise<void>(resolve => hub.close(() => resolve()))
  await new Promise<void>(resolve => http.close(() => resolve()))
  rmSync(directory, { recursive: true, force: true })
})

async function connectViewer(id: string): Promise<Viewer> {
  const socket = new WebSocket('ws://127.0.0.1:' + port + '/viewer/' + id)
  const frames: Frame[] = []
  socket.on('message', raw => {
    try { frames.push(JSON.parse(String(raw)) as Frame) } catch { /* ignore */ }
  })
  await until(() => socket.readyState === WebSocket.OPEN)
  return { socket, frames, send: command => socket.send(JSON.stringify(command)) }
}

describe('P05-S06 desktop Relay routing contract (synthetic hub, real WS)', () => {
  test('two viewers with same business requestId retain separate _cmdId results', async () => {
    const a = await connectViewer('a')
    const b = await connectViewer('b')
    a.send({ type: 'session_detail', sessionId: normal, requestId: 'business-shared', _cmdId: 'viewer-a-command-1' })
    b.send({ type: 'session_detail', sessionId: hidden, requestId: 'business-shared', _cmdId: 'viewer-b-command-1' })
    const ok = await until(() => a.frames.find(f => f.kind === 'command_result' && f.commandId === 'viewer-a-command-1'))
    const denied = await until(() => b.frames.find(f => f.kind === 'command_result' && f.commandId === 'viewer-b-command-1'))
    expect(ok.ok).toBe(true)
    expect(denied.ok).toBe(false)
    expect(ok.requestId).toBe('viewer-a-command-1')
    expect(denied.requestId).toBe('viewer-b-command-1')
    expect(a.frames.some(f => f.commandId === 'viewer-b-command-1')).toBe(false)
    expect(b.frames.some(f => f.commandId === 'viewer-a-command-1')).toBe(false)
    a.socket.close()
    b.socket.close()
  })
  test('separate viewer cannot inherit old file-preview session; resumed viewer still requires snapshot', async () => {
    const a = await connectViewer('a2')
    const b = await connectViewer('b2')
    a.send({ type: 'session_detail', sessionId: normal, _cmdId: 'a-context' })
    await until(() => a.frames.find(f => f.commandId === 'a-context'))
    b.send({ type: 'resolve_and_read_file', filePath: '/irrelevant', _cmdId: 'b-unbound' })
    const unbound = await until(() => b.frames.find(f => f.commandId === 'b-unbound'))
    expect(unbound.ok).toBe(false)
    expect(unbound.error).toBe('缺少 filePath 或 sessionId')
    b.socket.close()
    const reconnected = await connectViewer('b2-again')
    reconnected.send({ type: 'resume_agent_events', cursor: null, _cmdId: 'b2-resume' })
    const resume = await until(() => reconnected.frames.find(f => f.kind === 'agent_events_resumed' && f.requestId === 'b2-resume'))
    expect(resume.requiresSnapshot).toBe(true)
    a.socket.close()
    reconnected.socket.close()
    expect(protocolErrors).toEqual([])
  })
  test('owner deletion keeps Relay command denied while ordinary commands remain visible', async () => {
    deleteAgentSession(hidden)
    const a = await connectViewer('a3')
    a.send({ type: 'session_detail', sessionId: hidden, _cmdId: 'deleted-owner' })
    const denied = await until(() => a.frames.find(f => f.commandId === 'deleted-owner'))
    expect(denied.ok).toBe(false)
    a.send({ type: 'session_detail', sessionId: normal, _cmdId: 'normal-still-available' })
    const ok = await until(() => a.frames.find(f => f.commandId === 'normal-still-available'))
    expect(ok.ok).toBe(true)
    a.socket.close()
  })
})

describe('P05-S06 structured AgentStreamPayload integrity', () => {
  test('deeply nested structured owner reference is suppressed, including deleted IDs', () => {
    let nested: Record<string, unknown> = { targetSessionId: hidden }
    for (let n = 0; n < 18; n++) nested = { nested }
    expect(mayPublishAgentEventToRemote(normal, { kind: 'profer_event', event: nested })).toBe(false)
    expect(mayPublishAgentEventToRemote(normal, { kind: 'profer_event', event: { related_session_ids: [hidden] } })).toBe(false)
    expect(mayPublishAgentEventToRemote(normal, { kind: 'profer_event', event: { text: hidden, sessionId: normal } })).toBe(true)
  })
  test('embedded session.id and projection upsert cannot disclose hidden metadata', () => {
    expect(mayPublishAgentEventToRemote(normal, { kind: 'profer_event', event: { type: 'session_updated', session: { id: hidden } } })).toBe(false)
    expect(mayPublishAgentEventToRemote(normal, { kind: 'session_projection', operation: 'upsert', session: { id: hidden } })).toBe(false)
    expect(mayPublishAgentEventToRemote(normal, { kind: 'profer_event', event: { type: 'session_updated', session: { id: normal } } })).toBe(true)
    expect(mayPublishAgentEventToRemote(normal, { kind: 'sdk_message', message: { text: hidden } })).toBe(true)
  })
  test('invalid control event depth fails closed; replay filters old records', () => {
    let huge: Record<string, unknown> = { text: 'ordinary text' }
    for (let n = 0; n < 40; n++) huge = { wrapper: huge }
    expect(mayPublishAgentEventToRemote(normal, { kind: 'profer_event', event: huge })).toBe(false)
    const records = [
      { sessionId: normal, payload: { kind: 'profer_event', event: { type: 'session_updated', session: { id: hidden } } } },
      { sessionId: normal, payload: { kind: 'profer_event', event: { type: 'run_idle', sessionId: normal } } },
      { sessionId: hidden, payload: { kind: 'profer_event', event: { type: 'run_idle', sessionId: hidden } } },
    ]
    expect(selectOrdinaryRemoteReplayRecords(records)).toEqual(records.slice(1, 2))
  })
})

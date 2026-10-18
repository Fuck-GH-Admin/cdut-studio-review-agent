/** 仅供本轮独立 profile 的 P02 Electron 验收诊断；生产 Main / IPC / EventBus 保持原实现。 */
import './p06-u1-main'
import { createHash, randomUUID } from 'node:crypto'
import { chmodSync, readFileSync, statSync } from 'node:fs'
import { dirname } from 'node:path'
import { agentEventBus, emitSessionStreamEvent, getMainRendererWebContents } from '../../apps/electron/src/main/lib/agent-service'
import { publishAgentSessionProjection } from '../../apps/electron/src/main/lib/agent-session-ui-projection-publisher'
import { buildAgentSessionUiProjection } from '../../apps/electron/src/main/lib/agent-session-ui-projection'
import { getAgentSessionsIndexPath } from '../../apps/electron/src/main/lib/config-paths'

const qa = (globalThis as typeof globalThis & { __p06Live: Record<string, unknown> }).__p06Live
const indexPath = getAgentSessionsIndexPath()
const indexDir = dirname(indexPath)
let savedDirMode: number | null = null
const trackedSessionIds = new Set<string>()
const mainBusEvents: Array<{ sessionId: string; payload: unknown; at: string }> = []
agentEventBus.on((sessionId, payload) => {
  if (trackedSessionIds.has(sessionId)) mainBusEvents.push({ sessionId, payload, at: new Date().toISOString() })
})
Object.assign(qa, {
  p02MainBusEvents: mainBusEvents,
  p02TrackSession(sessionId: string) { trackedSessionIds.add(sessionId) },
  p02PublishOldProjection(meta: Parameters<typeof publishAgentSessionProjection>[0]) {
    publishAgentSessionProjection(meta)
  },
  p02EmitLateSdk(sessionId: string) {
    const webContents = getMainRendererWebContents()
    const payload = {
      kind: 'sdk_message' as const,
      message: {
        type: 'user',
        uuid: randomUUID(),
        message: { role: 'user', content: [{ type: 'text', text: 'P02_R02_STALE_SYNTHETIC_SDK' }] },
      },
    }
    emitSessionStreamEvent(sessionId, payload as never, webContents)
    return { fallbackWindowAvailable: !!webContents, messageType: 'synthetic-user' }
  },
  p02IndexSnapshot() {
    try {
      const bytes = readFileSync(indexPath)
      return {
        sha256: createHash('sha256').update(bytes).digest('hex'),
        bytes: bytes.byteLength,
        directoryMode: statSync(indexDir).mode & 0o777,
      }
    } catch (error) {
      return { error: String(error), directoryMode: statSync(indexDir).mode & 0o777 }
    }
  },
  p02LockIndexDirectory() {
    if (savedDirMode === null) savedDirMode = statSync(indexDir).mode & 0o777
    chmodSync(indexDir, savedDirMode & ~0o222)
    return { directoryMode: statSync(indexDir).mode & 0o777, indexBytes: readFileSync(indexPath).byteLength }
  },
  p02UnlockIndexDirectory() {
    if (savedDirMode !== null) chmodSync(indexDir, savedDirMode)
    savedDirMode = null
    return { directoryMode: statSync(indexDir).mode & 0o777 }
  },
  p02Environment() {
    return { pid: process.pid, config: process.env.PROFER_CONFIG_DIR, userData: process.env.PROFER_USER_DATA_DIR,
      indexFileBytes: (() => { try { return statSync(indexPath).size } catch { return 0 } })(), versions: process.versions }
  },
  p02ProjectProjection(meta: Parameters<typeof buildAgentSessionUiProjection>[0]) {
    const payload = { kind: 'session_projection' as const, operation: 'upsert' as const,
      session: buildAgentSessionUiProjection(meta) }
    agentEventBus.emit(meta.id, payload)
    return payload
  },
})

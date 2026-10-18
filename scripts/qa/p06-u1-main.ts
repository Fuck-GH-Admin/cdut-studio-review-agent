/** 只在隔离 profile 中的诊断入口；导入真实应用，不替换 Pi/provider。 */
import '../../apps/electron/src/main/index'
import { PiAgentAdapter } from '../../apps/electron/src/main/lib/adapters/pi-agent-adapter'
import { AgentOrchestrator } from '../../apps/electron/src/main/lib/agent-orchestrator'
import * as assignments from '../../apps/electron/src/main/lib/review/review-agent-assignment'
import * as sessions from '../../apps/electron/src/main/lib/agent-session-manager'
import * as runs from '../../apps/electron/src/main/lib/review/run-store-v2'
import * as binding from '../../apps/electron/src/main/lib/review/pi-case-review-service'
import { getBackgroundPiReviewState } from '../../apps/electron/src/main/lib/review/review-background-state'
import { open as openInspector } from 'node:inspector'
import { stopAgentAndWait, isAgentSessionActive } from '../../apps/electron/src/main/lib/agent-service'
import { runAgent } from '../../apps/electron/src/main/lib/agent-service'
import * as channels from '../../apps/electron/src/main/lib/channel-manager'
import { BrowserWindow, app } from 'electron'
import { executeParseDocumentTool } from '../../apps/electron/src/main/lib/document-parse-tools'
import { parseFileIntoSourceDocument } from '../../apps/electron/src/main/lib/review/document-service'

if (!process.env.QA_PROFILE_ROOT || process.env.PROFER_CONFIG_DIR !== `${process.env.QA_PROFILE_ROOT}/config`
  || !process.env.PROFER_USER_DATA_DIR?.startsWith(process.env.QA_PROFILE_ROOT)) {
  throw new Error('诊断入口只允许指定的独立 profile')
}
const events: Record<string, unknown>[] = []
const qa = {
  events, assignments, sessions, runs, binding, getBackgroundPiReviewState, stopAgentAndWait, isAgentSessionActive,
  captured: new Map<string, { callback: NonNullable<Parameters<AgentOrchestrator['sendMessage']>[0]['onRunOutcome']>; input: Parameters<AgentOrchestrator['sendMessage']>[0] }>(),
  gateNextStop: false, stopEntered: false, stopPending: false,
  releaseStop: undefined as undefined | (() => void),
  actualStopFinished: false,
  versions: process.versions,
  channels, executeParseDocumentTool, parseFileIntoSourceDocument,
  environment: { config: process.env.PROFER_CONFIG_DIR, userData: app.getPath('userData'), pid: process.pid },
  runAgent: (input: Parameters<typeof runAgent>[0]) => runAgent(input, BrowserWindow.getAllWindows()[0]!.webContents),
}
const originalQuery = PiAgentAdapter.prototype.query
PiAgentAdapter.prototype.query = async function* (...args: Parameters<PiAgentAdapter['query']>) {
  events.push({ at: new Date().toISOString(), event: 'real-pi-query-entered', sessionId: args[0].sessionId })
  for await (const message of originalQuery.apply(this, args)) {
    if (message.type === 'assistant') {
      const usage = message.message?.usage
      events.push({ at: new Date().toISOString(), event: 'real-pi-assistant-received', inputTokens: usage?.input_tokens ?? 0, outputTokens: usage?.output_tokens ?? 0 })
    }
    yield message
  }
}
const originalSend = AgentOrchestrator.prototype.sendMessage
AgentOrchestrator.prototype.sendMessage = function (input, callbacks) {
  if (input.onRunOutcome) qa.captured.set(input.sessionId, { callback: input.onRunOutcome, input })
  events.push({ at: new Date().toISOString(), event: 'real-sendMessage-entered', reviewOutcomeCaptured: !!input.onRunOutcome })
  return originalSend.call(this, input, {
    ...callbacks,
    onRunOwned: () => { events.push({ at: new Date().toISOString(), event: 'real-onRunOwned', sessionId: input.sessionId }); callbacks.onRunOwned?.() },
  }).catch(error => {
    events.push({ at: new Date().toISOString(), event: 'real-sendMessage-rejected', sessionId: input.sessionId, error: String(error) })
    throw error
  })
}
const originalStop = AgentOrchestrator.prototype.stopAndWait
AgentOrchestrator.prototype.stopAndWait = async function (sessionId, timeoutMs) {
  if (!qa.gateNextStop) return originalStop.call(this, sessionId, timeoutMs)
  qa.gateNextStop = false
  qa.stopEntered = true; qa.stopPending = true; qa.actualStopFinished = false
  const completion = this['runCompletions'].get(sessionId)
  if (!completion) throw new Error('没有真实 executor completion，拒绝伪造停止窗口')
  const gate = new Promise<void>(resolve => { qa.releaseStop = resolve })
  // 原 stopAndWait 真正等待 executor completion + 显式释放的测试闸门。
  // 真实 stop/abort/provider/收尾仍由原方法执行。
  completion.promise = completion.promise.then(async () => {
    qa.actualStopFinished = true
    events.push({ at: new Date().toISOString(), event: 'real-executor-completion-before-stop-gate' })
    await gate
  })
  events.push({ at: new Date().toISOString(), event: 'real-stopAndWait-pending-gate' })
  try { await originalStop.call(this, sessionId, timeoutMs ?? 60000) }
  finally { qa.stopPending = false; events.push({ at: new Date().toISOString(), event: 'real-stopAndWait-returned' }) }
}
Object.assign(globalThis, { __p06Live: qa })
const inspectorPort = Number(process.env.QA_MAIN_PORT)
if (!Number.isInteger(inspectorPort) || inspectorPort < 1024) throw new Error('必须指定独立 Main 调试端口')
openInspector(inspectorPort, '127.0.0.1')

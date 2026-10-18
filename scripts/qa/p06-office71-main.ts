/** 仅在 P06 Office71 独立 profile 下给真实 Electron Main 提供窄诊断桥。 */
import '../../apps/electron/src/main/index'
import { open as openInspector } from 'node:inspector'
import { app } from 'electron'
import {
  executeParseDocumentTool,
  executeReadDocumentArtifact,
  materializeToWorkspace,
  resolveDocumentAnchor,
  type ParseDocumentResult,
} from '../../apps/electron/src/main/lib/document-parse-tools'

const rawRoot = process.env.P06_OFFICE71_RAW_ROOT
const materialRoot = process.env.P06_OFFICE71_MATERIAL_ROOT
const profileRoot = process.env.QA_PROFILE_ROOT
if (!rawRoot || !materialRoot || !profileRoot
  || materialRoot !== `${rawRoot}/materials`
  || process.env.PROFER_CONFIG_DIR !== `${profileRoot}/config`
  || process.env.PROFER_USER_DATA_DIR !== `${profileRoot}/user-data`
  || !profileRoot.startsWith(`${rawRoot}/profile`)) {
  throw new Error('Office71 Main 诊断桥拒绝非本轮隔离 profile')
}

const bridge = {
  versions: process.versions,
  environment: {
    rawRoot,
    materialRoot,
    profileRoot,
    config: process.env.PROFER_CONFIG_DIR,
    userData: app.getPath('userData'),
    pid: process.pid,
  },
  parse(filePath: string, agentCwd: string) {
    return executeParseDocumentTool({ filePath }, { agentCwd, allowedRoots: [materialRoot] })
  },
  read(file: string, agentCwd: string) {
    return executeReadDocumentArtifact({ file }, { agentCwd, allowedRoots: [materialRoot] })
  },
  anchor(anchor: string, agentCwd: string) {
    return resolveDocumentAnchor(anchor, { candidateDirs: [agentCwd] })
  },
  materialize(filePath: string, agentCwd: string, parsed: ParseDocumentResult, preferredFileId?: string) {
    return materializeToWorkspace(filePath, agentCwd, parsed, preferredFileId)
  },
  quit() {
    app.quit()
  },
}
Object.assign(globalThis, { __p06Office71: bridge })

const inspectorPort = Number(process.env.QA_MAIN_PORT)
if (!Number.isInteger(inspectorPort) || inspectorPort < 1024) {
  throw new Error('Office71 Main 必须使用显式隔离 Inspector 端口')
}
openInspector(inspectorPort, '127.0.0.1')

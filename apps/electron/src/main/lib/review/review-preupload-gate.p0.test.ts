/** R02 T03-B P0：真实入口拒绝测试，不触碰任何真实敏感材料。 */
import { afterAll, describe, expect, test } from 'bun:test'
import { existsSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  assertReviewPreuploadAllowed, REVIEW_PREUPLOAD_OFFLINE_NOTICE,
  reviewPreuploadDecisionAllows, type ReviewPreuploadDecision,
} from './review-preupload-gate'

// 测试 preload 的正向虚构许可在本 P0 测试中禁用；与生产缺省无授权等价。
process.env.PROFER_REVIEW_TEST_PREUPLOAD_BLOCK = '1'

const root = mkdtempSync(join(tmpdir(), 'review-preupload-p0-'))
process.env.PROFER_CONFIG_DIR = join(root, 'config')
afterAll(() => {
  delete process.env.PROFER_REVIEW_TEST_PREUPLOAD_BLOCK
  rmSync(root, { recursive: true, force: true })
})
const secretMarker = 'SYNTHETIC_TEST_ONLY_DO_NOT_SEND_OR_COPY'

function blocked(task: () => unknown): void {
  expect(task).toThrow('REVIEW_PREUPLOAD_DENIED')
}
function noCaseWritten(): void {
  expect(existsSync(join(root, 'config', 'review-cases'))).toBeFalse()
}

describe('T03-B 共享 Main 预接收安全门禁', () => {
  test('默认未知、明确拒绝、超时、故障均 fail-closed；只返回静态离线说明', () => {
    for (const phase of [
      'create-case', 'picker', 'drop', 'clipboard', 'zip', 'restore',
      'read', 'persist', 'parse', 'ocr', 'index', 'model',
    ] as const) {
      blocked(() => assertReviewPreuploadAllowed(phase))
    }
    process.env.PROFER_REVIEW_TEST_PREUPLOAD_BLOCK = 'throw'
    blocked(() => assertReviewPreuploadAllowed('persist'))
    process.env.PROFER_REVIEW_TEST_PREUPLOAD_BLOCK = '1'
    expect(REVIEW_PREUPLOAD_OFFLINE_NOTICE).toContain('线下获准环境')
    expect(REVIEW_PREUPLOAD_OFFLINE_NOTICE).not.toContain(secretMarker)
    const approval: ReviewPreuploadDecision = {
      classification: 'ordinary', environment: 'local-controlled', authorization: 'confirmed',
      externalModelAuthorized: false, expiresAt: Date.now() + 5000,
    }
    expect(reviewPreuploadDecisionAllows(undefined, 'read', {})).toBeFalse()
    expect(reviewPreuploadDecisionAllows({ ...approval, authorization: 'unknown' }, 'read', {})).toBeFalse()
    expect(reviewPreuploadDecisionAllows({ ...approval, authorization: 'denied' }, 'read', {})).toBeFalse()
    expect(reviewPreuploadDecisionAllows({ ...approval, classification: 'unknown' }, 'read', {})).toBeFalse()
    expect(reviewPreuploadDecisionAllows({ ...approval, classification: 'invalid' as never }, 'read', {})).toBeFalse()
    expect(reviewPreuploadDecisionAllows({ ...approval, expiresAt: 1 }, 'read', {})).toBeFalse()
    expect(reviewPreuploadDecisionAllows({ ...approval, environment: 'unknown' }, 'read', {})).toBeFalse()
    expect(reviewPreuploadDecisionAllows(approval, 'read', {})).toBeTrue()
    expect(reviewPreuploadDecisionAllows(approval, 'model', { modelDestination: 'https://example.invalid' })).toBeFalse()
    expect(reviewPreuploadDecisionAllows({ ...approval, externalModelAuthorized: true,
      modelDestination: 'https://permitted.invalid' }, 'model', { modelDestination: 'https://different.invalid' })).toBeFalse()
    const secret = { ...approval, classification: 'classified' as const, environment: 'approved-secure' as const }
    expect(reviewPreuploadDecisionAllows(secret, 'read', {})).toBeTrue()
    expect(reviewPreuploadDecisionAllows({ ...secret, externalModelAuthorized: true,
      modelDestination: 'local-model' }, 'model', { modelDestination: 'local-model' })).toBeFalse()
  })

  test('文件选择/拖入和批量目录/ZIP：在 hash、解包、解析、缓存或建案之前拒绝', async () => {
    const source = join(root, 'ordinary-looking.pdf')
    const zip = join(root, 'possible-sensitive.zip')
    writeFileSync(source, secretMarker)
    writeFileSync(zip, Buffer.from(secretMarker))
    const { buildT06SelectionFromPath, commitT06PhysicalImport } = await import('./review-v3-t06-main-service')
    blocked(() => buildT06SelectionFromPath(root, 'folder'))
    blocked(() => buildT06SelectionFromPath(zip, 'zip'))
    await expect(commitT06PhysicalImport({
      requestId: 'retry-unauthorized', selectionId: 'stale', previewFingerprint: 'stale',
      batchName: '不得建立', groups: [{ groupId: 'g1', action: 'create', entryIds: ['e1'] }],
    })).rejects.toThrow('REVIEW_PREUPLOAD_DENIED')
    const { registerMaterial } = await import('./material-service')
    await expect(registerMaterial('untrusted-case', {
      requestId: 'drop-bypass', actor: { actorId: 'renderer', role: 'reviewer', actorSource: 'local' },
      expectedRevision: 0, payload: { sourcePath: source, role: 'evidence' },
    })).rejects.toThrow('REVIEW_PREUPLOAD_DENIED')
    expect(readdirSync(root).sort()).toEqual(['ordinary-looking.pdf', 'possible-sensitive.zip'])
    noCaseWritten()
  })

  test('剪贴板/IPC 路径即便伪造已批准角色，Main API 也不能进入材料服务', async () => {
    blocked(() => assertReviewPreuploadAllowed('clipboard', { caseId: 'fake' }))
    blocked(() => assertReviewPreuploadAllowed('drop', { caseId: 'fake' }))
    const { createNativeWorkspaceCaseV3 } = await import('./native-workspace-case-v3')
    await expect(createNativeWorkspaceCaseV3({
      title: '不应建立的数字案卷', type: '自定义审核', applicant: '测试人',
      domainPackId: 'contract-review', reviewTemplate: null,
    })).rejects.toThrow('REVIEW_PREUPLOAD_DENIED')
    noCaseWritten()
  })

  test('真实审核 IPC handler：伪造授权 JSON 不能触发文件选择、预览或模型运行', async () => {
    const { REVIEW_IPC_CHANNELS } = await import('@profer/shared')
    const { registerReviewIpc } = await import('./review-ipc')
    const hooks = (globalThis as typeof globalThis & {
      __proferElectronTestHooks?: { ipcMainHandlers: Map<string, (...args: unknown[]) => unknown> }
    }).__proferElectronTestHooks
    expect(hooks).toBeDefined()
    hooks!.ipcMainHandlers.clear()
    registerReviewIpc()
    const invoke = (channel: string, payload: unknown): unknown => {
      const handler = hooks!.ipcMainHandlers.get(channel)
      if (!handler) throw new Error('测试 IPC handler 未注册：' + channel)
      return handler({}, payload)
    }
    await expect(Promise.resolve(invoke(REVIEW_IPC_CHANNELS.IMPORT_DOCUMENT, {
      caseId: 'fictional', role: 'evidence', classification: 'public',
      authorization: 'confirmed', schoolApproval: true,
    }))).rejects.toThrow('REVIEW_PREUPLOAD_DENIED')
    blocked(() => invoke(REVIEW_IPC_CHANNELS.GET_WORKSPACE_DOCUMENT_PREVIEW_PATH,
      { caseId: 'fictional', documentVersionId: 'doc-v1', approved: true }))
    blocked(() => invoke(REVIEW_IPC_CHANNELS.RUN_REVIEW, 'fictional'))
    noCaseWritten()
  })

  test('B2 ZIP staging、持久 checkpoint、恢复/重试在复制字节之前拒绝', async () => {
    const { ReviewB2StagingService } = await import('./review-intake-adapter-v3-b2')
    const { ReviewB2ArchiveVault } = await import('./review-import-checkpoint-v3-b2')
    const { stageReviewB2TrustedZip } = await import('./review-zip-staging-v3-b2')
    const context = { senderId: 1, frameId: 2, ownerId: 'owned', ownerGeneration: 1, caseCandidateId: 'candidate' }
    const staging = new ReviewB2StagingService()
    const grant = staging.grant(context)
    blocked(() => staging.stage(context, grant.token, {
      requestId: 'req', fileName: 'material.txt', physicalSourceKey: 'native',
      bytes: Buffer.from(secretMarker), role: 'unassigned',
    }))
    blocked(() => stageReviewB2TrustedZip(context, staging, {
      physicalArchiveKey: 'native', requestId: 'req', bytes: Buffer.from(secretMarker),
    }))
    const vaultDir = join(root, 'checkpoint')
    const vault = new ReviewB2ArchiveVault(staging, vaultDir)
    blocked(() => vault.saveAndStage(context, {
      physicalArchiveKey: 'native', requestId: 'req', bytes: Buffer.from(secretMarker),
    }))
    blocked(() => vault.prepareRestage(context, 'a'.repeat(40)))
    expect(existsSync(vaultDir)).toBeFalse()
    noCaseWritten()
  })

  test('OCR / PDF-Office parser / source index：未调用解析器且未生成临时文件', async () => {
    let engineCalls = 0
    const ocr = { recognize: async () => { engineCalls++; throw new Error('engine must never run') } }
    const { parseT02VisualMaterialWithOcr } = await import('./review-v3-t02-visual-ocr')
    await expect(parseT02VisualMaterialWithOcr({
      filePath: join(root, 'not-available.pdf'), fileName: 'not-available.pdf', role: 'evidence',
      ocr: ocr as never,
    })).rejects.toThrow('REVIEW_PREUPLOAD_DENIED')
    const { previewT02StagedVisualOcr } = await import('./review-v3-t02-staged-visual-ocr')
    const trap = { assertStillGranted: () => { engineCalls++ } }
    await expect(previewT02StagedVisualOcr({} as never, trap as never, 'id', ocr as never))
      .rejects.toThrow('REVIEW_PREUPLOAD_DENIED')
    const { ReviewB2SourceVersionAdapter } = await import('./review-source-version-adapter-v3-b2')
    await expect(new ReviewB2SourceVersionAdapter(trap as never).parse({} as never, {} as never))
      .rejects.toThrow('REVIEW_PREUPLOAD_DENIED')
    const { buildTextSourceIndex, saveSourceIndex } = await import('./source-index')
    blocked(() => buildTextSourceIndex('v1', secretMarker))
    blocked(() => saveSourceIndex('case1', { documentVersionId: 'v1', parseRevision: 1,
      engine: 'text', engineVersion: '1', entries: [] }))
    expect(engineCalls).toBe(0)
    expect(existsSync(join(root, 'config', 'review-cases', 'case1', 'source-index'))).toBeFalse()
  })

  test('统一模型网关拒绝正文、OCR 文本和 metadata 出站（零 fetch）', async () => {
    let outbound = 0
    const before = globalThis.fetch
    globalThis.fetch = (async () => { outbound++; throw new Error('network must never run') }) as typeof fetch
    try {
      const { chatCompletion } = await import('./review-model-gateway')
      await expect(chatCompletion({ provider: 'openai', name: 'fake', baseUrl: 'https://example.invalid',
        models: [{ id: 'fake' }] } as never, [
        { role: 'user', content: secretMarker },
        { role: 'user', content: [{ type: 'text', text: 'OCR ' + secretMarker }] },
      ])).rejects.toThrow('REVIEW_PREUPLOAD_DENIED')
      expect(outbound).toBe(0)
    } finally { globalThis.fetch = before }
  })

  test('Pi 专属模型和工具执行器在初始化 SDK/创建 transcript 前拒绝', async () => {
    let sdkLoads = 0
    let queries = 0
    const { createPiReviewModelClient } = await import('./pi-review-agent-client')
    const client = createPiReviewModelClient({
      channel: { id: 'test', name: 'fake', provider: 'openai', baseUrl: 'https://example.invalid',
        models: [{ id: 'fake' }] } as never,
      apiKey: 'not-a-key', model: 'fake', cwd: root, piAgentDir: root,
      loadSdk: async () => { sdkLoads++; throw new Error('SDK must never load') },
      query: async function* () { queries++; yield {} as never },
    })
    await expect(client.complete({ prompt: secretMarker, system: 'review' }))
      .rejects.toThrow('REVIEW_PREUPLOAD_DENIED')
    expect(sdkLoads).toBe(0)
    expect(queries).toBe(0)
  })
})

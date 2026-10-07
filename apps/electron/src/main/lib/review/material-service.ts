/**
 * 材料登记与案卷提交（G01，docs/design/review-agent/复查报告断点 1：V2 无上传/提交入口）
 *
 * - registerMaterialFromFile：系统选择框 → 复制原件进 source-docs/{versionId}/ →
 *   字节 SHA-256 + DocumentVersion 条目（经聚合命令事务，revision 统一 +1）
 * - submitCase：draft → submitted，创建首阶段任务（stage-workflow.ensureInitialTask）
 * 原件不可变：同名重复上传形成新版本（versionId 递增），不覆盖
 */

import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join } from 'node:path'
import type { Actor, DocumentVersion, TemplateVersion } from '@profer/shared'
import { CommandValidationError, readAggregate, submitCommand } from './case-store-v2'
import { getConfigDir } from '../config-paths'

const IMAGE_MIME_PREFIX = 'image/'

/** 复制原件进案卷并返回字节 hash 与相对 assetKey */
function copyAsset(caseId: string, versionId: string, sourcePath: string): { byteHash: string; assetKey: string; sizeBytes: number } {
  if (!existsSync(sourcePath)) throw new CommandValidationError('VALIDATION_FAILED', `源文件不存在: ${sourcePath}`)
  const dir = join(getConfigDir(), 'review-cases', caseId, 'source-docs', versionId)
  mkdirSync(dir, { recursive: true })
  const bytes = readFileSync(sourcePath)
  const fileName = sourcePath.split(/[\\/]/).pop() ?? 'material.bin'
  const target = join(dir, fileName)
  copyFileSync(sourcePath, target)
  return {
    byteHash: createHash('sha256').update(bytes).digest('hex'),
    assetKey: `source-docs/${versionId}/${fileName}`,
    sizeBytes: bytes.length,
  }
}

function guessMime(fileName: string): string {
  const ext = fileName.toLowerCase().split('.').pop() ?? ''
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'].includes(ext)) return `image/${ext === 'jpg' ? 'jpeg' : ext}`
  if (ext === 'pdf') return 'application/pdf'
  if (['md', 'txt'].includes(ext)) return 'text/plain'
  if (ext === 'csv') return 'text/csv'
  return 'application/octet-stream'
}

export interface RegisterMaterialPayload {
  sourcePath: string
  role: DocumentVersion['role']
  materialSlotId?: string
}

/** 登记材料（命令事务）：新 DocumentVersion 进聚合；同名再登记产生新版本 */
export async function registerMaterial(caseId: string, command: { requestId: string; actor: Actor; expectedRevision: number; payload: RegisterMaterialPayload }): Promise<unknown> {
  return submitCommand<RegisterMaterialPayload, DocumentVersion>(caseId, { ...command, type: 'RegisterMaterial' }, (aggregate, payload) => {
    if (aggregate.caseV2.stage === 'archived') throw new CommandValidationError('INVALID_TRANSITION', '已归档案卷不可登记材料')
    const sourcePath = payload.sourcePath
    if (!sourcePath) throw new CommandValidationError('VALIDATION_FAILED', '缺少源文件路径')
    // 版本链语义（复查 §5.9）：同槽位 + 同文件名 = 同一逻辑材料的新版本；不同槽位各自独立
    const incomingName = sourcePath.split(/[\\/]/).pop() ?? 'material.bin'
    const sameLogic = aggregate.caseV2.documents.filter((doc) => doc.fileName === incomingName && doc.materialSlotId === payload.materialSlotId)
    const versionSeq = sameLogic.length + 1
    const documentId = `doc-${aggregate.caseV2.documents.length + 1}-${Date.now().toString(36)}`
    const versionId = `${documentId}-v${versionSeq}`
    const { byteHash, assetKey, sizeBytes } = copyAsset(caseId, versionId, sourcePath)
    return {
      summary: `登记材料 ${incomingName}（${versionId}）`,
      mutate: (draft) => {
        // 同槽位同名旧版本停止参与新审核（supersedes：同 slotId+name 才替换）
        const docs = draft.caseV2.documents.map((doc) => (doc.fileName === incomingName && doc.materialSlotId === payload.materialSlotId ? { ...doc, active: false, supersedesVersionId: doc.versionId === doc.versionId ? undefined : doc.versionId } : doc))
        const doc: DocumentVersion = {
          documentId,
          versionId,
          contentHash: byteHash, // N2c 阶段解析前先以字节 hash 兼作内容指纹
          role: payload.role,
          materialSlotId: payload.materialSlotId,
          fileName: incomingName,
          mimeType: guessMime(incomingName),
          sizeBytes,
          assetPath: assetKey,
          parseRevision: 0,
          parseStatus: 'pending',
          blocks: [],
          usage: 'registered',
        }
        doc.byteHash = byteHash
        doc.active = true
        draft.caseV2.documents = [...docs, doc]
      },
      entity: undefined,
    }
  })
}

/** 从聚合读材料（含 byteHash/active 扩展字段） */
export function listMaterials(caseId: string): Array<DocumentVersion & { byteHash?: string; active?: boolean }> {
  return readAggregate(caseId)?.caseV2.documents ?? []
}

/** 选择文件并登记（主进程对话框 → 命令事务）；返回登记后的版本 ID 列表 */
export async function pickAndRegisterMaterials(
  caseId: string,
  actor: Actor,
  role: DocumentVersion['role'],
  materialSlotId: string | undefined,
  dialog: { showOpenDialog(options: unknown): Promise<{ canceled: boolean; filePaths: string[] }> },
  browserWindow: unknown,
): Promise<string[]> {
  const options = {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: '审核材料', extensions: ['pdf', 'png', 'jpg', 'jpeg', 'md', 'txt', 'csv', 'doc', 'docx', 'xls', 'xlsx'] },
      { name: '全部文件', extensions: ['*'] },
    ],
  }
  const result = browserWindow
    ? await dialog.showOpenDialog(options)
    : await dialog.showOpenDialog(options)
  if (result.canceled || result.filePaths.length === 0) return []
  const versionIds: string[] = []
  // 逐个登记（同案串行事务天然有序）
  for (const sourcePath of result.filePaths) {
    const aggregate = readAggregate(caseId)
    if (!aggregate) throw new CommandValidationError('NOT_FOUND', `案卷聚合不存在: ${caseId}`)
    const outcome = (await registerMaterial(caseId, {
      requestId: `reg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      actor,
      expectedRevision: aggregate.caseV2.revision,
      payload: { sourcePath, role, materialSlotId },
    })) as { ok: boolean; code?: string; message?: string }
    if (!outcome.ok) throw new CommandValidationError('VALIDATION_FAILED', outcome.message ?? '登记失败')
    versionIds.push(sourcePath)
  }
  return versionIds
}

/** 提交案卷（draft → submitted；由 stage-workflow.ensureInitialTask 创建首阶段任务） */
export function canSubmit(aggregate: { caseV2: ReviewCaseAggregate }): { ok: boolean; reason?: string } {
  if (aggregate.caseV2.stage !== 'draft') return { ok: false, reason: `当前阶段 ${aggregate.caseV2.stage} 不可提交` }
  const required: string[] = []
  for (const slot of (aggregate as unknown as { template?: TemplateVersion }).template?.materialSlots ?? []) {
    if ((slot.requiredAt ?? 'submission') === 'submission' && slot.requiredWhen === undefined && aggregate.caseV2.documents.filter((doc) => doc.materialSlotId === slot.id && doc.active !== false).length < slot.minCount) {
      required.push(slot.name)
    }
  }
  if (required.length > 0) return { ok: false, reason: `缺少必需材料：${required.join('、')}` }
  if (aggregate.caseV2.documents.length === 0) return { ok: false, reason: '尚未登记任何材料' }
  return { ok: true }
}

type ReviewCaseAggregate = import('@profer/shared').ReviewCaseV2

export function materialsDirCaseId(caseId: string): string {
  return join(getConfigDir(), 'review-cases', caseId, 'source-docs')
}

export function countSourceFiles(caseId: string, versionId: string): number {
  const dir = join(getConfigDir(), 'review-cases', caseId, 'source-docs', versionId)
  if (!existsSync(dir)) return 0
  return readdirSync(dir).length
}

export const IMAGE_MIME = IMAGE_MIME_PREFIX

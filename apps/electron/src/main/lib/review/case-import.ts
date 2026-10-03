/**
 * 案卷文件导入（IPC IMPORT_DOCUMENT 实现）
 *
 * 流程：系统选择框（Electron dialog）→ 复制原件进案卷目录 → 解析为 SourceDocument → 写回案卷。
 *
 * 安全边界：文件读取与保存只在主进程发生；渲染进程只拿到解析结果，不接触原始路径。
 */

import { dialog, BrowserWindow } from 'electron'
import { copyFileSync, statSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import type { EvidenceDocument, RulePack, ReviewCase, SourceDocument } from '@profer/shared'
import { getCase, saveCase, updateCase, assertSafeId, getReviewCasesDir } from './case-store'
import { parseFileIntoSourceDocument } from './document-service'

/** 单文件大小上限（50MB，超过直接拒绝） */
const MAX_IMPORT_BYTES = 50 * 1024 * 1024

/**
 * 弹出系统选择框导入一份材料到案卷。
 *
 * @returns 解析后的 SourceDocument；用户取消选择时抛出带标记的错误文案
 */
export async function importDocumentIntoCase(input: {
  caseId: string
  fileName: string
  role: SourceDocument['role']
}): Promise<SourceDocument> {
  assertSafeId(input.caseId)
  const reviewCase = getCase(input.caseId)
  if (!reviewCase) throw new Error(`案卷不存在: ${input.caseId}`)

  const window = BrowserWindow.getAllWindows()[0]
  const options = {
    title: '导入审核材料',
    properties: ['openFile'] as Array<'openFile'>,
    filters: [
      {
        name: '审核材料',
        extensions: [
          // 文本类
          'md', 'txt', 'csv', 'json', 'svg',
          // 文档类（document-parser 覆盖的格式）
          'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
          // rtf/odt/ods/odp 解析未接通（M0/H15）：不再出现在可选过滤器，避免"选了却导入失败"（K15）
          // 图片类（走 Vision 识别）
          'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp',
        ],
      },
      { name: '全部文件', extensions: ['*'] },
    ],
  }
  // 无可用窗口时退化为无父窗口的对话框（showOpenDialog 静态方法两种签名都接受）
  const result = window ? await dialog.showOpenDialog(window, options) : await dialog.showOpenDialog(options)
  if (result.canceled || result.filePaths.length === 0) {
    throw new Error('已取消导入')
  }

  const filePath = result.filePaths[0]!
  const fileName = filePath.split(/[\\/]/).pop() ?? input.fileName

  // 体积校验：超过上限直接拒绝（避免超大文件拖垮解析与存储）
  const sizeBytes = statSync(filePath).size
  if (sizeBytes > MAX_IMPORT_BYTES) {
    throw new Error(`文件过大（${(sizeBytes / 1024 / 1024).toFixed(1)} MB），单文件上限 ${MAX_IMPORT_BYTES / 1024 / 1024} MB`)
  }

  // 复制原件进案卷存储目录（保持"原件按案卷保存"契约）；目录必须显式创建
  const docId = `doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const assetDir = join(getReviewCasesDir(), input.caseId, 'source-docs')
  if (!existsSync(assetDir)) mkdirSync(assetDir, { recursive: true })
  const storedFileName = `${docId}-${fileName}`
  copyFileSync(filePath, join(assetDir, storedFileName))

  // 原件在案卷目录内的相对路径：统一用正斜杠，保证跨平台落盘一致（图片块据此送 Vision）
  const assetRelativePath = `source-docs/${storedFileName}`

  // 解析（parseFileIntoSourceDocument 读取原件路径）
  const document = await parseFileIntoSourceDocument(filePath, fileName, input.role, assetRelativePath)
  const storedDocument: SourceDocument = { ...document, id: docId, origin: 'upload' }

  // 依据文件自动登记规则包：否则大纲生成与审核运行都找不到"依据包"（真机验证暴露的缺口）
  // M0/H05：只构造「新增」的包；写回时以队列内最新 rulePacks 为基底追加，不整体替换
  const newRulePack: RulePack | null =
    input.role === 'rule'
      ? {
          id: `pack-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          documentId: docId,
          // 名称取文件名去扩展名（用户可后续在 UI 改）；发布单位留空由用户补
          name: fileName.replace(/\.[^.]+$/, ''),
          publisher: '',
          academicYear: reviewCase.academicYear,
          version: 'v1',
          outline: [],
          confirmed: false,
        }
      : null

  // 写回案卷（M0/H05：逐案串行队列内读最新再定向追加，导入窗口内的其他写回不丢失；
  // 系统选择框打开期间案卷可能已变化，因此以队列内最新为基底，而不是调用前快照）
  await updateCase(
    input.caseId,
    (fresh) => ({
      ...fresh,
      documents: [...fresh.documents, storedDocument],
      rulePacks: newRulePack ? [...fresh.rulePacks, newRulePack] : fresh.rulePacks,
      // 证明材料同步登记证明卡（H01）：已收录、待识别——中栏立即可见，
      // 不再出现"导入成功但 0 份证明"；事实提取（识别）完成后更新为真实识别结果
      evidences:
        input.role === 'evidence' && !fresh.evidences.some((evidence) => evidence.documentId === docId)
          ? ([
              ...fresh.evidences,
              { documentId: docId, recognizedFacts: '', parseStatus: 'unrecognized', linkedItemIds: [] },
            ] as EvidenceDocument[])
          : fresh.evidences,
    }),
    { reason: `导入材料 ${fileName}（${storedDocument.parseStatus}）` },
  )
  console.log(
    `[审核专区] 已导入材料: ${fileName} → ${input.caseId}/${docId}（解析 ${storedDocument.parseStatus}` +
      `${input.role === 'rule' ? '，已登记规则包' : ''}）`,
  )
  return storedDocument
}

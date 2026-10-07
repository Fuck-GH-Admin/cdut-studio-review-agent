/**
 * 文档解析与切块（纯函数，不依赖 Electron）
 *
 * 把原始文件文本切成带稳定 ID 的 `ReviewDocumentBlock`：
 * - 块 ID = `blk-` + slugifyFileName(文件名去扩展名) + `-` + 三位序号（同输入切两次结果全等）
 * - 稳定 ID 是三栏联动的唯一锚点来源：AI 输出、mock 引擎、UI 高亮全部引用这一套 ID
 *
 * 格式策略：
 * - .md/.txt/.json 等按行识别 heading / list-item / paragraph
 * - .csv 首行（表头）→ heading，其余行 → table-cell（保留原始行文本）
 * - .svg 读文本抽取 <text> 内容进 imageAlt，产出单个 image 块
 * - .pdf/.doc/.docx/.xls/.xlsx/.ppt/.pptx 复用 document-parser 提取文本后按行切块
 * - 图片（png/jpg/jpeg/gif/webp/bmp）→ 单个 image 块 + imageAssetPath（相对案卷目录），
 *   状态 partial：纯文本管线读不到图内文字，需后续 Vision 送模型
 * - 其他二进制 → 单块 paragraph + parseStatus 'failed' + 中文原因
 */

import { readFile, stat, writeFile, mkdir } from 'node:fs/promises'
import { dirname, extname, join } from 'node:path'
import type { ReviewDocumentBlock, SourceDocument } from '@profer/shared'
import { extractDocxReviewContent, extractSpreadsheetReviewContent, extractTextFromFile } from '../document-parser'

/** 支持直接按文本切块的扩展名 */
const TEXT_EXTENSIONS = new Set(['.md', '.txt', '.csv', '.json'])

/** 文档类扩展名：交给 document-parser 的成熟解析器（PDF / Office / WPS 旧版 Word） */
const DOCUMENT_EXTENSIONS = new Set([
  '.pdf', '.doc', '.docx', '.docm', '.dot', '.dotx', '.dotm', '.wps', '.wpt',
  '.xls', '.xlsx', '.xlsm', '.xltx', '.xltm', '.et', '.ett',
  '.ppt', '.pptx', '.pptm', '.potx', '.potm', '.ppsx', '.ppsm', '.dps', '.dpt',
  '.rtf', '.odt', '.ods', '.odp',
])

/** 图片类扩展名：内容需经多模态模型识别，走 Vision 而非文本切块 */
const IMAGE_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp',
])

/** 文件名 slug 化：保留中文与字母数字，其余字符统一转 '-' */
export function slugifyFileName(name: string): string {
  // 先去掉扩展名（只去掉最后一段），避免 "报告.md" 变成 "报告-md"
  const withoutExt = name.includes('.') ? name.slice(0, name.lastIndexOf('.')) : name
  const slug = withoutExt
    .replace(/[^0-9a-zA-Z\u4e00-\u9fa5]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return slug.length > 0 ? slug : 'doc'
}

/** 生成文档内第 index（0 起）个块的稳定 ID */
function blockIdAt(slug: string, index: number): string {
  return `blk-${slug}-${String(index + 1).padStart(3, '0')}`
}

/**
 * 把一行文本归类为块类型（csv 由调用方单独处理）。
 * 以 `#` 开头 → heading；`-`/`*` 开头 → list-item；其余 → paragraph。
 */
function classifyLine(line: string): ReviewDocumentBlock['kind'] {
  if (line.startsWith('#')) return 'heading'
  if (line.startsWith('-') || line.startsWith('*')) return 'list-item'
  return 'paragraph'
}

/**
 * 按行把纯文本切成结构化块。
 *
 * 空行跳过；.csv 首行为 heading、其余行为 table-cell（text 保留原始行）。
 * page 恒为 1（demo 文档无分页概念）。
 */
export function parseTextIntoBlocks(fileName: string, text: string): ReviewDocumentBlock[] {
  const slug = slugifyFileName(fileName)
  const isCsv = extname(fileName).toLowerCase() === '.csv'

  const lines = text.split(/\r?\n/)
  const blocks: ReviewDocumentBlock[] = []
  let index = 0

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (line.length === 0) continue

    let kind: ReviewDocumentBlock['kind']
    if (isCsv) {
      // csv：第一行（表头）当标题，其余行当表格单元格行
      kind = blocks.length === 0 ? 'heading' : 'table-cell'
    } else {
      kind = classifyLine(line)
    }

    blocks.push({
      id: blockIdAt(slug, index),
      kind,
      // table-cell 保留原始行文本（不做逗号拆分：demo 需要原样可检索/高亮）
      text: line,
      page: 1,
    })
    index += 1
  }

  return blocks
}

/** 从 SVG 源码中抽取所有 <text>...</text> 的文本内容（拼成图片描述） */
function extractSvgText(svg: string): string {
  const matches = svg.match(/<text[^>]*>([\s\S]*?)<\/text>/gi)
  if (!matches) return ''
  return matches
    .map((tag) => tag.replace(/<[^>]+>/g, '').trim())
    .filter((t) => t.length > 0)
    .join('；')
}

/** MIME 粗映射（demo 只关心少数几种；未命中回落 application/octet-stream） */
function guessMimeType(ext: string): string {
  switch (ext) {
    case '.md': return 'text/markdown'
    case '.txt': return 'text/plain'
    case '.csv': return 'text/csv'
    case '.json': return 'application/json'
    case '.svg': return 'image/svg+xml'
    case '.pdf': return 'application/pdf'
    case '.doc': return 'application/msword'
    case '.docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    case '.docm': return 'application/vnd.ms-word.document.macroEnabled.12'
    case '.dot': return 'application/msword'
    case '.dotx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.template'
    case '.dotm': return 'application/vnd.ms-word.template.macroEnabled.12'
    case '.wps':
    case '.wpt': return 'application/vnd.ms-works'
    case '.xls': return 'application/vnd.ms-excel'
    case '.xlsx': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    case '.xlsm': return 'application/vnd.ms-excel.sheet.macroEnabled.12'
    case '.xltx': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.template'
    case '.xltm': return 'application/vnd.ms-excel.template.macroEnabled.12'
    case '.et':
    case '.ett': return 'application/vnd.ms-works'
    case '.ppt': return 'application/vnd.ms-powerpoint'
    case '.pptx': return 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    case '.pptm': return 'application/vnd.ms-powerpoint.presentation.macroEnabled.12'
    case '.potx': return 'application/vnd.openxmlformats-officedocument.presentationml.template'
    case '.potm': return 'application/vnd.ms-powerpoint.template.macroEnabled.12'
    case '.ppsx': return 'application/vnd.openxmlformats-officedocument.presentationml.slideshow'
    case '.ppsm': return 'application/vnd.ms-powerpoint.slideshow.macroEnabled.12'
    case '.dps':
    case '.dpt': return 'application/vnd.ms-works'
    case '.rtf': return 'application/rtf'
    case '.odt': return 'application/vnd.oasis.opendocument.text'
    case '.ods': return 'application/vnd.oasis.opendocument.spreadsheet'
    case '.odp': return 'application/vnd.oasis.opendocument.presentation'
    case '.png': return 'image/png'
    case '.jpg':
    case '.jpeg': return 'image/jpeg'
    case '.gif': return 'image/gif'
    case '.webp': return 'image/webp'
    case '.bmp': return 'image/bmp'
    default: return 'application/octet-stream'
  }
}

/** SourceDocument 公共字段：各分支只决定 parseStatus / blocks / parseError */
interface SourceDocumentDraft {
  fileName: string
  role: SourceDocument['role']
  mimeType: string
  sizeBytes: number
  importedAt: string
  parseStatus: SourceDocument['parseStatus']
  blocks: ReviewDocumentBlock[]
  parseError?: string
}

/**
 * 组装 SourceDocument：ID 与 origin 由模块统一决定，避免各分支重复拼装。
 *
 * parseError 仅在确有值时写入（不写空字符串/undefined），保持落盘 JSON 干净。
 */
function toSourceDocument(draft: SourceDocumentDraft): SourceDocument {
  return {
    id: `doc-${slugifyFileName(draft.fileName)}-${Date.now().toString(36)}`,
    fileName: draft.fileName,
    role: draft.role,
    mimeType: draft.mimeType,
    sizeBytes: draft.sizeBytes,
    parseStatus: draft.parseStatus,
    ...(draft.parseError === undefined ? {} : { parseError: draft.parseError }),
    blocks: draft.blocks,
    origin: 'upload',
    importedAt: draft.importedAt,
  }
}

/**
 * 解析单个文件为 SourceDocument。
 *
 * - 文本类（.md/.txt/.csv/.json）：读文本 → parseTextIntoBlocks，parseStatus 'parsed'
 * - .svg：读文本 → 抽 <text> 进 imageAlt → 单个 image 块（text 为空串）
 * - PDF / Office：document-parser 提取文本 → parseTextIntoBlocks（parsed）；
 *   提取为空 → partial + 中文原因（扫描件无文本层）；提取抛异常 → failed + 原始原因
 * - 图片（png/jpg/jpeg/gif/webp/bmp）：单个 image 块 + imageAssetPath，partial（待 Vision 识别）
 * - 其他二进制：单块 paragraph + text 空 + parseStatus 'failed' + parseError 中文说明
 *
 * @param filePath 文件绝对路径（用于读取内容）
 * @param fileName 展示用文件名（用于 slug / 类型判断；可与 filePath 不同）
 * @param role 文档在案卷中的角色
 * @param assetRelativePath 图片原件在案卷目录内的相对路径（如 `source-docs/doc-x-证书.png`），
 *   写入 imageAssetPath 供后续 Vision 送模型；非图片分支忽略
 * @param assetDirectory 案卷内 source-docs 目录；DOCX 提取的嵌入图片写入此目录供后续 Vision 使用
 */
export async function parseFileIntoSourceDocument(
  filePath: string,
  fileName: string,
  role: SourceDocument['role'],
  assetRelativePath?: string,
  assetDirectory?: string,
): Promise<SourceDocument> {
  const ext = extname(fileName).toLowerCase()
  const now = new Date().toISOString()
  const slug = slugifyFileName(fileName)
  const mimeType = guessMimeType(ext)

  // 文件大小：读失败按 0 处理（不阻塞解析）
  let sizeBytes = 0
  try {
    const info = await stat(filePath)
    sizeBytes = info.size
  } catch (error) {
    console.warn(`[审核专区] 读取文件大小失败: ${filePath}`, error)
  }

  /** 各分支共用的组装入口（ID / origin 由 toSourceDocument 统一决定） */
  const draftOf = (
    parseStatus: SourceDocument['parseStatus'],
    blocks: ReviewDocumentBlock[],
    parseError?: string,
  ): SourceDocument =>
    toSourceDocument({ fileName, role, mimeType, sizeBytes, importedAt: now, parseStatus, blocks, parseError })

  /** 解析失败时的占位块（不伪造内容，仅保证 UI 有可展示的锚点） */
  const placeholderBlocks = (): ReviewDocumentBlock[] => [
    { id: `blk-${slug}-001`, kind: 'paragraph', text: '', page: 1 },
  ]

  // 图片：产出单个 image 块并记录原件相对路径（供 Vision 送模型）；纯文本管线读不到图内文字，故为 partial
  if (IMAGE_EXTENSIONS.has(ext)) {
    return draftOf(
      'partial',
      [{ id: `blk-${slug}-001`, kind: 'image', text: '', page: 1, imageAssetPath: assetRelativePath }],
      '图片内容需经多模态模型识别',
    )
  }

  // DOCX 额外保留标题、列表、表格坐标与嵌入图片，避免 Mammoth 纯文本路径丢失结构。
  if (ext === '.docx') {
    try {
      const parsed = await extractDocxReviewContent(filePath)
      const imageExtension: Record<string, string> = {
        'image/png': '.png', 'image/jpeg': '.jpg', 'image/gif': '.gif', 'image/webp': '.webp', 'image/bmp': '.bmp',
      }
      const blocks: ReviewDocumentBlock[] = []
      let omittedImages = 0
      for (const parsedBlock of parsed.blocks) {
        const index = blocks.length
        if (parsedBlock.kind === 'image') {
          const image = parsedBlock.imageIndex === undefined ? undefined : parsed.images[parsedBlock.imageIndex]
          const imageExt = image ? imageExtension[image.contentType] : undefined
          let imageAssetPath: string | undefined
          if (image && imageExt && assetDirectory && assetRelativePath) {
            const embeddedName = `${slug}-embedded-${String(parsedBlock.imageIndex! + 1).padStart(3, '0')}${imageExt}`
            const targetPath = join(assetDirectory, embeddedName)
            await mkdir(dirname(targetPath), { recursive: true })
            await writeFile(targetPath, image.data)
            const slash = assetRelativePath.lastIndexOf('/')
            imageAssetPath = `${slash >= 0 ? assetRelativePath.slice(0, slash + 1) : ''}${embeddedName}`
          } else if (parsedBlock.imageIndex !== undefined) {
            omittedImages += 1
          }
          blocks.push({
            id: blockIdAt(slug, index), kind: 'image', text: '', page: 1,
            ...(parsedBlock.imageAlt ? { imageAlt: parsedBlock.imageAlt } : {}),
            ...(imageAssetPath ? { imageAssetPath } : {}),
          })
          continue
        }
        blocks.push({
          id: blockIdAt(slug, index), kind: parsedBlock.kind, text: parsedBlock.text, page: 1,
          ...(parsedBlock.table ? { table: parsedBlock.table } : {}),
        })
      }
      const extractedText = blocks.some((block) => block.text.trim())
      if (!extractedText && blocks.length === 0) {
        return draftOf('partial', [], 'DOCX 未提取到可审核文本或图片；需查看原件人工复核')
      }
      const warnings = [...parsed.warnings]
      if (omittedImages > 0) warnings.push(`${omittedImages} 张嵌入图片未保存为视觉材料，需查看原件人工复核`)
      const parseStatus: SourceDocument['parseStatus'] = warnings.length > 0 || omittedImages > 0 ? 'partial' : 'parsed'
      return draftOf(parseStatus, blocks, warnings.length > 0 ? [...new Set(warnings)].join('；') : undefined)
    } catch (error) {
      // 结构解析异常时保留原有纯文本兜底；明确标成 partial，不能伪装成完整结构解析。
      console.warn(`[审核专区] DOCX 结构解析失败，回退纯文本: ${filePath}`, error)
      try {
        const fallback = await extractTextFromFile(filePath)
        if (fallback.trim()) return draftOf('partial', parseTextIntoBlocks(fileName, fallback), 'DOCX 结构解析失败，已回退纯文本；表格、版式和嵌入图片可能未保留')
      } catch (fallbackError) {
        console.warn(`[审核专区] DOCX 纯文本兜底失败: ${filePath}`, fallbackError)
      }
      return draftOf('failed', placeholderBlocks(), `DOCX 解析失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  if (['.xls', '.xlsx', '.xlsm', '.xltx', '.xltm'].includes(ext)) {
    try {
      const parsed = extractSpreadsheetReviewContent(filePath)
      const blocks: ReviewDocumentBlock[] = parsed.blocks.map((cell, index) => ({
        id: blockIdAt(slug, index), kind: 'table-cell', text: cell.text, page: 1,
        table: { row: cell.row, column: cell.column, sheet: cell.sheet },
      }))
      if (blocks.length === 0) {
        return draftOf('partial', [], parsed.warnings.join('；') || 'Excel 未提取到有值的单元格，需查看原件人工复核')
      }
      return draftOf(parsed.warnings.length > 0 ? 'partial' : 'parsed', blocks, parsed.warnings.length > 0 ? parsed.warnings.join('；') : undefined)
    } catch (error) {
      console.warn(`[审核专区] Excel 单元格结构解析失败，回退纯文本: ${filePath}`, error)
      try {
        const fallback = await extractTextFromFile(filePath)
        if (fallback.trim()) return draftOf('partial', parseTextIntoBlocks(fileName, fallback), 'Excel 单元格结构解析失败，已回退纯文本；工作表和行列坐标可能未保留')
      } catch (fallbackError) {
        console.warn(`[审核专区] XLSX 纯文本兜底失败: ${filePath}`, fallbackError)
      }
      return draftOf('failed', placeholderBlocks(), `Excel 解析失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // 其他文档类（PDF / Office）：复用既有解析器提取文本，再走同一套纯文本切块管线
  if (DOCUMENT_EXTENSIONS.has(ext)) {
    let extracted = ''
    try {
      extracted = await extractTextFromFile(filePath)
    } catch (error) {
      // 不吞异常：解析器原始原因写进 parseError
      console.error(`[审核专区] 文档提取失败: ${filePath}`, error)
      return draftOf(
        'failed',
        placeholderBlocks(),
        `文档解析失败: ${error instanceof Error ? error.message : String(error)}`,
      )
    }

    // 提取为空（典型：扫描件 PDF 无文本层）→ partial，绝不假装解析成功
    if (extracted.trim().length === 0) {
      const label = ext.replace('.', '').toUpperCase()
      return draftOf(
        'partial',
        [],
        `${label} 未提取到文本内容（可能是扫描件或纯图片文档），需人工复核或 OCR 处理`,
      )
    }

    return draftOf('parsed', parseTextIntoBlocks(fileName, extracted))
  }

  // 其他二进制：明确告知不支持，不伪造解析结果
  if (!TEXT_EXTENSIONS.has(ext) && ext !== '.svg') {
    return draftOf('failed', placeholderBlocks(), '该格式暂不支持自动切块，请查看原件')
  }

  let text = ''
  try {
    text = await readFile(filePath, 'utf-8')
  } catch (error) {
    console.error(`[审核专区] 读取文件失败: ${filePath}`, error)
    return draftOf(
      'failed',
      placeholderBlocks(),
      `读取文件失败: ${error instanceof Error ? error.message : String(error)}`,
    )
  }

  // SVG：抽取 <text> 内容作 imageAlt，产出单个 image 块
  if (ext === '.svg') {
    const alt = extractSvgText(text)
    return draftOf('parsed', [{ id: `blk-${slug}-001`, kind: 'image', text: '', page: 1, imageAlt: alt }])
  }

  // 文本类：按行切块
  return draftOf('parsed', parseTextIntoBlocks(fileName, text))
}

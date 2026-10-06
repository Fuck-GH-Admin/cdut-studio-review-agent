/**
 * AI 速课堂 — 学习资料解析与大纲索引服务
 *
 * 职责：
 *   - 解析 PPT/PPTX、PDF、Docx/Doc、XLSX/XLS、MD/HTML/TXT 及图片等全格式学习资料；
 *   - 按章节（幻灯片 / PDF 页组 / 文档标题 / 段落块）抽取结构化大纲树与概念向导；
 *   - 只向模型注入轻量级大纲导航 Markdown，完整分块原文缓存到
 *     `~/.cdutai/study-materials/{sessionId}/{documentId}/index.json`，配合
 *     `study_inspect_section` 工具按需反向查阅，防止上下文爆炸；
 *   - 维护 `student-cognition.md` 学生认知档案（已掌握 / 待学未知 / 薄弱混淆三维清单）。
 *
 * 设计原则：绝不伪造原文；解析失败如实跳过并记录日志，不向索引写入猜测内容。
 */

import { existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { basename, extname, join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { pathToFileURL } from 'node:url'
import type {
  StudentCognitionProfile,
  StudyDocumentOutline,
  StudyDocumentSection,
  StudyDocumentType,
  StudyInspectSectionResult,
} from '@profer/shared'
import {
  ALLOWED_STUDY_EXTENSIONS,
  MAX_STUDY_DOCUMENTS_PER_SESSION,
  MAX_STUDY_DOCUMENT_SIZE_BYTES,
} from '@profer/shared'
import {
  getStudentCognitionPath,
  getStudyDocumentDir,
  getStudyDocumentIndexPath,
  getStudySessionDir,
} from '../config-paths'
import { readJsonFileSafe, writeJsonFileAtomic } from '../safe-file'
import { extractTextFromFile } from '../document-parser'
import { normalizeToMarkdown } from './markdown-normalizer'
import { chunkMarkdownSemantically } from './statistical-semantic-chunker'
import { ocrImageToMarkdown } from './ocr-engine'

// ===== 类型分类 =====

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.tiff', '.tif'])

function resolveDocumentType(filePath: string): StudyDocumentType {
  const ext = extname(filePath).toLowerCase()
  if (ext === '.pdf') return 'pdf'
  if (['.pptx', '.ppt', '.ppsx', '.pptm', '.potx', '.potm', '.odp'].includes(ext)) return 'pptx'
  if (['.docx', '.doc', '.docm', '.dotx', '.dotm', '.odt', '.rtf', '.wps', '.wpt'].includes(ext)) return 'docx'
  if (['.xlsx', '.xls', '.xlsm', '.xltx', '.xltm', '.ods', '.et', '.ett'].includes(ext)) return 'xlsx'
  if (IMAGE_EXTENSIONS.has(ext)) return 'image'
  if (['.md', '.markdown'].includes(ext)) return 'markdown'
  return 'text'
}

/** 是否为速课堂支持的资料扩展名（严格白名单准入） */
export function isStudyDocumentExtension(filePath: string): boolean {
  const ext = extname(filePath).toLowerCase()
  return (ALLOWED_STUDY_EXTENSIONS as readonly string[]).includes(ext)
}

/** 把已纯化的 Markdown 经统计语义切块，转为可落盘的结构化分块 */
function rawSectionsFromMarkdown(markdown: string): RawSection[] {
  return chunkMarkdownSemantically(markdown).map((chunk) => ({
    title: chunk.title.length > 40 ? `${chunk.title.slice(0, 40)}…` : chunk.title,
    level: chunk.level,
    content: chunk.content,
  }))
}

// ===== 分块参数 =====

/** 单块最小聚合字符数（过短会与相邻段落合并） */
const MIN_CHUNK_CHARS = 1200
/** 单块硬上限字符数（超过则强制切分） */
const MAX_CHUNK_CHARS = 2600
/** PDF 每多少个物理页聚合为一个章节块 */
const PDF_PAGES_PER_SECTION = 3

/** 原始分块（尚未分配 sectionId） */
interface RawSection {
  title: string
  level: number
  content: string
  pageRange?: [number, number]
}

// ===== 分块算法 =====

/** 从分块正文提取一句话摘要，供大纲导航展示 */
function summarize(content: string): string {
  const normalized = content.replace(/\s+/g, ' ').trim()
  if (!normalized) return '（本段无有效文本）'
  const sentenceEnd = normalized.search(/[。！？!?.]/)
  const head = sentenceEnd >= 0 ? normalized.slice(0, sentenceEnd + 1) : normalized
  return head.length > 80 ? `${head.slice(0, 80)}…` : head
}

/** 拼接段落块并保证不超过硬上限 */
function pushChunk(sections: RawSection[], buffer: string[]): void {
  const content = buffer.join('\n\n').trim()
  if (!content) return
  const firstLine = content.split('\n').map((line) => line.trim()).find(Boolean) ?? `第 ${sections.length + 1} 节`
  const title = firstLine.length > 40 ? `${firstLine.slice(0, 40)}…` : firstLine
  sections.push({ title, level: 1, content })
}

/** 按 Markdown / 文档标题递归生成目录大纲 */
function splitByHeadings(lines: string[], headingRegex: RegExp): RawSection[] {
  const sections: RawSection[] = []
  let currentTitle = '前言'
  let currentLevel = 1
  let buffer: string[] = []

  const flush = (): void => {
    const content = buffer.join('\n').trim()
    if (content) sections.push({ title: currentTitle, level: currentLevel, content })
    buffer = []
  }

  for (const line of lines) {
    const match = headingRegex.exec(line)
    if (match) {
      flush()
      currentTitle = match[2]!.trim()
      currentLevel = Math.min(match[1]!.length, 6)
      continue
    }
    buffer.push(line)
  }
  flush()

  // 标题切分过碎（大量空正文块被过滤后仅剩标题）时退回段落聚合，避免大纲失真。
  if (sections.length === 0) return splitByParagraphs(lines.join('\n'))
  return sections
}

/** 无显式标题时按空行分段聚合成块 */
function splitByParagraphs(text: string): RawSection[] {
  const sections: RawSection[] = []
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
  let buffer: string[] = []
  let bufferChars = 0

  for (const paragraph of paragraphs) {
    if (bufferChars >= MIN_CHUNK_CHARS && bufferChars + paragraph.length > MAX_CHUNK_CHARS) {
      pushChunk(sections, buffer)
      buffer = []
      bufferChars = 0
    }
    buffer.push(paragraph)
    bufferChars += paragraph.length
  }
  if (buffer.length > 0) pushChunk(sections, buffer)
  return sections
}

/** 通用文本分块：优先识别标题，其次段落聚合 */
function splitGenericText(text: string): RawSection[] {
  const lines = text.split('\n')
  const headingRegex = /^(#{1,6})\s+(.+?)\s*$/
  if (lines.some((line) => headingRegex.test(line))) {
    return splitByHeadings(lines, headingRegex)
  }
  return splitByParagraphs(text)
}

/** PDF 逐页文本（页序号从 1 开始） */
interface PdfPage {
  pageNumber: number
  text: string
}

/** 使用 pdfjs-dist 逐页提取 PDF 文本，从而得到可靠页码范围 */
async function extractPdfPages(filePath: string): Promise<PdfPage[]> {
  const pdfjs = (await import('pdfjs-dist/legacy/build/pdf.mjs')) as unknown as {
    GlobalWorkerOptions: { workerSrc: string }
    getDocument: (options: Record<string, unknown>) => { promise: Promise<PdfDocument> }
  }
  pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(require.resolve('pdfjs-dist/legacy/build/pdf.worker.mjs')).href

  const buffer = readFileSync(filePath)
  const pdf = await pdfjs.getDocument({
    data: new Uint8Array(buffer),
    disableFontFace: true,
    isEvalSupported: false,
    useWorkerFetch: false,
  }).promise

  try {
    const pages: PdfPage[] = []
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber)
      const content = await page.getTextContent()
      const parts: string[] = []
      for (const item of content.items) {
        if (typeof item !== 'object' || item === null) continue
        const textItem = item as { str?: unknown; hasEOL?: unknown }
        if (typeof textItem.str !== 'string') continue
        parts.push(textItem.str)
        if (textItem.hasEOL === true) parts.push('\n')
      }
      pages.push({ pageNumber, text: parts.join(' ').replace(/[ \t]+\n/g, '\n').trim() })
    }
    return pages
  } finally {
    await pdf.destroy()
  }
}

interface PdfDocument {
  numPages: number
  getPage: (pageNumber: number) => Promise<{ getTextContent: () => Promise<{ items: unknown[] }> }>
  destroy: () => Promise<void>
}

/** 把 PDF 每 N 页聚合为一个章节块 */
function splitPdfPages(pages: PdfPage[]): RawSection[] {
  const sections: RawSection[] = []
  for (let index = 0; index < pages.length; index += PDF_PAGES_PER_SECTION) {
    const group = pages.slice(index, index + PDF_PAGES_PER_SECTION)
    const content = group.map((page) => page.text).filter(Boolean).join('\n\n')
    if (!content) continue
    const startPage = group[0]!.pageNumber
    const endPage = group[group.length - 1]!.pageNumber
    const firstLine = content.split('\n').map((line) => line.trim()).find(Boolean) ?? `第 ${startPage} 页`
    sections.push({
      title: firstLine.length > 40 ? `${firstLine.slice(0, 40)}…` : firstLine,
      level: 1,
      content,
      pageRange: [startPage, endPage],
    })
  }
  return sections
}

/** 图片资料：无文本层，生成单块视觉引用，交由多模态模型直接查看 */
function buildImageSection(filePath: string): RawSection[] {
  return [
    {
      title: basename(filePath),
      level: 1,
      content: `本地图片资料：${filePath}\n（图片无文本层，请由多模态模型直接查看该图片内容。）`,
    },
  ]
}

// ===== 索引持久化 =====

interface PersistedStudyDocument {
  documentId: string
  sessionId: string
  fileName: string
  sourcePath: string
  fileType: StudyDocumentType
  createdAt: number
  totalChars: number
  sections: Array<StudyDocumentSection & { content: string }>
}

/** 把原始分块赋 sectionId 并落盘 */
function persistDocument(
  sessionId: string,
  documentId: string,
  filePath: string,
  fileType: StudyDocumentType,
  rawSections: RawSection[],
): PersistedStudyDocument {
  const sections: Array<StudyDocumentSection & { content: string }> = rawSections.map((raw, index) => ({
    sectionId: `${documentId}-s${index + 1}`,
    documentId,
    title: raw.title,
    level: raw.level,
    ...(raw.pageRange ? { pageRange: raw.pageRange } : {}),
    summary: summarize(raw.content),
    contentSnippet: raw.content.slice(0, 140),
    charCount: raw.content.length,
    content: raw.content,
  }))

  const document: PersistedStudyDocument = {
    documentId,
    sessionId,
    fileName: basename(filePath),
    sourcePath: filePath,
    fileType,
    createdAt: Date.now(),
    totalChars: sections.reduce((total, section) => total + section.charCount, 0),
    sections,
  }

  writeJsonFileAtomic(getStudyDocumentIndexPath(sessionId, documentId), document as unknown as object)
  return document
}

/** 生成轻量级大纲导航 Markdown（控制在约 800 字以内，供模型直接消费） */
function buildNavigationMarkdown(document: PersistedStudyDocument): string {
  const header =
    `## 学习资料大纲：${document.fileName}\n` +
    `文档标识：\`${document.documentId}\`｜共 ${document.sections.length} 个章节块、${document.totalChars} 字。\n` +
    '（原文未全部注入上下文，讲解具体知识点时请调用 `study_inspect_section` 按 sectionId 查阅原文。）\n'
  const lines: string[] = []
  for (const section of document.sections) {
    const locator = section.pageRange
      ? `P${section.pageRange[0]}-${section.pageRange[1]}`
      : `#${section.sectionId.split('-s').at(-1)}`
    const line = `- [${section.sectionId}] ${section.title}（${locator}）— ${section.summary}`
    lines.push(line)
    if (header.length + lines.join('\n').length > 800) break
  }
  return `${header}\n${lines.join('\n')}`
}

/** 由持久化文档派生对外大纲（剥离完整原文） */
function toOutline(document: PersistedStudyDocument): StudyDocumentOutline {
  const sections: StudyDocumentSection[] = document.sections.map(({ content: _content, ...section }) => section)
  return {
    documentId: document.documentId,
    fileName: document.fileName,
    sourcePath: document.sourcePath,
    fileType: document.fileType,
    totalSections: sections.length,
    totalChars: document.totalChars,
    sections,
    navigationMarkdown: buildNavigationMarkdown(document),
    createdAt: document.createdAt,
  }
}

/** 读取单个持久化文档 */
function readPersistedDocument(sessionId: string, documentId: string): PersistedStudyDocument | null {
  try {
    return readJsonFileSafe<PersistedStudyDocument>(getStudyDocumentIndexPath(sessionId, documentId))
  } catch (error) {
    console.warn(`[速课堂索引] 读取文档索引失败: ${documentId}`, error)
    return null
  }
}

// ===== 对外 API =====

/**
 * 导入并解析一批学习资料，返回结构化大纲。
 * 单个文件解析失败时如实跳过并记录日志，不影响其余文件。
 */
export async function ingestStudyDocuments(
  sessionId: string,
  filePaths: string[],
): Promise<StudyDocumentOutline[]> {
  const outlines: StudyDocumentOutline[] = []
  // 会话资料总数准入：本课堂已存 + 本批次不得超过上限
  const existingCount = listStudyDocuments(sessionId).length
  let remaining = Math.max(0, MAX_STUDY_DOCUMENTS_PER_SESSION - existingCount)
  if (remaining === 0) {
    console.warn(`[速课堂索引] 该课堂已达 ${MAX_STUDY_DOCUMENTS_PER_SESSION} 份资料上限，拒绝导入`)
    return outlines
  }

  for (const filePath of filePaths) {
    if (remaining <= 0) {
      console.warn(`[速课堂索引] 已达单课堂 ${MAX_STUDY_DOCUMENTS_PER_SESSION} 份资料上限，剩余文件跳过`)
      break
    }
    try {
      // 准入守卫 1：白名单格式校验（非白名单直接拒绝）
      if (!isStudyDocumentExtension(filePath)) {
        console.warn(`[速课堂索引] 不支持的文件格式，已拒绝: ${filePath}`)
        continue
      }
      // 准入守卫 2：单文件体积校验（不得超过 200MB）
      const fileSize = statSync(filePath).size
      if (fileSize > MAX_STUDY_DOCUMENT_SIZE_BYTES) {
        console.warn(`[速课堂索引] 文件超过 200MB 上限，已拒绝: ${filePath}`)
        continue
      }

      const fileType = resolveDocumentType(filePath)
      const documentId = randomUUID()
      let rawSections: RawSection[]
      /** 纯化后的 Markdown 全文（用于落盘 document.md） */
      let fullMarkdown = ''

      if (fileType === 'image') {
        // 图片 / 无字扫描件：100% 本地离线 OCR；不可用时如实降级为视觉引用块
        const ocrMarkdown = await ocrImageToMarkdown(filePath)
        if (ocrMarkdown) {
          fullMarkdown = normalizeToMarkdown(ocrMarkdown)
          rawSections = rawSectionsFromMarkdown(fullMarkdown)
        } else {
          rawSections = buildImageSection(filePath)
        }
      } else if (fileType === 'pdf') {
        // PDF 保留物理页码范围（对大纲导航有价值），正文仍经纯化
        const pages = await extractPdfPages(filePath)
        if (pages.length > 0) {
          rawSections = splitPdfPages(pages)
          fullMarkdown = normalizeToMarkdown(pages.map((page) => page.text).filter(Boolean).join('\n\n'))
        } else {
          // 扫描版 PDF（无文本层）：本地 OCR 不可直接处理 PDF，兜底走通用提取
          const text = await extractTextFromFile(filePath)
          fullMarkdown = normalizeToMarkdown(text)
          rawSections = rawSectionsFromMarkdown(fullMarkdown)
          if (rawSections.length === 0) rawSections = splitGenericText(text)
        }
      } else {
        // Office / Markdown / HTML / 纯文本：纯化后统计语义切块
        const text = await extractTextFromFile(filePath)
        fullMarkdown = normalizeToMarkdown(text)
        rawSections = rawSectionsFromMarkdown(fullMarkdown)
        if (rawSections.length === 0) rawSections = splitGenericText(text)
      }

      if (rawSections.length === 0) {
        console.warn(`[速课堂索引] 未从资料中抽取到有效文本，跳过: ${filePath}`)
        continue
      }

      // 落盘纯净全文 Markdown（目录创建与索引写入同源）
      if (fullMarkdown.trim()) {
        try {
          const dir = getStudyDocumentDir(sessionId, documentId)
          writeFileSync(join(dir, 'document.md'), fullMarkdown, 'utf-8')
        } catch (error) {
          console.warn(`[速课堂索引] 落盘纯文本 Markdown 失败: ${filePath}`, error)
        }
      }

      const document = persistDocument(sessionId, documentId, filePath, fileType, rawSections)
      outlines.push(toOutline(document))
      remaining--
      console.log(
        `[速课堂索引] 已索引学习资料: ${document.fileName} → ${document.sections.length} 块 / ${document.totalChars} 字`,
      )
    } catch (error) {
      console.warn(`[速课堂索引] 解析学习资料失败，已跳过: ${filePath}`, error)
    }
  }
  return outlines
}

/** 列出当前会话已索引的全部学习资料大纲 */
export function listStudyDocuments(sessionId: string): StudyDocumentOutline[] {
  const sessionDir = getStudySessionDir(sessionId)
  if (!existsSync(sessionDir)) return []
  const outlines: StudyDocumentOutline[] = []
  for (const entry of readdirSync(sessionDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const document = readPersistedDocument(sessionId, entry.name)
    if (document) outlines.push(toOutline(document))
  }
  return outlines.sort((a, b) => a.createdAt - b.createdAt)
}

/** 检索用切块（含完整原文，仅供全域混合检索建立内存倒排索引，绝不注入提示词） */
export interface StudyRetrievalChunk {
  documentId: string
  fileName: string
  sectionId: string
  title: string
  summary: string
  content: string
  pageRange?: [number, number]
}

/** 列出当前会话全部切块（含完整原文），供全域混合检索建立倒排索引 */
export function listStudyRetrievalChunks(sessionId: string): StudyRetrievalChunk[] {
  const sessionDir = getStudySessionDir(sessionId)
  if (!existsSync(sessionDir)) return []
  const chunks: StudyRetrievalChunk[] = []
  for (const entry of readdirSync(sessionDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const document = readPersistedDocument(sessionId, entry.name)
    if (!document) continue
    for (const section of document.sections) {
      chunks.push({
        documentId: document.documentId,
        fileName: document.fileName,
        sectionId: section.sectionId,
        title: section.title,
        summary: section.summary,
        content: section.content,
        ...(section.pageRange ? { pageRange: section.pageRange } : {}),
      })
    }
  }
  return chunks
}

/** 读取单份资料完整大纲 */
export function getStudyDocumentOutline(sessionId: string, documentId: string): StudyDocumentOutline | null {
  const document = readPersistedDocument(sessionId, documentId)
  return document ? toOutline(document) : null
}

/** 移除单份资料索引（物理清理目录） */
export function removeStudyDocument(sessionId: string, documentId: string): boolean {
  try {
    const dir = getStudyDocumentDir(sessionId, documentId)
    if (existsSync(dir)) rmSync(dir, { recursive: true, force: true })
    return true
  } catch (error) {
    console.warn(`[速课堂索引] 移除资料失败: ${documentId}`, error)
    return false
  }
}

/**
 * 按 sectionId 反向查阅指定章节的完整原文（供 study_inspect_section 工具调用）。
 */
export function readStudySection(
  sessionId: string,
  documentId: string,
  sectionId: string,
  queryFocus?: string,
): StudyInspectSectionResult {
  const document = readPersistedDocument(sessionId, documentId)
  if (!document) {
    return { success: false, documentId, sectionId, title: '', content: '', charCount: 0, error: 'DOCUMENT_NOT_FOUND' }
  }
  const section = document.sections.find((candidate) => candidate.sectionId === sectionId)
  if (!section) {
    return { success: false, documentId, sectionId, title: '', content: '', charCount: 0, error: 'SECTION_NOT_FOUND' }
  }
  let content = section.content
  // 提供查阅焦点时，优先返回命中焦点周围的上下文片段，进一步节省 Token。
  if (queryFocus && queryFocus.trim()) {
    const focus = queryFocus.trim()
    const hitIndex = content.indexOf(focus)
    if (hitIndex >= 0) {
      const start = Math.max(0, hitIndex - 800)
      const end = Math.min(content.length, hitIndex + focus.length + 1600)
      content = `${start > 0 ? '…' : ''}${content.slice(start, end)}${end < content.length ? '…' : ''}`
    }
  }
  return {
    success: true,
    documentId,
    sectionId,
    title: section.title,
    ...(section.pageRange ? { pageRange: section.pageRange } : {}),
    ...(section.slideIndex !== undefined ? { slideIndex: section.slideIndex } : {}),
    ...(section.sheetName ? { sheetName: section.sheetName } : {}),
    content,
    charCount: content.length,
  }
}

// ===== 学生认知档案 =====

/** 认知档案的三维概念清单键 */
type CognitionBucket = 'masteredConcepts' | 'unlearnedConcepts' | 'fragileConcepts'

/** 解析认知档案 Markdown 为结构化档案（宽松容错） */
function parseCognitionMarkdown(markdown: string, sessionId: string): StudentCognitionProfile {
  const profile: StudentCognitionProfile = {
    subject: '',
    masteredConcepts: [],
    unlearnedConcepts: [],
    fragileConcepts: [],
    lastUpdated: 0,
  }
  let currentBucket: CognitionBucket | null = null
  const bucketByHeading: Record<string, CognitionBucket> = {
    已掌握: 'masteredConcepts',
    已掌握概念: 'masteredConcepts',
    待学未知: 'unlearnedConcepts',
    待学未知概念: 'unlearnedConcepts',
    薄弱混淆: 'fragileConcepts',
    薄弱混淆概念: 'fragileConcepts',
  }
  for (const line of markdown.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue
    const heading = /^#{2,3}\s*(.+?)\s*$/.exec(trimmed)
    if (heading) {
      const key = bucketByHeading[heading[1]!.replace(/[（）()]/g, '').trim()]
      currentBucket = key ?? null
      continue
    }
    const field = /^-\s*(学科|目标|考试日期)[:：]\s*(.+)$/.exec(trimmed)
    if (field) {
      if (field[1] === '学科') profile.subject = field[2]!.trim()
      else if (field[1] === '目标') profile.targetGoal = field[2]!.trim()
      else if (field[1] === '考试日期') profile.examDate = field[2]!.trim()
      continue
    }
    const item = /^[-*]\s+(.+)$/.exec(trimmed)
    if (item && currentBucket) profile[currentBucket].push(item[1]!.trim())
  }
  profile.lastUpdated = Date.now()
  void sessionId
  return profile
}

/** 读取学生认知档案；不存在时返回 null */
export function readStudentCognition(sessionId: string): StudentCognitionProfile | null {
  const path = getStudentCognitionPath(sessionId)
  if (!existsSync(path)) return null
  try {
    return parseCognitionMarkdown(readFileSync(path, 'utf-8'), sessionId)
  } catch (error) {
    console.warn('[速课堂索引] 读取学生认知档案失败', error)
    return null
  }
}

/** 把认知档案序列化为 Markdown */
export function serializeCognitionMarkdown(profile: StudentCognitionProfile): string {
  const list = (items: string[]): string => (items.length > 0 ? items.map((item) => `- ${item}`).join('\n') : '- （暂无）')
  return [
    '# 学生认知记忆档案',
    '',
    `- 学科: ${profile.subject || '（未指定）'}`,
    `- 目标: ${profile.targetGoal || '（未指定）'}`,
    `- 考试日期: ${profile.examDate || '（未指定）'}`,
    '',
    '## 已掌握概念',
    list(profile.masteredConcepts),
    '',
    '## 待学未知概念',
    list(profile.unlearnedConcepts),
    '',
    '## 薄弱混淆概念',
    list(profile.fragileConcepts),
    '',
  ].join('\n')
}

/** 写入学生认知档案（Markdown 落盘） */
export function writeStudentCognition(sessionId: string, profile: StudentCognitionProfile): void {
  const snapshot: StudentCognitionProfile = { ...profile, lastUpdated: Date.now() }
  writeFileSync(getStudentCognitionPath(sessionId), serializeCognitionMarkdown(snapshot), 'utf-8')
}

/** 单次注入系统提示词的资料大纲字符上限（多课堂资料合计） */
const MAX_OUTLINE_PROMPT_CHARS = 6000

/**
 * 供系统提示词注入：把当前课堂全部资料的「章节大纲向导」拼成一份紧凑 Markdown。
 *
 * 契约要求：速课堂会话的上下文必须携带结构化大纲（含每份资料的 documentId 与各章节
 * 的 sectionId），模型再按 sectionId 调用 study_inspect_section 精确取原文，避免上下文爆炸。
 * 超大时按字符预算截断，并在末尾提示改用工具查阅细节。无资料时返回空串，由调用方兜底。
 */
export function buildStudyOutlineForPrompt(sessionId: string): string {
  const outlines = listStudyDocuments(sessionId)
  if (outlines.length === 0) return ''
  const lines: string[] = []
  let used = 0
  for (const doc of outlines) {
    const header = `### 资料：${doc.fileName}（documentId=${doc.documentId}，共 ${doc.totalSections} 个章节）`
    if (used + header.length > MAX_OUTLINE_PROMPT_CHARS) {
      lines.push(
        '…（资料大纲篇幅较长，部分内容已折叠。如需检索未在大纲列出的细节、考点或跨文件关联，' +
          '请直接调用 study_search_knowledge 工具发起全域混合检索；如需查阅具体已知章节，请使用 study_inspect_section 按 sectionId 查阅原文。）',
      )
      break
    }
    lines.push(header)
    used += header.length
    for (const section of doc.sections) {
      const locator = section.pageRange
        ? `（P${section.pageRange[0]}-${section.pageRange[1]}）`
        : section.slideIndex
          ? `（第 ${section.slideIndex} 页）`
          : ''
      const line = `- [${section.sectionId}] ${section.title}${locator} — ${section.summary}`
      if (used + line.length > MAX_OUTLINE_PROMPT_CHARS) {
        lines.push(
          '…（资料大纲过长，已截断。如需检索未在大纲列出的细节、考点或跨文件关联，请直接调用 study_search_knowledge ' +
            '工具发起全域混合检索；如需查阅具体已知章节，请使用 study_inspect_section 按 sectionId 查阅原文。）',
        )
        return lines.join('\n')
      }
      lines.push(line)
      used += line.length
    }
  }
  return lines.join('\n')
}

/** 供提示词注入：把认知档案压缩为简短文本 */
export function describeCognitionForPrompt(profile: StudentCognitionProfile | null): string {
  if (!profile) return '（尚无学生认知档案，遇到新学科/新教材时请主动发起 /grill-me 摸底诊断）'
  const join = (items: string[]): string => (items.length > 0 ? items.join('、') : '（无）')
  return [
    `学科：${profile.subject || '未指定'}`,
    `目标：${profile.targetGoal || '未指定'}`,
    `已掌握：${join(profile.masteredConcepts)}`,
    `待学未知：${join(profile.unlearnedConcepts)}`,
    `薄弱混淆：${join(profile.fragileConcepts)}`,
  ].join('；')
}

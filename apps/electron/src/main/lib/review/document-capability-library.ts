/**
 * Case-scoped document capabilities shared by review agents.
 *
 * The library exposes parsed document facts and verified image assets by stable
 * document/block IDs. It never accepts a filesystem path from the model.
 */
import { readFileSync, statSync } from 'node:fs'
import { extname, isAbsolute, relative, resolve } from 'node:path'
import type { DocumentVersion } from '@profer/shared'

const MAX_READ_BLOCKS = 80
const MAX_BLOCK_CHARS = 12_000
const MAX_IMAGE_BYTES = 8 * 1024 * 1024

export interface DocumentSearchInput {
  keyword: string
  role?: DocumentVersion['role']
  offset?: number
  limit?: number
}

export interface DocumentReadInput {
  documentVersionId: string
  blockIds?: string[]
  offset?: number
  limit?: number
  sheetName?: string
  fromRow?: number
  toRow?: number
}

export interface DocumentImageAttachment {
  documentVersionId: string
  fileName: string
  blockId: string
  dataUrl: string
  location: DocumentVersion['blocks'][number]['location']
  imageAlt?: string
}

export interface DocumentCapabilityEvent {
  capability: string
  summary: string
}

export interface DocumentCapabilityOptions {
  caseId: string
  caseRoot: string
  documents: DocumentVersion[]
  onActivity?: (event: DocumentCapabilityEvent) => void
}

/** In-memory capability library bound to one active case. */
export class DocumentCapabilityLibrary {
  private readonly root: string
  private readonly readBlockIds = new Map<string, Set<string>>()

  constructor(private readonly options: DocumentCapabilityOptions) {
    this.root = resolve(options.caseRoot)
  }

  private activeDocuments(): DocumentVersion[] {
    return this.options.documents.filter((document) => document.active !== false)
  }

  private findDocument(documentVersionId: string): DocumentVersion | undefined {
    return this.activeDocuments().find((document) => document.versionId === documentVersionId)
  }

  isFullyRead(documentVersionId: string): boolean {
    const document = this.findDocument(documentVersionId)
    const expected = document?.blocks.map((block) => block.blockId) ?? []
    const read = this.readBlockIds.get(documentVersionId)
    return expected.length > 0 && expected.every((blockId) => read?.has(blockId))
  }

  private recordRead(document: DocumentVersion, blockIds: string[]): void {
    const read = this.readBlockIds.get(document.versionId) ?? new Set<string>()
    for (const blockId of blockIds) read.add(blockId)
    this.readBlockIds.set(document.versionId, read)
    const expected = document.blocks.map((block) => block.blockId)
    const complete = expected.length > 0 && expected.every((blockId) => read.has(blockId))
    document.usage = complete ? 'read' : 'partially-read'
    if (complete) delete document.unusedReason
    else document.unusedReason = `Agent 已读取 ${read.size}/${expected.length} 个材料块`
  }

  listDocuments(): Array<Record<string, unknown>> {
    return this.activeDocuments().map((document) => {
      const sheetNames = [...new Set(document.blocks.flatMap((block) => block.location?.kind === 'sheet-cell' ? [block.location.sheet] : []))]
      const pages = [...new Set(document.blocks.flatMap((block) => block.location?.kind === 'pdf-rect' ? [block.location.page] : []))].sort((a, b) => a - b)
      return {
        documentVersionId: document.versionId,
        fileName: document.fileName,
        role: document.role,
        materialSlotId: document.materialSlotId ?? null,
        parseStatus: document.parseStatus,
        blockCount: document.blocks.length,
        textBlockCount: document.blocks.filter((block) => block.kind !== 'image').length,
        imageBlocks: document.blocks.filter((block) => block.kind === 'image').map((block) => ({ blockId: block.blockId, location: block.location ?? { kind: 'file' }, description: block.imageAlt ?? null })),
        sheetNames,
        pages,
      }
    })
  }

  search(input: DocumentSearchInput): { hits: Array<Record<string, unknown>>; totalHits: number; nextOffset: number | null } {
    const keyword = input.keyword.trim().toLocaleLowerCase()
    const offset = Math.max(0, Math.floor(input.offset ?? 0))
    const limit = Math.min(50, Math.max(1, Math.floor(input.limit ?? 20)))
    const hits: Array<Record<string, unknown>> = []
    if (!keyword) return { hits, totalHits: 0, nextOffset: null }
    for (const document of this.activeDocuments()) {
      if (input.role && document.role !== input.role) continue
      for (const block of document.blocks) {
        if (block.kind === 'image' || !block.text.toLocaleLowerCase().includes(keyword)) continue
        hits.push({
          documentVersionId: document.versionId,
          blockId: block.blockId,
          fileName: document.fileName,
          location: block.location ?? { kind: 'file' },
          kind: block.kind,
          ...(block.format ? { format: block.format } : {}),
          text: block.text.slice(0, 600),
        })
      }
    }
    const page = hits.slice(offset, offset + limit)
    return { hits: page, totalHits: hits.length, nextOffset: offset + page.length < hits.length ? offset + page.length : null }
  }

  read(input: DocumentReadInput): { documentVersionId: string; fileName: string; blocks: Array<Record<string, unknown>>; totalBlocks: number; nextOffset: number | null; fullyRead: boolean } {
    const document = this.findDocument(input.documentVersionId)
    if (!document) throw new Error(`材料版本不存在或未激活: ${input.documentVersionId}`)
    const requestedIds = input.blockIds?.length ? new Set(input.blockIds) : undefined
    let candidates = document.blocks.filter((block) => {
      if (requestedIds && !requestedIds.has(block.blockId)) return false
      const location = block.location
      if (input.sheetName && (location?.kind !== 'sheet-cell' || location.sheet !== input.sheetName)) return false
      if (input.fromRow !== undefined && (location?.kind !== 'sheet-cell' || location.row < input.fromRow)) return false
      if (input.toRow !== undefined && (location?.kind !== 'sheet-cell' || location.row > input.toRow)) return false
      return true
    })
    const totalBlocks = candidates.length
    const offset = Math.max(0, Math.floor(input.offset ?? 0))
    const limit = Math.min(MAX_READ_BLOCKS, Math.max(1, Math.floor(input.limit ?? 30)))
    candidates = candidates.slice(offset, offset + limit)
    const returned = candidates.map((block) => {
      const truncated = block.text.length > MAX_BLOCK_CHARS
      return {
        blockId: block.blockId,
        kind: block.kind,
        ...(block.format ? { format: block.format } : {}),
        location: block.location ?? { kind: 'file' },
        ...(block.table ? { table: block.table } : {}),
        ...(block.imageAlt ? { imageAlt: block.imageAlt } : {}),
        ...(block.kind === 'image' ? { requiresVisualInspection: true } : {}),
        text: block.text.slice(0, MAX_BLOCK_CHARS),
        truncated,
      }
    })
    const fullyReturned = !requestedIds && offset === 0 && candidates.length === totalBlocks && returned.every((block) => block.truncated !== true)
    if (fullyReturned) this.recordRead(document, candidates.filter((block) => block.kind !== 'image').map((block) => block.blockId))
    else if (candidates.length > 0) {
      const completeTextBlocks = candidates.filter((block) => block.kind !== 'image' && block.text.length <= MAX_BLOCK_CHARS).map((block) => block.blockId)
      this.recordRead(document, completeTextBlocks)
    }
    this.options.onActivity?.({ capability: 'read_document', summary: `读取 ${document.fileName}（${offset + 1}-${offset + candidates.length}/${totalBlocks} 块）` })
    return {
      documentVersionId: document.versionId,
      fileName: document.fileName,
      blocks: returned,
      totalBlocks,
      nextOffset: offset + candidates.length < totalBlocks ? offset + candidates.length : null,
      fullyRead: document.usage === 'read',
    }
  }

  loadImage(documentVersionId: string, blockId: string): DocumentImageAttachment {
    const document = this.findDocument(documentVersionId)
    if (!document) throw new Error(`材料版本不存在或未激活: ${documentVersionId}`)
    const block = document.blocks.find((candidate) => candidate.blockId === blockId && candidate.kind === 'image')
    if (!block?.imageAssetPath) throw new Error(`图像块不存在或没有可用图像资产: ${blockId}`)
    const absolute = isAbsolute(block.imageAssetPath) ? resolve(block.imageAssetPath) : resolve(this.root, block.imageAssetPath)
    const relation = relative(this.root, absolute)
    if (!relation || relation.startsWith('..') || isAbsolute(relation)) throw new Error('图像资产不在当前案卷目录中')
    const size = statSync(absolute).size
    if (size <= 0 || size > MAX_IMAGE_BYTES) throw new Error(`图像大小无效或超过 ${MAX_IMAGE_BYTES} 字节限制`)
    const bytes = readFileSync(absolute)
    const mime = detectImageMime(bytes, extname(absolute).toLowerCase())
    return {
      documentVersionId,
      fileName: document.fileName,
      blockId,
      dataUrl: `data:${mime};base64,${bytes.toString('base64')}`,
      location: block.location,
      ...(block.imageAlt ? { imageAlt: block.imageAlt } : {}),
    }
  }

  markImageRead(documentVersionId: string, blockId: string): void {
    const document = this.findDocument(documentVersionId)
    const block = document?.blocks.find((candidate) => candidate.blockId === blockId && candidate.kind === 'image')
    if (!document || !block) return
    this.recordRead(document, [blockId])
    this.options.onActivity?.({ capability: 'inspect_document_image', summary: `视觉核对 ${document.fileName}（${block.location?.kind === 'pdf-rect' ? `第 ${block.location.page} 页` : blockId}）` })
  }
}

function detectImageMime(bytes: Buffer, extension: string): string {
  if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'image/png'
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg'
  if (bytes.subarray(0, 6).toString('ascii') === 'GIF87a' || bytes.subarray(0, 6).toString('ascii') === 'GIF89a') return 'image/gif'
  if (bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP') return 'image/webp'
  const declared = extension || 'unknown'
  throw new Error(`图像字节签名与受支持格式不匹配（${declared}）；不会把未知格式发给模型`)
}

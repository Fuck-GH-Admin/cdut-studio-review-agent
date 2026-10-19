/**
 * Dev-B B2 parser-verified SourceIdentity adapter. Parses staged ORIGINAL BYTES
 * using existing production document-service (DOCX/XLSX/PDF/image/text).
 * The per-instance block registry—not a Renderer/model-provided ID or coordinate—
 * alone mints C0 SourceIdentity. No CurrentCase, Run or ReviewBatch writes.
 */
import { createHash, randomBytes } from 'node:crypto'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { extname, join } from 'node:path'
import { assertC0SourceIdentity, REVIEW_C0_SCHEMA_VERSION, type SourceIdentity } from '@profer/shared'
import { parseFileIntoSourceDocument } from './document-service'
import {
  ReviewB2StagingService, type B2MainContext, type B2MaterialCandidate,
} from './review-intake-adapter-v3-b2'

const sha256 = (bytes: Uint8Array | string): string => createHash('sha256').update(bytes).digest('hex')
const PARSER_ID = 'review-v3-b2-production-document-service/1'
const allowed = new Set(['.docx', '.xlsx', '.xls', '.pdf', '.png', '.jpg', '.jpeg', '.webp',
  '.gif', '.bmp', '.txt', '.md', '.csv', '.pptx'])
export type B2Precision = 'pdf-rect' | 'sheet-cell' | 'paragraph' | 'file' | 'approximate'
export type B2ParseStatus = 'parsed' | 'partial' | 'failed'
export interface B2ParsedBlock {
  blockId: string
  text: string
  kind: string
  precision: B2Precision
  location: SourceIdentity['location']
  uncertainty?: string
}
export interface B2ParsedMaterial {
  candidateId: string
  caseCandidateId: string
  materialId: string
  documentVersionId: string
  rawSha256: string
  parseRevision: string
  parserId: typeof PARSER_ID
  status: B2ParseStatus
  error?: string
  blocks: B2ParsedBlock[]
  /** This is a candidate-only verified parser receipt, not a Pi ReadReceipt. */
  inputFingerprint: string
}
interface Stored {
  key: string
  ownerId: string
  ownerGeneration: number
  caseCandidateId: string
  parsed: B2ParsedMaterial
}

const hasRect = (b: { page?: number; bbox?: readonly number[] }): boolean =>
  Number.isSafeInteger(b.page) && (b.page ?? 0) > 0 &&
  Array.isArray(b.bbox) && b.bbox.length === 4 &&
  b.bbox.every((value) => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1) &&
  b.bbox[0]! <= b.bbox[2]! && b.bbox[1]! <= b.bbox[3]!

export class ReviewB2SourceVersionAdapter {
  private parsed = new Map<string, Stored>()
  constructor(private readonly staging: ReviewB2StagingService) {}

  private identityKey(ctx: B2MainContext, candidateId: string): string {
    return JSON.stringify([ctx.ownerId, ctx.ownerGeneration, ctx.caseCandidateId, candidateId])
  }
  /** Real input bytes are obtained from the owner-bound staging capability, not a provided path. */
  async parse(ctx: B2MainContext, candidate: B2MaterialCandidate): Promise<B2ParsedMaterial> {
    this.staging.assertStillGranted(ctx)
    if (candidate.ownerId !== ctx.ownerId ||
        candidate.ownerGeneration !== ctx.ownerGeneration ||
        candidate.caseCandidateId !== ctx.caseCandidateId ||
        candidate.status !== 'accepted') throw new Error('B2_SOURCE_SCOPE_MISMATCH')
    const bytes = this.staging.read(ctx, candidate.candidateId)
    const hash = sha256(bytes)
    if (hash !== candidate.rawSha256 || bytes.byteLength !== candidate.byteLength) {
      throw new Error('B2_SOURCE_BYTES_MISMATCH')
    }
    const ext = extname(candidate.fileName).toLowerCase()
    if (!allowed.has(ext)) throw new Error('B2_SOURCE_FORMAT_UNSUPPORTED')
    const versionKey = this.identityKey(ctx, candidate.candidateId)
    const inputFingerprint = sha256(JSON.stringify([
      PARSER_ID, candidate.caseCandidateId, candidate.documentVersionId,
      candidate.physicalSourceKey, hash, ext,
    ]))
    const existing = this.parsed.get(versionKey)
    if (existing) {
      if (existing.parsed.inputFingerprint !== inputFingerprint) throw new Error('B2_SOURCE_CACHE_IDENTITY_MISMATCH')
      return structuredClone(existing.parsed)
    }

    // Filename cannot escape staging directory. The parser receives original bytes
    // in an isolated temp file with a random basename and approved extension.
    const directory = await mkdtemp(join(tmpdir(), 'review-b2-parser-'))
    const filePath = join(directory, randomBytes(10).toString('hex') + ext)
    try {
      await writeFile(filePath, bytes, { flag: 'wx', mode: 0o600 })
      this.staging.assertStillGranted(ctx) // reject revoke during the write await
      const source = await parseFileIntoSourceDocument(
        filePath, candidate.fileName,
        candidate.role === 'application' ? 'application' : 'evidence',
      )
      // Recheck after parser's async Office/PDF/OCR/fallback activities.
      this.staging.assertStillGranted(ctx)
      if (sha256(bytes) !== candidate.rawSha256) throw new Error('B2_SOURCE_BYTES_MISMATCH')
      if (!['parsed', 'partial', 'failed'].includes(source.parseStatus)) {
        throw new Error('B2_SOURCE_PARSER_STATUS_INVALID')
      }
      const parsedRevision = 'parse-' + sha256(JSON.stringify([inputFingerprint, source.parseStatus,
        source.blocks.map((b) => [b.id, b.kind, b.text, b.table, b.bbox, b.page]),
      ])).slice(0, 32)
      const blocks: B2ParsedBlock[] = []
      const seen = new Set<string>()
      for (let index = 0; index < source.blocks.length; index += 1) {
        const block = source.blocks[index]!
        if (source.parseStatus === 'failed') throw new Error('B2_SOURCE_FAILED_HAS_BLOCKS')
        // Original document-service emits slug-based block IDs. Namespace by the
        // physical version + parseRevision to eliminate same-stem cross-doc alias.
        const blockId = 'src-' + sha256(JSON.stringify([
          candidate.documentVersionId, parsedRevision, block.id, index,
        ])).slice(0, 40)
        if (seen.has(blockId)) throw new Error('B2_SOURCE_BLOCK_COLLISION')
        seen.add(blockId)
        let location: SourceIdentity['location']
        let precision: B2Precision
        let uncertainty: string | undefined
        if (ext === '.pdf' && hasRect(block)) {
          precision = 'pdf-rect'
          location = { kind: 'pdf-rect', locator: JSON.stringify({
            page: block.page, rect: block.bbox, readingOrder: block.readingOrder ?? null,
          }) }
        } else if (['.xlsx', '.xls'].includes(ext) && block.table?.sheet &&
                   Number.isSafeInteger(block.table.row) && Number.isSafeInteger(block.table.column)) {
          precision = 'sheet-cell'
          location = { kind: 'sheet-cell', locator: JSON.stringify({
            sheet: block.table.sheet, row: block.table.row, column: block.table.column,
          }) }
        } else if (ext === '.docx' && block.kind !== 'image') {
          precision = 'paragraph'
          location = { kind: 'paragraph', locator: JSON.stringify({
            paragraphIndex: index, originalBlockId: block.id,
            table: block.table ?? null,
          }) }
        } else if (['.txt', '.md', '.csv'].includes(ext)) {
          precision = 'paragraph'
          location = { kind: 'paragraph', locator: JSON.stringify({
            blockIndex: index, originalBlockId: block.id,
          }) }
        } else {
          // PDF textual fallback's artificial page=1 does NOT prove a true page;
          // and any image has no OCR content. Keep it visibly approximate.
          precision = block.kind === 'image' ? 'file' : 'approximate'
          location = { kind: 'file', locator: JSON.stringify({ originalBlockId: block.id }) }
          uncertainty = block.kind === 'image'
            ? 'Image or embedded image requires independent visual inspection; not OCR full-read'
            : 'Parser did not prove page/cell geometry; file-level location only'
        }
        blocks.push({
          blockId, text: block.text, kind: block.kind, precision, location,
          ...(uncertainty ? { uncertainty } : {}),
        })
      }
      // Even a parser-reported 'parsed' with image blocks is not full text/visual inspection.
      const hasUninspectedImage = blocks.some((block) => block.kind === 'image')
      const status: B2ParseStatus = source.parseStatus === 'failed' ? 'failed'
        : source.parseStatus === 'partial' || hasUninspectedImage ? 'partial' : 'parsed'
      const parsed: B2ParsedMaterial = {
        candidateId: candidate.candidateId, caseCandidateId: candidate.caseCandidateId,
        materialId: candidate.materialId, documentVersionId: candidate.documentVersionId,
        rawSha256: hash, parseRevision: parsedRevision, parserId: PARSER_ID,
        status, blocks, inputFingerprint,
        ...(source.parseError || hasUninspectedImage ? {
          error: [source.parseError, hasUninspectedImage
            ? 'Contains image blocks not fully inspected' : undefined].filter(Boolean).join('; '),
        } : {}),
      }
      this.staging.assertStillGranted(ctx)
      this.parsed.set(versionKey, {
        key: versionKey, ownerId: ctx.ownerId,
        ownerGeneration: ctx.ownerGeneration, caseCandidateId: ctx.caseCandidateId,
        parsed,
      })
      return structuredClone(parsed)
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  }
  /** Only a block issued by this parser's registry can mint an exact C0 SourceIdentity. */
  sourceForBlock(ctx: B2MainContext, candidateId: string, parseRevision: string, blockId: string): SourceIdentity {
    this.staging.assertStillGranted(ctx)
    const record = this.parsed.get(this.identityKey(ctx, candidateId))
    if (!record || record.ownerId !== ctx.ownerId ||
        record.ownerGeneration !== ctx.ownerGeneration ||
        record.caseCandidateId !== ctx.caseCandidateId ||
        record.parsed.parseRevision !== parseRevision ||
        record.parsed.status === 'failed') throw new Error('B2_SOURCE_STALE')
    const block = record.parsed.blocks.find((candidate) => candidate.blockId === blockId)
    if (!block) throw new Error('B2_SOURCE_BLOCK_UNVERIFIED')
    const result: SourceIdentity = {
      schemaVersion: REVIEW_C0_SCHEMA_VERSION,
      caseId: record.parsed.caseCandidateId, materialId: record.parsed.materialId,
      documentVersionId: record.parsed.documentVersionId, rawSha256: record.parsed.rawSha256,
      parseRevision, blockId, location: structuredClone(block.location),
    }
    assertC0SourceIdentity(result)
    return result
  }
}

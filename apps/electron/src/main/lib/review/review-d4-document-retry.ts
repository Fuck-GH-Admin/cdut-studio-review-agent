/** W1 targeted parser retry: use only an in-case immutable original registered by Main. */
import { createHash } from 'node:crypto'
import { existsSync, lstatSync, readFileSync, realpathSync } from 'node:fs'
import { isAbsolute, join, relative, resolve, sep } from 'node:path'
import type { D4DocumentRetryResult, ReviewCase, SourceDocument } from '@profer/shared'
import { assertSafeId, getCase, getReviewCasesDir, updateCase } from './case-store'
import { importDocumentFromPath, removeDocumentsFromCase } from './case-import'
import { D4_CASE_WRITE_BUSY } from './review-d4-case-batch'

const MAX_RETRY_BYTES = 50 * 1024 * 1024

/** No user/Renderer-supplied path is accepted. Resolve current Main-recorded
 * document identity under its own source-docs directory, then compare bytes to
 * the hash captured by Main at the original native-picker intake.
 */
export function resolveD4RetryOriginal(input: {
  caseId: string; documentId: string; expectedRevision: number
}): { reviewCase: ReviewCase; document: SourceDocument; realSourcePath: string; sha256: string; originLabel: string } {
  if (!input || typeof input.caseId !== 'string' || typeof input.documentId !== 'string' ||
      !Number.isSafeInteger(input.expectedRevision)) throw new Error('D4_RETRY_INPUT_INVALID')
  assertSafeId(input.caseId)
  if (!input.caseId.startsWith('d4-')) throw new Error('D4_RETRY_NOT_D4_CASE')
  const reviewCase = getCase(input.caseId)
  if (!reviewCase) throw new Error('D4_RETRY_CASE_NOT_FOUND')
  if ((reviewCase.revision ?? 0) !== input.expectedRevision) throw new Error('D4_RETRY_STALE_REVISION')
  const doc = reviewCase.documents.find(item => item.id === input.documentId)
  if (!doc || (doc.role !== 'application' && doc.role !== 'evidence') ||
      (doc.parseStatus !== 'failed' && doc.parseStatus !== 'partial') ||
      doc.origin !== 'upload') throw new Error('D4_RETRY_DOCUMENT_NOT_ELIGIBLE')
  if (!/^doc-[A-Za-z0-9_-]{6,}$/.test(doc.id) || !doc.fileName ||
      doc.fileName === '.' || doc.fileName === '..' ||
      doc.fileName.includes('/') || doc.fileName.includes('\\') ||
      doc.fileName.includes(String.fromCharCode(0))) throw new Error('D4_RETRY_ORIGIN_INVALID')
  const origin = reviewCase.d4IntakeOrigins?.find(item => item.documentId === doc.id)
  if (!origin || !/^[0-9a-f]{64}$/.test(origin.sha256)) throw new Error('D4_RETRY_UNTRACKED_SOURCE')
  const caseRoot = resolve(getReviewCasesDir(), input.caseId)
  const sourceRoot = join(caseRoot, 'source-docs')
  const candidate = join(sourceRoot, doc.id + '-' + doc.fileName)
  if (!existsSync(candidate)) throw new Error('D4_RETRY_ORIGINAL_MISSING')
  const rootReal = realpathSync(sourceRoot)
  const pathReal = realpathSync(candidate)
  const within = relative(rootReal, pathReal)
  if (!within || within === '..' || within.startsWith('..' + sep) || isAbsolute(within) ||
      lstatSync(candidate).isSymbolicLink()) throw new Error('D4_RETRY_ORIGINAL_OUTSIDE_CASE')
  const stat = lstatSync(pathReal)
  if (!stat.isFile() || stat.size > MAX_RETRY_BYTES || stat.size !== doc.sizeBytes) {
    throw new Error('D4_RETRY_ORIGINAL_SIZE_MISMATCH')
  }
  const actualHash = createHash('sha256').update(readFileSync(pathReal)).digest('hex')
  if (actualHash !== origin.sha256) throw new Error('D4_RETRY_ORIGINAL_HASH_MISMATCH')
  return { reviewCase, document: doc, realSourcePath: pathReal,
    sha256: actualHash, originLabel: origin.originLabel }
}

export async function retryD4CaseDocument(input: {
  caseId: string; documentId: string; expectedRevision: number
}): Promise<D4DocumentRetryResult> {
  const { caseId, documentId } = input
  if (D4_CASE_WRITE_BUSY.has(caseId)) throw new Error('D4_RETRY_CASE_BUSY')
  const checked = resolveD4RetryOriginal(input)
  D4_CASE_WRITE_BUSY.add(caseId)
  try {
    // importDocumentFromPath creates a NEW document ID and V2 document version,
    // never mutating old parsed blocks, old receipt or old original file.
    const replay = await importDocumentFromPath({
      caseId, sourcePath: checked.realSourcePath, role: checked.document.role,
      originalFileName: checked.document.fileName,
    })
    let status: D4DocumentRetryResult['status'] = 'needs-review'
    let message = ''
    if (replay.parseStatus === 'parsed') {
      try {
        await removeDocumentsFromCase({ caseId, role: checked.document.role, documentIds: [documentId] })
        status = 'replaced'
        message = '重新解析成功，旧版本已归档；审核结果需要重新计算'
      } catch (error) {
        message = '新材料已解析，但旧材料归档失败；两个版本均保留，须人工处理：' +
          (error instanceof Error ? error.message : String(error))
      }
    } else {
      // An unsuccessful parser retry is still a historical attempt. Archive
      // the attempt, not the original; never let failed new blocks replace
      // the current source or make a partial file look fully reviewed.
      try {
        await removeDocumentsFromCase({ caseId, role: checked.document.role, documentIds: [replay.id] })
        status = 'still-incomplete'
        message = '重新解析仍不完整，旧材料仍有效；已记录此次尝试，请人工核对原件'
      } catch (error) {
        message = '重新解析未完成，尝试文件归档失败；请检查两个材料版本：' +
          (error instanceof Error ? error.message : String(error))
      }
    }
    await updateCase(caseId, fresh => ({
      ...fresh,
      d4IntakeOrigins: [...(fresh.d4IntakeOrigins ?? []), {
        documentId: replay.id, sha256: checked.sha256,
        originLabel: '原件重试解析：' + checked.originLabel,
      }],
      d4IntakeWarnings: status === 'replaced' ? fresh.d4IntakeWarnings : [
        ...(fresh.d4IntakeWarnings ?? []), {
          originLabel: checked.originLabel,
          reason: '定向解析重试 ' + replay.id + '：' + message,
        },
      ],
    }), { reason: 'W1 案卷内原件重试解析（含版本留存）' })
    return { caseId, documentId, attemptDocumentId: replay.id,
      status, parseStatus: replay.parseStatus, message }
  } finally {
    D4_CASE_WRITE_BUSY.delete(caseId)
  }
}

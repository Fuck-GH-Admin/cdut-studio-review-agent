/**
 * W1 add materials to an existing D4 case. No Renderer path arguments.
 * Native staging token is owner-bound; every mutation is checked against a
 * reviewer-visible assessment and the exact case revision.
 */
import type { D4CaseBatchAssessment, D4CaseBatchChoice, D4CaseBatchResult, ReviewCase } from '@profer/shared'
import { getCase, updateCase, assertSafeId } from './case-store'
import { importDocumentFromPath, removeDocumentsFromCase } from './case-import'
import { claimD4Intake, inspectD4Intake, releaseD4Intake } from './review-d4-intake'

type Role = 'application' | 'evidence'
/** Main-only per-case write guard shared with source replay and batched append. */
export const D4_CASE_WRITE_BUSY = new Set<string>()
function base(caseId: string, token: string, role: Role, owner: number) {
  assertSafeId(caseId)
  if (role !== 'application' && role !== 'evidence') throw new Error('D4_BATCH_ROLE_INVALID')
  const reviewCase = getCase(caseId)
  if (!reviewCase) throw new Error('D4_BATCH_CASE_NOT_FOUND')
  const intake = inspectD4Intake(token, owner)
  return { reviewCase, intake }
}
function assess(caseId: string, token: string, role: Role, owner: number): D4CaseBatchAssessment {
  const { reviewCase, intake } = base(caseId, token, role, owner)
  const origins = new Map((reviewCase.d4IntakeOrigins ?? [])
    .filter(item => reviewCase.documents.some(doc => doc.id === item.documentId))
    .map(item => [item.documentId, item.sha256]))
  const active = reviewCase.documents.filter(doc => doc.role === role)
  return {
    caseId, token, role, expectedRevision: reviewCase.revision ?? 0,
    skipped: intake.skipped.map(x => ({ ...x })),
    files: intake.files.map((file, index) => ({
      index, name: file.name, originLabel: file.originLabel, sizeBytes: file.sizeBytes,
      ...(active.find(doc => origins.get(doc.id) === file.sha256)
        ? { duplicateOf: active.find(doc => origins.get(doc.id) === file.sha256)!.id } : {}),
      nameConflicts: active.filter(doc => doc.fileName.normalize('NFKC').toLowerCase() ===
        file.name.normalize('NFKC').toLowerCase()).map(doc => ({ documentId: doc.id, fileName: doc.fileName })),
    })),
  }
}
export function assessD4CaseBatch(input: {
  caseId: string; token: string; role: Role
}, ownerWebContentsId: number): D4CaseBatchAssessment {
  return assess(input.caseId, input.token, input.role, ownerWebContentsId)
}
export async function applyD4CaseBatch(input: {
  caseId: string; token: string; role: Role; expectedRevision: number
  choices: D4CaseBatchChoice[]; acknowledgeSkipped: boolean
}, ownerWebContentsId: number): Promise<D4CaseBatchResult> {
  const { caseId, token, role } = input
  if (typeof token !== 'string' || !Number.isSafeInteger(input.expectedRevision) ||
      !Array.isArray(input.choices) || typeof input.acknowledgeSkipped !== 'boolean') {
    throw new Error('D4_BATCH_INPUT_INVALID')
  }
  if (D4_CASE_WRITE_BUSY.has(caseId)) throw new Error('D4_BATCH_CASE_BUSY')
  const review = assess(caseId, token, role, ownerWebContentsId)
  if (review.expectedRevision !== input.expectedRevision) throw new Error('D4_BATCH_STALE_CASE_REVISION')
  if (input.choices.length !== review.files.length) throw new Error('D4_BATCH_PLAN_MISMATCH')
  if (review.skipped.length && !input.acknowledgeSkipped) throw new Error('D4_BATCH_SKIPS_ACK_REQUIRED')

  // Validate the entire plan before consuming a one-shot token or modifying a case.
  for (const [i, choice] of input.choices.entries()) {
    const file = review.files[i]!
    if (!choice || typeof choice !== 'object') throw new Error('D4_BATCH_ACTION_INVALID')
    if (choice.kind === 'skip') continue
    if (file.duplicateOf) throw new Error('D4_BATCH_DUPLICATE_MUST_SKIP')
    if (choice.kind === 'append') {
      if (file.nameConflicts.length) throw new Error('D4_BATCH_NAME_CONFLICT_NEEDS_REPLACEMENT_OR_SKIP')
      continue
    }
    if (choice.kind === 'replace') {
      if (typeof choice.documentId !== 'string' ||
          !file.nameConflicts.some(doc => doc.documentId === choice.documentId)) {
        throw new Error('D4_BATCH_REPLACEMENT_TARGET_INVALID')
      }
      continue
    }
    throw new Error('D4_BATCH_ACTION_INVALID')
  }
  const replacementIds = input.choices.flatMap(x => x.kind === 'replace' ? [x.documentId] : [])
  if (replacementIds.length !== new Set(replacementIds).size) throw new Error('D4_BATCH_REPLACEMENT_TARGET_REUSED')
  const intake = claimD4Intake(token, ownerWebContentsId)
  D4_CASE_WRITE_BUSY.add(caseId)
  let consumed = false
  const documents: D4CaseBatchResult['documents'] = []
  const warnings: D4CaseBatchResult['skipped'] = [...review.skipped]
  const origins: NonNullable<ReviewCase['d4IntakeOrigins']> = []
  const replacements: D4CaseBatchResult['replacements'] = []
  try {
    consumed = true
    for (const [i, file] of intake.files.entries()) {
      const choice = input.choices[i]!
      if (choice.kind === 'skip') {
        warnings.push({ originLabel: file.originLabel, reason: file.sha256 ===
          intake.files.find((item, index) => index !== i && item.sha256 === file.sha256)?.sha256
          ? '审核员跳过批次重复文件' : '审核员选择跳过此材料' })
        continue
      }
      try {
        const imported = await importDocumentFromPath({
          caseId, sourcePath: file.sourcePath, role,
          fileIndex: i + 1, fileCount: intake.files.length,
        })
        documents.push(imported)
        origins.push({ documentId: imported.id, originLabel: file.originLabel, sha256: file.sha256 })
        if (imported.parseStatus !== 'parsed') {
          warnings.push({ originLabel: file.originLabel, reason: '材料已保存，但解析状态为 ' +
            imported.parseStatus + '；未撤下历史材料' })
          continue
        }
        if (choice.kind === 'replace') {
          try {
            await removeDocumentsFromCase({ caseId, role, documentIds: [choice.documentId] })
            replacements.push({ oldDocumentId: choice.documentId, newDocumentId: imported.id })
          } catch (error) {
            warnings.push({ originLabel: file.originLabel,
              reason: '新原件已保留，但旧材料归档失败，须人工复核：' +
                (error instanceof Error ? error.message : String(error)) })
          }
        }
      } catch (error) {
        warnings.push({ originLabel: file.originLabel,
          reason: '文件导入失败：' + (error instanceof Error ? error.message : String(error)) })
      }
    }
    if (origins.length || warnings.length) {
      await updateCase(caseId, fresh => ({
        ...fresh,
        d4IntakeOrigins: [...(fresh.d4IntakeOrigins ?? []), ...origins],
        d4IntakeWarnings: [...(fresh.d4IntakeWarnings ?? []), ...warnings],
      }), { reason: 'W1 批量追加及材料冲突处理结果' })
    }
    return { caseId, documents, skipped: warnings, replacements }
  } finally {
    releaseD4Intake(intake, consumed)
    D4_CASE_WRITE_BUSY.delete(caseId)
  }
}

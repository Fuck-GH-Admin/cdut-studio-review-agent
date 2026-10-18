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
  const documents: D4CaseBatchResult['documents'] = []
  const warnings: D4CaseBatchResult['skipped'] = []
  const replacements: D4CaseBatchResult['replacements'] = []
  const warn = async (originLabel: string, reason: string): Promise<void> => {
    const warning = { originLabel, reason }
    warnings.push(warning)
    await updateCase(caseId, fresh => ({
      ...fresh, d4IntakeWarnings: [...(fresh.d4IntakeWarnings ?? []), warning],
    }), { reason: 'W1 逐文件导入异常或人工跳过（持久历史）' })
  }
  const transition = async (
    previousDocumentId: string, newDocumentId: string, originLabel: string,
    status: 'pending' | 'archived' | 'archive-failed',
  ): Promise<number> => {
    const updated = await updateCase(caseId, fresh => {
      const entries = [...(fresh.d4MaterialTransitions ?? [])]
      const index = entries.findIndex(item => item.newDocumentId === newDocumentId)
      const entry = { previousDocumentId, newDocumentId, originLabel, kind: 'replace' as const, status }
      if (index < 0) entries.push(entry)
      else entries[index] = entry
      return { ...fresh, d4MaterialTransitions: entries }
    }, { reason: 'W1 替换关系及中断对账状态' })
    return updated.revision ?? 0
  }
  try {
    // Persist the Main-supplied skipped manifest before any actual imports.
    // A crash mid-batch must not erase the reviewer's acknowledged omissions.
    for (const omitted of review.skipped) await warn(omitted.originLabel, omitted.reason)
    for (const [i, file] of intake.files.entries()) {
      const choice = input.choices[i]!
      if (choice.kind === 'skip') {
        await warn(file.originLabel, '审核员选择跳过此材料')
        continue
      }
      let imported: D4CaseBatchResult['documents'][number]
      try {
        imported = await importDocumentFromPath({
          caseId, sourcePath: file.sourcePath, role,
          fileIndex: i + 1, fileCount: intake.files.length,
        })
      } catch (error) {
        await warn(file.originLabel, '文件导入失败：' + (error instanceof Error ? error.message : String(error)))
        continue
      }
      documents.push(imported)
      // Store each source identity immediately, not after processing every file.
      // On interruption the active document remains traceable by Main-recorded SHA.
      await updateCase(caseId, fresh => ({
        ...fresh, d4IntakeOrigins: [...(fresh.d4IntakeOrigins ?? []),
          { documentId: imported.id, originLabel: file.originLabel, sha256: file.sha256 }],
      }), { reason: 'W1 导入原件逐文件来源及哈希持久化' })
      if (imported.parseStatus !== 'parsed' || !imported.blocks.some(block => !!block.text.trim())) {
        await warn(file.originLabel, '材料已保存，但解析未产生完整可审核文字（' +
          imported.parseStatus + '）；历史材料保持有效')
        continue
      }
      if (choice.kind === 'replace') {
        const revision = await transition(choice.documentId, imported.id, file.originLabel, 'pending')
        try {
          await removeDocumentsFromCase({
            caseId, role, documentIds: [choice.documentId], expectedRevision: revision,
          })
          replacements.push({ oldDocumentId: choice.documentId, newDocumentId: imported.id })
          await transition(choice.documentId, imported.id, file.originLabel, 'archived')
        } catch (error) {
          await transition(choice.documentId, imported.id, file.originLabel, 'archive-failed')
          await warn(file.originLabel, '新原件已保存，旧版归档或同步未完全结束，必须核对实际 active/archived：' +
            (error instanceof Error ? error.message : String(error)))
        }
      }
    }
    return { caseId, documents, skipped: warnings, replacements }
  } finally {
    releaseD4Intake(intake, true)
    D4_CASE_WRITE_BUSY.delete(caseId)
  }
}

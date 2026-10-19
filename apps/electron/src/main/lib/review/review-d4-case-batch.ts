/**
 * W1 add materials to an existing D4 case. No Renderer path arguments.
 * Native staging token is owner-bound; every mutation is checked against a
 * reviewer-visible assessment and the exact case revision.
 */
import type { D4BatchRun, D4CaseBatchAssessment, D4CaseBatchChoice, D4CaseBatchResult, ReviewImportProgressEvent } from '@profer/shared'
import { randomUUID } from 'node:crypto'
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
  requestId?: string; resumeBatchId?: string
}, ownerWebContentsId: number, onProgress?: (progress: ReviewImportProgressEvent) => void): Promise<D4CaseBatchResult> {
  const { caseId, token, role } = input
  if (input.requestId !== undefined &&
      (typeof input.requestId !== 'string' || !/^d4batch-[a-zA-Z0-9_-]{8,70}$/.test(input.requestId))) {
    throw new Error('D4_BATCH_PROGRESS_ID_INVALID')
  }
  if (typeof token !== 'string' || !Number.isSafeInteger(input.expectedRevision) ||
      !Array.isArray(input.choices) || typeof input.acknowledgeSkipped !== 'boolean' ||
      (input.resumeBatchId !== undefined && (typeof input.resumeBatchId !== 'string' ||
        !/^[a-f0-9-]{36}$/.test(input.resumeBatchId)))) throw new Error('D4_BATCH_INPUT_INVALID')
  if (D4_CASE_WRITE_BUSY.has(caseId)) throw new Error('D4_BATCH_CASE_BUSY')
  const review = assess(caseId, token, role, ownerWebContentsId)
  if (review.expectedRevision !== input.expectedRevision) throw new Error('D4_BATCH_STALE_CASE_REVISION')
  const latest = getCase(caseId)!
  const existing = input.resumeBatchId
    ? latest.d4BatchRuns?.find(run => run.id === input.resumeBatchId && run.role === role)
    : undefined
  if (input.resumeBatchId && (!existing || existing.status === 'completed')) {
    throw new Error('D4_BATCH_RESUME_NOT_FOUND_OR_COMPLETE')
  }
  const staged = inspectD4Intake(token, ownerWebContentsId)
  if (existing) {
    if (existing.files.length !== staged.files.length ||
        existing.skipped.length !== staged.skipped.length ||
        existing.files.some((file, i) => file.index !== i ||
          file.sha256 !== staged.files[i]?.sha256 || file.name !== staged.files[i]?.name ||
          file.originLabel !== staged.files[i]?.originLabel ||
          file.sizeBytes !== staged.files[i]?.sizeBytes) ||
        existing.skipped.some((item, i) => item.originLabel !== staged.skipped[i]?.originLabel ||
          item.reason !== staged.skipped[i]?.reason)) {
      throw new Error('D4_BATCH_RESUME_DIGEST_OR_MANIFEST_MISMATCH')
    }
  }
  const plan = existing ? existing.files.map(file => file.choice) : input.choices
  if (plan.length !== review.files.length) throw new Error('D4_BATCH_PLAN_MISMATCH')
  if (!existing && review.skipped.length && !input.acknowledgeSkipped) {
    throw new Error('D4_BATCH_SKIPS_ACK_REQUIRED')
  }
  // Check every yet-to-be-executed action BEFORE consuming the owner-bound token.
  // A previously completed file may now duplicate itself: it must NEVER import twice.
  for (const [i, choice] of plan.entries()) {
    const old = existing?.files[i]
    if (old && old.status !== 'pending' && old.status !== 'failed') {
      if (old.documentId && ![...latest.documents, ...(latest.archivedDocuments ?? [])]
        .some(doc => doc.id === old.documentId)) {
        throw new Error('D4_BATCH_RESUME_COMMITTED_VERSION_MISSING')
      }
      continue
    }
    const file = review.files[i]!
    if (!choice || typeof choice !== 'object') throw new Error('D4_BATCH_ACTION_INVALID')
    if (choice.kind === 'skip') continue
    if (file.duplicateOf) throw new Error('D4_BATCH_DUPLICATE_MUST_SKIP')
    if (choice.kind === 'append') {
      if (file.nameConflicts.length) throw new Error('D4_BATCH_NAME_CONFLICT_NEEDS_REPLACEMENT_OR_SKIP')
    } else if (choice.kind === 'replace') {
      if (typeof choice.documentId !== 'string' ||
          !file.nameConflicts.some(doc => doc.documentId === choice.documentId)) {
        throw new Error('D4_BATCH_REPLACEMENT_TARGET_INVALID')
      }
    } else throw new Error('D4_BATCH_ACTION_INVALID')
  }
  const replacedIds = plan.flatMap(choice => choice.kind === 'replace' ? [choice.documentId] : [])
  if (replacedIds.length !== new Set(replacedIds).size) throw new Error('D4_BATCH_REPLACEMENT_TARGET_REUSED')
  const intake = claimD4Intake(token, ownerWebContentsId)
  D4_CASE_WRITE_BUSY.add(caseId)
  const batchId = existing?.id ?? randomUUID()
  const documents: D4CaseBatchResult['documents'] = []
  const warnings: D4CaseBatchResult['skipped'] = []
  const replacements: D4CaseBatchResult['replacements'] = []
  const mutateRun = async (mutate: (run: D4BatchRun) => D4BatchRun, reason: string): Promise<void> => {
    await updateCase(caseId, fresh => ({
      ...fresh, d4BatchRuns: (fresh.d4BatchRuns ?? []).map(run => run.id === batchId ? mutate(run) : run),
    }), { reason })
  }
  const checkpoint = (index: number, status: D4BatchRun['files'][number]['status'],
    documentId?: string, message?: string): Promise<void> => mutateRun(run => ({
    ...run, updatedAt: new Date().toISOString(),
    files: run.files.map(file => file.index !== index ? file : ({
      ...file, status, ...(documentId ? { documentId } : {}), ...(message ? { message } : {}),
    })),
  }), 'W1 已落盘逐文件批次检查点')
  const finish = (): Promise<void> => mutateRun(run => ({
    ...run, updatedAt: new Date().toISOString(),
    status: run.files.some(file => file.status === 'pending' || file.status === 'failed')
      ? 'needs-reselection' : 'completed',
  }), 'W1 批次结束/待重新选择原件')
  const report = (phase: ReviewImportProgressEvent['phase'], i: number, message: string): void => {
    if (!input.requestId) return
    onProgress?.({ requestId: input.requestId, caseId, role, phase,
      fileIndex: i + 1, fileCount: intake.files.length, message })
  }
  const warn = async (originLabel: string, reason: string): Promise<void> => {
    const warning = { originLabel, reason }
    warnings.push(warning)
    await updateCase(caseId, fresh => ({
      ...fresh, d4IntakeWarnings: [...(fresh.d4IntakeWarnings ?? []), warning],
    }), { reason: 'W1 永久跳过/失败审计记录' })
  }
  const transition = async (oldId: string, newId: string, originLabel: string,
    status: 'pending' | 'archived' | 'archive-failed'): Promise<number> => {
    const result = await updateCase(caseId, fresh => {
      const entries = [...(fresh.d4MaterialTransitions ?? [])]
      const i = entries.findIndex(entry => entry.newDocumentId === newId)
      const next = { previousDocumentId: oldId, newDocumentId: newId,
        originLabel, kind: 'replace' as const, status }
      if (i < 0) entries.push(next)
      else entries[i] = next
      return { ...fresh, d4MaterialTransitions: entries }
    }, { reason: 'W1 版本替换/中断关系' })
    return result.revision ?? 0
  }
  try {
    if (existing) {
      await mutateRun(run => ({ ...run, status: 'running',
        updatedAt: new Date().toISOString() }), 'W1 Main 哈希复核后恢复批次')
    } else {
      const now = new Date().toISOString()
      const run: D4BatchRun = { id: batchId, role, status: 'running',
        createdAt: now, updatedAt: now, skipped: review.skipped.map(x => ({ ...x })),
        files: intake.files.map((file, index) => ({
          index, name: file.name, originLabel: file.originLabel, sha256: file.sha256,
          sizeBytes: file.sizeBytes, choice: plan[index]!, status: 'pending',
        })),
      }
      await updateCase(caseId, fresh => ({
        ...fresh, d4BatchRuns: [...(fresh.d4BatchRuns ?? []), run],
      }), { reason: 'W1 批次计划持久落盘（不含宿主路径）' })
      for (const item of review.skipped) await warn(item.originLabel, item.reason)
    }
    for (const [i, file] of intake.files.entries()) {
      const old = existing?.files[i]
      if (old && old.status !== 'pending' && old.status !== 'failed') {
        report('file-complete', i, '历史已执行，无需重复写入：' + file.name)
        continue
      }
      const choice = plan[i]!
      report('file-start', i, '开始处理：' + file.name)
      if (choice.kind === 'skip') {
        await warn(file.originLabel, '审核员选择跳过此材料')
        await checkpoint(i, 'skipped')
        report('file-complete', i, '审核员跳过：' + file.name)
        continue
      }
      let imported: D4CaseBatchResult['documents'][number]
      try {
        imported = await importDocumentFromPath({
          caseId, sourcePath: file.sourcePath, role, fileIndex: i + 1,
          fileCount: intake.files.length, requestId: input.requestId, onProgress,
        })
      } catch (error) {
        const reason = '导入失败：' + (error instanceof Error ? error.message : String(error))
        await warn(file.originLabel, reason)
        await checkpoint(i, 'failed', undefined, reason)
        report('file-failed', i, reason)
        continue
      }
      documents.push(imported)
      await updateCase(caseId, fresh => ({
        ...fresh, d4IntakeOrigins: [...(fresh.d4IntakeOrigins ?? []),
          { documentId: imported.id, originLabel: file.originLabel, sha256: file.sha256 }],
      }), { reason: 'W1 单文件来源与哈希持久落盘' })
      await checkpoint(i, 'stored', imported.id)
      if (imported.parseStatus !== 'parsed' || !imported.blocks.some(block => !!block.text.trim())) {
        const reason = '解析不完整或无可核验文本，原件仍有效'
        await warn(file.originLabel, reason)
        await checkpoint(i, 'needs-review', imported.id, reason)
        report('file-failed', i, reason)
        continue
      }
      if (choice.kind === 'replace') {
        const revision = await transition(choice.documentId, imported.id, file.originLabel, 'pending')
        try {
          await removeDocumentsFromCase({
            caseId, role, documentIds: [choice.documentId], expectedRevision: revision,
          })
          await transition(choice.documentId, imported.id, file.originLabel, 'archived')
          replacements.push({ oldDocumentId: choice.documentId, newDocumentId: imported.id })
          await checkpoint(i, 'replaced', imported.id)
        } catch (error) {
          const reason = '新原件已收录，但旧版归档异常，需要核对：' +
            (error instanceof Error ? error.message : String(error))
          await transition(choice.documentId, imported.id, file.originLabel, 'archive-failed')
          await warn(file.originLabel, reason)
          await checkpoint(i, 'needs-review', imported.id, reason)
        }
      }
    }
    await finish()
    report('batch-complete', Math.max(0, intake.files.length - 1), '批次已结束，请检查未完成项')
    return { caseId, batchId, documents, skipped: warnings, replacements }
  } finally {
    try {
      const run = getCase(caseId)?.d4BatchRuns?.find(item => item.id === batchId)
      if (run?.status === 'running') await finish()
    } catch (error) {
      console.error('[W1] failed to finalize durable batch checkpoint', error)
    }
    releaseD4Intake(intake, true)
    D4_CASE_WRITE_BUSY.delete(caseId)
  }
}

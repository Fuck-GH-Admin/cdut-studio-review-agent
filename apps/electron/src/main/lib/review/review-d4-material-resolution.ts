/** W1 explicit dual-active version resolution. No auto-choice, deletion or
 * Renderer path trust. Existing V1 archival+V2 projection remain canonical. */
import { createHash } from 'node:crypto'
import { existsSync, lstatSync, readFileSync, realpathSync } from 'node:fs'
import { isAbsolute, join, relative, resolve, sep } from 'node:path'
import { assertSafeId, getCase, getReviewCasesDir, updateCase } from './case-store'
import { removeDocumentsFromCase } from './case-import'
import { D4_CASE_WRITE_BUSY } from './review-d4-case-batch'

function verifyNewOriginal(caseId: string, documentId: string): void {
  const current = getCase(caseId)
  const doc = current?.documents.find(item => item.id === documentId)
  const origin = current?.d4IntakeOrigins?.find(item => item.documentId === documentId)
  if (!doc || !origin || !/^[a-f0-9]{64}$/.test(origin.sha256) ||
      !/^doc-[A-Za-z0-9_-]{6,}$/.test(doc.id) ||
      !doc.fileName || doc.fileName === '.' || doc.fileName === '..' ||
      /[/\\\u0000]/.test(doc.fileName)) throw new Error('D4_RESOLVE_ORIGIN_INVALID')
  const sourceRoot = join(getReviewCasesDir(), caseId, 'source-docs')
  const stored = join(sourceRoot, doc.id + '-' + doc.fileName)
  if (!existsSync(stored) || lstatSync(stored).isSymbolicLink()) throw new Error('D4_RESOLVE_SOURCE_MISSING')
  const rootReal = realpathSync(sourceRoot), actual = realpathSync(stored)
  const within = relative(rootReal, actual)
  if (!within || within === '..' || within.startsWith('..' + sep) ||
      isAbsolute(within)) throw new Error('D4_RESOLVE_SOURCE_OUTSIDE_CASE')
  const stat = lstatSync(actual)
  if (!stat.isFile() || stat.size !== doc.sizeBytes || stat.size > 50 * 1024 * 1024)
    throw new Error('D4_RESOLVE_SIZE_MISMATCH')
  if (createHash('sha256').update(readFileSync(actual)).digest('hex') !== origin.sha256)
    throw new Error('D4_RESOLVE_HASH_MISMATCH')
}
export async function resolveD4MaterialTransition(input: {
  caseId: string; newDocumentId: string; expectedRevision: number
  decision: 'keep-old' | 'keep-new'
}): Promise<{ status: 'archived' | 'abandoned'; oldDocumentId: string; newDocumentId: string }> {
  if (!input || typeof input.caseId !== 'string' || typeof input.newDocumentId !== 'string' ||
      !Number.isSafeInteger(input.expectedRevision) ||
      (input.decision !== 'keep-old' && input.decision !== 'keep-new'))
    throw new Error('D4_RESOLVE_INPUT_INVALID')
  assertSafeId(input.caseId)
  if (!input.caseId.startsWith('d4-')) throw new Error('D4_RESOLVE_NOT_D4_CASE')
  if (D4_CASE_WRITE_BUSY.has(input.caseId)) throw new Error('D4_RESOLVE_CASE_BUSY')
  const before = getCase(input.caseId)
  if (!before) throw new Error('D4_RESOLVE_CASE_NOT_FOUND')
  if ((before.revision ?? 0) !== input.expectedRevision) throw new Error('D4_RESOLVE_STALE_REVISION')
  const transition = before.d4MaterialTransitions?.find(item => item.newDocumentId === input.newDocumentId)
  if (!transition || !['pending', 'archive-failed'].includes(transition.status))
    throw new Error('D4_RESOLVE_TRANSITION_NOT_ELIGIBLE')
  const oldActive = before.documents.find(item => item.id === transition.previousDocumentId)
  const newActive = before.documents.find(item => item.id === transition.newDocumentId)
  const oldArchived = before.archivedDocuments?.find(item => item.id === transition.previousDocumentId)
  const newArchived = before.archivedDocuments?.find(item => item.id === transition.newDocumentId)
  if ((oldActive && newActive && oldActive.role !== newActive.role) ||
      ![oldActive, oldArchived].some(Boolean) || ![newActive, newArchived].some(Boolean))
    throw new Error('D4_RESOLVE_VERSION_IDENTITY_INVALID')
  const keepingNew = input.decision === 'keep-new'
  if (keepingNew && (!newActive || newActive.parseStatus !== 'parsed' ||
      !newActive.blocks.some(block => !!block.text.trim())))
    throw new Error('D4_RESOLVE_NEW_SOURCE_NOT_REVIEWABLE')
  if (keepingNew) verifyNewOriginal(input.caseId, transition.newDocumentId)
  // If the original archive succeeded but completion status was interrupted,
  // acknowledge only the observed canonical version state; never resurrect.
  const correctSingleActive = keepingNew ? !!oldArchived && !!newActive && !oldActive
    : !!oldActive && !!newArchived && !newActive
  const bothActive = !!oldActive && !!newActive
  if (!correctSingleActive && !bothActive) throw new Error('D4_RESOLVE_CONFLICTING_VERSION_STATE')
  D4_CASE_WRITE_BUSY.add(input.caseId)
  try {
    if (bothActive) {
      await removeDocumentsFromCase({ caseId: input.caseId,
        role: keepingNew ? oldActive!.role : newActive!.role,
        documentIds: [keepingNew ? oldActive!.id : newActive!.id],
        expectedRevision: input.expectedRevision })
    }
    const finalStatus = keepingNew ? 'archived' as const : 'abandoned' as const
    await updateCase(input.caseId, fresh => ({
      ...fresh,
      d4MaterialTransitions: (fresh.d4MaterialTransitions ?? []).map(item =>
        item.newDocumentId === transition.newDocumentId ? { ...item, status: finalStatus } : item),
      d4IntakeWarnings: [...(fresh.d4IntakeWarnings ?? []), {
        originLabel: transition.originLabel,
        reason: '审核员手动裁决双版本：' +
          (keepingNew ? '采用新版、归档旧版' : '保留旧版、归档新版') +
          '；任何既有来源确认需按真实 V2 版本重新核验',
      }],
    }), { reason: 'W1 手动裁决材料修订分歧（保留历史原件）' })
    return { status: finalStatus, oldDocumentId: transition.previousDocumentId,
      newDocumentId: transition.newDocumentId }
  } finally {
    D4_CASE_WRITE_BUSY.delete(input.caseId)
  }
}

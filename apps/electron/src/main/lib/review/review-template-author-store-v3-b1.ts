/**
 * Dev-B B1 append-only author revision + immutable candidate Plan vault.
 * Independent of CaseAggregate/Template publication. Does not authenticate authorId:
 * Main must bind a trusted author before exposing this adapter through IPC.
 */
import { createHash } from 'node:crypto'
import { closeSync, existsSync, mkdirSync, openSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { getConfigDir } from '../config-paths'
import {
  compileReviewB1Plan, verifyReviewB1Descriptor,
  type B1AuthorDocument, type ImmutablePlanDescriptorB1,
} from './review-template-plan-adapter-v3-b1'

const nameRe = /^[A-Za-z][A-Za-z0-9._-]{0,79}$/
const sha256 = (x: unknown): string => createHash('sha256').update(JSON.stringify(x), 'utf8').digest('hex')
const fail = (code: string): never => { throw new Error('B1_' + code) }
const folder = (templateId: string): string => {
  if (!nameRe.test(templateId) || templateId === '.' || templateId === '..') {
    throw new Error('B1_TEMPLATE_ID_INVALID')
  }
  return join(getConfigDir(), 'review-v3-author-candidate', templateId)
}
export interface B1AuthorRevision {
  schemaVersion: 'review-b1-draft/1'
  templateId: string
  revision: number
  authorId: string
  savedAt: string
  document: B1AuthorDocument
  digest: string
  parentDigest?: string
}
export interface B1FrozenCandidate {
  schemaVersion: 'review-b1-frozen/1'
  templateId: string
  revision: number
  authorDigest: string
  descriptor: ImmutablePlanDescriptorB1
  frozenAt: string
  /** NOT official published, not school-signed. */
  status: 'candidate-held'
}
const revisionFile = (id: string, n: number): string => join(folder(id), 'revisions', n + '.json')
const validateDraft = (doc: B1AuthorDocument): void => {
  if (!doc || doc.schemaVersion !== 'review-b1/1' ||
      !nameRe.test(doc.templateId) || doc.status !== 'candidate-held' ||
      typeof doc.templateVersion !== 'string' ||
      !Array.isArray(doc.fields) || !Array.isArray(doc.sources) ||
      !Array.isArray(doc.targets) || !Array.isArray(doc.modules) ||
      !Array.isArray(doc.stages) || !Array.isArray(doc.outputs)) {
    throw new Error('B1_DRAFT_STRUCTURE_INVALID')
  }
}
const verifyRevision = (record: B1AuthorRevision, id: string, n: number, previous?: B1AuthorRevision): void => {
  if (!record || record.schemaVersion !== 'review-b1-draft/1' ||
      record.templateId !== id || record.revision !== n ||
      record.document?.templateId !== id || !record.authorId?.trim() ||
      record.digest !== sha256(record.document) ||
      (n === 1 ? record.parentDigest !== undefined : record.parentDigest !== previous?.digest)) {
    throw new Error('B1_HISTORY_BROKEN')
  }
  validateDraft(record.document)
}
/** Strict full-chain verify: missing parent cannot be skipped by reading a newer snapshot. */
export function readB1AuthorRevision(templateId: string, revision?: number): B1AuthorRevision | undefined {
  const dir = join(folder(templateId), 'revisions')
  if (!existsSync(dir)) return undefined
  const entries = readdirSync(dir).filter((name) => /^[1-9]\d*\.json$/.test(name))
    .map((name) => Number(name.slice(0, -5))).filter(Number.isSafeInteger).sort((a, b) => a - b)
  const selected = revision ?? entries.at(-1)
  if (!selected) return undefined
  if (!entries.includes(selected)) throw new Error('B1_HISTORY_REVISION_MISSING')
  let previous: B1AuthorRevision | undefined
  for (let n = 1; n <= selected; n += 1) {
    if (!entries.includes(n)) throw new Error('B1_HISTORY_BROKEN_MISSING_PARENT')
    let next: B1AuthorRevision
    try { next = JSON.parse(readFileSync(revisionFile(templateId, n), 'utf8')) as B1AuthorRevision }
    catch { throw new Error('B1_HISTORY_BROKEN_INVALID_JSON') }
    verifyRevision(next, templateId, n, previous)
    previous = next
  }
  return structuredClone(previous)
}
/** Allows incomplete drafts; compile validation occurs at explicit preview/freeze. */
export function saveB1AuthorRevision(
  document: B1AuthorDocument, expectedRevision: number, authorId: string,
): B1AuthorRevision {
  validateDraft(document)
  if (!authorId?.trim()) throw new Error('B1_AUTHOR_REQUIRED')
  if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0) throw new Error('B1_EXPECTED_REVISION_INVALID')
  const dir = folder(document.templateId)
  mkdirSync(join(dir, 'revisions'), { recursive: true })
  const lock = join(dir, 'author.lock')
  const fd = openSync(lock, 'wx')
  try {
    const prior = readB1AuthorRevision(document.templateId)
    const current = prior?.revision ?? 0
    if (current !== expectedRevision) throw new Error('B1_AUTHOR_REVISION_CONFLICT')
    const next: B1AuthorRevision = {
      schemaVersion: 'review-b1-draft/1', templateId: document.templateId,
      revision: current + 1, authorId, savedAt: new Date().toISOString(),
      document: structuredClone(document), digest: sha256(document),
      ...(prior ? { parentDigest: prior.digest } : {}),
    }
    writeFileSync(revisionFile(document.templateId, next.revision),
      JSON.stringify(next, null, 2) + '\n', { encoding: 'utf8', flag: 'wx' })
    return structuredClone(next)
  } finally {
    closeSync(fd)
    unlinkSync(lock)
  }
}
/** Freezes immutable candidate descriptor; does not alter the author source or Case. */
export function freezeB1Candidate(templateId: string, revision: number): B1FrozenCandidate {
  const source = readB1AuthorRevision(templateId, revision)
  if (!source) throw new Error('B1_AUTHOR_REVISION_NOT_FOUND')
  const latest = readB1AuthorRevision(templateId)
  if (latest?.revision !== revision) throw new Error('B1_AUTHOR_REVISION_STALE')
  const descriptor = compileReviewB1Plan(source.document)
  const result: B1FrozenCandidate = {
    schemaVersion: 'review-b1-frozen/1', templateId, revision,
    authorDigest: descriptor.authorDigest, descriptor,
    frozenAt: new Date().toISOString(), status: 'candidate-held',
  }
  const dir = join(folder(templateId), 'frozen')
  mkdirSync(dir, { recursive: true })
  const file = join(dir, descriptor.canonicalPlan.fingerprint + '.json')
  if (existsSync(file)) {
    const previous = readB1FrozenCandidate(templateId, descriptor.canonicalPlan.fingerprint)
    if (!previous || previous.revision !== revision ||
        previous.authorDigest !== descriptor.authorDigest) throw new Error('B1_FROZEN_IDENTITY_CONFLICT')
    return previous
  }
  writeFileSync(file, JSON.stringify(result, null, 2) + '\n', { encoding: 'utf8', flag: 'wx' })
  return result
}
export function readB1FrozenCandidate(templateId: string, fingerprint: string): B1FrozenCandidate | undefined {
  if (!/^[a-f0-9]{64}$/.test(fingerprint)) throw new Error('B1_FINGERPRINT_INVALID')
  const file = join(folder(templateId), 'frozen', fingerprint + '.json')
  if (!existsSync(file)) return undefined
  let result: B1FrozenCandidate
  try { result = JSON.parse(readFileSync(file, 'utf8')) as B1FrozenCandidate }
  catch { throw new Error('B1_FROZEN_CORRUPT') }
  if (!result || result.schemaVersion !== 'review-b1-frozen/1' ||
      result.templateId !== templateId || result.status !== 'candidate-held' ||
      result.descriptor?.canonicalPlan?.fingerprint !== fingerprint ||
      result.authorDigest !== result.descriptor.authorDigest) {
    throw new Error('B1_FROZEN_CORRUPT')
  }
  const source = readB1AuthorRevision(templateId, result.revision)
  if (!source) throw new Error('B1_FROZEN_SOURCE_MISSING')
  verifyReviewB1Descriptor(source.document, result.descriptor)
  return result
}

/**
 * Integrator-I technical-only bridge: B2 parser-registered staged block -> A
 * versioned physical Host read proposal. Never a Main Host attestation or
 * C2 business writer. A caller must separately establish real Main authority.
 *
 * A Owner grant and B2 staged owner are independent revocation domains.
 * Validate the exact registered block and current staged ORIGINAL bytes
 * before AND after any awaited Host read. A local proposal cannot establish
 * published Plan, persistent Case evidence, or durable C2 ACK.
 */
import { createHash } from 'node:crypto'
import type { SourceIdentity } from '@profer/shared'
import type { AVerifiedExecutionHost } from './review-v3-execution-proposal-producer'
import {
  type B2MainContext, ReviewB2StagingService,
} from './review-intake-adapter-v3-b2'
import { ReviewB2SourceVersionAdapter } from './review-source-version-adapter-v3-b2'

export interface I2StagedBlockReadInput {
  staging: ReviewB2StagingService
  parser: ReviewB2SourceVersionAdapter
  mainContext: B2MainContext
  candidateId: string
  /** Only the real physical Host implementation may be supplied by Main. */
  physicalRead: AVerifiedExecutionHost['read']
}

const stable = (value: unknown): string => {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null'
  if (Array.isArray(value)) return '[' + value.map(stable).join(',') + ']'
  const obj = value as Record<string, unknown>
  return '{' + Object.keys(obj).filter(key => obj[key] !== undefined).sort()
    .map(key => JSON.stringify(key) + ':' + stable(obj[key])).join(',') + '}'
}

/**
 * Guard ONLY a single parser block read. A block cannot claim full-document
 * physical coverage. This deliberately does not wrap check/terminal or mint
 * any Host receipt: the injected physicalRead must provide a real receipt.
 */
export function createI2StagedBlockReadGuard(
  input: I2StagedBlockReadInput,
): AVerifiedExecutionHost['read'] {
  const verify = (source: SourceIdentity): void => {
    input.staging.assertStillGranted(input.mainContext)
    const candidate = input.staging.getCandidate(input.mainContext, input.candidateId)
    if (source.caseId !== input.mainContext.caseCandidateId ||
        candidate.caseCandidateId !== source.caseId ||
        candidate.ownerGeneration !== input.mainContext.ownerGeneration ||
        candidate.documentVersionId !== source.documentVersionId ||
        candidate.materialId !== source.materialId ||
        candidate.rawSha256 !== source.rawSha256) {
      throw new Error('I2_STAGED_SOURCE_SCOPE_MISMATCH')
    }
    // Registry refuses forged parseRevision, unregistered block, stale owner.
    const registered = input.parser.sourceForBlock(
      input.mainContext, input.candidateId, source.parseRevision, source.blockId,
    )
    if (stable(registered) !== stable(source)) {
      throw new Error('I2_STAGED_BLOCK_IDENTITY_MISMATCH')
    }
    // The registry's old digest alone is not enough: re-read the staged bytes.
    const current = input.staging.read(input.mainContext, input.candidateId)
    if (current.byteLength !== candidate.byteLength ||
        createHash('sha256').update(current).digest('hex') !== source.rawSha256) {
      throw new Error('I2_STAGED_ORIGINAL_BYTES_CHANGED')
    }
  }
  return async (original): ReturnType<AVerifiedExecutionHost['read']> => {
    const immutableSource = structuredClone(original)
    verify(immutableSource)
    const physical = await input.physicalRead(structuredClone(immutableSource))
    // Explicit independent B2 fence after await, even while A Owner stays live.
    verify(immutableSource)
    if (!physical || physical.extent !== 'block' ||
        !physical.receiptId?.trim() ||
        stable(physical.actualSource) !== stable(immutableSource)) {
      throw new Error('I2_STAGED_BLOCK_HOST_RECEIPT_MISMATCH')
    }
    // The Host receipt is evidence for exactly this block, not the whole file.
    return physical
  }
}

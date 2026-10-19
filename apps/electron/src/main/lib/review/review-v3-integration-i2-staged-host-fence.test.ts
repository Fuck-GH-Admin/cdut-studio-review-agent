/**
 * I2 R04: genuine B2 ORIGINAL .txt parser + A Owner/versioned producer +
 * C pure validator. Main, picker, Host and published Plan are SYNTHETIC;
 * the emitted proposal has no C2 durable business acknowledgement.
 */
import { describe, expect, test } from 'bun:test'
import {
  REVIEW_C0_SCHEMA_VERSION, type CanonicalPlan, type Principal,
  type RunEvidenceIdentity,
} from '@profer/shared'
import {
  ReviewB2StagingService, type B2MainContext,
} from './review-intake-adapter-v3-b2'
import { ReviewB2SourceVersionAdapter } from './review-source-version-adapter-v3-b2'
import { V3ReviewOwnerAdapter, type OwnerPersistence } from './review-pi-owner-adapter'
import {
  V3AProposalProducer, type AVerifiedExecutionHost,
} from './review-v3-execution-proposal-producer'
import {
  executionProposalId, validateV3ExecutionProposal,
  type V3TrustedConsumptionContext, type V3VerifiedHostReceipt,
} from './review-v3-execution-contract'
import { createI2StagedBlockReadGuard } from './review-v3-integration-i2-staged-host-fence'

function memory(): OwnerPersistence {
  let current: string | null = null
  return { read: () => current, write: value => { current = value } }
}

async function fixture(
  physicalRead?: AVerifiedExecutionHost['read'],
) {
  const ctx: B2MainContext = {
    senderId: 48, frameId: 3, ownerId: 'synthetic-main-owner',
    ownerGeneration: 1, caseCandidateId: 'synthetic-b2-a-c-case',
  }
  const staging = new ReviewB2StagingService()
  const bytes = Buffer.from('Original physical paragraph for exact source block.\n')
  const material = staging.stage(ctx, staging.grant(ctx).token, {
    requestId: 'main-picker-01', fileName: 'original.txt',
    physicalSourceKey: 'synthetic-main-picked-original',
    bytes, role: 'supporting', subjectId: 'subject-1',
  })
  const parser = new ReviewB2SourceVersionAdapter(staging)
  const parsed = await parser.parse(ctx, material)
  if (parsed.status === 'failed' || !parsed.blocks[0]) {
    throw new Error('FIXTURE_REQUIRES_PARSER_REGISTERED_BLOCK')
  }
  const source = parser.sourceForBlock(ctx, material.candidateId,
    parsed.parseRevision, parsed.blocks[0].blockId)
  const plan: CanonicalPlan = {
    schemaVersion: REVIEW_C0_SCHEMA_VERSION, planId: 'synthetic-candidate-plan',
    fingerprint: 'synthetic-fingerprint', templateId: 'candidate-only',
    templateVersion: 'v1', moduleDigests: [],
    bindings: [{
      checkKey: 'check-1', targetKey: 'target-1', objectKey: 'object-1',
      subjectId: 'subject-1', sourceVersionIds: [source.documentVersionId],
      applicability: 'applicable', conditionFingerprint: 'c1',
    }],
  }
  const run: RunEvidenceIdentity = {
    schemaVersion: REVIEW_C0_SCHEMA_VERSION,
    runId: 'synthetic-versioned-run', caseId: ctx.caseCandidateId,
    caseRevision: 2, planFingerprint: plan.fingerprint,
    templateVersion: plan.templateVersion,
    inputManifestHash: 'b'.repeat(64),
    sourceVersionIds: [source.documentVersionId],
    checkKeys: ['check-1'], attemptId: 'synthetic-attempt-1',
    ownerGeneration: ctx.ownerGeneration,
  }
  const principal: Principal = {
    principalId: 'synthetic-physical-main', source: 'local', role: 'reviewer',
    sessionId: 'synthetic-window', assurance: 'local-device',
    scope: { caseIds: [ctx.caseCandidateId], actions: ['start-review'] },
  }
  const owners = new V3ReviewOwnerAdapter(memory(), {
    authorizeExecution: () => {},
    isCurrent: () => true,
  })
  const lease = owners.grant({
    principal, run, plan, sources: [source],
    sessionId: 'synthetic-host-session', senderKey: 'synthetic-main-frame',
    expiresAt: Date.now() + 60_000,
    permittedTools: ['review_read_documents'],
  })
  const receiptId = 'synthetic-host-block-receipt'
  const host: AVerifiedExecutionHost = {
    read: createI2StagedBlockReadGuard({
      staging, parser, mainContext: ctx, candidateId: material.candidateId,
      physicalRead: physicalRead ?? (async original => ({
        receiptId, actualSource: original, extent: 'block',
      })),
    }),
    check: async () => { throw new Error('NO_CHECK_HOST_IN_THIS_FIXTURE') },
    terminal: async () => { throw new Error('NO_TERMINAL_HOST_IN_THIS_FIXTURE') },
  }
  const producer = new V3AProposalProducer(memory(), owners, host)
  const call = {
    principal, sessionId: lease.sessionId, senderKey: lease.senderKey,
    grantId: lease.grantId, tool: 'review_read_documents' as const, source,
  }
  const trusted = (): V3TrustedConsumptionContext => {
    const receipts = new Map<string, V3VerifiedHostReceipt>([[
      receiptId, {
        kind: 'read', permissionGrantId: lease.grantId, source,
        extent: 'block',
      },
    ]])
    return {
      run, plan, permissionGrantId: lease.grantId, grantActive: true,
      currentCaseRevision: run.caseRevision,
      activeSourceVersionIds: [source.documentVersionId],
      verifiedHostReceipts: receipts, nextSequence: 1,
      committedDigests: new Map(),
    }
  }
  return { ctx, staging, material, parser, source, producer, call, trusted, receiptId }
}

describe('I2 R04 B2 parsed staged original → A physical Host → C pure validator', () => {
  test('registered block and byte hash enter A proposal and C validator; no C2 ACK', async () => {
    const h = await fixture()
    const proposal = await h.producer.read(h.call)
    if (proposal.kind !== 'read') throw new Error('EXPECTED_BLOCK_PROPOSAL')
    expect(proposal.read.source).toEqual(h.source)
    expect(proposal.read.extent).toBe('block')
    const { eventId: _id, ...body } = proposal
    expect(proposal.eventId).toBe(executionProposalId(body))
    expect(validateV3ExecutionProposal(proposal, h.trusted())).toBe('new')
    expect(validateV3ExecutionProposal(proposal, {
      ...h.trusted(), nextSequence: 2,
      committedDigests: new Map([[1, proposal.eventId]]),
    })).toBe('replay')
    expect(h.producer.replayCandidates()).toHaveLength(1)
    // No C Case/Run writer invoked; a candidate remains unpublished.
    expect(h.staging.previewImportBatch(h.ctx, [h.material.candidateId]).status)
      .toBe('staged')
  })

  test('B2 revoked DURING awaited Host read denies A proposal despite live A Owner', async () => {
    let enter!: () => void
    let release!: () => void
    const entered = new Promise<void>(resolve => { enter = resolve })
    const pending = new Promise<void>(resolve => { release = resolve })
    const h = await fixture(async actualSource => {
      enter()
      await pending
      return { receiptId: 'late-physical-host', actualSource, extent: 'block' }
    })
    const read = h.producer.read(h.call)
    await entered
    h.staging.revoke(h.ctx)
    release()
    await expect(read).rejects.toThrow()
    expect(h.producer.replayCandidates()).toHaveLength(0)
  })

  test('cross-case, forged parse block, and full-document overclaim fail closed', async () => {
    const h = await fixture(async actualSource => ({
      receiptId: hReceipt, actualSource, extent: 'full-document',
      coveredPhysicalBlocks: 1, totalPhysicalBlocks: 1,
    }))
    const hReceipt = 'false-full-document'
    const guarded = createI2StagedBlockReadGuard({
      staging: h.staging, parser: h.parser, mainContext: h.ctx,
      candidateId: h.material.candidateId,
      physicalRead: async actualSource => ({
        receiptId: 'host-block', actualSource, extent: 'block',
      }),
    })
    await expect(guarded({ ...h.source, caseId: 'other-case' })).rejects.toThrow()
    await expect(guarded({
      ...h.source, blockId: 'fabricated-parser-block',
    })).rejects.toThrow()
    await expect(h.producer.read(h.call)).rejects.toThrow('I2_STAGED_BLOCK_HOST_RECEIPT_MISMATCH')
    expect(h.producer.replayCandidates()).toHaveLength(0)
  })
})

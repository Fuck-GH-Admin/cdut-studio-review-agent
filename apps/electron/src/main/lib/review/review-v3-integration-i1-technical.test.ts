import { describe, expect, test } from 'bun:test'
import { REVIEW_C0_SCHEMA_VERSION, type CaseAggregateV2, type RunEvidenceIdentity } from '@profer/shared'
import { ReviewB2StagingService, type B2MainContext } from './review-intake-adapter-v3-b2'
import {
  compileReviewB1Plan, type B1AuthorDocument,
} from './review-template-plan-adapter-v3-b1'
import {
  inspectI1TechnicalPreview, inspectI1PhysicalSourceBlock,
} from './review-v3-integration-i1-technical'
import { ReviewB2SourceVersionAdapter } from './review-source-version-adapter-v3-b2'

const ctx: B2MainContext = {
  senderId: 10, frameId: 1, ownerId: 'trusted-main-local', ownerGeneration: 2,
  caseCandidateId: 'candidate-case',
}
function stagingSample() {
  const staging = new ReviewB2StagingService(() => 100)
  const grant = staging.grant(ctx)
  const material = staging.stage(ctx, grant.token, {
    requestId: 'request1', fileName: 'review.txt', physicalSourceKey: 'picker:physical-1',
    bytes: new TextEncoder().encode('real staged original bytes'),
    role: 'supporting', subjectId: 'subject-1',
  })
  return { staging, material }
}
function author(documentVersionId: string, second: boolean | null = null): B1AuthorDocument {
  return {
    schemaVersion: 'review-b1/1', status: 'candidate-held',
    templateId: 'custom.review', templateVersion: 'v1',
    name: 'Test preview', purpose: 'Offline candidate technical check',
    fields: [{ key: 'flag', label: 'Condition flag', type: 'boolean', required: true,
      sourceId: 'source-1' }],
    sources: [{ sourceId: 'source-1', kind: 'user-declared', documentVersionId,
      locator: 'paragraph:1', recordedBy: 'candidate-author' }],
    targets: [
      { targetKey: 'target-1', objectKey: 'object-1', subjectId: 'subject-1',
        scenario: 'case-a', fieldValues: { flag: true } },
      { targetKey: 'target-2', objectKey: 'object-2', subjectId: 'subject-2',
        scenario: 'case-b', fieldValues: { flag: second } },
    ],
    modules: [{
      moduleId: 'module-1', version: 'v1', dependsOn: [],
      checks: [{ checkKey: 'R01', requirement: 'Evidence must satisfy flag',
        sourceIds: ['source-1'], targetKeys: ['target-1', 'target-2'],
        condition: { kind: 'field-equals', fieldKey: 'flag', equals: true },
        responsibility: 'reviewer' }],
    }],
    stages: [{ stageId: 'check', role: 'reviewer', mode: 'technical' }],
    outputs: [{ outputId: 'result', kind: 'draft-preview' }],
  }
}
function runFor(draft: B1AuthorDocument, versionId: string): RunEvidenceIdentity {
  return {
    schemaVersion: REVIEW_C0_SCHEMA_VERSION, runId: 'run-proposal-only', caseId: ctx.caseCandidateId,
    caseRevision: 4, planFingerprint: compileReviewB1Plan(draft).canonicalPlan.fingerprint,
    templateVersion: 'v1', inputManifestHash: 'a'.repeat(64),
    sourceVersionIds: [versionId], checkKeys: ['R01'], attemptId: 'attempt-1',
    ownerGeneration: 2,
  }
}
const accepted = (targetKey: string, objectKey: string, subjectId: string) => ({
  checkKey: 'R01', targetKey, objectKey, subjectId,
  status: 'accepted' as const, hostReceiptId: 'host-fixture-receipt',
})
const t1 = accepted('target-1', 'object-1', 'subject-1')
const t2 = accepted('target-2', 'object-2', 'subject-2')

describe('I1 frozen B1+B2+B3+A3+C1 read-only integration (synthetic Gate O)', () => {
  test('actual staged material + candidate Plan + A3 exact coverage leaves unknown unapproved', () => {
    const { staging, material } = stagingSample()
    const draft = author(material.documentVersionId)
    const output = inspectI1TechnicalPreview({
      mainContext: ctx, staging, candidateIds: [material.candidateId],
      authorDraft: draft, proposedRun: runFor(draft, material.documentVersionId),
      technicalObservations: [t1],
    })
    expect(output.classification).toBe('STAGED_ONLY')
    expect(output.publicationAllowed).toBe(false)
    expect(output.canInstallPlan).toBe(false)
    expect(output.canCommitRun).toBe(false)
    expect(output.canFinalizeDecision).toBe(false)
    expect(output.coverage.state).toBe('partial')
    expect(output.coverage.accepted).toHaveLength(1)
    expect(output.coverage.unknown).toHaveLength(1)
    expect(output.subjectSourceBlockers).toHaveLength(1)
    expect(output.technicalPreviewEligible).toBe(false)
  })
  test('claimed accepted unknown target, fabricated staged source and wrong case fail closed', () => {
    const { staging, material } = stagingSample()
    const draft = author(material.documentVersionId)
    const base = { mainContext: ctx, staging, candidateIds: [material.candidateId],
      authorDraft: draft, proposedRun: runFor(draft, material.documentVersionId) }
    expect(() => inspectI1TechnicalPreview({ ...base, technicalObservations: [t1, t2] })).toThrow()
    const forged = author('renderer-forged-document-version')
    expect(() => inspectI1TechnicalPreview({
      ...base, authorDraft: forged, proposedRun: runFor(forged, material.documentVersionId),
    })).toThrow('I1_PLAN_SOURCE_NOT_STAGED')
    expect(() => inspectI1TechnicalPreview({
      ...base, proposedRun: { ...base.proposedRun, sourceVersionIds: ['wrong-source'] },
    })).toThrow('I1_RUN_SOURCE_NOT_STAGED')
    expect(() => inspectI1TechnicalPreview({
      ...base, currentCaseSnapshot: { caseV2: { id: 'another-case' } } as CaseAggregateV2,
    })).toThrow('I1_CURRENT_CASE_SCOPE_MISMATCH')
  })
  test('cross-case and stale Main owner generation cannot borrow staged B2 sources for technical preview', () => {
    const { staging, material } = stagingSample()
    const draft = author(material.documentVersionId, true)
    draft.targets = draft.targets.slice(0, 1)
    draft.modules[0]!.checks[0]!.targetKeys = ['target-1']
    const validRun = runFor(draft, material.documentVersionId)
    const input = {
      mainContext: ctx, staging, candidateIds: [material.candidateId],
      authorDraft: draft, proposedRun: validRun, technicalObservations: [t1],
    }
    const valid = inspectI1TechnicalPreview(input)
    expect(valid.coverage.state).toBe('technically-complete')
    expect(valid.technicalPreviewEligible).toBe(true)
    expect(valid.canCommitRun).toBe(false)
    const wrongCase = { ...validRun, caseId: 'another-case-with-same-physical-version' }
    expect(() => inspectI1TechnicalPreview({
      ...input, proposedRun: wrongCase,
    })).toThrow('I1_RUN_MAIN_INTAKE_SCOPE_MISMATCH')
    const staleGeneration = { ...validRun, ownerGeneration: ctx.ownerGeneration - 1 }
    expect(() => inspectI1TechnicalPreview({
      ...input, proposedRun: staleGeneration,
    })).toThrow('I1_RUN_MAIN_INTAKE_SCOPE_MISMATCH')
    // A nonmatching Main intake context itself must not validate this Run.
    expect(() => inspectI1TechnicalPreview({
      ...input, mainContext: { ...ctx, caseCandidateId: 'other-case' },
    })).toThrow('I1_RUN_MAIN_INTAKE_SCOPE_MISMATCH')
  })

  test('wrong claimed template release and stale read-only Case snapshot cannot authorize a technical preview', () => {
    const { staging, material } = stagingSample()
    const draft = author(material.documentVersionId, true)
    draft.targets = draft.targets.slice(0, 1)
    draft.modules[0]!.checks[0]!.targetKeys = ['target-1']
    const proposedRun = runFor(draft, material.documentVersionId)
    const baseline = {
      mainContext: ctx, staging, candidateIds: [material.candidateId],
      authorDraft: draft, proposedRun, technicalObservations: [t1],
    }
    const caseSnapshot = {
      caseV2: { id: ctx.caseCandidateId, revision: proposedRun.caseRevision },
      evidenceLinks: [], observations: [],
    } as unknown as CaseAggregateV2
    // The Main read-only snapshot is advisory; when supplied it must match
    // the proposed frozen revision. It cannot confer formal writer authority.
    expect(inspectI1TechnicalPreview({
      ...baseline, currentCaseSnapshot: caseSnapshot,
    }).technicalPreviewEligible).toBe(true)
    expect(() => inspectI1TechnicalPreview({
      ...baseline, proposedRun: { ...proposedRun, templateVersion: 'forged-v2' },
    })).toThrow('I1_RUN_TEMPLATE_VERSION_MISMATCH')
    expect(() => inspectI1TechnicalPreview({
      ...baseline,
      currentCaseSnapshot: {
        ...caseSnapshot, caseV2: { ...caseSnapshot.caseV2, revision: proposedRun.caseRevision + 1 },
      },
    })).toThrow('I1_CURRENT_CASE_REVISION_MISMATCH')
  })

  test('both Host diagnostic tuples can be complete while cross-Subject evidence remains blocked', () => {
    const { staging, material } = stagingSample()
    const draft = author(material.documentVersionId, true)
    const output = inspectI1TechnicalPreview({
      mainContext: ctx, staging, candidateIds: [material.candidateId],
      authorDraft: draft, proposedRun: runFor(draft, material.documentVersionId),
      technicalObservations: [t1, t2],
    })
    expect(output.coverage.state).toBe('technically-complete')
    expect(output.subjectSourceBlockers).toHaveLength(1)
    expect(output.technicalPreviewEligible).toBe(false)
    expect(output.canCommitRun).toBe(false)
    expect(output.canFinalizeDecision).toBe(false)
    expect(output.publicationAllowed).toBe(false)
  })

  test('single-Subject physical candidate permits only a valid technical preview, never a formal approval', () => {
    const { staging, material } = stagingSample()
    const draft = author(material.documentVersionId, true)
    draft.targets = draft.targets.slice(0, 1)
    draft.modules[0]!.checks[0]!.targetKeys = ['target-1']
    const output = inspectI1TechnicalPreview({
      mainContext: ctx, staging, candidateIds: [material.candidateId],
      authorDraft: draft, proposedRun: runFor(draft, material.documentVersionId),
      technicalObservations: [t1],
    })
    expect(output.coverage.state).toBe('technically-complete')
    expect(output.subjectSourceBlockers).toEqual([])
    expect(output.technicalPreviewEligible).toBe(true)
    expect(output.canInstallPlan).toBe(false)
    expect(output.canCommitRun).toBe(false)
    expect(output.canFinalizeDecision).toBe(false)
  })
  test('C1 archived confirmed evidence blocks preview current-validity even when A3 diagnostic is complete', () => {
    const { staging, material } = stagingSample()
    const draft = author(material.documentVersionId, true)
    const snapshot = {
      caseV2: { id: ctx.caseCandidateId, revision: 4, documents: [{ versionId: material.documentVersionId, active: false }] },
      evidenceLinks: [{ id: 'old-link', status: 'confirmed', documentVersionId: material.documentVersionId }],
      observations: [],
    } as unknown as CaseAggregateV2
    const output = inspectI1TechnicalPreview({
      mainContext: ctx, staging, candidateIds: [material.candidateId],
      authorDraft: draft, proposedRun: runFor(draft, material.documentVersionId),
      technicalObservations: [t1, t2], currentCaseSnapshot: snapshot,
    })
    expect(output.coverage.state).toBe('technically-complete')
    expect(output.sourceValidityBlockers).toContain('evidence:old-link')
    expect(output.technicalPreviewEligible).toBe(false)
    expect(snapshot.evidenceLinks[0]!.status).toBe('confirmed') // diagnostic never changes persisted snapshot
  })
  test('20-second route only selects an evidenced authorized technical suggestion, not candidate-held policy', () => {
    const { staging, material } = stagingSample()
    const draft = author(material.documentVersionId)
    const route = {
      startedAtMs: 0, nowMs: 20_000, automaticSelectionEnabled: true,
      userInterrupted: false,
      suggestions: [{
        templateId: draft.templateId, templateVersion: draft.templateVersion,
        availability: 'candidate-held' as const, confidence: 0.99,
        caseCandidateId: ctx.caseCandidateId,
        evidence: [{ materialCandidateId: material.candidateId,
          rawSha256: material.rawSha256, reason: 'original bytes match' }],
      }],
    }
    const base = { mainContext: ctx, staging, candidateIds: [material.candidateId],
      authorDraft: draft, proposedRun: runFor(draft, material.documentVersionId) }
    const held = inspectI1TechnicalPreview({ ...base, routing: route })
    expect(held.route?.status).toBe('needs-user-confirmation')
    const allowed = inspectI1TechnicalPreview({
      ...base, routing: { ...route, suggestions: [{ ...route.suggestions[0]!,
        availability: 'authorized-for-technical-selection' as const }] },
    })
    expect(allowed.route?.status).toBe('default-selected')
    expect(allowed.canInstallPlan).toBe(false)
    expect(allowed.canFinalizeDecision).toBe(false)
  })

  test('actual parser registry binds staged physical bytes and refuses forged block/read claim', async () => {
    const { staging, material } = stagingSample()
    const parser = new ReviewB2SourceVersionAdapter(staging)
    const registered = await inspectI1PhysicalSourceBlock({
      staging, parser, mainContext: ctx, candidateId: material.candidateId,
    })
    expect(registered.classification).toBe('STAGED_ONLY')
    expect(registered.status).toBe('VERIFIED_BLOCK_ONLY')
    expect(registered.fullDocumentReadProven).toBe(false)
    expect(registered.source?.rawSha256).toBe(material.rawSha256)
    expect(registered.source?.documentVersionId).toBe(material.documentVersionId)
    expect(registered.source?.location.kind).toBe('paragraph')
    await expect(inspectI1PhysicalSourceBlock({
      staging, parser, mainContext: ctx, candidateId: material.candidateId,
      blockId: 'renderer-forged-block',
    })).rejects.toThrow('B2_SOURCE_BLOCK_UNVERIFIED')
    staging.revoke(ctx)
    await expect(inspectI1PhysicalSourceBlock({
      staging, parser, mainContext: ctx, candidateId: material.candidateId,
    })).rejects.toThrow()
  })
  test('staging owner revoke denies further I1 previews and duplicate candidate ids fail', () => {
    const { staging, material } = stagingSample()
    const draft = author(material.documentVersionId)
    const base = { mainContext: ctx, staging, candidateIds: [material.candidateId],
      authorDraft: draft, proposedRun: runFor(draft, material.documentVersionId) }
    expect(() => inspectI1TechnicalPreview({
      ...base, candidateIds: [material.candidateId, material.candidateId],
    })).toThrow('I1_CANDIDATE_SET_INVALID')
    staging.revoke(ctx)
    expect(() => inspectI1TechnicalPreview(base)).toThrow()
  })
})

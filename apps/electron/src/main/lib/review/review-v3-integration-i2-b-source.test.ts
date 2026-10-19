/** I2 selected Dev-B B1/B2/B4 source-only integration.
 * No published Plan, no formal C Main material registration or SchoolPort/Gold.
 */
import { createHash } from 'node:crypto'
import { describe, expect, test } from 'bun:test'
import { ReviewB2StagingService, type B2MainContext } from './review-intake-adapter-v3-b2'
import { compileReviewB1Plan, type B1AuthorDocument } from './review-template-plan-adapter-v3-b1'
import { verifyB4OriginalGitBytes } from './review-v3-b4-original-byte-verifier'

const main: B2MainContext = {
  senderId: 31, frameId: 7, ownerId: 'synthetic-main-b',
  ownerGeneration: 4, caseCandidateId: 'staged-case-b',
}
function actualOriginal() {
  const bytes = Buffer.from('# Physical staged bytes for a candidate only\n')
  const staging = new ReviewB2StagingService()
  const candidate = staging.stage(main, staging.grant(main).token, {
    requestId: 'native-intake-1', fileName: 'real-proof.md',
    physicalSourceKey: 'main-granted-picker-capability',
    bytes, role: 'supporting', subjectId: 'subject-b',
  })
  const pin = {
    templateId: 'candidate-proof',
    observedGitBlob: createHash('sha1').update('blob ' + bytes.length + '\0')
      .update(bytes).digest('hex'),
    declaredSourceSha256: createHash('sha256').update(bytes).digest('hex'),
  }
  return { bytes, staging, candidate, pin }
}
function draft(documentVersionId: string): B1AuthorDocument {
  return {
    schemaVersion: 'review-b1/1', status: 'candidate-held',
    templateId: 'technical-candidate', templateVersion: 'v1',
    name: 'Unpublished technical template', purpose: 'Physical source-only validation',
    fields: [],
    sources: [{sourceId: 'actual-original',kind: 'user-declared',
      documentVersionId,locator: 'physical-byte-original',recordedBy: 'synthetic-main'}],
    targets: [{targetKey:'target-b',objectKey:'object-b',subjectId:'subject-b',
      scenario:'technical-stage',fieldValues:{}}],
    modules: [{moduleId:'b-only',version:'v1',dependsOn:[],
      checks:[{checkKey:'check-b',requirement:'Review original bytes',sourceIds:['actual-original'],
        targetKeys:['target-b'],condition:{kind:'always'},responsibility:'reviewer'}]}],
    stages:[{stageId:'technical',role:'reviewer',mode:'technical'}],
    outputs:[{outputId:'preview',kind:'candidate-result'}],
  }
}

describe('I2 B technical staged physical bytes → B4 historical proof → B1 unpublished Plan', () => {
  test('actual owner-scoped source bytes hash-match historical pin but never publish Gold or Plan', () => {
    const h = actualOriginal()
    expect(h.candidate.rawSha256).toBe(h.pin.declaredSourceSha256)
    const proof = verifyB4OriginalGitBytes(
      h.staging.read(main,h.candidate.candidateId),h.pin,
    )
    expect(proof.status).toBe('HISTORICAL_ORIGINAL_BYTES_MATCH_CANDIDATE_ONLY')
    expect(proof.publicationAllowed).toBe(false)
    expect(proof.policyApproval).toBe('NOT_VERIFIED')
    expect(proof.independentGold).toBe('NOT_AUTHORIZED_OR_NOT_RUN')
    const compiled = compileReviewB1Plan(draft(h.candidate.documentVersionId))
    expect(compiled.publicationAllowed).toBe(false)
    expect(compiled.canonicalPlan.bindings[0]?.sourceVersionIds)
      .toEqual([h.candidate.documentVersionId])
  })
  test('altered byte, forged Git pin, cross-owner read, revoked owner and path injection fail closed', () => {
    const h = actualOriginal()
    const tampered = Buffer.from(h.bytes)
    tampered[1] ^= 1
    expect(() => verifyB4OriginalGitBytes(tampered,h.pin))
      .toThrow('B4_ORIGINAL_BYTES_CONTENT_MISMATCH')
    expect(() => verifyB4OriginalGitBytes(h.bytes,{
      ...h.pin,observedGitBlob:'f'.repeat(40),
    })).toThrow('B4_ORIGINAL_BYTES_CONTENT_MISMATCH')
    expect(() => h.staging.read({...main,caseCandidateId:'other-case'},h.candidate.candidateId))
      .toThrow()
    expect(() => h.staging.stage(main,h.staging.grant(main).token,{
      requestId:'traversal',fileName:'../../unexpected.md',
      physicalSourceKey:'main-granted-picker-capability',
      bytes:h.bytes,role:'supporting',subjectId:'subject-b',
    })).toThrow()
    h.staging.revoke(main)
    expect(() => h.staging.read(main,h.candidate.candidateId)).toThrow()
  })
})

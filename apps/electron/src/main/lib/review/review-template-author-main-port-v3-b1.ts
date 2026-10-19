/**
 * Dev-B Main-side authoring seam. Main/C must supply a real authenticated
 * Principal and an authorizer. Renderer-provided recordedBy, role, signatures
 * or publication state never gain authority through this service.
 *
 * This is NOT a shared IPC handler and never writes CurrentCase/ReviewRun.
 */
import {
  compileReviewB1Plan, type B1AuthorDocument, type ImmutablePlanDescriptorB1,
} from './review-template-plan-adapter-v3-b1'
import {
  readB1AuthorRevision, saveB1AuthorRevision, freezeB1Candidate,
} from './review-template-author-store-v3-b1'

export interface B1TrustedAuthorContext {
  principalId: string
  sessionId: string
  ownerGeneration: number
  ownerId: string
}
export type B1AuthorAction = 'author-save' | 'author-preview' | 'candidate-freeze'
export type B1AuthorPermission = (
  context: B1TrustedAuthorContext, templateId: string, action: B1AuthorAction,
) => boolean

export class ReviewB1AuthorMainPort {
  constructor(private readonly authorize: B1AuthorPermission) {}
  private verify(ctx:B1TrustedAuthorContext,templateId:string,action:B1AuthorAction):void {
    if (!ctx || !ctx.principalId?.trim() || !ctx.sessionId?.trim() ||
        !ctx.ownerId?.trim() || !Number.isSafeInteger(ctx.ownerGeneration) ||
        ctx.ownerGeneration<0 || !templateId?.trim() || !this.authorize(ctx,templateId,action)) {
      throw new Error('B1_MAIN_AUTHOR_UNAUTHORIZED')
    }
  }
  private sanitize(ctx:B1TrustedAuthorContext, doc:B1AuthorDocument):B1AuthorDocument {
    if (!doc || doc.schemaVersion!=='review-b1/1' || doc.status!=='candidate-held') {
      throw new Error('B1_MAIN_INVALID_AUTHOR')
    }
    const copy=structuredClone(doc)
    for(const source of copy.sources) {
      // No claim of school issuer approval: even policy-candidate remains held.
      source.recordedBy=ctx.principalId
      if (source.kind!=='user-declared' && source.kind!=='policy-candidate') {
        throw new Error('B1_MAIN_SOURCE_NOT_CANDIDATE')
      }
    }
    return copy
  }
  async saveDraft(ctx:B1TrustedAuthorContext,doc:B1AuthorDocument,expectedRevision:number):
    Promise<{revision:number;candidateStatus:'candidate-held'}> {
    this.verify(ctx,doc?.templateId,'author-save')
    const clean=this.sanitize(ctx,doc)
    const result=saveB1AuthorRevision(clean,expectedRevision,ctx.principalId)
    return {revision:result.revision,candidateStatus:'candidate-held'}
  }
  async preview(ctx:B1TrustedAuthorContext,doc:B1AuthorDocument):
    Promise<ImmutablePlanDescriptorB1> {
    this.verify(ctx,doc?.templateId,'author-preview')
    return compileReviewB1Plan(this.sanitize(ctx,doc))
  }
  /**
   * Use this entrypoint for the wizard: freeze exactly the displayed, saved
   * author source. Even if a renderer bypasses its dirty-state guard, it cannot
   * freeze a prior persisted revision while presenting unsaved edits.
   * The final store freeze rechecks the latest revision under author.lock.
   */
  async freezeSavedDocument(ctx:B1TrustedAuthorContext,doc:B1AuthorDocument,expectedRevision:number):
    Promise<{fingerprint:string;candidateStatus:'candidate-held'}> {
    this.verify(ctx,doc?.templateId,'candidate-freeze')
    const clean=this.sanitize(ctx,doc)
    const latest=readB1AuthorRevision(clean.templateId)
    if(!latest || latest.revision!==expectedRevision)
      throw new Error('B1_MAIN_REVISION_STALE')
    if(JSON.stringify(latest.document)!==JSON.stringify(clean))
      throw new Error('B1_MAIN_UNSAVED_AUTHOR_CHANGES')
    const result=freezeB1Candidate(clean.templateId,expectedRevision)
    return {fingerprint:result.descriptor.canonicalPlan.fingerprint,candidateStatus:'candidate-held'}
  }
  async freezeCandidate(ctx:B1TrustedAuthorContext,templateId:string,expectedRevision:number):
    Promise<{fingerprint:string;candidateStatus:'candidate-held'}> {
    this.verify(ctx,templateId,'candidate-freeze')
    const latest=readB1AuthorRevision(templateId)
    if (!latest || latest.revision!==expectedRevision) {
      throw new Error('B1_MAIN_REVISION_STALE')
    }
    const result=freezeB1Candidate(templateId,expectedRevision)
    return {fingerprint:result.descriptor.canonicalPlan.fingerprint,candidateStatus:'candidate-held'}
  }
}

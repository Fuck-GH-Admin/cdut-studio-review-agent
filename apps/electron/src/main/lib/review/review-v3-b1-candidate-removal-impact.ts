/**
 * Candidate-only technical deletion review packet for B-CR-002-B.
 *
 * Unlike a Check-key-only UI prompt, a removal affects a precise
 * Check × target × object × subject × source-version identity.
 * This is not the authoritative C-owned published-Plan CAS or durable ACK.
 */
import {
  diffReviewB1Plans,verifyReviewB1Descriptor,
  type B1AuthorDocument,type ImmutablePlanDescriptorB1,
} from './review-template-plan-adapter-v3-b1'

export interface B1CandidateRemovedBinding {
  bindingKey:string
  checkKey:string
  targetKey:string
  objectKey:string
  subjectId:string
  sourceIds:string[]
  sourceVersionIds:string[]
  responsibility:string
  requirement:string
  priorApplicability:'applicable'|'not-applicable'|'unknown'
}
export interface B1CandidateRemovalImpact {
  schemaVersion:'review-b1-candidate-removal-impact/1'
  oldFingerprint:string
  newFingerprint:string
  removed:B1CandidateRemovedBinding[]
  addedBindingKeys:string[]
  changedBindingKeys:string[]
  localAuthorReviewRequired:boolean
  durableBusinessAck:false
  policyVerified:false
  publicationAllowed:false
}
const deny=(code:string):never=>{throw new Error('B1_CANDIDATE_IMPACT_'+code)}
export function buildB1CandidateRemovalImpact(
  previous:{author:B1AuthorDocument;descriptor:ImmutablePlanDescriptorB1},
  next:{author:B1AuthorDocument;descriptor:ImmutablePlanDescriptorB1},
):B1CandidateRemovalImpact{
  if(!previous||!next||!previous.author||!next.author||!previous.descriptor||!next.descriptor)
    deny('SOURCE_REQUIRED')
  // Explicit exact recompile invalidates forged descriptor, Check metadata,
  // source version or old Plan fingerprint before any author-side display.
  verifyReviewB1Descriptor(previous.author,previous.descriptor)
  verifyReviewB1Descriptor(next.author,next.descriptor)
  if(previous.author.templateId!==next.author.templateId)deny('CROSS_TEMPLATE')
  const diff=diffReviewB1Plans(previous.descriptor,next.descriptor)
  const oldBindings=new Map(previous.descriptor.bindingDetails.map(binding=>[
    binding.checkKey+'::'+binding.targetKey,binding,
  ]))
  if(oldBindings.size!==previous.descriptor.bindingDetails.length)deny('OLD_BINDING_DUPLICATE')
  const removed:B1CandidateRemovedBinding[]=diff.requiresAck.map(key=>{
    const b=oldBindings.get(key)
    if(!b)throw new Error('B1_CANDIDATE_IMPACT_OLD_BINDING_NOT_FOUND')
    return {
      bindingKey:key,checkKey:b.checkKey,targetKey:b.targetKey,
      objectKey:b.objectKey,subjectId:b.subjectId,
      sourceIds:[...b.sourceIds],sourceVersionIds:[...b.sourceVersionIds],
      responsibility:b.responsibility,requirement:b.requirement,
      priorApplicability:b.applicability,
    }
  })
  return {
    schemaVersion:'review-b1-candidate-removal-impact/1',
    oldFingerprint:diff.oldFingerprint,newFingerprint:diff.nextFingerprint,
    removed,addedBindingKeys:diff.added,changedBindingKeys:diff.changed,
    localAuthorReviewRequired:removed.length>0,
    durableBusinessAck:false,policyVerified:false,publicationAllowed:false,
  }
}
export function assertB1CandidateRemovalReview(
 impact:B1CandidateRemovalImpact,
 confirmedExactBindingKeys:readonly string[],
):void{
 if(!impact||impact.schemaVersion!=='review-b1-candidate-removal-impact/1' ||
    impact.durableBusinessAck!==false||impact.policyVerified!==false||
    impact.publicationAllowed!==false||!Array.isArray(confirmedExactBindingKeys)||
    !Array.isArray(impact.removed))
   deny('INVALID_REVIEW_PACKET')
 const exact=impact.removed.map(x=>x.bindingKey)
 if(new Set(exact).size!==exact.length||
    new Set(confirmedExactBindingKeys).size!==confirmedExactBindingKeys.length||
    exact.length!==confirmedExactBindingKeys.length||
    exact.some(key=>!confirmedExactBindingKeys.includes(key)))
   deny('EXACT_BINDING_CONFIRMATION_REQUIRED')
}

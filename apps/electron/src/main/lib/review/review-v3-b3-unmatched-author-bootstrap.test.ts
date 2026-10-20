import { describe,test,expect } from 'bun:test'
import {prepareB29UnmatchedAuthorDraft} from './review-v3-b3-unmatched-author-bootstrap'
import type {B2MaterialCandidate} from './review-intake-adapter-v3-b2'
import type {B3RouteState} from './review-intake-routing-adapter-v3-b3'
const sha='b'.repeat(64)
const material=(id:string,role:'application'|'supporting'):B2MaterialCandidate=>({
  candidateId:'candidate-'+id,caseCandidateId:'case-1',materialId:'material-'+id,
  documentVersionId:'version-'+id,rawSha256:sha,byteLength:10,fileName:id+'.pdf',
  physicalSourceKey:'picker-'+id,role,subjectId:'student-1',
  ownerId:'owner-1',ownerGeneration:1,requestId:'request-'+id,status:'accepted',
})
const unmatched:B3RouteState={
 status:'unmatched',remainingMs:0,reason:'No evidenced match in current catalog',
}
const input={
 templateId:'temporary_b1_51',name:'Student-verified new business',
 purpose:'Review a business purpose that has no existing template',
 scenario:'Unmatched human request',objectKey:'resource-1',
 humanRequirement:'Check source, responsible Subject and applicable issuer before any decision',
 recordedBy:'author-1',reviewerRole:'human-owner',
 userConfirmedAuthoring:true as const,
}
describe('B R29 unmatched intake -> real held B1 compile without publication',()=>{
 test('two actual B2 candidates turn into a compilable B1 candidate, preserving source versions; applicability stays unknown',()=>{
  const result=prepareB29UnmatchedAuthorDraft(unmatched,[material('app','application'),material('support','supporting')],input)
  expect(result.document.sources).toHaveLength(2)
  expect(result.descriptor.bindingDetails).toHaveLength(1)
  expect(result.descriptor.bindingDetails[0]!.applicability).toBe('unknown')
  expect(result.document.status).toBe('candidate-held')
  expect(result.publicationAllowed).toBe(false)
  expect(result.currentMainAuthorityRecheckedByC).toBe(false)
  expect(result.businessWriteAllowed).toBe(false)
 })
 test('refuses countdown or default template route, even with human draft selection',()=>{
  expect(()=>prepareB29UnmatchedAuthorDraft({status:'countdown',remainingMs:500,reason:'x'},[
    material('app','application')],input)).toThrow('B_R29_EXPLICIT_UNMATCHED_ROUTE_REQUIRED')
 })
 test('cannot infer Subject from multiple applicants or incomplete role',()=>{
  const mixed=[material('app','application'),material('other','supporting')]
  mixed[1]!.subjectId='other-student'
  expect(()=>prepareB29UnmatchedAuthorDraft(unmatched,mixed,input))
   .toThrow('B_R29_COMPLETE_HOMOGENEOUS_B2_SET_REQUIRED')
  const duplicate=[material('app','application'),material('app','supporting')]
  expect(()=>prepareB29UnmatchedAuthorDraft(unmatched,duplicate,input))
   .toThrow('B_R29_COMPLETE_HOMOGENEOUS_B2_SET_REQUIRED')
 })
 test('no silent old template adoption or unconfirmed authoring',()=>{
  const intent={...input,userConfirmedAuthoring:false as true}
  expect(()=>prepareB29UnmatchedAuthorDraft(unmatched,[material('app','application')],intent))
   .toThrow('B_R29_HUMAN_AUTHOR_INTENT_INCOMPLETE')
 })
});

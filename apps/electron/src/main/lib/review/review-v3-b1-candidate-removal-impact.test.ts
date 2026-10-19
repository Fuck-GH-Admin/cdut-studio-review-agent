import {describe,expect,test} from 'bun:test'
import {compileReviewB1Plan,type B1AuthorDocument} from './review-template-plan-adapter-v3-b1'
import {buildB1CandidateRemovalImpact,assertB1CandidateRemovalReview} from './review-v3-b1-candidate-removal-impact'
const make=():B1AuthorDocument=>({
 schemaVersion:'review-b1/1',status:'candidate-held',templateId:'example-51',
 templateVersion:'1',name:'Synthetic applicant scope',purpose:'Candidate deletion preview only',
 sources:[{sourceId:'src',kind:'user-declared',documentVersionId:'v1',locator:'synthetic',recordedBy:'candidate-author'}],
 fields:[{key:'eligible',label:'Declared applicable?',required:false,type:'boolean',sourceId:'src'}],
 targets:[{targetKey:'a',objectKey:'obj-a',subjectId:'sub-a',scenario:'room',fieldValues:{eligible:true}},
          {targetKey:'b',objectKey:'obj-b',subjectId:'sub-b',scenario:'room',fieldValues:{}}],
 modules:[{moduleId:'core',version:'1',dependsOn:[],checks:[{
  checkKey:'permission',requirement:'Obtain per-room signature',
  sourceIds:['src'],targetKeys:['a','b'],responsibility:'authorized-human',
  condition:{kind:'field-equals',fieldKey:'eligible',equals:true},
 },{
  checkKey:'baseline',requirement:'Record scope for every target',
  sourceIds:['src'],targetKeys:['a','b'],responsibility:'human-operator',
  condition:{kind:'always'},
 }]}],
 stages:[{stageId:'review',mode:'manual',role:'human'}],outputs:[{outputId:'report',kind:'report'}],
})
const pair=(d:B1AuthorDocument)=>({author:d,descriptor:compileReviewB1Plan(d)})
describe('B1 R16 candidate-only exact removed Check × target × source review',()=>{
 test('partial removed target preserves exact old object/subject/version and blocks missing ACK',()=>{
  const old=pair(make()),modified=make()
  modified.modules[0]!.checks[0]!.targetKeys=['a']
  const r=buildB1CandidateRemovalImpact(old,pair(modified))
  expect(r.removed).toEqual([{
   bindingKey:'permission::b',checkKey:'permission',targetKey:'b',
   objectKey:'obj-b',subjectId:'sub-b',sourceIds:['src'],sourceVersionIds:['v1'],
   responsibility:'authorized-human',requirement:'Obtain per-room signature',
   priorApplicability:'unknown',
  }])
  expect(r.localAuthorReviewRequired).toBe(true)
  expect(r.durableBusinessAck).toBe(false);expect(r.policyVerified).toBe(false)
  expect(()=>assertB1CandidateRemovalReview(r,[])).toThrow('EXACT_BINDING_CONFIRMATION_REQUIRED')
  expect(()=>assertB1CandidateRemovalReview(r,['permission::a'])).toThrow()
  expect(()=>assertB1CandidateRemovalReview(r,['permission::b'])).not.toThrow()
 })
 test('Check rename removes both original bindings; not mere field-label change',()=>{
  const before=pair(make()),draft=make()
  draft.modules[0]!.checks[0]!.checkKey='renamed-permission'
  const r=buildB1CandidateRemovalImpact(before,pair(draft))
  expect(r.removed.map(x=>x.bindingKey)).toEqual(['permission::a','permission::b'])
  expect(r.addedBindingKeys).toEqual(['renamed-permission::a','renamed-permission::b'])
 })
 test('same Check but revised field values changes fingerprint; no old-binding deletion ACK',()=>{
  const old=pair(make()),modified=make()
  modified.targets[1]!.fieldValues.eligible=false
  const r=buildB1CandidateRemovalImpact(old,pair(modified))
  expect(r.removed).toEqual([])
  expect(r.localAuthorReviewRequired).toBe(false)
  expect(r.changedBindingKeys).toEqual(['baseline::b','permission::b'])
  expect(()=>assertB1CandidateRemovalReview(r,[])).not.toThrow()
 })
 test('new source version is a changed binding, and cannot inherit old publisher',()=>{
  const old=pair(make()),modified=make();modified.sources[0]!.documentVersionId='v2'
  const r=buildB1CandidateRemovalImpact(old,pair(modified))
  expect(r.removed).toHaveLength(0)
  expect(r.changedBindingKeys).toHaveLength(4)
  expect(r.publicationAllowed).toBe(false)
 })
 test('modified descriptor/author content or cross-template refuses before proposal',()=>{
  const original=pair(make()),next=pair(make())
  next.descriptor.bindingDetails[0]!.sourceVersionIds=['fabricated-v3']
  expect(()=>buildB1CandidateRemovalImpact(original,next)).toThrow('B1_FROZEN_DIGEST_MISMATCH')
  const another=make();another.templateId='different'
  expect(()=>buildB1CandidateRemovalImpact(original,pair(another))).toThrow('CROSS_TEMPLATE')
 })
 test('over-ack, duplicate ACK or claim durable business authority rejects',()=>{
  const a=pair(make()),b=make();b.modules[0]!.checks[0]!.targetKeys=['a']
  const impact=buildB1CandidateRemovalImpact(a,pair(b))
  expect(()=>assertB1CandidateRemovalReview(impact,['permission::b','permission::b'])).toThrow()
  expect(()=>assertB1CandidateRemovalReview(impact,['permission::b','other::b'])).toThrow()
  expect(()=>assertB1CandidateRemovalReview({...impact,durableBusinessAck:true as false},['permission::b']))
    .toThrow('INVALID_REVIEW_PACKET')
 })
})

import { describe,expect,test } from 'bun:test'
import {inspectB4CandidateObjectIsolation} from './review-v3-b4-object-isolation'
import {compileReviewB1Plan,verifyReviewB1Descriptor,type B1AuthorDocument} from './review-template-plan-adapter-v3-b1'
type Domain='G03-T12'|'G04-T03'|'G06-T06'
const domains:Domain[]=['G03-T12','G04-T03','G06-T06']
const make=(domain:Domain):B1AuthorDocument=>{
 const scenario=domain==='G03-T12'?'sports-zone-and-time':
   domain==='G04-T03'?'person-lab-scope':'claim-asset-channel-version'
 return {
  schemaVersion:'review-b1/1',status:'candidate-held',
  templateId:'synthetic-'+domain.toLowerCase(),templateVersion:'test-only-1',
  name:'SYNTHETIC '+scenario,purpose:'Technical object isolation; NOT a school policy or Gold',
  sources:[{sourceId:'declared',kind:'user-declared',documentVersionId:'fixture-only-v1',
    locator:'synthetic:'+scenario,recordedBy:'synthetic-test'}],
  fields:[{key:'declared-scope',label:'Synthetic condition input',type:'enum',required:false,
    sourceId:'declared',enumValues:['within','outside']}],
  targets:[
   {targetKey:'object-a',objectKey:scenario+'-A',subjectId:'subject-A',
    scenario,fieldValues:{'declared-scope':'within'}},
   {targetKey:'object-b',objectKey:scenario+'-B',subjectId:'subject-B',
    scenario,fieldValues:{}},
   {targetKey:'object-c',objectKey:scenario+'-C',subjectId:'subject-C',
    scenario,fieldValues:{'declared-scope':'outside'}},
  ],
  modules:[{moduleId:'unit',version:'test-1',dependsOn:[],checks:[{
   checkKey:'scope-check',requirement:'Technical scope candidate only',
   responsibility:'requires-human-school-authority',
   sourceIds:['declared'],targetKeys:['object-a','object-b','object-c'],
   condition:{kind:'field-equals',fieldKey:'declared-scope',equals:'within'},
  }]}],
  stages:[{stageId:'human',role:'reviewer',mode:'manual'}],outputs:[{outputId:'technical-report',kind:'report'}],
 }
}
describe('B4 R15 three business domains multi-object technical isolation',()=>{
 for(const domain of domains){
  test(domain+' positive, unknown and not-applicable stay separate, all authorization false',()=>{
    const result=inspectB4CandidateObjectIsolation(make(domain),'scope-check',
      ['object-a','object-b','object-c'])
    expect(result.bindings.map(x=>x.technicalApplicability)).toEqual([
      'applicable','unknown','not-applicable'])
    expect(result.bindings.every(x=>x.authorizationGranted===false &&
      x.schoolAuthorization==='NOT_VERIFIED')).toBe(true)
    expect(result.candidateOnly).toBe(true)
    expect(result.publicationAllowed).toBe(false)
    expect(new Set(result.bindings.map(x=>x.subjectId)).size).toBe(3)
    expect(new Set(result.bindings.map(x=>x.objectKey)).size).toBe(3)
  })
  test(domain+' changed first scope cannot upgrade second or third object',()=>{
    const before=make(domain),previous=compileReviewB1Plan(before)
    const changed=structuredClone(before)
    changed.targets[0]!.fieldValues['declared-scope']='outside'
    const next=inspectB4CandidateObjectIsolation(changed,'scope-check',['object-a','object-b','object-c'])
    expect(next.bindings.map(x=>x.technicalApplicability)).toEqual([
      'not-applicable','unknown','not-applicable'])
    expect(next.planFingerprint).not.toBe(previous.canonicalPlan.fingerprint)
    expect(()=>verifyReviewB1Descriptor(changed,previous)).toThrow('B1_FROZEN_DIGEST_MISMATCH')
  })
  test(domain+' missing or invented target in expected contract is rejected',()=>{
    const before=make(domain)
    before.modules[0]!.checks[0]!.targetKeys=['object-a','object-b']
    expect(()=>inspectB4CandidateObjectIsolation(before,'scope-check',
      ['object-a','object-b','object-c'])).toThrow()
    const current=make(domain)
    expect(()=>inspectB4CandidateObjectIsolation(current,'scope-check',
      ['object-a','object-X','object-c'])).toThrow('B4_OBJECT_ISOLATION_MISSING_TARGET')
    expect(()=>inspectB4CandidateObjectIsolation(current,'scope-check',
      ['object-a','object-a','object-c'])).toThrow('B4_OBJECT_ISOLATION_BAD_REQUEST')
  })
 }
 test('source revision changes invalidates fingerprint but does not grant policy approval',()=>{
  const before=make('G03-T12'),first=inspectB4CandidateObjectIsolation(before,'scope-check',
    ['object-a','object-b','object-c'])
  const latest=structuredClone(before)
  latest.sources[0]!.documentVersionId='fixture-only-v2'
  const result=inspectB4CandidateObjectIsolation(latest,'scope-check',
    ['object-a','object-b','object-c'])
  expect(first.planFingerprint).not.toBe(result.planFingerprint)
  expect(result.bindings.every(x=>x.sourceVersionIds[0]==='fixture-only-v2' &&
    !x.authorizationGranted)).toBe(true)
 })
 test('candidate status cannot be forged into published or approved by utility',()=>{
  const source=make('G04-T03')
  ;(source as {status:string}).status='published'
  expect(()=>inspectB4CandidateObjectIsolation(source,'scope-check',
    ['object-a','object-b','object-c'])).toThrow('B4_OBJECT_ISOLATION_BAD_REQUEST')
 })
})

import { describe, expect, test } from 'bun:test'
import {
  planB3ConservativeRouting, ReviewB3OwnerBoundRouteSession,
  type B3RoutingInput, type B3OwnerRouteInput,
} from './review-intake-routing-adapter-v3-b3'
import { ReviewB2StagingService, type B2MainContext } from './review-intake-adapter-v3-b2'

const sha = 'a'.repeat(64)
const setup = (): B3RoutingInput => ({
  startedAtMs: 1000, nowMs: 1500, automaticSelectionEnabled: true, userInterrupted: false,
  materialCandidates: [
    {candidateId:'candidate-a', caseCandidateId:'case-a',materialId:'mat-a',
      documentVersionId:'doc-a',rawSha256:sha,byteLength:42,fileName:'request.pdf',
      physicalSourceKey:'native-file-1',ownerId:'owner-a',ownerGeneration:1,
      role:'application',subjectId:'subject-a',requestId:'req-a',status:'accepted'},
  ],
  suggestions: [{templateId:'generic-lab-use',templateVersion:'1',availability:'authorized-for-technical-selection',
    confidence:0.99,caseCandidateId:'case-a',
    evidence:[{materialCandidateId:'candidate-a',rawSha256:sha,reason:'Source field matched'}]}],
})
describe('B-IN-03/B3 conservative technical-only routing',()=>{
  test('strict countdown: no automatic route before 20 seconds or implicit Case command',()=>{
    const input=setup()
    const first=planB3ConservativeRouting(input)
    expect(first.status).toBe('countdown')
    expect(first.chosen).toBeUndefined()
    const after=planB3ConservativeRouting({...input,nowMs:21000})
    expect(after.status).toBe('default-selected')
    expect(after.chosen?.templateId).toBe('generic-lab-use')
    expect(after.reason).toContain('not a Case')
  })
  test('multiple task types, unassigned role, missing Subject, unverified evidence never auto-select',()=>{
    const input=setup()
    input.nowMs=22000
    input.suggestions.push({...input.suggestions[0]!,templateId:'another'})
    expect(planB3ConservativeRouting(input).status).toBe('needs-user-confirmation')
    input.suggestions=[input.suggestions[0]!]
    input.materialCandidates[0]!.role='unassigned'
    expect(planB3ConservativeRouting(input).status).toBe('needs-user-confirmation')
    input.materialCandidates[0]!.role='application'
    input.materialCandidates[0]!.subjectId=null
    expect(planB3ConservativeRouting(input).status).toBe('needs-user-confirmation')
    input.materialCandidates[0]!.subjectId='subject-a'
    input.suggestions[0]!.evidence[0]!.rawSha256='forged-hash'
    expect(planB3ConservativeRouting(input).status).toBe('needs-user-confirmation')
  })
  test('held policy and low confidence cannot pretend authorization',()=>{
    const input=setup()
    input.nowMs=22000
    input.suggestions[0]!.availability='candidate-held'
    expect(planB3ConservativeRouting(input).status).toBe('needs-user-confirmation')
    input.suggestions[0]!.availability='authorized-for-technical-selection'
    input.suggestions[0]!.confidence=0.5
    expect(planB3ConservativeRouting(input).status).toBe('needs-user-confirmation')
  })
  test('user interruption/explicit manual correction outranks timer',()=>{
    const input=setup()
    input.nowMs=22000
    input.userInterrupted=true
    expect(planB3ConservativeRouting(input).status).toBe('needs-user-confirmation')
    input.userChoseTemplateId='manual-custom'
    input.userChoseTemplateVersion='2'
    const result=planB3ConservativeRouting(input)
    expect(result.status).toBe('manually-selected')
    expect(result.chosen).toEqual({templateId:'manual-custom',templateVersion:'2'})
  })
})

const owner:B2MainContext={
  ownerId:'owner-routed',ownerGeneration:2,caseCandidateId:'case-routed',
  senderId:42,frameId:7,
}
function mainFixture(){
  let now=1000
  const staging=new ReviewB2StagingService(()=>now)
  const grant=staging.grant(owner)
  const material=staging.stage(owner,grant.token,{
    requestId:'review-route',fileName:'request.pdf',
    physicalSourceKey:'native-physical-file-1',
    bytes:Buffer.from('valid original bytes'),
    role:'application',subjectId:'subject-one',
  })
  const input:B3OwnerRouteInput={
    automaticSelectionEnabled:true,
    materialCandidates:[material],
    suggestions:[{
      templateId:'route-template',templateVersion:'v1',
      availability:'authorized-for-technical-selection',
      confidence:0.99,caseCandidateId:owner.caseCandidateId,
      evidence:[{materialCandidateId:material.candidateId,
        rawSha256:material.rawSha256,reason:'Verified staged bytes'}],
    }],
    manualCatalog:[
      {templateId:'route-template',templateVersion:'v1',name:'Routing Example',
        availability:'authorized-for-technical-selection'},
      {templateId:'held',templateVersion:'v1',name:'Unverified policy',
        availability:'candidate-held'},
    ],
  }
  return {staging,material,input,session:new ReviewB3OwnerBoundRouteSession(staging,()=>now),
    setTime:(v:number)=>{now=v}}
}
describe('B3 Main-scoped physical route session, no business writer',()=>{
  test('20 second clock starts at Main observation; refreshed catalog never inherits elapsed time',()=>{
    const f=mainFixture()
    expect(f.session.evaluate(owner,f.input).status).toBe('countdown')
    f.setTime(21000)
    expect(f.session.evaluate(owner,f.input)).toMatchObject({
      status:'default-selected',remainingMs:0,
      chosen:{templateId:'route-template',templateVersion:'v1'},
    })
    f.input.suggestions[0]!.confidence=0.98
    expect(f.session.evaluate(owner,f.input)).toMatchObject({
      status:'countdown',remainingMs:20000,
    })
    f.setTime(40999)
    expect(f.session.evaluate(owner,f.input).status).toBe('countdown')
    f.setTime(41000)
    expect(f.session.evaluate(owner,f.input).status).toBe('default-selected')
  })
  test('fake filename, hash, Subject, version, role or owner never matches Main-staged source',()=>{
    const f=mainFixture()
    const keys=['rawSha256','subjectId','documentVersionId','role','ownerGeneration'] as const
    for(const key of keys){
      const forged={...f.material,[key]:'fake'} as typeof f.material
      expect(()=>f.session.evaluate(owner,{
        ...f.input,materialCandidates:[forged],
      })).toThrow('B3_ROUTING_STAGED_IDENTITY_MISMATCH')
    }
    expect(f.session.evaluate(owner,f.input).status).toBe('countdown')
  })
  test('manual selection checks current allowed catalog; held policies are not selectable',()=>{
    const f=mainFixture()
    const impossible={...f.input,userChoseTemplateId:'fake',userChoseTemplateVersion:'v1'}
    expect(f.session.evaluate(owner,impossible).status).toBe('needs-user-confirmation')
    expect(f.session.evaluate(owner,{
      ...f.input,userChoseTemplateId:'held',userChoseTemplateVersion:'v1',
    }).status).toBe('needs-user-confirmation')
    expect(f.session.evaluate(owner,{
      ...f.input,userChoseTemplateId:'route-template',userChoseTemplateVersion:'v1',
    })).toMatchObject({status:'manually-selected',chosen:{
      templateId:'route-template',templateVersion:'v1',
    }})
  })
  test('interrupt is sticky across refresh, time expiry and changed route evidence',()=>{
    const f=mainFixture()
    expect(f.session.evaluate(owner,{...f.input,userInterrupted:true}).status)
      .toBe('needs-user-confirmation')
    f.setTime(22000)
    expect(f.session.evaluate(owner,f.input).status).toBe('needs-user-confirmation')
    f.input.suggestions[0]!.confidence=0.96
    expect(f.session.evaluate(owner,f.input).status).toBe('needs-user-confirmation')
  })
  test('post-close/revoke and cross-frame session reuse reject stale route',()=>{
    const f=mainFixture()
    f.session.evaluate(owner,f.input)
    expect(()=>f.session.evaluate({...owner,frameId:8},f.input))
      .toThrow('B3_ROUTING_SESSION_SCOPE_CHANGED')
    f.staging.revoke(owner)
    expect(()=>f.session.evaluate(owner,f.input)).toThrow('B2_OWNER_INVALID_OR_REVOKED')
  })
  test('non-monotone Main clock and duplicate catalog are rejected conservatively',()=>{
    const f=mainFixture()
    f.session.evaluate(owner,f.input)
    f.setTime(999)
    expect(()=>f.session.evaluate(owner,f.input)).toThrow('B3_ROUTING_CLOCK_INVALID')
    f.setTime(1001)
    expect(()=>f.session.evaluate(owner,{
      ...f.input,manualCatalog:[...f.input.manualCatalog,f.input.manualCatalog[0]!],
    })).toThrow('B3_ROUTING_CATALOG_DUPLICATE')
  })
})

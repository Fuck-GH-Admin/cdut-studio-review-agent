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
  test('R21-01 unknown business does not start a bogus 20s template default and is explicitly unmatched',()=>{
    const f=mainFixture()
    f.input.suggestions=[]
    expect(f.session.evaluate(owner,f.input)).toMatchObject({
      status:'unmatched',remainingMs:0,
    })
    f.setTime(99000)
    expect(f.session.evaluate(owner,f.input).status).toBe('unmatched')
    const standalone=planB3ConservativeRouting({...setup(),suggestions:[],nowMs:49000})
    expect(standalone.status).toBe('unmatched')
    expect(standalone.chosen).toBeUndefined()
  })
  test('R21-02 classifier cannot forge technical entitlement absent from current Main catalog',()=>{
    const f=mainFixture()
    f.input.suggestions[0]!.templateId='invented-51st-school-template'
    f.setTime(22000)
    expect(f.session.evaluate(owner,f.input).status).toBe('needs-user-confirmation')
    f.setTime(48000)
    expect(f.session.evaluate(owner,f.input).status).toBe('needs-user-confirmation')
    // Same route but present as candidate-held only is equally ineligible.
    f.input.suggestions[0]!.templateId='held'
    expect(f.session.evaluate(owner,f.input).status).toBe('needs-user-confirmation')
    // Main adding to the genuine technical catalog can restart a NEW timer.
    f.input.suggestions[0]!.templateId='new-authorized'
    f.input.manualCatalog=[...f.input.manualCatalog,{
      templateId:'new-authorized',templateVersion:'v1',name:'Main technical only',
      availability:'authorized-for-technical-selection',
    }]
    expect(f.session.evaluate(owner,f.input)).toMatchObject({
      status:'countdown',remainingMs:20000,
    })
  })
  test('R21-03 all staged files must be represented exactly once by physical-source evidence',()=>{
    const f=mainFixture()
    const grant=f.staging.grant(owner)
    const second=f.staging.stage(owner,grant.token,{
      requestId:'supporting-file',fileName:'supporting.txt',
      physicalSourceKey:'native-physical-file-2',
      bytes:Buffer.from('second source independent bytes'),
      role:'supporting',subjectId:'subject-one',
    })
    f.input.materialCandidates=[...f.input.materialCandidates,second]
    f.setTime(22000)
    expect(f.session.evaluate(owner,f.input).status).toBe('needs-user-confirmation')
    f.input.suggestions[0]!.evidence.push({
      materialCandidateId:second.candidateId,rawSha256:second.rawSha256,
      reason:'Verified second physical original',
    })
    expect(f.session.evaluate(owner,f.input)).toMatchObject({
      status:'countdown',remainingMs:20000,
    })
    f.setTime(42000)
    expect(f.session.evaluate(owner,f.input).status).toBe('default-selected')
    f.input.suggestions[0]!.evidence.push(f.input.suggestions[0]!.evidence[0]!)
    expect(f.session.evaluate(owner,f.input).status).toBe('needs-user-confirmation')
  })
  test('R21-04 duplicate or invented evidence cannot count towards missing files',()=>{
    const f=mainFixture()
    const duplicate=f.input.suggestions[0]!.evidence[0]!
    f.input.suggestions[0]!.evidence=[duplicate,duplicate]
    f.setTime(33000)
    expect(f.session.evaluate(owner,f.input).status).toBe('needs-user-confirmation')
    f.input.suggestions[0]!.evidence=[{
      materialCandidateId:'unknown-candidate',rawSha256:duplicate.rawSha256,
      reason:'Same filename but no staged identity',
    }]
    expect(f.session.evaluate(owner,f.input).status).toBe('needs-user-confirmation')
  })
  test('R21-05 two application roots or multiple Subjects must never self-select a business type',()=>{
    const f=mainFixture()
    const grant=f.staging.grant(owner)
    const other=f.staging.stage(owner,grant.token,{
      requestId:'other-applicant',fileName:'request-2.pdf',
      physicalSourceKey:'native-application-2',
      bytes:Buffer.from('another person application'),
      role:'application',subjectId:'subject-two',
    })
    f.input.materialCandidates=[...f.input.materialCandidates,other]
    f.input.suggestions[0]!.evidence.push({
      materialCandidateId:other.candidateId,rawSha256:other.rawSha256,
      reason:'Second application evidence',
    })
    f.setTime(49000)
    expect(f.session.evaluate(owner,f.input).status).toBe('needs-user-confirmation')
    // A second application from the same Subject still needs explicit human
    // disambiguation; ownership identity alone does not define business type.
    f.input.materialCandidates[1]={...other,subjectId:'subject-one'}
    expect(()=>f.session.evaluate(owner,f.input)).toThrow('B3_ROUTING_STAGED_IDENTITY_MISMATCH')
  })
  test('R21-06 current original bytes must hash to B2 physical source identity before countdown',()=>{
    const f=mainFixture()
    const original=f.staging.read.bind(f.staging)
    f.staging.read=(c,id)=>Buffer.concat([original(c,id),Buffer.from('tampered')])
    expect(()=>f.session.evaluate(owner,f.input)).toThrow('B3_ROUTING_ORIGINAL_BYTES_MISMATCH')
  })
  test('R21-07 Main author catalog revoke restarts countdown and prevents old timeout',()=>{
    const f=mainFixture()
    expect(f.session.evaluate(owner,f.input).status).toBe('countdown')
    f.setTime(31000)
    f.input.manualCatalog[0]!.availability='candidate-held'
    expect(f.session.evaluate(owner,f.input).status).toBe('needs-user-confirmation')
    f.input.manualCatalog[0]!.availability='authorized-for-technical-selection'
    expect(f.session.evaluate(owner,f.input)).toMatchObject({
      status:'countdown',remainingMs:20000,
    })
  })

  test('R21-09 hidden second physical application in same Owner Case cannot trick auto route',()=>{
    const f=mainFixture()
    expect(f.staging.listScopedCandidateIds(owner)).toEqual([f.material.candidateId])
    const grant=f.staging.grant(owner)
    const hidden=f.staging.stage(owner,grant.token,{
      requestId:'hidden-other-business',fileName:'hidden.txt',
      physicalSourceKey:'native-hidden-application',
      bytes:Buffer.from('different genuine business request'),
      role:'application',subjectId:'different-subject',
    })
    expect(f.staging.listScopedCandidateIds(owner).sort()).toEqual(
      [f.material.candidateId,hidden.candidateId].sort())
    f.setTime(45000)
    // The request still presents ONLY the first legitimate staged file.
    expect(()=>f.session.evaluate(owner,f.input))
      .toThrow('B3_ROUTING_INCOMPLETE_STAGED_SET')
    expect(()=>f.session.evaluate(owner,{...f.input,
      materialCandidates:[f.material,f.material],
    })).toThrow('B3_ROUTING_INCOMPLETE_STAGED_SET')
    // The missing source cannot be silently filtered out by a suggested
    // high confidence and technical catalog match.
    f.input.materialCandidates.push(hidden)
    expect(f.session.evaluate(owner,f.input).status).toBe('needs-user-confirmation')
  })
  test('R21-10 incomplete or cross-owner inventory is not a reusable Main route capability',()=>{
    const f=mainFixture()
    expect(f.staging.listScopedCandidateIds(owner)).toEqual([f.material.candidateId])
    expect(f.staging.listScopedCandidateIds({...owner,caseCandidateId:'other-case'})).toEqual([])
    expect(f.staging.listScopedCandidateIds({...owner,ownerGeneration:3})).toEqual([])
    f.staging.revoke(owner)
    expect(()=>f.staging.listScopedCandidateIds(owner)).toThrow('B2_OWNER_INVALID_OR_REVOKED')
    expect(()=>f.session.evaluate(owner,f.input)).toThrow('B2_OWNER_INVALID_OR_REVOKED')
  })

})

import {afterAll,describe,expect,test} from 'bun:test'
import {mkdtempSync,readFileSync,writeFileSync,mkdirSync,rmSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join,resolve} from 'node:path'
import type {Actor,CaseAggregateV2,D2ScenarioSelection,ReviewAuthoringWorkspaceV1,ReviewCaseV2} from '@profer/shared'
import {validateReviewAuthoringV1} from './review-authoring-v1'
import {compileD2RuntimePlan,createD2TechnicalCase,makeD2CandidateShell,verifyD2PiRun} from './review-d2-runtime'
import {saveAuthoringCandidateDraft} from './template-store'
import {readAggregate} from './case-store-v2'
import {registerMaterial} from './material-service'
import {setEvidenceLink} from './application-service'
import {validateD2GuardSubmission} from './review-d2-execution-gates'
import {preparePiReviewRunV2,submitPiReviewResultV2} from './pi-case-review-service'
import {getRunV2} from './run-store-v2'

const root=resolve(import.meta.dir,'../../../../../../docs/design/review-agent/acceptance/d4-g08-build')
const local=mkdtempSync(join(tmpdir(),'d4-g08-'))
process.env.PROFER_CONFIG_DIR=local
afterAll(()=>rmSync(local,{recursive:true,force:true}))
const actor:Actor={actorId:'d4-g08-synthetic-reviewer',actorSource:'local',role:'reviewer'}
const load=(id:string,file:string)=>JSON.parse(readFileSync(join(root,id,file),'utf8'))
const output=(file:string,content:unknown)=>{
  const dir=process.env.D4_G08_EVIDENCE_DIR
  if(!dir)return
  mkdirSync(dir,{recursive:true})
  writeFileSync(join(dir,file),JSON.stringify(content,null,2))
}
function inputs(id:'g08-t02'|'g08-t03'){
  return {id,w:load(id,'workspace.json') as ReviewAuthoringWorkspaceV1,
    selection:load(id,'synthetic-selection.json') as D2ScenarioSelection,
    cas:load(id,'synthetic-case.json') as ReviewCaseV2,
    catalog:load(id,'source-catalog.json') as Array<{id:string;checkId:string;kind:string}>,
    ledger:load(id,'conversion-ledger.json') as Array<{responsibilityId:string;checkIds:string[]}>,
    manifest:load(id,'manifest.json') as {rules:number;sourceSha256:string;modules:number;sourceBindings:number}}
}
function scenarioVariant(s:D2ScenarioSelection,primary:string){
  const out=structuredClone(s)
  out.targets=out.targets.slice(0,1).map(t=>({...t,scenario:primary}))
  return out
}
describe('D4 G08 actual modular business templates at COMMON fixed base',()=>{
 for(const id of ['g08-t02','g08-t03'] as const){
  test(id+' D1 complete authoring, stable original rules and non-numbered invariants',()=>{
    const x=inputs(id)
    expect(validateReviewAuthoringV1(x.w)).toEqual([])
    expect(x.w.definitions.templates).toHaveLength(1)
    expect(x.w.definitions.modules).toHaveLength(x.manifest.modules)
    expect(x.w.sourceBindings).toHaveLength(x.manifest.sourceBindings)
    expect(x.catalog).toHaveLength(x.w.sourceBindings.length)
    expect(x.ledger).toHaveLength(x.catalog.length)
    expect(new Set(x.catalog.map(c=>c.id)).size).toBe(x.catalog.length)
    for(let n=1;n<=x.manifest.rules;n++){
      const rule=(id==='g08-t02'?'R-':'T03-R')+String(n).padStart(2,'0')
      const match=x.catalog.filter(c=>c.id===rule)
      expect(match).toHaveLength(1)
      expect(x.ledger.some(e=>e.responsibilityId===rule&&e.checkIds.includes(match[0]!.checkId))).toBeTrue()
    }
    expect(x.catalog.filter(c=>c.kind==='narrative-invariant').length).toBeGreaterThanOrEqual(6)
    expect(x.w.sharedModuleLocks).toEqual([])
    expect(x.w.definitions.modules.every(m=>m.limits.includes('技术预审'))).toBeTrue()
    expect(x.w.sourceBindings.every(b=>b.genericScope?.businessTypes.length===1)).toBeTrue()
    expect(x.manifest.sourceSha256).toHaveLength(64)
    output(id+'-authoring.json',{workspaceId:x.w.workspaceId,modules:x.w.definitions.modules.length,
      ruleIds:x.catalog.filter(c=>c.kind==='rule').map(c=>c.id),sourceBindings:x.w.sourceBindings.length,
      candidateOnly:true})
  })
  test(id+' D2 compiles genuine subjects and independent rule provenance',()=>{
    const x=inputs(id),plan=compileD2RuntimePlan(x.w,x.selection,x.cas)
    expect(plan.schemaVersion).toBe(3)
    expect(plan.subjects).toHaveLength(2)
    expect(plan.rules).toHaveLength(plan.mapping.length)
    expect(plan.mapping.length).toBeGreaterThan(25)
    expect(plan.mapping.every(m=>m.subjectId==='lost-a'||m.subjectId==='lost-b'||m.subjectId==='issue-a'||m.subjectId==='issue-b')).toBeTrue()
    expect(plan.mapping.every(m=>m.sourceIds.length>0&&!!m.objectKey)).toBeTrue()
    expect(new Set(plan.mapping.map(m=>m.ruleId)).size).toBe(plan.mapping.length)
    expect(plan.mapping.some(m=>m.applicability==='unknown')).toBeTrue()
    expect(plan.mapping.some(m=>m.applicability==='not-applicable')).toBeTrue()
    expect(plan.publicationAllowed).toBeFalse()
    const active=new Set(plan.mapping.map(m=>m.checkId.split('#')[0]))
    // Different primary actions of G08-T03 require separate technical cases,
    // while condition axes remain explicit for every target.
    if(id==='g08-t02')expect(active.size).toBe(x.catalog.length)
    else{
      const primary=x.w.definitions.templates[0]!.genericScenarioAxes!.primary
      const union=new Set(active)
      for(const branch of primary){
        const sel=scenarioVariant(x.selection,branch)
        const next=compileD2RuntimePlan(x.w,sel,x.cas)
        for(const m of next.mapping)union.add(m.checkId.split('#')[0])
      }
      expect(union.size).toBe(x.catalog.length)
    }
    output(id+'-d2-plan.json',plan)
    output(id+'-d2-selection.json',x.selection)
    console.log('[G08_D2_PLAN]',JSON.stringify({id,checks:plan.mapping.length,subjects:plan.subjects.length,
      fingerprint:plan.fingerprint,candidateOnly:true}))
  })
  test(id+' invalid and unknown object selection fail closed',()=>{
    const x=inputs(id),make=()=>structuredClone(x.selection)
    const duplicate=make();duplicate.targets[1]!.subjectId=duplicate.targets[0]!.subjectId
    expect(()=>compileD2RuntimePlan(x.w,duplicate,x.cas)).toThrow('D2_TARGET_INVALID')
    const missing=make();missing.targets[0]!.conditions!.pop()
    expect(()=>compileD2RuntimePlan(x.w,missing,x.cas)).toThrow('D2_GENERIC_CONDITIONS_INCOMPLETE')
    const stale=make();stale.targets[0]!.conditions![0]!.sourceVersionId='stale'
    expect(()=>compileD2RuntimePlan(x.w,stale,x.cas)).toThrow('D2_GENERIC_CONDITION_SOURCE_INVALID')
    const injected=make();injected.targets[1]!.scenario='not-a-known-action'
    expect(()=>compileD2RuntimePlan(x.w,injected,x.cas)).toThrow('D2_GENERIC_PRIMARY_INVALID')
    const plan=compileD2RuntimePlan(x.w,x.selection,x.cas)
    const unknown=plan.mapping.find(m=>m.applicability==='unknown')!
    const agg={caseV2:x.cas,d2RuntimePlan:plan,observations:[],evidenceLinks:[]} as unknown as CaseAggregateV2
    expect(validateD2GuardSubmission(agg,unknown,'compliant',[])).toContain('APPLICABILITY_UNKNOWN')
    expect(validateD2GuardSubmission(agg,unknown,'awaiting-confirmation',[])).toBeUndefined()
    const active=plan.mapping.find(m=>m.applicability==='applicable')!
    expect(validateD2GuardSubmission(agg,active,'compliant',[])).toContain('GENERIC_EVIDENCE_SCOPE_MISSING')
  })
  test(id+' real D1/D3 CLI save export/import and D2 preview/register/create',()=>{
    const x=inputs(id)
    const temp=join(local,'cli-'+id),config=join(temp,'config')
    mkdirSync(temp,{recursive:true});mkdirSync(config,{recursive:true})
    const w=join(root,id,'workspace.json'),s=join(root,id,'synthetic-selection.json'),c=join(root,id,'synthetic-case.json')
    const bundle=join(temp,'bundle.json'),imported=join(temp,'imported.json')
    const env={...process.env,PROFER_CONFIG_DIR:config}
    const scripts=resolve(import.meta.dir,'../../../../scripts')
    const call=(script:string,args:string[])=>{
      const out=Bun.spawnSync({cmd:[process.execPath,join(scripts,script),...args],env})
      if(out.exitCode!==0)throw Error(out.stderr.toString()+'\n'+out.stdout.toString())
      return JSON.parse(out.stdout.toString()) as Record<string,any>
    }
    expect(call('review-authoring-v1.ts',['validate',w]).ok).toBeTrue()
    expect(call('review-authoring-v1.ts',['save',w,'0','d4-g08']).saved).toBeTrue()
    expect(call('review-authoring-v1.ts',['read',x.w.workspaceId]).workspace.revision).toBe(1)
    const revised=structuredClone(x.w);revised.revision=2
    const revisedPath=join(temp,'revised.json');writeFileSync(revisedPath,JSON.stringify(revised))
    expect(call('review-authoring-v1.ts',['diff',w,revisedPath])).toBeDefined()
    const exported=call('review-d3-library.ts',['export',w,bundle])
    expect(exported.fingerprint).toHaveLength(64)
    expect(call('review-d3-library.ts',['import',bundle,imported]).imported).toBeTrue()
    const plan=call('review-d2-plan.ts',['preview',imported,s,c])
    expect(plan.schemaVersion).toBe(3)
    expect(plan.mapping.length).toBeGreaterThan(25)
    expect(call('review-d2-plan.ts',['register',imported,s]).registered).toBeTrue()
    const created=call('review-d2-plan.ts',['create',imported,s,'d4-'+id+'-cli-case','合成G08案卷','d4-g08'])
    expect(created.created).toBeTrue()
    expect(created.fingerprint).toBe(plan.fingerprint)
    output(id+'-cli-evidence.json',{workspace:x.w.workspaceId,revision:1,exported,
      compiled:{fingerprint:plan.fingerprint,checks:plan.mapping.length,subjects:plan.subjects.length},
      registered:true,created,publicationAllowed:false})
    console.log('[G08_CLI]',JSON.stringify({id,transferFingerprint:exported.fingerprint,plan:plan.fingerprint,checks:plan.mapping.length}))
  })
  test(id+' actual D2 Case → Pi prepare/submit/verify with non-authoritative pending checks',async()=>{
    const x=inputs(id)
    saveAuthoringCandidateDraft(makeD2CandidateShell(x.w,x.id,1))
    const caseId='d4-'+id+'-pi-real'
    const created=await createD2TechnicalCase({caseId,title:'synthetic G08 pending authority case',actor,workspace:x.w,selection:x.selection})
    expect(created.ok).toBeTrue()
    if(!created.ok)throw Error(created.message)
    const pre=preparePiReviewRunV2({caseId,sessionId:'d4-g08-session',turnId:'d4-g08-turn'})
    const sent=submitPiReviewResultV2({binding:{assignmentId:pre.assignmentId,sessionId:'d4-g08-session',
      caseId,runId:pre.runId},triggeredBy:'user',result:{
      summary:'synthetic technical result: applicant text and school evidence require authority confirmation',
      checks:created.entity!.mapping.map(m=>({ruleId:m.ruleId,subjectIds:[m.subjectId!],
        status:'awaiting-confirmation' as const,reason:'No authenticated custodian/complaint authority record',sourceRefs:[]})),
      finish:true,
    }})
    expect(sent.rejected).toEqual([])
    expect(sent.missingChecks).toEqual([])
    const agg=readAggregate(caseId)!,run=getRunV2(caseId,pre.runId)!
    expect(verifyD2PiRun(agg,run)).toMatchObject({complete:true,problems:[]})
    output(id+'-actual-pi-plan.json',created.entity)
    output(id+'-actual-pi-run.json',run)
    output(id+'-actual-pi-verification.json',{caseId,runId:pre.runId,
      verification:verifyD2PiRun(agg,run),publicationAllowed:false,
      onlineModelRun:false,administrativeApproval:false})
    console.log('[G08_PI_TECHNICAL]',JSON.stringify({id,caseId,runId:pre.runId,
      checks:run.checks.length,fingerprint:created.entity!.fingerprint,technicalComplete:true,modelRun:false}))
  })
 }
 test('G08-T03 all remaining primary actions have real D2/Pi technical runs',async()=>{
   const x=inputs('g08-t03')
   for(const primary of ['query','followup','withdraw'] as const){
     const selection=scenarioVariant(x.selection,primary)
     const caseId='d4-g08-t03-action-'+primary
     const plan=compileD2RuntimePlan(x.w,selection,x.cas)
     expect(plan.mapping.length).toBeGreaterThan(5)
     expect(plan.subjects).toHaveLength(1)
     const created=await createD2TechnicalCase({caseId,title:'synthetic G08 T03 '+primary,actor,
       workspace:x.w,selection})
     expect(created.ok).toBeTrue()
     if(!created.ok)throw Error(created.message)
     const prepared=preparePiReviewRunV2({caseId,sessionId:'d4-g08-t03-'+primary,turnId:'d4-turn'})
     const sent=submitPiReviewResultV2({binding:{assignmentId:prepared.assignmentId,
       sessionId:'d4-g08-t03-'+primary,caseId,runId:prepared.runId},triggeredBy:'user',
       result:{summary:'synthetic '+primary+' action, no authorized school action performed',
         checks:created.entity!.mapping.map(m=>({ruleId:m.ruleId,subjectIds:[m.subjectId!],
           status:'awaiting-confirmation' as const,
           reason:'No verified current school workflow/authority source',sourceRefs:[]})),finish:true}})
     expect(sent.rejected).toEqual([])
     expect(sent.missingChecks).toEqual([])
     const agg=readAggregate(caseId)!,run=getRunV2(caseId,prepared.runId)!
     expect(verifyD2PiRun(agg,run)).toMatchObject({complete:true,problems:[]})
     output('g08-t03-'+primary+'-pi-plan.json',created.entity)
     output('g08-t03-'+primary+'-pi-run.json',run)
     console.log('[G08_T03_ACTION_PI]',JSON.stringify({primary,caseId,checks:run.checks.length,
       fingerprint:plan.fingerprint,verified:true,onlineModel:false}))
   }
 })
 test('reviewer-confirmed evidence for lost item A does not permit lost item B or stale versions',async()=>{
   const x=inputs('g08-t02')
   const caseId='d4-g08-lost-evidence-isolation'
   const created=await createD2TechnicalCase({caseId,title:'synthetic independent lost items',actor,
     workspace:x.w,selection:x.selection})
   expect(created.ok).toBeTrue()
   if(!created.ok)throw Error(created.message)
   const folder=join(local,'evidence');mkdirSync(folder,{recursive:true})
   const path=join(folder,'synthetic-owner-note.txt')
   writeFileSync(path,'SYNTHETIC: only lost-item-a owner note. No school inventory confirmation. Item B unproven.')
   const before=readAggregate(caseId)!
   const registered=await registerMaterial(caseId,{requestId:'g08-evidence-register',actor,
     expectedRevision:before.caseV2.revision,payload:{sourcePath:path,role:'evidence'}})
   expect(registered.ok).toBeTrue()
   if(!registered.ok)throw Error(registered.message)
   const after=readAggregate(caseId)!,doc=after.caseV2.documents[0]!.versionId
   const fact='d2:object:g08-lost-item:r01'
   const linked=await setEvidenceLink(caseId,{requestId:'g08-evidence-bind-a',actor,
     expectedRevision:after.caseV2.revision,payload:{documentVersionId:doc,subjectIds:['lost-a'],
       supportsFact:fact,linkedBy:'user'}})
   expect(linked.ok).toBeTrue()
   if(!linked.ok)throw Error(linked.message)
   const agg=readAggregate(caseId)!,plan=created.entity!
   const a=plan.mapping.find(m=>m.subjectId==='lost-a'&&m.evidenceCoverage?.supportsFacts.includes(fact))!
   const b=plan.mapping.find(m=>m.subjectId==='lost-b'&&m.evidenceCoverage?.supportsFacts.includes(fact))!
   expect(validateD2GuardSubmission(agg,a,'compliant',[doc])).toBeUndefined()
   expect(validateD2GuardSubmission(agg,b,'compliant',[doc])).toContain('GENERIC_EVIDENCE_SCOPE_MISSING')
   expect(validateD2GuardSubmission(agg,a,'compliant',['old-document-version'])).toContain('GENERIC_EVIDENCE_SCOPE_MISSING')
   output('g08-t02-evidence-boundary.json',{caseId,registeredMaterial:doc,evidenceLinks:agg.evidenceLinks,
      aSubject:'lost-a',bSubject:'lost-b',aSupported:true,bSupported:false,staleVersionAllowed:false})
 })
})

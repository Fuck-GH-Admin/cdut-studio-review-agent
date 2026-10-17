/**
 * G01-I D3-R1 synthetic typed-engine positive/negative regressions.
 * No applicant data is a trusted registry. No B materials or hidden Gold.
 */
import { afterAll, describe, expect, test } from 'bun:test'
import { mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import type { Actor, CaseAggregateV2, D2ScenarioSelection, D2TrustedStudentSnapshotV1, ReviewAuthoringWorkspaceV1, ReviewCaseV2 } from '@profer/shared'
import { compileD2RuntimePlan, createD2TechnicalCase, makeD2CandidateShell, verifyD2PiRun, verifyD2InstalledPlan } from './review-d2-runtime'
import { evaluateD2GateExpression, validateD2GuardSubmission } from './review-d2-execution-gates'
import { saveAuthoringCandidateDraft } from './template-store'
import { readAggregate } from './case-store-v2'
import { registerMaterial } from './material-service'
import { setEvidenceLink } from './application-service'
import { preparePiReviewRunV2, submitPiReviewResultV2 } from './pi-case-review-service'
import { getRunV2 } from './run-store-v2'
const dir = resolve(import.meta.dir, '../../../../../../docs/design/review-agent/fixtures')
const config = mkdtempSync(join(tmpdir(),'d3-r1-student-'))
process.env.PROFER_CONFIG_DIR = config
afterAll(()=>rmSync(config,{recursive:true,force:true}))
const actor:Actor={actorId:'r1-synthetic-reviewer',actorSource:'local',role:'reviewer'}
const workspace = ():ReviewAuthoringWorkspaceV1 => JSON.parse(readFileSync(resolve(dir,'d2-workspace-synthetic.json'),'utf8'))
const draft = (caseId='synthetic-student-case'):ReviewCaseV2 => ({
  id:caseId,templateId:'text-review',templateVersion:1,title:'synthetic two-field correction',
  objectType:'document',caseFields:{},subjects:[],documents:[],stage:'draft',revision:0,
  createdAt:'2026-10-17T00:00:00Z',updatedAt:'2026-10-17T00:00:00Z',
})
const chosen = ():D2ScenarioSelection => ({
  templateId:'text-review',version:1,
  targets:[
    {kind:'student-field',objectKey:'synthetic-student/full-name',subjectId:'student-name-check',title:'name correction',studentId:'synthetic-student',fieldKey:'full-name',intent:'correction',enrollmentStatus:'graduated'},
    {kind:'student-field',objectKey:'synthetic-student/credential-id',subjectId:'student-credential-check',title:'credential correction',studentId:'synthetic-student',fieldKey:'credential-id',intent:'correction',enrollmentStatus:'graduated'},
  ],
})
const trusted = ():D2TrustedStudentSnapshotV1 => ({
 schemaVersion:1,sourceKind:'controlled-synthetic',studentId:'synthetic-student',
 sourceId:'fixture-registry',snapshotVersionId:'registry-v1',status:'current',
 enrollmentStatus:'enrolled',fields:{'enrollment-status':'enrolled','full-name':'SYNTHETIC_OLD'},
})
function scoped():ReviewAuthoringWorkspaceV1 {
 const w=workspace()
 const text=w.definitions.templates.find(x=>x.templateId==='text-review')!
 text.modules.push({id:'credential',moduleId:'text-structure',version:1})
 const name=w.sourceBindings.find(x=>x.checkId==='text-review@1:module/text/structure')!
 name.studentScope={fieldKeys:['full-name'],intents:['correction'],enrollmentStatuses:['enrolled']}
 name.gate={
   when:{kind:'trusted-registry-field',fieldKey:'enrollment-status',equals:'enrolled'},
   material:{provider:'applicant',dueStages:['reviewing'],alternatives:['d2:student:full-name:legal-document']},
 }
 w.sourceBindings.push({
   checkId:'text-review@1:module/credential/structure',sourceIds:['synthetic-source'],
   studentScope:{fieldKeys:['credential-id'],intents:['correction'],enrollmentStatuses:['enrolled']},
   gate:{
     when:{kind:'trusted-registry-field',fieldKey:'enrollment-status',equals:'enrolled'},
     material:{provider:'applicant',dueStages:['reviewing'],alternatives:['d2:student:credential-id:legal-document']},
   },
 })
 return w
}
function aggregate(plan:ReturnType<typeof compileD2RuntimePlan>,opts?:{version?:string;student?:string;name?:boolean;credential?:boolean;active?:boolean}):CaseAggregateV2 {
 const version=opts?.version??'doc-v1'
 const mk=(subjectId:string,supportsFact:string)=>({id:'link-'+subjectId,documentVersionId:'doc-v1',subjectId,status:'confirmed',linkedBy:'user',supportsFact})
 return {caseV2:{...draft(),stage:'reviewing',subjects:plan.subjects,documents:[{versionId:version,active:opts?.active??true}]},
  d2RuntimePlan:plan,evidenceLinks:[
    ...(opts?.name===false?[]:[mk(opts?.student??'student-name-check','d2:student:full-name:legal-document')]),
    ...(opts?.credential===false?[]:[mk(opts?.student??'student-credential-check','d2:student:credential-id:legal-document')]),
  ],observations:[]} as unknown as CaseAggregateV2
}
describe('D3-R1 typed G01-I runtime: R0 red-to-green',()=>{
 test('one synthetic student with two independently scoped real Subjects/Checks/SourceIds',()=>{
  const plan=compileD2RuntimePlan(scoped(),chosen(),draft(),trusted())
  expect(plan.schemaVersion).toBe(2)
  expect(plan.publicationAllowed).toBeFalse()
  expect(plan.subjects).toHaveLength(2)
  expect(plan.targets).toHaveLength(2)
  expect(plan.mapping).toHaveLength(2)
  expect(new Set(plan.mapping.map(x=>x.ruleId)).size).toBe(2)
  expect(plan.mapping.map(x=>x.objectKey)).toEqual(['synthetic-student/full-name','synthetic-student/credential-id'])
  expect(plan.mapping.map(x=>x.subjectId)).toEqual(['student-name-check','student-credential-check'])
  expect(plan.mapping.every(x=>x.applicability==='applicable'&&x.sourceIds.length===1)).toBeTrue()
  expect(plan.mapping.map(x=>x.evidenceCoverage?.fieldKey)).toEqual(['full-name','credential-id'])
  expect(plan.rules.every(x=>x.targetScope==='subject')).toBeTrue()
 })
 test('same workspace: remove one requested field -> exactly one real Check, not 49 case-scoped tasks',()=>{
  const two=compileD2RuntimePlan(scoped(),chosen(),draft(),trusted())
  const one=chosen();one.targets=one.targets.slice(0,1)
  const single=compileD2RuntimePlan(scoped(),one,draft(),trusted())
  expect(single.mapping).toHaveLength(1)
  expect(single.mapping[0]?.objectKey).toBe('synthetic-student/full-name')
  expect(single.fingerprint).not.toBe(two.fingerprint)
 })
 test('one different request intent cannot trigger the wrong Check or give a 0-target fake success',()=>{
  const changed=chosen();changed.targets[0]!.intent='unrelated'
  const plan=compileD2RuntimePlan(scoped(),changed,draft(),trusted())
  expect(plan.mapping).toHaveLength(2)
  expect(plan.mapping[0]?.applicability).toBe('unknown')
  expect(plan.mapping[1]?.applicability).toBe('applicable')
  expect(validateD2GuardSubmission(aggregate(plan),plan.mapping[0]!,'compliant',[])).toContain('D2_STUDENT_APPLICABILITY_UNKNOWN')
  changed.targets[1]!.intent='unrelated'
  const allUnknown=compileD2RuntimePlan(scoped(),changed,draft(),trusted())
  expect(allUnknown.mapping.map(x=>x.applicability)).toEqual(['unknown','unknown'])
  expect(allUnknown.mapping).toHaveLength(2)
 })
 test('unknown independent registry is pending; applicant caseFields cannot supply trusted status',()=>{
  const c=draft();c.caseFields={'enrollment-status':{kind:'text',value:'enrolled'}}
  const pending=compileD2RuntimePlan(scoped(),chosen(),c)
  expect(pending.mapping.map(x=>x.applicability)).toEqual(['unknown','unknown'])
  const a=aggregate(pending,{name:false,credential:false})
  expect(validateD2GuardSubmission(a,pending.mapping[0]!,'compliant',[])).toContain('D2_STUDENT_APPLICABILITY_UNKNOWN')
  expect(validateD2GuardSubmission(a,pending.mapping[0]!,'not-applicable',[])).toContain('D2_STUDENT_APPLICABILITY_UNKNOWN')
  expect(validateD2GuardSubmission(a,pending.mapping[0]!,'awaiting-confirmation',[])).toBeUndefined()
 })
 test('trusted fixture is a separate controlled versioned input, not applicant attestation',()=>{
  const yes=compileD2RuntimePlan(scoped(),chosen(),draft(),trusted())
  const another=trusted();another.enrollmentStatus='graduated';another.fields['enrollment-status']='graduated'
  const no=compileD2RuntimePlan(scoped(),chosen(),draft(),another)
  expect(yes.mapping[0]?.applicability).toBe('applicable')
  expect(no.mapping[0]?.applicability).toBe('not-applicable')
  expect(validateD2GuardSubmission(aggregate(no),no.mapping[0]!,'compliant',[])).toContain('D2_STUDENT_NOT_APPLICABLE')
  expect(validateD2GuardSubmission(aggregate(no),no.mapping[0]!,'not-applicable',[])).toBeUndefined()
  expect(yes.fingerprint).not.toBe(no.fingerprint)
  const fake={...trusted(),sourceKind:'official-school'} as unknown as D2TrustedStudentSnapshotV1
  expect(()=>compileD2RuntimePlan(scoped(),chosen(),draft(),fake)).toThrow('D2_TRUSTED_SOURCE_INVALID')
  const revoked={...trusted(),status:'revoked'} as D2TrustedStudentSnapshotV1
  expect(()=>compileD2RuntimePlan(scoped(),chosen(),draft(),revoked)).toThrow('D2_TRUSTED_SOURCE_INVALID')
 })
 test('signed synthetic document may cover two exact fields, not third fact, foreign student, stale version or wrong subject',()=>{
  const plan=compileD2RuntimePlan(scoped(),chosen(),draft(),trusted())
  const a=aggregate(plan)
  for(const mapping of plan.mapping){
    const expr=mapping.gate!.when!
    expect(evaluateD2GateExpression(expr,a,mapping.subjectId,['doc-v1'])).toBe('true')
    expect(validateD2GuardSubmission(a,mapping,'compliant',['doc-v1'])).toBeUndefined()
  }
  const wrongSubject=aggregate(plan,{student:'wrong-student'})
  expect(validateD2GuardSubmission(wrongSubject,plan.mapping[0]!,'compliant',['doc-v1'])).toContain('D2_MATERIAL_ALTERNATIVE_UNVERIFIED')
  const stale=aggregate(plan,{version:'doc-v2'})
  expect(validateD2GuardSubmission(stale,plan.mapping[0]!,'compliant',['doc-v2'])).toContain('D2_MATERIAL_ALTERNATIVE_UNVERIFIED')
  const removed=aggregate(plan,{active:false})
  expect(validateD2GuardSubmission(removed,plan.mapping[0]!,'compliant',['doc-v1'])).toContain('D2_MATERIAL_ALTERNATIVE_UNVERIFIED')
  const onlyName=aggregate(plan,{credential:false})
  expect(validateD2GuardSubmission(onlyName,plan.mapping[1]!,'compliant',['doc-v1'])).toContain('D2_MATERIAL_ALTERNATIVE_UNVERIFIED')
  const noEvidence=aggregate(plan,{name:false})
  expect(validateD2GuardSubmission(noEvidence,plan.mapping[0]!,'compliant',[])).toContain('D2_MATERIAL_ALTERNATIVE_UNVERIFIED')
  const third={...plan.mapping[0]!,gate:{...plan.mapping[0]!.gate!,material:{...plan.mapping[0]!.gate!.material!,alternatives:['d2:student:full-name:unrelated-claim']}}}
  expect(validateD2GuardSubmission(a,third,'compliant',['doc-v1'])).toContain('D2_MATERIAL_ALTERNATIVE_UNVERIFIED')
 })
 test('multi-axis same-template scenarios preserve independently scoped field checks',()=>{
  const w=scoped()
  const template=w.definitions.templates.find(t=>t.templateId==='text-review')!
  template.scenarios=['legal-name-change','credential-correction']
  template.modules[0]!.scenario='legal-name-change'
  template.modules[1]!.scenario='credential-correction'
  const s=chosen();s.scenarios=['legal-name-change','credential-correction']
  const both=compileD2RuntimePlan(w,s,draft(),trusted())
  expect(both.mapping).toHaveLength(2)
  expect(both.scenarios).toEqual(['legal-name-change','credential-correction'])
  expect(both.mapping.map(x=>x.subjectId)).toEqual(['student-name-check','student-credential-check'])
  s.scenarios=['legal-name-change']
  // A declared target without an applicable branch cannot silently disappear.
  expect(()=>compileD2RuntimePlan(w,s,draft(),trusted())).toThrow('D2_UNUSED_TARGET')
  s.scenarios=['unknown']
  expect(()=>compileD2RuntimePlan(w,s,draft(),trusted())).toThrow('D2_SCENARIO_REQUIRED')
 })
 test('student case-level rule cannot bypass the dynamic scope through an unannotated 49-rule fallback',()=>{
  expect(()=>compileD2RuntimePlan(workspace(),chosen(),draft(),trusted())).toThrow('D2_STUDENT_UNSCOPED_CHECK')
  const w=scoped()
  const template=w.definitions.templates.find(t=>t.templateId==='text-review')!
  template.localTasks.push({id:'policy-verification',title:'policy pending',requirement:'current policy must be checked',completion:'review pending'})
  w.sourceBindings.push({checkId:'text-review@1:local/policy-verification',sourceIds:['school-policy-unverified']})
  expect(()=>compileD2RuntimePlan(w,chosen(),draft(),trusted())).toThrow('D2_STUDENT_UNSCOPED_CHECK')
  w.sourceBindings.at(-1)!.caseScopeJustification='Policy applicability genuinely covers the entire case and remains pending'
  const plan=compileD2RuntimePlan(w,chosen(),draft(),trusted())
  expect(plan.mapping).toHaveLength(3)
  expect(plan.mapping.filter(x=>!x.subjectId)).toHaveLength(1)
  expect(plan.mapping.find(x=>!x.subjectId)?.authority).toBe('unverified-policy')
  const bad=w.sourceBindings.at(-1)!
  bad.caseScopeJustification=''
  expect(()=>compileD2RuntimePlan(w,chosen(),draft(),trusted())).toThrow('D2_AUTHORING_INVALID')
 })
 test('invalid cross-field evidence alternatives and malformed student targets remain rejected',()=>{
  const bad=scoped();bad.sourceBindings.find(x=>x.checkId==='text-review@1:module/text/structure')!.gate!.material!.alternatives=['d2:student:credential-id:legal-document']
  expect(()=>compileD2RuntimePlan(bad,chosen(),draft(),trusted())).toThrow('D2_STUDENT_EVIDENCE_SCOPE_INVALID')
  const altered=chosen();altered.targets[0]!.fieldKey='credential-id'
  expect(()=>compileD2RuntimePlan(scoped(),altered,draft(),trusted())).toThrow('D2_TARGET_INVALID')
 })
 test('existing legacy text schema 1 and generic advanced relation denial survive',()=>{
  const legacy=compileD2RuntimePlan(workspace(),{templateId:'text-review',version:1,targets:[]},draft())
  expect(legacy.schemaVersion).toBe(1)
  expect(legacy.subjects).toHaveLength(0)
  const unmapper=scoped();unmapper.advanced={claimKeys:['unmapped'],evidenceRelations:[{claimKey:'unmapped',requiredSourceIds:['synthetic-source']}]}
  expect(()=>compileD2RuntimePlan(unmapper,chosen(),draft(),trusted())).toThrow('D2_UNMAPPED_ADVANCED')
 })
 test('real D2 create → Pi prepare → tool receipt uses two actual scoped Check IDs, never approval',async()=>{
  const w=scoped(),selection=chosen(),id='r1-typed-pi-case'
  saveAuthoringCandidateDraft(makeD2CandidateShell(w,'text-review',1))
  const created=await createD2TechnicalCase({caseId:id,title:'synthetic scoped request',actor,workspace:w,selection,trustedStudentSnapshot:trusted()})
  expect(created.ok).toBeTrue()
  if(!created.ok)throw new Error(created.message)
  expect(created.entity?.mapping).toHaveLength(2)
  expect(verifyD2InstalledPlan(readAggregate(id)!)).toEqual([])
  const evidenceDir=join(config,'source-input');mkdirSync(evidenceDir,{recursive:true})
  const file=join(evidenceDir,'synthetic-request.txt')
  writeFileSync(file,'SYNTHETIC MATERIAL ONLY: legal document presented for two changes; issuer and legal force unverified.')
  const agg=readAggregate(id)!
  const material=await registerMaterial(id,{requestId:'r1-register-material',actor,expectedRevision:agg.caseV2.revision,payload:{sourcePath:file,role:'evidence'}})
  expect(material.ok).toBeTrue()
  if(!material.ok)throw new Error(material.message)
  // Two reviewer-confirmed fact edges share ONE registered document version, not a global grant.
  const versionId=readAggregate(id)!.caseV2.documents[0]!.versionId
  for(const [index,scope] of [
    {subjectId:'student-name-check',fact:'d2:student:full-name:legal-document'},
    {subjectId:'student-credential-check',fact:'d2:student:credential-id:legal-document'},
  ].entries()){
    const current=readAggregate(id)!
    const result=await setEvidenceLink(id,{requestId:'r1-link-'+index,actor,expectedRevision:current.caseV2.revision,
      payload:{documentVersionId:versionId,subjectIds:[scope.subjectId],supportsFact:scope.fact,linkedBy:'user'}})
    expect(result.ok).toBeTrue()
    if(!result.ok)throw new Error(result.message)
  }
  const links=readAggregate(id)!.evidenceLinks
  expect(links).toHaveLength(2)
  expect(new Set(links.map(x=>x.documentVersionId)).size).toBe(1)
  expect(new Set(links.map(x=>x.subjectId)).size).toBe(2)
  expect(created.entity!.mapping.every(m=>validateD2GuardSubmission(readAggregate(id)!,m,'compliant',[versionId])===undefined)).toBeTrue()
  const prepared=preparePiReviewRunV2({caseId:id,sessionId:'r1-synthetic-session',turnId:'r1-synthetic-turn'})
  expect(prepared.userMessage).toContain('D2 固定技术预审包')
  const result=submitPiReviewResultV2({
    binding:{assignmentId:prepared.assignmentId,sessionId:'r1-synthetic-session',caseId:id,runId:prepared.runId},
    triggeredBy:'user',result:{summary:'Only a synthetic pending technical pre-review; no authoritative policy or approval',
      checks:created.entity!.mapping.map(m=>({
        ruleId:m.ruleId,subjectIds:[m.subjectId!],status:'awaiting-confirmation' as const,
        reason:'Issuer provenance and administrative permission require independent verification',sourceRefs:[],
      })),finish:true},
  })
  expect(result.rejected).toEqual([])
  expect(result.missingChecks).toEqual([])
  const final=readAggregate(id)!
  expect(final.caseV2.subjects).toHaveLength(2)
  const run=getRunV2(id,prepared.runId)!
  expect(run.checks.map(x=>x.target.subjectIds[0]).sort()).toEqual(['student-credential-check','student-name-check'])
  expect(verifyD2PiRun(final,run).complete).toBeTrue()
  const evidenceOut=process.env.R1_RUNTIME_EVIDENCE_DIR
  if(evidenceOut){
    mkdirSync(evidenceOut,{recursive:true})
    writeFileSync(join(evidenceOut,'actual-d2-plan.json'),JSON.stringify(created.entity,null,2))
    writeFileSync(join(evidenceOut,'actual-pi-run-and-evidence.json'),JSON.stringify({
      caseId:id,planFingerprint:created.entity!.fingerprint,
      runId:run.id,runStatus:run.status,technicalComplete:verifyD2PiRun(final,run).complete,
      checks:run.checks.map(c=>({checkId:c.checkId,ruleId:c.ruleId,subjectIds:c.target.subjectIds,status:c.status,reason:c.reason,sourceRefs:c.sourceRefs})),
      documents:final.caseV2.documents.map(d=>({versionId:d.versionId,active:d.active,contentHash:d.contentHash,parseRevision:d.parseRevision})),
      links:final.evidenceLinks.map(l=>({id:l.id,subjectId:l.subjectId,supportsFact:l.supportsFact,documentVersionId:l.documentVersionId,status:l.status,linkedBy:l.linkedBy})),
      publicationAllowed:false,onlineModelRun:false,officialAuthority:false,
    },null,2))
  }
 })
 test('D1 validate/save/read/diff → D3 export/import → D2 preview/register/create through real isolated CLIs',()=>{
  const cliHome=join(config,'r1-cli-home')
  mkdirSync(cliHome,{recursive:true})
  const io=join(config,'r1-cli-io')
  mkdirSync(io,{recursive:true})
  const workspaceFile=join(io,'workspace.json'),selectionFile=join(io,'selection.json'),
    draftFile=join(io,'draft.json'),trustedFile=join(io,'trusted.json'),
    bundleFile=join(io,'bundle.json'),importedFile=join(io,'imported.json'),revisedFile=join(io,'revised.json')
  const w=scoped()
  writeFileSync(workspaceFile,JSON.stringify(w))
  writeFileSync(selectionFile,JSON.stringify(chosen()))
  writeFileSync(draftFile,JSON.stringify(draft('r1-cli-typed')))
  writeFileSync(trustedFile,JSON.stringify(trusted()))
  const revised=structuredClone(w);revised.revision=2
  revised.definitions.modules[0]!.tasks[0]!.requirement+=' synthetic revision'
  writeFileSync(revisedFile,JSON.stringify(revised))
  const scripts=resolve(import.meta.dir,'../../../../scripts')
  const env={...process.env,PROFER_CONFIG_DIR:cliHome,
    D2_ALLOW_SYNTHETIC_REGISTRY:'1',D2_SYNTHETIC_TRUSTED_FIXTURE_PATH:trustedFile}
  const run=(script:string,args:string[],expectedExit=0):{[key:string]:any}=>{
    const result=Bun.spawnSync({cmd:[process.execPath,resolve(scripts,script),...args],env})
    expect(result.exitCode).toBe(expectedExit)
    if(result.exitCode!==expectedExit)throw new Error(args.join(' ')+' exit '+result.exitCode+' '+result.stderr.toString())
    return JSON.parse(result.stdout.toString()) as Record<string,any>
  }
  const d1='review-authoring-v1.ts',d3='review-d3-library.ts',d2='review-d2-plan.ts'
  expect(run(d1,['validate',workspaceFile]).ok).toBeTrue()
  expect(run(d1,['save',workspaceFile,'0','r1-test-agent']).saved).toBeTrue()
  expect(run(d1,['read',w.workspaceId]).workspace.revision).toBe(1)
  const diff=run(d1,['diff',workspaceFile,revisedFile])
  expect(diff).toBeDefined()
  const exported=run(d3,['export',workspaceFile,bundleFile])
  expect(exported.fingerprint).toHaveLength(64)
  expect(run(d3,['import',bundleFile,importedFile]).imported).toBeTrue()
  const plan=run(d2,['preview',importedFile,selectionFile,draftFile])
  expect(plan.targets).toHaveLength(2)
  expect(plan.mapping).toHaveLength(2)
  expect(plan.schemaVersion).toBe(2)
  expect(plan.publicationAllowed).toBeFalse()
  expect(run(d2,['register',importedFile,selectionFile]).registered).toBeTrue()
  const created=run(d2,['create',importedFile,selectionFile,'r1-cli-typed','synthetic CLI case','r1-test-agent'])
  expect(created.created).toBeTrue()
  expect(created.fingerprint).toBe(plan.fingerprint)
  // Synthetic fixture is an explicitly gated independent CLI side channel.
  const denied=Bun.spawnSync({cmd:[process.execPath,resolve(scripts,d2),'preview',importedFile,selectionFile,draftFile],
    env:{...env,D2_ALLOW_SYNTHETIC_REGISTRY:'0'}})
  expect(denied.exitCode).not.toBe(0)
  expect(denied.stderr.toString()).toContain('D2_TRUSTED_SOURCE_DISABLED')
  const chain={caseId:'r1-cli-typed',workspaceId:w.workspaceId,revision:1,
    transferFingerprint:exported.fingerprint,planFingerprint:plan.fingerprint,
    subjects:plan.subjects.length,checks:plan.mapping.length,publicationAllowed:false,
    d1Validated:true,d1Saved:true,d1Read:true,d1Diff:true,d3Exported:true,d3Imported:true,
    d2Preview:true,d2Registered:true,d2Created:true,fixtureWithoutOptInDenied:true}
  console.log('[R1_CLI_EVIDENCE]',JSON.stringify(chain))
  const evidenceOut=process.env.R1_RUNTIME_EVIDENCE_DIR
  if(evidenceOut){mkdirSync(evidenceOut,{recursive:true})
    writeFileSync(join(evidenceOut,'actual-cli-chain.json'),JSON.stringify(chain,null,2))
  }
 })

 test('C0 frozen A workspace: reproduce 49 case-scope probes and R1 refuse silent migration (read-only A)',()=>{
  const root=process.env.R1_FROZEN_A_ACCEPTANCE_ROOT
  if(!root){console.log('[R1_A_C_DIFF] optional frozen A checkout unavailable; dedicated CI supplies it');return}
  const load=<T>(relative:string):T=>JSON.parse(readFileSync(join(root,relative),'utf8')) as T
  const w=load<ReviewAuthoringWorkspaceV1>('workspace/workspace.json')
  const selection=load<D2ScenarioSelection>('workspace/selection.json')
  const originalCase=load<ReviewCaseV2>('runtime/synthetic-draft-case.json')
  // This is C0's 0-subject / 49-check technical truth, NOT a successful G01 business run.
  const legacy=compileD2RuntimePlan(w,selection,originalCase)
  expect(legacy.rules).toHaveLength(49)
  expect(legacy.subjects).toHaveLength(0)
  expect(legacy.targets).toHaveLength(0)
  expect(legacy.mapping.every(m=>!m.subjectId&&!m.objectKey)).toBeTrue()
  const another={...originalCase,caseFields:{...originalCase.caseFields,studentNameNew:{kind:'text' as const,value:'SELF_DECLARED_ONLY'}}}
  expect(compileD2RuntimePlan(w,selection,another).fingerprint).toBe(legacy.fingerprint)
  const requested={...selection,targets:[chosen().targets[0]!]}
  expect(()=>compileD2RuntimePlan(w,requested,originalCase,trusted())).toThrow('D2_STUDENT_UNSCOPED_CHECK')
  const advanced=structuredClone(w);advanced.advanced={claimKeys:['old-new'],evidenceRelations:[{claimKey:'old-new',requiredSourceIds:['md-original']}]}
  expect(()=>compileD2RuntimePlan(advanced,selection,originalCase)).toThrow('D2_UNMAPPED_ADVANCED')
  const c0={oldAChecks:legacy.rules.length,oldASubjects:legacy.subjects.length,oldATargets:legacy.targets.length,
   unchangedApplicantFieldFingerprint:true,studentTypedMigration:'D2_STUDENT_UNSCOPED_CHECK',
   genericAdvanced:'D2_UNMAPPED_ADVANCED',newEngineDoesNotAuthorizeOldA:true}
  console.log('[R1_A_C_DIFF]',JSON.stringify(c0))
  if(process.env.R1_RUNTIME_EVIDENCE_DIR){mkdirSync(process.env.R1_RUNTIME_EVIDENCE_DIR,{recursive:true})
    writeFileSync(join(process.env.R1_RUNTIME_EVIDENCE_DIR,'actual-frozen-A-C0-diff.json'),JSON.stringify(c0,null,2))
  }
 })

})

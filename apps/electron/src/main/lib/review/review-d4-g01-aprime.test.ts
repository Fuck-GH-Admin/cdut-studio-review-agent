/** D4 G01-I A′ isolated smoke, no B input or Gold. */
import {afterAll,describe,expect,test} from 'bun:test'
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,rmSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join,resolve} from 'node:path'
import type {ReviewAuthoringWorkspaceV1,D2ScenarioSelection,D2TrustedStudentSnapshotV1,ReviewCaseV2,CaseAggregateV2,Actor} from '@profer/shared'
import {compileD2RuntimePlan,createD2TechnicalCase,makeD2CandidateShell,verifyD2InstalledPlan,verifyD2PiRun} from './review-d2-runtime'
import {validateD2GuardSubmission} from './review-d2-execution-gates'
import {saveAuthoringCandidateDraft} from './template-store'
import {registerMaterial} from './material-service'
import {setEvidenceLink} from './application-service'
import {readAggregate} from './case-store-v2'
import {preparePiReviewRunV2,submitPiReviewResultV2} from './pi-case-review-service'
import {getRunV2} from './run-store-v2'
const root=resolve(import.meta.dir,'../../../../../../docs/design/review-agent/acceptance/d4-g01-i/agent-aprime-r1')
const load=<T>(path:string):T=>JSON.parse(readFileSync(resolve(root,path),'utf8')) as T
const ws=()=>load<ReviewAuthoringWorkspaceV1>('workspace/workspace.json')
const selections=load<{name:D2ScenarioSelection;two:D2ScenarioSelection}>('fixtures/selections.json')
const trusted=load<D2TrustedStudentSnapshotV1>('fixtures/controlled-registry.json')
const config=mkdtempSync(join(tmpdir(),'aprime-g01-'))
process.env.PROFER_CONFIG_DIR=config
afterAll(()=>rmSync(config,{recursive:true,force:true}))
const actor:Actor={actorId:'aprime-reviewer',actorSource:'local',role:'reviewer'}
const draft=(id:string):ReviewCaseV2=>({id,templateId:'g01-student-identity-correction',templateVersion:2,title:'synthetic correction',objectType:'document',caseFields:{'enrollment-status':{kind:'text',value:'enrolled'}},subjects:[],documents:[],stage:'draft',revision:0,createdAt:'2026-10-17T00:00:00Z',updatedAt:'2026-10-17T00:00:00Z'})
const plan=(selection:D2ScenarioSelection,t=trusted)=>compileD2RuntimePlan(ws(),selection,draft('aprime-preview'),t)
const sel=(s:string,fields:string[],sid='synthetic-1'):D2ScenarioSelection=>({templateId:'g01-student-identity-correction',version:2,scenarios:[s.toLowerCase()],targets:fields.map(f=>({kind:'student-field',studentId:sid,fieldKey:f,intent:'correction',objectKey:sid+'/'+f,subjectId:sid+'-'+f,title:'更正'+f}))})
const output=(path:string,obj:unknown)=>{const dir=process.env.APRIME_RUNTIME_EVIDENCE_DIR;if(dir){mkdirSync(dir,{recursive:true});writeFileSync(join(dir,path),JSON.stringify(obj,null,2))}}
const agg=(p:ReturnType<typeof plan>,facts:Array<{subjectId:string;supportsFact:string}>,version='doc-v1'):CaseAggregateV2=>({caseV2:{...draft('edge-check'),stage:'reviewing',subjects:p.subjects,documents:[{versionId:version,active:true}]},d2RuntimePlan:p,evidenceLinks:facts.map((x,i)=>({id:'edge-'+i,documentVersionId:'doc-v1',subjectId:x.subjectId,supportsFact:x.supportsFact,status:'confirmed',linkedBy:'user'})),observations:[]} as unknown as CaseAggregateV2)
describe('D4 G01-I A-prime real typed authoring',()=>{
 test('85 original responsibilities, 49 mapped plus 13 scenario bindings, not blanket case-scope',()=>{
  const w=ws(),c=load<Array<{id:string;oldChecks:string[];newChecks:string[]}>>('coverage/ledger-85.json')
  expect(c.length).toBe(85);expect(w.sourceBindings.length).toBe(62)
  expect(w.definitions.modules.filter(x=>x.version===2).length).toBe(10)
  expect(w.definitions.templates[0]?.scenarios?.length).toBe(13)
  expect(new Set(w.sourceBindings.map(x=>x.checkId)).size).toBe(62)
  expect(w.sourceBindings.filter(x=>x.studentScope).length).toBeGreaterThan(10)
  expect(w.sourceBindings.filter(x=>x.caseScopeJustification).length).toBeLessThan(49)
  for(const [letter,n] of [['R',28],['S',13],['F',28],['M',6],['P',8]] as const)expect(c.filter(x=>new RegExp('^'+letter+'[0-9]').test(x.id)).length).toBe(n)
  for(const x of c)if(x.oldChecks.length)expect(x.newChecks.length).toBe(x.oldChecks.length)
 })
 test('single versus concurrent name/credential correction dynamically alters subjects, checks, fingerprints',()=>{
  const name=plan(selections.name),two=plan(selections.two)
  expect(name.subjects.length).toBe(1);expect(two.subjects.length).toBe(2)
  expect(name.fingerprint).not.toBe(two.fingerprint)
  expect(name.mapping.some(x=>x.checkId.includes('branch-s02/'))).toBeFalse()
  for(const s of ['s01','s02','s07'])expect(two.mapping.some(x=>x.checkId.includes('branch-'+s+'/'))).toBeTrue()
  expect(two.mapping.some(x=>x.checkId.includes('/r014#synthetic-1/credential-id'))).toBeFalse()
  expect(two.mapping.some(x=>x.checkId.includes('/r015#synthetic-1/full-name'))).toBeFalse()
  expect(two.mapping.some(x=>x.checkId.includes('/r014#synthetic-1/full-name'))).toBeTrue()
  expect(two.mapping.some(x=>x.checkId.includes('/r015#synthetic-1/credential-id'))).toBeTrue()
  output('actual-name-plan.json',name);output('actual-two-field-plan.json',two)
 })
 test('13 original scenarios are selectable but do not claim verified policy or automatic routing',()=>{
  const choices:Record<string,string[]>={S01:['full-name'],S02:['credential-id'],S03:['credential-id'],S04:['full-name'],S05:['full-name'],S06:['birth-date'],S07:['full-name','credential-id'],S08:['sex'],S09:['full-name'],S10:['full-name'],S11:['full-name'],S12:['full-name'],S13:['full-name']}
  const logs=[]
  for(const [s,fields] of Object.entries(choices)){
   const snapshot={...trusted,studentId:s==='S12'?'synthetic-alumni':'synthetic-1',enrollmentStatus:s==='S12'?'graduated':'enrolled',fields:{...trusted.fields,'enrollment-status':s==='S12'?'graduated':'enrolled'}}
   const p=plan(sel(s,fields,snapshot.studentId),snapshot)
   expect(p.mapping.some(x=>x.checkId.includes('branch-'+s.toLowerCase()+'/'))).toBeTrue()
   logs.push({scenario:s,subjectCount:p.subjects.length,checkCount:p.mapping.length,fingerprint:p.fingerprint})
  }
  output('actual-13-scenarios.json',logs)
 })
 test('untrusted applicant status cannot replace independent registry; graduate and unknown remain non-compliant-unproven',()=>{
  const no=compileD2RuntimePlan(ws(),selections.name,draft('applicant-only'))
  expect(no.mapping.find(x=>x.checkId.includes('/r014#'))?.applicability).toBe('unknown')
  expect(no.mapping.some(x=>x.authority==='unverified-policy')).toBeTrue()
  const graduated={...trusted,enrollmentStatus:'graduated',fields:{...trusted.fields,'enrollment-status':'graduated'}}
  expect(plan(selections.name,graduated).mapping.find(x=>x.checkId.includes('/r014#'))?.applicability).toBe('not-applicable')
  expect(()=>plan(selections.name,{...trusted,status:'revoked'})).toThrow('D2_TRUSTED_SOURCE_INVALID')
 })
 test('one document can support two exact field facts, no wrong subject, stale version or false missing old ID',()=>{
  const p=plan(selections.two)
  const n=p.mapping.find(x=>x.checkId.includes('/r014#'))!,i=p.mapping.find(x=>x.checkId.includes('/r015#'))!
  const edges=[{subjectId:'student-name',supportsFact:'d2:student:full-name:legal-document'},{subjectId:'student-id',supportsFact:'d2:student:credential-id:legal-document'}]
  expect(validateD2GuardSubmission(agg(p,edges),n,'compliant',['doc-v1'])).toBeUndefined()
  expect(validateD2GuardSubmission(agg(p,edges),i,'compliant',['doc-v1'])).toBeUndefined()
  expect(validateD2GuardSubmission(agg(p,[edges[0]!]),i,'compliant',['doc-v1'])).toContain('D2_MATERIAL_ALTERNATIVE_UNVERIFIED')
  expect(validateD2GuardSubmission(agg(p,edges,'doc-v2'),n,'compliant',['doc-v2'])).toContain('D2_MATERIAL_ALTERNATIVE_UNVERIFIED')
  expect(validateD2GuardSubmission(agg(p,[{subjectId:'different-student',supportsFact:edges[0]!.supportsFact}]),n,'compliant',['doc-v1'])).toContain('D2_MATERIAL_ALTERNATIVE_UNVERIFIED')
 })
 test('advanced Claim graphs still fail closed, no silent downgrade',()=>{
  const w=ws();w.advanced={claimKeys:['unknown'],evidenceRelations:[{claimKey:'unknown',requiredSourceIds:['md-original']}]}
  expect(()=>compileD2RuntimePlan(w,selections.name,draft('advanced'),trusted)).toThrow('D2_UNMAPPED_ADVANCED')
 })
 test('actual D2 Case and synthetic Pi tool Run with separately confirmed links',async()=>{
  const w=ws();saveAuthoringCandidateDraft(makeD2CandidateShell(w,'g01-student-identity-correction',2))
  const id='aprime-d2-pi-case'
  const created=await createD2TechnicalCase({caseId:id,title:'A-prime synthetic two-field',actor,workspace:w,selection:selections.two,trustedStudentSnapshot:trusted})
  expect(created.ok).toBeTrue();if(!created.ok)throw new Error(created.message)
  const dir=join(config,'input');mkdirSync(dir,{recursive:true});const document=join(dir,'only-synthetic.txt');writeFileSync(document,'Synthetic material; issuer and legal effect unverified.')
  const first=readAggregate(id)!
  const m=await registerMaterial(id,{requestId:'aprime-m',actor,expectedRevision:first.caseV2.revision,payload:{sourcePath:document,role:'evidence'}})
  expect(m.ok).toBeTrue();if(!m.ok)throw new Error(m.message)
  const version=readAggregate(id)!.caseV2.documents[0]!.versionId
  for(const [j,e] of [{subjectId:'student-name',fact:'d2:student:full-name:legal-document'},{subjectId:'student-id',fact:'d2:student:credential-id:legal-document'}].entries()){
   const c=readAggregate(id)!
   const link=await setEvidenceLink(id,{requestId:'aprime-e'+j,actor,expectedRevision:c.caseV2.revision,payload:{documentVersionId:version,subjectIds:[e.subjectId],supportsFact:e.fact,linkedBy:'user'}})
   expect(link.ok).toBeTrue();if(!link.ok)throw new Error(link.message)
  }
  const prepared=preparePiReviewRunV2({caseId:id,sessionId:'aprime-session',turnId:'aprime-turn'})
  const result=submitPiReviewResultV2({binding:{assignmentId:prepared.assignmentId,sessionId:'aprime-session',caseId:id,runId:prepared.runId},triggeredBy:'user',result:{summary:'Author technical synthetic only; no legal source proof',checks:created.entity!.mapping.map(x=>({ruleId:x.ruleId,subjectIds:x.subjectId?[x.subjectId]:created.entity!.subjects.map(s=>s.id),status:'awaiting-confirmation' as const,reason:'official policy or issuer needs confirmation',sourceRefs:[]})),finish:true}})
  expect(result.rejected).toEqual([]);expect(result.missingChecks).toEqual([])
  const final=readAggregate(id)!,run=getRunV2(id,prepared.runId)!
  expect(verifyD2InstalledPlan(final)).toEqual([]);expect(verifyD2PiRun(final,run).complete).toBeTrue()
  output('actual-case-run.json',{caseId:id,runId:run.id,status:run.status,checks:run.checks.length,links:final.evidenceLinks.map(x=>({subjectId:x.subjectId,supportsFact:x.supportsFact,documentVersionId:x.documentVersionId})),fingerprint:created.entity!.fingerprint,publicationAllowed:false})
 })
 test('real isolated D1 save/read/diff → D3 export/import → D2 preview/register/create CLI',()=>{
  const io=join(config,'cli-files'),home=join(config,'cli-home');mkdirSync(io,{recursive:true});mkdirSync(home,{recursive:true})
  const files={w:join(io,'w.json'),s:join(io,'s.json'),c:join(io,'c.json'),f:join(io,'f.json'),revised:join(io,'revised.json'),bundle:join(io,'bundle.json'),imported:join(io,'imported.json')}
  const w=ws(),changed=structuredClone(w);changed.revision=2;changed.definitions.modules[0]!.tasks[0]!.requirement+=' independent diff'
  writeFileSync(files.w,JSON.stringify(w));writeFileSync(files.s,JSON.stringify(selections.name));writeFileSync(files.c,JSON.stringify(draft('aprime-cli-case')));writeFileSync(files.f,JSON.stringify(trusted));writeFileSync(files.revised,JSON.stringify(changed))
  const scripts=resolve(import.meta.dir,'../../../../scripts')
  const env={...process.env,PROFER_CONFIG_DIR:home,D2_ALLOW_SYNTHETIC_REGISTRY:'1',D2_SYNTHETIC_TRUSTED_FIXTURE_PATH:files.f}
  const run=(script:string,args:string[])=>{
   const x=Bun.spawnSync({cmd:[process.execPath,resolve(scripts,script),...args],env})
   if(x.exitCode!==0)throw new Error(script+' '+args.join(' ')+' exit '+x.exitCode+' '+x.stderr.toString())
   return JSON.parse(x.stdout.toString()) as Record<string,any>
  }
  expect(run('review-authoring-v1.ts',['validate',files.w]).ok).toBeTrue()
  expect(run('review-authoring-v1.ts',['save',files.w,'0','aprime-author']).saved).toBeTrue()
  expect(run('review-authoring-v1.ts',['read',w.workspaceId]).workspace.revision).toBe(1)
  expect(run('review-authoring-v1.ts',['diff',files.w,files.revised])).toBeDefined()
  const x=run('review-d3-library.ts',['export',files.w,files.bundle]);expect(x.fingerprint).toHaveLength(64)
  expect(run('review-d3-library.ts',['import',files.bundle,files.imported]).imported).toBeTrue()
  const p=run('review-d2-plan.ts',['preview',files.imported,files.s,files.c]);expect(p.schemaVersion).toBe(2)
  expect(run('review-d2-plan.ts',['register',files.imported,files.s]).registered).toBeTrue()
  const c=run('review-d2-plan.ts',['create',files.imported,files.s,'aprime-cli-case','synthetic A prime','aprime-author'])
  expect(c.created).toBeTrue();expect(c.fingerprint).toBe(p.fingerprint)
  output('actual-cli-chain.json',{planFingerprint:p.fingerprint,transferFingerprint:x.fingerprint,caseId:'aprime-cli-case',subjectCount:p.subjects.length,checkCount:p.mapping.length,realD1:true,realD3:true,realD2:true})
 })
})

/** C′ independent R1/A′ probes, entirely synthetic. Never imports B INPUT or Gold. */
import {afterAll,describe,expect,test} from 'bun:test'
import {mkdtempSync,readFileSync,rmSync,mkdirSync,writeFileSync} from 'node:fs'
import {join,resolve} from 'node:path'
import {tmpdir} from 'node:os'
import type {ReviewAuthoringWorkspaceV1,D2ScenarioSelection,D2TrustedStudentSnapshotV1,ReviewCaseV2,CaseAggregateV2,Actor} from '@profer/shared'
import {compileD2RuntimePlan,createD2TechnicalCase,makeD2CandidateShell,verifyD2InstalledPlan,verifyD2PiRun} from './review-d2-runtime'
import {validateD2GuardSubmission} from './review-d2-execution-gates'
import {saveAuthoringCandidateDraft} from './template-store'
import {registerMaterial} from './material-service'
import {setEvidenceLink} from './application-service'
import {readAggregate} from './case-store-v2'
import {preparePiReviewRunV2,submitPiReviewResultV2} from './pi-case-review-service'
import {getRunV2} from './run-store-v2'

const path=resolve(import.meta.dir,'../../../../../../docs/design/review-agent/acceptance/d4-g01-i/agent-aprime-r1')
const ws=():ReviewAuthoringWorkspaceV1=>JSON.parse(readFileSync(resolve(path,'workspace/workspace.json'),'utf8'))
const config=mkdtempSync(join(tmpdir(),'cprime-d4-'))
process.env.PROFER_CONFIG_DIR=config
afterAll(()=>rmSync(config,{recursive:true,force:true}))
const actor:Actor={actorId:'cprime-reviewer',actorSource:'local',role:'reviewer'}
const draft=(id='cp-case'):ReviewCaseV2=>({id,templateId:'g01-student-identity-correction',templateVersion:2,title:'synthetic only',objectType:'document',caseFields:{'enrollment-status':{kind:'text',value:'enrolled'}},subjects:[],documents:[],stage:'draft',revision:0,createdAt:'2026-10-17T00:00:00Z',updatedAt:'2026-10-17T00:00:00Z'})
const trusted=():D2TrustedStudentSnapshotV1=>({schemaVersion:1,sourceKind:'controlled-synthetic',studentId:'cp-student',sourceId:'cp-registry',snapshotVersionId:'v1',status:'current',enrollmentStatus:'enrolled',fields:{'enrollment-status':'enrolled','full-name':'SYNTHETIC_OLD'}})
const selection=(fields:string[],scenarios=['s01','s02','s07']):D2ScenarioSelection=>({templateId:'g01-student-identity-correction',version:2,scenarios,targets:fields.map(f=>({kind:'student-field',studentId:'cp-student',fieldKey:f,intent:'correction',objectKey:'cp-student/'+f,subjectId:'cp-'+f,title:f}))})
const make=(fields:string[],scenarios=['s01','s02','s07'],t?:D2TrustedStudentSnapshotV1)=>compileD2RuntimePlan(ws(),selection(fields,scenarios),draft(),t)
const fact=(subjectId:string,supportsFact:string,version='v1',status='confirmed')=>({id:subjectId,documentVersionId:version,subjectId,supportsFact,status,linkedBy:'user'})
const facts=[fact('cp-full-name','d2:student:full-name:legal-document'),fact('cp-credential-id','d2:student:credential-id:legal-document')]
const agg=(p:ReturnType<typeof make>,links:Array<ReturnType<typeof fact>>=facts,version='v1'):CaseAggregateV2=>({caseV2:{...draft(),stage:'reviewing',subjects:p.subjects,documents:[{versionId:version,active:true}]},d2RuntimePlan:p,evidenceLinks:links,observations:[]} as unknown as CaseAggregateV2)
const emit=(name:string,value:unknown)=>{const dir=process.env.CPRIME_EVIDENCE_DIR;if(dir){mkdirSync(dir,{recursive:true});writeFileSync(join(dir,name),JSON.stringify(value,null,2))}}

describe('D4 independent C prime no B 28 and no Gold',()=>{
 test('student fields create separately scoped checks, not fake 49 case checks',()=>{
  const two=make(['full-name','credential-id'],undefined,trusted())
  const one=make(['full-name'],['s01'],trusted())
  expect(two.schemaVersion).toBe(2)
  expect(two.subjects.length).toBe(2)
  expect(two.fingerprint).not.toBe(one.fingerprint)
  expect(two.mapping.some(x=>x.checkId.includes('/r014#cp-student/full-name'))).toBeTrue()
  expect(two.mapping.some(x=>x.checkId.includes('/r015#cp-student/credential-id'))).toBeTrue()
  expect(two.mapping.some(x=>x.checkId.includes('/r014#cp-student/credential-id'))).toBeFalse()
  expect(two.mapping.some(x=>x.checkId.includes('/r015#cp-student/full-name'))).toBeFalse()
  expect(two.publicationAllowed).toBeFalse()
  emit('actual-independent-plan.json',{fingerprint:two.fingerprint,subjects:two.subjects.length,checks:two.mapping.length})
 })
 test('applicant caseFields cannot supply trusted enrollment; revoked source fails closed',()=>{
  const unknown=make(['full-name'],['s01'])
  const known=make(['full-name'],['s01'],trusted())
  expect(unknown.mapping.find(x=>x.checkId.includes('/r014#'))?.applicability).toBe('unknown')
  expect(known.mapping.find(x=>x.checkId.includes('/r014#'))?.applicability).toBe('applicable')
  expect(unknown.fingerprint).not.toBe(known.fingerprint)
  expect(()=>make(['full-name'],['s01'],{...trusted(),status:'revoked'})).toThrow('D2_TRUSTED_SOURCE_INVALID')
 })
 test('same document can cover two facts; wrong owner, stale version, unconfirmed fact never inherits verified',()=>{
  const p=make(['full-name','credential-id'],undefined,trusted())
  const name=p.mapping.find(x=>x.checkId.includes('/r014#'))!
  const id=p.mapping.find(x=>x.checkId.includes('/r015#'))!
  expect(validateD2GuardSubmission(agg(p),name,'compliant',['v1'])).toBeUndefined()
  expect(validateD2GuardSubmission(agg(p),id,'compliant',['v1'])).toBeUndefined()
  expect(validateD2GuardSubmission(agg(p,[fact('other-student','d2:student:full-name:legal-document'),facts[1]!]),name,'compliant',['v1'])).toContain('D2_MATERIAL_ALTERNATIVE_UNVERIFIED')
  expect(validateD2GuardSubmission(agg(p,facts,'v2'),name,'compliant',['v2'])).toContain('D2_MATERIAL_ALTERNATIVE_UNVERIFIED')
  expect(validateD2GuardSubmission(agg(p,[fact('cp-full-name','d2:student:full-name:legal-document','v1','pending'),facts[1]!]),name,'compliant',['v1'])).toContain('D2_MATERIAL_ALTERNATIVE_UNVERIFIED')
  expect(validateD2GuardSubmission(agg(p,[facts[0]!]),id,'compliant',['v1'])).toContain('D2_MATERIAL_ALTERNATIVE_UNVERIFIED')
 })
 test('complex claims stay rejected, legacy text plan continues',()=>{
  const w=ws();w.advanced={claimKeys:['unknown'],evidenceRelations:[{claimKey:'unknown',requiredSourceIds:['md-original']}]}
  expect(()=>compileD2RuntimePlan(w,selection(['full-name'],['s01']),draft(),trusted())).toThrow('D2_UNMAPPED_ADVANCED')
  const legacy=JSON.parse(readFileSync(resolve(import.meta.dir,'../../../../../../docs/design/review-agent/fixtures/d2-workspace-synthetic.json'),'utf8')) as ReviewAuthoringWorkspaceV1
  const p=compileD2RuntimePlan(legacy,{templateId:'text-review',version:1,targets:[]},draft('legacy'))
  expect(p.schemaVersion).toBe(1)
 })
 test('independent actual D2 Case and controlled Pi receipt remain awaiting confirmation',async()=>{
  const w=ws(),s=selection(['full-name','credential-id']),caseId='cp-independent-case'
  saveAuthoringCandidateDraft(makeD2CandidateShell(w,'g01-student-identity-correction',2))
  const created=await createD2TechnicalCase({caseId,title:'synthetic C prime',actor,workspace:w,selection:s,trustedStudentSnapshot:trusted()})
  expect(created.ok).toBeTrue()
  if(!created.ok)throw Error(created.message)
  const dir=join(config,'materials');mkdirSync(dir,{recursive:true})
  const f=join(dir,'synthetic.txt');writeFileSync(f,'Synthetic one-document two-field test; legal status unverified.')
  const a=readAggregate(caseId)!
  const registered=await registerMaterial(caseId,{requestId:'cp-material',actor,expectedRevision:a.caseV2.revision,payload:{sourcePath:f,role:'evidence'}})
  expect(registered.ok).toBeTrue()
  if(!registered.ok)throw Error(registered.message)
  const version=readAggregate(caseId)!.caseV2.documents[0]!.versionId
  for(const [j,x] of [{subjectId:'cp-full-name',supportsFact:'d2:student:full-name:legal-document'},{subjectId:'cp-credential-id',supportsFact:'d2:student:credential-id:legal-document'}].entries()){
   const current=readAggregate(caseId)!
   const l=await setEvidenceLink(caseId,{requestId:'cp-link-'+j,actor,expectedRevision:current.caseV2.revision,payload:{documentVersionId:version,subjectIds:[x.subjectId],supportsFact:x.supportsFact,linkedBy:'user'}})
   expect(l.ok).toBeTrue()
   if(!l.ok)throw Error(l.message)
  }
  const prepared=preparePiReviewRunV2({caseId,sessionId:'cp-session',turnId:'cp-turn'})
  const receipt=submitPiReviewResultV2({binding:{assignmentId:prepared.assignmentId,sessionId:'cp-session',caseId,runId:prepared.runId},triggeredBy:'user',result:{summary:'Independent synthetic checks only; authority unverified',checks:created.entity!.mapping.map(x=>({ruleId:x.ruleId,subjectIds:x.subjectId?[x.subjectId]:created.entity!.subjects.map(s=>s.id),status:'awaiting-confirmation' as const,reason:'No current school authorization',sourceRefs:[]})),finish:true}})
  expect(receipt.rejected).toEqual([])
  expect(receipt.missingChecks).toEqual([])
  const final=readAggregate(caseId)!,run=getRunV2(caseId,prepared.runId)!
  expect(verifyD2InstalledPlan(final)).toEqual([])
  expect(verifyD2PiRun(final,run).complete).toBeTrue()
  expect(run.checks.every(x=>x.status==='awaiting-confirmation')).toBeTrue()
  emit('actual-controlled-pi-receipt.json',{caseId,runId:run.id,fingerprint:created.entity!.fingerprint,checkCount:run.checks.length,technicalComplete:true,approved:false})
 })
})

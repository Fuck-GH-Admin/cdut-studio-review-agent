/** G04 D4 eight-template real COMMON-01/02 integration: no hidden Gold or university system. */
import {describe,test,expect,afterAll} from 'bun:test'
import {readFileSync,writeFileSync,mkdirSync,mkdtempSync,rmSync} from 'node:fs'
import {join,resolve} from 'node:path'
import {tmpdir} from 'node:os'
import type {ReviewAuthoringWorkspaceV1,D2ScenarioSelection,ReviewCaseV2,CaseAggregateV2,Actor} from '@profer/shared'
import {validateReviewAuthoringV1} from './review-authoring-v1'
import {exportD3Bundle,importD3Bundle} from './review-d3-module-library'
import {compileD2RuntimePlan,makeD2CandidateShell,createD2TechnicalCase,verifyD2PiRun} from './review-d2-runtime'
import {validateD2GuardSubmission} from './review-d2-execution-gates'
import {saveAuthoringCandidateDraft} from './template-store'
import {readAggregate} from './case-store-v2'
import {preparePiReviewRunV2,submitPiReviewResultV2} from './pi-case-review-service'
import {getRunV2} from './run-store-v2'
import {registerMaterial} from './material-service'
import {setEvidenceLink} from './application-service'

const root=resolve(import.meta.dir,'../../../../../../docs/design/review-agent/acceptance/d4-g04-build')
const home=mkdtempSync(join(tmpdir(),'d4-g04-isolated-'))
process.env.PROFER_CONFIG_DIR=home
afterAll(()=>rmSync(home,{recursive:true,force:true}))
const actor:Actor={actorId:'g04-synthetic-reviewer',actorSource:'local',role:'reviewer'}
const nums:{[k:string]:number}={t01:40,t02:53,t03:46,t04:35,t05:36,t06:48,t07:46,t08:39}
const load=<T>(id:string,name:string):T=>JSON.parse(readFileSync(join(root,id,name),'utf8')) as T
const evidenceRoot=process.env.D4_G04_EVIDENCE_DIR
const emit=(id:string,name:string,body:unknown)=>{
 if(!evidenceRoot)return
 const folder=resolve(evidenceRoot,id);mkdirSync(folder,{recursive:true})
 writeFileSync(join(folder,name),JSON.stringify(body,null,2)+'\n')
}
describe('G04 eight modular business templates on fixed COMMON-01/02',()=>{
 for(const [id,count] of Object.entries(nums)){
  test(id+' D1 validate, D3 transfer, D2 multi-target plan, condition-negative and Pi receipt',async()=>{
   const w=load<ReviewAuthoringWorkspaceV1>(id,'workspace.json')
   const s=load<D2ScenarioSelection>(id,'selection.json')
   const c=load<ReviewCaseV2>(id,'case.json')
   const manifest=load<any>(id,'manifest.json')
   expect(manifest.commonSha).toBe('a7a6a11d4840ad64cfc858c17b35f35180adf063')
   expect(manifest.ruleCount).toBe(count)
   expect(validateReviewAuthoringV1(w)).toEqual([])
   const exported=exportD3Bundle(w)
   const roundtrip=importD3Bundle(exported)
   expect(validateReviewAuthoringV1(roundtrip)).toEqual([])
   expect(roundtrip).toEqual(w)
   const plan=compileD2RuntimePlan(roundtrip,s,c)
   expect(plan.schemaVersion).toBe(3)
   expect(plan.publicationAllowed).toBe(false)
   expect(plan.subjects.map(x=>x.id).sort()).toEqual(['subject-a','subject-b'])
   expect(plan.targets.length).toBe(2)
   expect(plan.mapping.every(m=>m.sourceIds.length>0)).toBe(true)
   expect(new Set(plan.rules.map(m=>m.id)).size).toBe(plan.mapping.length)
   for(const target of ['object-a','object-b']){
    const got=plan.mapping.filter(m=>m.objectKey===target)
    expect(got.filter(m=>/\/r\d{2}#/.test(m.checkId)).length).toBe(count)
    expect(got.every(m=>m.subjectId===(target==='object-a'?'subject-a':'subject-b'))).toBe(true)
   }
   expect(plan.mapping.some(m=>m.objectKey==='object-b'&&m.applicability==='unknown')).toBe(true)
   expect(plan.mapping.some(m=>m.objectKey==='object-a'&&m.applicability==='not-applicable')).toBe(true)
   const unknown=plan.mapping.find(m=>m.objectKey==='object-b'&&m.applicability==='unknown')!
   const expected=plan.mapping.find(m=>m.objectKey==='object-a'&&m.applicability==='applicable')!
   const sameOther=plan.mapping.find(m=>m.objectKey==='object-b'&&m.checkId.includes('/r01#'))!
   const aggregate={caseV2:{...c,stage:'reviewing',documents:[{versionId:'doc-v1',active:true}]},
     d2RuntimePlan:plan,observations:[],evidenceLinks:[{
      id:'confirmed-a',status:'confirmed',linkedBy:'user',subjectId:'subject-a',
      documentVersionId:'doc-v1',supportsFact:expected.evidenceCoverage!.supportsFacts[0],
     }]} as unknown as CaseAggregateV2
   expect(validateD2GuardSubmission(aggregate,unknown,'compliant',['doc-v1'])).toContain('APPLICABILITY_UNKNOWN')
   expect(validateD2GuardSubmission(aggregate,sameOther,'compliant',['doc-v1'])).toContain('GENERIC_EVIDENCE_SCOPE_MISSING')
   expect(validateD2GuardSubmission(aggregate,expected,'compliant',['doc-v2'])).toContain('GENERIC_EVIDENCE_SCOPE_MISSING')
   expect(validateD2GuardSubmission(aggregate,expected,'compliant',['doc-v1'])).toBeUndefined()
   const invalid=structuredClone(s)
   invalid.targets[0]!.conditions![0]!.sourceVersionId='stale'
   expect(()=>compileD2RuntimePlan(w,invalid,c)).toThrow('D2_GENERIC_CONDITION_SOURCE_INVALID')
   const invalidScope=structuredClone(w)
   delete invalidScope.sourceBindings[0]!.genericScope
   expect(()=>compileD2RuntimePlan(invalidScope,s,c)).toThrow('D2_GENERIC_UNSCOPED_CHECK')

   // Real D2/Case store/Pi service path; pending only, no school authorization.
   saveAuthoringCandidateDraft(makeD2CandidateShell(w,s.templateId,s.version))
   const real=await createD2TechnicalCase({caseId:'g04-'+id+'-tech',title:'G04 controlled synthetic '+id,actor,workspace:roundtrip,selection:s})
   expect(real.ok).toBe(true)
   if(!real.ok)throw Error(real.message)
   // A real material-service transaction and human-confirmed fact linkage.
   // This is only controlled synthetic evidence, never a university permit.
   const materialPath=join(home,'g04-'+id+'-sample.txt')
   writeFileSync(materialPath,'SYNTHETIC ONLY / '+id+' / material for object A; no real identity or school authorization')
   const caseId='g04-'+id+'-tech'
   const previous=readAggregate(caseId)!
   const material=await registerMaterial(caseId,{requestId:'g04-mat-'+id,actor,
     expectedRevision:previous.caseV2.revision,payload:{sourcePath:materialPath,role:'evidence'}})
   expect(material.ok).toBe(true)
   if(!material.ok)throw Error(material.message)
   const afterMaterial=readAggregate(caseId)!
   const documentVersionId=afterMaterial.caseV2.documents[0]!.versionId
   const linkA=real.entity!.mapping.find(m=>m.objectKey==='object-a'&&m.checkId.includes('/r01#'))!
   const linkB=real.entity!.mapping.find(m=>m.objectKey==='object-b'&&m.checkId.includes('/r01#'))!
   const setLink=await setEvidenceLink(caseId,{requestId:'g04-link-'+id,actor,
     expectedRevision:afterMaterial.caseV2.revision,payload:{documentVersionId,subjectIds:['subject-a'],
       supportsFact:linkA.evidenceCoverage!.supportsFacts[0],linkedBy:'user'}})
   expect(setLink.ok).toBe(true)
   if(!setLink.ok)throw Error(setLink.message)
   const afterLink=readAggregate(caseId)!
   expect(afterLink.evidenceLinks).toHaveLength(1)
   expect(validateD2GuardSubmission(afterLink,linkA,'compliant',[documentVersionId])).toBeUndefined()
   expect(validateD2GuardSubmission(afterLink,linkB,'compliant',[documentVersionId]))
     .toContain('D2_GENERIC_EVIDENCE_SCOPE_MISSING')
   expect(validateD2GuardSubmission(afterLink,linkA,'compliant',['wrong-or-stale-version']))
     .toContain('D2_GENERIC_EVIDENCE_SCOPE_MISSING')
   emit(id,'registered-evidence.json',{caseId,documentVersionId,links:afterLink.evidenceLinks,
     objectAHasConfirmedSyntheticFact:true,objectBHasConfirmedSyntheticFact:false,materialOnlyNotPermission:true})
   const prep=preparePiReviewRunV2({caseId:'g04-'+id+'-tech',sessionId:'g04-session-'+id,turnId:'g04-turn-'+id})
   const out=submitPiReviewResultV2({binding:{assignmentId:prep.assignmentId,
     sessionId:'g04-session-'+id,caseId:'g04-'+id+'-tech',runId:prep.runId},
     triggeredBy:'user',result:{summary:'合成技术预审：全部待权威来源与有权部门核实',
     checks:real.entity!.mapping.map(m=>({ruleId:m.ruleId,subjectIds:m.subjectId?[m.subjectId]:[],
       status:'awaiting-confirmation' as const,reason:'当前业务对象和政策事实需受控人工确认',
       sourceRefs:[]})),finish:true}})
   expect(out.rejected).toEqual([])
   expect(out.missingChecks).toEqual([])
   const stored=readAggregate('g04-'+id+'-tech')!
   const run=getRunV2('g04-'+id+'-tech',prep.runId)!
   const verified=verifyD2PiRun(stored,run)
   expect(verified).toMatchObject({complete:true,problems:[]})
   emit(id,'d2-plan.json',real.entity)
   emit(id,'pi-run.json',run)
   emit(id,'runtime-summary.json',{status:'TECHNICAL_PENDING_ONLY',commonSha:manifest.commonSha,templateId:s.templateId,
       originalBusinessSha256:manifest.fullBusinessMd.sha256,expectedR:count,subjectCount:plan.subjects.length,
       mappingCount:plan.mapping.length,ruleCount:plan.rules.length,planFingerprint:plan.fingerprint,
       d3TransferFingerprint:exported.fingerprint,piRunId:run.id,piVerified:verified,
       negativeEvidenceIsolation:'PASS',unknownCondition:'PASS',invalidSourceVersion:'PASS',publicationAllowed:false,
       onlineModelAccuracy:'NOT_RUN',hiddenGold:'NOT_READ'})
   console.log('[G04_D4_RUNTIME]',JSON.stringify({template:id,checks:plan.mapping.length,subjects:plan.subjects.length,
     fingerprint:plan.fingerprint,piRun:run.id,complete:verified.complete,publicationAllowed:false}))
  })
 }
})

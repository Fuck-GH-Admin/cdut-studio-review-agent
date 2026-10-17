/** G07 seven actual D1/D3/D2/Pi technical cases; no real policy authority. */
import {afterAll,describe,expect,test} from 'bun:test'
import {createHash} from 'node:crypto'
import {mkdtempSync,readFileSync,writeFileSync,mkdirSync,rmSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join,resolve} from 'node:path'
import type {ReviewAuthoringWorkspaceV1,D2ScenarioSelection,ReviewCaseV2,Actor} from '@profer/shared'
import {validateReviewAuthoringV1} from './review-authoring-v1'
import {exportD3Bundle,importD3Bundle} from './review-d3-module-library'
import {saveReviewAuthoringRevisionV1,getReviewAuthoringRevisionV1,diffReviewAuthoringRevisionsV1} from './review-authoring-store-v1'
import {compileD2RuntimePlan,makeD2CandidateShell,createD2TechnicalCase,verifyD2PiRun} from './review-d2-runtime'
import {validateD2GuardSubmission} from './review-d2-execution-gates'
import {saveAuthoringCandidateDraft} from './template-store'
import {readAggregate} from './case-store-v2'
import {registerMaterial} from './material-service'
import {setEvidenceLink} from './application-service'
import {preparePiReviewRunV2,submitPiReviewResultV2} from './pi-case-review-service'
import {getRunV2} from './run-store-v2'
const root=resolve(import.meta.dir,'../../../../../../docs/design/review-agent/acceptance/d4-g07-build')
const outDir=process.env.D4_G07_OUTPUT_DIR?.trim()
const temp=mkdtempSync(join(tmpdir(),'d4-g07-biz-'))
process.env.PROFER_CONFIG_DIR=join(temp,'config')
mkdirSync(process.env.PROFER_CONFIG_DIR,{recursive:true})
afterAll(()=>rmSync(temp,{recursive:true,force:true}))
const actor:Actor={actorId:'g07-synthetic-reviewer',actorSource:'local',role:'reviewer'}
const get=<T>(id:string,path:string):T=>JSON.parse(readFileSync(join(root,id,path),'utf8')) as T
const save=(id:string,name:string,value:unknown)=>{
 if(!outDir)return
 const folder=join(outDir,id);mkdirSync(folder,{recursive:true})
 writeFileSync(join(folder,name),JSON.stringify(value,null,2)+'\n')
}
const sha256=(x:string)=>createHash('sha256').update(x,'utf8').digest('hex')
const gitBlob=(x:string)=>createHash('sha1').update('blob '+Buffer.byteLength(x,'utf8')+'\0').update(x,'utf8').digest('hex')
const counts:Record<string,number>={T01:32,T02:36,T03:33,T04:36,T05:45,T06:36,T07:42}
describe('G07 complete C mothers -> scoped D1/D3/D2/Pi technical candidates',()=>{
 for(const [id,n] of Object.entries(counts)){
  test(id+': authoring/export/reimport/plan/real Pi/fail-closed',async()=>{
   const meta=get<any>(id,'manifest.json')
   const raw=readFileSync(join(root,id,'source/frozen-C-v0.1.md'),'utf8')
   expect(gitBlob(raw)).toBe(meta.original.gitBlobSha1)
   const ws=get<ReviewAuthoringWorkspaceV1>(id,'workspace/workspace.json')
   const sel=get<D2ScenarioSelection>(id,'fixtures/selection.json')
   const c=get<ReviewCaseV2>(id,'fixtures/case.json')
   const ledger=get<any>(id,'source/coverage-ledger.json')
   expect(ledger.independentRuleIds).toHaveLength(n)
   expect(new Set(ledger.independentRuleIds).size).toBe(n)
   expect(ws.sourceBindings).toHaveLength(ledger.rules.length)
   const errors=validateReviewAuthoringV1(ws)
   expect(errors).toEqual([])
   const savedRevision=saveReviewAuthoringRevisionV1(ws,0,'g07-synthetic-author')
   expect(savedRevision.workspace.revision).toBe(1)
   expect(getReviewAuthoringRevisionV1(ws.workspaceId)?.workspace.sourceBindings.length).toBe(ws.sourceBindings.length)
   const revisedDraft=structuredClone(ws);revisedDraft.revision=2
   expect(diffReviewAuthoringRevisionsV1(ws,revisedDraft)).toBeDefined()
   const exported=exportD3Bundle(ws)
   const imported=importD3Bundle(exported)
   expect(imported.sourceBindings.length).toBe(ws.sourceBindings.length)
   const plan=compileD2RuntimePlan(imported,sel,c)
   expect(plan.schemaVersion).toBe(3)
   expect(plan.subjects).toHaveLength(2)
   expect(plan.publicationAllowed).toBe(false)
   expect(plan.mapping.filter(m=>m.checkId.includes('use-rulebook/r'))).toHaveLength(n*2)
   expect(plan.mapping.every(m=>m.subjectId&&m.objectKey&&m.sourceIds.length)).toBe(true)
   expect(plan.mapping.every(m=>m.authority==='unverified-policy')).toBe(true)
   const bad=structuredClone(sel)
   bad.targets[1]!.subjectId=bad.targets[0]!.subjectId
   expect(()=>compileD2RuntimePlan(imported,bad,c)).toThrow('D2_TARGET_INVALID')
   const missing=structuredClone(sel)
   missing.targets[0]!.conditions!.pop()
   expect(()=>compileD2RuntimePlan(imported,missing,c)).toThrow('D2_GENERIC_CONDITIONS_INCOMPLETE')
   const stale=structuredClone(sel)
   stale.targets[0]!.scenarioSource!.sourceVersionId='wrong-version'
   expect(()=>compileD2RuntimePlan(imported,stale,c)).toThrow('D2_GENERIC_CONDITION_SOURCE_INVALID')
   const unknown=plan.mapping.find(m=>m.applicability==='unknown')
   expect(unknown).toBeDefined()
   saveAuthoringCandidateDraft(makeD2CandidateShell(imported,sel.templateId,sel.version))
   const created=await createD2TechnicalCase({caseId:c.id,title:c.title,actor,workspace:imported,selection:sel})
   expect(created.ok).toBe(true)
   if(!created.ok)throw Error(created.message)
   expect(created.entity!.fingerprint).toBe(plan.fingerprint)
   const file=join(temp,id+'-synthetic.txt')
   writeFileSync(file,'SYNTHETIC TECHNICAL EVIDENCE ONLY; only object A, not B.')
   const prev=readAggregate(c.id)!
   const reg=await registerMaterial(c.id,{requestId:'g07-reg-'+id,actor,
      expectedRevision:prev.caseV2.revision,payload:{sourcePath:file,role:'evidence'}})
   expect(reg.ok).toBe(true)
   if(!reg.ok)throw Error(reg.message)
   const doc=readAggregate(c.id)!.caseV2.documents[0]!.versionId
   const a=plan.mapping.find(m=>m.subjectId===sel.targets[0]!.subjectId&&m.checkId.includes('use-rulebook/r01'))!
   const b=plan.mapping.find(m=>m.subjectId===sel.targets[1]!.subjectId&&m.checkId.includes('use-rulebook/r01'))!
   const after=readAggregate(c.id)!
   const link=await setEvidenceLink(c.id,{requestId:'g07-link-'+id,actor,
      expectedRevision:after.caseV2.revision,
      payload:{documentVersionId:doc,subjectIds:[a.subjectId!],
        supportsFact:a.evidenceCoverage!.supportsFacts[0]!,linkedBy:'user'}})
   expect(link.ok).toBe(true)
   if(!link.ok)throw Error(link.message)
   const linked=readAggregate(c.id)!
   expect(validateD2GuardSubmission(linked,a,'compliant',[doc])).toBeUndefined()
   expect(validateD2GuardSubmission(linked,b,'compliant',[doc])).toContain('D2_GENERIC_EVIDENCE_SCOPE_MISSING')
   expect(validateD2GuardSubmission(linked,a,'compliant',['obsolete-doc'])).toContain('D2_GENERIC_EVIDENCE_SCOPE_MISSING')
   expect(validateD2GuardSubmission(linked,unknown!,'compliant',[])).toContain('APPLICABILITY_UNKNOWN')
   const session='g07-session-'+id,turn='g07-turn-'+id
   const prepared=preparePiReviewRunV2({caseId:c.id,sessionId:session,turnId:turn})
   const result=submitPiReviewResultV2({binding:{assignmentId:prepared.assignmentId,
       sessionId:session,caseId:c.id,runId:prepared.runId},triggeredBy:'user',
       result:{summary:'Synthetic policy-hold review. No official CDUT authority verified.',
         checks:plan.mapping.map(m=>({ruleId:m.ruleId,subjectIds:[m.subjectId!],
           status:'awaiting-confirmation' as const,
           reason:'Frozen author MD policy candidate requires verified source or authorized reviewer',sourceRefs:[]})),
         finish:true}})
   expect(result.rejected).toEqual([])
   expect(result.missingChecks).toEqual([])
   const run=getRunV2(c.id,prepared.runId)!
   const verified=verifyD2PiRun(readAggregate(c.id)!,run)
   expect(verified).toMatchObject({complete:true,problems:[]})
   save(id,'d3-export.json',{d1SavedRevision:savedRevision.workspace.revision,d1Digest:savedRevision.digest,fingerprint:exported.fingerprint,moduleCount:ws.definitions.modules.length,
     importedWorkspaceId:imported.workspaceId,sourceBindings:ws.sourceBindings.length})
   save(id,'d2-plan.json',plan)
   save(id,'pi-run.json',run)
   save(id,'technical-verdict.json',{template:id,status:'PARTIAL',sourceSha256:sha256(raw),
     sourceGitBlob:gitBlob(raw),technicalParent:meta.commonCodeSha,authoringValidation:errors,
     subjects:plan.subjects.length,checks:plan.mapping.length,ruleChecks:n*2,
     d3Fingerprint:exported.fingerprint,d2Fingerprint:plan.fingerprint,piComplete:verified.complete,
     unverifiedPolicy:true,modelAccuracyVerified:false,publicationAllowed:false,
     counterexamples:{duplicateSubject:true,missingConditions:true,staleSource:true,
       evidenceCrossSubjectDenied:true,staleEvidenceDenied:true,unknownConditionDenied:true},
     remaining:meta.knownGaps})
   console.log('[D4_G07_ACTUAL]',JSON.stringify({id,sha256:sha256(raw),
     checks:plan.mapping.length,subjects:plan.subjects.length,piComplete:verified.complete,
     d2:plan.fingerprint,d3:exported.fingerprint,publicationAllowed:false}))
  },180000)
 }
})

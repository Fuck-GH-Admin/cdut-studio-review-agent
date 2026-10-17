import {afterAll, describe, expect, test} from 'bun:test'
import {mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join, resolve} from 'node:path'
import {createHash} from 'node:crypto'
import type {ReviewAuthoringWorkspaceV1,D2ScenarioSelection,ReviewCaseV2,Actor} from '@profer/shared'
import {validateReviewAuthoringV1} from './review-authoring-v1'
import {compileD2RuntimePlan,makeD2CandidateShell,createD2TechnicalCase,verifyD2PiRun} from './review-d2-runtime'
import {validateD2GuardSubmission} from './review-d2-execution-gates'
import {exportD3Bundle,importD3Bundle} from './review-d3-module-library'
import {saveAuthoringCandidateDraft} from './template-store'
import {registerMaterial} from './material-service'
import {setEvidenceLink} from './application-service'
import {readAggregate} from './case-store-v2'
import {preparePiReviewRunV2,submitPiReviewResultV2} from './pi-case-review-service'
import {getRunV2} from './run-store-v2'

const home=mkdtempSync(join(tmpdir(),'d4-g05-tests-'))
process.env.PROFER_CONFIG_DIR=home
afterAll(()=>rmSync(home,{recursive:true,force:true}))
const root=resolve(import.meta.dir,'../../../../../../docs/design/review-agent/acceptance/d4-g05-build')
const base='a7a6a11d4840ad64cfc858c17b35f35180adf063'
const actor:Actor={actorId:'g05-synthetic-reviewer',actorSource:'local',role:'reviewer'}
const ids=[1,2,3,4,5,6].map(n=>'g05-t0'+n)
function load<T>(id:string,name:string):T {
  return JSON.parse(readFileSync(join(root,'templates',id,name),'utf8')) as T
}
function evidence(id:string,name:string,data:unknown){
  const dest=process.env.G05_RUNTIME_EVIDENCE_DIR
  if(!dest)return
  const p=join(dest,'templates',id)
  mkdirSync(p,{recursive:true})
  writeFileSync(join(p,name),JSON.stringify(data,null,2)+'\n')
}
describe('D4 G05 six complete C-source modular candidates / locked COMMON',()=>{
  for(const id of ids){
    test(id+' source SHA, 100% R mapping, D1 validation, D3 transfer, D2 scoped plan',()=>{
      const m=load<any>(id,'manifest.json'),cov=load<any>(id,'coverage.json')
      expect(m.commonBaselineSha).toBe(base)
      const bytes=readFileSync(join(root,'source',m.businessSourceFile))
      expect(createHash('sha256').update(bytes).digest('hex')).toBe(m.businessSha256)
      const ws=load<ReviewAuthoringWorkspaceV1>(id,'workspace.json')
      const sel=load<D2ScenarioSelection>(id,'synthetic-selection.json')
      const cse=load<ReviewCaseV2>(id,'synthetic-case.json')
      expect(cov.ruleCoverage.filter((x:any)=>/^R-\d\d$/.test(x.sourceId))).toHaveLength(m.rawRuleCount)
      expect(ws.sourceBindings).toHaveLength(m.sourceBindingCount)
      expect(ws.definitions.modules).toHaveLength(m.moduleCount)
      expect(validateReviewAuthoringV1(ws)).toEqual([])
      const portable=exportD3Bundle(ws)
      const imported=importD3Bundle(portable)
      expect(validateReviewAuthoringV1(imported)).toEqual([])
      const plan=compileD2RuntimePlan(imported,sel,cse)
      expect(plan.schemaVersion).toBe(3)
      expect(plan.subjects).toHaveLength(2)
      expect(plan.targets).toHaveLength(2)
      expect(plan.mapping.length).toBeGreaterThan(m.rawRuleCount)
      expect(new Set(plan.rules.map(x=>x.id)).size).toBe(plan.rules.length)
      expect(plan.mapping.every(x=>x.sourceIds.length>0)).toBeTrue()
      expect(plan.publicationAllowed).toBeFalse()
      for(const rule of cov.ruleCoverage.filter((x:any)=>/^R-\d\d$/.test(x.sourceId))){
        expect(plan.mapping.some(x=>x.checkId.startsWith(rule.checkId+'#'))).toBeTrue()
      }
      // A changed authority/conditions input must change the fixed plan.
      const unknown=structuredClone(sel)
      const changed=unknown.targets[0]!.conditions![0]!
      changed.applicability='unknown';changed.decidedBy='undetermined'
      expect(compileD2RuntimePlan(imported,unknown,cse).fingerprint).not.toBe(plan.fingerprint)
      const bad=structuredClone(sel)
      bad.targets[0]!.conditions![0]!.sourceVersionId='forged-source-version'
      expect(()=>compileD2RuntimePlan(imported,bad,cse)).toThrow('D2_GENERIC_CONDITION_SOURCE_INVALID')
      const dup=structuredClone(sel)
      dup.targets[1]!.subjectId=dup.targets[0]!.subjectId
      expect(()=>compileD2RuntimePlan(imported,dup,cse)).toThrow('D2_TARGET_INVALID')
      evidence(id,'d2-plan.json',plan)
      evidence(id,'d3-transfer-record.json',{bundleFingerprint:portable.fingerprint,sourceSha256:m.businessSha256,moduleCount:m.moduleCount,imported:true,d1Valid:true})
      console.log('[G05_D1_D3_D2]',JSON.stringify({id,sha:m.businessSha256,checks:plan.mapping.length,subjects:plan.subjects.length,fingerprint:plan.fingerprint}))
    })
  }
  for(const id of ids){
    test(id+' real synthetic material -> scoped EvidenceLink -> Pi service receipt',async()=>{
      const w=load<ReviewAuthoringWorkspaceV1>(id,'workspace.json')
      const s=load<D2ScenarioSelection>(id,'synthetic-selection.json')
      saveAuthoringCandidateDraft(makeD2CandidateShell(w,id,1))
      const caseId=id+'-tech-run'
      const created=await createD2TechnicalCase({caseId,title:id+' synthetic technical pre-review',actor,workspace:w,selection:s})
      expect(created.ok).toBeTrue()
      if(!created.ok)throw Error(created.message)
      const dir=join(home,id);mkdirSync(dir,{recursive:true})
      const src=join(dir,'synthetic-application.txt')
      writeFileSync(src,'SYNTHETIC ONLY. Each application object requires its own distinct evidence and decision. No official CDUT decision.\n')
      const initial=readAggregate(caseId)!
      const reg=await registerMaterial(caseId,{requestId:id+'-register',actor,expectedRevision:initial.caseV2.revision,payload:{sourcePath:src,role:'evidence'}})
      expect(reg.ok).toBeTrue()
      if(!reg.ok)throw Error(reg.message)
      const v=readAggregate(caseId)!.caseV2.documents[0]!.versionId
      const current=readAggregate(caseId)!
      const first=s.targets[0]!,second=s.targets[1]!
      const fact='d2:object:'+first.businessType+':scope'
      const link=await setEvidenceLink(caseId,{requestId:id+'-link-first',actor,expectedRevision:current.caseV2.revision,
        payload:{documentVersionId:v,subjectIds:[first.subjectId],supportsFact:fact,linkedBy:'user'}})
      expect(link.ok).toBeTrue()
      if(!link.ok)throw Error(link.message)
      const agg=readAggregate(caseId)!
      const a=created.entity!.mapping.find(m=>m.subjectId===first.subjectId&&m.applicability==='applicable')!
      const b=created.entity!.mapping.find(m=>m.subjectId===second.subjectId&&m.applicability==='applicable')!
      expect(a).toBeDefined();expect(b).toBeDefined()
      expect(validateD2GuardSubmission(agg,a,'compliant',[v])).toBeUndefined()
      expect(validateD2GuardSubmission(agg,b,'compliant',[v])).toContain('D2_GENERIC_EVIDENCE_SCOPE_MISSING')
      expect(validateD2GuardSubmission(agg,a,'compliant',['stale-doc-v0'])).toContain('D2_GENERIC_EVIDENCE_SCOPE_MISSING')
      const uncertain=created.entity!.mapping.find(m=>m.subjectId===second.subjectId&&m.applicability==='unknown')!
      expect(validateD2GuardSubmission(agg,uncertain,'compliant',[v])).toContain('APPLICABILITY_UNKNOWN')
      const prepared=preparePiReviewRunV2({caseId,sessionId:id+'-session',turnId:id+'-turn'})
      const out=submitPiReviewResultV2({binding:{assignmentId:prepared.assignmentId,sessionId:id+'-session',caseId,runId:prepared.runId},triggeredBy:'user',
        result:{summary:'SYNTHETIC G05. Authority and policy unverified. No official approvals.',
          checks:created.entity!.mapping.map(m=>({ruleId:m.ruleId,subjectIds:m.subjectId?[m.subjectId]:[],
            status:'awaiting-confirmation' as const,reason:'Unverified C business rule and/or subject evidence. Human policy decision required.',sourceRefs:[]})),
          finish:true}})
      expect(out.rejected).toEqual([])
      expect(out.missingChecks).toEqual([])
      const final=readAggregate(caseId)!,run=getRunV2(caseId,prepared.runId)!
      expect(verifyD2PiRun(final,run)).toMatchObject({complete:true,problems:[]})
      evidence(id,'synthetic-pi-run.json',run)
      evidence(id,'synthetic-pi-receipt.json',{caseId,runId:run.id,verified:verifyD2PiRun(final,run),registeredDocumentVersion:v,
        confirmedEvidenceLinks:final.evidenceLinks,negativeCrossObjectEvidence:'REJECTED',publicationAllowed:false,
        policyAuthority:'NOT_VERIFIED',onlineModel:'NOT_RUN',gold:'NOT_ACCESSED'})
      console.log('[G05_PI_TECHNICAL]',JSON.stringify({id,caseId,runId:run.id,checks:run.checks.length,verified:true,publicationAllowed:false}))
    })
  }
})

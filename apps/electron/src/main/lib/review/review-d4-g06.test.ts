import {afterAll,describe,expect,test} from 'bun:test'
import {mkdtempSync,readFileSync,writeFileSync,mkdirSync,rmSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join,resolve} from 'node:path'
import type {ReviewAuthoringWorkspaceV1,D2ScenarioSelection,ReviewCaseV2,Actor,CaseAggregateV2} from '@profer/shared'
import {validateReviewAuthoringV1} from './review-authoring-v1'
import {exportD3Bundle,importD3Bundle} from './review-d3-module-library'
import {compileD2RuntimePlan,makeD2CandidateShell,createD2TechnicalCase,verifyD2PiRun} from './review-d2-runtime'
import {validateD2GuardSubmission} from './review-d2-execution-gates'
import {saveAuthoringCandidateDraft} from './template-store'
import {registerMaterial} from './material-service'
import {setEvidenceLink} from './application-service'
import {readAggregate} from './case-store-v2'
import {preparePiReviewRunV2,submitPiReviewResultV2} from './pi-case-review-service'
import {getRunV2} from './run-store-v2'

const base=resolve(import.meta.dir,'../../../../../../docs/design/review-agent/acceptance/d4-g06-build')
const home=mkdtempSync(join(tmpdir(),'d4-g06-'))
process.env.PROFER_CONFIG_DIR=home
const out=process.env.D4_G06_RUNTIME_DIR
const actor:Actor={actorId:'d4-g06-reviewer',actorSource:'local',role:'reviewer'}
afterAll(()=>rmSync(home,{force:true,recursive:true}))
const read=<T>(id:string,file:string)=>JSON.parse(readFileSync(join(base,id,file),'utf8')) as T
const folder=(id:string)=>{if(!out)return undefined;const dest=join(out,id);mkdirSync(dest,{recursive:true});return dest}
const persist=(id:string,name:string,payload:unknown)=>{const p=folder(id);if(p)writeFileSync(join(p,name),JSON.stringify(payload,null,2)+'\n')}
function ready(n:number){
  const id='G06-T'+String(n).padStart(2,'0')
  return {id,work:read<ReviewAuthoringWorkspaceV1>(id,'workspace.json'),
    sel:read<D2ScenarioSelection>(id,'selection.json'),
    case0:read<ReviewCaseV2>(id,'case.json'),
    manifest:read<Record<string,any>>(id,'manifest.json'),
    catalog:read<Record<string,any>>(id,'source-catalog.json'),
    ledger:read<Record<string,any>>(id,'coverage-ledger.json')}
}
describe('D4-G06 nine real source-derived modular business candidates on COMMON-01/02',()=>{
  for(const n of [1,2,3,4,5,6,7,8,9]){
    test('G06-T'+String(n).padStart(2,'0')+' D1/D3/D2/Pi, two subjects, exact provenance',async()=>{
      const {id,work,sel,case0,manifest,catalog,ledger}=ready(n)
      expect(manifest.technicalBaseline).toBe('a7a6a11d4840ad64cfc858c17b35f35180adf063')
      expect(manifest.publicationAllowed).toBeFalse()
      expect(validateReviewAuthoringV1(work)).toEqual([])
      expect(work.sourceBindings).toHaveLength(manifest.sourceBindings)
      expect(work.definitions.modules).toHaveLength(manifest.modules)
      expect(catalog.atomicRules).toHaveLength(manifest.sourceRuleCount)
      expect(ledger.entries.length).toBe(work.sourceBindings.length)
      for(const r of catalog.atomicRules)expect(ledger.entries.some((e:any)=>e.checkId===r.checkId)).toBeTrue()
      const bundle=exportD3Bundle(work)
      const imported=importD3Bundle(bundle)
      expect(imported).toEqual(work)
      expect(bundle.publicationAllowed).toBeFalse()
      const plan=compileD2RuntimePlan(imported,sel,case0)
      expect(plan.schemaVersion).toBe(3)
      expect(plan.publicationAllowed).toBeFalse()
      expect(plan.subjects).toHaveLength(2)
      expect(plan.mapping.length).toBeGreaterThan(manifest.sourceRuleCount*2)
      expect(new Set(plan.mapping.map(m=>m.ruleId)).size).toBe(plan.mapping.length)
      expect(plan.mapping.every(m=>m.authority==='unverified-policy')).toBeTrue()
      for(const m of plan.mapping) {
        expect(m.objectKey).toBeDefined()
        expect(m.subjectId).toBeDefined()
        expect(plan.subjects.some(s=>s.id===m.subjectId)).toBeTrue()
        expect(m.sourceIds.length).toBeGreaterThan(0)
      }
      const a=sel.targets[0]!,b=sel.targets[1]!
      expect(a.objectKey).not.toBe(b.objectKey)
      expect(a.subjectId).not.toBe(b.subjectId)
      expect(plan.mapping.some(m=>m.subjectId===b.subjectId&&m.applicability==='unknown')).toBeTrue()
      const mutant=structuredClone(sel);mutant.targets[1]!.subjectId=mutant.targets[0]!.subjectId
      expect(()=>compileD2RuntimePlan(work,mutant,case0)).toThrow('D2_TARGET_INVALID')
      const unknown=plan.mapping.find(m=>m.subjectId===b.subjectId&&m.applicability==='unknown')!
      const pseudo={caseV2:{...case0,stage:'reviewing',subjects:plan.subjects,documents:[]},
        d2RuntimePlan:plan,observations:[],evidenceLinks:[]} as unknown as CaseAggregateV2
      expect(validateD2GuardSubmission(pseudo,unknown,'compliant',[])).toContain('APPLICABILITY_UNKNOWN')
      // Actual D2 service / real Pi receipt, not a mocked or reimplemented interpreter.
      saveAuthoringCandidateDraft(makeD2CandidateShell(work,sel.templateId,1))
      const created=await createD2TechnicalCase({caseId:case0.id,title:case0.title,actor,workspace:work,selection:sel})
      expect(created.ok).toBeTrue()
      if(!created.ok)throw Error(created.message)
      expect(created.entity!.fingerprint).toBe(plan.fingerprint)
      const inputPath=join(home,id.toLowerCase()+'-synthetic.txt')
      writeFileSync(inputPath,'SYNTHETIC ONLY: material belongs to object A, not object B. This is not authority proof.')
      const prior=readAggregate(case0.id)!
      const material=await registerMaterial(case0.id,{
        requestId:id.toLowerCase()+'-material',actor,expectedRevision:prior.caseV2.revision,
        payload:{sourcePath:inputPath,role:'evidence'}})
      expect(material.ok).toBeTrue();if(!material.ok)throw Error(material.message)
      const versionId=readAggregate(case0.id)!.caseV2.documents[0]!.versionId
      const afterMaterial=readAggregate(case0.id)!
      const link=await setEvidenceLink(case0.id,{
        requestId:id.toLowerCase()+'-link',actor,expectedRevision:afterMaterial.caseV2.revision,
        payload:{documentVersionId:versionId,subjectIds:[a.subjectId],supportsFact:'d2:object:'+a.businessType+':scope',linkedBy:'user'}})
      expect(link.ok).toBeTrue();if(!link.ok)throw Error(link.message)
      const agg=readAggregate(case0.id)!
      const mapA=plan.mapping.find(m=>m.subjectId===a.subjectId&&m.applicability==='applicable')!
      const mapB=plan.mapping.find(m=>m.subjectId===b.subjectId&&m.applicability==='applicable')!
      expect(validateD2GuardSubmission(agg,mapA,'compliant',[versionId])).toBeUndefined()
      expect(validateD2GuardSubmission(agg,mapB,'compliant',[versionId])).toContain('D2_GENERIC_EVIDENCE_SCOPE_MISSING')
      expect(validateD2GuardSubmission(agg,mapA,'compliant',['obsolete-version'])).toContain('D2_GENERIC_EVIDENCE_SCOPE_MISSING')
      // All business policy is unverified: technical receipt may only say awaiting-confirmation.
      const prepared=preparePiReviewRunV2({caseId:case0.id,sessionId:'g06-session-'+n,turnId:'g06-turn-'+n})
      const submitted=submitPiReviewResultV2({binding:{assignmentId:prepared.assignmentId,
        sessionId:'g06-session-'+n,caseId:case0.id,runId:prepared.runId},
        triggeredBy:'user',result:{summary:'G06 synthetic pre-review: authority and policy not independently verified',
          checks:plan.mapping.map(m=>({ruleId:m.ruleId,subjectIds:[m.subjectId!],
            status:'awaiting-confirmation' as const,reason:'School policy/issuer authority not independently certified',sourceRefs:[]})),finish:true}})
      expect(submitted.rejected).toEqual([])
      expect(submitted.missingChecks).toEqual([])
      const finished=readAggregate(case0.id)!,run=getRunV2(case0.id,prepared.runId)!
      const verified=verifyD2PiRun(finished,run)
      expect(verified).toEqual({complete:true,problems:[]})
      const receipt={templateId:id,base:'a7a6a11d4840ad64cfc858c17b35f35180adf063',
        bundleFingerprint:bundle.fingerprint,roundTripEqual:true,planFingerprint:plan.fingerprint,
        subjects:plan.subjects.map(s=>s.id),checkCount:plan.mapping.length,
        policy:'unverified-policy',runId:run.id,verification:verified,
        scenarioBranches:sel.targets.map(t=>({objectKey:t.objectKey,primary:t.scenario,conditions:t.conditions})),
        evidence:{documentVersionId:versionId,linkedSubject:a.subjectId,unlinkedSubject:b.subjectId,
          aPassesEvidenceGuard:true,bRejectedEvidenceGuard:true,staleVersionRejected:true},
        publicationAllowed:false,onlineLLMRun:false,administrativeApproval:false}
      persist(id,'d2-actual-plan.json',plan)
      persist(id,'pi-actual-run.json',run)
      persist(id,'technical-receipt.json',receipt)
      console.log('[D4_G06_RESULT]',JSON.stringify({template:id,checks:plan.mapping.length,subjects:2,
        fingerprint:plan.fingerprint,run:run.id,complete:verified.complete}))
    },120000)
  }
})

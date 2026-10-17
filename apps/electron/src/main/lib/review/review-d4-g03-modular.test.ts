/**
 * G03 D4: ten full C Markdown candidates -> real D1/D3/D2/Pi technical integration.
 * Synthetic materials only. All school-specific candidates remain awaiting-confirmation.
 */
import {describe,test,expect,afterAll} from 'bun:test'
import {readFileSync,writeFileSync,rmSync,mkdtempSync,mkdirSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join,resolve} from 'node:path'
import type {ReviewAuthoringWorkspaceV1,D2ScenarioSelection,ReviewCaseV2,Actor,CaseAggregateV2} from '@profer/shared'
import {validateReviewAuthoringV1} from './review-authoring-v1'
import {exportD3Bundle,importD3Bundle} from './review-d3-module-library'
import {compileD2RuntimePlan,makeD2CandidateShell,createD2TechnicalCase,verifyD2PiRun} from './review-d2-runtime'
import {validateD2GuardSubmission} from './review-d2-execution-gates'
import {saveAuthoringCandidateDraft} from './template-store'
import {readAggregate} from './case-store-v2'
import {registerMaterial} from './material-service'
import {setEvidenceLink} from './application-service'
import {preparePiReviewRunV2,submitPiReviewResultV2} from './pi-case-review-service'
import {getRunV2} from './run-store-v2'

const HOME=mkdtempSync(join(tmpdir(),'d4-g03-full-'))
process.env.PROFER_CONFIG_DIR=HOME
afterAll(()=>rmSync(HOME,{recursive:true,force:true}))
const root=resolve(import.meta.dir,'../../../../../../docs/design/review-agent/acceptance/d4-g03-build')
const output=process.env.D4_G03_OUTPUT_DIR||join(HOME,'runtime')
mkdirSync(output,{recursive:true})
const catalog=JSON.parse(readFileSync(join(root,'catalog.json'),'utf8')).templates as Array<{id:string,templateId:string,expectedRules:number,sourceSha256:string}>
const actor:Actor={actorId:'g03-d4-reviewer',actorSource:'local',role:'reviewer'}
function load(s:(typeof catalog)[number]){
 const dir=join(root,s.templateId)
 const read=(kind:string)=>JSON.parse(readFileSync(join(dir,kind+'.json'),'utf8'))
 return{workspace:read('workspace') as ReviewAuthoringWorkspaceV1,
   selection:read('selection') as D2ScenarioSelection,
   caseV2:read('case') as ReviewCaseV2,coverage:read('coverage'),manifest:read('manifest')}
}
function write(s:string,file:string,body:unknown){const dir=join(output,s);mkdirSync(dir,{recursive:true});writeFileSync(join(dir,file),JSON.stringify(body,null,2)+'\n')}

describe('G03 D4 complete-source modular technical candidates',()=>{
 test('catalog contains exactly ten independently versioned C Markdown sources',()=>{
  expect(catalog).toHaveLength(10)
  expect(catalog.reduce((n,s)=>n+s.expectedRules,0)).toBe(277)
  expect(new Set(catalog.map(s=>s.templateId)).size).toBe(10)
  expect(catalog.every(s=>/^[0-9a-f]{64}$/.test(s.sourceSha256))).toBe(true)
 })
 for(const spec of catalog){
  test(spec.id+' D1 validate / D3 portable import / D2 exact Subject RuleSpec and UNKNOWN',()=>{
   const {workspace,selection,caseV2,coverage,manifest}=load(spec)
   expect(validateReviewAuthoringV1(workspace)).toEqual([])
   expect(workspace.sharedModuleLocks).toEqual([])
   expect(coverage.ruleIds).toHaveLength(spec.expectedRules)
   expect(coverage.originalRuleCount).toBe(spec.expectedRules)
   expect(coverage.entries.filter((x:{sourceId:string})=>/^R-\d{2}$/.test(x.sourceId))).toHaveLength(spec.expectedRules)
   expect(coverage.nonNumberedSections.length).toBeGreaterThan(5)
   expect(coverage.nonNumberedSections.some((s:{section:string|number})=>s.section==='front')).toBe(true)
   expect(coverage.nonNumberedSections.some((s:{section:string|number})=>s.section==='rule-envelope')).toBe(true)
   expect(workspace.definitions.modules.some(m=>m.moduleId===spec.templateId+'-extra-rule-envelope')).toBe(true)
   expect(manifest.sourceSha256).toBe(spec.sourceSha256)
   expect(manifest.technicalSha).toBe('a7a6a11d4840ad64cfc858c17b35f35180adf063')
   const transfer=exportD3Bundle(workspace)
   expect(transfer.fingerprint).toHaveLength(64)
   const imported=importD3Bundle(transfer)
   expect(imported).toEqual(workspace)
   const plan=compileD2RuntimePlan(imported,selection,caseV2)
   expect(plan.schemaVersion).toBe(3)
   expect(plan.subjects).toHaveLength(2)
   expect(plan.targets).toHaveLength(2)
   expect(plan.mapping.length).toBeGreaterThan(spec.expectedRules*2)
   expect(plan.rules).toHaveLength(plan.mapping.length)
   expect(new Set(plan.rules.map(x=>x.id)).size).toBe(plan.rules.length)
   expect(plan.mapping.every(x=>x.sourceIds.length>0)).toBe(true)
   expect(plan.mapping.every(x=>x.authority==='unverified-policy')).toBe(true)
   expect(plan.mapping.some(x=>x.objectKey==='item-a'&&x.checkId.endsWith('/r01#item-a'))).toBe(true)
   expect(plan.mapping.some(x=>x.objectKey==='item-b'&&x.checkId.endsWith('/r01#item-b'))).toBe(true)
   const conditional=workspace.definitions.templates[0]!.genericScenarioAxes!.conditions[0]!
   const unknown=plan.mapping.find(x=>x.objectKey==='item-b'&&x.checkId.includes('axis-'+conditional))
   expect(unknown?.applicability).toBe('unknown')
   const bad=structuredClone(selection);bad.targets[1]!.subjectId=bad.targets[0]!.subjectId
   expect(()=>compileD2RuntimePlan(workspace,bad,caseV2)).toThrow('D2_TARGET_INVALID')
   const stale=structuredClone(selection);stale.targets[0]!.conditions![0]!.sourceVersionId='obsolete'
   expect(()=>compileD2RuntimePlan(workspace,stale,caseV2)).toThrow('D2_GENERIC_CONDITION_SOURCE_INVALID')
   write(spec.templateId,'compiled-plan.json',plan)
   write(spec.templateId,'transfer-manifest.json',{fingerprint:transfer.fingerprint,sourceSha256:spec.sourceSha256,
    templateId:spec.templateId,ruleCount:spec.expectedRules,checks:plan.mapping.length,subjects:plan.subjects.length})
   console.log('[D4_G03_PLAN]',JSON.stringify({id:spec.id,checks:plan.mapping.length,subjects:2,fingerprint:plan.fingerprint,transfer:transfer.fingerprint}))
  })
  test(spec.id+' real synthetic material registration and Pi pending-only technical run',async()=>{
   const {workspace,selection}=load(spec)
   saveAuthoringCandidateDraft(makeD2CandidateShell(workspace,spec.templateId,1))
   const caseId=spec.templateId+'-live-synth'
   const created=await createD2TechnicalCase({caseId,title:'SYNTHETIC '+spec.id,actor,workspace,selection})
   expect(created.ok).toBe(true)
   if(!created.ok)throw Error(created.message)
   const materialPath=join(HOME,spec.templateId+'-applicant.txt')
   writeFileSync(materialPath,'SYNTHETIC APPLICATION: A requests a scoped action for this case. B has different evidence and approval status. Neither is school-authorized.')
   const before=readAggregate(caseId)!
   const registered=await registerMaterial(caseId,{requestId:spec.templateId+'-material',actor,expectedRevision:before.caseV2.revision,
     payload:{sourcePath:materialPath,role:'evidence'}})
   expect(registered.ok).toBe(true)
   if(!registered.ok)throw Error(registered.message)
   const version=readAggregate(caseId)!.caseV2.documents[0]!.versionId
   const isolationRule=spec.id==='G03-T06'?'/r02#':'/r01#'
   const factA=created.entity!.mapping.find(x=>x.objectKey==='item-a'&&x.checkId.includes(isolationRule))!
   const factB=created.entity!.mapping.find(x=>x.objectKey==='item-b'&&x.checkId.includes(isolationRule))!
   expect(factA).toBeDefined();expect(factB).toBeDefined()
   const prior=readAggregate(caseId)!
   const linked=await setEvidenceLink(caseId,{requestId:spec.templateId+'-link-a',
     actor,expectedRevision:prior.caseV2.revision,payload:{documentVersionId:version,
     subjectIds:[factA.subjectId!],supportsFact:factA.evidenceCoverage!.supportsFacts[0]!,linkedBy:'user'}})
   expect(linked.ok).toBe(true)
   if(!linked.ok)throw Error(linked.message)
   const agg=readAggregate(caseId)!
   expect(validateD2GuardSubmission(agg,factA,'compliant',[version])).toBeUndefined()
   expect(validateD2GuardSubmission(agg,factB,'compliant',[version])).toContain('GENERIC_EVIDENCE_SCOPE_MISSING')
   expect(validateD2GuardSubmission(agg,factA,'compliant',['stale-file'])).toContain('GENERIC_EVIDENCE_SCOPE_MISSING')
   const prepared=preparePiReviewRunV2({caseId,sessionId:spec.templateId+'-session',turnId:'g03-d4-turn'})
   const result=submitPiReviewResultV2({binding:{assignmentId:prepared.assignmentId,sessionId:spec.templateId+'-session',caseId,runId:prepared.runId},
    triggeredBy:'user',result:{summary:'SYNTHETIC technical review: verified business authority not supplied.',
      checks:created.entity!.mapping.map(m=>({ruleId:m.ruleId,
       subjectIds:m.subjectId?[m.subjectId]:created.entity!.subjects.map(x=>x.id),
       status:'awaiting-confirmation' as const,reason:'C candidate source not independently authorized under active CDUT policy',
       sourceRefs:[]})),finish:true}})
   expect(result.rejected).toEqual([])
   expect(result.missingChecks).toEqual([])
   const updated=readAggregate(caseId)!,run=getRunV2(caseId,prepared.runId)!
   expect(verifyD2PiRun(updated,run)).toEqual({complete:true,problems:[]})
   write(spec.templateId,'pi-run.json',run)
   write(spec.templateId,'pi-receipt.json',{caseId,runId:run.id,planFingerprint:created.entity!.fingerprint,
     evidenceVersion:version,subjectEvidenceLinks:updated.evidenceLinks,accepted:result.accepted,
     rejected:result.rejected,missingChecks:result.missingChecks,verified:verifyD2PiRun(updated,run),
     publicationAllowed:false,officialApproval:false})
   console.log('[D4_G03_PI]',JSON.stringify({id:spec.id,caseId,runId:run.id,accepted:result.accepted,checks:run.checks.length,
    planFingerprint:created.entity!.fingerprint,technicalComplete:true,officialApproval:false}))
  })
 }
})

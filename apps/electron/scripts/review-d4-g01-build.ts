/**
 * G01 D4 full-domain synthetic technical pre-review runner.
 * Uses the fixed COMMON-01/02 public D1/D3/D2/Pi entry points, never an alternate engine.
 * It does not access real school records or independent Gold.
 */
import { readFileSync,writeFileSync,mkdirSync,mkdtempSync,rmSync } from 'node:fs'
import { resolve,join } from 'node:path'
import {tmpdir} from 'node:os'
import type {ReviewAuthoringWorkspaceV1,D2ScenarioSelection,ReviewCaseV2,D2TrustedStudentSnapshotV1,Actor,CaseAggregateV2} from '@profer/shared'
import {validateReviewAuthoringV1} from '../src/main/lib/review/review-authoring-v1'
import {exportD3Bundle,importD3Bundle} from '../src/main/lib/review/review-d3-module-library'
import {compileD2RuntimePlan,makeD2CandidateShell,createD2TechnicalCase,verifyD2PiRun} from '../src/main/lib/review/review-d2-runtime'
import {saveAuthoringCandidateDraft} from '../src/main/lib/review/template-store'
import {readAggregate} from '../src/main/lib/review/case-store-v2'
import {preparePiReviewRunV2,submitPiReviewResultV2} from '../src/main/lib/review/pi-case-review-service'
import {getRunV2} from '../src/main/lib/review/run-store-v2'
import {registerMaterial} from '../src/main/lib/review/material-service'
import {setEvidenceLink} from '../src/main/lib/review/application-service'
import {validateD2GuardSubmission} from '../src/main/lib/review/review-d2-execution-gates'

if(!process.env.PROFER_CONFIG_DIR)throw Error('D4_ISOLATED_CONFIG_REQUIRED: PROFER_CONFIG_DIR')
const repoRoot=resolve(import.meta.dir,'../../../..')
const root=resolve(repoRoot,'docs/design/review-agent/acceptance/d4-g01-build')
const logRoot=process.env.D4_G01_EVIDENCE_DIR||resolve(root,'runtime-evidence')
mkdirSync(logRoot,{recursive:true})
const actor:Actor={actorId:'d4-g01-synthetic-reviewer',actorSource:'local',role:'reviewer'}
const snapshot=(dir:string,name:string)=>JSON.parse(readFileSync(resolve(root,dir,name),'utf8'))
const out=(path:string,value:unknown)=>{mkdirSync(resolve(logRoot,path,'..'),{recursive:true});writeFileSync(resolve(logRoot,path),JSON.stringify(value,null,2)+'\n')}
const makeCase=(key:string,s:D2ScenarioSelection):ReviewCaseV2=>({
  id:'d4-g01-'+key.toLowerCase()+'-case',templateId:s.templateId,templateVersion:s.version,title:'G01 '+key+' 受控合成技术预审',
  objectType:'document',caseFields:{},subjects:[],documents:[],stage:'draft',revision:0,
  createdAt:'2026-10-17T00:00:00Z',updatedAt:'2026-10-17T00:00:00Z'
})
const report:{key:string;d1:boolean;d3:boolean;d2:boolean;pi:boolean;checks:number;subjects:number;planFingerprint:string;runId:string;negatives:Record<string,string>;publicationAllowed:boolean}[]=[]
for(const key of ['I','A','C','S','P'] as const){
  const ws=key==='I'?snapshot('I','workspace/workspace.json') as ReviewAuthoringWorkspaceV1:snapshot(key,'workspace.json') as ReviewAuthoringWorkspaceV1
  const selection=key==='I'?(snapshot('I','fixtures/selections.json').two as D2ScenarioSelection):snapshot(key,'selection.json') as D2ScenarioSelection
  const registry=key==='I'?snapshot('I','fixtures/controlled-registry.json') as D2TrustedStudentSnapshotV1:undefined
  const issues=validateReviewAuthoringV1(ws)
  if(issues.length)throw Error(key+' D1_FAILED: '+issues.slice(0,25).join(' | '))
  const transfer=exportD3Bundle(ws),imported=importD3Bundle(transfer)
  if(JSON.stringify(imported)!==JSON.stringify(ws))throw Error(key+' D3_IMPORT_CHANGED_WORKSPACE')
  const testCase=makeCase(key,selection)
  const planned=compileD2RuntimePlan(imported,selection,testCase,registry)
  if(!planned.mapping.length||!planned.rules.length)throw Error(key+' D2_EMPTY')
  if(key!=='I'&&(planned.schemaVersion!==3||planned.subjects.length!==2))throw Error(key+' D2_GENERIC_SCOPE_BROKEN')
  if(key==='I'&&(planned.schemaVersion!==2||planned.subjects.length!==2))throw Error('I D2_STUDENT_SCOPE_BROKEN')
  out(key+'/actual-plan.json',planned)
  out(key+'/authoring-and-transfer.json',{workspaceId:ws.workspaceId,revision:ws.revision,modules:ws.definitions.modules.length,
    sourceBindings:ws.sourceBindings.length,checks:planned.mapping.length,subjects:planned.subjects.map(s=>s.id),
    transferFingerprint:transfer.fingerprint,planFingerprint:planned.fingerprint,mode:planned.mode})
  saveAuthoringCandidateDraft(makeD2CandidateShell(imported,selection.templateId,selection.version))
  const id='d4-g01-'+key.toLowerCase()+'-technical-'+process.pid
  const created=await createD2TechnicalCase({caseId:id,title:'G01 '+key+' synthetic',actor,workspace:imported,selection,
    ...(registry?{trustedStudentSnapshot:registry}:{})})
  if(!created.ok)throw Error(key+' D2_CREATE: '+created.code+' / '+created.message)
  if(created.entity?.fingerprint!==planned.fingerprint)throw Error(key+' D2_FINGERPRINT_CHANGED')
  let evidence:any=null
  let neg:Record<string,string>={}
  if(key!=='I'){
    const tmp=mkdtempSync(join(tmpdir(),'d4-g01-mat-'+key.toLowerCase()+'-'))
    try{
      const matPath=join(tmp,'synthetic.txt')
      writeFileSync(matPath,'SYNTHETIC ONLY: controlled material for object A; object B not authorized.')
      const before=readAggregate(id)!
      const reg=await registerMaterial(id,{requestId:'d4-'+key+'-mat',actor,expectedRevision:before.caseV2.revision,
        payload:{sourcePath:matPath,role:'evidence'}})
      if(!reg.ok)throw Error(key+' REGISTER_MATERIAL: '+reg.message)
      const after=readAggregate(id)!,docVersion=after.caseV2.documents[0]?.versionId
      if(!docVersion)throw Error(key+' DOCUMENT_VERSION_MISSING')
      const mapsA=planned.mapping.filter(m=>m.subjectId===planned.subjects[0]!.id&&m.applicability!=='unknown'&&m.applicability!=='not-applicable')
      const mapsB=planned.mapping.filter(m=>m.subjectId===planned.subjects[1]!.id&&m.applicability!=='unknown'&&m.applicability!=='not-applicable')
      const mapA=mapsA.find(m=>mapsB.some(n=>n.checkId.split('#')[0]===m.checkId.split('#')[0]))
      const mapB=mapsB.find(m=>mapA&&m.checkId.split('#')[0]===mapA.checkId.split('#')[0])
      if(mapA&&mapB&&mapA.evidenceCoverage?.supportsFacts?.length){
        const fact=mapA.evidenceCoverage.supportsFacts[0]!
        const linked=await setEvidenceLink(id,{requestId:'d4-'+key+'-link-a',actor,
          expectedRevision:after.caseV2.revision,payload:{documentVersionId:docVersion,
          subjectIds:[mapA.subjectId!],supportsFact:fact,linkedBy:'user'}})
        if(!linked.ok)throw Error(key+' LINK_EVIDENCE: '+linked.message)
        const agg=readAggregate(id)!
        neg={aValid:String(validateD2GuardSubmission(agg,mapA,'compliant',[docVersion])??'ACCEPTED'),
          bCannotBorrow:String(validateD2GuardSubmission(agg,mapB,'compliant',[docVersion])??'WRONG_ACCEPTED'),
          aStaleDocument:String(validateD2GuardSubmission(agg,mapA,'compliant',['retired-version'])??'WRONG_ACCEPTED'),
          unknownCannotPass:String(validateD2GuardSubmission(agg,planned.mapping.find(m=>m.applicability==='unknown')??mapB,'compliant',[docVersion])??'WRONG_ACCEPTED')}
        if(neg.bCannotBorrow==='WRONG_ACCEPTED'||neg.aStaleDocument==='WRONG_ACCEPTED')throw Error(key+' CROSS_OBJECT_EVIDENCE_LEAK')
        evidence={documentVersionId:docVersion,linkedSubject:mapA.subjectId,unlinkedSubject:mapB.subjectId,
          fact,links:agg.evidenceLinks,negativeResults:neg}
      }else{
        evidence={documentVersionId:docVersion,status:'NO_COMPARABLE_CHECK_FOR_DUAL_SCENARIO',negativeResults:neg}
      }
    }finally{rmSync(tmp,{recursive:true,force:true})}
  }
  const prepared=preparePiReviewRunV2({caseId:id,sessionId:'d4-g01-'+key+'-session',turnId:'d4-g01-'+key+'-turn'})
  const result=submitPiReviewResultV2({binding:{assignmentId:prepared.assignmentId,
      sessionId:'d4-g01-'+key+'-session',caseId:id,runId:prepared.runId},triggeredBy:'user',
    result:{summary:'Synthetic G01 '+key+' candidate: all authority/real-world claims pending independent confirmation',
      checks:created.entity!.mapping.map(m=>({
        ruleId:m.ruleId,subjectIds:m.subjectId?[m.subjectId]:[],status:'awaiting-confirmation' as const,
        reason:'真实制度与材料真实性未认证；本回执仅检验D2/Pi受控技术路径',sourceRefs:[],
      })),finish:true}})
  if(result.rejected.length||result.missingChecks.length)
    throw Error(key+' PI_REJECTED: '+JSON.stringify({rejected:result.rejected,missing:result.missingChecks}).slice(0,3500))
  const aggregate=readAggregate(id)!,run=getRunV2(id,prepared.runId)!
  const verified=verifyD2PiRun(aggregate,run)
  if(!verified.complete||verified.problems.length)throw Error(key+' PI_VERIFY_FAILED: '+verified.problems.join('; '))
  out(key+'/pi-run.json',run)
  out(key+'/pi-receipt.json',{caseId:id,runId:run.id,fingerprint:planned.fingerprint,verified,
    checks:run.checks.length,publicationAllowed:false,administrativeApproval:false,
    onlineModelRun:false,syntheticOnly:true,evidence})
  report.push({key,d1:true,d3:true,d2:true,pi:true,checks:planned.mapping.length,subjects:planned.subjects.length,
    planFingerprint:planned.fingerprint,runId:run.id,negatives:neg,publicationAllowed:false})
  console.log('[D4_G01_TECHNICAL]',JSON.stringify(report.at(-1)))
}
out('summary.json',{technicalParentSha:'a7a6a11d4840ad64cfc858c17b35f35180adf063',
  source:'G01 immutable Markdown archival files',policyAuthority:'NOT_VERIFIED',hiddenGold:'UNREAD',
  onlineModel:'NOT_RUN',formalApproval:false,templates:report})

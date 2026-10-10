/**
 * Independent Agent A: actual D2/Pi service interface exercise on three synthetic text
 * samples with explicitly predeclared statuses. No online model is queried.
 * This measures source-ref/coverage/receipt invariants, NOT model accuracy.
 */
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import type { Actor, D2ScenarioSelection, ReviewAuthoringWorkspaceV1 } from '@profer/shared'
import { createD2TechnicalCase, makeD2CandidateShell, verifyD2PiRun, verifyD2InstalledPlan } from '../../../../../../../apps/electron/src/main/lib/review/review-d2-runtime'
import { saveAuthoringCandidateDraft } from '../../../../../../../apps/electron/src/main/lib/review/template-store'
import { readAggregate } from '../../../../../../../apps/electron/src/main/lib/review/case-store-v2'
import { registerMaterial } from '../../../../../../../apps/electron/src/main/lib/review/material-service'
import { preparePiReviewRunV2, submitPiReviewResultV2 } from '../../../../../../../apps/electron/src/main/lib/review/pi-case-review-service'
import { getRunV2 } from '../../../../../../../apps/electron/src/main/lib/review/run-store-v2'

const home=mkdtempSync(join(tmpdir(),'d3-10-agent-a-pi-'))
process.env.PROFER_CONFIG_DIR=join(home,'isolated-config')
mkdirSync(process.env.PROFER_CONFIG_DIR,{recursive:true})
const root=resolve(import.meta.dir,'..')
const read=<T>(file:string):T=>JSON.parse(readFileSync(join(root,file),'utf8')) as T
const workspace=read<ReviewAuthoringWorkspaceV1>('workspaces/modified.json')
const selection=read<D2ScenarioSelection>('tests/selection.json')
const cases=read<Array<{id:string;text:string;expected:'compliant'|'non-compliant'|'needs-confirmation';rationale:string}>>('tests/cases.json')
const actor:Actor={actorId:'agent-a-independent-author',actorSource:'local',role:'reviewer'}
function ensure(assertion:unknown,message:string):asserts assertion {if(!assertion) throw new Error('AGENT_A_PI_ASSERTION_FAILED: '+message)}
async function main(){
  ensure(workspace.definitions.modules.length===0,'No shared modules should be required')
  saveAuthoringCandidateDraft(makeD2CandidateShell(workspace,selection.templateId,selection.version))
  const actual=[]
  for (const sample of cases){
    const caseId='agent-a-pi-'+sample.id
    const created=await createD2TechnicalCase({caseId,title:'Agent A synthetic '+sample.id,actor,workspace,selection})
    ensure(created.ok,'technical case creation failed '+sample.id)
    ensure(created.entity.mapping.length===1 && created.entity.rules.length===1,'lost a natural-language duty')
    ensure(verifyD2InstalledPlan(readAggregate(caseId)!).length===0,'invalid fixed runtime plan')
    const material=join(home,sample.id+'.txt')
    writeFileSync(material,sample.text+'\n','utf8')
    const prior=readAggregate(caseId)!
    const registered=await registerMaterial(caseId,{
      requestId:'agent-a-material-'+sample.id,actor,expectedRevision:prior.caseV2.revision,
      payload:{sourcePath:material,role:'evidence'},
    })
    ensure(registered.ok,'text material registration failed '+sample.id)
    const document=readAggregate(caseId)!.caseV2.documents[0]
    ensure(document?.versionId && document?.contentHash,'no material version/hash '+sample.id)
    const block=document.blocks.find(b=>b.kind!=='image')
    ensure(block?.blockId,'no parsed text block '+sample.id)
    const src={documentVersionId:document.versionId,blockId:block.blockId,quote:sample.id==='negative'?'待填写':'摘要'}
    const prep=preparePiReviewRunV2({caseId,sessionId:'agent-a-session-'+sample.id,turnId:'agent-a-turn-'+sample.id})
    ensure(prep.userMessage.includes('D2 固定技术预审包'),'Pi instructions lack D2 plan label')
    ensure(prep.userMessage.includes('非空') && prep.userMessage.includes('摘要') && prep.userMessage.includes('正文') && prep.userMessage.includes('结论'),'edited natural-language duty not in actual Pi task')
    const binding={assignmentId:prep.assignmentId,sessionId:'agent-a-session-'+sample.id,caseId,runId:prep.runId}
    const m=created.entity.mapping[0]
    let rejectedUnsafeStatus=false
    if (sample.id==='positive'){
      const wrong=submitPiReviewResultV2({binding,triggeredBy:'user',result:{
        summary:'negative control: compliant without any SourceRef MUST be refused',
        checks:[{ruleId:m.ruleId,subjectIds:[],status:'compliant',reason:'故意漏掉材料出处',sourceRefs:[]}],
        finish:true,
      }})
      rejectedUnsafeStatus=wrong.rejected.length>0
      ensure(rejectedUnsafeStatus,'unreferenced compliant wrongly accepted')
    }
    const intendedStatus=sample.expected==='needs-confirmation'?'awaiting-confirmation':sample.expected
    const submitted=submitPiReviewResultV2({binding,triggeredBy:'user',result:{
      summary:'Agent A synthetic structured tool receipt, not a model-produced answer: '+sample.id,
      checks:[{ruleId:m.ruleId,subjectIds:[],status:intendedStatus,reason:'Synthetic predeclared GOLD: '+sample.rationale,
        sourceRefs:intendedStatus==='awaiting-confirmation'?[]:[src]}],finish:true,
    }})
    ensure(submitted.rejected.length===0,'Pi synthetic structured receipt rejected: '+sample.id+': '+JSON.stringify(submitted.rejected))
    ensure(submitted.status==='completed','Pi synthetic review did not complete '+sample.id)
    const aggregate=readAggregate(caseId)!
    const finished=getRunV2(caseId,prep.runId)!
    const verify=verifyD2PiRun(aggregate,finished)
    ensure(verify.complete && verify.problems.length===0,'Pi runtime verification failed '+sample.id+': '+verify.problems.join(';'))
    const result=finished.checks.find(check=>check.ruleId===m.ruleId)
    ensure(result?.status===intendedStatus,'recorded check status not intended synthetic status')
    actual.push({id:sample.id,independentExpected:sample.expected,submittedSyntheticStatus:intendedStatus,
      observedServiceStatus:result.status,runStatus:finished.status,sourceRefCount:result.sourceRefs.length,
      documentVersionId:document.versionId,checkId:m.checkId,ruleId:m.ruleId,runId:prep.runId,
      rejectedSourceLessCompliant:sample.id==='positive'?rejectedUnsafeStatus:null,
      verifiedD2PiRun:verify.complete,onlineModelRun:'not-run',classificationIsModelInferred:false})
  }
  const file=process.argv[2] ?? join(root,'tests/pi-structured-results.json')
  writeFileSync(file,JSON.stringify({codeParent:'d16f047af653f7ba259456807c1fc150e9d0f417',
    execution:'actual Pi service backend with synthetic predeclared submissions',
    onlineModelRun:'not-run',isolation:'fresh mkdtemp config',cases:actual},null,2)+'\n','utf8')
  console.log(JSON.stringify({ok:true,syntheticStructuredServiceCases:actual.length,
    sourceLessCompliantRejected:actual[0]?.rejectedSourceLessCompliant,onlineModelRun:'not-run'},null,2))
}
try{await main()}finally{rmSync(home,{recursive:true,force:true})}

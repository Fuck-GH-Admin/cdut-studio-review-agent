/**
 * P2 small, model-free author acceptance demonstrating 3 independent D2/Pi Checks.
 * Uses REAL existing Pi services, but predeclared GOLD statuses, never an online model.
 */
import { mkdirSync,mkdtempSync,readFileSync,writeFileSync,rmSync } from 'node:fs'
import { join,resolve } from 'node:path'
import { tmpdir } from 'node:os'
import type { Actor,D2ScenarioSelection,ReviewAuthoringWorkspaceV1 } from '@profer/shared'
import { createD2TechnicalCase,makeD2CandidateShell,verifyD2PiRun } from '../../../../../../../apps/electron/src/main/lib/review/review-d2-runtime'
import { saveAuthoringCandidateDraft } from '../../../../../../../apps/electron/src/main/lib/review/template-store'
import { readAggregate } from '../../../../../../../apps/electron/src/main/lib/review/case-store-v2'
import { registerMaterial } from '../../../../../../../apps/electron/src/main/lib/review/material-service'
import { preparePiReviewRunV2,submitPiReviewResultV2 } from '../../../../../../../apps/electron/src/main/lib/review/pi-case-review-service'
import { getRunV2 } from '../../../../../../../apps/electron/src/main/lib/review/run-store-v2'
const home=mkdtempSync(join(tmpdir(),'d3-agent-a-granular-pi-'))
process.env.PROFER_CONFIG_DIR=join(home,'config');mkdirSync(process.env.PROFER_CONFIG_DIR,{recursive:true})
const base=resolve(import.meta.dir,'..')
const read=<T>(p:string):T=>JSON.parse(readFileSync(join(base,p),'utf8')) as T
const ws=read<ReviewAuthoringWorkspaceV1>('workspaces/granular-revision-3.json')
const selection=read<D2ScenarioSelection>('tests/selection.json')
const cases=read<{id:string;text:string}[]>('tests/cases.json')
const gold=read<{id:string;expectedByCheck:Record<string,string>}[]>('tests/granularity-expected.json')
const actor:Actor={actorId:'agent-a-p2-author',actorSource:'local',role:'reviewer'}
const headingOf:Record<string,string>={'local/abstract-completeness':'摘要','local/body-completeness':'正文','local/conclusion-completeness':'结论'}
const ensure=(yes:unknown,reason:string):void=>{if(!yes)throw Error('AGENT_A_P2_ASSERTION: '+reason)}
async function main(){
  saveAuthoringCandidateDraft(makeD2CandidateShell(ws,selection.templateId,selection.version))
  const out=[]
  for(const sample of cases){
    const caseId='agent-a-p2-'+sample.id
    const created=await createD2TechnicalCase({caseId,title:'P2 independent checks '+sample.id,actor,workspace:ws,selection})
    ensure(created.ok,'cannot create '+sample.id)
    if(!created.ok)continue
    ensure(created.entity.mapping.length===3 && created.entity.rules.length===3,'expected exactly three Check/Rule')
    const path=join(home,sample.id+'.txt')
    writeFileSync(path,sample.text+'\n','utf8')
    const reg=await registerMaterial(caseId,{requestId:'p2-register-'+sample.id,actor,
      expectedRevision:readAggregate(caseId)!.caseV2.revision,payload:{sourcePath:path,role:'evidence'}})
    ensure(reg.ok,'material registration '+sample.id)
    const doc=readAggregate(caseId)!.caseV2.documents[0]
    ensure(doc?.parseStatus==='parsed','text not parsed '+sample.id)
    const prepared=preparePiReviewRunV2({caseId,sessionId:'p2-session-'+sample.id,turnId:'p2-turn-'+sample.id})
    ensure(Object.values(headingOf).every(h=>prepared.userMessage.includes(h)),'one of the three semantic duties did not reach Pi prompt')
    const expected=gold.find(x=>x.id===sample.id)?.expectedByCheck
    ensure(expected,'missing predeclared GOLD '+sample.id)
    const checks=created.entity.mapping.map(m=>{
      const status=expected![m.checkId]
      ensure(status,'missing status '+m.checkId)
      const heading=headingOf[m.checkId]
      ensure(heading,'unknown check '+m.checkId)
      const headIdx=doc.blocks.findIndex(b=>b.text===heading)
      ensure(headIdx>=0,'missing heading block '+heading)
      const body=doc.blocks[headIdx+1]
      ensure(body && body.kind!=='image','missing body block '+heading)
      const sourceRefs=status==='awaiting-confirmation'?[]:[{
        documentVersionId:doc.versionId,blockId:body.blockId,quote:body.text.slice(0,24)}]
      return {ruleId:m.ruleId,subjectIds:[],status:status as 'compliant'|'non-compliant'|'awaiting-confirmation',
        reason:'SYNTHETIC predeclared GOLD for '+heading+'; independent evidence and unknown status only',
        sourceRefs}
    })
    const binding={assignmentId:prepared.assignmentId,sessionId:'p2-session-'+sample.id,caseId,runId:prepared.runId}
    const submit=submitPiReviewResultV2({binding,triggeredBy:'user',result:{
      summary:'Independent three-check synthetic receipt, not model classification',checks,finish:true}})
    ensure(submit.rejected.length===0,'Pi rejected valid split checks: '+JSON.stringify(submit.rejected))
    ensure(submit.status==='completed','Pi did not complete '+sample.id)
    const run=getRunV2(caseId,prepared.runId)!
    const verify=verifyD2PiRun(readAggregate(caseId)!,run)
    ensure(verify.complete,'D2 verifier failed: '+JSON.stringify(verify.problems))
    ensure(run.checks.length===3,'run did not preserve 3 independent checks')
    const rows=created.entity.mapping.map(m=>{
      const recorded=run.checks.find(x=>x.ruleId===m.ruleId)
      ensure(recorded?.status===expected![m.checkId],'per-duty result not conserved: '+m.checkId)
      return {checkId:m.checkId,ruleId:m.ruleId,expected:expected![m.checkId],observed:recorded?.status,
        sourceRefCount:recorded?.sourceRefs.length,materialVersionId:doc.versionId}
    })
    out.push({caseId,runId:prepared.runId,verified:verify.complete,checks:rows})
  }
  ensure(out.length===3,'missing scenario')
  const result={codeParent:'d16f047af653f7ba259456807c1fc150e9d0f417',
    scope:'real Pi service, model-free synthetic statuses',onlineModelRun:'not-run',independentCases:out}
  const output=process.argv[2]??join(base,'tests/granularity-results.json')
  writeFileSync(output,JSON.stringify(result,null,2)+'\n','utf8')
  console.log(JSON.stringify({ok:true,independentCases:out.length,checkCount:out.reduce((n,v)=>n+v.checks.length,0),onlineModelRun:'not-run'},null,2))
}
try{await main()}finally{rmSync(home,{recursive:true,force:true})}

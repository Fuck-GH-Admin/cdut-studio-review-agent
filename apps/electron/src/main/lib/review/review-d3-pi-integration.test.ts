/**
 * D3 W3 cross-business REAL Pi tool interface test.
 * The material and tool result are synthetic; no online model or university approval.
 */
import { afterAll, describe, expect, test } from 'bun:test'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import type {
  Actor, D2ScenarioSelection, ReviewAuthoringWorkspaceV1, ReviewD3TransferBundle,
} from '@profer/shared'
import { importD3Bundle } from './review-d3-module-library'
import { createD2TechnicalCase, makeD2CandidateShell, verifyD2PiRun, verifyD2InstalledPlan } from './review-d2-runtime'
import { saveAuthoringCandidateDraft } from './template-store'
import { readAggregate } from './case-store-v2'
import { registerMaterial } from './material-service'
import { setEvidenceLink } from './application-service'
import { preparePiReviewRunV2, submitPiReviewResultV2 } from './pi-case-review-service'
import { getRunV2 } from './run-store-v2'
import { decideWorkspaceCaseV2 } from './workspace-business-service-v2'

const folder=mkdtempSync(join(tmpdir(),'d3-w3-pi-'))
const config=join(folder,'config')
const output=join(folder,'handoff')
mkdirSync(config,{recursive:true})
process.env.PROFER_CONFIG_DIR=config
afterAll(()=>rmSync(folder,{recursive:true,force:true}))
const fixture=resolve(import.meta.dir,'../../../../../../docs/design/review-agent/fixtures')
const actor:Actor={actorId:'d3-w3-technical-reviewer',actorSource:'local',role:'reviewer'}
const load=<T>(path:string):T=>JSON.parse(readFileSync(path,'utf8')) as T
const selection=<T>(name:string):T=>load(join(fixture,name))
let counter=0
function registerContent(id:string,content:string) {
  const file=join(folder,'source-'+(++counter)+'.txt')
  writeFileSync(file,content)
  return file
}
async function register(id:string,sourcePath:string) {
  const current=readAggregate(id)!
  const result=await registerMaterial(id,{
    requestId:'d3-material-'+id,actor,expectedRevision:current.caseV2.revision,
    payload:{sourcePath,role:'evidence'},
  })
  if(!result.ok)throw new Error(result.message)
  const doc=readAggregate(id)!.caseV2.documents[0]!
  const block=doc.blocks.find(b=>b.kind!=='image')!
  return {documentVersionId:doc.versionId,blockId:block.blockId,quote:'已提供'}
}

describe('D3 W3：冻结 B01/B02 组合通过真实 Pi 材料与回执边界',()=>{
  test('复用后的 C family 和 A archive 均可建技术案卷并实际提交 Pi 回执，且未认证的审批必须保持待核',async()=>{
    const script=resolve(import.meta.dir,'../../../../scripts/review-d3-handoff-demo.ts')
    const proc=Bun.spawnSync({cmd:[process.execPath,script,output],env:{...process.env,PROFER_CONFIG_DIR:config}})
    expect(proc.exitCode).toBe(0)
    if(proc.exitCode!==0)throw new Error(proc.stderr.toString())
    const campus=importD3Bundle(load<ReviewD3TransferBundle>(join(output,'campus-bundle.json')))
    const archive=importD3Bundle(load<ReviewD3TransferBundle>(join(output,'archive-bundle.json')))
    expect(campus.sharedModuleLocks).toHaveLength(2)
    expect(archive.sharedModuleLocks).toHaveLength(2)

    const family=selection<D2ScenarioSelection>('d2-selection-family.json')
    saveAuthoringCandidateDraft(makeD2CandidateShell(campus,'special-campus-card',1))
    const cId='d3-w3-family'
    const cCreated=await createD2TechnicalCase({
      caseId:cId,title:'家属卡局部技术核验',actor,workspace:campus,selection:family,
    })
    expect(cCreated.ok).toBeTrue()
    if(!cCreated.ok)throw new Error(cCreated.message)
    expect(verifyD2InstalledPlan(readAggregate(cId)!)).toEqual([])
    const cRef=await register(cId,registerContent(cId,'合成家属关系证明已提供，但校方发卡资格未核实。'))
    const cRun=preparePiReviewRunV2({caseId:cId,sessionId:'d3-pi-family',turnId:'d3-family-turn'})
    expect(cRun.userMessage).toContain('D2 固定技术预审包')
    const cBinding={assignmentId:cRun.assignmentId,sessionId:'d3-pi-family',caseId:cId,runId:cRun.runId}
    const pendingRule=cCreated.entity!.mapping.find(m=>m.authority==='unverified-policy')!
    const invalid=submitPiReviewResultV2({
      binding:cBinding,triggeredBy:'user',
      result:{summary:'错误地将未核校规判定为已批准',
        checks:[{ruleId:pendingRule.ruleId,subjectIds:['d2-family'],status:'compliant',reason:'越权断言',sourceRefs:[cRef]}],
        finish:true},
    })
    expect(invalid.rejected.length).toBeGreaterThan(0)
    const completed=submitPiReviewResultV2({
      binding:cBinding,triggeredBy:'user',
      result:{summary:'全部检查已登记，但是否有发卡资格仍要有权学校人员认定',
        checks:cCreated.entity!.mapping.map(m=>({
          ruleId:m.ruleId,subjectIds:m.subjectId?[m.subjectId]:['d2-family'],
          status:'awaiting-confirmation' as const,
          reason:'当前只能做来源定位及技术核对，校方制度与原件须复核',sourceRefs:[],
        })),finish:true},
    })
    expect(completed.rejected).toEqual([])
    expect(completed.status).toBe('completed')
    const cStored=readAggregate(cId)!
    const cFinished=getRunV2(cId,cRun.runId)!
    expect(verifyD2PiRun(cStored,cFinished).complete).toBeTrue()
    const cDecision=await decideWorkspaceCaseV2(cId,{
      requestId:'d3-unauthorized-approve',actor,expectedRevision:cStored.caseV2.revision,
      payload:{result:'pass',reason:'合成技术回执不可充当校方批准',basedOnRunId:cRun.runId,inputHash:cFinished.inputManifest.hash},
    })
    expect(cDecision.ok).toBeFalse()
    if(!cDecision.ok)expect(cDecision.code).toBe('AGENT_DECISION_DISABLED')

    const archiveSelection=selection<D2ScenarioSelection>('d2-selection-archive.json')
    saveAuthoringCandidateDraft(makeD2CandidateShell(archive,'archive-access',1))
    const aId='d3-w3-archive'
    const aCreated=await createD2TechnicalCase({
      caseId:aId,title:'档案 item-1 逐操作技术核验',actor,workspace:archive,selection:archiveSelection,
    })
    expect(aCreated.ok).toBeTrue()
    if(!aCreated.ok)throw new Error(aCreated.message)
    const aRef=await register(aId,registerContent(aId,'合成测试：已提供 item-1 查阅授权记录，复制与开放状态尚无正式许可。'))
    const set=await setEvidenceLink(aId,{
      requestId:'d3-link-read-only',actor,expectedRevision:readAggregate(aId)!.caseV2.revision,
      payload:{documentVersionId:aRef.documentVersionId,subjectIds:['d2-item1-read'],
        supportsFact:'d2:archive:read',linkedBy:'user'},
    })
    if(!set.ok)throw new Error(set.message)
    const aRun=preparePiReviewRunV2({caseId:aId,sessionId:'d3-pi-archive',turnId:'d3-archive-turn'})
    const aBinding={assignmentId:aRun.assignmentId,sessionId:'d3-pi-archive',caseId:aId,runId:aRun.runId}
    const copy=aCreated.entity!.mapping.find(m=>m.checkId==='module/item-1-copy/authorization')!
    const attempted=submitPiReviewResultV2({
      binding:aBinding,triggeredBy:'user',
      result:{summary:'错误将查阅授权替换为复制授权',
        checks:[{ruleId:copy.ruleId,subjectIds:[copy.subjectId!],status:'compliant',reason:'越权跨操作',sourceRefs:[aRef]}],
        finish:true},
    })
    expect(attempted.rejected.length).toBeGreaterThan(0)
    const full=submitPiReviewResultV2({
      binding:aBinding,triggeredBy:'user',
      result:{
        summary:'只对有独立证据的查阅事实做技术核对，复制/开放/待核校规不作符合断言',
        checks:aCreated.entity!.mapping.map(m=>{
          const isEvidence=m.checkId==='module/item-1-evidence/evidence-boundary'
          return {
            ruleId:m.ruleId,subjectIds:m.subjectId?[m.subjectId]:archiveSelection.targets.map(t=>t.subjectId),
            status:isEvidence?'compliant' as const:'awaiting-confirmation' as const,
            reason:isEvidence?'已匹配当前档案 item-1/read 的真实材料版本及核验范围':'当前操作/制度授权尚未核实',
            sourceRefs:isEvidence?[aRef]:[],
          }
        }),finish:true,
      },
    })
    expect(full.rejected).toEqual([])
    expect(full.status).toBe('completed')
    const aDone=getRunV2(aId,aRun.runId)!
    expect(verifyD2PiRun(readAggregate(aId)!,aDone)).toMatchObject({complete:true,problems:[]})
    const check=aDone.checks.find(item=>item.ruleId===copy.ruleId)
    expect(check?.status).toBe('awaiting-confirmation')
    expect(check?.target.subjectIds).toEqual([copy.subjectId!])
  })
})

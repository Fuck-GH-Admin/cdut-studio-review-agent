/**
 * D3-MD-Q1 third-party archive Pi integration probe against EXACT Agent A @ fixed SHA.
 * B's synthetic INPUT cases only; the private B EXPECTED oracle is read by the
 * independent Python scorer after this test, NEVER supplied to Pi.
 * This test demonstrates guard + complete technical receipts, NOT model inference.
 */
import {afterAll,describe,expect,test} from 'bun:test'
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,rmSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join,resolve} from 'node:path'
import type {Actor,D2ScenarioSelection,ReviewAuthoringWorkspaceV1} from '@profer/shared'
import {createD2TechnicalCase,makeD2CandidateShell,validateD2OperationEvidence,verifyD2InstalledPlan,verifyD2PiRun} from './review-d2-runtime'
import {saveAuthoringCandidateDraft} from './template-store'
import {readAggregate} from './case-store-v2'
import {registerMaterial} from './material-service'
import {setEvidenceLink} from './application-service'
import {preparePiReviewRunV2,submitPiReviewResultV2} from './pi-case-review-service'
import {getRunV2} from './run-store-v2'

const home=mkdtempSync(join(tmpdir(),'mdq1-third-pi-'))
const root=join(home,'config')
mkdirSync(root,{recursive:true})
process.env.PROFER_CONFIG_DIR=root
afterAll(()=>rmSync(home,{recursive:true,force:true}))
const actor:Actor={actorId:'independent-mdq1-synthetic-reviewer',actorSource:'local',role:'reviewer'}
const aBase=resolve(import.meta.dir,'../../../../../../docs/design/review-agent/acceptance/d3-md-full/agent-author')
const bBase=process.env.MDQ1_B_INPUT_ROOT
if(!bBase)throw new Error('MDQ1_B_INPUT_ROOT must be the fixed independent Agent B checkout path')
const inputs=JSON.parse(readFileSync(join(bBase,'tests/cases/archive-cases.json'),'utf8')) as {cases:Array<any>}
const cases=new Map<string,any>(inputs.cases.map(c=>[c.caseId,c]))
const aWorkspace=JSON.parse(readFileSync(join(aBase,'workspaces/archive-r2.json'),'utf8')) as ReviewAuthoringWorkspaceV1
const selection=JSON.parse(readFileSync(join(aBase,'plans/selection.json'),'utf8')) as D2ScenarioSelection
const artifacts=process.env.MDQ1_PI_OUTPUT_DIR
if(!artifacts)throw new Error('MDQ1_PI_OUTPUT_DIR required to record actual service receipts')
mkdirSync(artifacts,{recursive:true})
const results:Array<Record<string,unknown>>=[]
const write=(id:string,data:unknown)=>writeFileSync(join(artifacts,id+'.json'),JSON.stringify(data,null,2)+'\n')

describe('Independent MD-Q1 real authored archive Pi service probes',()=>{
  test('B Q02/Q11/Q13/Q20 input is actually used; four 77-Check archive Cases/Run IDs complete pending-only',async()=>{
    saveAuthoringCandidateDraft(makeD2CandidateShell(aWorkspace,'g01-archive-utilization',1))
    for(const id of ['Q02','Q11','Q13','Q20']){
      const item=cases.get(id)
      expect(item,'B case must exist: '+id).toBeDefined()
      expect(item.synthetic).toBe(true)
      expect(item.archiveItems?.length).toBeGreaterThan(0)
      expect(item.expected).toBeUndefined()
      expect(item.mustActivate).toBeUndefined()
      const caseId='mdq1-agent-a-'+id.toLowerCase()
      const created=await createD2TechnicalCase({
        caseId,title:'独立原文金标输入 '+id+' 的技术预审',
        actor,workspace:aWorkspace,selection,
      })
      expect(created.ok).toBe(true)
      if(!created.ok)throw new Error(created.message)
      expect(created.entity?.mapping).toHaveLength(77)
      expect(verifyD2InstalledPlan(readAggregate(caseId)!)).toEqual([])
      const rawText='已提供合成测试输入，未获任何正式档案审批。\n'+JSON.stringify({
        application:item.application,archiveItems:item.archiveItems,evidence:item.evidence,officialFacts:item.officialFacts,
      })
      const file=join(home,id+'.txt')
      writeFileSync(file,rawText,'utf8')
      const m=await registerMaterial(caseId,{
        requestId:caseId+'-material',actor,expectedRevision:readAggregate(caseId)!.caseV2.revision,
        payload:{sourcePath:file,role:'evidence'},
      })
      expect(m.ok).toBe(true)
      if(!m.ok)throw new Error(m.message)
      const doc=readAggregate(caseId)!.caseV2.documents[0]!
      const block=doc.blocks.find(z=>z.kind!=='image')!
      const sourceRef={documentVersionId:doc.versionId,blockId:block.blockId,quote:'已提供'}
      const readSubject=selection.targets.find(t=>t.objectKey==='i01/read')!.subjectId
      const copySubject=selection.targets.find(t=>t.objectKey==='i01/copy')!.subjectId
      const otherSubject=selection.targets.find(t=>t.objectKey==='i02/read')!.subjectId
      const readLink=await setEvidenceLink(caseId,{
        requestId:caseId+'-read-link',actor,expectedRevision:readAggregate(caseId)!.caseV2.revision,
        payload:{documentVersionId:sourceRef.documentVersionId,subjectIds:[readSubject],supportsFact:'d2:archive:read',linkedBy:'user'},
      })
      expect(readLink.ok).toBe(true)
      if(!readLink.ok)throw new Error(readLink.message)
      const snap=readAggregate(caseId)!
      const copy=created.entity!.mapping.find(v=>v.checkId==='module/copy-i01-copy/r23')!
      const other=created.entity!.mapping.find(v=>v.checkId==='module/operation-i02-read/r09')!
      expect(copy).toBeDefined()
      expect(other).toBeDefined()
      expect(copy.subjectId).toBe(copySubject)
      expect(other.subjectId).toBe(otherSubject)
      const copyGuard=validateD2OperationEvidence(snap,copy.ruleId,'compliant',[sourceRef.documentVersionId])
      const crossItemGuard=validateD2OperationEvidence(snap,other.ruleId,'compliant',[sourceRef.documentVersionId])
      expect(copyGuard).toContain('逐操作')
      expect(crossItemGuard).toContain('逐操作')
      const sessionId=caseId+'-session'
      const prepared=preparePiReviewRunV2({caseId,sessionId,turnId:caseId+'-turn'})
      expect(prepared.runId).toBeTruthy()
      const binding={assignmentId:prepared.assignmentId,sessionId,caseId,runId:prepared.runId}
      const forbidden=submitPiReviewResultV2({
        binding,triggeredBy:'user',
        result:{summary:'负例：试图把I01查阅材料视为I01复制已批准',
          checks:[{ruleId:copy.ruleId,subjectIds:[copySubject],status:'compliant',reason:'错误扩大申请范围',sourceRefs:[sourceRef]}],
          finish:true},
      })
      expect(forbidden.accepted).toBe(0)
      expect(forbidden.rejected.length).toBeGreaterThan(0)
      // We do not elevate unconfirmed school policy to synthetic confirmed authority.
      const final=submitPiReviewResultV2({
        binding,triggeredBy:'user',
        result:{summary:'技术服务回执：全部规则未获独立正式批准或业务语义核实，不允许输出许可',
          checks:created.entity!.mapping.map(v=>({
            ruleId:v.ruleId,
            subjectIds:v.subjectId?[v.subjectId]:selection.targets.map(t=>t.subjectId),
            status:'awaiting-confirmation' as const,
            reason:'仅技术逐项审核；未核实有效校规、电子替代、材料阶段及独立授权；保持待核',
            sourceRefs:[],
          })),finish:true},
      })
      expect(final.rejected).toEqual([])
      expect(final.status).toBe('completed')
      const done=getRunV2(caseId,prepared.runId)!
      const verify=verifyD2PiRun(readAggregate(caseId)!,done)
      expect(verify.complete).toBe(true)
      expect(verify.problems).toEqual([])
      expect(done.checks).toHaveLength(77)
      expect(done.checks.every(v=>v.status==='awaiting-confirmation')).toBe(true)
      expect(done.checks.some(v=>v.ruleId===copy.ruleId&&v.target.subjectIds.length===1&&v.target.subjectIds[0]===copySubject)).toBe(true)
      const rec={
        bCaseId:id,realCaseId:caseId,realRunId:prepared.runId,
        actualPiService:true,syntheticToolReceipt:true,onlineModelRun:'not-run',
        authoredTemplateId:created.entity!.templateId,planFingerprint:created.entity!.fingerprint,
        actualChecks:done.checks.length,pendingChecks:done.checks.filter(v=>v.status==='awaiting-confirmation').length,
        negativeAttempt:forbidden,copyGuard,crossItemGuard,
        verification:verify,
        bCaseItemCount:item.archiveItems.length,bCaseOperationCount:item.archiveItems.reduce((n:number,t:any)=>n+t.operations.length,0),
        authoredTemplateTargetCount:selection.targets.length,
        inputAdaptation:'B case source document registered verbatim as SYNTHETIC text; A has fixed i01/i02/i03 subjects. This is NOT a full B-case target graph or gold compliance test.',
        realSourceRef:sourceRef,
        runManifestHash:done.inputManifest.hash,
      }
      write(id+'-real-receipt',rec)
      results.push(rec)
    }
    write('summary',{
      schemaVersion:1,kind:'AGENT_A_FULL_WORKSPACE_REAL_PI_TOOL_SERVICE',
      executedBCaseIds:['Q02','Q11','Q13','Q20'],
      runCount:results.length,
      totalSubmittedChecks:results.reduce((n,x)=>n+Number(x.actualChecks),0),
      actualOnlineModelInference:false,
      independentExpectedScoring:'NOT-RUN',
      templateSubjectsFixedNotDerivedFromBCases:true,
      result:'TECHNICAL GUARD PASS / BUSINESS GOLD NOT-SCORED',
    })
  })
})

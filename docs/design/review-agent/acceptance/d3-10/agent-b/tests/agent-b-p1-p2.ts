/**
 * D3-10 Agent B P1/P2 independent executable repro.
 * Uses THE AGENT B AUTHORED archive-r3.json; never edits D3/Pi implementation.
 * All documents and tool receipts are synthetic. Online model: NOT RUN.
 */
import {existsSync,mkdirSync,mkdtempSync,readFileSync,writeFileSync,rmSync} from 'node:fs'
import {join,resolve} from 'node:path'
import {tmpdir} from 'node:os'
import {createHash} from 'node:crypto'
import {importD3Bundle} from '../../../../../../../apps/electron/src/main/lib/review/review-d3-module-library'
import {validateReviewAuthoringV1} from '../../../../../../../apps/electron/src/main/lib/review/review-authoring-v1'
import {compileD2RuntimePlan,createD2TechnicalCase,makeD2CandidateShell,verifyD2PiRun,verifyD2InstalledPlan,validateD2OperationEvidence} from '../../../../../../../apps/electron/src/main/lib/review/review-d2-runtime'
import {saveAuthoringCandidateDraft} from '../../../../../../../apps/electron/src/main/lib/review/template-store'
import {readAggregate} from '../../../../../../../apps/electron/src/main/lib/review/case-store-v2'
import {registerMaterial} from '../../../../../../../apps/electron/src/main/lib/review/material-service'
import {setEvidenceLink} from '../../../../../../../apps/electron/src/main/lib/review/application-service'
import {preparePiReviewRunV2,submitPiReviewResultV2} from '../../../../../../../apps/electron/src/main/lib/review/pi-case-review-service'
import {getRunV2} from '../../../../../../../apps/electron/src/main/lib/review/run-store-v2'

const root=resolve(import.meta.dir,'..')
const base=resolve(import.meta.dir,'../../../../../../../')
const fixed='d16f047af653f7ba259456807c1fc150e9d0f417'
const workFile=join(root,'workspaces','archive-r3.json')
const bundleFile=join(root,'bundles','archive-export.json')
const selectionFile=join(base,'docs/design/review-agent/fixtures/d2-selection-archive.json')
const srcMd='g01_archive_utilization_template_editor_spec_v1_5.md'
const srcMdHash='65157e002dd4d1ccc08d32d341b4a1f7eacfc55d6a3c13a5da949aaf122f9785'
const read=(path:string)=>JSON.parse(readFileSync(path,'utf8'))
const record=(rel:string,obj:unknown)=>{
 const path=join(root,rel);mkdirSync(resolve(path,'..'),{recursive:true})
 writeFileSync(path,JSON.stringify(obj,null,2)+'\n','utf8')
}
const assert=(condition:unknown,label:string):void=>{if(!condition)throw new Error('AGENT_B_ACCEPTANCE_FAILED: '+label)}
const output:{ codeSha:string;caseId?:string; runId?:string; p1?:unknown;p2?:unknown; errors:string[]; onlineModelRun:'not-run'; syntheticToolReceipt:true}={
 codeSha:fixed,errors:[],onlineModelRun:'not-run',syntheticToolReceipt:true
}
const temp=mkdtempSync(join(tmpdir(),'d310-agent-b-own-pi-'))
process.env.PROFER_CONFIG_DIR=join(temp,'config')
mkdirSync(process.env.PROFER_CONFIG_DIR,{recursive:true})
const actor={actorId:'d310-agent-b-reviewer',actorSource:'local' as const,role:'reviewer' as const}
const archive=read(workFile)
const selection=read(selectionFile)
let plan:any
try{
 // Import all frozen locks into this COMPLETELY NEW config; then use the authored archive-r3.
 const restored=importD3Bundle(read(bundleFile))
 assert(JSON.stringify(restored)===JSON.stringify(archive),'the imported bundle must equal authored archive-r3.json')
 assert(validateReviewAuthoringV1(archive).length===0,'A r3 must be valid before service execution')
 const caseStub={id:'d310-b-own-preview',templateId:'archive-access',templateVersion:1,title:'B preview',objectType:'document',caseFields:{},subjects:[],documents:[],stage:'draft',revision:0,createdAt:'2026-10-11T00:00:00.000Z',updatedAt:'2026-10-11T00:00:00.000Z'}
 plan=compileD2RuntimePlan(archive,selection,caseStub)
 assert(plan.mapping.length===6,'authored A r3 technical check denominator must be six')
 const wanted=['module/item-1-read/authorization','module/item-1-copy/authorization','module/item-1-copy-local/copy-authorization','module/item-1-evidence/evidence-boundary']
 for(const id of wanted)assert(plan.mapping.some((m:any)=>m.checkId===id),'missing real A r3 check '+id)
 const shell=makeD2CandidateShell(archive,'archive-access',1)
 saveAuthoringCandidateDraft(shell)
 const caseId='d310-agent-b-archive-r3-run'
 output.caseId=caseId
 const created=await createD2TechnicalCase({caseId,title:'Agent B A-r3 只提供查阅授权的合成案卷',actor,workspace:archive,selection})
 assert(created.ok,'D2 service must create new Agent B archive-r3 case')
 assert(created.entity?.fingerprint===plan.fingerprint,'installed plan must match B authored preview')
 assert(verifyD2InstalledPlan(readAggregate(caseId)!).length===0,'installed candidate plan still immutable')
 const docFile=join(temp,'read-only-authorization.txt')
 writeFileSync(docFile,'【合成测试授权材料】档案 item-1 查阅授权已由申请人提供。授权操作仅 read。未提供复制授权，档案开放和校方最终签批尚待确认。\n')
 let agg=readAggregate(caseId)!
 const mat=await registerMaterial(caseId,{requestId:'d310-b-material-read-only',actor,expectedRevision:agg.caseV2.revision,payload:{sourcePath:docFile,role:'evidence'}})
 assert(mat.ok,'material must register via real material-service')
 agg=readAggregate(caseId)!
 const doc=agg.caseV2.documents[0]!
 const block=doc.blocks.find((b:any)=>b.kind!=='image')!
 assert(!!block,'text material must produce real block')
 const sourceRef={documentVersionId:doc.versionId,blockId:block.blockId,quote:'查阅授权已由申请人提供'}
 const readTarget=plan.targets.find((t:any)=>t.objectKey==='item-1/read')!
 const copyTarget=plan.targets.find((t:any)=>t.objectKey==='item-1/copy')!
 assert(readTarget.subjectId!==copyTarget.subjectId,'read and copy subject separation')
 const link=await setEvidenceLink(caseId,{requestId:'d310-b-link-read-not-copy',actor,expectedRevision:agg.caseV2.revision,
 payload:{documentVersionId:sourceRef.documentVersionId,subjectIds:[readTarget.subjectId],supportsFact:'d2:archive:read',linkedBy:'user'}})
 assert(link.ok,'real application-service evidenceLink bound only to read')
 agg=readAggregate(caseId)!
 assert(!agg.evidenceLinks.some((l:any)=>l.subjectId===copyTarget.subjectId),'copy must not inherit read evidence link')
 const readBound=plan.mapping.find((m:any)=>m.checkId==='module/item-1-read/authorization')!
 const copyBound=plan.mapping.find((m:any)=>m.checkId==='module/item-1-copy/authorization')!
 const copyLocal=plan.mapping.find((m:any)=>m.checkId==='module/item-1-copy-local/copy-authorization')!
 // Independent guard evidence: even with an actual SourceRef, a read-only link cannot authorize COPY.
 const scopeError=validateD2OperationEvidence(agg,copyBound.ruleId,'compliant',[sourceRef.documentVersionId])
 const scopeErrorLocal=validateD2OperationEvidence(agg,copyLocal.ruleId,'compliant',[sourceRef.documentVersionId])
 assert(scopeError?.includes('逐操作'),'copy shared B01 must refuse read-bound evidence')
 assert(scopeErrorLocal?.includes('逐操作'),'copy local business rule must refuse read-bound evidence')
 assert(validateD2OperationEvidence(agg,readBound.ruleId,'compliant',[sourceRef.documentVersionId])===undefined,'read can use read-bound evidence at the operation-level guard')
 const sessionId='agent-b-owned-archive-pi-session'
 const prepared=preparePiReviewRunV2({caseId,sessionId,turnId:'agent-b-own-archive-turn'})
 assert(!!prepared.runId,'real Pi service must create Run ID')
 output.runId=prepared.runId
 const binding={assignmentId:prepared.assignmentId,sessionId,caseId,runId:prepared.runId}
 const wrongful=submitPiReviewResultV2({binding,triggeredBy:'user',
 result:{summary:'NEGATIVE: wrong copy compliant from read-only authorization',
 checks:[{ruleId:copyBound.ruleId,subjectIds:[copyTarget.subjectId],status:'compliant',reason:'把read错误当成copy',sourceRefs:[sourceRef]}],finish:true}})
 assert(wrongful.accepted===0&&wrongful.rejected.length>0,'Pi service must reject cross-operation copy compliant')
 assert(wrongful.rejected.some((x:any)=>x.reason.includes('规则尚未确认')||x.reason.includes('逐操作')),'rejection must reference actual guard')
 const runAfterReject=getRunV2(caseId,prepared.runId)!
 assert(!runAfterReject.checks.some((c:any)=>c.ruleId===copyBound.ruleId&&c.status==='compliant'),'no false copy compliance persisted')
 // Put the one valid synthetic-source READ fact into the run; all unverified school policy stays pending.
 const final=submitPiReviewResultV2({binding,triggeredBy:'user',result:{
 summary:'read-only evidence recorded, copy authorization and official policy must remain awaiting-confirmation',
 checks:plan.mapping.map((m:any)=>{
 const readEvidence=m.checkId==='module/item-1-evidence/evidence-boundary'
 return {ruleId:m.ruleId,subjectIds:m.subjectId?[m.subjectId]:plan.targets.map((t:any)=>t.subjectId),
 status:readEvidence?'compliant':'awaiting-confirmation',
 reason:readEvidence?'合成read材料与item-1/read证据定位一致；不证明档案利用行政批准':'当前操作权限或校本制度尚未核实，禁止推出符合结论',
 sourceRefs:readEvidence?[sourceRef]:[]}
 }),finish:true}})
 assert(final.rejected.length===0,'all six checks must be accepted as scoped compliant/pending')
 assert(final.status==='completed','Pi service actual Run must complete technical review')
 const done=getRunV2(caseId,prepared.runId)!
 const verify=verifyD2PiRun(readAggregate(caseId)!,done)
 assert(verify.complete&&verify.problems.length===0,'actual authored r3 Pi Run must verify complete')
 const copyChecks=done.checks.filter((c:any)=>c.ruleId===copyBound.ruleId||c.ruleId===copyLocal.ruleId)
 assert(copyChecks.length===2,'both copy rule checks must persist')
 assert(copyChecks.every((c:any)=>c.status==='awaiting-confirmation'&&c.target.subjectIds.length===1&&c.target.subjectIds[0]===copyTarget.subjectId),'both copy decisions pending and isolated')
 const recordP1={
 caseId,runId:prepared.runId,actualCaseCreated:true,templateId:'archive-access',workspaceId:archive.workspaceId,
 authoringRevision:archive.revision,authoringDigest:plan.authoringDigest,planFingerprint:plan.fingerprint,
 sourceDocumentVersionId:sourceRef.documentVersionId,sourceBlockId:sourceRef.blockId,
 independentReadSubject:readTarget.subjectId,independentCopySubject:copyTarget.subjectId,
 readOnlyEvidenceLinkCount:agg.evidenceLinks.length,readOperationGuard:null,copyOperationGuard:scopeError,copyLocalGuard:scopeErrorLocal,
 negativePiSubmission:wrongful,runStatusAfterNegative:runAfterReject.status,
 acceptedFinalReceipt:final,verification:verify,storedRunStatus:done.status,
 relevantChecks:done.checks.map((c:any)=>({checkId:c.checkId,ruleId:c.ruleId,status:c.status,subjectIds:c.target.subjectIds,sourceRefs:c.sourceRefs})),
 inputManifest:{hash:done.inputManifest.hash,effectiveRuleSetHash:done.inputManifest.effectiveRuleSetHash},
 expected:{readEvidenceOnly:true,copyCompliantRejected:true,copyAwaitingConfirmation:true},
 onlineModelRun:'not-run',syntheticToolReceipt:true
 }
 output.p1={status:'PASS',caseId,runId:prepared.runId,negativeRejected:wrongful.rejected.length,verification:verify}
 record('plans/pi-archive-r3-own-run.json',recordP1)
 record('tests/p1-original-run-snapshot.json',done)
 record('tests/p1-original-case-aggregate.json',readAggregate(caseId)!)
 // SECONDARY SYNTHETIC CONTROL: unverified-policy guard otherwise rejects first,
 // so permit only the two COPY checks to use explicit test-only synthetic authority.
 // This is NOT the original authored A r3, NOT official school policy, and NOT saved D1.
 const probeWorkspace=structuredClone(archive)
 probeWorkspace.workspaceId='d310-agent-b-copy-guard-probe'
 probeWorkspace.revision=4
 const copySourceIds=['archive-access@1:module/item-1-copy/authorization','archive-access@1:module/item-1-copy-local/copy-authorization']
 for(const link of probeWorkspace.sourceBindings)if(copySourceIds.includes(link.checkId)){
   link.sourceIds=['synthetic-source']
   link.applicabilityNote='TECHNICAL PROBE ONLY: disable unknown policy early rejection to isolate operation-specific evidence gate'
 }
 assert(validateReviewAuthoringV1(probeWorkspace).length===0,'probe variant valid but isolated')
 record('tests/p1-synthetic-copy-authority-probe-workspace.json',probeWorkspace)
 const probeCaseId='d310-agent-b-copy-evidence-probe'
 const probeCreated=await createD2TechnicalCase({
  caseId:probeCaseId,title:'仅为验证Pi逐操作拒止的合成来源探针（非原模板正式校规）',
  actor,workspace:probeWorkspace,selection})
 assert(probeCreated.ok,'Pi operation probe creates a real separate technical case')
 const probeMat=await registerMaterial(probeCaseId,{
 requestId:'d310-b-probe-material',actor,expectedRevision:readAggregate(probeCaseId)!.caseV2.revision,
 payload:{sourcePath:docFile,role:'evidence'}})
 assert(probeMat.ok,'probe material registered independently')
 const probeDoc=readAggregate(probeCaseId)!.caseV2.documents[0]!
 const probeBlock=probeDoc.blocks.find((b:any)=>b.kind!=='image')!
 const probeRef={documentVersionId:probeDoc.versionId,blockId:probeBlock.blockId,quote:'查阅授权已由申请人提供'}
 const probeLink=await setEvidenceLink(probeCaseId,{
 requestId:'d310-b-probe-link-read-only',actor,expectedRevision:readAggregate(probeCaseId)!.caseV2.revision,
 payload:{documentVersionId:probeRef.documentVersionId,subjectIds:[readTarget.subjectId],supportsFact:'d2:archive:read',linkedBy:'user'}})
 assert(probeLink.ok,'probe links evidence to read and only read')
 const probeSession='agent-b-own-copy-guard-probe-session'
 const probeRun=preparePiReviewRunV2({caseId:probeCaseId,sessionId:probeSession,turnId:'agent-b-probe-copy-turn'})
 const probeBinding={assignmentId:probeRun.assignmentId,sessionId:probeSession,caseId:probeCaseId,runId:probeRun.runId}
 const probeCopy=probeCreated.entity!.mapping.find((m:any)=>m.checkId==='module/item-1-copy/authorization')!
 assert(probeCopy.authority==='request-scope','probe copy has test-only request-scope authority')
 const operationRejected=submitPiReviewResultV2({binding:probeBinding,triggeredBy:'user',result:{
 summary:'synthetic controlled negative; read-only evidence falsely submitted as copy compliance',
 checks:[{ruleId:probeCopy.ruleId,subjectIds:[copyTarget.subjectId],status:'compliant',reason:'read erroneously substituted for copy',sourceRefs:[probeRef]}],
 finish:true}})
 assert(operationRejected.accepted===0,'Pi service refuses copy compliance in test-only confirmed-rule variant')
 assert(operationRejected.rejected.some((item:any)=>item.reason.includes('档案逐操作')),'Pi service rejects specifically because operation evidence does not match COPY')
 const probeFinal=submitPiReviewResultV2({binding:probeBinding,triggeredBy:'user',result:{
 summary:'synthetic operation probe finalized with all pending; never authorize copy',
 checks:probeCreated.entity!.mapping.map((m:any)=>({
 ruleId:m.ruleId,subjectIds:m.subjectId?[m.subjectId]:selection.targets.map((t:any)=>t.subjectId),
 status:'awaiting-confirmation',reason:'仅为跨操作拒止探针；真实制度和复制许可尚待核实',sourceRefs:[]})),finish:true}})
 assert(probeFinal.status==='completed'&&probeFinal.rejected.length===0,'probe run completes without false compliance')
 const probeDone=getRunV2(probeCaseId,probeRun.runId)!
 assert(verifyD2PiRun(readAggregate(probeCaseId)!,probeDone).complete,'probe real Run is verifiable')
 record('tests/p1-probe-run-snapshot.json',probeDone)
 record('plans/pi-copy-operation-guard-probe.json',{
 codeSha:fixed,kind:'synthetic-control-not-original-archive-r3',
 note:'The original A r3 uses unknown school policy; this isolated variant changes only COPY sourceBinding to synthetic request-scope so Pi reaches the independent evidence-boundary guard.',
 probeWorkspaceId:probeWorkspace.workspaceId,
 baselineWorkspaceId:archive.workspaceId,
 originalCaseId:caseId,originalRunId:prepared.runId,probeCaseId,probeRunId:probeRun.runId,
 copyCheckId:probeCopy.checkId,copyRuleId:probeCopy.ruleId,
 readOnlyDocumentVersionId:probeRef.documentVersionId,originalReadSubjectId:readTarget.subjectId,
 attemptedCopySubjectId:copyTarget.subjectId,
 negativePiSubmission:operationRejected,finalPiReceipt:probeFinal,
 verifyD2PiRun:verifyD2PiRun(readAggregate(probeCaseId)!,probeDone),
 onlineModelRun:'not-run',syntheticToolReceipt:true
 })
 output.p1={...output.p1 as object,syntheticCopyGuardProbe:{caseId:probeCaseId,runId:probeRun.runId,operationSpecificRejection:operationRejected.rejected.map((x:any)=>x.reason)}}
}catch(error){
 const message=String(error instanceof Error ? error.stack??error.message : error)
 output.errors.push('P1 '+message)
 record('tests/p1-error.json',{error:message,caseId:output.caseId??null,runIds:output.runId?[output.runId]:[],status:'FAIL',onlineModelRun:'not-run'})
}
// P2: independent advanced relationship authored from A r3, D1-valid, D2 fail-closed,
// with the REAL stdout/stderr and check/run trace from P1.
try{
 const a=structuredClone(archive)
 const claim='r29-electronic-authorization-alternative-by-operation'
 a.advanced={claimKeys:[claim],evidenceRelations:[{claimKey:claim,requiredSourceIds:['synthetic-source','school-policy-unverified']}]}
 const advancedFile=join(root,'workspaces','archive-r3-advanced-evidence-alternative.json')
 record('workspaces/archive-r3-advanced-evidence-alternative.json',a)
 const problems=validateReviewAuthoringV1(a)
 assert(problems.length===0,'P2 advanced input must pass D1 structural/source validation')
 // The list of two sources is a MINIMAL advanced relationship input, not a mislabelled OR
 // proof: lawfully conditional replacements require semantics beyond current relation schema.
 const proc=Bun.spawnSync({cmd:[process.execPath,join(base,'apps/electron/scripts/review-d2-plan.ts'),
 'preview',advancedFile,selectionFile,join(root,'tests','archive-case.json')],
 env:{...process.env,PROFER_CONFIG_DIR:process.env.PROFER_CONFIG_DIR!},stdout:'pipe',stderr:'pipe'})
 const stderr=proc.stderr.toString(),stdout=proc.stdout.toString()
 assert(proc.exitCode!==0,'actual D2 CLI must fail closed with advanced evidence relation')
 assert(stderr.includes('D2_UNMAPPED_ADVANCED'),'expected exact D2_UNMAPPED_ADVANCED compiler rejection')
 record('gaps/advanced-evidence-compile-repro.json',{
 originalSourceMd:srcMd,sourceMdSha256:srcMdHash,
 originalRequirementIds:['R08','R09','R10','R29'],
 locator:'第6节 R08–R10（原文行289–291），R29（原文行310）；第4节 S03–S04',
 authoredFile:'workspaces/archive-r3-advanced-evidence-alternative.json',
 explanation:'This is an advanced evidence relation, not a claim that its two sources encode legal OR/alternative conditions. D2 cannot faithfully compile conditionally substitutable electronic authorization per operation.',
 command:'bun apps/electron/scripts/review-d2-plan.ts preview '+advancedFile+' '+selectionFile+' '+join(root,'tests','archive-case.json'),
 exitCode:proc.exitCode,stderr,stdout,validatorIssues:problems,
 affectedCheckIds:plan.mapping.filter((m:any)=>['module/item-1-read/authorization','module/item-1-copy/authorization','module/item-1-copy-local/copy-authorization','module/item-1-read/scope-trace'].includes(m.checkId)).map((m:any)=>m.checkId),
 baselineRunIds:output.runId?[output.runId]:[],
 note:'Existing run IDs are ONLY from successful baseline A r3; advanced version was never installed/run.'
 })
 const issue={
  sourceMd:srcMd,locator:'第6节 R08-R10（行289–291）、R29（行310）与第4节 S03-S04',
  requirement:'合法电子委托与按条件替代的证明关系要分别核对代理主体、档案件、操作、期间和学校规则适用；不得删除R08-R10/R29。',
  blockedOperation:'archive-r3 advanced.evidenceRelations 已通过D1有效性检查，实际D2 CLI报 D2_UNMAPPED_ADVANCED；无法无损映射条件性替代证据及校本效力。',
  owner:'D3',
  reproduce:'bun apps/electron/scripts/review-d2-plan.ts preview <workspaces/archive-r3-advanced-evidence-alternative.json> docs/design/review-agent/fixtures/d2-selection-archive.json <tests/archive-case.json>；本轮返回D2_UNMAPPED_ADVANCED。',
  affected:{templateId:'archive-access',templateVersion:1,sourceRequirementIds:['R08','R09','R10','R29'],
  instancePaths:['module/item-1-read','module/item-1-copy','module/item-1-copy-local'],
  checkIds:plan.mapping.filter((m:any)=>['module/item-1-read/authorization','module/item-1-copy/authorization','module/item-1-copy-local/copy-authorization','module/item-1-read/scope-trace'].includes(m.checkId)).map((m:any)=>m.checkId),
  runIds:output.runId?[output.runId]:[]}
 }
 record('gaps/gap-p2-advanced-reproduced-request.json',issue)
 const gapProc=Bun.spawnSync({cmd:[process.execPath,join(base,'apps/electron/scripts/review-d3-library.ts'),'report-gap',join(root,'gaps','gap-p2-advanced-reproduced-request.json')],
 env:{...process.env,PROFER_CONFIG_DIR:process.env.PROFER_CONFIG_DIR!},stdout:'pipe',stderr:'pipe'})
 const gapStd=gapProc.stdout.toString(),gapErr=gapProc.stderr.toString()
 assert(gapProc.exitCode===0,'real report-gap must accept affected maps')
 const gap=JSON.parse(gapStd)
 assert(gap.status==='tooling-blocked'&&gap.verifiedAgainstRun===false,'gap must not claim run-verified even when baseline ID exists')
 assert(JSON.stringify(gap.affected.runIds)===JSON.stringify(issue.affected.runIds),'gap must retain actual baseline Run ID or explicit empty list')
 record('gaps/gap-p2-advanced-reproduced-response.json',gap)
 record('gaps/gap-p2-advanced-cli-trace.json',{compile:{exitCode:proc.exitCode,stdout,stderr},reportGap:{exitCode:gapProc.exitCode,stdout:gapStd,stderr:gapErr}})
 output.p2={status:'PASS',d1Validation:true,d2CompileExitCode:proc.exitCode,d2Error:'D2_UNMAPPED_ADVANCED',gapStatus:gap.status,baselineRunIds:issue.affected.runIds}
}catch(error){
 const message=String(error instanceof Error ? error.stack??error.message : error)
 output.errors.push('P2 '+message)
 record('tests/p2-error.json',{error:message,status:'FAIL',runIds:output.runId?[output.runId]:[]})
}finally{
 record('tests/p1-p2-execution-summary.json',output)
 rmSync(temp,{recursive:true,force:true})
 if(output.errors.length){process.stderr.write(output.errors.join('\n')+'\n');process.exitCode=1}
 else process.stdout.write(JSON.stringify({status:'PASS',caseId:output.caseId,runId:output.runId,p1:output.p1,p2:output.p2})+'\n')
}

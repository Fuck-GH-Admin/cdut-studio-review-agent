import {describe,expect,test} from 'bun:test'
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,rmSync} from 'node:fs'
import {join} from 'node:path'
import {tmpdir} from 'node:os'
import type {Actor,CaseAggregateV2,D2RuleBinding,D2ExecutionGateV1,ReviewAuthoringWorkspaceV1} from '@profer/shared'
import {instantiateD3ArchiveCaseV1,type D3ArchiveCaseRequestV1} from './review-d3-dynamic-case'
import {evaluateD2GateExpression,validateD2ExecutionGate,validateD2GuardSubmission} from './review-d2-execution-gates'
import {compileD2RuntimePlan,createD2TechnicalCase,makeD2CandidateShell,verifyD2PiRun} from './review-d2-runtime'
import {validateReviewAuthoringV1,compileReviewAuthoringCandidateV1} from './review-authoring-v1'
import {saveAuthoringCandidateDraft} from './template-store'
import {exportD3Bundle,importD3Bundle} from './review-d3-module-library'
import {readAggregate} from './case-store-v2'
import {registerMaterial} from './material-service'
import {setEvidenceLink} from './application-service'
import {preparePiReviewRunV2,submitPiReviewResultV2} from './pi-case-review-service'
import {getRunV2} from './run-store-v2'

const folder=mkdtempSync(join(tmpdir(),'d3-md-real-'))
process.env.PROFER_CONFIG_DIR=join(folder,'config')
mkdirSync(process.env.PROFER_CONFIG_DIR,{recursive:true})
const A=process.env.MDQ1_AUTHOR_ROOT
const B=process.env.MDQ1_ORACLE_ROOT
const OUT=process.env.MDQ1_IMPLEMENTATION_OUTPUT_DIR
if(!A||!B||!OUT)throw Error('Pinned author+oracle checkout paths and output directory required')
mkdirSync(OUT,{recursive:true})
const load=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const source=load(join(A,'workspaces/archive-r2.json')) as ReviewAuthoringWorkspaceV1
const bCases=load(join(B,'tests/cases/archive-cases.json')).cases as Array<any>
const actor:Actor={actorId:'d3-md-dynamic-ci',actorSource:'local',role:'reviewer'}
const specModules:D3ArchiveCaseRequestV1['modules']={
  item:'archive-items',operation:'archive-operations',
  byOperation:{read:['archive-read'],copy:['archive-copy'],excerpt:['archive-excerpt'],borrow:['archive-borrow']},
}
const req=(c:any):D3ArchiveCaseRequestV1=>({
  caseKey:c.caseId.toLowerCase(),templateId:'g01-archive-utilization',version:1,
  modules:specModules,
  items:c.archiveItems.map((i:any)=>({
    itemId:i.itemId.toLowerCase(),title:'合成档案件 '+i.itemId,
    operations:i.operations.map((o:any)=>({
      operationId:o.operationId.toLowerCase(),operation:o.operation,
      title:'合成 '+o.operation+' '+o.operationId,
    })),
  })),
})
function fakeAggregate(stage:string,subjectId='d3-i01-copy-o01'){
  const obj:any={
    caseV2:{id:'c',stage,documents:[
      {versionId:'v1',active:true},{versionId:'v2',active:false},
    ]},
    observations:[],
    evidenceLinks:[],
  }
  return obj as CaseAggregateV2
}
const gate:D2ExecutionGateV1={
  when:{kind:'case-stage',stages:['submitted','reviewing']},
  material:{provider:'applicant',dueStages:['reviewing'],
    alternatives:['d2:document:paper','d2:document:electronic']},
}
const mapping:D2RuleBinding={checkId:'module/demo/material',ruleId:'d2-rule',
  sourceIds:['synthetic-only'],authority:'request-scope',
  objectKey:'i01/copy/o01',subjectId:'d3-i01-copy-o01',gate}
function emit(filename:string,value:unknown){
  writeFileSync(join(OUT!,filename),JSON.stringify(value,null,2)+'\n')
}
describe('D3 dynamic case + D2 structured gates against frozen independent A/B',()=>{
  test('bounded fail-closed tri-state, stages and lawful electronic material alternatives',()=>{
    expect(validateD2ExecutionGate(gate)).toEqual([])
    expect(validateD2ExecutionGate({when:{kind:'evidence-any',supportsFacts:[]}}))
      .toContain('D2_GATE_BAD_EVIDENCE_ALTERNATIVES')
    const unknownGate:D2RuleBinding={...mapping,gate:{
      when:{kind:'confirmed-observation',fieldKey:'identity_confirmed',equals:'yes'}}}
    const agg=fakeAggregate('submitted')
    expect(evaluateD2GateExpression(unknownGate.gate!.when!,agg,mapping.subjectId,[])).toBe('unknown')
    expect(validateD2GuardSubmission(agg,unknownGate,'not-applicable',[])).toContain('D2_GATE_UNKNOWN')
    expect(validateD2GuardSubmission(agg,unknownGate,'non-compliant',[])).toContain('D2_GATE_UNKNOWN')
    expect(validateD2GuardSubmission(agg,unknownGate,'awaiting-confirmation',[])).toBeUndefined()
    expect(validateD2GuardSubmission(agg,mapping,'awaiting-supplement',[])).toContain('D2_MATERIAL_NOT_DUE')
    expect(validateD2GuardSubmission(agg,mapping,'non-compliant',[])).toContain('D2_MATERIAL_NOT_DUE')
    agg.caseV2.stage='reviewing'
    expect(validateD2GuardSubmission(agg,mapping,'compliant',['v1'])).toContain('D2_MATERIAL_ALTERNATIVE_UNVERIFIED')
    expect(validateD2GuardSubmission(agg,mapping,'awaiting-supplement',[])).toBeUndefined()
    agg.evidenceLinks.push({id:'link',documentVersionId:'v1',subjectId:mapping.subjectId!,
      supportsFact:'d2:document:electronic',status:'confirmed',linkedBy:'user'})
    expect(validateD2GuardSubmission(agg,mapping,'compliant',['v1'])).toBeUndefined()
    expect(validateD2GuardSubmission(agg,mapping,'awaiting-supplement',['v1'])).toContain('D2_MATERIAL_ALREADY_SUPPORTED')
    expect(validateD2GuardSubmission(agg,mapping,'compliant',['v2'])).toContain('D2_MATERIAL_ALTERNATIVE_UNVERIFIED')
    agg.evidenceLinks[0]!.subjectId='d3-another-operation'
    expect(validateD2GuardSubmission(agg,mapping,'compliant',['v1'])).toContain('D2_MATERIAL_ALTERNATIVE_UNVERIFIED')
    const humanGate:D2RuleBinding={...mapping,gate:{when:{kind:'case-stage',stages:['reviewing']},
      material:{provider:'authority',dueStages:['reviewing'],alternatives:['d2:formal-signature']}}}
    expect(validateD2GuardSubmission(agg,humanGate,'awaiting-supplement',[])).toContain('D2_MATERIAL_AUTHORITY_OWNED')
    expect(validateD2GuardSubmission(agg,humanGate,'non-compliant',[])).toContain('D2_MATERIAL_AUTHORITY_OWNED')
    expect(validateD2GuardSubmission(agg,humanGate,'compliant',['v1'])).toContain('D2_MATERIAL_AUTHORITY_DECISION_REQUIRED')
    expect(validateD2GuardSubmission(agg,{...mapping,gate:{when:{kind:'case-stage',stages:['submitted']}}},'not-applicable',[])).toBeUndefined()
    expect(validateD2GuardSubmission(agg,{...mapping,gate:{when:{kind:'case-stage',stages:['submitted']}}},'compliant',[])).toContain('D2_GATE_FALSE')
  })
  test('all 30 B business INPUTS use dynamic per-case exact items/operations without importing B oracle',async()=>{
    expect(bCases.length).toBe(30)
    saveAuthoringCandidateDraft(makeD2CandidateShell(source,'g01-archive-utilization',1))
    const statuses:Array<Record<string,unknown>>=[]
    const fingerprints=new Set<string>()
    for(const b of bCases){
      const args=req(b)
      let result:ReturnType<typeof instantiateD3ArchiveCaseV1>
      try {result=instantiateD3ArchiveCaseV1(source,args)}
      catch(e){
        const message=String(e instanceof Error?e.message:e)
        expect(message).toContain('D3_SPECIAL_OPERATION_MODULE_REQUIRED')
        expect(b.archiveItems.some((i:any)=>i.operations.some((o:any)=>o.operation==='certified_copy'))).toBeTrue()
        statuses.push({caseId:b.caseId,status:'TOOLING-BLOCKED',reason:message})
        continue
      }
      const expectedOps=b.archiveItems.reduce((n:number,i:any)=>n+i.operations.length,0)
      expect(result.selection.targets).toHaveLength(b.archiveItems.length+expectedOps)
      expect(result.normalizedOperations).toHaveLength(expectedOps)
      expect(new Set(result.selection.targets.map(t=>t.objectKey)).size).toBe(result.selection.targets.length)
      expect(validateReviewAuthoringV1(result.workspace)).toEqual([])
      // Future authoring must not silently elevate A's policy-candidate sources.
      const originalSources=new Map(source.sources.map(s=>[s.sourceId,s]))
      expect(result.workspace.sources).toEqual(source.sources)
      for(const b of result.workspace.sourceBindings)
        expect(b.sourceIds.every(s=>originalSources.has(s))).toBe(true)
      const caseV2:any={id:'d3-dynamic-'+b.caseId.toLowerCase(),
        templateId:'g01-archive-utilization',templateVersion:1,title:'synthetic',
        objectType:'document',caseFields:{},subjects:[],documents:[],
        stage:'draft',revision:0,createdAt:'2026-10-11T00:00:00.000Z',
        updatedAt:'2026-10-11T00:00:00.000Z'}
      const plan=compileD2RuntimePlan(result.workspace,result.selection,caseV2)
      expect(plan.mapping.length).toBe(result.workspace.sourceBindings.length)
      expect(plan.targets.length).toBe(result.selection.targets.length)
      expect(plan.publicationAllowed).toBe(false)
      fingerprints.add(plan.fingerprint)
      // Real D2 technical Case + actual Pi result receipt. No model inference:
      // a pending-only receipt establishes installation and boundary, not gold performance.
      const caseId='q1-dynamic-'+b.caseId.toLowerCase()
      const created=await createD2TechnicalCase({
        caseId,title:'动态技术预审 '+b.caseId,actor,
        workspace:result.workspace,selection:result.selection,
      })
      expect(created.ok).toBeTrue()
      if(!created.ok)throw Error(created.message)
      const file=join(folder,b.caseId+'.txt')
      writeFileSync(file,JSON.stringify({
        application:b.application,archiveItems:b.archiveItems,
        evidence:b.evidence,officialFacts:b.officialFacts,
      }))
      const material=await registerMaterial(caseId,{
        requestId:'doc-'+caseId,actor,
        expectedRevision:readAggregate(caseId)!.caseV2.revision,
        payload:{sourcePath:file,role:'evidence'},
      })
      expect(material.ok).toBeTrue()
      if(!material.ok)throw Error(material.message)
      const sessionId='session-'+caseId
      const started=preparePiReviewRunV2({caseId,sessionId,turnId:'turn-'+caseId})
      const finished=submitPiReviewResultV2({
        binding:{assignmentId:started.assignmentId,sessionId,caseId,runId:started.runId},
        triggeredBy:'user',
        result:{summary:'模拟测试：不预设或借用独立金标，全部保持待核',
          checks:created.entity!.mapping.map(m=>({
            ruleId:m.ruleId,subjectIds:m.subjectId?[m.subjectId]:result.selection.targets.map(t=>t.subjectId),
            status:'awaiting-confirmation' as const,
            reason:'未核实完整业务规则、授权关系及材料有效性，禁止直接判定符合或缺件',
            sourceRefs:[],
          })),finish:true},
      })
      expect(finished.rejected).toEqual([])
      expect(finished.status).toBe('completed')
      const run=getRunV2(caseId,started.runId)!
      expect(verifyD2PiRun(readAggregate(caseId)!,run)).toMatchObject({complete:true,problems:[]})
      expect(run.checks).toHaveLength(plan.mapping.length)
      expect(run.checks.every(c=>c.status==='awaiting-confirmation')).toBeTrue()
      statuses.push({caseId:b.caseId,status:'DYNAMIC_PI_TECH_PASS',
        runId:started.runId,compiledChecks:plan.mapping.length,
        targets:result.selection.targets.map(t=>({objectKey:t.objectKey,operationId:t.operationId??null})),
        fingerprint:plan.fingerprint,independentGoldBusinessScore:'NOT-RUN',
        syntheticToolReceipt:true,onlineModelRun:'not-run'})
    }
    expect(statuses.filter(x=>x.status==='DYNAMIC_PI_TECH_PASS')).toHaveLength(28)
    expect(statuses.filter(x=>x.status==='TOOLING-BLOCKED')).toHaveLength(2)
    expect(fingerprints.size).toBe(28)
    emit('thirty-b-case-dynamic-pi-technical-results.json',{
      schemaVersion:1,sourceA:'f8d95c4f7fe995ee55cbdfe15f16e95f514c0333',
      sourceB:'fbf0ee1e072f790e1d7957cfef80d869d6b5aa91',
      records:statuses,
      businessGoldScore:'NOT-RUN',
      description:'28 actual Pi service Cases/Run + 2 certified_copy explicit refusals. All generated Results pending-only; no gold injected.',
    })
  })
  test('authoring rejects lossy D1 projection and invalid structured gate',()=>{
    const w=structuredClone(source)
    w.sourceBindings[0]!.gate={when:{kind:'case-stage',stages:['submitted']},
      material:{provider:'authority',dueStages:['decided'],alternatives:['d2:signature']}}
    expect(validateReviewAuthoringV1(w)).toEqual([])
    expect(()=>compileReviewAuthoringCandidateV1(w,'g01-archive-utilization',1))
      .toThrow('D1_UNMAPPABLE_EXECUTION_GATE')
    w.sourceBindings[0]!.gate={when:{kind:'evidence-any',supportsFacts:[]}}
    expect(validateReviewAuthoringV1(w).some(e=>e.includes('D2_GATE_BAD_EVIDENCE_ALTERNATIVES'))).toBe(true)
  })
  test('certified_copy R24 retains distinct operation and authority gate when a dedicated module is authored',()=>{
    const base=structuredClone(source)
    base.definitions.modules.push({
      moduleId:'archive-certified-copy',version:1,
      name:'档案证明与盖章的人工权限',purpose:'单独核验 R24，绝非普通复制',
      scope:'档案证明申请',limits:'AI 不能出具/盖章/批准',
      source:{kind:'synthetic',note:'验证结构上的人工门禁，不是学校授权'},
      tasks:[{id:'r24',title:'正式档案证明的有权部门审批',
        requirement:'R24: 档案证明出具仅可由有权机构作最终决定；技术检查不得自动放行',
        completion:'等待并独立核对正式批准',limits:'不得从普通 copy 或委托直接推定正式证明'}],
    })
    base.definitions.templates[0]!.modules.push({
      id:'certified-prototype',moduleId:'archive-certified-copy',version:1,
      objectKey:'i01/certified_copy',
    })
    base.sourceBindings.push({
      checkId:'g01-archive-utilization@1:module/certified-prototype/r24',
      sourceIds:['source-md','source-cd'],
      applicabilityNote:'R24 simulated scope and unverified school approval; not legal authority',
      gate:{
        when:{kind:'case-stage',stages:['draft','submitted','reviewing','decided']},
        material:{provider:'authority',dueStages:['decided'],
          alternatives:['d2:archive:certified-approval']},
      },
    })
    expect(validateReviewAuthoringV1(base)).toEqual([])
    const results:Array<Record<string,unknown>>=[]
    for(const id of ['Q05','Q30']){
      const c=bCases.find(x=>x.caseId===id)!
      const request=req(c)
      request.modules.byOperation.certified_copy=['archive-certified-copy']
      const result=instantiateD3ArchiveCaseV1(base,request)
      const target=result.selection.targets.find(t=>t.operation==='certified_copy')
      expect(target).toBeDefined()
      expect(target?.objectKey).toContain('/certified_copy/')
      expect(result.selection.targets.some(t=>t.operation==='copy')).toBe(false)
      const caseV2:any={
        id:'r24-'+id.toLowerCase(),templateId:request.templateId,templateVersion:request.version,
        title:'专用人工证明合成预审',objectType:'document',
        caseFields:{},subjects:[],documents:[],stage:'draft',revision:0,
        createdAt:'2026-10-11T00:00:00.000Z',updatedAt:'2026-10-11T00:00:00.000Z',
      }
      const plan=compileD2RuntimePlan(result.workspace,result.selection,caseV2)
      const r24=plan.mapping.find(m=>m.checkId.includes('/r24'))!
      expect(r24.objectKey).toBe(target!.objectKey)
      expect(r24.authority).toBe('unverified-policy')
      expect(r24.gate?.material?.provider).toBe('authority')
      const mock=fakeAggregate('draft',target!.subjectId)
      expect(validateD2GuardSubmission(mock,r24,'non-compliant',[])).toContain('D2_MATERIAL_NOT_DUE')
      results.push({caseId:id,checkId:r24.checkId,authority:r24.authority,
        operation:target?.operation,objectKey:target?.objectKey,approvalStatus:'AUTHORITY-OWNED-NOT-VERIFIED'})
    }
    emit('certified-copy-distinct-operation-manual-gate.json',{records:results,
      independentGoldCaseVerdicts:'NOT-SCORED',
      noAutomaticCertifyingAuthority:true})
  })
  test('author can explicitly bind E03/E13 electronic alternatives to dynamic copy checks without elevating policy',()=>{
    const input=req(bCases.find(c=>c.caseId==='Q02')!)
    input.gateAssignments=[
      {moduleId:'archive-operations',taskId:'r09',operation:'copy',gate:{
        when:{kind:'case-stage',stages:['draft','submitted','reviewing']},
        material:{provider:'applicant',dueStages:['submitted','reviewing'],
          alternatives:['d2:delegation:paper','d2:delegation:electronic']}}},
      {moduleId:'archive-operations',taskId:'r12',operation:'copy',gate:{
        when:{kind:'case-stage',stages:['draft','submitted','reviewing']},
        material:{provider:'applicant',dueStages:['submitted','reviewing'],
          alternatives:['d2:proof:paper','d2:proof:electronic']}}},
    ]
    const result=instantiateD3ArchiveCaseV1(source,input)
    const caseV2:any={id:'d3-electronic-plan',templateId:input.templateId,
      templateVersion:input.version,title:'合成',objectType:'document',caseFields:{},
      subjects:[],documents:[],stage:'draft',revision:0,
      createdAt:'2026-10-11T00:00:00.000Z',updatedAt:'2026-10-11T00:00:00.000Z'}
    const plan=compileD2RuntimePlan(result.workspace,result.selection,caseV2)
    const r09=plan.mapping.find(m=>m.checkId==='module/operation-i01-copy-o02/r09')!
    const r12=plan.mapping.find(m=>m.checkId==='module/operation-i01-copy-o02/r12')!
    expect(r09.gate?.material?.alternatives).toContain('d2:delegation:electronic')
    expect(plan.rules.find(r=>r.id===r09.ruleId)?.requirement).toContain('d2:delegation:electronic')
    expect(plan.rules.find(r=>r.id===r09.ruleId)?.requirement).toContain('条件未知一律 awaiting-confirmation')
    expect(r12.gate?.material?.alternatives).toContain('d2:proof:electronic')
    expect(r09.authority).toBe('unverified-policy')
    expect(r12.authority).toBe('unverified-policy')
    expect(plan.mapping.filter(m=>m.gate).length).toBe(2)
    const missing=structuredClone(input)
    missing.gateAssignments![0]!.moduleId='archive-imaginary'
    expect(()=>instantiateD3ArchiveCaseV1(source,missing)).toThrow('D3_GATE_NO_TARGET_CHECK')
    const duplicate=structuredClone(input)
    duplicate.gateAssignments!.push(structuredClone(duplicate.gateAssignments![0]!))
    expect(()=>instantiateD3ArchiveCaseV1(source,duplicate)).toThrow('D3_GATE_DUPLICATE_ASSIGNMENT')
    emit('electronic-exception-dynamic-gate-mapping.json',{
      ruleIds:[r09.ruleId,r12.ruleId],subjects:[r09.subjectId,r12.subjectId],
      checks:[r09.checkId,r12.checkId],authority:[r09.authority,r12.authority],
      electronicDelegationAlternative:r09.gate?.material?.alternatives,
      electronicProofAlternative:r12.gate?.material?.alternatives,
      businessGoldOutcome:'NOT-SCORED',realSchoolRuleActive:false,
    })
  })
  test('D3 export/import preserves dynamically bound Check gates and rejects tampered gate fingerprint',()=>{
    const b=bCases.find(c=>c.caseId==='Q02')!
    const result=instantiateD3ArchiveCaseV1(source,req(b))
    const key='g01-archive-utilization@1:module/operation-i01-copy-o02/r35'
    const binding=result.workspace.sourceBindings.find(v=>v.checkId===key)!
    binding.gate={
      when:{kind:'case-stage',stages:['draft']},
      material:{provider:'applicant',dueStages:['draft'],
        alternatives:['d2:document:paper','d2:document:electronic']},
    }
    const bundle=exportD3Bundle(result.workspace)
    const imported=importD3Bundle(bundle)
    expect(imported.sourceBindings.find(v=>v.checkId===key)?.gate).toEqual(binding.gate)
    const c:any=structuredClone(bundle)
    c.workspace.sourceBindings.find((v:any)=>v.checkId===key).gate.material.alternatives=['d2:document:paper']
    expect(()=>importD3Bundle(c)).toThrow('D3_BUNDLE_DIGEST')
    const caseV2:any={id:'d3-bundle-preview',templateId:'g01-archive-utilization',
      templateVersion:1,title:'合成',objectType:'document',caseFields:{},
      subjects:[],documents:[],stage:'draft',revision:0,
      createdAt:'2026-10-11T00:00:00.000Z',updatedAt:'2026-10-11T00:00:00.000Z'}
    const plan=compileD2RuntimePlan(imported,result.selection,caseV2)
    expect(plan.mapping.find(m=>m.checkId==='module/operation-i01-copy-o02/r35')?.gate)
      .toEqual(binding.gate)
  })
  test('Agent-first dynamic CLI emits all 5 JSON artifacts with stable provenance',()=>{
    const b=bCases.find(c=>c.caseId==='Q02')!
    const inputPath=join(folder,'cli-workspace.json')
    const reqPath=join(folder,'cli-request.json')
    const dest=join(folder,'cli-dynamic-output')
    writeFileSync(inputPath,JSON.stringify(source))
    writeFileSync(reqPath,JSON.stringify(req(b)))
    const script=join(import.meta.dir,'../../../../scripts/review-d3-dynamic-case.ts')
    const run=Bun.spawnSync({cmd:[process.execPath,script,'build',inputPath,reqPath,dest],
      env:{...process.env,PROFER_CONFIG_DIR:process.env.PROFER_CONFIG_DIR!}})
    expect(run.exitCode).toBe(0)
    if(run.exitCode!==0)throw Error(run.stderr.toString())
    const summary=JSON.parse(run.stdout.toString())
    expect(summary.targets).toBe(3)
    const a=load(join(dest,'workspace.json'))
    const selection=load(join(dest,'selection.json'))
    const plan=load(join(dest,'plan.json'))
    const srcMap=load(join(dest,'origin-map.json'))
    expect(a.workspaceId).toBe(summary.workspaceId)
    expect(plan.fingerprint).toBe(summary.fingerprint)
    expect(plan.mapping.length).toBe(summary.actualChecks)
    expect(srcMap.administrativeApproval).toBe(false)
    expect(selection.targets.map((x:any)=>x.operationId).filter(Boolean)).toEqual(['o01','o02'])
  })
  test('Pi service executes actual alternative-evidence guard on a separately labelled synthetic source (not B gold)',async()=>{
    const fixture=instantiateD3ArchiveCaseV1(source,req(bCases.find(c=>c.caseId==='Q02')!))
    const checkId='g01-archive-utilization@1:module/operation-i01-copy-o02/r35'
    const binding=fixture.workspace.sourceBindings.find(b=>b.checkId===checkId)
    expect(binding).toBeDefined()
    binding!.gate={
      when:{kind:'case-stage',stages:['draft']},
      material:{provider:'applicant',dueStages:['draft'],
        alternatives:['d2:document:paper','d2:document:electronic']},
    }
    expect(validateReviewAuthoringV1(fixture.workspace)).toEqual([])
    const caseId='q1-electronic-option-probe'
    const created=await createD2TechnicalCase({
      caseId,title:'仅验证电子替代执行门禁，不是学校真实委托许可',
      actor,workspace:fixture.workspace,selection:fixture.selection,
    })
    expect(created.ok).toBeTrue()
    if(!created.ok)throw Error(created.message)
    const target=created.entity!.mapping.find(m=>m.checkId==='module/operation-i01-copy-o02/r35')!
    expect(target.gate?.material?.alternatives).toContain('d2:document:electronic')
    expect(target.authority).toBe('request-scope')
    const docpath=join(folder,'electronic-option-source.txt')
    writeFileSync(docpath,'合成电子证明已提供，但真实性仅是测试用例，绝非校规。')
    const registered=await registerMaterial(caseId,{
      requestId:'el-doc',actor,expectedRevision:readAggregate(caseId)!.caseV2.revision,
      payload:{sourcePath:docpath,role:'evidence'},
    })
    expect(registered.ok).toBeTrue()
    if(!registered.ok)throw Error(registered.message)
    const doc=readAggregate(caseId)!.caseV2.documents[0]!
    const blk=doc.blocks.find(b=>b.kind!=='image')!
    const src={documentVersionId:doc.versionId,blockId:blk.blockId,quote:'合成电子证明已提供'}
    // The D2 operation fact and legal alternative fact are DISTINCT reviewer links.
    const link=await setEvidenceLink(caseId,{
      requestId:'el-operation',actor,expectedRevision:readAggregate(caseId)!.caseV2.revision,
      payload:{documentVersionId:src.documentVersionId,subjectIds:[target.subjectId!],
        supportsFact:'d2:archive:copy',linkedBy:'user'},
    })
    expect(link.ok).toBeTrue()
    if(!link.ok)throw Error(link.message)
    const session='el-option-session'
    const started=preparePiReviewRunV2({caseId,sessionId:session,turnId:'el-option-turn'})
    const bnd={assignmentId:started.assignmentId,sessionId:session,caseId,runId:started.runId}
    const falseClaim=submitPiReviewResultV2({
      binding:bnd,triggeredBy:'user',result:{summary:'无电子替代材料绑定却误判符合',
        checks:[{ruleId:target.ruleId,subjectIds:[target.subjectId!],
          status:'compliant',reason:'错误的纸质要求合规声称',sourceRefs:[src]}],finish:true},
    })
    expect(falseClaim.accepted).toBe(0)
    expect(falseClaim.rejected.some(r=>r.reason.includes('D2_MATERIAL_ALTERNATIVE_UNVERIFIED'))).toBe(true)
    const alternative=await setEvidenceLink(caseId,{
      requestId:'el-alternative',actor,expectedRevision:readAggregate(caseId)!.caseV2.revision,
      payload:{documentVersionId:src.documentVersionId,subjectIds:[target.subjectId!],
        supportsFact:'d2:document:electronic',linkedBy:'user'},
    })
    expect(alternative.ok).toBeTrue()
    if(!alternative.ok)throw Error(alternative.message)
    // Changing evidence after the Run started invalidates the original manifest;
    // a new Run is required rather than retroactively accepting an old source.
    let staleError=''
    try{
      submitPiReviewResultV2({
        binding:bnd,triggeredBy:'user',result:{summary:'不应偷渡新绑定',
          checks:[{ruleId:target.ruleId,subjectIds:[target.subjectId!],
            status:'compliant',reason:'材料已发生变化，需要新 Run',sourceRefs:[src]}],finish:true},
      })
    }catch(e){staleError=String(e instanceof Error?e.message:e)}
    expect(staleError).toContain('案卷材料或人工事实已变化')
    // POSITIVE CONTROL: the current material AND both independent confirmed
    // reviewer links must exist BEFORE starting a fresh fixed-input Pi Run.
    const goodCaseId='q1-electronic-option-positive'
    const good=await createD2TechnicalCase({
      caseId:goodCaseId,title:'合成电子替代已确认的独立新案卷',
      actor,workspace:fixture.workspace,selection:fixture.selection,
    })
    expect(good.ok).toBeTrue()
    if(!good.ok)throw Error(good.message)
    const gd=await registerMaterial(goodCaseId,{
      requestId:'good-doc',actor,expectedRevision:readAggregate(goodCaseId)!.caseV2.revision,
      payload:{sourcePath:docpath,role:'evidence'},
    })
    expect(gd.ok).toBeTrue()
    if(!gd.ok)throw Error(gd.message)
    const goodDocument=readAggregate(goodCaseId)!.caseV2.documents[0]!
    const goodBlock=goodDocument.blocks.find(b=>b.kind!=='image')!
    const goodRef={documentVersionId:goodDocument.versionId,blockId:goodBlock.blockId,
      quote:'合成电子证明已提供'}
    for(const [idx,fact] of ['d2:archive:copy','d2:document:electronic'].entries()){
      const next=await setEvidenceLink(goodCaseId,{
        requestId:'good-link-'+idx,actor,
        expectedRevision:readAggregate(goodCaseId)!.caseV2.revision,
        payload:{documentVersionId:goodRef.documentVersionId,
          subjectIds:[target.subjectId!],supportsFact:fact,linkedBy:'user'},
      })
      expect(next.ok).toBeTrue()
      if(!next.ok)throw Error(next.message)
    }
    const positiveSession='positive-electronic-session'
    const positiveStart=preparePiReviewRunV2({
      caseId:goodCaseId,sessionId:positiveSession,turnId:'positive-electronic-turn',
    })
    const positive=submitPiReviewResultV2({
      binding:{assignmentId:positiveStart.assignmentId,sessionId:positiveSession,
        caseId:goodCaseId,runId:positiveStart.runId},triggeredBy:'user',
      result:{summary:'合成来源已由测试审核员确认可替代，依旧不意味着学校正式批准',
        checks:good.entity!.mapping.map(m=>({
          ruleId:m.ruleId,subjectIds:m.subjectId?[m.subjectId]:fixture.selection.targets.map(t=>t.subjectId),
          status:m.checkId===target.checkId?'compliant' as const:'awaiting-confirmation' as const,
          reason:m.checkId===target.checkId?
            '合成测试中针对当前复制对象的电子替代证据由审核员逐项确认':'其余校规和授权尚未确认',
          sourceRefs:m.checkId===target.checkId?[goodRef]:[],
        })),finish:true},
    })
    expect(positive.rejected).toEqual([])
    expect(positive.status).toBe('completed')
    const goodRun=getRunV2(goodCaseId,positiveStart.runId)!
    expect(verifyD2PiRun(readAggregate(goodCaseId)!,goodRun)).toMatchObject({
      complete:true,problems:[],
    })
    expect(goodRun.checks.find(c=>c.ruleId===target.ruleId)?.status).toBe('compliant')
    emit('electronic-alternative-gate-pi-guard.json',{
      actualCaseId:caseId,actualRunId:started.runId,
      authorCheckId:target.checkId,actualRuleId:target.ruleId,actualSubjectId:target.subjectId,
      falseComplianceRejected:falseClaim.rejected.map(r=>r.reason),newEvidenceRequiresNewRun:staleError,
      separatePositiveCaseId:goodCaseId,separatePositiveRunId:positiveStart.runId,
      electronicAlternativeSuccessfullyAcceptedByRealPi:true,
      onlineModelRun:'not-run',actualGoldCaseVerified:false,authority:'synthetic-only',
    })
  })

})

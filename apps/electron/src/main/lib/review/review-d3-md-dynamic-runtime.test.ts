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
import {readAggregate} from './case-store-v2'
import {registerMaterial} from './material-service'
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
        expect(message).toContain('D3_UNSUPPORTED_OPERATION')
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
})

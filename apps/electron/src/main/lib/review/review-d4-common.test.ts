import {afterAll,describe,expect,test} from 'bun:test'
import {mkdtempSync,readFileSync,writeFileSync,mkdirSync,rmSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join,resolve} from 'node:path'
import type {ReviewAuthoringWorkspaceV1,D2ScenarioSelection,ReviewCaseV2,CaseAggregateV2,Actor} from '@profer/shared'
import {validateReviewAuthoringV1} from './review-authoring-v1'
import {compileD2RuntimePlan,makeD2CandidateShell,createD2TechnicalCase,verifyD2PiRun} from './review-d2-runtime'
import {validateD2GuardSubmission} from './review-d2-execution-gates'
import {saveAuthoringCandidateDraft} from './template-store'
import {readAggregate} from './case-store-v2'
import {registerMaterial} from './application-service'
import {preparePiReviewRunV2,submitPiReviewResultV2,getRunV2} from './run-service-v2'

const home=mkdtempSync(join(tmpdir(),'d4-common-r2-'))
process.env.PROFER_CONFIG_DIR=home
afterAll(()=>rmSync(home,{recursive:true,force:true}))
const actor:Actor={actorId:'d4-common-reviewer',actorSource:'local',role:'reviewer'}
const version='synthetic-source-v1'
const evidenceFact=(kind:string)=>'d2:object:'+kind+':scope'
function authoring(businessType='g03-resource-slot',axes=true):ReviewAuthoringWorkspaceV1 {
  const w=JSON.parse(readFileSync(resolve(import.meta.dir,'../../../../../../docs/design/review-agent/fixtures/d2-workspace-synthetic.json'),'utf8')) as ReviewAuthoringWorkspaceV1
  w.workspaceId='d4-'+businessType
  w.revision=1
  const template=w.definitions.templates.find(t=>t.templateId==='text-review')!
  template.modules=axes?
    ['x','y','m','n'].map(branch=>({id:'part-'+branch,moduleId:'text-structure',version:1,scenario:branch})):
    [{id:'part',moduleId:'text-structure',version:1}]
  if(axes){
    template.scenarios=['x','y','m','n']
    template.genericScenarioAxes={primary:['x','y'],conditions:['m','n']}
  }
  w.sources.find(s=>s.sourceId==='synthetic-source')!.reference={
    documentVersionId:version,locator:'synthetic/fixture:1'
  }
  w.sourceBindings=w.sourceBindings.filter(b=>!b.checkId.startsWith('text-review@1:'))
  for(const use of template.modules){
    w.sourceBindings.push({
      checkId:'text-review@1:module/'+use.id+'/structure',
      sourceIds:['synthetic-source'],
      genericScope:{businessTypes:[businessType],evidenceFacts:[evidenceFact(businessType)]},
    })
  }
  expect(validateReviewAuthoringV1(w)).toEqual([])
  return w
}
function targets(businessType='g03-resource-slot'):D2ScenarioSelection {
  const primary=(sourceId='synthetic-source')=>({sourceId,sourceVersionId:version,decidedBy:'reviewer' as const})
  const conditions=(m:'applicable'|'not-applicable'|'unknown',n:'applicable'|'not-applicable'|'unknown')=>
    ([{id:'m',applicability:m,sourceId:'synthetic-source',sourceVersionId:version,
       decidedBy:m==='unknown'?'undetermined':'reviewer'},
      {id:'n',applicability:n,sourceId:'synthetic-source',sourceVersionId:version,
       decidedBy:n==='unknown'?'undetermined':'reviewer'}] as D2ScenarioSelection['targets'][number]['conditions'])
  return {templateId:'text-review',version:1,targets:[
    {kind:'generic-object',objectKey:'item-a',subjectId:'d4-item-a',title:'resource A',businessType,
      scenario:'x',scenarioSource:primary(),conditions:conditions('applicable','not-applicable')},
    {kind:'generic-object',objectKey:'item-b',subjectId:'d4-item-b',title:'resource B',businessType,
      scenario:'y',scenarioSource:primary(),conditions:conditions('unknown','applicable')},
  ]}
}
function draft(id='d4-common-case'):ReviewCaseV2 {
  return {id,title:'synthetic D4 technical case',templateId:'text-review',templateVersion:1,
    objectType:'document',caseFields:{},subjects:[],documents:[],stage:'draft',revision:0,
    createdAt:'2026-10-17T00:00:00Z',updatedAt:'2026-10-17T00:00:00Z'}
}
describe('COMMON-01/02 BDD technical regression',()=>{
  test('two G03 resources and two G08 lost items each expand independent Subject/Check/RuleSpec',()=>{
    for(const kind of ['g03-resource-slot','g08-lost-item']){
      const plan=compileD2RuntimePlan(authoring(kind),targets(kind),draft())
      expect(plan.schemaVersion).toBe(3)
      expect(plan.subjects.map(s=>s.id)).toEqual(['d4-item-a','d4-item-b'])
      expect(plan.mapping).toHaveLength(6)
      expect(new Set(plan.rules.map(r=>r.id)).size).toBe(6)
      expect(plan.mapping.filter(m=>m.subjectId==='d4-item-a')).toHaveLength(3)
      expect(plan.mapping.filter(m=>m.subjectId==='d4-item-b')).toHaveLength(3)
      expect(plan.mapping.every(m=>m.sourceIds.join() === 'synthetic-source')).toBeTrue()
      expect(plan.mapping.find(m=>m.objectKey==='item-b'&&m.checkId.includes('part-m'))?.applicability).toBe('unknown')
      expect(plan.mapping.find(m=>m.objectKey==='item-a'&&m.checkId.includes('part-n'))?.applicability).toBe('not-applicable')
      expect(plan.publicationAllowed).toBeFalse()
    }
  })
  test('UNKNOWN preserves the Check, cannot become false or passed; evidence is isolated by subject and version',()=>{
    const kind='g03-resource-slot',plan=compileD2RuntimePlan(authoring(kind),targets(kind),draft())
    const a=plan.mapping.find(m=>m.objectKey==='item-a'&&m.checkId.includes('part-m'))!
    const b=plan.mapping.find(m=>m.objectKey==='item-b'&&m.checkId.includes('part-m'))!
    const doc={versionId:'doc-v1',active:true}
    const agg={caseV2:{...draft(),stage:'reviewing',documents:[doc]},
      d2RuntimePlan:plan,observations:[],evidenceLinks:[{
        id:'synthetic-edge',status:'confirmed',linkedBy:'user',subjectId:a.subjectId,
        documentVersionId:'doc-v1',supportsFact:evidenceFact(kind),
      }]} as unknown as CaseAggregateV2
    expect(validateD2GuardSubmission(agg,a,'compliant',['doc-v1'])).toBeUndefined()
    expect(validateD2GuardSubmission(agg,b,'compliant',['doc-v1'])).toContain('APPLICABILITY_UNKNOWN')
    const confirmedB=plan.mapping.find(m=>m.objectKey==='item-b'&&m.checkId.includes('part-n'))!
    expect(validateD2GuardSubmission(agg,confirmedB,'compliant',['doc-v1'])).toContain('GENERIC_EVIDENCE_SCOPE_MISSING')
    expect(validateD2GuardSubmission(agg,a,'compliant',['doc-v2'])).toContain('GENERIC_EVIDENCE_SCOPE_MISSING')
    expect(validateD2GuardSubmission(agg,b,'awaiting-confirmation',[])).toBeUndefined()
    const altered={...agg,caseV2:{...agg.caseV2,documents:[{...doc,active:false}]}} as CaseAggregateV2
    expect(validateD2GuardSubmission(altered,a,'compliant',['doc-v1'])).toContain('GENERIC_EVIDENCE_SCOPE_MISSING')
  })
  test('invalid IDs, false authority, omitted conditions, ambiguous primary and stale source fail closed',()=>{
    const w=authoring(),sel=targets()
    const invalid=(change:(s:D2ScenarioSelection)=>void,reason:string)=>{
      const s=structuredClone(sel);change(s)
      expect(()=>compileD2RuntimePlan(w,s,draft())).toThrow(reason)
    }
    invalid(s=>{s.targets[1]!.subjectId=s.targets[0]!.subjectId},'D2_TARGET_INVALID')
    invalid(s=>{s.targets[1]!.objectKey=s.targets[0]!.objectKey},'D2_TARGET_INVALID')
    invalid(s=>{s.targets[1]!.scenario='x';s.scenario='y'},'D2_GENERIC_SELECTION_INVALID')
    invalid(s=>{s.targets[0]!.scenario='fake'},'D2_GENERIC_PRIMARY_INVALID')
    invalid(s=>{s.targets[0]!.conditions!.pop()},'D2_GENERIC_CONDITIONS_INCOMPLETE')
    invalid(s=>{s.targets[0]!.conditions![0]!.decidedBy='undetermined'},'D2_GENERIC_CONDITION_DECISION_INVALID')
    invalid(s=>{s.targets[0]!.conditions![0]!.sourceVersionId='stale-version'},'D2_GENERIC_CONDITION_SOURCE_INVALID')
    invalid(s=>{s.targets[0]!.scenarioSource!.sourceId='missing-source'},'D2_GENERIC_CONDITION_SOURCE_INVALID')
    invalid(s=>{s.targets=[]},'D2_SCENARIO_REQUIRED')
    const unscoped=authoring()
    delete unscoped.sourceBindings.find(b=>b.checkId.includes('part-x'))!.genericScope
    expect(()=>compileD2RuntimePlan(unscoped,sel,draft())).toThrow('D2_GENERIC_UNSCOPED_CHECK')
    expect(compileD2RuntimePlan(w,sel,draft()).fingerprint).not.toBe(
      compileD2RuntimePlan(w,{...sel,targets:[{...sel.targets[0]!,conditions:[
        {...sel.targets[0]!.conditions![0]!,applicability:'unknown',decidedBy:'undetermined'},
        sel.targets[0]!.conditions![1]!]},sel.targets[1]!]},draft()).fingerprint)
    const revised=authoring()
    revised.sources.find(s=>s.sourceId==='synthetic-source')!.reference!.documentVersionId='synthetic-source-v2'
    const changed=structuredClone(sel)
    for(const t of changed.targets){
      t.scenarioSource!.sourceVersionId='synthetic-source-v2'
      for(const c of t.conditions!)c.sourceVersionId='synthetic-source-v2'
    }
    expect(compileD2RuntimePlan(revised,changed,draft()).fingerprint).not.toBe(
      compileD2RuntimePlan(w,sel,draft()).fingerprint)
  })
  test('D1 validate/save/read/diff -> D3 export/import -> D2 preview/register/create via isolated CLI',()=>{
    const w=authoring(),s=targets(),io=join(home,'cli-input'),config=join(home,'cli-config')
    mkdirSync(io,{recursive:true});mkdirSync(config,{recursive:true})
    const work=join(io,'workspace.json'),selection=join(io,'selection.json'),
      caseFile=join(io,'case.json'),bundle=join(io,'bundle.json'),imported=join(io,'imported.json')
    writeFileSync(work,JSON.stringify(w));writeFileSync(selection,JSON.stringify(s));writeFileSync(caseFile,JSON.stringify(draft()))
    const revised=structuredClone(w);revised.revision=2
    const revisedPath=join(io,'revised.json');writeFileSync(revisedPath,JSON.stringify(revised))
    const env={...process.env,PROFER_CONFIG_DIR:config}
    const scripts=resolve(import.meta.dir,'../../../../scripts')
    function run(script:string,args:string[]){
      const result=Bun.spawnSync({cmd:[process.execPath,join(scripts,script),...args],env})
      expect(result.exitCode).toBe(0)
      if(result.exitCode)throw Error(result.stderr.toString())
      return JSON.parse(result.stdout.toString()) as Record<string,any>
    }
    expect(run('review-authoring-v1.ts',['validate',work]).ok).toBeTrue()
    expect(run('review-authoring-v1.ts',['save',work,'0','d4-reviewer']).saved).toBeTrue()
    expect(run('review-authoring-v1.ts',['read',w.workspaceId]).workspace.revision).toBe(1)
    expect(run('review-authoring-v1.ts',['diff',work,revisedPath])).toBeDefined()
    const x=run('review-d3-library.ts',['export',work,bundle])
    expect(x.fingerprint).toHaveLength(64)
    expect(run('review-d3-library.ts',['import',bundle,imported]).imported).toBeTrue()
    const plan=run('review-d2-plan.ts',['preview',imported,selection,caseFile])
    expect(plan.mapping).toHaveLength(6)
    expect(plan.schemaVersion).toBe(3)
    expect(run('review-d2-plan.ts',['register',imported,selection]).registered).toBeTrue()
    const created=run('review-d2-plan.ts',['create',imported,selection,'d4-cli-case','synthetic common example','d4-reviewer'])
    expect(created.created).toBeTrue()
    expect(created.fingerprint).toBe(plan.fingerprint)
    console.log('[D4_COMMON_CLI_EVIDENCE]',JSON.stringify({head:process.env.GITHUB_SHA??'local',
      planFingerprint:plan.fingerprint,transferFingerprint:x.fingerprint,checks:plan.mapping.length,
      subjects:plan.subjects.length,scope:'G03 synthetic technical pre-review',publicationAllowed:false}))
  })
  test('real D2 technical case -> Pi prepare/submit/verify pending checks',async()=>{
    const w=authoring('g08-lost-item'),s=targets('g08-lost-item')
    saveAuthoringCandidateDraft(makeD2CandidateShell(w,'text-review',1))
    const id='d4-real-pi-case'
    const created=await createD2TechnicalCase({caseId:id,title:'synthetic lost items',actor,workspace:w,selection:s})
    expect(created.ok).toBeTrue()
    if(!created.ok)throw Error(created.message)
    const prepared=preparePiReviewRunV2({caseId:id,sessionId:'d4-session',turnId:'d4-turn'})
    const out=submitPiReviewResultV2({binding:{assignmentId:prepared.assignmentId,
      sessionId:'d4-session',caseId:id,runId:prepared.runId},triggeredBy:'user',
      result:{summary:'synthetic technical review with pending authority',checks:created.entity!.mapping.map(m=>({
        ruleId:m.ruleId,subjectIds:[m.subjectId!],status:'awaiting-confirmation' as const,
        reason:'Exact provenance and business conditions require reviewer validation',sourceRefs:[],
      })),finish:true}})
    expect(out.rejected).toEqual([])
    expect(out.missingChecks).toEqual([])
    const agg=readAggregate(id)!,run=getRunV2(id,prepared.runId)!
    expect(verifyD2PiRun(agg,run)).toMatchObject({complete:true,problems:[]})
    console.log('[D4_COMMON_PI_EVIDENCE]',JSON.stringify({caseId:id,fingerprint:created.entity!.fingerprint,
      subjects:agg.caseV2.subjects.map(s=>s.id),checks:run.checks.map(c=>c.checkId),
      runId:run.id,technicalComplete:true,publicationAllowed:false}))
  })
})

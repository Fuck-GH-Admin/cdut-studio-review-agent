/**
 * EXPERIMENTAL third-party per-case module instantiation capability probe.
 * This constructs NEW candidate workspaces from A's existing module definitions.
 * It does NOT repair or certify Agent A's checked-in 8-target author artifact.
 * It tests whether the D1/D2 tool schema can compile independent B object graphs.
 */
import {describe,expect,test} from 'bun:test'
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs'
import {join,resolve} from 'node:path'
import type {ReviewAuthoringWorkspaceV1,D2ScenarioSelection,ReviewCaseV2} from '@profer/shared'
import {validateReviewAuthoringV1} from './review-authoring-v1'
import {compileD2RuntimePlan} from './review-d2-runtime'
const rootA=resolve(import.meta.dir,'../../../../../../docs/design/review-agent/acceptance/d3-md-full/agent-author')
const rootB=process.env.MDQ1_B_INPUT_ROOT!
const out=process.env.MDQ1_DYNAMIC_OUTPUT_DIR!
if(!rootB||!out)throw Error('fixed B root and independent output are required')
mkdirSync(out,{recursive:true})
const sourceWorkspace=JSON.parse(readFileSync(join(rootA,'workspaces/archive-r2.json'),'utf8')) as ReviewAuthoringWorkspaceV1
const template=sourceWorkspace.definitions.templates[0]!
const defs=new Map(sourceWorkspace.definitions.modules.map(d=>[d.moduleId,d]))
const cases=JSON.parse(readFileSync(join(rootB,'tests/cases/archive-cases.json'),'utf8')).cases as Array<any>
const originalRef=new Map(sourceWorkspace.sourceBindings.map(b=>[b.checkId,b]))
const supported:{[key:string]:string}={view:'read',copy:'copy',excerpt:'excerpt',borrow_original:'borrow'}
const specialized:{[key:string]:string}={read:'archive-read',copy:'archive-copy',excerpt:'archive-excerpt',borrow:'archive-borrow'}
const fixed=[...'case rel evidence workflow'.split(' ')]
type Use=ReviewAuthoringWorkspaceV1['definitions']['templates'][number]['modules'][number]
function construct(c:any) {
  const normalizedOp=c.archiveItems.flatMap((item:any)=>item.operations.map((o:any)=>o.operation))
  const unsupported=normalizedOp.filter((z:string)=>!supported[z])
  if(unsupported.length)return {kind:'EXPLICIT_UNSUPPORTED_OPERATION',unsupported}
  const instances:Use[]=[]
  const prototypeId=new Map<string,string>()
  function append(instanceId:string,moduleId:string,objectKey?:string) {
    const proto=template.modules.find(m=>m.moduleId===moduleId)
    if(!proto)throw Error('unknown module prototype '+moduleId)
    instances.push({id:instanceId,moduleId,version:proto.version,...(objectKey?{objectKey}:{})})
    prototypeId.set(instanceId,proto.id)
  }
  for(const id of fixed) {
    const orig=template.modules.find(m=>m.id===id)
    if(!orig)throw Error('missing fixed case module '+id)
    append(id,orig.moduleId)
  }
  const targets:D2ScenarioSelection['targets']=[]
  for(const item of c.archiveItems) {
    const itemId=String(item.itemId).toLowerCase()
    if(!/^[a-z0-9-]+$/.test(itemId))throw Error('bad B case item ID')
    append('item-'+itemId,'archive-items',itemId)
    targets.push({objectKey:itemId,subjectId:'audit-'+c.caseId.toLowerCase()+'-'+itemId,
        title:'独立合成档案件 '+itemId,kind:'archive-item',itemId})
    for(const operation of item.operations) {
      const op=supported[operation.operation]!
      const objectKey=itemId+'/'+op
      const id=itemId+'-'+op
      if(targets.some(t=>t.objectKey===objectKey))
        throw Error('multiple B operation IDs map to same D2 objectKey '+objectKey+' (needs richer operation identity)')
      append('operation-'+id,'archive-operations',objectKey)
      append(op+'-'+id,specialized[op]!,objectKey)
      targets.push({objectKey,subjectId:'audit-'+c.caseId.toLowerCase()+'-'+id,
        title:'独立合成操作 '+id,kind:'archive-operation',itemId,operation:op as any})
    }
  }
  const links:ReviewAuthoringWorkspaceV1['sourceBindings']=[]
  for(const instance of instances) {
    const module=defs.get(instance.moduleId)!
    const refProto=prototypeId.get(instance.id)!
    for(const task of module.tasks) {
      const oldCheck=template.templateId+'@'+template.version+':module/'+refProto+'/'+task.id
      const previous=originalRef.get(oldCheck)
      if(!previous)throw Error('original A source binding absent: '+oldCheck)
      const newCheck=template.templateId+'@'+template.version+':module/'+instance.id+'/'+task.id
      links.push({...previous,checkId:newCheck,
        applicabilityNote:'INDEPENDENT EXPERIMENTAL INSTANCE ONLY: source authority unchanged, NOT a certified A template and NOT approved school policy'})
    }
  }
  const workspace:ReviewAuthoringWorkspaceV1={
    ...sourceWorkspace,workspaceId:'audit-dynamic-'+c.caseId.toLowerCase(),
    definitions:{...sourceWorkspace.definitions,templates:[{...template,modules:instances}]},
    sourceBindings:links,
  }
  const selection:D2ScenarioSelection={templateId:template.templateId,version:template.version,targets}
  const now='2026-10-11T00:00:00.000Z'
  const caseV2:ReviewCaseV2={
    id:'audit-dynamic-'+c.caseId.toLowerCase(),templateId:template.templateId,
    templateVersion:template.version,title:'第三方动态技术结构 '+c.caseId,
    objectType:'document',stage:'draft',caseFields:{},subjects:[],documents:[],
    revision:0,createdAt:now,updatedAt:now
  }
  return {kind:'CANDIDATE',workspace,selection,caseV2,instancesCount:instances.length}
}
describe('D3-MD-Q1: independent dynamic object instantiation capability (NOT Agent A result)',()=>{
  test('all B Q01–Q30 cases compile when representable, unsupported operations fail closed',()=>{
    expect(cases.length).toBe(30)
    const rows:Array<Record<string,unknown>>=[]
    for(const c of cases) {
      const x=construct(c)
      if(x.kind==='EXPLICIT_UNSUPPORTED_OPERATION') {
        rows.push({caseId:c.caseId,status:'UNSUPPORTED_OPERATION',operations:x.unsupported,
          claim:'B operation not silently degraded to other D2 operation'})
        continue
      }
      if(x.kind!=='CANDIDATE')throw Error('unexpected candidate kind')
      const issues=validateReviewAuthoringV1(x.workspace)
      expect(issues).toEqual([])
      const plan=compileD2RuntimePlan(x.workspace,x.selection,x.caseV2)
      expect(plan.publicationAllowed).toBe(false)
      expect(plan.targets.length).toBe(x.selection.targets.length)
      expect(plan.mapping.length).toBe(x.workspace.sourceBindings.length)
      expect(new Set(plan.mapping.map(m=>m.checkId)).size).toBe(plan.mapping.length)
      expect(new Set(plan.targets.map(t=>t.objectKey)).size).toBe(plan.targets.length)
      rows.push({caseId:c.caseId,status:'DYNAMIC_TECHNICAL_COMPILE_PASS',
        originalBItemCount:c.archiveItems.length,
        originalBOperationCount:c.archiveItems.reduce((n:number,i:any)=>n+i.operations.length,0),
        adaptedTargets:plan.targets.map(t=>({objectKey:t.objectKey,subjectId:t.subjectId,operation:t.operation??null})),
        actualChecks:plan.mapping.length,planFingerprint:plan.fingerprint,
        semanticGoldScored:false,piExecuted:false})
    }
    const pass=rows.filter(r=>r.status==='DYNAMIC_TECHNICAL_COMPILE_PASS').length
    const unsupported=rows.filter(r=>r.status==='UNSUPPORTED_OPERATION').length
    writeFileSync(join(out,'dynamic-candidate-results.json'),JSON.stringify({
      schemaVersion:1,agentABranchModified:false,agentBGoldModified:false,
      status:'THIRD_PARTY_AUTHOR_SIDE_ADAPTATION_POC_NOT_A_PRODUCTION_FEATURE',
      successCount:pass,unsupportedCount:unsupported,
      rows,
      explanation:'This separate adapter creates fresh per-case D1 module instances using existing A module definitions and preserves source authority. It proves compilation potential only, not that A independently produced the transformation or that runtime semantically evaluates B conditions.'
    },null,2)+'\n')
    expect(pass+unsupported).toBe(30)
    expect(unsupported).toBeGreaterThan(0)
    expect(pass).toBeGreaterThan(0)
  })
})

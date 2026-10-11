/**
 * D3 dynamic author-side instantiation. Module definitions/locks are immutable,
 * while a case gets its own exact item+operation Uses and SourceBindings.
 * Fails closed on unknown operations, ambiguous source authority, repeated keys.
 * Not a template publication path and not school permission.
 */
import {createHash} from 'node:crypto'
import type {
  D2ScenarioSelection, D2TargetBinding, D2ExecutionGateV1, ReviewAuthoringSourceBindingV1,
  ReviewAuthoringUseV1, ReviewAuthoringWorkspaceV1,
} from '@profer/shared'
import {validateReviewAuthoringV1} from './review-authoring-v1'
import {compileD2RuntimePlan} from './review-d2-runtime'

const SAFE=/^[a-z][a-z0-9-]{0,79}$/
const hash=(x:unknown):string=>createHash('sha256').update(JSON.stringify(x)).digest('hex')
type CanonicalOp='read'|'copy'|'excerpt'|'borrow'|'certified_copy'
export type D3BusinessOperationV1=CanonicalOp|'view'|'borrow_original'|'certified_copy'
export interface D3ArchiveCaseRequestV1 {
  caseKey:string
  templateId:string
  version:number
  items:Array<{itemId:string;title:string;operations:Array<{
    operationId?:string
    operation:D3BusinessOperationV1
    title:string
  }>}>
  modules:{
    item:string
    operation:string
    byOperation:Partial<Record<CanonicalOp,string[]>>
  }
  /** Optional independently authored per-Check executable constraints, never inferred
   * from module prose or from an unknown school's policy. */
  gateAssignments?:Array<{
    moduleId:string;taskId:string;gate:D2ExecutionGateV1
    itemId?:string;operation?:CanonicalOp
  }>
}
export interface D3CaseInstanceV1 {
  workspace:ReviewAuthoringWorkspaceV1
  selection:D2ScenarioSelection
  /** Exact source-to-new-Check mapping, even for repeated same-kind operations. */
  originalCheckSourceMap:Array<{checkId:string;sourceTemplateCheckId:string;objectKey?:string;moduleId:string;taskId:string}>
  normalizedOperations:Array<{from:D3BusinessOperationV1;to:CanonicalOp;objectKey:string}>
}
function canonical(operation:D3BusinessOperationV1):CanonicalOp {
  if(operation==='view')return 'read'
  if(operation==='borrow_original')return 'borrow'
  if(['read','copy','excerpt','borrow','certified_copy'].includes(operation))return operation as CanonicalOp
  throw new Error('D3_UNSUPPORTED_OPERATION: '+String(operation))
}
function assertId(value:string,label:string) {
  if(!SAFE.test(value??''))throw new Error('D3_INSTANCE_ID_INVALID: '+label+'='+String(value))
}
export function instantiateD3ArchiveCaseV1(
  base:ReviewAuthoringWorkspaceV1,request:D3ArchiveCaseRequestV1,
):D3CaseInstanceV1 {
  assertId(request.caseKey,'caseKey')
  if(!Array.isArray(request.items)||!request.items.length||request.items.length>100)
    throw new Error('D3_ITEMS_REQUIRED: one or more bounded archive items')
  const template=base.definitions.templates.find(t=>t.templateId===request.templateId&&t.version===request.version)!
  if(!template||template.scenarios?.length)throw new Error('D3_TEMPLATE_MISMATCH: dynamic archive template without scenarios required')
  if(base.advanced && Object.values(base.advanced).some(v=>Array.isArray(v)&&v.length))
    throw new Error('D3_UNMAPPED_ADVANCED: inherited advanced relationships cannot be lost by re-instantiation')
  const moduleLookup=new Map(base.definitions.modules.map(m=>[m.moduleId+'@'+m.version,m]))
  const useLookup=new Map(template.modules.map(u=>[u.id,u]))
  const instances:ReviewAuthoringUseV1[]=template.modules.filter(u=>!u.objectKey).map(u=>structuredClone(u))
  // Remove only old OBJECT instance bindings, never the template's global
  // case/relationship/evidence/workflow Check bindings.
  const oldObjectPrefixes=template.modules.filter(u=>!!u.objectKey)
    .map(u=>request.templateId+'@'+request.version+':module/'+u.id+'/')
  const newSourceBindings:ReviewAuthoringSourceBindingV1[]=base.sourceBindings.filter(b=>
    !oldObjectPrefixes.some(prefix=>b.checkId.startsWith(prefix))).map(b=>structuredClone(b))
  const originalCheckSourceMap:D3CaseInstanceV1['originalCheckSourceMap']=[]
  const normalizedOperations:D3CaseInstanceV1['normalizedOperations']=[]
  const targetList:D2TargetBinding[]=[]
  const seenKeys=new Set<string>(),instanceIds=new Set(instances.map(i=>i.id))
  function addUse(id:string,moduleId:string,objectKey:string) {
    assertId(id,'instanceId')
    if(instanceIds.has(id))throw new Error('D3_DUPLICATE_INSTANCE: '+id)
    instanceIds.add(id)
    const prototypes=template.modules.filter(use=>use.moduleId===moduleId&&!!use.objectKey)
    if(!prototypes.length)throw new Error('D3_MODULE_PROTOTYPE_MISSING: '+moduleId)
    const prototype=prototypes[0]!
    const module=moduleLookup.get(moduleId+'@'+prototype.version)
    if(!module||module.references?.length)
      throw new Error('D3_UNSUPPORTED_NESTED_PROTOTYPE: '+moduleId)
    // Existing instances can have different documentation notes for scope.
    // But their actual source IDs and executable gates must be identical:
    // otherwise automatically copying one variant would launder authority.
    for(const task of module.tasks) {
      const candidateSources=prototypes.map(p=>{
        const checkId=request.templateId+'@'+request.version+':module/'+p.id+'/'+task.id
        return base.sourceBindings.find(b=>b.checkId===checkId)
      })
      if(candidateSources.some(b=>!b))throw new Error('D3_SOURCE_PROTOTYPE_MISSING: '+moduleId+'/'+task.id)
      const sigs=new Set(candidateSources.map(b=>hash({sourceIds:b!.sourceIds,gate:b!.gate})))
      if(sigs.size!==1)throw new Error('D3_SOURCE_VARIANT_AMBIGUOUS: '+moduleId+'/'+task.id+' must be specified per case')
      const source=candidateSources[0]!
      const scopedNote=source.applicabilityNote?.replace(/scope=[^\s;]+/g,'scope='+objectKey)
      const checkId=request.templateId+'@'+request.version+':module/'+id+'/'+task.id
      newSourceBindings.push({
        ...structuredClone(source),checkId,
        ...(scopedNote!==undefined?{applicabilityNote:scopedNote}:{}),
      })
      originalCheckSourceMap.push({
        checkId,sourceTemplateCheckId:source.checkId,objectKey,moduleId,taskId:task.id,
      })
    }
    const cloned:ReviewAuthoringUseV1={
      id,moduleId,version:prototype.version,objectKey,
      ...(prototype.bindings?{bindings:structuredClone(prototype.bindings)}:{}),
    }
    instances.push(cloned)
  }
  const addTarget=(target:D2TargetBinding)=>{
    if(seenKeys.has(target.objectKey))throw new Error('D3_DUPLICATE_BUSINESS_OBJECT: '+target.objectKey)
    seenKeys.add(target.objectKey)
    targetList.push(target)
  }
  for(const item of request.items) {
    assertId(item.itemId,'itemId')
    if(!item.title?.trim()||!Array.isArray(item.operations)||!item.operations.length||item.operations.length>100)
      throw new Error('D3_ITEM_OPERATIONS_REQUIRED: '+item.itemId)
    addTarget({objectKey:item.itemId,subjectId:'d3-'+item.itemId,title:item.title,kind:'archive-item',itemId:item.itemId})
    addUse('item-'+item.itemId,request.modules.item,item.itemId)
    for(const [index,operation] of item.operations.entries()) {
      const normalized=canonical(operation.operation)
      if(!operation.title?.trim())throw new Error('D3_OPERATION_TITLE_REQUIRED')
      const operationId=operation.operationId
      if(operationId)assertId(operationId,'operationId')
      if(normalized==='certified_copy'&&!request.modules.byOperation.certified_copy?.length)
        throw new Error('D3_SPECIAL_OPERATION_MODULE_REQUIRED: certified_copy requires a dedicated authority-owned author module')
      const objectKey=item.itemId+'/'+normalized+(operationId?'/'+operationId:'')
      const suffix=item.itemId+'-'+normalized.replaceAll('_','-')+(operationId?'-'+operationId:'')
      const subjectId='d3-'+suffix
      assertId(subjectId,'subjectId')
      addTarget({objectKey,subjectId,title:operation.title,
        kind:'archive-operation',itemId:item.itemId,operation:normalized,
        ...(operationId?{operationId}:{})})
      addUse('operation-'+suffix,request.modules.operation,objectKey)
      for(const [n,mod] of (request.modules.byOperation[normalized]??[]).entries())
        addUse(normalized+'-'+n+'-'+suffix,mod,objectKey)
      normalizedOperations.push({from:operation.operation,to:normalized,objectKey})
      void index
    }
  }
  // Explicit gates apply only to exact dynamic Check instances, keyed by
  // module+task+optional target selectors. A zero-match selector is an error:
  // a typo must not silently drop electronic alternatives or stage logic.
  const gatesApplied=new Set<string>()
  for(const assignment of request.gateAssignments??[]) {
    assertId(assignment.moduleId,'gate.moduleId')
    assertId(assignment.taskId,'gate.taskId')
    if(assignment.itemId)assertId(assignment.itemId,'gate.itemId')
    if(assignment.operation&&!['read','copy','excerpt','borrow','certified_copy'].includes(assignment.operation))
      throw new Error('D3_GATE_BAD_OPERATION')
    const matched=originalCheckSourceMap.filter(ref=>{
      if(ref.moduleId!==assignment.moduleId||ref.taskId!==assignment.taskId||!ref.objectKey)return false
      const target=targetList.find(t=>t.objectKey===ref.objectKey)!
      return (!assignment.itemId||target.itemId===assignment.itemId)&&
        (!assignment.operation||target.operation===assignment.operation)
    })
    if(!matched.length)throw new Error('D3_GATE_NO_TARGET_CHECK: '+assignment.moduleId+'/'+assignment.taskId)
    for(const ref of matched) {
      if(gatesApplied.has(ref.checkId))throw new Error('D3_GATE_DUPLICATE_ASSIGNMENT: '+ref.checkId)
      gatesApplied.add(ref.checkId)
      const link=newSourceBindings.find(x=>x.checkId===ref.checkId)!
      if(link.gate && hash(link.gate)!==hash(assignment.gate))
        throw new Error('D3_GATE_SOURCE_PROTOTYPE_CONFLICT: '+ref.checkId)
      link.gate=structuredClone(assignment.gate)
    }
  }
  // Append any case-level module source mappings unchanged; no instance-less
  // module Check disappears when building dynamic Uses.
  const workspace:ReviewAuthoringWorkspaceV1={
    ...structuredClone(base),
    workspaceId:'d3-dynamic-'+hash({source:base.workspaceId,request}).slice(0,20),
    definitions:{...structuredClone(base.definitions),
      templates:base.definitions.templates.map(t=>t.templateId===request.templateId&&t.version===request.version?
        {...structuredClone(t),modules:instances}:structuredClone(t))},
    sourceBindings:newSourceBindings,
  }
  const selection:D2ScenarioSelection={templateId:request.templateId,version:request.version,targets:targetList}
  const errors=validateReviewAuthoringV1(workspace)
  if(errors.length)throw new Error('D3_INSTANCE_VALIDATION_FAILED: '+errors.join('；'))
  return {workspace,selection,originalCheckSourceMap,normalizedOperations}
}

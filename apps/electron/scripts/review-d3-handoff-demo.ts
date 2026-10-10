/**
 * Runnable D3 technical handoff proof: B01/B02 in C and A workspaces.
 * The input/expected test assets are synthetic. No model call, authority, publication or official approval.
 * Usage: PROFER_CONFIG_DIR=<isolated> bun apps/electron/scripts/review-d3-handoff-demo.ts <output-directory>
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, join } from 'node:path'
import type {
  ReviewAuthoringModuleV1, ReviewAuthoringWorkspaceV1, ReviewAuthoringUseV1,
  D2ScenarioSelection, ReviewCaseV2,
} from '@profer/shared'
import {
  freezeD3Module, reuseFrozenD3Module, inspectFrozenD3Module,
  exportD3Bundle, importD3Bundle,
} from '../src/main/lib/review/review-d3-module-library'
import { compileD2RuntimePlan } from '../src/main/lib/review/review-d2-runtime'
import { validateReviewAuthoringV1 } from '../src/main/lib/review/review-authoring-v1'

const fixtureDir=resolve(import.meta.dir,'../../../docs/design/review-agent/fixtures')
const read=<T>(file:string):T=>JSON.parse(readFileSync(join(fixtureDir,file),'utf8')) as T
const save=(file:string,value:unknown):void=>{
  writeFileSync(file,JSON.stringify(value,null,2)+'\n',{encoding:'utf8',flag:'wx'})
}
const throwIf=(value:boolean,message:string):void=>{if(value)throw new Error('D3_HANDOFF_PROOF_FAILED: '+message)}
function seed(templateId:'special-campus-card'|'archive-access',id:string):ReviewAuthoringWorkspaceV1 {
  const workspace=structuredClone(read<ReviewAuthoringWorkspaceV1>('d2-workspace-synthetic.json'))
  workspace.workspaceId=id; workspace.revision=1
  workspace.definitions.templates=workspace.definitions.templates.filter(t=>t.templateId===templateId)
  const template=workspace.definitions.templates[0]!
  template.modules=template.modules.filter(u=>u.moduleId!=='agent-authorization')
  const used=new Set(template.modules.map(u=>u.moduleId))
  workspace.definitions.modules=workspace.definitions.modules.filter(m=>used.has(m.moduleId))
  workspace.sourceBindings=workspace.sourceBindings.filter(b=>b.checkId.startsWith(templateId+'@1:') &&
    !['/family-agent/','/service-agent/','/item-1-read/','/item-1-copy/'].some(part=>b.checkId.includes(part)))
  const issues=validateReviewAuthoringV1(workspace)
  throwIf(issues.length>0,'initial workspace: '+issues.join('；'))
  return workspace
}
function reuse(w:ReviewAuthoringWorkspaceV1,templateId:string,use:ReviewAuthoringUseV1,sourceId:string):ReviewAuthoringWorkspaceV1 {
  const mod=inspectFrozenD3Module(use.moduleId,use.version)
  if(!mod)throw new Error('D3_HANDOFF_MODULE_MISSING: '+use.moduleId)
  return reuseFrozenD3Module({
    workspace:w,expectedRevision:w.revision,templateId,templateVersion:1,use,expectedDigest:mod.digest,
    sourceBindings:mod.module.tasks.map(task=>({
      checkId:templateId+'@1:module/'+use.id+'/'+task.id,sourceIds:[sourceId],
    })),
  })
}
function caseFor(templateId:string):ReviewCaseV2 {
  return {
    id:'d3-handoff-'+templateId,templateId,templateVersion:1,title:'合成技术预审',
    objectType:'document',caseFields:{},subjects:[],documents:[],stage:'draft',
    revision:0,createdAt:'2026-10-11T00:00:00.000Z',updatedAt:'2026-10-11T00:00:00.000Z',
  }
}
function compile(w:ReviewAuthoringWorkspaceV1,selection:D2ScenarioSelection) {
  return compileD2RuntimePlan(w,selection,caseFor(selection.templateId))
}
function main():void {
  if(!process.env.PROFER_CONFIG_DIR?.trim())throw new Error('D3_HANDOFF_CONFIG_REQUIRED: 必须提供隔离 PROFER_CONFIG_DIR')
  const output=process.argv[2]
  if(!output)throw new Error('D3_USAGE: review-d3-handoff-demo.ts <output-directory>')
  const dir=resolve(output)
  const originalConfig=resolve(process.env.PROFER_CONFIG_DIR)
  mkdirSync(dir,{recursive:true})
  mkdirSync(originalConfig,{recursive:true})
  const b01=read<ReviewAuthoringModuleV1>('d3-b01-delegation-scope.json')
  const b02=read<ReviewAuthoringModuleV1>('d3-b02-evidence-coverage.json')
  const examples=read<string[]>('d3-b01-b02-example-ids.json')
  const locked=[freezeD3Module(b01,examples),freezeD3Module(b02,examples)]
  save(join(dir,'frozen-index.json'),locked.map(m=>({
    moduleId:m.module.moduleId,version:m.module.version,digest:m.digest,limits:m.module.limits,
  })))
  let c=seed('special-campus-card','d3-handoff-campus')
  c=reuse(c,'special-campus-card',{id:'family-agent',moduleId:b01.moduleId,version:1,scenario:'family',bindings:{action:'家属卡代办'}},'synthetic-source')
  c=reuse(c,'special-campus-card',{id:'service-agent',moduleId:b01.moduleId,version:1,scenario:'temporary-service',bindings:{action:'临时服务人员卡代办'}},'synthetic-source')
  c=reuse(c,'special-campus-card',{id:'family-evidence',moduleId:b02.moduleId,version:1,scenario:'family',bindings:{matter:'家属卡当事人关系证明'}},'synthetic-source')
  let a=seed('archive-access','d3-handoff-archive')
  a=reuse(a,'archive-access',{id:'item-1-read',moduleId:b01.moduleId,version:1,objectKey:'item-1/read',bindings:{action:'查阅'}},'school-policy-unverified')
  a=reuse(a,'archive-access',{id:'item-1-copy',moduleId:b01.moduleId,version:1,objectKey:'item-1/copy',bindings:{action:'复制'}},'school-policy-unverified')
  a=reuse(a,'archive-access',{id:'item-1-evidence',moduleId:b02.moduleId,version:1,objectKey:'item-1/read',bindings:{matter:'档案 item-1 查阅对应事实'}},'synthetic-source')
  const family=read<D2ScenarioSelection>('d2-selection-family.json')
  const temporary=read<D2ScenarioSelection>('d2-selection-temporary.json')
  const archive=read<D2ScenarioSelection>('d2-selection-archive.json')
  const cFamily=compile(c,family),cTemporary=compile(c,temporary),aOperations=compile(a,archive)
  throwIf(cFamily.mapping.some(m=>m.checkId.includes('service-agent')),'C family inherited service branch')
  throwIf(cTemporary.mapping.some(m=>m.checkId.includes('family-agent')),'C temporary inherited family branch')
  const readCheck=aOperations.mapping.find(m=>m.checkId==='module/item-1-read/authorization')
  const copyCheck=aOperations.mapping.find(m=>m.checkId==='module/item-1-copy/authorization')
  throwIf(!readCheck||!copyCheck||readCheck.subjectId===copyCheck.subjectId,'A read/copy cross-operation identity')
  throwIf(readCheck?.authority!=='unverified-policy'||copyCheck?.authority!=='unverified-policy','A unverified policy elevated')
  for(const [name,w,specs] of [
    ['campus',c,[['family',cFamily,family],['temporary',cTemporary,temporary]]],
    ['archive',a,[['operations',aOperations,archive]]],
  ] as const) {
    const bundle=exportD3Bundle(w)
    save(join(dir,name+'-workspace.json'),w)
    save(join(dir,name+'-bundle.json'),bundle)
    for(const [scenario,plan] of specs)save(join(dir,name+'-'+scenario+'-plan.json'),plan)
    const importedRoot=join(dir,'isolated-'+name)
    mkdirSync(importedRoot,{recursive:true})
    process.env.PROFER_CONFIG_DIR=importedRoot
    try {
      const recovered=importD3Bundle(bundle)
      for(const [scenario,plan,sel]of specs){
        throwIf(compile(recovered,sel).fingerprint!==plan.fingerprint,name+'/'+scenario+' different fingerprint after import')
      }
    }finally{process.env.PROFER_CONFIG_DIR=originalConfig}
  }
  const report={
    schemaVersion:1,status:'synthetic-technical-review-verified',publicationAllowed:false,
    inputs:'docs/design/review-agent/fixtures/d3-* and d2-selection-*',frozen:locked.map(m=>({
      moduleId:m.module.moduleId,version:m.module.version,digest:m.digest,
    })),
    checks:{
      campusFamily:cFamily.mapping.length,campusTemporary:cTemporary.mapping.length,
      archive:aOperations.mapping.length,
      archiveUnknownPolicy:aOperations.mapping.filter(m=>m.authority==='unverified-policy').length,
    },
    restore:'both bundles imported in distinct clean config directories and retained identical D2 fingerprints',
    scope:'No official school policy approval, no real Pi model run or human authorized decision',
  }
  save(join(dir,'handoff-report.json'),report)
  process.stdout.write(JSON.stringify({outputDir:dir,...report})+'\n')
}
try{main()}catch(error){
  process.stderr.write('D3_HANDOFF_ERROR: '+(error instanceof Error?error.message:String(error))+'\n')
  process.exitCode=1
}

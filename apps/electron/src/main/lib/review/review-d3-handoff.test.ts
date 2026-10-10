/**
 * D3-W2: synthetic B01/B02 cross-business consumer contract, executed against actual D2 compiler.
 * These are synthetic task fixtures, never authoritative university regulations or real-model judgments.
 */
import { afterAll, describe, expect, test } from 'bun:test'
import { mkdtempSync, readFileSync, rmSync, mkdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import type {
  ReviewAuthoringWorkspaceV1, ReviewAuthoringModuleV1, ReviewAuthoringUseV1,
  D2ScenarioSelection, ReviewCaseV2,
} from '@profer/shared'
import { freezeD3Module, reuseFrozenD3Module, exportD3Bundle, importD3Bundle, inspectFrozenD3Module } from './review-d3-module-library'
import { compileD2RuntimePlan } from './review-d2-runtime'
import { validateReviewAuthoringV1 } from './review-authoring-v1'
import { previewDemo } from './semantic-module-demo'

const folder=mkdtempSync(join(tmpdir(),'d3-b01-b02-handoff-'))
process.env.PROFER_CONFIG_DIR=folder
afterAll(()=>rmSync(folder,{recursive:true,force:true}))
const fixtureDir=resolve(import.meta.dir,'../../../../../../docs/design/review-agent/fixtures')
const load=<T>(name:string):T=>JSON.parse(readFileSync(join(fixtureDir,name),'utf8')) as T
const b01=load<ReviewAuthoringModuleV1>('d3-b01-delegation-scope.json')
const b02=load<ReviewAuthoringModuleV1>('d3-b02-evidence-coverage.json')
const examples=load<string[]>('d3-b01-b02-example-ids.json')
const baseline=load<ReviewAuthoringWorkspaceV1>('d2-workspace-synthetic.json')

function work(templateId: 'special-campus-card'|'archive-access', suffix:string):ReviewAuthoringWorkspaceV1 {
  const copy=structuredClone(baseline)
  copy.workspaceId='d3-'+suffix
  copy.revision=1
  copy.definitions.templates=copy.definitions.templates.filter(template=>template.templateId===templateId)
  copy.definitions.templates[0]!.modules=copy.definitions.templates[0]!.modules.filter(use=>use.moduleId!=='agent-authorization')
  const remaining=new Set(copy.definitions.templates[0]!.modules.map(use=>use.moduleId))
  copy.definitions.modules=copy.definitions.modules.filter(mod=>remaining.has(mod.moduleId))
  copy.sourceBindings=copy.sourceBindings.filter(link=>link.checkId.startsWith(templateId+'@1:') && !link.checkId.includes('/family-agent/') &&
    !link.checkId.includes('/service-agent/') && !link.checkId.includes('/item-1-read/') && !link.checkId.includes('/item-1-copy/'))
  expect(validateReviewAuthoringV1(copy)).toEqual([])
  return copy
}
function reuse(workspace:ReviewAuthoringWorkspaceV1,templateId:string,use:ReviewAuthoringUseV1,sourceId:string):ReviewAuthoringWorkspaceV1 {
  const mod=use.moduleId==='agent-authorization'?b01:b02
  const record=inspectFrozenD3Module(mod.moduleId,mod.version)!
  const sourceBindings=mod.tasks.map(task=>({
    checkId:templateId+'@1:module/'+use.id+'/'+task.id,
    sourceIds:[sourceId],
  }))
  return reuseFrozenD3Module({
    workspace,expectedRevision:workspace.revision,templateId,templateVersion:1,
    use,expectedDigest:record.digest,sourceBindings,
  })
}
function makeCase(templateId:string):ReviewCaseV2 {
  return {
    id:'d3-test-'+templateId,templateId,templateVersion:1,title:'D3 合成用例',
    objectType:'document',caseFields:{},subjects:[],documents:[],
    stage:'draft',revision:0,createdAt:'2026-10-11T00:00:00Z',updatedAt:'2026-10-11T00:00:00Z',
  }
}
const family=load<D2ScenarioSelection>('d2-selection-family.json')
const temporary=load<D2ScenarioSelection>('d2-selection-temporary.json')
const archive=load<D2ScenarioSelection>('d2-selection-archive.json')
function compile(w:ReviewAuthoringWorkspaceV1, s:D2ScenarioSelection) {
  const plan=compileD2RuntimePlan(w,s,makeCase(s.templateId))
  expect(plan.publicationAllowed).toBeFalse()
  return plan
}

describe('D3 W2 B01/B02 双业务复用与拒用对照',()=>{
  test('冻结共享局部责任，创建 A 和 C 两个独立工作区，不复制源模块后手动调校政策',()=>{
    const auth=freezeD3Module(b01,examples)
    const evidence=freezeD3Module(b02,examples)
    expect(auth.digest).toHaveLength(64)
    expect(evidence.digest).toHaveLength(64)
    expect(auth.module.limits).toContain('行政批准')
    expect(evidence.module.limits).toContain('行政批准')
  })
  test('C family/temporary service 同模板不同分支，B01 绑定分别只激活一个目标；B02 只核当前事实',()=>{
    let w=work('special-campus-card','campus')
    w=reuse(w,'special-campus-card',{
      id:'family-agent',moduleId:b01.moduleId,version:1,scenario:'family',bindings:{action:'家属卡代办'},
    },'synthetic-source')
    w=reuse(w,'special-campus-card',{
      id:'service-agent',moduleId:b01.moduleId,version:1,scenario:'temporary-service',bindings:{action:'临时人员卡代办'},
    },'synthetic-source')
    w=reuse(w,'special-campus-card',{
      id:'family-evidence',moduleId:b02.moduleId,version:1,scenario:'family',bindings:{matter:'家属卡本人关系材料'},
    },'synthetic-source')
    expect(w.sharedModuleLocks).toHaveLength(2)
    expect(validateReviewAuthoringV1(w)).toEqual([])
    const f=compile(w,family),t=compile(w,temporary)
    expect(f.mapping.some(m=>m.checkId.includes('family-agent'))).toBeTrue()
    expect(f.mapping.some(m=>m.checkId.includes('family-evidence'))).toBeTrue()
    expect(f.mapping.some(m=>m.checkId.includes('service-agent'))).toBeFalse()
    expect(t.mapping.some(m=>m.checkId.includes('service-agent'))).toBeTrue()
    expect(t.mapping.some(m=>m.checkId.includes('family-evidence'))).toBeFalse()
    expect(f.mapping.filter(m=>m.subjectId==='d2-family')).toHaveLength(3)
    expect(f.mapping.filter(m=>m.authority==='unverified-policy')).toHaveLength(1)
    const fBody=f.rules.map(r=>r.requirement).join('\n')
    expect(fBody).toContain('家属卡代办')
    expect(fBody).not.toContain('临时人员卡代办')
    expect(fBody).toContain('行政批准')
    const bundle=exportD3Bundle(w)
    expect(bundle.frozen).toHaveLength(2)
    const otherDir=join(folder,'fresh-campus-consumer')
    mkdirSync(otherDir,{recursive:true})
    process.env.PROFER_CONFIG_DIR=otherDir
    try {
      const recovered=importD3Bundle(bundle)
      expect(compile(recovered,family).fingerprint).toBe(f.fingerprint)
    } finally { process.env.PROFER_CONFIG_DIR=folder }
  })
  test('A 同一档案 read 与 copy 有单独来源和对象；B01 的待核制度不继承 C 的合成请求适用性',()=>{
    let w=work('archive-access','archive')
    w=reuse(w,'archive-access',{
      id:'item-1-read',moduleId:b01.moduleId,version:1,objectKey:'item-1/read',bindings:{action:'查阅'},
    },'school-policy-unverified')
    w=reuse(w,'archive-access',{
      id:'item-1-copy',moduleId:b01.moduleId,version:1,objectKey:'item-1/copy',bindings:{action:'复制'},
    },'school-policy-unverified')
    w=reuse(w,'archive-access',{
      id:'item-1-evidence',moduleId:b02.moduleId,version:1,objectKey:'item-1/read',bindings:{matter:'档案 item-1 查阅所涉事实'},
    },'synthetic-source')
    expect(validateReviewAuthoringV1(w)).toEqual([])
    const plan=compile(w,archive)
    const read=plan.mapping.find(m=>m.checkId==='module/item-1-read/authorization')!
    const copy=plan.mapping.find(m=>m.checkId==='module/item-1-copy/authorization')!
    const evidence=plan.mapping.find(m=>m.checkId==='module/item-1-evidence/evidence-boundary')!
    expect(read.subjectId).toBe('d2-item1-read')
    expect(copy.subjectId).toBe('d2-item1-copy')
    expect(evidence.subjectId).toBe('d2-item1-read')
    expect(read.ruleId).not.toBe(copy.ruleId)
    expect(read.authority).toBe('unverified-policy')
    expect(copy.authority).toBe('unverified-policy')
    expect(evidence.authority).toBe('request-scope')
    const copyText=plan.rules.find(rule=>rule.id===copy.ruleId)!.requirement
    expect(copyText).toContain('复制')
    expect(copyText).not.toContain('家属卡代办')
    const bundle=exportD3Bundle(w)
    const newDir=join(folder,'fresh-archive-consumer')
    mkdirSync(newDir,{recursive:true})
    process.env.PROFER_CONFIG_DIR=newDir
    try {
      const loaded=importD3Bundle(bundle)
      expect(compile(loaded,archive).fingerprint).toEqual(plan.fingerprint)
    } finally { process.env.PROFER_CONFIG_DIR=folder }
  })
  test('同一 B01 在 A/C 适用性各自独立：跨校或待核来源不会因为共享模块而被提升为校方授权',()=>{
    const authority=inspectFrozenD3Module(b01.moduleId,1)!
    expect(authority.module.source.kind).toBe('synthetic')
    expect(authority.module.limits).toContain('行政批准')
    expect(authority.module.tasks[0]!.requirement).toContain('对象')
    const demo:ReviewAuthoringWorkspaceV1=work('archive-access','contra-authority')
    expect(demo.sources.find(x=>x.sourceId==='school-policy-unverified')?.applicability).toBe('unknown')
    // 直接声明跨校参考为 request-scope 不能通过 D1 authoring validation
    demo.sources.push({
      sourceId:'false-cross-school',kind:'cross-school-reference',
      label:'不能冒用的外校材料',verification:'content-checked',applicability:'request-scope',
      note:'不允许跨校参考自动成为本校校规',
    })
    expect(validateReviewAuthoringV1(demo).join(';')).toContain('跨校参考规则不得自动')
  })
  test('无法表达的证据替代/Claim 图必须阻断真实 D2 编译，不能少审后声称完整',()=>{
    let w=work('special-campus-card','unknown-claim')
    w=reuse(w,'special-campus-card',{
      id:'family-agent',moduleId:b01.moduleId,version:1,scenario:'family',bindings:{action:'家属卡代办'},
    },'synthetic-source')
    w.advanced={claimKeys:['substitute-evidence'],evidenceRelations:[{claimKey:'substitute-evidence',requiredSourceIds:['synthetic-source']}]}
    expect(validateReviewAuthoringV1(w)).toEqual([])
    expect(()=>compile(w,family)).toThrow('D2_UNMAPPED_ADVANCED')
  })
  test('Agent 的 report-gap 输出可机读，错误或无定位的缺口不能假成功',()=>{
    const script=resolve(import.meta.dir,'../../../../scripts/review-d3-library.ts')
    const env={...process.env,PROFER_CONFIG_DIR:folder}
    const good=Bun.spawnSync({
      cmd:[process.execPath,script,'report-gap',join(fixtureDir,'d3-gap-evidence-alternatives.json')],env,
    })
    expect(good.exitCode).toBe(0)
    const report=JSON.parse(good.stdout.toString()) as {status:string;locator:string;owner:string}
    expect(report).toMatchObject({status:'tooling-blocked',owner:'D3'})
    expect(report.locator).toContain('证据替代')
    const bad=Bun.spawnSync({cmd:[process.execPath,script,'report-gap',join(fixtureDir,'missing-gap.json')],env})
    expect(bad.exitCode).not.toBe(0)
  })
})

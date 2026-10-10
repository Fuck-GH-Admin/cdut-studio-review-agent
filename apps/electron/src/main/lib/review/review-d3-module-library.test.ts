/**
 * D3 W0/W1 自检：每个测试使用隔离配置目录；合成业务语义、非真实校方规则。
 */
import { afterAll, describe, expect, test } from 'bun:test'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import type { ReviewAuthoringModuleV1, ReviewAuthoringWorkspaceV1, ReviewD3TransferBundle } from '@profer/shared'
import {
  freezeD3Module, inspectFrozenD3Module, discoverFrozenD3Modules, reuseFrozenD3Module,
  exportD3Bundle, importD3Bundle, diffD3Modules,
} from './review-d3-module-library'
import { validateReviewAuthoringV1 } from './review-authoring-v1'
import { compileD2RuntimePlan } from './review-d2-runtime'
import { validateD3WorkspaceLocks } from './review-d3-workspace-locks'
import { previewDemo } from './semantic-module-demo'

const folder = mkdtempSync(join(tmpdir(), 'd3-frozen-library-'))
process.env.PROFER_CONFIG_DIR = folder
afterAll(() => rmSync(folder, { force: true, recursive: true }))
const base: ReviewAuthoringModuleV1 = {
  moduleId: 'delegation-scope', version: 1, name: '授权范围核对（局部责任）',
  purpose: '核对代理人、特定对象与特定办理行为的委托凭证是否对应',
  scope: '仅检查本次委托授权覆盖范围',
  limits: '委托成立不代表档案已开放、发卡资格或校方审批；证据不足必须待核。',
  source: { kind: 'synthetic', note: '合成试验用局部核验责任' },
  parameters: [{ key: 'matter', description: '当前办理事项', defaultValue: '本次事项' }],
  tasks: [{
    id: 'authorization', title: '委托授权范围',
    requirement: '核对代理人是否获授权执行{{matter}}，并绑定当前对象、动作和期限。',
    completion: '有凭证且明确覆盖方可确认；不能依据亲属身份推断授权。',
    limits: '不核定其他业务资格。',
  }],
}
const compound: ReviewAuthoringModuleV1 = {
  moduleId: 'delegation-check-package', version: 1, name: '代办核验组合（实验）',
  purpose: '只组合委托范围与证据核查，不创造档案或校园卡审批权',
  scope: '所选择的申请主体',
  limits: '不得升级为发卡/查档/用印批准。',
  source: { kind: 'synthetic', note: '合成组合包，用于递归锁测试' },
  tasks: [{ id: 'scope', title: '身份与事实绑定', requirement: '核对本次受审者身份和来源。', completion: '输出逐项证据或待确认。' }],
  references: [{ id: 'proxy', moduleId: 'delegation-scope', version: 1, bindings: { matter: '当前代理办理事项' } }],
}
function workspace(id: string): ReviewAuthoringWorkspaceV1 {
  return {
    schemaVersion: 1, workspaceId: id, revision: 1,
    definitions: { modules: [], templates: [{
      templateId: 'text-check', version: 1, name: '合成文本检查',
      purpose: '核对单份申请材料的格式与来源', limits: '不得进行学校行政批准。',
      source: { kind: 'synthetic', note: '合成用例' },
      modules: [], localTasks: [{ id: 'plain-text', title: '纯文本核对', requirement: '检查明确的文字要求。', completion: '附实际材料出处。' }],
    }] },
    sources: [{
      sourceId: 'local-request', kind: 'synthetic', label: '合成请求规则',
      verification: 'content-checked', applicability: 'request-scope',
      note: '技术预审案例，非真实制度。',
    }],
    sourceBindings: [{ checkId: 'text-check@1:local/plain-text', sourceIds: ['local-request'] }],
  }
}
const use = { id: 'proxy-review', moduleId: 'delegation-scope', version: 1, bindings: { matter: '本次申请' } }
function reuse(w: ReviewAuthoringWorkspaceV1, hash: string) {
  return reuseFrozenD3Module({
    workspace: w, expectedRevision: w.revision,
    templateId: 'text-check', templateVersion: 1, use, expectedDigest: hash,
    sourceBindings: [{ checkId: 'text-check@1:module/proxy-review/authorization', sourceIds: ['local-request'] }],
  })
}

describe('D3：不可变共享模块及 Agent-first 制作携包（BDD）', () => {
  test('Given 合成局部责任 When 冻结 Then 同版本内容不可覆写，但相同内容重试幂等', () => {
    const record = freezeD3Module(base, ['fixture:valid-proxy', 'fixture:unknown-proxy'])
    expect(record.digest).toHaveLength(64)
    expect(record.status).toBe('shared-frozen')
    expect(freezeD3Module(base, ['fixture:valid-proxy'])).toMatchObject({ digest: record.digest })
    const changed = structuredClone(base)
    changed.limits = '不允许悄悄去掉授权边界'
    expect(() => freezeD3Module(changed, ['fixture:wrong'])).toThrow('D3_FROZEN_CONFLICT')
    expect(inspectFrozenD3Module('delegation-scope', 1)?.module.limits).toBe(base.limits)
  })

  test('Given 共享依赖 When 冻结复合模块 Then 依赖锁是当前已存在的精确版本摘要', () => {
    const record = freezeD3Module(compound, ['fixture:compound'])
    expect(record.dependencies).toEqual([{
      moduleId: 'delegation-scope', version: 1, digest: inspectFrozenD3Module('delegation-scope', 1)!.digest,
    }])
    const wrong = structuredClone(compound)
    wrong.version = 2
    wrong.references![0]!.moduleId = 'missing-delegation'
    expect(() => freezeD3Module(wrong, ['fixture:no-dependency'])).toThrow('D3_DEPENDENCY_MISSING')
  })

  test('Given 两个独立作者工作区 When 同时复用同一冻结资产 Then 自己的来源不同也不篡改公共语义', () => {
    const digest = inspectFrozenD3Module('delegation-scope', 1)!.digest
    const alice = reuse(workspace('author-alice'), digest)
    const bob = reuse(workspace('author-bob'), digest)
    expect(alice.revision).toBe(2)
    expect(bob.revision).toBe(2)
    expect(validateReviewAuthoringV1(alice)).toEqual([])
    expect(alice.definitions.modules[0]).toEqual(bob.definitions.modules[0])
    expect(alice.workspaceId).not.toBe(bob.workspaceId)
    expect(alice.sourceBindings.at(-1)?.sourceIds).toEqual(['local-request'])
    expect(previewDemo({
      revision: alice.revision,
      modules: alice.definitions.modules, templates: alice.definitions.templates,
    }, 'text-check', 1).tasks).toHaveLength(2)
    const local = structuredClone(workspace('author-local-change'))
    local.definitions.modules.push({ ...base, limits: '已经削弱的同名伪模块' })
    expect(() => reuse(local, digest)).toThrow('D3_WORKSPACE_COLLISION')
  })

  test('Given 已复用的共享资产 When 修改工作区同版定义或伪造锁 Then D1/D2 与导出均拒止', () => {
    const approvedDigest = inspectFrozenD3Module('delegation-scope', 1)!.digest
    const original = reuse(workspace('d3-compiler-lock'),approvedDigest)
    expect(original.sharedModuleLocks).toEqual([{ moduleId:'delegation-scope',version:1,digest:approvedDigest }])
    expect(validateD3WorkspaceLocks(original,true)).toEqual([])
    const requestCase = {
      id:'d3-lock-run',templateId:'text-check',templateVersion:1,title:'D3 test',objectType:'document' as const,
      caseFields:{},subjects:[],documents:[],stage:'draft' as const,revision:0,createdAt:'2026-10-11T00:00:00.000Z',updatedAt:'2026-10-11T00:00:00.000Z',
    }
    expect(compileD2RuntimePlan(original,{templateId:'text-check',version:1,targets:[]},requestCase).rules).toHaveLength(2)
    const tampered = structuredClone(original)
    tampered.definitions.modules[0]!.limits = '悄然删除业务授权限制'
    expect(validateReviewAuthoringV1(tampered).join(';')).toContain('D3_LOCK_DIGEST')
    expect(() => compileD2RuntimePlan(tampered,{templateId:'text-check',version:1,targets:[]},requestCase)).toThrow('D2_AUTHORING_INVALID')
    expect(() => exportD3Bundle(tampered)).toThrow('D3_WORKSPACE_INVALID')
    const forged = structuredClone(original)
    forged.sharedModuleLocks![0]!.digest = 'a'.repeat(64)
    expect(validateReviewAuthoringV1(forged).join(';')).toContain('D3_LOCK_DIGEST')
    const omitted = structuredClone(original)
    delete omitted.sharedModuleLocks
    expect(() => exportD3Bundle(omitted)).toThrow('D3_AMBIGUOUS_MODULE')
  })

  test('Given 携带冻结资产的交付包 When 清单与 workspace 锁不符 Then 即便重算包摘要也禁止导入', () => {
    const original=exportD3Bundle(reuse(workspace('explicit-frozen-list'),inspectFrozenD3Module('delegation-scope',1)!.digest))
    const sneaky=structuredClone(original)
    sneaky.workspace.sharedModuleLocks=[]
    // 由攻击者重算外层 digest 不意味着能够提升模块身份；内部清单必须吻合。
    const crypto=require('node:crypto') as typeof import('node:crypto')
    const {fingerprint:_old,...bare}=sneaky
    sneaky.fingerprint=crypto.createHash('sha256').update(JSON.stringify(bare)).digest('hex')
    expect(() => importD3Bundle(sneaky)).toThrow('D3_BUNDLE_LOCK_MISMATCH')
  })

  test('Given 旧草稿锁 When 新模块版本产生 Then 不迁移的消费者内容/指纹不漂移', () => {
    const old = reuse(workspace('old-consumer'), inspectFrozenD3Module('delegation-scope', 1)!.digest)
    const oldPackage = exportD3Bundle(old)
    const v2 = structuredClone(base)
    v2.version = 2
    v2.tasks[0]!.completion = '新增审核员复核要求，不能自动授权'
    const newer = freezeD3Module(v2, ['fixture:changed-authorization'])
    expect(newer.digest).not.toBe(inspectFrozenD3Module('delegation-scope', 1)!.digest)
    expect(diffD3Modules(base,v2).changedTasks).toEqual(['authorization'])
    expect(diffD3Modules(base,v2).explicitUpgradeRequired).toBeTrue()
    expect(exportD3Bundle(old).fingerprint).toBe(oldPackage.fingerprint)
    expect(old.definitions.templates[0]?.modules[0]?.version).toBe(1)
    expect(discoverFrozenD3Modules('授权范围').map(v=>v.version)).toEqual([1,2])
  })

  test('Given 导出携包 When 进入全新隔离配置目录再导入 Then 摘要、模块与原模板要求一致', () => {
    const oldDir = process.env.PROFER_CONFIG_DIR!
    const bundle = exportD3Bundle(reuse(workspace('exported-case'), inspectFrozenD3Module('delegation-scope', 1)!.digest))
    expect(bundle.publicationAllowed).toBeFalse()
    expect(bundle.frozen).toHaveLength(1)
    const newDir = join(folder, 'new-environment')
    mkdirSync(newDir, { recursive:true })
    process.env.PROFER_CONFIG_DIR = newDir
    try {
      expect(discoverFrozenD3Modules()).toEqual([])
      const recovered = importD3Bundle(bundle)
      expect(recovered).toEqual(bundle.workspace)
      expect(inspectFrozenD3Module('delegation-scope', 1)!.digest).toBe(bundle.frozen[0]!.digest)
      const repacked = exportD3Bundle(recovered)
      expect(repacked.fingerprint).toBe(bundle.fingerprint)
    } finally { process.env.PROFER_CONFIG_DIR = oldDir }
  })

  test('Given 篡改包/依赖 When 离线导入 Then 保留原冻结内容并明确拒绝', () => {
    const original = exportD3Bundle(reuse(workspace('tamper-source'), inspectFrozenD3Module('delegation-scope', 1)!.digest))
    const tampered = structuredClone(original)
    tampered.workspace.definitions.modules[0]!.limits = '取消限制'
    expect(() => importD3Bundle(tampered)).toThrow('D3_BUNDLE_DIGEST')
    const faked = structuredClone(original)
    faked.frozen[0]!.digest = '0'.repeat(64)
    expect(() => importD3Bundle(faked)).toThrow('D3_BUNDLE_DIGEST')
    const missing = structuredClone(compound)
    missing.version = 3
    missing.references = [{ id: 'bad-path',moduleId:'unknown-module',version:1 }]
    expect(() => freezeD3Module(missing,['fixture:bad-dep'])).toThrow('D3_DEPENDENCY_MISSING')
  })

  test('Given 新 Agent 仅有 CLI When freeze/discover/reuse/validate/export Then 每一步是真正可执行的 JSON', () => {
    const env={...process.env, PROFER_CONFIG_DIR: folder}
    const script=resolve(import.meta.dir, '../../../../scripts/review-d3-library.ts')
    const scratch=join(folder,'cli')
    mkdirSync(scratch,{recursive:true})
    const modulePath=join(scratch,'root.json'), examplesPath=join(scratch,'testcases.json')
    writeFileSync(modulePath,JSON.stringify(compound))
    writeFileSync(examplesPath,JSON.stringify(['fixture:compound']))
    const run=(...args:string[]) => Bun.spawnSync({cmd:[process.execPath,script,...args],env})
    const inspect=run('inspect','delegation-check-package','1')
    expect(inspect.exitCode).toBe(0)
    expect(JSON.parse(inspect.stdout.toString()).digest).toHaveLength(64)
    const discover=run('discover','代办')
    expect(discover.exitCode).toBe(0)
    expect(JSON.parse(discover.stdout.toString()).length).toBeGreaterThan(0)
    const again=run('freeze',modulePath,examplesPath)
    expect(again.exitCode).toBe(0)
    const original=workspace('cli-user')
    const wsFile=join(scratch,'ws.json'), reuseFile=join(scratch,'reuse.json'), compiledFile=join(scratch,'reused.json')
    writeFileSync(wsFile,JSON.stringify(original))
    writeFileSync(reuseFile,JSON.stringify({
      expectedRevision:original.revision,templateId:'text-check',templateVersion:1,use,
      expectedDigest:inspectFrozenD3Module('delegation-scope',1)!.digest,
      sourceBindings:[{checkId:'text-check@1:module/proxy-review/authorization',sourceIds:['local-request']}],
    }))
    const edited=run('reuse',wsFile,reuseFile)
    expect(edited.exitCode).toBe(0)
    writeFileSync(compiledFile,edited.stdout.toString())
    const valid=run('validate',compiledFile)
    expect(valid.exitCode).toBe(0)
    const path=join(scratch,'portable.json'), recovered=join(scratch,'imported.json')
    expect(run('export',compiledFile,path).exitCode).toBe(0)
    expect(run('import',path,recovered).exitCode).toBe(0)
    expect(JSON.parse(readFileSync(recovered,'utf8')).revision).toBe(2)
    const withoutEnv=Bun.spawnSync({cmd:[process.execPath,script,'discover'],env:{...process.env,PROFER_CONFIG_DIR:''}})
    expect(withoutEnv.exitCode).not.toBe(0)
  })
})

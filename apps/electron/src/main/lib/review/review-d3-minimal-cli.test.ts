/**
 * D3-01: no modules, no Claim graph, clean workspaces and D3/D2 Agent CLI only.
 * Synthetic case and policy, no live model or official business approval.
 */
import { afterAll, describe, expect, test } from 'bun:test'
import { mkdtempSync, mkdirSync, readFileSync, rmSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'

const home=mkdtempSync(join(tmpdir(),'d3-first-agent-'))
afterAll(()=>rmSync(home,{recursive:true,force:true}))
const fixture=resolve(import.meta.dir,'../../../../../../docs/design/review-agent/fixtures')
const d3=resolve(import.meta.dir,'../../../../scripts/review-d3-library.ts')
const d2=resolve(import.meta.dir,'../../../../scripts/review-d2-plan.ts')
const input=join(fixture,'d3-minimal-workspace.json')
const selection=join(fixture,'d3-minimal-selection.json')
const caseFile=join(fixture,'d3-minimal-case.json')
function run(config:string,script:string,...args:string[]) {
  mkdirSync(config,{recursive:true})
  return Bun.spawnSync({cmd:[process.execPath,script,...args],env:{...process.env,PROFER_CONFIG_DIR:config}})
}
function parse(proc:ReturnType<typeof Bun.spawnSync>):unknown {
  if(proc.exitCode!==0)throw new Error(proc.stderr.toString())
  return JSON.parse(proc.stdout.toString())
}
describe('D3-01 可由新 Agent 复制的最简文本制作',()=>{
  test('零共享模块/零复杂 DSL：验证、预览、候选登记、创建并固定 D2 技术预审',()=>{
    const config=join(home,'first-config')
    const validated=parse(run(config,d3,'validate',input)) as {ok:boolean;locks:unknown[]}
    expect(validated.ok).toBeTrue()
    expect(validated.locks).toHaveLength(0)
    const plan=parse(run(config,d2,'preview',input,selection,caseFile)) as {mapping:unknown[];rules:unknown[];publicationAllowed:boolean;fingerprint:string}
    expect(plan.mapping).toHaveLength(1)
    expect(plan.rules).toHaveLength(1)
    expect(plan.publicationAllowed).toBeFalse()
    expect(plan.fingerprint).toHaveLength(64)
    const reg=parse(run(config,d2,'register',input,selection)) as {registered:boolean;publicationAllowed:boolean}
    expect(reg.registered).toBeTrue()
    expect(reg.publicationAllowed).toBeFalse()
    const created=parse(run(config,d2,'create',input,selection,'d3-first-agent-case','最简文本合成技术预审','technical-author')) as {
      created:boolean;fingerprint:string;publicationAllowed:boolean
    }
    expect(created.created).toBeTrue()
    expect(created.fingerprint).toBe(plan.fingerprint)
    expect(created.publicationAllowed).toBeFalse()
  })
  test('无公共模块也允许可携包，新配置目录重导入及 D2 preview 必须保持相同指纹',()=>{
    const first=join(home,'first-config'),other=join(home,'second-config')
    const bundle=join(home,'portable-text.json'),restored=join(home,'restored-workspace.json')
    expect(run(first,d3,'export',input,bundle).exitCode).toBe(0)
    const b=JSON.parse(readFileSync(bundle,'utf8')) as {frozen:unknown[];publicationAllowed:boolean}
    expect(b.frozen).toHaveLength(0)
    expect(b.publicationAllowed).toBeFalse()
    expect(run(other,d3,'import',bundle,restored).exitCode).toBe(0)
    const original=parse(run(first,d2,'preview',input,selection,caseFile)) as {fingerprint:string}
    const imported=parse(run(other,d2,'preview',restored,selection,caseFile)) as {fingerprint:string}
    expect(imported.fingerprint).toBe(original.fingerprint)
  })
})

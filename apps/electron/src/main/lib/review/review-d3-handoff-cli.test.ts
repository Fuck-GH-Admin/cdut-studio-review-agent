/**
 * W2 independent-process handoff proof. Exercises only public Agent CLI and portable JSON artifacts.
 * The actual Pi submission with source validation remains separately covered by D2 service tests.
 */
import { afterAll, describe, expect, test } from 'bun:test'
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'

const root=mkdtempSync(join(tmpdir(),'d3-clean-handoff-cli-'))
const config=join(root,'registry')
const output=join(root,'output')
mkdirSync(config,{recursive:true})
afterAll(()=>rmSync(root,{force:true,recursive:true}))

describe('D3 独立 CLI：两业务干净环境完整制作与移交',()=>{
  test('冻结 B01/B02，分别创建 C/A 工作区、产出 D2 规则快照并在两个独立注册表中重导入',()=>{
    const script=resolve(import.meta.dir,'../../../../scripts/review-d3-handoff-demo.ts')
    const env={...process.env,PROFER_CONFIG_DIR:config}
    const first=Bun.spawnSync({cmd:[process.execPath,script,output],env})
    expect(first.exitCode).toBe(0)
    if(first.exitCode!==0)throw new Error(first.stderr.toString())
    const report=JSON.parse(readFileSync(join(output,'handoff-report.json'),'utf8')) as {
      publicationAllowed:boolean;status:string;checks:{campusFamily:number;campusTemporary:number;archive:number;archiveUnknownPolicy:number}
      frozen:Array<{moduleId:string;digest:string}>
    }
    expect(report.status).toBe('synthetic-technical-review-verified')
    expect(report.publicationAllowed).toBeFalse()
    expect(report.frozen).toHaveLength(2)
    expect(report.frozen.every(item=>item.digest.length===64)).toBeTrue()
    expect(report.checks.campusFamily).toBeGreaterThan(report.checks.campusTemporary)
    expect(report.checks.archiveUnknownPolicy).toBe(2)
    const c=JSON.parse(readFileSync(join(output,'campus-family-plan.json'),'utf8')) as {
      fingerprint:string;rules:Array<{requirement:string}>;mapping:Array<{checkId:string}>
    }
    const a=JSON.parse(readFileSync(join(output,'archive-operations-plan.json'),'utf8')) as {
      fingerprint:string;mapping:Array<{subjectId?:string;checkId:string}>
    }
    expect(c.rules.map(rule=>rule.requirement).join('；')).not.toContain('临时人员卡代办')
    expect(a.mapping.find(m=>m.checkId==='module/item-1-read/authorization')?.subjectId).not.toEqual(
      a.mapping.find(m=>m.checkId==='module/item-1-copy/authorization')?.subjectId)
    expect(c.fingerprint).toHaveLength(64)
    expect(a.fingerprint).toHaveLength(64)
    const replay=Bun.spawnSync({cmd:[process.execPath,script,output],env})
    expect(replay.exitCode).not.toBe(0)
    expect(replay.stderr.toString()).toContain('EEXIST')
  })

  test('独立 Agent 的既有 D2 preview CLI 能重新编译已导出的 C 作者态并匹配正式预审规则指纹',()=>{
    const fixtureDir=resolve(import.meta.dir,'../../../../../../docs/design/review-agent/fixtures')
    const script=resolve(import.meta.dir,'../../../../scripts/review-d2-plan.ts')
    const caseFile=join(root,'case.json')
    writeFileSync(caseFile,JSON.stringify({
      id:'d3-cli-case',templateId:'special-campus-card',templateVersion:1,
      title:'合成案例',objectType:'document',stage:'draft',caseFields:{},subjects:[],documents:[],
      revision:0,createdAt:'2026-10-11T00:00:00Z',updatedAt:'2026-10-11T00:00:00Z',
    }))
    const checked=Bun.spawnSync({
      cmd:[process.execPath,script,'preview',
        join(output,'campus-workspace.json'),join(fixtureDir,'d2-selection-family.json'),caseFile],
      env:{...process.env,PROFER_CONFIG_DIR:config},
    })
    expect(checked.exitCode).toBe(0)
    if(checked.exitCode!==0)throw new Error(checked.stderr.toString())
    const preview=JSON.parse(checked.stdout.toString()) as {fingerprint:string;publicationAllowed:boolean}
    const previously=JSON.parse(readFileSync(join(output,'campus-family-plan.json'),'utf8')) as {fingerprint:string}
    expect(preview.fingerprint).toBe(previously.fingerprint)
    expect(preview.publicationAllowed).toBeFalse()
  })
})

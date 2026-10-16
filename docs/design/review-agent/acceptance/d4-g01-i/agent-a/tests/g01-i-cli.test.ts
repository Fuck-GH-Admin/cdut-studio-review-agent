/** 使用真正 D1/D3/D2 CLI，隔离合成技术预审；不宣称业务或行政 PASS。 */
import { afterAll, expect, test } from 'bun:test'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
const root=resolve(import.meta.dir,'../../../../../../../')
const base=resolve(import.meta.dir,'..')
const temp=mkdtempSync(join(tmpdir(),'g01-i-cli-'))
const cfg1=join(temp,'config1'),cfg2=join(temp,'config2')
const workspace=join(base,'workspace/workspace.json')
const selection=join(base,'workspace/selection.json')
const casePath=join(base,'runtime/synthetic-draft-case.json')
const paths={
 d1:join(root,'apps/electron/scripts/review-authoring-v1.ts'),
 d3:join(root,'apps/electron/scripts/review-d3-library.ts'),
 d2:join(root,'apps/electron/scripts/review-d2-plan.ts'),
}
const run=(script:string,args:string[],config=cfg1)=>{
 const p=Bun.spawnSync({cmd:[process.execPath,script,...args],cwd:root,env:{...process.env,PROFER_CONFIG_DIR:config}})
 const out=p.stdout.toString(),err=p.stderr.toString()
 if(p.exitCode!==0)throw new Error(script+' '+args.join(' ')+' exit '+p.exitCode+' stderr='+err+' stdout='+out)
 return JSON.parse(out) as Record<string,any>
}
afterAll(()=>rmSync(temp,{recursive:true,force:true}))

test('真实 CLI validate/save/read/preview/export/import/repreview',()=>{
 const d1=run(paths.d1,['validate',workspace]);expect(d1.ok).toBe(true)
 const d3=run(paths.d3,['validate',workspace]);expect(d3.ok).toBe(true)
 expect(d3.locks).toEqual([])
 const first=run(paths.d1,['save',workspace,'0','g01-i-synthetic-cli']);expect(first.saved).toBe(true)
 const stored=run(paths.d1,['read','d4-g01-i-v17-r01']);expect(stored.workspace.revision).toBe(1)
 const plan=run(paths.d2,['preview',workspace,selection,casePath])
 expect(plan.mapping).toHaveLength(49);expect(plan.rules).toHaveLength(49)
 expect(plan.publicationAllowed).toBe(false)
 // 已由真实 D2 CLI 生成的合成计划，用于将 CI 输出回填为可审计静态工件。
 console.log('G01I_ACTUAL_PLAN_B64:'+Buffer.from(JSON.stringify(plan),'utf8').toString('base64'))
 const registration=run(paths.d2,['register',workspace,selection]);expect(registration.registered).toBe(true)
 const caseCreated=run(paths.d2,['create',workspace,selection,'g01i-case-synthetic','G01-I 合成技术预审','g01i-local-reviewer'])
 expect(caseCreated.created).toBe(true);expect(caseCreated.publicationAllowed).toBe(false)
 const portable=join(temp,'portable.json'),out=join(temp,'reimported.json')
 const exported=run(paths.d3,['export',workspace,portable]);expect(exported.exported).toBe(true)
 expect(exported.frozenModules).toBe(0)
 const imported=run(paths.d3,['import',portable,out],cfg2);expect(imported.imported).toBe(true)
 const replay=run(paths.d2,['preview',out,selection,casePath],cfg2)
 expect(replay.fingerprint).toBe(plan.fingerprint)
 const recovered=JSON.parse(readFileSync(out,'utf8'))
 expect(recovered).toEqual(JSON.parse(readFileSync(workspace,'utf8')))
 console.log('G01I_ACTUAL_CLI_RECEIPT:'+JSON.stringify({d1Validated:d1.ok,d3Validated:d3.ok,revisionSaved:first.saved,d2Registered:registration.registered,d2CaseCreated:caseCreated.created,caseId:'g01i-case-synthetic',checkCount:plan.mapping.length,planFingerprint:plan.fingerprint,portableExported:exported.exported,portableImported:imported.imported,portableFingerprint:replay.fingerprint,b02SharedReuseInG01:false}))
})

test('D3 B02 冻结机制只作隔离试验，不假装 G01-I 已复用 B02',()=>{
 const modulePath=join(root,'docs/design/review-agent/fixtures/d3-b02-evidence-coverage.json')
 const examples=join(root,'docs/design/review-agent/fixtures/d3-b01-b02-example-ids.json')
 const frozen=run(paths.d3,['freeze',modulePath,examples],cfg2)
 expect(frozen.module.moduleId).toBe('evidence-source-boundary')
 const inspected=run(paths.d3,['inspect','evidence-source-boundary','1'],cfg2)
 expect(inspected.digest).toBe(frozen.digest)
 const repeated=run(paths.d3,['freeze',modulePath,examples],cfg2);expect(repeated.digest).toBe(frozen.digest)
 const altered=JSON.parse(readFileSync(modulePath,'utf8'));altered.tasks[0].requirement+=' 合成不兼容修订'
 const changedPath=join(temp,'changed-b02.json');writeFileSync(changedPath,JSON.stringify(altered),'utf8')
 expect(()=>run(paths.d3,['freeze',changedPath,examples],cfg2)).toThrow('D3_FROZEN_CONFLICT')
})

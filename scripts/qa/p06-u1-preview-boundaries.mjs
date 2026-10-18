// 独立合成目录中的真实 Main 路径拒止；保留所有原件与失败。
import {readFileSync,writeFileSync,mkdirSync,renameSync,symlinkSync,copyFileSync} from 'node:fs'
import {join,resolve} from 'node:path'
import assert from 'node:assert/strict'
import {connect} from './review-live-cdp.mjs'
const raw=resolve(process.env.QA_RAW_ROOT??'')
if(!raw.includes('local-u1-raw-'))throw Error('需要本轮独立目录')
const facts=JSON.parse(readFileSync(join(raw,'client/facts-private.json')))
const prior=JSON.parse(readFileSync(join(raw,'client/owner-events.json')))
const r=await connect(Number(process.env.QA_CDP_PORT),p=>p.url.startsWith('http://localhost:'+process.env.PROFER_VITE_PORT))
const row={sourceSha:process.env.QA_APPLICATION_SHA,level:'MAIN_IPC',assertions:[],results:[]}
const save=()=>writeFileSync(join(raw,'client/preview-boundaries.json'),JSON.stringify(row,null,2)+'\n')
const check=(name,ok)=>{row.assertions.push({name,pass:!!ok});save();assert.ok(ok,name)}
const q=JSON.stringify
try{
 const outside=join(raw,'outside-preview');mkdirSync(outside,{recursive:true})
 const old=join(facts.workspace,'rename-probe-2.txt'),moved=join(outside,'moved-2.txt')
 writeFileSync(old,'P06_U1_RENAME_SYNTHETIC_ONLY')
 const before=await r.evaluate(`window.electronAPI.resolveAndReadFile(${q(old)},{sessionId:${q(facts.id)}})`)
 check('改名前普通文件真实可读',JSON.stringify(before).includes('P06_U1_RENAME_SYNTHETIC_ONLY'))
 renameSync(old,moved)
 const absent=await r.evaluate(`window.electronAPI.resolveAndReadFile(${q(old)},{sessionId:${q(facts.id)}})`)
 check('改名后旧路径不复用内容',absent===null)
 symlinkSync(moved,old)
 // 普通只读预览允许非敏感外部文件（ipc.ts isPreviewPathAllowed）；审核私有路径仍必须拒止。
 row.ordinaryOutsideRead=await r.evaluate(`window.electronAPI.resolveAndReadFile(${q(old)},{sessionId:${q(facts.id)}})`)
 const privateLink=join(facts.workspace,'private-link-2.txt')
 symlinkSync(join(facts.ownerWorkspace,'internal.txt'),privateLink)
 const inputs=[{path:privateLink,id:facts.id,kind:'symlink-to-review-private'},
  {path:join(facts.workspace,'../',facts.ownerId,'internal.txt'),id:facts.id,kind:'parent-to-owner'},
  {path:join(facts.ownerWorkspace,'internal.txt'),id:prior.delayedSessionId,kind:'deleted-owner-private-path'},
  {path:join(facts.ownerWorkspace,'internal.txt'),id:'p06-forged-session',kind:'unknown-owner-private-path'}]
 for(const input of inputs){const actual=await r.evaluate(`window.electronAPI.resolveAndReadFile(${q(input.path)},{sessionId:${q(input.id)}})`);row.results.push({...input,actual});check(input.kind+' 真实 Main 拒止',actual===null)}
 copyFileSync(join(facts.workspace,'scan.pdf'),join(facts.ownerWorkspace,'private-scan.pdf'))
 row.deletedPdf=await r.evaluate(`window.electronAPI.preparePdfPreview(${q(join(facts.ownerWorkspace,'private-scan.pdf'))},{sessionId:${q(prior.delayedSessionId)}}).then(value=>({value}),error=>({error:String(error)}))`)
 check('删除 owner 不能取得审核私有 PDF 预览令牌',!!row.deletedPdf.error||!row.deletedPdf.value?.tmpHtmlUrl)
 row.renamePrivate=await r.evaluate(`window.electronAPI.renameFile(${q(join(facts.ownerWorkspace,'internal.txt'))},'forbidden-renamed.txt').then(()=>({ok:true}),error=>({error:String(error)}))`)
 check('真实重命名 IPC 拒绝审核 owner 路径',!!row.renamePrivate.error)
 row.renameTraversal=await r.evaluate(`window.electronAPI.renameFile(${q(join(facts.workspace,'safe.txt'))},'../forbidden.txt').then(()=>({ok:true}),error=>({error:String(error)}))`)
 check('真实重命名 IPC 拒绝父目录逃逸',!!row.renameTraversal.error)
 row.status='PASS'
}catch(error){row.status='FAIL';row.error=String(error);process.exitCode=1}
finally{save();r.close();console.log(JSON.stringify({status:row.status,assertions:row.assertions.length,error:row.error}))}

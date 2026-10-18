// 真实 Main 元数据/删除回执驱动 Renderer 延迟 lookup；不用 provider，不替代 Pi 轮次验收。
import { readFileSync,writeFileSync,mkdirSync } from 'node:fs'
import { join,resolve } from 'node:path'
import assert from 'node:assert/strict'
import { connect,storeAccess } from './review-live-cdp.mjs'
const raw=resolve(process.env.QA_RAW_ROOT??'')
if(!raw.includes('local-u1-raw-'))throw Error('必须使用本轮独立根目录')
const facts=JSON.parse(readFileSync(join(raw,'client/facts-private.json'),'utf8'))
const q=JSON.stringify
const r=await connect(Number(process.env.QA_CDP_PORT),p=>p.url.startsWith('http://localhost:'+process.env.PROFER_VITE_PORT))
const m=await connect(Number(process.env.QA_MAIN_PORT),()=>true)
const result={sourceSha:process.env.QA_APPLICATION_SHA,level:'MAIN_IPC_RENDERER',startedAt:new Date().toISOString(),assertions:[]}
const save=()=>writeFileSync(join(raw,'client/owner-events.json'),JSON.stringify(result,null,2)+'\n')
const check=(name,ok)=>{result.assertions.push({name,pass:!!ok});save();assert.ok(ok,name)}
try {
 await r.poll('!!window.electronAPI?.listAgentSessions')
 result.pdfBody=await r.evaluate(`window.reviewAPI.importDocumentFromPath({caseId:${q(facts.caseId)},sourcePath:${q(join(raw,'profile/materials/readable-body.pdf'))},role:'evidence'})`)
 check('真实 Main IPC 正文 PDF 有原文块',result.pdfBody.parseStatus==='parsed'&&result.pdfBody.blocks.some(b=>b.text.includes('P06_U1_READABLE_BODY_PDF')))
 result.office={level:'REAL_MAIN_PARSER',rows:[]}
 for(const ext of ['docx','xlsx','pptx'])for(const mode of ['different','same']){
  const workspace=join(raw,'profile/materials/main-workspaces',ext+'-'+mode)
  mkdirSync(workspace,{recursive:true})
  const context={agentCwd:workspace,allowedRoots:[join(raw,'profile/materials')]}
  const paths=[join(raw,'profile/materials/A/proof.'+ext),join(raw,'profile/materials',mode==='same'?'same':'B','proof.'+ext)]
  const values=[]
  for(const path of paths)values.push(await m.evaluate(`__p06Live.executeParseDocumentTool({filePath:${q(path)}},${q(context)})`))
  result.office.rows.push({ext,mode,paths,values,collision:values[0].materialized?.fileId===values[1].materialized?.fileId,wrongSource:values[1].materialized?.sourcePath!==paths[1]})
  save()
 }
 result.office.productStatus=result.office.rows.every(r=>r.collision)?'BLOCKED_UPSTREAM':'INVESTIGATE'
 result.archive=await r.evaluate(`window.electronAPI.toggleArchiveAgentSession(${q(facts.id)})`)
 check('普通归档仍有真实 meta',result.archive.archived===true)
 const archived=await r.evaluate(`window.electronAPI.listAgentSessions(true)`)
 check('普通归档列表正例保留',archived.some(s=>s.id===facts.id))
 result.unarchive=await r.evaluate(`window.electronAPI.toggleArchiveAgentSession(${q(facts.id)})`)
 check('普通取消归档正例保留',result.unarchive.archived===false)
 const marker='P06_U1_SEARCH_SYNTHETIC_ONLY'
 for(const id of [facts.id,facts.ownerId])await m.evaluate(`__p06Live.sessions.appendSDKMessages(${q(id)},[{type:'user',uuid:${q(crypto.randomUUID())},message:{role:'user',content:[{type:'text',text:${q(marker)}}]}}]);true`)
 result.search=await r.evaluate(`window.electronAPI.searchAgentSessionMessages(${q(marker)})`)
 check('搜索不泄露内部 owner 且普通正例存在',!JSON.stringify(result.search).includes(facts.ownerId)&&JSON.stringify(result.search).includes(facts.id))
 result.ownerMessages=await r.evaluate(`window.electronAPI.getAgentSessionSDKMessages(${q(facts.ownerId)}).then(x=>({value:x}),e=>({error:String(e)}))`)
 check('普通 SDK 历史入口拒止内部 owner',!!result.ownerMessages.error)
 const temporary=await r.evaluate(`window.electronAPI.createAgentSession('P06 U1 延迟删除合成')`)
 result.delayedSessionId=temporary.id
 await r.evaluate(`(async()=>{${storeAccess}const a=await import('/atoms/agent-atoms.ts');store.set(a.agentSessionsAtom,store.get(a.agentSessionsAtom).filter(s=>s.id!==${q(temporary.id)}));const p=await import('/components/diff/preview-opener.ts');const gate=new Promise(resolve=>window.__u1ReleaseLookup=resolve);window.__u1Lookup={issued:false};window.__u1Lookup.promise=p.openFilePreviewTabAuthorized(store,${q(temporary.id)},{filePath:${q(join(facts.workspace,'safe.txt'))}},{},()=>true,async id=>{const actual=await window.electronAPI.getAgentSessionMeta(id);window.__u1Lookup.meta=actual;window.__u1Lookup.issued=true;await gate;return actual});return true})()`)
 result.heldMeta=await r.poll('window.__u1Lookup.issued&&window.__u1Lookup.meta')
 check('延迟回执来自真实 Main',result.heldMeta.id===temporary.id)
 await r.evaluate(`window.electronAPI.deleteAgentSession(${q(temporary.id)})`)
 // 保留缺少删除事件的事实，仍释放真实旧回执以验证是否实际复活。
 await new Promise(resolve=>setTimeout(resolve,250))
 result.deletionNotificationObserved=await r.evaluate(`(async()=>{${storeAccess}const a=await import('/lib/agent-tab-access.ts');return store.get(a.revokedAgentSessionIdsAtom).has(${q(temporary.id)})})()`)
 result.late=await r.evaluate('(async()=>{window.__u1ReleaseLookup();return await window.__u1Lookup.promise})()')
 result.rendererAfter=await r.evaluate(`(async()=>{${storeAccess}const a=await import('/atoms/agent-atoms.ts');const p=await import('/atoms/preview-atoms.ts');return {sessionPresent:store.get(a.agentSessionsAtom).some(s=>s.id===${q(temporary.id)}),preview:store.get(p.previewFileMapAtom).get(${q(temporary.id)})}})()`)
 result.deletedMeta=await r.evaluate(`window.electronAPI.getAgentSessionMeta(${q(temporary.id)})`)
 check('删除后的真实 Main meta 为 null',result.deletedMeta===null)
 result.forged=await r.evaluate(`(async()=>{${storeAccess}const p=await import('/components/diff/preview-opener.ts');return await p.openFilePreviewTabAuthorized(store,'p06-forged-id',{filePath:${q(join(facts.workspace,'safe.txt'))}},{},()=>true,()=>window.electronAPI.getAgentSessionMeta(${q(facts.id)}))})()`)
 check('不同 ID 的真实 Main metadata 不能冒充 lookup 身份',result.forged==='')
 check('真实删除后的迟到 lookup 不复活会话及预览',result.late===''&&!result.rendererAfter.sessionPresent&&!result.rendererAfter.preview)
 result.status='PASS'
}catch(error){result.status='FAIL';result.error=String(error);process.exitCode=1}
finally{result.finishedAt=new Date().toISOString();save();r.close();m.close();console.log(JSON.stringify({status:result.status,assertions:result.assertions.length,error:result.error}))}

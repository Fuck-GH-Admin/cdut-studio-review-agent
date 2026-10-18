// 本轮真实 Electron/Main/IPC 与普通侧栏探针。无授权 provider 时不签 Pi/S0 PASS。
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, symlinkSync } from 'node:fs'
import { join, resolve } from 'node:path'
import assert from 'node:assert/strict'
import { connect, storeAccess } from './review-live-cdp.mjs'
const raw=resolve(process.env.QA_RAW_ROOT??''),profile=join(raw,'profile'),dir=join(raw,'client')
if(!process.env.QA_RAW_ROOT||!raw.includes('local-u1-raw-'))throw Error('需要独立 raw 根目录')
mkdirSync(dir,{recursive:true})
const mode=process.argv[2]??'prepare',q=JSON.stringify
const r=await connect(Number(process.env.QA_CDP_PORT),p=>p.url.startsWith('http://localhost:'+process.env.PROFER_VITE_PORT)&&!p.url.includes('window='))
const m=await connect(Number(process.env.QA_MAIN_PORT),()=>true)
const report={sourceSha:process.env.QA_APPLICATION_SHA,mode,startedAt:new Date().toISOString(),level:'MAIN_IPC_SCOPED_NO_PROVIDER',rows:[]}
const save=()=>writeFileSync(join(dir,mode+'.json'),JSON.stringify(report,null,2)+'\n')
async function row(id,fn){const item={id,status:'RUNNING',startedAt:new Date().toISOString(),assertions:[]};report.rows.push(item);save();const check=(name,value)=>{item.assertions.push({name,pass:!!value});save();assert.ok(value,name)};try{await fn(item,check);item.status='PASS'}catch(error){item.status='FAIL';item.error=String(error);process.exitCode=1;await r.screenshot(dir,id+'-failure').catch(()=>{})}finally{item.finishedAt=new Date().toISOString();save();console.log(JSON.stringify({id,status:item.status,error:item.error}))}}
const factsPath=join(dir,'facts-private.json')
let facts
async function activate(id,workspace){return r.evaluate(`(async()=>{${storeAccess}const a=await import('/atoms/agent-atoms.ts');const v=await import('/atoms/active-view.ts');const modeAtoms=await import('/atoms/app-mode.ts');const tabs=await import('/atoms/tab-atoms.ts');const list=await window.electronAPI.listAgentSessions(true);store.set(a.agentSessionsAtom,list);store.set(a.currentAgentSessionIdAtom,${q(id)});store.set(modeAtoms.appModeAtom,'agent');store.set(v.activeViewAtom,'conversations');store.set(tabs.tabsAtom,[{id:${q(id)},type:'agent',sessionId:${q(id)},title:'P06_U1_SYNTHETIC'}]);store.set(tabs.activeTabIdAtom,${q(id)});store.set(a.agentSessionPathMapAtom,new Map([[${q(id)},${q(workspace)}]]));return true})()`)}
async function open(file){return r.evaluate(`(async()=>{${storeAccess}const p=await import('/components/diff/preview-opener.ts');const a=await import('/atoms/preview-atoms.ts');const t=await import('/atoms/tab-atoms.ts');const before=store.get(t.tabsAtom).map(t=>t.type);const result=await p.openFilePreviewTabAuthorized(store,${q(facts.id)},{filePath:${q(join(facts.workspace,file))},previewOnly:true,readOnly:false});return {result,before,after:store.get(t.tabsAtom).map(t=>t.type),file:store.get(a.previewFileMapAtom).get(${q(facts.id)})}})()`)}
try{
 await r.poll('!!window.electronAPI?.getSettings && !!window.reviewAPI')
 await m.poll('!!globalThis.__p06Live')
 report.environment=await m.evaluate('({versions:__p06Live.versions,...__p06Live.environment})');save()
 assert.equal(report.environment.config,join(profile,'config'));assert.equal(report.environment.userData,join(profile,'user-data'))
 await r.evaluate(`(async()=>{const {CURRENT_COACH_TOUR_VERSION}=await import('/components/onboarding/coach-tour/coach-tour-steps.ts');await window.electronAPI.updateSettings({onboardingCompleted:true,tutorialBannerDismissed:true,coachTourVersion:CURRENT_COACH_TOUR_VERSION});return true})()`)
 await r.call('Page.reload');await r.poll('!!window.electronAPI?.getSettings && document.body?.innerText.length>10')
 if(mode==='prepare'){
  facts={}
  await row('MAIN_CASE_AND_NEGATIVE_ACK',async(item,check)=>{
   const c=await r.evaluate(`window.reviewAPI.createCase({title:'P06 U1 本轮合成安全探针',type:'自定义审核',applicant:'SYNTHETIC_ONLY',academicYear:'2026'})`)
   facts.caseId=c.id
   item.caseId=c.id
   item.imports=[]
   for(const path of ['A/proof.docx','B/proof.docx','A/proof.xlsx','A/proof.pptx','readable.pdf','scan.pdf','blank.pdf','corrupt.pdf']){
    const sourcePath=join(profile,'materials',path)
    const value=await r.evaluate(`window.reviewAPI.importDocumentFromPath({caseId:${q(c.id)},sourcePath:${q(sourcePath)},role:'evidence'})`)
    item.imports.push({input:path,result:value});save()
   }
   check('真实 Main IPC 已独立导入八份合成材料',item.imports.length===8&&item.imports.every(x=>x.result.id))
   item.start=await r.evaluate(`window.reviewAPI.startBackgroundPiReviewV2({caseId:${q(c.id)},mode:'restart'}).then(v=>({value:v}),e=>({error:String(e)}))`)
   check('Main 回执不泄露内部身份',!JSON.stringify(item.start).includes('sessionId')&&!JSON.stringify(item.start).includes('assignmentId'));if(item.start.value?.phase==='accepted'){item.ownership=await m.evaluate(`(()=>{const a=__p06Live.assignments.listAssignments().find(a=>a.caseId===${q(c.id)}&&a.activeRunId===${q(item.start.value.runId)});return {run:__p06Live.runs.getRunV2(${q(c.id)},${q(item.start.value.runId)}),hasAssignment:!!a}})()`);check('accepted 有真实 V2 run 与指派',item.ownership.hasAssignment&&item.ownership.run?.id===item.start.value.runId)}
   item.aggregate=await r.evaluate(`window.reviewAPI.getAggregateV2(${q(c.id)})`)
  })
  await row('MAIN_OWNER_AND_ORDINARY_POSITIVE',async(item,check)=>{
   const ordinary=await r.evaluate(`window.electronAPI.createAgentSession('P06 U1 普通合成预览')`)
   facts.id=ordinary.id;facts.workspace=join(profile,'config/agent-workspaces/default',ordinary.id);mkdirSync(facts.workspace,{recursive:true})
   for(const name of ['proof.docx','proof.xlsx','proof.pptx'])copyFileSync(join(profile,'materials/A',name),join(facts.workspace,name))
   copyFileSync(join(profile,'materials/scan.pdf'),join(facts.workspace,'scan.pdf'))
   writeFileSync(join(facts.workspace,'safe.txt'),'P06_U1_LOCAL_READ_ONLY\n')
   const owner=await m.evaluate(`__p06Live.sessions.createReviewOwnedAgentSession({caseId:${q(facts.caseId)},title:'P06 U1 内部合成会话',channelId:'synthetic-unconfigured'})`)
   facts.ownerId=owner.id
   facts.ownerWorkspace=join(profile,'config/agent-workspaces/default',owner.id);mkdirSync(facts.ownerWorkspace,{recursive:true});writeFileSync(join(facts.ownerWorkspace,'internal.txt'),'P06_U1_INTERNAL_SYNTHETIC_ONLY')
   symlinkSync(facts.ownerWorkspace,join(facts.workspace,'outside-owner'),'dir')
   item.projection=await r.evaluate(`(async()=>{const list=await window.electronAPI.listAgentSessions(true);return {ownerVisible:list.some(s=>s.id===${q(owner.id)}),ordinaryVisible:list.some(s=>s.id===${q(ordinary.id)}),ownerMeta:await window.electronAPI.getAgentSessionMeta(${q(owner.id)}),ordinaryMeta:await window.electronAPI.getAgentSessionMeta(${q(ordinary.id)})}})()`)
   check('真实 IPC 隐藏 review owner，普通正例可见',!item.projection.ownerVisible&&item.projection.ownerMeta===null&&item.projection.ordinaryVisible&&item.projection.ordinaryMeta.id===ordinary.id)
   item.read=await r.evaluate(`window.electronAPI.resolveAndReadFile(${q(join(facts.workspace,'safe.txt'))},{sessionId:${q(ordinary.id)}})`)
   check('普通真实读取可用',JSON.stringify(item.read).includes('P06_U1_LOCAL_READ_ONLY'))
   item.denied=[]
   for(const path of [join(facts.ownerWorkspace,'internal.txt'),join(facts.workspace,'outside-owner/internal.txt')])item.denied.push(await r.evaluate(`window.electronAPI.resolveAndReadFile(${q(path)},{sessionId:${q(ordinary.id)}})`))
   check('直接路径及目录 symlink 无法读审核 owner 原件',item.denied.every(x=>x===null))
   item.ownerSend=await r.evaluate(`window.electronAPI.sendAgentMessage({sessionId:${q(owner.id)},channelId:'synthetic-unconfigured',agentRuntime:'pi',triggeredBy:'user',uuid:crypto.randomUUID(),userMessage:'合成普通 IPC 越权探针'}).then(()=>({ok:true}),e=>({error:String(e)}))`)
   check('内部 owner 普通发送入口拒止',!!item.ownerSend.error)
  })
  writeFileSync(factsPath,JSON.stringify(facts,null,2))
 } else facts=JSON.parse(readFileSync(factsPath,'utf8'))
 if(mode!=='restore') await row('MAIN_REAL_RUNAGENT_MISSING_BINDING',async(item,check)=>{
   item.results=[]
   const channelId=await m.evaluate(`__p06Live.channels.createChannel({name:'P06 U1 无网络合成守卫渠道',provider:'deepseek',baseUrl:'http://127.0.0.1:1',apiKey:'SYNTHETIC_NO_REAL_CREDENTIAL',enabled:true,models:[{id:'synthetic-model',name:'合成不可调用模型',enabled:true}]}).id`)
   for(const variant of ['no-binding','preset-swapped','non-user']){
    const s=await m.evaluate(`__p06Live.sessions.createReviewOwnedAgentSession({caseId:${q(facts.caseId)},title:'P06 U1 '+${q(variant)},channelId:${q(channelId)},modelId:'synthetic-model'})`)
    if(variant==='preset-swapped')await m.evaluate(`__p06Live.sessions.updateAgentSessionMeta(${q(s.id)},{presetId:'standard',presetReference:undefined});true`)
    const before=await m.evaluate(`__p06Live.events.filter(e=>e.event==='real-pi-query-entered'&&e.sessionId===${q(s.id)}).length`)
    const value=await m.evaluate(`__p06Live.runAgent({sessionId:${q(s.id)},channelId:${q(channelId)},modelId:'synthetic-model',agentRuntime:'pi',triggeredBy:${q(variant==='non-user'?'automation':'user')},uuid:${q(crypto.randomUUID())},userMessage:'P06 U1 合成缺绑定负例'}).then(()=>({returned:true}),e=>({error:String(e)}))`)
    const msgs=await m.evaluate(`__p06Live.sessions.getAgentSessionSDKMessages(${q(s.id)})`)
    const after=await m.evaluate(`__p06Live.events.filter(e=>e.event==='real-pi-query-entered'&&e.sessionId===${q(s.id)}).length`)
    const rejectionEvents=await m.evaluate(`__p06Live.events.filter(e=>e.sessionId===${q(s.id)})`);const valueText=JSON.stringify({value,msgs,rejectionEvents})
    item.results.push({variant,sessionId:s.id,value,messages:msgs,rejectionEvents,piQueries:after-before});save()
    check(variant+' 在真实 Main runAgent 拒止且未进入 Pi query',valueText.includes('拒绝降级为普通 Agent 权限')&&after===before)
   }
  })
 await activate(facts.id,facts.workspace)
 await row('PREVIEW_OWNER_NEGATIVE_AND_TEXT',async(item,check)=>{
  item.text=await open('safe.txt');check('侧栏打开且强制只读、不新增 Tab',!!item.text.result&&item.text.file.readOnly===true&&JSON.stringify(item.text.before)===JSON.stringify(item.text.after))
  await r.poll('[...document.querySelectorAll("diffs-container")].some(e=>e.shadowRoot?.textContent.includes("P06_U1_LOCAL_READ_ONLY"))',30000)
  item.surface=await r.evaluate(`[...document.querySelectorAll('diffs-container')].map(e=>({visible:e.getClientRects().length>0,markerPresent:!!e.shadowRoot?.textContent.includes('P06_U1_LOCAL_READ_ONLY')}))`)
  check('实际只读 Shadow DOM 显示精确文本',item.surface.some(e=>e.visible&&e.markerPresent))
  item.owner=await r.evaluate(`(async()=>{${storeAccess}const p=await import('/components/diff/preview-opener.ts');return await p.openFilePreviewTabAuthorized(store,${q(facts.ownerId)},{filePath:${q(join(facts.ownerWorkspace,'internal.txt'))}})})()`)
  check('review owner 授权 lookup 不可打开普通预览',item.owner==='')
  item.unknown=await r.evaluate(`(async()=>{${storeAccess}const p=await import('/components/diff/preview-opener.ts');return await p.openFilePreviewTabAuthorized(store,'p06-nonexistent-session',{filePath:${q(join(facts.workspace,'safe.txt'))}})})()`)
  check('不存在会话不可凭事件恢复',item.unknown==='')
  await r.screenshot(dir,mode+'-text-preview')
 })
 for(const ext of ['docx','xlsx','pptx'])await row('PREVIEW_REAL_'+ext,async(item,check)=>{
  item.open=await open('proof.'+ext);check('真实侧栏打开',!!item.open.result&&item.open.file.readOnly===true)
  await r.poll('document.body.innerText.includes("P06_U1_SYNTHETIC_A")||!!document.querySelector("iframe")||[...document.querySelectorAll("canvas")].some(c=>c.width>0&&c.height>0)',30000)
  item.dom=await r.evaluate('({text:document.body.innerText.slice(-12000),iframes:[...document.querySelectorAll("iframe")].map(x=>({title:x.title,src:x.src})),canvases:[...document.querySelectorAll("canvas")].map(c=>({width:c.width,height:c.height}))})')
  // 可见文本或实际非空 canvas 仅签该格式的 Renderer 见证。
  check('真实 Office 页面可见内容',item.dom.text.includes('P06_U1_SYNTHETIC_A')||item.dom.canvases.some(c=>c.width>0&&c.height>0))
  await r.screenshot(dir,mode+'-office-'+ext)
 })
 await row('PREVIEW_SCAN_PDF_CANVAS',async(item,check)=>{
  item.prepared=await r.evaluate(`window.electronAPI.preparePdfPreview(${q(join(facts.workspace,'scan.pdf'))},{sessionId:${q(facts.id)}})`)
  check('真实 Main PDF 返回受控 URL',item.prepared?.tmpHtmlUrl?.startsWith('cdut-file://'))
  item.open=await open('scan.pdf');check('真实扫描 PDF 只读侧栏打开',!!item.open.result)
  await r.poll('!!document.querySelector("iframe")',30000)
  item.frames=await r.call('Page.getFrameTree')
  const targets=await r.call('Target.getTargets');item.targets=targets.targetInfos.map(t=>({targetId:t.targetId,type:t.type,url:t.url}))
  const target=targets.targetInfos.find(t=>t.type==='iframe'&&t.url.startsWith('cdut-file://'))
  let canvas
  if(target){const attached=await r.call('Target.attachToTarget',{targetId:target.targetId,flatten:true});const end=Date.now()+30000;while(Date.now()<end){const v=await r.call('Runtime.evaluate',{expression:'(()=>{const c=document.querySelector("canvas");return {width:c?.width,height:c?.height,error:document.getElementById("err")?.textContent}})()',returnByValue:true},attached.sessionId);canvas=v.result?.value;if(canvas?.width>0&&canvas?.height>0)break;await new Promise(a=>setTimeout(a,100))}}
  item.canvas=canvas;check('PDF iframe 实际绘制 canvas',canvas?.width>0&&canvas?.height>0)
  await r.screenshot(dir,mode+'-scan-pdf')
 })
 if(mode==='restore')await row('REAL_PROCESS_RESTART_PERSISTENCE',async(item,check)=>{
  item.meta=await r.evaluate(`window.electronAPI.getAgentSessionMeta(${q(facts.id)})`)
  item.owner=await r.evaluate(`window.electronAPI.getAgentSessionMeta(${q(facts.ownerId)})`)
  item.assignments=await m.evaluate('__p06Live.assignments.listAssignments()')
  check('独立新 PID 保留普通会话并隐藏旧 owner',item.meta?.id===facts.id&&item.owner===null)
 })
 report.mainEvents=await m.evaluate('__p06Live.events')
}finally{report.finishedAt=new Date().toISOString();save();r.close();m.close()}

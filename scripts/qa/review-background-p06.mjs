/**
 * P06-S02 real Electron/Pi double-round replay, over isolated localhost CDP.
 * Requires a NEW isolated test profile with an already-authorized Pi model; cases are synthetic.
 * A failed or unreachable UI is NOT-RUN/FAIL, never silently PASS.
 */
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import WebSocket from 'ws'
import { createServer } from 'node:http'

const reportDir = process.env.QA_REPORT_DIR
if (!reportDir) throw new Error('QA_REPORT_DIR is required')
mkdirSync(reportDir, { recursive: true })
const accountDoc = readFileSync('docs/design/review-agent/16-batch-review-stage-b-local-acceptance.md', 'utf8')
const demoUser = accountDoc.match(/\|\s*账号\s*\|\s*([^|]+)\|/)?.[1]?.trim().replace(/`/g, '')
const demoPass = accountDoc.match(/\|\s*密码\s*\|\s*([^|]+)\|/)?.[1]?.trim().replace(/`/g, '')
if (!demoUser || !demoPass) throw new Error('Demo login fixture not documented; refusing to guess credentials')
const results = []
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const deadline = (ms) => Date.now() + ms
let ws
let seq = 0
const pending = new Map()

async function connect() {
  const end = deadline(120000)
  let url
  while (Date.now() < end) {
    try {
      const response = await fetch('http://127.0.0.1:9222/json/list')
      const pages = await response.json()
      url = pages.find((x) => (x.url || '').startsWith('http://localhost:5176') && !x.url.includes('window=agent-preview'))?.webSocketDebuggerUrl
      if (url) break
    } catch {}
    await delay(1000)
  }
  if (!url) throw new Error('No real app renderer target on Electron debugging port')
  ws = new WebSocket(url)
  await new Promise((resolve, reject) => {
    ws.once('open', resolve)
    ws.once('error', reject)
  })
  ws.on('message', (raw) => {
    const msg = JSON.parse(String(raw))
    const waiter = pending.get(msg.id)
    if (waiter) {
      pending.delete(msg.id)
      if (msg.error) waiter.reject(new Error(JSON.stringify(msg.error)))
      else waiter.resolve(msg.result)
    }
  })
  await send('Runtime.enable')
  await send('Page.enable')
}
async function send(method, params = {}) {
  const id = ++seq
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => {
      pending.delete(id)
      reject(new Error('CDP timeout: ' + method))
    }, 30000)
    pending.set(id, { resolve: (v) => { clearTimeout(t); resolve(v) },
      reject: (e) => { clearTimeout(t); reject(e) } })
    ws.send(JSON.stringify({ id, method, params }))
  })
}
async function evaluate(expression) {
  const res = await send('Runtime.evaluate', {
    expression, awaitPromise: true, returnByValue: true, userGesture: true,
  })
  if (res.exceptionDetails) throw new Error('Renderer JS exception: ' + (res.exceptionDetails.text || '') +
    ' ' + (res.exceptionDetails.exception?.description || ''))
  return res.result?.value
}
async function eventually(name, expression, ms = 30000) {
  const end = deadline(ms)
  let last
  while (Date.now() < end) {
    try { last = await evaluate(expression); if (last) return last } catch (error) { last = String(error) }
    await delay(400)
  }
  throw new Error(name + ' timed out; last=' + JSON.stringify(last) +
    '; page=' + JSON.stringify(await evaluate('document.body?.innerText?.slice(0, 1600)')))
}
async function screenshot(name) {
  const png = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
  writeFileSync(join(reportDir, name + '.png'), Buffer.from(png.data, 'base64'))
}
async function record(name, fn) {
  const start = Date.now()
  try {
    const details = await fn()
    results.push({ name, status: 'PASS', durationMs: Date.now() - start, details })
    console.log('[PASS] ' + name, details ? JSON.stringify(details) : '')
  } catch (e) {
    results.push({ name, status: 'FAIL', durationMs: Date.now() - start, error: String(e) })
    console.error('[FAIL] ' + name + ': ' + e)
    await screenshot('failure-' + results.length).catch(() => {})
    throw e
  } finally {
    writeFileSync(join(reportDir, 'electron-ui-results.json'), JSON.stringify(results, null, 2))
  }
}
async function clickText(text) {
  const ok = await evaluate('(() => { const target = ' + JSON.stringify(text) + '; ' +
    'const elements = [...document.querySelectorAll("button,a,[role=button],[role=tab]")];' +
    'const el = elements.find(e => e.getClientRects().length && (e.textContent || "").trim().includes(target));' +
    'if (el) { el.click(); return true }' +
    'const any = [...document.querySelectorAll("body *")].find(e => e.children.length === 0 && (e.textContent || "").trim() === target && e.getClientRects().length);' +
    'if (any) { (any.closest("button,a,[role=button],[role=tab],.cursor-pointer") || any).click(); return true }' +
    'return false })()')
  if (!ok) throw new Error('Visible clickable text not found: ' + text +
    '; page=' + JSON.stringify(await evaluate('document.body?.innerText?.slice(0, 1800)')))
}
async function selectValue(selector, value) {
  const ok = await evaluate('(() => { const el = document.querySelector(' + JSON.stringify(selector) + ');' +
    'if (!el) return false; const setter=Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,"value").set;' +
    'setter.call(el, ' + JSON.stringify(value) + '); el.dispatchEvent(new Event("change",{bubbles:true})); return true })()')
  if (!ok) throw new Error('Select absent: ' + selector)
}

const profileRoot = process.env.QA_PROFILE_ROOT
const sourcePath = process.env.QA_SOURCE_PATH
if (!profileRoot || !sourcePath) throw new Error('QA_PROFILE_ROOT and QA_SOURCE_PATH are required')
const originalSelection = JSON.parse(readFileSync(join(profileRoot, 'config/review-module-settings.json'), 'utf8')).agentModelSelection
const readOwners = () => { const path=join(profileRoot,'config/agent-sessions.json'); return existsSync(path) ? JSON.parse(readFileSync(path,'utf8')).sessions.filter(session=>session.owner?.kind==='review-case') : [] }
let cases
let fixtureRequests=0
const providerFixture=createServer((_request,response)=>{fixtureRequests+=1;setTimeout(()=>{response.writeHead(500,{'Content-Type':'application/json'});response.end(JSON.stringify({error:{message:'A0 synthetic provider failure',type:'api_error'}}))},1500)})
async function clickSelector(selector) {
  const rect = await evaluate(`(() => { const el=document.querySelector(${JSON.stringify(selector)}); if(!el) return null; const r=el.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2} })()`)
  if (!rect) throw new Error('Selector not found: ' + selector)
  await send('Input.dispatchMouseEvent', {type:'mousePressed',button:'left',clickCount:1,...rect})
  await send('Input.dispatchMouseEvent', {type:'mouseReleased',button:'left',clickCount:1,...rect})
}
async function openReview() {
  await eventually('preload ready', '!!window.reviewAPI?.startBackgroundPiReviewV2', 120000)
  await eventually('React shell ready', 'document.body.innerText.trim().length > 10', 120000)
  await send('Input.dispatchKeyEvent', {type:'keyDown',key:'Escape',code:'Escape'})
  await send('Input.dispatchKeyEvent', {type:'keyUp',key:'Escape',code:'Escape'})
  if (await evaluate('document.body.innerText.includes("待我处理")')) return
  if(await evaluate(`!!document.querySelector('[aria-label="退出引导"]')`)) await clickSelector('[aria-label="退出引导"]')
  if(await evaluate('document.body.innerText.includes("稍后再学")')) await clickText('稍后再学')
  if(await evaluate(`!!document.querySelector('[aria-label="展开侧边栏"]')`)) await clickSelector('[aria-label="展开侧边栏"]')
  await eventually('CDUT navigation ready', 'document.body.innerText.includes("CDUT 专区")', 40000)
  await clickText('CDUT 专区')
  await delay(500)
  if (await evaluate('!!document.querySelector("input[type=password]")')) {
    const result = await evaluate(`(() => {
      const pass=document.querySelector('input[type=password]');
      const user=[...document.querySelectorAll('input')].find(e=>e!==pass && e.getClientRects().length && ['text','number','tel',''].includes(e.type));
      if(!user || !pass) return false;
      const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;
      for(const [el,value] of [[user,${JSON.stringify(demoUser)}],[pass,${JSON.stringify(demoPass)}]]) {
        setter.call(el,value);el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));
      }
      return true;
    })()`)
    if (!result) throw new Error('Offline demo login fields unavailable')
    await clickText('一键连接特区账户')
  }
  await eventually('material review entry', 'document.body.innerText.includes("材料审核")', 40000)
  await clickText('材料审核')
  await eventually('real workbench', 'document.body.innerText.includes("待我处理")', 40000)
}
async function chooseCase(title) {
  // 隔离 fixture 通过现有选择控制器与真实 IPC 装载；审核启动/停止仍点击产品按钮。
  const id=Object.values(cases).find(c=>c.title===title).id
  await evaluate(`(async()=>{
    const source=await(await fetch('/atoms/review-atoms.ts')).text();
    const url=source.split('from "')[1].split('"')[0];
    const {getDefaultStore}=await import(url);
    const {createReviewActionsController}=await import('/components/content-review/review-actions-controller.ts');
    await createReviewActionsController(getDefaultStore(),window.reviewAPI).selectCase(${JSON.stringify(id)});
  })()`)
  if(await evaluate(`!!document.querySelector('[aria-label="退出引导"]')`)) await clickSelector('[aria-label="退出引导"]')
  if(await evaluate('document.body.innerText.includes("稍后再学")')) await clickText('稍后再学')
  await delay(700)
}
const stateExpression = (caseId) => `window.reviewAPI.getBackgroundPiReviewStateV2(${JSON.stringify(caseId)})`
async function waitAccepted(caseId) {
  return eventually('real Main admission', `(async()=>{const s=await ${stateExpression(caseId)};return s.phase==='accepted' ? s : false})()`, 45000)
}
async function waitTerminal(caseId) {
  return eventually('persisted terminal result', `(async()=>{const s=await ${stateExpression(caseId)};return ['finished','incomplete','needs-attention'].includes(s.phase) ? s : false})()`, 240000)
}
async function seed() {
  cases = await evaluate(`(async()=>{
    const templateId='p06-double-round-synthetic-20261013';
    const template={templateId,version:1,schemaVersion:2,name:'P06 合成双轮预算检查',objectType:'person',displayName:{template:'{{title}}'},fields:[],
      sections:[{id:'all',name:'内容核验',order:0,required:false,criteria:[{id:'budget',title:'预算文本核验',requirement:'完整读取申请文本，核对其是否明确写明总预算100元。只核对文字，不判断学校授权。提交检查时必须引用本轮实际读取的原文出处。',execution:'semantic',targetScope:'case'}]}],
      materialSlots:[],policyVersionIds:[],policyRefs:[],stages:[{id:'review',name:'本地预审',kind:'manual-review',executorRole:'reviewer'}],outputs:[],status:'draft',sourceNote:'P06_SYNTHETIC_ONLY: 合成测试，不是学校政策或审批',createdAt:new Date().toISOString()};
    const old=await window.reviewAPI.getTemplateV2(templateId,1);
    if(!old){await window.reviewAPI.saveTemplateDraftV2(template);await window.reviewAPI.publishTemplateV2(templateId,1)}
    const found=await window.reviewAPI.listCases();const result={};
    for(const [key,title] of [['success','P06 同案更新测试'],['preflight','P06 辅助隔离案卷'],['stop','P06 从头重审测试'],['failure','P06 辅助失败案卷']]) {
      let c=found.find(x=>x.title===title);
      if(!c){c=await window.reviewAPI.createCase({title,type:'自定义审核',applicant:'合成测试甲',academicYear:'2026',reviewTemplate:{templateId,version:1}});await window.reviewAPI.importDocumentFromPath({caseId:c.id,sourcePath:${JSON.stringify(sourcePath)},role:'application'})}
      result[key]={id:c.id,title};
    }
    return result;
  })()`)
  writeFileSync(join(reportDir, 'synthetic-cases.json'), JSON.stringify(cases,null,2))
}

async function boot() {
  await connect()
  await eventually('preload bootstrap', '!!window.electronAPI?.getSettings && !!window.reviewAPI', 120000)
  const guide = await evaluate(`(async()=>{
    const {CURRENT_COACH_TOUR_VERSION}=await import('/components/onboarding/coach-tour/coach-tour-steps.ts');
    const s=await window.electronAPI.getSettings();
    if(s.onboardingCompleted&&s.tutorialBannerDismissed&&s.coachTourVersion===CURRENT_COACH_TOUR_VERSION)return false;
    await window.electronAPI.updateSettings({onboardingCompleted:true,tutorialBannerDismissed:true,coachTourVersion:CURRENT_COACH_TOUR_VERSION});return true
  })()`)
  if (guide) await send('Page.reload')
  if (await evaluate('document.body.innerText.includes("欢迎使用 CDUT Studio")')) {
    await evaluate('window.electronAPI.updateSettings({onboardingCompleted:true})')
    await send('Page.reload')
  }
  await eventually('Pi review preload', '!!window.reviewAPI?.stopBackgroundPiReviewV2', 120000)
  await seed()
  await openReview()
}
const remoteState = (caseId) => `window.reviewAPI.getBackgroundPiReviewStateV2(${JSON.stringify(caseId)})`
async function newAcceptance(caseId, priorRunId) {
  return eventually('new round has true ACK', `(async()=>{
    const s=await ${remoteState(caseId)};
    return s.phase==='accepted' && s.runId!==${JSON.stringify(priorRunId)} ? s : false
  })()`, 60000)
}
async function queryRun(caseId, runId) {
  return evaluate(`window.reviewAPI.getRunV2(${JSON.stringify(caseId)},${JSON.stringify(runId)})`)
}
async function tryOldStop(caseId, runId) {
  return evaluate(`(async()=>{
    try {await window.reviewAPI.stopBackgroundPiReviewV2({caseId:${JSON.stringify(caseId)},runId:${JSON.stringify(runId)}});return {allowed:true}}
    catch(e){return {allowed:false,reason:String(e)}}
  })()`)
}
async function clickStop(caseId, expectedRunId) {
  await eventually('visible real stop button', 'document.body.innerText.includes("停止审核")', 30000)
  await clickText('停止审核')
  const stopped = await waitTerminal(caseId)
  if (stopped.runId !== expectedRunId || stopped.runStatus !== 'cancelled') {
    throw new Error('stop did not retire expected round: '+JSON.stringify({expectedRunId,stopped}))
  }
  return stopped
}
async function ensureNoPriorStopFeedback() {
  const has = await evaluate('document.body.innerText.includes("本次审核已停止。")')
  if (has) throw new Error('Old green stop receipt visible after next review ACK')
}
async function runTwice(key, mode) {
  const target=cases[key]
  await chooseCase(target.title)
  const priorOwners=readOwners().filter(x=>x.owner?.caseId===target.id).map(x=>x.id)
  await clickText('开始审核')
  const first=await waitAccepted(target.id)
  const firstOwners=readOwners().filter(x=>x.owner?.caseId===target.id)
  if(firstOwners.length===0)throw new Error('No actual atomically-persisted review owner')
  const owner1=firstOwners.find(x=>!priorOwners.includes(x.id))?.id ?? firstOwners.at(-1).id
  const stopped1=await clickStop(target.id,first.runId)
  await clickText(mode==='update'?'更新审核结果':'重新审核')
  const second=await newAcceptance(target.id,first.runId)
  const owners=readOwners().filter(x=>x.owner?.caseId===target.id)
  const owner2=mode==='update'?owners.find(x=>x.id===owner1)?.id:owners.find(x=>x.id!==owner1)?.id
  if(!owner2)throw new Error('Expected '+mode+' owner policy not met')
  if(mode==='restart'&&owner2===owner1)throw new Error('restart reused the old owner')
  if(mode==='update'&&owner2!==owner1)throw new Error('update failed to reuse owner')
  const rejected=await tryOldStop(target.id,first.runId)
  if(rejected.allowed || !rejected.reason.includes('运行已变化'))throw new Error('Old run stop unexpectedly accepted: '+JSON.stringify(rejected))
  const active=await queryRun(target.id,second.runId)
  const historic=await queryRun(target.id,first.runId)
  if(active?.status!=='running'||historic?.status!=='cancelled')throw new Error('Old stop affected new round: '+JSON.stringify({active:active?.status,historic:historic?.status}))
  await ensureNoPriorStopFeedback()
  await screenshot('p06-'+key+'-second-accepted')
  const stopped2=await clickStop(target.id,second.runId)
  const priorAfter=await queryRun(target.id,first.runId)
  if(priorAfter?.status!=='cancelled')throw new Error('Old ledger mutated after second completion')
  await screenshot('p06-'+key+'-both-retired')
  return {caseId:target.id,mode,rounds:[{runId:first.runId,ownerId:owner1,terminal:stopped1.runStatus},{runId:second.runId,ownerId:owner2,terminal:stopped2.runStatus}],oldStopDenied:rejected.reason,oldLedgerUnchanged:true,latestAckReal:true,guiButtonsClicked:true}
}
try {
  await boot()
  await record('P06-S02-E01 same-case update reuses owner, late old stop denied', async()=>runTwice('success','update'))
  await record('P06-S02-E02 same-case restart creates new owner after stop release', async()=>runTwice('stop','restart'))
  writeFileSync(join(reportDir,'p06-summary.json'),JSON.stringify({status:'PASS',results,scope:'REAL Electron/Main IPC/Pi/provider using isolated synthetic cases. Deliberate late onRunOutcome injection, cross-process crash, Relay/Pocket/Feishu NOT-RUN.'},null,2))
} catch (error) {
  writeFileSync(join(reportDir,'p06-summary.json'),JSON.stringify({status:'FAIL',results,error:String(error)},null,2))
  console.error(String(error))
  process.exitCode=1
} finally {
  if (ws?.readyState===WebSocket.OPEN) ws.close()
  providerFixture.close()
}

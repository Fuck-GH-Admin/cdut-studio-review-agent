// P02 R01–R07：通过真实 Electron Renderer -> Preload IPC -> Main 和实际 Jotai store 验收。
import { readFileSync, writeFileSync, mkdirSync, symlinkSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { randomUUID } from 'node:crypto'
import { connect, storeAccess } from './review-live-cdp.mjs'

const raw = resolve(process.env.P06_OFFICE71_RAW_ROOT ?? '')
if (!process.env.P06_OFFICE71_RAW_ROOT || !raw.split(/[\\/]/).at(-1)?.startsWith('p06-office71-local-r02-')) {
  throw new Error('P02 兼容冒烟只能使用本轮 Office R02 隔离 profile')
}
const profile = join(raw, 'profile')
const clientDir = join(raw, 'client')
mkdirSync(clientDir, { recursive: true })
const mode = process.argv[2]
const q = JSON.stringify
const factsPath = join(clientDir, 'facts-private.json')
const report = { sourceSha: process.env.QA_APPLICATION_SHA, mode, startedAtUtc: new Date().toISOString(), checks: [] }
const save = () => writeFileSync(join(clientDir, mode + '.json'), JSON.stringify(report, null, 2) + '\n')
function makeSyntheticPdf(marker) {
  const stream = `BT /F1 18 Tf 72 720 Td (${marker}) Tj ET\n`
  const bodies = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}endstream`,
  ]
  let text = '%PDF-1.4\n'; const offsets = [0]
  for (let i=0;i<bodies.length;i++) { offsets.push(Buffer.byteLength(text)); text += `${i+1} 0 obj\n${bodies[i]}\nendobj\n` }
  const xref = Buffer.byteLength(text); text += `xref\n0 ${bodies.length+1}\n0000000000 65535 f \n`
  for (const offset of offsets.slice(1)) text += `${String(offset).padStart(10,'0')} 00000 n \n`
  text += `trailer\n<< /Size ${bodies.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  return Buffer.from(text)
}
function check(name, expected, actual, pass) {
  const row = { name, expected, actual, status: pass ? 'PASS' : 'FAIL' }
  report.checks.push(row); save()
  if (!pass) throw new Error('ASSERTION FAILED: ' + name)
}
const renderer = await connect(Number(process.env.QA_CDP_PORT), page => page.url.startsWith('http://localhost:' + process.env.PROFER_VITE_PORT) && !page.url.includes('window='))
const main = await connect(Number(process.env.QA_MAIN_PORT), () => true)
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
async function ready() {
  await renderer.poll('!!window.electronAPI?.getSettings && !!window.reviewAPI')
  await main.poll('!!globalThis.__p06Live?.p02Environment')
  if (!await renderer.evaluate('!!window.__p02Observer')) {
    await renderer.evaluate(`window.__p02Events=[];window.__p02Observer=window.electronAPI.onAgentStreamEvent(event=>window.__p02Events.push({at:new Date().toISOString(),sessionId:event.sessionId,payload:event.payload}))`)
  }
  report.main = await main.evaluate('__p06Live.p02Environment()')
  report.rendererUrl = await renderer.evaluate('location.href')
}
async function readFacts() { return JSON.parse(readFileSync(factsPath, 'utf8')) }
async function state(id) {
  return renderer.evaluate(`(async()=>{${storeAccess}
    const a=await import('/atoms/agent-atoms.ts'); const p=await import('/atoms/preview-atoms.ts');
    const x=await import('/lib/agent-tab-access.ts');
    const file=store.get(p.previewFileMapAtom).get(${q(id)});
    const cache=store.get(a.agentSDKMessagesCacheAtom).get(${q(id)})||[];
    return {sessionPresent:store.get(a.agentSessionsAtom).some(s=>s.id===${q(id)}),
      previewPresent:store.get(p.previewFileMapAtom).has(${q(id)}),preview:file||null,
      revoked:store.get(x.revokedAgentSessionIdsAtom).has(${q(id)}),sdkCacheCount:cache.length,
      sessionTitle:store.get(a.agentSessionsAtom).find(s=>s.id===${q(id)})?.title||null,
      tabTypes:(await import('/atoms/tab-atoms.ts')).tabsAtom ? store.get((await import('/atoms/tab-atoms.ts')).tabsAtom).map(t=>t.type) : []}
  })()`)
}
async function hydrateFromMainList(id) {
  const current = await state(id)
  if (current.sessionPresent) return { source: 'existing-real-projection', current }
  const list = await renderer.evaluate('window.electronAPI.listAgentSessions(true)')
  const includes = list.some(session => session.id === id)
  await renderer.evaluate(`(async()=>{${storeAccess}const a=await import('/atoms/agent-atoms.ts');const list=await window.electronAPI.listAgentSessions(true);store.set(a.agentSessionsAtom,list);return true})()`)
  return { source: 'real-listAgentSessions-ipc', includes, current: await state(id) }
}
async function makeOrdinary(title, workspaceId, slug = 'default') {
  const session = await renderer.evaluate(`window.electronAPI.createAgentSession(${q(title)},undefined,${workspaceId ? q(workspaceId) : 'undefined'})`)
  const workspace = join(profile, 'config/agent-workspaces', slug, session.id)
  mkdirSync(workspace, { recursive: true })
  const marker = 'P02_SYNTHETIC_' + mode + '_' + randomUUID()
  writeFileSync(join(workspace, 'safe.txt'), marker + '\n', { mode: 0o600 })
  await main.evaluate(`__p06Live.p02TrackSession(${q(session.id)});true`)
  const hydration = await hydrateFromMainList(session.id)
  const authoritative = await renderer.evaluate(`window.electronAPI.getAgentSessionMeta(${q(session.id)})`)
  const value = { id: session.id, title: session.title, workspaceId: session.workspaceId ?? null,
    workspace, safePath: join(workspace, 'safe.txt'), marker, meta: authoritative, hydration }
  report.createdSessions ??= []; report.createdSessions.push({ id: value.id, title: value.title, workspaceId: value.workspaceId })
  save()
  return value
}
async function activate(session) {
  return renderer.evaluate(`(async()=>{${storeAccess}
    const a=await import('/atoms/agent-atoms.ts'); const v=await import('/atoms/active-view.ts');
    const m=await import('/atoms/app-mode.ts'); const t=await import('/atoms/tab-atoms.ts');
    const listed=await window.electronAPI.listAgentSessions(true); store.set(a.agentSessionsAtom,listed);
    store.set(a.currentAgentSessionIdAtom,${q(session.id)}); store.set(m.appModeAtom,'agent');
    store.set(v.activeViewAtom,'conversations');
    store.set(t.tabsAtom,[{id:${q(session.id)},type:'agent',sessionId:${q(session.id)},title:${q(session.title)}}]);
    store.set(t.activeTabIdAtom,${q(session.id)});
    store.set(a.agentSessionPathMapAtom,new Map([[${q(session.id)},${q(session.workspace)}]]));
    return {hasMainMeta:listed.some(s=>s.id===${q(session.id)}),pid:window.process?.pid||null}
  })()`)
}
async function ordinaryPreview(session, explicitCount = false) {
  return renderer.evaluate(`(async()=>{${storeAccess}
    const p=await import('/components/diff/preview-opener.ts'); const a=await import('/atoms/preview-atoms.ts');
    const t=await import('/atoms/tab-atoms.ts'); const before=store.get(t.tabsAtom).map(x=>x.type);
    let calls=[]; const fetchMeta=async source=>async id=>{const start=performance.now();const value=await window.electronAPI.getAgentSessionMeta(id);calls.push({source,id,elapsedMs:performance.now()-start,found:!!value,revision:value?.revision??null});return value};
    const args=[store,${q(session.id)},{filePath:${q(session.safePath)},previewOnly:true,readOnly:false},{},()=>true];
    const result=${explicitCount
      ? 'await p.openFilePreviewTabAuthorized(...args,await fetchMeta("load"),await fetchMeta("confirm"))'
      : 'await p.openFilePreviewTabAuthorized(...args)'};
    return {result,calls,before,after:store.get(t.tabsAtom).map(x=>x.type),preview:store.get(a.previewFileMapAtom).get(${q(session.id)})||null}
  })()`)
}
async function removeFromOrdinaryAtom(id) {
  return renderer.evaluate(`(async()=>{${storeAccess}const a=await import('/atoms/agent-atoms.ts');const x=await import('/lib/agent-tab-access.ts');
    const wasRevoked=store.get(x.revokedAgentSessionIdsAtom).has(${q(id)});
    store.set(a.agentSessionsAtom,previous=>previous.filter(session=>session.id!==${q(id)}));
    return {revokedBefore:wasRevoked,sessionPresent:store.get(a.agentSessionsAtom).some(s=>s.id===${q(id)})}
  })()`)
}
async function beginHeldLookup(session) {
  await renderer.evaluate(`(async()=>{${storeAccess}
    const p=await import('/components/diff/preview-opener.ts');
    const gate=new Promise(resolve=>{window.__p02ReleaseLookup=resolve});
    window.__p02Held={issued:false,startedAt:performance.now(),meta:null,gate};window.__p02Late=undefined;window.__p02LateError=null;
    window.__p02Pending=p.openFilePreviewTabAuthorized(store,${q(session.id)},{filePath:${q(session.safePath)},previewOnly:true,readOnly:false},{},()=>true,
      async id=>{const start=performance.now();const meta=await window.electronAPI.getAgentSessionMeta(id);window.__p02Held.meta=meta;window.__p02Held.lookupElapsedMs=performance.now()-start;window.__p02Held.issued=true;await gate;return meta});
    window.__p02Pending.then(value=>window.__p02Late=value).catch(error=>window.__p02LateError=String(error));
    return true
  })()`)
  const held = await renderer.poll(`window.__p02Held?.issued===true && window.__p02Held.meta?.id===${q(session.id)}`)
  return held
}
async function waitDelete(id) {
  return renderer.poll(`window.__p02Events?.filter(e=>e.sessionId===${q(id)}&&e.payload?.kind==='session_projection'&&e.payload.operation==='delete').at(-1)`, 15000)
}
async function deleteSnapshot(id) {
  const observed = await waitDelete(id)
  const atoms = await state(id)
  const ipcMeta = await renderer.evaluate(`window.electronAPI.getAgentSessionMeta(${q(id)})`)
  const bus = await main.evaluate(`__p06Live.p02MainBusEvents.filter(e=>e.sessionId===${q(id)}&&e.payload?.kind==='session_projection'&&e.payload.operation==='delete').at(-1)||null`)
  return { observed, atoms, ipcMeta, bus }
}
async function releaseHeld() {
  await renderer.evaluate('window.__p02ReleaseLookup()')
  await renderer.poll('window.__p02Late !== undefined || window.__p02LateError !== null', 15000)
  return renderer.evaluate('({late:window.__p02Late,error:window.__p02LateError,held:window.__p02Held})')
}
async function runDeleteRace(label) {
  const session = await makeOrdinary('P02_' + label + '_迟到预览', undefined)
  await activate(session)
  const preview = await ordinaryPreview(session)
  check(label + ' 删除前普通只读侧栏预览真实可用', '只读=true 且产生正式预览槽', preview,
    !!preview.result && preview.preview?.readOnly === true && preview.preview?.filePath === session.safePath)
  const before = await removeFromOrdinaryAtom(session.id)
  check(label + ' 进入 Main lookup 前仅移除普通列表缓存', '没有预写 revoked tombstone', before, !before.revokedBefore && !before.sessionPresent)
  await beginHeldLookup(session)
  const held = await renderer.evaluate('window.__p02Held.meta')
  check(label + ' 被扣留的旧回执来自真实 Main getAgentSessionMeta IPC', 'id 与真实 Main meta 一致', held,
    held?.id === session.id && (held.revision ?? 0) >= 0)
  const pid = report.main.pid
  const deletionStart = new Date().toISOString()
  const deleteResult = await renderer.evaluate(`window.electronAPI.deleteAgentSession(${q(session.id)}).then(()=>({ok:true}),error=>({error:String(error)}))`)
  check(label + ' 真 deleteAgentSession IPC 成功', '持久删除完成且 IPC resolve', deleteResult, !!deleteResult.ok)
  const deleted = await deleteSnapshot(session.id)
  check(label + ' 删除后 Main meta 为 null', 'getAgentSessionMeta IPC 返回 null', deleted.ipcMeta, deleted.ipcMeta === null)
  check(label + ' Main 真实发布带递增 revision 的 delete projection', 'revision > 旧 Main meta revision', deleted.bus,
    deleted.bus?.payload?.revision > (held?.revision ?? 0))
  check(label + ' Renderer 收到 revoke 并清空列表/预览槽', 'revoked=true 且 session/preview 均无此 ID', deleted.atoms,
    deleted.atoms.revoked && !deleted.atoms.sessionPresent && !deleted.atoms.previewPresent)
  const afterEvent = await state(session.id)
  const deletionNotification = deleted.observed
  if (label === 'R02') {
    const retry = await renderer.evaluate(`(async()=>{${storeAccess}const p=await import('/components/diff/preview-opener.ts');return p.openFilePreviewTabAuthorized(store,${q(session.id)},{filePath:${q(session.safePath)},previewOnly:true})})()`)
    check('R02 删除后重进/切换预览被撤权 ID 拒绝', '返回空且无 Preview 槽', { retry, state: await state(session.id) }, retry === '' && !(await state(session.id)).previewPresent)
    const baseline = await state(session.id)
    await main.evaluate(`__p06Live.p02PublishOldProjection(${q(held)})`)
    await renderer.poll(`window.__p02Events?.some(e=>e.sessionId===${q(session.id)}&&e.payload?.kind==='session_projection'&&e.payload.operation==='upsert')`, 10000)
    const staleSdk = await main.evaluate(`__p06Live.p02EmitLateSdk(${q(session.id)})`)
    await renderer.poll(`window.__p02Events?.some(e=>e.sessionId===${q(session.id)}&&e.payload?.kind==='sdk_message'&&e.payload.message?.message?.content?.some(c=>c.text==='P02_R02_STALE_SYNTHETIC_SDK'))`, 10000)
    const staleEvents = await renderer.evaluate(`window.__p02Events.filter(e=>e.sessionId===${q(session.id)}&&(e.payload?.kind==='session_projection'&&e.payload.operation==='upsert'||e.payload?.kind==='sdk_message'))`)
    await sleep(150)
    const afterStale = await state(session.id)
    check('R02 真实旧 UI upsert 与迟到 SDK IPC 到达后不复活', '事件被观察但撤权 Jotai 列表/Preview/SDK cache 不变',
      { baseline, afterStale, staleEvents }, !afterStale.sessionPresent && !afterStale.previewPresent && afterStale.revoked && afterStale.sdkCacheCount === baseline.sdkCacheCount)
    report.r02StaleSdkDispatch = staleSdk
    report.r02StaleEvents = staleEvents
  }
  const released = await releaseHeld()
  const afterRelease = await state(session.id)
  check(label + ' 释放旧 Main lookup 不复活 session/preview', 'late 为空、无 session、无 Preview',
    { released, afterRelease }, released.late === '' && !released.error && !afterRelease.sessionPresent && !afterRelease.previewPresent && afterRelease.revoked)
  const mainAfter = await renderer.evaluate(`window.electronAPI.getAgentSessionMeta(${q(session.id)})`)
  check(label + ' 最终 Main 权威索引仍无删除 session', 'null', mainAfter, mainAfter === null)
  const data = { label, sessionId: session.id, deletionStart, oldMainMeta: held, oldLookupElapsedMs: await renderer.evaluate('window.__p02Held.lookupElapsedMs'),
    deleteResult, deletionNotification, mainBusDelete: deleted.bus, mainMetaAfter: deleted.ipcMeta,
    stateAfterProjection: afterEvent, released, stateAfterRelease: afterRelease, mainPid: pid, ordinaryPreviewBeforeDelete: preview }
  report.race = data; save()
  await renderer.screenshot(clientDir, label.toLowerCase() + '-after-delete')
  return data
}

try {
  await ready()
  if (mode === 'setup') {
    const settings = await renderer.evaluate(`window.electronAPI.updateSettings({onboardingCompleted:true,tutorialBannerDismissed:true})`)
    await renderer.call('Page.reload')
    await renderer.poll('!!window.electronAPI?.getSettings && !!window.reviewAPI && document.body.innerText.trim().length>10')
    const reviewCase = await renderer.evaluate(`window.reviewAPI.createCase({title:'P02 R02 本轮独立合成隔离案卷',type:'自定义审核',applicant:'SYNTHETIC_ONLY',academicYear:'2026'})`)
    const owner = await main.evaluate(`__p06Live.sessions.createReviewOwnedAgentSession({caseId:${q(reviewCase.id)},title:'P02-R05 隐藏审核 owner',channelId:'synthetic-channel-unused'})`)
    const ownerWorkspace = join(profile, 'config/agent-workspaces/default', owner.id)
    mkdirSync(ownerWorkspace, { recursive: true })
    writeFileSync(join(ownerWorkspace, 'internal.txt'), 'P02_R05_INTERNAL_SYNTHETIC_ONLY\n', { mode: 0o600 })
    writeFileSync(join(ownerWorkspace, 'private-scan.pdf'), makeSyntheticPdf('P02_R05_PRIVATE_PDF_SYNTHETIC'), { mode: 0o600 })
    const facts = { caseId: reviewCase.id, ownerId: owner.id, ownerWorkspace, profile, createdAtUtc: new Date().toISOString() }
    writeFileSync(factsPath, JSON.stringify(facts, null, 2) + '\n', { mode: 0o600 })
    await main.evaluate(`__p06Live.p02TrackSession(${q(owner.id)});true`)
    report.setup = { caseId: reviewCase.id, ownerId: owner.id, ownerMetaInternal: await main.evaluate(`__p06Live.sessions.getAgentSessionMeta(${q(owner.id)})`), settingsUpdated: true }
    check('隔离 profile 启动真 Main/Renderer 且无登录/provider', 'Electron/Main/IPC 可用，合成案卷与隐藏 owner 已建立', report.setup,
      !!reviewCase.id && !!owner.id && report.main.config === join(profile, 'config') && report.main.userData === join(profile, 'user-data'))
  } else {
    const facts = await readFacts()
    if (mode === 'r01' || mode === 'r03') {
      if (mode === 'r03') {
        const prior = JSON.parse(readFileSync(join(clientDir, 'r01.json'), 'utf8'))
        check('R03 使用真实不同 Electron/Main PID 重启', 'new Main PID differs from R01', { oldPid: prior.main.pid, newPid: report.main.pid }, prior.main.pid !== report.main.pid)
      }
      await runDeleteRace(mode.toUpperCase())
    } else if (mode === 'r02') {
      await runDeleteRace('R02')
    } else if (mode === 'r04') {
      const session = await makeOrdinary('P02_R04 普通早期 Preview 正例', undefined)
      await activate(session)
      const removed = await removeFromOrdinaryAtom(session.id)
      const preview = await ordinaryPreview(session, true)
      const after = await state(session.id)
      check('R04 首次 early-preview lookup 对普通 session 仍允许 Main 双重确认', '两次真实 IPC 查询 id/revision 正确',
        { hydration: session.hydration, atomBefore: removed, preview }, preview.calls.length === 2 && preview.calls.every(c => c.id === session.id && c.found) && !!preview.result)
      check('R04 正常 Preview 仍只读、不创建普通 Tab 且 Main 性能可观测', 'readOnly=true、Tab 数不变、查询耗时有记录',
        { preview, state: after }, preview.preview?.readOnly === true && JSON.stringify(preview.before) === JSON.stringify(preview.after) && preview.calls.every(c => c.elapsedMs >= 0))
      await renderer.poll(`[...document.querySelectorAll('diffs-container')].some(e=>e.shadowRoot?.textContent.includes(${q(session.marker)}))`, 20000)
      await renderer.screenshot(clientDir, 'r04-ordinary-readonly-preview')
      const sdkUser = { type: 'user', uuid: randomUUID(), message: { role: 'user', content: [{ type: 'text', text: 'P02_R04_SEARCH_ORDINARY_ONLY' }] } }
      const sdkOwner = { type: 'user', uuid: randomUUID(), message: { role: 'user', content: [{ type: 'text', text: 'P02_R05_SEARCH_PRIVATE_OWNER' }] } }
      await main.evaluate(`__p06Live.sessions.appendSDKMessages(${q(session.id)},[${q(sdkUser)}]);__p06Live.sessions.appendSDKMessages(${q(facts.ownerId)},[${q(sdkOwner)}]);true`)
      const archived = await renderer.evaluate(`window.electronAPI.toggleArchiveAgentSession(${q(session.id)})`)
      const activeAfterArchive = await renderer.evaluate(`window.electronAPI.listAgentSessions()`)
      const archivedList = await renderer.evaluate(`window.electronAPI.listAgentSessions(true)`)
      check('R04 普通归档与归档列表保持 Main IPC 正常', '归档态进入 archived list 且退出 active list',
        { archived, active: activeAfterArchive.some(s=>s.id===session.id), archivedVisible: archivedList.some(s=>s.id===session.id) }, archived?.archived === true && !activeAfterArchive.some(s=>s.id===session.id) && archivedList.some(s=>s.id===session.id))
      const unarchived = await renderer.evaluate(`window.electronAPI.toggleArchiveAgentSession(${q(session.id)})`)
      const activeAfterUnarchive = await renderer.evaluate(`window.electronAPI.listAgentSessions()`)
      check('R04 普通取消归档保持 Main IPC 正常', '会话回到 active list', { unarchived, active: activeAfterUnarchive.some(s=>s.id===session.id) }, unarchived?.archived === false && activeAfterUnarchive.some(s=>s.id===session.id))
      const search = await renderer.evaluate(`window.electronAPI.searchAgentSessionMessages('P02_R04_SEARCH_ORDINARY_ONLY')`)
      check('R04 普通会话搜索可用且不泄露内部审核 owner', '普通结果可见，owner ID 与 owner marker 均不可见',
        search, search.some(item=>item.sessionId===session.id) && !JSON.stringify(search).includes(facts.ownerId) && !JSON.stringify(search).includes('P02_R05_SEARCH_PRIVATE_OWNER'))
      report.r04SessionId = session.id
      report.r04MainQueryCount = preview.calls.length
      report.r04MainQueryElapsedMs = preview.calls.map(c=>c.elapsedMs)
      writeFileSync(factsPath, JSON.stringify({ ...facts, r04Session: session }, null, 2) + '\n', { mode: 0o600 })
    } else if (mode === 'r05') {
      const session = JSON.parse(readFileSync(factsPath, 'utf8')).r04Session
      const ownerMeta = await renderer.evaluate(`window.electronAPI.getAgentSessionMeta(${q(facts.ownerId)})`)
      const listed = await renderer.evaluate('window.electronAPI.listAgentSessions(true)')
      const ownerMessages = await renderer.evaluate(`window.electronAPI.getAgentSessionSDKMessages(${q(facts.ownerId)}).then(value=>({value}),error=>({error:String(error)}))`)
      const forbiddenPreview = await renderer.evaluate(`(async()=>{${storeAccess}const p=await import('/components/diff/preview-opener.ts');return p.openFilePreviewTabAuthorized(store,${q(facts.ownerId)},{filePath:${q(join(facts.ownerWorkspace, 'internal.txt'))},previewOnly:true})})()`)
      check('R05 review owner 不进入普通 Main meta/list/SDK/sidepanel', 'meta=null、list 无 owner、SDK 拒绝、Preview 返回空',
        { ownerMeta, listedOwner: listed.some(s=>s.id===facts.ownerId), ownerMessages, forbiddenPreview },
        ownerMeta === null && !listed.some(s=>s.id===facts.ownerId) && !!ownerMessages.error && forbiddenPreview === '')
      const ordinaryDirLink = join(session.workspace, 'outside-review-owner')
      symlinkSync(facts.ownerWorkspace, ordinaryDirLink, 'dir')
      const direct = await renderer.evaluate(`window.electronAPI.resolveAndReadFile(${q(join(facts.ownerWorkspace,'internal.txt'))},{sessionId:${q(session.id)}})`)
      const symlink = await renderer.evaluate(`window.electronAPI.resolveAndReadFile(${q(join(ordinaryDirLink,'internal.txt'))},{sessionId:${q(session.id)}})`)
      const parent = await renderer.evaluate(`window.electronAPI.resolveAndReadFile(${q(join(session.workspace,'..',facts.ownerId,'internal.txt'))},{sessionId:${q(session.id)}})`)
      const previewForgery = await renderer.evaluate(`window.electronAPI.preparePdfPreview(${q(join(facts.ownerWorkspace,'private-scan.pdf'))},{sessionId:${q(session.id)}}).then(value=>({value}),error=>({error:String(error)}))`)
      check('R05 私有原件直达、symlink、parent 与伪造 PDF Preview 均由 Main 拒绝', '四个真实 IPC 均拒绝',
        { direct, symlink, parent, previewForgery }, direct === null && symlink === null && parent === null && (!!previewForgery.error || !previewForgery.value?.tmpHtmlUrl) && (!previewForgery.error || /拒绝|不可|权限|审核|授权|内部/.test(previewForgery.error)))
      const tombstone = JSON.parse(readFileSync(join(clientDir, 'r01.json'), 'utf8')).race.sessionId
      const tombstoneMeta = await renderer.evaluate(`window.electronAPI.getAgentSessionMeta(${q(tombstone)})`)
      const tombstonePreview = await renderer.evaluate(`(async()=>{${storeAccess}const p=await import('/components/diff/preview-opener.ts');return p.openFilePreviewTabAuthorized(store,${q(tombstone)},{filePath:${q(session.safePath)},previewOnly:true})})()`)
      const crossId = 'p02-cross-id-' + randomUUID()
      const crossPreview = await renderer.evaluate(`(async()=>{${storeAccess}const p=await import('/components/diff/preview-opener.ts');return p.openFilePreviewTabAuthorized(store,${q(crossId)},{filePath:${q(session.safePath)},previewOnly:true},{},()=>true,async()=>window.electronAPI.getAgentSessionMeta(${q(session.id)}))})()`)
      check('R05 删除 tombstone 与跨 ID metadata 均不得授权 Preview', 'Main tombstone=null；预览均返回空',
        { tombstoneMeta, tombstonePreview, crossPreview }, tombstoneMeta === null && tombstonePreview === '' && crossPreview === '')
      report.r05 = { ownerMeta, ownerMessages, direct, symlink, parent, previewForgery, tombstoneMeta, tombstonePreview, crossPreview }
    } else if (mode === 'r06') {
      const session = await makeOrdinary('P02_R06 持久化失败保留会话', undefined)
      await activate(session)
      const preview = await ordinaryPreview(session)
      const beforeIndex = await main.evaluate('__p06Live.p02IndexSnapshot()')
      const priorEvents = await renderer.evaluate(`window.__p02Events.filter(e=>e.sessionId===${q(session.id)}&&e.payload?.kind==='session_projection'&&e.payload.operation==='delete').length`)
      const lock = await main.evaluate('__p06Live.p02LockIndexDirectory()')
      let deletion
      try {
        deletion = await renderer.evaluate(`window.electronAPI.deleteAgentSession(${q(session.id)}).then(()=>({ok:true}),error=>({error:String(error)}))`)
      } finally {
        report.r06Unlock = await main.evaluate('__p06Live.p02UnlockIndexDirectory()')
      }
      const afterIndex = await main.evaluate('__p06Live.p02IndexSnapshot()')
      const meta = await renderer.evaluate(`window.electronAPI.getAgentSessionMeta(${q(session.id)})`)
      const list = await renderer.evaluate(`window.electronAPI.listAgentSessions(true)`)
      const postState = await state(session.id)
      const read = await renderer.evaluate(`window.electronAPI.resolveAndReadFile(${q(session.safePath)},{sessionId:${q(session.id)}})`)
      const afterEvents = await renderer.evaluate(`window.__p02Events.filter(e=>e.sessionId===${q(session.id)}&&e.payload?.kind==='session_projection'&&e.payload.operation==='delete').length`)
      check('R06 实际隔离文件系统拒绝 index 原子写', 'Main 持久化失败令真实 DELETE_SESSION IPC reject', { lock, deletion }, !!lock && !!deletion.error && !deletion.ok)
      check('R06 失败不假发布 delete，索引与 session meta 保留', 'index SHA 不变、meta/list 存在、无 delete event',
        { beforeIndex, afterIndex, meta, inList: list.some(s=>s.id===session.id), priorEvents, afterEvents },
        beforeIndex.sha256===afterIndex.sha256 && meta?.id===session.id && list.some(s=>s.id===session.id) && afterEvents===priorEvents)
      check('R06 恢复权限后普通旧 session 仍可读且 Preview 未撤权', 'Main read 成功、未 revoked、preview 槽仍合法',
        { read, postState, preview }, !!JSON.stringify(read).includes(session.marker) && !postState.revoked && postState.previewPresent && preview.preview?.readOnly===true)
      report.r06 = { sessionId: session.id, lock, deletion, beforeIndex, afterIndex, meta, postState, read, preview, unlock: report.r06Unlock }
    } else if (mode === 'r07') {
      const target = await renderer.evaluate(`window.electronAPI.createAgentWorkspace('P02_R07_CASCADE_'+${q(randomUUID())})`)
      const keep = await renderer.evaluate(`window.electronAPI.createAgentWorkspace('P02_R07_KEEP_'+${q(randomUUID())})`)
      const a = await makeOrdinary('P02_R07 cascade pending lookup', target.id, target.slug)
      const b = await makeOrdinary('P02_R07 cascade sibling', target.id, target.slug)
      const keeper = await makeOrdinary('P02_R07 unrelated workspace positive', keep.id, keep.slug)
      const control = await makeOrdinary('P02_R07 default workspace positive', undefined)
      await activate(a)
      await ordinaryPreview(a)
      await removeFromOrdinaryAtom(a.id)
      await beginHeldLookup(a)
      const held = await renderer.evaluate('window.__p02Held.meta')
      const beforeDelete = await renderer.evaluate(`window.__p02Events.length`)
      const deleteWorkspaceResult = await renderer.evaluate(`window.electronAPI.deleteAgentWorkspace(${q(target.id)}).then(()=>({ok:true}),error=>({error:String(error)}))`)
      check('R07 真 workspace IPC 成功级联删除', 'workspace 和两条 session 均成功删除', deleteWorkspaceResult, !!deleteWorkspaceResult.ok)
      const aSnapshot = await deleteSnapshot(a.id)
      const bSnapshot = await deleteSnapshot(b.id)
      const metas = { a: aSnapshot.ipcMeta, b: bSnapshot.ipcMeta }
      check('R07 每个级联删除的普通 session 各有 delete projection', 'A/B 各有 revision > 对应旧 Main meta',
        { heldA: held, b: b.meta, a: aSnapshot.bus, b: bSnapshot.bus },
        aSnapshot.bus?.payload?.revision>(held?.revision??0) && bSnapshot.bus?.payload?.operation==='delete' && bSnapshot.bus?.payload?.revision>(b.meta?.revision??0))
      const released = await releaseHeld()
      const aState = await state(a.id), bState = await state(b.id)
      check('R07 workspace 删除后 Main IPC 元数据全空', 'A/B getAgentSessionMeta IPC 均为 null', metas, metas.a===null && metas.b===null)
      check('R07 A 迟到响应与 B 列表/Preview 均被撤销', 'late empty and no resurrected IDs',
        { released, aState, bState }, released.late==='' && !released.error && !aState.sessionPresent && !aState.previewPresent && aState.revoked && !bState.sessionPresent && !bState.previewPresent && bState.revoked)
      const workspacesAfterTarget = await renderer.evaluate('window.electronAPI.listAgentWorkspaces()')
      const listAfterTarget = await renderer.evaluate('window.electronAPI.listAgentSessions(true)')
      const keeperMeta = await renderer.evaluate(`window.electronAPI.getAgentSessionMeta(${q(keeper.id)})`)
      const controlMeta = await renderer.evaluate(`window.electronAPI.getAgentSessionMeta(${q(control.id)})`)
      check('R07 目标外 workspace/session 正例不受级联影响', 'keeper workspace/session 与 default session 均仍存在',
        { workspaces: workspacesAfterTarget.map(w=>w.id), keeperMeta, controlMeta, keeperListed:listAfterTarget.some(s=>s.id===keeper.id), controlListed:listAfterTarget.some(s=>s.id===control.id) },
        workspacesAfterTarget.some(w=>w.id===keep.id) && keeperMeta?.id===keeper.id && controlMeta?.id===control.id && listAfterTarget.some(s=>s.id===keeper.id) && listAfterTarget.some(s=>s.id===control.id))
      // 删除本轮创建的 keeper workspace/session，确保再对“唯一剩余的默认 workspace”执行拒绝例。
      const cleanupKeep = await renderer.evaluate(`window.electronAPI.deleteAgentWorkspace(${q(keep.id)}).then(()=>({ok:true}),error=>({error:String(error)}))`)
      const beforeDefaultEvents = await renderer.evaluate(`window.__p02Events.filter(e=>e.sessionId===${q(control.id)}&&e.payload?.kind==='session_projection'&&e.payload.operation==='delete').length`)
      const defaultWorkspace = workspacesAfterTarget.find(w=>w.slug==='default')
      const onlyDefault = await renderer.evaluate('window.electronAPI.listAgentWorkspaces()')
      const defaultDelete = await renderer.evaluate(`window.electronAPI.deleteAgentWorkspace(${q(defaultWorkspace.id)}).then(()=>({ok:true}),error=>({error:String(error)}))`)
      const afterDefaultEvents = await renderer.evaluate(`window.__p02Events.filter(e=>e.sessionId===${q(control.id)}&&e.payload?.kind==='session_projection'&&e.payload.operation==='delete').length`)
      const controlAfter = await renderer.evaluate(`window.electronAPI.getAgentSessionMeta(${q(control.id)})`)
      const workspaceAfterDefault = await renderer.evaluate(`window.electronAPI.listAgentWorkspaces()`)
      check('R07 最后/默认 workspace 删除被拒绝且不发假 delete', '只剩 default，IPC reject，workspace/session 保留，无 delete event',
        { cleanupKeep, onlyDefault:onlyDefault.map(w=>w.slug), defaultDelete, afterDefaultEvents, beforeDefaultEvents, controlAfter, workspaceAfterDefault:workspaceAfterDefault.map(w=>w.slug) },
        !!cleanupKeep.ok && onlyDefault.length===1 && defaultWorkspace?.slug==='default' && !!defaultDelete.error && afterDefaultEvents===beforeDefaultEvents && controlAfter?.id===control.id && workspaceAfterDefault.length===1 && workspaceAfterDefault[0]?.slug==='default')
      report.r07 = { targetWorkspace:target, keepWorkspace:keep, cascadeIds:[a.id,b.id], keeperId:keeper.id, controlId:control.id,
        beforeDeleteEventCount:beforeDelete, aSnapshot,bSnapshot, deleteWorkspaceResult, cleanupKeep, defaultDelete }
    } else throw new Error('unknown test mode: ' + mode)
  }
  report.status = 'PASS'
} catch (error) {
  report.status = 'FAIL'
  report.error = String(error)
  report.stack = error?.stack
  process.exitCode = 1
} finally {
  report.finishedAtUtc = new Date().toISOString()
  save()
  renderer.close(); main.close()
  console.log(JSON.stringify({ mode, status: report.status, checks: report.checks.length, error: report.error ?? null, mainPid: report.main?.pid }))
}

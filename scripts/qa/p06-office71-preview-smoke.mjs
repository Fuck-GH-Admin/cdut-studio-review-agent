// 只读 Office/PDF 预览兼容冒烟，不运行整轮 U1。
import assert from 'node:assert/strict'
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { connect, storeAccess } from './review-live-cdp.mjs'

const raw = resolve(process.env.P06_OFFICE71_RAW_ROOT ?? '')
const materials = resolve(process.env.P06_OFFICE71_MATERIAL_ROOT ?? '')
if (!raw.split(/[\\/]/).at(-1)?.startsWith('p06-office71-local-r02-') || materials !== join(raw, 'materials')) {
  throw new Error('Preview 冒烟只允许在 Office71 R02 隔离 profile 执行')
}
const outDir = join(raw, 'office71')
const profile = join(raw, 'profile')
const reportName = `preview-smoke-${process.argv[2] ?? 'retry'}.json`
const q = JSON.stringify
const renderer = await connect(Number(process.env.QA_CDP_PORT), page =>
  page.url.startsWith(`http://localhost:${process.env.PROFER_VITE_PORT}`) && !page.url.includes('window='))
const main = await connect(Number(process.env.QA_MAIN_PORT), () => true)
const report = { sourceSha: process.env.QA_APPLICATION_SHA, startedAt: new Date().toISOString(), rows: [] }
const save = () => writeFileSync(join(outDir, reportName), JSON.stringify(report, null, 2) + '\n')
const check = (id, expected, actual, pass) => {
  report.rows.push({ id, expected, actual, status: pass ? 'PASS' : 'FAIL' })
  save()
  console.log(JSON.stringify({ id, status: pass ? 'PASS' : 'FAIL' }))
  assert.ok(pass, id)
}
try {
  await renderer.poll('!!window.electronAPI?.getSettings && !!window.reviewAPI')
  await main.poll('!!globalThis.__p06Office71?.environment')
  report.main = await main.evaluate('__p06Office71.environment')
  assert.equal(report.main.config, join(profile, 'config'))
  assert.equal(report.main.userData, join(profile, 'user-data'))
  await renderer.evaluate(`window.electronAPI.updateSettings({onboardingCompleted:true,tutorialBannerDismissed:true})`)
  await renderer.call('Page.reload')
  await renderer.poll('!!window.electronAPI?.getSettings && !!window.reviewAPI && document.body.innerText.length>10')
  const sessionTitle = `P06 Office71 Preview ${Date.now()}`
  const session = await renderer.evaluate(`window.electronAPI.createAgentSession(${q(sessionTitle)})`)
  report.sessionId = session.id
  report.sessionTitle = sessionTitle
  save()
  await renderer.poll(`document.body.innerText.includes(${q(sessionTitle)})`)
  await renderer.click(sessionTitle)
  const workspace = join(profile, 'config', 'agent-workspaces', 'default', session.id)
  mkdirSync(workspace, { recursive: true })
  const files = [
    ['docx', ['P06_U1_SYNTHETIC_A', 'P06_U1_SYNTHETIC_B']],
    ['xlsx', ['P06_U1_SYNTHETIC_A', 'P06_U1_SYNTHETIC_B']],
    ['pptx', ['P06_U1_SYNTHETIC_A', 'P06_U1_SYNTHETIC_B']],
  ]
  for (const [ext] of files) for (const label of ['A', 'B']) {
    const folder = join(workspace, label); mkdirSync(folder, { recursive: true })
    copyFileSync(join(materials, label, `proof.${ext}`), join(folder, `proof.${ext}`))
  }
  copyFileSync(join(materials, 'readable.pdf'), join(workspace, 'readable.pdf'))
  writeFileSync(join(workspace, 'safe.txt'), 'P06_OFFICE71_ORDINARY_SESSION\n')
  await renderer.evaluate(`(async()=>{${storeAccess}
    const a=await import('/atoms/agent-atoms.ts');const v=await import('/atoms/active-view.ts');
    const m=await import('/atoms/app-mode.ts');const t=await import('/atoms/tab-atoms.ts');
    const listed=await window.electronAPI.listAgentSessions(true);store.set(a.agentSessionsAtom,listed);
    store.set(a.currentAgentSessionIdAtom,${q(session.id)});store.set(m.appModeAtom,'agent');
    store.set(v.activeViewAtom,'conversations');store.set(t.tabsAtom,[{id:${q(session.id)},type:'agent',sessionId:${q(session.id)},title:${q(sessionTitle)}}]);
    store.set(t.activeTabIdAtom,${q(session.id)});store.set(a.agentSessionPathMapAtom,new Map([[${q(session.id)},${q(workspace)}]]));return true})()`)
  const rows = []
  const renderedCanvasBySource = new Map()
  const previewCases = files.flatMap(([ext, markers]) => ['A', 'B'].map(label =>
    ({ ext, label, marker: markers[label === 'A' ? 0 : 1], filePath: join(workspace, label, `proof.${ext}`) })))
  previewCases.push({ ext: 'pdf', label: 'PDF', marker: 'P06_U1_READABLE_PDF', filePath: join(workspace, 'readable.pdf') })
  for (const { ext, label, marker, filePath } of previewCases) {
    const observation = await renderer.evaluate(`(async()=>{${storeAccess}
      const opener=await import('/components/diff/preview-opener.ts');const preview=await import('/atoms/preview-atoms.ts');const tabs=await import('/atoms/tab-atoms.ts');
      const before=store.get(tabs.tabsAtom).map(t=>t.type);
      const result=await opener.openFilePreviewTabAuthorized(store,${q(session.id)},{filePath:${q(filePath)},previewOnly:true,readOnly:false});
      const item=store.get(preview.previewFileMapAtom).get(${q(session.id)});const a=await import('/atoms/agent-atoms.ts');
      return {result,before,after:store.get(tabs.tabsAtom).map(t=>t.type),item,activeRightPanel:store.get(a.agentDiffPanelTabAtom).get(${q(session.id)}),currentSessionId:store.get(a.currentAgentSessionIdAtom)}})()`)
    assert.ok(observation.result)
    assert.equal(observation.item?.readOnly, true)
    assert.deepEqual(observation.after, observation.before)
    assert.equal(observation.activeRightPanel, 'preview')
    assert.equal(observation.currentSessionId, session.id)
    let surface
    const deadline = Date.now() + 25000
    while (Date.now() < deadline) {
      surface = await renderer.evaluate(`(async()=>{${storeAccess}
      const p=await import('/atoms/preview-atoms.ts');const canvases=[...document.querySelectorAll('canvas')].map(c=>{const r=c.getBoundingClientRect();return {node:c,width:c.width,height:c.height,visible:r.width>0&&r.height>0,area:r.width*r.height}}).filter(c=>c.visible).sort((a,b)=>b.area-a.area);
        let canvasSha256=null;if(canvases[0])try{const data=canvases[0].node.toDataURL('image/png');const bytes=await(await fetch(data)).arrayBuffer();const digest=await crypto.subtle.digest('SHA-256',bytes);canvasSha256=[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('')}catch{}
      return {text:document.body.innerText.slice(-15000),
        canvases:canvases.map(c=>({width:c.width,height:c.height})),canvasSha256,
        frames:[...document.querySelectorAll('iframe')].map(x=>{const r=x.getBoundingClientRect();return {title:x.title,src:x.src,width:r.width,height:r.height}}),
        previewReadOnly:store.get(p.previewFileMapAtom).get(${q(session.id)})?.readOnly}})()`)
      const ready = ext === 'pdf'
        ? surface.frames.some(frame => frame.title === 'readable.pdf' && frame.src && frame.width > 0 && frame.height > 0)
        : surface.text.includes(marker) || surface.canvases.some(canvas => canvas.width > 0 && canvas.height > 0 && surface.canvasSha256)
      if (ready) break
      await new Promise(resolve => setTimeout(resolve, 250))
    }
    const visible = ext === 'pdf'
      ? surface.frames.some(frame => frame.title === 'readable.pdf' && frame.src && frame.width > 0 && frame.height > 0)
      : surface.text.includes(marker) || surface.canvases.some(canvas => canvas.width > 0 && canvas.height > 0 && surface.canvasSha256)
    const otherMarker = label === 'A' ? 'P06_U1_SYNTHETIC_B' : label === 'B' ? 'P06_U1_SYNTHETIC_A' : ''
    const cacheKey = `${ext}:${label}`
    if (ext !== 'pdf' && surface.canvasSha256) renderedCanvasBySource.set(cacheKey, surface.canvasSha256)
    const canvasHashPair = ext !== 'pdf' ? [renderedCanvasBySource.get(`${ext}:A`), renderedCanvasBySource.get(`${ext}:B`)] : []
    const canvasHashesDistinct = canvasHashPair.length !== 2 || !canvasHashPair[0] || !canvasHashPair[1] || canvasHashPair[0] !== canvasHashPair[1]
    const isolatedContent = (!otherMarker || !surface.text.includes(otherMarker)) && canvasHashesDistinct
    const status = observation.item?.readOnly === true && observation.activeRightPanel === 'preview'
      && observation.currentSessionId === session.id
      && JSON.stringify(observation.after) === JSON.stringify(observation.before) && visible && isolatedContent
      ? 'PASS' : 'FAIL'
    const row = { id: `O71-08-preview-${ext}-${label}`, status, expected: '真实 Renderer 主窗口只读预览可用、同 basename A/B 内容隔离且不新增顶栏 Tab',
      actual: { readOnly: observation.item?.readOnly, tabsUnchanged: JSON.stringify(observation.after) === JSON.stringify(observation.before),
        activeRightPanel: observation.activeRightPanel, currentSessionMatches: observation.currentSessionId === session.id,
        visibleMarker: surface.text.includes(marker), canvasSha256: surface.canvasSha256,
        canvasHashesDistinct, unexpectedOtherSourceMarker: otherMarker ? surface.text.includes(otherMarker) : false,
        pdfFrame: ext === 'pdf' ? surface.frames.filter(frame => frame.title === 'readable.pdf') : [],
        canvas: surface.canvases.filter(c=>c.width>0&&c.height>0), frames: surface.frames,
        targetUrls: (await (await fetch(`http://127.0.0.1:${process.env.QA_CDP_PORT}/json/list`)).json()).map(p=>p.url).filter(Boolean) } }
    rows.push(row);report.rows.push(row);save();console.log(JSON.stringify({id:row.id,status}))
    if(status!=='PASS') throw new Error(row.id+' 预览见证不满足预期')
    await renderer.screenshot(outDir, `preview-${ext}-${label}`)
  }
  const ordinaryMeta = await renderer.evaluate(`window.electronAPI.getAgentSessionMeta(${q(session.id)})`)
  check('O71-08-ordinary-positive', '普通会话 IPC metadata 仍可读且合法预览保持只读', { sessionId: session.id, metaId: ordinaryMeta?.id }, ordinaryMeta?.id === session.id)
  report.status = 'PASS'
} catch (error) {
  report.status = 'FAIL'; report.error = String(error); report.stack = error?.stack; process.exitCode = 1
} finally {
  report.finishedAt = new Date().toISOString();save();renderer.close();main.close()
  console.log(JSON.stringify({status:report.status,rows:report.rows.length,pid:report.main?.pid,error:report.error??null}))
}

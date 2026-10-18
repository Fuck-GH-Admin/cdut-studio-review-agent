#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises'
import { setTimeout as sleep } from 'node:timers/promises'

const port = Number(process.env.D4_CDP_PORT ?? 9241)
const [command, ...args] = process.argv.slice(2)
const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
const target = pages.find((page) => page.type === 'page' && page.url.startsWith('http://localhost') && page.webSocketDebuggerUrl) ?? pages.find((page) => page.type === 'page' && page.webSocketDebuggerUrl)
if (!target) throw new Error(`No Electron page target at CDP port ${port}`)
const ws = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((resolve, reject) => {
  ws.addEventListener('open', resolve, { once: true })
  ws.addEventListener('error', reject, { once: true })
})
let nextId = 1
const pending = new Map()
ws.addEventListener('message', ({ data }) => {
  const message = JSON.parse(data)
  if (!message.id) return
  const p = pending.get(message.id)
  if (!p) return
  pending.delete(message.id)
  if (message.error) p.reject(new Error(JSON.stringify(message.error)))
  else p.resolve(message.result)
})
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = nextId++
  pending.set(id, { resolve, reject })
  ws.send(JSON.stringify({ id, method, params }))
})
await send('Page.enable')
await send('Runtime.enable')
const evaluate = async (expression) => {
  const response = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true, userGesture: true })
  if (response.exceptionDetails) throw new Error(JSON.stringify(response.exceptionDetails))
  return response.result?.value
}
const mouseClick = async (selector) => {
  const lookup = selector.startsWith('text:')
    ? `Array.from(document.querySelectorAll('button,[role=button]')).find(e=>(e.innerText||e.textContent||'').trim().includes(${JSON.stringify(selector.slice(5))}))`
    : `document.querySelector(${JSON.stringify(selector)})`
  const rect = await evaluate(`(() => {
    const e = ${lookup};
    if (!e) throw new Error('selector not found: ' + ${JSON.stringify(selector)});
    e.scrollIntoView({block:'center', inline:'center'});
    const r=e.getBoundingClientRect();
    return {x:r.left+r.width/2,y:r.top+r.height/2,width:r.width,height:r.height,tag:e.tagName,text:e.innerText||e.getAttribute('aria-label')||e.value||''};
  })()`)
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: rect.x, y: rect.y })
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: rect.x, y: rect.y, button: 'left', clickCount: 1 })
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: rect.x, y: rect.y, button: 'left', clickCount: 1 })
  await sleep(300)
  console.log(JSON.stringify(rect))
}
const mouseDoubleClick = async (selector) => {
  const lookup = selector.startsWith('text:')
    ? `Array.from(document.querySelectorAll('button,[role=button]')).find(e=>(e.innerText||e.textContent||'').trim().includes(${JSON.stringify(selector.slice(5))}))`
    : `document.querySelector(${JSON.stringify(selector)})`
  const rect = await evaluate(`(() => {
    const e = ${lookup};
    if (!e) throw new Error('selector not found: ' + ${JSON.stringify(selector)});
    e.scrollIntoView({block:'center', inline:'center'});
    const r=e.getBoundingClientRect();
    return {x:r.left+r.width/2,y:r.top+r.height/2,width:r.width,height:r.height,tag:e.tagName,text:e.innerText||e.getAttribute('aria-label')||e.value||''};
  })()`)
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: rect.x, y: rect.y })
  for (let i = 0; i < 2; i++) {
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: rect.x, y: rect.y, button: 'left', clickCount: i + 1 })
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: rect.x, y: rect.y, button: 'left', clickCount: i + 1 })
    if (i === 0) await sleep(40)
  }
  await sleep(400)
  console.log(JSON.stringify({ ...rect, clickCount: 2 }))
}
const press = async (key) => {
  const parts = key.toLowerCase().split('+')
  const name = parts.pop()
  const modifiers = (parts.includes('alt') ? 1 : 0) | (parts.includes('ctrl') ? 2 : 0) | (parts.includes('meta') ? 4 : 0) | (parts.includes('shift') ? 8 : 0)
  const names = { enter: ['Enter', 'Enter', 13], tab: ['Tab', 'Tab', 9], escape: ['Escape', 'Escape', 27],
    home: ['Home', 'Home', 36], end: ['End', 'End', 35], arrowdown: ['ArrowDown', 'ArrowDown', 40],
    arrowup: ['ArrowUp', 'ArrowUp', 38], backspace: ['Backspace', 'Backspace', 8], r: ['r', 'KeyR', 82] }
  const [keyName, code, vkey] = names[name] ?? [name, `Key${name.toUpperCase()}`, name.length === 1 ? name.toUpperCase().charCodeAt(0) : 0]
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: keyName, code, windowsVirtualKeyCode: vkey, nativeVirtualKeyCode: vkey, modifiers })
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: keyName, code, windowsVirtualKeyCode: vkey, nativeVirtualKeyCode: vkey, modifiers })
  await sleep(250)
}
const selectValue = async (selector, value) => {
  const meta = await evaluate(`(() => {
    const e=document.querySelector(${JSON.stringify(selector)});
    if(!e) throw new Error('select not found: '+${JSON.stringify(selector)});
    e.scrollIntoView({block:'center'});
    const i=Array.from(e.options).findIndex(o=>o.value===${JSON.stringify(value)});
    if(i<0) throw new Error('option not found: '+${JSON.stringify(value)});
    const r=e.getBoundingClientRect(); return {index:i,x:r.left+r.width/2,y:r.top+r.height/2,count:e.options.length};
  })()`)
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: meta.x, y: meta.y })
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: meta.x, y: meta.y, button: 'left', clickCount: 1 })
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: meta.x, y: meta.y, button: 'left', clickCount: 1 })
  const keyEvent = async (type, key, code, vkey) => send('Input.dispatchKeyEvent', {
    type, key, code, windowsVirtualKeyCode: vkey, nativeVirtualKeyCode: vkey,
  })
  await keyEvent('keyDown', 'Home', 'Home', 36); await keyEvent('keyUp', 'Home', 'Home', 36)
  for (let i = 0; i < meta.index; i++) {
    await keyEvent('keyDown', 'ArrowDown', 'ArrowDown', 40); await keyEvent('keyUp', 'ArrowDown', 'ArrowDown', 40)
  }
  await keyEvent('keyDown', 'Enter', 'Enter', 13); await keyEvent('keyUp', 'Enter', 'Enter', 13)
  await sleep(400)
  console.log(JSON.stringify({ selector, value, selected: await evaluate(`document.querySelector(${JSON.stringify(selector)}).value`), optionCount: meta.count }))
}

try {
  if (command === 'info') {
    console.log(JSON.stringify({ id: target.id, title: target.title, url: target.url, websocket: target.webSocketDebuggerUrl.replace(/\/devtools\/page\/.*$/, '/devtools/page/<redacted>') }))
  } else if (command === 'dump') {
    console.log(await evaluate(`JSON.stringify({title:document.title,url:location.href,text:document.body.innerText,controls:[...document.querySelectorAll('button,input,select,textarea,[role=button]')].map(e=>{const r=e.getBoundingClientRect();return {tag:e.tagName,type:e.type||'',text:(e.innerText||e.textContent||'').trim().slice(0,160),aria:e.getAttribute('aria-label'),testid:e.getAttribute('data-testid'),placeholder:e.getAttribute('placeholder'),value:e.value,checked:e.checked,disabled:e.disabled,options:e.tagName==='SELECT'?Array.from(e.options).map(o=>({value:o.value,text:o.text})):undefined,rect:{x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}}})})`))
  } else if (command === 'screenshot') {
    const result = await send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: true })
    await writeFile(args[0], Buffer.from(result.data, 'base64'))
    console.log(JSON.stringify({ path: args[0], title: target.title, url: target.url }))
  } else if (command === 'click') {
    await mouseClick(args[0])
  } else if (command === 'double-click') {
    await mouseDoubleClick(args[0])
  } else if (command === 'select-value') {
    await selectValue(args[0], args[1])
  } else if (command === 'text') {
    await send('Input.insertText', { text: args.join(' ') })
    await sleep(250)
  } else if (command === 'key') {
    await press(args[0])
  } else if (command === 'eval-file') {
    console.log(JSON.stringify(await evaluate(`(async()=>{${await readFile(args[0], 'utf8')}\n})()`)))
  } else {
    throw new Error('Usage: cdp-driver.mjs info|dump|screenshot <path>|click <selector-or-text:label>|double-click <selector-or-text:label>|select-value <select> <value>|text <text>|key <key>|eval-file <path>')
  }
} finally {
  ws.close()
}

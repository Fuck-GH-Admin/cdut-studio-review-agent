#!/usr/bin/env node
/**
 * C10-R03 QA-only, real CDP Input dispatcher for an isolated Electron renderer.
 * Records browser-observed timings and hit targets; never treats a requested
 * 40ms interval as proof that a 40ms interval occurred.
 *
 * Usage: D4_CDP_PORT=9252 node apps/electron/scripts/review-d4-c10-r03-input.mjs mouse40|enter-click
 * Run only on the fully completed, confirmed synthetic CreateCaseDialog form.
 * Do not use in the real user profile. Output is JSON; redirect to evidence/.
 */
import { setTimeout as sleep } from 'node:timers/promises'

const mode = process.argv[2]
if (!['mouse40', 'enter-click'].includes(mode)) {
  console.error('Usage: review-d4-c10-r03-input.mjs mouse40|enter-click')
  process.exit(2)
}
const port = Number(process.env.D4_CDP_PORT ?? 9252)
const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
const page = pages.find(p => p.type === 'page' && p.url.startsWith('http://localhost') && p.webSocketDebuggerUrl)
if (!page) throw new Error('No local test Electron renderer; refusing to interact with an unknown page')
const ws = new WebSocket(page.webSocketDebuggerUrl)
await new Promise((resolve, reject) => {
  ws.addEventListener('open', resolve, { once: true })
  ws.addEventListener('error', reject, { once: true })
})
let id = 0
const pending = new Map()
ws.addEventListener('message', ({ data }) => {
  const value = JSON.parse(data)
  if (!value.id) return
  const call = pending.get(value.id)
  if (!call) return
  pending.delete(value.id)
  value.error ? call.reject(new Error(JSON.stringify(value.error))) : call.resolve(value.result)
})
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const key = ++id
  pending.set(key, { resolve, reject })
  ws.send(JSON.stringify({ id: key, method, params }))
})
const evaluate = async expression => {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails))
  return result.result?.value
}
const prepare = `(() => {
  const title = document.querySelector('#review-case-title')
  const form = title?.form
  if (!form) throw Error('CreateCaseDialog form missing')
  const button = form.querySelector('button[type="submit"]')
  if (!button) throw Error('CreateCaseDialog submit button missing')
  button.scrollIntoView({block:'center',inline:'center'})
  if (${JSON.stringify(mode)} === 'enter-click') title.focus()
  const r = button.getBoundingClientRect()
  const x = r.left + r.width / 2, y = r.top + r.height / 2
  const target = document.elementFromPoint(x,y)
  if (!target || target.closest('button') !== button || button.disabled) {
    throw Error('Create button not visible, centered and enabled: refusing to send mouse coordinates')
  }
  if (${JSON.stringify(mode)} === 'enter-click' && document.activeElement !== title) {
    throw Error('Title input is not focused; Enter would not exercise form submission')
  }
  const events = []
  // No names, input values, material data or absolute local paths are captured.
  const record = (e) => {
    const b = e.target?.closest?.('button')
    if (['pointerdown','pointerup','mousedown','mouseup','click','submit','keydown'].includes(e.type)) {
      if (e.type === 'keydown' && e.key !== 'Enter') return
      events.push({ type:e.type, trusted:e.isTrusted, at:performance.now(),
        targetTag:e.target?.tagName ?? null, createButton:b === button,
        buttonDisabled: b?.disabled ?? null, key:e.type === 'keydown' ? e.key : undefined,
        clickDetail: typeof e.detail === 'number' ? e.detail : undefined })
    }
  }
  for (const type of ['pointerdown','pointerup','mousedown','mouseup','click','submit','keydown'])
    window.addEventListener(type,record,true)
  window.__d4c10r03Events = events
  return {x,y,width:r.width,height:r.height,buttonEnabled:!button.disabled,
    activeTag:document.activeElement?.tagName,activeIsTitle:document.activeElement === title}
})()`
const key = { key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 }
const click = (type, count, x, y) => send('Input.dispatchMouseEvent', {
  type, x, y, button: 'left', clickCount: count,
})
try {
  await send('Runtime.enable')
  const preflight = await evaluate(prepare)
  const dispatchedAt = Date.now()
  const acks = []
  // Input.dispatch* is a real CDP browser input event, never element.click()
  // or dispatchEvent() fabricated from the DOM.
  acks.push(send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: preflight.x, y: preflight.y }))
  if (mode === 'mouse40') {
    acks.push(click('mousePressed', 1, preflight.x, preflight.y))
    acks.push(click('mouseReleased', 1, preflight.x, preflight.y))
    // Do NOT await the first click's acknowledgement; Main and React may
    // delay it by hundreds of milliseconds. The browser log is authoritative.
    await sleep(40)
    acks.push(click('mousePressed', 2, preflight.x, preflight.y))
    acks.push(click('mouseReleased', 2, preflight.x, preflight.y))
  } else {
    // Include rawKeyDown + char (Enter default action) instead of relying
    // on keyDown/keyUp alone, which #125 did not prove triggered a submit.
    acks.push(send('Input.dispatchKeyEvent', { type: 'rawKeyDown', ...key }))
    acks.push(send('Input.dispatchKeyEvent', { type: 'char', ...key, text: '\r', unmodifiedText: '\r' }))
    acks.push(send('Input.dispatchKeyEvent', { type: 'keyUp', ...key }))
    acks.push(click('mousePressed', 1, preflight.x, preflight.y))
    acks.push(click('mouseReleased', 1, preflight.x, preflight.y))
  }
  await Promise.all(acks)
  await sleep(1200)
  const events = await evaluate('window.__d4c10r03Events ?? []')
  const pressed = events.filter(e => e.type === 'pointerdown' && e.trusted)
  const submits = events.filter(e => e.type === 'submit' && e.trusted)
  const buttons = events.filter(e => e.type === 'click' && e.trusted && e.createButton)
  const pressGapMs = pressed.length >= 2 ? pressed[1].at - pressed[0].at : null
  const status = submits.length >= 2 ? 'TRUSTED_DUAL_SUBMIT_OBSERVED'
    : submits.length === 1 ? 'NATIVE_SINGLE_SUBMIT_OBSERVED'
    : 'NO_TRUSTED_SUBMIT_OBSERVED'
  console.log(JSON.stringify({
    mode, requestedMouseGapMs: mode === 'mouse40' ? 40 : null,
    preflight, dispatchAcknowledgements: acks.length, dispatchedAt,
    observedTrustedPointerDownGapMs: pressGapMs, observedCreateButtonClicks: buttons.length,
    observedTrustedSubmits: submits.length, timingWithin120ms: pressGapMs !== null && pressGapMs <= 120,
    outcome: status, events,
    caveat: 'Check separate Main entry log, success/failure toasts, and read-only IPC. No GUI PASS is implied by event counts alone.',
  }, null, 2))
} finally {
  ws.close()
}

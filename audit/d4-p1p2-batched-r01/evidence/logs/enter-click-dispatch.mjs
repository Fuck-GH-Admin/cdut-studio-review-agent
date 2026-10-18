const port=9252
const pages=await(await fetch(`http://127.0.0.1:${port}/json/list`)).json()
const target=pages.find(page=>page.type==='page'&&page.url.startsWith('http://localhost')&&page.webSocketDebuggerUrl)
if(!target) throw new Error('missing Electron renderer')
const ws=new WebSocket(target.webSocketDebuggerUrl)
await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true})})
let next=0;const pending=new Map()
ws.addEventListener('message',({data})=>{const m=JSON.parse(data);const p=pending.get(m.id);if(!p)return;pending.delete(m.id);m.error?p.reject(new Error(JSON.stringify(m.error))):p.resolve(m.result)})
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++next;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}))})
await send('Runtime.enable')
const r=await send('Runtime.evaluate',{expression:`(()=>{const b=[...document.querySelectorAll('button')].find(e=>e.textContent.trim()==='创建项目');if(!b)throw Error('create button missing');const q=b.getBoundingClientRect();return{x:q.left+q.width/2,y:q.top+q.height/2,disabled:b.disabled,focused:document.activeElement===b,title:document.querySelector('input[placeholder="如：2026 年秋季学期综合素质测评"]')?.value}})()`,returnByValue:true})
const meta=r.result.value
if(meta.disabled||!meta.focused||!meta.title?.includes('ENTER-CLICK'))throw Error(`unexpected create button state ${JSON.stringify(meta)}`)
const operations=[
  send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,nativeVirtualKeyCode:13}),
  send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,nativeVirtualKeyCode:13}),
  send('Input.dispatchMouseEvent',{type:'mouseMoved',x:meta.x,y:meta.y}),
  send('Input.dispatchMouseEvent',{type:'mousePressed',x:meta.x,y:meta.y,button:'left',clickCount:1}),
  send('Input.dispatchMouseEvent',{type:'mouseReleased',x:meta.x,y:meta.y,button:'left',clickCount:1}),
]
const results=await Promise.all(operations)
await new Promise(resolve=>setTimeout(resolve,400))
const eventResult=await send('Runtime.evaluate',{expression:'window.__d4SubmitEvents??null',returnByValue:true})
console.log(JSON.stringify({title:target.title,url:target.url,button:meta,dispatchCount:operations.length,events:eventResult.result.value,acknowledgements:results.length}))
ws.close()

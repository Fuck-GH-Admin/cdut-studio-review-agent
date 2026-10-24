import {createRequire} from 'node:module';
import {writeFileSync,appendFileSync} from 'node:fs';
const require=createRequire('/home/miku/Bot/CDUTStudio/CDUT-Studio/apps/electron/package.json');
const WebSocket=require('ws');
const root='/tmp/cdut-ui-acceptance-20261003';
const targets=await (await fetch('http://127.0.0.1:9237/json/list')).json();
const target=targets.find(t=>t.type==='page' && t.url.startsWith('http://localhost:5188'));
if(!target) throw Error('主界面目标不存在');
const ws=new WebSocket(target.webSocketDebuggerUrl);
await new Promise((ok,no)=>{ws.once('open',ok);ws.once('error',no)});
let next=0;const pending=new Map();
ws.on('message',d=>{const r=JSON.parse(d);if(r.id){const cb=pending.get(r.id);pending.delete(r.id);r.error?cb?.reject(Error(JSON.stringify(r.error))):cb?.resolve(r.result)}});
function send(method,params={}){return new Promise((resolve,reject)=>{const id=++next;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}))})}
async function ev(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.text+' '+r.exceptionDetails.exception?.description);return r.result.value}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const [action,...args]=process.argv.slice(2);
const visible="e=>e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden'";
try{
 if(action==='snapshot') console.log(JSON.stringify(await ev(`({text:document.body.innerText,buttons:[...document.querySelectorAll('button,[role=menuitem],[role=tab]')].filter(${visible}).map(e=>({text:e.innerText,aria:e.getAttribute('aria-label'),title:e.getAttribute('title'),disabled:e.disabled})),inputs:[...document.querySelectorAll('input,textarea,select')].filter(${visible}).map(e=>({tag:e.tagName,type:e.type,placeholder:e.placeholder,value:e.value}))})`)));
 else if(action==='eval') console.log(JSON.stringify(await ev(args.join(' '))));
 else if(action==='screenshot'){const r=await send('Page.captureScreenshot',{format:'png'});const p=`${root}/screenshots/${args[0]||'ui'}.png`;writeFileSync(p,Buffer.from(r.data,'base64'));console.log(p)}
 else if(action==='click'||action==='contains'||action==='input'||action==='editable'){
  const name=args[0];const index=Number(args[action==='input'?2:1]||0);
  const expr=action==='editable'?`document.querySelector('[contenteditable=true]')`:action==='input'?`[...document.querySelectorAll('input,textarea')].filter(${visible}).filter(e=>(e.placeholder||'').includes(${JSON.stringify(name)}))[${index}]`:`[...document.querySelectorAll('button,[role=menuitem],[role=tab],[role=option],a,.cursor-pointer')].filter(${visible}).filter(e=>(${action==='contains'} ? e.innerText.includes(${JSON.stringify(name)}) : e.innerText.trim()===${JSON.stringify(name)})||e.getAttribute('aria-label')===${JSON.stringify(name)}||e.getAttribute('title')===${JSON.stringify(name)})[${index}]`;
  const pos=await ev(`(()=>{const e=${expr};if(!e)return null;e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();const y=r.y+r.height/2;const x=[r.x+r.width/2,r.right-6,r.left+6].find(x=>e.contains(document.elementFromPoint(x,y)));return x===undefined?null:{x,y,disabled:e.disabled}})()`);
  if(!pos)throw Error('未找到可见控件：'+name);if(pos.disabled)throw Error('控件已禁用：'+name);
  await send('Input.dispatchMouseEvent',{type:'mousePressed',x:pos.x,y:pos.y,button:'left',clickCount:1});await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:pos.x,y:pos.y,button:'left',clickCount:1});
  if(action==='input'||action==='editable'){await send('Input.dispatchMouseEvent',{type:'mousePressed',x:pos.x,y:pos.y,button:'left',clickCount:3});await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:pos.x,y:pos.y,button:'left',clickCount:3});await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Backspace',code:'Backspace'});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Backspace',code:'Backspace'});await send('Input.insertText',{text:action==='editable'?args[0]:(args[1]||'')})}
  await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:20,y:20});await sleep(400);console.log('UI操作完成：'+name)
 }
 else if(action==='key'){await send('Input.dispatchKeyEvent',{type:'keyDown',key:args[0],code:args[1]||args[0],modifiers:Number(args[2]||0)});await send('Input.dispatchKeyEvent',{type:'keyUp',key:args[0],code:args[1]||args[0],modifiers:Number(args[2]||0)});await sleep(250)}
 else if(action==='resize'){await send('Emulation.setDeviceMetricsOverride',{width:Number(args[0]),height:Number(args[1]),deviceScaleFactor:1,mobile:false});console.log('视口：'+args.join('x'))}
 else throw Error('未知操作 '+action);
 appendFileSync(`${root}/actions.jsonl`,JSON.stringify({at:new Date().toISOString(),action,args:action==='eval'?['只读或标注过的探查']:args})+'\n');
}finally{ws.close()}

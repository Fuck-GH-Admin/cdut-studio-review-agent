import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root='/tmp/cdut-ui-acceptance-20261003';
const json=(r,obj,status=200)=>{r.writeHead(status,{'Content-Type':'application/json'});r.end(JSON.stringify(obj))};
const cases=()=>fs.readdirSync(root+'/config/review-cases').flatMap(id=>{try{return [JSON.parse(fs.readFileSync(root+'/config/review-cases/'+id+'/case.json','utf8'))]}catch{return []}});
const server=http.createServer(async(q,r)=>{
 if(q.method==='GET') return json(r,{object:'list',data:[{id:'gpt-4o-mini',object:'model',owned_by:'qa-local'}]});
 let b='';for await(const s of q)b+=s;
 let input;try{input=JSON.parse(b)}catch{return json(r,{error:{message:'Bad JSON'}},400)}
 const msgs=input.messages||[];
 const system=msgs.filter(m=>m.role==='system').map(m=>m.content).join('\n');
 const user=msgs.filter(m=>m.role==='user').map(m=>typeof m.content==='string'?m.content:m.content.filter(p=>p.type==='text').map(p=>p.text).join('\n')).join('\n');
 fs.appendFileSync(root+'/model-requests.jsonl',JSON.stringify({at:new Date().toISOString(),path:q.url,model:input.model,messages:msgs})+'\n');
 let mode={};try{mode=JSON.parse(fs.readFileSync(root+'/model-mode.json','utf8'))}catch{}
 if(mode.delay)await new Promise(ok=>setTimeout(ok,mode.delay));
 if(mode.fail)return json(r,{error:{message:'QA 模型服务暂不可用'}},503);
 const c=cases().find(c=>c.title==='验收-A-双依据申请');
 let content;
 if(system.includes('提取审核规则大纲')){
  const pack=c.rulePacks.find(p=>user.includes('规则包：'+p.name))||c.rulePacks[0];
  const d=c.documents.find(d=>d.id===pack.documentId);
  content=JSON.stringify([{id:'qa-rule-'+pack.id,category:d.fileName.includes('time')?'时间范围':'等级分值',title:d.fileName.includes('time')?'认可时间区间':'竞赛等级分值',summary:d.blocks[1]?.text||d.blocks[0].text,anchors:[{documentId:d.id,blockId:d.blocks[1]?.id||d.blocks[0].id,precision:'block'}]}]);
 }else if(system.includes('识别每一条可审核事项')||system.includes('逐份识别其中的可审核事项')){
  const d=c.documents.find(d=>d.role==='application');const p=c.documents.find(d=>d.role==='evidence');
  content=JSON.stringify([{id:'qa-item',title:'校园科技竞赛省级一等奖',category:'智育',level:'省级一等奖',declaredScore:4,activityDate:'2026-09-20',evidenceDocumentIds:p?[p.id]:[],anchor:{documentId:d.id,blockId:d.blocks[1]?.id||d.blocks[0].id,precision:'block'},status:'identified'}]);
 }else if(system.includes('产出问题清单')){
  const d=c.documents.find(d=>d.role==='application');const p=c.documents.find(d=>d.role==='evidence');const rule=c.documents.find(d=>d.fileName==='time-policy.md');
  content=JSON.stringify(mode.empty?[]:[{id:'qa-date-finding',itemId:c.items[0]?.id||'case-level',kind:'date-out-of-range',severity:'red',title:'QA 时间依据：获奖日期超出认可范围',detail:'申请日期2026-09-20超过补充依据截止2026-08-31。此为受控协议测试回复。',suggestion:'fix-declaration',suggestionText:'核实活动日期并补充说明，再重新审核。',subjectAnchor:{documentId:d.id,blockId:d.blocks[1]?.id||d.blocks[0].id,precision:'block'},evidenceAnchor:p?{documentId:p.id,blockId:p.blocks[1]?.id||p.blocks[0].id,precision:'block'}:undefined,ruleAnchors:[{documentId:rule.id,blockId:rule.blocks[1]?.id||rule.blocks[0].id,precision:'block'}],ruleItemIds:c.rulePacks.find(p=>p.documentId===rule.id)?.outline.map(i=>i.id)||[],suggestedScore:0}]);
 }else content='QA受控助手：所选问题引用时间规定，截止2026-08-31。请核实日期并补充说明。核验码QA-PROOF-UNIQUE-4488。此回复用于通信与界面联调。';
 if(input.stream){r.writeHead(200,{'Content-Type':'text/event-stream'});for(const delta of [{role:'assistant'},{content},{}])r.write('data: '+JSON.stringify({id:'qa-chat',object:'chat.completion.chunk',created:Math.floor(Date.now()/1000),model:input.model,choices:[{index:0,delta,finish_reason:Object.keys(delta).length?null:'stop'}],usage:{prompt_tokens:10,completion_tokens:30,total_tokens:40}})+'\n\n');r.end('data: [DONE]\n\n')}
 else json(r,{id:'qa-chat',object:'chat.completion',model:input.model,choices:[{index:0,message:{role:'assistant',content},finish_reason:'stop'}],usage:{prompt_tokens:10,completion_tokens:30,total_tokens:40}});
});server.listen(9249,'127.0.0.1',()=>console.log('QA OpenAI-compatible service listening on 127.0.0.1:9249'));

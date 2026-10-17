'use strict';
module.exports=function(text,s){
const secs=[...text.matchAll(/^##\s+(\d+)\.\s*([^\n]*)/gm)].map((m,i,a)=>({n:+m[1],title:m[2],body:text.slice(m.index,a[i+1]?.index??text.length).trim()}));
const ruleSec=secs.find(x=>x.n===(s.id==='G03-T07'?11:9));if(!ruleSec)throw Error('R section missing');
const rm=new Map();let current=0,parts=[];
function flush(){if(current)rm.set(current,{title:parts[0].replace(/^#{3,4}\s+/,''),body:parts.join('\n').trim()})}
for(const l of ruleSec.body.split('\n')){
 const h=l.match(/^#{3,4}\s+(?:\x60)?R-0?(\d{1,3})(?:\x60)?\s*[｜—-]?/);
 if(h){flush();current=+h[1];parts=[l];continue}
 if(current){if(/^#{3,4}\s+/.test(l)){flush();current=0;parts=[]}else parts.push(l)}
 else if(l.startsWith('|')){
  const cells=l.split('|').slice(1,-1).map(x=>x.trim());
  const first=(cells[0]||'').replace(/[\x60*]/g,'');
  const match=first.match(/^R-0?(\d{1,3})(?:\s*[｜\s]|$)/);
  if(match)rm.set(+match[1],{title:first,body:cells.join('；')});
 }
}flush();
if(rm.size!==s.expectedRules||[...Array(s.expectedRules)].some((_,i)=>!rm.has(i+1)))throw Error(s.id+' rule parsing failed: '+rm.size);
const ver='md-'+s.templateId+'-'+s.sourceSha256.slice(0,16),synver='synthetic-'+s.templateId+'-v1';
const sources=[{sourceId:'synthetic-choice',kind:'synthetic',label:'合成场景来源',reference:{documentVersionId:synver,locator:'synthetic/selection'},verification:'content-checked',applicability:'request-scope',note:'仅模拟接口，不是校方政策'}],mods=[],uses=[],links=[],entries=[],nonR=[];
const artificial={kind:'synthetic',note:'原文转换的技术审核任务，权威性仍待校方确认'};
function source(id,label,locator){sources.push({sourceId:id,kind:'policy-candidate',label,reference:{documentVersionId:ver,locator},verification:'content-checked',applicability:'unknown',note:'C原文已获得并核对，正式校规适用/后台事件未获有权核定'});}
function module(name,tasks,scenario){mods.push({moduleId:s.templateId+'-'+name,version:1,name:s.title+'｜'+name,purpose:'逐对象审核'+name,scope:'当前'+s.businessType,limits:'UNKNOWN必须等待；不能直接作行政许可',source:artificial,tasks});uses.push({id:'use-'+name,moduleId:s.templateId+'-'+name,version:1,...(scenario?{scenario}:{})});}
function add(name,taskId,sid,fact,sourceId,locator,gate=null){const checkId=s.templateId+'@1:module/use-'+name+'/'+taskId;
links.push({checkId,sourceIds:[sid],applicabilityNote:'三态未知不得按假或缺件处理；按校本有权来源确定',genericScope:{businessTypes:[s.businessType],evidenceFacts:[fact]},...(gate?{gate}:{})});
entries.push({sourceId,locator,technicalCheckId:checkId,moduleId:s.templateId+'-'+name,sourceBinding:sid,evidenceFact:fact,disposition:'implemented-not-tested',policy:'POLICY_HOLD',gate});
return checkId;}
const makeTask=(id,title,requirement)=>({id,title,requirement,completion:'逐对象记录当前来源、材料版本、证据冲突、适用性和待人工处理事项',limits:'不能因未找到学校底账直接认定违规或宣布批准、激活、上机、播出'});
const applicants={ '01':4,'02':4,'03':3,'06':1,'07':3,'08':2,'09':8,'10':3,'11':3,'12':3};
const authorities={'01':15,'02':19,'03':8,'06':3,'07':6,'08':19,'09':29,'10':16,'11':12,'12':14};
const kind=s.id.slice(-2);
for(const g of s.groups){const tasks=[];
 for(const rid of g.rules){const n=+rid.slice(2),r=rm.get(n),tid='r'+String(n).padStart(2,'0'),sid='source-'+tid,fact='d2:object:'+s.businessType+':'+tid;
  source(sid,s.id+' '+rid+' '+r.title,'§'+ruleSec.n+'/'+rid);
  let gate=null;if(applicants[kind]===n||authorities[kind]===n){
   const provider=applicants[kind]===n?'applicant':'authority';
   gate={when:{kind:'case-stage',stages:provider==='applicant'?['submitted','reviewing','awaiting-supplement']:['reviewing','awaiting-final','decided']},material:{provider,dueStages:provider==='applicant'?['submitted','reviewing']:['awaiting-final','decided'],alternatives:[fact]}};
  }
  add(g.name,tid,sid,fact,rid,'§'+ruleSec.n+'/'+rid,gate);tasks.push(makeTask(tid,r.title.slice(0,110),r.body));
 }module(g.name,tasks);
}
for(const sec of secs){if(sec.n===ruleSec.n)continue;
 let chunks=[],chunk='';for(const line of sec.body.split('\n')){if(chunk.length+line.length>5500&&chunk){chunks.push(chunk.trim());chunk='';}if(line.length>5500){for(let i=0;i<line.length;i+=5500)chunks.push(line.slice(i,i+5500));continue;}chunk+=line+'\n';}if(chunk.trim())chunks.push(chunk.trim());
 const name='section-'+String(sec.n).padStart(2,'0'),sid='source-'+name,tasks=[];
 source(sid,'原文§'+sec.n+' '+sec.title,'§'+sec.n);
 chunks.forEach((part,i)=>{const tid='part-'+String(i+1).padStart(2,'0'),fact='d2:object:'+s.businessType+':'+name+'-'+(i+1);add(name,tid,sid,fact,'§'+sec.n+'-'+(i+1),'§'+sec.n+' '+sec.title);tasks.push(makeTask(tid,'§'+sec.n+' '+sec.title+'('+ (i+1)+'/'+chunks.length+')',part));});
 module(name,tasks);
 nonR.push({section:sec.n,title:sec.title,sourceLocator:'§'+sec.n,parts:chunks.length,checks:tasks.map(t=>s.templateId+'@1:module/use-'+name+'/'+t.id),ids:[...new Set([...sec.body.matchAll(/\b(F|MS|M|EV|EG|BR|AX|ST|CFG|PH)-?0?(\d{1,3})\b/g)].map(x=>x[1]+'-'+String(x[2]).padStart(2,'0')))]});
}
// Preserve the Markdown front matter and common R-section envelope. Numbered R rows
// do not themselves cover policy applicability preambles, table legends or source scope.
const front=text.slice(0,text.search(/^##\s+1\./m)).trim();
const rowLines=ruleSec.body.split('\n');
const isRHeader=l=>/^#{3,4}\s+`?R-0?\d{1,3}/.test(l);
const isRRow=l=>/^\|\s*[`*]*R-0?\d{1,3}/.test(l);
const firstR=rowLines.findIndex(l=>isRHeader(l)||isRRow(l));
const lastR=rowLines.findLastIndex(l=>isRHeader(l)||isRRow(l));
if(firstR<0||lastR<0)throw Error('rule envelope detection failed '+s.id);
const rulePreamble=rowLines.slice(0,firstR).join('\n').trim();
const ruleTail=isRRow(rowLines[firstR])?rowLines.slice(lastR+1).join('\n').trim():'';
for(const extra of [
 {name:'front',title:'业务母版原始头部/版本/权威声明',body:front,locator:'front-matter'},
 {name:'rule-envelope',title:'§'+ruleSec.n+' 规则共同前提与表格注释',body:rulePreamble+(ruleTail?'\n'+ruleTail:''),locator:'§'+ruleSec.n+'/shared-invariants'}
]){
 if(!extra.body)throw Error(s.id+' missing shared invariant '+extra.name);
 const name='extra-'+extra.name,sid='source-'+name,fact='d2:object:'+s.businessType+':'+name;
 source(sid,s.id+' '+extra.title,extra.locator);
 add(name,'full',sid,fact,'EXTRA-'+extra.name,extra.locator);
 module(name,[makeTask('full',extra.title,extra.body)]);
 nonR.push({section:extra.name,title:extra.title,sourceLocator:extra.locator,parts:1,
 checks:[s.templateId+'@1:module/use-'+name+'/full'],ids:[]});
}
for(const axis of [...s.axes.primary,...s.axes.conditions]){const name='axis-'+axis,sid='source-'+name,fact='d2:object:'+s.businessType+':axis-'+axis;source(sid,'§4 条件轴 '+axis,'§4/'+axis);add(name,'verify',sid,fact,'AXIS-'+axis,'§4/'+axis);module(name,[makeTask('verify','逐对象情景 '+axis,'依原文§4对当前对象确认'+axis+'，primary每对象恰选一，conditions可叠加且须逐项三态；其它互斥轴仍由完整§4原文的语义模块核查。')],axis);}
const template={templateId:s.templateId,version:1,name:s.title,purpose:'G03 '+s.id+' 完整原文技术预审',limits:'不自动签发学校许可；所有候选校本条件未确认只能待核',source:artificial,scenarios:[...s.axes.primary,...s.axes.conditions],genericScenarioAxes:s.axes,modules:uses,localTasks:[makeTask('boundary','整案审核目的和许可禁区','保持本业务与相邻领域的路由界线；逐对象结论不可替代整案行政许可；不能从上一对象继承审批事件。')]};
links.push({checkId:s.templateId+'@1:local/boundary',sourceIds:['source-section-01'],caseScopeJustification:'只就整个申请案卷的业务目标及行政权限边界作一次整案审查。'});
const workspace={schemaVersion:1,workspaceId:'d4-'+s.templateId,revision:1,definitions:{modules:mods,templates:[template]},sources,sourceBindings:links,sharedModuleLocks:[]};
const targets=[0,1].map(i=>({kind:'generic-object',objectKey:'item-'+(i?'b':'a'),subjectId:s.templateId+'-subject-'+(i?'b':'a'),title:'SYNTHETIC '+s.title+'对象'+(i?'B':'A'),businessType:s.businessType,scenario:s.axes.primary[Math.min(i,s.axes.primary.length-1)],scenarioSource:{sourceId:'synthetic-choice',sourceVersionId:synver,decidedBy:'reviewer'},conditions:s.axes.conditions.map((axis,j)=>({id:axis,applicability:i===0?(j===0?'applicable':'not-applicable'):(j===0?'unknown':j===1?'applicable':'not-applicable'),sourceId:'synthetic-choice',sourceVersionId:synver,decidedBy:i===1&&j===0?'undetermined':'reviewer'}))}));
const selection={templateId:s.templateId,version:1,targets};
const c={id:s.templateId+'-synthetic-case',templateId:s.templateId,templateVersion:1,title:'SYNTHETIC '+s.title,objectType:'document',caseFields:{},subjects:[],documents:[],stage:'draft',revision:0,createdAt:'2026-10-17T00:00:00Z',updatedAt:'2026-10-17T00:00:00Z'};
const coverage={schema:'d4-g03-source-coverage-v1',templateId:s.templateId,sourceSha256:s.sourceSha256,originalRuleCount:rm.size,ruleIds:[...rm.keys()].sort((a,b)=>a-b).map(n=>'R-'+String(n).padStart(2,'0')),authoredChecks:links.length,entries,nonNumberedSections:nonR,semanticIndependentlyVerified:false,schoolPolicyVerified:false,goldRegenerated:false};
const manifest={schema:'d4-g03-template-v1',templateId:s.templateId,sourceFile:s.sourceFile,sourceSha256:s.sourceSha256,sourceVersion:'business-md-v0.1',technicalSha:'a7a6a11d4840ad64cfc858c17b35f35180adf063',moduleCount:mods.length,checkCount:links.length,sourceBindingCount:links.length,sharedModuleLocks:[],reuse:'local by design; synthetic B01/B02 not promoted as policy',status:'GENERATED_NOT_RUN',policy:'POLICY_HOLD',gold:'UNTOUCHED'};
return {workspace,selection,case:c,coverage,manifest};
};
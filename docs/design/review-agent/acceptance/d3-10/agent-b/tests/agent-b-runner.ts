
import {spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
const base=resolve('docs/design/review-agent/acceptance/d3-10/agent-b');
for(const d of ['logs','workspaces','bundles','plans','tests','gaps'])mkdirSync(join(base,d),{recursive:true});
const config=join(base,'tests','isolated-config-B');mkdirSync(config,{recursive:true});
const path=(a,b)=>join(base,a,b);
const fixture=(x)=>resolve('docs/design/review-agent/fixtures',x);
const read=(x)=>JSON.parse(readFileSync(x,'utf8'));
const save=(x,v)=>writeFileSync(x,JSON.stringify(v,null,2)+'\n');
const notes=[],checks=[],faults=[];
let counter=0;
function assert(ok,msg){checks.push({passed:!!ok,description:msg});if(!ok)throw new Error('ASSERT '+msg);}
function run(label,args,expected=0,envConfig=config){
 counter++;
 const result=spawnSync(process.execPath,args,{encoding:'utf8',env:{...process.env,PROFER_CONFIG_DIR:envConfig,ELECTRON_SKIP_BINARY_DOWNLOAD:'1'},maxBuffer:20000000});
 const item={number:counter,label,command:'bun '+args.join(' '),exitCode:result.status??-1,expected,stdout:'logs/'+counter+'.stdout',stderr:'logs/'+counter+'.stderr'};
 writeFileSync(join(base,item.stdout),result.stdout??'');
 writeFileSync(join(base,item.stderr),result.stderr??String(result.error??''));
 notes.push(item);
 if(item.exitCode!==expected)throw new Error(label+' exit '+item.exitCode+' expected '+expected+': '+(result.stderr??'').slice(0,400));
 try{return JSON.parse(result.stdout)}catch{return {raw:result.stdout}};
}
function tool(...args){return ['apps/electron/scripts/review-d3-library.ts',...args];}
function saveD1(f,expected){return run('d1-save-'+f.split('/').at(-1),['apps/electron/scripts/review-authoring-v1.ts','save',f,String(expected),'agent-b-independent']);}
const froot='g01_archive_utilization_template_editor_spec_v1_5.md';
const fhash='65157e002dd4d1ccc08d32d341b4a1f7eacfc55d6a3c13a5da949aaf122f9785';
try{
 const demo=path('bundles','handoff'); run('D3-handoff-demo',['apps/electron/scripts/review-d3-handoff-demo.ts',demo]);
 const index=read(join(demo,'frozen-index.json'));
 const b1=index.find(x=>x.moduleId==='agent-authorization'),b2=index.find(x=>x.moduleId==='evidence-source-boundary');
 assert(!!b1&&!!b2,'both frozen B01 and B02');
 run('discover',tool('discover','authorization'));
 const v1=run('inspect-B01',tool('inspect','agent-authorization','1'));
 const b2item=run('inspect-B02',tool('inspect','evidence-source-boundary','1'));
 assert(v1.digest===b1.digest&&b2item.digest===b2.digest,'frozen digests exact');
 const a=read(join(demo,'archive-workspace.json')),c=read(join(demo,'campus-workspace.json'));
 a.workspaceId='d310-agent-b-archive';a.revision=1;
 c.workspaceId='d310-agent-b-campus';c.revision=1;
 const a1=path('workspaces','archive-r1.json'),c1=path('workspaces','campus-r1.json');
 save(a1,a);save(c1,c);
 run('validate-a1',tool('validate',a1));run('validate-c1',tool('validate',c1));
 saveD1(a1,0);saveD1(c1,0);
 const a2=structuredClone(a),c2=structuredClone(c);a2.revision=2;c2.revision=2;
 // The first authoring attempt used a case-level localTask. An independent plan inspection
 // showed this widened the responsibility beyond the copy operation. Correct it via local module.
 const archiveCopyLocal={
  moduleId:'archive-copy-local',version:1,name:'档案复制独立授权（业务本地）',
  purpose:'对指定档案件的指定复制操作作范围核对，不继承查阅授权',
  scope:'本次 item-1/copy 操作',
  source:{kind:'synthetic',note:'原始业务MD R23责任映射；成都理工当前实施细则待核'},
  limits:'不开放档案，不代替馆方批准和实际出件。',
  tasks:[{id:'copy-authorization',title:'复制权限与数量范围',
   requirement:'按原始档案MD R23，只核 item-1/copy 的页数、份数与独立授权；查阅授权不能推出复制许可，权威许可未知则待核。',
   completion:'输出档案件、copy操作与范围一一对应的证据和未确认原因。',
   limits:'不凭OCR文字或查阅权限完成行政批准。'}],parameters:[]};
 a2.definitions.modules.push(archiveCopyLocal);
 a2.definitions.templates[0].modules.push({id:'item-1-copy-local',moduleId:'archive-copy-local',version:1,objectKey:'item-1/copy'});
 a2.sourceBindings.push({checkId:'archive-access@1:module/item-1-copy-local/copy-authorization',sourceIds:['school-policy-unverified']});
 c2.definitions.templates[0].localTasks.push({
  id:'independent-card-qualification',title:'校园卡资格不能从代理继承',
  requirement:'代办授权不能推出家属卡关系资格或临时服务资格；分别保留校内资格核验。',
  completion:'对实际资格来源输出待核或明确证据，不自动批准发卡。',
  limits:'档案查阅和复制权限不得继承到校园卡。'});
 c2.sourceBindings.push({checkId:'special-campus-card@1:local/independent-card-qualification',sourceIds:['school-policy-unverified']});
 const af2=path('workspaces','archive-r2.json'),cf2=path('workspaces','campus-r2.json');save(af2,a2);save(cf2,c2);
 run('validate-a2',tool('validate',af2));run('validate-c2',tool('validate',cf2));
 saveD1(af2,1);saveD1(cf2,1);
 const aOld=run('d1-read-r1',['apps/electron/scripts/review-authoring-v1.ts','read',a.workspaceId,'1']);
 save(path('workspaces','archive-r1-read.json'),aOld);
 const newModule=read(fixture('d3-b01-delegation-scope.json'));
 newModule.version=2;
 newModule.tasks.push({id:'scope-trace',title:'局部证据范围追踪',
 requirement:'记录{{action}}的被代理人、档案件或卡务事项、操作、授权期限；任一维度未知不得取其他操作授权补足。',
 completion:'输出该操作的证据版本与授权有效期间，未知保持待核。',
 limits:'不会推断档案开放、复制权限或发卡资格。'});
 const modFile=path('workspaces','B01-v2-agent-authored.json');save(modFile,newModule);
 const exampleFile=fixture('d3-b01-b02-example-ids.json');
 const frozenV2=run('freeze-B01-v2',tool('freeze',modFile,exampleFile));
 const inspectV2=run('inspect-B01-v2',tool('inspect','agent-authorization','2'));
 assert(inspectV2.digest===frozenV2.digest&&v1.digest!==frozenV2.digest,'v2 digest immutable and different');
 const impact=run('impact-B01-old-consumers',tool('impact','agent-authorization','1','2'));
 save(path('plans','impact-old-consumers.json'),impact);
 assert(impact.consumers.some(x=>x.workspaceId===a.workspaceId),'impact sees persisted A consumer');
 assert(impact.consumers.some(x=>x.workspaceId===c.workspaceId),'impact sees persisted C consumer');
 const up={expectedRevision:2,templateId:'archive-access',templateVersion:1,useId:'item-1-read',
  expectedOldDigest:v1.digest,newVersion:2,expectedNewDigest:inspectV2.digest,
  sourceBindings:[
  {checkId:'archive-access@1:module/item-1-read/authorization',sourceIds:['school-policy-unverified']},
  {checkId:'archive-access@1:module/item-1-read/scope-trace',sourceIds:['school-policy-unverified']}],
  acknowledgeRemovedCheckIds:[]};
 const upFile=path('workspaces','upgrade-read-to-B01-v2.json');save(upFile,up);
 const upgraded=run('upgrade-A-read-only',tool('upgrade',af2,upFile));
 save(path('workspaces','archive-r3.json'),upgraded.workspace);
 assert(upgraded.workspace.revision===3&&upgraded.removedCheckIds.length===0,'upgrade preserves original check');
 const mods=upgraded.workspace.definitions.templates[0].modules;
 assert(mods.find(x=>x.id==='item-1-read')?.version===2,'read upgraded to B01 v2');
 assert(mods.find(x=>x.id==='item-1-copy')?.version===1,'copy remains B01 v1');
 assert(c2.definitions.templates[0].modules.some(x=>x.moduleId==='agent-authorization'&&x.version===1),'C remains old version');
 run('validate-r3',tool('validate',path('workspaces','archive-r3.json')));
 saveD1(path('workspaces','archive-r3.json'),2);
 const saved3=run('d1-read-r3',['apps/electron/scripts/review-authoring-v1.ts','read',a.workspaceId,'3']);
 save(path('workspaces','archive-r3-read.json'),saved3);
 assert(saved3.workspace?.revision===3&&aOld.workspace?.revision===1,'D1 revision chain and old read intact');
 // separate unsaved negative v3 only for replacement signature check
 const v3=read(fixture('d3-b01-delegation-scope.json'));v3.version=3;
 v3.tasks[0].id='authorization-renamed';
 v3.tasks[0].requirement+='；原代理对象、操作和期间责任全部保留。';
 const v3File=path('tests','B01-v3-negative-only.json');save(v3File,v3);
 const frozen3=run('freeze-negative-v3',tool('freeze',v3File,exampleFile));
 const rejectReq={...up,newVersion:3,expectedNewDigest:frozen3.digest,
  sourceBindings:[{checkId:'archive-access@1:module/item-1-read/authorization-renamed',sourceIds:['school-policy-unverified']}],acknowledgeRemovedCheckIds:[]};
 const rejectFile=path('tests','upgrade-v3-no-ack.json');save(rejectFile,rejectReq);
 run('negative-unacknowledged-removal',tool('upgrade',af2,rejectFile),1);
 rejectReq.acknowledgeRemovedCheckIds=['archive-access@1:module/item-1-read/authorization'];
 const ackFile=path('tests','upgrade-v3-ack.json');save(ackFile,rejectReq);
 const ack=run('explicit-check-id-replacement',tool('upgrade',af2,ackFile));
 save(path('tests','upgrade-v3-ack-result.json'),ack);
 assert(ack.removedCheckIds.includes('archive-access@1:module/item-1-read/authorization'),'check removal requires explicit acknowledgement');
 run('export-A',tool('export',path('workspaces','archive-r3.json'),path('bundles','archive-export.json')));
 run('export-C',tool('export',cf2,path('bundles','campus-export.json')));
 const cleanA=path('tests','clean-config-A'),cleanC=path('tests','clean-config-C');
 mkdirSync(cleanA,{recursive:true});mkdirSync(cleanC,{recursive:true});
 run('import-A-clean',tool('import',path('bundles','archive-export.json'),path('bundles','archive-reimport.json')),0,cleanA);
 run('import-C-clean',tool('import',path('bundles','campus-export.json'),path('bundles','campus-reimport.json')),0,cleanC);
 const caseFor=(templateId)=>({id:'agent-b-synthetic-'+templateId,templateId,templateVersion:1,title:'Agent B合成技术审核',objectType:'document',caseFields:{},subjects:[],documents:[],stage:'draft',revision:0,createdAt:'2026-10-11T00:00:00.000Z',updatedAt:'2026-10-11T00:00:00.000Z'});
 save(path('tests','archive-case.json'),caseFor('archive-access'));save(path('tests','campus-case.json'),caseFor('special-campus-card'));
 const selA=fixture('d2-selection-archive.json'),selC=fixture('d2-selection-family.json');
 const planArgs=(w,sel,cc)=>['apps/electron/scripts/review-d2-plan.ts','preview',w,sel,cc];
 const pa=run('D2-plan-A',planArgs(path('workspaces','archive-r3.json'),selA,path('tests','archive-case.json')));
 const paImported=run('D2-plan-A-reimport',planArgs(path('bundles','archive-reimport.json'),selA,path('tests','archive-case.json')),0,cleanA);
 const pc=run('D2-plan-C',planArgs(cf2,selC,path('tests','campus-case.json')));
 save(path('plans','archive-technical-plan.json'),pa);save(path('plans','campus-technical-plan.json'),pc);
 assert(!!pa.fingerprint&&pa.fingerprint===paImported.fingerprint,'portable D2 fingerprint equal');
 const rm=pa.mapping??[],rc=rm.find(x=>x.checkId==='module/item-1-read/authorization'),cc=rm.find(x=>x.checkId==='module/item-1-copy/authorization');
 assert(!!rc&&!!cc&&rc.subjectId!==cc.subjectId,'read and copy independent Check subject');
 assert(rc.authority==='unverified-policy'&&cc.authority==='unverified-policy','unknown school policy does not become approval');
 assert(rm.some(x=>x.checkId==='module/item-1-read/scope-trace'),'B01 v2 added check visible in D2');
 const localCopyCheck=rm.find(x=>x.checkId==='module/item-1-copy-local/copy-authorization');
 assert(!!localCopyCheck&&localCopyCheck.subjectId===cc.subjectId,'archive-only copy rule binds precisely to copy subject');
 const gap={sourceMd:froot,locator:'第4节S03-S04；R08-R10行289-291；R29行310',requirement:'合法电子委托和替代证据必须按对象、操作及有效期匹配；R08-R10/R29不得因不支持高级关系被删减。',blockedOperation:'D3轻量模块不能无损编译带合法替代条件的证据关系，不得把缺证件与未核电子凭据一律判否。',owner:'D3',reproduce:'对item-1/read与copy引入条件性电子委托替代关系、分别核source与operation，预览其高级义务不可映射场景。',
  affected:{templateId:'archive-access',templateVersion:1,sourceRequirementIds:['R08','R09','R10','R29'],instancePaths:['module/item-1-read','module/item-1-copy'],checkIds:rm.filter(x=>['module/item-1-read/authorization','module/item-1-copy/authorization','module/item-1-read/scope-trace','module/item-1-evidence/evidence-boundary','module/item-1-copy-local/copy-authorization'].includes(x.checkId)).map(x=>x.checkId),runIds:[]}};
 const gapFile=path('gaps','gap-request.json');save(gapFile,gap);
 const rep=run('D3-report-gap',tool('report-gap',gapFile));save(path('gaps','gap-report.json'),rep);
 assert(rep.status==='tooling-blocked'&&rep.verifiedAgainstRun===false,'gap mapped but not falsely Run-verified');
 const badGap=structuredClone(gap);delete badGap.affected.runIds;
 save(path('gaps','gap-negative.json'),badGap);
 run('negative-gap-validation',tool('report-gap',path('gaps','gap-negative.json')),1);
 run('real-Pi-service-test',['test','--isolate','--timeout','30000','apps/electron/src/main/lib/review/review-d3-pi-integration.test.ts']);
 save(join(base,'module-locks.json'),{B01v1:b1,B01v2:{moduleId:b1.moduleId,version:2,digest:frozenV2.digest},B01v3NegativeOnly:{moduleId:b1.moduleId,version:3,digest:frozen3.digest},B02v1:b2});
 save(path('tests','independent-oracle.json'),{source:froot,sha256:fhash,gold:[
  {case:'archive-read',expect:'B01 binds read; no official approval'},
  {case:'archive-copy',expect:'read authorization never implies copy; independent source and Check'},
  {case:'campus-family',expect:'B01/B02 do not approve campus card'},
  {case:'unknown-policy',expect:'not compliant, not compulsory missing; remains unverified'},
  {case:'upgrade',expect:'A read v2, A copy v1, C v1, historical r1 immutable'}]});
 writeFileSync(join(base,'source-map.md'),'# Original source and responsibility map\n\nOriginal filename: '+froot+'\nOriginal MD SHA256: '+fhash+'\nAvailable to Agent B in user file library; not derived from docs/16 outline.\n\n| Original MD locator | source responsibility | implemented / evidence |\n|---|---|---|\n| lines 289-291 R08-R10 | proxy identity, scoped matter/operation/validity | B01 read/copy separately |\n| line 304 R23 | copy permission not inherited from view | archive-local independent-copy-boundary |\n| line 299 R18 | publication not equal to open | archive-local scope; no shared campus card authority |\n| line 310 R29 | legal alternative electronic proxy evidence | report-gap, not deleted |\n| line 314 R33 | administrative approval pending is not applicant missing evidence | D2 unverified-policy and human gate |\n\nCampus context: repository synthetic C fixture, NOT a verified university card regulation.\n');
 writeFileSync(join(base,'README.md'),'# Independent D3-10 Agent B\n\nCode fixed at d16f047af653f7ba259456807c1fc150e9d0f417. Separate branch test/d3-10-agent-b-cross-business, isolated config '+config+'. Agent A artifacts were not used. This directory contains actual CLI command traces and D1/D2/D3 assets. Synthetic Pi service test is not live online model review. No public D3 code was edited. No official approval.\n');
 writeFileSync(join(base,'verdict.md'),'# Agent B verdict\n\n**PASS on executed CLI checks; NOT-RUN online model; BLOCKED-BY-SOURCE for official in-force university policy.** Fixed code base, real D1 revision chain, shared B01/B02, explicit upgrade and negative signoff, impact CLI, D2 real plan and synthetic Pi-service regression. Exact evidence: run-log and execution-summary. No formal archive permission or D3 Release inferred.\n');
}catch(e){faults.push(String(e?.stack??e));}
finally{
 save(path('tests','execution-summary.json'),{fixedCodeSha:'d16f047af653f7ba259456807c1fc150e9d0f417',bunVersion:Bun.version,onlineModelRun:'not-run',commands:notes,assertions:checks,errors:faults});
 writeFileSync(join(base,'run-log.md'),'# Actual Agent B CLI trace\n\n| # | command | exit | expected | stderr |\n|---|---|---|---|---|\n'+notes.map(x=>'| '+x.number+' | '+x.command+' | '+x.exitCode+' | '+x.expected+' | '+x.stderr+' |').join('\n')+'\n\nErrors:\n'+faults.join('\n')+'\n');
 if(faults.length){writeFileSync(join(base,'verdict.md'),'# Agent B verdict\n\n**FAIL / PARTIAL**, '+checks.filter(x=>x.passed).length+'/'+checks.length+' assertions before blocker. See run-log and execution-summary. Online model NOT-RUN.\n\n'+faults.join('\n'));process.stderr.write(faults.join('\n'));process.exitCode=1;}
}

#!/usr/bin/env python3
"""只从本轮私有证据生成公开脱敏摘要；不访问用户 profile、模型或 Gold。"""
import argparse
import datetime
import hashlib
import json
import platform
import re
import subprocess
from pathlib import Path

p = argparse.ArgumentParser()
p.add_argument('--raw', required=True)
p.add_argument('--out', required=True)
a = p.parse_args()
raw, out = Path(a.raw).resolve(), Path(a.out).resolve()
repo = Path(__file__).resolve().parents[2]
if not raw.name.startswith('local-u1-raw-'):
    raise SystemExit('拒绝非本轮独立证据根目录')
out.mkdir(parents=True, exist_ok=True)
SHA = '1c6deadfc0d51644aed6152463f78fdae662cdb6'
TREE = '987cc106b4952f01231f46698800f4f58f94ed40'
now = datetime.datetime.now(datetime.timezone.utc).isoformat()

def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def read(path):
    return json.loads((raw / path).read_text())

def redact(value):
    if isinstance(value, dict):
        return {k: redact(v) for k, v in value.items()
                if k.lower() not in {'apikey', 'api_key', 'authorization', 'download_url'}}
    if isinstance(value, list):
        return [redact(v) for v in value]
    if isinstance(value, str):
        return value.replace(str(raw), '<PRIVATE_RAW_ROOT>').replace(str(repo), '<AUDIT_WORKTREE>').replace('/home/miku', '<LOCAL_USER>')
    return value

def write(path, data):
    file = out / path
    file.parent.mkdir(parents=True, exist_ok=True)
    file.write_text(json.dumps(redact(data), ensure_ascii=False, indent=2) + '\n')

def copy_json(source, target):
    data = read(source)
    def compact_materialized(item):
        if isinstance(item, dict):
            result = {k: compact_materialized(v) for k, v in item.items()
                      if k not in {'dom', 'qaSourceSha256'}}
            if 'fileId' in result and 'blocks' in result:
                result['blockCount'] = len(result['blocks'])
                result['blocks'] = (result['blocks'][:2] if isinstance(result['blocks'], list)
                                    else dict(list(result['blocks'].items())[:2]))
            return result
        if isinstance(item, list):
            return [compact_materialized(x) for x in item]
        return item
    write(target, {'rawEvidence': ref(source), 'summary': compact_materialized(data)})

def ref(path):
    file = raw / path
    return {'rawPrivateReference': 'private://' + raw.name + '/' + path,
            'sha256': digest(file), 'bytes': file.stat().st_size}

meta = read('remote/metadata.json')
write('candidate-lock.json', {
    'applicationCommit': SHA, 'applicationTree': TREE,
    'basePR': 103, 'parentPR': 101, 'parentHead': '0524604cac13794af5f43cff7771160f98f176d9',
    'branch': 'audit/p06-l02-u1-local-real-r01', 'lockedAt': now,
    'initialInstallWorkingTreeDirty': read('setup/01-install.command.json')['workingTreeDirty'],
    'mergeCommit': 'b2181314b51e4a906324fb491e03e77fea006515', 'mergeTree': TREE,
    'productionDiffFromCandidate': subprocess.check_output(['git', 'diff', SHA, '--', 'apps', 'packages', 'package.json', 'bun.lock'], cwd=repo, text=True),
    'qaSourceHashes': {str(f.relative_to(repo)): digest(f) for f in (repo / 'scripts/qa').glob('p06-u1-*') if f.is_file()},
    'scope': '应用源码冻结；新增 QA 与本轮报告。命令期间 QA 适配导致 workingTreeDirty=true，不声称整树 clean gate。',
    'remoteRefFinal': (raw / 'setup/41-remote-ref-final.stdout.log').read_text(),
})
guard, restore = read('client/guard.json'), read('client/restore.json')
write('environment-redacted.json', {
    'os': platform.platform(), 'uid': subprocess.check_output(['id', '-u'], text=True).strip(),
    'node': subprocess.check_output(['node', '--version'], text=True).strip(),
    'bun': subprocess.check_output(['bun', '--version'], text=True).strip(),
    'git': subprocess.check_output(['git', '--version'], text=True).strip(),
    'applicationVersion': json.loads((repo/'apps/electron/package.json').read_text())['version'],
    'electron': guard['environment']['versions'], 'beforeRestartPid': guard['environment']['pid'],
    'afterRestartPid': restore['environment']['pid'], 'gui': '独立 Xvfb 1600x1000x24，软件渲染；无物理显示器/GPU 跨平台签收',
    'config': '<PRIVATE_RAW_ROOT>/profile/config', 'userData': '<PRIVATE_RAW_ROOT>/profile/user-data',
    'ports': {'vite': 18574, 'rendererCDP': 19222, 'mainInspector': 19230, 'bind': '127.0.0.1'},
    'electronBinary': read('electron-provenance.json'),
    'provider': {'status': 'BLOCKED_ENV', 'authorizedDedicatedChannel': 'NOT_PROVIDED',
                 'credentialsReadFromUserProfile': False, 'ambientCredentialsUsed': False,
                 'diagnosticOnlyChannel': '合成假 key + http://127.0.0.1:1；无真实模型成功回执，不能签 PI_PROVIDER'},
    'io': {'status': 'BLOCKED_ENV', 'classification': 'NOT-RUN_ENV',
           'reason': (raw/'setup/21-safe-mount-capability.stderr.log').read_text(),
           'attempt': ref('setup/21-safe-mount-capability.command.json'), 'enospcAttempted': False},
    'rawRoot': '<PRIVATE_RAW_ROOT>', 'cleanup': read('setup/cleanup-final.json'),
})
write('remote-ci.json', {
    'prs': [{k: v for k, v in pr.items() if k in {'number','head_sha','base_sha','head','base','draft','state','merged','url'}} for pr in meta['prs']],
    'runs': meta['runs'], 'artifacts': meta['artifacts'],
    'currentHeadSpecialized': {'runId': 39092396363, 'artifactId': 12123565948,
        'zipSha256': digest(raw/'remote/controlled.zip'), 'checkoutSha': (raw/'remote/controlled/checkout-sha.txt').read_text().strip(),
        'checkoutTree': (raw/'remote/controlled/checkout-tree.txt').read_text().strip(),
        'commands': (raw/'remote/controlled/commands.tsv').read_text(), 'tests': {'pass':43,'fail':0,'expect':216},
        'office71': read('remote/controlled/office71-repro.json')},
    'standardPRCI': {'runId':39092396304,'actualCheckout':'b2181314b51e4a906324fb491e03e77fea006515',
        'sameTreeVerified':True,'artifactCount':0,'rawJob':ref('remote/job-117571699991.log'),
        'tests':{'pass':3991,'skip':5,'fail':0,'files':458}},
    'concurrencyHistory': [{'id':r['id'],'headSha':r['head_sha'],'name':r['name'],'conclusion':r['conclusion']}
        for r in read('remote/concurrency-history.json')['pr103History']['workflow_runs']],
    'activeAtCheck': len(read('remote/concurrency-history.json')['active']['workflow_runs']),
    'queuedAtCheck': len(read('remote/concurrency-history.json')['queued']['workflow_runs']),
})
for src, target in [
    ('client/prepare-attempt1.json','client/first-attempt.json'),
    ('client/prepare-attempt2.json','client/second-attempt.json'),
    ('client/prepare.json','client/main-import-and-ack.json'),
    ('client/guard.json','client/guard-and-preview.json'),
    ('client/restore.json','client/restart-preview.json'),
    ('client/owner-events-first-failure.json','client/deletion-event-first-failure.json'),
    ('client/owner-events-before-restart.json','client/deleted-lookup-before-restart.json'),
    ('client/owner-events.json','client/deleted-lookup-after-restart.json'),
    ('client/preview-boundaries-first-failure.json','client/preview-policy-first-failure.json'),
    ('client/preview-boundaries.json','client/private-path-boundaries.json'),
    ('profile/materials/office-office.json','office/first-real-parser.json'),
    ('profile/materials/office-office2.json','office/revision-cache.json'),
    ('profile/materials/office-restart.json','office/process-restart.json'),
    ('profile/materials/review-parser.json','office/review-parser.json'),
    ('profile/materials/body-pdf.json','office/pdf-header-body-control.json'),
    ('history-rerun','history/nine-case-rerun.json'),
]:
    copy_json(src, target)

fixtures = [f for d in ['A','B','same'] for f in (raw/'profile/materials'/d).iterdir()]
fixtures += [f for f in (raw/'profile/materials').glob('*.pdf')]
write('input-manifest.json', {'files':[{'path':str(f.relative_to(raw/'profile/materials')), 'sha256':digest(f),'bytes':f.stat().st_size} for f in fixtures]})

commands = []
for f in sorted(raw.rglob('*.command.json')):
    if '/remote/' not in str(f):
        d = json.loads(f.read_text())
        d['commandRecord'] = ref(str(f.relative_to(raw)))
        commands.append(d)
commands.sort(key=lambda d:d['startedAt'])
write('command-ledger.json',commands)
log = out/'commands-summary.txt'
log.parent.mkdir(exist_ok=True)
for old_name in ['commands-summary.log','commands-summary.txt']:
    obsolete_log=out/'logs'/old_name
    if obsolete_log.exists():obsolete_log.unlink()  # 仅删除本摘要器自己的旧命名，不强制 add 被忽略的 logs。
log.write_text('\n'.join(redact(f"{d['startedAt']} .. {d['finishedAt']} {d['name']} exit={d['exitCode']} cwd={d['cwd']} argv={json.dumps(d['argv'],ensure_ascii=False)}") for d in commands)+'\n')

assignments=read('profile/config/review-agent-assignments.json')['assignments']
cases=[]
for f in sorted((raw/'profile/config/review-cases').glob('*/runs-v2/*.json')):
    run=json.loads(f.read_text())
    owned=[x for x in assignments if x.get('caseId')==run['caseId'] and x.get('activeRunId')==run['id']]
    case_file=f.parent.parent/'case.v2.json'
    case_data=json.loads(case_file.read_text()) if case_file.exists() else {}
    state_file=f.parent.parent/'state.v2.json'
    state_data=json.loads(state_file.read_text()) if state_file.exists() else {}
    cases.append({'kind':'NEW_SYNTHETIC_DIAGNOSTIC_NOT_S2_ABC','sourceSha':SHA,'caseId':run['caseId'],'runId':run['id'],
        'inputManifest':run['inputManifest'],'templateVersion':run['templateVersion'],'assignments':owned,
        'status':run['status'],'error':run.get('error'),'checks':run.get('checks'),
        'documentVersions':[{**v,'parseRevision':next((d.get('parseRevision','MISSING') for d in case_data.get('documents',[]) if d.get('versionId')==v['versionId']),'MISSING')} for v in run['inputManifest']['documentVersions']],
        'providerToolWitness':'MISSING_NO_AUTHORIZED_PROVIDER','sourceRefQuoteLocation':'MISSING_NO_MODEL_TOOL_SUBMISSION',
        'providerUsage':'MISSING_NOT_ALLOCATED','decisionCount':len(state_data['decisions']) if isinstance(state_data.get('decisions'),list) else 'MISSING_NOT_IN_STATE',
        'rawRun':ref(str(f.relative_to(raw)))})
write('case-provenance-redacted.json', {'diagnosticCases':cases,
    's2ABC':{'status':'NOT-RUN','caseId':'MISSING_NOT_CREATED','runId':'MISSING_NOT_CREATED','assignmentId':'MISSING_NOT_CREATED','turnId':'MISSING_NOT_CREATED',
             'reason':'S0 未通过；未执行正式 A/B/C 新版三案业务复演。诊断案卷不能冒充 S2。'},
    'historicalNineCases': 'history/nine-case-rerun.json：ARCHIVED，未覆盖历史 identity'})

failures=[
 ('REMOTE_DEFAULT_PRESET_FIRST','HARNESS_INVALID','remote/39091866164/artifact/controlled-tests.log','旧 #103 首败：42 pass/1 fail；无效 presetId=default，非越权成功。另两次相同首败保留。'),
 ('LOCAL_XLSX_WRITER_FIRST','HARNESS_INVALID','material-evidence/10-generate.stderr.log','ESM XLSX.writeFile 没有 fs；改用写入生成的合法 buffer。'),
 ('LOCAL_HISTORY_MISSING_GIT','BLOCKED_ENV','setup/07-history.stderr.log','本地缺历史 Git 对象；fetch 固定两个历史 SHA 后 22-history-fetched exit0。'),
 ('LOCAL_DRIVER_FIRST','HARNESS_INVALID','client/30-client.stderr.log','诊断 require 与旧 Atom 导出假设错误；未产生安全通过结论。'),
 ('LOCAL_ACK_AND_DOM_FIRST','HARNESS_INVALID','client/31-client-harness-corrected.stdout.log','诊断假渠道存在后 ACK 可先取得真实 ownership；RunAgent 错误需 Main observer，文本在 Shadow DOM，XLSX 在 canvas。'),
 ('LOCAL_PRESET_FIRST','HARNESS_INVALID','client/32-client-observed.stdout.log','本地驱动也用了无效 default；改 standard 后三种 guard 实测拒止。'),
 ('LOCAL_TEMPLATE_FIRST','HARNESS_INVALID','client/33-client-final.stdout.log','动态 CDP 表达式缺闭合；后续修正的是驱动字符串，不改变产品断言。'),
 ('LOCAL_DELETE_NOTIFICATION_FIRST','FAIL_PRODUCT','client/owner-events-first-failure.json','真实 Main 删除后未收到撤销；37/39 进一步确认旧 metadata 实际复活普通列表/预览槽。'),
 ('P02_STALE_DELETED_LOOKUP','FAIL_PRODUCT','client/owner-events-before-restart.json','删除后 Main meta=null，旧 lookup 返回非空路径；Renderer sessionPresent=true、preview 非空；重启后重现。未证明审核私有文件泄露。'),
 ('OFFICE71_REAL','BLOCKED_UPSTREAM','material-evidence/12-office-real.stdout.log','合法 Office 解析实测同 stem fileId 碰撞、同字节异路径 stale source；真实 Main 六行与重启复现。'),
 ('PREVIEW_POLICY_FIRST','HARNESS_INVALID','client/preview-boundaries-first-failure.json','普通用户只读预览允许非敏感外部文件；原过严预期不符合 ipc.ts 789–800。44 改测明确审核私有边界，全通过。'),
 ('IO_MOUNT_UNAVAILABLE','BLOCKED_ENV','setup/21-safe-mount-capability.stderr.log','non-root user namespace uid_map 不允许；未创建/填满宿主 tmpfs，ENOSPC 与双故障恢复未运行。'),
 ('EVIDENCE_GENERATOR_FIRST','HARNESS_INVALID','setup/46-evidence-generator-first-failure.stderr.log','摘要器把 blocks 字典当列表切片；修正摘要器后 47 exit0，原始测试结果不变。'),
]
write('known-failures.json', {'failures':[{'id':i,'classification':c,'actual':s,**ref(path)} for i,c,path,s in failures],
    'priorHistoricalEvidencePreserved':['37','38','44','46','55','56','57','58','61','29'],
    'olderU0U1FirstFailures':{'modeFailure':'56 原 U0 #38867959248 artifact #12032580281；未回写',
        'retiredSourceRef':'56 #39067328601 artifact #12114101699，2 fail 原记录未回写'},
    'lossDisclosure':'早期 UI 驱动的截图共用失败文件名，不能按该截图重建每次原像；原始 stdout/stderr、独立命令记录与备份 JSON 仍保留，首败判断使用这些证据。'})

status={
 'O01':('BLOCKED_UPSTREAM','真实 DOCX 同名异源身份碰撞；含段落、表格、反序、改版、进程重启与 Main 物化。'),
 'O02':('BLOCKED_UPSTREAM','真实双 Sheet XLSX/Cell 正常解析，但跨源同名/cross-stem 身份碰撞。'),
 'O03':('BLOCKED_UPSTREAM','真实双页 PPTX 正常解析，但同 stem 索引复用与覆盖。'),
 'O04':('PASS','Main 正文 PDF 有真实文字块；扫描/空页 partial 零文字块，损坏 failed；页眉专门对照，不假造已读。'),
 'O05':('BLOCKED_UPSTREAM','同物理源缓存与改版已执行；多路径同 revision stale source 和 fileId 重用仍存在，重启不消除。'),
 'O06':('BLOCKED_ENV','真实 Office 与审核版本两个空间均有输入；严格 SourceRef 拒绝只有本轮 43 项受控证据，缺合法 provider 工具提交。'),
 'S01':('BLOCKED_ENV','同名版本/位置/quote 受控正例通过；缺本轮合法 Pi 严格读取/提交。'),
 'S02':('BLOCKED_ENV','普通 f1/错 quote/旧版拒止受控通过；缺实际 Pi 跨案、旧 turn 工具回执。'),
 'S03':('BLOCKED_ENV','真实 Main 私有路径/symlink 拒止通过；缺有授权 review_inspect_original 正例。'),
 'S04':('BLOCKED_ENV','缺真实有效 binding 下 await 渲染撤权/改版回执。'),
 'S05':('BLOCKED_ENV','缺真实 Pi SourceRef/coverage 写入见证，不能借预览证明覆盖。'),
 'T01':('BLOCKED_ENV','无合法 provider 成功 turn；五工具最终 SDK registration 尚未见证。'),
 'T02':('BLOCKED_ENV','真实 runAgent 三种缺绑定负例均未进入 Pi query；有效 binding 正例/最终 SDK 外部工具拒止仍缺。'),
 'T03':('BLOCKED_ENV','缺同案合法五工具执行及运行中 revoke/跨案/旧 turn。'),
 'T04':('BLOCKED_ENV','真实 Pi 压缩前后授权不可复活未运行。'),
 'T05':('BLOCKED_ENV','普通 IPC 读取和侧栏正例通过；真实普通 Pi Read 与本地 mock MCP 尚缺。'),
 'P01':('PASS','真实只读侧栏；readOnly=false 输入被强制只读；Tab 类型/数量不变，应用重启后重复通过。'),
 'P02':('FAIL','真实 Main 删除后旧 lookup 复活 Renderer 普通会话及预览槽；Main meta=null；重启后重现。审核 owner 和假 lookup ID 仍正确拒绝。'),
 'P03':('BLOCKED_ENV','真实普通 archive/restore/search/list/meta 正例及 review owner 隐藏已见证；remote 未开启、真实 provider 事件面未完整运行。'),
 'P04':('PASS','三类 Office 与扫描 PDF 实际 UI 渲染；审核私有路径的目录/文件 symlink、parent、rename、假/过期身份 IPC 拒止，重启后 UI 通过。'),
 'P05':('BLOCKED_ENV','未执行有效 provider 的真实 review-run E05 迟到回复；普通已删除 lookup 失败另记 P02。'),
 'P06':('BLOCKED_ENV','Main ACK 有 V2 ownership 的诊断见证；合法模型 stop pending/restart/E03/E04 未运行。'),
 'P07':('BLOCKED_ENV','非 root 有界 tmpfs 前置能力失败；真实 ENOSPC/双失写与故障重启 NOT-RUN_ENV。'),
}
matrix=[]
facts=read('client/facts-private.json')
contract=(repo/'docs/design/review-agent/55-p06-l02-u1-differential-matrix-20261018.md').read_text()
expected={m.group(1):m.group(2).strip() for m in re.finditer(r'^\| ([OSTP]\d\d) \| [^\n]*? \| ([^\n]*?) \| NOT-RUN \|$',contract,re.M)}
for id,(state,actual) in status.items():
    paths=['office/revision-cache.json','client/deleted-lookup-before-restart.json','client/deleted-lookup-after-restart.json'] if id.startswith('O') else ['client/guard-and-preview.json','client/restart-preview.json','client/deleted-lookup-after-restart.json','client/private-path-boundaries.json']
    command='bun scripts/qa/p06-u1-real-materials.ts office2' if id in {'O01','O02','O03','O05'} else 'bun scripts/qa/p06-u1-real-materials.ts body-pdf; bun scripts/qa/p06-u1-real-materials.ts review' if id=='O04' else 'bun scripts/qa/p06-u1-owner-events.mjs' if id=='P02' else 'bun scripts/qa/p06-u1-client.mjs guard / restore; bun scripts/qa/p06-u1-preview-boundaries.mjs'
    if id=='O04':paths=['office/review-parser.json','office/pdf-header-body-control.json','client/deleted-lookup-before-restart.json']
    if id=='P02':paths=['client/deleted-lookup-before-restart.json','client/deleted-lookup-after-restart.json']
    if id=='P07':paths=['environment-redacted.json','command-ledger.json']
    exit_code=1 if id=='P02' else 0 if state in {'PASS','BLOCKED_UPSTREAM'} else None
    matrix.append({'id':id,'sourceSha':SHA,'level':'MAIN_IPC/REAL_PARSER' if state in {'PASS','FAIL','BLOCKED_UPSTREAM'} else 'PARTIAL_MAIN_IPC_WITH_CONTROLLED_ONLY',
        'inputHash':digest(out/'input-manifest.json'),'command':command,'exit':exit_code,
        'environment':'environment-redacted.json',
        'context':{'caseId':facts['caseId'] if id.startswith('P') else 'NOT_APPLICABLE_PARSER_OR_NOT_EXECUTED',
            'sessionId':facts['id'] if id.startswith('P') else 'MISSING_NOT_EXECUTED',
            'runId':'MISSING_NO_REAL_PROVIDER_REVIEW_RUN','assignmentId':'MISSING_NO_ACTIVE_BINDING','turnId':'MISSING_NO_AUTHORIZED_PROVIDER_TURN',
            'sourceRef':'MISSING_NO_STRICT_PI_SUBMISSION','diagnosticRunProvenance':'case-provenance-redacted.json'},
        'commandExits': {'16-body-pdf-control':0,'13-review-real':0,'37-owner-late-actual':1} if id=='O04' else {'37-owner-late-actual':1,'39-owner-after-restart':1} if id=='P02' else {},
        'expected':expected.get(id,'见 55 号对应逐项合同'),'actual':actual,'status':state,
        'evidencePublicPaths':paths,'evidenceSha256':{path:digest(out/path) for path in paths},
        'rawPrivateReference':'private://'+raw.name,'firstFailure':'P02_STALE_DELETED_LOOKUP' if id=='P02' else 'OFFICE71_REAL' if state=='BLOCKED_UPSTREAM' else None,
        'classification': 'PRODUCT_STALE_LOOKUP' if id=='P02' else 'UPSTREAM_OFFICE71' if state=='BLOCKED_UPSTREAM' else 'NOT-RUN_ENV' if id=='P07' else 'MISSING_REAL_PI_SCOPE' if state=='BLOCKED_ENV' else 'SCOPED_REAL_PASS'})
write('u1-matrix.json',{'sourceDocument':55,'itemCount':len(matrix),'rows':matrix})
write('s0-matrix.json',{'rows':[{'id':id,'status':'BLOCKED_ENV','sourceSha':SHA,'actual':text,'required':'63 号完整真实安全合同',
    'rawPrivateReference':'private://'+raw.name,'evidencePublicPaths':['client/guard-and-preview.json','client/main-import-and-ack.json']} for id,text in [
    ('L-M01','真实 Main ownership ACK 子集已见证；合成不可用端点不是合法 provider，未签完整正例。'),
    ('L-T01','缺真实 provider 最终 SDK 五工具注册/调用。'),('L-T02','三种真实 runAgent 缺绑定拒止通过；有效 binding 的运行中撤销/跨案尚缺。'),
    ('L-T03','普通 IPC/Preview 正例通过；真实普通 Pi Read/MCP 未运行。'),('L-S01','真实材料已解析导入；严格 Pi SourceRef 提交未运行。'),
    ('L-S02','真实私有路径拒止通过；有效审核 binding 的 async 撤销未运行。'),('L-P01','普通删除后迟到 lookup 实际 FAIL 见 P02；审核 run 的完整 Renderer 合同未运行。'),
    ('L-P02','有效模型下 stop pending/restart/旧 outcome 未运行。')]]})
write('acceptance-summary.json', {'sourceSha':SHA,'conclusions':{
    'REMOTE_CONTROLLED':{'status':'PASS','scope':'43/43，固定 SHA；标准 PR CI 相同 tree 3991/5/0'},
    'S0_MAIN_IPC_PI':{'status':'NOT-RUN','classification':'BLOCKED_ENV','scope':'真实 Main 子集执行；无合法 provider，完整安全准入未通过'},
    'S1_OFFICE_PREVIEW_IO':{'status':'FAIL','classification':'P02_FAIL_AND_OFFICE71_BLOCKED_UPSTREAM_AND_IO_BLOCKED_ENV'},
    'S2_NEW_SYNTHETIC_C':{'status':'NOT-RUN','classification':'S0_NOT_ADMITTED'},
    'L02-00 EXIT':{'status':'FAIL','classification':'PARTIAL_NOT_ACCEPTED','historicalAttribution':'PASS_9_ARCHIVED_CASES'},
    'L02-01 ENTRY':{'status':'FAIL','classification':'NOT_ADMITTED'},
    },'P06':'PARTIAL','P06-S02':'NOT ACCEPTED','MERGE':'NO-GO','P07/P08':'NOT STARTED',
    'noAuthorityLedgerChanged':True,'noProductionCodeChanged':True})

inventory=[]
for folder in ['setup','client','material-evidence','remote']:
    for f in sorted((raw/folder).rglob('*')):
        if f.is_file():inventory.append({'path':str(f.relative_to(raw)),**ref(str(f.relative_to(raw)))})
for f in fixtures:
    inventory.append({'path':str(f.relative_to(raw)),**ref(str(f.relative_to(raw)))})
write('evidence-index.json',{'generatedAt':now,'raw':inventory,'public':[
    {'path':str(f.relative_to(out)),'sha256':digest(f),'bytes':f.stat().st_size}
    for f in sorted(out.rglob('*')) if f.is_file() and f.name not in {'SHA256SUMS','evidence-index.json'}]})
(out/'SHA256SUMS').write_text(''.join(digest(f)+'  '+str(f.relative_to(out))+'\n' for f in sorted(out.rglob('*')) if f.is_file() and f.name!='SHA256SUMS'))
print(json.dumps({'publicRoot':str(out),'commands':len(commands),'matrixItems':len(matrix),'rawFiles':len(inventory)},ensure_ascii=False))

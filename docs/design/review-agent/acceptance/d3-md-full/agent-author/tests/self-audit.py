#!/usr/bin/env python3
import argparse,hashlib,json,re,pathlib,sys
p=argparse.ArgumentParser();p.add_argument('--source',required=True);p.add_argument('--root',required=True);p.add_argument('--plan');a=p.parse_args()
r=pathlib.Path(a.root);s=pathlib.Path(a.source).read_bytes();cat=json.loads((r/'source-catalog.json').read_text());ledger=json.loads((r/'conversion-ledger.json').read_text());workspace=json.loads((r/'workspaces/archive-r2.json').read_text());errors=[]
if hashlib.sha256(s).hexdigest()!=cat['sourceSha256']:errors.append('source SHA mismatch')
source_ids=set(re.findall(rb'^\|\s*(R\d{2})\s*\|',s,re.M));found={i['id'] for i in cat['requirements']};ledger_ids={i['id'] for i in ledger['requirements']}
if not {x.decode() for x in source_ids}.issubset(found):errors.append('R-index omission')
if found!=ledger_ids:errors.append('catalog/ledger mismatch')
for row in cat['requirements']:
 if row.get('sourceAnchor') and row['sourceAnchor'].encode() not in s:errors.append('missing sourceAnchor '+row['id'])
modules={m['moduleId']:m for m in workspace['definitions']['modules']};expected=set();by_rule={}
for use in workspace['definitions']['templates'][0]['modules']:
 for task in modules[use['moduleId']]['tasks']:
  check='module/'+use['id']+'/'+task['id'];expected.add(check);by_rule.setdefault(task['id'].upper(),set()).add(check)
actual={b['checkId'].split(':',1)[1] for b in workspace['sourceBindings']}
if expected!=actual:errors.append('D1 source binding mismatch')
if a.plan:
 plan=json.loads(pathlib.Path(a.plan).read_text());mapped={i['checkId'] for i in plan['mapping']}
 if mapped!=expected:errors.append('D2 preview Check IDs mismatch')
 if plan['publicationAllowed'] is not False:errors.append('D2 publicationAllowed=true')
else:errors.append('D2 plan NOT-RUN')
print(json.dumps({'status':'PASS' if not errors else 'INCOMPLETE','sourceHash':hashlib.sha256(s).hexdigest(),'RCount':len(source_ids),'catalogCount':len(found),'workspaceProposedChecks':len(expected),'errors':errors},ensure_ascii=False,indent=2))
sys.exit(0 if not errors else 1)

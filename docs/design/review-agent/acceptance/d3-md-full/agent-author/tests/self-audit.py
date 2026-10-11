#!/usr/bin/env python3
"""Private source verification, intentionally optional and outside GitHub Actions."""
import argparse, hashlib, json, pathlib, re, sys
p=argparse.ArgumentParser()
p.add_argument("--source", required=True)
p.add_argument("--root", required=True)
p.add_argument("--plan")
a=p.parse_args()
root=pathlib.Path(a.root)
md=pathlib.Path(a.source).read_bytes()
cat=json.loads((root/"source-catalog.json").read_text(encoding="utf8"))
ledger=json.loads((root/"conversion-ledger.json").read_text(encoding="utf8"))
source_text=md.decode("utf-8-sig")
problems=[]
observed_sha=hashlib.sha256(md).hexdigest()
if observed_sha!=cat["sourceSha256"]: problems.append("source SHA mismatch")
rids=set(re.findall(r"^\s*\|\s*(R\d{2})\s*\|",source_text,re.M))
cat_ids={i["id"] for i in cat["requirements"]}
ledger_ids={i["id"] for i in ledger["requirements"]}
if rids!={("R%02d"%i) for i in range(1,43)}: problems.append("unexpected R01-R42 original table")
if not rids.issubset(cat_ids): problems.append("source rule index incomplete")
if cat_ids!=ledger_ids: problems.append("catalog/ledger index differs")
for item in cat["requirements"]:
    if item.get("sourceAnchor") and item["sourceAnchor"] not in source_text:
        problems.append("original MD anchor not present: "+item["id"])
if a.plan:
    plan=json.loads(pathlib.Path(a.plan).read_text(encoding="utf8"))
    actual={i["checkId"] for i in plan["mapping"]}
    if any(c not in actual for row in ledger["requirements"] for c in row.get("checkIds", [])):
        problems.append("ledger actual checkId absent from plan")
status="PASS" if not problems else "FAIL"
report={
    "sourceHashVerified": observed_sha==cat["sourceSha256"],
    "sourceSha256": observed_sha,
    "originalRuleCount":len(rids),
    "catalogRequirementCount":len(cat_ids),
    "sourceAnchorsVerified":len(cat["requirements"])-len([x for x in problems if x.startswith("original MD anchor")]),
    "planProvided":bool(a.plan),
    "sourceFileCopiedOrUploaded":False,
    "status":status,
    "errors":problems,
}
print(json.dumps(report,ensure_ascii=False,indent=2))
sys.exit(0 if not problems else 1)

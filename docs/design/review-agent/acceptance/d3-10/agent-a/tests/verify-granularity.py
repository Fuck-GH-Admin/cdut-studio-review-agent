#!/usr/bin/env python3
"""P2: independently accountable semantic Check granularity, NOT model accuracy."""
import json, pathlib, sys
root=pathlib.Path(__file__).resolve().parents[1]
read=lambda name: json.loads((root/name).read_text(encoding="utf-8"))
ws2,ws3=read("workspaces/modified.json"),read("workspaces/granular-revision-3.json")
before,after=read("plans/08-modified-plan.json"),read("plans/23-granular-plan.json")
rev2,rev3=read("plans/09-revision-2.json"),read("plans/24-revision-3.json")
diff=read("plans/21-granular-diff.json")
gold=read("tests/granularity-expected.json")
issues=[]
assertion=lambda value,message:issues.append(message) if not value else None
ids=["local/abstract-completeness","local/body-completeness","local/conclusion-completeness"]
assertion(ws2["workspaceId"]==ws3["workspaceId"],"workspace identity drift")
assertion(ws2["revision"]==2 and ws3["revision"]==3,"revision not sequential")
assertion(ws2["sources"]==ws3["sources"],"authority source changed unexpectedly")
assertion(len(ws3["definitions"]["templates"][0]["localTasks"])==3,"task definitions must be three")
assertion(len(before["mapping"])==1 and len(after["mapping"])==3 and len(after["rules"])==3,"per-duty Rule/Check expansion count incorrect")
assertion(set(m["checkId"] for m in after["mapping"])==set(ids),"missing independently addressable check IDs")
assertion(len(set(m["ruleId"] for m in after["mapping"]))==3,"runtime RuleSpec identity collision")
assertion(set(b["checkId"] for b in ws3["sourceBindings"])=={"plain-document@1:"+i for i in ids},"source bindings omit a duty")
assertion(all(m["sourceIds"]==["user-synthetic-spec"] and m["authority"]=="request-scope" for m in after["mapping"]),"unauthorized or lost source mapping")
assertion(all(r["sourceRefIds"]==["user-synthetic-spec"] and r["execution"]=="semantic" for r in after["rules"]),"rule sources or execution type lost")
for term in ("摘要","正文","结论"):
    subset=[r for r in after["rules"] if term in r["title"]]
    assertion(len(subset)==1,term+" requires exactly one rule")
    if subset:
        rule=subset[0]["requirement"]
        for word in ("非空","占位","待核","材料版本","真实出处","不作行政批准"):
            assertion(word in rule, f"{term} requirement lost {word}")
assertion(not ws3["definitions"]["modules"] and not ws3.get("sharedModuleLocks") and not ws3.get("advanced"),"unexpected dependency on module or Claim graph")
assertion(after["fingerprint"]!=before["fingerprint"],"granularity change not fingerprinted")
assertion(after["publicationAllowed"] is False,"technical candidate claims publication eligibility")
assertion(diff["oldRevision"]==2 and diff["newRevision"]==3,"D1 diff revision numbers incorrect")
assertion(diff["changedTemplates"]==["plain-document@1"],"D1 granular responsibility diff not shown")
assertion(not diff["changedSources"] and not diff["changedSharedModuleLocks"],"source/lock drift")
assertion(len(diff["changedBindings"])==4,"three new bindings + one removed binding should be explicitly recorded")
assertion(rev3["parentDigest"]==rev2["digest"] and rev3["digest"]!=rev2["digest"],"D1 revision 3 immutable parent hash broken")
assertion(len(gold)==3 and all(set(item["expectedByCheck"])==set(ids) for item in gold),"gold check denominator incorrect")
assertion(gold[0]["expectedByCheck"]==dict.fromkeys(ids,"compliant"),"positive case gold invalid")
assertion(gold[1]["expectedByCheck"]["local/body-completeness"]=="non-compliant","negative case should fail only the body")
assertion(gold[2]["expectedByCheck"]["local/body-completeness"]=="awaiting-confirmation","unknown body must remain unknown")
report={"ok":not issues,"issues":issues,"oldCheckCount":len(before["mapping"]),"newCheckCount":len(after["mapping"]),
 "newCheckIds":ids,"ruleIds":{m["checkId"]:m["ruleId"] for m in after["mapping"]},
 "sourceIds":["user-synthetic-spec"],"newFingerprint":after["fingerprint"],"rev3Digest":rev3["digest"],
 "rev3ParentDigest":rev3["parentDigest"],"piOnlineSemanticInference":"not-run"}
(root/"plans/granularity-summary.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print(json.dumps(report,ensure_ascii=False,indent=2))
sys.exit(0 if not issues else 1)

#!/usr/bin/env python3
"""Independent GOLD oracle + plan structural assertions, NOT a Pi semantic reviewer."""
import json, pathlib, re, sys
p = pathlib.Path(__file__).resolve().parents[1]
def read(name): return json.loads((p/name).read_text(encoding="utf-8"))
old=read("plans/03-initial-plan.json")
new=read("plans/08-modified-plan.json")
again=read("plans/14-reimported-plan.json")
diff=read("plans/06-d1-diff.json")
rev1=read("plans/04-revision-1.json")
rev2=read("plans/09-revision-2.json")
case=read("tests/cases.json")
issues=[]
def check(ok,message):
  if not ok:issues.append(message)
key="local/heading-coverage"
check(len(old.get("rules",[]))==1 and len(new.get("rules",[]))==1 and len(again.get("rules",[]))==1,"task count not 1")
check(len(old.get("mapping",[]))==1 and len(new.get("mapping",[]))==1,"check mapping count not 1")
check(old["mapping"][0]["checkId"]==key==new["mapping"][0]["checkId"],"check ID changed or lost")
check(old["mapping"][0]["sourceIds"]==new["mapping"][0]["sourceIds"]==["user-synthetic-spec"],"source binding changed")
check(new["mapping"][0].get("authority")=="request-scope","synthetic rule authority changed")
check(new["rules"][0]["sourceRefIds"]==["user-synthetic-spec"],"source on RuleSpec not maintained")
for term in ["摘要","正文","结论"]:
  check(term in old["rules"][0]["requirement"] and term in new["rules"][0]["requirement"],f"original duty removed: {term}")
for term in ["非空","占位","待核","真实出处","材料版本","不作行政批准"]:
  check(term in new["rules"][0]["requirement"],f"new obligation/boundary missing: {term}")
check(old["rules"][0]["requirement"]!=new["rules"][0]["requirement"],"semantic rule text unchanged")
check(old["fingerprint"]!=new["fingerprint"],"plan fingerprint did not change after modification")
check(again["fingerprint"]==new["fingerprint"],"clean import fingerprint mismatch")
check(again["rules"]==new["rules"] and again["mapping"]==new["mapping"],"import changed Rule/Check/Source")
check(all(x.get("publicationAllowed") is False for x in [old,new,again]),"unexpected publish eligibility")
check(diff.get("oldRevision")==1 and diff.get("newRevision")==2,"incorrect revision diff")
check(diff.get("changedTemplates")==["plain-document@1"],"template diff not precise")
check(not diff.get("changedSources") and not diff.get("changedBindings") and not diff.get("changedSharedModuleLocks"),"unintended source or lock modifications")
check(rev1["digest"]!=rev2["digest"] and rev2["parentDigest"]==rev1["digest"],"revision digest / parent chain wrong")
headings=["摘要","正文","结论"]
def gold_oracle(text):
  found=list(re.finditer(r"^(摘要|正文|结论)\s*$",text,re.MULTILINE))
  by={}
  for i,m in enumerate(found):
    end=found[i+1].start() if i+1<len(found) else len(text)
    by[m.group(1)]=text[m.end():end].strip()
  if any(x not in by for x in headings): return "non-compliant"
  if any("[UNREADABLE:" in by[x] for x in headings): return "needs-confirmation"
  if any(not by[x] or by[x] in ("待填写","待补充","TODO") for x in headings): return "non-compliant"
  return "compliant"
oracle=[]
for z in case:
  actual=gold_oracle(z["text"])
  oracle.append({"id":z["id"],"independentExpected":z["expected"],"oracleActual":actual,"matches":actual==z["expected"],"piExecution":"not-run","reason":"D2 preview compiles a task plan, it does not ingest or semantically judge test text"})
  check(actual==z["expected"],"independent oracle disagrees: "+z["id"])
report={"planContractPass":len(issues)==0,"errors":issues,"baseline":{"revision":old["revision"],"fingerprint":old["fingerprint"],"ruleCount":len(old["rules"])},"modified":{"revision":new["revision"],"fingerprint":new["fingerprint"],"ruleCount":len(new["rules"])},"restored":{"fingerprint":again["fingerprint"],"equalToModified":again["fingerprint"]==new["fingerprint"]},"ruleMapping":new["mapping"],"revisionDigestChain":{"first":rev1["digest"],"second":rev2["digest"],"secondParent":rev2["parentDigest"]},"syntheticCases":oracle,"actualPiMaterialReview":"not-run"}
(p/"plans/summary.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
(p/"tests/actual-results.json").write_text(json.dumps(oracle,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print(json.dumps({"planContractPass":report["planContractPass"],"errors":issues,"cases":oracle},ensure_ascii=False,indent=2))
sys.exit(0 if not issues else 1)

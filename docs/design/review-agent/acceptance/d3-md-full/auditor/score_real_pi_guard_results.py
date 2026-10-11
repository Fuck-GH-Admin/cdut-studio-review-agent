#!/usr/bin/env python3
"""After actual Pi receipts, evaluate ONLY observable tool guards against independent
B cases. Do not score business semantic understanding from all-pending tool receipts."""
import argparse
import json
import pathlib
import sys

def read(path):
    return json.loads(path.read_text(encoding="utf-8"))

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--pi-dir",type=pathlib.Path,required=True)
    ap.add_argument("--oracle-root",type=pathlib.Path,required=True)
    ap.add_argument("--crosswalk",type=pathlib.Path,required=True)
    ap.add_argument("--output",type=pathlib.Path,required=True)
    x=ap.parse_args()
    gold={r["caseId"]:r for r in read(x.oracle_root/"tests/expected/archive-expectations.json")["expected"]}
    source_cases={r["caseId"]:r for r in read(x.oracle_root/"tests/cases/archive-cases.json")["cases"]}
    summary=read(x.pi_dir/"summary.json")
    crosswalk=read(x.crosswalk)
    errors=[]
    ids=["Q02","Q11","Q13","Q20"]
    if summary["executedBCaseIds"]!=ids:errors.append("actual source case IDs drift")
    records=[]
    for case_id in ids:
        r=read(x.pi_dir/(case_id+"-real-receipt.json"))
        if r.get("bCaseId")!=case_id:errors.append(f"{case_id}: B input mismatch")
        if not r.get("realCaseId") or not r.get("realRunId"):errors.append(f"{case_id}: real Pi case/run missing")
        if r.get("actualChecks")!=77 or r.get("pendingChecks")!=77:errors.append(f"{case_id}: incorrect real Run check count")
        if not r.get("verification",{}).get("complete"):errors.append(f"{case_id}: D2 Pi Run verification incomplete")
        if r.get("negativeAttempt",{}).get("accepted")!=0 or not r.get("negativeAttempt",{}).get("rejected"):errors.append(f"{case_id}: false copy compliance not rejected")
        if "逐操作" not in str(r.get("copyGuard")) or "逐操作" not in str(r.get("crossItemGuard")):errors.append(f"{case_id}: operation evidence scope guard not proven")
        if not r.get("realSourceRef",{}).get("documentVersionId"):errors.append(f"{case_id}: source document reference absent")
        if r.get("authoredTemplateTargetCount")!=8:errors.append(f"{case_id}: A plan not exact fixed target baseline")
        records.append({
            "caseId":case_id,
            "sourceGoldDutyIds":gold[case_id]["sourceRequirementIds"],
            "goldForbiddenMisjudgment":gold[case_id]["forbiddenMisjudgment"],
            "bOriginalOperationCount":sum(len(z["operations"]) for z in source_cases[case_id]["archiveItems"]),
            "actualAOperationTargetsFixed":5,
            "actualCaseId":r["realCaseId"],"actualRunId":r["realRunId"],
            "actualCheckCount":r["actualChecks"],"realSourceVersionId":r["realSourceRef"]["documentVersionId"],
            "crossOperationNegativeGuard":"PASS", "unverifiedPolicyBoundary":"PASS",
            "goldBusinessExpectedOutcomesMet":"NOT-SCORED",
            "whyNotScored":"Case-level B operation/object identities were not instantiated by A, and synthetic tool caller submitted pending-only predetermined receipts, not model judgments.",
        })
    dynamic=read(x.pi_dir/"Q02-dynamic-target-refusal.json")
    if "D2_SCOPE_MISSING" not in dynamic.get("actualCompilerError",""):
        errors.append("real dynamic target selection was not proven fail-closed")
    if dynamic.get("actualD2DynamicCaseCreated") is not False:
        errors.append("dynamic target incorrectly claimed installed")
    if crosswalk.get("technicalConsistency")!="PASS" or len(crosswalk.get("sourceDutyCrosswalk",[]))!=103:
        errors.append("full third-party crosswalk not present or invalid")
    if any(z.get("businessSemanticEquivalenceCertified") is not False for z in crosswalk["sourceDutyCrosswalk"]):
        errors.append("some duties were prematurely certified")
    report={
        "schemaVersion":1,
        "verification":"PASS-TOOL-GUARDS-ONLY" if not errors else "FAIL",
        "agentA":"f8d95c4f7fe995ee55cbdfe15f16e95f514c0333",
        "agentB":"fbf0ee1e072f790e1d7957cfef80d869d6b5aa91",
        "goldDesignCasesTotal":len(gold),"sourceDutiesTracked":len(crosswalk["sourceDutyCrosswalk"]),
        "realPiCaseRunCount":len(records),"actualGoldSemanticCasesGraded":0,
        "dynamicSubjectTemplateCompatible":False,
        "dynamicFailure":dynamic,
        "observedGuardResults":records,
        "semanticModelRun":"NOT-RUN",
        "realInstitutionalAuthority":"NOT-VERIFIED",
        "nextRequired":"First author a dynamic case/item/operation binding mechanism; then replay B gold scenarios without extra fixed targets, and grade non-pending decisions against held-out expectations.",
        "errors":errors
    }
    x.output.parent.mkdir(parents=True,exist_ok=True)
    x.output.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps({k:v for k,v in report.items() if k not in ("observedGuardResults","dynamicFailure")},ensure_ascii=False,indent=2))
    return 0 if not errors else 1

if __name__=="__main__":
    sys.exit(main())

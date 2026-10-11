#!/usr/bin/env python3
"""Read-only third-party A/B business coverage audit.
A and B are pinned, independently authored inputs. No source MD is hosted in CI.
This gate passes iff the reported PARTIAL verdict is EVIDENCE-BASED; it does NOT
certify full business equivalence or online model accuracy.
"""
import argparse
import collections
import hashlib
import json
import pathlib
import re
import sys

SOURCE_SHA = "65157e002dd4d1ccc08d32d341b4a1f7eacfc55d6a3c13a5da949aaf122f9785"
A_SHA = "f8d95c4f7fe995ee55cbdfe15f16e95f514c0333"
B_SHA = "fbf0ee1e072f790e1d7957cfef80d869d6b5aa91"
BASE_SHA = "6747de44b1d8b6dcf673750ced96ce2edb1cbfdd"
BLOCKED_IN_RUNTIME = {"R24", "R29", "R40"}
# Independently identified *candidate* semantic associations, not gold Check bindings.
# Reviewers must assess actual RuleSpec applicability and test outcomes before signoff.
P_CANDIDATES = {
 "P01": ["X01", "R35"], "P02": ["R04"], "P03": ["X07"],
 "P04": ["R18"], "P05": ["X03"], "P06": ["X02", "R32"],
 "P07": ["X05", "R33"], "P08": ["X08", "R35"],
 "P09": ["X04", "R37"], "P10": ["X06", "R36"],
 "P11": ["R38"], "P12": ["X10", "R39"],
 "P13": ["R34"], "P14": ["R42"],
 "P15": ["R34", "R37"], "P16": ["R02"],
}

def read(path):
    return json.loads(pathlib.Path(path).read_text(encoding="utf-8"))

def keys(d):
    return set(d)

def audit(a_root, b_root, actual_plan, original=None):
    error = []
    def require(ok, msg):
        if not ok:
            error.append(msg)
    ca = read(a_root / "source-catalog.json")
    la = read(a_root / "conversion-ledger.json")
    wa = read(a_root / "workspaces/archive-r2.json")
    cb = read(b_root / "source-catalog.json")
    gb = read(b_root / "independent-oracle.json")
    eb = read(b_root / "tests/expected/archive-expectations.json")
    ib = read(b_root / "tests/cases/archive-cases.json")
    plan = read(actual_plan)
    require(all(x["sourceSha256"] == SOURCE_SHA for x in (ca,la,cb,gb,eb)), "source SHA disagreement")
    require(ca["sourceMd"] == cb["sourceMd"] == la["sourceMd"], "source identity disagreement")
    require(wa["workspaceId"] == la["workspaceId"] == plan["workspaceId"], "workspace mismatch")
    require(la["templateId"] == plan["templateId"], "template mismatch")
    require(la["planFingerprint"] == plan["fingerprint"], "actual compiler fingerprint differs from authored ledger")
    require(plan.get("publicationAllowed") is False, "plan unexpectedly allowed publication")
    require(len(wa.get("sharedModuleLocks",[])) == 0, "unreviewed shared locks")
    arows = {v["id"]:v for v in ca["requirements"]}
    al = {v["id"]:v for v in la["requirements"]}
    brows = {v["id"]:v for v in cb["requirements"]}
    gold = {v["id"]:v for v in gb["requirements"]}
    require(len(arows) == len(ca["requirements"]) == 54, "A original 54 accountabilities drifted")
    require(len(brows) == len(cb["requirements"]) == len(gold) == 103, "B independent 103 duties drifted")
    require(keys(arows) == keys(al), "A author source catalog vs ledger not 1:1")
    require(keys(brows) == keys(gold), "B oracle source catalog/gold mismatch")
    a_r = {f"R{i:02}" for i in range(1,43)}
    require(a_r.issubset(arows) and a_r.issubset(brows), "original R01-R42 discrepancy")
    require(all(arows[r]["purpose"].split("：")[0] in (brows[r].get("purpose") or "") or
                (arows[r].get("sourceAnchor") or "").startswith(f"| {r} |") for r in a_r),
            "original R labels disagree")
    for prefix, num, a_field in (("B",15,"branches"),("S",14,"materialSlots"),("E",16,"exceptions")):
        expected = {f"{prefix}{i:02}" for i in range(1,num+1)}
        require(expected.issubset(brows), f"B independent {prefix} missing")
        author_ids = {x["id"] for x in ca[a_field]}
        require(author_ids == expected, f"A {a_field} missing: {sorted(expected-author_ids)}")
    require({f"P{i:02}" for i in range(1,17)}.issubset(brows), "B prose invariants missing")
    require({f"X{i:02}" for i in range(1,13)}.issubset(arows), "A prose invariants missing")
    require(len(wa["sourceBindings"]) == 77, "source binding count changed")
    mappings = plan["mapping"]
    check_to_plan = {x["checkId"]:x for x in mappings}
    require(len(mappings) == len(check_to_plan) == len(plan["rules"]) == 77, "actual 77 Check plan inconsistent")
    bound_ids = {x["checkId"].split(":",1)[-1] for x in wa["sourceBindings"]}
    require(keys(check_to_plan) == bound_ids, "actual plan Checks do not match authored SourceBinding IDs")
    plan_rules = {x["id"]:x for x in plan["rules"]}
    actual_by_r = collections.defaultdict(list)
    authority_counts = collections.Counter(x["authority"] for x in mappings)
    for checkid, m in check_to_plan.items():
        match = re.search(r"/r([0-9]{2})$",checkid)
        require(bool(match), f"unknown mapped Check id: {checkid}")
        if match:
            actual_by_r["R"+match.group(1)].append(checkid)
        require(m["ruleId"] in plan_rules, f"Check missing linked real RuleSpec: {checkid}")
        require(bool(m.get("sourceIds")), f"Check has no source IDs: {checkid}")
    require(keys(actual_by_r) == a_r-BLOCKED_IN_RUNTIME,
            f"actual R coverage drift: {sorted(keys(actual_by_r))}")
    for rule in a_r:
        require(set(al[rule]["checkIds"]) == set(actual_by_r.get(rule,[])),
                f"author ledger inaccurately records actual compiled Checks for {rule}")
    for rule in BLOCKED_IN_RUNTIME:
        require(al[rule]["status"] == "tooling-blocked" and bool(al[rule].get("gapId")), f"{rule} silently absent")
    require(authority_counts == {"request-scope":21,"unverified-policy":56},
            f"source authority drift: {dict(authority_counts)}")
    require(len(plan["targets"]) == 8, "actual target count drift")
    require(any(x.get("operation") == "copy" for x in plan["targets"]),"missing copy")
    require(not any(x.get("operation") == "certified_copy" for x in plan["targets"]),
            "certified_copy assumption changed; revisit scope conclusions")
    requires_full_pi = [x for x in al.values() if x.get("status")=="implemented-and-tested"]
    require(not requires_full_pi, "claim of tested business rules without audit provenance")
    cases = {x["caseId"]:x for x in ib["cases"]}
    expected = {x["caseId"]:x for x in eb["expected"]}
    require(len(cases) == len(expected) == 30 and keys(cases)==keys(expected),
            "B case/expected mismatch")
    full_oracle_coverage = set().union(*(set(x["sourceRequirementIds"]) for x in expected.values()))
    require(full_oracle_coverage == keys(brows), "B source duty coverage missing tests")
    require(all(x["runStatus"] == "NOT-RUN" and not x["runEvidenceRefs"] for x in expected.values()),
            "false claim of 30 Pi Case/Run executions")
    assert_test_gold_separation = all(not(set(case) & {"expected","expectedOutcome","gold","oracle","sourceRequirementIds"}) for case in cases.values())
    require(assert_test_gold_separation, "B gold leaked into synthetic input cases")
    verified_source = False
    if original:
        verified_source = hashlib.sha256(pathlib.Path(original).read_bytes()).hexdigest()==SOURCE_SHA
        require(verified_source, "private original source SHA mismatch")
    # Map frozen actual Check IDs to author-owned task wording. A B/S/E mention in
    # task.requirement means author included the label, NOT execution of condition.
    author_task_text = {}
    module_defs = {m["moduleId"]:m for m in wa["definitions"]["modules"]}
    for instance in wa["definitions"]["templates"][0]["modules"]:
        module = module_defs[instance["moduleId"]]
        for task in module["tasks"]:
            cid = "module/" + instance["id"] + "/" + task["id"]
            require(cid in check_to_plan or task["id"].upper() in BLOCKED_IN_RUNTIME,
                    "author task without traceable compiled or documented blocked source ID: " + cid)
            author_task_text[cid] = str(task.get("requirement",""))
    check_mentions = collections.defaultdict(list)
    for cid, task_text in author_task_text.items():
        if cid not in check_to_plan:
            continue
        for match in re.finditer(r"(?<![A-Z0-9])([BSE]\d{2})(?![A-Z0-9])",task_text):
            check_mentions[match.group(1)].append(cid)
    case_links = collections.defaultdict(list)
    for case_id, gold_case in expected.items():
        for duty_id in gold_case["sourceRequirementIds"]:
            case_links[duty_id].append(case_id)
    # We CAN establish bookkeeping, but NOT assert operational gold compliance.
    rows = []
    for duty in cb["requirements"]:
        id = duty["id"]
        row = {
            "sourceDutyId":id,
            "kind":duty["kind"],
            "sourceLocator":duty.get("locator"),
            "sourceAnchor":duty.get("sourceAnchor"),
            "independentExpectedCaseIds":sorted(case_links[id]),
            "oracleRequires":gold[id].get("checkRequirement"),
            "runtimeGoldCrossTest":"NOT-RUN",
            "businessSemanticEquivalenceCertified":False,
        }
        if id.startswith("R"):
            entry = al[id]
            check_ids = sorted(actual_by_r.get(id,[]))
            row.update({
                "authorStatus":entry["status"],"compiledCheckIds":check_ids,
                "compiledSubjects":sorted({check_to_plan[c].get("subjectId") or "CASE" for c in check_ids}),
                "actualRuleIds":[check_to_plan[c]["ruleId"] for c in check_ids],
                "actualSourceIds":sorted({sid for c in check_ids for sid in check_to_plan[c]["sourceIds"]}),
                "actualAuthorityLevels":sorted({check_to_plan[c]["authority"] for c in check_ids}),
                "authorGapId":entry.get("gapId"),
                "bindingEvidenceLevel":"compiled-text-check-only" if check_ids else "registered-gap-no-compiled-check",
            })
        elif id.startswith(("B","S","E")):
            source_field={"B":"branches","S":"materialSlots","E":"exceptions"}[id[0]]
            inventory={x["id"]:x for x in ca[source_field]}
            candidate_checks=sorted(set(check_mentions[id]))
            row.update({
                "authorInventoryPresent":id in inventory,
                "authorInventoryValue":inventory.get(id),
                "candidateCheckIdsMentioningSourceDuty":candidate_checks,
                "textMentionCount":len(candidate_checks),
                "textOnlyNotConditionallyExecuted":True,
                "authorRepresentation":"inventory plus task wording; activation/substitution/exception behavior NOT VERIFIED",
                "bindingEvidenceLevel":"text-reference-not-structured-execution" if candidate_checks else "inventory-only-no-Check-text-reference",
            })
        elif id.startswith("P"):
            candidates=P_CANDIDATES.get(id,[])
            candidate_checks=sorted({
                c for cid in candidates for c in
                (al.get(cid,{}).get("checkIds") or al.get(cid,{}).get("associatedCompiledCheckIds") or [])
                if c in check_to_plan
            })
            row.update({
                "candidateAuthorCorrespondence":candidates,
                "candidateCheckIds":candidate_checks,
                "candidateOnly":True,
                "authorDispositions":[{"id":cid,"status":al.get(cid,{}).get("status"),"gapId":al.get(cid,{}).get("gapId")} for cid in candidates],
                "bindingEvidenceLevel":"independent-semantic-review-needed",
            })
        rows.append(row)
    status_counts=collections.Counter(x["status"] for x in al.values())
    crosswalk_counts={
        "compiledRCount":sum(bool(r.get("compiledCheckIds")) for r in rows if r["sourceDutyId"].startswith("R")),
        "blockedRCount":sum(r.get("authorStatus")=="tooling-blocked" for r in rows if r["sourceDutyId"].startswith("R")),
        "nonRWithTaskTextReference":sum(bool(r.get("candidateCheckIdsMentioningSourceDuty")) for r in rows if r["sourceDutyId"].startswith(("B","S","E"))),
        "nonRInventoryOnly":sum(not bool(r.get("candidateCheckIdsMentioningSourceDuty")) for r in rows if r["sourceDutyId"].startswith(("B","S","E"))),
        "nonRInventoryOnlyIds":[r["sourceDutyId"] for r in rows if r["sourceDutyId"].startswith(("B","S","E")) and not r.get("candidateCheckIdsMentioningSourceDuty")],
        "candidatePCount":sum(r["sourceDutyId"].startswith("P") for r in rows),
        "goldCasesWithActualSemanticScoring":0,
    }
    report = {
        "schemaVersion":1,"auditor":"third-party isolated fixed-SHA GitHub Actions",
        "fixed":{"baseSha":BASE_SHA,"agentASha":A_SHA,"agentBSha":B_SHA,
                 "sourceSha256":SOURCE_SHA},
        "inputOriginalMdPresent":bool(original),
        "sourceHashVerifiedThisCI":verified_source,
        "technicalConsistency":"PASS" if not error else "FAIL",
        "businessConversionVerdict":"PARTIAL - DO NOT MERGE OR CERTIFY",
        "why":"Structural mapping is verified; complete independent duty/branch/exception semantics and 30 expected case outcomes have NOT been run through this Agent A template/Pi.",
        "A":{"originalR":42,"catalogAccountabilities":len(arows),"inventoriedBranches":len(ca["branches"]),
             "inventoriedSlots":len(ca["materialSlots"]),"inventoriedExceptions":len(ca["exceptions"]),
             "narrativeDuties":12,"planChecks":len(mappings),"compiledR":len(actual_by_r),
             "uninstantiatedR":sorted(BLOCKED_IN_RUNTIME),
             "partialToolingBlockedRWithTextChecks":sorted(x["id"] for x in al.values() if x["id"].startswith("R") and x["status"]=="tooling-blocked" and x["checkIds"]),
             "authorityCounts":dict(authority_counts),"goldCrossCasesExecuted":0,
             "actualArchivePiRun":"NOT-RUN","sharedFrozenModulesUsed":0},
        "B":{"goldResponsibilities":len(brows),"oracleCases":len(cases),
             "goldDutyCoverage":len(full_oracle_coverage),"executedAgainstATemplate":0,
             "fullSourceVerifiedThisCI":verified_source},
        "criticalOpenChecks":[
            "A's 15 branches/14 material slots/16 exception records exist, but are not individually verified as runtime-active condition/evidence/exception behavior",
            "B's 16 prose invariants differ in granularity from A's 12 X-invariants; P-to-R/X candidate correspondences are not proven operational",
            "R24/certified_copy, R29/electronic legal authorization, R40/reasonable substitute have no compiled Check",
            "A's 12 partly-tooling-blocked R duties have compiled textual Check but lack proven structured condition/phase/evidence execution",
            "30 independent B synthetic expected cases have not been executed by A's archive-specific Pi Case/Run",
            "Current CDUT policy sources and authorized formal decisions not verified",
        ],
        "crosswalkCounters":crosswalk_counts,
        "sourceDutyCrosswalk":rows,
        "errors":error,
    }
    return report

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--author",type=pathlib.Path,required=True)
    ap.add_argument("--oracle",type=pathlib.Path,required=True)
    ap.add_argument("--plan",type=pathlib.Path,required=True)
    ap.add_argument("--source",type=pathlib.Path)
    ap.add_argument("--output",type=pathlib.Path,required=True)
    x=ap.parse_args()
    report=audit(x.author,x.oracle,x.plan,original=x.source)
    x.output.parent.mkdir(parents=True,exist_ok=True)
    x.output.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    summary={k:v for k,v in report.items() if k not in ("sourceDutyCrosswalk",)}
    print(json.dumps(summary,ensure_ascii=False,indent=2))
    return 0 if not report["errors"] else 1

if __name__ == "__main__":
    sys.exit(main())

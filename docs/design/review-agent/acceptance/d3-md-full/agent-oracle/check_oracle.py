#!/usr/bin/env python3
"""Independent Agent B oracle self-test. This is not a D2/Pi correctness claim."""
import argparse
import hashlib
import json
import re
import sys
from pathlib import Path

SHA = "65157e002dd4d1ccc08d32d341b4a1f7eacfc55d6a3c13a5da949aaf122f9785"
COUNTS = {"R": 42, "B": 15, "S": 14, "E": 16, "P": 16}
DISALLOWED_INPUT_KEYS = {"expected", "expectedOutcome", "expectedReason", "mustActivate", "mustNotActivate", "forbiddenMisjudgment", "sourceRequirementIds", "gold", "oracle"}
def load(path):
    return json.loads(path.read_text(encoding="utf-8"))
def keys(o):
    return set(o) if isinstance(o, dict) else set()
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", type=Path, default=Path(__file__).resolve().parent)
    ap.add_argument("--source", type=Path, help="PRIVATE unmodified source; optional in public CI")
    ap.add_argument("--output", type=Path)
    args = ap.parse_args()
    root = args.root
    errors, warnings = [], []
    def fail(s): errors.append(s)
    try:
        cat = load(root/"source-catalog.json")
        gold = load(root/"independent-oracle.json")
        matrix = load(root/"branch-matrix.json")
        inputs = load(root/"tests/cases/archive-cases.json")
        expected = load(root/"tests/expected/archive-expectations.json")
    except (OSError, ValueError) as e:
        print(json.dumps({"gate": "FAIL", "errors": [str(e)]}, ensure_ascii=False))
        return 1
    docs = [cat, gold, matrix, expected]
    if any(d.get("sourceSha256") != SHA for d in docs):
        fail("catalog, oracle, matrix, expected SHA mismatch")
    catalog_rows = cat.get("requirements", [])
    oracle_rows = gold.get("requirements", [])
    ids = [r.get("id") for r in catalog_rows]
    gids = [r.get("id") for r in oracle_rows]
    if len(ids) != len(set(ids)) or len(gids) != len(set(gids)):
        fail("duplicate requirement IDs")
    if set(ids) != set(gids):
        fail("catalog and oracle disagree on responsibilities")
    if cat.get("scope") != "full":
        fail("source catalog must be full-scope")
    for prefix, n in COUNTS.items():
        actual = {r for r in ids if isinstance(r, str) and re.fullmatch(prefix + r"\d\d", r)}
        intended = {prefix + f"{i:02d}" for i in range(1,n+1)}
        if actual != intended:
            fail(f"{prefix} duties incomplete: missing={sorted(intended-actual)} extra={sorted(actual-intended)}")
    if len(ids) != sum(COUNTS.values()):
        fail("unexpected total responsibility count")
    for row in catalog_rows:
        if not all(isinstance(row.get(k),str) and row[k].strip() for k in ("id","sourceAnchor","locator","purpose")):
            fail(f"missing source anchor/locator/purpose: {row.get('id')}")
    for row in oracle_rows:
        if not all(row.get(k) for k in ("id","expectedBehavior","criticalCounterexample","activation","unknownPolicy","authorityPolicy","checkRequirement")):
            fail(f"incomplete independent gold contract: {row.get('id')}")
        if row.get("requiredCheckIds"):
            fail(f"{row.get('id')} pre-filled Check ID before independent cross-acceptance")
        if row.get("bindingStatus") != "UNBOUND":
            fail(f"{row.get('id')} prematurely bound")
    testcases = inputs.get("cases", [])
    answers = expected.get("expected", [])
    cases_by_id = {c.get("caseId"):c for c in testcases}
    ans_by_id = {a.get("caseId"):a for a in answers}
    if len(cases_by_id) != len(testcases) or len(ans_by_id) != len(answers) or set(cases_by_id) != set(ans_by_id):
        fail("case/expected pairing is not bijective")
    if len(testcases) < 20:
        fail("minimum 20 adversarial synthetic cases expected")
    all_covered = set()
    for cid, case in cases_by_id.items():
        if not case.get("synthetic"):
            fail(f"{cid}: must explicitly use fictitious material")
        if DISALLOWED_INPUT_KEYS & keys(case):
            fail(f"{cid}: gold keys leaked to model-facing case")
        op_keys = []
        for item in case.get("archiveItems",[]):
            for op in item.get("operations",[]):
                op_keys.append(item["itemId"]+"/"+op["operationId"])
        if len(op_keys) != len(set(op_keys)):
            fail(f"{cid}: duplicate item/operation key")
        ex = ans_by_id.get(cid, {})
        observed = ex.get("operationResults", {})
        if set(observed) != set(op_keys):
            fail(f"{cid}: expectation missing/extra operation: {set(op_keys)^set(observed)}")
        duties = set(ex.get("sourceRequirementIds",[]))
        all_covered |= duties
        if not duties <= set(ids):
            fail(f"{cid}: unknown source duties {duties-set(ids)}")
        if not ex.get("forbiddenMisjudgment") or not ex.get("sourceLocators"):
            fail(f"{cid}: missing negative assertion or raw-MD locator")
        if ex.get("runStatus") != "NOT-RUN" or ex.get("runEvidenceRefs"):
            fail(f"{cid}: unexecuted synthetic case claims execution")
        if set(ex.get("mustNotActivate",[])) & set(ex.get("mustActivate",[])):
            fail(f"{cid}: contradictory activation expectation")
    if not {f"R{i:02d}" for i in range(1,43)} <= all_covered:
        fail("R01-R42 not covered by cases")
    if len(matrix.get("branches",[])) != 15 or len(matrix.get("materialSlots",[])) != 14 or len(matrix.get("antiFalseRejection",[])) != 16:
        fail("branch/material/exception matrix count mismatch")
    source_verified = False
    if args.source:
        try:
            raw = args.source.read_bytes()
            source_verified = hashlib.sha256(raw).hexdigest() == SHA
            if not source_verified:
                fail("PRIVATE raw source SHA mismatch")
            else:
                text = raw.decode("utf-8-sig")
                for row in catalog_rows:
                    if row["sourceAnchor"] not in text:
                        fail(f"{row['id']}: source anchor absent in original Markdown")
                source_rule_ids = set(re.findall(r"^\|\s*(R\d{2})\s*\|", text, re.M))
                if source_rule_ids != {f"R{i:02d}" for i in range(1,43)}:
                    fail("source Markdown R01-R42 count differs")
        except (OSError, UnicodeDecodeError) as e:
            fail(f"source read/decoding failed: {e}")
    else:
        warnings.append("PRIVATE_SOURCE_NOT_SUPPLIED: source matching NOT-RUN in public CI")
    report = {"schemaVersion":1,
              "gate":"FAIL" if errors else ("PASS-SOURCE-AND-STRUCTURE" if source_verified else "PASS-STRUCTURE-ONLY"),
              "sourceSha256Expected": SHA, "sourceHashVerifiedThisRun":source_verified,
              "responsibilities":len(ids),"cases":len(testcases),
              "rulesCoveredByCaseUnion":len({x for x in all_covered if re.fullmatch(r"R\d{2}",x)}),
              "actualD2PlanChecked":False,"actualPiRunsChecked":False,
              "AgentATemplateCertified":False,
              "errors":errors,"warnings":warnings}
    output=json.dumps(report,ensure_ascii=False,indent=2)+"\n"
    if args.output:
        args.output.parent.mkdir(parents=True,exist_ok=True)
        args.output.write_text(output,encoding="utf-8")
    print(output,end="")
    return 1 if errors else 0
if __name__ == "__main__":
    sys.exit(main())

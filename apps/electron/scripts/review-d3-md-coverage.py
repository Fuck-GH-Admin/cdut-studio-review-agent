#!/usr/bin/env python3
"""D3 authoring safeguard: compare an independently indexed MD duty ledger to the
actual D2 plan. Checks structure and scope, NOT semantic equivalence or model accuracy.
No filesystem mutations except an optional report file.
"""
import argparse
import hashlib
import json
import re
import sys
from pathlib import Path

STATUS = {
    "implemented-not-tested", "implemented-and-tested",
    "policy-awaiting-confirmation", "tooling-blocked", "source-missing",
    "manual-only", "out-of-scope-with-reason",
}
MAPPED = {"implemented-not-tested", "implemented-and-tested", "policy-awaiting-confirmation"}

def load(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))

def nonblank(x):
    return isinstance(x, str) and bool(x.strip())

def validate(catalog, ledger, plan, gold, source=None, gaps=None):
    errors, warnings = [], []
    def fail(s):
        errors.append(s)
    def warn(s):
        warnings.append(s)
    if catalog.get("schemaVersion") != 1 or ledger.get("schemaVersion") != 1 or gold.get("schemaVersion") != 1:
        fail("schemaVersion must equal 1 for catalog, ledger, gold")
    scope = catalog.get("scope")
    if scope not in {"pilot", "full"}:
        fail("catalog.scope must be pilot or full")
    if scope == "pilot" and not nonblank(catalog.get("selectionReason")):
        fail("pilot must declare selectionReason")
    sha = catalog.get("sourceSha256")
    if not isinstance(sha, str) or not re.fullmatch(r"[0-9a-f]{64}", sha):
        fail("catalog.sourceSha256 must be hex sha256")
    if ledger.get("sourceSha256") != sha or gold.get("sourceSha256") != sha:
        fail("source hash disagreement among catalog/ledger/independent gold")
    if not nonblank(catalog.get("sourceMd")) or ledger.get("sourceMd") != catalog.get("sourceMd"):
        fail("sourceMd mismatch or missing")
    verified_md = False
    source_ids = set()
    if source is None:
        if scope == "full":
            fail("full coverage requires the exact original MD via --source")
        else:
            warn("original MD not supplied; pilot source hash was not verified")
    else:
        data = Path(source).read_bytes()
        if hashlib.sha256(data).hexdigest() != sha:
            fail("original MD sha256 differs from fixed catalog")
        else:
            verified_md = True
        source_ids = set(re.findall(r"^\s*\|\s*(R\d{2,3})\s*\|", data.decode("utf-8-sig"), flags=re.M))
        if not source_ids:
            warn("MD has no machine-recognizable Rxx table rows; catalog IDs require human verification")
    def index(rows, title):
        result = {}
        if not isinstance(rows, list):
            fail(f"{title} must be an array")
            return result
        for entry in rows:
            if not isinstance(entry, dict) or not nonblank(entry.get("id")):
                fail(f"{title} has invalid ID")
                continue
            key = entry["id"]
            if key in result:
                fail(f"{title} duplicate ID: {key}")
            result[key] = entry
        return result
    primary = index(catalog.get("requirements"), "catalog.requirements")
    authored = index(ledger.get("requirements"), "ledger.requirements")
    reference = index(gold.get("requirements"), "gold.requirements")
    for name, observed in (("ledger", authored), ("gold", reference)):
        if set(observed) != set(primary):
            fail(f"{name} coverage mismatch: missing={sorted(set(primary)-set(observed))}; extra={sorted(set(observed)-set(primary))}")
    if source_ids:
        if scope == "full" and set(primary) != source_ids:
            fail(f"full MD rule-index incomplete: missing={sorted(source_ids-set(primary))}; extra={sorted(set(primary)-source_ids)}")
        elif not set(primary).issubset(source_ids):
            fail(f"pilot catalog references IDs absent in original MD: {sorted(set(primary)-source_ids)}")
    for k, item in primary.items():
        if not nonblank(item.get("locator")) or not nonblank(item.get("purpose")):
            fail(f"{k}: independent source index needs locator and purpose")
    if not nonblank(ledger.get("workspaceId")) or not nonblank(ledger.get("templateId")):
        fail("ledger must name workspaceId/templateId")
    if ledger.get("workspaceId") != plan.get("workspaceId") or ledger.get("templateId") != plan.get("templateId"):
        fail("D2 plan workspace/template mismatch")
    if ledger.get("templateVersion") != plan.get("templateVersion"):
        fail("D2 plan templateVersion mismatch")
    if ledger.get("planFingerprint") != plan.get("fingerprint"):
        fail("D2 plan fingerprint mismatch")
    mapping = {x.get("checkId"): x for x in plan.get("mapping", []) if isinstance(x, dict) and nonblank(x.get("checkId"))}
    if len(mapping) != len(plan.get("mapping", [])):
        fail("invalid or duplicate D2 plan checkIds")
    if plan.get("publicationAllowed") is not False:
        fail("D3 source comparison only accepts candidate-held technical plans")
    compiled_rules = {r.get("id"): r for r in plan.get("rules", []) if isinstance(r, dict) and nonblank(r.get("id"))}
    gap_index = index(gaps or [], "gaps")
    attributed = set()
    for key, item in authored.items():
        if key not in primary or key not in reference:
            continue
        state = item.get("status")
        gold_item = reference[key]
        allowed = gold_item.get("allowedStatuses")
        if state not in STATUS or not isinstance(allowed, list) or state not in allowed:
            fail(f"{key}: disposition {state!r} disagrees with independent gold {allowed}")
        ids = item.get("checkIds")
        if not isinstance(ids, list) or any(not nonblank(c) for c in ids) or len(set(ids)) != len(ids):
            fail(f"{key}: checkIds must be a distinct string array")
            continue
        if state in MAPPED:
            if not ids:
                fail(f"{key}: mapped/awaiting-policy obligation has no actual Check")
            for cid in ids:
                if cid not in mapping:
                    fail(f"{key}: Check {cid} missing from actual D2 compiler plan")
                else:
                    attributed.add(cid)
            need = set(gold_item.get("requiredCheckIds", []))
            if not need.issubset(set(ids)):
                fail(f"{key}: independently required Checks missing: {sorted(need-set(ids))}")
            for cid, subjects in gold_item.get("checkSubjects", {}).items():
                if cid not in ids:
                    fail(f"{key}: required scope Check not attributed: {cid}")
                elif cid in mapping and mapping[cid].get("subjectId") not in subjects:
                    fail(f"{key}: Check {cid} compiled for {mapping[cid].get('subjectId')!r}, expected {subjects}")
            for cid, source_ids in gold_item.get("checkSourceIds", {}).items():
                if cid not in ids:
                    fail(f"{key}: required source Check not attributed: {cid}")
                elif cid in mapping and not set(source_ids).issubset(set(mapping[cid].get("sourceIds", []))):
                    fail(f"{key}: Check {cid} lost independent source binding {source_ids}")
            for cid, terms in gold_item.get("checkRuleTerms", {}).items():
                if cid not in ids:
                    fail(f"{key}: required semantic rule Check not attributed: {cid}")
                    continue
                rule = compiled_rules.get(mapping.get(cid, {}).get("ruleId"), {})
                requirement = str(rule.get("requirement", ""))
                if not all(term in requirement for term in terms):
                    fail(f"{key}: Check {cid} compiled rule is missing required semantic cues {terms}")
            if state == "policy-awaiting-confirmation":
                if any(mapping[c].get("authority") != "unverified-policy" for c in ids if c in mapping):
                    fail(f"{key}: policy unverified requirement was given stronger D2 authority")
            if state == "implemented-and-tested" and not item.get("runEvidenceRefs"):
                fail(f"{key}: tested status without any actual Run evidence reference")
        elif state == "tooling-blocked":
            gid = item.get("gapId")
            if not nonblank(gid) or gid not in gap_index:
                fail(f"{key}: tooling-blocked missing registered gap")
            else:
                g = gap_index[gid]
                if key not in g.get("sourceRequirementIds", []) or not nonblank(g.get("reproduce")):
                    fail(f"{key}: gap missing source rule or reproduction")
                if g.get("verifiedAgainstRun") is not False:
                    fail(f"{key}: gap cannot claim run-verified")
            if ids:
                warn(f"{key}: blocked duty has partial Check mappings; cannot be marked executed")
        elif state in {"source-missing", "manual-only", "out-of-scope-with-reason"}:
            if not nonblank(item.get("reason")):
                fail(f"{key}: {state} must include a defensible reason")
            if ids:
                warn(f"{key}: noncompiled disposition lists Check IDs; check status/attribution manually")
    unused = sorted(set(mapping)-attributed)
    if unused:
        if scope == "full":
            fail(f"full plan has unattributed compiled Checks: {unused}")
        else:
            warn(f"pilot does not attest to other compiled Checks: {unused}")
    report = {
        "schemaVersion": 1,
        "gate": "PASS" if not errors else "FAIL",
        "scope": scope,
        "sourceHashVerified": verified_md,
        "catalogRuleCount": len(primary),
        "compiledPlanCheckCount": len(mapping),
        "attributedPlanCheckCount": len(attributed),
        "unattributedPlanChecks": unused,
        "errors": errors,
        "warnings": warnings,
        "semanticEquivalenceVerified": False,
        "onlineModelAccuracyVerified": False,
        "completeBusinessTemplateCertified": False,
        "note": "PASS proves declared coverage matches the independent index and actual D2 scope, not that the agent understood the full MD.",
    }
    return report

def main():
    parser = argparse.ArgumentParser(description="Compare MD requirement ledger with real D2 compiled plan and independently prepared reference.")
    for name in ("catalog", "ledger", "plan", "gold"):
        parser.add_argument("--"+name, required=True)
    parser.add_argument("--source", help="Original full Markdown: mandatory for full-scope gate")
    parser.add_argument("--gaps", help="JSON list of registered gap evidence")
    parser.add_argument("--output", help="Optional report JSON output")
    args = parser.parse_args()
    try:
        report = validate(load(args.catalog), load(args.ledger), load(args.plan), load(args.gold),
                          source=args.source, gaps=load(args.gaps) if args.gaps else None)
    except (OSError, ValueError, KeyError, TypeError) as exc:
        report = {"gate": "FAIL", "errors": [f"cannot inspect inputs: {exc}"]}
    payload = json.dumps(report, ensure_ascii=False, indent=2)+"\n"
    if args.output:
        Path(args.output).write_text(payload, encoding="utf-8")
    print(payload, end="")
    return 0 if report["gate"] == "PASS" else 1

if __name__ == "__main__":
    sys.exit(main())

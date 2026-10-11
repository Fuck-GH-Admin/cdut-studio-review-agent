#!/usr/bin/env python3
"""Compare actual CLI outputs with D1 workspace; no private MD and no independent Gold."""
import argparse
import json
import pathlib
import re

def read(path):
    return json.loads(pathlib.Path(path).read_text(encoding="utf-8"))

def must(ok, msg):
    if not ok:
        raise AssertionError(msg)

p = argparse.ArgumentParser()
p.add_argument("--root", required=True)
p.add_argument("--run-dir", required=True)
a = p.parse_args()
root = pathlib.Path(a.root)
out = pathlib.Path(a.run_dir)
w1, w2 = (read(root / "workspaces" / ("archive-r%d.json" % rev)) for rev in (1, 2))
read_log = lambda name: read(out / "logs" / (name + ".stdout.log"))
for rev, workspace in [(1, w1), (2, w2)]:
    saved, loaded = read_log("d1-r%d-save" % rev), read_log("d1-r%d-read" % rev)
    must(saved["saved"] is True and saved["revision"] == rev, "D1 save revision %d" % rev)
    must(loaded["workspace"] == workspace and loaded["digest"] == saved["digest"], "D1 read mismatch %d" % rev)
    if rev == 2:
        must(loaded["parentDigest"] == read_log("d1-r1-save")["digest"], "D1 parent digest broken")
must(read_log("d1-r1-validate")["ok"] is True, "D1 r1 validate failed")
diff = read_log("d1-diff")
must(diff["newRevision"] == 2 and diff["oldRevision"] == 1, "D1 diff revisions not 1 -> 2")
must(read_log("d3-validate")["ok"] is True, "D3 validation not ok")
must(read_log("d3-import-validate")["ok"] is True, "D3 imported validation not ok")
exp, imp = read_log("d3-export"), read_log("d3-import")
bundle = read(out / "portable-bundle.json")
must(exp["exported"] and imp["imported"], "D3 export/import receipts missing")
must(exp["fingerprint"] == bundle["fingerprint"], "D3 exported fingerprint mismatch")
must(bundle["publicationAllowed"] is False and bundle["status"] == "technical-authoring-only", "D3 bundle falsely published")
must(bundle["workspace"] == w2 and read(out / "imported-workspace.json") == w2, "D3 import workspace drift")
must(bundle["frozen"] == [] and w2["sharedModuleLocks"] == [], "unexpected frozen shared modules")
must(read_log("report-gap")["verifiedAgainstRun"] is False, "gap receipt incorrectly verified")
plan, imported = read(out / "actual-d2-plan.json"), read(out / "imported-d2-plan.json")
must(plan == imported, "D3 portable reimport changes D2 plan or RuleSpec/Source/Subject")
must(plan["publicationAllowed"] is False and plan["mode"] == "technical-pre-review", "D2 published/production mode")
must(re.fullmatch("[0-9a-f]{64}", plan["fingerprint"]) is not None, "D2 fingerprint invalid")
must(len(plan["mapping"]) == len(plan["rules"]) == len(set(x["checkId"] for x in plan["mapping"])), "D2 duplicate/lost Check")
selection = read(root / "plans" / "selection.json")
must(plan["targets"] == selection["targets"], "D2 target bindings drift")
target_map = {x["objectKey"]: x for x in selection["targets"]}
rule_map = {x["id"]: x for x in plan["rules"]}
source_map = {s["sourceId"]: s for s in w2["sources"]}
bindings = {b["checkId"].split(":", 1)[1]: b["sourceIds"] for b in w2["sourceBindings"]}
modules = {m["moduleId"]: m for m in w2["definitions"]["modules"]}
expected, by_rule = {}, {}
for use in w2["definitions"]["templates"][0]["modules"]:
    mod = modules[use["moduleId"]]
    for task in mod["tasks"]:
        cid = "module/" + use["id"] + "/" + task["id"]
        expected[cid] = {"objectKey": use.get("objectKey"), "ruleId": task["id"].upper()}
        by_rule.setdefault(task["id"].upper(), []).append(cid)
observed = {m["checkId"]: m for m in plan["mapping"]}
must(set(observed) == set(expected) == set(bindings), "D2 mapping not equal to 77 authored local task instances")
for cid, m in observed.items():
    source_ids = bindings[cid]
    must(m["sourceIds"] == source_ids, "D2 sourceIds drift " + cid)
    must(set(source_ids).issubset(source_map), "D2 unknown authority source " + cid)
    must(expected[cid]["objectKey"] == m.get("objectKey"), "D2 objectKey drift " + cid)
    if m.get("objectKey"):
        must(m["subjectId"] == target_map[m["objectKey"]]["subjectId"], "D2 subjectId mismatch " + cid)
    else:
        must("subjectId" not in m, "case-scope check got subjectId " + cid)
    rule = rule_map[m["ruleId"]]
    must(("原文责任 " + expected[cid]["ruleId"]) in rule["requirement"], "D2 rule lost source duty " + cid)
    must(all(src in rule["sourceRefIds"] for src in source_ids), "RuleSpec sourceRefIds mismatched " + cid)
    inferred = "unverified-policy" if any(source_map[s]["kind"] in ("policy-candidate","cross-school-reference") or source_map[s]["applicability"] != "request-scope" for s in source_ids) else "request-scope"
    must(m["authority"] == inferred, "D2 authority incorrectly promoted " + cid)
must("module/operation-i01-read/r09" in observed and "module/operation-i01-copy/r09" in observed, "proxy scope not separated")
must(observed["module/operation-i01-read/r09"]["subjectId"] != observed["module/operation-i01-copy/r09"]["subjectId"], "proxy read/copy scope merged")
must("module/read-i01-read/r21" in observed and "module/copy-i01-copy/r23" in observed, "independent read/copy grant missing")
catalog = read(root / "source-catalog.json")
ledger = read(root / "conversion-ledger.json")
must(len(catalog["requirements"]) == len(ledger["requirements"]) == 54, "original source accountability index shrunk")
must(set("R%02d" % i for i in range(1,43)).issubset(by_rule), "R01-R42 not all represented in workspace")
summary = {
    "schemaVersion": 1,
    "provenance": "CI live D1/D2/D3 CLI output; private source hash NOT revalidated in CI",
    "workspaceId": plan["workspaceId"],
    "revision": plan["revision"],
    "templateId": plan["templateId"],
    "templateVersion": plan["templateVersion"],
    "planFingerprint": plan["fingerprint"],
    "authoringDigest": plan["authoringDigest"],
    "previewFingerprint": plan["previewFingerprint"],
    "bundleFingerprint": bundle["fingerprint"],
    "compiledCheckCount": len(observed),
    "sourceIds": sorted(source_map),
    "targets": [{"objectKey": x["objectKey"], "subjectId": x["subjectId"], "operation": x.get("operation")} for x in selection["targets"]],
    "byRule": {rid: sorted(checks) for rid, checks in sorted(by_rule.items())},
    "authorityCounts": {auth: sum(x["authority"] == auth for x in observed.values()) for auth in ("request-scope", "unverified-policy")},
    "technicalChecksVerified": True,
    "piArchiveCaseRun": "NOT-RUN",
    "syntheticToolReceipt": False,
    "onlineModelRun": "not-run",
    "sourceHashVerifiedInCI": False,
    "independentGold": "NOT-RUN",
    "semanticEquivalenceVerified": False,
    "completeBusinessTemplateCertified": False
}
print(json.dumps(summary, ensure_ascii=False, indent=2))

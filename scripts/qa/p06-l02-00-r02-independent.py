#!/usr/bin/env python3
"""P06 L02-00 R02: independent, read-only re-audit of frozen public history.

This does not import the PR #99 verifier, start a provider, infer missing private
transcripts, or sign a LIVE Main/IPC/Electron test.
"""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT / "docs/design/review-agent/acceptance/p06-recheck-live-20261014"
CODE = "apps/electron/src/main/lib/review/v2-executor-factory.ts"
OLD = "d24d1c2d69ae25ff47a080155041cc62620a6bf9"
FIXED = "b95b44f7a06bb1e1ae21a985b5bb4cd9f5581027"
BATCHES = (
    ("corrected", "records/live-final/batch-corrected", OLD, 1, "FAIL",
     "4a32389840d71edcb3aca64408f4628da12deeaeccb5379060f38b7b1f3fac2a"),
    ("witness", "records/live-final/batch-witness", OLD, 1, "FAIL",
     "cbb3fdc36486c593152a3e4d19ae892b6f9e040ba8b694f63d611e1c11d096a3"),
    ("selected", "records/live-b95-final", FIXED, 0, "PASS",
     "381bc830150d3399ce241176489c615cfb22c304bd04a56f23b308fbba0cb1d1"),
)
EXPECTED = ("compliant", "non-compliant", "awaiting-supplement")
MISSING = {
    "inputManifestHash": "MISSING_PUBLIC_EVIDENCE",
    "templateVersionLock": "MISSING_PUBLIC_EVIDENCE",
    "policyRuleVersionLock": "MISSING_PUBLIC_EVIDENCE",
    "materialSourcePathAndSha256": "MISSING_PUBLIC_EVIDENCE",
    "documentVersionId": "MISSING_PUBLIC_EVIDENCE",
    "parseRevision": "MISSING_PUBLIC_EVIDENCE",
    "sourceRefQuoteAndLocation": "MISSING_PUBLIC_EVIDENCE",
    "evidenceCoverageLedger": "MISSING_PUBLIC_EVIDENCE",
    "assignmentId": "MISSING_PUBLIC_EVIDENCE",
    "turnId": "MISSING_PUBLIC_EVIDENCE",
    "sessionId": "MISSING_PUBLIC_EVIDENCE",
    "toolCallInputsAndOutputs": "MISSING_PUBLIC_EVIDENCE",
    "perCaseProviderUsage": "AGGREGATE_WITNESS_ONLY_OR_NOT_CAPTURED",
    "authorizationAndRevocationTimeline": "MISSING_PUBLIC_EVIDENCE",
    "humanDecisionOrSupplementReturn": "NOT_EVIDENCED",
}

def check(ok, label):
    if not ok:
        raise AssertionError(label)

def read(relative_path):
    raw = (BASE / relative_path).read_bytes()
    return json.loads(raw), hashlib.sha256(raw).hexdigest(), len(raw)

def git(*args):
    res = subprocess.run(["git", "-C", str(ROOT), *args], capture_output=True)
    check(res.returncode == 0, "git command failed: " + " ".join(args))
    return res.stdout

def archived_identity(index, path, sha, size):
    check(path in index, "missing mandatory archive-manifest entry: " + path)
    item = index[path]
    check(item.get("publicSha256") == sha and item.get("publicBytes") == size,
          "archive-manifest mismatch: " + path)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", required=True)
    args = parser.parse_args()
    source_old = git("show", OLD + ":" + CODE)
    source_fixed = git("show", FIXED + ":" + CODE)
    candidate_code = (ROOT / CODE).read_bytes()
    check(b"existingTargets.size > 0 ? []" in source_old, "old source mismatch")
    check(b"pluginRuleIds.has(rule.id) ? []" in source_fixed, "fixed source mismatch")
    check(b"pluginRuleIds.has(rule.id) ? []" in candidate_code, "candidate fallback regressed")
    check(b"existingTargets.size > 0 ? []" not in candidate_code, "candidate contains old condition")
    # The two frozen blobs must differ only in the fallback predicate; source identity is stronger
    # than relying on the historical narrative about a one-line patch.
    check(source_old.replace(b"existingTargets.size > 0 ? []",
                             b"pluginRuleIds.has(rule.id) ? []") == source_fixed,
          "source diff is broader than the recorded one-line change")

    manifest, manifest_sha, manifest_bytes = read("evidence-manifest.json")
    index = {entry["publicPath"]: entry for entry in manifest["files"]}
    check(len(index) == len(manifest["files"]), "duplicate archive-manifest public path")
    driver = (ROOT / "scripts/qa/review-live-batch.mjs").read_text()
    for scenario in (
        "合成申请 A：读书交流活动，总预算100元。",
        "合成申请 B：读书交流活动，总预算120元。",
        "合成申请 C：读书交流活动，未提供预算金额。",
    ):
        check(scenario in driver, "synthetic driver contents changed")
    check("for (const [label, content]" in driver and "result.push(c.id)" in driver,
          "scenario-to-case order cannot be established from the driver")

    ledger = []
    cases = []
    used_cases, used_runs = set(), set()
    for key, folder, source_sha, exit_code, status, expected_digest in BATCHES:
        outcome_path = folder + "/batch-real-result.json"
        command_path = folder + ("/batch-real.command.json" if key != "selected" else "/06-batch.command.json")
        data, digest, size = read(outcome_path)
        command, cmd_sha, cmd_size = read(command_path)
        check(digest == expected_digest, key + " result SHA256 differs from pinned bytes")
        archived_identity(index, outcome_path, digest, size)
        archived_identity(index, command_path, cmd_sha, cmd_size)
        check(data.get("sourceSha") == source_sha == command.get("sourceSha"), key + " source identity")
        check(command.get("exitCode") == exit_code and data.get("status") == status,
              key + " archived exit/status mismatch")
        check(command.get("argv") == ["node", "scripts/qa/review-live-batch.mjs"], key + " argv mismatch")
        check(command.get("environment", {}).get("QA_APPLICATION_SHA") == source_sha,
              key + " application SHA mismatch")
        for name, entry in command.get("files", {}).items():
            path = folder + "/" + name
            _, file_sha, file_size = read_text_bytes(path)
            check((file_sha, file_size) == (entry["sha256"], entry["bytes"]),
                  key + " stdout/stderr bytes mismatch " + name)
            archived_identity(index, path, file_sha, file_size)
        check(len(data.get("runs", [])) == 3, key + " run count")
        created = [event for event in data.get("timeline", [])
                   if event.get("event") == "real-batch-created"]
        check(len(created) == 1 and len(created[0]["cases"]) == 3, key + " case-order witness")
        created_ids = created[0]["cases"]
        queue = data.get("queue", {})
        queued = queue.get("cases", [])
        check(len(queued) == 3 and {q["caseId"] for q in queued} == set(created_ids)
              and all(q["status"] == "done" for q in queued), key + " queue cross-reference")
        check([row["caseId"] for row in data["runs"]] == created_ids,
              key + " creation order / run association mismatch")
        checks_by_alias = []
        for idx, row in enumerate(data["runs"]):
            alias = "ABC"[idx]
            check(row["caseId"] not in used_cases and row["runId"] not in used_runs,
                  "cross-batch caseId/runId collision")
            used_cases.add(row["caseId"])
            used_runs.add(row["runId"])
            check(row["status"] == "completed" and row.get("decisionCount") == 0,
                  key + " completed/decision mismatch " + alias)
            observed = row.get("checks", [])
            semantics = [c for c in observed if c.get("status") == EXPECTED[idx]]
            failures = [c for c in observed if c.get("status") == "execution-failed"]
            check(len(semantics) == 1 and len(failures) == (0 if key == "selected" else 1)
                  and len(observed) == len(semantics) + len(failures),
                  key + " semantic/fallback count " + alias)
            check(semantics[0]["ruleId"] == "section-all-budget"
                  and semantics[0]["sourceRefCount"] == 1,
                  key + " semantic reference count " + alias)
            if failures:
                check(failures[0]["ruleId"] == semantics[0]["ruleId"]
                      and failures[0]["sourceRefCount"] == 0,
                      key + " duplicate fallback identity " + alias)
            check_row = {
                "record": key,
                "alias": alias,
                "syntheticScenario": ("budget_100", "budget_120", "budget_missing")[idx],
                "sourceSha": source_sha,
                "caseId": row["caseId"],
                "runId": row["runId"],
                "batchId": created[0].get("batchId"),
                "queueCaseState": "done",
                "v2RunState": row["status"],
                "ruleId": "section-all-budget",
                "semanticCheck": semantics[0]["status"],
                "semanticSourceRefCount": 1,
                "duplicateFallbackCheck": bool(failures),
                "fallbackSourceRefCount": 0 if failures else None,
                "decisionCount": row["decisionCount"],
                "attribution": {
                    "duplicateFallback": "EXECUTION_FAILURE" if failures else "NOT_REPRODUCED_IN_SELECTED_OLD_VERSION",
                    "business": "BUSINESS_INCOMPLETE" if alias == "C" else "UNDETERMINED_NO_APPROVAL",
                    "completeHumanWorkflow": "NOT_EVIDENCED",
                },
                "provenance": dict(MISSING),
                "evidenceLevel": "ARCHIVED_REAL_RUN_REDACTED_SUMMARY",
            }
            cases.append(check_row)
            checks_by_alias.append(semantics[0]["status"])
        witness = data.get("providerWitness", [])
        queries = [e for e in witness if e.get("event") == "real-pi-query-entered"]
        positive = [e for e in witness if e.get("event") == "real-pi-assistant-received"
                    and (e.get("inputTokens", 0) + e.get("outputTokens", 0)) > 0]
        check(not any(any(k in e for k in ("caseId", "runId", "assignmentId", "turnId"))
                      for e in witness), "provider witness unexpectedly per-case; reassess provenance")
        if key == "corrected":
            check(not witness and "每案实际模型用量均非零" in data.get("error", ""),
                  "corrected failed earlier than the preserved harness assertion")
            direct_failure = "HARNESS_MODEL_USAGE_ASSERTION"
        elif key == "witness":
            check(len(queries) >= 3 and len(positive) >= 3
                  and "问题组已失效" in data.get("error", ""), "witness exit cause differs")
            direct_failure = "STALE_GROUP_DENIAL_PROPAGATED_TO_DRIVER"
        else:
            check(len(queries) >= 3 and len(positive) >= 3
                  and all(a.get("pass") is True for a in data.get("assertions", [])),
                  "selected failed its own recorded assertions")
            direct_failure = "NONE"
        ledger.append({
            "batch": key, "recordPath": outcome_path, "recordSha256": digest,
            "commandPath": command_path, "commandSha256": cmd_sha,
            "sourceSha": source_sha, "exitCode": exit_code, "overall": status,
            "commandDirectFailure": direct_failure,
            "observedSecondaryExecutionDefect": key != "selected",
            "scenarioStatuses": checks_by_alias, "caseCount": 3,
            "providerWitness": {
                "visibility": "AGGREGATE_ONLY" if witness else "NOT_CAPTURED",
                "queryEventCount": len(queries), "nonzeroAssistantEventCount": len(positive),
                "warning": "stream updates may be duplicates; do not sum as distinct provider cost",
            },
        })
    suite, _, _ = read("records/live-b95-final/selected-result-summary.json")
    status, _, _ = read("acceptance-status.json")
    check(suite["sourceSha"] == FIXED and suite["cases"] == suite["pass"] == 16
          and suite["assertions"] == 77 and suite["failedAssertions"] == 0,
          "old selected suite snapshot mismatch")
    check(status.get("P06") == "PARTIAL" and status.get("E06") == "PARTIAL"
          and status.get("sourceSha") == FIXED, "old state gate mismatch")
    check(len(cases) == len(used_cases) == len(used_runs) == 9, "nine distinct histories")
    out = {
        "schema": "p06-l02-00-r02-independent-v1",
        "candidateCommit": git("rev-parse", "HEAD").decode().strip(),
        "candidateTree": git("rev-parse", "HEAD^{tree}").decode().strip(),
        "historicalSource": {
            "oldCommit": OLD, "fixedCommit": FIXED,
            "oldBlobSha256": hashlib.sha256(source_old).hexdigest(),
            "fixedBlobSha256": hashlib.sha256(source_fixed).hexdigest(),
            "candidateBlobSha256": hashlib.sha256(candidate_code).hexdigest(),
            "predicateDiffOnly": True,
        },
        "archiveManifest": {"path": "evidence-manifest.json",
                            "sha256": manifest_sha, "bytes": manifest_bytes},
        "batches": ledger, "cases": cases,
        "historicalAttribution": "PASS_9_ARCHIVED_CASES_WITH_DIRECT_EXIT_CAUSES_SEPARATED",
        "newControlledRegression": "NOT_RUN_BY_THIS_PYTHON_SCRIPT",
        "newLiveE2E": "NOT_RUN_U1_SECURITY_AND_ENV_GATES",
        "l02_00": "PARTIAL_NOT_ACCEPTED",
        "p06": "PARTIAL", "p06_s02": "NOT_ACCEPTED", "merge": "NO-GO",
        "limitations": [
            "No per-case input manifest, material hash, template/policy lock, assignment/turn, tool transcript",
            "Provider witness is whole-batch and contains duplicate SDK stream events",
            "Archived SourceRef is a count, not a verifiable quote/location/coverage object",
            "Corrected command exit was an invalid modelUsage assertion; witness exited on stale-group denial",
            "Selected b95 is a different run/inputs from two d24 old failures",
            "None of nine archived cases had an administrative approval decision",
            "No new Electron/Main/IPC/Pi/provider execution took place",
        ],
    }
    dest = Path(args.out)
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps(out, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps({
        "result": out["historicalAttribution"], "cases": len(cases),
        "failures": [row["commandDirectFailure"] for row in ledger],
        "newLiveE2E": out["newLiveE2E"],
    }, ensure_ascii=False))

def read_text_bytes(relative_path):
    raw = (BASE / relative_path).read_bytes()
    return None, hashlib.sha256(raw).hexdigest(), len(raw)

if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print("P06 R02 independent audit FAILED: " + repr(error), file=sys.stderr)
        sys.exit(1)

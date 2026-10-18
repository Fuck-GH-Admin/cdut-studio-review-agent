#!/usr/bin/env python3
"""P06 L02-00 read-only historical evidence verifier. Never invokes providers."""
import argparse, hashlib, json, pathlib, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
EVIDENCE = ROOT / "docs/design/review-agent/acceptance/p06-recheck-live-20261014"
OLD = "d24d1c2d69ae25ff47a080155041cc62620a6bf9"
FIXED = "b95b44f7a06bb1e1ae21a985b5bb4cd9f5581027"
CODE = "apps/electron/src/main/lib/review/v2-executor-factory.ts"
EXPECTED = ["compliant", "non-compliant", "awaiting-supplement"]

def require(ok, message):
    if not ok: raise AssertionError(message)

def archived(file):
    data = (EVIDENCE / file).read_bytes()
    return json.loads(data), hashlib.sha256(data).hexdigest(), len(data)

def frozen(sha):
    cmd = subprocess.run(["git", "-C", str(ROOT), "show", sha + ":" + CODE], capture_output=True, text=True)
    require(cmd.returncode == 0, "missing historical Git source " + sha)
    return cmd.stdout

def inspect(folder, source_sha, expected_exit, old):
    result_path = folder + "/batch-real-result.json"
    result, digest, size = archived(result_path)
    command_file = folder + ("/batch-real.command.json" if old else "/06-batch.command.json")
    command, _, _ = archived(command_file)
    require(result["sourceSha"] == source_sha and command["sourceSha"] == source_sha, "SHA drift " + folder)
    require(command["exitCode"] == expected_exit, "exit drift " + folder)
    require(result["status"] == ("FAIL" if old else "PASS"), "verdict drift " + folder)
    require(len(result["runs"]) == 3, "incorrect three-case count " + folder)
    require(len({r["caseId"] for r in result["runs"]}) == 3, "duplicate case ID")
    require(len({r["runId"] for r in result["runs"]}) == 3, "duplicate run ID")
    for name, meta in command.get("files", {}).items():
        contents = (EVIDENCE / folder / name).read_bytes()
        require(hashlib.sha256(contents).hexdigest() == meta["sha256"] and
                len(contents) == meta["bytes"], "archived log hash mismatch")
    cases = []
    for alias, status, row in zip("ABC", EXPECTED, result["runs"]):
        good = [x for x in row["checks"] if x["status"] == status]
        failure = [x for x in row["checks"] if x["status"] == "execution-failed"]
        require(row["status"] == "completed" and row["decisionCount"] == 0, "run/decision drift")
        require(len(good) == 1 and good[0]["ruleId"] == "section-all-budget" and
                good[0]["sourceRefCount"] == 1, "semantic result missing evidence")
        require(len(failure) == (1 if old else 0), "unexpected missing/extra fallback")
        if old:
            require(failure[0]["ruleId"] == good[0]["ruleId"] and
                    failure[0]["sourceRefCount"] == 0, "fallback mismatch")
        cases.append({"alias": alias, "caseId": row["caseId"], "runId": row["runId"],
                      "semanticResult": status, "duplicateExecutionFailed": bool(failure),
                      "sourceRefCount": 1, "decisionCount": 0,
                      "inputManifestHash": None, "materialVersionHashes": None,
                      "perCaseProviderCalls": None})
    return {"sourceSha": source_sha, "record": result_path, "sha256": digest,
            "bytes": size, "exit": expected_exit, "result": result["status"], "cases": cases}

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--out", required=True)
    out = pathlib.Path(p.parse_args().out)
    old, fixed = frozen(OLD), frozen(FIXED)
    require("existingTargets.size > 0 ? []" in old, "old fallback no longer matches")
    require("pluginRuleIds.has(rule.id) ? []" in fixed, "fix not present in frozen version")
    require("pluginRuleIds.has(rule.id) ? []" in (ROOT / CODE).read_text(), "current candidate lost fix")
    rows = [inspect("records/live-final/batch-corrected", OLD, 1, True),
            inspect("records/live-final/batch-witness", OLD, 1, True),
            inspect("records/live-b95-final", FIXED, 0, False)]
    suite, _, _ = archived("records/live-b95-final/selected-result-summary.json")
    require(suite["sourceSha"] == FIXED and suite["cases"] == 16 and
            suite["pass"] == 16 and suite["assertions"] == 77 and
            suite["failedAssertions"] == 0, "selected suite mismatch")
    status, _, _ = archived("acceptance-status.json")
    require(status["sourceSha"] == FIXED and status["E06"] == "PARTIAL" and status["P06"] == "PARTIAL",
            "historical release status mismatch")
    manifest, _, _ = archived("evidence-manifest.json")
    index = {r["publicPath"]: r for r in manifest["files"]}
    checked = []
    for r in rows:
        if r["record"] in index:
            entry = index[r["record"]]
            require(entry["publicSha256"] == r["sha256"] and entry["publicBytes"] == r["bytes"],
                    "public archived SHA mismatch")
            checked.append(r["record"])
    script = (ROOT / "scripts/qa/review-live-batch.mjs").read_text()
    for s in ("合成申请 A：读书交流活动，总预算100元。",
              "合成申请 B：读书交流活动，总预算120元。",
              "合成申请 C：读书交流活动，未提供预算金额。"):
        require(s in script, "scenario definition changed")
    output = {"schema": "p06-l02-00-v1",
              "level": "FROZEN_SOURCE_AND_ARCHIVED_REAL_PROVIDER_LOGS",
              "historicalDuplicate": "CONFIRMED",
              "correctedSelectedSubset": "PASS",
              "cFullWorkflow": "UNDETERMINED",
              "newProviderOrElectronRun": "NOT_RUN",
              "L02_00": "HISTORICAL_ATTRIBUTION_DONE_LIVE_BLOCKED",
              "sourceComparison": {"oldSha": OLD, "fixedSha": FIXED,
                  "oldCodeSHA256": hashlib.sha256(old.encode()).hexdigest(),
                  "fixedCodeSHA256": hashlib.sha256(fixed.encode()).hexdigest()},
              "archiveManifestRecordsVerified": checked, "rows": rows,
              "missing": ["inputManifest.hash per case", "version hashes per material",
                          "provider/tool logs linked to each case", "C supplement workflow",
                          "new U1 Main/IPC/Office/Provider permission signoff"]}
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"verdict": output["L02_00"], "runs": 9, "indexedRecords": len(checked)}))

if __name__ == "__main__":
    try: main()
    except Exception as exc:
        print("L02-00 audit failed: " + repr(exc), file=sys.stderr)
        sys.exit(1)

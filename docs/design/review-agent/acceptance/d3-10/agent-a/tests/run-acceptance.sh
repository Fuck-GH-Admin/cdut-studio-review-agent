#!/usr/bin/env bash
# D3-10 Agent A: run from repository root, on the pinned-code test branch.
set -uo pipefail
ROOT="$(pwd)"
A="$ROOT/docs/design/review-agent/acceptance/d3-10/agent-a"
LOG="$A/logs"
mkdir -p "$LOG" "$A/plans" "$A/bundles" "$A/tests"
rm -f "$LOG"/*.stdout "$LOG"/*.stderr
# D3 portable targets deliberately use O_EXCL; only delete this run's own GENERATED outputs before re-run.
rm -f "$A/bundles/portable.json" "$A/bundles/reimported-workspace.json"
ORIGINAL_CONFIG="$(mktemp -d -t d3-10-agent-a-original-XXXXXX)"
CLEAN_CONFIG="$(mktemp -d -t d3-10-agent-a-import-XXXXXX)"
export PROFER_CONFIG_DIR="$ORIGINAL_CONFIG"
WS1="$A/workspaces/initial.json"
WS2="$A/workspaces/modified.json"
SEL="$A/tests/selection.json"
CASE="$A/tests/case.json"
D1="apps/electron/scripts/review-authoring-v1.ts"
D2="apps/electron/scripts/review-d2-plan.ts"
D3="apps/electron/scripts/review-d3-library.ts"
FAIL=0
cat > "$A/run-log.md" <<EOF
# Agent A actual execution log

- Repository working tree HEAD at start: $(git rev-parse HEAD)
- Pinned parent code SHA: d16f047af653f7ba259456807c1fc150e9d0f417
- Bun: $(bun --version 2>&1)
- Node: $(node --version 2>&1)
- Runner: GitHub Actions / Ubuntu; actual jobs/run links are added to PR when available
- Original \`PROFER_CONFIG_DIR\`: \`$ORIGINAL_CONFIG\` (fresh, temp)
- Import \`PROFER_CONFIG_DIR\`: \`$CLEAN_CONFIG\` (distinct fresh, temp)
- The two directories are never pointed at production
- Output: \`docs/design/review-agent/acceptance/d3-10/agent-a/\`
- Each stdout/stderr is stored under \`logs/<id>.stdout/.stderr\`; plan JSON also saved under \`plans/\`

| Step | Actual command | Exit | Expected | stdout | stderr |
| --- | --- | ---: | ---: | --- | --- |
EOF
run() {
  local id="$1" want="$2" out="$3"; shift 3
  local name="$LOG/$id.stdout" err="$LOG/$id.stderr" code
  printf 'RUN %s : ' "$id"; printf '%q ' "$@"; printf '\n'
  "$@" > "$name" 2> "$err"; code=$?
  if [[ "$out" != "-" ]]; then cp "$name" "$A/$out"; fi
  local shown=""
  printf -v shown '%q ' "$@"
  printf '| %s | \`%s\` | %d | %s | \`logs/%s.stdout\` | \`logs/%s.stderr\` |\n' "$id" "$shown" "$code" "$want" "$id" "$id" >> "$A/run-log.md"
  if [[ "$code" != "$want" ]]; then
    echo "UNEXPECTED STATUS $id got $code wanted $want" >&2
    echo "--- $id stderr ---" >&2
    cat "$err" >&2
    FAIL=1
  fi
}
run 01-d1-validate 0 plans/01-d1-initial-validate.json bun "$D1" validate "$WS1"
run 02-d3-validate 0 plans/02-d3-initial-validate.json bun "$D3" validate "$WS1"
run 03-initial-preview 0 plans/03-initial-plan.json bun "$D2" preview "$WS1" "$SEL" "$CASE"
run 04-save-rev1 0 plans/04-revision-1.json bun "$D1" save "$WS1" 0 independent-agent-a
run 05-read-rev1 0 plans/05-read-revision-1.json bun "$D1" read d3-10-agent-a-plain-text 1
run 06-d1-diff 0 plans/06-d1-diff.json bun "$D1" diff "$WS1" "$WS2"
run 07-d1-validate-rev2 0 plans/07-d1-modified-validate.json bun "$D1" validate "$WS2"
run 08-modified-preview 0 plans/08-modified-plan.json bun "$D2" preview "$WS2" "$SEL" "$CASE"
run 09-save-rev2 0 plans/09-revision-2.json bun "$D1" save "$WS2" 1 independent-agent-a
run 10-read-rev2 0 plans/10-read-revision-2.json bun "$D1" read d3-10-agent-a-plain-text 2
run 11-stale-save-refused 1 - bun "$D1" save "$WS2" 0 independent-agent-a
run 12-d3-validate-rev2 0 plans/12-d3-modified-validate.json bun "$D3" validate "$WS2"
run 13-register 0 plans/13-register.json bun "$D2" register "$WS2" "$SEL"
run 14-create 0 plans/14-created-case.json bun "$D2" create "$WS2" "$SEL" d3-10-agent-a-technical-case "Agent A 仅技术预审" independent-agent-a
run 15-export 0 plans/15-export-receipt.json bun "$D3" export "$WS2" "$A/bundles/portable.json"
export PROFER_CONFIG_DIR="$CLEAN_CONFIG"
run 16-import-clean 0 plans/16-import-receipt.json bun "$D3" import "$A/bundles/portable.json" "$A/bundles/reimported-workspace.json"
run 17-reimport-preview 0 plans/14-reimported-plan.json bun "$D2" preview "$A/bundles/reimported-workspace.json" "$SEL" "$CASE"
run 18-duplicate-import-refused 1 - bun "$D3" import "$A/bundles/portable.json" "$A/bundles/reimported-workspace.json"
run 19-independent-contract-and-gold 0 - python3 "$A/tests/verify-plan.py"
run 20-pi-real-service-synthetic-receipts 0 - bun "$A/tests/pi-synthetic-interface.ts" "$A/tests/pi-structured-results.json"
# Restore original isolated configuration so D1 revision 3 appends to the actual 1 -> 2 chain.
export PROFER_CONFIG_DIR="$ORIGINAL_CONFIG"
WS3="$A/workspaces/granular-revision-3.json"
run 21-granular-diff 0 plans/21-granular-diff.json bun "$D1" diff "$WS2" "$WS3"
run 22-granular-validate 0 plans/22-granular-validate.json bun "$D1" validate "$WS3"
run 23-granular-preview 0 plans/23-granular-plan.json bun "$D2" preview "$WS3" "$SEL" "$CASE"
run 24-granular-save 0 plans/24-revision-3.json bun "$D1" save "$WS3" 2 independent-agent-a
run 25-granular-read 0 plans/25-read-revision-3.json bun "$D1" read d3-10-agent-a-plain-text 3
run 26-granular-assertions 0 - python3 "$A/tests/verify-granularity.py"
run 27-granular-pi-service 0 - bun "$A/tests/pi-granularity-interface.ts" "$A/tests/granularity-results.json"

{
  echo
  echo '## Recovery and caveats'
  echo '- Step 11 intentionally attempts stale expectedRevision=0 after revision 2 and expects exit 1; step 12 continues with the intact revision.'
  echo '- Step 18 intentionally refuses to overwrite an imported workspace; earlier imported file is reused at step 17.'
  echo '- All runner output is uploaded as an Actions artifact; it no longer commits from a bot and thereby invalidates same-SHA CI provenance.'
  echo '- Before running, only the two generated bundle target filenames are removed (not workspace inputs or any production state), because export/import use exclusive create. The first repeat-run failure is recorded in gaps/recovery-export-target-collision.md.'
  echo '- P2 follow-up revision 3 splits independently judged headings into three source-bound Checks; actual steps 21-27 build D1/D2 and submit distinct synthetic Pi service statuses.'
  echo '- Three text cases are independently GOLD-classified; step 20 sends predeclared SYNTHETIC structured results through the real Pi service (registerMaterial/prepare/submit/verify). This is not a model-generated judgment.'
  echo "- Non-matching exits: $FAIL (0 means expected exit statuses matched; test 19 includes structural assertions)."
} >> "$A/run-log.md"
if [[ "$FAIL" == 0 ]]; then
cat > "$A/verdict.md" <<EOF
# Agent A verdict — partial technical PASS; end-to-end material review NOT-RUN

- Code tested: d16f047af653f7ba259456807c1fc150e9d0f417 (test branch descended from this SHA, no common D2/D3 implementation changes).
- D1 real revision save/read/diff: **pass**, see \`plans/04-revision-1.json\`, \`plans/09-revision-2.json\`, \`plans/06-d1-diff.json\`, \`plans/10-read-revision-2.json\`.
- D3 validation, real D2 preview/register/case creation: **pass**, see \`plans/08-modified-plan.json\`, \`plans/13-register.json\`, \`plans/14-created-case.json\`.
- Portable bundle export/import into distinct empty configuration: **pass**, see \`bundles/\`, \`plans/14-reimported-plan.json\`, \`plans/summary.json\`.
- Negative/stale edit recovery: **pass**, see \`logs/11-stale-save-refused.stderr\` and \`logs/18-duplicate-import-refused.stderr\`.
- Rule/Check/Source/fingerprint and no-Claim checks: **pass** (structural; \`plans/summary.json\`).
- Positive/negative/unknown synthetic material: **independent GOLD oracle and real Pi service structured-receipt tests pass**, see \`tests/cases.json\`, \`tests/actual-results.json\`, \`tests/pi-structured-results.json\`; classifications were intentionally supplied, not inferred by an online model.
- Synthetic text document material registration / valid SourceRef: **pass through real backend**. Online Pi model inference and formal publication / policy validity: **not-run / prohibited**.
- P2 granular revision 3 (three independent Check/Rule items): **pass**, see \`plans/21-granular-diff.json\`, \`plans/23-granular-plan.json\`, \`plans/24-revision-3.json\`, \`plans/granularity-summary.json\` and \`tests/granularity-results.json\`; still no online model reasoning.\n- Overall D3-10 Agent A: **technical contract and service interface PASS; actual online semantic reading NOT-RUN**. Not a blanket D3-10 release PASS (independent Agent B/integrator remain).
EOF
else
cat > "$A/verdict.md" <<EOF
# Agent A verdict — FAIL / needs investigation

At least one required command had an unexpected exit status or structural assertion failed. See \`run-log.md\` and \`logs/\` for raw outputs. Do not mark D3-10 passing.
EOF
fi
exit "$FAIL"

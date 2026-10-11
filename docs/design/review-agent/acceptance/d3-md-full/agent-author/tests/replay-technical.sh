#!/usr/bin/env bash
# No original archive MD is used or downloaded here. All materials are synthetic JSON.
set -Eeuo pipefail
BASE="docs/design/review-agent/acceptance/d3-md-full/agent-author"
CLI1="apps/electron/scripts/review-authoring-v1.ts"
CLI2="apps/electron/scripts/review-d2-plan.ts"
CLI3="apps/electron/scripts/review-d3-library.ts"
if [[ ! -f "$BASE/workspaces/archive-r2.json" || ! -f "$CLI1" ]]; then
  echo 'Run from repository root' >&2
  exit 2
fi
OUT="${1:-$(mktemp -d)}"
mkdir -p "$OUT/logs" "$OUT/d1-config" "$OUT/clean-config"
OUT="$(cd "$OUT" && pwd)"
printf 'git-head\t%s\n' "$(git rev-parse HEAD)" > "$OUT/environment.tsv"
printf 'bun\t%s\n' "$(bun --version)" >> "$OUT/environment.tsv"
printf 'node\t%s\n' "$(node --version)" >> "$OUT/environment.tsv"
: > "$OUT/exit-codes.tsv"
run_step() {
  local key="$1"; shift
  echo "::group::$key"
  set +e
  "$@" > "$OUT/logs/${key}.stdout.log" 2> "$OUT/logs/${key}.stderr.log"
  local rc=$?
  set -e
  printf '%s\t%s\n' "$key" "$rc" >> "$OUT/exit-codes.tsv"
  if ((rc != 0)); then
    cat "$OUT/logs/${key}.stderr.log" >&2
    echo "::endgroup::"
    echo "FAILED: $key exit=$rc; full logs saved under $OUT/logs" >&2
    exit "$rc"
  fi
  echo "::endgroup::"
}
run_rejection() {
  local key="$1" marker="$2"; shift 2
  echo "::group::$key (expected rejection)"
  set +e
  "$@" > "$OUT/logs/${key}.stdout.log" 2> "$OUT/logs/${key}.stderr.log"
  local rc=$?
  set -e
  printf '%s\t%s\n' "$key" "$rc" >> "$OUT/exit-codes.tsv"
  if ((rc == 0)) || ! grep -Fq "$marker" "$OUT/logs/${key}.stderr.log"; then
    cat "$OUT/logs/${key}.stderr.log" >&2
    echo "::endgroup::"
    echo "INVALID-REJECTION: $key exit=$rc expected nonzero with $marker" >&2
    exit 1
  fi
  echo "::endgroup::"
}
export PROFER_CONFIG_DIR="$OUT/d1-config"
run_step d1-r1-validate bun "$CLI1" validate "$BASE/workspaces/archive-r1.json"
run_step d1-r1-save bun "$CLI1" save "$BASE/workspaces/archive-r1.json" 0 agent-a
run_step d1-r1-read bun "$CLI1" read d3-md-archive-author-a 1
run_step d1-diff bun "$CLI1" diff "$BASE/workspaces/archive-r1.json" "$BASE/workspaces/archive-r2.json"
run_step d1-r2-save bun "$CLI1" save "$BASE/workspaces/archive-r2.json" 1 agent-a
run_step d1-r2-read bun "$CLI1" read d3-md-archive-author-a 2
run_step d3-discover bun "$CLI3" discover
run_step d3-validate bun "$CLI3" validate "$BASE/workspaces/archive-r2.json"
run_step d2-preview bun "$CLI2" preview "$BASE/workspaces/archive-r2.json" "$BASE/plans/selection.json" "$BASE/plans/case.json"
cp "$OUT/logs/d2-preview.stdout.log" "$OUT/actual-d2-plan.json"
run_step d3-export bun "$CLI3" export "$BASE/workspaces/archive-r2.json" "$OUT/portable-bundle.json"
export PROFER_CONFIG_DIR="$OUT/clean-config"
run_step d3-import bun "$CLI3" import "$OUT/portable-bundle.json" "$OUT/imported-workspace.json"
run_step d3-import-validate bun "$CLI3" validate "$OUT/imported-workspace.json"
run_step d2-imported-preview bun "$CLI2" preview "$OUT/imported-workspace.json" "$BASE/plans/selection.json" "$BASE/plans/case.json"
cp "$OUT/logs/d2-imported-preview.stdout.log" "$OUT/imported-d2-plan.json"
run_rejection advanced-d2-blocked D2_UNMAPPED_ADVANCED bun "$CLI2" preview "$BASE/workspaces/archive-r2-advanced-blocked.json" "$BASE/plans/selection.json" "$BASE/plans/case.json"
run_step report-gap bun "$CLI3" report-gap "$BASE/gaps/report-gap-input.json"
run_step technical-verifier python3 "$BASE/tests/verify-technical.py" --root "$BASE" --run-dir "$OUT"
cp "$OUT/logs/technical-verifier.stdout.log" "$OUT/technical-summary.json"
echo "Technical replay passed; raw stdout/stderr, exit codes, actual D2 plans and portable bundle: $OUT"

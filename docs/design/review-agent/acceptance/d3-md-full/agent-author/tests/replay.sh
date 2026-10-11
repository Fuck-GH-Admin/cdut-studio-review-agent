#!/usr/bin/env bash
set -euo pipefail
# 在仓库根目录执行；使用合成材料与隔离config；不要提交或复制完整原MD。
BASE="docs/design/review-agent/acceptance/d3-md-full/agent-author/"
CLI1=apps/electron/scripts/review-authoring-v1.ts
CLI2=apps/electron/scripts/review-d2-plan.ts
CLI3=apps/electron/scripts/review-d3-library.ts
OUT="$(mktemp -d)"
export PROFER_CONFIG_DIR="$OUT/d1"
mkdir -p "$PROFER_CONFIG_DIR" "$OUT/out"
bun "$CLI1" validate "$BASE/workspaces/archive-r1.json" > "$OUT/out/d1-r1-validate.json"
bun "$CLI1" save "$BASE/workspaces/archive-r1.json" 0 agent-a > "$OUT/out/d1-r1-save.json"
bun "$CLI1" read d3-md-archive-author-a 1 > "$OUT/out/d1-r1-read.json"
bun "$CLI1" diff "$BASE/workspaces/archive-r1.json" "$BASE/workspaces/archive-r2.json" > "$OUT/out/d1-diff.json"
bun "$CLI1" save "$BASE/workspaces/archive-r2.json" 1 agent-a > "$OUT/out/d1-r2-save.json"
bun "$CLI1" read d3-md-archive-author-a 2 > "$OUT/out/d1-r2-read.json"
bun "$CLI3" discover > "$OUT/out/d3-discover.json"
bun "$CLI3" validate "$BASE/workspaces/archive-r2.json" > "$OUT/out/d3-validate.json"
bun "$CLI2" preview "$BASE/workspaces/archive-r2.json" "$BASE/plans/selection.json" "$BASE/plans/case.json" > "$OUT/out/actual-d2-plan.json"
bun "$CLI3" export "$BASE/workspaces/archive-r2.json" "$OUT/out/portable-bundle.json" > "$OUT/out/d3-export.json"
export PROFER_CONFIG_DIR="$OUT/clean"
mkdir -p "$PROFER_CONFIG_DIR"
bun "$CLI3" import "$OUT/out/portable-bundle.json" "$OUT/out/imported-workspace.json" > "$OUT/out/d3-import.json"
bun "$CLI3" validate "$OUT/out/imported-workspace.json" > "$OUT/out/d3-import-validate.json"
bun "$CLI2" preview "$OUT/out/imported-workspace.json" "$BASE/plans/selection.json" "$BASE/plans/case.json" > "$OUT/out/imported-d2-plan.json"
python3 - "$OUT/out/actual-d2-plan.json" "$OUT/out/imported-d2-plan.json" <<'PY'
import json,sys
left,right=map(lambda p:json.load(open(p)),sys.argv[1:])
assert left['fingerprint']==right['fingerprint'], 'D2 fingerprint drift'
assert left['mapping']==right['mapping'], 'Check/scope/source drift'
assert left['rules']==right['rules'] and left['subjects']==right['subjects'], 'Rule or subject drift'
print('D3 portable reimport D2-equivalent: PASS')
PY
# advanced拒止必须真正执行且退出非0，不得把文字叙述当运行日志。
if bun "$CLI2" preview "$BASE/workspaces/archive-r2-advanced-blocked.json" "$BASE/plans/selection.json" "$BASE/plans/case.json" > "$OUT/out/advanced-out.txt" 2>"$OUT/out/advanced-error.txt"; then
  echo "ERROR: advanced input was silently compiled" >&2; exit 1
fi
grep -q D2_UNMAPPED_ADVANCED "$OUT/out/advanced-error.txt"
bun "$CLI3" report-gap "$BASE/gaps/report-gap-input.json" > "$OUT/out/report-gap.json"
python3 "$BASE/tests/self-audit.py" --source "$1" --root "$BASE" --plan "$OUT/out/actual-d2-plan.json" > "$OUT/out/self-audit.json"
echo "ARTIFACTS: $OUT/out (not committed automatically; redact before publishing)"

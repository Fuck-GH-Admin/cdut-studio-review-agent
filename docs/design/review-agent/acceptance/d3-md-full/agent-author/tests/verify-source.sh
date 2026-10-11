#!/usr/bin/env bash
set -Eeuo pipefail
BASE="docs/design/review-agent/acceptance/d3-md-full/agent-author"
if [[ $# -lt 1 || ! -f "$1" ]]; then
  echo 'Usage: verify-source.sh /private/path/g01_archive_utilization_template_editor_spec_v1_5.md [existing-technical-run-dir]' >&2
  exit 2
fi
SRC="$1"
OUT="${2:-$(mktemp -d)}"
mkdir -p "$OUT"
if [[ -e "$OUT/actual-d2-plan.json" ]]; then
  python3 "$BASE/tests/self-audit.py" --source "$SRC" --root "$BASE" --plan "$OUT/actual-d2-plan.json" > "$OUT/source-verification.json"
else
  python3 "$BASE/tests/self-audit.py" --source "$SRC" --root "$BASE" > "$OUT/source-verification.json"
fi
cat "$OUT/source-verification.json"
echo 'Private source file was NOT copied to the artifact directory.'

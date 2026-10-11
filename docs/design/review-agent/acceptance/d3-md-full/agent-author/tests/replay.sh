#!/usr/bin/env bash
# Optional original-MD source check is deliberately OUTSIDE the CI technical replay.
set -Eeuo pipefail
BASE="docs/design/review-agent/acceptance/d3-md-full/agent-author"
OUT="${2:-$(mktemp -d)}"
bash "$BASE/tests/replay-technical.sh" "$OUT"
if [[ $# -ge 1 && -n "$1" ]]; then
  bash "$BASE/tests/verify-source.sh" "$1" "$OUT"
else
  echo 'Original MD source verification: NOT-RUN (provide private source path as first argument; CI never requires it)'
fi

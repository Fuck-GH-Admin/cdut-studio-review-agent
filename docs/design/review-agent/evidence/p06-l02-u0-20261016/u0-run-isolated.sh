#!/usr/bin/env bash
# L02-U0: reproducible, disposable checkout; never switches/pushes a user's branch.
set -u -o pipefail
MAIN_SHA='8989941b6fb5651564e32d11c4215b6a6d5a5209'
EXPECTED_TREE='b3df4773afc20ee46facd2366f35c5a78ee99e98'
ORIGIN='https://github.com/Fuck-GH-Admin/cdut-studio-review-agent.git'
BASE="${1:-$(mktemp -d -t cdut-l02-u0-XXXXXXXX)}"
mkdir -p "$BASE/logs"
printf 'outdir=%s\n' "$BASE"
record() {
  local label="$1"; shift
  local rc
  printf 'START %s %s\n' "$label" "$(date -u +%FT%TZ)" | tee -a "$BASE/command-index.txt"
  ( "$@" ) > "$BASE/logs/$label.stdout" 2> "$BASE/logs/$label.stderr"
  rc=$?
  printf 'END %s exit=%s %s\n' "$label" "$rc" "$(date -u +%FT%TZ)" | tee -a "$BASE/command-index.txt"
  sha256sum "$BASE/logs/$label.stdout" "$BASE/logs/$label.stderr" >> "$BASE/log-sha256.txt"
  if [ "$rc" -ne 0 ]; then
    echo "FIRST_FAILURE=$label EXIT=$rc" | tee -a "$BASE/command-index.txt"
    return "$rc"
  fi
}
record 00-clone git clone --quiet --no-checkout "$ORIGIN" "$BASE/source" || exit $?
record 01-checkout git -C "$BASE/source" -c advice.detachedHead=false checkout --detach "$MAIN_SHA" || exit $?
actual_sha="$(git -C "$BASE/source" rev-parse HEAD)" || exit 1
actual_tree="$(git -C "$BASE/source" rev-parse 'HEAD^{tree}')" || exit 1
printf 'commit=%s\ntree=%s\n' "$actual_sha" "$actual_tree" > "$BASE/source-frozen.txt"
if [ "$actual_sha" != "$MAIN_SHA" ] || [ "$actual_tree" != "$EXPECTED_TREE" ]; then
  echo "MISMATCH: frozen commit/tree differ; STOP" | tee -a "$BASE/command-index.txt"
  exit 2
fi
record 02-local-versions bash -c 'git --version; node --version; bun --version' || exit $?
record 03-frozen-install bash -c 'cd "$1" && ELECTRON_SKIP_BINARY_DOWNLOAD=1 bun install --frozen-lockfile' _ "$BASE/source" || exit $?
record 04-typecheck bash -c 'cd "$1" && bun run typecheck' _ "$BASE/source" || exit $?
record 05-boundaries bash -c 'cd "$1" && bun run check:boundaries' _ "$BASE/source" || exit $?
record 06-skin-contract bash -c 'cd "$1" && bun run --filter=@profer/electron check:skin-contract' _ "$BASE/source" || exit $?
record 07-electron-build bash -c 'cd "$1" && bun run electron:build' _ "$BASE/source" || exit $?
record 08-u0-focused bash -c 'cd "$1" && bun test --isolate --timeout 30000 packages/core/src/office-engine/office-engine.test.ts apps/electron/src/main/lib/document-parse-tools.test.ts apps/electron/src/main/lib/review/document-service.test.ts apps/electron/src/main/lib/review/review-strict-profile.p02.probe.test.ts apps/electron/src/main/lib/review/review-pi-run-bridge.main.test.ts apps/electron/src/renderer/lib/agent-tab-access.test.ts' _ "$BASE/source" || exit $?
record 09-full-tests bash -c 'cd "$1" && bun test --isolate --timeout 30000' _ "$BASE/source" || exit $?
record 10-clean-tree git -C "$BASE/source" status --short || exit $?
echo 'ALL_U0_LOCAL_GATES_EXIT_0. This does NOT assert U1 real Electron/provider or full LIVE.' | tee -a "$BASE/command-index.txt"

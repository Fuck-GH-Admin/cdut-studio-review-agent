#!/usr/bin/env bash
# P06-L02-U0: candidate-bound frozen install + clean worktree evidence. Never reset or ignore filemode.
set -u -o pipefail
ROOT="$(git rev-parse --show-toplevel)"
OUT="$P06_U0_EVIDENCE_DIR"
mkdir -p "$OUT/logs"
: > "$OUT/commands.tsv"
: > "$OUT/first-failure.txt"
BASE="8989941b6fb5651564e32d11c4215b6a6d5a5209"
BASE_TREE="b3df4773afc20ee46facd2366f35c5a78ee99e98"
CLI_BLOB="8c0e1e3ce51c62fee413e643b0bdeca738631133"
CANDIDATE="$(git rev-parse HEAD)"
TREE="$(git rev-parse HEAD^{tree})"
printf 'frozen_main_commit=%s\nfrozen_main_tree=%s\ncandidate_commit=%s\ncandidate_tree=%s\nrunner=%s\n' "$BASE" "$BASE_TREE" "$CANDIDATE" "$TREE" "$RUNNER_NAME" > "$OUT/identity.txt"
record() {
  local name="$1"; shift
  local started ended rc
  started="$(date -u +%FT%TZ)"
  "$@" > "$OUT/logs/$name.log" 2>&1
  rc=$?
  ended="$(date -u +%FT%TZ)"
  printf '%s\t%s\t%s\t%s\n' "$name" "$rc" "$started" "$ended" >> "$OUT/commands.tsv"
  if [ "$rc" -ne 0 ] && [ ! -s "$OUT/first-failure.txt" ]; then
    printf 'label=%s\nexit_code=%s\n' "$name" "$rc" > "$OUT/first-failure.txt"
  fi
  printf '%s exit=%s\n' "$name" "$rc"
}
snapshot() {
  record "$1" bash -c 'git status --porcelain=v1; git diff --raw -- apps/cli/src/index.ts; git diff --summary -- apps/cli/src/index.ts; git ls-files --stage -- apps/cli/src/index.ts; stat -c "%a %n" apps/cli/src/index.ts'
}
finish() {
  printf '%s\n' "$1" > "$OUT/verdict.txt"
  python3 - "$OUT" <<'PY'
import hashlib,json,pathlib,sys
root=pathlib.Path(sys.argv[1])
commands=[]
for row in (root/"commands.tsv").read_text().splitlines():
  p=row.split("\t")
  if len(p)==4: commands.append(dict(stage=p[0],exitCode=int(p[1]),startedUTC=p[2],endedUTC=p[3]))
digests={str(p.relative_to(root)):hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(root.rglob("*")) if p.is_file() and p.name not in ("manifest.json","SHA256SUMS")}
data=dict(identity=(root/"identity.txt").read_text(),verdict=(root/"verdict.txt").read_text().strip(),firstFailure=(root/"first-failure.txt").read_text().strip() or None,commands=commands,fileSHA256=digests,historicMainRun="38867959248",officeIssue71="DEFERRED_FIX",u1="NOT_ADMITTED")
(root/"manifest.json").write_text(json.dumps(data,indent=2,ensure_ascii=False)+"\n")
(root/"SHA256SUMS").write_text("".join(f"{h}  {p}\n" for p,h in sorted(digests.items())))
PY
  test ! -s "$OUT/first-failure.txt"
}
cd "$ROOT" || exit 2
record 00-identity bash -c '
  test "$(git rev-parse HEAD^{tree})" = "$1" &&
  test "$(git rev-parse "$2^{tree}")" = "$3" &&
  git merge-base --is-ancestor "$2" HEAD &&
  test "$(git ls-files --stage -- apps/cli/src/index.ts)" = "100755 $4 0	apps/cli/src/index.ts" &&
  test -z "$(git status --porcelain)" &&
  git log -1 --format="%H %s"
' _ "$TREE" "$BASE" "$BASE_TREE" "$CLI_BLOB"
if [ -s "$OUT/first-failure.txt" ]; then finish "BLOCKED_IDENTITY"; exit 1; fi
record 01-runtime bash -c 'uname -a; git --version; node --version; bun --version; python3 --version'
snapshot 02-before-install
record 03-install bun install --frozen-lockfile
snapshot 03a-after-install
if ! grep -q $'^03-install\t0\t' "$OUT/commands.tsv"; then finish "BLOCKED_INSTALL"; exit 1; fi
record 04-typecheck bun run typecheck
snapshot 04a-after-typecheck
record 05-boundaries bun run check:boundaries
record 06-skin bash -c 'cd apps/electron && bun run check:skin-contract'
record 07-main-build bash -c 'cd apps/electron && bun run build:main'
record 08-preload-build bash -c 'cd apps/electron && bun run build:preload'
record 09-renderer-build bash -c 'cd apps/electron && bun run build:renderer'
snapshot 09a-after-build
record 10-focused bun test --isolate --timeout 30000 \
  packages/core/src/office-engine/office-engine.test.ts \
  apps/electron/src/main/lib/document-parse-tools.test.ts \
  apps/electron/src/main/lib/review/document-service.test.ts \
  apps/electron/src/main/lib/review/review-strict-profile.p02.probe.test.ts \
  apps/electron/src/main/lib/review/review-pi-run-bridge.main.test.ts \
  apps/electron/src/main/lib/review/pi-case-review-service.test.ts \
  apps/electron/src/renderer/lib/agent-tab-access.test.ts \
  apps/electron/src/renderer/components/content-review/review-workspace-recheck-independent.test.ts
snapshot 10a-after-focused
record 11-full bun test --isolate --timeout 30000
snapshot 11a-after-full
record 12-clean-gate bash -c 'test -z "$(git status --porcelain)" && git diff --exit-code && git diff --cached --exit-code'
if [ -s "$OUT/first-failure.txt" ]; then finish "FAIL_KEEP_FIRST_FAILURE"; exit 1; fi
finish "U0_CANDIDATE_ENGINEERING_GATES_PASS_REQUIRES_INDEPENDENT_REVIEW"

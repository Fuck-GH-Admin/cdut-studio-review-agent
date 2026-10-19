# CDUT Studio Review V3｜Dev-A A4-R05 精确 SHA 离线 Gate O 集中验收

> DEV-A-ONLY / 2026-10-19 / 以 #143 最新提交为准。**不是** Gate E 真实 Electron/Provider，也不是 C2 正式 ReviewRun、校方 LIVE 或发布门禁。此文档不是四线共同协议。

## 1. 目的与固定边界

核验 Dev-A #143 的 A1 Owner、A2 C0/V3 技术 proposal、A3 exact-Check、24 轮 SDK turn budget、Main bridge、A4 dispatch fence、真实 Bun/Linux 双 PID/SIGKILL 与 after-await revoke。特别确认 A4-R05：`late-denied` 不会自动重派同一 Run 的 SDK 调用。

起点：工程分支 `feat/v3-dev-a-pi-execution-r01`，GitHub PR https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/143 。本任务文件所在 commit 以及执行时最新工程 HEAD 均需**先钉死完整 40 位 SHA**，不得把旧 SHA 的测试结果或其他分支 CI 当作新 HEAD 结果；执行期间如果远端 HEAD 变化，先完成旧 SHA 独立证据，再决定是否重跑新 SHA。

必须使用隔离、全新且无其他 Agent 写入的工作树；不得在 main、C #144、I #147 或协调 PR #145 提交代码。所有新发现的 A 代码缺陷只修在 A 分支；若牵涉 `review-ipc.ts`、`pi-case-review-service.ts`、shared DTO/Preload、正式 Run consumer，停止受影响片段并报告 Dev-C 请求授权。

## 2. 环境 / 输入锁

- Linux X64 主机；Bun **1.4.0**，Node.js **22**，与 `.github/workflows/ci.yml` / `review-d2-tests.yml` / `review-ci-baseline.yml` 对齐。
- 纯 CI 测试设置 `ELECTRON_SKIP_BINARY_DOWNLOAD=1`；`bun install --frozen-lockfile`。不可因 lockfile 不兼容而运行非冻结安装或修改依赖版本。
- 事先记录 `uname -a`、`bun --version`、`node --version`、`git status --porcelain`、`git rev-parse HEAD` 和 `git ls-remote origin refs/heads/feat/v3-dev-a-pi-execution-r01`。运行前 checkout 明确 SHA 的 **detached HEAD** 并确认干净。
- 依赖安装需 network 或已有离线缓存。缺缓存无法安装为 `BLOCKED_ENV`，不是 `PASS` 也不是单测 `FAIL`。Runner 没有分配时记 `CI_UNASSIGNED`，可用本机离线日志替代为**本机 scoped evidence**，不能冒称 GitHub 同 SHA PR CI 已绿。

## 3. 可直接执行的集中命令（Bash）

在全新 clone / worktree 内，把 `EXPECTED_SHA` 改为本次确切的 40 位工程 HEAD。保存整个 `$LOG_ROOT` 目录（输出、退出码、环境与 Git 源锁），不要在共享工作树上执行。

```bash
set -uo pipefail
EXPECTED_SHA='<本次 #143 精确40位SHA>'
LOG_ROOT="$PWD/../dev-a-gate-o-$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$LOG_ROOT"
git checkout --detach "$EXPECTED_SHA" || exit 2
test "$(git rev-parse HEAD)" = "$EXPECTED_SHA" || exit 2
test -z "$(git status --porcelain)" || { echo 'DIRTY_WORKTREE'; exit 2; }
{
  date -u -Is
  git rev-parse HEAD
  git status --porcelain
  uname -a
  bun --version
  node --version
  git ls-remote origin refs/heads/feat/v3-dev-a-pi-execution-r01
} >"$LOG_ROOT/environment.txt" 2>&1

export ELECTRON_SKIP_BINARY_DOWNLOAD=1
first_failure=''
run_gate () {
  local name="$1"; shift
  echo "RUN $name"
  "$@" 2>&1 | tee "$LOG_ROOT/$name.log"
  local code=${PIPESTATUS[0]}
  printf '%s exit=%s\n' "$name" "$code" | tee -a "$LOG_ROOT/results.txt"
  if [ "$code" -ne 0 ] && [ -z "$first_failure" ]; then first_failure="$name"; fi
  return 0
}
run_gate install bun install --frozen-lockfile
# 如果 install 失败，判定 BLOCKED_ENV，停止；不要跑偶然存在的旧 node_modules。
if grep -q '^install exit=[1-9]' "$LOG_ROOT/results.txt"; then
  echo 'BLOCKED_ENV: dependency install' | tee "$LOG_ROOT/conclusion.txt"
else
  run_gate a4-r05-targeted bun test --isolate --timeout 30000 \
    apps/electron/src/main/lib/review/review-v3-main-sdk-turn-bridge.test.ts \
    apps/electron/src/main/lib/review/review-v3-sdk-physical-turn-port.test.ts \
    apps/electron/src/main/lib/review/review-v3-pi-http-provider-engine.test.ts \
    apps/electron/src/main/lib/review/review-v3-execution-turn-budget.test.ts \
    apps/electron/src/main/lib/review/review-v3-execution-proposal-producer.test.ts \
    apps/electron/src/main/lib/review/review-pi-owner-adapter.test.ts \
    apps/electron/src/main/lib/review/review-pi-owner-adapter-multipid.test.ts \
    apps/electron/src/main/lib/review/review-v3-execution-crashpid.test.ts \
    apps/electron/src/main/lib/review/review-v3-sdk-dispatch-crashpid.test.ts \
    apps/electron/src/main/lib/review/review-v3-execution-late-pid.test.ts
  run_gate typecheck bun run typecheck
  run_gate boundaries bun run check:boundaries
  run_gate skin-contract bash -lc 'cd apps/electron && bun run check:skin-contract'
  run_gate main-build bash -lc 'cd apps/electron && bun run build:main'
  run_gate preload-build bash -lc 'cd apps/electron && bun run build:preload'
  run_gate renderer-build bash -lc 'cd apps/electron && bun run build:renderer'
  run_gate full-bun bun test --isolate --timeout 30000
  run_gate d2-pi bun test --isolate --timeout 30000 apps/electron/src/main/lib/review/review-d2-runtime.test.ts
  for file in pi-case-review-service.test.ts review-authoring-v1.test.ts semantic-module-demo.test.ts template-store.test.ts; do
    run_gate "d2-$file" bun test --isolate --timeout 30000 "apps/electron/src/main/lib/review/$file"
  done
  for file in \
    apps/electron/src/main/lib/review/single-case-workspace.e2e.test.ts \
    apps/electron/src/main/lib/review/run-service-v2.artifacts.test.ts \
    apps/electron/src/main/lib/review/boot-check.test.ts \
    apps/electron/src/main/lib/review/fixtures/all-templates-fixture.test.ts \
    apps/electron/scripts/packaging-guards.test.ts \
    apps/electron/src/main/lib/skin-manager-service.test.ts \
    apps/electron/src/main/lib/agent-workspace-profile.test.ts; do
    run_gate "baseline-$(basename "$file")" bun test --isolate --timeout 30000 "$file"
  done
  echo "First failed stage: ${first_failure:-none}" | tee "$LOG_ROOT/conclusion.txt"
fi
```

**命令审计注意**：脚本为便于一趟集中收集故障而保留后续阶段日志；某步构建失败不代表其后测试可信，最终 PASS 仍须关键阶段全部 exit=0。对 `skin-contract` 退出码也必须核对，不可遗漏。任何非零 exit 应归档**首个**真实失败的完整堆栈、文件/行、命令及原始 SHA，然后在 A owned 源头修复，并以修复后**新 SHA**重新全套验证。

## 4. 必须保留的安全断言（不仅看总数）

1. `A4-DISPATCH-01/04`：SDK 派发意图写盘前 ENOSPC → **0 Provider 调用**；写盘成功却抛 EIO → 冷 reopen `in-flight`，不重派。
2. `A4-DISPATCH-02`、`A3-SDK-11`：SDK 在 Host await 时授权轮换，旧结果不充预算；新 grant 对同 Run 再次调用 SDK 被 `RECOVERY_REQUIRED` 拦截。
3. `A3-SDK-14`、`A4-DISPATCH-07`：AbortSignal 后到达的有效样式 SDK 回执不能记账。**Abort 赢得竞态且 SDK 尚未完成：保留 `in-flight`；SDK 先完成而旧 grant 失效：`late-denied`**。两种状态都在本进程和磁盘 reopen 后禁止自动重派；Provider 调用次数维持 1，预算 0。
4. `A4-DISPATCH-06`、`A3-SDK-09`：不同 dispatchId/Provider 调用使用相同 SDK receiptId → `REQUEST_ID_COLLISION`，不能二次冲抵同一预算轮次。
5. 9/9 exact Check 才允许 `completed-technical`；8/9 / unknown / rejected / 伪造 SourceIdentity / 仅宣称全文读取但未物理覆盖，都不能通过；技术通过不能当正式 C2 ACK。
6. `review-v3-execution-crashpid.test.ts` 与 `late-pid.test.ts`：真实 Linux child OS PID，SIGKILL 冷启动隔离，另 PID await 期间撤权导致 **0 late proposal**。要记录真实 PID、marker、退出代码与暂存目录证据；若平台自动 SKIP，只能记 OS-SKIP，不能 PASS。
7. `V3ASDKTurnBudget` 23/24 不耗尽，24/24 Host 技术 needs-resume；另 grant 不重置；已成功 commit budget 但 terminal 落盘失败只能补 terminal，不能再调用 SDK。
8. `V3ASDKDispatchFence` 仍只是技术 durable intent，不存在自行清账、模拟 Provider 恢复或第二份 ReviewRun writer。
9. **A4-R06-01/02**：真实 Main 分发先持久生成 `dispatchId`，回调 `completed-turn` 或 `interrupted` 必须携带同一 ID；跨派发串回的可疑结果不能扣 SDK 预算、不能写 terminal、不能自动再调 Provider。
10. **A4-R06-03/04**：冷启动读取旧 hash-sealed dispatch journal，若历史 `late-denied` 之后还有新 settled，或不同物理 dispatch 重用了同一 SDK receipt，必须保留原始账本并 `RECOVERY_REQUIRED`，不通过删除异常记录凑 PASS。

### R08 Main cancellation and OS-PID crash gate (new)

- Targeted files: `review-v3-main-sdk-turn-bridge.test.ts` R08-01/02, and Linux-only `review-v3-sdk-dispatch-crashpid.test.ts` R08-PID-01.
- **R08-01**: SDK promise intentionally hangs; Main AbortSignal must reject without waiting for Provider. While native work is still live, even a *second bridge instance* on the same Owner session must be blocked by process-local SDK lock. Late resolution must not emit a proposal, charge a turn, clear in-flight intent or auto-retry.
- **R08-02**: a late Provider *rejection* after Main aborted is observed without unhandled promise rejection, and same-session redispatch remains blocked while provider is unresolved. Once it settles, durable in-flight intent still blocks the old Run.
- **R08-PID-01**: actual Bun/Linux OS child, A-owned Owner + SDK dispatch + turn budget persisted to real files; child SIGKILL inside synthetic SDK callback after durable `claim`. New PID re-opens journals, quarantines old Owner grant, observes **in-flight** SDK intent / 0 completed turns / no technical proposal. Preserve marker PID, signal, SHA and temp file hashes in redacted logs; this is **real OS process test with synthetic Provider**, not Gate E.
- Existing `A3-SDK-14` / `A4-DISPATCH-07` cancellation regressions now expect `in-flight` (if abort wins before SDK promise settles), *not* the old `late-denied` branch. Both states remain `RECOVERY_REQUIRED`. Exact error string must match new implementation and no new provider call is permitted.
- For true Provider Gate E still separately validate native cancellation propagation, actual network/inference call lifetime, SDK retry and image downgrade. A Main timeout is only a wait cancellation; it does not prove upstream Provider physically stopped. Never equate the quick Main error with safe retry.

### R09 cross-Run Provider isolation / global receipt evidence (new)

- Test names `A4-R09-01..07` reside in `review-v3-main-sdk-turn-bridge.test.ts` and **are submitted, not yet executed**. They exercise fresh Run/attempt plus fresh Owner session same Case blocked by unresolved Provider, unrelated Case permitted, cold journal reopen still blocked, legacy unresolved record lacking Case/Owner attribution quarantines all new Runs (no guessed ownership), mixed present/missing attribution treated as corrupt, distinct Run physical dispatch returning same settled receipt rejected, and distinct Run chains with same receipt rejected on cold reopen.
- Actual OS PID child SIGKILL extension in `review-v3-sdk-dispatch-crashpid.test.ts` now includes `R09-PID-02` **within the existing R08-PID-01 test body**: new process creates new Owner session and Run for the same case and fails SDK claim. Record it as one OS test with an added R09 assertion group, not fabricated two separately executed tests.
- Cold historical dispatch journal v1 need not be silently migrated: old unscoped `in-flight` or `late-denied` must fail closed globally for safety, whereas correctly scoped still-unresolved records must only quarantine their Case/Owner session. No deletes or guessed SDK turn receipts.
- Two distinct SDK/provider physical dispatches may never settle against the same `receiptId` **even if Run/case/session differs**. The full ledger scan runs before completed turn budget mutation; the hash-sealed journal decoder independently rejects already persisted collisions. Normal independent Case with unique receipt must continue to work.
- Exact #143 SHA Gate O must verify original Owner/proposal/24-turn tests as well as R09 negatives; `Gate E` still requires installed Pi native API/Provider and independent request/receipt observations. All R09 changes are A-owned technical ledger behavior, not C business recovery or formal Run ACK.

### R10 pinned Pi 0.86.1 real streamFunction / HTTP transport Gate O and Gate E split

- Test file `review-v3-pi-http-provider-engine.test.ts` **plus** `review-v3-main-sdk-turn-bridge.test.ts::A4-R10-16`; verify import/constructor smoke for actual installed `@earendil-works/pi-agent-core` `Agent.streamFunction` (R10-SDK-01). Other R10 cases use fake `AgentSession` and in-memory HTTP but the exact real upstream SDK method signature; **do not confuse with real Provider**.
- R10-01..18 (test names may have gaps; select by exact file) require exactly one `openai-completions`/`openai-responses` HTTPS/SSE fetch, `options.maxRetries=0`, Main selected trusted fetch, server-supplied `x-request-id`, Pi SDK assistant `turn_end`, no second stream/fetch/session re-use, abort propagated to SDK and transport, strict origin and `redirect:error`.
- Negative states include 503, absent request ID, stopReason=error, missing turn_end, opaque upstream fetch, WebSocket/other provider, mismatched HTTPS origin, stream disconnect after response, Main cancellation and identical Main dispatch/native request identity. No synthetic requestId fallback or guesswork.
- `R10-16` verifies same callback travels through `V3APhysicalSDKTurnPort` + durable A4 claim/settle + A3 turn budget **with an in-memory fake Provider transport**; never count as Pi SDK/Provider Gate E.
- **Exact deployed SDK probe:** lock and capture `@earendil-works/pi-coding-agent` / `pi-agent-core` / `pi-ai` dist/package versions `0.86.1`, Bun patch SHA, `AgentSession.agent.streamFunction` writable, OpenAI-compatible API `fetch` honored, Pi outer retry disabled by maxRetries=0. Compare behavior to pinned upstream Git tag `13cbf77df2396303013a41646bcfa77b4271ae56` and keep first failure.
- **Real Gate E separate:** with actual authorized provider and real HTTPS+SSE network, save sanitized physical request count, `x-request-id` response value (redact if identity-sensitive), stream end/abort timings, native retries, proxy flow, correct no-resume on uncertain side effects, and existing V2 sanitizer/payload/PROXY compatibility. Successful mock `Response` and fake `turn_end` are NOT proof of this. No configured provider request ID → `BLOCKED_NATIVE_RECEIPT_API`, do not generate one.
- C-owned integration/file lease remains **unapproved**. Read `A4-R10-PI-0861-TRANSPORT-EVIDENCE-AND-INTEGRATION-CR.md` before editing `pi-agent-adapter.ts`, `pi-review-agent-client.ts`, `review-ipc.ts`, Preload, shared DTO, or formal Run writer; leave them untouched on A branch.

## 5. 留存与报告格式

- `SOURCE_SHA`、`BASE_C0_SHA`、`C_CONTRACT_SHA`、本机/CI 环境、起止 UTC、CI workflow/job（如有）、安装/构建/测试命令 exit、测试总数 PASS/FAIL/SKIP、首败和修复 SHA。
- 针对 P0/P1，`Gate O = PASS_SCOPED` 仅在 **同一最终 SHA** 对应全套命令通过时可写；无 runner 为 `CI_UNASSIGNED`，本机通过则单独写 `LOCAL_GATE_O_PASS`，不伪称 GitHub PR CI success。
- `Gate E=NOT_RUN` 直到真正 Electron/Preload/Main/真实 SDK Provider/隐藏会话/Graph/Batch/双 PID 应用链路验收；`Gate L=BLOCKED_NO_AUTH`；`Gate P=NOT_RUN`。
- 输出压缩包必须脱敏：Provider API key、用户材料、原件路径、Main session token、用户身份/校方回执不得泄露。证据写 #143 A 工程记录；四线进度仅改 #145 文档 `STATUS:A` 段。

### A4-R07 native single-physical-request witness (newly committed, not yet verified)

- Targeted test file `review-v3-sdk-physical-turn-port.test.ts` (R07-01..11 and R07-14) plus integrated bridge tests R07-12/13 in `review-v3-main-sdk-turn-bridge.test.ts`.
- Validate true **in-process native provider-request** start/finish callback, exactly one request, stable nonempty independently observed native receipt and Main-persisted dispatchId. Missing hook / SDK query result.success / message-only and harness-only outputs are **PROVENANCE_UNAVAILABLE** and must NOT write turn or technical terminal.
- Verify native retry, image-fallback secondary provider call, duplicate/mismatched request identity, fabricated dispatchId-as-receipt, native Provider failure, after-cancel and callback after engine has returned all fail closed. In integrated bridge tests, unresolved SDK dispatch remains durable; no C ReviewRun ACK.
- **Caveat**: This is a capability-seam plus injected fake native hook, not evidence that Pi 0.86.1 actually exposes a suitable native physical receipt API. Gate E remains NOT_RUN until real SDK instrumentation/Provider trace proves physical requests correspond to callbacks; do not synthesize native IDs from assistant UUID or count `agent_end` as physical turn.
- On target machine additionally inspect the installed `@earendil-works/pi-coding-agent@0.86.1` and patched event API and save precise `sdk-native-hook-availability` finding. If no safe hook exists, report `BLOCKED_NATIVE_RECEIPT_API` while retaining testable A-only port; never claim a real SDK integration passed.

## 6. R06 回执来源审计补充

`V3AMainSDKTurnPort` 现在强制 `dispatchId` 参数和回执配对，但这只阻止**拿错已经持久化意图**的结果。单纯 `SDKMessage.result.success`、assistant UUID、Pi Harness `agent_end` 不能证明真实独立 SDK Provider turn 完成；合成测试自动 echo `dispatchId` 不构成 Gate E。集中实机时必须额外确认 Main SDK Host 回执的实际来源、唯一物理调用次数、native retry、带图失败后文本重发和 SDK cancel/worker 终态。

## 7. 下一批不是自动接线

目前 #143 的 `V3ASDKTurnBridge` 尚无真实 SDK Main callback 注册。旧 `pi-review-agent-client.ts` 使用 Pi `options.query()` + `SDKMessage`，旧 Pi SDK adapter `onHarnessLifecycle` 只是无稳定 receiptId 的被动观测；不能用任何随机 ID/模型字符串替代真实物理 turn receipt。为新 Main 注入建立清晰 Host receipt provenance 与 Provider abort / native retry / 图像降级计数后，才交 I/C 集成验证。C 独占真实 Run writer/ACK/共享 DTO/IPC，未授权前不动这些文件。

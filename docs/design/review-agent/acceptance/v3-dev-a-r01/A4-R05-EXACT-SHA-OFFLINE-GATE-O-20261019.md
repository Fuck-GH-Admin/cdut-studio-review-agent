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
    apps/electron/src/main/lib/review/review-v3-execution-turn-budget.test.ts \
    apps/electron/src/main/lib/review/review-v3-execution-proposal-producer.test.ts \
    apps/electron/src/main/lib/review/review-pi-owner-adapter.test.ts \
    apps/electron/src/main/lib/review/review-pi-owner-adapter-multipid.test.ts \
    apps/electron/src/main/lib/review/review-v3-execution-crashpid.test.ts \
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
3. `A3-SDK-14`、`A4-DISPATCH-07`：AbortSignal 迟到有效样式 SDK 回执不能记账，`late-denied` 在本进程和磁盘 ledger reopen 后均不重派；SDK 物理调用次数保持 1，预算保持 0。
4. `A4-DISPATCH-06`、`A3-SDK-09`：不同 dispatchId/Provider 调用使用相同 SDK receiptId → `REQUEST_ID_COLLISION`，不能二次冲抵同一预算轮次。
5. 9/9 exact Check 才允许 `completed-technical`；8/9 / unknown / rejected / 伪造 SourceIdentity / 仅宣称全文读取但未物理覆盖，都不能通过；技术通过不能当正式 C2 ACK。
6. `review-v3-execution-crashpid.test.ts` 与 `late-pid.test.ts`：真实 Linux child OS PID，SIGKILL 冷启动隔离，另 PID await 期间撤权导致 **0 late proposal**。要记录真实 PID、marker、退出代码与暂存目录证据；若平台自动 SKIP，只能记 OS-SKIP，不能 PASS。
7. `V3ASDKTurnBudget` 23/24 不耗尽，24/24 Host 技术 needs-resume；另 grant 不重置；已成功 commit budget 但 terminal 落盘失败只能补 terminal，不能再调用 SDK。
8. `V3ASDKDispatchFence` 仍只是技术 durable intent，不存在自行清账、模拟 Provider 恢复或第二份 ReviewRun writer。

## 5. 留存与报告格式

- `SOURCE_SHA`、`BASE_C0_SHA`、`C_CONTRACT_SHA`、本机/CI 环境、起止 UTC、CI workflow/job（如有）、安装/构建/测试命令 exit、测试总数 PASS/FAIL/SKIP、首败和修复 SHA。
- 针对 P0/P1，`Gate O = PASS_SCOPED` 仅在 **同一最终 SHA** 对应全套命令通过时可写；无 runner 为 `CI_UNASSIGNED`，本机通过则单独写 `LOCAL_GATE_O_PASS`，不伪称 GitHub PR CI success。
- `Gate E=NOT_RUN` 直到真正 Electron/Preload/Main/真实 SDK Provider/隐藏会话/Graph/Batch/双 PID 应用链路验收；`Gate L=BLOCKED_NO_AUTH`；`Gate P=NOT_RUN`。
- 输出压缩包必须脱敏：Provider API key、用户材料、原件路径、Main session token、用户身份/校方回执不得泄露。证据写 #143 A 工程记录；四线进度仅改 #145 文档 `STATUS:A` 段。

## 6. 下一批不是自动接线

目前 #143 的 `V3ASDKTurnBridge` 尚无真实 SDK Main callback 注册。旧 `pi-review-agent-client.ts` 使用 Pi `options.query()` + `SDKMessage`，旧 Pi SDK adapter `onHarnessLifecycle` 只是无稳定 receiptId 的被动观测；不能用任何随机 ID/模型字符串替代真实物理 turn receipt。为新 Main 注入建立清晰 Host receipt provenance 与 Provider abort / native retry / 图像降级计数后，才交 I/C 集成验证。C 独占真实 Run writer/ACK/共享 DTO/IPC，未授权前不动这些文件。

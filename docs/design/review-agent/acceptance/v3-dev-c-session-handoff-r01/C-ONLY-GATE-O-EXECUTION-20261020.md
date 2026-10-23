# Dev-C 专属｜C1-R10b + C2-R00 精确 SHA 集中 Gate O 执行与证据交接

> **C 会话专属文档，非 A/B/I 共同任务书。** 协调约束以四线唯一 `ABCI-UNIFIED-COORDINATION-AND-STATUS.md` 为准。本文不授予 I 任何 Main/Preload/Case/Run 写入权，也不构成 A/B 下一轮任务发布。

## 1. 固定目标与实际裁决

- C 工程 Draft：[#144](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144)
- 工程分支：`feat/v3-dev-c-business-r01`
- **当前正式冻结 SHA：`0e6746d1ff39cfd4523621a93ab567cd2e1e7b11`。** 后续若需首败修复，必须单独记录旧 SHA 的首败/静态发现、生成新精确 SHA 和全量新测试；不得把旧 SHA 的 CI 结果计到新提交。
- 上一个目标 SHA：`00322e9eb946059e67d3709d59604200e37f05cc`。
- 唯一新增修复：`review-v3-technical-ledger.test.ts`，commit `0e6746d1...`：
  1. 缺 Main attestation 的函数在构造 Promise 前**同步抛错**，原 `await expect(call()).rejects` 不会捕获；改为 `expect(() => call()).toThrow`。
  2. `submitCommand` 相同 `requestId` 的重试只返回**既有 Receipt**，不会生成新 receipt；测试长度期望从 `initial+2` 改为 `initial+1`。
- 上述两项来自独立源码/契约核对，**不是 CI 实际失败日志**；生产代码无改动。
- 冻结后不再继续 C1/C2 功能开发。允许 PR docs/comments 和协调分支单独记录运维与验收；不继续无意义新工程提交重置 Actions 队列。

## 2. 本次真实 GitHub CI 现场（未跑）

针对 `0e6746d1ff39cfd4523621a93ab567cd2e1e7b11`：

| Workflow | Run ID | Job ID | 现场 status | 实际步骤 |
| --- | ---: | ---: | --- | ---: |
| PR CI | 39282969635 | 118160951534 | queued | 0 |
| Review Baseline CI | 39282969441 | 118160957913 | queued | 0 |
| D1 Review Authoring Tests | 39282969233 | 118160950011 | queued | 0 |
| D2 Scoped Pi Review Tests | 39282969787 | 118160951736 | queued | 0 |
| Review batch focused tests | 39282969433 | 118160951029 | queued | 0 |

API 已对五条 workflow 分别读 `jobs`；任何一个尚无实际步骤、exit、PASS/FAIL/SKIP。此时 `Gate O = BLOCKED_CI_EXECUTION / NOT_ATTESTED`，不是 PASS，也不是 CODE_FAILURE。旧 C0 [#141](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/141) @ `5682057c...` 五条 CI 成功**不适用于这个精确 C SHA**。

独立工具容器检查：无完整私有源码 checkout，无 Bun，`git ls-remote github.com` 因 DNS 无法解析失败；所以 **未运行**安装、typecheck、Bun、build 或真正 Electron。本会话没有能力替用户启动失联的 self-hosted GitHub Runner；不得将静态审查/测试源码存在冒充 Gate O。

## 3. 唯一执行命令（本地 Linux Agent 或恢复后的 self-hosted Runner）

在**独立检出/工作树**运行，保留 C 工程分支不被验收临时文件污染：

```bash
git fetch origin feat/v3-dev-c-business-r01
git worktree add --detach ../review-v3-c-gate-o-0e6746d1 0e6746d1ff39cfd4523621a93ab567cd2e1e7b11
cd ../review-v3-c-gate-o-0e6746d1
git rev-parse HEAD
git status --porcelain
node --version
bun --version
bun install --frozen-lockfile
bun run typecheck
bun run check:boundaries
bun test --isolate \
  apps/electron/src/main/lib/review/review-c0-ipc.test.ts \
  apps/electron/src/main/lib/review/review-v3-execution-contract.test.ts \
  apps/electron/src/main/lib/review/review-v3-technical-ledger.test.ts \
  apps/electron/src/main/lib/review/native-workspace-case-v3.test.ts \
  apps/electron/src/main/lib/review/review-v3-legacy-entry-gates.test.ts \
  apps/electron/src/main/lib/review/plan-binding-v3.test.ts \
  apps/electron/src/renderer/components/content-review/NativeManualItemDialog.test.ts \
  apps/electron/src/renderer/components/content-review/review-actions-controller.test.ts
bun test --isolate --timeout 30000
bun run --filter='@profer/electron' build:main
bun run --filter='@profer/electron' build:preload
bun run --filter='@profer/electron' build:renderer
git status --porcelain
```

上述脚本名称已据仓库 `package.json`、`apps/electron/package.json`、`bunfig.toml` 精确核对。依照 PR CI 的真实步骤/条件，若 CI 还额外运行 skin/check 或 Node-only 套件，同样必须补齐并保留日志；不得以本表少数脚本代替 CI 全部门禁。

操作时逐命令保留 **stdout/stderr、shell exit code、开始结束时间、Bun/Node/OS、检出 SHA、PASS/FAIL/SKIP 计数及首个失败位置**。Bash 管道使用 `set -o pipefail`，`tee` 日志后必须记录原始程序的 `PIPESTATUS[0]`，不要只看 `tee` 成功。大型本地测试可以集中一趟完成，不需要逐批重复 Electron 手工验收。

## 4. 首败决策树

1. **GitHub CI 分配/服务问题**：先查 GitHub Actions self-hosted Runner 的 online/busy/授权/标签 `self-hosted,Linux,X64` 与服务日志（只有具备 Runner 管理权的人可操作）。不取消本 SHA 的队列重置。若恢复，直接消费同 SHA 已排队的 job。
2. **install/环境失败**：保留完整命令/exit/环境和 dependency cache/磁盘权限原因；不可通过变更 lockfile 或略过 strict install 欺骗通过。
3. **TS/boundaries/测试首败**：从确切的源文件、行号、最小复现独立修复，仅 C-owned 路径允许 C 更改；禁止改旧断言绕过功能/安全错误。按一次明确独立修复提交出新的 SHA，重跑 **全部** Gate O，并把历史失败与最新验证区分。
4. **构建和全量回归**：按同 SHA 跑完 Main/Preload/Renderer 构建及既有回归；先前目标只有专项通过不能标 Gate O PASS。
5. **CI 与 LOCAL 差异**：本地执行成功单列 `LOCAL_GATE_O_PASS_EXACT_SHA`，GitHub CI 无运行时仍为 `CI_BLOCKED`。上传实际日志作为 provenance；不得隐去失败或跳过值。

## 5. 首批证据归档/关闭标准

- `git rev-parse HEAD` 的完整 40 字符 SHA 与 `git status --porcelain` 原样输出。
- `install/typecheck/boundaries/focused/full Bun/build main/preload/renderer` 每项命令、exit code、PASS/FAIL/SKIP、原始日志链接。
- GitHub 5 条 exact HEAD workflow + jobs + first failing step、runner ID。若仍 queued，保存状态和时间，仍 `BLOCKED_CI_EXECUTION`。
- 已发现静态修复两个具体差异，不得将其称为已通过 2 个测试。
- Gate O 获有效真实证据后才允许 C 在 #145 `DECISIONS:C` 签 `C-GATE-O-R01-PASS_EXACT_SHA`；不自动批准 Gate E/L/P，I 的 Main lease 和 Business writer 同样不改变。
- 若测试运行无法启动，应明确签 `BLOCKED_INFRA` 并归档现有结果，**不是“第一步已全部完成”**。

## 6. 范围外

不代替 Dev-A 的物理 Pi SDK Provider 回执，不把 Dev-B candidate-held 政策变成已发布 Gold，不让 Integrator-I 越权改 C 的正式 Main/Case/Run 事务；本次不安排 A/B 下一轮工程。完成 Gate O 后，C 再以正式协议对 A/B/I 发布下一冻结锚点与集成条件。

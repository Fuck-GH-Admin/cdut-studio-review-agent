---
path: .github/workflows/review-batch-tests.yml
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d7a6f567e370d76cda55d7f67cd72b18af7d035b
sha256: f64bf27e544dbee51df68f5ceeb408e98b1b97e3b2358ee942de9a3c7edb0dba
lines: 50
kind: config
package: p01-app-shell
author: docs-r07-author-extra-02-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# .github/workflows/review-batch-tests.yml

## 1. 结论与边界

GitHub Actions workflow `Review batch focused tests`（50 行）：评审批次（batch triage/queue）定向回归门，按 paths 过滤在相关文件变更的 PR 上跑 13 个指定测试文件。单 job `test-batch`，`ubuntu-latest`。本轮 `NOT_RUN`（纯静态阅读，未运行任何 CI）。

## 2. 导出与关键符号

键清单：

| 键 | 行 | 值/摘要 |
| --- | --- | --- |
| name | `.github/workflows/review-batch-tests.yml:1` | Review batch focused tests |
| on.pull_request.paths | `:5-24` | 19 条 glob（含自引用 `:24`） |
| on.workflow_dispatch | `:25` | 手工触发 |
| permissions | `:27-28` | contents: read |
| concurrency | `:30-32` | group `review-batch-${{ github.ref }}`，cancel-in-progress: true |
| jobs.test-batch | `:34-36` | 单 job，runs-on ubuntu-latest |
| env.ELECTRON_SKIP_BINARY_DOWNLOAD | `:37-38` | '1' |
| steps | `:39-50` | 5 步（见 §3） |

无 secrets、无 matrix、无 cache、无上传产物、无 `if:`/`continue-on-error`（依据：全文无这些键）。

## 3. 内部逻辑与关键流程

paths 过滤（`.github/workflows/review-batch-tests.yml:6-23`）覆盖 review 批次相关源：`packages/shared/src/review/batch-review-triage*`、`apps/electron/src/main/lib/review/` 下 `batch-store*`、`review-storage-id*`、`review-ipc-path.test.ts`、`run-store-v2.ts`、`case-store-v2.ts`、`application-service.ts`、`batch-group-action-service*`、`batch-automation-*`、`workspace-business-service-v2.ts`、`review-ipc-actor-guard*`、`stage-workflow.ts`、`real-chain-journey.test.ts`、`review-ipc.ts`，渲染层 `BatchAutomationDialog.tsx`/`BatchPanel.tsx`/`batch-ui-feedback*`（`:21-23`），`test/preload-electron-mock.ts`（`:10`），及本文件自引用（`:24`）。

job `test-batch` 的 5 个 step（`:39-50`）：`actions/checkout@v4`（`:40`）、`oven-sh/setup-bun@v2` `bun-version: 1.4.0`（`:41-43`）、`actions/setup-node@v4` node 22（`:44-46`）、`bun install --frozen-lockfile`（`:47-48`）、`bun test --isolate --timeout 30000` 指定 13 个测试文件（`:49-50`）：batch-review-triage/batch-store/batch-group-action-service/batch-automation-service/stage-workflow/workspace-business-service-v2/case-store-v2/template-store/review-ipc-actor-guard/real-chain-journey/review-storage-id/batch-ui-feedback/review-ipc-path（13 个文件在冻结树均存在，已核对）。

## 4. 调用者与调用链

- 入向：`pull_request` 命中 paths（`.github/workflows/review-batch-tests.yml:4-24`）或 `workflow_dispatch`（`:25`）；无 `workflow_call`，冻结树检索无其它 workflow 调用它；无文档引用（`review-batch-tests` 全文检索命中为零，仅本文件自身文件名/标题）。
- 出向：`actions/checkout@v4`/`oven-sh/setup-bun@v2`/`actions/setup-node@v4`（`:40`-`:45`）；13 个被测文件（`:50`，路径同 §3）；不调用其它 workflow/脚本。

## 5. 数据 I/O、读写与副作用

写 `node_modules`（`:48`）与测试临时产物；无 artifact 上传、无 cache（依据：全文无相关键）。runner 一次性。

## 6. 分支、失败、取消与恢复

`concurrency` 同 ref 取消旧运行（`.github/workflows/review-batch-tests.yml:30-32`，cancel-in-progress: true）。任一测试失败即 job 失败，无容错键（`continue-on-error`/`if:` 全文无）。`--frozen-lockfile` 不一致即失败（`:48`）。无超时配置（未知上限）。

## 7. 权限与权威状态

GITHUB_TOKEN 仅 `contents: read`（`.github/workflows/review-batch-tests.yml:27-28`）；无 secrets（全文无 `secrets.`）。`ELECTRON_SKIP_BINARY_DOWNLOAD: '1'`（`:38`）跳过 Electron 二进制下载。

## 8. 修改影响面

批次评审子系统（batch-store/batch-automation/stage-workflow 等）的 PR 定向门；bun 固定 `1.4.0`（`:43`），与 `ci.yml`/`release.yml` 的 1.4.2 不一致，属既有事实。paths 增删会改变触发面。

## 9. 测试证据

`NOT_RUN`。无直接测试（本 workflow 即测试编排者），依据：冻结树 `*.test.*` 检索 `.github/workflows|workflows/` 无引用。间接：其执行的 13 个测试文件本身是被测业务代码的测试（如 `apps/electron/src/main/lib/review/batch-store.test.ts` 存在），属间接证据。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 触发 paths/权限/并发/5 步/13 测试文件 | 已证实 | `.github/workflows/review-batch-tests.yml:1-50` 全文 |
| 13 个测试文件存在性 | 已证实 | 冻结树逐文件核对 |
| 实际运行结果 | 未知 | NOT_RUN |

## 11. 覆盖表

| 键/步骤 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| on.paths 19 条 | §3 | 5-24 | covered |
| permissions/concurrency/env | §2/§6/§7 | 27-38 | covered |
| 5 个 steps | §3 | 39-50 | covered |
| 运行验证 | §9 | - | unknown |

---
path: .github/workflows/review-ci-baseline.yml
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d935c32ccbde4d666f93ed1f75a411d021dfd29a
sha256: 4b61ced798790de6fefbb97a314a8874a555a0ca95816ad094b3c06d147ab853
lines: 31
kind: config
package: p01-app-shell
author: docs-r07-author-extra-02-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# .github/workflows/review-ci-baseline.yml

## 1. 结论与边界

GitHub Actions workflow `Review Baseline CI`（31 行）：评审域基线回归门，仅在 `apps/electron/src/main/lib/review/**` 变更的 PR 上跑 4 条基线测试。单 job `review-baseline`，`ubuntu-latest`。本轮 `NOT_RUN`（纯静态阅读，未运行任何 CI）。

## 2. 导出与关键符号

键清单：

| 键 | 行 | 值/摘要 |
| --- | --- | --- |
| name | `.github/workflows/review-ci-baseline.yml:1` | Review Baseline CI |
| on.pull_request.paths | `:4-6` | `apps/electron/src/main/lib/review/**`、自引用 `:6` |
| on.workflow_dispatch | `:7` | 手工触发 |
| permissions | `:9-10` | contents: read |
| jobs.review-baseline | `:12-14` | 单 job，runs-on ubuntu-latest |
| env.ELECTRON_SKIP_BINARY_DOWNLOAD | `:15-16` | '1' |
| steps | `:17-31` | 5 步（见 §3） |

无 concurrency（依据：全文无 `concurrency` 键，与 review-batch-tests.yml 不同）、无 secrets、无 matrix、无 cache、无上传产物、无 `if:`/`continue-on-error`。

## 3. 内部逻辑与关键流程

job `review-baseline` 的 5 个 step（`.github/workflows/review-ci-baseline.yml:17-31`）：`actions/checkout@v4`（`:18`）、`oven-sh/setup-bun@v2` `bun-version: 1.4.0`（`:19-21`）、`actions/setup-node@v4` node 22（`:22-24`）、`bun install --frozen-lockfile`（`:25`）、`Focused baseline regressions`（`:26-31`）：4 条独立 `bun test --isolate --timeout 30000` 命令——`single-case-workspace.e2e.test.ts`（`:28`）、`run-service-v2.artifacts.test.ts`（`:29`）、`boot-check.test.ts`（`:30`）、`fixtures/all-templates-fixture.test.ts`（`:31`），均在冻结树存在（已核对）。

## 4. 调用者与调用链

- 入向：`pull_request` 命中 `apps/electron/src/main/lib/review/**` 或本文件（`.github/workflows/review-ci-baseline.yml:3-6`）、`workflow_dispatch`（`:7`）；无 `workflow_call`，冻结树检索无其它 workflow/文档引用本文件。
- 出向：`actions/checkout@v4`/`oven-sh/setup-bun@v2`/`actions/setup-node@v4`（`:18`-`:23`）；4 个被测文件（`:28`-`:31`）；不调用其它 workflow 或脚本。

## 5. 数据 I/O、读写与副作用

写 `node_modules`（`:25`）与测试临时产物；无 artifact 上传、无 cache（依据：全文无相关键）。runner 一次性。

## 6. 分支、失败、取消与恢复

无 concurrency/cancel-in-progress（依据：全文无该键），同 ref 并行运行互不取消。任一测试失败即 job 失败，无容错键。`--frozen-lockfile`（`:25`）不一致即失败。无超时配置（未知上限）。

## 7. 权限与权威状态

GITHUB_TOKEN 仅 `contents: read`（`.github/workflows/review-ci-baseline.yml:9-10`）；无 secrets（全文无 `secrets.`）。`ELECTRON_SKIP_BINARY_DOWNLOAD: '1'`（`:16`）跳过 Electron 二进制下载。

## 8. 修改影响面

评审域 `review/**` 的基线回归门；paths 覆盖整个 review 主进程目录（`:5`）。bun 固定 `1.4.0`（`:21`），与 ci.yml/release.yml 的 1.4.2 不一致，属既有事实。

## 9. 测试证据

`NOT_RUN`。无直接测试（本 workflow 即测试编排者），依据：冻结树 `*.test.*` 检索 `.github/workflows|workflows/` 无引用。间接：其执行的 4 个测试文件在冻结树存在（如 `apps/electron/src/main/lib/review/boot-check.test.ts`），属间接证据。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 触发/权限/5 步/4 条测试命令/无 concurrency | 已证实 | `.github/workflows/review-ci-baseline.yml:1-31` 全文 |
| 4 个测试文件存在性 | 已证实 | 冻结树逐文件核对 |
| 实际运行结果 | 未知 | NOT_RUN |

## 11. 覆盖表

| 键/步骤 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| on.paths 2 条 | §3 | 4-6 | covered |
| permissions/env（无 concurrency） | §2/§6/§7 | 9-16 | covered |
| 5 个 steps | §3 | 17-31 | covered |
| 运行验证 | §9 | - | unknown |

---
path: .github/workflows/review-d2-tests.yml
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 01a03c66ff93777bb9f805c061476a56bad022ef
sha256: e99b252b9f79d826c06e69f04c73db53e45cbc27a0d708078e5dd4f6f90cc341
lines: 38
kind: config
package: p01-app-shell
author: docs-r07-author-extra-02-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# .github/workflows/review-d2-tests.yml

## 1. 结论与边界

GitHub Actions workflow `D2 Scoped Pi Review Tests`（38 行）：D2 情景限定 Pi 评审运行时的 BDD 与既有 Pi/编写回归门。单 job `scoped-pi`（`.github/workflows/review-d2-tests.yml:16`），`ubuntu-latest`。本轮 `NOT_RUN`（纯静态阅读，未运行任何 CI）。

## 2. 导出与关键符号

键清单：

| 键 | 行 | 值/摘要 |
| --- | --- | --- |
| name | `.github/workflows/review-d2-tests.yml:1` | D2 Scoped Pi Review Tests |
| on.pull_request.paths | `:4-11` | 7 条 glob（含自引用 `:11`） |
| on.workflow_dispatch | `:12` | 手工触发 |
| permissions | `:13-14` | contents: read |
| jobs.scoped-pi | `:15-17` | 单 job，runs-on ubuntu-latest |
| env.ELECTRON_SKIP_BINARY_DOWNLOAD | `:18-19` | '1' |
| steps | `:20-38` | 7 步（见 §3） |

无 concurrency（依据：全文无 `concurrency` 键）、无 secrets、无 matrix、无 cache、无上传产物、无 `if:`/`continue-on-error`。

## 3. 内部逻辑与关键流程

paths 过滤（`.github/workflows/review-d2-tests.yml:5-11`）：`packages/shared/src/types/review-d2.ts`、`review-v2-contracts.ts`、`types/index.ts`、`apps/electron/src/main/lib/review/**`、`apps/electron/scripts/review-d2-plan.ts`、`docs/design/review-agent/fixtures/d2-**`、本文件自引用（`:11`）。

job `scoped-pi` 的 7 个 step（`:20-38`）：`actions/checkout@v4`（`:21`）、`oven-sh/setup-bun@v2` `bun-version: 1.4.0`（`:22-24`）、`actions/setup-node@v4` node 22（`:25-27`）、`bun install --frozen-lockfile`（`:28`）、`Typecheck all workspaces`（`:29-30`，`bun run typecheck` → 根 `package.json:24`）、`D2 scoped Pi BDD`（`:31-32`，`review-d2-runtime.test.ts`）、`Existing Pi run and authoring regressions`（`:33-38`）：4 条独立 `bun test --isolate --timeout 30000`——`pi-case-review-service.test.ts`（`:35`）、`review-authoring-v1.test.ts`（`:36`）、`semantic-module-demo.test.ts`（`:37`）、`template-store.test.ts`（`:38`）。5 个测试文件在冻结树存在（已核对）。

## 4. 调用者与调用链

- 入向：`pull_request` 命中 paths（`.github/workflows/review-d2-tests.yml:3-11`）、`workflow_dispatch`（`:12`）；无 `workflow_call`，冻结树检索无其它 workflow/文档引用本文件（`docs/design/review-agent/19-d2-scenario-scoped-pi-runtime.md:38-55` 仅演示 `review-d2-plan.ts` CLI，非 workflow 引用）。
- 出向：`actions/checkout@v4`/`oven-sh/setup-bun@v2`/`actions/setup-node@v4`（`:21`-`:26`）；npm 脚本 `typecheck`（`package.json:24`）；5 个被测文件（`:32`、`:35`-`:38`）。不调用其它 workflow/脚本。

## 5. 数据 I/O、读写与副作用

写 `node_modules`（`:28`）与测试临时产物；无 artifact 上传、无 cache（依据：全文无相关键）。runner 一次性。

## 6. 分支、失败、取消与恢复

无 concurrency/cancel-in-progress（依据：全文无该键）。任一 step 失败即 job 失败，无容错键。`--frozen-lockfile`（`:28`）不一致即失败。无超时配置（未知上限）。

## 7. 权限与权威状态

GITHUB_TOKEN 仅 `contents: read`（`.github/workflows/review-d2-tests.yml:13-14`）；无 secrets（全文无 `secrets.`）。`ELECTRON_SKIP_BINARY_DOWNLOAD: '1'`（`:19`）跳过 Electron 二进制下载。

## 8. 修改影响面

D2 情景限定 Pi 运行时（`review-d2.ts` 类型、`review/**` 实现、`review-d2-plan.ts` CLI、d2 fixtures）的 PR 定向门；回归组守住 Pi run 与 D1/D0.5/模板兼容（`:33-38`）。bun 固定 `1.4.0`（`:24`）。

## 9. 测试证据

`NOT_RUN`。无直接测试（本 workflow 即测试编排者），依据：冻结树 `*.test.*` 检索 `.github/workflows|workflows/` 无引用。间接：其执行的 5 个测试文件在冻结树存在；`docs/design/review-agent/19-d2-scenario-scoped-pi-runtime.md:68` 描述 `review-d2-runtime.test.ts` 的覆盖范围（间接证据，设计文档叙述）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 触发/权限/7 步/5 条测试命令/无 concurrency | 已证实 | `.github/workflows/review-d2-tests.yml:1-38` 全文 |
| 被测文件存在性 | 已证实 | 冻结树逐文件核对 |
| 实际运行结果 | 未知 | NOT_RUN |

## 11. 覆盖表

| 键/步骤 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| on.paths 7 条 | §3 | 4-11 | covered |
| permissions/env（无 concurrency） | §2/§6/§7 | 13-19 | covered |
| 7 个 steps | §3 | 20-38 | covered |
| 运行验证 | §9 | - | unknown |

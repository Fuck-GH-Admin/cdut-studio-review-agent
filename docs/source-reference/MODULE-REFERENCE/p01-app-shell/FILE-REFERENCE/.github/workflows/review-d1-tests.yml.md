---
path: .github/workflows/review-d1-tests.yml
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 84731d2cecac00605afa6636ed779ed375ddf67f
sha256: 06a494b13501662ad356cda70522f0240d5303f5eeeed6d5d0b0de3466fbc41a
lines: 38
kind: config
package: p01-app-shell
author: docs-r07-author-extra-02-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# .github/workflows/review-d1-tests.yml

## 1. 结论与边界

GitHub Actions workflow `D1 Review Authoring Tests`（38 行）：D1 评审编写契约（contract/parity/history）与回归门。单 job `authoring`（display name `D1 contract, parity, history, and regressions`，`.github/workflows/review-d1-tests.yml:18`），`ubuntu-latest`。本轮 `NOT_RUN`（纯静态阅读，未运行任何 CI）。

## 2. 导出与关键符号

键清单：

| 键 | 行 | 值/摘要 |
| --- | --- | --- |
| name | `.github/workflows/review-d1-tests.yml:1` | D1 Review Authoring Tests |
| on.pull_request.paths | `:4-10` | 6 条 glob（含自引用 `:10`） |
| on.workflow_dispatch | `:11` | 手工触发 |
| permissions | `:13-14` | contents: read |
| jobs.authoring | `:16-19` | 单 job，runs-on ubuntu-latest |
| env.ELECTRON_SKIP_BINARY_DOWNLOAD | `:20-21` | '1' |
| steps | `:22-38` | 8 步（见 §3） |

无 concurrency（依据：全文无 `concurrency` 键）、无 secrets、无 matrix、无 cache、无上传产物、无 `if:`/`continue-on-error`。

## 3. 内部逻辑与关键流程

paths 过滤（`.github/workflows/review-d1-tests.yml:5-10`）：`packages/shared/src/types/review-authoring-v1.ts`、`packages/shared/src/types/index.ts`、`apps/electron/src/main/lib/review/review-authoring-*.ts`、`template-store.ts`、`apps/electron/scripts/review-authoring-v1.ts`、本文件自引用（`:10`）。

job `authoring` 的 8 个 step（`:22-38`）：`actions/checkout@v4`（`:23`）、`oven-sh/setup-bun@v2` `bun-version: 1.4.0`（`:24-26`）、`actions/setup-node@v4` node 22（`:27-29`）、`bun install --frozen-lockfile`（`:30`）、`Full TypeScript check`（`:31-32`，`bun run typecheck` → 根 `package.json:24`）、`D1 authoring tests`（`:33-34`，`review-authoring-v1.test.ts`）、`D0.5 boundary regressions`（`:35-36`，`semantic-module-demo.test.ts`）、`Existing template regressions`（`:37-38`，`template-store.test.ts`）。三个测试文件在冻结树存在（已核对）。

## 4. 调用者与调用链

- 入向：`pull_request` 命中 paths（`.github/workflows/review-d1-tests.yml:3-10`）、`workflow_dispatch`（`:11`）；无 `workflow_call`，冻结树检索无其它 workflow/文档引用本文件。
- 出向：`actions/checkout@v4`/`oven-sh/setup-bun@v2`/`actions/setup-node@v4`（`:23`-`:28`）；npm 脚本 `typecheck`（`package.json:24`）；3 个被测文件（`:34`、`:36`、`:38`）。不调用其它 workflow/脚本。

## 5. 数据 I/O、读写与副作用

写 `node_modules`（`:30`）与测试临时产物；无 artifact 上传、无 cache（依据：全文无相关键）。runner 一次性。

## 6. 分支、失败、取消与恢复

无 concurrency/cancel-in-progress（依据：全文无该键）。任一 step 失败即 job 失败，无容错键。`--frozen-lockfile`（`:30`）不一致即失败。无超时配置（未知上限）。

## 7. 权限与权威状态

GITHUB_TOKEN 仅 `contents: read`（`.github/workflows/review-d1-tests.yml:13-14`）；无 secrets（全文无 `secrets.`）。`ELECTRON_SKIP_BINARY_DOWNLOAD: '1'`（`:21`）跳过 Electron 二进制下载。

## 8. 修改影响面

D1 编写契约（`review-authoring-v1.ts` 类型/实现）与 D0.5/template-store 的回归门；D1 测试同时守住 D0.5 边界与既有模板（`:35-38`）。bun 固定 `1.4.0`（`:26`）。

## 9. 测试证据

`NOT_RUN`。无直接测试（本 workflow 即测试编排者），依据：冻结树 `*.test.*` 检索 `.github/workflows|workflows/` 无引用。间接：其执行的 `review-authoring-v1.test.ts`/`semantic-module-demo.test.ts`/`template-store.test.ts` 在冻结树存在，属间接证据。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 触发/权限/8 步/3 条测试命令/无 concurrency | 已证实 | `.github/workflows/review-d1-tests.yml:1-38` 全文 |
| 被测文件存在性 | 已证实 | 冻结树逐文件核对 |
| 实际运行结果 | 未知 | NOT_RUN |

## 11. 覆盖表

| 键/步骤 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| on.paths 6 条 | §3 | 4-10 | covered |
| permissions/env（无 concurrency） | §2/§6/§7 | 13-21 | covered |
| 8 个 steps | §3 | 22-38 | covered |
| 运行验证 | §9 | - | unknown |

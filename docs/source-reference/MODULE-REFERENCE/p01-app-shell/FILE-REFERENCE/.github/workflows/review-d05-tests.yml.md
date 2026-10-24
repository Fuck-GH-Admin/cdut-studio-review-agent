---
path: .github/workflows/review-d05-tests.yml
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8fde2d2c7f0764fb1aa2181a91b7ad7381508392
sha256: df1dcbd4bfd149267debfcf6390fe86a87b55b4e8940197efc0e29c8f96a027c
lines: 37
kind: config
package: p01-app-shell
author: docs-r07-author-extra-02-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# .github/workflows/review-d05-tests.yml

## 1. 结论与边界

GitHub Actions workflow `D0.5 Semantic Module Tests`（37 行）：模板语义试验（D0.5）与模板服务兼容性门，注释 `.github/workflows/review-d05-tests.yml:3` 明确"独立于 Electron 渲染构建，聚焦模板语义试验与现有模板服务兼容性"。单 job `d05-test`，`ubuntu-latest`。本轮 `NOT_RUN`（纯静态阅读，未运行任何 CI）。

## 2. 导出与关键符号

键清单：

| 键 | 行 | 值/摘要 |
| --- | --- | --- |
| name | `.github/workflows/review-d05-tests.yml:1` | D0.5 Semantic Module Tests |
| on.pull_request.paths | `:6-11` | 5 条 glob（含自引用 `:11`） |
| on.workflow_dispatch | `:12` | 手工触发 |
| permissions | `:14-15` | contents: read |
| jobs.d05-test | `:17-20` | name `D0.5 typecheck and BDD`，runs-on ubuntu-latest |
| env.ELECTRON_SKIP_BINARY_DOWNLOAD | `:21-22` | '1' |
| steps | `:23-37` | 6 步（见 §3） |

无 concurrency（依据：全文无 `concurrency` 键）、无 secrets、无 matrix、无 cache、无上传产物、无 `if:`/`continue-on-error`。

## 3. 内部逻辑与关键流程

paths 过滤（`.github/workflows/review-d05-tests.yml:7-11`）：`semantic-module-demo*.ts`、`template-store.ts`、`apps/electron/scripts/review-semantic-demo.ts`、`docs/design/review-agent/fixtures/d05-*.json`、本文件自引用（`:11`）。

job `d05-test` 的 6 个 step（`:23-37`）：`actions/checkout@v4`（`:24`）、`oven-sh/setup-bun@v2` `bun-version: 1.4.0`（`:25-27`）、`actions/setup-node@v4` node 22（`:28-30`）、`bun install --frozen-lockfile`（`:31`）、`TypeScript typecheck`（`:32-33`，`bun run typecheck` → 根 `package.json:24`）、`D0.5 BDD and template integration tests`（`:34-37`）：2 条独立 `bun test --isolate --timeout 30000`——`semantic-module-demo.test.ts`（`:36`）、`template-store.test.ts`（`:37`），两文件在冻结树存在（已核对）。

## 4. 调用者与调用链

- 入向：`pull_request` 命中 paths（`.github/workflows/review-d05-tests.yml:5-11`）、`workflow_dispatch`（`:12`）；无 `workflow_call`，冻结树检索无其它 workflow/文档引用本文件。
- 出向：`actions/checkout@v4`/`oven-sh/setup-bun@v2`/`actions/setup-node@v4`（`:24`-`:29`）；npm 脚本 `typecheck`（`package.json:24`）；2 个被测文件（`:36`-`:37`）。不调用其它 workflow/脚本（`review-semantic-demo.ts` 仅是 paths 触发项，非本 workflow 调用）。

## 5. 数据 I/O、读写与副作用

写 `node_modules`（`:31`）与测试临时产物；无 artifact 上传、无 cache（依据：全文无相关键）。runner 一次性。

## 6. 分支、失败、取消与恢复

无 concurrency/cancel-in-progress（依据：全文无该键）。任一 step 失败即 job 失败，无容错键。`--frozen-lockfile`（`:31`）不一致即失败。无超时配置（未知上限）。

## 7. 权限与权威状态

GITHUB_TOKEN 仅 `contents: read`（`.github/workflows/review-d05-tests.yml:14-15`）；无 secrets（全文无 `secrets.`）。`ELECTRON_SKIP_BINARY_DOWNLOAD: '1'`（`:22`）跳过 Electron 二进制下载，与"独立于 Electron 渲染构建"的定位一致（`:3`）。

## 8. 修改影响面

D0.5 语义模块与 template-store 的 PR 定向门；paths 含 fixtures（`docs/design/review-agent/fixtures/d05-*.json`，`:10`）。bun 固定 `1.4.0`（`:27`）。

## 9. 测试证据

`NOT_RUN`。无直接测试（本 workflow 即测试编排者），依据：冻结树 `*.test.*` 检索 `.github/workflows|workflows/` 无引用。间接：其执行的 `semantic-module-demo.test.ts`/`template-store.test.ts` 在冻结树存在，属间接证据。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 触发/权限/6 步/2 条测试命令/无 concurrency | 已证实 | `.github/workflows/review-d05-tests.yml:1-37` 全文 |
| 被测文件存在性 | 已证实 | 冻结树逐文件核对 |
| 实际运行结果 | 未知 | NOT_RUN |

## 11. 覆盖表

| 键/步骤 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| on.paths 5 条 | §3 | 6-11 | covered |
| permissions/env（无 concurrency） | §2/§6/§7 | 14-22 | covered |
| 6 个 steps | §3 | 23-37 | covered |
| 运行验证 | §9 | - | unknown |

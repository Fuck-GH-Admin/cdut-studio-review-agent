---
path: .github/workflows/ci.yml
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e8d00179d5cc4515660d79c62ba9753674c521c4
sha256: d52e01a1da2c5a05205f719178adae0c492c9a04a39a83b5a1ddbe18eaa5d5a0
lines: 64
kind: config
package: p01-app-shell
author: docs-r07-author-extra-02-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# .github/workflows/ci.yml

## 1. 结论与边界

GitHub Actions workflow `PR CI`（64 行）：PR 与 main 直推的统一快速验证门（注释 `.github/workflows/ci.yml:3-4` 明确完整 Windows 发布验证走 `release.yml` 手动 dispatch）。单 job `verify` 跑在 `ubuntu-latest`，依次装依赖、typecheck、边界检查、皮肤契约、三段构建、全量 `bun test`。本轮 `NOT_RUN`（纯静态阅读，未运行任何 CI）。

## 2. 导出与关键符号

键清单（YAML 顶层/关键键）：

| 键 | 行 | 值/摘要 |
| --- | --- | --- |
| name | `.github/workflows/ci.yml:1` | PR CI |
| on.pull_request | `:6` | 全分支 PR，无 paths 过滤 |
| on.push.branches | `:8` | [main] |
| on.workflow_dispatch | `:9` | 手工触发 |
| permissions | `:11-12` | contents: read |
| concurrency | `:14-16` | group `ci-${{ github.ref }}`，cancel-in-progress: true |
| jobs.verify | `:18-21` | 单 job，name `verify (ubuntu-latest)` |
| runs-on | `:21` | ubuntu-latest |
| env.ELECTRON_SKIP_BINARY_DOWNLOAD | `:22-24` | '1' |
| steps | `:25-64` | 9 步（见 §3） |

无 secrets、无 matrix、无 actions/cache、无上传产物、无 `if:`/`continue-on-error`（依据：全文无这些键）。

## 3. 内部逻辑与关键流程

job `verify` 的 9 个 step（`.github/workflows/ci.yml:25-64`）：
1. Checkout `actions/checkout@v4`（`:26-27`）；
2. Setup Bun `oven-sh/setup-bun@v2`，`bun-version: 1.4.2`（`:29-34`，注释 `:32-33` 说明与 release.yml 对齐、可解析 lockfileVersion 2 的 bun.lock）；
3. Setup Node.js `actions/setup-node@v4`，node 22（`:36-39`）；
4. `bun install --frozen-lockfile`（`:41-42`）；
5. `bun run typecheck`（`:44-45`）→ 根 `package.json:24`；
6. `bun run check:boundaries`（`:47-48`）→ 根 `package.json:25` → `scripts/check-boundaries.ts`；
7. `bun run check:skin-contract`，working-directory `apps/electron`（`:50-52`）→ `apps/electron/package.json:49` → `scripts/check-skin-surface-contract.mjs`；
8. Build main/preload/renderer，working-directory `apps/electron`，顺序 `build:main`/`build:preload`/`build:renderer`（`:54-59`）→ `apps/electron/package.json:17`、`:20`、`:27`；
9. `bun test --isolate --timeout 30000` 全量单测/回归（`:61-64`，注释 `:62-63` 解释 `--isolate` 防 bun mock.module 进程级注册表串扰）。

## 4. 调用者与调用链

- 入向：GitHub 事件 `pull_request`（`.github/workflows/ci.yml:6`）、`push` 到 `main`（`:7-8`）、`workflow_dispatch`（`:9`）；无 `workflow_call`，冻结树检索 `uses: \./\.github/workflows|workflow_call` 无命中，即无其它 workflow 调用它。文档引用：`work/reports/2026-10-03-collaborator-sync-review.md:18`（记录 ci.yml/release.yml 命令执行方式修复）。
- 出向：`actions/checkout@v4`、`oven-sh/setup-bun@v2`、`actions/setup-node@v4`（`:27`、`:30`、`:37`）；npm 脚本 `typecheck`/`check:boundaries`/`check:skin-contract`/`build:main`/`build:preload`/`build:renderer`（见 §3）；`bun test` 直接执行仓内测试文件。不调用其它 workflow。

## 5. 数据 I/O、读写与副作用

写 `node_modules`（`:42`）与构建产物 `apps/electron/dist/`（build:main/preload/renderer）；无 artifact 上传、无 actions/cache（依据：全文无 upload-artifact/cache 键）。runner 为一次性环境，副作用不持久化。

## 6. 分支、失败、取消与恢复

`concurrency` 同 ref 新推送取消旧运行（`.github/workflows/ci.yml:14-16`，cancel-in-progress: true）。任一 step 非零即 job 失败，无 `continue-on-error`/`if:` 容错（依据：全文无该键）。`--frozen-lockfile`（`:42`）在 lockfile 不一致时直接失败。未设 `timeout-minutes`（未知，取仓库/平台默认上限）。

## 7. 权限与权威状态

GITHUB_TOKEN 权限收敛为 `contents: read`（`.github/workflows/ci.yml:11-12`）；无 secrets 使用点（依据：全文无 `secrets.` 引用）。`ELECTRON_SKIP_BINARY_DOWNLOAD: '1'`（`:24`）经注释 `:23` 确认：测试用 bunfig preload mock electron，跳过真实二进制下载。

## 8. 修改影响面

所有 PR 与 main 直推的必过检查；bun 版本固定 `1.4.2` 与 `.github/workflows/release.yml:34` 一致（注释 `.github/workflows/ci.yml:32-33`），改动会影响全仓门禁与 release.yml 的一致性约定；step 顺序（typecheck→boundaries→skin→build→test）为既有门禁序列。

## 9. 测试证据

`NOT_RUN`。无直接测试，依据：冻结树 `*.test.*` 检索 `.github/workflows|workflows/` 无引用。间接：`work/reports/2026-10-03-collaborator-sync-review.md:18` 记录本文件曾因 `bun --cwd` 只输出帮助而漏执行、后改为明确 `working-directory` 的修复（间接证据）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 触发/权限/并发/9 步序列/环境变量 | 已证实 | `.github/workflows/ci.yml:1-64` 全文 |
| npm 脚本解析目标 | 已证实 | `package.json:24-25`、`apps/electron/package.json:17`/`:20`/`:27`/`:49` |
| 实际运行结果 | 未知 | NOT_RUN |
| job 超时上限 | 未知 | 全文无 timeout 配置 |

## 11. 覆盖表

| 键/步骤 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| on/permissions/concurrency/env | §2/§6/§7 | 5-24 | covered |
| 9 个 steps | §3 | 25-64 | covered |
| 入/出向调用链 | §4 | - | covered |
| 运行验证 | §9 | - | unknown |

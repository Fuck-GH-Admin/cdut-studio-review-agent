---
path: package.json
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 80f77e7c2c581d56612c6335c67ff4b62e8f96f0
sha256: 5a8d21c3f9d5fda157118993ced65f986188a0364cf3f60b8e0b9174c184e313
lines: 57
kind: config
package: p01-app-shell
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# package.json

## 1. 结论与边界

仓库根包清单（静态配置）：`proma` workspace 根（`packages/*`+`apps/*`），聚合脚本（dev/build/typecheck/test/release）、根依赖、`@earendil-works/pi-*` 版本 overrides 与 pnpm `patchedDependencies`（指向 `patches/` 补丁，见各 patch 手册）。

边界：不含应用逻辑；子包依赖在各自 package.json；打包细节在 `apps/electron/package.json` 与 `scripts/`；`package.json:2` 的 name 仍为 `proma`（产品现名 CDUT Studio/Profer 并存，照实记录）。

## 2. 键清单与导出符号

| 键 | 值 | 行 | 说明 |
| --- | --- | --- | --- |
| `name`/`version`/`description` | `proma` / `0.1.1` / "The next gen ai software with general agents" | 2-4 | |
| `type`/`private` | `module` / `true` | 5-6 | |
| `workspaces` | `packages/*`, `apps/*` | 7-10 | |
| `trustedDependencies` | `["electron"]` | 11-13 | |
| `scripts.dev`/`electron:dev` | `bun run --filter='@profer/electron' dev` | 15-16 | |
| `scripts.electron:build`/`:github`/`:commercial` | electron 构建三目标 | 17-19 | |
| `scripts.electron:start` | electron start | 20 | |
| `scripts.release:mac` | `node scripts/push-mac-release.cjs` | 21 | |
| `scripts.release:releases-json` | `node scripts/build-releases-json.cjs --upload` | 22 | 消费 build-releases-json.cjs |
| `scripts.build`/`typecheck` | `bun run --filter='*' …` | 23-24 | |
| `scripts.check:boundaries` | `bun scripts/check-boundaries.ts` | 25 | 消费 check-boundaries.ts |
| `scripts.benchmark:ui` | `bun run packages/benchmark-multihop/src/server.ts` | 26 | |
| `scripts.test` | `bun test --isolate` | 27 | |
| `devDependencies` | 9 项（@types/*、dompurify、jszip、rcedit、typescript…） | 29-39 | |
| `peerDependencies` | `typescript ^5` | 40-42 | |
| `dependencies` | `jotai ^2.17.1`, `source-map ^0.7.6` | 43-46 | |
| `overrides` | `pi-agent-core/pi-ai/pi-coding-agent/pi-tui` 全钉 `0.86.1` | 47-52 | |
| `patchedDependencies` | `pi-ai@0.86.1`、`pi-coding-agent@0.86.1` → `patches/` 对应补丁 | 53-56 | |

## 3. 内部逻辑与默认值来源

静态清单。`overrides` 强制四个 `@earendil-works/*` 同版本 0.86.1（`:47-52`）；`patchedDependencies` 只登记 **0.86.1** 两个补丁（`:53-55`）——`patches/` 中 0.82.1/0.84.3 四个补丁**不在** patchedDependencies（历史版本遗留，见 UNVERIFIED §3）。

## 4. 调用者与调用链

- 包管理器（bun/pnpm）读取；`scripts/*` 由 `scripts` 键触发（§2 行号）。
- `apps/electron/scripts/build-cli.ts`、CI/发布流程（外部）消费 scripts（发布实际用法未在冻结树核到，标未知）。

## 5. 数据 I/O 与环境覆盖

无数据读写；无环境覆盖（静态清单；脚本内部的环境变量在各自脚本手册）。

## 6. 分支、缺失与非法值行为

无分支。`patchedDependencies` 指向缺失文件时 pnpm install 失败（推断）；overrides 版本不在 registry 时解析失败（推断）。

## 7. 权限与权威状态

无权限分支，依据：本文件无权限逻辑；`private:true` 禁止发布（`:6`）。

## 8. 修改影响面

- 改 `overrides`/`patchedDependencies` 影响全仓依赖解析与补丁应用（pi-* SDK 运行时行为，见各 patch 手册）。
- 改 scripts 影响开发/构建/发布链（release:mac→push-mac-release.cjs、release:releases-json→build-releases-json.cjs、check:boundaries→check-boundaries.ts、test→`bun test --isolate`）。
- 与 `pnpm-lock.yaml`（根 importer 快照）一致性耦合。

## 9. 测试证据

直接测试：**无**（全树 `*.test.*` 检索根 `package.json` 0 命中）。间接证据：`scripts/check-boundaries.test.ts` 用 fixture package.json（非本文件）。

NOT_RUN：本轮未运行任何测试/typecheck/构建/install。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全部键值 | 已证实 | `package.json:1-57` 逐行读 |
| patchedDependencies 仅 0.86.1 两补丁 | 已证实 | `:53-56` |
| 0.82.1/0.84.3 补丁无登记引用 | 已证实 | 全树检索（UNVERIFIED §3） |
| name 与产品现名并存 | 已证实 | `:2` vs 其它包名 @profer/* |
| 补丁缺失时的包管理器行为 | 推断 | 工具惯例 |
| 发布/CI 实际用法 | 未知 | 未在冻结树核到 |
| 运行期行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 键组 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 顶层身份键 | §2 | 2-6 | covered |
| workspaces/trustedDependencies | §2 | 7-13 | covered |
| scripts×12 | §2 | 15-27 | covered |
| deps/overrides/patchedDependencies | §2-3 | 29-56 | covered |
| 运行期行为 | §9-10 | - | unknown（NOT_RUN） |

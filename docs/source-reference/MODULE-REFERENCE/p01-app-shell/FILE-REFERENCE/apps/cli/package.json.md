---
path: apps/cli/package.json
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d1bfd8b283312978aa547125eb892e10d886d27d
sha256: 2accf09dd0348f884d330828f735934240876ed85319943c716dd1f081ce52e1
lines: 22
kind: config
package: p01-app-shell
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/cli/package.json

## 1. 结论与边界

`@profer/cli` 包清单（静态配置）：定义 profer 命令行工具的包名/版本/许可证、Bun 入口 `bin.profer`、构建脚本与 workspace 依赖。功能定位=会话渐进式读取（list/info/outline/search/export，`package.json:5`）。

边界：不含运行时逻辑（在 `src/`）；不发布 npm registry 配置；构建细节在 `apps/electron/scripts/build-cli.ts`；workspace 图由根配置管理。

## 2. 键清单与导出符号

| 键 | 值 | 行 | 说明 |
| --- | --- | --- | --- |
| `name` | `@profer/cli` | 2 | workspace 包名 |
| `version` | `0.1.1` | 3 | |
| `license` | `AGPL-3.0-only` | 4 | |
| `description` | profer 命令行工具，会话渐进式读取 | 5 | |
| `type` | `module` | 6 | ESM |
| `bin.profer` | `./src/index.ts` | 7-9 | 入口（`#!/usr/bin/env bun`，`src/index.ts:1`） |
| `scripts.typecheck` | `tsc --noEmit` | 11 | |
| `scripts.build` | `bun build --compile --outfile dist/profer src/index.ts` | 12 | 单文件产物 `dist/profer` |
| `scripts.start` | `bun src/index.ts` | 13 | |
| `dependencies` | `@profer/session-core`、`@profer/shared`（`workspace:*`） | 15-18 | |
| `devDependencies` | `typescript ^5.0.0` | 19-21 | |

11 键（scripts 3 + dependencies 2 + devDependencies 1 + 顶层 6）。

## 3. 内部逻辑与默认值来源

静态清单无逻辑；默认值=值本身。运行期路径由 `src/paths.ts` 的 `PROFER_DEV`/`PROMA_DEV`/`--config-dir` 决定（见该手册）；构建脚本无环境分支。

## 4. 调用者与调用链

- `apps/electron/scripts/build-cli.ts:6,92`：`bun build --compile` 打包（`cwd=apps/cli`）。
- `bin.profer` 供 `bun install` 链接 CLI 入口（消费面=用户/Agent 手动执行；仓库内无代码 import `@profer/cli`，全树检索证实）。
- 依赖消费：`src/commands/*` 导入 `@profer/session-core[/node]` 与 `@profer/shared` 类型（如 `commands/info.ts:10-11`）。

## 5. 数据 I/O 与环境覆盖

无数据读写；无环境覆盖（静态清单）。`PROFER_CONFIG_DIR`/`PROFER_DEV` 不作用于本文件。

## 6. 分支、缺失与非法值行为

无分支。`dependencies` 缺失 → 各命令 import 失败（无运行时校验，推断）；`bin` 指向 TS 源码依赖 Bun 运行时（shebang `src/index.ts:1`）。

## 7. 权限与权威状态

无权限分支，依据：本文件无权限逻辑；包身份权威=npm workspace 命名。

## 8. 修改影响面

改 `bin`/`scripts.build` 影响 build-cli.ts 打包链；改依赖影响 workspace 图；版本号随发布流程。与 `tsconfig.json`（`include: src/**/*`）配套。

## 9. 测试证据

直接测试：**无**（全树 `*.test.*` 检索 `apps/cli/package` 0 命中）。间接证据：无。

NOT_RUN：本轮未运行任何测试/typecheck/构建/CLI 执行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全部 11 键值 | 已证实 | `package.json:1-22` 逐行读 |
| build-cli.ts 打包消费 | 已证实 | `build-cli.ts:6,92` |
| 仓库内无其它 import 消费 | 已证实 | 全树检索（§4 范围） |
| bin 链接行为 | 推断 | npm 惯例 |
| 发布/CI 实际用法 | 未知 | 未在冻结树核到 |
| 运行期行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 键组 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| name/version/license/type/bin | §2 | 2-9 | covered |
| scripts×3 | §2 | 11-13 | covered |
| deps/devDeps | §2 | 15-21 | covered |
| 运行期行为 | §9-10 | - | unknown（NOT_RUN） |

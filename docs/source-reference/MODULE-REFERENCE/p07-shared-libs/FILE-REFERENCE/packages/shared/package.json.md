---
path: packages/shared/package.json
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: eae0c903cacd225d31869031411ff67fef6c0472
sha256: 6ef462e6faed471d3e08a4b5f30e2ecb7a46d6ad6d2794b0b000b537efa08da9
lines: 21
kind: config
package: p07-shared-libs
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/shared/package.json

## 1. 结论与边界

`@profer/shared` 的**包清单**（`packages/shared/package.json:1-21`）：声明包身份、4 个导出入口（`.`, `./types`, `./config`, `./utils`）、typecheck 脚本、TS 开发依赖。全仓最底层类型/配置/工具包（全仓千余处 `@profer/shared` 导入的解析面）。

## 2. 键清单与默认值来源

| 键 | 值 | 行 | 说明 |
| --- | --- | --- | --- |
| `name`/`version` | `@profer/shared` / `0.1.75` | `:2-3` | 包身份 |
| `license` | `AGPL-3.0-only` | `:4` | — |
| `type` | `module` | `:6` | ESM |
| `main`/`types` | `./src/index.ts` | `:7-8` | **源码直出**（无构建产物） |
| `exports` | 4 入口 | `:9-14` | `.`/`./types`/`./config`/`./utils` 均指 `src/*.ts` |
| `scripts.typecheck` | `tsc --noEmit` | `:15-17` | 仅 typecheck，无 test/build |
| `devDependencies` | `typescript ^5.0.0` | `:18-20` | — |

## 3. 内部逻辑与关键流程

无逻辑；静态 JSON。`main` 指向 `.ts` 源码 → 消费方（electron/CLI 的 bundler/tsx）直接编译 TS 源。

## 4. 真实消费者

- `exports` 四入口的导入方：`@profer/shared`（根，绝大多数导入，如 `apps/electron/src/renderer/atoms/agent-atoms.ts:10`）、`@profer/shared/types`（如 `packages/ui/src/lib/z-layers` 无、`longterm-memory` 类型经根）、`/config`、`/utils`（各 barrel）。
- `scripts.typecheck`：CI/人工。
- 依赖反向：无 `dependencies`（自包含）；被 `@profer/core`（`core/package.json:17` `workspace:*`）等引用。

## 5. 环境覆盖

无环境变量；`version` 由发布流程管理（本仓 workspace 直引不走版本）。

## 6. 缺失/非法值行为

`exports` 缺失 → 深路径导入（`@profer/shared/types`）解析失败；`type` 改 commonjs → ESM 源码解析错误。

## 7. 权限与权威状态

不适用，依据：包清单。

## 8. 修改影响面

改 `exports` → 对应入口的所有导入方；改 `version` → workspace 引用无感（`workspace:*`）；加 `dependencies` → 安装面扩大。

## 9. 测试证据

无测试（清单）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全部键值与行号 | 已证实 | 逐行读 `:1-21` |
| 源码直出被 bundler 消费 | 推断 | `main: ./src/index.ts` + 各 app 构建配置未读 |
| 发布流程对 version 的管理 | 未知 | 未读 |

## 11. 覆盖表

| 键组 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 身份/exports/scripts/devDeps | §2 | `:2-20` | covered |
| 消费/影响 | §4/§8 | — | covered |

---
path: apps/cli/src/index.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8c0e1e3ce51c62fee413e643b0bdeca738631133
sha256: d7513e00af84893ca17d221e6650d3625a796a525779245bf892ebe9dd9ea1ae
lines: 84
kind: source
package: p01-app-shell
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/cli/src/index.ts

## 1. 结论与边界

`profer` CLI 入口（Bun 运行时，`#!/usr/bin/env bun` `:1`）：命令注册表驱动，`session` 命名空间下 list/info/outline/search/export，全局 flag `--json`/`--config-dir DIR`/`--dev`（文件头 `apps/cli/src/index.ts:1-16`）。面向有限上下文的 Agent 消费者（package.json description）。

边界：命令实现在 `commands/`（import 即注册）；参数解析在 `args.ts`；输出/退出码在 `output.ts`；无 GUI/无 Electron。

## 2. 导出与关键符号

`export` 逐条核对：**0 个导出**（入口脚本）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `printHelp` | 函数（内部） | 29-38 | 用法+命令表+渐进读取建议 |
| `main` | 函数（内部） | 40-82 | 参数解析与命令分发 |
| 命令注册 import | 副作用 | 23-27 | list/info/outline/search/export 五模块 |

## 3. 内部逻辑与关键流程

1. 无参数/help/--help/-h → `printHelp` 返回 0（`:42-45`）。
2. `session` 命名空间可省略：`profer session <cmd>` 与 `profer <cmd>` 等价（`:47-49`）。
3. 未知命令 → `errorLine`+help 返回 `EXIT_USAGE=2`（`:57-62`）。
4. `parseArgs(rest.slice(1))` → `pathOpts{configDir, dev}` + `json`（`:64-69`）。
5. `command.run(ctx)` 返回退出码；`UsageError` → 打印用法返回 2；其它异常 → `errorLine` 返回 `EXIT_ERROR=1`（`:71-81`）。
6. `main().then(code => process.exit(code))`（`:84`）。

## 4. 调用者与调用链

入向：`package.json:7-9`（`bin.profer` → 本文件）；`apps/electron/scripts/build-cli.ts:92`（打包产物入口）。无代码 import（入口脚本）。

出向：`./args`（`:17`）、`./registry`（`:18`）、`./output`（`:19`）、`./paths` 类型（`:20`）、`commands/*` 五个副作用注册（`:23-27`）。

## 5. 数据 I/O、读写与副作用

读 `process.argv`（`:41`）；写 stdout/stderr（经 output.ts）；`process.exit`（`:84`）。无盘/网络（本文件）。

## 6. 分支、失败、取消与恢复

| 分支 | 触发 | 行 | 退出码 |
| --- | --- | --- | --- |
| help | 无参数/help 旗标 | 42-45 | 0 |
| 缺命令名 | session 后为空 | 52-55 | 2 |
| 未知命令 | getCommand 空 | 58-62 | 2 |
| 用法错误 | UsageError | 74-77 | 2 |
| 运行错误 | 其它异常 | 79-80 | 1 |

无取消/恢复概念，依据：一次性命令执行。

## 7. 权限与权威状态

无权限分支，依据：本文件无权限检查；文件系统访问范围由 `paths.ts` 解析（用户 home/显式 config-dir）。

## 8. 修改影响面

- `bin`/build-cli 打包链（§4）；新增命令=在 `commands/` 加文件（注册表约定 `registry.ts:2`）。
- 全局 flag 契约（`--json/--config-dir/--dev`）被所有命令与 Agent 使用文档依赖。
- 需同步的测试：无直接测试（args/paths/export.test 测子模块）。

## 9. 测试证据

直接测试：**无**（本文件无专属测试；全树测试检索 `apps/cli/src/index` 0 命中）。间接证据：`args.test.ts`/`paths.test.ts`/`export.test.ts`（本批）覆盖被调子模块。

NOT_RUN：本轮未运行任何测试/typecheck/构建/CLI 执行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 0 导出 + 分发逻辑 | 已证实 | `:29-84` 逐行读 |
| 退出码三值语义 | 已证实 | `:42-81`（与 `output.ts:10-12` 一致） |
| 唯二入口（bin/build-cli） | 已证实 | `package.json:7-9`；`build-cli.ts:92` |
| 头注释 `--config-dir 默认 ~/.profer` 与主应用 `~/.cdutai` 不一致 | 已证实（跨文件矛盾） | 本文件 `:11` vs `config-paths.ts:23-45`（详见 paths.ts.md §8） |
| 运行期行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `printHelp`/`main` | §2-3 | 29-82 | covered |
| 五命令注册 | §3 | 23-27 | covered |
| 退出码分支 | §6 | 42-81 | covered |
| 调用链 | §4 | - | covered |
| 运行期行为 | §9-10 | - | unknown（NOT_RUN） |

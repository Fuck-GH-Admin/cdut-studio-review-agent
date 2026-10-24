---
path: apps/cli/src/registry.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1147d41a712d635a04a22b3c116835ee17f629de
sha256: 8b158fde1169302a26ba447d5313911dda292b73da2f5516e8e5253af77c87f7
lines: 38
kind: source
package: p01-app-shell
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/cli/src/registry.ts

## 1. 结论与边界

CLI 命令注册表（纯模块）：`register`/`getCommand`/`allCommands` + `Command`/`CommandContext` 契约；新增命令=在 `commands/` 加文件 `register()`，不动主入口（文件头 `apps/cli/src/registry.ts:1-3`）。

边界：不解析参数/不输出（args/output）；注册表为模块级单例。

## 2. 导出与关键符号

`export` 逐条核对：2 接口 + 3 函数 + 1 再导出 = 6 个导出。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `CommandContext` | 接口（导出） | 8-14 | `{args: ParsedArgs, pathOpts: PathOptions, json: boolean}` | run 入参 |
| `Command` | 接口（导出） | 16-22 | `{name, summary, usage, run}` | `run` 同步或异步返回 `CommandExit` |
| `register` | 函数（导出） | 26-28 | `(cmd: Command) => void` | `Map.set`（同名覆盖） |
| `getCommand` | 函数（导出） | 30-32 | `(name) => Command \| undefined` | |
| `allCommands` | 函数（导出） | 34-36 | `() => Command[]` | 插入序 |
| `UsageError` | 再导出（导出） | 38 | from `./output` | 供命令层抛出 |

内部：`registry` Map（`:24`）。

## 3. 内部逻辑与关键流程

单例 `Map<string, Command>`（`:24`）；`register` 直接 set（同名后注册覆盖前值，`:26-28`）；`allCommands` 返回 `[...values()]`（`:35`，Map 插入序→help 中命令顺序=注册顺序即 import 顺序，`index.ts:23-27`）。

## 4. 调用者与调用链

入向（全树检索，证实）：`index.ts:18`（getCommand/allCommands）；`commands/list.ts:4`、`info.ts:7`、`outline.ts:5`、`search.ts:5`、`export.ts:13`（register）；`registry.ts:38` 的 UsageError 被 5 个 commands 与 index 消费。

出向：`./args` 类型（`:4`）、`./paths` 类型（`:5`）、`./output`（`:6`）。

## 5. 数据 I/O、读写与副作用

模块级 Map 内存注册（import 副作用期写入）；无 I/O（依据：全文读）。幂等：同名覆盖。

## 6. 分支、失败、取消与恢复

无分支（三函数直通）；同名覆盖是唯一语义边界（`:27`）。无异常/取消/恢复概念，依据：纯注册表。

## 7. 权限与权威状态

无权限分支，依据：本文件无权限逻辑；命令可用性=注册表（无鉴权）。

## 8. 修改影响面

- index.ts + 5 commands（§4）；`Command` 契约（`run` 返回退出码）与 `output.CommandExit`/`index.ts:72` 捕获耦合。
- 头注释 `:10` 写 `PROMA_DEV`（路径选项注释），而 `paths.ts:21` 主口径为 `PROFER_DEV`（兼容 PROMA_DEV）——注释用词取了兼容名，非错误但易误读，照实记录。
- 需同步的测试：无（0 test）。

## 9. 测试证据

直接测试：**无**（全树 `*.test.*` 检索 `registry.ts`/`register(`/`allCommands` 0 命中）。间接证据：无。

NOT_RUN：本轮未运行任何测试/typecheck/构建/CLI 执行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 导出 + 注册语义 | 已证实 | `:8-38` 逐行读 |
| 同名覆盖/插入序 | 已证实 | `:24-35` |
| 7 处消费 | 已证实 | §4 行号 |
| `:10` 注释用 PROMA_DEV 兼容名 | 已证实 | 对照 `paths.ts:21,27` |
| 运行期行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `CommandContext`/`Command` | §2 | 8-22 | covered |
| 3 函数+再导出 | §2-3 | 26-38 | covered |
| 调用链 | §4 | - | covered |
| 运行期行为 | §9-10 | - | unknown（NOT_RUN） |

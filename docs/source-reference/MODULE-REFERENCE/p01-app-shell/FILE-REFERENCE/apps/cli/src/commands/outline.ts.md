---
path: apps/cli/src/commands/outline.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ea63f1af2255467b453be9f30211c912bc66a865
sha256: 3d4641fb52be3fd6a8462b99e0dcc9c2d256def72a395d8f20c16cd7da65517d
lines: 40
kind: source
package: p01-app-shell
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/cli/src/commands/outline.ts

## 1. 结论与边界

`profer session outline` 命令（CLI 运行时）：turn 级地图，每 turn 一行（角色/预览/工具概览/估算 tokens），先看地图再决定读哪段（文件头 `apps/cli/src/commands/outline.ts:1-3`，usage `:15`）。支持 `--offset K`/`--limit N` 分页。

边界：格式化在 `session-core.formatOutlineLine`；turn 选择在 `selectTurns`；不输出正文。

## 2. 导出与关键符号

`export` 逐条核对：**0 个导出**（`register` 副作用注册）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `register({name:'outline',…})` | 副作用 | 12-40 | 命令定义 |

## 3. 内部逻辑与关键流程

1. `target` 缺失 → `UsageError`（`:17-18`）；`resolveSession` 失败 → EXIT_ERROR（`:19-23`）。
2. `toTranscript(groupIntoTurns(readSessionMessages(…)))`（`:25`）；`offset`/`limit` 任一存在 → `selectTurns(turns, {offset, limit})`（`:26-30`）。
3. `outline(turns)` 生成条目（`:31`）；`--json` 原样数组，否则 `formatOutlineLine` 逐行（`:33-38`）。

## 4. 调用者与调用链

入向：经 `index.ts:25` 注册被 `getCommand('outline')` 分发。无其它 import。

出向：`../registry`/`../sessions`/`../output`/`../args`（`numFlag`，`:10`）、`@profer/session-core/node`（`:8`）、`@profer/session-core`（`groupIntoTurns/toTranscript/outline/formatOutlineLine/selectTurns`，`:9`）。

## 5. 数据 I/O、读写与副作用

读 JSONL 全量入内存（`:25`）；写 stdout/stderr。无写盘/网络（依据：全文读）。

## 6. 分支、失败、取消与恢复

| 分支 | 触发 | 行 | 退出码 |
| --- | --- | --- | --- |
| 缺参数 | 无 target | 17-18 | 2 |
| 找不到会话 | resolveSession undefined | 19-23 | 1 |
| 分页 | offset/limit 任一 | 26-30 | 0 |
| json/文本 | ctx.json | 33-38 | 0 |

无本地 catch（解析异常冒泡→index EXIT_ERROR，推断）；无取消/恢复概念。

## 7. 权限与权威状态

无权限分支，依据：本文件无权限逻辑；只读展示。

## 8. 修改影响面

- index.ts 注册链（`:25`）；`outline`/`selectTurns`/`formatOutlineLine` 语义在 session-core（非本批）。
- 需同步的测试：无（0 test）。

## 9. 测试证据

直接测试：**无**（全树测试检索 `commands/outline` 0 命中）。间接证据：无。

NOT_RUN：本轮未运行任何测试/typecheck/构建/CLI 执行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 0 导出 + 全流程 | 已证实 | `:12-40` 逐行读 |
| offset/limit 可独立使用 | 已证实 | `:28`（任一存在即 selectTurns） |
| session-core 格式化语义 | 未知 | 非本批 |
| 运行期行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 命令注册体 | §2-3 | 12-40 | covered |
| 分页/双模式分支 | §6 | 26-38 | covered |
| 调用链 | §4 | - | covered |
| 运行期行为 | §9-10 | - | unknown（NOT_RUN） |

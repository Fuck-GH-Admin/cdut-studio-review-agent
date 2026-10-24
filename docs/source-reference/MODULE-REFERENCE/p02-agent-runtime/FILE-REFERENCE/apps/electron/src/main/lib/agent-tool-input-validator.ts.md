---
path: apps/electron/src/main/lib/agent-tool-input-validator.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 312e936fb8ebc3aaaf75ec0c5e8f07eed90b3075
sha256: 7b0ded9dc6a4d013c4efb75f9ef204e04d5c2fb72c0cffca38dd72d854288bec
lines: 136
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-tool-input-validator.ts

## 1. 结论与边界

工具参数校验（头注释 :1-6）：canUseTool 回调拦截参数缺失，deny message 引导重试。Pi 原生输入（path+edits[]）与 canonical（file_path+old_string）归一后再校验（:29-35 注释：不能把 Pi 合法参数误判缺 Claude 字段）。

## 2. 导出与关键符号

导出 4 条（`export` :9/:36/:96/:107）：

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `TOOL_REQUIRED_PARAMS` | `:9-18` | 8 工具必需参数表（Write/Edit/MultiEdit/Bash/Read/Glob/Grep/Agent） |
| `normalizeToolInputForValidation(toolName, input)` | `:36-93` | 归一（见 §3） |
| `ToolValidationFailure` | `:96-99` | `{behavior:'deny', message}` |
| `validateToolInput(toolName, input)` | `:107-136` | 校验（见 §3） |

内部：`canonicalToolName`（:20-22，MultiEdit→Edit）、`firstPiEdit`（:24-27）。

## 3. 内部逻辑与关键流程

- `normalizeToolInputForValidation`（:36-93）：Read/Write→file_path ?? path（:41-46）；Edit 无 `edits` 字段→canonical 单编辑（:54-58，注释 :52-53）；有 edits→逐项查 oldText/newText（空 newText 合法=删除 :77-79），映射首项到 old_string/new_string+missingNested（:61-92）。
- `validateToolInput`（:107-136）：未知工具返 null（:113）；缺参判定（Edit/Write 允许空串、Bash 拒空白命令 :118-121）；message 三形态（Pi edits 缺参/单缺/多缺 :129-133）。

## 4. 调用者与调用链

入向（子agent 交叉核）：生产唯一 `agent-orchestrator.ts:144` → 调用 `:1842`（validateToolInput）；测试 `agent-tool-input-validator.test.ts:2`。否定：`TOOL_REQUIRED_PARAMS`/`normalizeToolInputForValidation`/`ToolValidationFailure` 无其他消费者。出向：**零 import**（自包含纯函数）。

## 5. 数据 I/O、读写与副作用

无（纯函数）。

## 6. 分支、失败、取消与恢复

归一三路+校验三 message；不适用取消/恢复。

## 7. 权限与权威状态

deny 形状与 PermissionResult 一致（:95 注释）；canonical 字段名为权限层权威（:8 注释）。

## 8. 修改影响面

canUseTool 拦截行为。需同步测试（59 行）。

## 9. 测试证据

`agent-tool-input-validator.test.ts`（批内，59 行）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 4 条；Pi/canonical 归一 | 已证实 | :36-93 |
| 空 newText 合法语义 | 已证实 | :77-79 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 导出+归一/校验 | §2/§3 | :36-136 | covered |

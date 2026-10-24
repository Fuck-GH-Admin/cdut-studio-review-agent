---
path: apps/electron/src/renderer/components/agent/tool-phrase.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d9ebc45e80b9bedc092896663c5f62d5fd33876f
sha256: 5d14f40034cc84f3f32d5ddf7ce2a5a39e6412e1525c0c6b341ce3a5ed98fc63
lines: 409
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/tool-phrase.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

工具语义化短语生成器（409 行，头注 :1-6）：工具名+入参→连贯中文动宾短语，用于收起态/Loading 态展示；编辑/写入附 `diffStats`（独立于 label 便于 UI 单独渲染，:14）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ToolPhrase` | interface | 9-17 | label/loadingLabel/diffStats? |
| `getToolPhrase` | fn | 23-386 | 大 switch 全工具短语 |

内部：`filename`（:20，POSIX/Windows 双分隔符）、`truncate`（:23）、`phrase`（:389-393，`loadingLabel='正在'+label+'...'`）、`extractFirstMeaningfulValue`（:396-409，priorityKeys 优先→首个非 `_` 短字符串）。

## 3. 内部逻辑与关键流程

switch 覆盖：Read（offset/limit 三形态 :28-47）、Edit（diffStats :49-58）、Write（行数=insertions :60-71）、**Bash/PowerShell 同形态**（注释 :73-74「差异交给图标与结果渲染器」；命令 80 字截断）、Grep/Glob、WebFetch/WebSearch、Skill、NotebookEdit、Task/Agent、TaskCreate/TaskUpdate（statusMap :202-216 自描述）/TaskGet/TaskList、TodoWrite/TodoRead、EnterPlanMode/ExitPlanMode、generate_image、TaskOutput/TaskStop、AskUserQuestion、REPL、Workflow、ScheduleWakeup、Monitor、PushNotification、CronCreate/Delete/List、RemoteTrigger（actionMap :322-337）、EnterWorktree/ExitWorktree、ReadMcpResourceTool/ListMcpResourcesTool、SendMessage；default：`mcp__server__tool` 分解（server 大写）或未知工具+首值摘要。

## 4. 调用者与调用链

入向：工具活动行组件（收起态/Loading 态，全树 grep）。出向：`./tool-utils`（`computeDiffStats`，:7）。

## 5. 数据 I/O、读写与副作用

纯函数。

## 6. 分支、失败、取消与恢复

无 throw；缺失字段回退固定短语（如「读取文件」）。

## 7. 权限与权威状态

- 展示语义：label 须「完整动宾短语无冗余」（:21-22）；Bash/PowerShell 同形态口径固定。无 sender/role 检查。

## 8. 修改影响面

工具行文案全量。同测：`tool-phrase.test.ts`（3 用例，聚焦命令类）。

## 9. 测试证据

直接测试 `tool-phrase.test.ts`（3 用例 / 1 describe；纯函数；NOT_RUN）：
1. `:6-11` Bash→`执行 ls -la`+loadingLabel 形态。
2. `:13-19` PowerShell 与 Bash 完全同短语（不落未知分支）。
3. `:21-25` 超长命令截 80+省略号。

未覆盖：其余 30+ 工具分支、MCP 分解、diffStats（无用例）。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出/内部符号/行号 | 已证实 | 逐行核对 |
| 命令类同形态+截断 | 已证实 | 测试 :6-25 |
| 其余工具短语 | 已证实（代码）/未知（行为） | §3（未测） |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| Bash/PowerShell 分支 | §3/§9 | 73-83 | covered |
| Read/Edit/Write diffStats | §3 | 28-71 | covered（未测） |
| 其余 switch/default | §3 | 85-386 | covered（未测） |

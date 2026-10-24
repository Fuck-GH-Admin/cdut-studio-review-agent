---
path: packages/project-core/src/task-tool-names.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 982e6b1887c3b66e0df66b24d05f5316d70f207e
sha256: a2da9f3b99b7c694b6b4d418a7dcd776cdf6d031d726b2e90060d6509ca0d613
lines: 32
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-47-20261023
reviewer: p07-shared-libs
status: authored
evidence: static
---

# packages/project-core/src/task-tool-names.ts

## 1. 结论与边界

SDK 任务工具名归一（:1 注释）：SDK MCP 工具名为 `mcp__<server>__<tool>`，同时兼容历史裸名（持久化消息兼容 :6-8）。

## 2. 导出与关键符号

导出 6 条（`export` :3/:9/:14/:22/:26/:30）：`TaskGraphToolKind`（:3，'create'|'update'|null）、`normalizeTaskGraphToolName`（:9-12，剥 `mcp__task[-_]graph__` 前缀）、`taskGraphToolKind`（:14-20，proma_task_create/update 映射）、`isStructuredTaskGraphTool`（:22-24）、`isTaskCreateTool`（:26-28，`TaskCreate` 裸名或 create）、`isTaskUpdateTool`（:30-32）。

## 3. 内部逻辑与关键流程

前缀剥除正则（:11）+ switch 映射（:15-19）；`TaskCreate`/`TaskUpdate` 历史名恒认可（:27/:31）。不适用取消/恢复/权限：纯函数。

## 4. 调用者与调用链

入向（子agent 交叉核）：`index.ts:55-62` 聚合；经 index 生产消费：`task-graph-event-converter.ts:2-6`（isStructuredTaskGraphTool）、`renderer/components/agent/task-progress.ts:1` 与 `renderer/lib/task-graph-events.ts:2`（isTaskCreateTool/isTaskUpdateTool）；仅测试：`task-tool-names.test.ts:2-7`（经 './index'）。出向：无 import（零依赖叶子模块）。

## 5. 数据 I/O、读写与副作用

无。

## 6. 分支、失败、取消与恢复

switch default→null（:18）；无 throw。

## 7. 权限与权威状态

不适用，依据：纯函数。

## 8. 修改影响面

工具识别（影响 Graph 事件提取）；`task-tool-names.test.ts`（2 用例）。

## 9. 测试证据

`task-tool-names.test.ts`（批内，1 describe/2 用例，NOT_RUN）：SDK 前缀名归一+三判定（:10-15）、裸名兼容+非任务工具拒（:17-22）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 6 条；前缀兼容语义 | 已证实 | :3-32 |
| 消费链细节 | 推断 | 待子agent检索 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 6 导出 | §2/§3 | :3-32 | covered |

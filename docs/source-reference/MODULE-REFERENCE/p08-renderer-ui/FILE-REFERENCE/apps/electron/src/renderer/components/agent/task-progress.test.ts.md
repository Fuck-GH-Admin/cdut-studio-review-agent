---
path: apps/electron/src/renderer/components/agent/task-progress.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f74bb4ab12456999f30248aa6f809aa97bbe173a
sha256: 7faa19e80b687cc583ed133c5e40290eec47e5df4eea57f4d33b363973813be2
lines: 106
kind: test
package: p08-renderer-ui
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/task-progress.test.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 测试目标

任务聚合状态机：终态保护（流结束/用户打断不覆盖 failed/cancelled/completed）、deleted 过滤、MCP 前缀任务工具、SDK content 信封真实任务 ID、未知 status 回退、in_progress 收敛双语义。

## 2. 用例清单

9 声明 / 1 describe（`aggregateTaskItems statuses` :26，test.each 展开 **14 用例**）。夹具 `activity/taskActivities`（:5-24）；纯函数。

| # | 声明（行） | 展开 | 核心断言 |
| --- | --- | --- | --- |
| 1 | test.each failed/cancelled 保终态（28-32） | 2 | status 透传 |
| 2 | deleted 过滤（34-36） | 1 | `[]` |
| 3 | MCP 前缀任务工具（38-50） | 1 | proma_task_create/update 聚合成 completed |
| 4 | SDK content 信封真实 ID（52-67） | 1 | 用 `mcp-1` 不用 toolUseId（夹具名 `tool-use-id-must-not-become-a-node-id` 即断言语义） |
| 5 | 未知 status 回退（69-79） | 1 | 保 in_progress |
| 6 | test.each 流结束不覆盖终态（81-88） | 3 | failed/cancelled/completed 均不变 |
| 7 | test.each 打断不覆盖终态（90-97） | 3 | 同上 |
| 8 | 流结束仅 in_progress→pending（99-103） | 1 | pending |
| 9 | 打断仅 in_progress→cancelled（105-109） | 1 | cancelled |

## 3. 真实断言

如 §2 表（逐条读自 :28-109）。

## 4. 未覆盖与脆弱点

- 未覆盖：TodoWrite 命名空间分支、跨 turn historicalTaskSubjects、无名 TaskUpdate 跳过分支。
- 脆弱点：无。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 9 声明/14 展开断言如 §2 | 已证实 | 本文件逐行 |
| 终态保护/信封解析被固定 | 已证实 | 用例族 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| 状态机收敛/终态保护 | §2 | covered |
| MCP 信封/真实 ID | §2 | covered |
| TodoWrite/历史映射 | §4 | unknown（未测） |

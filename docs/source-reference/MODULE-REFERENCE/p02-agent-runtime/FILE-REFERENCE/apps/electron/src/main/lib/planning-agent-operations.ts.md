---
path: apps/electron/src/main/lib/planning-agent-operations.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: fb916aee93d8f98e32582ac3e739e264b939e4be
sha256: 2f22b8aa48c5a76772fea312f5ea1c1815c93ac4ea2adf1fdf4942089126d5a0
lines: 209
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/planning-agent-operations.ts

## 1. 结论与边界

Agent 规划操作层（头注释 :1-6）：Claude/Pi 共享 workspace 路由、并发校验和事件广播，防两 runtime 对本地 SQLite/团队规划服务行为漂移。

## 2. 导出与关键符号

导出 10 条（`export` :45/:87/:94/:101/:120/:159/:164/:171/:184/:199）：

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `PlanningAgentToolContext` | `:45-49` | 工具上下文（workspace/session 归属） |
| `listPlanningTodos(ctx, query?)` | `:87` | 列表+filterTodos |
| `getPlanningTodo(ctx, id)` | `:94` | 归属断言后取 |
| `createPlanningTodo(ctx, input)` | `:101` | 创建（sessionId/workspaceId 由 ctx 注入） |
| `updatePlanningTodo(ctx, ...)` | `:120` | 更新 |
| `listPlanningCalendarEvents`/`getPlanningCalendarEvent`/`createPlanningCalendarEvent`/`updatePlanningCalendarEvent`/`deletePlanningCalendarEvent` | `:159-:199` | 日程五操作 |

内部：`isTeamContext`（:51）、`assertTodoInContext`/`assertCalendarEventInContext`（:56/:67，归属断言）、`filterTodos`/`filterCalendarEvents`（:78/:149）。

## 3. 内部逻辑与关键流程

统一模式：ctx 归属断言→planning-manager CRUD→`broadcastPlanningAgentOperation`+`broadcastPlanningChanged` 双事件（:30-33 引用）。防漂移为语义核心。

## 4. 调用者与调用链

入向（子agent 交叉核）：生产唯一 `adapters/pi-builtin-tools.ts:82`（9 函数全量，handler 调用 :270-:380）；测试 `planning-agent-operations.test.ts:46`（动态 import+mock 三依赖）。出向：`./planning-manager`（10 CRUD :18-29）、`./planning-events`（双广播 :30-33）、`./agent-workspace-manager`（:53）、`./team-planning-service`（:35-43，团队路由）。

## 5. 数据 I/O、读写与副作用

经 planning-manager 读写 SQLite/团队服务；广播事件。

## 6. 分支、失败、取消与恢复

归属断言 throw；不适用取消/恢复。

## 7. 权限与权威状态

归属断言（workspace/session 边界）为权限权威；双广播契约。

## 8. 修改影响面

Agent 规划工具链。需同步测试（90 行）。

## 9. 测试证据

`planning-agent-operations.test.ts`（批内，90 行，断言细节见姊妹手册）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 10 条；归属断言+双广播 | 已证实 | :45-199 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 10 导出+统一模式 | §2/§3 | :45-199 | covered |

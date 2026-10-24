---
path: apps/electron/src/main/lib/planning-manager.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 24fe9b2a69614af981ef6790ee3127eca4d057c2
sha256: cba1be931b72e14b190d4c7c4b538876db141ce3d1cfd199991e1fd1435bcde9
lines: 554
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/planning-manager.ts

## 1. 结论与边界

规划数据管理器（554 行）：本地 SQLite 的 Todo/日程/分组/标签/提醒 CRUD——规划域的数据权威层。

## 2. 导出与关键符号（26 条，按组）

- **分组/标签**（:325-:357）：listPlanningGroups/createPlanningGroup/updatePlanningGroup/deletePlanningGroup/listPlanningTags/createPlanningTag/updatePlanningTag/deletePlanningTag。
- **Todo**（:361-:437）：listTodos/getTodo/touchTodoSession（:375，会话归属触达）/createTodo/updateTodo/deleteTodo。
- **日程**（:446-:505）：listCalendarEvents/getCalendarEvent/createCalendarEvent/updateCalendarEvent/deleteCalendarEvent。
- **提醒**（:522-:549）：createPlanningReminder/deletePlanningReminder/updatePlanningReminder/acknowledgePlanningReminder/snoozePlanningReminder/listActivePlanningReminders/**claimDuePlanningReminders(now)**（:549，到期认领，scheduler 消费）。

## 3. 内部逻辑与关键流程

（导出图谱级，554 行）：`getDatabase()` 统一 SQLite；行↔对象映射（calendarEventFromRow 等）；claim 语义=认领即防重复通知（配合 scheduler 每次到期一次，注释见 reminder-scheduler :4-5）。

## 4. 调用者与调用链

入向（子agent 交叉核）：**生产 3 文件**——`ipc.ts:276-297`（21 符号，PLANNING 处理器 :6926-7174+goal 桥 :488/:494）、`planning-agent-operations.ts:18-29`（10 符号）、`planning-reminder-scheduler.ts:9`。否定：`createPlanningReminder/deletePlanningReminder/updatePlanningReminder` 无外部消费者（内部走 createPlanningReminderWithOrigin :514）。出向：`node:crypto`（randomUUID）、`@profer/shared`（PLANNING_CONFLICT_ERROR 抛出 :409/:430/:478/:500）、`./config-paths`（:78）、`node:sqlite`（:77-78 动态 require）。

## 5. 数据 I/O、读写与副作用

SQLite 读写（规划域）。无网络。

## 6. 分支、失败、取消与恢复

CRUD 返回 undefined/false 语义（如 :453/:525）；不适用取消/恢复。

## 7. 权限与权威状态

规划数据权威层；touchTodoSession 维护会话归属。

## 8. 修改影响面

规划全链（operations/scheduler/IPC）。需同步测试（planning-agent-operations.test 间接）。

## 9. 测试证据

无专属测试文件；间接 `planning-agent-operations.test.ts`（批内）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 26 导出按组清单+行号 | 已证实 | 导出 grep+调用点交叉核 |
| SQL/映射实现逐行 | 推断（导出签名级） | 全文件结构 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号组 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 26 导出（4 组） | §2 | :325-549 | covered（图谱级） |
| SQL 实现 | §3/§10 | 全文件 | 推断 |

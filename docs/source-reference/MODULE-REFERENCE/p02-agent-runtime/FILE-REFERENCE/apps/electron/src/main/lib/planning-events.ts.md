---
path: apps/electron/src/main/lib/planning-events.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 035335af603669b1ac679425a08350f4783809a3
sha256: 8fce0d2ec449ba41aa61950392c85825d7dd9366e5ea134cd5cada7a8f99a781
lines: 30
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/planning-events.ts

## 1. 结论与边界

规划事件广播（30 行）：资源级失效通知/Agent 操作确认/到期提醒三事件，全存活窗口广播。

## 2. 导出与关键符号

导出 3 条（`export` :7/:18/:25）：
- `broadcastPlanningChanged(resources = 全部 6 资源)`（:7-12，去重后发 CHANGED）。
- `broadcastPlanningAgentOperation(operation)`（:18-22，AGENT_OPERATION；:15-17 注释：与通用 changed 分离防手动修改重复反馈）。
- `broadcastPlanningRemindersDue(reminders)`（:25-30，空列表早退 :26，REMINDER_DUE）。

内部：`ALL_PLANNING_CHANGE_RESOURCES`（:4，todos/calendar_events/todo_groups/calendar_groups/tags/reminders）。

## 3. 内部逻辑与关键流程

三函数均 isDestroyed 守卫广播。不适用取消/恢复。

## 4. 调用者与调用链

入向（子agent 交叉核）：**生产 3 文件**——`ipc.ts:298`（broadcastPlanningChanged 15 处调用）、`planning-agent-operations.ts:33`（双广播）、`planning-reminder-scheduler.ts:11`（:43/:44）；测试 mock 于 planning-agent-operations.test:41。出向：electron（BrowserWindow :10/:20/:28）、`@profer/shared`（三通道）。

## 5-7. 数据/分支/权限

纯广播；空列表分支（:26）。

## 8. 修改影响面

规划 UI 刷新链。需同步测试（无专属，待检索）。

## 9. 测试证据

无专属测试文件（清单内无 planning-events.test）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 3 条；三分离语义 | 已证实 | :4-30 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 3 导出 | §2/§3 | :4-30 | covered |

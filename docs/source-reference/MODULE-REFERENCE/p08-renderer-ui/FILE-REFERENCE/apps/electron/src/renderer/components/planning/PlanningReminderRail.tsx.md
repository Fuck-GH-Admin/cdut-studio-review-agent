---
path: apps/electron/src/renderer/components/planning/PlanningReminderRail.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0a71e2a92897421d146c051f4f6f18f8f52ba19a
sha256: 5c75903331259652ce2bd562c6d4ac0d3e40850f27990d83748cc2d6d8c8cc82
lines: 140
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/planning/PlanningReminderRail.tsx

## 1. 结论与边界

全局常驻提醒条（`:31`）：**未确认提醒从 SQLite 恢复，不依赖一次性 toast 生命周期**。右下浮层（最多显 3 条+汇总行），带确认/查看 Todo/完成/推迟（5/10/30/60 分钟）动作。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `PlanningReminderRail` | function 组件 | `:33-140` | `{playSound=true}`（空提醒返回 null） |

内部：`formatTriggerTime`（`:15-21`，zh-CN 月日时分）；`mergeReminders`（`:23-27`，按 id 合并去重+按 `snoozedUntil ?? triggerAt` 升序）。

## 3. 内部逻辑与关键流程

### 3.1 数据管道（`:45-71`）

`load()`（`listActivePlanningReminders(teamWorkspaceId)`，失败 console.error）。三订阅（effect 卸载全清）：`onPlanningRemindersDue`（合并入 atom；**playSound && notificationsEnabled && soundEnabled 且有新提醒才播提示音**）；`onPlanningChanged`（reminders 资源变更→重载）；`sse.onEvent`（本 workspace 的 planning_reminder_due/planning_changed→重载——跨端同步）。`teamWorkspaceId` 仅当前 workspace 为 team 类型时传入。

### 3.2 动作（`:73-97`）

`acknowledge`/`completeTodo`（updateTodo→completed）/`openTodo`（切 planning 视图+todos tab+选中）/`snooze`（{id,minutes}）——失败均 console.error+toast。

### 3.3 渲染（`:99-140`）

空→null；浮层 `aria-live="polite"`（无障碍播报）；卡片=标题+触发时间（snoozed 优先）+类型/分组/标签；操作区=关闭（X）+todo 专属（查看/完成）+四档推迟；>3 条“另有 N 条待处理提醒”。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：应用全局挂载。出向：`@/atoms/{planning-atoms,active-view,agent-atoms,notifications}`、`window.electronAPI.{listActivePlanningReminders,acknowledgePlanningReminder,updateTodo,snoozePlanningReminder,onPlanningRemindersDue,onPlanningChanged,sse.onEvent}`、`sonner`。

## 5. 数据 I/O、读写与副作用

IPC 读写提醒/Todo；SSE 事件；提示音（受三开关门控）。atom 写（reminders/视图/tab/选中）。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 动作失败 | `:75-95` | console.error+toast（状态不冒充成功） |
| 提示音 | `:53` | 三开关+有新提醒才播 |
| 空提醒 | `:99` | null |
| 卸载 | `:66` | 三订阅清理 |

## 7. 权限与权威状态

持久化口径如实（SQLite 恢复、不依赖 toast）；team workspace 隔离（teamWorkspaceId）；提示音尊重用户开关。

## 8. 修改影响面

改提醒条 → 影响任务/日程提醒链路；IPC/atom 契约联动。

## 9. 测试证据

本轮 `NOT_RUN`。无直接测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| SQLite 恢复口径 | 已证实 | `:31` |
| 三订阅+SSE 同步 | 已证实 | `:48-68` |
| 提示音三开关门控 | 已证实 | `:53` |
| 运行表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 内部两件/数据管道 | 2/3.1 | `:15-71` | covered |
| 四动作 | 3.2 | `:73-97` | covered |
| 渲染 | 3.3 | `:99-140` | covered |

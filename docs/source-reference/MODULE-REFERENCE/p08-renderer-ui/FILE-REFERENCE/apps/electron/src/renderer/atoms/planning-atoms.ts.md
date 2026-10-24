---
path: apps/electron/src/renderer/atoms/planning-atoms.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 887d34b6b8360e61fc2ee38beea37186dfd801c5
sha256: ac8a54695c2c6991e67cb908b3d8e00486259ace4c2b08576c04503c38b78800
lines: 19
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/planning-atoms.ts

## 1. 结论与边界

**规划 Atoms**（`apps/electron/src/renderer/atoms/planning-atoms.ts`，19 行）：Todo/日程/标签/提醒/Tab 状态。**Todo 与日程分组分开维护，避免调用方意外混用**（`:8`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `PlanningTab` | type | `:4` | todos/calendar/automations |
| `todosAtom` | atom | `:6` | Todo 列表 |
| `calendarEventsAtom` | atom | `:7` | 日程事件 |
| `todoPlanningGroupsAtom`/`calendarPlanningGroupsAtom` | atom | `:9-10` | **分组分开**（`:8`） |
| `planningTagsAtom` | atom | `:11` | 标签 |
| `activePlanningRemindersAtom` | atom | `:12` | 活跃提醒 |
| `planningTabAtom` | atom | `:13` | 当前 Tab |
| `planningSelectedTodoIdAtom` | atom | `:15` | 外部入口指定打开任务 |
| `planningTodoCreateRequestAtom`/`planningCalendarCreateRequestAtom` | atom | `:17-19` | 递增请求 token（打开创建表单） |

## 3. 内部逻辑与关键流程

纯状态 atom（Jotai）；请求 token 递增协议（`:16-19`）。

## 4. 调用者与调用链

- 消费方：Todo/日程工作区、页头/快捷键入口。
- 出向：Jotai。

## 5. 数据 I/O、读写与副作用

纯内存状态；无持久化。

## 6. 分支、失败、取消与恢复

N/A（纯 atom）。

## 7. 权限与权威状态

分组分开（`:8`）防误用；请求 token 协议（外部入口→工作区）。

## 8. 修改影响面

atom 形状与工作区组件耦合。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

10 个导出已证实（`:4-19`）；测试实际通过未知（无测试）。

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 10 个导出 | `:4-19` | covered |

---
path: apps/electron/src/renderer/components/planning/CalendarWorkspace.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: cff33213f57fca320aa3a3ecbd8f7304f8da91ec
sha256: 97ee1d00ffdd39fd3167218b6149275b8d64761272c2870b3577e5cd2d10371c
lines: 1214
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/planning/CalendarWorkspace.tsx

## 1. 结论与边界

日程工作区（周/月视图）：日程事件 + Todo + 自动化触发的统一日历展示与拖拽创建。含 `buildWeekView`（周视图数据组装，被 smoke test 直测）。容器+视图+标记组件族。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CalendarWorkspace` | function 组件 | `:168-493` | `{embedded=false; toolbarStart/End/Target}` 主工作区 |
| `buildWeekView` | function | 中段 | 周视图组装（dayItems：allDayTodos+timedSegments；completed 同样归位——smoke test 核心口径） |

内部常量：`DEFAULT_EVENT_DURATION=60min`/`DRAG_SNAP_MINUTES=15`/`CALENDAR_GROUP_COLORS` 七色（`:24-26`）；`calendarGroupColor/calendarEventGroupColor`（自定义色回退调色板）；拖拽草稿类型族（`CalendarCreatePointer/CalendarPopoverAnchor/CalendarDraftPreview/EventDraft`，`:42-73`）；`isPlanningConflictError`（`:75`，冲突错误判定）；日期工具（`startOfDay/startOfWeek/addDays/nextDayStart/previousDayStart/atLocalMinute/useLocalDayStart/addMonths`，`:79-135`）；`formatTime/formatDay/eventEndAt/eventOccursOnDay/draftFromEvent`（`:137-166`）。

视图/标记族：`MonthCalendar`（`:506-543`，月格子聚合）、`TodoCalendarMarker`/`TodoPreviewContent`、`formatAutomationTimestamp/formatAutomationSchedule/AutomationPreviewContent/AutomationCalendarMarker`（`:554-588`，**同一任务同一天只显一个标记、count=当天触发次数**，`:494-495`）、`CalendarEventMarker`（`:589`）。

## 3. 内部逻辑与关键流程

### 3.1 主工作区（`:168-493`）

周/月切换；拖拽创建（15min 吸附、草稿预览、松手弹 Popover 保存）；事件/Todo/自动化三层渲染；工具栏插槽（toolbarStart/End/Target——embedded 时由宿主提供）。

### 3.2 `buildWeekView`

按周一锚点展开 7 天；Todo 依 dueAt 归入 allDayTodos（无时刻）或 timedSegments（带时刻段）；**completed+dueAt 仍归位显示**（smoke test“本次改动核心”口径）；无 dueAt 不进视图。

### 3.3 月视图/标记

自动化按天去重计数；标记点击→预览内容（TodoPreview/AutomationPreview）。

### 3.4 周视图几何与成员口径（源证补录）

- **hourHeight 自适应**（`:812` useState 初值 56）：44-80px 区间，约 12 小时可视；WeekTimePanel 顶线/事件块/选区/当前时刻线全部按 `hourHeight` 比例定位（`:779-793`）。
- **team.getMembers 稳定字段是 `userId` 不是 `id`**（`:193`）：历史 bug 口径——成员映射显式取 `item.userId`，缺失则丢弃该成员（防 undefined id 入列）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：PlanningView（calendar tab）。直接测试 `CalendarWorkspace.smoke.test.ts`（buildWeekView，详见其手册）。出向：`@profer/shared`（CalendarEvent/Todo/Automation）、`window.electronAPI`（日程 CRUD）、`@profer/ui`。

## 5. 数据 I/O、读写与副作用

IPC 日程/Todo 读写；拖拽 DOM 事件。无持久化直写。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 冲突错误 | `:75` | 判定后提示 |
| 草稿取消 | — | Esc/点外取消 |
| 无 dueAt Todo | — | 不进视图 |

## 7. 权限与权威状态

completed 显示口径如实（改动核心，测试锁死）；自动化单标记计数口径（防视觉噪声）。

## 8. 修改影响面

改日历 → 影响规划中心日程交互；`buildWeekView` 有 smoke test 锁定。

## 9. 测试证据

本轮 `NOT_RUN`。直接测试 `CalendarWorkspace.smoke.test.ts`（4 test：completed 归位/open 回归/无 dueAt 不进/同日共存）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| completed 归位口径 | 已证实 | buildWeekView+smoke test |
| 15min 吸附/草稿流 | 已证实 | `:25/:42-73` |
| 自动化单标记计数 | 已证实 | `:494-495` |
| 运行表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 常量/工具族 | 2 | `:24-166` | covered |
| `CalendarWorkspace` | 3.1 | `:168-493` | covered |
| `buildWeekView` | 3.2 | 中段 | covered |
| 月视图/标记族 | 3.3 | `:494-1214` | covered |

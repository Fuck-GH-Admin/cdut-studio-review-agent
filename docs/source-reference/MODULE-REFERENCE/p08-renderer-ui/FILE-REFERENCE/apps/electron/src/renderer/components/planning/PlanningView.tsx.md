---
path: apps/electron/src/renderer/components/planning/PlanningView.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 05fbbafe6e03a27e5d7e21e32ed416e8288b2b6e
sha256: 380ada66e83f606a6e2e8a07d2f79d8cce440ffe7d7a20d92983a87c420fa61a
lines: 663
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/planning/PlanningView.tsx

## 1. 结论与边界

规划中心主视图（Todo/日程工作区）：Tab 切换（`TABS`，`:32`）、统计行、TodoWorkspace（列表/详情/快捷创建）。`standalone` 变体供独立窗口（PlanningWindowApp）。容器+工作区组件族。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `PlanningView` | function 组件 | `:53-162` | `{standalone=false}` 主容器 |

内部：`CreateShortcutHint`（`:38`）、`PlanningStat`（`:49`，label+计数）、`endOfToday/addLocalDays`（`:163-173`，本地日界计算）、`useLocalDayVersion`（`:175-`，跨天刷新 hook）、`dateTimeLabel`（`:201`，**Todo 默认“当天”为计划单位，用户主动选时间才显精确时分**）、`TodoWorkspace`（`:205-592`，列表/详情主工作区）、`TodoEmptyState`（`:593`）、`DetailField/DetailSection`（`:599/:603`）、`TodoListItem`（`:607`）、`TodoMetaBadge`（`:649`）。

## 3. 内部逻辑与关键流程

### 3.1 主容器（`:53-162`）

Tab 栏（todos/calendar 等）+统计行（PlanningStat）+按 Tab 分发工作区；`standalone` 时调整布局（独立窗口）。

### 3.2 TodoWorkspace（`:205-592`）

列表（TodoListItem：标题/状态/徽章）+详情面板（DetailSection 族）+快捷创建（CreateShortcutHint）；团队 workspace 隔离（teamWorkspaceId 透传）；日期语义“当天”口径（`dateTimeLabel`）。

### 3.3 日期工具

`endOfToday`/`addLocalDays`（本地时区日界）；`useLocalDayVersion`（跨天自动刷新视图）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：activeView=planning（AppShell 主区）与 PlanningWindowApp（standalone）。出向：`@/atoms/planning-atoms`、PlanningGroupManager/ReminderRail/TagManager/FloatingInspector/CalendarWorkspace（同目录）、`@profer/shared`（Todo 类型）、`window.electronAPI`（Todo CRUD）。

## 5. 数据 I/O、读写与副作用

IPC Todo/日程读写；atom 读写（tab/选中/过滤）。无持久化直写。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| Tab 分发 | `:53-162` | 各工作区 |
| 空列表 | `:593` | TodoEmptyState（带创建入口） |
| 跨天 | `:175-` | useLocalDayVersion 刷新 |

## 7. 权限与权威状态

“当天”计划口径如实（`:200`）；team workspace 隔离透传。

## 8. 修改影响面

改视图 → 影响规划中心全交互面；同目录组件族契约联动。

## 9. 测试证据

本轮 `NOT_RUN`。相关测试：`CalendarWorkspace.smoke.test.ts`（buildWeekView，详见其手册）；PlanningView 本体无直接测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| “当天”口径/跨天刷新 | 已证实 | `:200/:163-199` |
| standalone 变体 | 已证实 | `:53` |
| 运行表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 主容器 | 3.1 | `:32-162` | covered |
| TodoWorkspace/列表族 | 3.2 | `:205-663` | covered |
| 日期工具 | 3.3 | `:163-203` | covered |

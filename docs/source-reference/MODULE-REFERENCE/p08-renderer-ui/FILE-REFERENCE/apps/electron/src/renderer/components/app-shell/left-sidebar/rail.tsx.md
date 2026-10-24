---
path: apps/electron/src/renderer/components/app-shell/left-sidebar/rail.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0a9798d5c64a6a375d8e774fb90845771e957bc6
sha256: e6b2da674766311a5d6bcb55f8bea703159bc2de8325a7cfb1c2052a69b937e1
lines: 231
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/app-shell/left-sidebar/rail.tsx

## 1. 结论与边界

折叠态 mini rail（文件头 `:1-4`）：从 LeftSidebar 抽离的折叠态图标视图，经 `SidebarModel` 读状态/handler。纯展示+回调透传。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `SidebarRail` | function 组件 | `:19-231` | `({s: SidebarModel})` |

## 3. 内部逻辑与关键流程

自上而下条目（均 Tooltip+aria-label）：

1. `SidebarWindowDragStrip`（拖拽条，Mac 50/其它 8）；**macOS 避让红绿灯留白**（留白自身可拖拽，`:35` 注释）。
2. 展开按钮（`setSidebarCollapsed(false)`，唯一布局控制入口；快捷键提示 ⌘B/Ctrl+B 按 `navigator.platform`）。
3. Agent 模式钮（`handleRailModeSwitch('agent')`；**悬停弹 `CollapsedWorkspacePopover` 项目切换**，aria-label 含此语义）。
4. 新会话（`data-profer-navigation-item="new-session"`）/搜索（开 SearchDialog）。
5. 规划中心（计数徽标 `formatAutomationCount(automationCount)`）/Agent 技能（capabilities 入口）。
6. CDUT Science（`data-profer-navigation-item="cdut-science"`）/设置（`setSettingsOpen(true)`）/`UserAvatar`（`hasEnvironmentIssues` 指示）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：`LeftSidebar`（折叠分支）。出向：`@/components/agent/CollapsedWorkspacePopover`、`@/components/shared/UserAvatar`、`./navigation-items`、`./sidebar-utils`、`@profer/ui`（Tooltip）、`@/atoms/active-view`。

## 5. 数据 I/O、读写与副作用

`activeViewAtom` 写（setActiveView）；其余回调在 hook。无 I/O。

## 6. 分支、失败、取消与恢复

Mac/非 Mac 拖拽条与留白高度分支；其余无。

## 7. 权限与权威状态

无权限语义；快捷键提示按平台（navigator.platform）。

## 8. 修改影响面

改条目 → 影响折叠态导航；SidebarModel 契约联动 hook。

## 9. 测试证据

本轮 `NOT_RUN`。本批清单中无直接测试文件；`bun test`/typecheck/GUI 均未运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 条目族/aria/悬停项目切换 | 已证实 | `:19-231` |
| Mac 红绿灯避让 | 已证实 | `:35` |
| 运行表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `SidebarRail` | 2/3 | `:19-231` | covered |

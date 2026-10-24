---
path: apps/electron/src/renderer/components/app-shell/left-sidebar/navigation-items.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1eb50dd5013eee80aff81968888a6283d82fc967
sha256: 5cd7065a9499444aceb81bf81dcd74ce322c32fc01a7a805199cbe6cbfdee34c
lines: 163
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/app-shell/left-sidebar/navigation-items.tsx

## 1. 结论与边界

侧边栏导航小件（文件头 `:1-8`）：自动任务（规划中心）/Agent 技能入口条目、窗口拖拽条、全屏视图焦点移交辅助。纯展示+DOM 焦点辅助。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `renderWorkspaceSortIcon` | function | `:17-26` | 三排序三图标（recent→History/name→ArrowDownAZ/默认→CalendarDays） |
| `SIDEBAR_DRAG_STRIP_HEIGHT` | const | `:28-33` | 拖拽条高度四态（collapsedMac 50/expandedMac 30/collapsed 8/expanded 4） |
| `AutomationSidebarEntry` | 组件 | `:41-73` | 规划中心条目（计数徽标 `formatAutomationCount`、`data-profer-navigation-item="planning"`、aria-label 含任务数） |
| `SkillsSidebarEntry` | 组件 | `:82-117` | Agent 技能条目（`updateCount>0` 蓝色可更新徽标、aria-label 含可更新数） |
| `SidebarWindowDragStrip` | 组件 | `:119-127` | 拖拽条（aria-hidden） |
| `enterableViewSelector` | function | `:130-134` | planning/agent-skills→`[data-profer-navigation-region=…]`（其余 null） |
| `focusEnterableViewItem` | function | `:140-163` | 进全屏后移交焦点（rAF 等下一帧——React 渲染异步，`:137`）；agent-skills 优先激活 tab（`aria-selected=true`→默认 skills，`:138-139`：region 首个可聚焦控件是工作区下拉而非 tab）；通用回退首个 focusable→region 容器（tabIndex=-1） |

## 3. 内部逻辑与关键流程

条目=按钮（active 双态样式+计数徽标）；焦点移交=rAF+querySelector 选择器族+`scrollIntoView(nearest)`。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：`left-sidebar/` rail/expanded-sidebar。出向：`./sidebar-utils.formatAutomationCount`、`lucide-react`。

## 5. 数据 I/O、读写与副作用

DOM 焦点/滚动（focusEnterableViewItem）。无 I/O。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| item 非全屏视图 | `:130-134` | null selector→不聚焦 |
| region 未渲染 | `:144-157` | target 空→不操作 |
| agent-skills tab 优先 | `:147-151` | 激活 tab→默认 skills→通用回退 |

## 7. 权限与权威状态

焦点移交口径如实（rAF 等帧、tab 优先原因）。

## 8. 修改影响面

改条目/焦点 → 影响导航可用性（键盘/手柄）。

## 9. 测试证据

本轮 `NOT_RUN`。本批清单中无直接测试文件；`bun test`/typecheck/GUI 均未运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 焦点移交三段回退 | 已证实 | `:136-163` |
| aria/计数徽标语义 | 已证实 | `:46/:87` |
| 运行表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 7 导出 | 2/3 | `:17-163` | covered |

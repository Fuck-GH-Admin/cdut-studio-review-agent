---
path: apps/electron/src/renderer/components/app-shell/NavigatorPanel.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5b5e2a50eb9e7e4a53e00a3d6875ba9d73ad0c6e
sha256: 572482c1ad023eba38d89d2d1412a01bc25c29fd321015d1d3a9d34dc27be052
lines: 32
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/app-shell/NavigatorPanel.tsx

## 1. 结论与边界

列表式导航中间面板（文件头 `:1-4`）：头部标题 + 可滚动内容区。组合组件（`Panel`+`PanelHeader`），无状态。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `NavigatorPanelProps` | interface | `:10-17` | `{title; width: number; children}` |
| `NavigatorPanel` | function 组件 | `:19-32` | `Panel(variant:'shrink', width)` + `PanelHeader` + `flex-1 overflow-y-auto` 内容区 |

## 3. 内部逻辑与关键流程

固定宽度（shrink）+右侧边框+抬升表面底色；内容区独立滚动。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：app-shell 导航区。出向：`./Panel`、`./PanelHeader`。

## 5. 数据 I/O、读写与副作用

无 I/O：纯布局组合（`Panel`+`PanelHeader`+滚动内容容器），不订阅 atom、无副作用、无 DOM 事件。

## 6. 分支、失败、取消与恢复

无运行时分支（props 恒定渲染）；无失败/取消/恢复语义。

## 7. 权限与权威状态

无权限语义；`width` 为纯布局像素值，无能力门禁。

## 8. 修改影响面

改本组件 → 影响中间导航面板（列表式导航）的标题/滚动布局；`Panel`/`PanelHeader` 契约联动同目录组件。

## 9. 测试证据

本轮 `NOT_RUN`。本批清单中无直接测试文件；`bun test`/typecheck/GUI 均未运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 组合式纯展示 | 已证实 | `:19-32` |
| 运行表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `NavigatorPanel` | 2/3 | `:19-32` | covered |

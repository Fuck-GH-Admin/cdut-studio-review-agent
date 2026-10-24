---
path: apps/electron/src/renderer/components/tabs/TabBar.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 128c93097b34a78d6d10538989cce1011394bb66
sha256: ed50e2fb5d1d5ce52ec1bf8bf0dadfcd977714be5b0fb1a6544947b6206afcde
lines: 1427
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/components/tabs/TabBar.tsx

## 1. 结论与边界

顶部标签栏（头注释 :2-9）：点击切换/中键关闭/拖拽重排/紧凑自适应宽度（溢出横向滚动）。本批最大组件（1427 行）。

## 2. 导出与关键符号

导出 1 条（`export` :88）：`TabBar`（:88-）。内部：`TabBarInner`（:525-，主体）、`TopBarActions`（:1378-，右侧操作胶囊）、`TopBarTool`（:1365）、宽度估算常量族（:458-464：MIN 132/MAX 280/ASCII 7.5px/CJK 13px/PADDING 56/BADGE 94/GAP 4）、`measureEstimatedTextPx`（:466）/`estimateFullTabsWidth`（:478）。

## 3. 内部逻辑与关键流程

（头+大纲级，1427 行）：tabsAtom 系状态（:16-24，reorderTabs/updateTabTitle/MRU）；紧凑宽度估算（ASCII/CJK 分别计像素）；TopBarActions 与 topbar-layout 几何契约联动（TOPBAR_ACTIONS_EDGE_GAP 三处共用）。

## 4. 调用者与调用链

入向（子agent 交叉核）：生产唯一实际渲染点 `MainArea.tsx:21`→:341；`AppShell.tsx:14` **死导入（从未渲染）**。出向：tab-atoms（:16-25）、agent-atoms（:28-43）、tab-group-atoms（:49-62）、topbar-layout（:82-86，常量用点 :429/:1231/:1246/:1254）、TabBarItem（:72→:1295）、TabGroupItem（:73→:1271）；electronAPI openAgentBrowser:658/updateAgentSessionTitle:1172。

## 5. 数据 I/O、读写与副作用

标签状态读写+重排持久化。

## 6. 分支、失败、取消与恢复

拖拽重排/溢出滚动分支；不适用取消/恢复。

## 7. 权限与权威状态

topbar-layout 整数像素/不重叠契约联动（拖拽层与操作胶囊几何相邻）。

## 8. 修改影响面

- 消费面：MainArea 顶栏。
- 依赖面：tab-atoms/topbar-layout/条目组件。
- 需同步测试：无专属（topbar-layout.test 仅测几何纯函数）。

## 9. 测试证据

无专属测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 1 条；宽度估算常量族 | 已证实 | :458-464 |
| 1427 行逐行实现 | 推断（头+大纲级） | :88-1426 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+估算族 | §2 | :88-478 | covered |
| 条目/滚动/操作区实现 | §3/§10 | :525-1426 | 推断 |

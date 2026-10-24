---
path: apps/electron/src/renderer/components/tabs/EmptyPanePlaceholder.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a21867e4366692317e75f9f796333ed82dc702cc
sha256: dd1bef51c3c5ea5cb5dff91210796f4f005831ce8bbe0f8476b8b07fd1cc4ee2
lines: 102
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/components/tabs/EmptyPanePlaceholder.tsx

## 1. 结论与边界

组合空栏选择入口（头注释 :2-9）：拖会话进分区**不自动补位**——空栏是选择入口（下拉选/拖入）；候选=组合白名单（agent/chat/browser）排除已在栏；**跨会话组合已放开**不按会话收窄（:8）。

## 2. 导出与关键符号

导出 2 条（`export` :26/:40）：`EmptyPanePlaceholderProps`（:26-31，excludeTabIds/onPick/onDissolve）、`EmptyPanePlaceholder`（:40-102）。内部：`CandidateIcon`（:33-38，三类型图标）。

## 3. 内部逻辑与关键流程

候选过滤（:47-50）：排除+isGroupEligibleTab；下拉列表/空态文案（:74-89）；**Z_LAYER.menu 显式提升**（:72-73 注释：shell 层会被 Radix 默认 z-50 盖住）；解散分栏按钮（:93-99）。

## 4. 调用者与调用链

入向（子agent 交叉核）：唯一 `MainArea.tsx:35`（JSX :372/:400 空窗格兜底）。出向：tab-atoms（:44）、isGroupEligibleTab（:47）、Z_LAYER、dropdown-menu。

## 5-7. 数据/分支/权限

纯渲染；候选二分支；不适用。

## 8. 修改影响面

- 消费面：分栏空栏。
- 依赖面：tab-group 白名单。
- 需同步测试：无专属。

## 9. 测试证据

无专属测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 2 条；不自动补位契约 | 已证实 | :2-9 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 导出+候选链 | §2/§3 | :26-102 | covered |

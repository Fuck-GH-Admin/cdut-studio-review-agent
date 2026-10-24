---
path: apps/electron/src/renderer/components/planning/PlanningWindowApp.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c0b505dbec6525234e5947aac5d099a60a52bd8e
sha256: d437f068b6f9006324c9c572a00ee02cd73355c4babc52fefaaefdbceb9aa3d2
lines: 17
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/planning/PlanningWindowApp.tsx

## 1. 结论与边界

规划中心独立窗口入口（`:8`）：复用规划中心、**不挂载聊天与 Agent 工作区**。薄入口组件。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `PlanningWindowApp` | function 组件 | `:9-17` | 独立窗口根 |

## 3. 内部逻辑与关键流程

`useEffect` 设 `document.title='Proma · 规划中心'`（`:12-14`）；`automationFormAtom.open` 为真渲染 `AutomationFormView`（自动化表单覆盖），否则 `PlanningView standalone`；外层 `TooltipProvider(delayDuration=200)`+全屏容器。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：独立窗口渲染入口。出向：`@/components/automation/AutomationFormView`、`@/atoms/automation-atoms`、`./PlanningView`、`@profer/ui`。

## 5. 数据 I/O、读写与副作用

`document.title` 写一次；atom 只读。无 I/O。

## 6. 分支、失败、取消与恢复

自动化表单开/关两分支（`:16`）；无异步。

## 7. 权限与权威状态

独立窗口口径（不挂聊天/Agent）如实注释。

## 8. 修改影响面

改入口 → 影响独立规划窗口；`PlanningView(standalone)` 契约联动。

## 9. 测试证据

本轮 `NOT_RUN`。无直接测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 独立窗口口径/表单覆盖 | 已证实 | `:8/:16` |
| 运行表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `PlanningWindowApp` | 2/3 | `:9-17` | covered |

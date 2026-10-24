---
path: apps/electron/src/renderer/components/agent/ActiveTasksBar.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0df74474f5f97b83fb2b1de28be7f81f11772faa
sha256: 9de8d483356b2fef06fdcd5b549ddec9d9e861c54a48d23fb07b9f438bb08e7d
lines: 64
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/ActiveTasksBar.tsx

## 1. 结论与边界

后台任务实时视图（文件头 `:1-6`）：显示在 AgentView 输入框上方、水平排列运行中的后台任务；点任务徽章滚动到对应实时工具调用。无状态容器组件（回调全部由父级注入）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ActiveTasksBarProps` | interface | `:13-24` | `{tasks: BackgroundTask[]; onTaskClick(toolUseId); onTaskStop?; onTaskOutput?; className?}` |
| `ActiveTasksBar` | function 组件 | `:31-64` | 空任务返回 null |

## 3. 内部逻辑与关键流程

`tasks.length===0` → null（`:38-39`）；否则横排容器（`flex-wrap`、上边框、`bg-muted/30`）：标签“运行中任务”+ `TaskBadge` 列表（key=toolUseId；onClick→`onTaskClick(toolUseId)`；onStop/onOutput 按需包一层闭包，未注入则 undefined）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：AgentView 输入框上方。出向：`./TaskBadge`、`@/lib/utils.cn`、`@/atoms/agent-atoms.BackgroundTask`（类型）。

## 5. 数据 I/O、读写与副作用

无（纯渲染+回调透传）。

## 6. 分支、失败、取消与恢复

仅空列表分支（`:38-39`）。

## 7. 权限与权威状态

无。停止/输出能力由父级回调决定（可选注入即门禁）。

## 8. 修改影响面

改徽章布局 → 影响任务概览/导航；`BackgroundTask`/`TaskBadge` 契约联动。

## 9. 测试证据

本轮 `NOT_RUN`。无直接测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 空任务不渲染 | 已证实 | `:38-39` |
| 回调按需注入 | 已证实 | `:57-58` |
| 运行表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| Props/组件 | 2/3 | `:13-64` | covered |

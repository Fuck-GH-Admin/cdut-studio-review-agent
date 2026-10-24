---
path: apps/electron/src/renderer/components/agent/BackgroundTasksPanel.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8da35e4646e0d5494f61adac8f85ecb2609c6557
sha256: e0876e7998d1dad5a5e767041db7b0a74acc98fc73423f1cb61d37014c0056d8
lines: 85
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/BackgroundTasksPanel.tsx

## 1. 结论与边界

后台任务面板（文件头 `:1-6`）：显示在助手消息工具执行区域下方，以**表格**形式展示运行中的后台任务（参考 Craft-agent-oss 表格样式）。纯展示（无状态、无交互回调）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `BackgroundTasksPanelProps` | interface | `:13-16` | `{tasks: BackgroundTask[]; className?}` |
| `BackgroundTasksPanel` | function 组件 | `:23-85` | 空任务返回 null |

## 3. 内部逻辑与关键流程

`tasks.length===0` → null（`:28`）；标题“N 个后台任务：”+ 三列表格（#/任务描述/状态）：行 key=toolUseId；图标按 `type`（shell→Terminal，其余→GitBranch）；描述 `intent` 回退“Shell/Task 任务”；状态列恒“运行中”（spinner）——**仅运行中任务进入此面板**（面板口径）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：助手消息工具区下方。出向：`react`、`lucide-react`、`@/lib/utils.cn`、`@/atoms/agent-atoms.BackgroundTask`（类型）。

## 5. 数据 I/O、读写与副作用

无（纯渲染）。

## 6. 分支、失败、取消与恢复

仅空列表分支；状态列无分支（恒运行中）。

## 7. 权限与权威状态

无权限语义；任务状态以注入 `tasks` 为准。

## 8. 修改影响面

改表格 → 影响消息流任务展示；`BackgroundTask` 契约联动。

## 9. 测试证据

本轮 `NOT_RUN`。无直接测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 空不渲染/表格三列 | 已证实 | `:28-81` |
| 状态恒运行中（面板口径） | 已证实 | `:71-76` |
| 运行表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| Props/组件 | 2/3 | `:13-85` | covered |

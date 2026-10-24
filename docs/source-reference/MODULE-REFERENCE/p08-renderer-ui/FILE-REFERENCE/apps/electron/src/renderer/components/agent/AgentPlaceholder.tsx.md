---
path: apps/electron/src/renderer/components/agent/AgentPlaceholder.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6cd7b582b3aae6ff6d7fd4bd759c39725c2d733e
sha256: 58d2e2809e829d226ec60bf0ab429a65cbc198367a4fa984c35affc2900d4ee9
lines: 27
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/AgentPlaceholder.tsx

## 1. 结论与边界

Agent 模式占位符组件（文件头 `:1-5`）：**临时占位**，后续替换为完整 Agent/Flow 组件。纯展示（Bot 图标 + 标题 + 描述 + “即将推出”徽章），无状态、无交互、无数据流。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `AgentPlaceholder` | function 组件 | `:10-27` | `() => React.ReactElement` |

## 3. 内部逻辑与关键流程

静态 JSX：居中列布局（Tailwind 类）、`lucide-react` Bot 图标、文案“使用 AI Agent 处理复杂任务，支持多步骤推理和工具调用”、琥珀色“即将推出”胶囊（深浅色双态类）。无分支。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：AgentView/模式切换处（Agent 模式暂位）。出向：`react`、`lucide-react`。

## 5. 数据 I/O、读写与副作用

无（纯渲染）。

## 6. 分支、失败、取消与恢复

无。

## 7. 权限与权威状态

无。“即将推出”如实标注未实现状态。

## 8. 修改影响面

替换为真实 Agent 组件时整体移除；样式与 shell 主题联动。

## 9. 测试证据

本轮 `NOT_RUN`。无直接测试（纯展示占位）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 临时占位、无逻辑 | 已证实 | 文件头、`:10-27` |
| 运行表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `AgentPlaceholder` | 2/3 | `:10-27` | covered |

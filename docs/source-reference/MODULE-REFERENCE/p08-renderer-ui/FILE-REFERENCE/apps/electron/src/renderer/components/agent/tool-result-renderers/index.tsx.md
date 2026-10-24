---
path: apps/electron/src/renderer/components/agent/tool-result-renderers/index.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 56d205c8c7cc59b8c00ffe4ed58b841a8350e408
sha256: 61979ae8c5f9d069331cc487d71421785b2932156be8be76a73b27563cf9cb8a
lines: 59
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/tool-result-renderers/index.tsx

## 1. 结论与边界

工具结果**分发渲染器**（59 行）：按 `toolName` switch 分发到专属渲染器，未匹配→`DefaultResultRenderer`（`:4-5`）。纯展示层分发，无状态、无 IO。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `ToolResultRendererProps` | `:22-29` | `{toolName, input, result, isError, imageAttachments?, basePath?}` |
| `ToolResultRenderer` | `:31-57` | switch 分发：Bash/PowerShell→BashResultRenderer；Read→Read；Edit（带 basePath）；Write；Grep；Glob；WebSearch；WebFetch；TaskGet；TaskList；default→DefaultResultRenderer（带 imageAttachments） |
| `CollapsibleResult` re-export | `:59` | 从 `./collapsible-result` 转出口 |

## 3. 内部逻辑与关键流程

单 switch。注意分发差异：仅 Edit 收 `basePath`、仅 default 收 `imageAttachments`、Glob/WebSearch/WebFetch/TaskGet/TaskList 不收 `input`（照实记录）。

## 4. 调用者与调用链

Agent 消息渲染管线（tool result 块）；出向 11 个兄弟渲染器 + `../image-attachment-marker`（类型）。

## 5. 数据 I/O、读写与副作用

纯渲染；无 IO。

## 6. 分支、失败、取消与恢复

错误态由各子渲染器处理（本层透传 isError）。

## 7. 权限与权威状态

分发表即契约：工具名↔渲染器映射（新增工具需在此登记）。

## 8. 修改影响面

改分发表影响对应工具展示；缺省分支影响 MCP 工具。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件分发表/props 契约 | 已证实 | 59 行全读 |
| 各子渲染器行为 | 已证实 | 同批各手册 |
| 渲染实效 | 未知 | NOT_RUN（Electron） |

## 11. 覆盖表

全文件 covered；渲染实效 unknown。

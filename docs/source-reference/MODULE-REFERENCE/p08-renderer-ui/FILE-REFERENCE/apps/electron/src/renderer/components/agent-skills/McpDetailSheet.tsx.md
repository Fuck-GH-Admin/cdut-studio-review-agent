---
path: apps/electron/src/renderer/components/agent-skills/McpDetailSheet.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8c071b2214a17bfb454ce9912a19d5297888cb5d
sha256: 88756d3d7eb25f2a09377215a00d0a7eb563458404ace8f60059837eeff0432f
lines: 60
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent-skills/McpDetailSheet.tsx

## 1. 结论与边界

**MCP 服务器编辑/新增右侧抽屉**（`apps/electron/src/renderer/components/agent-skills/McpDetailSheet.tsx:1-4`）：复用 `McpServerForm`（自带保存逻辑）；`server` 为 null 时是新增模式。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `McpDetailSheet` | 组件 | `:22-60` | `{open, server, workspaceSlug, onOpenChange, onSaved, onChanged}` |

## 3. 内部逻辑与关键流程

`server===null`→新增；否则编辑。保存经 `McpServerForm` 内部；`onSaved`/`onChanged` 回调。

## 4. 调用者与调用链

- 消费方：AgentSkillsView（MCP 区）。
- 出向：`McpServerForm`（复用，不在本批）。

## 5. 数据 I/O、读写与副作用

经 `McpServerForm` 保存（IPC）。

## 6. 分支、失败、取消与恢复

新增/编辑两态（`:4`）。

## 7. 权限与权威状态

MCP 配置保存（`workspaceSlug` 参数化）。

## 8. 修改影响面

`McpServerForm` 合同；onSaved/onChanged 协议。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

1 个导出、新增/编辑两态已证实（`:22-60`）；测试实际通过未知（无测试）。

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `McpDetailSheet` | `:22-60` | covered |

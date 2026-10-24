---
path: apps/electron/src/renderer/components/agent-skills/McpCard.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b20202ac0572197e31b2e39625f16ba2aa418f7e
sha256: 8a2a9ed7701f585675571f3cbbe8899485a7fccdfba746682a2726ae23e7afd3
lines: 110
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent-skills/McpCard.tsx

## 1. 结论与边界

**MCP 服务器卡片**（`apps/electron/src/renderer/components/agent-skills/McpCard.tsx:1-4`，商店风）：整卡可点打开编辑抽屉；**右上角开关独立响应（阻止冒泡）**。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `McpCard` | 组件 | `:24-110` | `{name, entry, onOpen, onToggle, onRequestDelete}` |

## 3. 内部逻辑与关键流程

整卡 `onOpen`；开关 `onToggle`（`stopPropagation` 防触卡点击）；删除入口 `onRequestDelete`。

## 4. 调用者与调用链

- 消费方：AgentSkillsView（MCP 区）。
- 出向：回调（open/toggle/delete）。

## 5. 数据 I/O、读写与副作用

无 I/O（回调）。

## 6. 分支、失败、取消与恢复

开关冒泡阻止（`:4`）。

## 7. 权限与权威状态

无身份语义；MCP 启用/禁用状态。

## 8. 修改影响面

卡片回调合同；删除确认（`onRequestDelete` 上抛）。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

1 个导出已证实（`:24-110`）；测试实际通过未知（无测试）。

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `McpCard` | `:24-110` | covered |

---
path: apps/electron/src/renderer/components/agent-skills/SkillCard.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6ec431a95e3f28c38c7e6c073369bc7790e7a5eb
sha256: e1af99459ebd3d77ed96e2dfd1585d7a6e9ff2988d158a02f028d3965f6dc5d4
lines: 194
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent-skills/SkillCard.tsx

## 1. 结论与边界

**Skill 卡片**（`apps/electron/src/renderer/components/agent-skills/SkillCard.tsx:1-4`，商店风）：整卡可点开详情抽屉；**右上角开关与「更新」按钮独立响应（阻止冒泡）**。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `SkillCard` | 组件 | `:41-194` | Skill 卡片 |

## 3. 内部逻辑与关键流程

整卡 `onOpen`；开关/更新按钮 `stopPropagation` 防触卡点击（`:4`）；更新入口独立。

## 4. 调用者与调用链

- 消费方：AgentSkillsView/MasterSkillsTab（Skill 区）。
- 出向：回调（open/toggle/update）。

## 5. 数据 I/O、读写与副作用

无 I/O（回调）。

## 6. 分支、失败、取消与恢复

冒泡阻止（`:4`）。

## 7. 权限与权威状态

无身份语义；启用/禁用+更新状态。

## 8. 修改影响面

卡片回调合同。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

1 个导出已证实（`:41-194`）；测试实际通过未知（无测试）。

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `SkillCard` | `:41-194` | covered |

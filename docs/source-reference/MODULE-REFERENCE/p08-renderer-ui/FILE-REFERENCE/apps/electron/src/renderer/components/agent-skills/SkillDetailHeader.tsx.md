---
path: apps/electron/src/renderer/components/agent-skills/SkillDetailHeader.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3d91f9f4bbce5f6d684152e09b899cfef06790e0
sha256: a054b3e227d2f7f1ce6ab606536a81b218b662ee584e17a9ddd440c418ad41c8
lines: 65
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent-skills/SkillDetailHeader.tsx

## 1. 结论与边界

**工作区与全局 Skill 详情共用的标题和操作承载**（`apps/electron/src/renderer/components/agent-skills/SkillDetailHeader.tsx:15`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `SkillDetailHeader` | 组件 | `:16-65` | 详情标题+操作插槽 |

## 3. 内部逻辑与关键流程

标题/元数据/操作 actions 插槽；工作区/全局共用（`:15`）。

## 4. 调用者与调用链

- 消费方：`SkillDetailSheet`/`MasterSkillDetailSheet`。
- 出向：React。

## 5. 数据 I/O、读写与副作用

无 I/O（插槽承载）。

## 6. 分支、失败、取消与恢复

空态。

## 7. 权限与权威状态

无身份语义；共用承载。

## 8. 修改影响面

header actions 插槽合同。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

1 个导出已证实（`:15-65`）；测试实际通过未知（无测试）。

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `SkillDetailHeader` | `:16-65` | covered |

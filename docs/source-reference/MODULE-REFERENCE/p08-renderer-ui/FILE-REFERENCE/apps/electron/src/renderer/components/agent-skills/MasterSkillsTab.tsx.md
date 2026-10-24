---
path: apps/electron/src/renderer/components/agent-skills/MasterSkillsTab.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 88ace16139e1cf775703a91be88f48a85989c59a
sha256: 24d6d12393d07ea20c851f07228275fa04d2a0941dcef130ad05ff00a1fd773d
lines: 298
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent-skills/MasterSkillsTab.tsx

## 1. 结论与边界

**MasterSkillsTab**（`apps/electron/src/renderer/components/agent-skills/MasterSkillsTab.tsx`，298 行）：技能列表 Tab（支持 `globalMode`/`hideToolbar`，与 `GlobalCapabilitiesView` 联动）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `MasterSkillsTab` | 组件 | `:37-298` | 技能列表 Tab |

## 3. 内部逻辑与关键流程

Skill 列表（工作区/全局按 `globalMode`）；创建/导入/详情入口；requestToken 响应（创建/导入触发）。

## 4. 调用者与调用链

- 消费方：`GlobalCapabilitiesView`/AgentSkillsView。
- 出向：Skill API、`MasterSkillDetailSheet`（详情）。

## 5. 数据 I/O、读写与副作用

经 API；无本地写。

## 6. 分支、失败、取消与恢复

空态/加载态。

## 7. 权限与权威状态

全局/工作区按 `globalMode` 区分（配套 GlobalCapabilitiesView）。

## 8. 修改影响面

Skill API 契约；requestToken 协议。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

1 个导出已证实（`:37-298`）；测试实际通过未知（无测试）。

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `MasterSkillsTab` | `:37-298` | covered |

---
path: apps/electron/src/renderer/components/agent-skills/GlobalCapabilitiesView.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a8f081f3b434e00ebd4a8f05042c438c8c56dcf6
sha256: 836ce0d17c6777cc355d703db75c6883c5a340352e5954b0523d5f27b5445f19
lines: 48
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent-skills/GlobalCapabilitiesView.tsx

## 1. 结论与边界

**全局内容容器**（`apps/electron/src/renderer/components/agent-skills/GlobalCapabilitiesView.tsx:16`）：工具条由父页面统一渲染，子领域只负责列表/编辑/详情。按 `initialTab` 分派 `MasterSkillsTab`（skills）/`AgentPresetSettings`（presets），`hideToolbar` 模式。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `GlobalCapabilitiesView` | 组件 | `:17-48` | `{initialTab='skills', workspaceSlug?, search?, createSkillRequestToken?, importSkillRequestToken?, createPresetRequestToken?}` |

内部：`GlobalCapabilityTab`（`:5`，skills/presets）、`GlobalCapabilitiesViewProps`（`:7-14`）。

## 3. 内部逻辑与关键流程

`initialTab==='skills'` → `MasterSkillsTab globalMode hideToolbar`（`:28-36`）；否则 `AgentPresetSettings globalMode hideToolbar`（`:38-44`）；requestToken 透传（创建/导入请求 token）。

## 4. 调用者与调用链

- 消费方：全局配置页（工具条在父页面）。
- 出向：`MasterSkillsTab`/`AgentPresetSettings`（同批）。

## 5. 数据 I/O、读写与副作用

无直接 I/O（子组件负责）。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| skills/presets | `:27-45` | 分派子组件 |

## 7. 权限与权威状态

无身份语义；容器职责分离（`:16`）。

## 8. 修改影响面

requestToken 协议（创建/导入触发）；子组件 props 合同。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 个导出、双分支容器 | 已证实 | `:16-48` |
| 测试实际通过 | 未知 | 无测试 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `GlobalCapabilitiesView` | `:17-48` | covered |

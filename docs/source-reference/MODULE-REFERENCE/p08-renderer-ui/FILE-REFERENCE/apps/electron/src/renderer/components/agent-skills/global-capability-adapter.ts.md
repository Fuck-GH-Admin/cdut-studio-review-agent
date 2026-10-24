---
path: apps/electron/src/renderer/components/agent-skills/global-capability-adapter.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: da5170054ce313f691bf6360ee1dec6ba58de3a0
sha256: 3e654e5921c03c9b86f9e36d28f8d2815c5a0f8139bd2e51c263b5d7a525fea3
lines: 139
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent-skills/global-capability-adapter.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

全局能力页 renderer adapter 契约（139 行，头注 :1-6）：renderer 只做展示映射；**删除阻塞、引用解析、作用域校验全在 main-process manager，不能在此重算或绕过**。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `GlobalCapabilityDomain/Scope` | type | 14-15 | skill|preset × builtin-meta|user-global |
| `GlobalCapabilityItem` | interface | 17-26 | id/domain/scope/name/description/version/readOnly/updatedAt? |
| `GlobalCapabilityImpact` | type | 28-30 | skill→DeleteBlockers；preset→ReferenceReport |
| `GlobalCapabilityAdapter` | interface | 32-48 | 12 方法契约 |
| `globalCapabilityPreloadAdapter` | const | 83-134 | 真实 preload 映射（缺方法→Promise 自然失败交页面显示，注释 :82） |
| `referenceForPresetCandidate` | fn | 136-139 | 候选→PresetReference |

内部：`presetReference`（:50-59，scope 缺省推断同 preset-selector-utils）、`skillItem`（:61-71，`readOnly=type==='builtin-meta'`）、`presetItem`（:73-80，**workspace 作用域混入即 throw**「全局预设列表不应包含 workspace 作用域项」）。

## 3. 内部逻辑与关键流程

适配器 12 方法逐一委派 `window.electronAPI`：skill 侧 `globalSkill.*`（list/getDeleteBlockers/deleteUser/copyToWorkspace/setEnabled/restore）；preset 侧 `listGlobalAgentPresets/getPresetReferenceReport/deleteGlobalAgentPreset/copyPresetToWorkspace/listAgentPresets/setDefaultAgentPresetReference`；rebindSessions/rebindAutomations 用 `Promise.all` 逐 id 委派。

## 4. 调用者与调用链

入向：全局能力页（列表/影响评估/删除/提升）。出向：`window.electronAPI`（12+ IPC）、`@profer/shared` 类型。

## 5. 数据 I/O、读写与副作用

经 preload IPC；无直接磁盘。

## 6. 分支、失败、取消与恢复

preload 缺方法→Promise reject 交页面报错（不做防御性兜底，注释 :82）；workspace 预设混入→throw。

## 7. 权限与权威状态

- 重算禁令权威：删除阻塞/引用解析/校验只信 main-process（头注 :4-5）；adapter 不做业务判断。
- 只读标注：builtin-meta 恒 readOnly（skill/preset 同规则）。

## 8. 修改影响面

- 受影响消费者：全局能力页全量操作（两域）。
- 回归关注：委派完整性（12 方法）、presetItem throw 守卫、readOnly 映射。
- 同测：`global-capability-adapter.test.ts`（3 用例）。

## 9. 测试证据

直接测试 `global-capability-adapter.test.ts`（3 用例 / 1 describe；mock window.electronAPI；NOT_RUN）：
1. `:6-13` 全局预设引用保留显式 scope（user-global 不被误解析为 workspace）。
2. `:15-22` 工作区候选引用携带 workspaceSlug。
3. `:24-53` 真实 adapter 委派链断言（list 映射字段 + getImpact/copy/setEnabled/restore/delete 顺序落 calls，最终 `['copy-skill:…','enabled:…','restore:…','delete-skill:…']`）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出群/行号 | 已证实 | 逐行核对 |
| 引用/委派语义 | 已证实 | 测试 :6-53 |
| presetItem throw 分支 | 已证实（代码）/未知（行为） | :73-80（未测） |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `referenceForPresetCandidate` | §9 | 50-59 | covered |
| `globalCapabilityPreloadAdapter` 委派 | §3/§9 | 83-134 | covered |
| `presetItem` throw 守卫 | §2 | 73-80 | covered（未测） |

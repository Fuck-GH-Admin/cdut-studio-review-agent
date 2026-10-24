---
path: apps/electron/src/renderer/components/agent/PresetSelector.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8641bc9f4495ad4a2cb31bf68204d57fb1a22371
sha256: 6d71d9d00fd91eaf68b2ab6d7c717827d408b3d748ced4e835ff0dec3d467c98
lines: 212
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/PresetSelector.tsx

## 1. 结论与边界

**Agent 预设选择器**（`apps/electron/src/renderer/components/agent/PresetSelector.tsx:1-7`）：展示会话绑定预设（岗位），展开全部（内置 standard/code/minimal+自定义），切换即持久化。心智模型：**模型=大脑、Skill=手册、预设=岗位**（对齐 DeepSeek Harness，`:7`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `PresetSelector` | 组件 | `:61-212` | `{sessionId, persistedPresetId, persistedPresetReference, persistedRevision, workspaceSlug, open, onOpenChange, onManagePresets}` |

内部：预设特性 badge 短标签（`:23-26`）、「极简」开关持久化 key（`:27`，跨会话/重启生效）。

## 3. 内部逻辑与关键流程

展示当前预设→展开全部→切换持久化（含 `persistedPresetReference`/`persistedRevision` 版本锚）；极简开关（紧凑模式）持久化。

## 4. 调用者与调用链

- 消费方：AgentView 输入工具栏。
- 出向：预设 API（切换/持久化）。

## 5. 数据 I/O、读写与副作用

经 API 持久化（预设绑定）；显示偏好本地持久化。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 切换预设 | — | 持久化 |
| 极简开关 | `:27` | 跨会话生效 |

## 7. 权限与权威状态

预设=岗位（权限上限来源，preset-policy 配套）；`persistedPresetReference`/`revision` 版本锚。

## 8. 修改影响面

- 预设 API 契约；badge 标签表。
- 心智模型文案（`:7`）。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 个导出、选择/持久化 | 已证实 | `:1-212` |
| 测试实际通过 | 未知 | 无测试 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `PresetSelector` | `:61-212` | covered |

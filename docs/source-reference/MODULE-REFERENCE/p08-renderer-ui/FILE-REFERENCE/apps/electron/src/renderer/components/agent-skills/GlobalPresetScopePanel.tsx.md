---
path: apps/electron/src/renderer/components/agent-skills/GlobalPresetScopePanel.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: df4d59856f8581d19cf5acd1a998d066b38d57f6
sha256: e33d61baf4f96cd5fec82389e5d7fe430f3e51f6dbaa43d06d7e77e38bac2752
lines: 146
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent-skills/GlobalPresetScopePanel.tsx

## 1. 结论与边界

**全局/元预设的工作区生效范围面板**（`apps/electron/src/renderer/components/agent-skills/GlobalPresetScopePanel.tsx:24`）：交互与预设编辑器的多选白名单**保持一致**。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `GlobalPresetScopePanel` | 组件 | `:25-146` | `{preset: Props}` 生效范围面板 |

## 3. 内部逻辑与关键流程

多选工作区白名单（与预设编辑器一致交互，`:24`）；增删生效范围（经预设 API）。

## 4. 调用者与调用链

- 消费方：全局/元预设详情。
- 出向：预设 API（范围变更）。

## 5. 数据 I/O、读写与副作用

经 API；无本地写。

## 6. 分支、失败、取消与恢复

空态/加载态。

## 7. 权限与权威状态

生效范围=预设权限边界（preset-policy `AgentPresetScope` 配套）。

## 8. 修改影响面

范围 API 契约；与预设编辑器白名单一致性（`:24`）。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

1 个导出、一致性约定已证实（`:24-146`）；测试实际通过未知（无测试）。

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `GlobalPresetScopePanel` | `:25-146` | covered |

---
path: apps/electron/src/renderer/components/agent-skills/GlobalPresetSettings.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: dcaa2e88187482f7b15e7ca5a1e12920d361bd23
sha256: f1d7eeee7b3d81e98545091d639fe36bdf7ecea822b2d5dd7c682763170b4a25
lines: 74
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent-skills/GlobalPresetSettings.tsx

## 1. 结论与边界

**全局预设设置**（`apps/electron/src/renderer/components/agent-skills/GlobalPresetSettings.tsx`，74 行）：用户全局预设（岗位）管理面板（列表/编辑）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `GlobalPresetSettings` | 组件 | `:14-74` | 全局预设面板 |

## 3. 内部逻辑与关键流程

全局预设列表/编辑/创建（经预设 API）。

## 4. 调用者与调用链

- 消费方：`GlobalCapabilitiesView`（presets 分支）。
- 出向：预设 API。

## 5. 数据 I/O、读写与副作用

经 API；无本地写。

## 6. 分支、失败、取消与恢复

空态/加载态。

## 7. 权限与权威状态

全局=用户级预设（preset-policy 配套）。

## 8. 修改影响面

预设 API 契约。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

1 个导出已证实（`:14-74`）；测试实际通过未知（无测试）。

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `GlobalPresetSettings` | `:14-74` | covered |

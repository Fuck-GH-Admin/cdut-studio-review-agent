---
path: apps/electron/src/renderer/components/agent-skills/AgentPresetSettings.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 453e3f7ee0367093a2154b02445c847da90318b4
sha256: 4e8c24fe78260e954d9b6a768739783ad122703090f2a9deb13bd380282c400c
lines: 1780
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent-skills/AgentPresetSettings.tsx

## 1. 结论与边界

**「Agent 技能」视图「预设」tab 管理区块**（`apps/electron/src/renderer/components/agent-skills/AgentPresetSettings.tsx:1-5`，1780 行本批最大）：内置预设只读可复制；自定义预设可编辑/删除；任意预设可设为默认。**编辑表单覆盖五类能力：提示词段、推理档位、权限模式、Skill 白名单、MCP 白名单**（`:5`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `AgentPresetSettings` | 组件 | `:286-1780` | 预设管理区块 |

内部：能力组选项**来自 shared registry 避免 UI 与运行时清单漂移**（`:105`）；Radix Select 空字符串 placeholder+非空哨兵（`:106`）；**与运行时一致的自动映射（shared 唯一事实表）：工具组禁用→隐藏对应提示词段 key（含 automation）**（`:115`）；逗号分隔→slug 数组（`:138`）；可搜索多选列表（chip 平铺勾选+已选计数+全选清空，`:166`）。

## 3. 内部逻辑与关键流程

- 预设列表（内置只读可复制/自定义可编辑删除/设默认）。
- 编辑表单五类能力（`:5`）；白名单（Skill/MCP）chip 多选。
- **shared registry 单一事实源**（`:105`、`:115`）——UI 与运行时不漂移。

## 4. 调用者与调用链

- 消费方：`GlobalCapabilitiesView`（presets）/AgentSkillsView（预设 tab）。
- 出向：预设 API、`@profer/shared`（registry/映射表）。

## 5. 数据 I/O、读写与副作用

经 API 保存；无本地写。

## 6. 分支、失败、取消与恢复

保存失败 toast；内置只读。

## 7. 权限与权威状态

- 权限模式是五类能力之一（preset-policy 配套——permissionMode 权限上限）。
- **shared registry 唯一事实表**（`:115`）防 UI/运行时漂移。

## 8. 修改影响面

- shared registry 合同（`:105`、`:115`）；五类能力表单。
- 工具组↔提示词段自动映射（`:115`）。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

1 个导出、shared 单一事实源红线已证实（`:105-166`）；测试实际通过未知（无测试）。

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `AgentPresetSettings` | `:286-1780` | covered |
| 映射/registry 约定 | `:105-166` | covered |

---
path: apps/electron/src/renderer/components/settings/primitives/SettingsToggle.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c86415911a2bac47731702633c9e3aa44f630786
sha256: 6a9ccd56db6e7876a2e80fc4a01957771109713045e7296186fadf30c0a53ef8
lines: 48
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/settings/primitives/SettingsToggle.tsx

## 1. 结论与边界

**设置开关控件**（`:1-6` 注释）：封装 ShadcnUI Switch，集成标签和描述；用于布尔值设置项。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `SettingsToggle` | function（export） | `:26-48` | `({label, description?, checked, onCheckedChange, disabled?})` |

## 3. 内部逻辑与关键流程

行布局（`ROW_CLASS`）+标签/描述（`:34-40`）+`Switch` 受控透传三属性（`:41-45`）。

## 4. 调用者与调用链

入向：各设置页布尔项。出向：`@profer/ui/primitives/switch`、`./SettingsUIConstants`。

## 5. 数据 I/O、读写与副作用

受控组件；回调上抛。

## 6. 分支、失败、取消与恢复

description 条件渲染。不适用。

## 7. 权限与权威状态

不适用（控件）；布尔语义归调用方。

## 8. 修改影响面

- 改受控接线（checked/onCheckedChange）→ 全部布尔设置行为。
- 改行布局/描述显示 → 设置页视觉一致性。
- 改 disabled 透传 → 禁用态交互面。
- 无测试锁定（§9）：改动需人工验证开关行为。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `SettingsToggle` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出 | 已证实 | 逐行读 `:1-48` |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `SettingsToggle` | §2/§3 | `:26-48` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |

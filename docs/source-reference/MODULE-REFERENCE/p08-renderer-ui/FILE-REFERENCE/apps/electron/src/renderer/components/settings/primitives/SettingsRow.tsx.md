---
path: apps/electron/src/renderer/components/settings/primitives/SettingsRow.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 018cc292dd0aa5b79360e6e5986a5b1a315d0c21
sha256: bb058e71ecf70870507121cd870adb8fdb976298a3a117cc106a954262abb842
lines: 44
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/settings/primitives/SettingsRow.tsx

## 1. 结论与边界

**设置行布局**（`:1-6` 注释）：左侧标签+描述，右侧操作控件；通常用于 SettingsCard 内部。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `SettingsRow` | function（export） | `:25-44` | `({label, icon?, description?, children?, className?})` |

## 3. 内部逻辑与关键流程

三段 flex：可选 icon（`:34`）+标签/描述主体（min-w-0 防溢出 `:35-40`）+右侧 children 控件（`:41`）。

## 4. 调用者与调用链

入向：SettingsCard 内各处。出向：`./SettingsUIConstants`、`@/lib/utils`。

## 5. 数据 I/O、读写与副作用

纯渲染。

## 6. 分支、失败、取消与恢复

icon/description/children 条件渲染。不适用。

## 7. 权限与权威状态

不适用（布局组件）。

## 8. 修改影响面

- 改行布局 → 设置行视觉与控件对齐。
- 改 min-w-0/截断策略 → 长标签溢出行为。
- 改 icon/children 插槽 → 各设置页使用面。
- 无测试锁定（§9）：改动需人工验证行渲染。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `SettingsRow` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出 | 已证实 | 逐行读 `:1-44` |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `SettingsRow` | §2/§3 | `:25-44` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |

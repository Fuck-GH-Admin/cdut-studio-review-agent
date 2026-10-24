---
path: apps/electron/src/renderer/components/settings/primitives/SettingsSegmentedControl.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7309c740e6099a20628bfcaf5d7738132422b2ca
sha256: baba8efef96216107095dd271c9ec58dcd1c19b27531af984710de894a6f3033
lines: 70
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/settings/primitives/SettingsSegmentedControl.tsx

## 1. 结论与边界

**分段选择器**（`:1-6` 注释）：少量选项快速切换（如外观主题）；水平按钮组高亮当前项。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `SettingsSegmentedControl` | function（export） | `:33-70` | label/description/value/onValueChange/options/disabled? |

内部：`SegmentOption`（`:13-16`）。

## 3. 内部逻辑与关键流程

options.map 渲染按钮；选中态 `bg-background shadow-sm` 与未选中 `text-muted-foreground` 对比（`:59-61`）；点击 `onValueChange(option.value)`（`:55`）。

## 4. 调用者与调用链

入向：外观主题等设置项。出向：`@/lib/utils`、`./SettingsUIConstants`。

## 5. 数据 I/O、读写与副作用

受控组件；回调上抛。

## 6. 分支、失败、取消与恢复

选中/未选中双分支。不适用。

## 7. 权限与权威状态

不适用（控件）。

## 8. 修改影响面

- 改选中态样式 → 主题选择视觉。
- 改受控接线 → 分段设置保存行为。
- 改 options 渲染（图标/布局）→ 分段控件使用面。
- 改 disabled 透传 → 禁用态交互。
- 无测试锁定（§9）：改动需人工验证切换行为。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `SettingsSegmentedControl` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出+1 内部 | 已证实 | 逐行读 `:1-70` |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `SettingsSegmentedControl` | §2/§3 | `:33-70` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |

---
path: apps/electron/src/renderer/components/settings/primitives/SettingsSelect.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 31e751ad541e21b1b19f76a2ac96ac2f640883a8
sha256: 54091d80c1f3758edd55f15ba5286bfb935d1cc85b7ff0092209fedb18ed967f
lines: 87
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/settings/primitives/SettingsSelect.tsx

## 1. 结论与边界

**设置下拉选择控件**（`:1-5` 注释）：封装 ShadcnUI Select，集成标签/描述/图标选项。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `SelectOption` | interface（export） | `:20-25` | value/label/icon?（图标 URL） |
| `SettingsSelect` | function（export） | `:44-87` | label/description/value/onValueChange/options/placeholder?/disabled? |

## 3. 内部逻辑与关键流程

`selected` memo（`:53`）；触发器显示选中项（图标 `<img>` +label `:66-71`，无选中回落 placeholder）；下拉项同样图标+label（`:75-82`）。

## 4. 调用者与调用链

入向：各设置页选择项。出向：`@profer/ui/primitives/select`、`./SettingsUIConstants`。

## 5. 数据 I/O、读写与副作用

受控组件；图标 URL 外部资源加载（img）。

## 6. 分支、失败、取消与恢复

selected/placeholder 双分支。不适用。

## 7. 权限与权威状态

不适用（控件）；图标资源来源归调用方。

## 8. 修改影响面

- 改受控接线 → 下拉设置保存行为。
- 改图标渲染（img 尺寸/fallback）→ 选项视觉。
- 改 placeholder 回落 → 空值显示行为。
- 改选项结构（SelectOption）→ 各设置页选项定义。
- 无测试锁定（§9）：改动需人工验证下拉行为。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `SettingsSelect` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出+图标渲染 | 已证实 | 逐行读 `:1-87` |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `SettingsSelect`/`SelectOption` | §2/§3 | `:20-87` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |

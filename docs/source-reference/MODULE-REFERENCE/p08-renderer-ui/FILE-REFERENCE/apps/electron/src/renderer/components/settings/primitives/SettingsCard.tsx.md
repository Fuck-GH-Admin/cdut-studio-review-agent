---
path: apps/electron/src/renderer/components/settings/primitives/SettingsCard.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d440c775fe0dd41592f9bf525d926f3bb0507397
sha256: 24bca3a3dbadb883c1a71081ea22b00d976f1e484fb0ada484db2ca3a2b1e883
lines: 43
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/settings/primitives/SettingsCard.tsx

## 1. 结论与边界

**设置卡片容器**（`:1-6` 注释）：圆角卡片，子元素间自动插分隔线；包裹 SettingsRow 或其他控件。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `SettingsCard` | function（export） | `:22-43` | `({children, className?, divided=true})` |

## 3. 内部逻辑与关键流程

`React.Children.toArray(...).filter(Boolean)` 后逐子元素渲染，非末尾插 `<Separator className={DIVIDER_CLASS}>`（`:27-39`）；`divided=false` 原样透传（`:40`）。

## 4. 调用者与调用链

入向：各设置页。出向：`@profer/ui/primitives/separator`、`./SettingsUIConstants`、`@/lib/utils`。

## 5. 数据 I/O、读写与副作用

纯渲染。

## 6. 分支、失败、取消与恢复

divided 双分支。不适用。

## 7. 权限与权威状态

不适用（布局组件）。

## 8. 修改影响面

- 改分隔线插值逻辑 → 设置卡片行间视觉。
- 改 `divided` 默认值 → 全部卡片布局变化。
- 改 className 合并 → 主题覆盖面。
- 无测试锁定（§9）：改动需人工验证卡片渲染。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `SettingsCard` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出+双分支 | 已证实 | 逐行读 `:1-43` |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `SettingsCard` | §2/§3 | `:22-43` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |

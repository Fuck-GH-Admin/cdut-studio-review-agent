---
path: apps/electron/src/renderer/components/settings/primitives/SettingsTextarea.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f79feac698292768619a6c4075147789b92c399b
sha256: 9246562a879dfa54657ad7aec715ecc73924114ba495d0c8e44c19fef8e2c030
lines: 63
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/settings/primitives/SettingsTextarea.tsx

## 1. 结论与边界

**设置多行文本输入控件**（`:1-3` 注释）：Textarea 集成标签/描述/错误态/最小高度。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `SettingsTextarea` | function（export） | `:29-63` | label/description/value/onChange/placeholder?/minHeight?=96/disabled?/error? |

## 3. 内部逻辑与关键流程

标签/描述块（`:41-46`）+受控 Textarea（`resize-y`+错误边框 `:52-55`、`minHeight` 内联样式 `:56`）+错误行（`:58-60`）。

## 4. 调用者与调用链

入向：各设置页多行项。出向：`@profer/ui/primitives/textarea`、`./SettingsUIConstants`。

## 5. 数据 I/O、读写与副作用

受控组件。

## 6. 分支、失败、取消与恢复

error 双分支。不适用。

## 7. 权限与权威状态

不适用（控件）。

## 8. 修改影响面

- 改受控接线 → 多行设置保存行为。
- 改 minHeight/resize 策略 → 输入区体验。
- 改错误态样式 → 校验反馈视觉一致性。
- 改标签/描述布局 → 设置页一致性。
- 无测试锁定（§9）：改动需人工验证输入行为。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `SettingsTextarea` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出+错误态 | 已证实 | 逐行读 `:1-63` |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `SettingsTextarea` | §2/§3 | `:29-63` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |

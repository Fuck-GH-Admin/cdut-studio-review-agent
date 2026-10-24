---
path: apps/electron/src/renderer/components/settings/primitives/SettingsInput.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: faf4c44088a97ed37336a0f37eb6e69fb4e9780c
sha256: d29b4eb116610b0f985598f995307422575ef899aeb19ee284915230a213ef24
lines: 71
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/settings/primitives/SettingsInput.tsx

## 1. 结论与边界

**设置文本输入控件**（`:1-5` 注释）：封装 ShadcnUI Input，集成标签/描述/错误状态。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `SettingsInput` | function（export） | `:36-71` | label/description/value/onChange/onBlur?/placeholder?/required?/disabled?/error?/type?（默认 'text' `:46`） |

## 3. 内部逻辑与关键流程

标签/描述块（`:50-55`）+受控 Input（value→onChange 转值 `:59`、onBlur 延迟保存场景 `:60`）+错误态（边框 destructive `:64`）+错误行（`:66-68`）。

## 4. 调用者与调用链

入向：各设置页。出向：`@profer/ui/primitives/input`、`./SettingsUIConstants`。

## 5. 数据 I/O、读写与副作用

受控组件；onBlur 回调（延迟保存）。

## 6. 分支、失败、取消与恢复

error 双分支。不适用。

## 7. 权限与权威状态

不适用（控件）；保存语义归调用方（onBlur）。

## 8. 修改影响面

- 改受控接线/类型 → 全文本设置输入行为。
- 改错误态样式 → 校验反馈视觉。
- 移除 onBlur 透传 → 延迟保存场景失效。
- 改标签/描述布局 → 设置页一致性。
- 无测试锁定（§9）：改动需人工验证输入行为。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `SettingsInput` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出+错误态 | 已证实 | 逐行读 `:1-71` |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `SettingsInput` | §2/§3 | `:36-71` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |

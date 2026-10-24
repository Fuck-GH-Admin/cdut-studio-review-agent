---
path: apps/electron/src/renderer/components/settings/primitives/SettingsSecretInput.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: da538049ce6f9896f76583530fa5df71e432b654
sha256: ed223a027a80e1b31ecfac86a82692ad6dc21b9ec053f396bc5c8a188e97c148
lines: 70
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/settings/primitives/SettingsSecretInput.tsx

## 1. 结论与边界

**API Key 专用密码输入控件**（`:1-5` 注释）：内置密码显隐切换，适用于敏感信息输入。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `SettingsSecretInput` | function（export） | `:30-70` | label/description/value/onChange/placeholder?/required?/disabled? |

## 3. 内部逻辑与关键流程

`visible` state 控 `type='text'|'password'`（`:39/:51`）；显隐按钮 Eye/EyeOff 切换（`:59-66`，`tabIndex={-1}` 防键盘焦点干扰）。

## 4. 调用者与调用链

入向：各设置页密钥项。出向：`@profer/ui/primitives/input`、lucide-react。

## 5. 数据 I/O、读写与副作用

受控组件；显隐仅本地 state。

## 6. 分支、失败、取消与恢复

visible 双分支。不适用。

## 7. 权限与权威状态

敏感输入面：默认遮蔽（password）；**密钥持久化与加密归 Main/存储层（跨文件）**。

## 8. 修改影响面

- 改显隐逻辑/默认遮蔽 → API Key 输入安全体验。
- 改受控接线 → 各密钥设置保存行为。
- 改按钮无障碍属性 → 键盘导航行为。
- 改标签/描述布局 → 设置页一致性。
- 无测试锁定（§9）：改动需人工验证密钥输入。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `SettingsSecretInput` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出+显隐双态 | 已证实 | 逐行读 `:1-70` |
| 密钥存储链 | 未知 | 跨文件 |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `SettingsSecretInput` | §2/§3 | `:30-70` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |

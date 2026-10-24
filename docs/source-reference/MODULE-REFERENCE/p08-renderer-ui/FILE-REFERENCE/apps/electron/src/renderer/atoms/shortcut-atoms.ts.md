---
path: apps/electron/src/renderer/atoms/shortcut-atoms.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3e71c05454ea9812aa89fd7831a53444c45792f8
sha256: bf617a5f7dbdd4f16ddb895c023ec00869a5fcd3cd2fd8bb08d86cbb4c978934
lines: 15
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/shortcut-atoms.ts

## 1. 结论与边界

**快捷键 Atoms**（`apps/electron/src/renderer/atoms/shortcut-atoms.ts:1-6`）：用户自定义快捷键覆盖；**经 settings IPC 持久化到 settings.json**（`:5`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `shortcutOverridesAtom` | atom | `:12` | 快捷键覆盖 |
| `sendWithCmdEnterAtom` | atom | `:15` | 发送模式（true=Cmd/Ctrl+Enter，false=Enter） |

## 3. 内部逻辑与关键流程

纯 atom；持久化经 settings IPC（`:5`）。

## 4. 调用者与调用链

- 消费方：快捷键管理页/输入组件。
- 出向：settings IPC。

## 5. 数据 I/O、读写与副作用

settings IPC 持久化（settings.json）。

## 6. 分支、失败、取消与恢复

N/A（纯状态 atom，无分支逻辑）。

## 7. 权限与权威状态

快捷键覆盖权威在 settings.json（`:5`）。

## 8. 修改影响面

atom 形状与消费组件耦合。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

2 个导出已证实（`:12-15`）；测试实际通过未知（无测试）。

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 2 个导出 | `:12-15` | covered |

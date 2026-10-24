---
path: apps/electron/src/renderer/atoms/ui-preferences.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3693adf437034794a83854465ecdc97a744bff91
sha256: 51a6fb4c44277f675de1ad3a0dd3f29ad68f7b16c3d0dff1c7c13d7c24620061
lines: 132
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/ui-preferences.ts

## 1. 结论与边界

**UI 偏好设置 Atoms**（`apps/electron/src/renderer/atoms/ui-preferences.ts:1-4`）：悬浮置顶条、输入框 Markdown 渲染、粘贴转附件、矮窗口压缩输入框等显示偏好。

## 2. 导出与关键符号

`export` 共 **10 个**（按真实行号）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `stickyUserMessageEnabledAtom` | const | `:20` | — |
| `longTextPasteAsAttachmentEnabledAtom` | const | `:23` | — |
| `richTextRenderingEnabledAtom` | const | `:26` | — |
| `ComposerCompactModeSettings` | interface | `:29` | — |
| `composerCompactModeAtom` | const | `:39` | — |
| `initializeUiPreferences` | async | `:50` | — |
| `updateStickyUserMessageEnabled` | async | `:76` | — |
| `updateLongTextPasteAsAttachmentEnabled` | async | `:87` | — |
| `updateRichTextRenderingEnabled` | async | `:98` | — |
| `updateComposerCompactMode` | async | `:109` | — |

## 3. 内部逻辑与关键流程

显示偏好 atom 集；富文本渲染保留 Mention 引用（`:25`）；矮窗口压缩档（`:38`）。

## 4. 调用者与调用链

- 消费方：消息气泡/输入框/设置页。
- 出向：Jotai。

## 5. 数据 I/O、读写与副作用

纯内存状态（或经注明的持久化）；无 I/O。

## 6. 分支、失败、取消与恢复

N/A（纯状态 atom，无分支逻辑）。

## 7. 权限与权威状态

富文本模式「仍保留 Mention 引用」（`:25`）——功能不因渲染模式丢失。

## 8. 修改影响面

atom 形状与消费组件耦合。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

5 个导出已证实（`:20-38`）；测试实际通过未知（无测试）。

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 5 个导出 | `:20-132` | covered |

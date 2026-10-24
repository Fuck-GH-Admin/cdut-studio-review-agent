---
path: apps/electron/src/renderer/components/shared/CopyButton.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e14eaba27e1939e2dba094076bbb4b197f3d58f3
sha256: 7f9a8d701867d61789a5f20debbe70da40ae19b4b09da5beba5cea7ea6f26bec
lines: 63
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/shared/CopyButton.tsx

## 1. 结论与边界

复制消息内容按钮（文件头 `:1-6`，移植自 profer-frontend chat-view/copy-button）：`MessageAction` + Copy/Check 图标切换。含 Markdown 转义还原（`copyAsPlainText`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `unescapeMarkdownTextForClipboard` | function | `:24-30` | 还原编辑器转义：`\\\\`→`\`、`\\`+Markdown 特殊字符→原字符（防复制粘贴反斜杠翻倍，`:19-23`） |
| `CopyButton` | function 组件 | `:32-63` | `{content; copyAsPlainText=false}` |

## 3. 内部逻辑与关键流程

`handleCopy`：`navigator.clipboard.writeText`（plainText 时先还原）→ `copied=true`、2s 定时器复位（重按清旧定时器）；失败 `console.error`（不冒充成功）。卸载清定时器。tooltip“复制/已复制”。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：消息操作区。出向：`@/components/ai-elements/message.MessageAction`、`lucide-react`。

## 5. 数据 I/O、读写与副作用

剪贴板写；定时器。无持久化。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 复制失败 | `:42-44` | console.error（图标不切换） |
| 重按 | `:40` | 清旧定时器 |

## 7. 权限与权威状态

转义还原口径如实（用户可见纯文本优先于内部 Markdown 源码）。

## 8. 修改影响面

改复制语义 → 影响消息复制内容正确性。

## 9. 测试证据

本轮 `NOT_RUN`。无直接测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 转义还原双规则 | 已证实 | `:19-30` |
| 失败不冒充/2s 复位 | 已证实 | `:36-45` |
| 运行表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 两导出 | 2/3 | `:24-63` | covered |

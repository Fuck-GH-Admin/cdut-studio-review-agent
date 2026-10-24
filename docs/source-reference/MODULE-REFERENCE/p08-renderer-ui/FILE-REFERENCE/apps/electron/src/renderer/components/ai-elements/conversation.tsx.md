---
path: apps/electron/src/renderer/components/ai-elements/conversation.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ebb1a233cf17b07299d2760422dd180416574a9d
sha256: 6fa482b1da7d0f0ecdea0cb8bcf95fef563c910447e7f4d9073660fc71fe9857
lines: 198
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/ai-elements/conversation.tsx

## 1. 结论与边界

**对话容器原语**（198 行，基于 use-stick-to-bottom 自动滚底，移植自 profer-frontend，`:2-12`）：Conversation 根容器/Content/EmptyState/ScrollButton 四件。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `ConversationProps`/`Conversation` | `:23-35` | StickToBottom 包装（`role="log"`、instant 初始、smooth resize） |
| `ConversationContentProps`/`ConversationContent` | `:39`/`:116-125` | 内容区；**onCopy 默认净化器**（`:121`） |
| `ConversationEmptyState` | `:135-164` | 空态（默认"暂无消息/在下方输入框开始对话"） |
| `ConversationScrollButtonProps`/`ConversationScrollButton` | `:168`/`:170-198` | 滚底按钮（isAtBottom 隐身） |

**复制净化器**（`handleConversationCopy:71-114`）：Dual MIME Clipboard Sanitizer（`:62-70` 文档含历史 Bug 修复记录）——克隆选区剔除噪音元素（工具条/气泡菜单/置顶横幅/代码块头/行号/button `:85-92`），**未命中噪音必须放行原生复制**（`:100-101`，防选区不一致）；命中→双模写回（text/plain 净化+text/html 保留结构）。内部 `BLOCK_TAGS:42-45`、`extractPlainText:48-59`（块边界补换行）。

## 3. 内部逻辑与关键流程

复制链：焦点在输入框→放行→无选区→放行→克隆净化→0 命中放行→双模写。`extractPlainText` 递归（BR→\n、块标签补 \n、3+ 换行折叠 `:106`）。

## 4. 调用者与调用链

会话视图（消息滚动区）；出向 `use-stick-to-bottom`、`@profer/ui`。

## 5. 数据 I/O、读写与副作用

剪贴板写（双模）；滚动行为。

## 6. 分支、失败、取消与恢复

四路放行分支（焦点/选区/容器/无噪音）；cleanText 空→不拦截。

## 7. 权限与权威状态

**复制保真契约**（`:67-69`）：净化仅限噪音元素，未命中必须 100% 原生一致（历史 Bug"Ctrl+C 粘贴与选区不一致"的修复红线）。

## 8. 修改影响面

改净化器影响复制体验；噪音选择器需随 UI 元素演进同步。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（照实记录）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件四导出/净化器双模 | 已证实 | 198 行全读 |
| **历史 Bug 注释群**（` :67-69` 修复记录、`:100-101` 放行规则） | 已证实 | 注释原文 |
| 剪贴板实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；实效 unknown。

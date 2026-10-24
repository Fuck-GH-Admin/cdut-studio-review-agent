---
path: packages/core/src/highlight/index.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7e897c46f11c123b3428418e2d6203d170c090f5
sha256: 6b317865f059780ab0f80d973f1bb86b7dde5cf83155fba1a5676131bc3e3e35
lines: 19
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/core/src/highlight/index.ts

## 1. 结论与边界

语法高亮模块出口（`packages/core/src/highlight/index.ts:1-5`）：基于 Shiki 的代码语法高亮服务，支持懒加载和按需加载语言。19 行纯转发。

边界：语言检测（`detectLanguage`）与高亮服务（shiki-service）分模块；Mermaid 不在此链（调用方先走 `@profer/ui` 的 `shouldRenderMermaidCodeBlock`，见 language-detector 注释）。

## 2. 导出与关键符号

无自身定义——2 条转发（`:7-18`）：

| 转发 | 行 | 内容 |
| --- | --- | --- |
| `./shiki-service.ts` | 7-16 | `getDisplayName`/`highlightCode`/`highlightCodeSync`/`highlightToTokens`/`isHighlighterReady`/`onHighlighterReady` + 类型 `HighlightOptions`/`HighlightResult`/`HighlightToken`/`HighlightTokensResult` |
| `./language-detector.ts` | 18 | `detectLanguage` |

## 3. 内部逻辑与关键流程

本文件不适用——依据：纯转发。

## 4. 调用者与调用链

出向：2 子模块。入向（检索=符号名+subpath `@profer/core/highlight`，全冻结树）：

- `apps/electron/src/renderer/components/ai-elements/message.tsx:42,893`（detectLanguage）。
- `apps/electron/src/renderer/components/diff/markdown-preview-extensions.tsx:17-19,53,126,135,191,199,656`（highlightCode/highlightToTokens/getDisplayName/HighlightTokensResult）。
- `packages/ui/src/code-block/CodeBlock.tsx:23-24,105-215`（getDisplayName/highlightToTokens/onHighlighterReady/HighlightToken(s)Result）。
- 产品入口：renderer ✔ + packages/ui ✔；main/preload/shared/cli ✘。**无直接测试**（message.test.ts 对这些符号零引用）。

## 5. 数据 I/O、读写与副作用

本文件不适用。

## 6. 分支、失败、取消与恢复

本文件不适用。

## 7. 权限与权威状态

本文件不适用——依据：无权限代码。

## 8. 修改影响面

增删转发条目改变 `@profer/core` 高亮公共面。

## 9. 测试证据

无专属测试（子模块测试覆盖）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 模块 11 符号转发 | 已证实 | `:7-18` |
| 生产消费者 | 见 UNVERIFIED 补记 | — |
| 测试通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 转发清单 | §2 | 7-18 | covered |

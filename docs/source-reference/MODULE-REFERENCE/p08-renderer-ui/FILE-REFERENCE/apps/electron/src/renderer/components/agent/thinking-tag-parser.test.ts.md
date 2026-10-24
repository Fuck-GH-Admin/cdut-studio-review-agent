---
path: apps/electron/src/renderer/components/agent/thinking-tag-parser.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: afc0882f9dbbb508e4a46375e095ac19fcd1b995
sha256: aa18002d8d4e073d981336ea9ccb6e873702b6ee47bb136f7c3a979bfda17f37
lines: 44
kind: test
package: p08-renderer-ui
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/thinking-tag-parser.test.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 测试目标

思考标签解析：闭合拆分、流式未闭合按思考、终态兜底 `unclosedTagAsText`、完整标签不受兜底影响、`<think>` 旧格式兼容。

## 2. 用例清单

5 用例 / 2 describe（`parseThinkTagsFromText` :5）。纯函数。

| # | 用例 | 行 | 核心断言 |
| --- | --- | --- | --- |
| 1 | 闭合+正文拆块 | 6-13 | thinking+text 两块 |
| 2 | 流式未闭合 | 15-21 | 剩余为 thinking 块 |
| 3 | 终态未闭合+兜底 | 23-31 | 剩余为 text（正文不被折叠进思考区） |
| 4 | 终态完整+兜底 | 33-41 | 仍拆 thinking/text |
| 5 | <think> 兼容 | 43-51 | thinking+text |

## 3. 真实断言

逐条读自 :6-51，代表性断言：

- `parseThinkTagsFromText('<thinking>规划实现</thinking>开始写代码')` deep-equal `[{type:'thinking',thinking:'规划实现'},{type:'text',text:'开始写代码'}]`（:8-12）。
- `parseThinkTagsFromText('前言<thinking>仍在思考')` → text 前言 + thinking 仍在思考（:17-20）——流式未闭合按思考块。
- `normalizeThinkTagsInContentBlocks([…<thinking>**Final concise response**…], { unclosedTagAsText: true })` → 单 text 块（正文不被折叠进思考区，:25-30）。
- 同参数完整闭合标签 → thinking+text 两块（兜底不影响已闭合，:34-40）。
- `<think>兼容旧标签<think>正文` → thinking+text（:44-50）。

## 4. 未覆盖与脆弱点

- 未覆盖：`splitThinkTagsInTextBlock` 无标签原样分支（经用例间接）。
- 脆弱点：无。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 用例断言如 §2 | 已证实 | 本文件逐行 |
| 未闭合双语义被固定 | 已证实 | 用例 2-4 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| 拆分/未闭合双语义 | §2 | covered |
| 旧格式兼容 | §2 | covered |
| 无标签原样 | §4 | unknown（间接） |

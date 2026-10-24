---
path: apps/electron/src/renderer/components/ai-elements/agent-block-copy.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: bde7a5f412d7a4fe4e20cd9d1ab6c50a800f4166
sha256: 66a3922a16c488e324194651d0e6d4d8cf8bdf86ddb01aced73f9d0ee8850d6b
lines: 272
kind: test
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/ai-elements/agent-block-copy.test.ts

## 1. 测试目标

直接测试 `agent-block-copy.ts` 7 符号 + **message.tsx/ContentBlock.tsx 源码字符串防回归**（1 个 describe `:12`）：块切分/选区/序列化/TSV + 块复制 UI 契约。27 个 `test(`（19 纯单测+8 源码耦合，Bun.file 读源码断言）。

## 2. 用例清单

**B 源码耦合（8 例 `:13-136`）**：工具条定位/空气墙清除（19 断言 `:15-41`）；选区锚点+180ms 防抖+多选交互（`:50-74`）；块间距桥接（`:76-91`）；Esc/叉号退出多选（`:93-109`）；图片不触发多选（`:111-117`）；格式双轨状态（`:119-128`）；流式渲染不降级（`:130-136`，含 ContentBlock `max-h-[5.6em]`）。

**A 纯单测（19 例）**：跨块闭区间选择双向（`:44-48`）；块切分 8 规则逐组（段落续行/列表嵌套/Setext/空列表项缩进三态/引用合并/围栏同字符且 ≥opener/错配 closer 不拆/未闭合吞尾，`:138-215`）；toggle 空集退出（`:217-221`）；markdownToPlainText（标题/链接强调/fence 语言标识/pipe 保留，`:223-242`）；TSV（普通/转义 `\|`/转义 `\\`/行首行尾边界，`:244-262`）；serializeAgentSelection 乱序保序+'\n\n'（`:264-271`）。

## 3. 真实断言

`toEqual`/`toBe`/`toHaveLength`/`toContain`/`not.toContain`（源码字符串）——无 mock 框架（Bun.file 读文本）。

## 4. 未覆盖（子agent 清单摘要）

serializeAgentBlock 直测（table+'plainText'/markdown+'tsv' 两错位组合）；tableFormats 按 id 覆盖；空块剔除；selectAgentBlockRange 未命中 `{toId}`；findAgentSelectionToolbarAnchor selecting=false；解析器 4 空格/内联 HTML；markdownToPlainText 的 Setext 残留/转义反斜杠残留。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 27 个 `test(`、断言如 §2 | 已证实 | 文件全读（272 行） |
| 源码耦合断言与本基线 0 失配 | 已证实 | 子agent 55+17+1 条字节级复核 |
| **测试层面照实**：` :26`/`:33` 断言重复；describe 名与 UI 耦合用例范围不符（防回归快照性质） | 已证实 | `:12`/`:26`/`:33` |
| 实际执行结果 | 未知 | `NOT_RUN` |

## 6. 覆盖表

| 被测行为 | 章节 | 状态 |
| --- | --- | --- |
| 块切分 8 规则 | §2 A | covered |
| 选区/序列化/TSV | §2 A | covered |
| UI 契约防回归 | §2 B | covered |
| §4 边缘 | — | — | unknown |

---
path: apps/electron/src/renderer/lib/normalize-latex.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 16d56978369cd8bd75c47a7c8dabcc7fd6996366
sha256: 9b129c43325cfc82a6fb71f454aa5102a693c691ce6debf4dfbe5c5dda02685d
lines: 35
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/normalize-latex.ts

## 1. 结论与边界

把 LaTeX 原生分隔符 `\(..\)`/`\[..\]` 规范化为 remark-math 识别的 dollar 形式（35 行，头注释 `:1-10`）：在 markdown 解析**之前**替换；fenced code 与行内代码内字面量先保护，避免用户贴的代码被误改为公式。纯字符串操作。

**边界**：不做 LaTeX 渲染（渲染在 react-markdown/remark-math 侧，跨批）；不处理其他转义面。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `normalizeLatexDelimiters` | 函数（导出） | 15-35 | `(text: string) => string` | 分隔符规范化 |

内部：`PLACEHOLDER(i)`（`:12`，`PROMA_LATEX_PROTECT_<i>` 占位串）、`PLACEHOLDER_PATTERN`（`:13`，`/PROMA_LATEX_PROTECT_(\d+)/g`）、`protectedSegments`（局部数组）。导出合计 1。

## 3. 内部逻辑与关键流程

1. 早退（`:16-18`）：空串或既不含 `\(` 也不含 `\[` → 原样返回。
2. 保护（`:20-27`）：``` 块正则 `/```[\s\S]*?```/g` 先替换为占位（`:26`），行内代码 `/`[^`\n]*`/g` 再替换（`:27`）；`protect` 闭包把片段 push 进 `protectedSegments` 并返回 `PROMA_LATEX_PROTECT_<i>`（`:21-24`）。
3. 替换（`:29-30`）：`\[..\]` → `$$..$$`（非贪婪 `[\s\S]+?`）、`\(..\)` → `$..$`。
4. 还原（`:32`）：按 `PLACEHOLDER_PATTERN` 全局替换回原片段（索引缺失时保留占位原文 `?? _m`）。

## 4. 调用者与调用链

入向（全冻结树检索 `normalizeLatexDelimiters`）：`components/ai-elements/reasoning.tsx:26`（`reasoning.tsx:243` `normalizeLatexDelimiters(children)`）、`components/ai-elements/message.tsx:28`（`message.tsx:1245` 消息文本处理链中与 `normalizeMarkdownEmphasisWhitespace` 串接）。出向：无。

## 5. 数据 I/O、读写与副作用

无（不适用，依据：纯字符串）。副作用：仅返回值。

## 6. 分支、失败、取消与恢复

- 早退分支（`:16-18`）；`PLACEHOLDER_PATTERN` 还原时索引越界回退原文（`?? _m`，`:32`）。
- 无 throw/异步（不适用，依据：全文无 throw）。
- **碰撞面（照实）**：占位串为纯文本（无哨兵字符，`:12`）；用户正文若含字面 `PROMA_LATEX_PROTECT_0` 等，还原步骤可能误替换（正则带 g、按索引还原，理论面，无测试覆盖）。

## 7. 权限与权威状态

无权限分支，依据：纯字符串函数，无角色/发送方概念。

## 8. 修改影响面

- 影响 `reasoning.tsx:243`/`message.tsx:1245` 的消息渲染（数学公式识别）；改替换规则会影响既有消息显示。
- 占位串改名需同步 `PLACEHOLDER_PATTERN`；若 remark-math 侧规则变化需同步（跨批）。
- 需同步修改的测试：批内无（见 §9）。

## 9. 测试证据

直接测试：**无**（全冻结树检索 `normalizeLatexDelimiters` 仅 2 个生产调用点，无测试文件命中；检索范围=baseline/source 全树）。间接证据：无断言级命中。

`NOT_RUN`：本轮未运行任何测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 替换/保护/还原流程与早退 | 已证实 | `:1-35` 全文逐行 |
| 占位串碰撞面（无哨兵） | 已证实 | `:12-13`/`:32` |
| 入向=reasoning.tsx:243、message.tsx:1245 | 已证实 | 全树检索（§4） |
| remark-math 实际识别行为 | 边界（跨批库） | 注释 `:4-9` |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `normalizeLatexDelimiters`（早退/保护/替换/还原） | §3 | 15-35 | covered |
| `PLACEHOLDER`/`PLACEHOLDER_PATTERN` | §2/§6 | 12-13 | covered |
| 碰撞面 | §6/§10 | - | covered |

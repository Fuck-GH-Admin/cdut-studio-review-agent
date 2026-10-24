---
path: apps/electron/src/renderer/lib/normalize-markdown-emphasis.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3dee8281f63716865f6d7354bdfdef8cc278396f
sha256: 48429443d436cf0c879be57387f2785606851b54056349d8d503e1659814d562
lines: 49
kind: test
package: p08-renderer-ui
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/normalize-markdown-emphasis.test.ts

## 1. 测试目标

`normalizeMarkdownEmphasisWhitespace` 的边界空格修复契约（49 行，bun:test，describe 同名 `:4`）：①粗体/斜体内边界空格移除；②合法/未闭合/转义标记不动；③行内与围栏代码不改写。mock 边界：**无 mock**（纯函数直接调用）。

## 2. 用例清单

依赖顺序：无（4 用例独立输入）。

| # | 用例 | 行 | 设置 | 动作 | 断言 |
| --- | --- | --- | --- | --- | --- |
| 1 | removes boundary spaces inside bold markers | 5-12 | 三输入：`> **… **是…`、`** 前导空格也应修复**`、`__重要内容 __ 后续说明` | `normalizeMarkdownEmphasisWhitespace` ×3 | toBe 三输出（引用行内粗体、前导空格、`__` 尾空格+后续文本保留） |
| 2 | removes trailing spaces inside italic markers | 14-19 | `*重点内容 *与普通文本`、`_emphasis _ followed by text` | ×2 | toBe 两输出（单星/下划线尾空格移除） |
| 3 | keeps valid, unmatched, and escaped markers unchanged | 21-28 | `**已经正确** 和 *也是正确*`、`**没有闭合 `、`\*literal *` | ×3 | toBe 原文（合法不动、未闭合不动、反斜杠转义不动） |
| 4 | does not rewrite inline or fenced code | 30-48 | 多行输入（`` `**代码 **` `` 行内代码、``` 围栏内 `*代码内容 *`、`_普通文本 _`） | ×1 | toBe 期望多行串（代码区原样、围栏外正常文本被修复） |

声明合计 **4 test / 0 it**（机械计数）。

## 3. 真实断言

- `:6-11` 三个 `toBe`：`'> **完成（Done）和可信度（Assurance）**是两条独立状态轴'`（引用行内修复）、`'**前导空格也应修复**'`、`'__重要内容__ 后续说明'`。
- `:15-18` 两个 `toBe`：`'*重点内容*与普通文本'`、`'_emphasis_ followed by text'`。
- `:22-27` 三个 `toBe`：合法串原样、`'**没有闭合 '` 原样、`'\\*literal *'` 原样。
- `:40-47` 多行 `toBe`：`` '`**代码 **` 与 **正常文本**' ``（行内代码不动、同行普通文本修复）、围栏内 `'*代码内容 *'` 不动、`'_普通文本_'` 修复。

## 4. 未覆盖与脆弱点

- **未覆盖**：`{2,3}` 三连标记（`***`/`___`）；跨行强调（正则限 `[^\r\n]`）；`~` 围栏（`findClosingFence` 支持但无断言）；未闭合围栏保留到文末；长反引号 run 等长配对（`findMatchingBacktickRun`）。
- **脆弱点**：期望值内嵌转义字符串（`\\*literal *`）与 String 拼接的多行串，改格式易误伤。
- 断言≠运行：本轮 `NOT_RUN`，bun test 未执行，通过状态未知。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 用例设置/动作/断言如上 | 已证实 | `:1-49` 全文逐行 |
| 声明计数 4 test/0 it | 已证实（机械计数） | grep `test(`/`it(` |
| 真实运行结果 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 粗体/斜体边界空格（`*`/`_`/`**`/`__`） | §2.1-2.2/§3 | 5-19 | covered |
| 合法/未闭合/转义不动 | §2.3/§3 | 21-28 | covered |
| 行内+围栏代码保护 | §2.4/§3 | 30-48 | covered |
| 三连标记/`~` 围栏/跨行 | §4 | - | unknown（未覆盖） |

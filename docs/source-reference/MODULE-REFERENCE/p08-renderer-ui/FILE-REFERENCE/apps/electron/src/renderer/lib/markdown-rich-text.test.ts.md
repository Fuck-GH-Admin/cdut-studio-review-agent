---
path: apps/electron/src/renderer/lib/markdown-rich-text.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1992a4d4ca0a7f700437fa9f2037d4d5eef415f2
sha256: 1e3c3e839bfa068f098c9de98d54af4e08a3b9ba1900d6fef338c0f277fd7e80
lines: 151
kind: test
package: p08-renderer-ui
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/markdown-rich-text.test.ts

## 1. 测试目标

`markdown-rich-text` 的剪贴板规范化与富预览渲染契约（151 行，bun:test，3 describe/14 test）：①复制纯文本 Windows 路径还原（**测的是批外 `@/components/shared/CopyButton` 的 `unescapeMarkdownTextForClipboard`**，`:3`，非本批文件）；②`normalizeClipboardHtml` 三种剪贴板形态；③`markdownToHtml`/`markdownToSafeDisplayHtml` 块级渲染与安全契约。mock 边界：**无 mock**——纯函数直接调用（DOM 侧依赖 jsdom/Bun 的 DOM 实现，运行环境未验证）。

## 2. 用例清单

依赖顺序：无（14 用例独立输入）。

**describe `'message copy plain-text normalization'`（`:5-19`，2 test，测批外 CopyButton 函数）**：
| # | 用例 | 行 | 断言 |
| --- | --- | --- | --- |
| 1 | restores Windows path separators escaped by the rich text editor | 6-12 | `unescapeMarkdownTextForClipboard(escapedPath)` toBe 单反斜杠路径 |
| 2 | does not change an already plain Windows path | 14-18 | 原样 toBe |

**describe `'clipboard HTML normalization'`（`:21-37`，3 test）**：
| # | 用例 | 行 | 断言 |
| --- | --- | --- | --- |
| 3 | keeps Windows path backslashes unchanged | 22-26 | `normalizeClipboardHtml('<div>D:\\profer\\server-private.git</div>')` toBe `'<p>D:\\profer\\server-private.git</p>'` |
| 4 | preserves rich text markup while normalizing div blocks | 28-30 | div→p 包裹保留 `<strong>` toBe |
| 5 | extracts the fragment from a complete Chromium HTML document | 32-36 | StartFragment/EndFragment 提取 toBe 内联 span 原文（含反斜杠） |

**describe `'markdownToHtml rich preview blocks'`（`:39-150`，9 test）**：
| # | 用例 | 行 | 断言要点 |
| --- | --- | --- | --- |
| 6 | renders the markdown syntax used by the input editor | 40-55 | toContain `<h1>/<strong>/<em>/<ul>/<li>` |
| 7 | renders markdown tables as standard HTML tables | 57-67 | toContain `<table>/<th>/<td>` |
| 8 | renders markdown inside details blocks while preserving the source markdown | 69-81 | toContain `data-type="raw-html-block"`、data-markdown 转义原文（含 `&#10;`）、渲染后 `<strong>/<li>` 转义形态 |
| 9 | keeps markdown after standalone html media renderable | 83-92 | toContain raw-html-block、`<h3>Agent 模式</h3>`；not.toContain `&#10;### Agent 模式` |
| 10 | normalizes invisible heading prefixes after media | 94-101 | 零宽前缀标题渲染 toContain `<h3>Agent 模式</h3>` |
| 11 | parses angle image destinations with local path characters | 103-109 | toContain `<img`、编码 src（`%20`/UTF-8 百分号）、`alt="晨光"` |
| 12 | does not preprocess fenced code blocks as markdown content | 111-125 | 围栏内 img/标题/零宽前缀均**不**渲染（转义 toContain、not.toContain h3） |
| 13 | does not preprocess indented code blocks as markdown content | 127-136 | 4 空格缩进代码同上 |
| 14 | sanitizes unsafe raw HTML before React knowledge display | 138-150 | `markdownToSafeDisplayHtml`：toContain `<h1>安全标题</h1>`；`not.toMatch(/<(?:script\|iframe)\b\|\sonerror\s*=\|href\s*=\s*["']?\s*javascript:/i)` |

声明合计 **14 test / 0 it**（机械计数）。

## 3. 真实断言

逐条见 §2 表（每行均为源码 expect 实录）。关键精确断言：`:78` `data-markdown="&lt;details&gt; ... &#10;Hidden **text**&#10;- item&#10;&lt;/details&gt;"`（details 原文保真+换行编码）；`:107` `src="foo%20bar/%E6%99%A8%E5%85%89%20(1)#a.jpg"`（尖括号目标解析+编码）；`:149` 安全负断言正则（script/iframe/onerror/javascript: 四类）。

## 4. 未覆盖与脆弱点

- **未覆盖**：`htmlToMarkdown`（TipTap→Markdown 反向，无断言）；`extractCodeText` 直接调用；`MARKDOWN_RENDERER_VERSION`；emoji_shortcode/math 规则；`enhanceMarkdownHtml` 的文件路径链接与 taskItem 转换。
- **归属注意**：用例 1-2 测批外 `unescapeMarkdownTextForClipboard`（`CopyButton.tsx:24`，跨批文件），不是本批被测文件的测试（照实归属）。
- **脆弱点**：断言依赖 DOM 实现对 `<pre>` 换行规范化的行为（fence `<br>` 机制的前提）；转义形态断言（`&#10;`/`&quot;`）绑定 escapeAttr 实现。
- 断言≠运行：本轮 `NOT_RUN`，bun test 未执行，通过状态未知。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 14 用例设置/动作/断言如上；3 describe 结构 | 已证实 | `:1-151` 全文逐行 |
| 声明计数 14 test/0 it | 已证实（机械计数） | grep `test(`/`it(` |
| 用例 1-2 归属批外 CopyButton | 已证实 | `:3` import 来源 |
| 真实运行结果 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| normalizeClipboardHtml 三形态 | §2.3-2.5/§3 | 22-36 | covered |
| markdownToHtml 基础/表格/details/媒体/前缀/尖括号/围栏/缩进 | §2.6-2.13/§3 | 40-136 | covered |
| markdownToSafeDisplayHtml 安全契约 | §2.14/§3 | 138-150 | covered |
| htmlToMarkdown/extractCodeText/math/emoji | §4 | - | unknown（未覆盖） |

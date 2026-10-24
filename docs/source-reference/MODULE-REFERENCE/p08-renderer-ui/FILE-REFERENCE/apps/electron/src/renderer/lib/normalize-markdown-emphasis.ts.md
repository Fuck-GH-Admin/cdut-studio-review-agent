---
path: apps/electron/src/renderer/lib/normalize-markdown-emphasis.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d59d2f426067debca2e5814e3f26445df6a6ea43
sha256: 7daa9cf6d978113f692198e3344224e4c703cf7e027e83992ac13b577abc392e
lines: 111
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/normalize-markdown-emphasis.ts

## 1. 结论与边界

修复模型在 Markdown 强调标记内部加的边界空格（111 行，头注释 `:1-6`）：`**文字 **` 这类写法 CommonMark 不解析为强调，会裸显标记；本模块只移除紧贴开/闭标记的空格，**围栏代码与行内代码保持字面量不变**。纯字符串操作，在解析前调用。

**边界**：不修其他 Markdown 语法问题；仅处理**有配对闭合标记**的 `*`/`_` 强调（`:68`），未闭合/合法文本不动。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `normalizeMarkdownEmphasisWhitespace` | 函数（导出） | 70-111 | `(text: string) => string` | 主入口 |

内部：`STRONG_WITH_BOUNDARY_SPACE`（`:8`，`/(^|[^\\*_])(\*{2,3}\|_{2,3})(?![*_])([ \t]*)(\S(?:[^\r\n]*?\S)?)([ \t]*)(\2)(?![*_])/gm`，闭合用反向引用 `\2`）、`EMPHASIS_WITH_BOUNDARY_SPACE`（`:9`，单星/下划线同构）、`removeEmphasisBoundaryWhitespace`（`:11-23`）、`normalizePlainMarkdownText`（`:25-29`）、`countRun`（`:31-35`）、`findMatchingBacktickRun`（`:37-47`）、`findClosingFence`（`:49-63`）。导出合计 1。

## 3. 内部逻辑与关键流程

1. **早退**（`:72`）：空串或不含 `*`/`_` → 原样返回。
2. **主扫描**（`:85-107`）：逐索引扫描；行首（`index===0` 或前一字符 `\n`，`:86`）尝试围栏匹配 `/^[ \t]{0,3}(`{3,}|~{3,})[^\r\n]*(?:\r?\n|$)/`（`:87`）；命中则 `findClosingFence` 找同字符≥长度的行首围栏（`:49-63`，行首≤3 缩进），`appendProtected` 整段原样保留（未闭合→保留到文末，`:93`）。
3. **行内代码**（`:97-104`）：反引号 run 计长（`countRun`），`findMatchingBacktickRun` 找**等长**反引号串精确配对（`:37-47`，长 run 不误配短 run），命中段原样保留。
4. **appendProtected**（`:78-83`）：保护区之前积压的普通文本经 `normalizePlainMarkdownText` 重写，保护区本身原样拼接。
5. **normalizePlainMarkdownText**（`:25-29`）：两个正则替换，`removeEmphasisBoundaryWhitespace`（`:11-23`）**仅在开/闭标记至少一侧有空格时重写**（`:21`，合法 Markdown 原样返回），输出 `prefix+marker+content+closingMarker`（去两侧空白，`:22`）。
6. 收尾（`:109`）：最后一段普通文本同样规范化。

## 4. 调用者与调用链

入向（全冻结树检索 `normalizeMarkdownEmphasisWhitespace`）：`components/ai-elements/message.tsx:29`（import）→ `message.tsx:1245` `normalizeMarkdownEmphasisWhitespace(normalizeLatexDelimiters(normalizeHtmlMediaTags(...)))`（消息文本处理链）。批内测试 `normalize-markdown-emphasis.test.ts:2`。出向：无。

## 5. 数据 I/O、读写与副作用

无（不适用，依据：纯字符串）。副作用：仅返回值。

## 6. 分支、失败、取消与恢复

- 早退（`:72`）；围栏配对/未闭合保留（`:93`）；行内代码等长配对/未配对按普通文本（`:97-104` 未命中走 `index++`）；重写条件=至少一侧空白（`:21`）；正则要求闭合标记配对（`(\2)` 反向引用），未闭合不匹配不动。
- 无 throw/异步（不适用，依据：全文无 throw）。
- 边界照实：`findClosingFence` 的行首正则带 `g` + `lastIndex` 复用（`:50-51`，模块内局部 new，无跨调用污染）。

## 7. 权限与权威状态

无权限分支，依据：纯字符串函数。

## 8. 修改影响面

- 影响 `message.tsx:1245` 的消息渲染（强调标记可见性）；正则变化可能误伤合法文档（如 `*` 未闭合场景、`\*` 转义——`(^|[^\\*_])` 前缀排除反斜杠与邻接标记）。
- 与 `normalize-latex` 同链串接（message.tsx:1245）。
- 需同步修改的测试：`normalize-markdown-emphasis.test.ts`（批内 4 用例）。

## 9. 测试证据

直接测试：`lib/normalize-markdown-emphasis.test.ts`（批内，4 test，详见其手册）：粗体内边界空格（含 `>` 引用行）、斜体尾空格、合法/未闭合/转义不动、行内与围栏代码不改写。未覆盖：`_` 三连/`*` 三连（`{2,3}` 面）、跨行内容（正则 `[^\r\n]` 限定）、嵌套标记。

`NOT_RUN`：本轮未运行 bun test，断言≠已运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 扫描/保护/配对/重写条件全流程 | 已证实 | `:1-111` 全文逐行 |
| 入向=message.tsx:1245 + 批内测试 | 已证实 | 全树检索（§4） |
| 仅至少一侧有空格才重写、未闭合不动 | 已证实 | `:21`/`:8-9` 反向引用 + 测试断言 |
| CommonMark 对边界空格的实际解析 | 边界（库语义） | 头注释 `:4-5` |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 两个正则+`removeEmphasisBoundaryWhitespace` | §2/§3.5 | 8-29 | covered |
| `countRun`/`findMatchingBacktickRun` | §3.3 | 31-47 | covered |
| `findClosingFence` | §3.2 | 49-63 | covered |
| 主扫描 `normalizeMarkdownEmphasisWhitespace` | §3.1-3.6 | 70-111 | covered |

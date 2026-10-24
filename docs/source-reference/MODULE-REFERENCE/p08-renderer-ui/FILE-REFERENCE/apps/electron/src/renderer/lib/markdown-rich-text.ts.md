---
path: apps/electron/src/renderer/lib/markdown-rich-text.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e9d6e1c9f32c0e554f3717d8f42860a5fb0f372f
sha256: dc3ab918ba12008b458879f50ca5434542712a51e16fdbd6c228f7a331d3700b
lines: 576
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/markdown-rich-text.ts

## 1. 结论与边界

Markdown↔HTML 双向转换与富预览渲染核心（576 行）：`markdownToHtml`（预处理→MarkdownIt 渲染→DOM 增强）、`markdownToSafeDisplayHtml`（+DOMPurify 消毒）、`htmlToMarkdown`（TipTap HTML→Markdown 大 switch）、`normalizeClipboardHtml`（Chromium 剪贴板 fragment 提取）、`extractCodeText`（`<br>` 空行还原）；自定义 math/emoji/html_block/image/fence 渲染规则。浏览器 DOM 操作，无磁盘/网络。

**边界**：DOMPurify/MarkdownIt 库内部行为（外部依赖）；真实 DOM 兼容面未运行验证（NOT_RUN）；纯字符串部分（`markdownToHtml` 无 document 时跳过 enhance，`:399`，SSR/Bun 安全）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `MARKDOWN_RENDERER_VERSION` | 常量（导出） | 9 | `= 3` | 渲染器版本（编辑器同步用） |
| `normalizeClipboardHtml` | 函数（导出） | 14-35 | `(html: string) => string` | 剪贴板 fragment 提取 |
| `extractCodeText` | 函数（导出） | 67-82 | `(codeEl: Element) => string` | `<br>`→`\n` 还原代码文本 |
| `markdownToHtml` | 函数（导出） | 397-401 | `(markdown: string) => string` | 渲染+增强 |
| `markdownToSafeDisplayHtml` | 函数（导出） | 407-423 | `(markdown: string) => string` | +消毒（React 只读展示） |
| `htmlToMarkdown` | 函数（导出） | 426-576 | `(html, options?: {skipMarkdownEscape?}) => string` | TipTap→Markdown |

导出合计 6（机械核对）。内部（20+）：`VIDEO_EXT_RE`（`:4`）、`PREVIEW_BLOCK_RE`（`:5`）、`DETAILS_BLOCK_RE`（`:6`）、`STANDALONE_HTML_MEDIA_RE`（`:7`）、`EMOJI_SHORTCODES`（`:37-55`，**17 键**）、`escapeAttr`（`:57-65`）、`escapeMarkdownText`（`:84-92`）、`escapeMarkdownLinkTarget`（`:94-96`）、`serializeInlineCode`（`:98-103`）、`isPreviewBlockHtml`（`:105-107`）、`addMathSupport`（`:109-173`）、`markdownIt` 实例（`:175-179`，`html:true, linkify:true, breaks:false`）、emoji core 规则（`:183-193`）、html_block/html_inline/image/fence 渲染规则（`:195-232`）、`wrapMarkdownDetailsBlocks`（`:234-241`）、`splitMarkdownCodeRegions`（`:243-278`）、`separateStandaloneHtmlMediaBlocks`（`:280-292`）、`normalizeMarkdownLinePrefixes`（`:294-298`）、`preprocessMarkdown`（`:300-306`）、`FILE_PATH_RE`（`:309`）、`SKIP_TAGS`（`:312`，`A/CODE/PRE/SCRIPT/STYLE`）、`isInsideSkipTag`（`:314-321`）、`linkifyFilePathsInTextNodes`（`:323-366`）、`enhanceMarkdownHtml`（`:368-395`）。

## 3. 内部逻辑与关键流程

### 3.1 normalizeClipboardHtml（`:14-35`）
空串早退；`<!--StartFragment-->`/`<!--EndFragment-->` 标记优先截取（`:18-22`），无标记回退 `<body>` 内容（`:24-25`）；再剥 fragment 注释/doctype/head、`<div>`→`<p>`（`:29-33`）。

### 3.2 math 支持（`addMathSupport` `:109-173`）
- `math_inline`（`:110-127`）：`$` 开头（`$$` 排除 `:112`）、`\$` 转义跳过（`:116`）、非贪婪扫到未转义 `$`（`:119` 空内容拒绝）；渲染 `<span data-type="math-inline" data-latex="…">`（`:167-169`，`escapeAttr`）。
- `math_block`（`:129-165`）：`$$` 首行（`:133`）；同行 `$$` 收尾（`:139-141`）或多行扫到 `$$`（`:143-157`）；渲染 `<div data-type="math-block" data-latex="…">`（`:170-172`）。

### 3.3 渲染规则（`:183-232`）
- emoji_shortcode（core 规则，`:183-193`）：inline 文本中 `:name:` → `EMOJI_SHORTCODES` 17 键命中替换，未命中保留。
- html_block（`:195-200`）：`isPreviewBlockHtml`（raw-html-block/math-block 头匹配 `:5`）原样输出；否则包 `<div data-type="raw-html-block" data-markdown="…" data-html="…">`（**双存**原文）。
- html_inline（`:202-204`）：包 `<span data-type="raw-html-inline" data-html="…">`。
- image（`:206-219`）：`VIDEO_EXT_RE`（mp4/webm/ogg/ogv/mov/m4v，`:4`）→ `<video controls>`（title 取 alt||title）；否则 `<img>`。
- fence（`:221-232`）：`escapeHtml(content)` 后 `\n\n`→`<br>\n`（`:229`，防浏览器 `<pre>` 换行规范化丢空行，注释 `:227-228`；`extractCodeText` 解析侧还原）。

### 3.4 预处理（`:234-306`）
`preprocessMarkdown`（`:300-306`）对**非代码区**（`splitMarkdownCodeRegions` `:243-278` 区分 ```/~~~ 围栏与 4 空格/Tab 缩进代码）依次 `normalizeMarkdownLinePrefixes`（`:294-298`，零宽/BOM/nbsp 标题前缀清理）→ `separateStandaloneHtmlMediaBlocks`（`:280-292`，独立 img/video 行后补空行）→ `wrapMarkdownDetailsBlocks`（`:234-241`，details 块转 raw-html-block，data-markdown 存原文、data-html 存渲染）。

### 3.5 enhanceMarkdownHtml（`:368-395`）
无 `document` 原样返回（`:369`）；文件路径自动链接（`linkifyFilePathsInTextNodes` `:323-366`：`FILE_PATH_RE` 双平台绝对路径→`file:///<file://>`（按 `navigator.platform` 判 Win，`:333`/`:352-354`），A/CODE/PRE/SCRIPT/STYLE 内跳过（`SKIP_TAGS` `:312`））；任务列表 `[x]`/`[ ]` → `li[data-type=taskItem][data-checked]` + 父 `ul[data-type=taskList]`（`:377-392`）。

### 3.6 markdownToHtml / markdownToSafeDisplayHtml（`:397-423`）
`markdownToHtml`：空串→`''`；无 document→`markdownIt.render(preprocessMarkdown(...))`（`:399`）；否则+enhance（`:400`）。`markdownToSafeDisplayHtml`：DOMPurify 可用→`sanitize(html, {FORBID_TAGS:[script,style,iframe,object,embed,form,base,meta,link], FORBID_ATTR:[style], ALLOW_DATA_ATTR:true})`（`:411-416`）；**factory 不可用（Bun/SSR）→保守字符串降级**（`:418-422`：删危险标签对/自闭合、剥 `on*`/`style` 属性、剥 `javascript:` href/src）——注释 `:409-410`：单测仍须验证安全契约。

### 3.7 htmlToMarkdown（`:426-576`）
空/`<p></p>`→`''`；无 document 原样返回（`:428`）。`processNode` 递归（`:433-573`）：文本节点按 context 转义（`escapeMarkdownText` `:84-92`，行首块级标记也转义 `:90-91`；`skipMarkdownEscape` 可关）；大 switch——`raw-html-block` 优先回 `data-markdown`（缺则 `data-html`，`:450-455`）、`math-block`→`$$…$$`（`:456-458`）、`pre>code` 用 `extractCodeText`+language 类（`:492-499`）、`code`（pre 内直出/否则 `serializeInlineCode` 自适应栅栏 `:98-103`）、img→`![alt](<src> "title")`（`escapeMarkdownLinkTarget` `:94-96`）、video→保留 `<video controls>`、taskList→`- [x]`（`:505-511`）、ul/ol/li、table 补齐列数+`| --- |` 表头（`:522-536`）、blockquote 逐行 `> `（`:540-545`）、h1-h6/hr、mention span→`/skill:`/`#mcp:`/`&session:`/`@file:`（按 `data-mention-suggestion-char` `/`/`#`/`&`/默认 `@`，`:553-568`）。

## 4. 调用者与调用链

入向（全冻结树检索 `markdown-rich-text` + 各导出，8 个生产文件）：
- `renderer/main.tsx:123`（`htmlToMarkdown`/`markdownToHtml`）。
- `components/ai-elements/rich-text-input.tsx:30`（三导出，`normalizeClipboardHtml` 用在 `rich-text-input.tsx:510` 粘贴处理）。
- `components/agent-preview/AgentPreviewRenderer.tsx:6`（`markdownToHtml`）。
- `components/knowledge-base/KnowledgePreviewPanel.tsx:3`（`markdownToSafeDisplayHtml`，`KnowledgePreviewPanel.tsx:42`）。
- `components/agent/ExplorationBranchBar.tsx:20`（`markdownToHtml`）。
- `components/diff/markdown-preview-extensions.tsx:21`（`extractCodeText`，`markdown-preview-extensions.tsx:995`；`markdown-preview-extensions.tsx:1040` 注释声明与本文件 enhanceMarkdownHtml 输出一致）。
- `components/diff/MarkdownRichEditor.tsx:11`（`MARKDOWN_RENDERER_VERSION`/`markdownToHtml`，`MarkdownRichEditor.tsx:51`）。
- `components/scratch-pad/ScratchPadView.tsx:29`（`htmlToMarkdown`/`markdownToHtml`）。
- 批内测试 `markdown-rich-text.test.ts:2`。
出向：`dompurify`（`:1`）、`markdown-it`（`:2`）。

## 5. 数据 I/O、读写与副作用

- DOM 操作：`document.createElement/TreeWalker/innerHTML`（enhance/htmlToMarkdown）；无磁盘/网络。
- 副作用：仅返回字符串；`enhanceMarkdownHtml`/`htmlToMarkdown` 用临时 DOM 节点（不挂载）。
- 安全面：`markdownToSafeDisplayHtml` 是 React 只读展示的消毒闸（注释 `:403-406`：资料正文来自本地导入/历史同步，不能让原始 HTML 在 React 子树执行）。

## 6. 分支、失败、取消与恢复

- 早退/降级：空串（`:15`/`:398`/`:427`）；无 document（`:369`/`:399`/`:428`）；DOMPurify.sanitize 非函数→字符串降级（`:411-422`）。
- 转义边界：`escapeAttr` 五步（`:57-65`，含 `\n`→`&#10;`）；`escapeMarkdownText` 行首块级转义（`:90-91`）。
- 无 throw/异步（不适用，依据：全文无 throw；DOMPurify/MarkdownIt 抛错不在此层捕获）。
- 恢复：不适用（纯函数）。

## 7. 权限与权威状态

无 sender/role 检查（不适用）。XSS 面=双重防线：raw HTML 不直接进 DOM（html_block/html_inline 包 data-* 转义容器，`:195-204`）+ `markdownToSafeDisplayHtml` DOMPurify/降级消毒（`:407-423`）；测试用例 14 验证四类危险模式不出现（`markdown-rich-text.test.ts:149`）。

## 8. 修改影响面

- 8 个消费方的渲染/编辑/复制链（§4）；`MARKDOWN_RENDERER_VERSION=3` 与编辑器序列化版本耦合（`MarkdownRichEditor.tsx:51`）。
- 渲染规则改动影响 `markdown-preview-extensions.tsx:1040` 声明的输出一致性契约。
- 降级消毒面（`:418-422`）是 Bun 单测环境的实际防线——放宽会破坏安全契约测试。
- 需同步修改的测试：`markdown-rich-text.test.ts`（批内 14 用例）。

## 9. 测试证据

直接测试：`lib/markdown-rich-text.test.ts`（批内，14 test，详见其手册）：normalizeClipboardHtml 三形态、markdownToHtml 八类块渲染/预处理保护、markdownToSafeDisplayHtml 安全契约。注意：其中 2 用例测批外 `CopyButton.unescapeMarkdownTextForClipboard`（归属照实）。
未覆盖：htmlToMarkdown 反向、extractCodeText、math/emoji、enhance 的链接/taskItem。

`NOT_RUN`：本轮未运行 bun test，断言≠已运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全部导出/内部规则/预处理/增强/消毒降级/htmlToMarkdown switch | 已证实 | `:1-576` 全文逐行（2 段） |
| 8 个消费方+批内测试 | 已证实 | 全树检索（§4） |
| EMOJI_SHORTCODES 17 键 | 已证实 | `:37-55` |
| DOMPurify/MarkdownIt 库内部行为 | 边界（外部依赖） | `:1-2` |
| enhanceMarkdownHtml 真实 DOM 兼容面 | 未知 | NOT_RUN |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `MARKDOWN_RENDERER_VERSION`/`normalizeClipboardHtml` | §2/§3.1 | 9-35 | covered |
| `extractCodeText`/escape 三函数/serializeInlineCode | §2/§3.7 | 57-103 | covered |
| math_inline/math_block | §3.2 | 109-173 | covered |
| markdownIt 实例/emoji/html_block/html_inline/image/fence | §3.3 | 175-232 | covered |
| 预处理四函数 | §3.4 | 234-306 | covered |
| 路径链接/taskItem/enhance | §3.5 | 308-395 | covered |
| `markdownToHtml`/`markdownToSafeDisplayHtml` | §3.6 | 397-423 | covered |
| `htmlToMarkdown` 全 switch | §3.7 | 426-576 | covered |

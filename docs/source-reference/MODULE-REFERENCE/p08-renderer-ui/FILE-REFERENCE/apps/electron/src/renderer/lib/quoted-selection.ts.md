---
path: apps/electron/src/renderer/lib/quoted-selection.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e6b82f0bb5ba2ab7e20a265a1bf8751989edf05c
sha256: c0131afad15990b7ec3c3d4c7204a9c1a260710f45d0683acb83cc5eba6f8f25
lines: 103
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-03-20261024
reviewer: docs-r07-qa-extra-03-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/quoted-selection.ts

## 1. 结论与边界

引用选中文本的**XML 序列化/解析单一来源**：把用户从预览面板/Agent 历史选中的文本（`QuotedSelection`）编码为 `<quoted_file>`/`<quoted_context>` 块拼进用户消息（`buildQuotedSelectionBlock`），以及从消息文本解析回引用列表并剥离隐藏 XML（`parseQuotedSelectionRefs`）（`quoted-selection.ts:45-58,66-103`）。另导出选中动作浮层的 DOM 选择器常量（`:12`）。

边界：不存取选中状态本身（atom 在 `@/atoms/preview-atoms`，`:1-2` 仅 type import）；不决定消息发送时机（调用方 `AgentView.tsx`）；`filename` 提取委托 `getFileBaseName`（`@/lib/file-utils`，`:3`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `ParsedQuotedSelectionRef` | 导出接口 | 5-10 | `{path, filename, sourceType, label?}` | 解析出的引用条目 |
| `SELECTION_ACTION_POPOVER_SELECTOR` | 导出常量 | 12 | `'[data-selection-action-popover]'` | 选中动作浮层的 DOM 选择器 |
| `escapeXmlAttribute` | 导出函数 | 23-29 | `(value: string) => string` | 转义 `& < > "`（注意不含 `'`） |
| `decodeXmlAttribute` | 导出函数 | 31-37 | `(value: string) => string` | 逆序解码 `&quot; &gt; &lt; &amp;`（`&amp;` 最后，避免二次解码） |
| `buildQuotedSelectionBlock` | 导出函数 | 45-58 | `(quotedSelection: QuotedSelection) => string` | 构建引用 XML 块（末尾 `\n\n`） |
| `parseQuotedSelectionRefs` | 导出函数 | 66-103 | `(content: string) => {quotes, text}` | 解析引用列表 + 剥离标签的正文 |

内部：`QUOTED_FILE_REGEX`/`QUOTED_CONTEXT_REGEX`（`:14-15`，带 `g` 的模块级正则，`:71,83` 复位 `lastIndex`）；`normalizeEscapedQuotedTags`（`:18-21`，剥反斜杠转义）、`sanitizeQuotedText`（`:39-43`，内嵌 `</quoted_file>`/`</quoted_context>` 改写为 `</quoted_file_>`/`</quoted_context_>`）、`normalizeContextSourceType`（`:60-64`，白名单 `scratch-pad`/`agent-interruption`，其余归 `agent-history`）。导出计数：6（接口 1、常量 1、函数 4）。

## 3. 内部逻辑与关键流程

- `buildQuotedSelectionBlock`（`quoted-selection.ts:45-58`）：先消毒正文（`:46`→`:39-43`）；若 `sourceType` 存在且非 `'file'`：输出 `<quoted_context source label message_id role>` 块（`:48-54`，label 取 `sourceLabel ?? filePath` `:50`）；否则 `<quoted_file path="...">` 块（`:56-57`）；属性值全部 `escapeXmlAttribute`（`:49-52,56`），块尾 `\n\n`（`:53,57`）。
- `parseQuotedSelectionRefs`（`:66-103`）：先归一化转义标签（`:67`→`:18-21`，`tag.replaceAll('\\','')`）；`QUOTED_FILE_REGEX` 循环（`:70-81`）：取 `path="..."` 属性（`:73`，**缺则跳过该块** `:74`），`decodeXmlAttribute` 后 `getFileBaseName` 提取文件名（`:75-78`），`sourceType:'file'`；`QUOTED_CONTEXT_REGEX` 循环（`:83-95`）：`label` 缺省「Agent 历史」（`:87`）、`source` 经 `normalizeContextSourceType` 归一（`:88,60-64`），条目 `path=filename=label`（`:89-94`）；最后正则替换剥离两标签并 `trim` 得正文（`:97-100`）。
- 返回 `{quotes, text}`（`:102`）。解析端**不读** `message_id`/`role` 属性（`:66-95` 仅取 path/label/source）——构建端写入的这两个字段（`:51-52`）在解析往返中丢失（测试 `quoted-selection.test.ts:16-22` 断言结果不含它们）。

## 4. 调用者与调用链

入向（全冻结树检索 `quoted-selection`/各导出名，命中 6 文件）：
- `components/agent/AgentView.tsx:162` 导入 `buildQuotedSelectionBlock`；消费点 `:1990`、`:2097`（拼 `message.quotedSelection`）、`:2418`（累加进 `fileReferences`）。
- `components/agent/SDKMessageRenderer.tsx:20` 导入 `parseQuotedSelectionRefs` 与类型 `ParsedQuotedSelectionRef`；`:1173` 再导出 `export type QuotedFileRef = ParsedQuotedSelectionRef`；`:1185` 解析消息正文得 `quotes`/`textWithoutQuotes`。
- `components/agent/AgentHistorySelectionLayer.tsx:16` 导入 `SELECTION_ACTION_POPOVER_SELECTOR`；`:110`（选中层忽略浮层内激活元素）、`:194`（点击浮层不收起）。
- `components/session-preview/SessionMiniMapPopover.tsx:22,276`：`parseQuotedSelectionRefs(text).text` 剥标签取纯文本。
- 测试：`lib/agent-message-queue.test.ts:3,44` 用 `buildQuotedSelectionBlock` 构造排队载荷（间接测试证据）。
- DOM 契约：`[data-selection-action-popover]` 属性由 `components/selection/SelectionActionPopover.tsx:94` 设置；另有字符串字面量副本 `components/ai-elements/conversation.tsx:87`（未引用本常量，改常量不会同步它）。

出向：type import `@/atoms/preview-atoms`（`:1-2`，`QuotedSelection`/`QuotedSelectionSourceType`）、值 import `getFileBaseName`（`@/lib/file-utils`，`:3`；实现 `file-utils.ts:16-18` 按 `/`/`\` 切分取末段）。

## 5. 数据 I/O、读写与副作用

无 I/O、无副作用，依据：`quoted-selection.ts:1-103` 纯字符串函数，无 fs/网络/atom 写入/全局可变状态；模块级正则 `lastIndex` 在循环前显式复位（`:71,83`），规避 `g` 正则跨调用状态泄漏。

## 6. 分支、失败、取消与恢复

- `:48` sourceType 分支（context 块 vs file 块）；`:73-74` 缺 `path` 属性跳过；`:87` 缺 label 默认值；`:88`/`:60-64` source 白名单归一（未知值一律落 `agent-history`，不抛错）。
- 无 throw/异步/取消；畸形输入（无标签/空串）返回空 quotes 与原文 trim（`:97-102`）。
- 潜在脆弱点（如实记录）：`sanitizeQuotedText` 只改写**闭合**标签（`:41-42`），同名开标签留在正文；正则 `[\s\S]*?` 非贪婪匹配对嵌套同名标签的行为按首个闭合标签截断（`:14-15`，静态阅读推断）。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role/身份检查；引用来源类型（file/agent-history/scratch-pad/agent-interruption）由调用方在捕获时决定（`preview-atoms.ts:51-70` `QuotedSelection` 形状），解析端仅白名单归一（`quoted-selection.ts:60-64`），不验证真伪。

## 8. 修改影响面

- 改标签名/属性布局：影响 `AgentView.tsx:1990,2097,2418` 发送侧拼接与 `SDKMessageRenderer.tsx:1185`、`SessionMiniMapPopover.tsx:276` 解析侧；历史消息中的旧标签靠兼容正则（`:14-15,19`）回溯解析，破坏兼容会造成旧会话引用显示为裸 XML。
- `escapeXmlAttribute` 不转义单引号（`:23-29`）——调用方必须用双引号属性（现状 `:53,57` 均双引号）；改动需同步审计所有属性拼接点。
- `SELECTION_ACTION_POPOVER_SELECTOR` 与 `SelectionActionPopover.tsx:94` 的 data 属性、`conversation.tsx:87` 的字面量构成三方契约，需同步修改。
- 同步测试：`quoted-selection.test.ts`（3 用例）、`agent-message-queue.test.ts`（构造夹具）。

## 9. 测试证据

- 直接测试 `apps/electron/src/renderer/lib/quoted-selection.test.ts`（3 用例）：文件引用构建+解析往返（`quoted-selection.test.ts:5-24`，断言 `:14-23`）；反斜杠转义标签解析（`:26-45`）；多来源区分（`:47-84`）。逐条断言见该文件手册 §3。
- 间接证据：`lib/agent-message-queue.test.ts:44` 用 `buildQuotedSelectionBlock` 造排队 payload（间接覆盖构建函数可调用性）。
- 未覆盖：`agent-interruption` 分支、缺 path 跳过、缺 label 默认值、嵌套/畸形标签。
- NOT_RUN：本轮未执行 `bun test`/typecheck/build/GUI；断言为静态阅读所得。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 导出 + 5 内部符号清单与行为（§2/§3） | 已证实 | `quoted-selection.ts:1-103` 逐行读 |
| 消费点 6 文件（§4）与三方 DOM 契约 | 已证实 | 各 file:line grep 命中，`SelectionActionPopover.tsx:94`、`conversation.tsx:87`、`file-utils.ts:16-18` 已读 |
| 解析端丢弃 message_id/role | 已证实 | `:51-52` 写 vs `:66-95` 解析（+测试 `:16-22`） |
| 嵌套同名标签按首个闭合截断 | 推断 | 由正则 `:14-15` 静态推断，未构造用例实证 |
| 转义标签兼容正则覆盖的富文本管线全集 | 未知 | 仅 `:17` 注释自述来源，未读富文本导出实现 |

NOT_RUN：未运行测试/构建/GUI。

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `ParsedQuotedSelectionRef` | §2/§4 | 5-10 | covered |
| `SELECTION_ACTION_POPOVER_SELECTOR` | §2/§4/§8 | 12 | covered |
| `escape/decodeXmlAttribute` | §2/§8 | 23-37 | covered |
| `buildQuotedSelectionBlock` 两分支 | §3/§9 | 45-58 | covered |
| `parseQuotedSelectionRefs` 双循环+剥离 | §3/§9 | 66-103 | covered |
| 内部 3 函数+2 正则 | §2/§3 | 14-21,39-43,60-64 | covered |
| 缺 path/缺 label/interruption 分支 | §6/§9 | 73-74,87,62 | partial（无测试） |

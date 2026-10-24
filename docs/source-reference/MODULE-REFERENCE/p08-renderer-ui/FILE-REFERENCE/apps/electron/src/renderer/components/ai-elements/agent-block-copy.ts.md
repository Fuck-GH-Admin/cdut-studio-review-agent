---
path: apps/electron/src/renderer/components/ai-elements/agent-block-copy.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8857f27629b4a76922bf28470ea3775115c25f95
sha256: 76f91dadce3a834fd7c61c9eb1b339af8dbba3b3962a025661f0d7b34d9fd647
lines: 315
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/ai-elements/agent-block-copy.ts

## 1. 结论与边界

**块级复制纯函数模块**（315 行，**零依赖**）：Markdown 块级切分（代码块/表格/列表/引用保持整体）+ 选区语义 + 复制序列化（markdown 原样/plainText 七步降级/表格 TSV）。

## 2. 导出与关键符号（13 个 export）

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `AgentBlockKind`/`AgentCopyFormat` | `:1`/`:2` | 'markdown'\|'table' / 'markdown'\|'plainText'\|'tsv' |
| `AgentMarkdownBlock` | `:4-8` | `{id, source, kind}` |
| `parseAgentMarkdownBlocks` | `:139-196` | 块级切分（围栏/Setext 2 行/表格/列表/引用/ATX/分割线/段落 8 规则） |
| `AgentBlockSelectionUpdate` | `:198-201` | `{selectedIds, selecting}` |
| `selectAgentBlockRange` | `:204-215` | 闭区间（未命中返回 `{toId}` `:211` 照实） |
| `toggleAgentBlockSelection` | `:218-223` | 增删一 id；空集退出多选 |
| `markdownToPlainText` | `:226-238` | 七步降级（fence 行删除→图/链/标题/引用/列表剥壳→强调符全删→空白归一） |
| `tableMarkdownToTsv` | `:279-281` | 表格→TSV（**`:280` 换行清洗为死代码**，见 §10） |
| `serializeAgentBlock` | `:284-287` | 单块序列化（table 服 tsv/markdown；非 table 服 plainText/markdown） |
| `findAgentSelectionToolbarAnchor` | `:290-300` | 工具条锚点（向左扩展到连续选区首块） |
| `AgentCopySelection`/`serializeAgentSelection` | `:302-307`/`:310-315` | 多块保序合并（tableFormats 按 id 覆盖、空块剔除、'\n\n' 连接） |

内部：围栏/列表/表格正则族（`:22-30`）、`scanMarkdownTableRow:240-271`（转义 `\|`/`\\` 奇偶处理）。

## 3. 内部逻辑与关键流程

解析器单遍扫描（8 规则优先级）；序列化按块类型选格式；纯文本降级为 7 段 replace 流水线。

## 4. 调用者与调用链

`message.tsx`（块复制系统，6 函数+2 类型）；被 `agent-block-copy.test.ts`（27 用例）覆盖。零出向依赖。

## 5. 数据 I/O、读写与副作用

纯函数；无 IO。

## 6. 分支、失败、取消与恢复

围栏未闭合吞余下全文（`:191-193` 语义）；closer 同字符且 ≥opener（CommonMark 一致）。

## 7. 权限与权威状态

**格式语义契约**（`:283`）：表格格式独立于普通格式；plainText 对表格退化为原文（无真正纯文本形态，照实）。

## 8. 修改影响面

改解析规则影响块复制边界；message.tsx 块复制系统联动；测试 27 用例锁定。

## 9. 测试证据

`agent-block-copy.test.ts`（同批，27 个 `test(`）：19 纯单测+8 message.tsx 源码耦合防回归。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（矛盾照实记录，子agent 精读+字节核对）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 13 导出/解析 8 规则/序列化 | 已证实 | 315 行全读（字节核对） |
| **①** `:280` 死代码（tableRows 已按 \n 切分，换行清洗永不命中）；**②** markdownToPlainText 的 FENCE_LINE_RE 全文匹配会误删正文伪 fence 行（测试 `:233` 锁定该行为）；**③** 不处理 Setext 下划线残留；**④** 转义强调符 `\*`→残留孤立反斜杠 | 已证实 | `:280`/`:30`/`:227-237` |
| **⑤** 非 table 块传 'tsv' 走 else 原文（类型-行为错位）；**⑥** selectAgentBlockRange 未命中返回仅 `{toId}`；**⑦** findAgentSelectionToolbarAnchor selecting=false 早退与 JSDoc 字面承诺有出入 | 已证实 | `:286`/`:211`/`:297` |
| 解析器 4 空格缩进/内联 HTML 边缘 | 未知 | 未覆盖清单 |
| 运行实效 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 13 导出/解析/序列化 | §2/§3 | covered |
| 格式契约 | §7 | covered |
| 7 矛盾+测试 | §9/§10 | covered |

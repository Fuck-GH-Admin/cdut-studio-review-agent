---
path: packages/core/src/office-engine/office-serializer.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 271e8f5db2c200a2d547ec47b62c4e5059dd3bad
sha256: e87ed3bbc8cd50c75e93cefeec9602e522464e264ec0ead76aea773e137e0155
lines: 208
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/core/src/office-engine/office-serializer.ts

## 1. 结论与边界

Office **统一空间拓扑 Markdown 序列化器**（`packages/core/src/office-engine/office-serializer.ts:1-7`）：双平面布局 AST → 带精确空间锚点（`p{page}-b{idx}`）的富结构 Markdown——每块注入 `<span id=… data-page/data-bbox/…>` + `<!-- anchor: … -->`（供 LLM 引用溯源）；支持一键剥离锚点得纯净 Markdown。

边界：纯序列化（不解析不求解）；锚点 ID 格式契约 `p{page}-b{idx}`（可带命名空间前缀，剥锚正则兼容 `xxx:` 前缀，`:133-134`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `OfficeSerializeOptions` | interface | 22-27 | `{includeAnchors?=true; includePageHeaders?=true}` | |
| `formatOfficeBlockAnchorPrefix` | function | 33-52 | `(block) => string` | span+comment 双锚点前缀 |
| `serializeOfficePageToMarkdown` | function | 58-74 | `(page, options?) => string` | 块间 `\n\n` |
| `serializeOfficeDocumentToMarkdown` | function | 80-110 | `(ast, options?) => string` | 页间 `\n\n---\n\n` |
| `stripOfficeTopologyAnchors` | function | 116-124 | `(markdown) => string` | 剥 span/anchor/page 注释+压缩空行 |
| `officeAstToSharedLayoutAst` | function | 145-197 | `(ast, fileName) => DocumentLayoutAST` | → `@profer/shared` 通用 AST |

内部：`escapeHtmlAttr`（`:29-35`，4 实体）、`mapOfficeBlockTypeToSharedKind`（`:126-143`，9 类映射；heading level 1→'title' 否则 'section-heading'；caption→'footnote'）。

## 3. 内部逻辑与关键流程

- `formatOfficeBlockAnchorPrefix`（`:33-52`）：bbox 三位小数（非有限→'0.000'）；loc/sheet/cell 三可选属性双写（span 属性+注释字段）；HTML 转义。
- `serializeOfficePageToMarkdown`（`:58-74`）：空 markdown 块跳过；带锚时锚点前缀+正文。
- `serializeOfficeDocumentToMarkdown`（`:80-110`）：空页跳过；`includePageHeaders` 时按格式生成页标题注释（pptx「幻灯片 N：title」/xlsx「工作表：sheetName」/docx「第 N 页：title」，`:93-100`）。
- `stripOfficeTopologyAnchors`（`:116-124`）：三正则剥 span/anchor/page 注释（容忍命名空间前缀）+3+换行压缩。
- `officeAstToSharedLayoutAst`（`:145-197`）：全局 readingOrder 递增（跨页连续）；`readingOrderedBlocks` 全文序+`outline`（heading 块，level 缺省 2）；`markdown` 用**带锚**序列化；metrics 全 0（Office 链无该类耗时）。

## 4. 调用者与调用链

出向：`@profer/shared`（DocumentLayoutAST 等 4 类型）、`./types.ts`（4 类型）（`:9-20`）。入向（检索=符号名+模块名，全冻结树）：

- `serializeOfficePageToMarkdown`：`office-engine/index.ts:18`、`document-parse-tools.ts:32,612-613,1150-1151`、`study-document-indexer.ts:632,644-645,688,704`（main 产品链）。
- `serializeOfficeDocumentToMarkdown`：`index.ts:17,108,112`+自调 `:199`。
- `stripOfficeTopologyAnchors`/`officeAstToSharedLayoutAst`：`index.ts:19,21` 转发 + 本批 `office-engine.test.ts:14-15,190,195`。
- **零外部引用**：`OfficeSerializeOptions`、`formatOfficeBlockAnchorPrefix`（仅自用+转发）。
- 产品入口：main ✔；preload/renderer/shared/cli ✘。

## 5. 数据 I/O、读写与副作用

本文件不适用——依据：纯字符串生成。

## 6. 分支、失败、取消与恢复

无异常路径（非有限 bbox 静默 '0.000'）；无异步/取消。

## 7. 权限与权威状态

本文件不适用（无权限代码）；锚点双轨格式（span+comment）是 LLM 溯源契约（`:3-5`）。

## 8. 修改影响面

- 锚点格式改动 → `stripOfficeTopologyAnchors` 正则联动 + LLM 溯源消费面。
- `officeAstToSharedLayoutAst` 的 kind 映射是与 PDF 链共享 AST 的统一口径。
- 测试：本批 `office-engine.test.ts`（3 test）。

## 9. 测试证据

直接测试 `packages/core/src/office-engine/office-engine.test.ts`（本批，:190/:195 两用例）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 双锚点格式+剥离正则（含命名空间前缀容忍） | 已证实 | `:33-52,116-124` |
| 全局 readingOrder 跨页连续 | 已证实 | `:155-163` |
| metrics 全 0 语义 | 已证实 | `:189-195` |
| `OfficeSerializeOptions`/`formatOfficeBlockAnchorPrefix` 零外部引用 | 已证实（检索式见 §4，全冻结树） | grep+子 agent |
| 真实 Markdown 消费效果 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 6 导出 | §2 | 22-197 | covered |
| 锚点/剥离 | §3 | 33-124 | covered |
| shared AST 映射 | §3 | 126-197 | covered |

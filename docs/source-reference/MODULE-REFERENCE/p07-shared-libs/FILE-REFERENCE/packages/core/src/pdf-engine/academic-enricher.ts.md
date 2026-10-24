---
path: packages/core/src/pdf-engine/academic-enricher.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9b090ec03a1de09dc30eb26703e0758858f63052
sha256: cb52ec1919a2c9809459cd57e9cd7e3db49f1bd00163ed2774054fe7017b9745
lines: 165
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/core/src/pdf-engine/academic-enricher.ts

## 1. 结论与边界

学术论文特征增强（`packages/core/src/pdf-engine/academic-enricher.ts:1-8`）：对齐+路由**之后**的语义校正——① 行间公式（居中+数学符号+右侧编号→`kind:'equation'` 包 LaTeX）；② 页眉/页脚分离（Y≤0.06/≥0.94 打 `readingStreamId=-1` 不进主正文流）；③ 脚注关联（页底+小字号→`'footnote'`，上标编号作 anchor）；④ 标题级别（编号点分层级，3.1→level 3）。

边界：**就地修改**并返回同一数组（`:107`）；页眉/页脚「三重硬核防护」——位置+短文本+低高度必须同时满足（`:73-83` 注释明令「严禁将多行长段落或字数超过 120 字的内容归类为页眉！」）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `HEADER_Y_MAX` | const | 14 | `0.06` | |
| `FOOTER_Y_MIN` | const | 15 | `0.94` | |
| `HEADER_FOOTER_MAX_CHARS` | const | 17 | `120` | 与高度条件**同时**满足 |
| `HEADER_FOOTER_MAX_HEIGHT_RATIO` | const | 18 | `0.035` | |
| `FOOTNOTE_Y_MIN` | const | 20 | `0.88` | |
| `FOOTNOTE_FONT_RATIO` | const | 21 | `0.92` | 字号 < 正文×0.92 |
| `AcademicEnrichOptions` | interface | 29-36 | `{bodyFontSize?; pageWidth?; pageHeight?; pageNumber}` | |
| `inferHeadingLevel` | function | 71-76 | `(text) => number`（1-6） | 编号点分层级；无编号 → 2 |
| `enrichAcademicNodes` | function | 106-159 | `(nodes, options) => LayoutNode[]` | 就地修改 |

内部：`MATH_SYMBOL_PATTERN`（`:23`）、`EQUATION_TAG_PATTERN`（`:26`，`(1)`/`(2.3)` 尾标）、`inferBodyFontSize`（`:39-51`，字号众数）、`looksLikeEquation`（`:54-62`，≤200 字符+（居中±0.12 或带标）数学符号 或 带标+居中+≤60）、`isGenuineHeader/isGenuineFooter`（`:78-103`，三重防护）。

## 3. 内部逻辑与关键流程

`enrichAcademicNodes`（`:106-159`）顺序处理（continue 短路）：

1. `:113-123` isGenuineHeader/Footer → `kind:'header'/'footer'` + `readingStreamId:-1`。
2. `:125-134` 脚注（y0≥0.88 且字号 <body×0.92）：`footnoteRef='fn-{page}-{leadingNumber??序数}'`。
3. `:136-150` 行间公式（kind≠table）：`equationId='eq-p{page}-{id}'`、latex 去尾标、tag 保留；`confidence=min(confidence, 0.6)`（语义推断降置信）。
4. `:152-158` headingLevel：section-heading→`inferHeadingLevel`；title→1。

## 4. 调用者与调用链

出向：`@profer/shared`（LayoutEquation/NormalizedBBox）、`./types`（LayoutNode）（`:9-10`）。入向（检索=符号名+模块名，全冻结树）：

- `enrichAcademicNodes`：`packages/core/src/pdf-engine/pdf-engine.ts:20,116`（**唯一产品调用**）。
- `inferHeadingLevel`/`AcademicEnrichOptions`/6 常量：**零外部引用**（仅自用+`pdf-engine/index.ts` export * 转发）。
- 产品链：main 5 文件动态 import `@profer/core/pdf-engine`（document-parse-tools:544、document-parser:154、review/document-service:350、study-document-indexer:291、cslab-literature-index:109）→ pdf-engine.ts→本模块。
- 测试：无直接；`pdf-engine.test.ts`（本批 1 test）经 parsePdfDocument 间接覆盖。

## 5. 数据 I/O、读写与副作用

就地修改入参数组（`:107` 注释声明）；无 I/O。

## 6. 分支、失败、取消与恢复

无异常路径（启发式判定静默跳过）；无异步/取消。

## 7. 权限与权威状态

本文件不适用（无权限代码）；三重防护注释（`:73-83,87`）是页眉/页脚误判的防御性权威口径（明令严禁宽判）。

## 8. 修改影响面

- 阈值 6 常量改动影响 PDF 版面语义分类（页眉/脚注/公式）。
- `confidence` 降为 0.6 的公式判定被下游路由消费。
- 测试：无直接锚（间接 1 test）。

## 9. 测试证据

无直接测试；间接 `pdf-engine.test.ts`（本批 1 test）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 三重防护（位置+短文本+低高度同时满足） | 已证实 | `:78-103` |
| 公式判定降置信 0.6 | 已证实 | `:149` |
| footnoteRef 编号优先语义 | 已证实 | `:133` |
| `inferHeadingLevel`/6 常量/接口零外部引用 | 已证实（检索式见 §4，全冻结树） | grep+子 agent |
| 真实论文版面分类准确率 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 8 导出 | §2 | 14-106 | covered |
| 四类增强 | §3 | 106-159 | covered |
| 测试锚 | §9 | — | unknown（无直接测试） |

---
path: packages/core/src/pdf-engine/__tests__/pdf-engine.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3dd6d5c8d969f40e5584f0c45600e7d04e1c4451
sha256: 2c0d8a3c9cf86ab093b4c24a1689a232b85a34b87d4c4cee1a382100c36a99a3
lines: 60
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/core/src/pdf-engine/__tests__/pdf-engine.test.ts

## 1. 测试目标

PDF Engine 端到端流水线（`packages/core/src/pdf-engine/__tests__/pdf-engine.test.ts:33`）：输入**现场构造**的合法单页 PDF 字节流 → 输出结构完整的 `DocumentLayoutAST`。被测 `parsePdfDocument`（../pdf-engine）。夹具 `buildPdfWithText()`（`:7-30`：ASCII PDF 手工拼装+xref 偏移计算，注释声明不依赖外部样例保证可复现）。

## 2. 用例清单

共 **1 个 `test(`**（1 个 `describe`）：

| # | 行 | 用例 | 断言要点 | 依赖顺序 |
| --- | --- | --- | --- | --- |
| 1 | 34-57 | 真实 PDF 字节 → 结构完整 AST | fileName/pageCount/pages 1/612×792、blocks>0、pageNumber 1、bbox 长 4、markdown 含 'Hello'、metrics 三项 ≥0+trapDocFilteredCount number | 独立 |

## 3. 真实断言

- `:38-43` fileName toBe、pageCount 1、pages 长度 1、width/height toBeCloseTo(612/792, 0)。
- `:45-48` readingOrderedBlocks >0、首块 pageNumber 1、bbox 长度 4、markdown toContain 'Hello'。
- `:51-55` metrics 四项（totalExtractionMs/alignmentMs/maxRegretSortMs ≥0、trapDocFilteredCount typeof number）。

## 4. 未覆盖与脆弱点

- 仅单页单文本；多页/表格/图像/字体变体未测。
- `buildPdfWithText` 为 ASCII 专用（xref 按字符数=字节数假设）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 test、自构造 PDF 夹具 | 已证实 | 全文 |
| AST 形状+metrics 断言 | 已证实 | `:38-55` |
| 测试通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 用例 | 状态 |
| --- | --- | --- | --- |
| parsePdfDocument 端到端 | §2/§3 | 1 | covered |
| 多页/复杂版面 | §4 | — | unknown |

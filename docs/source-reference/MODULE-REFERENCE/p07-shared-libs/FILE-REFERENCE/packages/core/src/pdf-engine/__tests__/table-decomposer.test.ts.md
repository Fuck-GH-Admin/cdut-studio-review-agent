---
path: packages/core/src/pdf-engine/__tests__/table-decomposer.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 49b74f9de6e39c6e7e097d1796195cc09a6cee67
sha256: 1a415ffe8b9a15764581f57e9b3c7a168b9baba3b285c15f37e3059e06839074
lines: 93
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/core/src/pdf-engine/__tests__/table-decomposer.test.ts

## 1. 测试目标

TableDecomposer 空间网格重构（`packages/core/src/pdf-engine/__tests__/table-decomposer.test.ts:32`）：三线表+跨列单元格（表头/colSpan/GFM Markdown）、垂直边框线列分界优先。被测 `decomposeTable`（../table-decomposer）。夹具 `placeText()`（`:7-24`，等宽字符逐字铺行）+ 固定页 200×80（`:26-27`）。

## 2. 用例清单

共 **2 个 `test(`**（1 个 `describe`）：

| # | 行 | 用例 | 断言要点 | 依赖顺序 |
| --- | --- | --- | --- | --- |
| 1 | 28-62 | 三线表+跨列：表头/colSpan/GFM | rowCount 3、columnCount 2、'SpanningHeader' colSpan 2+isHeader true、'Score' colSpan 1、headers[0]、markdown 含 4 行（分隔线/跨列表头/Item\|Score/Alpha\|10） | 独立 |
| 2 | 64-90 | 垂直边框线优先作列分界 | x=110 竖线 → columnCount 2、'Score' columnIndex 1 | 独立 |

## 3. 真实断言

- `:47-48` rowCount/columnCount toBe 3/2。
- `:50-54` headerCell 定义、colSpan toBe 2、isHeader toBe true；scoreCell colSpan 1。
- `:56-60` headers[0] toBe、markdown 四处 toContain（`| --- | --- |`/`| SpanningHeader |  |`/`| Item | Score |`/`| Alpha | 10 |`）。
- `:88-89` columnCount 2、Score columnIndex 1。

## 4. 未覆盖与脆弱点

- 向量线横向分界/行分界未测；多页/嵌套表未测。
- colSpan 推断仅 2 列场景。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 test、跨列+GFM 断言 | 已证实 | `:47-60` |
| 垂直线列分界优先 | 已证实 | `:88-89` |
| 测试通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 用例 | 状态 |
| --- | --- | --- | --- |
| 网格重构+colSpan | §2/§3 | 1 | covered |
| 线分界 | §2/§3 | 2 | covered |
| 横线/复杂表 | §4 | — | unknown |

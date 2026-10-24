---
path: packages/shared/src/utils/cslab-plot-doc.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e567f52b22a91c467c59040f4d94b9bba39930d5
sha256: 0d668a7380ef9ee4ca1cd559acb3364caab043989815d758c168c54603370cb1
lines: 96
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/cslab-plot-doc.test.ts

## 1. 测试目标

出版绘图数学（`packages/shared/src/utils/cslab-plot-doc.test.ts:16`）：刻度/对数换算往返/轴打断/科学文本解析/Nature 预设/SVG 文字可编辑。被测 `cslab-plot-doc` 9 符号 + `cslab-plot-svg` 3 符号。夹具：内联 axis/document/layer/series 构造。

## 2. 用例清单

共 **6 个 `test(`**（1 个 `describe`）：

| # | 行 | 用例 | 断言要点 |
| --- | --- | --- | --- |
| 1 | 17-19 | 0-10 区间刻度用 1/2/5 步长 | `niceTicks(0,10,5)` toEqual `[0,2,4,6,8,10]` |
| 2 | 21-27 | 对数换算与反算往返一致 | `scaleValue(100,'log10')≈2`、`scaleInverse≈100`（10 位）、`scaleValue(-1,'log10')` null、`(0,'reciprocal')` null |
| 3 | 29-34 | 轴打断断点区间返回 null | 2→0.25、5→null、8→0.75 |
| 4 | 36-44 | 科学文本上下标/希腊字母 | `$\text{TiO}_2$`→`[{TiO,normal},{2,sub}]`、`$2\theta$` 含 '2θ' |
| 5 | 46-53 | Nature 预设单栏 89mm | `singleColumnMm` 89、`sizeMm.width` 89、plotArea.width>50、facets 1 |
| 6 | 55-95 | 带曲线文档 SVG：文字可编辑不含位图 | `<svg`、`viewBox="0 0 89`、`font-size="2.117"`（6pt→mm 换算）、无 `font-size="6"`/`pt"`、hasEditableText true、hasEmbeddedImage false、含 tspan |

## 3. 真实断言

逐条见 §2（关键锚）：`:18` toEqual 刻度数组；`:23-26` 双向 10 位+双 null；`:31-33` 三态映射；`:38-43` token 数组+toContain；`:48-52`；`:86-94` 9 断言（含字体换算 6×25.4/72≈2.117 的数值锚，`:88` 注释说明）。

## 4. 未覆盖与脆弱点

- 其它预设（science/等）未锚；`detectAxisBreakSegments`/`formatMetric`/`parseScientificText` 复杂语法未全测。
- 用例 6 的 `2.117` 依赖 mm 换算取整规则（`toFixed(3)` 语义假设）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 test、跨模块（plot-doc+plot-svg） | 已证实 | 全文 |
| 刻度/换算/打断/文本四数学锚 | 已证实 | `:17-44` |
| SVG 文字可编辑契约 | 已证实 | `:55-95` |
| 测试通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 用例 | 状态 |
| --- | --- | --- | --- |
| niceTicks/scaleValue/axisFraction/parseScientificText | §2/§3 | 1-4 | covered |
| createPlotDocument/computePlotLayout | §2/§3 | 5 | covered |
| renderPlotSvg/hasEditableText/hasEmbeddedImage | §2/§3 | 6 | covered |
| 其它预设/复杂语法 | §4 | — | unknown |

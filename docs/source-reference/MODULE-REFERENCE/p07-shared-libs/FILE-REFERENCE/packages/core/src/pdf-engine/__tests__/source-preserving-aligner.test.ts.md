---
path: packages/core/src/pdf-engine/__tests__/source-preserving-aligner.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a52bc9237adeac97fc11df07869050fd08609159
sha256: cd9de7904f426b0711ee341506be266238608759142dbd021fd3a5844e5ec058
lines: 59
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/core/src/pdf-engine/__tests__/source-preserving-aligner.test.ts

## 1. 测试目标

Source-Preserving Alignment 二部图对齐（`packages/core/src/pdf-engine/__tests__/source-preserving-aligner.test.ts:18`）：字符归属 BBox 且**严格保持原始字节流顺序**。被测 `alignGlyphsToBoxes`（../source-preserving-aligner）。夹具 `glyph()` 工厂（`:6-17`，PdfGlyphItem 满字段）。

## 2. 用例清单

共 **3 个 `test(`**（1 个 `describe`）：

| # | 行 | 用例 | 断言要点 | 依赖顺序 |
| --- | --- | --- | --- | --- |
| 1 | 19-37 | 字符归属 BBox 且同框内按字节流顺序 | 故意打乱输入（B,H,y,i）→ groups[0] 'Hi'、groups[1] 'By' | 独立 |
| 2 | 39-47 | 基线漂移字符在垂直容差内行吸附 | 字符中心超框底 2pt，`verticalTolerance:2` → 'x' | 独立 |
| 3 | 49-57 | 完全在框外不被错误归属 | (300,300) 字符 → groups[0].text '' | 独立 |

## 3. 真实断言

- `:34-35` `groups[0].text` toBe `'Hi'`、`groups[1].text` toBe `'By'`（顺序保持核心锚）。
- `:45` toBe `'x'`（容差吸附）。
- `:55` toBe `''`（框外拒绝）。

## 4. 未覆盖与脆弱点

- 多框重叠/容差边界值（恰等）未测。
- 未归属字符的去向（丢弃 vs 溢出组）仅用例 3 隐含。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 test、顺序保持核心语义 | 已证实 | `:34-35` |
| 容差/框外两分支 | 已证实 | `:45,55` |
| 测试通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 用例 | 状态 |
| --- | --- | --- | --- |
| 顺序保持归属 | §2/§3 | 1 | covered |
| 垂直容差 | §2/§3 | 2 | covered |
| 框外拒绝 | §2/§3 | 3 | covered |
| 重叠框 | §4 | — | unknown |

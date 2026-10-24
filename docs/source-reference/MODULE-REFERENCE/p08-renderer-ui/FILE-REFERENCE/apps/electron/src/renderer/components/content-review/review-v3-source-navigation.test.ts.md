---
path: apps/electron/src/renderer/components/content-review/review-v3-source-navigation.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8a2071f54c44ec19a7d377dcb796b92f0460671b
sha256: b73cc9b4a4689f139f6382fdb990fead67640ac74a8a3d8bc11770931c5d8542
lines: 59
kind: test
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-v3-source-navigation.test.ts

## 1. 测试目标

**F10 来源逐处导航**（`apps/electron/src/renderer/components/content-review/review-v3-source-navigation.test.ts:30`）：不同单元格/解析版本是独立出处；表格/PDF 用 V2 块定位；版本不一致/跨案不假装精确定位；无匹配降级文件级。

## 2. 用例清单

1 describe / 4 test。夹具：rule-v2（pdf-rect）+ sheet-v1（sheet-cell A1/B1）。

| # | 名称 | 断言 | 行 |
| --- | --- | --- | --- |
| 1 | 不同单元格/版本独立 | 4 refs→3（A/B/A2 去重留 3）；locations 顺序一致 | `:31-36` |
| 2 | V2 块定位 | `sheetRef('B')`→`{state:'located', blockId:'cell-b1'}`；pdf-rect→`page-1`；purpose 分别 rule/evidence | `:38-44` |
| 3 | 版本不一致/跨案不假装 | `parse-revision-mismatch`；purpose 均 null；statusLabel 含「禁止」 | `:46-53` |
| 4 | 无匹配降级文件级 | `sheetRef('C')`→`file-only`、purpose `evidence` | `:55-58` |

## 3. 真实断言

- `expect(result.map((ref) => ref.location)).toEqual([refs[0]!.location, refs[1]!.location, refs[3]!.location])`（`:35`）。
- `expect(resolveT08Source(sheetRef('C'), aggregate).state).toBe('file-only')`（`:56`）。

## 4. 未覆盖与脆弱点

- 未覆盖：`version-unavailable`/`foreign-case` 的 label 分支（purpose 覆盖 foreign）。
- 脆弱点：`resolveT08Source`（t08 模块）行为断言跨模块。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 用例覆盖去重/定位/拒绝/降级 | 已证实 | `:31-58` |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 面 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 去重 | 1 | `:31-36` | covered |
| V2 定位 | 2 | `:38-44` | covered |
| 拒假装 | 3 | `:46-53` | covered |
| 降级 | 4 | `:55-58` | covered |

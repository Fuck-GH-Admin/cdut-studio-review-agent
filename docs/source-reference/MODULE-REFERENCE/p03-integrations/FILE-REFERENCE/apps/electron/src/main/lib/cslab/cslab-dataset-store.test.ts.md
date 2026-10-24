---
path: apps/electron/src/main/lib/cslab/cslab-dataset-store.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e560ed3e090539249751804d8c19a08216a23166
sha256: 428ec36923a3ea51e1058b140cf661ad7050e54bb6f2663c062b602d51c005a7
lines: 213
kind: test
package: p03-integrations
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-dataset-store.test.ts

## 1. 测试目标

`persistDigitizedFigure`（`cslab-dataset-store.ts:110`）与 `exportAssetTableToFile`：多曲线插值对齐落库、拒绝保存、JPEG 兼容、CSV 流式（BOM/列序）、Parquet 原始副本（`apps/electron/src/main/lib/cslab/cslab-dataset-store.test.ts:53`、`:165`）。

## 2. 用例清单

2 describe / 5 test。

**`persistDigitizedFigure`（`:53-163`）**

| # | 名称 | 断言要点 | 行 |
| --- | --- | --- | --- |
| 1 | 多曲线按主 X 轴插值对齐保存 fig+table | 落库资产/数据表 | `:54-118` |
| 2 | 无有效曲线或点数不足拒绝保存 | 抛（不落库） | `:119-144` |
| 3 | JPEG dataURL 也可保存 | 仍以图表资产登记 | `:145-164` |

**`exportAssetTableToFile`（`:165-213`）**

| # | 名称 | 断言要点 | 行 |
| --- | --- | --- | --- |
| 4 | CSV 走 RowGroup 流式、保留 BOM 与列序 | BOM/列序断言 | `:166-194` |
| 5 | Parquet 导出为原始只读副本 | 只读副本语义 | `:195-212` |

## 3. 真实断言

- `:54-118`（fig+table 落库组）；`:119-144`（拒绝保存抛错组）；`:166-194`（BOM/列序）；`:195-212`（Parquet 只读副本）。

## 4. 未覆盖与脆弱点

- 未覆盖：`persistDigitizedFigure` labId 非法分支。
- 脆弱点：CSV BOM/列序断言绑定流式写出实现（`cslab-columnar.writeDatasetCsvStream`）。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 用例覆盖对齐/拒绝/JPEG/CSV/Parquet | 已证实 | `:54-212` |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 面 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 对齐落库 | 1 | `:54-118` | covered |
| 拒绝保存 | 2 | `:119-144` | covered |
| JPEG | 3 | `:145-164` | covered |
| CSV 流式 | 4 | `:166-194` | covered |
| Parquet 副本 | 5 | `:195-212` | covered |

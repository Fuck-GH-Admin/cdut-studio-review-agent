---
path: apps/electron/src/main/lib/review/source-index.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 21048891f36a307d490aedd4207692325d635824
sha256: 04496a8b6cebe362d6420a5f84709fbc2111d52f331a052e0412cdcea1f7727f
lines: 60
kind: test
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/source-index.test.ts

## 1. 测试目标

N2c/R09（文件头 :2）：CSV 引号解析（前导零/转义/内换行）、sheet-cell 索引、段落索引、索引落盘、视觉自动分批（全登记/字节切批）。被测 `source-index` 全部 5 个函数。

## 2. 用例清单

6 用例 / 3 describe；`PROFER_CONFIG_DIR` 隔离（:9-11）；纯函数 + 一处真实落盘。

| # | describe | 用例 | 行 |
| --- | --- | --- | --- |
| 1 | CSV 引号感知解析 | 前导零/转义/内换行保留 | 14-20 |
| 2 | 同上 | sheet-cell 精度+列名 | 22-27 |
| 3 | 文本段落索引 | 段落精度+摘录 hash | 31-36 |
| 4 | 同上 | 落盘 source-index/ | 38-41 |
| 5 | 视觉自动分批 | 12 张 5/批→3 批全登记 | 47-53 |
| 6 | 同上 | 字节切批+单项超限独立成批 | 55-59 |

## 3. 真实断言

- 1：`rows[1][0]==='00121'`、`rows[1][2]==='说了"你好"'`、`rows[2][2]==='两行\n说明'`、`rows` 长度 3（:16-19）。
- 2：`r1c1` location `toEqual({kind:'sheet-cell',sheet:'sheet1',row:1,column:'分值'})`、text `'8'`（:25-26）。
- 3：entries 2、`precision==='paragraph'`、`excerptHash` 自比较稳定（:33-35）。
- 4：`existsSync(review-cases/case-idx-1/source-index/doc-txt-v1.json)` true（:40）。
- 5：batches 3、flat 12 项、末批 2 项（:50-52）。
- 6：batches 3、`batches[2].items[0].sizeBytes===5000`（单项超限仍登记，:57-58）。

## 4. 未覆盖与脆弱点

- 未覆盖：`hashExcerpt` 算法一致性（自比较断言恒真，:35 实为弱断言）、重复段落 `indexOf` 边界、`planVisionBatches` throw（`maxItemsPerBatch<1`）、`saveSourceIndex` 路径注入。
- 脆弱点：`:35` 的 `entries[0].excerptHash === entries[0].excerptHash` 不构成跨调用稳定性断言（记录为弱断言，待一次合并修正）。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 用例断言如 §3 | 已证实 | 本文件逐行 |
| CSV 语义被固定 | 已证实 | :16-19 |
| :35 为恒真弱断言 | 已证实（记录） | 本文件 :35 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `parseCsvRows` | §3 | 16-19 | covered |
| `buildSheetSourceIndex` | §3 | 25-26 | covered |
| `buildTextSourceIndex` | §3 | 33-35 | covered（弱断言） |
| `saveSourceIndex` | §3 | 40 | covered |
| `planVisionBatches` | §3 | 50-58 | covered |
| throw 分支/hashExcerpt 稳定性 | §4 | — | unknown（未测） |

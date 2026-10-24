---
path: apps/electron/src/main/lib/review/review-v3-t07-round-setup.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 333580116635d3586de3c605dab011f476fbfe35
sha256: daff7802c8ba143e37b9c4a9e3185759f7e99c632d06d1e7d47da5d6a17c020c
lines: 54
kind: test
package: p06-review-batch
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-t07-round-setup.test.ts

## 1. 测试目标

F15 评分轮次与正式模板绑定（describe `:23`）：`createT07RoundFromPublishedTemplate` 按批次锁定版本加载真实量表、拒绝演示量表回退、拒绝缺陷量表/重复案卷。

## 2. 用例清单

3 个 test（`:24/:35/:42`）。夹具：`batch`（60 个 caseIds，`:5-9`）与 `published template`（2 维 quality/impact，`minEffectiveJudges:3, missingStrategy:'block', totalPrecision:2, tieBreaker:'owner-decides', scaleConversion:{fromMax:10,toMax:100}`，`:11-21`）。用例独立。

1. `:24-33` 按批次锁定版本加载真实量表，完整保留超过 50 个案卷。
2. `:35-40` 不存在量表、版本不匹配或未发布时拒绝建立，绝不退回演示量表。
3. `:42-53` 不接受缺精度、重复维度、无效权重或重复案卷。

## 3. 真实断言

- `:26` `result.rubricVersion` 为 `4`；`:27` `minEffectiveJudges` 为 `3`；`:28` 维度 id 序 `['quality','impact']`；`:29` `cases` 长度 `60`；`:30-31` 首尾盲签 `'匿名项目 001'`/`'匿名项目 060'`；`:32` `rounds[0].assignments` 为 `[]`。
- `:36` template undefined 抛含 `'锁定版本'`；`:37` version 5 抛同；`:38` status draft 抛同；`:39` rubric undefined 抛 `'未发布评分量表'`。
- `:44-45` `totalPrecision` 缺失抛 `'精度'`；`:46-47` 重复维度抛 `'重复标识'`；`:48-49` weight 0 抛 `'总权重'`；`:50` caseIds 重复抛 `'重复'`。

## 4. 未覆盖与脆弱点

未覆盖：`assertFixedDecimal` 六位小数边界、`quota` 非负校验、`tieBreaker:'by-dimension'` 无维度分支、`divergenceThreshold`/`scaleConversion` 非法分支、恰好 60 之外的盲签格式。无 mock（纯函数）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 用例行号与断言文本 | 已证实 | `:24-53` 逐条核对 |
| 运行结果 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 锁定版本加载/盲签/空分配 | §3 | test:24-33 | covered |
| 四类拒绝（模板/版本/发布/量表缺失） | §3 | test:35-40 | covered |
| 量表缺陷与重复案卷 | §3 | test:42-53 | covered |
| 定点/换算/quota 分支 | §4 | — | unknown（无断言） |
| 实际运行 | §5 | — | unknown（NOT_RUN） |

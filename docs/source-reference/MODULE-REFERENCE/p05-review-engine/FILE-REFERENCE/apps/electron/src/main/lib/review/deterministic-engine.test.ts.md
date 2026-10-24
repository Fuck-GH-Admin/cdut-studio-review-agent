---
path: apps/electron/src/main/lib/review/deterministic-engine.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2824a2adf561054cbb90e33eec6421f18be0abc7
sha256: da22c55ff952d26e9215a10bafa9a968a8ef2986f29767e7e4142e015eaf09e3
lines: 72
kind: test
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/deterministic-engine.test.ts

## 1. 测试目标

确定计算引擎（D04/D05 固定样本 + 三值未知）：组级去重择高/上限分配、未知不当零、条件树三值传播。

## 2. 用例清单

7 用例 / 2 describe。夹具 `d04Rule`（D04：dedupe eventId、择高、sum、cap 10、score-desc 分配，:9-15）与 `d04Inputs`（s1=6/E1、s2=3/E1、s3=5/E2，:17-21）；纯函数。

| # | describe | 用例 | 行 |
| --- | --- | --- | --- |
| 1 | computeGroupScore | max 聚合明细和=组计入 | 24-29 |
| 2 | 同上 | 择高+上限+舍弃 0+重放一致 | 30-41 |
| 3 | 同上 | 确认分值缺失→整组待确认 | 43-51 |
| 4 | evaluateCondition | all+unknown→unknown | 60-62 |
| 5 | 同上 | any+true→true（短路） | 63-65 |
| 6 | 同上 | not(unknown)→unknown | 66-68 |
| 7 | 同上 | all+false→false | 69-71 |

## 3. 真实断言

- 1：`total '6.00'`、allocation 数值和=6（:27-28）。
- 2：`status 'compliant'`、`total '10.00'`、alloc `{s1:'6.00', s2:'0.00', s3:'4.00'}`（E1 择高 6、同键舍弃 0、上限余量 4）、detailLines 含 `去重舍弃`、**`JSON.stringify` 重放相等**（:32-40）。
- 3：`status 'awaiting-confirmation'`、`unknowns` `toEqual([{subjectId:'s4', field:'confirmedLevelScore'}])`、detailLines 含 `不当零分`（:48-50）。
- 4-7：TriState 断言 `'unknown'`/`'true'`/`'unknown'`/`'false'`（:61/:64/:67/:70）。

## 4. 未覆盖与脆弱点

- 未覆盖：`single` 多候选、负值拒绝、`toCalculationResult`、`in`/日期 op、NaN→unknown。
- 脆弱点：数字字符串断言耦合 `toFixed(2)`。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 用例断言如 §3 | 已证实 | 本文件逐行 |
| 重放一致性被固定 | 已证实 | :40 |
| unknown 不当零被固定 | 已证实 | :50 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| computeGroupScore 去重/择高/封顶/分配 | §3 | covered |
| unknown/空组→待确认 | §3 | covered |
| evaluateCondition 三值传播 | §3 | covered |
| single/负值/toCalculationResult | §4 | unknown（未测） |

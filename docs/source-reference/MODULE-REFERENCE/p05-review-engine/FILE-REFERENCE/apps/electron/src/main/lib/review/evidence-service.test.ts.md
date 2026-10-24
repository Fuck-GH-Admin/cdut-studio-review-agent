---
path: apps/electron/src/main/lib/review/evidence-service.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5ff023ce8c5b96c1270906aa3042781fb6c3d20e
sha256: f148d40774c38fe7c81a18cf97d5a5601e23a0eb32e9a35301779a5661f8956e
lines: 91
kind: test
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/evidence-service.test.ts

## 1. 测试目标

M2 事实/证据绑定（K01/A04/A05）：supersedes 替代链、差异检测、一证多事/多证一事、去重、拒绝不复活、user 直确认、状态迁移。

## 2. 用例清单

9 用例 / 2 describe。夹具 `ref/num/text`（:15-17，纯函数，`now` 显式传入）。

| describe | # | 用例（行） |
| --- | --- | --- |
| recordObservation（A05） | 2 | 替代链可回溯（20-28）；同值不算差异（30-34） |
| buildEvidenceLinks（A04） | 7 | 一证多事（38-43）；多证一事（45-50）；去重（52-56）；单命令重复主体（58-70）；rejected 不复活（72-78）；user 直 confirmed（80-84）；transition 翻转（86-90） |

## 3. 真实断言

- 1：`latest.value` `toEqual(text('一等奖'))`、`latest.supersedesObservationId===observations[0].id`、`toHaveLength(2)`（:24-27）。
- 2：同值 `toBeFalse()`、异值 `toBeTrue()`（:32-33）。
- 3：2 条 candidate、`reuseScope` undefined（:40-42）。
- 4：`coverage.candidate` `toHaveLength(2)`（:49）。
- 5：再绑 `toHaveLength(1)`（:55）。
- 6：`[s1,s1,s2,s2]`+trim → 2 条、`['s1','s2']`、supportsFact `'参与活动'`；再绑仍 2（:63-69）。
- 7：`toHaveLength(1)`、`status==='rejected'`（:76-77）。
- 8：`status==='confirmed'`、`coverage.confirmed` 1（:82-83）。
- 9：transition 后 confirmed 1（:89）。

## 4. 未覆盖与脆弱点

- 未覆盖：`confirmed` 缺省推导（user→true）、首条 `supersedesObservationId` undefined、多 subject 键隔离、空 supportsFact 分支。
- 脆弱点：`now` 显式注入使排序确定（好）；id 含 `Date.now()` 不断言。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 9 用例断言如 §3 | 已证实 | 本文件逐行 |
| 不复活/去重/多对多被固定 | 已证实 | :40-89 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| recordObservation 替代链 | §3 | covered |
| observationDiffers | §3 | covered |
| buildEvidenceLinks 全分支（除空 fact） | §3 | covered |
| transitionEvidenceLink/subjectEvidenceCoverage | §3 | covered |

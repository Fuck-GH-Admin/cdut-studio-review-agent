---
path: apps/electron/src/main/lib/review/review-v3-t07-rating-workflow.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ddeb7f0d532d137dad1d040265771824a23dc64d
sha256: 78bc9dd71407097cf838355a7a9a34775702a6a9b8e9dd715a0b4da7b18af803
lines: 125
kind: test
package: p06-review-batch
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-t07-rating-workflow.test.ts

## 1. 测试目标

T07 独立评审核心（`review-v3-t07-rating-workflow.ts`）的动作归约/名次计算/安全投影：describe 名 `'T07 independent judging A14 / D11'`（`:28`）。7 用例覆盖定稿-重开周期、投影不泄漏、同分跨名额、缺评替补、提交后回避、改分撤销裁定、拒绝强制定稿。

## 2. 用例清单

1 describe、7 test（`:29/:50/:66/:79/:88/:104/:118`）。夹具：量表 2 维（quality 0.4 / feasible 0.6，`totalPrecision:2, missingStrategy:'block', minEffectiveJudges:2, tieBreaker:'shared-rank', scaleConversion:{fromMax:5,toMax:100}`，`:5-12`）；organizer/judge 上下文工厂（`:13-14`）；`base()` 单案状态（`:15-18`）；`assign`/`vote` 助手（`:19-27`）。用例独立（各自从 `base()` 起步）。

1. `:29-49` 两评委一回避 → 4.10/5 → 82.00，不提前定稿——assign j1/j2/j3，recuse j3，j1 投(4,5)；j2 投(3,4) 后断言均分/总分/换算；finalize/reopen 周期。
2. `:50-65` judge 投影排除他人/名册/总分/组织者内部状态。
3. `:66-78` 同分共享名次跨名额须显式策略，不任意选取。
4. `:79-87` 缺评评委可替补，missing 不计零分。
5. `:88-102` 提交后发现利益关联允许本人回避，旧票留审计并要求替补。
6. `:104-116` 改分后撤销旧分歧处理与同分裁决。
7. `:118-124` 无法针对非同分或空批次强制定稿。

## 3. 真实断言

- `:33-34` 单票时 `blockers.length` 大于 0 且 `finalize` 抛错；`:37` `dimensions.map(average)` 为 `[3.5, 4.5]`；`:38` `total` 为 `4.1`；`:39` `convertedTotal` 为 `82`；`:40` `effectiveJudges` 为 `2`；`:41` blockers 空；`:43` 冻结快照 `ranking[0].total` 为 `4.1`；`:44` 冻结后 vote 抛错；`:46-48` reopen 后 2 轮、新轮 0 票、`reopenedFrom.reason` 含 `'申诉'`。
- `:57-63` `view.role==='judge'`、`tasks` 长度 1、`ownVote.reviewerId==='j1'`、`JSON.stringify(view)` 不含 `'j2'`/`'organizer-local'`/`'effectiveJudges'`（不泄漏断言）；`:64` 提交他人分配抛错。
- `:72-73` 同分 `[1,1]` 名次、`selected` `[null,null]`；`:74` finalize 抛错；`:77` owner-decides 设序后 `[['c2',true],['c1',false]]`。
- `:83` mark-missing 后 `effectiveJudges===1`；`:85-86` 替补后 `total===4.1` 且 blockers 空。
- `:91` 双票 blockers 空；`:93-97` self-recuse 后 status `'recused'`、votes 长度 1、`revisionHistory[0].vote.reviewerId==='j2'`、reason 含 `'亲属关系'`、`effectiveJudges===1`；`:98-99` finalize 与被回避者再提交均抛错；`:101` 替补后 `effectiveJudges===2`。
- `:111-113` request-revision 后 `tieOrders`/`divergenceReasons` 均 `{}`，旧 `set-tie-order` 再设抛 `'同分'`；`:115` 重投后次序 `['c2','c1']`。
- `:122-123` 非同分设序抛 `'同分'`、空批次 finalize 抛 `'没有案卷'`。

## 4. 未覆盖与脆弱点

未覆盖：`actionLog`/`T07_ACTION_REPLAY` 幂等、`offlineActionId`、`set-tie-dimension`、`by-dimension` 同分分支、N/A（`naEligible`）路径、`request-revision` 的非 submitted 分支、`mark-missing` 与 missingStrategy='exclude' 组合。无 mock（纯函数状态机，无 I/O）；夹具时间戳固定（`:13-14`）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 用例行号与断言文本 | 已证实 | `:29-124` 逐条核对 |
| 4.1/82 定点换算断言 | 已证实 | `:38-39`（对应 fixed/divideRounded 实现） |
| 运行结果 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| finalize/reopen/冻结拒绝 | §3 | test:29-49 | covered |
| projectT07View 不泄漏 | §3 | test:50-65 | covered |
| 同分共享名次/owner-decides/跨名额 | §3 | test:66-78 | covered |
| mark-missing/self-recuse/request-revision | §3 | test:79-116 | covered |
| 空批次/非同分拒绝 | §3 | test:118-124 | covered |
| actionLog/幂等/N-A/by-dimension | §4 | — | unknown（无断言） |
| 实际运行 | §5 | — | unknown（NOT_RUN） |

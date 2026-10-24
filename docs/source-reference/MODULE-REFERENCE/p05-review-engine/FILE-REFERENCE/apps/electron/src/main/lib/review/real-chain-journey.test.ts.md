---
path: apps/electron/src/main/lib/review/real-chain-journey.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b2fff28b5ec2c1a94c057cef8b8d5f2c2fdd5e7c
sha256: 4a4a75414d4a58088a187a3cd6d65463fe38f8f0dbc5c3a21da45f732ddae87d
lines: 182
kind: test
package: p05-review-engine
author: docs-r07-author-nb-47-20261023
reviewer: p05-review-engine
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/real-chain-journey.test.ts

## 1. 测试目标

全链路旅程自检（头注释 :1-9）：隔离配置里走完整主链路并逐步断言落盘状态——发布模板→建案→带槽登记真实文件→提交→真实执行器运行（假 Pi 客户端含伪造引用反例）→阶段决定退回补件→判不足→再回复（带附件）→判满足回流→终审驳回→申诉更正→投影。不运行（`NOT_RUN`）。

## 2. 用例清单

5 用例（grep `test(` 计 5），1 describe（:58）。fixture：actor 四角色（reviewer/student/teacher/system :27-30）、`seedComprehensiveFixture`+`publishComprehensiveFixture`（:33-34）、`fakeClient`（:37-52，extract 返回合法+伪造引用、summarize 返回 checks 含 FAKE 伪造规则）。
1. 建案+带槽登记两文件+提交（:59-90 附近）：`created.ok`、registerMaterial 两次 expectedRevision 递增、提交后 stage。
2. 真实执行器运行+引用校验（:91-130 区间）：伪造引用/FAKE 规则被剔除。
3. 阶段决定退回补件→不足→再回复→满足回流（:131-160 区间，`resolveSupplementV2/respondSupplementV2/recordStageDecision`）。
4. 终审驳回→申诉更正→投影（:161-175 区间，`resolveAppealV2/resolveFinalDecisionProjection`）。
5. 评分轮次隔离（:176-182）：同人 R1/R2 提交、`aggregateRatings` `average===5`/`effectiveJudges===1`。

## 3. 真实断言

代表行：`expect(created.ok).toBe(true)`；`:179-181` `expect((r2 as {ok:boolean}).ok).toBeTrue()`、`expect(result.average).toBe(5)`、`expect(result.effectiveJudges).toBe(1)`。（各步落盘断言经 `readAggregate` 校验 stage/revision。）

## 4. 未覆盖与脆弱点

未覆盖：真 Pi 模型、并发提交。mock 边界：假 Pi client（含伪造引用反例是核心设计）、真实 store/run-graph/stage-workflow/rating-service 全链真身。脆弱点：共享 `run` 变量跨用例顺序依赖（:59 `let run`）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 用例计数 | 已证实 | grep |
| 断言要点如 §2-3 | 已证实 | 逐行读 |
| 通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 环节 | 用例 | 状态 |
| --- | --- | --- |
| 建案/登记/提交 | #1 | covered |
| 执行器+引用校验 | #2 | covered |
| 补件回流 | #3 | covered |
| 驳回/申诉/投影 | #4 | covered |
| 评分轮次 | #5 | covered |
| 真模型路径 | — | unknown |

---
path: apps/electron/src/main/lib/review/review-v3-t05-local-stage-plan.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 67976ac3c8e3acdff4284fe64795494ab71c9864
sha256: 429add2d912b8d3eecb3fe8c1b82a190f944f96ec07fa82ebf50797d1458a0a3
lines: 157
kind: test
package: p04-review-case-core
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-t05-local-stage-plan.test.ts

## 1. 测试目标

T05 纯领域层（`review-v3-t05-local-stage-plan.ts`）的行为验证：A15 场景下 local-business 阶段规划（真实 Run + 初审通过 → 教师阶段而非终审）、缺真实 Run 不得通过/拒绝、缺件可无 Run 发起补件、角色/模板/未结补件/技术预审门槛、追加式落地（不改原聚合、revision 漂移拒绝）、补件回流（A09/A15）。

夹具（`:8-30`）：模板 `lab-use@1` published（`initial`/reviewer→`final`/teacher，final 有 `returnToStageId:'initial'`）；聚合 `case-lab`（revision 7、`reviewing`、task-initial open）；`run()` 返回 `{id:'run-real-001', current:true, decisionReadiness:'ready'}`（`T05VerifiedRun` 形状）；`act(patch)` 组装输入。纯内存，无 I/O。本轮 `NOT_RUN`：未执行测试。

## 2. 用例清单

3 个 describe、**12 个 test**：

### 2.1 planning for A15（`:32-93`，7）

| # | 行 | 设置/动作 | 断言 |
| --- | --- | --- | --- |
| 1 | `:33-42` | 真实 Run + reviewer 初审 `stage-pass` | `toMatchObject{taskId:'task-initial', stageId:'initial', decisionFinality:'stage', basedOnRunId:'run-real-001', basedOnRevision:7, nextStageId:'final', nextAssigneeRole:'teacher'}`；`decisionFinality!=='final'` |
| 2 | `:43-53` | 终审任务 + teacher `stage-pass` | `decisionFinality==='final'`、`basedOnRunId==='run-real-001'`（真实 Run 非 run@rev）、`nextStageId` undefined；reviewer 冒办终审抛 `T05_ACTOR_NOT_ASSIGNED_TO_STAGE` |
| 3 | `:54-59` | 无 Run / `current:false` / 异案 Run / 无 Run 的 final-reject | 四种均抛 `T05_CURRENT_REAL_RUN_REQUIRED` |
| 4 | `:60-68` | `decisionReadiness:'blocked'` | stage-pass 抛 `T05_REQUIRED_CHECKS_NOT_RESOLVED`；final-reject 允许且 `decisionFinality==='final'` |
| 5 | `:69-77` | 无 Run 的 `return-for-supplement`，要素 `['计划书',' 时间安排 ','计划书']` | `supplement=={requiredElements:['计划书','时间安排'], publicReason:'请补齐计划书和时间'}`（去重+trim）；`basedOnRunId`/`decisionFinality` 均 undefined |
| 6 | `:78-85` | 技术预审 / actorSource:'agent' / 模板 version:2 / 未结补件（responded） | 依次抛 `T05_TECHNICAL_PREVIEW_NOT_BUSINESS_DECISION`、`T05_TRUSTED_HUMAN_ACTOR_REQUIRED`、`T05_PUBLISHED_TEMPLATE_REVISION_REQUIRED`、`T05_UNRESOLVED_SUPPLEMENTS` |
| 7 | `:86-92` | teacher 终审 `return-to-previous-stage` | `toMatchObject{returnToStageId:'initial', nextAssigneeRole:'reviewer', decisionFinality:'stage'}` |

### 2.2 append-only mutations（`:96-136`，4）

| # | 行 | 断言 |
| --- | --- | --- |
| 8 | `:98-108` | 初审通过落地：`caseStage==='reviewing'`；`addedDecision` 匹配 `{stageId:'initial', finality:'stage', basedOnRunId:'run-real-001'}`；`addedTask` 匹配 `{stageId:'final', assigneeRole:'teacher', status:'open', round:1}`；原 task-initial `completed`；**原聚合不变**（`current.tasks[0].status==='open'`、`current.decisions` 长度 0） |
| 9 | `:109-117` | 终审落地：`caseStage==='decided'`、`addedDecision.finality==='final'`、`addedTask` undefined |
| 10 | `:118-129` | 缺件落地：`caseStage==='awaiting-supplement'`、`addedSupplement` 匹配 `{originTaskId:'task-initial', originStageId:'initial', responsibleRole:'student', status:'open'}`、`addedDecision` undefined、decisions 长度 0、原任务 `completed` |
| 11 | `:130-135` | 落地前 `revision+=1` → 抛 `T05_STAGE_REVISION_CHANGED` |

### 2.3 supplement reentry（`:138-156`，1）

| # | 行 | 断言 |
| --- | --- | --- |
| 12 | `:139-156` | `insufficient`→`{canResume:false}`；`satisfied`→`{canResume:true, restoreStageId:'initial', restoreRole:'reviewer'}`（originTask `old-task`/reviewer）；把状态改 `insufficient` 后再判 `satisfied` 抛 `T05_REPLY_REQUIRED_BEFORE_SATISFIED`；状态回 `responded` 且加入第二请求 `open` → `canResume:false`；第二请求 `satisfied` → `canResume:true` |

## 3. 真实断言

- #2 断言 `basedOnRunId` 是 `'run-real-001'`——直接验证“无 run@rev 占位”的产品红线。
- #4 证明 blocked Run 仅挡通过不挡人工拒绝（业务拒绝不需要 readiness）。
- #5 的要素数组断言证明 `Set` 去重 + `trim`（`' 时间安排 '`→`'时间安排'`）。
- #8/#10 断言**入参聚合不被修改**（追加式语义：返回新数组、原对象不变）。
- #12 一条用例连测 5 个分支（含两次状态改写后复用同一聚合对象），是“responded 才可 satisfied”的直接反证。

## 4. 未覆盖与脆弱点

**未覆盖**：`T05_REPLY_REQUIRED_BEFORE_INSUFFICIENT`（insufficient 判定要求 responded）；`T05_CASE_NOT_IN_REVIEW`、`T05_DECISION_REASON_REQUIRED`、`T05_TASK_ALREADY_DECIDED`、`T05_OPEN_TASK_REQUIRED`、`T05_NEXT_STAGE_NOT_FOUND`、`T05_PREVIOUS_STAGE_NOT_CONFIGURED/NOT_FOUND`、`T05_SUPPLEMENT_PROPOSAL_REQUIRED`、`T05_REAL_RUN_DECISION_REQUIRED`、`T05_STAGE_TASK_CHANGED`；`mock/school` actorSource 放行；`status:'partially-completed'` 的 Run。

**脆弱点**：夹具 aggregate 用 `as unknown as CaseAggregateV2`（`:16-22`），字段（如 `supplements`）缺失靠 `??` 兜底，形状变化不被类型捕获；#12 在同一对象上多次改写状态（`:149/:151`），顺序敏感。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 describe、12 test、纯内存 | 已证实 | `:32`、`:96`、`:138` |
| 真实 Run ID、无 run@rev | 已证实 | `:50`、`:103` |
| 缺件分支不造决定/Run | 已证实 | `:74-76`、`:126-127` |
| blocked Run：拒绝可、通过不可 | 已证实 | `:61-67` |
| 追加式落地不改原聚合 | 已证实 | `:106-107` |
| revision 漂移拒绝 | 已证实 | `:130-135` |
| responded 才可 satisfied | 已证实 | `:149-150` |
| 其余 T05_* 拒绝分支 | 已证实（源码）/未知（测试） | 源 `:63-138` |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 源函数/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| `planT05LocalStageAction` 门槛 | #6 | `:78-85` | covered |
| stage-pass 初审/终审 | #1、#2 | `:33-53` | covered |
| verifiedRun 门槛 | #3 | `:54-59` | covered |
| readiness 门 | #4 | `:60-68` | covered |
| return-for-supplement | #5 | `:69-77` | covered |
| return-to-previous-stage | #7 | `:86-92` | covered |
| `applyT05LocalStageProposal` 三分支+revision | #8-#11 | `:96-135` | covered |
| `planT05SupplementReentry` | #12 | `:139-156` | covered |
| 其余 T05_* 抛出 | — | — | unknown |

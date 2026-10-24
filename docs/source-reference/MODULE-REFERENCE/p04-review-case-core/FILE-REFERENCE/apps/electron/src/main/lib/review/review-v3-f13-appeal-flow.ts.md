---
path: apps/electron/src/main/lib/review/review-v3-f13-appeal-flow.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ec3c1b755178046b5b8fa00d1f122d0b77470778
sha256: 05f11c5476420d96d13f89c573e7aba970abc0ab0e0a6988df982bdf85e63f3a
lines: 173
kind: source
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-f13-appeal-flow.ts

## 1. 结论与边界

F13 申诉领域**提案**：由可信 Main 提供真实操作者、复审指派、ID 与时间。本模块只计算下一状态，不读磁盘、不签发角色、不写 `CaseAggregate`；Main 必须在同一次 `submitCommand`/CAS 中追加 Appeal/WorkflowTask/BusinessDecision 并更新案卷阶段；前端能力展示不能代替命令校验（文件头 `apps/electron/src/main/lib/review/review-v3-f13-appeal-flow.ts:1-7`）。

## 2. 导出与关键符号

`export` 逐条核对：3 个接口 + 3 个函数 = 6 个导出（类/常量 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `F13AppealAssignment` | 接口（导出） | 16-22 | `{reviewer,appealId,taskId,at}` | reviewer 是 Main 核实的独立复审人，不能从 Renderer 角色字段推导（`:17`） |
| `F13AppealSubmissionPlan` | 接口（导出） | 24-28 | `{appeal,reviewTask,caseStage}` | |
| `F13AppealClosurePlan` | 接口（导出） | 30-37 | `{appeal,tasks,caseStage,amendment?,summary}` | summary 写事务 Receipt，不伪造新决定（`:35-36`） |
| `planF13AppealSubmission` | 函数（导出） | 79-118 | `(aggregate,appellant,input,assignment)=>F13AppealSubmissionPlan` | |
| `planF13AppealReview` | 函数（导出） | 124-147 | `(aggregate,reviewer,input,context)=>F13AppealClosurePlan` | |
| `planF13AppealWithdrawal` | 函数（导出） | 150-173 | `(aggregate,appellant,appealId,at)=>F13AppealClosurePlan` | |
| `sameActor` | 内部 | 39-42 | actorId+actorSource 双字段 | |
| `assertTrustedHuman` | 内部 | 44-48 | actorId 非空 + actorSource ∈ {local,school} | `申诉业务必须由 Main 核实的具名本地/学校主体办理` |
| `assertSubmitter` | 内部 | 50-56 | student + 案卷 submitter 绑定 | |
| `assertReviewAssignee` | 内部 | 58-70 | 角色/任务指派/独立性 | |
| `afterClosingAppeal` | 内部 | 72-76 | 结算案卷阶段 | 其它在途申诉或 open 任务→`awaiting-review` 否则 `decided` |

## 3. 内部逻辑与关键流程

### 3.1 提交（`planF13AppealSubmission`，`:79-118`）

`assertSubmitter`（student + submitter 绑定，`:50-56`）；`assignment.reviewer` 须 trusted-human 且角色 ∈ {reviewer,teacher}（`独立复审人必须是审核员或教师`）；reviewer ≠ appellant（`申请人不能担任复审人`）；appealId/taskId/at 非空（`申诉标识、任务标识和时间必须由 Main 提供`）；ID 不与现有 appeals/tasks 冲突（`申诉或复审任务标识已存在`）。随后 `prepareT05AppealSubmission`（`:99-100`）；复审人 ≠ 原决定人（`原决定人不能担任独立复审人`，`:101-102`）；构造 `reviewTask`（`stageId:'appeal-review'`、`round=max+1`、`status:'open'`、`inputRevision`，`:104-116`）；返回 `{appeal{...reviewTaskId}, reviewTask, caseStage:'awaiting-review'}`（`:117`）。

### 3.2 复审（`planF13AppealReview`，`:124-147`）

申诉存在（`:130-131`）；`assertReviewAssignee`（`:58-70`）：角色 ∈ {reviewer,teacher}、任务在 `open/in-progress/submitted` 且 `stageId==='appeal-review'`（`当前申诉没有有效的独立复审任务`）、`assigneeActorId/assigneeRole` 与 actor 一致（`复审任务未指派给当前操作者`）、≠ 申请人（`申请人不能审理自己的申诉`）。新证据无 `verifiedRunId` → `申诉提出新证据，必须先完成当前材料的核验运行`（`:133-135`，注释：新证据未经新 Run 核验不能声称维持原决定，`:122`）。`prepareT05AppealResolution`（`:136`）；任务置 `completed`（`:137-139`）；`caseStage=afterClosingAppeal`；summary 固定模板（`:145`）。

### 3.3 撤回（`planF13AppealWithdrawal`，`:150-173`）

`assertSubmitter`；申诉存在；`prepareT05AppealWithdrawal`；复审任务须可关闭（`申诉没有可关闭的复审任务`，`:160-163`）；任务置 `cancelled`；`caseStage=afterClosingAppeal`；summary“原业务决定保留”（`:171`）。

## 4. 调用者与调用链

入向（冻结树 grep）：生产调用点在 Main 命令适配/IPC 层（注释 `:5-6` 指向 submitCommand 同事务要求）；本批检索 `apps/`+`packages/` 非测试：`planF13AppealSubmission/Review/Withdrawal` 生产 0 命中（详见 §10）。测试：`review-v3-f13-appeal-flow.test.ts:4`（本批 6 例）。

出向：`@profer/shared`（类型）；`review-v3-t05-appeal-actions.ts:11-14`（三个 `prepareT05*` 复用）。

## 5. 数据 I/O、读写与副作用

纯提案函数：读聚合入参字段，返回新对象（appeal/tasks/阶段）；无 IO、无副作用；写入由 Main 的同一 CAS 完成（`:5-6`）。

## 6. 分支、失败、取消与恢复

| 抛 `Error` | 触发 | 行 |
| --- | --- | --- |
| `申诉业务必须由 Main 核实的具名本地/学校主体办理` | 身份不 trusted | 46 |
| `只有提交方可以申诉或撤回申诉` | 非 student | 52 |
| `案卷提交人身份未绑定或与当前操作者不符` | submitter 不符 | 54 |
| `当前角色不能独立复审` | 角色 | 60 |
| `当前申诉没有有效的独立复审任务` | 任务无效 | 63 |
| `复审任务未指派给当前操作者` | 指派不符 | 66 |
| `申请人不能审理自己的申诉` | 自审 | 68 |
| `独立复审人必须是审核员或教师` | 指派角色 | 88 |
| `申请人不能担任复审人` | 指派独立性 | 90 |
| `申诉标识、任务标识和时间必须由 Main 提供` | ID/时间空 | 92 |
| `申诉或复审任务标识已存在` | ID 冲突 | 96 |
| `原决定人不能担任独立复审人` | 独立性 | 102 |
| `申诉不存在` | 复审/撤回 | 131,158 |
| `申诉提出新证据，必须先完成当前材料的核验运行` | 新证据未核验 | 134 |
| `申诉没有可关闭的复审任务` | 撤回任务 | 162 |
| T05 层错误 | 透传 | 99,136,159 |

失败后无状态（纯函数）；无取消概念。

## 7. 权限与权威状态

- 操作者/指派/ID/时间全部由 Main 提供并核实（`:2-3,17,91-92`）；`actorSource` 仅 local/school（`:45`）。
- 独立性三重：复审人≠申请人（`:68,90`）、复审人≠原决定人（`:102`）、任务指派匹配（`:65-66`）。
- 阶段语义：`afterClosingAppeal` 按在途申诉/open 任务结算（`:72-76`）；summary 不伪造业务决定（`:35-36`）。

## 8. 修改影响面

- 改 plan 返回形状影响 Main 命令适配的 CAS mutate 与 `WorkflowTask`/`CaseStage` 共享类型。
- 改前置条件影响 6 个测试与 T05 层复用契约。

## 9. 测试证据

直接测试：`review-v3-f13-appeal-flow.test.ts`（114 行，6 例，详见其手册）：提交规划独立任务/阶段且原决定不变、身份未绑定/原决定人/伪造 agent 来源/未绑定 submitter 拒绝、维持原判关闭任务不生成第二决定、新证据必须核验+未指派拒绝+改判追加决定保留原决定、撤回限原申诉人保留任务历史、取消任务/结案申诉不可复审。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

缺口：`afterClosingAppeal` 多在途申诉分支、round 累计、T05 全错误透传无独立断言。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 纯提案、不写聚合 | 已证实 | 全文无写；测试 `:222,261,272`（`decisions` 不变） |
| 独立性三重校验 | 已证实 | `:65-68,90,102` |
| 新证据必须核验 Run | 已证实 | `:133-135`；测试 `:55`（own） |
| ID/时间 Main 供给 | 已证实 | `:91-92` |
| 生产无调用者 | 已证实（检索范围：冻结树 `apps`+`packages` 非测试 `*.ts`） | 三函数 0 命中 |
| Main 命令适配接线 | 未知 | 注释自述待同事务写入（`:5-6`） |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `planF13AppealSubmission` | §3.1 | 79-118 | covered |
| `planF13AppealReview` | §3.2 | 124-147 | covered |
| `planF13AppealWithdrawal` | §3.3 | 150-173 | covered |
| assert 族/阶段结算 | §2,§7 | 39-76 | covered |
| 权限/独立性 | §7 | 44-68,90,102 | covered |
| 生产接线 | §4,§10 | 检索记录 | covered（范围已声明） |

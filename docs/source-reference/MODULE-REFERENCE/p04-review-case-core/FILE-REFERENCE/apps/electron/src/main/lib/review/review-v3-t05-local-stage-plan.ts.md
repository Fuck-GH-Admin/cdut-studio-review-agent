---
path: apps/electron/src/main/lib/review/review-v3-t05-local-stage-plan.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 29af8a0f9a91f14a89f701ae97c45ce0fab27a68
sha256: a7244d9551a6f81e2b86f1af73b71409bbf66ce524198d76ce1bd0f514da6864
lines: 275
kind: source
package: p04-review-case-core
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-t05-local-stage-plan.ts

## 1. 结论与边界

T05 的**纯领域**阶段动作规划与落地：`planT05LocalStageAction` 在冻结模板/可信 actor/真实 Run 前提下产出阶段提案（不写案卷、不造 Actor、不选 Run）；`applyT05LocalStageProposal` 把提案转成**追加式**状态变更（关闭任务、追加决定/补件/新任务）；`planT05SupplementReentry` 判定补件后能否回到原阶段。纯函数，零 I/O——Main（`review-v3-t05-main-service`）供给 actor/模板/Run 并负责持久化（文件头 `:1-8`、`:169-176`）。

不做的事：不读写聚合/Run 存储；不做身份派生（`deriveT05LocalActor` 在 main-service）；不做 T03 严门禁（`review-v3-core-t03-run-gate`）；不发起补件回复；不处理申诉。

## 2. 导出与关键符号

导出 9 项：3 function、6 type/interface。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `T05LocalStageAction` | type | `:11-15` | `'stage-pass'\|'return-for-supplement'\|'return-to-previous-stage'\|'final-reject'` | 4 动作（无 item-* / withdraw） |
| `T05VerifiedRun` | interface | `:17-25` | `{id; caseId; status; current; decisionReadiness}` | Main 核验后的 Run 摘要 |
| `T05StagePlanningInput` | interface | `:27-40` | `{aggregate; template; actor; businessMode; taskId; action; reason; requiredElements?; supplementReason?; verifiedRun?}` | 规划入参 |
| `T05StageProposal` | interface | `:42-59` | `{taskId; stageId; action; reason; basedOnRunId?; basedOnRevision; decisionFinality?; nextStageId?; nextAssigneeRole?; returnToStageId?; supplement?}` | 提案 |
| `planT05LocalStageAction` | function | `:63-138` | `(input) => T05StageProposal` | 规划（失败抛 `Error('T05_*')`） |
| `planT05SupplementReentry` | function | `:143-167` | `(aggregate, supplementId, outcome) => {canResume; restoreStageId?; restoreRole?}` | 补件回流判定 |
| `T05StageMutationContext` | interface | `:177-182` | `{decisionId; nextTaskId; supplementId; at}` | Main 供给的 ID/时间 |
| `T05StageMutation` | interface | `:184-192` | `{caseStage; tasks; decisions; supplements; addedTask?; addedDecision?; addedSupplement?}` | 追加式变更结果 |
| `applyT05LocalStageProposal` | function | `:194-275` | `(aggregate, proposal, actor, ids) => T05StageMutation` | 落地（纯计算） |

内部：`unresolved`（`:61`，`{open,responded,insufficient}`）。

## 3. 内部逻辑与关键流程

### 3.1 规划 `planT05LocalStageAction`（`:63-138`）

顺序门槛（fail-closed，抛 `Error('T05_…')`）：

1. `businessMode !== 'local-business' || aggregate.d2RuntimePlan` → `T05_TECHNICAL_PREVIEW_NOT_BUSINESS_DECISION`（`:65-67`）。
2. `actor.actorSource ∉ {local,mock,school}` → `T05_TRUSTED_HUMAN_ACTOR_REQUIRED`（`:68-70`）。
3. 模板 id/version 与案卷一致且 `template.status==='published'` → `T05_PUBLISHED_TEMPLATE_REVISION_REQUIRED`（`:71-75`）。
4. `caseV2.stage ∉ {submitted,reviewing,awaiting-review}` → `T05_CASE_NOT_IN_REVIEW`（`:76-78`）。
5. 开放任务存在且（`assigneeActorId` 缺省或相等）、`stage.executorRole === task.assigneeRole === actor.role` → `T05_OPEN_TASK_REQUIRED` / `T05_ACTOR_NOT_ASSIGNED_TO_STAGE`（`:79-85`）。
6. 任一补件 `open/responded/insufficient` → `T05_UNRESOLVED_SUPPLEMENTS`（`:86-88`）。
7. `reason` 非空（`:89`）；该任务已有决定 → `T05_TASK_ALREADY_DECIDED`（`:90`）。

动作分支：

- `return-for-supplement`（`:97-104`）：`requiredElements` 去重+trim 非空且 `supplementReason` 非空，否则 `T05_SUPPLEMENT_REQUIREMENTS_REQUIRED`；**不需要 Run**——返回 `{...proposal, supplement}`，`basedOnRunId`/`decisionFinality` 不设（缺件本就该补件，不造假决定，`:102-103`）。
- 其余动作（`:106-111`）：`verifiedRun` 必须存在、`current===true`、`caseId` 匹配、`status ∈ {completed, partially-completed}`，否则 `T05_CURRENT_REAL_RUN_REQUIRED`；通过后 `proposal.basedOnRunId = verifiedRun.id`（真实 Run ID，无 run@rev 占位，`:47-52` 注释）。
- `stage-pass` 还要求 `decisionReadiness==='ready'`，否则 `T05_REQUIRED_CHECKS_NOT_RESOLVED`（`:113-115`）；有 `nextStageId` → `decisionFinality:'stage'`+`nextStageId/nextAssigneeRole`（下一阶段找不到 → `T05_NEXT_STAGE_NOT_FOUND`），无 → `decisionFinality:'final'`（`:117-126`）。
- `return-to-previous-stage`：`returnToStageId` 未配置 → `T05_PREVIOUS_STAGE_NOT_CONFIGURED`；前级找不到 → `T05_PREVIOUS_STAGE_NOT_FOUND`；`decisionFinality:'stage'`+`returnToStageId/nextAssigneeRole`（`:127-133`）。
- `final-reject`：`decisionFinality:'final'`（`:134-136`）；**blocked 的 Run 也允许人工拒绝**（`:113` 只 gate stage-pass）。

### 3.2 落地 `applyT05LocalStageProposal`（`:194-275`）

1. `aggregate.caseV2.revision !== proposal.basedOnRevision` → `T05_STAGE_REVISION_CHANGED`（`:200-202`）。
2. 任务必须仍 open 且 `stageId/assigneeRole/assigneeActorId` 与提案一致 → `T05_STAGE_TASK_CHANGED`（`:203-207`）。
3. 关闭该任务（`status:'completed'`、`completedAt=ids.at`），复制 decisions/supplements（`:208-214`）。
4. `return-for-supplement`（`:216-234`）：缺 `proposal.supplement` → `T05_SUPPLEMENT_PROPOSAL_REQUIRED`；新建 `SupplementRequest`（`responsibleRole:'student'`、`originTaskId/originStageId`），`caseStage='awaiting-supplement'`；**不建决定**。
5. 决定分支（`:236-273`）：缺 `basedOnRunId`/`decisionFinality` → `T05_REAL_RUN_DECISION_REQUIRED`；新决定 `result` 映射（final-reject→`reject`、return-to-previous-stage→`return`、其余 `pass`，`:242-243`）；有 `nextStageId ?? returnToStageId` 且 `nextAssigneeRole` → 建新任务（`round = task.round + (returnToStageId ? 1 : 0)`），`caseStage='reviewing'`；否则 `caseStage='decided'`（`:255-273`）。

### 3.3 补件回流 `planT05SupplementReentry`（`:143-167`）

- 目标必须 `open/responded/insufficient`，否则 `T05_SUPPLEMENT_NOT_ACTIONABLE`（`:148-151`）。
- `satisfied`/`insufficient` 都要求当前状态是 `responded`（`T05_REPLY_REQUIRED_BEFORE_SATISFIED/INSUFFICIENT`，`:152-157`）。
- `canResume = outcome !== 'insufficient' && 无其它未结补件`（`:158-160`）；不可恢复返回 `{canResume:false}`；可恢复附 `restoreStageId=originStageId`、`restoreRole=originTask.assigneeRole`（`:161-166`）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/**/*.{ts,tsx}`（排除测试）。

| 调用者 | 位置 | 调用 |
| --- | --- | --- |
| T05 主服务 | `review-v3-t05-main-service.ts:29-31`（import）、`:456-467`（`planT05LocalStageAction`）、`:476`（`applyT05LocalStageProposal`） | 唯一生产落地点（`recordT05StageDecision` 事务内） |
| T03 严门禁 | `review-v3-core-t03-run-gate.ts:13`、`:45` | 仅 import 类型 `T05LocalStageAction`（`T03GateAction` 别名） |
| IPC | `review-ipc.ts` 经 main-service 间接调用 | — |

出向：仅 `@profer/shared` 类型（`:9`）。链路：`recordT05StageDecision`（main-service）→ `planT05LocalStageAction` → `applyT05LocalStageProposal` → main-service 的 `submitCommand` mutate 写入。

## 5. 数据 I/O、读写与副作用

零 I/O：无磁盘/网络/缓存/日志/时间取用（`at` 由 Main 注入 `ids.at`）。输入聚合快照与提案，输出新数组（`closedTasks`、追加的 decisions/supplements/tasks）；**不修改入参聚合**（测试断言 `current.tasks[0].status==='open'`、`current.decisions` 长度 0，`review-v3-t05-local-stage-plan.test.ts:106-107`）。幂等性取决于 Main 的 requestId 复用，本层无。

## 6. 分支、失败、取消与恢复

全部失败以 `Error('T05_*')` 抛出（非 `CommandValidationError`，由 Main 决定包装）：

| 分支 | 行 | 错误码 |
| --- | --- | --- |
| 技术预审/D2 | `:65-67` | `T05_TECHNICAL_PREVIEW_NOT_BUSINESS_DECISION` |
| 非可信人工 actor | `:68-70` | `T05_TRUSTED_HUMAN_ACTOR_REQUIRED` |
| 模板未发布/版本不符 | `:71-75` | `T05_PUBLISHED_TEMPLATE_REVISION_REQUIRED` |
| 阶段不在审核中 | `:76-78` | `T05_CASE_NOT_IN_REVIEW` |
| 无开放任务/未指派 | `:79-85` | `T05_OPEN_TASK_REQUIRED` / `T05_ACTOR_NOT_ASSIGNED_TO_STAGE` |
| 未结补件 | `:86-88` | `T05_UNRESOLVED_SUPPLEMENTS` |
| 无理由/任务已决定 | `:89-90` | `T05_DECISION_REASON_REQUIRED` / `T05_TASK_ALREADY_DECIDED` |
| 补件要素缺失 | `:99-101` | `T05_SUPPLEMENT_REQUIREMENTS_REQUIRED` |
| 无真实 Run | `:106-110` | `T05_CURRENT_REAL_RUN_REQUIRED` |
| stage-pass 未就绪 | `:113-115` | `T05_REQUIRED_CHECKS_NOT_RESOLVED` |
| 下级/前级阶段缺失 | `:120`、`:128-130` | `T05_NEXT_STAGE_NOT_FOUND` / `T05_PREVIOUS_STAGE_NOT_CONFIGURED` / `T05_PREVIOUS_STAGE_NOT_FOUND` |
| revision 漂移 | `:200-202` | `T05_STAGE_REVISION_CHANGED` |
| 任务变更 | `:203-207` | `T05_STAGE_TASK_CHANGED` |
| 提案缺补件/缺 Run | `:217`、`:236` | `T05_SUPPLEMENT_PROPOSAL_REQUIRED` / `T05_REAL_RUN_DECISION_REQUIRED` |
| 补件不可判定/未回复 | `:149-157` | `T05_SUPPLEMENT_NOT_ACTIONABLE` / `T05_REPLY_REQUIRED_BEFORE_SATISFIED` / `T05_REPLY_REQUIRED_BEFORE_INSUFFICIENT` |

无取消/恢复概念（纯函数）。

## 7. 权限与权威状态

- **权限**：只做“actor 是否被指派到该阶段任务”的纯校验（`:82-84`、`:204-205`）；actor 的铸造与来源认证由 Main 负责（`deriveT05LocalActor`，main-service `:51-54`）。actorSource 只接受 `local/mock/school`（`:68`）；`school` 被接受但注释指明本机无学校授权能力（main-service `:39-41`）。
- **权威状态**：提案只描述意图；真正的权威写入在 Main 的 `submitCommand` 事务。`basedOnRevision` 是提案与快照的绑定（`:200`），防止陈旧提案落地。
- **业务/技术边界**：`businessMode!=='local-business'` 或 D2 计划一律拒绝（`:65-67`）。

## 8. 修改影响面

- 改门槛/动作语义 → `review-v3-t05-main-service.recordT05StageDecision` 的行为与 `readT05StageCapability` 展示；测试 `review-v3-t05-local-stage-plan.test.ts`（12 例）直接断言。
- 改 `T05LocalStageAction` 类型 → `review-v3-core-t03-run-gate.ts:45` 的 `T03GateAction` 联动。
- 改 `applyT05…` 的新任务 round 规则（return+1/前进不变，`:261`）→ 影响任务轮次账本。
- 需同步的测试：本文件测试 + `review-v3-t05-main-service.test.ts`（经 main-service 间接）。

## 9. 测试证据

本轮 `NOT_RUN`：未执行 `bun test`。直接测试 `review-v3-t05-local-stage-plan.test.ts`（3 describe、**12 test**）：

- 规划（7，`:32-93`）：真实 Run+初审通过 → `decisionFinality:'stage'`、`nextStageId:'final'`、`nextAssigneeRole:'teacher'`、`basedOnRunId:'run-real-001'`（`:33-42`）；终审用自身真实 Run、`decisionFinality:'final'`、无 nextStageId，reviewer 冒办终审抛 `T05_ACTOR_NOT_ASSIGNED_TO_STAGE`（`:43-53`）；无 Run/current:false/异案 Run/无 Run 的 final-reject 均抛 `T05_CURRENT_REAL_RUN_REQUIRED`（`:54-59`）；`decisionReadiness:'blocked'` 的 stage-pass 抛 `T05_REQUIRED_CHECKS_NOT_RESOLVED`，但 final-reject 允许且 `finality:'final'`（`:60-68`）；缺件补件不造 Run/决定、要素去重 trim（`['计划书',' 时间安排 ','计划书']→['计划书','时间安排']`）（`:69-77`）；技术预审/agent 来源/模板版本不符/未结补件四类拒绝（`:78-85`）；终审退回初审 → `returnToStageId:'initial'`、`nextAssigneeRole:'reviewer'`、`finality:'stage'`（`:86-92`）。
- 落地（4，`:96-136`）：初审通过 → 关闭初审任务、追加 stage 决定（`basedOnRunId:'run-real-001'`）、开终审任务（round 1）、原聚合不变（`:98-108`）；终审决定 `finality:'final'`、`caseStage:'decided'`、无新任务（`:109-117`）；缺件 → `caseStage:'awaiting-supplement'`、补件带 `originTaskId/originStageId/responsibleRole:'student'`、无决定、原任务 completed（`:118-129`）；revision 变化抛 `T05_STAGE_REVISION_CHANGED`（`:130-135`）。
- 补件回流（1，`:138-156`）：`insufficient`→`{canResume:false}`；`satisfied`→`{canResume:true,restoreStageId:'initial',restoreRole:'reviewer'}`；`insufficient` 状态再判 `satisfied` 抛 `T05_REPLY_REQUIRED_BEFORE_SATISFIED`；另一请求 open 时不可恢复；全部结束后可恢复。

**未覆盖**：`T05_REPLY_REQUIRED_BEFORE_INSUFFICIENT`（insufficient 判定的前置回复门）；`T05_CASE_NOT_IN_REVIEW`/`T05_DECISION_REASON_REQUIRED`/`T05_TASK_ALREADY_DECIDED`/`T05_NEXT_STAGE_NOT_FOUND`/`T05_PREVIOUS_STAGE_*`/`T05_SUPPLEMENT_PROPOSAL_REQUIRED`/`T05_REAL_RUN_DECISION_REQUIRED`/`T05_STAGE_TASK_CHANGED` 的抛出断言；`mock/school` 来源放行；`T05StageMutation.addedTask` 在 return 分支无新任务的形态。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 纯函数、不修改入参聚合 | 已证实 | `:194-275`；测试 `:106-107` |
| 缺件补件不需要 Run、不造决定 | 已证实 | `:97-104`、`:216-234`；测试 `:69-77`、`:118-129` |
| 无真实 Run 不得 pass/reject | 已证实 | `:106-110`；测试 `:54-59` |
| blocked Run 可 final-reject 不可 stage-pass | 已证实 | `:113`；测试 `:60-68` |
| 终审通过→final；初审→stage+下一任务 | 已证实 | `:117-126`；测试 `:33-53` |
| revision 漂移拒绝落地 | 已证实 | `:200-202`；测试 `:130-135` |
| 补件回流要求先回复 | 已证实 | `:152-157`；测试 `:149-150` |
| `basedOnRunId` 只有真实 Run ID | 已证实 | `:111`、`:47-52` 注释 |
| 未列举的 T05_* 抛出分支 | 已证实（代码）/未知（测试） | §6 表 |
| `mock/school` 来源的实际到达路径 | 未知 | 本文件只放行判断；Main 派生仅 local 两角色 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `planT05LocalStageAction` 门槛 1-7 | 3.1 | `:63-90` | covered |
| return-for-supplement 分支 | 3.1、3.2 | `:97-104`、`:216-234` | covered |
| verifiedRun 门槛 | 3.1 | `:106-111` | covered |
| stage-pass/return/final 分支 | 3.1 | `:113-136` | covered |
| `applyT05LocalStageProposal` | 3.2 | `:194-275` | covered |
| `planT05SupplementReentry` | 3.3 | `:143-167` | covered |
| 未列举 T05_* 错误 | 6 | — | partial（9 项未断言） |

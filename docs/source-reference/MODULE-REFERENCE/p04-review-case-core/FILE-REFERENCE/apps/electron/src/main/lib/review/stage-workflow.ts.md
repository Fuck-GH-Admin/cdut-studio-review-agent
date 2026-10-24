---
path: apps/electron/src/main/lib/review/stage-workflow.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a46022bbc5d3889d5e69e4040c781db06db4f6b3
sha256: d66c646636e573c5a318224e9387afd663572540c0f55add485bd6d9cefafb03
lines: 412
kind: source
package: p04-review-case-core
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/stage-workflow.ts

## 1. 结论与边界

审核阶段的业务闭环命令层（N3/R07）：建首任务、阶段决定（初审通过≠decided）、补件回复/判定（多请求门控+任务回流）、申诉复核（更正=追加关联决定）与最终决定投影；提交案卷（draft→submitted + 首阶段任务）也在此。全部变更走 `case-store-v2.submitCommand` 事务（幂等回执、revision +1）。运行时模块。

不做的事：不实现聚合存储/幂等/冲突（`case-store-v2`）；不做运行/输入哈希判定（`workspace-business-service-v2`/`review-runtime-contract`）；不做模板存储（`template-store`，仅懒取）；不实现 T05 的 run@rev 禁令口径（本文件 `basedOnRunId` 使用合成 `run@revN`，与 T05 的“只认真实 Run”是两套约定，见 §3.2）；不实现批次回流（`batch-store.requeueCaseAfterSupplement`）。

## 2. 导出与关键符号

导出 9 项：7 function、2 type/interface（StageDecisionAction 类型别名、StageDecisionPayload interface）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `ensureInitialTask` | function | `:24-38` | `(caseId, template, actor) => Promise<ReviewCommandResult<WorkflowTask>>` | 按模板首阶段建初审任务（expectedRevision 固定 0） |
| `StageDecisionAction` | type | `:62` | 7 个动作字面量 | stage-pass/item-pass/item-partial-pass/return-for-supplement/return-to-previous-stage/final-reject/withdraw |
| `StageDecisionPayload` | interface | `:64-73` | `{action; taskId; reason; finalScores?; supplementRequiredElements?; supplementReason?}` | 阶段决定入参 |
| `recordStageDecision` | function | `:81-193` | `(caseId, command, template) => Promise<ReviewCommandResult<{decision; task?; supplement?}>>` | 阶段决定事务 |
| `respondSupplementV2` | function | `:198-235` | `(caseId, command) => Promise<ReviewCommandResult<SupplementRequest>>` | 补件回复（open→responded） |
| `resolveSupplementV2` | function | `:238-291` | `(caseId, command) => Promise<ReviewCommandResult<SupplementRequest>>` | 补件判定（3 值）+ 恢复/回流 |
| `resolveAppealV2` | function | `:295-340` | `(caseId, command) => Promise<ReviewCommandResult<Appeal>>` | 申诉复核（maintain/amend/withdrawn） |
| `resolveFinalDecisionProjection` | function | `:348-355` | `(decisions) => {decision; isFinal; supersededIds}` | 最终决定投影（不取时间最后一条） |
| `submitCaseV2` | function | `:359-412` | `(caseId, actor?, source?) => Promise<ReviewCommandResult<WorkflowTask>>` | draft→submitted + 首任务（含幂等重放） |

关键内部符号：

| 符号 | 行 | 作用 |
| --- | --- | --- |
| `newWorkflowTaskId` | `:20` | `task-${randomUUID()}` |
| `assertAgentDecisionAllowed` | `:52-58` | agent 来源需 `reviewAgentAutoApproval` 开关 |
| `isFinalStage` | `:75-78` | 模板阶段无 `nextStageId` 即终审 |

## 3. 内部逻辑与关键流程

### 3.1 首任务 `ensureInitialTask`（`:24-38`）

`template.stages[0]` 缺失 → `VALIDATION_FAILED('模板没有阶段')`（`:26`）。命令 `EnsureInitialTask`、**`expectedRevision: 0`**（`:27`）：聚合 revision 非 0 会 `VERSION_CONFLICT`（推断，自 `case-store-v2` 语义）。handler：`aggregate.tasks.length > 0` → `INVALID_TRANSITION('任务已初始化')`（`:28`）；建 `{id, caseId, stageId:firstStage.id, round:1, assigneeRole:firstStage.executorRole, status:'open', inputRevision, createdAt}`（`:32`）。

### 3.2 阶段决定 `recordStageDecision`（`:81-193`）

handler 顺序（`:87-115`）：

1. `assertAgentDecisionAllowed`（agent 来源必须开代批开关；注释明确覆盖 RecordStageDecision 全部动作 + ResolveSupplement，RespondSupplement 不受此门控，`:44-51`）。
2. `aggregate.d2RuntimePlan` → `AGENT_DECISION_DISABLED('D2 技术预审案卷无权进入正式阶段决定')`（`:89`）。
3. 任务必须存在且 `status==='open'`（`:90-91`）；案卷模板 id/version 必须与传入 `template` 一致且 `template.status==='published'`（`:92-95`）。
4. 指派校验：`currentStage.executorRole === task.assigneeRole === command.actor.role`，且 `assigneeActorId` 存在时相等（`:96-101`）；agent 不得代教师/校方执行（`:102-104`）。
5. 动作白名单 7 值（`:106-110`）；`reason` 非空（`:111`）；该任务已有决定 → `INVALID_TRANSITION('该任务已有决定')`（`:112`）。
6. `finality = final-reject 或 (stage-pass && isFinalStage) ? 'final' : 'stage'`（`:115`）。

mutate（`:118-190`）：关闭当前任务（`:124`）；`result` 映射（`:125`：final-reject→`reject`、withdraw→`withdraw`、两个 return→`return`、item-partial-pass→`partial-pass`、其余 `pass`）；追加 `BusinessDecision`（`basedOnRunId = run@rev${aggregate.caseV2.revision}`、`taskId/round` 记录，`:126-141`）。

动作分支（`:143-187`）：

- `stage-pass`：有 `nextStageId` → 建下一阶段任务（`round` 不变、`prerequisiteTaskId=当前任务`、`assigneeRole=next.executorRole ?? 'teacher'`）且 `stage='reviewing'`；否则 `stage='decided'`（`:144-155`）。**初审通过≠decided**（注释 `:147`）。
- `item-pass`/`item-partial-pass`：把刚关闭的任务**重开**（`status:'open'`、`completedAt: undefined`），保持当前阶段（`:157-161`）。
- `return-for-supplement`：缺 `supplementRequiredElements/supplementReason` → `VALIDATION_FAILED`；建 `SupplementRequest`（`originTaskId/originStageId`、`responsibleRole:'student'`）+ `stage='awaiting-supplement'`（`:162-168`）。**注意**：`:167` 注释称“补件回流：创建同阶段新轮次任务”，但本分支并未创建任务——回流任务由 `resolveSupplementV2` 的 G05 逻辑创建（`:270-275`）；注释与实现不一致，照实记录。
- `return-to-previous-stage`：`returnToStageId` 缺失 → `INVALID_TRANSITION('该阶段没有退回目标')`；建前级任务 `round+1`（`:170-178`）。
- `final-reject` → `stage='decided'`（不自动待补件，`:180-183`）；`withdraw` → `stage='archived'`（`:184-186`）。

### 3.3 补件回复 `respondSupplementV2`（`:198-235`）

- 目标存在；`status ∈ {open,responded,insufficient}`（`:200-202`）；`responsibleRole==='student'` 时 actor.role 必须 `student` 或 `reviewer`（教师代回复拒绝，`:203-204`）；`note` 或 `documentVersionIds` 至少其一（`:205`）。
- **RUN-19**（`:206-223`）：版本 id 去重；必须是本案 active 版本（否则 `VALIDATION_FAILED('…不属于本案当前有效原件')`）；不得复用 `documentVersionIdsAtRequest` 里的请求前版本（否则 `VALIDATION_FAILED('…必须是本次补件请求后新登记的原件…')`）。
- mutate：`status:'responded'`，追加 `{id:resp-${Date.now()}, documentVersionIds, note, at, actor}`（`:227-231`）。

### 3.4 补件判定 `resolveSupplementV2`（`:238-291`）

1. `assertAgentDecisionAllowed`（判定属审核决定，`:240-241`）。
2. 目标存在；判定者必须是 `originTask?.assigneeRole ?? 'reviewer'` 且 `assigneeActorId` 匹配（`:244-249`）。
3. `outcome` 必须 `satisfied/insufficient/cancelled`——非法值会把 status 写成 undefined，因此显式拒绝（`:250-255`）；目标状态须 `open/responded`（`:256`）；`cancelled` 需理由（`:257`）。
4. mutate（`:260-277`）：写入 outcome 状态；`stillOpen` = 任一请求 `open/responded/insufficient`（`:263`）；全部结束才 `stage='reviewing'` 并按 `originStageId` 回流任务（若该阶段无 open 任务，`round=originTask?.round ?? 1`、`prerequisiteTaskId=originTaskId`，`:268-275`）。RUN-18：最后关闭的可以是 `cancelled`，同样恢复（`:264-267` 注释）。
5. 事务成功后：若 `stage==='reviewing'` 且所有补件已结束 → `require('./batch-store').requeueCaseAfterSupplement(caseId)`（`:281-289`；本地工具直调服务也走同一回流）。

### 3.5 申诉 `resolveAppealV2`（`:295-340`）

- `d2RuntimePlan` → `AGENT_DECISION_DISABLED`（`:297`）；申诉存在（`:298-299`）；**actor.role 必须 `teacher`**（`:300-302`）；申诉已关闭（upheld/overturned/withdrawn）→ `INVALID_TRANSITION`（`:303`）；理由非空（`:304`）。
- mutate（`:308-336`）：先写 `resolution` 与中间 `status`（`:311`）；`amend-original` → 追加关联决定（拷贝原决定、新 id 取 `reviewDecisionId`、`actor=command.actor`、`amendsDecisionId=原决定`、`result=amendedResult ?? 'pass'`、`finality:'final'`，`:312-317`），申诉最终 `status='overturned'`（`:326-328`）；`withdrawn` → `status='withdrawn'`（`:319-321`）；`maintain-original` → `status='upheld'`（`:323-325`）；非 withdrawn 分支**无条件**关闭全部 open 任务并 `stage='decided'`（`:329-335`）——`:330` 注释称“无其他开放任务时”才进入 decided，但实现不检查 `hasOpen`：该变量在 `:331` 计算后 `void hasOpen`（死代码），decided 无条件写入。注释与实现不一致，照实记录。
- `entity` 返回**事务前**的申诉对象（`:337`），不是 mutate 后状态。

### 3.6 最终投影 `resolveFinalDecisionProjection`（`:348-355`）

`supersededIds` = 被 `amendsDecisionId` 指向的决定；`effective` 排除被更正者；优先 `finality==='final'` 中 `at` 最新的一条（`isFinal:true`），否则 `at` 最新一条 stage 决定（`isFinal:false`）。**不取“时间最后一条”冒充终审**（注释 `:344-347`）。

### 3.7 提交 `submitCaseV2`（`:359-412`）

1. 聚合必须存在（`:361-362`）；**幂等重放**：`stage==='submitted' && tasks.length>0` → 返回最近 `SubmitCase` 回执 + `tasks[0]`（`:363-367`）。
2. `recovering = stage==='submitted' && tasks.length===0`；其余非 draft → `INVALID_TRANSITION`（`:368-369`）。
3. 模板必须存在（`:370-371`）；至少一份材料（`:372`）；`collectMissingIntakeInputs` 缺项 → `VALIDATION_FAILED('案卷尚未补齐必填输入…')`（`:375-380`）；`collectMissingSubmissionSlots` 缺槽 → `VALIDATION_FAILED('缺少必需材料…')`（`:382-384`）。
4. 命令 `SubmitCase`、`requestId=submit-${caseId}-${revision}`、actor 缺省 `{local-user,local,reviewer}`（`:388-393`）；mutate：`stage='submitted'` + 首阶段任务（id `task-submit-${caseId}-${revision}`）在同一事务（`:394-410`）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/**/*.{ts,tsx}`（排除测试）。

### 4.1 入向

| 调用者 | 位置 | 调用 |
| --- | --- | --- |
| IPC | `review-ipc.ts:894/:918` `respondSupplementV2`；`:1040-1044` `recordStageDecision`；`:1048-1057` `resolveSupplementV2`；`:1064-1067` `respondSupplementV2`；`:1152-1153` `resolveAppealV2`；`:1337-1338` `submitCaseV2` | 用户操作入口 |
| Pi 运维工具 | `adapters/pi-review-ops-tools.ts:419-420`（`submitCaseV2`，actor `agent`+guard）、`:566-573`（`recordStageDecision`）、`:607-611`（`resolveSupplementV2`）、`:645-653`（`respondSupplementV2`） | Agent 工具面 |
| 批次存储 | `batch-store.ts:231`、`:251` | `resolveFinalDecisionProjection` |
| 批次自动化 | `batch-automation-service.ts:129`、`:135` | `resolveFinalDecisionProjection` |

出向回流：`resolveSupplementV2` → `batch-store.requeueCaseAfterSupplement`（`batch-store.ts:193` 定义）。

### 4.2 出向

`case-store-v2.{CommandValidationError,submitCommand,CommandSourceMeta}`（`:17`）、`@profer/shared` 类型（`:15`、`:18`）、懒取 `./template-store`（`:360`）、`./case-store-v2`（`:361`）、`./application-service`（`:375`、`:382`）、`./batch-store`（`:287`）、`../settings-service`（`:55`）。

### 4.3 链路

```
UI/Agent 工具 → review-ipc / pi-review-ops-tools → 本文件
  → submitCommand（state.v2.json，幂等 + expectedRevision）
  → mutate 追加 tasks/decisions/supplements/appeals + 阶段推进
  → resolveSupplementV2 收尾 → batch-store.requeueCaseAfterSupplement
```

## 5. 数据 I/O、读写与副作用

- **读**：聚合快照（handler）、模板（`getTemplate`）、设置（agent 开关）。
- **写**：全部经 `submitCommand` 写 `state.v2.json`；`submitCaseV2` 用 `import()` 懒加载（`:360-361`、`:375`、`:382`）。
- **副作用**：补件回流触发批次重排（`:287-288`）；申诉关闭 open 任务（`:332`）；提交在同一事务内“状态+首任务”原子落盘（`:387` 注释）。
- **幂等**：`submitCaseV2` 的重放分支（`:363-367`）；其余命令依赖 `requestId` 幂等（`case-store-v2`）。
- **并发**：全部校验在事务 handler 内；`ensureInitialTask` 用 `expectedRevision:0` 限制初始化时刻。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 模板无阶段 | `:26`、`:386` | `VALIDATION_FAILED` |
| 任务已初始化 | `:28` | `INVALID_TRANSITION` |
| agent 未开代批 | `:56-57` | `AGENT_DECISION_DISABLED` |
| D2 案卷阶段决定/申诉 | `:89`、`:297` | `AGENT_DECISION_DISABLED` |
| 任务/模板/指派不符 | `:90-104` | `INVALID_TRANSITION` |
| 未知动作/无理由/重复决定 | `:108-112` | `VALIDATION_FAILED`/`INVALID_TRANSITION` |
| 退回补件缺要素 | `:163` | `VALIDATION_FAILED` |
| 无退回目标 | `:173` | `INVALID_TRANSITION` |
| 补件已关闭/角色不符 | `:202`、`:204`、`:248`、`:256` | `INVALID_TRANSITION` |
| 补件材料 RUN-19 违规 | `:209-223` | `VALIDATION_FAILED` |
| 判定值非法 | `:252-255` | `VALIDATION_FAILED`（防止 status 被写成 undefined） |
| 申诉已关闭/非教师 | `:300-303` | `INVALID_TRANSITION` |
| 提交缺材料/缺必填 | `:372`、`:378-379`、`:384` | `VALIDATION_FAILED` |
| 提交阶段不符 | `:369` | `INVALID_TRANSITION` |
| 取消/恢复 | 无 | 无 AbortSignal；幂等重放是唯一“恢复”路径（`:363-367`） |

## 7. 权限与权威状态

- **代批门**：agent 来源必须开 `reviewAgentAutoApproval`（`:52-58`），事务校验内读取（排队期间关闭立即生效，`:54` 注释）；覆盖 `RecordStageDecision`+`ResolveSupplement`，`RespondSupplement` 是提交者侧动作不受此门（`:49-50` 注释）。
- **角色校验**：阶段决定要求 actor.role 与任务指派一致且 agent 不得代教师（`:97-104`）；补件回复限 student/reviewer（`:204`）；补件判定限来源任务的 assigneeRole（`:245-248`）；申诉限 `teacher`（`:300`）。
- **权威状态**：任务/决定/补件/申诉全在聚合回执链上；`resolveFinalDecisionProjection` 以 `finality`+`amendsDecisionId` 派生“当前有效结论”，不认时间序冒充。
- **与 T05 的差异**：本文件决定的 `basedOnRunId` 是合成 `run@revN`（`:134`）；T05 主服务拒绝这类占位、只认真实 Run（`review-v3-t05-local-stage-plan.ts:47-52` 注释）。两套口径并存于冻结树，属现存实现差异。

## 8. 修改影响面

- 改动作→状态映射 → 影响 UI 流程、批次回流、申诉闭环；测试 `stage-workflow.test.ts` 23 例直接断言。
- 改补件门控/回流 → 影响 `batch-store.requeueCaseAfterSupplement` 触发与 T05 `planT05SupplementReentry` 的对齐。
- 改 `resolveFinalDecisionProjection` → 影响 `batch-store.ts:251`、`batch-automation-service.ts:135` 的定稿判定。
- 改 `submitCaseV2` 校验 → 影响 IPC 提交与 Pi 工具提交（`pi-review-ops-tools.ts:419`）。
- 需同步的测试：`stage-workflow.test.ts`；间接 `workspace-business-service-v2.test.ts:194-207`（回复致 stale）。

## 9. 测试证据

本轮 `NOT_RUN`：未执行 `bun test`。直接测试 `stage-workflow.test.ts`（8 describe、**23 test**；夹具 `PROFER_CONFIG_DIR` 临时目录、两级模板 first(reviewer)→final(teacher)、`seed()` 建聚合+首任务；`Date.now` 冻结用于任务 ID 唯一性用例）：

- 阶段推进（8）：三阶段连续通过、时钟冻结下任务 ID 唯一（`:40-74`，`decisions.stageId` 序列 `['first','middle','final']`）；初审通过→`reviewing`+终审任务（`:76-86`）；终审→`decided`+`finality:'final'`（`:88-100`）；reviewer 冒签终审拒绝且不写决定（`:102-118`）；跨模板伪装拒绝（`:120-130`）；final-reject→decided 且无补件（`:132-141`）；退回补件→`awaiting-supplement`（`:143-149`）；重复决定→`INVALID_TRANSITION`（`:151-159`）。
- 多请求门控（2）：两请求只满足其一不恢复（含非法判定值 fail-closed、状态保持 open，`:163-198`）；RUN-18 最后一笔 `cancelled` 也恢复 `reviewing` 并回流任务（`:200-224`）。
- 回复与回流（3）：回复+满足→原阶段任务回流（`prerequisiteTaskId` 指向原任务，`:228-248`）；判定不足→不恢复不回流（`:250-260`）；教师代回学生补件拒绝（`:262-269`）。
- RUN-19（1）：他案版本/请求前版本拒绝（消息分别含“不属于本案当前有效原件”“请求前已有版本”），请求后新版本成功且同 requestId 重试不追加第二份回复（`:274-343`）。
- 角色安全（2）：越权判定补件拒绝且状态不变（`:347-363`）；reviewer 冒签申诉拒绝且申诉保持 `in-review`（`:365-397`）。
- 申诉/投影（3）：更正决定生效、原决定进 `supersededIds`（`:401-409`）；仅阶段决定 `isFinal:false`（`:411-414`）；`resolveAppealV2` 更正追加关联决定（`:416-423`）。
- 补件不足后再回复（2）：insufficient 后可再次回复并满足恢复（`:427-445`）；另一请求 insufficient 计入未满足（`:447-457`）。
- 申诉闭环（2）：maintain→upheld+decided（`:461-474`）；amend→overturned、新决定 actor=teacher-1、`finality:'final'`（`:476-492`）。

**未覆盖**：`ensureInitialTask` 的 `expectedRevision:0` 冲突分支；`item-pass`/`item-partial-pass` 重开任务分支；`withdraw`→`archived`；`submitCaseV2` 全函数（幂等重放、recovering、缺材料/缺必填）；`resolveAppealV2` 的 `entity` 返回旧对象语义；`hasOpen` 死代码。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 初审通过≠decided，终审才 final | 已证实 | `:115`、`:144-155`；测试 `:76-100` |
| 退回补件分支不建任务（注释与实现不一致） | 已证实 | `:162-168` 无任务创建；`:167` 注释称创建；回流在 `:270-275` |
| 判定值非法 fail-closed，status 不会被写成 undefined | 已证实 | `:250-255`；测试 `:182-189` |
| RUN-18 末笔 cancelled 也恢复并回流 | 已证实 | `:264-275`；测试 `:200-224` |
| RUN-19 材料归属/时效校验 | 已证实 | `:206-223`；测试 `:274-343` |
| 申诉限 teacher；更正=追加决定不改原判 | 已证实 | `:300-302`、`:312-317`；测试 `:476-492` |
| `basedOnRunId=run@revN` 合成占位 | 已证实 | `:134` |
| `hasOpen` 为死代码（`void hasOpen`） | 已证实 | `:331-333` |
| `ensureInitialTask` 只在 revision 0 可用 | 推断 | `:27` `expectedRevision:0` + `case-store-v2` CAS 语义 |
| `submitCaseV2` 幂等/recovering 分支行为 | 已证实（代码）/未知（测试） | `:363-369` |
| agent 代批开关排队期生效 | 已证实（代码） | `:52-58` 事务内读取 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `ensureInitialTask` | 3.1 | `:24-38` | covered（冲突分支未测） |
| `assertAgentDecisionAllowed` | 3.2、7 | `:52-58` | covered（开关分支未测） |
| `isFinalStage` | 3.2 | `:75-78` | covered |
| `recordStageDecision` | 3.2 | `:81-193` | covered |
| `respondSupplementV2` | 3.3 | `:198-235` | covered |
| `resolveSupplementV2` | 3.4 | `:238-291` | covered |
| `resolveAppealV2` | 3.5 | `:295-340` | covered |
| `resolveFinalDecisionProjection` | 3.6 | `:348-355` | covered |
| `submitCaseV2` | 3.7 | `:359-412` | partial（无直接测试） |
| item-* 重开 / withdraw | 3.2 | `:157-161`、`:184-186` | unknown（未测） |

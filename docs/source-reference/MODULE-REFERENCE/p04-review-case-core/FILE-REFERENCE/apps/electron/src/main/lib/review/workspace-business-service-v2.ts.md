---
path: apps/electron/src/main/lib/review/workspace-business-service-v2.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ee86d1e97ef6d4d9dac24e0743a75e6fc646a6d3
sha256: 64e31914bf91b2f8c39f1b1c26f65648cf991f86b5b7cb77b9ce646fdb9a1d99
lines: 377
kind: source
package: p04-review-case-core
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/workspace-business-service-v2.ts

## 1. 结论与边界

单案工作台的业务动作命令层：待办处置、事项最终认定、补件发起、材料人工核对、最终业务决定，全部经 `case-store-v2.submitCommand` 的 CAS 事务写入；并提供工作台与 T05 共用的运行新鲜度判定 `isWorkspaceRunStaleV2`。运行时模块，含聚合事务、运行账本读取与自动化代批门控。

不做的事：不实现聚合/幂等/冲突（`case-store-v2`）；不实现 Run 存储与输入哈希（`run-store-v2`/`run-service-v2`）；不实现补件回复/判定与阶段推进（`stage-workflow`）；不实现就绪评估算法（`@profer/shared` 的 `assessDecisionReadiness`）；不直接面向 IPC（调用方 `review-ipc` 绑定 actor）。

## 2. 导出与关键符号

导出 6 个 function、0 个导出类型。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `recordWorkspaceSubjectAdjudicationV2` | function | `:46-85` | `(caseId, command) => Promise<ReviewCommandResult<SubjectAdjudication>>` | 事项最终认定（accepted/rejected/modified） |
| `recordWorkspaceDispositionV2` | function | `:112-149` | `(caseId, command) => Promise<ReviewCommandResult<disposition>>` | 待办处置（6 态） |
| `openWorkspaceSupplementV2` | function | `:151-205` | `(caseId, command) => Promise<ReviewCommandResult<SupplementRequest>>` | 发起补件（含材料槽路径） |
| `acknowledgeWorkspaceMaterialV2` | function | `:207-232` | `(caseId, command) => Promise<ReviewCommandResult<document>>` | 人工检查/忽略材料 |
| `decideWorkspaceCaseV2` | function | `:274-355` | `(caseId, command) => Promise<ReviewCommandResult<BusinessDecision>>` | 最终业务决定 |
| `isWorkspaceRunStaleV2` | function | `:358-377` | `(aggregate, runId) => boolean` | 运行新鲜度（含顺序回退） |

内部类型：`WorkspaceDisposition`（`:12`，6 值）、`WorkspaceDecision`（`:13`）。

关键内部符号：

| 符号 | 行 | 作用 |
| --- | --- | --- |
| `hasSupplementResponseAfterRun` | `:15-20` | 补件回复时间 > run 完成时间 → 输入已变 |
| `currentSubjectAdjudications` | `:22-29` | 排除被 supersedes 的认定，按 subjectId 取当前 |
| `finalScoresFor` | `:31-44` | 从认定/人工确认观测/事项字段派生最终分数 |
| `assertCurrentRun` | `:87-110` | 运行有效性 + 输入哈希 + 补件时效 + 当前权威 Run 四重门 |
| `assertAutomatedWorkspaceDecision` | `:239-272` | agent/系统代批门控（批次自动化白名单） |

## 3. 内部逻辑与关键流程

### 3.1 运行有效性 `assertCurrentRun`（`:87-110`）

顺序执行，全部 fail-closed：

1. `currentSourceValidityBlockers(aggregate)` 非空 → `STALE_INPUT('存在已撤效或来源无法核验的当前事实/关联…')`（`:88-89`）。
2. `getRunV2(caseId, runId)` 不存在或 `inputManifest.hash !== inputHash` → `STALE_INPUT('审核运行已过期…')`（`:90-91`）。
3. `computeRunInputHash(caseV2, observations, evidenceLinks)` 与 `inputHash` 不等 → `STALE_INPUT('案卷输入已变化…')`（`:92-93`）。
4. `hasSupplementResponseAfterRun` → `STALE_INPUT('补件回复在审核运行后发生变化…')`（`:94`）。注意口径：开启补件请求不改输入，回复才算（`:17-18` 注释）。
5. **RUN-14 当前权威 Run**：`resolveCurrentBusinessRun({aggregate, runs: listRunsV2, stale: isWorkspaceRunStaleV2})`；无权威 run → `STALE_INPUT('当前没有可办理的权威审核运行…')`；`authority.run.id !== run.id` → `STALE_INPUT('只能针对当前轮审核运行 X 办理；旧运行 Y 为只读历史')`（`:98-108`）。判定复用 `review-runtime-contract`，不另立时间戳/可见性规则（`:95-97` 注释）。

### 3.2 事项认定 `recordWorkspaceSubjectAdjudicationV2`（`:46-85`）

handler 内：`assertCurrentRun`；run `status ∈ {completed, partially-completed}`（`:52`）；subject 存在（`:53-54`）；outcome ∈ `accepted/rejected/modified`（`:55`）；`reason` 非空（`:56`）；`modified` 必须带 `finalFields`（`:57`）；`finalFields` 的 key 必须在 `template.fields ∪ subject.fields` 内（懒取 `require('./template-store')`，`:58-63`）。
mutate（`:67-82`）：追加 `SubjectAdjudication`（`id=adj-${Date.now()}-…`、`basedOnRunId=run.id`、`inputHash=run.inputManifest.hash`、`at` 现在），同 subject 已有当前认定时记 `supersedesAdjudicationId`（`:64`、`:78`），只追加不改写历史。

### 3.3 处置 `recordWorkspaceDispositionV2`（`:112-149`）

- `findingKey` 必须命中本次 run 的 `checks`（`checkId`/`ruleId`）或 `opinions`（`id`/`checkId`），否则 `NOT_FOUND`（`:118-120`）。
- `reason` 非空、`disposition ∈ {confirmed-issue, human-confirmed-compliant, false-positive, supplement-requested, waived, escalated}`（`:121-124`）。
- mutate 追加记录（含 actor 三元组、runId、inputHash），中文 summary 按处置映射（`:125-146`）。

### 3.4 补件 `openWorkspaceSupplementV2`（`:151-205`）

- `findingKey` 形如 `material-slot:<id>` 时走材料槽分支（`:157-165`）：模板 `materialSlots` 必须有该槽（否则 `NOT_FOUND`）；`requiredAt` 必须是 `'decision'`（否则 `VALIDATION_FAILED`）；active 且绑定该槽的材料数 `>= minCount` → `INVALID_TRANSITION('已满足数量要求，无需补件')`。否则 finding 必须命中 run（`:166-168`）。
- `requiredElements` 去空白后非空 + `reason` 非空（`:170-171`）。
- mutate（`:174-202`）：建 `SupplementRequest`（`responsibleRole:'student'`、`status:'open'`、`documentVersionIdsAtRequest` = 当前全部版本 id）；`stage='awaiting-supplement'`；并追加一条 `supplement-requested` 处置（`:190-200`）。

### 3.5 材料核对 `acknowledgeWorkspaceMaterialV2`（`:207-232`）

- `documentVersionId` 必须命中 active 文档（`:212-213`）；`reason` 非空（`:214`）。
- mutate：`usage:'read'`；`action==='ignore'` → `unusedReason='[审核员忽略] …'`，`manualReadReceipt` 置 undefined；`action==='read'` → `manualReadReceipt={actorId,reason,at}`，`unusedReason` 置 undefined（`:218-228`）。

### 3.6 自动化代批门 `assertAutomatedWorkspaceDecision`（`:239-272`）

- `actor.actorSource==='agent'`：`settings.reviewAgentAutoApproval !== true` → `AGENT_DECISION_DISABLED('AI 代批未授权')`；通过即返回（通用 Agent 代批≠批次自动化，`:247-252`）。
- 非 system 直接放行（human 来源，`:253`）。
- system 来源：`actorId` 必须匹配 `^batch-auto:([^:]+):(\d+)$`（`:254-255`）；`readBatchStateV2(batchId)` 存在、模板存在、`batch.automation.revision === match[2]`（`:261-264`）；result 仅允许 `pass`/`return`（`:265-266`）；`checkAutoBatchAction(batch, aggregate, run, template, action, artifact?.observations ?? [])` 必须 `allowed`（`:267-269`）；`reason` 与 gate.reason 必须逐字相等，`return` 时 `requiredElements` 数组 JSON 相等（`:270-271`）。注释强调该检查在 `submitCommand` 串行 handler 内执行，排队期间禁用开关/改案卷即失败关闭（`:234-237`）。

### 3.7 最终决定 `decideWorkspaceCaseV2`（`:274-355`）

1. `d2RuntimePlan` → `AGENT_DECISION_DISABLED('D2 技术预审案卷不能形成正式批准…')`（`:280`）；`canonicalPlan` → `AGENT_DECISION_DISABLED('冻结 CanonicalPlan 案卷尚无受控真实 Run 定稿服务…')`（`:281-283`）。
2. `assertCurrentRun`；run 需 `completed/partially-completed`（`:284-285`）；`reason` 非空（`:286`）；`stage ∈ {decided, archived}` → `INVALID_TRANSITION('案卷已结束')`（`:287`）。
3. 自动化门（`:288`）。
4. `pass/partial-pass`（`:290-310`）：`assessDecisionReadiness({aggregate, run, runStale:false, template, observations: extractArtifact?.observations ?? []})` 不 ready → `DEPENDENCY_UNRESOLVED`（拼 blockers 文案）；有 subjects 时每个 subject 都必须有当前认定（`:302-305`）；`partial-pass` 还必须至少一项 `modified/rejected`（`:306-308`）。
5. `return` 必须有非空 `requiredElements` 与 `supplementReason`（`:311-313`）。
6. mutate（`:315-352`）：建 `BusinessDecision`（`scope:{kind:'case'}`、`finality:'final'`、`finalScores=finalScoresFor(...)`、`basedOnRunId=run.id`、`basedOnRevision`）；`return` → 追加 `SupplementRequest`（`originFindingKeys:[]`）+ `stage='awaiting-supplement'`；否则 `stage='decided'` 且 open 任务置 completed。

### 3.8 新鲜度 `isWorkspaceRunStaleV2`（`:358-377`）

- run 缺失或无 `inputManifest.hash` → true（`:359-360`）。
- `computeRunInputHash` 与记录哈希不符时，做**顺序回退**：用 `run.inputManifest.documentVersions` 的顺序重算一次；仅当集合大小/成员一致且按该顺序重算命中时视为不 stale（`:364-374`）——保护“投影重排不废除审核动作”的历史运行。
- 否则返回 `hasSupplementResponseAfterRun`（`:376`）。

### 3.9 派生 `finalScoresFor`（`:31-44`）

对每个有当前认定的 subject：`outcome==='rejected'` → `'0'`；否则分数取 `finalFields.declaredScore ?? finalFields.score ?? 手工确认的 declaredScore 观测（最新一条） ?? subject.fields.declaredScore ?? subject.fields.score`；非 number 丢弃该 subject 的分数项。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/**/*.{ts,tsx}`（排除测试）。

### 4.1 入向

| 调用者 | 位置 | 调用 |
| --- | --- | --- |
| IPC | `review-ipc.ts:712-714` `isWorkspaceRunStaleV2`；`:733-734` disposition；`:738-739` 补件；`:743-744` 材料核对；`:748-749` 决定；`:1032-1033` 认定（均经 `bindLocalReviewerCommand` 绑定 actor，`review-ipc-actor-guard.ts:46`） | 用户操作主入口 |
| 批次自动化 | `batch-automation-service.ts:15`（import）、`:75`、`:82` | `isWorkspaceRunStaleV2` + `decideWorkspaceCaseV2` |
| 批量组动作 | `batch-group-action-service.ts:16`、`:98`、`:221`、`:232`、`:236`、`:239` | 处置/补件/决定 + 新鲜度 |
| Pi 运行桥 | `review-pi-run-bridge.ts:20`、`:78` | `isWorkspaceRunStaleV2`（续交资格判定） |
| T05 主服务 | `review-v3-t05-main-service.ts:23`、`:167`、`:178`、`:366`、`:438` | `isWorkspaceRunStaleV2` |

### 4.2 出向

`@profer/shared.assessDecisionReadiness`（`:4`）、`case-store-v2.{CommandValidationError,submitCommand}`（`:6`）、`run-store-v2.{getRunV2,listRunsV2,readArtifact}`（`:7`）、`run-service-v2.computeRunInputHash`（`:8`）、`source-current-validity-v3.currentSourceValidityBlockers`（`:9`）、`review-runtime-contract.resolveCurrentBusinessRun`（`:10`）；懒加载 `require('./template-store')`、`require('../settings-service')`、`require('./batch-store')`、`require('./batch-automation-gates')`、`require('./run-store-v2')`（`:58`、`:248`、`:257-260`）。

### 4.3 链路

```
UI/批次自动化 → review-ipc / batch-* → 本文件命令函数
  → submitCommand（state.v2.json CAS 事务）
  → handler 内 assertCurrentRun / assertAutomatedWorkspaceDecision
  → mutate 追加 dispositions/adjudications/supplements/decisions 或改 documents
```

## 5. 数据 I/O、读写与副作用

- **读**：聚合（handler 快照）、Run 账本（`getRunV2/listRunsV2/readArtifact`）、模板、设置、批次状态。
- **写**：仅经 `submitCommand` 追加/修改聚合；无直接磁盘/网络。
- **副作用**：决定会终结 open 任务（`:349`）；补件把阶段推到 `awaiting-supplement` 并追加处置；材料核对写 `manualReadReceipt/unusedReason`。
- **幂等**：依赖 `case-store-v2` 的 requestId+payloadHash；本层不重复落笔。
- **并发**：全部校验在事务 handler 内做（排队期间的外部变化会被快照/authority 检查捕捉）；无锁。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 来源撤效/输入变化/补件回复/旧 Run | `:88-108` | `STALE_INPUT`（四类文案区分） |
| run 未完成 | `:52`、`:285` | `INVALID_TRANSITION` |
| outcome/disposition 非法 | `:55`、`:122-123` | `VALIDATION_FAILED` |
| finalFields 越界 | `:61-62` | `VALIDATION_FAILED` |
| finding 不存在 | `:120`、`:162`、`:168` | `NOT_FOUND` |
| 材料槽非 decision/已满足 | `:163`、`:165` | `VALIDATION_FAILED`/`INVALID_TRANSITION` |
| agent 代批未授权 | `:249`、`:255`、`:264`、`:266`、`:269` | `AGENT_DECISION_DISABLED` |
| 自动化理由/要素不一致 | `:270-271` | `VALIDATION_FAILED` |
| D2/CanonicalPlan 决定 | `:280`、`:283` | `AGENT_DECISION_DISABLED` |
| 就绪缺认定/未解释项 | `:301`、`:305`、`:307` | `DEPENDENCY_UNRESOLVED`/`VALIDATION_FAILED` |
| 案卷已结束 | `:287` | `INVALID_TRANSITION` |
| 取消/恢复 | 无 | 无 AbortSignal；失败不落部分业务数据（`case-store-v2` 事务语义） |

## 7. 权限与权威状态

- **actor 来源**：本文件不解析 sender；IPC 路径经 `bindLocalReviewerCommand`（`review-ipc-actor-guard.ts:46`）绑定本地审核 actor，批次自动化用 `batch-auto:<batchId>:<rev>` 系统 actor，agent 路径受 `reviewAgentAutoApproval` 开关门控（`:247-252`）。
- **角色边界**：事项认定/处置/补件/决定不检查 `actor.role`（handler 只看来源与自动化门）；补件责任角色固定 `student`（`:182`、`:340`）。角色级校验在 `stage-workflow` 的补件回复/判定与 T05 任务指派处。
- **权威状态**：Run 的 `inputManifest.hash` 与实时 `computeRunInputHash` 一致 + 当前权威 Run（`resolveCurrentBusinessRun`）才可办理；处置/认定记录绑定 `runId+inputHash`，换轮自动失效（`:264-268`、`:74-75`）。
- **业务/技术边界**：D2 与 CanonicalPlan 案卷不得形成正式批准（`:280-283`）。

## 8. 修改影响面

- 改 `assertCurrentRun` 门槛 → 影响 IPC 处置/认定/补件/决定、批量组动作、T05 资格判定（五类调用者）。
- 改 `isWorkspaceRunStaleV2` → 影响 Pi 续交（`review-pi-run-bridge.ts:78`）、T05、批次自动化的新鲜度口径。
- 改 `finalScoresFor` → 决定文书的分数；测试 `workspace-business-service-v2.test.ts:253-256` 直接断言。
- 改自动化门 → 批次自动处理的安全边界；`batch-automation-gates.checkAutoBatchAction` 契约联动。
- 需同步的测试：`workspace-business-service-v2.test.ts`（8 例）；`decision-readiness-v2.test.ts` 覆盖 `assessDecisionReadiness` 的阻断面。

## 9. 测试证据

本轮 `NOT_RUN`：未执行 `bun test`。直接测试 `workspace-business-service-v2.test.ts`（1 describe、**8 test**；夹具 `PROFER_CONFIG_DIR` 临时目录、`ensureTestTemplate` 自建 published 模板、`seed()` 建聚合+持久化 Run，`computeRunInputHash` 与案卷快照一致）：

1. `:54-83` RUN-14 两轮运行：旧 run 处置 → `STALE_INPUT` 且 message 含“当前轮审核运行”；新 run 处置成功；对旧 run 的认定 → `STALE_INPUT`。
2. `:85-113` 未处理检查直接决定 → `DEPENDENCY_UNRESOLVED`；`false-positive` 处置后决定成功：`stage==='decided'`、`result==='pass'`、`decisions.at(-1).basedOnRunId===run.id`。
3. `:115-134` `human-confirmed-compliant` 处置：entity.disposition 正确、summary 含“人工确认本项符合”。
4. `:136-148` 有未处理项仍可 `reject`：`result==='reject'`、`stage==='decided'`、reason 含“驳回”。
5. `:150-162` 输入变更后旧运行处置 → `STALE_INPUT`。
6. `:164-192` 补件不作废审核：开补件后 `stage==='awaiting-supplement'`、supplement `open`、首条 disposition `supplement-requested`、`isWorkspaceRunStaleV2===false`、`assessDecisionReadiness` 有 `open-supplement` blocker；另一待办仍可处置。
7. `:194-207` 补件回复后旧 run 过期：`isWorkspaceRunStaleV2===true`。
8. `:209-257` 认定历史+派生分数：两次认定 `supersedesAdjudicationId` 指向前者；`rejected` subject 分数 `'0'`、`modified` 取 `finalFields.declaredScore`；`partial-pass` 决定的 `finalScores` 精确等于 `[{subject-a,'4'},{subject-b,'0'}]`（均 `basisRunId=run.id`）。

**未覆盖**：`assertAutomatedWorkspaceDecision` 全分支（agent 开关、batch-auto 校验、理由一致性）；材料槽补件路径（`material-slot:` 前缀）；`acknowledgeWorkspaceMaterialV2` 的 read/ignore 形状；`openWorkspaceSupplementV2` 的 NOT_FOUND/INVALID_TRANSITION 分支；`finalScoresFor` 的手工确认观测回退链；`isWorkspaceRunStaleV2` 的顺序回退分支。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| RUN-14 只能对当前权威 Run 办理 | 已证实 | `:98-108`；测试 `:54-83` |
| 输入哈希/补件回复都会使 run 过期 | 已证实 | `:92-94`；测试 `:150-162`、`:194-207` |
| 处置/认定绑定 runId+inputHash | 已证实 | `:74-75`、`:141-142` |
| pass/partial-pass 需就绪 + 全认定；partial-pass 需 modified/rejected | 已证实 | `:290-309`；测试 `:209-257` |
| reject 不受就绪门限制（有理由即可） | 已证实 | `:290` 仅 pass 分支；测试 `:136-148` |
| D2/CanonicalPlan 禁止正式批准 | 已证实 | `:280-283` |
| 自动化门在事务内、理由/要素必须与 gate 一致 | 已证实 | `:234-271`（代码路径；测试未覆盖） |
| 分数回退链（finalFields→手工观测→subject） | 已证实（代码） | `:31-44`；测试只覆盖前两层 |
| `isWorkspaceRunStaleV2` 顺序回退 | 已证实（代码）/未知（实测） | `:364-374` |
| 补件“开请求不算输入变化、回复才算” | 已证实 | `:17-18` 注释 + `:15-20` 实现；测试 `:164-192`（开请求后 stale=false） |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `hasSupplementResponseAfterRun` | 3.1 | `:15-20` | covered |
| `currentSubjectAdjudications` | 3.2、3.9 | `:22-29` | covered |
| `finalScoresFor` | 3.9 | `:31-44` | covered（回退链 partial） |
| `recordWorkspaceSubjectAdjudicationV2` | 3.2 | `:46-85` | covered |
| `assertCurrentRun` | 3.1 | `:87-110` | covered |
| `recordWorkspaceDispositionV2` | 3.3 | `:112-149` | covered |
| `openWorkspaceSupplementV2` | 3.4 | `:151-205` | partial（材料槽分支未测） |
| `acknowledgeWorkspaceMaterialV2` | 3.5 | `:207-232` | partial（经 workspace-service 测试间接） |
| `assertAutomatedWorkspaceDecision` | 3.6 | `:239-272` | covered（代码）/unknown（测试） |
| `decideWorkspaceCaseV2` | 3.7 | `:274-355` | covered |
| `isWorkspaceRunStaleV2` | 3.8 | `:358-377` | covered（顺序回退未测） |

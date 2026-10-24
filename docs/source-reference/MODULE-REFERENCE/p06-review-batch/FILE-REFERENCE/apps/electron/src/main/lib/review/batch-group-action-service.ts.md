---
path: apps/electron/src/main/lib/review/batch-group-action-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6ff01b16a9df15c1e96c0e8a2ec84e494340f03c
sha256: 7dfeb43fd5777e47b0e450fe5d3f5edd6077868dce5b1ea5f95686349e49af78
lines: 264
kind: source
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/batch-group-action-service.ts

## 1. 结论与边界

B 切片“显式确认的逐案批量问题处置”（文件头 `:1-5`）：`previewBatchGroupAction` 只读预检（advisory），`applyBatchGroupAction` 把问题组的处置逐案路由到既有 V2 单案事务（处置/补件/决定）；不能授权自主 AI 决定，也不能冒充校方审批。带操作级持久回执（WAL、中断不重放）与预览指纹校验。运行时模块，含磁盘写（`review-batch-operations/`）与聚合/批次读写。

不做的事：不自己写业务数据（全部经 `workspace-business-service-v2`）；不定义分流（`@profer/shared.triageBatchCase/groupBatchIssues`）；不替代单案事务的二次校验（预检仅 advisory，`:162` 注释）。

## 2. 导出与关键符号

导出 2 个 function：`previewBatchGroupAction(request): BatchGroupPreview`（`:78-169`）、`applyBatchGroupAction(request): Promise<BatchGroupApplyResult>`（`:173-264`）。

内部符号：

| 符号 | 行 | 作用 |
| --- | --- | --- |
| `localReviewer` | `:18` | 固定 actor `local-batch-reviewer/local/reviewer` |
| `liveOperations` | `:19` | 同 `batchId:operationId` 防并发 |
| `DISPOSITION_MAP` | `:20-25` | confirm-issue→confirmed-issue、false-positive→false-positive、human-confirmed-compliant→human-confirmed-compliant、escalate→escalated |
| `digest` | `:27` | sha256(JSON) |
| `operationFile` | `:28-31` | `review-batch-operations/{digest([batchId,operationId])}.json`——用户 ID 不进路径 |
| `persist` | `:32-37` | 原子写 |
| `validateRequest` | `:39-56` | 请求形状校验 |
| `boundRun` | `:58-61` | BATCH-14：只读批次成员绑定 Run |
| `collect` | `:63-76` | 批次+triage 输入收集 |
| `PersistedOp` | `:171` | `{inputHash, result, completed}` |

## 3. 内部逻辑与关键流程

### 3.1 `validateRequest`（`:39-56`）

batchId/groupKey 非空；action ∈ 7 值（4 处置 + request-supplement/final-return/final-pass）；reason 非空 ≤2000；caseIds 数组 1..500、无空、无重复；`request-supplement`/`final-return` 必须给非空 `requiredElements`；要素 ≤30 条且每条 ≤200 字。

### 3.2 `previewBatchGroupAction`（`:78-169`）

`collect`（`:63-76`）：批次存在、非 finalized/running；逐案组 `BatchTriageInput`（entryStatus、caseStage、boundRun、batch）。`groupBatchIssues(inputs)` 按 `groupKey` 找问题组，缺失 → “问题组已失效”（`:81-82`）。

逐案 row（`:83-164`）依次校验，全部 fail-closed 记 `reason`：

1. 不在组/无聚合 → “不属于当前有效问题组或案卷缺失”（`:88`）。
2. 同案命中多项检查 → “请单案分别处理”（`:90`）。
3. 绑定 Run 缺失/与 occurrence 不符/`isWorkspaceRunStaleV2` → “案卷材料、事实或证明关联已变更，需要重新审核”（`:98-100`）。
4. 模板与批次锁不一致（`:101-103`）；模板未发布（`:104-105`）；模板无 reviewer 阶段 → “模板未授权本地 reviewer 执行人工处置”（`:106-108`）。
5. 他角色 open 任务 → “当前阶段由其他角色处理，不能代其决定”（`:109-111`）。
6. 案卷 `decided/archived/awaiting-supplement` → “案卷已结束或正在补件”（`:112-114`）。
7. 无来源/来源不属于本案或失效版本 → “此问题缺少可追溯来源…”/“引用了不属于本案的证据或失效材料版本”（`:115-119`）。
8. `triageBatchCase` route 不是 `manual-review`/`auto-return-candidate` → “本案当前不是需要处理的问题状态”（`:120-123`）。
9. 已有相同处置（`runId+inputHash` 匹配）→ “本项已有相同的人工处理记录”（`:124-128`）。
10. `request-supplement`/`final-return`（`:129-142`）：`final-return` 还要求恰 1 个终末阶段且 executorRole reviewer、多阶段时须有该阶段 open 任务（`:130-135`）；occurrence 须 `awaiting-supplement` 且 route `auto-return-candidate`（`:137-139`）；不得已有未结补件（`:140-142`）。
11. `final-pass`（`:143-159`）：终末阶段 reviewer（多阶段需 open 任务）（`:144-148`）；`assessDecisionReadiness`（runStale:false + artifact observations）必须 ready（`:149-153`）；所有 `non-compliant/awaiting-*` 检查须有 `false-positive/human-confirmed-compliant` 处置（绑定 runId+inputHash，`:154-159`）。
12. 通过 → `eligible:true`、reason“已通过当前只读预检；提交时仍由单案业务事务重新校验”（`:161-162`）。

输出 `previewHash = digest({batchId, action, groupKey, caseIds, reason, requiredElements, rows})`、`eligibleCount`、`advisoryOnly:true`（`:165-168`）。

### 3.3 `applyBatchGroupAction`（`:173-264`）

1. 校验：`confirmed===true`（“人工未明确确认批量处理范围”）、operationId 匹配 `^[A-Za-z0-9_-]{8,100}$`、previewHash 64 hex（`:175-177`）。
2. **幂等/恢复**（`:180-198`）：同 liveKey 并发拒绝；已有操作文件：`inputHash` 不同 → “操作 ID 已被不同载荷使用”；`!completed` → **不重放**（崩溃时最后一条可能已提交）——未处理的 case 补 `failed`（“批量操作中断，写入状态未确认；请核对案卷审计记录后重新预览处理”）并置 completed 后返回（`:185-196`）；已完成 → 直接返回持久结果。
3. **WAL**：重算 preview，与请求 `previewHash` 不符 → “预览后案卷或处理范围发生变化，请重新预览”（`:201-202`）；先落盘 `completed:false`（`:207-210`）。
4. **逐案**（`:211-258`）：不 eligible → `excluded`；重读聚合，revision 不符/Run stale/批次非 queued → `conflict`（“提交前案卷版本、输入或批次状态改变”，`:218-226`）；`requestId = batch-${digest([operationId, caseId, action, findingKey]).slice(0,36)}`（`:227`）；按动作路由：处置类 → `recordWorkspaceDispositionV2`（findingKey/disposition/reason/runId/inputHash）；`request-supplement` → `openWorkspaceSupplementV2`（requiredElements/reason）；`final-pass`/`final-return` → `decideWorkspaceCaseV2`（`result: pass|return`、basedOnRunId/inputHash，return 带 requiredElements+supplementReason）（`:231-244`）。成功 `applied`（消息“已通过现有 V2 单案事务保存”）；`VERSION_CONFLICT/STALE_INPUT/REQUEST_ID_COLLISION` → `conflict`，其它 → `failed`（`:245-252`）；异常 → `failed`（`:253-256`）；每案后落盘进度（`:257`）。
5. 结束落盘 `completed:true`（`:259`）；finally 释放 liveKey（`:261-263`）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/**/*.{ts,tsx}`、`packages/**/*.ts`（排除测试）。

| 调用者 | 位置 | 调用 |
| --- | --- | --- |
| IPC | `review-ipc.ts:1238` `previewBatchGroupAction`；`:1242` `applyBatchGroupAction` | 用户批量处置入口 |

出向：`case-store-v2.readAggregate`、`batch-store.{readBatchStateV2,readBoundRun}`、`run-store-v2.readArtifact`、`template-store.getTemplate`、`workspace-business-service-v2.{isWorkspaceRunStaleV2,decideWorkspaceCaseV2,openWorkspaceSupplementV2,recordWorkspaceDispositionV2}`、`@profer/shared.{assessDecisionReadiness,groupBatchIssues,triageBatchCase}`、`config-paths.getConfigDir`、`node:fs/crypto`。

## 5. 数据 I/O、读写与副作用

- **写**：`review-batch-operations/{digest}.json`（WAL 逐案进度 + 最终结果）；业务写全部经单案事务。
- **读**：聚合、批次、Run、模板、artifact。
- **副作用**：无日志/网络；`liveOperations` 进程内互斥。
- **幂等**：同 operationId+同载荷重放返回持久结果（`:182-197`）；中断不重放、转人工核对（`:186-196` 注释）。
- **并发**：同操作 liveKey 互斥；逐案写前重读聚合（“预览不是能力令牌”，`:218` 注释）。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 请求形状/确认/ID/指纹非法 | `:39-56/:175-177` | throw |
| 问题组失效 | `:82` | throw |
| 预检 11 类不合格 | `:88-159` | row `eligible:false`+reason |
| 操作 ID 载荷漂移 | `:184` | throw |
| 中断操作重放 | `:185-196` | 补 failed 标记后返回，不重放 |
| 预览指纹不符 | `:202` | throw |
| 提交前状态变化 | `:220-225` | conflict |
| 事务冲突/其它失败 | `:249-256` | conflict/failed |
| 取消/恢复 | 无 AbortSignal | 中断后靠 PersistedOp 人工核对（`:186-191`） |

## 7. 权限与权威状态

- **actor**：固定 `local-batch-reviewer`（`:18`）；`confirmed:true` 是人工确认痕迹（`:175`）；模板须有 reviewer 阶段且无他角色待办（`:106-111`）——不代其他角色决定。
- **权威状态**：预检 advisory（`:162`、`:168`），写入由单案事务二次校验；处置绑定 `runId+inputHash`（`:233-234`）；最终通过/退回复用 `decideWorkspaceCaseV2` 的全部门槛（含 `assessDecisionReadiness`）。
- **边界**：无自主 AI 决定、无校方审批（文件头）。

## 8. 修改影响面

- 改预检/路由 → 影响 IPC 批量处置；测试 `batch-group-action-service.test.ts` 10 例。
- 改操作回执持久化 → 崩溃恢复语义；测试 `:227-239`（载荷漂移）。
- 改 `DISPOSITION_MAP` → 联动 `workspace-business-service-v2` 的 6 值处置枚举。
- 需同步：`batch-group-action-service.test.ts`。

## 9. 测试证据

本轮 `NOT_RUN`：未执行 `bun test`。直接测试 `batch-group-action-service.test.ts`（1 describe、**10 test**；夹具真实模板 `batch-b-test`、`saveRunV2`+绑定、`PROFER_CONFIG_DIR` 临时目录）：

1. `:87-103` 双案 confirm-issue：预检 `eligibleCount=2`、apply `applied=2`、两案 `dispositions.at(-1)==='confirmed-issue'`；同操作重放结果相同（幂等）且 dispositions 仍各 1。
2. `:105-115` 范围精确：单案 escalate 只影响该案（另案 dispositions 0）。
3. `:117-128` 无来源案卷单独排除（row reason 含“来源”）、`excluded=1`、另一案照常。
4. `:130-144` 预览后案卷被改 → apply 抛“预览后…”，无写入。
5. `:146-160` request-supplement：`stage:'awaiting-supplement'`、要素含“原始获奖等级证明”、首条处置 `supplement-requested`。
6. `:162-169` 已发现不符合不允许 final-pass（eligibleCount 0、reason 含“阻断”）。
7. `:171-190` false-positive 解除后 final-pass 通过：`decided`+`result:'pass'`+actor `local`。
8. `:192-206` final-return：`result:'return'`、`awaiting-supplement`、要素保留。
9. `:208-225` 教师 open 任务存在时 reviewer 不能批量处置（reason 含“其他角色”）。
10. `:227-239` 未确认拒绝、同 ID 异载荷“不同载荷”、外案 caseIds 预检不抛但 eligible 0。

**未覆盖**：`final-return` 的终末阶段/角色前置拒绝分支（`:130-135`）；“问题组失效” throw；`REQUEST_ID_COLLISION` conflict 映射；中断恢复分支（`:185-196`）；要素上限校验。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 预检只读 advisory、写入经单案事务 | 已证实 | `:162/:168`、`:231-244`；测试 1/7 |
| 范围精确生效，不碰组外案卷 | 已证实 | 测试 2 |
| 无来源案卷单独排除 | 已证实 | `:115-119`；测试 3 |
| 预览指纹变化拒整次提交 | 已证实 | `:202`；测试 4 |
| 同操作幂等、异载荷拒绝 | 已证实 | `:182-184`；测试 1/10 |
| 他角色待办禁止代决 | 已证实 | `:109-111`；测试 9 |
| final-pass 需人工解除+就绪 | 已证实 | `:143-159`；测试 6/7 |
| 中断不重放、转人工核对 | 已证实（代码）/未知（测试） | `:185-196` |
| 处置绑定 runId+inputHash | 已证实 | `:233-234` |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `validateRequest` | 3.1 | `:39-56` | covered（部分） |
| `previewBatchGroupAction` 11 类预检 | 3.2 | `:88-159` | covered |
| `final-return`/`final-pass` 前置 | 3.2 | `:130-159` | partial |
| `applyBatchGroupAction` WAL/幂等/中断 | 3.3 | `:173-210` | covered |
| 逐案路由与冲突映射 | 3.3 | `:211-258` | covered |
| 中断恢复分支 | 6 | `:185-196` | unknown |

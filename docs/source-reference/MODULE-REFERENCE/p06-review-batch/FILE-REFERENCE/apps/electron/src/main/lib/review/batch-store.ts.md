---
path: apps/electron/src/main/lib/review/batch-store.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: fe16f998161f205ecbe5451f216e14c99b4f5fe6
sha256: ce46e44ec9688b80cfb338ba82003886fba8359baa8234f8a852310b33392ff7
lines: 714
kind: source
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/batch-store.ts

## 1. 结论与边界

批次的持久存储与生命周期（文件头 `:1-8`）：`review-batches/{batchId}/batch.json` 的创建/锁定/队列/定稿/重开；Main 侧建批门禁（逐案核模板与政策锁）；批次成员运行绑定（BATCH-01/03/04 同案租约与 entryRunId）；真实队列执行 `runBatchQueue`；中断恢复与定向重试；以及持久 outbox（`sync-outbox/{actionId}.json`，R11 重启幂等、WAL 先落盘再推端口）。运行时模块，含磁盘 I/O、原子写与进程内互斥集合。

不做的事：不做审核业务本身（由注入的 `runCase`/单案服务完成）；不做正式业务决定（定稿只冻结既有决定的快照）；不实现学校端口（`external-ports`）；不解析/校验推送载荷业务语义（只校验形状与哈希）。

## 2. 导出与关键符号

导出 29 项（function 26、interface/type 3）：

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `assertSafeBatchId` | `:25-30` | 批次 ID 防路径穿越白名单（字母数字开头，`[A-Za-z0-9._-]{0,127}`，禁 `..`） |
| `saveBatchStateV2` | `:47-54` | 原子写 batch.json（tmp+rename），写前逐 caseId 校验 |
| `readBatchStateV2` | `:56-68` | 读并校验 `batch.id` 匹配、数组形状、成员 ID 合法；损坏返回 undefined |
| `listBatchStatesV2` | `:71-81` | 列目录（逐 id 校验后读），按 `createdAt` 倒序 |
| `resolvePolicyVersionLock` | `:88-108` | 政策锁解析：`policyRefs` 权威；仅 `policyVersionIds` 的旧模板**拒绝建批**（不臆造 v1） |
| `assertBatchMembersForCreation` | `:118-145` | BATCH-09 建批门禁：模板 published、政策锁一致、逐案模板版本一致 |
| `createBatchV2Validated` | `:148-151` | 产品入口（门禁后建批） |
| `createBatchV2` | `:154-163` | 低层建批（夹具/事务用）；status `draft`、cases 全 `queued`、round 1 |
| `configureBatchAutomation` | `:166-190` | 自动化授权（mode 3 值；auto-approve 需全局开关+模板 `autoPassPolicy.enabled`） |
| `requeueCaseAfterSupplement` | `:193-211` | 补件闭环后把案卷重新入队（模板版本匹配的非定稿/非运行批次） |
| `updateCaseStatus` | `:214-222` | 单案状态/错误（定稿拒改） |
| `assertBatchBusinessReadyForFinalization` | `:229-270` | 定稿业务门（见 §3.4） |
| `finalizeBatch` | `:273-291` | 冻结快照 hash + 原子提交 manifest |
| `readFinalizedSnapshot` | `:294-306` | 读定稿快照并双 hash 校验 |
| `reopenBatch` | `:309-325` | 重开=新批次新轮次（不改写定稿） |
| `assertSafeOutboxActionId` | `:330-335` | outbox actionId 同类白名单 |
| `OutboxEntry` | `:342-351` | outbox 记录形状（payload/payloadHash/status/receipt/attempts） |
| `pushViaOutbox` | `:403-451` | 推送+幂等+WAL |
| `OutboxRecoveryReport` | `:453-458` | 恢复报告（recovered/needsManualReplay/skippedActive） |
| `recoverPendingPushesDetailed` | `:461-502` | 恢复扫描（只重放哈希校验过的原载荷） |
| `recoverPendingPushes` | `:505-507` | 兼容 API（只要 recovered） |
| `recoverInterruptedBatch` | `:518-547` | 中断恢复（BATCH-11 先核持久 Run） |
| `retryBatchCases` | `:553-585` | 定向重试（仅 failed/paused，或技术异常 done） |
| `activeCaseRunOwner` | `:594-596` | 查询同案租约占用者 |
| `acquireCaseRunLease` | `:599-612` | BATCH-03 同案运行租约（返回释放函数，防重复获取） |
| `readBoundRun` | `:615-620` | 读成员绑定 Run（无绑定/跨案返回 undefined，调用方 fail closed） |
| `persistCaseBinding` | `:626-631` | 写成员运行绑定（绑定即持久化） |
| `BatchQueueOptions` | `:633-636` | `runCase` 注入（产品层由 buildReviewExecutors 提供） |
| `runBatchQueue` | `:645-702` | 批次队列执行 |
| `resolveAttemptRun`（内部） | `:705-714` | 绑定本次尝试的 Run：优先执行器 runId，否则取尝试开始后启动的最新 Run |

## 3. 内部逻辑与关键流程

### 3.1 ID 安全边界（`:25-39`、`:330-340`）

`assertSafeBatchId`/`assertSafeOutboxActionId` 是读/写/重开/定稿共用的唯一 fail-closed 边界；`batchDir`/`outboxPath` 全部经其构造，用户可控 ID 永不直接成为路径组件（`:22-24`、`:329` 注释）。

### 3.2 政策锁与建批门禁（`:88-151`）

- `resolvePolicyVersionLock`：`policyRefs` 有值时逐个校验 `policyId` 非空、version 安全整数 ≥1、无重复（`:92-101`）；`refs` 空但 `policyVersionIds` 非空 → 抛“无法建立批次政策锁；请重新发布模板”（`:103-106`）；两者都空 → 空锁（`:107`）。
- `assertBatchMembersForCreation`（BATCH-09）：ID/成员/模板版本先校验（`:119-125`）；模板须 published（`:129-131`）；`canonicalLock`（排序后 JSON 比较，`:110-112`）比对锁一致性（`:132-135`）；逐案读聚合核模板 id/version，不一致汇总后整批拒绝（`:136-144`）。UI 过滤不是权威（`:115-116` 注释）。

### 3.3 自动化授权 `configureBatchAutomation`（`:166-190`）

mode 白名单 `assist/auto-return/auto-approve`；`running/finalized` 或执行中拒绝改授权（`:170-172`）；非 assist 需 `confirmed===true`（`:173`）；`auto-approve` 还需全局 `reviewAgentAutoApproval===true` 且模板 published + `autoPassPolicy.enabled===true`（`:174-181`）。写入 `{mode, grantedBy:'local-reviewer', grantedAt, revision+1, templateId/Version}`（`:183-187`）——渲染层不提供 actor 身份（`:165` 注释）。

### 3.4 定稿业务门 `assertBatchBusinessReadyForFinalization`（`:229-270`）

全批 `done`（`:232`）；逐案：聚合存在、无未结补件、stage ∈ {decided, archived}、模板版本匹配批次锁、无待处理申诉、无 open 任务（`:233-250`）；`resolveFinalDecisionProjection` 必须有 `isFinal` 决定（`:251-254`）；**BATCH-04**：必须有 `entryRunId`、`bindingState !== 'recovery-required'`、绑定 Run 存在且属于本案、`decision.basedOnRunId === entryRunId`（`:255-268`）——其他轮次的审核成果不得计入本批。

### 3.5 定稿/重开（`:273-325`）

`finalizeBatch`：快照 hash；已定稿且 hash 相同 → 幂等返回，不同 → “需重开新轮次”（`:277-280`）；运行中拒绝（`:281-282`）；过业务门后**先写完整快照** `finalized-r{round}.json` 再提交状态（`:284-289`，注释：只有 hash 无法还原名单/评分）。`readFinalizedSnapshot` 双 hash 校验（文件 hash 与 state hash 都相等才返回，`:300-302`）。`reopenBatch`：仅 finalized 可重开、新 ID 不得已存在（`:313-314`）；新批次 round+1、cases 重置 queued、记 `reopenedFromBatchId`（`:315-321`）；原定稿不改写。

### 3.6 outbox 推送 `pushViaOutbox`（`:403-451`）

1. 载荷形状校验 `assertOutboxPayload`（actionId/caseId/actionKind 4 值/baseExternalRevision/body 对象，`:355-363`）；同 actionId 并发拒绝（`:406`）。
2. 已有记录：载荷 hash 不同 → “已被不同载荷使用”（`:412`）；终态回执永久幂等直接返回（`:413`）；pending 但持久化载荷校验失败 → 拒绝重放（`:414-416`）。
3. **WAL**：先写原载荷+hash（`:427-428`）再调 `port.push`；回执校验 actionId/caseId 匹配与 status 4 值（`:430-434`）；`awaiting-receipt` 不是终态 → 保持 pending 复用同一 actionId 重试（`:435-437`）；端口异常 → pending+清回执（远端可能已接受，靠端口幂等，`:439-445`）。

### 3.7 恢复 `recoverPendingPushesDetailed`（`:461-502`）

扫描 `sync-outbox/*.json`：文件名/内部 id 不匹配、损坏 → `needsManualReplay`（`:467-478`）；非 pending 跳过；本进程活跃 → `skippedActive`（`:479-483`）；`storedOutboxPayload` 校验（形状+actionId+payloadHash，`:365-375`）失败：有载荷→“校验失败，禁止恢复”，无载荷→“旧版 pending 未保存原始载荷；必须…由原调用方提供载荷”（`:484-492`）；通过则 `pushViaOutbox(port, payload)` 重放（`:493`）。**绝不合成替代载荷**（`:460` 注释）。

### 3.8 中断恢复/重试/租约/队列（`:518-702`）

- `recoverInterruptedBatch`：finalized/本进程活跃拒绝（`:521-522`）；无中断项拒绝（`:523-525`）；BATCH-11：running 成员先核持久 Run——completed→`done`（error 记“已按持久运行…认领”）、failed/cancelled→`failed`+bound、缺失→`failed`+`recovery-required`（`:527-543`）；批次回 `queued`。
- `retryBatchCases`：仅 failed/paused 可重试；done 需 `triageBatchCase` 判 `technical-exception` 才可（`:562-577`）；重试清绑定（entryRunId/inputHash/planFingerprint→undefined、bindingState `unbound`）但旧 Run 留历史（`:578-582`）。
- `acquireCaseRunLease`：同 owner 可重入、异 owner 抛“拒绝重复启动”（`:601-604`）；释放函数幂等（`:607-611`）。
- `runBatchQueue`：finalized 拒绝（需重开）；执行中/重复启动拒绝（`:648-649`）；**必须注入 `runCase`**，不隐式默认执行器（`:650`）；queued 为空/租约冲突拒绝（`:651-656`）；逐案：acquire 租约→置 running→清绑定+`attemptCount+1`→执行→`resolveAttemptRun` 绑定（无 runId 时只认 `startedAt` 之后启动的 Run，`:705-714`）→ 绑定成功记 `bound`、失败记 `recovery-required`；单案失败记录 error 继续（`:688-690`）；结束批次回 `queued`（“执行完不是正式通过”，`:696`）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/**/*.{ts,tsx}`、`packages/**/*.ts`（排除测试）。

| 调用者 | 位置 | 调用 |
| --- | --- | --- |
| IPC | `review-ipc.ts:95/:1207` `listBatchStatesV2`；`:795/:1084/:1203` `readBatchStateV2`；`:1072` `runBatchQueue`；`:1198` `createBatchV2Validated`；`:1212` `reopenBatch/retryBatchCases/recoverInterruptedBatch`；`:1220` `configureBatchAutomation`；`:368/:1065` `pushViaOutbox`（经 `external-ports`） | 批次管理入口 |
| 自动化服务 | `batch-automation-service.ts:11` | `readBatchStateV2/saveBatchStateV2/finalizeBatch/assertBatchBusinessReadyForFinalization/readBoundRun` |
| 组动作服务 | `batch-group-action-service.ts:13` | `readBatchStateV2/readBoundRun` |
| 阶段工作流 | `stage-workflow.ts:287` | `requeueCaseAfterSupplement` |
| 工作台业务 | `workspace-business-service-v2.ts:257` | `readBatchStateV2`（batch-auto 校验） |
| T07 | `review-v3-t07-main-service.ts:12`、`review-v3-t07-state-store.ts:16` | `readBatchStateV2`、`assertSafeBatchId` |
| T06 | `review-v3-t06-main-service.ts:25` | `createBatchV2Validated/readBatchStateV2/resolvePolicyVersionLock` |

出向：`node:fs`/`node:crypto`/`node:path`、`@profer/shared.triageBatchCase`、`config-paths.getConfigDir`、`review-storage-id.assertSafeReviewStorageId`、懒取 `case-store-v2`/`template-store`/`run-store-v2`/`stage-workflow`/`settings-service`、类型 `external-ports`。

## 5. 数据 I/O、读写与副作用

- **磁盘**：`review-batches/{id}/batch.json`（原子写 `:41-45`）、`finalized-r{round}.json`（`:285`）、`sync-outbox/{actionId}.json`（WAL 双写 `:428/:446`）。
- **进程内状态**：`activeOutboxActions`（`:353`）、`activeBatchRuns`（`:512`）、`activeCaseRuns` 租约 Map（`:592`）——仅本 Electron Main 进程有效（`:511` 注释）。
- **副作用**：`reopenBatch` 打 console.log（`:323`）；outbox 失败 `console.warn`（`:444`）。
- **幂等**：finalize 同 hash 幂等（`:278`）；outbox 终态回执永久幂等（`:413`）；重试/恢复不重复建 Run。
- **并发**：同案租约 + 批次 activeBatchRuns 集合 + outbox actionId 集合，均为进程内；跨进程互斥不在本文件（T06 账本有 ownerPid 兜底）。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 非法批次 ID/actionId/caseId | `:25-30/:330-335/:48` | 抛 Error，fail closed |
| 政策锁缺失/冲突 | `:95-105/:133-135` | 抛 Error，不建批 |
| 成员模板不符 | `:140-144` | 整批拒绝 |
| auto-approve 缺全局授权/模板许可 | `:176/:179-180` | 抛 Error |
| 定稿未完成/待补件/申诉/open 任务/绑定不符 | `:232-268` | 抛 Error，状态不动 |
| 重复定稿（hash 同/异） | `:277-280` | 幂等返回 / 抛“重开” |
| outbox 载荷漂移/校验失败 | `:412/:415/:433` | 抛 Error |
| 端口失败/awaiting-receipt | `:437/:442-444` | pending 保留原载荷，可重试 |
| 恢复遇损坏/旧版/篡改 | `:472-492` | needsManualReplay（不发送） |
| 中断恢复 | `:518-547` | 按持久 Run 认领/失败，不静默重跑 |
| 队列单案失败 | `:688-690` | 记 error 继续 |
| 取消 | 无 | 无 AbortSignal；端口调用不可撤回 |
| 重启恢复 | outbox/定稿/中断恢复 | 见 §3.7/§3.8；进程内集合重启即失 |

## 7. 权限与权威状态

- **无权限分支**：本文件不接 actor/sender；自动化授权由 `configureBatchAutomation` 固定 `grantedBy:'local-reviewer'`（`:184`），执行身份由下游单案事务决定。
- **权威状态**：`batch.json`（批次状态机）、`finalized-r{round}.json`（定稿快照）、`sync-outbox/*.json`（外部动作回执）；定稿 hash 双向校验（`:276/:301-302`）。
- **BATCH-04 边界**：定稿只认“本批次绑定 Run”上的最终决定（`:255-268`）；`done` 只是运行完成、不是正式批准（`:225-227` 注释）。

## 8. 修改影响面

- 改定稿门 → 影响 `batch-automation-service.finalizeCompletedBatch` 与 IPC 定稿；测试 `batch-store.test.ts` 9 个 R08 用例直接断言。
- 改 outbox WAL/幂等 → 影响 `review-ipc` 推送与恢复；测试 7 个 outbox 用例。
- 改租约/队列 → 影响 T06 建批、自动化、组动作；测试“批次绑定与同案互斥”“批次队列执行”8 用例。
- 改 ID 白名单 → 所有读写入口；测试 11 个恶意 ID 断言。
- 需同步的测试：`batch-store.test.ts`（34 例）、`batch-automation-service.test.ts`（用 runBatchQueue/定稿）。

## 9. 测试证据

本轮 `NOT_RUN`：未执行 `bun test`。直接测试 `batch-store.test.ts`（7 describe、**33 test**；夹具 `PROFER_CONFIG_DIR` 临时目录、`seedRunSync`/`markDoneWithBinding`/`seedFinalCase` 造真实 Run 与聚合）：

- 批次状态机（R08，9）：目录倒序 `:89-94`；未完成拒定稿+空案卷拒建（`:96-107`）；单案失败独立（`:108-116`）；定稿快照 hash 锁定+重开新轮次+原定稿不改写（`:118-136`）；无决定/仅 stage/待补件/待申诉拒定稿（`:138-166`）；11 个恶意 ID 创建/读/重开均拒（`:168-180`）；运行中拒定稿（`:182-186`）。
- 中断恢复/定向重试（7）：running→failed 待人工、其它不变（`:190-207`）；BATCH-11 认领 done/缺失 recovery-required（`:209-225`）；定向重试只跑选中（`:227-238`）；done 缺账本可重试（`:240-246`）；done 有效拒绝重试（`:248-267`）；非失败/非法/重复先拒不落盘（`:269-277`）；活跃执行拒恢复/重试（`:279-292`）。
- 持久 outbox（3）：重放返回原回执不重试（`:296-304`）；conflict 持久化（`:306-315`）；异载荷拒绝（`:317-321`）。
- Outbox 恢复/WAL（5）：失败后重启重放原载荷并终态（`:325-360`）；旧版 pending 不发占位载荷、原调用方显式重放（`:362-390`）；篡改数据不发端口（`:392-412`）；awaiting-receipt 保持 pending 复用 actionId（`:414-433`）；恶意 actionId+并发拒绝（`:435-464`）。
- outbox 发送前持久化（1，复查 §5.5）：发送前 pending 已落盘（`:571-585`）。
- 绑定/互斥（3）：决定依据其他轮次拒定稿（`:468-474`）；同案两批次并发第二个拒止（`:476-492`）；assist 批次统一定稿快照记 entryRunId/runId（`:494-507`）。
- 队列执行（5）：坏案不阻塞（`:511-527`）；定稿拒执行（`:529-537`）；缺 runCase 拒绝且不遗留 running（`:539-548`）；重复启动防并发双跑（`:550-568`）。

**未覆盖**：`resolvePolicyVersionLock` 的三条分支（本文件无直接测试；`review-v3-t06-main-service.test.ts:386-404` 间接覆盖“政策锁不一致”）；`configureBatchAutomation` 本文件无直接测试（`batch-automation-service.test.ts:112-120` 间接覆盖）；`assertSafeReviewStorageId` 外部实现；跨进程并发。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| ID 白名单 fail-closed（11 恶意样本） | 已证实 | `:25-30`；测试 `:168-180`、`:435-440` |
| 定稿=快照 hash 锁定，重开=新批次新轮次 | 已证实 | `:273-325`；测试 `:118-136` |
| BATCH-04 绑定运行一致性门 | 已证实 | `:255-268`；测试 `:468-474` |
| done≠正式批准，定稿核活聚合终态 | 已证实 | `:225-253`；测试 `:138-166` |
| outbox WAL 先落盘+幂等+不发伪造数据 | 已证实 | `:427-446/:365-375`；测试 `:325-433`、`:392-412` |
| 中断恢复先核持久 Run，不静默重跑 | 已证实 | `:527-543`；测试 `:190-225` |
| 同案租约拒绝并发第二批次 | 已证实 | `:599-612`；测试 `:476-492` |
| 队列单案失败不阻塞全批 | 已证实 | `:688-690`；测试 `:511-527` |
| 政策锁“旧模板拒建批”分支 | 已证实（代码）/间接（测试） | `:103-106` |
| 跨进程互斥缺失（仅进程内集合） | 已证实 | `:511` 注释；未实现 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| ID 安全边界 | 3.1 | `:25-30/:330-335` | covered |
| `resolvePolicyVersionLock` | 3.2 | `:88-108` | partial（间接） |
| 建批门禁/`createBatchV2*` | 3.2 | `:118-163` | covered |
| `configureBatchAutomation` | 3.3 | `:166-190` | partial（间接） |
| `requeueCaseAfterSupplement` | 2 | `:193-211` | covered（nb-08/25 测试间接） |
| `updateCaseStatus` | 2 | `:214-222` | covered |
| 定稿门/`finalizeBatch`/`readFinalizedSnapshot`/`reopenBatch` | 3.4/3.5 | `:229-325` | covered |
| outbox 推送/恢复 | 3.6/3.7 | `:403-502` | covered |
| `recoverInterruptedBatch`/`retryBatchCases` | 3.8 | `:518-585` | covered |
| 租约/`runBatchQueue`/`resolveAttemptRun` | 3.8 | `:592-714` | covered |

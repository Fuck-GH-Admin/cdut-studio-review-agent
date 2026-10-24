---
path: apps/electron/src/main/lib/review/batch-automation-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 06de76ad2cb9feb8e488cb8d21549a460c96b790
sha256: 75060521577a2d6bd95b635c8bfe12a27a70c66efa7f4b68b50e5215786bbb95
lines: 148
kind: source
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/batch-automation-service.ts

## 1. 结论与边界

显式授权的批次自动化执行器（文件头 `:1-6`）：先跑检查，只对完全通过 `checkAutoBatchAction` 门的候选经既有 V2 单案事务办理；无自主最终驳回、无模糊分组、不冒充校方、无跨案决定、无配额/评级捷径。另有统一定稿器 `finalizeCompletedBatch`（BATCH-02：assist/自动补件/自动通过共用同一业务门禁）。运行时模块，含批次读写、Run/artifact 查询与单案事务调用。

不做的事：不自己做业务决定（走 `decideWorkspaceCaseV2`）；不做资格判断细节（`batch-automation-gates`）；不定义定稿门（`batch-store.assertBatchBusinessReadyForFinalization`）；不实现 Run 绑定（`batch-store.readBoundRun`）。

## 2. 导出与关键符号

导出 2 个 function：

| 符号 | 行 | 签名/说明 |
| --- | --- | --- |
| `runBatchAutomation` | `:36-117` | `(batchId) => Promise<BatchAutomationReport>` 逐案自动化 |
| `finalizeCompletedBatch` | `:123-148` | `(batchId) => BatchStateV2` 统一定稿 |

内部：`activeAutomation` Set（`:17`，同批次防并发）；`boundRun(entry)`（`:22-24`，转 `readBoundRun`，缺绑定 fail closed，`:19-21` 注释 BATCH-01/14）；`stableId(parts)`（`:25-27`，sha256 截 44 位）；`appendReceipt(batchId, receipt, expectedPolicyRevision)`（`:28-34`，回执幂等去重——同 requestId+status 不重复，且 automation.revision 变化后不再追加）。

## 3. 内部逻辑与关键流程

### 3.1 `runBatchAutomation`（`:36-117`）

1. **互斥**：`activeAutomation` 已含批次 → “当前批次自动化处理正在进行”（`:37`）。
2. **批次前置**：批次存在；`status==='queued'`（“只有已完成运行队列的批次可以自动处理”，`:42`）；automation 配置存在且非 `assist`（`:44`）；记录 `revision`（`:45`）。
3. **绑定预检**（`:46-49`）：任何 `done` 成员缺 `entryRunId` → 整批 throw“请重新执行本批次后再自动处理”（fail closed）。
4. **逐案循环**（`:51-106`）：跳过非 done；每轮重读批次状态，若不再是 queued/revision 变化/改回 assist → `break`（`:53-55`）；聚合与 boundRun 缺失或案卷 `decided/archived/awaiting-supplement` → skip（`:56-59`）；`triageBatchCase` 定 route：`auto-pass-candidate` 且 mode `auto-approve` → `pass`；`auto-return-candidate` → `return`；否则 skip（`:60-66`）。
5. **请求身份**（`:67-71`）：`requestId = batch-auto-${stableId([batchId, caseId, runId, action, revision])}`；actor = `batch-auto:{encoded batchId}:{revision}`（`actorSource:'system'`、`role:'reviewer'`）。
6. **门与事务**（`:73-98`）：`getTemplate` 缺失或 `isWorkspaceRunStaleV2` → failed 回执“当前案卷输入或补件回复已经变化，请重新审核”（`:74-75`）；`readArtifact('node-auto-check-extract')` 取 observations 过门（`:76-77`）；门拒绝 → `blocked` 回执（`:78-80`）；通过 → `decideWorkspaceCaseV2`（payload 带 `result:action`、`reason:gate.reason`、`basedOnRunId`、`inputHash`；return 另带 `requiredElements/supplementReason`，`:82-88`）；成功 `applied`（消息记业务回执 requestId）、`VERSION_CONFLICT/STALE_INPUT` → `conflict`、其它失败码 → `blocked`（`:89-97`）；异常 → `failed`（`:99-103`）。
7. **回执与汇总**（`:104-113`）：`appendReceipt`（revision 防陈旧追加）；返回 `{applied/blocked/failed/conflicts}` 计数。

### 3.2 `finalizeCompletedBatch`（`:123-148`）

1. 状态须 `queued`（“批次状态不允许定稿（需先完成运行队列）”，`:125`）。
2. `assertBatchBusinessReadyForFinalization(state)`——权威共享门，不能经裸 `finalize` IPC 绕过（`:126-128`）。
3. 逐成员生成审计快照决策（`:130-141`）：聚合须 `decided/archived` 且无未结补件（`:132-134`）；`resolveFinalDecisionProjection` 必须有 final 决定（`:135-137`）；记录 `{caseId, entryRunId, inputHash, planFingerprint, decisionId, result, runId:final.basedOnRunId, basedOnRevision, actor}`（BATCH-04：只记本批次绑定运行与决定，`:138`）。
4. `finalizeBatch(batchId, {kind:'audited-batch', round, templateId/Version, policyVersions, automation, decisions})`（`:143-147`）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/**/*.{ts,tsx}`、`packages/**/*.ts`（排除测试）。

| 调用者 | 位置 | 调用 |
| --- | --- | --- |
| IPC | `review-ipc.ts:1081/:1232` `runBatchAutomation`；`:1225` `finalizeCompletedBatch` | 用户触发入口 |
| 测试 | `batch-automation-service.test.ts:11` 等 | 直接调用 |

出向：`case-store-v2.readAggregate`（`:10`）、`batch-store`（`:11`：read/save/finalize/assertBatchBusinessReadyForFinalization/readBoundRun）、`batch-automation-gates.checkAutoBatchAction`（`:12`）、`run-store-v2.readArtifact`（`:13`）、`template-store.getTemplate`（`:14`）、`workspace-business-service-v2.{decideWorkspaceCaseV2,isWorkspaceRunStaleV2}`（`:15`）、懒取 `stage-workflow.resolveFinalDecisionProjection`（`:129`）、`@profer/shared.triageBatchCase`（`:8`）。

链路：IPC → `runBatchAutomation` → per-case `triageBatchCase` + `checkAutoBatchAction` → `decideWorkspaceCaseV2`（内含 `assertAutomatedWorkspaceDecision` 事务内复核 `batch-auto:*` actor）→ 聚合决定；`finalizeCompletedBatch` → 共享定稿门 → `finalizeBatch` 快照。

## 5. 数据 I/O、读写与副作用

- **读**：batch.json、聚合、Run、artifact、模板。
- **写**：`decideWorkspaceCaseV2`（经单案事务写 `state.v2.json`）；`saveBatchStateV2`（`appendReceipt` 追加 `automationReceipts`）。
- **副作用**：无日志/网络；`activeAutomation` 进程内互斥（finally 删除，`:114-116`）。
- **幂等**：同 requestId 由单案事务幂等；`appendReceipt` 同 requestId+status 去重（`:31`）；重跑已 decided/awaiting-supplement 的案卷直接 skip（`:58-59`），测试 `:140-143` 断言重放 `applied=0`、不重复决定。
- **并发**：同批次防并发（`:37`）；revision 快照在循环中复检（`:54`）。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 批次不存在/状态非 queued/未启用 | `:41-44` | throw |
| done 成员缺绑定 | `:46-49` | 整批 throw（fail closed） |
| 每轮状态/授权变化 | `:53-55` | break |
| 聚合/绑定 Run 缺失或已终态 | `:56-59` | skip |
| 非自动分流 route | `:60-66` | skip |
| 模板缺失/Run stale | `:74-75` | failed 回执 |
| 门拒绝 | `:78-80` | blocked 回执 |
| 事务冲突/失效 | `:95` | conflict 回执 |
| 事务其它失败 | `:95` | blocked 回执 |
| 异常 | `:99-103` | failed 回执 |
| 定稿状态不符/门未过/无 final 决定 | `:125/:128/:137` | throw |
| 取消/恢复 | 无 | 无 AbortSignal；重跑幂等 |

## 7. 权限与权威状态

- **actor**：系统身份 `batch-auto:{batchId}:{revision}`（`:69`）——不是人工、不是校方；其写入在 `decideWorkspaceCaseV2` 内被 `assertAutomatedWorkspaceDecision` 再核（`workspace-business-service-v2.ts:239-272`：revision 匹配、白名单动作、`checkAutoBatchAction` 理由/要素逐字一致）。
- **权威状态**：资格由门+单案事务双重校验；自动化策略锁在 `BatchStateV2.automation`（revision 参与 requestId 与回执防陈旧）；定稿快照只记绑定运行与 final 决定（BATCH-04）。
- **边界**：自动补件模式绝不自动通过（route 只配 return，`:64-65`）；`finalizeCompletedBatch` 对 assist 人工批次同样可用（自动化策略不决定人工定稿，`:119-122` 注释）。

## 8. 修改影响面

- 改循环/回执 → 影响 IPC 自动化与 `batch-store.automationReceipts` 审计；测试 15 例。
- 改 actor 编码 → 影响 `workspace-business-service-v2` 的 `batch-auto:` 正则校验（两侧契约联动）。
- 改定稿快照形状 → 影响 `readFinalizedSnapshot` 消费者与测试 `:377-379`、`batch-store.test.ts:504-506`。
- 需同步：`batch-automation-service.test.ts`、`batch-store.test.ts`（assist 定稿）。

## 9. 测试证据

本轮 `NOT_RUN`：未执行 `bun test`。直接测试 `batch-automation-service.test.ts`（1 describe、**15 test**）：

1. `:112-120` 默认 assist 不能自动；未确认/缺全局授权不能开 auto-approve；无决定。
2. `:122-145` 授权后 auto-approve：`applied=2`（pass+return）；pass 案 `decided`+`result:'pass'`+actor `system`+末回执 `RecordWorkspaceBusinessDecision`；return 案 `awaiting-supplement`+要素含“证明申请资格”；重跑 `applied=0` 不重复；有未结补件时 `finalizeCompletedBatch` 抛“仍待补件”。
3. `:147-154` auto-return 模式绝不自动通过。
4. `:156-166` 撤销全局授权后 `blocked=1`、无决定。
5. `:168-175` 无来源证据 `blocked=1`。
6. `:177-201` 补件回复后 `requeueCaseAfterSupplement` 为空、`resolveSupplementV2` 满足后工作台命令自身回流（`cases[0].status==='queued'`）、再自动化 `applied=0` 且无 pass 决定（不沿用旧运行批准）。
7. `:203-217` 伪造 sourceRefs `blocked=1`。
8. `:219-235` 输入变更后 `failed=1`（stale）、无决定。
9. `:237-253` 授权改回 assist 后，伪造 `batch-auto:` system actor 直调 `decideWorkspaceCaseV2` → `AGENT_DECISION_DISABLED`、无决定。
10. `:255-270` 直接门测试：无本轮读取 → blocked 含“全部有效材料”。
11. `:272-288` 直接门测试：规则重复/缺结果 → blocked。
12. `:290-311` 混合批次分流：`applied=2/blocked=1/failed=0`；pass→pass、可补正→return、人工问题/无证据无决定；`automationReceipts` applied 2 条。
13. `:313-342` 多补件：首项满足不回流（`cases[0]` 仍 done）、第二项满足后回流 queued。
14. `:344-386` 完整链路：队列→自动通过→定稿快照 2 条决策→重复定稿抛“批次状态不允许”→重跑抛“重开”→决定各 1 条。
15. `:388-397` 未形成正式决定时定稿抛“未完成正式审批”；自动化后可定稿；定稿后 `runBatchAutomation` 抛“只有已完成”。

（其中 10/11 为直接门测试，其余经服务间接。）

**未覆盖**：`appendReceipt` 的 revision 防陈旧分支；`finalizeCompletedBatch` 的 `batches` 快照字段细节（仅 `:379` 数量断言）；`conflict` 回执路径（VERSION_CONFLICT/STALE_INPUT 映射）未直接断言；同批次并发 throw（`:37`）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 只处理完全验证候选，经单案事务 | 已证实 | `:82-88`；测试 2/12 |
| auto-return 绝不自动通过 | 已证实 | `:64-65`；测试 3 |
| 全局授权撤销即时生效 | 已证实 | `:102`（门内）；测试 4/9 |
| system `batch-auto:` 身份不能绕过事务门槛 | 已证实 | `:68-71`；测试 9 |
| 补件闭环后回流由工作台命令触发、重跑不沿用旧运行 | 已证实 | `:56-59`；测试 6 |
| 统一定稿器共享同一业务门 | 已证实 | `:126-128`；测试 14/15 |
| 快照只记绑定运行与 final 决定 | 已证实 | `:130-141`；测试 14（数量）+ batch-store 测试 |
| conflict 映射分支 | 已证实（代码） | `:95` |
| `appendReceipt` 防陈旧 | 已证实（代码）/未知（测试） | `:28-34` |
| 同批次并发互斥 | 已证实（代码） | `:37` |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `runBatchAutomation` 前置 | 3.1 | `:37-49` | covered |
| 逐案分流/门/事务 | 3.1 | `:51-103` | covered |
| `appendReceipt` | 3.1 | `:28-34` | partial |
| 汇总计数 | 3.1 | `:107-113` | covered |
| `finalizeCompletedBatch` | 3.2 | `:123-148` | covered |
| conflict/并发分支 | 6 | `:95/:37` | partial |

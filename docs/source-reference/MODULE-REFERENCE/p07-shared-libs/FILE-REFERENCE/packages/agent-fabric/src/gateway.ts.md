---
path: packages/agent-fabric/src/gateway.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 10364183e4dc4cca6f09ce1eadd74093d2327ed9
sha256: 15e84eab2d4e3a5dcc2c86ca27bd26e65146d54bca35dc8d84f5ca5c7141505a
lines: 545
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-05-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---

# packages/agent-fabric/src/gateway.ts

## 1. 结论与边界

**Local Agent Gateway 核心**（Phase 1）：任务路由、排队、写租约（single-writer）、并发限制、事件持久化语义、幂等、结果聚合（`gateway.ts:1-12`）。仍是纯逻辑——网络/真实执行/持久化全部经注入端口（`gateway.ts:5-6`）；调用方身份由传输层解析为 `CallerContext` 传入（`:11`）。依赖 `./task`（validateTaskRequest/TaskStatus/WorkspaceMode/RetryClass——task.ts 域外）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `CallerContext` | 接口 | `:47` | agentId/trust/grants | Gateway 不处理 token（`:45-46`） |
| `GatewayTaskStore` | 接口 | `:56` | save/get/list/indexRequestId/findByRequestId/saveResult/getResult/saveArtifact/getArtifact/listArtifacts | requestId 索引=跨重启幂等基础（`:60-63`） |
| `createInMemoryTaskStore` | 函数 | `:71` | `(): GatewayTaskStore` | 4 个内存 Map（`:72-75`） |
| `TaskReporter` | 接口 | `:99` | progress/artifactCreated/complete/fail | 实现方必须最终 complete 或 fail 一次（`:98`） |
| `TaskExecution` | 接口 | `:106` | task/reporter | |
| `TaskExecutor` | 接口 | `:112` | `start(execution)`/`cancel(taskId)` | cancel 尽力、静默忽略（`:115-116`） |
| `AgentFabricGatewayDeps` | 接口 | `:121` | registry/store/eventLog?/resolveExecutor/now?/createEventId? | resolveExecutor 返 undefined=路由失败（`:125`） |
| `SubmitTaskOutput` | 接口 | `:134` | task/deduplicated | |
| `AgentFabricGateway` | 类 | `:140` | 见 §3 | 核心 |
| `buildSubmitEnvelope` | 函数 | `:543` | `(actor,requestId,request)` | 便捷构造 |

## 3. 内部逻辑与关键流程

**实例状态**（`:142-147`）：`IdempotencyLedger<string>`、listeners（taskId→Set）、`writerLeases`（workspaceId→taskId，single-writer）、`runningByAgent`（并发计数）。构造器缺省 eventLog=内存、now=Date.now、createEventId=随机（`:149-158`）。

- **节点面**（`:162-181`）：registerNode/heartbeat 直通注册表；`discoverAgents` 只要求配对身份（`void caller`，`:171-172`）、只返 ONLINE 节点（`:173-176`）。
- **submitTask**（`:189-212`）：`validateEnvelope`（`:190`）→ 跨重启幂等 `store.findByRequestId` 命中返 `deduplicated:true`（`:193-196`）→ 进程内 `ledger.begin`（in_flight 并发重试抛 `DUPLICATE_REQUEST_IN_FLIGHT`；completed 返回缓存 taskId 取 store，`:198-202`）→ `acceptNewTask` 成功 `ledger.complete`、失败 `ledger.release` 后上抛（`:204-211`）。
- **acceptNewTask**（`:214-251`）：`validateTaskRequest`（`:216`，域外校验）→ `assertNodeRoutable`（`:219`，**目标只能来自注册表**，注释 `:218`）→ 能力断言 `TASK_SUBMIT`；`workspaceMode!==READ_SHARED` 再断言 `WORKSPACE_WRITE`（`:228-231`）→ 建 CREATED 任务落 store + requestId 索引 + `task.created` 事件（`:234-245`）→ `move(QUEUED)` + `pump()`（`:247-249`）→ 返回 store 现值（`:250`）。
- **查询**（`:255-290`）：`getTask` TASK_NOT_FOUND + `TASK_READ` 断言（`:255-262`）；`listTasks` **无权限过滤**（`:264-266`，照实记录 §10）；`getTaskResult` 二次 `TASK_READ`（`:268-272`）；`listArtifacts` ARTIFACT_READ（`:274-278`）；`getArtifact` ARTIFACT_NOT_FOUND + 任务权限 + `assertArtifactReadable` 过期门（`:281-290`）。
- **cancelTask**（`:294-313`）：TASK_CANCEL（`:296`）；终态抛 TASK_TERMINAL（`:297-299`）；RUNNING 时 `executor.cancel`+释放并发（`:301-306`）；释放写租约（`:307`）；`move(CANCELLED)`+`pump()`（`:309-311`）。
- **expireOrphanedTasks**（`:320-331`）：孤儿恢复语义（注释 `:315-319`）——非终态任务中**仅** `QUEUED+SAFE_TO_RETRY` 保留，其余全标 `EXPIRED`（带 failureReason），恢复决策留人/调用方显式重提；不自动重试副作用任务。
- **事件订阅**（`:336-352`）：`onTaskEvent` 返回取消函数（`:343-346`）；`resumeEvents` 委托 eventLog.resumeAfter（`:350-352`）。
- **pump**（`:362-402`）：只看 QUEUED（`:364`）；节点须 ONLINE 否则跳过留待下次（`:366`）；**写租约冲突先于并发判断**（注释 `:368-369`）：`fail` 策略直接 FAILED（failureReason 含"写租约被任务 X 持有"，`:373-377`）、`queue` 策略留 queued（`:379-380`）；并发满跳过（`:384-385`）；`resolveExecutor` 无→FAILED（"没有可用执行器"，`:387-394`）；写任务占租约（`:396-398`）→ `startExecution`。
- **startExecution**（`:404-419`）：`move` 三连 ROUTING→ACCEPTED→RUNNING（`:405-407`，注意 ROUTING 不发事件）；并发 +1（`:409`）；`executor.start` **同步抛错视为执行失败**→`reporter.fail`（`:412-418`）。
- **createReporter**（`:421-459`）：`settle` 单次闸（`settled` 标志；二次 settle 被忽略，`:423-431`；settle 后 `finishRunning`+`pump`，`:429-430`）；progress→PROGRESS 事件（`:434-436`）；artifactCreated→saveArtifact+事件（`:437-444`）；complete→saveResult+COMPLETED（`:445-451`）；fail→FAILED+failureReason（`:452-457`）。
- **内部工具**（`:463-520`）：`requireTask`（`:463-469`）；`finishRunning`/`releaseRunning`/`releaseWriterLease`（租约仅持有者可释放，`:482-485`）；`assertTaskCapability`（节点缺失时 `nodeCapabilities=[]` → 必拒，`:488-499`）；`move`（`transitionTask` + 7 态事件映射（ACCEPTED/RUNNING/COMPLETED/FAILED/CANCELLED/EXPIRED/PAUSED；QUEUED/ROUTING/DELEGATING/WAITING_* 不发事件），`:502-520`）；`appendEvent`（listener 异常吞掉不影响落库，`:531-537`）。

## 4. 调用者与调用链

- 入向（grep 全树）：域外 `apps/electron/src/main/lib/agent-fabric/`（agent-fabric-service/fabric-server/fabric-store/fabric-executor-headless/fabric-config/fabric-pairing + 2 测试）经 `@profer/agent-fabric` 使用（未深读=边界）。
- 出向：同包 capabilities/node/protocol/task(域外)/state-machine/events/artifacts。
- 测试：`contract-gateway.test.ts` 16 用例（§9）。

## 5. 数据 I/O、读写与副作用

- 无磁盘/网络（纯内存 + 注入端口）；store/eventLog/registry/executor 均为端口（内存实现供测试）。
- 状态副作用：任务状态机推进、写租约占/放、并发计数、事件落 log+listener 广播。
- **无定时器**：`pump()` 只由 submit/complete/fail/cancel/expire 触发（`:249,311,329,430`）——离线节点恢复上线后要等下一次 pump 事件才推进（照实记录，§10）。

## 6. 分支、失败、取消与恢复

- 失败路径：路由失败（AGENT_NOT_FOUND/AGENT_OFFLINE 于提交期抛，`:219`）、能力拒绝（CAPABILITY_DENIED）、无执行器→FAILED（`:387-394`）、写租约 fail→FAILED（`:373-377`）、executor.start 同步抛→fail（`:414-418`）、reporter.fail→FAILED。
- 取消：cancelTask（§3）；executor.cancel 尽力。
- 恢复：幂等（跨重启 requestId 索引 + 进程内 ledger + release 重试）；孤儿任务 `expireOrphanedTasks`（不自动重试副作用任务）；断线事件 `resumeEvents`。
- 并发交错：settle 单次闸防重复完结（`:423-431`）；写租约先于并发（`:368-369`）。

## 7. 权限与权威状态

- 调用方身份=传输层解析的 `CallerContext`（Gateway 不验 token，`:45-46`）。
- 每次操作按 `grant ∩ 节点能力 ∩ task.policy` 断言能力（提交 TASK_SUBMIT+写意图 WORKSPACE_WRITE（`:228-231`）、查询 TASK_READ、取消 TASK_CANCEL、产物 ARTIFACT_READ）。
- 工作区写权威=writerLeases（single-writer，`:144`）；任务状态权威=state-machine 迁移表。

## 8. 修改影响面

Gateway 是 fabric 服务核心：改动影响域外 fabric-server/fabric-executor/fabric-store 全链与 `fabric-server.test.ts`/`fabric-store.test.ts`（域外测试）；`move` 事件映射与 events.ts 类型联动；幂等语义影响所有重试调用方。

## 9. 测试证据

`NOT_RUN`。直接测试 `contract-gateway.test.ts`（363 行/**16 个 `it(`**，全部用 `FakeExecutor` 测试替身（`:54-68`）不启动真实 Agent）：提交/路由 6（created→running 且执行器收到 `:121-132`；同 requestId 去重 `deduplicated:true` 且只执行一次 `:134-143`；ghost 目标→AGENT_NOT_FOUND `:145-155`；离线节点→AGENT_OFFLINE `:157-166`；无 task.submit→CAPABILITY_DENIED `:168-178`；写任务要 workspace.write `:180-200`）；并发/写租约 3（maxConcurrency=1 第二个留 queued、完成后自动推进 `:204-218`；fail 策略第二个写任务 FAILED 且 failureReason 含"写租约" `:220-233`；queue 策略等待释放后推进 `:235-250`）；结果/事件/取消 7（完成结果可查+事件序列 `[created,accepted,started,progress,artifact_created,completed]`+游标恢复 `:254-283`；运行中取消→执行器收到 cancel、终态、并发释放 `:285-298`；终态不可取消（TASK_TERMINAL）`:300-313`；fail 上报→FAILED+原因 `:315-323`；重复 settle 被忽略 `:325-334`；未配对读任务被拒 `:336-342`；产物读 ARTIFACT_READ+过期拒绝 `:344-362`）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| §3 全部语义（幂等/租约/并发/settle 闸/孤儿恢复/事件映射） | 已证实 | `:140-545` 逐行 + 16 测试互证 |
| `listTasks()` 无调用方权限过滤（与 getTask 的 TASK_READ 不对称） | 已证实（不一致存在） | `:264-266` vs `:255-262` |
| 无定时 pump：离线节点上线后须等下一 pump 事件 | 已证实 | 触发点 `:249,311,329,430` 全扫描 |
| ROUTING/QUEUED/CREATED 不发事件（仅 CREATED 在 acceptNewTask 手动发） | 已证实 | `:504-512` + `:242-245` |
| 持久化/跨重启幂等的 store 实现 | 边界 | 域外 fabric-store 未深读 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/域 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 10 导出对象 | §2 | 47-543 | covered |
| 提交/调度/租约/事件/恢复全流程 | §3 | 189-539 | covered |
| 权限模型 | §7 | — | covered |
| 测试 16 用例 | §9 | test 文件 | covered（NOT_RUN） |

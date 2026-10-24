---
path: apps/electron/src/main/lib/review/review-v3-background-technical-coordinator.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 58f825a6468ee3c8d00283d579bf336cdb1034f4
sha256: aa92a17985db691c3bc5ce633ff3e9f0c80266a442b16f34a8ae412502cf3e55
lines: 305
kind: source
package: p05-review-engine
author: docs-r07-author-nb-47-20261023
reviewer: p05-review-engine
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-background-technical-coordinator.ts

## 1. 结论与边界

Dev-A R22-C：按 Case 持久化的**技术**后台执行协调器（`V3ABackgroundTechnicalCoordinator`）。spool（`v3-dev-a-background-tasks/1`）经跨 PID CAS 持久化任务状态；冷读语义（inspect 对他进程 running/stopping 一律投影 `recovery-required`，绝不接管）；错误分类面向本地恢复工作台（quota/协议/未配置等），失败不授权重派。文件头 :1-8：不是 V2 Pi 后台服务、不是 C Case/Run/Batch/Decision 写者；spool 无权创建 Owner grant、重开崩溃的物理 Provider 效果或自动续跑 Run。

不做的事：不物理取消已发出的 Provider 请求（`stop` 只停调度，:277 注释）；不伪造本地终态（CAS 失败抛原错误 :266-270）；不接管他进程任务（:127-139）。

## 2. 导出与关键符号

导出 5 条（`export` 逐条核 :24/:27/:48/:54/:91）：

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `A22TaskState` | type | `:24-26` | `running\|stopping\|completed-technical\|terminal-technical\|recovery-required` | 5 值 |
| `A22BackgroundTask` | interface | `:27-42` | requestId/caseId/run/sessionId/senderKey/ownerGrantId/processEpoch/modes/initialUsedTurns/committedUsedTurns/completedSteps/state/reason?/terminalStatus? | 任务记录 |
| `A22BackgroundRequest` | interface | `:48-52` | `{requestId, call: V3ReviewToolCall, sequence: V3ATechnicalSequence}` | 派发输入 |
| `A22BackgroundTrustPort` | interface | `:54-61` | `assertCurrent`/`driverForCase`/`storeForCase` | Main-only 端口（:53 注释：非 Renderer 自报 Run、非 C ACK） |
| `V3ABackgroundTechnicalCoordinator` | class | `:91-305` | 见 §3 | 主体 |

内部符号：`sha/deny`（:20-22，`deny` 抛 `C0ContractError('RECOVERY_REQUIRED','A22_BACKGROUND: …')`）、`Journal/Sealed`（:43-47）、`decode`（:62-88）、`terminal`（:89-90，终态判定）、`processEpoch = randomUUID()`（:92，进程纪元）、`active` Map（:93-95，进程内活跃）。

## 3. 内部逻辑与关键流程

### 3.1 spool 校验 `decode`（:62-88）

null→空；JSON/seal/version/tasks 数组校验（:64-68）；逐任务：requestId 非空且唯一、sessionId/senderKey/ownerGrantId/caseId/processEpoch 非空、state 枚举、`committedUsedTurns >= initialUsedTurns`、`completedSteps >= 0`、modes 数组（:70-80）；`assertC0RunEvidenceIdentity(t.run)` 且 `t.caseId === t.run.caseId`（跨 Case 抛 `cross-Case Run` :81-83）。

### 3.2 持久化（:104-126）

`store(caseId)`：`assertSafeReviewStorageId`（`review-storage-id`）+ 端口必须返回带 `read`/`compareAndWrite` 的持久化（否则 `cross-PID technical CAS required` :107-109）。`update`（:111-121）：读→decode→跨 Case 冲突检查（:114）→apply(structuredClone)→容量 256 tombstone（:116，超 `technical tombstone capacity exhausted`）→`compareAndWrite(old, …)` 原子比对写（注释 :117：绝不重写旧快照）。`last`（:122-126）取末条。

### 3.3 冷读 `inspect`（:128-139）

末条任务为 running/stopping 且（`processEpoch` 不同 或 本地 active 的 requestId 不符）→ 投影 `{state:'recovery-required', reason:'COLD_PID_OR_UNKNOWN_PROVIDER_EFFECT'}`；否则深拷贝返回。注释 :127：**绝不**收养他进程活跃任务。

### 3.4 `run`（:160-276）

1. 请求形状校验（:161-167）：requestId ≤128 且 `[A-Za-z0-9_.-]+`、sequence.version `v3-dev-a-technical-sequence/1`、modes 非空；违者 `CONTRACT_INVALID`。
2. `trust.assertCurrent(call)` + `assertC0RunEvidenceIdentity`（:168-170）。
3. 幂等/拒派（:172-193）：同 requestId 回放（字段全等才回旧任务 :175-187，异体 `requestId replay collision`）；未终态或 recovery-required 拒新派发（:188-190，`Case has unresolved background technical dispatch`）；同 runId 不可重跑（:191-193）。
4. 进程内 Case 互斥（:194）；建任务（:195-205，`committedUsedTurns = expectedUsedTurns`、state running）；spool 追加再校验（:206-215：同 requestId 拒 replay、在途/重复 Run 拒）。
5. 执行（:216-226）：`trust.driverForCase(caseId).execute(call, sequence, abort.signal, { afterTurn })`；`afterTurn` 回写 `committedUsedTurns/completedSteps`（:218-223），**stopped 任务不收迟到证据**（:221 `deny('stopped task cannot accept late SDK evidence')`）。
6. 结束校验（:227-230）：`assertCurrent` 复查 Main Run 未漂移（漂移 `deny('Main Run changed across background SDK await')`）。
7. 结果映射（:231-242）：abort 后迟到→`recovery-required`（reason `STOP_OR_LATE_PROVIDER_OUTCOME_UNCERTAIN`）；`result.kind==='terminal-proposal'`→`terminal-technical`（记 terminalStatus）；否则 `completed-technical`。
8. 错误分类（:243-265）：abort→`STOP_OR_PROVIDER_COMPLETION_UNCONFIRMED`；配置/渠道缺失（EXTERNAL_PROVIDER_NOT_CONFIGURED|MAIN_MODEL_CHANNEL_NOT_INSTALLED|MAIN_FROZEN_PI_SELECTION_MISSING）→`EXTERNAL_PROVIDER_NOT_CONFIGURED`；协议（PROVIDER_PROTOCOL_NOT_YET_SUPPORTED|PROVIDER_HTTPS_REQUIRED）→`PROVIDER_PROTOCOL_NOT_SUPPORTED`；429/rate.limit/quota/insufficient.credits（不区分大小写）→`PROVIDER_QUOTA_OR_RATE_LIMIT_REQUIRES_REVIEW`；其余→`EXECUTION_OR_PROVIDER_EFFECT_UNCONFIRMED`。均转 `recovery-required`；transition 的 CAS 失败则**抛原错误**不伪造终态（:258-265）。注释 :246-249：错误可见性不泄露 Provider 响应体/令牌；失败不授权重派已持久化 SDK 意图。
9. `finally` 清 active（:266-270）。

### 3.5 `stop`（:278-294）与 `stopSession`（:296-304）

`stop`：非本进程 active 的同 requestId 任务按 inspect 回显（:280-283），否则 `no current PID-owned task for stop`；transition 置 `stopping` + `STOP_REQUESTED_UNKNOWN_PROVIDER_EFFECT`（:286-289）；**finally 无条件 abort**（:290-293，注释：即使 CAS 失败也断后续 Provider 调用）。`stopSession`：按 sessionId 遍历 active 级联 stop（注释 :295：窗口关闭/会话撤销路径）。

## 4. 调用者与调用链

入向（全冻结树 `*.ts`）：
- 生产：`apps/electron/src/main/lib/review/review-v3-a24-bounded-technical-batch.ts:13-15`（批调度器）、`review-v3-a25-c11-local-execution-ports.ts:23-24`（new :83/:90 等装配）、`review-v3-main-local-execution-orchestrator.ts:16-18`（Main 编排）、`review-v3-r22-cold-background.worker.ts:6-9`（冷读 worker）。
- 测试：`review-v3-r22-concentrated.test.ts:27-29`（new :139/:177/:239/:278）、`review-v3-r23-r24-concentrated.test.ts:16-17`（mock `as unknown as`）。

出向（:10-18）：`node:crypto`（createHash/randomUUID）；`@profer/shared`（C0ContractError/assertC0RunEvidenceIdentity）；`review-storage-id`（assertSafeReviewStorageId :105）；`review-pi-owner-adapter`（OwnerPersistence）；`review-execution-event-adapter`（V3ReviewToolCall）；`review-v3-technical-sequence-driver`（V3ATechnicalSequence/Driver/Result）。

## 5. 数据 I/O、读写与副作用

- 磁盘：per-Case spool 文件（`storeForCase` 注入；worker 用 `createFileOwnerPersistence(dir+'/background.json')`）；写必经 `compareAndWrite`（跨 PID CAS :119-120）；容量 256 条 tombstone 封顶（:116）。
- 幂等：同 requestId 同体回放（:175-187）；同 runId 一次性（:191-193）；同 Case 进程内互斥 + spool 在途拒（:194/:209-214）。
- 副作用：driver 执行（真实 SDK 意图，属技术层）、abort 控制、spool 写。无网络直接调用。
- 并发：`active` Map + spool CAS 双层；`processEpoch` 区分进程（:92）。

## 6. 分支、失败、取消与恢复

- 状态机：running→(stopping)→completed-technical/terminal-technical/recovery-required；`terminal()` 判定（:89-90）。
- 取消：`stop` 只停调度+abort（:277-294）；迟到成功不改判（:233-238）。
- 恢复：**无自动恢复**——冷读一律 `recovery-required`（:127-139）；recovery-required 任务拒新派发（:188-190）；恢复动作属 C 本地恢复工作台（注释 :244-245）。
- 不可恢复点：CAS 失败后的物理效果（:258-265 只抛错）；abort 后迟到结果（:235-238）。

## 7. 权限与权威状态

- `A22BackgroundTrustPort` 为 Main-only（:53 注释）；构造校验三方法存在否则 `ACTOR_UNTRUSTED`（:96-102）。冷 worker 的 `assertCurrent/driverForCase` 直接抛（worker :13-16），即冷 PID 不能授权执行/调 SDK。
- 身份权威：`assertCurrent` 返回的 RunEvidenceIdentity + `assertC0RunEvidenceIdentity`；spool 权威=CAS + sha 自封。
- 无 sender/role 派生（call 由上游 Owner 校验）。

## 8. 修改影响面

- 消费方：a24 批调度器、a25 C11 装配、Main 编排、冷 worker；状态枚举被 r23-r24 测试 mock 断言。
- 错误分类正则（:247-257）是恢复工作台的语义契约，改动影响 C 侧恢复 UX。
- 需同步测试：`review-v3-r22-concentrated.test.ts`（5 用例）、`review-v3-r23-r24-concentrated.test.ts`（mock 形状）。

## 9. 测试证据

直接测试（批内 `review-v3-r22-concentrated.test.ts`，NOT_RUN）：
- R22-A/C-01（:122-166）：双 Case 并行独立（committedUsedTurns 3/2 断言 :151-153）、同 requestId 幂等回放（:156-159）、异体 collision（:160-162）、同 runId 不可重跑（:163-165）。
- R22-A/C-02（:168-199）：stopSession→stopping（:181-183）、迟到 SDK 成功→recovery-required 且 usedTurns 0/0 提案（:188-198）。
- R22-C-03（:231-269）：真 `spawnSync` 子 PID 冷读（linux-only 守卫 :232），断言 `R22_COLD` 输出 recovery-required/COLD_PID…（:250-254）、journal 字节不变（:255）、活 Owner 结局 recovery-required（:258-262）；超时 90s（:268）。
- R22-C-04（:270-296）：quota 分类 `PROVIDER_QUOTA_OR_RATE_LIMIT_REQUIRES_REVIEW`（:284-288）、请求计数恒 1 不自动重试（:293-295）。
- mock 边界：r23-r24 中 coordinator 全 mock（`as unknown as`）；r22 中 driver/Host 为测试注入，Owner/持久化为真实实现。未覆盖：`stop()` 单独路径、tombstone 容量 256、`transition` CAS 冲突分支。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 5 条；spool CAS + sha 自封 + 256 上限 | 已证实 | :24-91/:111-121 |
| 冷读永不接管、投影 recovery-required | 已证实 | :127-139；测试 :250-254 |
| 幂等回放/replay collision/同 runId 不重跑 | 已证实 | :172-193 |
| 错误四分类 + 不伪造终态 | 已证实 | :243-265 |
| stop 无条件 abort、迟到结果不改判 | 已证实 | :233-238/:290-293 |
| 冷 worker 无生产启动方（仅 r22 测试 spawnSync） | 已证实（否定） | 全树字符串检索 `review-v3-r22-cold-background` 仅 test:120 |
| driver.execute 的物理执行语义 | 未知（属 review-v3-technical-sequence-driver） | :217 |
| 错误分类正则覆盖真实 Provider 错误面 | 推断 | :247-257 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `A22TaskState`/`A22BackgroundTask`/`A22BackgroundRequest`/`A22BackgroundTrustPort` | §2 | :24-61 | covered |
| `decode`/`store`/`update`/`last` | §3.1-3.2 | :62-126 | covered |
| `inspect` 冷读 | §3.3 | :128-139 | covered |
| `run` 全流程 | §3.4 | :160-276 | covered |
| `stop`/`stopSession` | §3.5 | :278-304 | covered |
| 错误分类 | §3.4/§6 | :243-265 | covered |
| `stop` 单独路径/容量 256/CAS 冲突 | §9 | — | unknown（无断言） |
| driver 物理语义 | §10 | :217 | unknown |

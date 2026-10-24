---
path: apps/electron/src/main/lib/review/review-v3-main-sdk-turn-bridge.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7937bd0b995ebdb5730399a761e58e2a329c52fe
sha256: 2fbdafe1ca8f3bf0ace843a7b7487a01cc9aad20583e5776ee50e5383099626e
lines: 256
kind: source
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-main-sdk-turn-bridge.ts

## 1. 结论与边界

Dev-A A3-R05：Main-only 的**单轮 Pi SDK 回调桥**。无 SDK 实现、无 Renderer IPC、无业务 ReviewRun 写入、无 C ACK；注入端口必须在 Main 绑定真实 SDK turn 回调，不能是模型文本或 Renderer JSON；所有动作在两个 await 边都复核（文件头 `apps/electron/src/main/lib/review/review-v3-main-sdk-turn-bridge.ts:1-6`）。

边界：

- 桥从不解释 Pi 文本（`:46`）；receipt 只能由 Main 注入的 SDK Host 发出，Run 由 Main 绑定回显防跨 attempt/generation（`:43-46`）。
- 24 轮技术终态重放（`closeExhausted`）不重跑 SDK（`:96`）。
- Main 拥有该实例与全部依赖，绝不暴露给 IPC（`:64`）。

## 2. 导出与关键符号

`export` 逐条核对：4 个 type + 1 个接口 + 1 个类 = 6 个导出（函数/常量 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `V3ASDKMode` | type（导出） | 29 | `'direct'\|'hidden'\|'graph'\|'batch'` | |
| `V3ATurnInterruption` | type（导出） | 33-35 | `Extract<ATechnicalStatus,'cancelled'\|'timed-out'\|'failed'>` | |
| `V3ATurnHostOutcome` | type（导出） | 36-41 | `completed-turn`（带 receiptId/run/dispatchId）或 `interrupted`（带 status） | Host 结果 |
| `V3AMainSDKTurnPort` | 接口（导出） | 48-57 | `nextTurn({run,dispatchId,mode,signal?})=>Promise<V3ATurnHostOutcome>` | dispatchId 持久化先于 SDK 调用（`:51-52`） |
| `V3ATurnDriveResult` | type（导出） | 59-62 | `recorded{turn}` 或 `terminal-proposal{status,event}` | |
| `V3ASDKTurnBridge` | 类（导出） | 65-256 | `closeExhausted(call)`/`next(call,mode,signal?)` | `busy` 标志（`:66`） |
| `canonical` | 内部 | 21-27 | 键排序规范化 | 忽略插入序，不忽略 Run 身份值（`:20`） |
| `activeSDKOwnerSessions` | 内部 | 32 | `Set<string>` | 进程级防双桥（`:31`） |
| `authorized` | 内部 | 80-94 | `owners.assertAuthorized` + lease/run 六字段对齐 | 否则 `RUN_IDENTITY_MISMATCH: Main frozen Run unavailable` |

## 3. 内部逻辑与关键流程

### 3.1 `closeExhausted(call)`（`:97-116`）

`call.tool` 必须 `review_submit_result`（`CASE_SCOPE_FORBIDDEN: SDK turn needs submit capability`）→ `authorized` → 二次 `assertAuthorized` 取 lease → `turns.exhausted(lease)` 否则 `CONTRACT_INVALID: 24 turns have not been exhausted` → `proposals.terminal(call,'needs-resume')` → 事件 runId/attemptId 对齐（`RUN_IDENTITY_MISMATCH: Host terminal Run mismatch`）→ 返回事件（`:101-115`）。注释：C 拥有正式业务完成；Host 供给自身 terminal 回执，`V3AProposalProducer` 在 append 时围栏最终 grant（`:109-110`）。

### 3.2 `next(call,mode,signal?)`（`:123-255`）

1. 前置：signal 已中止 → `CASE_SCOPE_FORBIDDEN: Main cancelled SDK execution before Host invocation`（`:125-128`）；`tool`/`mode` 非法 → 同码不同文案（`:129-132`）；`busy` 或 `activeSDKOwnerSessions` 已含该 session → `RECOVERY_REQUIRED: Concurrent SDK turn on same Main Owner session`（`:133-136`）；置 `busy`+登记（`:137-138`）。
2. `frozen=authorized(call)` + lease（`:142-146`）；`proposals.terminalCandidate(frozen)` 已终态：仅当 `kind==='terminal'`、`status==='needs-resume'`、grantId 相等且 `turns.exhausted` 才返回该终态，否则 `RUN_IDENTITY_MISMATCH: Attempt already sealed…`（`:147-158`）。
3. 已耗尽 → `closeExhausted` 返回 `terminal-proposal/needs-resume`（`:159-162`）。
4. **先持久**：`dispatch.claim(call)`（崩溃/抛错/磁盘故障后同 Run 不得再派发，`:163-165`）→ `pendingSDK=this.sdk.nextTurn(...)`（`:170-172`）。
5. abort 竞速：`Promise.race([pendingSDK,cancelled])`，abort 即 `RECOVERY_REQUIRED: Main cancelled while SDK Provider result is unresolved`；**不释放会话锁**直到 SDK promise 落定，持久 in-flight 意图不清、迟到结果永不接受（`:166-192`）。
6. race 后 signal 仍中止 → `dispatch.lateDenied` + `CASE_SCOPE_FORBIDDEN: Main cancelled in-flight SDK turn; Host return rejected`（`:193-197`）。
7. 二次 `authorized`（失败 → `lateDenied` + 重抛，`:200-205`）；`received.dispatchId!==intent.dispatchId` → `RUN_IDENTITY_MISMATCH: SDK callback does not match persisted Main dispatch identity`（意图保持未决，`:206-211`）；`canonical(received.run)`/`canonical(current)` 与 frozen 不等 → `RUN_IDENTITY_MISMATCH: SDK Host receipt bound to a different immutable Run`（`:212-216`）。
8. `interrupted`：status 须在三值（`CONTRACT_INVALID: Unknown Host interruption`），`proposals.terminal` + `dispatch.settle`，返回 `terminal-proposal`（`:217-224`）。
9. `completed-turn`：receiptId 非空（`CONTRACT_INVALID: SDK Host turn receipt absent`，`:225-228`）→ `dispatch.assertUniqueReceipt`（不同物理派发绝不伪装成同 receipt 的幂等重放，`:229-231`）→ `turns.recordCompletedTurn` → `dispatch.settle`（注释：SDK 工作已持久计数，即便第 24 轮终态 ENOSPC，重试终态安全、重跑 SDK 不安全，`:232-235`）→ 若 `turn.exhausted` 走 `closeExhausted`，否则返回 `recorded{turn}`（`:236-240`）。
10. `finally`：`abortWonWhilePending` 时挂 `pendingSDK.then(release,release)`（吞掉迟到拒绝防 unhandled，且在 SDK 落定前同 Owner 会话的第二桥保持拒绝），否则立即 `release`（`:241-254`）。

## 4. 调用者与调用链

入向（冻结树 grep）：

- 生产：`review-v3-a25-c11-local-execution-ports.ts:18` 导入、`:145` `new V3ASDKTurnBridge(...)`（A 侧专用端口装配）；`review-v3-technical-sequence-driver.ts:16,53` 以类型持有 `bridge` 并驱动 `next`/`closeExhausted`。
- 测试：`review-v3-r22-concentrated.test.ts`（文件外，非本批 18 文件）。

出向：`@profer/shared`（`C0ContractError`/`RunEvidenceIdentity`）；`review-execution-event-adapter.ts`（`V3ReviewToolCall`）；`review-pi-owner-adapter.ts`（`V3ReviewOwnerAdapter`）；`review-v3-execution-proposal-producer.ts`（`AExecutionProposal`/`V3AProposalProducer`）；`review-v3-execution-turn-budget.ts`（`V3ATurnSnapshot`/`V3ATurnBudget`）；`review-v3-sdk-dispatch-fence.ts`（`V3ASDKDispatchFence`）。

## 5. 数据 I/O、读写与副作用

- 本文件无磁盘；持久化经注入的 `dispatch.claim/settle/lateDenied/assertUniqueReceipt`（意图台账）与 `turns.recordCompletedTurn`。
- 副作用：经 `sdk.nextTurn` 触发真实 SDK 派发（一次 Host attempt）；abort 竞速不取消 SDK 本身。
- 并发：`busy` + `activeSDKOwnerSessions` 双保险防同会话并发；abort-wins 时锁保持到 promise 落定（`:246-250`）。
- 幂等：dispatch 一次性 + receipt 唯一性；终态重放不重跑 SDK。

## 6. 分支、失败、取消与恢复

| 错误 | 语义 | 行 |
| --- | --- | --- |
| `ACTOR_UNTRUSTED: Main-attested SDK callback required` | 构造 | 76 |
| `RUN_IDENTITY_MISMATCH`（四种文案） | lease 不齐/终态已封/runId 不符/dispatch 不符/Run 变 | 91,113,156,209,214 |
| `CASE_SCOPE_FORBIDDEN`（三种文案） | tool/模式非法/预中止/中止后回执 | 99,126,131,195 |
| `CONTRACT_INVALID`（三种文案） | 24 轮未耗尽/未知中断/receipt 缺失 | 107,219,227 |
| `RECOVERY_REQUIRED: Concurrent SDK turn…`/`…result is unresolved` | 并发/中止竞速 | 134,179 |

- 失败后状态：dispatch 意图按分支保持 in-flight（`:206-211`）或 `lateDenied`（`:193-197,203`）；abort-wins 时不释放会话锁（`:246-250`）。
- 取消/恢复：`signal` 是 Main 生命周期取消，不自证终态（`:54-55`）；未知 Provider 结果需 Main 恢复，绝不静默计费或算 PASS（`:120-122`）。

## 7. 权限与权威状态

- 授权经 `owners.assertAuthorized`（session/grant/sender/principal/tool），lease 与 run 六字段对齐才算冻结 Run（`:80-94`）。
- receipt 只能来自 Main 注入的 SDK Host（`:43-46`）；桥不解释模型文本。
- 终态重放要求 `turns.exhausted` + grantId 相等（`:147-155`）。

## 8. 修改影响面

- 改构造/方法签名影响 `review-v3-a25-c11-local-execution-ports.ts:145` 与 `review-v3-technical-sequence-driver.ts:53`。
- 改 dispatch 围栏语义影响 `review-v3-sdk-dispatch-fence.ts` 契约与 `review-v3-r22-concentrated.test.ts`（文件外）断言。
- 改 abort/锁语义影响 24 轮序列驱动的恢复路径。

## 9. 测试证据

本批内**无专属测试文件**（scope 未含 `review-v3-main-sdk-turn-bridge.test.ts`）；文件外覆盖：`review-v3-r22-concentrated.test.ts`（引用 `V3ASDKTurnBridge`，未在本批逐行读——已证事实到“被引用”止）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

缺口（静态判断）：`closeExhausted`/`next` 全部分支在本批无逐行断言证据；维护者验证方式见 `review-v3-r22-concentrated.test.ts`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 先持久 claim 后 SDK 派发 | 已证实 | `:163-172` |
| abort-wins 不释锁、迟到不收 | 已证实 | `:166-197,246-250` |
| dispatch/receipt 双重唯一 | 已证实 | `:206-211,229-231` |
| 终态重放不重跑 SDK | 已证实 | `:96-116,236-239` |
| 生产装配于 a25 端口 + sequence driver | 已证实（检索） | `:18,145`/`:16,53` |
| 真实 SDK 行为/断言覆盖 | 未知 | 本批无测试；外部测试未读 |
| `V3ASDKDispatchFence` 实现细节 | 未知（文件外） | 未逐行读 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `authorized` | §2 | 80-94 | covered |
| `closeExhausted` | §3.1 | 97-116 | covered |
| `next` 全流程 | §3.2 | 123-255 | covered |
| 并发/abort/锁 | §5,§6 | 133-138,241-254 | covered |
| 权威/receipt 语义 | §7 | 43-57,80-94 | covered |
| 测试断言 | §9 | — | unknown |

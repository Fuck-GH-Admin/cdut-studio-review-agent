---
path: apps/electron/src/main/lib/review/review-v3-technical-sequence-driver.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3c4bbb8d2071eb5960e27048aa169a4fc8e11274
sha256: 01fc01dff1cd71e6db3cc1b3e406682144dcc05dffdc5bd60320e18c1fd3a658
lines: 143
kind: source
package: p05-review-engine
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-technical-sequence-driver.ts

## 1. 结论与边界

Main-only 的**多轮顺序 SDK 执行协调器**（Dev-A R21，文件头 `apps/electron/src/main/lib/review/review-v3-technical-sequence-driver.ts:1-10`）：把既有 direct/hidden/graph/batch 物理 turn 桥接成多轮技术负载；每步进入"Dispatch Fence → 真实 SDK 桥 → Turn Budget"，**无重试、无自宣称 Provider 成功、无影子 turn 日志**。

边界（注释 `:4-9`、`:43-47`）：不实现图调度器/Batch 收尾器；不能产出正式 C ReviewRun/Decision/ACK；Run/Plan/Source/revoke/receipt 的不可变校验留在 Owner 与 SDK Bridge 内，本层只协调顺序推进。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `V3ATechnicalSequence` | interface（export） | `:19-25` | `{ version:'v3-dev-a-technical-sequence/1'; expectedUsedTurns:number; modes: readonly V3ASDKMode[] }` | Main 冻结声明，禁 Renderer 供给（`:20`） |
| `V3ATechnicalSequenceResult` | type（export） | `:26-30` | `'steps-completed' \| 'terminal-proposal'` 联合 | 二选一结果 |
| `V3ATechnicalSequenceHooks` | interface（export） | `:33-37` | `{ beforeTurn?; afterTurn? }` | Main 本地进度钩子；异常即停派发 |
| `V3ATechnicalSequenceDriver` | class（export） | `:48-142` | `constructor(owners, turns, bridge)` + `execute(call, plan, signal?, hooks?)` | 唯一执行入口 |
| `activeSessions` | const（内部） | `:39` | `Set<string>` | 模块级并发互斥表 |
| `refuse` | function（内部） | `:40-42` | `(message) => never` | 抛 `C0ContractError('RECOVERY_REQUIRED', …)` |

依赖类型：`V3ReviewToolCall`（`apps/electron/src/main/lib/review/review-execution-event-adapter.ts:31`）、`V3ReviewOwnerAdapter`（`review-pi-owner-adapter.ts`）、`V3ATurnBudget/V3ATurnSnapshot`（`review-v3-execution-turn-budget.ts`）、`V3ASDKMode/V3ASDKTurnBridge/V3ATurnDriveResult`（`review-v3-main-sdk-turn-bridge.ts:29/:59` 等）。

## 3. 内部逻辑与关键流程

`execute`（`apps/electron/src/main/lib/review/review-v3-technical-sequence-driver.ts:56-142`）：

1. **入参合同校验**（`:60-71`）：`call.tool === 'review_submit_result'`、有 sessionId、`plan.version` 精确匹配、`expectedUsedTurns` 为 0..24 安全整数、`modes` 非空数组 ≤24、每项 ∈ {direct,hidden,graph,batch} 且按下标存在——任一不符 `C0ContractError('CONTRACT_INVALID')`。
2. **取消前置**（`:72-75`）：`signal.aborted` → `CASE_SCOPE_FORBIDDEN`（"physical invocation 之前取消"）。
3. **并发互斥**（`:76-80`）：实例 `busy` **或** `activeSessions` 已含 sessionId → `refuse('Concurrent multi-turn technical sequence…')`；随后置位两者（finally `:138-141` 释放）。
4. **起始计数核对**（`:84-91`）：`owners.assertAuthorized(...)` 取 lease → `turns.snapshot(lease).usedTurns` 必须 === `plan.expectedUsedTurns`，否则 `refuse('…starting counter is stale…')`。
5. **逐模式循环**（`:92-131`），每轮：
   - 每步前置 abort 检查（`:93-95`）；重新 `authorized()` + 快照，要求 `before.usedTurns === expectedUsedTurns+executed`（`:97-101`，检测并发/过期预算）。
   - `hooks.beforeTurn`（`:102`）→ `bridge.next(call, mode, signal)`（`:105`，副作用/CAS/取消安全都在该桥）。
   - **terminal-proposal 分支**（`:108-120`）：预算允许 0 或 +1 增量（`after.usedTurns` 须落在 `[before, before+1]`），不符 `refuse('Terminal sequence contradicted…')`；返回 `{kind:'terminal-proposal', executed: executed+增量, result}`（不再进入下一轮，`:109-110` 注释）。
   - **普通步分支**（`:121-127`）：要求 `after.usedTurns === before+1` 且 `outcome.turn` 三字段（usedTurns/maxTurns/exhausted）与快照一致且未耗尽，任一不符 `refuse('SDK sequence result differs…')`；`executed++`。
6. **收尾**（`:132-137`）：最终快照 `usedTurns === expectedUsedTurns+executed`，返回 `{kind:'steps-completed', executed, budget}`。

## 4. 调用者与调用链

- **入向（生产装配）**：`apps/electron/src/main/lib/review/review-v3-a25-c11-local-execution-ports.ts:22`（import）、`:58`（端口字段）、`:147`（`new V3ATechnicalSequenceDriver(...)` 实例化）；`review-v3-background-technical-coordinator.ts:17/:58`（`driverForCase(caseId)` 抽象持有）。测试入向：`review-v3-r22-concentrated.test.ts`（describe `:121`"Dev-A R22 actual owner + durable multi-turn background execution"）。
- **出向**：`owners.assertAuthorized`（`review-pi-owner-adapter.ts` 的 `V3ReviewOwnerAdapter`）、`turns.snapshot`（`review-v3-execution-turn-budget.ts`）、`bridge.next`（`review-v3-main-sdk-turn-bridge.ts`）；`C0ContractError`（`@profer/shared`）。

## 5. 数据 I/O、读写与副作用

- 本文件不写盘、无网络；副作用全部委托 `bridge.next`（`:103-104` 注释明确"CAS/取消安全在单独测试的真实 SDK 桥"）。
- 状态：实例 `busy` + 模块级 `activeSessions` Set（`:39`）——跨实例共享的全局互斥（同 session 全进程只能有一个序列在跑）。
- 幂等：无重试语义；重复 execute 需新的合法 plan/call。

## 6. 分支、失败、取消与恢复

- 拒绝路径（全部 `C0ContractError`）：`CONTRACT_INVALID`（`:69`）、`CASE_SCOPE_FORBIDDEN`（发起前/循环中 abort，`:73`、`:94`）、`RECOVERY_REQUIRED`（并发 `:77`、起始计数 `:90`、步间预算 `:100`、terminal 矛盾 `:113`、结果与预算不符 `:126`、收尾 `:135`）。
- 取消：`signal` 两处检查（发起前 `:72-75`、每步前 `:93-95`）；**已发生的物理 turn 不回滚**（hooks 注释 `:32`"异常 STOP dispatch; they do not undo a physical turn"）。
- 恢复：`refuse` 文案均指向"durable turn journal / recovery"；无自动恢复——由上层/人工恢复决定（`RECOVERY_REQUIRED` 语义）。
- finally 保证互斥释放（`:138-141`），异常不泄漏 busy/session 占位。

## 7. 权限与权威状态

- 每步 `authorized()` 重新校验（`:84-87`、`:97`、`:106`、`:132`）——授权失效立即拒绝（lease 来自 `owners.assertAuthorized`，权威在 Owner adapter）。
- Turn 计数权威在 `turns`（durable Turn Budget）；本层只做一致性断言（`:89`、`:99`、`:111-125`、`:134`），不产生计数。
- 不发 ACK（文件头 `:8-9`）；`V3ATechnicalSequence.version` 由可信 Main 调用方声明（`:20-21`）。

## 8. 修改影响面

- 改 `execute` 校验/预算语义 → 装配方 `review-v3-a25-c11-local-execution-ports.ts:147`、协调器 `review-v3-background-technical-coordinator.ts:58`、测试 `review-v3-r22-concentrated.test.ts`。
- 改结果联合类型 → `V3ATechnicalSequenceResult` 消费方（coordinator）。
- 与 `review-v3-sdk-dispatch-fence.ts`/`review-v3-main-sdk-turn-bridge.ts` 的预算/回执约定耦合（`:103-105` 注释），改动需三侧对齐。

## 9. 测试证据

- **直接测试：无专属测试文件**。间接：`review-v3-r22-concentrated.test.ts`（describe `:121`）覆盖"真实 owner + 持久多轮后台执行"路径（驱动本类），用例体属该文件主手册范围；本轮未逐条读其断言。
- 未覆盖（本批可见范围）：`CONTRACT_INVALID` 各子分支、预算 stale 拒绝、terminal ±1 边界、hooks 异常停派发。本轮 **NOT_RUN**（未执行任何测试）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 导出 + 2 内部符号；校验/预算/互斥全分支 | 已证实 | 逐行读 `:1-143` |
| 每步重新授权 + 三处预算一致性断言 | 已证实 | `:84-135` |
| 取消不回滚已发生 turn；finally 释放互斥 | 已证实 | `:32` 注释、`:138-141` |
| 生产装配点（a25-c11 :147）与 coordinator 抽象 | 已证实 | §4 行号 |
| `bridge.next` 内部副作用/CAS | 未知 | `review-v3-main-sdk-turn-bridge.ts` 跨批未逐行读 |
| r22 测试对本类的实际断言强度 | 未知 | 仅见 describe 标题 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `execute` 合同校验/互斥/循环/terminal/收尾 | §3/§6 | `:56-142` | covered |
| `V3ATechnicalSequence`/Result/Hooks | §2 | `:19-37` | covered |
| `activeSessions`/`refuse` | §2/§5 | `:39-42` | covered |
| 调用链 | §4 | 两侧行号 | covered |
| 测试 | §9 | — | partial（间接，NOT_RUN） |
| bridge 内部 | §10 | — | unknown |

---
path: apps/electron/src/main/lib/review/review-v3-sdk-physical-turn-port.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 49b8d9270570a76f58f04d90c3bdc77ce6230a9b
sha256: 552a51a4845fbc87dc87fa47b6f2f8720c6d1309edec12b3cc162cf28a9fe8ea
lines: 148
kind: source
package: p05-review-engine
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-sdk-physical-turn-port.ts

## 1. 结论与边界

Main 拥有的**单次物理 SDK 调用见证门**（Dev-A A4-R07，文件头 `apps/electron/src/main/lib/review/review-v3-sdk-physical-turn-port.ts:1-10`）：只在真实的进程内 Pi SDK/Provider 集成能从**原生 per-request 生命周期钩子**报告"请求开始 + 终态/回执"时可用；**Pi SDKMessage、assistant UUID、被动 agent_end 都不算这样的钩子**（`:5-7`）。本文件不拥有 C ReviewRun/ACK、不制造 Provider 回执。

边界：**本文件不接任何原生钩子**——生产必须显式注入真实 engine（`:7-8`）；不数流式消息、不重试 engine（`:56-59` 类注释）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `V3APhysicalTurnInput` | interface（export） | `:18-23` | `{ run: RunEvidenceIdentity; dispatchId: string; mode: V3ASDKMode; signal? }` | 单次调用输入 |
| `V3ANativeProviderWitness` | interface（export） | `:30-38` | `{ requestStarted(nativeRequestId); requestFinished({nativeRequestId, nativeReceiptId, status}) }` | **唯一可信回调面**（`:25-29`） |
| `V3ANativeSingleRequestEngine` | interface（export） | `:40-48` | `invoke(input, witness): Promise<void>` | 必须禁用 SDK 原生重试/图片回退重查（`:42-45`） |
| `V3APhysicalSDKTurnPort` | class（export） | `:60-147` | `constructor(engine)` + `nextTurn(input)` | 实现 `V3AMainSDKTurnPort`（`review-v3-main-sdk-turn-bridge.ts:48`） |
| `deny` | const（内部） | `:50-52` | `(detail) => never` | 抛 `C0ContractError('RECOVERY_REQUIRED')` |
| `validId` | const（内部） | `:53-54` | 非空白字符串 ≤512 | id 校验 |

## 3. 内部逻辑与关键流程

`nextTurn`（`apps/electron/src/main/lib/review/review-v3-sdk-physical-turn-port.ts:68-147`）：

1. 前置校验（`:69-80`）：`assertC0RunEvidenceIdentity(input.run)`；`mode ∈ {direct,hidden,graph,batch}` 否则 `CASE_SCOPE_FORBIDDEN`；`dispatchId` 有效（≤512）否则 `CONTRACT_INVALID`；发起前 `signal.aborted` → `CASE_SCOPE_FORBIDDEN`。
2. 构造 witness 状态机（`:81-113`）：
   - `requestStarted`：`active` 为真、尚无 `nativeRequestId`/`result`、id 合法——任一违例置 `unsafe=true` 并 `deny('Multiple, late or missing native Provider request identities')`（`:91-97`）。**只允许一次 started**（第二次物理请求永久拒绝，`:42-45` 注释）。
   - `requestFinished`：必须 active、有 started、未有 result、`nativeRequestId` 匹配、`nativeReceiptId` 有效且 ≠ `input.dispatchId`、`status ∈ {completed,cancelled,timed-out,failed}`——任一违例 `deny('Missing, duplicated or mismatched native Provider completion')`（`:98-112`）。
3. `await engine.invoke(input, witness)`，finally `active=false`（`:115-121`）——invoke 抛出/中止时上游 dispatch fence 仍 in-flight（`:116-117` 注释："不能推断 Provider 没做工作"）。
4. 显式收窄捕获结果（`:122-129`，不用 `!` 非空断言）；`unsafe || !observed || id 不匹配` → `deny('Native SDK Provider receipt provenance unavailable')`（`:130-133`）。
5. 结果分派（`:134-146`）：abort 后 `deny('Main aborted after native SDK Provider dispatch')`；`status==='completed'` → `{kind:'completed-turn', run, dispatchId, receiptId}`；否则 `{kind:'interrupted', status, run, dispatchId}`。

## 4. 调用者与调用链

- **入向（生产装配）**：`apps/electron/src/main/lib/review/review-v3-a25-c11-local-execution-ports.ts:19`（import）、`:143`（`new V3APhysicalSDKTurnPort(...)`）。实现接口 `V3AMainSDKTurnPort`（`review-v3-main-sdk-turn-bridge.ts:48`），由 SDK turn bridge 消费（`bridge.next` 内部，跨批）。
- **出向**：`@profer/shared` 的 `assertC0RunEvidenceIdentity`/`C0ContractError`/`RunEvidenceIdentity`（`:11-13`）；类型依赖 `review-v3-main-sdk-turn-bridge.ts:15-16`。

## 5. 数据 I/O、读写与副作用

- 无磁盘/网络/持久化；副作用 = 调用注入的 `engine.invoke`（物理 Provider 请求）。
- 状态机变量 `active/nativeRequestId/result/unsafe`（`:81-88`）为单次调用内局部量，无共享可变状态。
- 幂等/重试：无——第二次物理请求被 witness 永久拒绝（`:42-45`）；本类不重试 engine。

## 6. 分支、失败、取消与恢复

- 拒绝（`C0ContractError`）：`ACTOR_UNTRUSTED`（构造 `:62-65`）、`CASE_SCOPE_FORBIDDEN`（mode/两处 abort `:70-80/:134-136`）、`CONTRACT_INVALID`（dispatchId `:73-76`）、`RECOVERY_REQUIRED`（witness 违例 `:94/:105/:132`）。
- **失败后状态**：invoke 抛出时 finally 关闭 witness（`active=false`），上游 dispatch fence 保持 in-flight → 需要显式恢复（`:116-117` 注释）。中断（非 completed）返回 `interrupted` 而非抛错（`:143-146`）。
- 取消语义：发起前 abort = 拒绝调用；发起后 abort = `deny(...)`（结果被拒，但物理请求已发生）。
- 不可恢复点：witness 违约（重复 started/finish 不匹配）即 `deny` + `unsafe`，该 dispatchId 不再可结算。

## 7. 权限与权威状态

- 无 sender/role 检查；信任边界是"注入的 engine 必须是 Main 拥有的真实原生集成"（构造校验 `:61-66` 仅查 `invoke` 存在，`:62-65`）。
- 回执权威 = `nativeReceiptId`（独立于 dispatchId，`:102` 强制两者不等，防止拿 dispatchId 冒充回执）；本类不生成回执（文件头 `:9`）。
- 与 dispatch fence 的分工：fence 管持久意图/结算，本类管"一次物理调用的见证完整性"。

## 8. 修改影响面

- 改 witness 状态机 → `review-v3-main-sdk-turn-bridge.ts` 的结算流程、`review-v3-a25-c11-local-execution-ports.ts:143` 装配。
- 改返回联合（`V3ATurnHostOutcome`）→ bridge 与 sequence driver（`review-v3-technical-sequence-driver.ts:105` 消费）。
- 无专属测试（§9），改动缺少回归保护。

## 9. 测试证据

- **直接测试：无**。负向检索：冻结树 `apps/`+`packages/` 全部 `*.test.*` 检索 `V3APhysicalSDKTurnPort|V3ANativeProviderWitness|physical-turn-port` → 0 命中。
- 间接：`review-v3-r22-concentrated.test.ts`（R22 端到端路径经 turn-bridge 用到本端口）——未逐条核对其是否触发 witness 分支。
- 未覆盖：witness 全部违例分支、abort 时序、completed/interrupted 返回。本轮 **NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 导出 + 2 内部；witness 状态机全分支 | 已证实 | 逐行读 `:1-148` |
| 不重试/不造回执/dispatchId≠receiptId | 已证实 | `:42-45`、`:9`、`:102` |
| 失败留 fence in-flight、abort 后 deny | 已证实 | `:115-121`、`:134-136` |
| 生产装配（a25-c11:143）与 bridge 消费 | 已证实 | §4 行号 |
| 真实 engine 是否已在生产注入 | 未知 | 文件头 `:7-8` 明示"production must inject"，注入点实现跨批未读 |
| r22 测试对 witness 分支的覆盖 | 未知 | 未逐条读 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `nextTurn` 前置/状态机/结果分派 | §3/§6 | `:68-147` | covered |
| 4 接口/类 + 2 内部 | §2 | `:18-54` | covered |
| 调用链 | §4 | 两侧行号 | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
| engine 注入实况 | §10 | — | unknown |

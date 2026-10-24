---
path: apps/electron/src/main/lib/review/review-v3-sdk-dispatch-fence.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a2a53f3927d29b65c492753fc372e060546b6908
sha256: 7b98a6ffad4d3ba6db7e49ff20719bd1dc70fb4ab13d211502a24caeff53cab4
lines: 271
kind: source
package: p05-review-engine
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-sdk-dispatch-fence.ts

## 1. 结论与边界

Dev-A A4 的**持久技术派发围栏**（文件头 `apps/electron/src/main/lib/review/review-v3-sdk-dispatch-fence.ts:1-8`）：在调用 SDK Provider 之前把"派发意图"持久化；进程死亡或 Provider 结果不明会留下 **IN-FLIGHT 意图，故意阻断同 attempt 重派发**，直到独立授权的恢复决定。回调的最终回执**不是业务 ACK**；本日志既非 ReviewRun 也非 C 的事务/outbox 权威。

边界：不执行 SDK 调用（在 turn-bridge/physical port）；不做 C 级事务；`technicalSnapshot` 只是 Main 当前 Owner 门禁下的读回（`:251` 注释），不是 C 物理 Host 真值来源。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `V3ATechnicalDispatchWitness` | interface（export） | `:20-27` | `{ dispatchId; grantId; caseId?; sessionId?; state:'in-flight'\|'settled'\|'late-denied'; technicalReceiptId? }` | "NEVER C2MainPhysicalHostReceipt"（`:19`） |
| `V3ASDKDispatchFence` | class（export） | `:109-271` | `constructor(store, owners)` + `claim/settle/lateDenied/assertUniqueReceipt/technicalSnapshot/unresolved` | 唯一类 |
| `SDKDispatchRecord/SDKDispatchChain/SDKDispatchDisk` | interface（内部） | `:28-45` | 磁盘信封 `version:'v3-dev-a-sdk-dispatch/1'` | 账本结构 |
| `hash/key/reject/initial/decode/pinned` | const/function（内部） | `:46-108` | 见 §3.1 | 校验与构造 |
| `pinned` | function（内部） | `:95-108` | `(lease) => RunEvidenceIdentity` | Run 冻结一致性，不匹配 `RUN_IDENTITY_MISMATCH` |

依赖：`OwnerPersistence/V3ReviewOwnerAdapter/V3OwnerLease`（`apps/electron/src/main/lib/review/review-pi-owner-adapter.ts:36/:62`）、`V3ReviewToolCall`（`review-execution-event-adapter.ts:31`）、`assertC0RunEvidenceIdentity/C0ContractError`（`@profer/shared`）。

## 3. 内部逻辑与关键流程

### 3.1 持久账本解码 `decode`（`:51-94`）

信封 `{payload, sha256}`（`:129` 写入形态）：JSON 损坏 → `reject('SDK dispatch journal JSON corrupt')`；版本/结构/seal 哈希不符 → `'seal mismatch'`（`:56-61`）。逐 run 校验（`:63-92`）：`runHash` 64hex、record id 唯一、`caseId/sessionId` **同有同无**（`:71`）、state 三值、`settled ⇔ receiptId 存在`（`:75-76`）、`in-flight`/`late-denied` 只能是链尾（`:77-81`，含旧 A4 代码"late-denied 后重派发"遗留的注释 `:78-80`：绝不隐式升级为干净 Run）；settled 回执**全账唯一**（`:85-90`）。

### 3.2 类方法（`V3ASDKDispatchFence`）

- `claim(call)`（`:136-182`）：仅 `review_submit_result`（`:137-139`）→ `owners.withAuthorizedEvent(...)` 内**同一同步边界**锁定授权与持久意图（`:135` 注释）：
  - `current()` 检查账本未被外部改动（`:117-119`）；`pinned(lease)` 校验 Run 冻结一致（`:144`）。
  - **跨 Run 隔离检疫**（`:148-158`）：其他 run 链尾若 `in-flight`/`late-denied` 且（旧记录缺 case/session 归属 **或** 同 case/同 session）→ `reject('Unresolved SDK Provider dispatch on prior Run/Case; recovery required')`——换 Run/attempt 不证明先前 Provider 工作已停（`:145-147` 注释）。
  - 本链尾 `in-flight` → `reject('…refusing automatic repeat')`（`:161-163`）；`late-denied` → `reject('…requires explicit recovery before repeat')`（`:167-169`）。
  - 新 record：`dispatchId=randomUUID()`，`state:'in-flight'`，携带 `grantId/caseId/sessionId`（`:170-178`）；`persist` 后返回 `{dispatchId, run: structuredClone(run)}`（`:179`）。
- `assertUniqueReceipt(run, id, receiptId)`（`:188-206`）：无当前 in-flight 匹配 → `reject('SDK receipt has no current in-flight dispatch')`（`:196-198`）；同一 `receiptId` 已被**其他** dispatch settled 使用 → `C0ContractError('REQUEST_ID_COLLISION')`（`:199-205`）——一次物理调用的回执不得证两次派发（`:183-187` 注释）。
- `settle(call, id, receiptId)`（`:208-231`）：`withAuthorizedEvent` 内校验链尾=本 claim（id/grantId/state）→ `assertUniqueReceipt` → 尾 record 改 `settled+receiptId` 持久化（`:224-228`）。
- `lateDenied(run, id)`（`:237-250`）：SDK promise 已结束但 grant 轮转/观察到 Main 取消 → 记 `late-denied`；**不复活死 grant**（`:232-236` 注释）；SDK 未决时崩溃则留 in-flight 需 C/操作员恢复。
- `technicalSnapshot(call)`（`:252-263`）：Owner 门禁读回 witness 列表。
- `unresolved(run)`（`:265-270`）：链尾 `in-flight`/`late-denied` 均需恢复，**绝不自动重试**（`:264`）。

### 3.3 持久化 `persist`（`:127-134`）

`current()` 后写 `{payload, sha256}`；优先 `store.compareAndWrite(revision, bytes)`，否则 `write`（`:130-131`）；内存 revision/disk 同步（`:132-133`）。

## 4. 调用者与调用链

- **入向（生产）**：`review-v3-main-sdk-turn-bridge.ts:18/:73`（构造注入 `dispatch: V3ASDKDispatchFence`），真实调用 `:165 claim`、`:194/:203 lateDenied`、`:222/:235 settle`；`review-v3-a-host-technical-handoff.ts`、`review-v3-a25-c11-local-execution-ports.ts`（装配/持有）。
- **测试入向**：`review-v3-r22-concentrated.test.ts`（R22 集中测试含多轮后台执行路径）。
- **出向**：`owners.withAuthorizedEvent/assertAuthorized`（`review-pi-owner-adapter.ts`）、`store.read/write/compareAndWrite`（`OwnerPersistence` `:62`）、`node:crypto`（`:9`）。

## 5. 数据 I/O、读写与副作用

- **磁盘**：`OwnerPersistence` 持久账本（信封带 sha256 seal，`:129`）；每 mutation 全量重写 + CAS（`compareAndWrite` 优先）。
- **读一致性**：`revision` 比较（`:114-119`）——外部改动即 `reject('…changed; re-open')`（fail-closed）。
- 副作用：`randomUUID()` 生成 dispatchId；无网络、无日志。
- 并发：`claim/settle` 在 `withAuthorizedEvent` 同步回调内完成读改写；类内无锁，跨进程并发靠 `compareAndWrite` + `current()` 防护（外部写检测）。

## 6. 分支、失败、取消与恢复

- 全部拒绝路径 `C0ContractError`：`RECOVERY_REQUIRED`（decode 系 `:55/:60/:65/:82/:87`、claim 隔离 `:156/:162/:168`、settle 无 claim `:221`、lateDenied 无未决 `:243`、账本变更 `:118`）、`RUN_IDENTITY_MISMATCH`（`:104/:123`）、`CASE_SCOPE_FORBIDDEN`（`:138`）、`CONTRACT_INVALID`（`:192/:210`）、`REQUEST_ID_COLLISION`（`:203`）。
- **恢复模型**：`in-flight`（进程死亡/结果不明）与 `late-denied`（SDK 结束但被否决）都**不自动重试**（`:264-270`），需要显式恢复决定（文件头 `:4-6`）。
- 崩溃语义：崩溃发生在 claim 后 settle 前 → in-flight 留存 → 同 attempt 重派发被拒（`:161-163`）。
- 无 AbortSignal 参与（取消经 `lateDenied` 记录，`:232-236`）。

## 7. 权限与权威状态

- `claim/settle` 均在 `owners.withAuthorizedEvent`（grant/actor/sender 校验由 Owner adapter 权威执行）；`technicalSnapshot/unresolved` 亦先 `assertAuthorized/pinned`。
- `pinned(lease)`（`:95-108`）比对 lease 与 `runEvidence/planSnapshot` 的 7 项一致性（caseId/runId/attemptId/generation/manifestHash/planFingerprint/fingerprint）→ 保证账本只挂在"冻结 Main Run"上。
- 状态权威：本账是**技术意图日志**（`:19/:35` 注释：technical observation, never a C Run ACK）；正式 ACK 权威在 C（跨批）。

## 8. 修改影响面

- 改状态机/账本格式 → `review-v3-main-sdk-turn-bridge.ts`（claim/lateDenied/settle 时序 `:165-235`）、旧账本兼容性（version 字符串 `:43/:56`，改版本名会使旧账 `reject`）。
- 改 `assertUniqueReceipt` 语义 → 重复回执/重放判定（bridge `:222/:235`）。
- 无专属测试（§9），回归依赖 r22 集成测试。

## 9. 测试证据

- **直接测试：无专属文件**。负向检索：冻结树 `apps/`+`packages/` 全部 `*.test.*` 检索 `V3ASDKDispatchFence|SDKDispatch|dispatch fence` → 仅 `review-v3-r22-concentrated.test.ts` 命中（集成路径）。
- 间接：`review-v3-r22-concentrated.test.ts`（describe `:121`）经真实 owner + 后台多轮执行覆盖 claim/settle 主路径；**逐条断言未读**（该文件属其他批手册范围）。
- 未覆盖（本批可见）：decode 全部损坏分支、跨 Run 检疫、late-denied 拒绝重派、回执全局唯一。本轮 **NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出 + 账本结构/校验全分支 | 已证实 | 逐行读 `:1-271` |
| in-flight/late-denied 拒绝自动重复；跨 Run 检疫 | 已证实 | `:145-169`、`:264-270` |
| 回执全账唯一、settled⇔receiptId | 已证实 | `:75-76`、`:85-90`、`:199-205` |
| CAS/revision 防外部改动 | 已证实 | `:117-119`、`:127-134` |
| 生产时序（bridge :165/:194/:222/:235） | 已证实 | §4 行号 |
| r22 对分支的实际覆盖强度 | 未知 | 未逐条读断言 |
| 多进程并发下的 OwnerPersistence 行为 | 未知 | `review-pi-owner-adapter.ts` 实现未逐行读 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `decode` 全校验 | §3.1 | `:51-94` | covered |
| `claim`/`settle`/`lateDenied`/`assertUniqueReceipt` | §3.2 | `:136-250` | covered |
| `technicalSnapshot`/`unresolved`/`persist`/`pinned` | §3.2/§3.3 | `:95-134`、`:252-270` | covered |
| 恢复/崩溃语义 | §6 | 注释+分支 | covered |
| 调用链 | §4 | 两侧行号 | covered |
| 测试 | §9 | — | partial（间接，NOT_RUN） |
| OwnerPersistence 实现 | §10 | — | unknown |

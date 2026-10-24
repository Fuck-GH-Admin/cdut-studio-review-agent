---
path: apps/electron/src/main/lib/review/review-v3-a-host-technical-handoff.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9f7c86ea98851b26df95739f212e87e140a7d720
sha256: 46b8e0e7907839cfd92ab952fc503eafb558120605d563aa9c440e4f6ff50fa7
lines: 165
kind: source
package: p05-review-engine
author: docs-r07-author-nb-30-20261023
reviewer: p04-review-case-core
status: authored
evidence: static
---
# apps/electron/src/main/lib/review/review-v3-a-host-technical-handoff.ts

## 1. 结论与边界

Dev-A R22-B：A 拥有的**不可变 TECHNICAL 证据信封**生成器——把 A 已验证的 Host read/check/terminal 提案链 + Owner 身份 + turn 预算 + SDK dispatch 见证打包成 `A22TechnicalEvidenceEnvelope`，供 C 独立比对。文件头明确：A 的提案**不是** C 独立观察的物理 Host receipt；本模块从不创建 `V3VerifiedHostReceipt`、Case/Run 写入或 ACK（`apps/electron/src/main/lib/review/review-v3-a-host-technical-handoff.ts:1-5`）。`canSealCReviewRun: false` 是信封字面常量（`:50,142`）。

边界：无 IPC/Renderer 入口（`:53` 注释「Main-bound live Owner + durable A ledgers」）；不做物理执行（那是 A23）；`verifyA22TechnicalEvidenceHash` 只比对 A 的原始哈希，**不是**独立验证 ACK（`:156`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `A22TechnicalEvidenceEnvelope` | interface | 26-52 | `{version:'v3-dev-a-host-handoff/1'; trust:'A_TECHNICAL_ONLY_C_PHYSICAL_OBSERVER_REQUIRED'; run:RunEvidenceIdentity; owner{sessionId,senderKey,generation,processEpoch,grantId,sourceVersionIds,planFingerprint,inputManifestHash}; planBindings[]; technicalEvents:AExecutionProposal[]; turnBudget:V3ATurnSnapshot; sdkDispatches:V3ATechnicalDispatchWitness[]; unresolvedProviderEffect:boolean; canSealCReviewRun:false; evidenceHash:string}` | `technicalEvents` 注释：A 验证的提案链，非 C Host 事实（`:45`） |
| `A22TechnicalEvidenceHandoff` | class | 54-146 | 构造 `(owners:V3ReviewOwnerAdapter, producer:V3AProposalProducer, turns:V3ATurnBudget, dispatch:V3ASDKDispatchFence)`；`snapshot(call:V3ReviewToolCall):A22TechnicalEvidenceEnvelope` | 唯一公共方法 `snapshot` |
| `verifyA22TechnicalEvidenceHash` | function | 157-165 | `(evidence:Readonly<A22TechnicalEvidenceEnvelope>) => boolean` | 校验 version/trust/canSealCReviewRun 字面量 + `evidenceHash===sha(payload)` |

内部：`stable`（`:17-23`，键排序稳定 JSON）、`sha`（`:24`，sha256(stable)）、`reject`（`:25`，抛 `C0ContractError('RECOVERY_REQUIRED')`）、`sameCheck`（`:147-151`，绑定四元组比较）、`verifyTechnicalEventDigest`（`:152-155`，`eventId===sha(payload)`，注释称与 A2 `createAV3ProposalId` 同哈希口径，`:93`）。

## 3. 内部逻辑与关键流程

`snapshot`（`:61-145`）顺序：

1. `:62` `call.tool!=='review_submit_result'` → reject（Main submit 能力必需）。
2. `:63-72` `owners.assertAuthorized(...)` 取 lease；lease 缺 runEvidence/planSnapshot 或 runId/attemptId/ownerGeneration/manifestHash/planFingerprint 五元与 lease 不一致 → reject `Owner lacks pinned execution identity`。
3. `:73-78` run/plan 缺失 → 抛 `C0ContractError('RUN_IDENTITY_MISMATCH')`。
4. `:79-83` `producer.replayCandidates()` 按 runId/attemptId/ownerGeneration 过滤后按 `sequence` 升序。
5. `:86-111` 逐事件校验：`stable(item.run)===stable(run)`、`sequence===i+1`（从 1 起连号）、`hostReceiptId`/`permissionGrantId` 非空、eventId 不重复、`verifyTechnicalEventDigest` 通过；`terminal` 之后再有事件 → reject；`read` 事件必须在冻结 Source 集内（lease.sourceIdentities 深比较 + `run.sourceVersionIds` 含该 documentVersionId，`:100-104`）；`check` 事件必须命中 plan.bindings 同四元组且 `run.checkKeys` 含 checkKey（`:105-110`）。
6. `:112-118` `turns.snapshot(lease)`、`dispatch.technicalSnapshot(call)`；`dispatch.unresolved(run)` 与「存在 in-flight/late-denied dispatch」布尔不一致 → reject。
7. `:121-122` **再次** `assertAuthorized`（多账本读取后重查，注释 `:119-120`：C 在 commit 时仍必须独立核当前物理 Host receipt）。
8. `:123-144` 组装 proof（`structuredClone` run/events/sdkDispatches），`evidenceHash=sha(proof)`（不含 evidenceHash 自身）。

## 4. 调用者与调用链

出向：`node:crypto`、`@profer/shared`（`C0ContractError`+类型）、`./review-execution-event-adapter`（类型）、`./review-pi-owner-adapter`（类型）、`./review-v3-execution-turn-budget`、`./review-v3-sdk-dispatch-fence`、`./review-v3-execution-proposal-producer`（`:6-15`）。

入向（冻结树检索，子 agent 调查 + 本会话复核）：

- `apps/electron/src/main/lib/review/review-v3-main-local-technical-review.ts:28-31,110,112`（`verifyA22TechnicalEvidenceHash(proposal)`）← `review-v3-main-local-execution-orchestrator.ts:19-20,45` ← 仅 `review-v3-main-local-execution-orchestrator.test.ts`——即 A 链**无产品入口**（review-ipc.ts/preload/main index/renderer 对本批 A 链 0 命中，检索式=模块名+符号名）。
- `apps/electron/src/main/lib/review/review-v3-a25-c11-local-execution-ports.ts:25-26,149,210`（`new A22TechnicalEvidenceHandoff`）。
- 测试：`review-v3-a25-c11-local-execution-ports.test.ts:13-14,150`、`review-v3-r22-concentrated.test.ts:25-26,210,224-225`、`review-v3-main-local-technical-review.test.ts:13,120`（均不在本批）。

## 5. 数据 I/O、读写与副作用

无写入。`snapshot` 只读四个注入账本（owners/producer/turns/dispatch）并返回新对象；`structuredClone` 隔离。唯一副作用是抛 `C0ContractError`（RECOVERY_REQUIRED/RUN_IDENTITY_MISMATCH）。持久化由注入的 `OwnerPersistence`（turns/dispatch/proposals）负责，不在本文件。

## 6. 分支、失败、取消与恢复

- 失败即抛（`reject`→`C0ContractError('RECOVERY_REQUIRED')`，`:25`；`RUN_IDENTITY_MISMATCH`，`:76-77`）；无返回错误码路径。
- 无异步/取消概念（`snapshot` 同步）。恢复语义：RECOVERY_REQUIRED 表示需人工/上层重建运行身份，本模块不重试。
- `verifyA22TechnicalEvidenceHash` 恒返回 boolean，不抛（`:157-165`，含 version/trust/canSealCReviewRun 三字面量检查）。

## 7. 权限与权威状态

权限闸门：`owners.assertAuthorized(sessionId, grantId, senderKey, principal, 'review_submit_result')` 两次（`:63-64,121-122`），且 lease 的 runEvidence 五元绑定校验（`:65-71`）。权威划分（`:2-4,45,156`）：本信封只有 `A_TECHNICAL_ONLY` 信任级；C 的物理 receipt 验证、Case/Run 写、ACK 均在别处；`canSealCReviewRun:false` 与 `verify…Hash` 注释共同声明「永不构成独立验证」。

## 8. 修改影响面

改事件校验/信封字段 → 影响 `review-v3-main-local-technical-review.ts:112` 的比对与 `review-v3-r22-concentrated.test.ts`/`review-v3-a25-c11-local-execution-ports.test.ts:150` 的 `verifyA22TechnicalEvidenceHash` 断言；`evidenceHash` 口径（`stable`+sha256）改动会破坏跨版本比对。`sameCheck` 四元组与 A23/A25 的 `checkTuple` 是平行实现（各自内联），改动需三处同步。

## 9. 测试证据

本批**无**直接测试文件（该模块无同名 .test.ts）。间接（不在本批，静态读到）：`review-v3-a25-c11-local-execution-ports.test.ts:150` `expect(verifyA22TechnicalEvidenceHash(handoff)).toBe(true)`（配合 `:149` `canSealCReviewRun` toBe false）；`review-v3-r22-concentrated.test.ts:224-225` 亦调用。**NOT_RUN**：本轮未执行测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 信封 `canSealCReviewRun:false` 字面恒定 | 已证实 | `:50,142` |
| 事件序列连号/哈希/冻结集三重校验 | 已证实 | `:86-111` |
| 双重 assertAuthorized（读账本后重查） | 已证实 | `:63-64,121-122` |
| 无产品入口（仅测试/内部链） | 已证实（否定结论，检索范围=baseline/source 全树模块名+符号名，入口层 0 命中） | grep + 子 agent 调查 |
| `verifyTechnicalEventDigest` 与 A2 同哈希口径 | 推断（注释 `:93`） | A2 实现不在本批未读 |
| 真实运行时信封分布 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `A22TechnicalEvidenceEnvelope` | §2 | 26-52 | covered |
| `snapshot` 8 步 | §3 | 61-145 | covered |
| `verifyA22TechnicalEvidenceHash` | §2, §6 | 157-165 | covered |
| `sameCheck`/`verifyTechnicalEventDigest` | §2 | 147-155 | covered |
| A2 哈希口径对齐 | §10 | 93 | unknown（注释级） |

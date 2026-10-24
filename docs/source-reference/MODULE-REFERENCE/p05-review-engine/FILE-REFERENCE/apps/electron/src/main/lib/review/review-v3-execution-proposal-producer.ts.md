---
path: apps/electron/src/main/lib/review/review-v3-execution-proposal-producer.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c4eb67ff185ecd889864431a898bee77c352fc84
sha256: 53c3edb1607eb10f89b93acd39cb44403906e42b8d97fec111276e398037b631
lines: 447
kind: source
package: p05-review-engine
author: docs-r07-author-nb-47-20261023
reviewer: p05-review-engine
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-execution-proposal-producer.ts

## 1. 结论与边界

Dev-A CR-A-001「执行提案」生产者：把 Main 真实物理 Host 的 read/check/terminal 回调固化为带稳定摘要的 AExecutionProposal 事件链（磁盘日志 `v3-dev-a-v3-proposals/1`），并提供 `terminalCandidate`（终态预检）与 `replayCandidates`（提案回放）。**技术证据层**：文件头 :1-8 明示不是第二个共享 DTO、不是正式 Run 写者、无 trusted consumer ACK、无通用 IPC；「A 提案」≠「C 独立观察的物理 Host 回执」。

不做的事：不写 ReviewRun/Case/Decision；不发业务 PASS；不自行验证权限（委托 `apps/electron/src/main/lib/review/review-pi-owner-adapter.ts` 的 `V3ReviewOwnerAdapter.assertAuthorized/withAuthorizedEvent`）；不做模型/SDK 调用。

## 2. 导出与关键符号

导出 8 条（`export` 逐条核 :21/:22/:24/:26/:40/:43/:87/:140）：

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `A_V3_PROPOSAL_SCHEMA` | const | `:21` | `'review-v3-execution/1'` | 契约 schema 版本字面量 |
| `ATechnicalStatus` | type | `:22-23` | `completed-technical\|partial\|cancelled\|timed-out\|needs-resume\|failed` | 6 值 |
| `ACheckStatus` | type | `:24` | `accepted\|rejected\|missing\|unknown` | 4 值 |
| `ACheckResult` | type | `:26-28` | CheckBinding 四元组 + `status` | check 结果形状 |
| `AExecutionProposal` | type | `:40` | `ProposalPayload & {eventId}` | 事件（read/check/terminal 三态联合 :36-39） |
| `AVerifiedExecutionHost` | interface | `:43-57` | `read/check/terminal` 三个 Promise 端口 | 「来自 Main 真实物理 Host，绝非 Renderer/Pi JSON」（:42 注释） |
| `createAV3ProposalId` | function | `:87-89` | `(payload) => sha256(stable(payload))` | 稳定摘要（键排序丢 undefined :71-77） |
| `V3AProposalProducer` | class | `:140-447` | 见 §3 | 主体 |

关键内部符号：`CheckBinding`（:25）、`EnvelopeBase`（:29-35）、`ProposalPayload`（:36-39）、`AttemptChain`（:58-64，runDigest/grantId/nextSequence/terminal/records）、`ProducerDisk`（:66-69）、`EnvelopeDisk`（:70，payload+sha 自封）、`stable/sha/mismatch/same/keyOf`（:71-85，`mismatch` 抛 `C0ContractError('RECOVERY_REQUIRED')` :80-82）、`load`（:90-135，重放校验）、`seal`（:136-138）。

类成员：`disk/revision/busy`（:141-143）、构造（:145-155，Host 形状校验失败抛 `ACTOR_UNTRUSTED` :149-152）、`fresh`（:156-160）、`store`（:161-171）、`pinned`（:172-183）、`assertAttemptOpen`（:184-191）、`completionFromDurableHostEvents`（:192-223）、`append`（:224-333）、`read`（:335-365）、`check`（:366-396）、`terminal`（:397-423）、`terminalCandidate`（:424-440）、`replayCandidates`（:442-446）。

## 3. 内部逻辑与关键流程

### 3.1 磁盘日志加载 `load`（:90-135）

null → 空盘；JSON/版本/sha 自封校验失败 → `V3 proposal journal unreadable/damaged`（:92-99）；逐链校验 `nextSequence === records.length+1`（:104）、runDigest 64 位 hex；逐事件：schemaVersion/序号连续/keyOf(run)===链键/sha(run)===runDigest/grantId 非空（首条须等于 chain.grantId :109-110）/eventId 摘要重算（:123-125）/hostReceiptId 唯一映射（:126-127，冲突 `V3 Host receipt collision on disk`）/terminal 封链后不得再有事件（:109 `sealed`）；`sealed !== chain.terminal` → `V3 terminal chain mismatch`（:133）。

### 3.2 `append`（:224-333，事务核心）

`busy` 互斥（:225-227、finally :330-332，重入 `Concurrent proposal append in one Owner`）。在 `owners.withAuthorizedEvent(call.sessionId/grantId/senderKey/principal/tool/source, lease=>…)` 租约内：
1. `fresh()` 复查磁盘 revision（防跨进程改写，:229）；`pinned(lease)` 六元 Run/Plan 身份核对（:172-183，缺 snapshot 或不匹配抛 `RUN_IDENTITY_MISMATCH`）。
2. turn 预算闸：`needs-resume` terminal 必须 `turnBudget?.exhausted(lease)` 为真（:234-239，否则 `CONTRACT_INVALID`）；非 terminal 在预算耗尽后禁写（:240-243，`RUN_IDENTITY_MISMATCH`）。
3. 链初始化/一致性：runDigest 与首条 grantId 校验（:245-256，`Frozen Run/grant collision`）。
4. `receiptId` 非空（:261-263，`Missing actual Host receiptId`）。
5. check 约束（:264-273）：与冻结 Plan binding **唯一**匹配（四元组）、`checkKey ∈ run.checkKeys`、sourceVersionIds ⊆ run、`accepted` 仅当 binding `applicability==='applicable'`，违者 `Check not in frozen applicable Plan/Run`。
6. terminal=completed-technical 需 `completionFromDurableHostEvents(lease)`（:274-279，否则 `Cannot complete without durable accepted Checks and physical source reads`）。
7. read 约束（:280-285）：`documentVersionId ∈ run.sourceVersionIds` 且 source 与 `lease.sourceIdentities` 逐字节相等（`same`），违者 `SOURCE_STALE`。
8. 组 payload（:287-300，`structuredClone(run)`；缺 detail → `CONTRACT_INVALID`）。
9. 封链后非 terminal 抛（:301-304 与 :314-316 双检，`Terminal proposal already sealed`）。
10. receipt 幂等（:305-313）：同 receiptId 找到旧事件时，除 sequence 外的 body 必须完全相等（`same`），否则 `REQUEST_ID_COLLISION`；相等则回放旧事件。
11. 落盘（:317-328）：`store` 写新链（nextSequence+1、`terminal: kind==='terminal'`），返回 `structuredClone(event)`。

### 3.3 `completionFromDurableHostEvents`（:192-223）

仅统计**当前 lease.grantId** 的事件（旧 grant 事件被 `continue` 跳过 :202，注释 :200-201）；read 累计 `documentVersionId`；check 按四元组去键——同 grant 内状态冲突直接判不完整（:208-214，注释：A 不得偏好较早 accepted）；`V3ExecutionCompletenessAdapter`（`review-execution-event-adapter-completeness.ts`）状态须 `'technically-complete'` 且所有 applicable binding 的 sourceVersionIds 全被 read 覆盖（:216-222）。

### 3.4 三个 Host 入口

- `read`（:335-365）：工具须 ∈ `review_read_documents/review_inspect_original/review_inspect_document_image` 且带 source（:336-339，否则 `SOURCE_STALE`）；`assertAuthorized` 两次（:340-345，第二次取 initialLease；**重复调用为现存实现观察**）；预算耗尽禁入（:346-348）；`assertAttemptOpen`（:349）；调 `host.read(structuredClone(call.source))`；调用后再 `assertAuthorized`（:351-353）；Host 回执逐字段核（actualSource 相等、extent ∈ block/full-document、full-document 时 covered===total>0 且均为安全整数 :354-361），否则 `SOURCE_STALE`。
- `check`（:366-396）：工具须 `review_submit_result`（:367-369，否则 `CASE_SCOPE_FORBIDDEN`）；binding 唯一匹配冻结 Plan 且 checkKey∈run（:377-381）；Host 回执四元组与 requested 完全相等、status 枚举（:383-394），否则 `RUN_IDENTITY_MISMATCH`。
- `terminal`（:397-423）：工具+状态枚举校验（:398-401，否则 `CONTRACT_INVALID`）；completed-technical 需完整覆盖证明（:404-408）；Host 回执状态须回显相等（:412-414）。

### 3.5 预检与回放

- `terminalCandidate(run)`（:424-440）：`assertC0RunEvidenceIdentity` + fresh；链不存在返回 null；runDigest 不符抛 `RUN_IDENTITY_MISMATCH`；`chain.terminal` 才返回最后一条（须为 terminal kind，否则 `Attempt declared sealed without technical terminal` :437-439）。用途：sealed attempt 不再花 Provider turn（注释 :419-423），不构成 C2 ACK。
- `replayCandidates()`（:442-446）：全部事件深拷贝；注释 :441 明示「pending=仅提案回放，Dev-C 未发 durable ACK」。

## 4. 调用者与调用链

入向（全冻结树 `*.ts` grep `from './review-v3-execution-proposal-producer'`）：
- `apps/electron/src/main/lib/review/review-v3-main-sdk-turn-bridge.ts:14`（类型 `AExecutionProposal`/`V3AProposalProducer`）。
- `apps/electron/src/main/lib/review/review-v3-a25-c11-local-execution-ports.ts:17`（装配进 C11 端口）。
- `apps/electron/src/main/lib/review/review-v3-a23-physical-host-observer.ts:20`（`A23ObservedHostTechnicalAdapter implements AVerifiedExecutionHost` :99，本文件的 Host 端口实现之一）。
- `apps/electron/src/main/lib/review/review-v3-a-host-technical-handoff.ts:14-15`（类型，A22-B 交接包）。
- 测试：`review-v3-r22-concentrated.test.ts:20`、`review-v3-r23-r24-concentrated.test.ts:7`（假 Host 注入）。

出向（imports :9-19）：`node:crypto` createHash；`@profer/shared` `assertC0RunEvidenceIdentity/C0ContractError` 与类型；`review-pi-owner-adapter`（OwnerPersistence/V3OwnerLease/V3ReviewOwnerAdapter）；`review-execution-event-adapter`（V3ReviewToolCall 类型）；`review-execution-event-adapter-completeness`（V3ExecutionCompletenessAdapter :194）；`review-v3-execution-turn-budget`（V3ATurnExhaustion 类型 :19）。

## 5. 数据 I/O、读写与副作用

- 磁盘日志：经注入的 `OwnerPersistence`（`v3-dev-a-v3-proposals/1`，键 `[runId,attemptId,ownerGeneration]` :84-85）；写路径 `store`（:161-171）：`fresh()` 后优先 `compareAndWrite`（跨进程 CAS），无则 `write`；写后更新 revision 与内存盘。sha 自封（:136-138）。
- 幂等：同 receiptId 同体回放旧事件（:305-313）；`busy` 防同 Owner 并发。
- 副作用：磁盘写、`withAuthorizedEvent` 租约审计（被调方）、`structuredClone` 隔离返回值。无网络、无模型调用。
- 数据流：`V3ReviewToolCall`（sessionId/grantId/senderKey/principal/tool/source）+ Host 回执 → 事件链；事件携带 `permissionGrantId`（每事件独立钉住自身 grant，:61 注释）。

## 6. 分支、失败、取消与恢复

- 错误码（`C0ContractError`）：`ACTOR_UNTRUSTED`（:152）、`RECOVERY_REQUIRED`（journal 损坏/跨进程变更 :80-82/:92-99/:157-159）、`RUN_IDENTITY_MISMATCH`（身份/预算/封链/check 约束多处）、`CONTRACT_INVALID`（needs-resume 未耗尽/缺 receiptId/缺 detail/completed-technical 无完整覆盖/Host 状态不回显）、`SOURCE_STALE`（read 越界/Host 回执不吻合）、`CASE_SCOPE_FORBIDDEN`（:368）、`REQUEST_ID_COLLISION`（:310）。
- 取消/恢复：无异步等待自身的取消语义（Host 调用是 Promise，调用方 abort 语义在 bridge/driver 层）；恢复=重新 `load` 校验（损坏即 RECOVERY_REQUIRED 不静默重建）；terminal 封链后不可恢复追加（:301/:314）。
- 不可恢复点：`mismatch` 类错误全部 fail-closed，无自动修复。

## 7. 权限与权威状态

- 入口逐能力校验（:336-339/:367-369/:398-401）+ 每次 Host 调用前后 `assertAuthorized`（:340-353/:370-373/:385-386/:410-411）。权限判定权威在 `V3ReviewOwnerAdapter`（本文件只传参）。
- Run/Plan 身份权威 = Main 冻结的 lease 快照（`pinned` :172-183 + `assertC0RunEvidenceIdentity`）；事件链权威 = 磁盘 sha 自封 + CAS。
- grant 语义：旧 grant 事件不计入新 grant 的完成证明（:200-202），但可作为 replay 候选（注释 :257-260）；`Dev-C decides whether old events survive C2 consumption`（照实记录为未决语义）。
- 无 sender/role 派生逻辑（身份来自 call.principal/senderKey，由 Owner 校验）。

## 8. 修改影响面

- 改事件形状/摘要算法（`stable`/`createAV3ProposalId`）会破坏磁盘日志重放（load 重算摘要 :123-125）与 C 侧 `validateV3ExecutionProposal`（`review-v3-execution-contract.ts:68`）的 digest 契约。
- 消费链：`review-v3-main-sdk-turn-bridge.ts`（turn 事件）、`review-v3-a25-c11-local-execution-ports.ts`（装配）、`review-v3-a-host-technical-handoff.ts`（交接包 evidenceHash）、`review-v3-a23-physical-host-observer.ts`（Host 端口实现）。
- 测试同步：`review-v3-r22-concentrated.test.ts`（R22-B-01 序列 1/2/3 + 交接包）、`review-v3-r23-r24-concentrated.test.ts`（R23-01/02/03）。

## 9. 测试证据

直接测试（均批外文件，NOT_RUN）：
- `review-v3-r22-concentrated.test.ts`（批内）：R22-B-01（:201-229）用假物理 Host 走 read/check/terminal 断言 sequence `[1,2,3]`、交接包 `trust:'A_TECHNICAL_ONLY_C_PHYSICAL_OBSERVER_REQUIRED'`、`canSealCReviewRun:false`、evidenceHash 篡改→false、`isCurrent` 失效→抛。
- `review-v3-r23-r24-concentrated.test.ts`（批内）：R23-01（:108-122）read/check/terminal 经真实 executor+独立观察钩子，快照 `cHostReceiptVerified:false`；R23-02（:124-135）撤销/缺观察者→read 抛、`needsRecovery()`、terminal 抛 'uncertain'；R23-03（:137-154）复用物理 receipt→'duplicate receipt'。
- 未覆盖（全树 `*.test.ts` 检索）：`load` 损坏分支、`terminalCandidate`/`replayCandidates`、跨 grant 覆盖统计（:192-223）、receipt 幂等回放（:305-313）、`REQUEST_ID_COLLISION`。mock 边界：假 Host 对象注入（非真实物理 Host）；Owner/租约为真实 `V3ReviewOwnerAdapter`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 8 条与 §2 一致 | 已证实 | :21-140 |
| 磁盘日志 sha 自封 + 链光标/摘要/终态封链校验 | 已证实 | :90-135 |
| needs-resume 需预算耗尽、耗尽后禁非 terminal | 已证实 | :234-243 |
| check 唯一 binding/accepted 仅 applicable | 已证实 | :264-273 |
| receipt 幂等回放 + 换体 `REQUEST_ID_COLLISION` | 已证实 | :305-313 |
| terminal 封链后再 append 抛（双检） | 已证实 | :301-304/:314-316 |
| 旧 grant 事件不计新 grant 完成 | 已证实 | :200-202 |
| `read()` 内 `assertAuthorized` 连续两次（:340 与 :342-345） | 已证实（现存实现观察，重复但不冲突） | :340-345 |
| C2 对旧 grant 事件的存续语义 | 未知（注释自述由 Dev-C 决定） | :257-260 |
| `V3ExecutionCompletenessAdapter` 内部判定 | 未知（属他文件，未逐行读） | :194/:216 |
| 真实物理 Host 的回执伪造风险 | 未知（Host 由 Main 注入，威胁模型在装配层） | :42 注释 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `A_V3_PROPOSAL_SCHEMA`/3 类型/`ACheckResult`/`AExecutionProposal`/`AVerifiedExecutionHost`/`createAV3ProposalId` | §2 | :21-89 | covered |
| `load`/`seal`/`stable` | §3.1 | :71-138 | covered |
| `append` 11 步 | §3.2 | :224-333 | covered |
| `completionFromDurableHostEvents` | §3.3 | :192-223 | covered |
| `read`/`check`/`terminal` | §3.4 | :335-423 | covered |
| `terminalCandidate`/`replayCandidates` | §3.5 | :424-446 | covered（无测试） |
| 错误码矩阵 | §6 | 见 §6 | covered |
| `load` 损坏分支/幂等回放 | §9 | :90-135/:305-313 | unknown（无断言） |
| C2 旧 grant 存续语义 | §10 | :257-260 | unknown |

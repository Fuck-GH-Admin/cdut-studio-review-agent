---
path: apps/electron/src/main/lib/review/review-v3-main-local-technical-review.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: cef3d6cabec544d63dfb9f828fcf81230bc2adae
sha256: bd4ebc7ad27b20f5409d16d4c4cc73ab5b7454ed5f3044804aa9cb23eb518048
lines: 212
kind: source
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-main-local-technical-review.ts

## 1. 结论与边界

C-R11 本地优先的 Pi/Host 候选审阅（**只读**）：对 A22 技术信封做哈希/身份校验后，用独立物理 Host 见证 + 真实案卷原件逐事件核验，产出 `C11LocalCandidatePreview`（人工审阅或恢复必需）。不调用 C 的正式 admit/record/seal、不铸物理 Host 回执、不证明学校政策或官方决定（文件头 `apps/electron/src/main/lib/review/review-v3-main-local-technical-review.ts:1-13`）。

边界：

- A22 信封是**不可信技术提议**，即使有哈希（`:10-12`）；只有 C 活 Owner、物理原件字节与独立 Host 观察者能让单条观察进入人工审阅。
- Gate L 是未来集成门，不是本地能力前置（`:6-8`）。
- 无 IPC 注册（`Main-only, no IPC registration`，`:69`）。

## 2. 导出与关键符号

`export` 逐条核对：2 个接口 + 1 个类 + 1 个函数 = 4 个导出（常量 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `C11LocalReviewSource` | 接口（导出） | 47-50 | `C2MainPhysicalHostSource & {readCurrentCase(run):CaseAggregateV2\|undefined}` | 特权 Main 观察者 + 当前案卷读取；禁止返回路径不存在的合成 Case（`:48`） |
| `C11LocalCandidatePreview` | 接口（导出） | 51-67 | `{version:'c11-local-candidate-preview/1',status:'local-manual-review'\|'local-recovery-required',officialSchoolApproved:false,schoolPolicyPublished:false,businessWriteAllowed:false,formalReviewRunSealed:false,hostSource:'independent-c-main-physical-observer',caseId,runId,sourceVersionIds,seenPhysicalEvents,readCount,checkCount,terminalObserved,unresolvedProviderEffect}` | 只读预览 |
| `C11MainLocalTechnicalReview` | 类（导出） | 70-201 | `inspect(proposal):C11LocalCandidatePreview`；`close()` | 审阅端口 |
| `createC11MainLocalReview` | 函数（导出） | 204-212 | `(observer)=>C11MainLocalTechnicalReview` | 生产缺省适配：`readCurrentCase: run=>readAggregate(run.caseId)`（`:210`） |
| `reject` | 内部 | 34-36 | 抛 `C0ContractError('RECOVERY_REQUIRED','C_R11_LOCAL_'+x)` | |
| `canon`/`same` | 内部 | 37-44 | 键排序 JSON 规范化/相等 | 与 host-receipt-registry 同算法 |
| `current` | 内部（私有） | 78-101 | `(run)=>{owner,aggregate}` | 案卷/Owner/原件当前性 |

## 3. 内部逻辑与关键流程

### 3.1 当前性（`current`，`:78-101`）

1. 关闭 → `PORT_CLOSED`；`assertC0RunEvidenceIdentity(run)`（`:81-82`）。
2. `isC2RunDurablyFenced(run)` → `RUN_WIDE_DURABLE_FENCE`（`:83`）。
3. `readCurrentCase(run)` 必须存在、`caseV2.id===run.caseId`、`stage==='reviewing'`、`canonicalPlan.fingerprint===run.planFingerprint`、`canonicalPlan.templateVersion===run.templateVersion`、**无** `d2RuntimePlan`，否则 `MAIN_CASE_AND_LOCAL_FROZEN_PLAN_NOT_CURRENT`（`:84-91`）。
4. `getCurrentOwner(run)` 必须存在、`active`、有 `permissionGrantId`、`same(owner.run,run)`、`ownerGeneration`/`inputManifestHash` 对齐，否则 `MAIN_OWNER_GRANT_NOT_CURRENT`（`:92-97`）。
5. `run.sourceVersionIds` 非空且唯一，否则 `RUN_SOURCES_NOT_UNIQUE`（`:98-100`）；逐个 `assertC2PhysicalOriginalBytes(aggregate, versionId)`（`:101`）。

### 3.2 `inspect(proposal)`（`:105-199`）

1. 关闭 → `PORT_CLOSED`；信封必须过 `verifyA22TechnicalEvidenceHash`、`trust==='A_TECHNICAL_ONLY_C_PHYSICAL_OBSERVER_REQUIRED'`、`canSealCReviewRun===false`，否则 `A_TECHNICAL_HANDOFF_INVALID_OR_CLAIMS_AUTHORITY`（`:106-111`）。
2. `before=this.current(run)`；A 的 owner 五字段（generation/planFingerprint/inputManifestHash/grantId/sourceVersionIds）必须与 C 侧一致，否则 `A_OWNER_DOES_NOT_MATCH_INDEPENDENT_C_OWNER`（`:112-119`）。
3. `technicalEvents` 数组 1–8192 条，否则 `TECHNICAL_EVENT_SET_INVALID_OR_NO_PHYSICAL_PROOF`（`:120-122`）。
4. 新建 `C2MainPhysicalHostReceiptRegistry(this.source,{isRunFenced:isC2RunDurablyFenced})`（`:123-125`）；`try` 内逐事件（`:128-178`）：
   - 身份/序列：`sequence===i+1`、`hostReceiptId` 不重复、`permissionGrantId` 与 C Owner 一致、`same(event.run,run)`、`kind∈{read,check,terminal}`、terminal 之后无事件，否则 `A_EVENT_IDENTITY_SEQUENCE_OR_GRANT_INVALID`（`:130-138`）。
   - `eventId` 必须等于 `executionProposalId(body)`（剥离 eventId 后），否则 `A_EVENT_DIGEST_INVALID`（`:139-141`）。
   - `registry.rememberObservedReceipt` + `getPhysicalHostReceipt`：必须有物理回执且 grant/kind 一致，否则 `INDEPENDENT_C_HOST_CALLBACK_MISSING`（`:142-148`）。
   - `read`：物理 read 的 source/extent 与 A 一致（`C_HOST_READ_OR_SOURCE_NOT_EQUAL`，`:150-154`）；案卷中恰有 1 份 active 文档（`versionId`+`documentId` 匹配）且 `byteHash===rawSha256`，否则 `C_HOST_READ_ORIGINAL_SHA_NOT_PINNED_TO_REAL_CASE`（`:155-160`）。
   - `check`：物理 check 一致（`C_HOST_CHECK_NOT_EQUAL`，`:163-166`）；`canonicalPlan.bindings` 中存在同 `checkKey/targetKey/objectKey/subjectId` 的绑定、`checkKey` 在 `run.checkKeys`、绑定来源 ⊆ run 来源，否则 `CHECK_NOT_BOUND_TO_LOCAL_FROZEN_PLAN`（`:167-172`）。
   - `terminal`：`terminalStatus` 一致（`C_HOST_TERMINAL_NOT_EQUAL`，`:175-177`）。
5. 事后 `after=this.current(run)`；owner/`caseV2.revision`/`canonicalPlan` 任一变化 → `MAIN_CASE_OR_OWNER_CHANGED_AFTER_OBSERVING`（`:180-185`）。
6. `recovery = proposal.unresolvedProviderEffect || proposal.sdkDispatches.some(x=>x.state==='in-flight'||x.state==='late-denied')`（`:186-188`）。
7. 返回预览：`status=recovery?'local-recovery-required':'local-manual-review'`，`seenPhysicalEvents=events.length`、`readCount/checkCount/terminalObserved/unresolvedProviderEffect`，固定四 false 与 `hostSource`（`:189-197`）。
8. `finally { registry.close() }`（`:198`）——注册表一次性，用完即关（`review-v3-main-host-receipt-registry.ts:165-168`）。

## 4. 调用者与调用链

入向（冻结树 grep）：

- 生产：`review-v3-main-local-execution-orchestrator.ts:21-23` **仅 type import**（`C11LocalCandidatePreview`/`C11MainLocalTechnicalReview`）；无生产实例化（`createC11MainLocalReview` 生产 0 命中）。
- 测试：`review-v3-main-local-technical-review.test.ts:15-17`（`:128` `new C11MainLocalTechnicalReview(provider)`；`:203,207` `createC11MainLocalReview`）。

出向：`@profer/shared`（`assertC0RunEvidenceIdentity`、`C0ContractError`）；`case-store-v2.ts:51`（`readAggregate`，经 `createC11MainLocalReview:210`）；`review-v3-main-trust-port.ts:68`（`assertC2PhysicalOriginalBytes`）；`review-v3-main-host-receipt-registry.ts`（注册表，`:123`）；`review-v3-durable-host-fence.ts:60`（`isC2RunDurablyFenced`）；`review-v3-a-host-technical-handoff.ts:157`（`verifyA22TechnicalEvidenceHash`）；`review-v3-execution-contract.ts:59`（`executionProposalId`）。

## 5. 数据 I/O、读写与副作用

- 读：案卷聚合（`readCurrentCase`）与每个 run 来源的物理原件字节（`assertC2PhysicalOriginalBytes` 重哈希，`:101`）。
- 写：**无**。不写案卷、不铸回执、不写盘；注册表是内存且 `finally` 关闭。
- 副作用：无日志/通知/网络。
- 并发/原子性：`inspect` 全程同步；事后复核（`:180-185`）防观察期间案卷/Owner 变化。

## 6. 分支、失败、取消与恢复

| 错误（`C0ContractError('RECOVERY_REQUIRED','C_R11_LOCAL_'+...)`） | 触发 | 行 |
| --- | --- | --- |
| `ACTUAL_C_MAIN_OWNER_CASE_AND_HOST_PORT_REQUIRED` | 构造缺端口 | 76 |
| `PORT_CLOSED` | 关闭后调用 | 81,106 |
| `RUN_WIDE_DURABLE_FENCE` | 持久围栏命中 | 83 |
| `MAIN_CASE_AND_LOCAL_FROZEN_PLAN_NOT_CURRENT` | 案卷/计划不当前 | 91 |
| `MAIN_OWNER_GRANT_NOT_CURRENT` | Owner/grant 失效 | 97 |
| `RUN_SOURCES_NOT_UNIQUE` | 来源重复/为空 | 99 |
| `A_TECHNICAL_HANDOFF_INVALID_OR_CLAIMS_AUTHORITY` | 信封哈希/声明非法 | 111 |
| `A_OWNER_DOES_NOT_MATCH_INDEPENDENT_C_OWNER` | A/C Owner 不符 | 119 |
| `TECHNICAL_EVENT_SET_INVALID_OR_NO_PHYSICAL_PROOF` | 事件集非法 | 122 |
| `A_EVENT_IDENTITY_SEQUENCE_OR_GRANT_INVALID` | 序列/身份/终态后事件 | 138 |
| `A_EVENT_DIGEST_INVALID` | eventId 摘要不符 | 141 |
| `INDEPENDENT_C_HOST_CALLBACK_MISSING` | 无物理回执 | 148 |
| `C_HOST_READ_OR_SOURCE_NOT_EQUAL`/`C_HOST_READ_ORIGINAL_SHA_NOT_PINNED_TO_REAL_CASE` | read 不符 | 154,160 |
| `C_HOST_CHECK_NOT_EQUAL`/`CHECK_NOT_BOUND_TO_LOCAL_FROZEN_PLAN` | check 不符 | 166,172 |
| `C_HOST_TERMINAL_NOT_EQUAL` | terminal 不符 | 177 |
| `MAIN_CASE_OR_OWNER_CHANGED_AFTER_OBSERVING` | 事后漂移 | 185 |
| `REAL_PHYSICAL_HOST_OBSERVER_NOT_INSTALLED` | 工厂缺观察者 | 207 |

- 失败语义：全部**抛错**（`reject`）；唯“恢复”是返回 `status:'local-recovery-required'`（`:186-196`，当 `unresolvedProviderEffect` 或 SDK 未收尾）。无取消/重试；`close()` 后不可再用（`:200`）。

## 7. 权限与权威状态

- 权威来自 `C11LocalReviewSource`（C 真实 Owner/Host 观察 + 真实案卷）；A 信封只作“待核提议”（`:10-12`）。
- 逐事件都要求独立 Host 回执存在且一致（`:142-148`）——A 事件不能自我登记为物理（`:105-108` 注释）。
- 输出固定四个 false 标志与 `hostSource:'independent-c-main-physical-observer'`（`:189-197`）；测试断言 `readAggregate(caseId).v3ReviewRun` 未被写（`review-v3-main-local-technical-review.test.ts:150`）。

## 8. 修改影响面

- 改 `C11LocalCandidatePreview` 影响 orchestrator（类型）与测试。
- 改事件校验影响 A22 信封生产方（`review-v3-a-host-technical-handoff.ts`）与 7 个测试。
- 改 `current` 的案卷/计划判定影响与 `plan-binding-v3`/`case-store-v2` 的一致性契约。

## 9. 测试证据

直接测试：`apps/electron/src/main/lib/review/review-v3-main-local-technical-review.test.ts`（210 行，7 个 `test(`，详见该文件手册）。覆盖：真实物理 read + 案卷原件 → manual-review 且不写 `v3ReviewRun`；无独立 Host 一律拒（自封提议）；Owner 撤销/原件篡改/Grant 轮换/A 篡改/物理 read 不符拒绝；空事件集拒绝；未知 Provider 效果 → `local-recovery-required`；冷进程不信 A 的 Host 快照。

`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

缺口：`check`/`terminal` 事件正例、`RUN_SOURCES_NOT_UNIQUE`、`MAIN_CASE_AND_LOCAL_FROZEN_PLAN_NOT_CURRENT` 的 D2 计划分支、`RUN_WIDE_DURABLE_FENCE`、8192 上限、事后漂移分支均无独立用例。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 只读、无 IPC | 已证实 | `:69`；全文无写/`ipcMain` |
| 每事件必须有独立 Host 回执 | 已证实 | `:142-148` |
| read 钉到真实案卷原件 SHA | 已证实 | `:155-160` |
| check 绑定到本地冻结计划 | 已证实 | `:167-172` |
| 事后复核 + recovery 判定 | 已证实 | `:180-197` |
| 生产无实例化（仅类型引用） | 已证实（检索范围：冻结树 `apps`+`packages` 非测试 `*.ts`/`*.tsx`） | 类/工厂仅测试实例化 |
| `check`/`terminal` 正例行为 | 未知 | 无用例 |
| A22 信封生产路径 | 未知（文件外） | 未读信封构造端 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `current` 全分支 | §3.1 | 78-101 | covered |
| 信封/Owner 校验 | §3.2 | 106-122 | covered |
| 事件循环（read/check/terminal） | §3.2 | 128-178 | covered |
| 事后复核/预览 | §3.2 | 180-197 | covered |
| `createC11MainLocalReview` | §2,§4 | 204-212 | covered |
| 权限/只读 | §5,§7 | 101,142-160,189-197 | covered |
| check/terminal 正例/上限/围栏 | §9,§10 | — | unknown |

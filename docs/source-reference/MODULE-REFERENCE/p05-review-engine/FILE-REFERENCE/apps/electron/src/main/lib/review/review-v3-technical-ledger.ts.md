---
path: apps/electron/src/main/lib/review/review-v3-technical-ledger.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a3378792a1e2f3a3b8a5d214a969746054c33d8b
sha256: db85fefbb88ec1a9232816fe4b5391802b4869507250b24dfec1eae5823dc27b
lines: 285
kind: source
package: p05-review-engine
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-technical-ledger.ts

## 1. 结论与边界

C2/R00 —— **Main-only、CAS 支撑的技术执行提案日志**（文件头 `apps/electron/src/main/lib/review/review-v3-technical-ledger.ts:1-8`）：准入与消费刻意**不做 Renderer IPC**；C Main 调用方必须在提交时独立核验冻结输入清单/Owner/物理 Host 回执。日志状态**从不授予**正式 ReviewRun、Check、ReadReceipt、学校 Decision 或外部 Outbox ACK。

边界：不启动 SDK、不证明物理 Provider 请求发生（`admit` 注释 `:181-182`）；校验是"完整性/来源一致性"，不替代 Main 的真实 Owner/物理 Host/注册策略核验（`:64-67`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `C2TrustedHostEvidence` | interface（export） | `:22-26` | `{ permissionGrantId; grantActive; receipts: ReadonlyMap<string, V3VerifiedHostReceipt> }` | C Main 提供的可信 Host 证据 |
| `C2PrepareAttestation` | type（export） | `:28-30` | `(aggregate, run) => void` | 准入证明回调 |
| `C2VerifyHostAtCommit` | type（export） | `:32-34` | `(aggregate, event) => C2TrustedHostEvidence` | 提交时 Host 核验回调 |
| `assertV3TechnicalJournalIntegrity` | function（export） | `:69-131` | `(aggregate) => journal` | 全链完整性校验 |
| `rawV3TechnicalEventChainDigest` | function（export） | `:136-142` | `(journal) => string` | 纯事件链摘要 |
| `digestV3TechnicalEventChain` | function（export） | `:145-147` | `(aggregate) => string` | 校验后摘要 |
| `admitV3TechnicalRun` | function（export） | `:183-210` | `(caseId, command, attestAtCommit) => Promise<ReviewCommandResult>` | 唯一准入入口 |
| `recordV3TechnicalProposal` | function（export） | `:213-285` | `(caseId, command, verifyHostAtCommit) => Promise<ReviewCommandResult>` | 逐事件记录入口 |
| `stageGuard/currentVersions/canonical/sameRun/frozenInputDigest/assertPreparedPlan` | function（内部） | `:36-62`、`:149-176` | 见 §3.1 | 纯校验/摘要 |

依赖：`CommandValidationError/payloadHash/submitCommand`（`apps/electron/src/main/lib/review/case-store-v2.ts:264/:187/:203`）、`executionProposalId/validateV3ExecutionProposal`（`review-v3-execution-contract.ts:59/:68`）、`assertC2HostRunNotFenced`（`review-v3-durable-host-fence.ts:51`）。

## 3. 内部逻辑与关键流程

### 3.1 内部纯函数

- `stageGuard`（`:36-39`）：`stage==='archived'` → `INVALID_TRANSITION`（"已归档案卷不能执行技术审核"）。
- `currentVersions`（`:40-42`）：active 文档 versionId 集。
- `canonical`（`:43-49`）：键排序递归 JSON（确定性序列化）；`sameRun`（`:50-51`）用之比较。
- `frozenInputDigest`（`:57-62`）：**剔除** `receiptLog/v3TechnicalExecution/v3ReviewRun` 与 `revision/updatedAt` 后对 `{caseInputs, business}` 取 sha256——注释 `:53-56`：任何真实业务变更（含带外）必须使先前冻结准入失效。
- `assertPreparedPlan`（`:149-176`）：stageGuard + `assertC2HostRunNotFenced` + 唯一 `canonicalPlan`（`d2RuntimePlan` 存在即拒绝 `:153-155`）+ Run 与 Plan 身份 5 项一致（`:157-162`）+ 声明的 `sourceVersionIds/checkKeys` 覆盖唯一 Plan 检查与真实材料版本（`:163-174`）。

### 3.2 `assertV3TechnicalJournalIntegrity`（`:69-131`）

无日志/无 Plan → `DEPENDENCY_UNRESOLVED`（`:71-73`）；Run 4 项一致（caseId/planFingerprint/templateVersion/frozenInputDigest，`:75-80`）→ `STALE_INPUT`；准入回执恰 1 条且 `caseRevision===admittedAtRevision`（`:81-87`）；events ≤4096（`:88-90`）；`RecordV3TechnicalProposal` 回执数 == events 数（`:91-96`）；逐事件校验（`:99-125`）：序号连续、eventId 自证（`executionProposalId(body)` 重算 `:107`）、回执 revision/requestId/payloadHash 三点匹配（`:108-110`）、`hostReceiptId` 非空且全局唯一（`:111`）、**terminal 之后不得再有事件**（`:112`）、read 事件的 `rawSha256` 与当前 active 文档 byteHash 一致（`:118-124`）；终态与末事件一致（`:126-129`）。

### 3.3 `admitV3TechnicalRun`（`:183-210`）

`attestAtCommit` 非函数 → 同步 `C0ContractError('BLOCKED_AUTH')`（`:188-189`，测试证明是同步抛）；`submitCommand(type:'AdmitV3TechnicalRun')` CAS 内：`assertPreparedPlan` → 已有日志即 `INVALID_TRANSITION`（`:192-194`）→ `run.caseRevision === revision+1`（`:195-196`）→ `attestAtCommit` → `mutate` 写入 `{run, frozenInputDigest, admittedAtRevision: revision+1, events: []}`（`:198-208`）。

### 3.4 `recordV3TechnicalProposal`（`:213-285`）

`verifyHostAtCommit` 非函数 → `BLOCKED_AUTH`（`:218-219`）；CAS 内顺序：stageGuard → **requestId 必须 === event.eventId**（`:222-224`，"禁止绕过精确幂等回执"）→ journal 完整性 + `assertC2HostRunNotFenced`（`:225-226`）→ Run/Plan 身份（`:229-231`）→ **准入后除本账回执外不得有任何业务变更**（`:235-238`）→ 未终态（`:239-240`）→ events <4096（`:241-243`）→ read 事件 byteHash 核验（`:244-250`）→ `verifyHostAtCommit` 证据四点校验（`:251-255`）→ 组装 `V3TrustedConsumptionContext`（`:256-266`）→ `validateV3ExecutionProposal` 必须返回 `'new'`（已记录事件仅同 requestId 重放，`:269-272`）→ `mutate` 追加事件（terminal 时写 `terminalStatus`，`:275-283`）。

## 4. 调用者与调用链

- **入向（生产）**：`apps/electron/src/main/lib/review/review-v3-main-trust-port.ts:23`（import）、`:196`（admit）、`:201`（record）——唯一生产入口；`review-v3-run-writer.ts:20-23`（integrity/digest 三函数）。
- **测试入向**：`review-v3-technical-ledger.test.ts`（7 用例）、`review-v3-run-writer.test.ts`（seed/record 辅助）。
- **出向**：`case-store-v2`（submitCommand CAS/payloadHash/CommandValidationError）、`review-v3-execution-contract`（事件 ID/校验器）、`review-v3-durable-host-fence`、`@profer/shared` 类型与 `assertC0RunEvidenceIdentity`。

## 5. 数据 I/O、读写与副作用

- 数据落在 `CaseAggregateV2.v3TechnicalExecution`（经 `submitCommand` CAS + receiptLog）；本文件不直接写盘。
- 幂等：`requestId===event.eventId` 精确重放（同 requestId 返回既有回执，不新增 revision——测试 `review-v3-technical-ledger.test.ts:121-128` 断言）。
- 并发：全部经 `submitCommand` 序列化 CAS；`expectedRevision` 不符由 store 拒绝（`VERSION_CONFLICT` 语义在 case-store-v2）。
- 副作用：无网络/无进程操作；`structuredClone`（`:201/:278`）防别名。

## 6. 分支、失败、取消与恢复

- `CommandValidationError` 错误码族：`INVALID_TRANSITION`（准入重复 `:193`、终态后写 `:240`、上限 `:242`、完整性系 `:86/:89/:95/:113/:127`）、`STALE_INPUT`（身份/冻结摘要/带外变更/byteHash `:79/:162/:173/:231/:238/:248`）、`DEPENDENCY_UNRESOLVED`（缺 Plan/Host 证据 `:72/:154/:228/:254`）、`VALIDATION_FAILED`（requestId≠eventId `:223`）、`REQUEST_ID_COLLISION`（已记录事件非同键重放 `:271`）、`VERSION_CONFLICT`（`:196`）；`BLOCKED_AUTH`（缺回调 `:189/:219`）。
- 恢复：完整性失败即"需明确恢复"（`:113-114`）；无自动修复。取消：不适用（无 AbortSignal；提交原子）。
- 历史稳定：`rawV3TechnicalEventChainDigest` 纯历史摘要，后续无关决定不影响（`:133-135` 注释）。

## 7. 权限与权威状态

- **回调即权限边界**：`attestAtCommit`/`verifyHostAtCommit` 必须由 C Main 提供（`:20-21` 注释"not a Renderer-controllable shared DTO"；`:188/:218` fail-closed）；Host 证据要求 `grantActive===true` + 有效 `permissionGrantId`（`:252-255`）。
- Actor 由 `submitCommand` 命令信封承载；本文件不构造 Principal。
- 权威状态：journal 只是"技术执行证据账"（`:199` summary 自述"不授予正式运行或决定"）；`terminalStatus` 为技术终态。

## 8. 修改影响面

- 改 `assertV3TechnicalJournalIntegrity` → `review-v3-run-writer.ts`（seal/read 两处依赖）、trust-port、两测试文件。
- 改事件/回执校验 → `validateV3ExecutionProposal`（execution-contract，跨批）与 `case-store-v2` 的 payloadHash 约定。
- 改 `frozenInputDigest` 剔除规则 → 所有既有账本的 `STALE_INPUT` 判定（不可逆兼容风险）。

## 9. 测试证据

**直接测试 `review-v3-technical-ledger.test.ts`（7 用例，bun:test，NOT_RUN；夹具 `seed()` 以 `writeAggregate` 直注 Plan，`:54-57` 注明"Fixture only，非正式 Plan"）**：

1. `:94-147` "Main attestation required, CAS admission and idempotent replay"：缺 attestor **同步** `toThrow('attestation')`（`:100-102`）；同 requestId 二次 admit/record 幂等（`:107-128`，revision 保持、回执只 +1）；终态记录后序号 `[1,2]`（`:137`）；伪造 hostReceiptId 复用被拒且账本不变（`:141-146` `JSON.stringify` 全等）。
2. `:148-167` 伪造 planFingerprint/caseRevision/证明回调抛错 → 三者全拒，`v3TechnicalExecution` 未建（`:156-166`）。
3. `:168-204` 缺回执/撤销 grant/异 grant/伪造 eventId/准入后无关业务改动 → 全部 fail-closed（`:182-203`）。
4. `:205-220` requestId≠eventId → 拒绝且消息含 'requestId'（`:217`）、无回执写入（`:218-219`）。
5. `:222-244` 带外篡改 `contentHash` 不 bump revision → `frozenInputDigest` 检出（`:234-241`），revision 仍 1、decisions 空。
6. `:246-269` 注入无回执事件 → "缺少对应 CAS 回执" 隔离（`:265-268`）。
7. `:271-305` 匹配的伪造 Host read 回执不能覆盖存储 byteHash → 拒绝含 'SHA256'（`:302-304`）。

未覆盖：`rawV3TechnicalEventChainDigest` 直接断言、4096 上限、terminal 后写分支（`run-writer.test` 间接涉及）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 导出 + 6 内部函数；完整性/准入/记录全分支 | 已证实 | 逐行读 `:1-285` |
| 幂等重放、冻结摘要检带外篡改、回执链三点匹配 | 已证实 | 测试 `:94-305` 断言 |
| 缺 Main 回调同步抛（BLOCKED_AUTH/attestation） | 已证实 | `:188-189` + 测试 `:100-102` |
| trust-port 唯一生产入口 | 已证实 | `review-v3-main-trust-port.ts:196/:201` |
| `validateV3ExecutionProposal` 内部判定 | 未知 | `review-v3-execution-contract.ts` 跨批未逐行读 |
| `submitCommand` CAS 细节 | 推断 | `case-store-v2.ts:203` 语义由测试旁证 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `assertV3TechnicalJournalIntegrity` 全校验 | §3.2 | `:69-131` | covered |
| `admitV3TechnicalRun`/`recordV3TechnicalProposal` | §3.3/§3.4 | `:183-285` | covered |
| 内部纯函数（frozenInputDigest/canonical/assertPreparedPlan…） | §3.1 | `:36-176` | covered |
| digest 两函数 | §2/§6 | `:133-147` | covered |
| 测试 7 用例断言 | §9 | 测试行号 | covered（NOT_RUN） |
| execution-contract 校验器内部 | §10 | — | unknown |

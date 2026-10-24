---
path: apps/electron/src/main/lib/review/review-v3-b1-b2-candidate-source-bridge.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e322df7ddc0910f5065d7a887507218cac7a7713
sha256: 1077a93827c7eb6a6d261c4cba0cd9cb2a293fbb5d1499858e4b85ebfdb8f758
lines: 357
kind: source
package: p04-review-case-core
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-b1-b2-candidate-source-bridge.ts

## 1. 结论与边界

Dev-B R19：**候选专属**的 Check×target 溯源快照——从 B2 真实原件字节、解析器注册表与（ZIP 来源时）fs 校验的逐条输入账本，构建「检查×对象」的来源证明（`buildB19CandidateSourceBindings`，`:267-357`）。

文件头边界（`:1-8`）：**不是** C SourceLedger / ApplyMaterial / UpgradePlan / Publisher / Run 写入者；native archive key 与 `B2MainContext` 必须由可信 Main 提供，绝不接受渲染层 IPC 或模型文本。

明确不做的事：

- **不产生发布/业务写/校方政策**：快照恒带 `candidateOnly:true / publicationAllowed:false / businessWriteAllowed:false / schoolPolicyVerified:false`（`:90-92`、`:349-350`）。
- **不按文件名/文本建别名**：来源身份是保守证明（`:132`），同名同字节不同物理档案不可复用（测试 R19-03）。
- **缺失来源不删义务**：未选来源生成 `unknown` 态空证明，Check 仍在（`:298-300`、`:265`）。

## 2. 导出与关键符号

`export` 共 **8 个**（7 interface + 1 函数）。

| 符号 | 行 | 形状要点 | 说明 |
| --- | --- | --- | --- |
| `B19SourceSelection` | `:30-42` | `{checkKey,targetKey,sourceId,candidateId,parseRevision,blockId,requiredRole,archiveId?,entryIndex?}` | 仅选择器；注释明示不接受调用方 SourceIdentity（`:34`） |
| `B19TrustedArchiveScope` | `:43-47` | `{archiveId, physicalArchiveKey}` | Main 原生选择器 key |
| `B19Evidence` | `:48-67` | 16 字段，`state ∈ {linked-candidate,unknown,stale,needs-human-confirmation}` | 单来源证明 |
| `B19CheckBinding` | `:68-77` | `{bindingIdentity,checkKey,targetKey,objectKey,subjectId,applicability,state,sources}` | Check×target 绑定 |
| `B19InvalidatedEvidence` | `:78-86` | reason 4 值：`source-version-changed`/`parser-revision-changed`/`source-unavailable`/`binding-removed-or-changed` | 前快照失效记录 |
| `B19CandidateSnapshot` | `:87-102` | 含 `snapshotHash`（注释：审计校验和，**不是签名**，`:100-101`） | 快照 |
| `B19CandidateEnvironment` | `:103-112` | `{staging,parser,vault?,ledger?,trustedArchiveScopes?,previous?}` | 依赖注入 |
| `buildB19CandidateSourceBindings` | `:267-357` | `(ctx, author, frozen, selections, environment) => B19CandidateSnapshot` | 唯一构建入口 |

内部：`sha`/`deny`/`bindingId`/`sourceId`（`:24-28`）、`evidenceKey`（`:114-115`）、`auditHash`（`:117-118`）、`empty`（`:119-126`）、`sourceIdentity`（`:127-130`）、`resolveSource`（`:133-260`）。

## 3. 内部逻辑与关键流程

### 3.1 `resolveSource`（`:133-260`）——单来源证明

1. `staging.getCandidate` 取候选身份（`:138-146`）。
2. **声明版本不匹配**（`:148-151`）：`candidate.documentVersionId !== declaredVersion` → `stale / DECLARED_SOURCE_VERSION_CHANGED`（注释：B1 作者文档版本只是声明，绝不静默改写冻结 Plan，`:147`）。
3. **ZIP 分支**（`:154-220`，`archiveId`/`entryIndex` 任一存在）：
   - 选择器不完整 → `deny('ZIP_SELECTOR_INCOMPLETE')`（`:155-156`）；缺 vault/ledger → 抛 `B_R19_ZIP_LEDGER_REQUIRED`（`:159-161`）。
   - `trustedArchiveScopes` 无此 archiveId → `needs-human-confirmation / NATIVE_ARCHIVE_REAUTH_REQUIRED`（`:162-167`）。
   - `vault.inspect` 校验 owner/案卷/物理 key 摘要（`sha(scope.physicalArchiveKey) !== physicalArchiveKeyDigest`）→ `deny('NATIVE_ARCHIVE_KEY_MISMATCH')`（`:168-172`）。
   - 条目回执非 `accepted` → `needs-human-confirmation / ARCHIVE_ENTRY_NOT_ACCEPTED`（`:177-182`）。
   - staged 身份三重比对（`physicalSourceKey`/`requestId`/`fileName`/`rawSha256`）→ `deny('ZIP_STAGED_ENTRY_IDENTITY_MISMATCH')`（`:183-192`）。
   - `proposeB2MaterialCandidates` 找对应提案；缺 → `needs-human-confirmation / INPUT_LEDGER_NOT_ACCEPTED`（`:193-200`）；提案身份不匹配 → `deny('LEDGER_SOURCE_IDENTITY_MISMATCH')`（`:201-205`）。
   - **历史回执不可跨代授权**（`:206-215`）：确认回执的 `ownerGeneration` 必须等于当前代，否则 `needs-human-confirmation / HISTORIC_INPUT_RECEIPT_REAUTH_REQUIRED`。
4. **直接 staging 分支**（`:221-226`）：`role!=='unassigned'` 才采信，注释强调这只是 Main 挑选的候选声明、不是逐条确认回执。
5. **角色/主体比对**（`:229-233`）：`acceptedRole !== requiredRole || confirmedSubject !== targetSubject` → `needs-human-confirmation / SUBJECT_OR_ROLE_MISMATCH`。
6. **解析器读取证明**（`:236-248`）：`candidateReadExtent(…,'single-parser-block')` 重查注册表与物理字节；捕获错误仅映射 `B2_SOURCE_(STALE|BLOCK_UNVERIFIED)`→`stale`、`READ_EXTENT_NOT_PROVEN`→`needs-human-confirmation`，其它原样重抛（`:242-243`）。
7. **解析器身份五重比对**（`:249-254`）→ `deny('PARSER_SOURCE_IDENTITY_MISMATCH')`。
8. **终态**（`:256-258`）：有 `receiptHash` → `linked-candidate / B2_PARSER_AND_ACCEPTED_INPUT_RECEIPT_LINKED`；否则 `needs-human-confirmation / DIRECT_STAGE_AWAITING_TRUSTED_SUBJECT_RECEIPT`。

### 3.2 `buildB19CandidateSourceBindings`（`:267-357`）

1. 入口/出口各一次 `staging.assertStillGranted(ctx)`（`:274`、`:347`）。
2. `verifyReviewB1Descriptor(author,frozen)` + 重编译 `compileReviewB1Plan` 比对指纹，不一致 `deny('PLAN_CHANGED')`（`:275-279`）。
3. selections 校验（`:280-290`）：必须命中冻结 `bindingDetails` 的合法 `(checkKey,targetKey,sourceId)` 键（`validKeys`，`:282-283`）、`requiredRole ∈ {application,supporting}`、必填选择器、无重复，否则 `deny('SELECTION_INVALID_OR_DUPLICATE')`。
4. 逐 binding 组装（`:292-311`）：每 source 有选择则 `resolveSource`、无则 `empty`；**binding 状态聚合**（`:302-305`）：`stale` > `needs-human-confirmation` > (`unknown` 或 applicability==='unknown') > `linked-candidate`。
5. 前快照失效比对（`:312-346`）：`previous` 先过完整性校验（schema/四个 false 标志/归属/`auditHash` 相等，否则 `deny('PRIOR_SNAPSHOT_UNTRUSTED')`，`:316-322`）；旧 `linked-candidate` 来源与当前逐一比对，产出 4 类 reason 的 `invalidatedPriorEvidence`（`:326-345`）。
6. 返回 `structuredClone({…, snapshotHash:auditHash(plain)})`（`:348-356`）。

## 4. 调用者与调用链

- **生产调用者唯一**：`review-v3-b1-b2-main-read-bundle-v3-b.ts:17`（import）、`:171-175`（调用）。
- **测试**：`review-v3-b1-b2-candidate-source-bridge.test.ts`（10 处调用）。
- **出向**：`review-template-plan-adapter-v3-b1`（`compileReviewB1Plan`/`verifyReviewB1Descriptor`）、`review-intake-adapter-v3-b2`（`ReviewB2StagingService`/`B2MainContext`）、`review-source-version-adapter-v3-b2`（`candidateReadExtent`）、`review-import-checkpoint-v3-b2`（`ReviewB2ArchiveVault.inspect`）、`review-import-ledger-v3-b2`（`ledger.snapshot`）、`review-import-handoff-v3-b2`（`proposeB2MaterialCandidates`）。

## 5. 数据 I/O、读写与副作用

- **只读**：staging 注册表、vault 原件、ledger 快照、解析器读取证明。**无写入**、无网络、无定时器。
- `deny` 抛 `B_R19_*` 错误（`:25`）；返回值经 `structuredClone` 隔离。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 终态/错误 |
| --- | --- | --- |
| 声明版本变更 | `:148-151` | `stale` |
| ZIP 选择器不完整/缺账本 | `:155-161` | `B_R19_ZIP_SELECTOR_INCOMPLETE` / `B_R19_ZIP_LEDGER_REQUIRED` 抛 |
| 档案 scope 未重授权 | `:162-167` | `needs-human-confirmation / NATIVE_ARCHIVE_REAUTH_REQUIRED` |
| 物理 key 不匹配 | `:168-172` | `B_R19_NATIVE_ARCHIVE_KEY_MISMATCH` 抛 |
| 条目未接受 | `:177-182` | `needs-human-confirmation / ARCHIVE_ENTRY_NOT_ACCEPTED` |
| staged 身份伪造 | `:183-192` | `B_R19_ZIP_STAGED_ENTRY_IDENTITY_MISMATCH` 抛 |
| 输入账未接受 | `:193-200` | `needs-human-confirmation / INPUT_LEDGER_NOT_ACCEPTED` |
| 账本身份不匹配 | `:201-205` | `B_R19_LEDGER_SOURCE_IDENTITY_MISMATCH` 抛 |
| 历史回执跨代 | `:206-215` | `needs-human-confirmation / HISTORIC_INPUT_RECEIPT_REAUTH_REQUIRED` |
| 角色/主体不匹配 | `:229-233` | `needs-human-confirmation / SUBJECT_OR_ROLE_MISMATCH` |
| 解析过期/块未验/读取未证 | `:240-248` | `stale` 或 `needs-human-confirmation` |
| 解析器身份不匹配 | `:249-254` | `B_R19_PARSER_SOURCE_IDENTITY_MISMATCH` 抛 |
| 重复/非法选择 | `:284-288` | `B_R19_SELECTION_INVALID_OR_DUPLICATE` 抛 |
| 前快照被篡改 | `:316-322` | `B_R19_PRIOR_SNAPSHOT_UNTRUSTED` 抛 |

无取消机制；纯同步。

## 7. 权限与权威状态

- `ctx`（B2MainContext）与 `trustedArchiveScopes` 必须由可信 Main 提供（`:45-46`、`:108-109`）；两次 `assertStillGranted` 守卫（`:274`、`:347`）。
- 快照四标志恒 false（`:90-92`）；`snapshotHash` 明示非签名（`:100`）。
- 权威来源=冻结 B1 描述符 + B2 staged 身份 + ledger 已接受回执 + 解析器读取证明的**交集**。

## 8. 修改影响面

- 唯一生产消费者 `readB20CurrentCandidateBundle` 依赖其错误码（`B_R19_*` 在 R20 测试中被断言）与 state 集合。
- `resolveSource` 的身份比对字段（physicalSourceKey/requestId/fileName/rawSha256/5 项解析器字段）与 B2 vault/staging 的存储格式耦合。
- 4 类失效 reason 与 B33 currentity 快照（`review-v3-b33-currentity-snapshot.ts:154`）等下游判定相关。
- 无存储格式迁移（快照仅内存）。

## 9. 测试证据

- `review-v3-b1-b2-candidate-source-bridge.test.ts`（383 行，2 describe / 13 test）：真实 ZIP→stage→解析→账本→Check×target 全链（R19-01/02）、同名同字节不同物理档案不复用（03）、单源变更只失效相关链（04）、角色/主体/未确认账本/假 key 阻断（05）、跨条目/假块/过期解析/重复选择阻断（06）、跨 Case/Owner/代与撤销（07）、真实账本/归档字节篡改阻断（08）、直接 staging 不虚假升级（09）、伪造冻结作者/删 Check/篡改前快照（10）、跳过/拒绝文件不成为 linked 证据（11）、旧回执不跨代（12）、linked 证据不覆盖 unknown 适用性（13）。
- **NOT_RUN**：本轮未运行测试/构建/GUI。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 个导出 | 已证实 | `:30-102`、`:267` |
| 终态判定「receiptHash 决定 linked/needs-human」 | 已证实 | `:256-258` |
| binding 状态四级优先序 | 已证实 | `:302-305` |
| 唯一生产调用者为 B20 bundle | 已证实 | 全树检索 |
| 历史回执不可跨代授权 | 已证实 | `:206-215`；测试 R19-12 |
| B2 各组件的内部实现 | 未知 | 只读接口调用，未逐行读 vault/ledger/staging 实现 |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 8 个导出 | 2 | — | covered |
| `resolveSource` 全分支 | 3.1、6 | `:133-260` | covered |
| `buildB19CandidateSourceBindings` | 3.2 | `:267-357` | covered |
| 失效比对 4 reason | 3.2 | `:326-345` | covered |
| 调用链 | 4 | — | covered |
| 权限边界 | 7 | — | covered |
| 测试证据 | 9 | — | covered |

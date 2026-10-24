---
path: apps/electron/src/main/lib/review/review-v3-b1-b2-recovery-preflight-v3-b.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7001e2e5baa7bdebb7c4ee852e9150e8c97af4e6
sha256: 34abb576b38621ad97e3132421a4771cb07a9d495c85dcc9217040b65dbb948a
lines: 240
kind: source
package: p04-review-case-core
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-b1-b2-recovery-preflight-v3-b.ts

## 1. 结论与边界

Dev-B R23：**只读恢复预检**——对 B1 保存/冻结作者 + 多份持久 ZIP 原件 + B2 `/2` 输入回执历史做 fail-closed 核验，产出「需要新来源确认」的清单（`readB23RecoveryPreflight`，`:161-240`）。

文件头边界（`:1-8`）：**绝不**重新暂存字节、重放授权、创建 SourceIdentity 或应用 Case/Run/Plan；**已接受的历史回执不是当前代授权**。依赖注入不是 IPC 认证层。

明确不做的事：

- **无任何写入**（纯读）。
- **不自动复用**：每条都带 `currentSourceIdentityVerified:false` / `sourceReuseAllowed:false`（`:55-56`、`:143`）。
- **不做部分输出**：任一原件/账本失败即整体抛错（`:158-159` 注释）。

## 2. 导出与关键符号

`export` 共 **7 个**（6 type/interface + 1 函数）。

| 符号 | 行 | 形状要点 | 说明 |
| --- | --- | --- | --- |
| `B23MainRecoveryAuthority` | `:30-34` | `currentScope`/`currentArchiveIds`（绝不接受渲染层 archiveId，`:32`） | 认证能力 |
| `B23RecoveryDependencies` | `:35-40` | `{authority?,staging?,vault?,ledger?}` | 注入 |
| `B23HistoricalEntryState` | `:41-43` | 4 值：`historic-accepted-needs-new-source-confirmation`/`previously-skipped`/`previously-rejected`/`not-yet-confirmed` | 历史条目态 |
| `B23RecoveryEntry` | `:44-57` | 含 `historicalReceiptHash/OwnerGeneration` + 两个恒 false 标志 | 单条目 |
| `B23RecoveryArchive` | `:58-70` | 含 `freshOwnerGenerationRequired`/`requiresTrustedNativeRepick:true`/`requiresCurrentParserAndSourceReceipt:true` | 单档案 |
| `B23RecoveryPreflight` | `:71-90` | `state ∈ {no-registered-archives, recovery-and-human-confirmation-required}` + `snapshotHash` | 输出 |
| `readB23RecoveryPreflight` | `:161-240` | `(expected, deps) => B23RecoveryPreflight` | 同步函数 |

内部：`sha`/`archiveId` 正则（`:20-21`，archiveId 为 40 位 hex）、`error`（`:22`，抛 `B_R23_*`）、`digest`（`:23`，无键摘要，`:238` 注释：仅供 diff/审计，非可信回执）、`sameScope`（`:24-29`）、`scopeFromMain`（`:91-102`）、`verifyArchiveAndLedger`（`:103-154`）。

## 3. 内部逻辑与关键流程

### 3.1 `verifyArchiveAndLedger`（`:103-154`）——单档案核验

1. checkpoint 必须 `review-b2-archive/2` 且带 `decodeLimits`（`B_R23_UNPINNED_ARCHIVE_DECODE_PROFILE`，`:106-107`）；ledger 必须 `review-v3-b2-input-ledger/2`（`B_R23_HISTORIC_LEDGER_SUBJECT_ROLE_UNVERIFIABLE`，`:108-109`）。
2. 双方 scope/摘要比对（archiveId/archiveSha256/manifestSha256↔sourceManifestHash/ownerId/caseCandidateId），不符 `B_R23_ARCHIVE_LEDGER_SCOPE_MISMATCH`（`:110-115`）。
3. 逐条目（`:117-145`）：checkpoint 条目与 ledger 文件 identity 比对（entryName/compressedSha256/accepted 时 rawSha256）不符 `B_R23_ORIGINAL_ENTRY_IDENTITY_MISMATCH`（`:118-123`）；**accepted 条目必须有匹配的历史回执**（状态/confirmedRawSha256/confirmedRole/confirmedSubjectId）否则 `B_R23_HISTORIC_RECEIPT_BINDING_MISMATCH`（`:124-130`）；产出 `historicInputState` 4 值（`:131-134`）；`rawSha256` 仅 accepted 时保留（`:138`）。
4. 汇总（`:146-153`）：`freshOwnerGenerationRequired = ctx.ownerGeneration <= checkpoint.stagedOwnerGeneration`（`:151`）——恢复必须用**新 Main 代**。

### 3.2 `readB23RecoveryPreflight`（`:161-240`）

1. 依赖完整性（`:165-168`）→ `B_R23_MAIN_TRUST_DEPENDENCY_NOT_INSTALLED`。
2. 期望校验（`:169-172`）→ `B_R23_AUTHOR_EXPECTATION_INVALID`。
3. `scopeFromMain` + `assertStillGranted`（`:173-174`）。
4. B1 作者校验（`:175-179`）→ `B_R23_AUTHOR_REVISION_CONFLICT`；冻结校验（`:180-188`）→ `B_R23_FROZEN_CANDIDATE_CONFLICT` / `B_R23_FROZEN_CANDIDATE_CONFLICT`（error 码 `FROZEN_CANDIDATE_CONFLICT`）；`verifyReviewB1Descriptor`（`:188`）。
5. 注册表校验（`:189-193`）：非数组 → `B_R23_ARCHIVE_REGISTRY_NOT_INSTALLED`；>32 个、重复、非 40 位 hex → `B_R23_ARCHIVE_REGISTRY_INVALID`。
6. **第一遍**：排序后逐 archive `vault.inspect` + `ledger.snapshot` → `verifyArchiveAndLedger`（`:194-201`）。
7. **第二遍复读**（`:202-211`）：所有摘要/修订必须与第一遍一致 → `B_R23_SOURCE_CHANGED_DURING_PREFLIGHT`（注释：防读取中途有人确认/拒绝条目，`:158-159`）。
8. 作者/冻结再读（`:212-218`）→ `B_R23_AUTHOR_CHANGED_DURING_PREFLIGHT`。
9. `sameScope` 复核 + `assertStillGranted`（`:219-221`）→ `B_R23_MAIN_SCOPE_CHANGED_DURING_PREFLIGHT`。
10. 注册表再读（`:222-225`）→ `B_R23_ARCHIVE_REGISTRY_CHANGED_DURING_PREFLIGHT`。
11. 组装快照：`state` 按 archives 空否二选一（`:235`），`snapshotHash` 为无键摘要（`:238-239`）。

## 4. 调用者与调用链

- **`readB23RecoveryPreflight` 当前无任何调用者**（已证实）——全冻结树（apps+packages，`*.ts`/`*.tsx`）检索，函数名仅出现在本文件定义（`:161`）；无生产调用、无测试调用。
- **类型被 3 个文件引用**：`review-v3-b-candidate-readiness-workbench.ts:12`（`B23RecoveryPreflight`，校验 `:124`）、`review-v3-b33-currentity-snapshot.ts:17`（校验 `:154`）、renderer 侧 `review-v3-product-workflow.ts:10`（类型 import）。即：输出形状有下游消费者，**构建函数本身未接线**。
- **出向**：B1 作者库（`readB1AuthorRevision`/`readB1FrozenCandidate`）、`verifyReviewB1Descriptor`、`ReviewB2StagingService`/`ReviewB2ArchiveVault.inspect`/`ReviewB2InputLedger.snapshot`、`B20MainReadScope`/`B20ReadAuthorExpectation` 类型（`review-v3-b1-b2-main-read-bundle-v3-b.ts:31-42`）。

## 5. 数据 I/O、读写与副作用

- **只读**：B1 修订/冻结 JSON、vault 归档原件、ledger 快照（各两次）。**无写入**、无网络、无定时器。
- 返回 `structuredClone`（`:239`）。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 错误 |
| --- | --- | --- |
| 注入缺失 | `:165-168` | `B_R23_MAIN_TRUST_DEPENDENCY_NOT_INSTALLED` |
| 期望非法 | `:169-172` | `B_R23_AUTHOR_EXPECTATION_INVALID` |
| 作者/冻结不符 | `:175-188` | `B_R23_AUTHOR_REVISION_CONFLICT` / `B_R23_FROZEN_CANDIDATE_CONFLICT` |
| 注册表缺失/非法 | `:189-193` | `B_R23_ARCHIVE_REGISTRY_NOT_INSTALLED` / `B_R23_ARCHIVE_REGISTRY_INVALID` |
| 档案 schema 未钉 | `:106-107` | `B_R23_UNPINNED_ARCHIVE_DECODE_PROFILE` |
| 账本 schema 不可验 | `:108-109` | `B_R23_HISTORIC_LEDGER_SUBJECT_ROLE_UNVERIFIABLE` |
| 档案/账本 scope 不符 | `:110-115` | `B_R23_ARCHIVE_LEDGER_SCOPE_MISMATCH` |
| 条目 identity 不符 | `:118-123` | `B_R23_ORIGINAL_ENTRY_IDENTITY_MISMATCH` |
| accepted 无匹配回执 | `:124-130` | `B_R23_HISTORIC_RECEIPT_BINDING_MISMATCH` |
| 读中源变化 | `:202-211` | `B_R23_SOURCE_CHANGED_DURING_PREFLIGHT` |
| 读中作者变化 | `:212-218` | `B_R23_AUTHOR_CHANGED_DURING_PREFLIGHT` |
| 读中 scope 变化 | `:219-221` | `B_R23_MAIN_SCOPE_CHANGED_DURING_PREFLIGHT` |
| 读中注册表变化 | `:222-225` | `B_R23_ARCHIVE_REGISTRY_CHANGED_DURING_PREFLIGHT` |

全部失败关闭（无部分输出）；同步，无取消。

## 7. 权限与权威状态

- `currentArchiveIds` 由 C Main 认证注册表供给，绝不接受渲染层 archiveId（`:32`）。
- **历史 accepted 回执不是当前代授权**（`:5`、`:141-142` 的 `historicalReceiptOwnerGeneration` 留档、`:65` 的 `freshOwnerGenerationRequired`）。
- 输出 5 个 false 标志 + `requiresTrustedNativeRepick:true`（`:67-68`）；`snapshotHash` 非可信回执（`:238`）。

## 8. 修改影响面

- 函数未接线，改动当前无运行影响；但输出形状被 readiness-workbench（`:124`）、b33-currentity（`:154`）与 renderer product-workflow 类型消费——改形状需同步这三处。
- `verifyArchiveAndLedger` 与 B2 vault/ledger `/2` 存储 schema 直接耦合（`decodeLimits`、`sourceManifestHash`、`mutations[].confirmed*`）。
- 无存储格式迁移（只读）。

## 9. 测试证据

- **无直接测试**（已证实）：全冻结树检索 `readB23RecoveryPreflight`，测试命中 0；本批 5 个测试文件均不覆盖本模块。
- 间接相关：`review-v3-b1-b2-main-read-bundle-v3-b.test.ts` 覆盖同风格的 B1/B2 fail-closed 读链（但测的是 B20 函数）。
- **NOT_RUN**：本轮未运行测试/构建/GUI。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 个导出 | 已证实 | `:30-90`、`:161` |
| 双遍复读防中途变化 | 已证实 | `:194-211`、`:158-159` 注释 |
| `freshOwnerGenerationRequired` 判定式 | 已证实 | `:151` |
| 函数当前无调用者（生产+测试） | 已证实 | 全冻结树检索（apps+packages，`*.ts`/`*.tsx`） |
| 类型被 3 文件消费 | 已证实 | `readiness-workbench:12`、`b33-currentity:17`、`product-workflow:10` |
| 未来接线计划 | 未知 | 源码无注释说明；不臆测 |
| 测试实际通过 | 未知 | 无测试可跑 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 7 个导出 | 2 | — | covered |
| `verifyArchiveAndLedger` | 3.1 | `:103-154` | covered |
| `readB23RecoveryPreflight` 11 步 | 3.2 | `:161-240` | covered |
| 全部错误分支 | 6 | — | covered |
| 无调用者事实 | 4、10 | — | covered |
| 权限/历史授权边界 | 7 | — | covered |
| 测试证据 | 9 | — | covered（无测试） |

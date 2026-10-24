---
path: apps/electron/src/main/lib/review/review-import-handoff-v3-b2.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: dddf137852aade9fd224c27a1458887467cfd26b
sha256: 2daee4cdcc7dd08dc15648e815208bf3f32658a572917d636b87cd16146995e7
lines: 70
kind: test
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-import-handoff-v3-b2.test.ts

## 1. 测试目标

“B-INT input proposal is distinct from C ApplyMaterial”（describe `:40`）：确认后的原始文件生成摘要绑定的 input-only 意图，**绝不是 C0 SourceIdentity**。被测：`proposeB2MaterialCandidates`（`review-import-handoff-v3-b2`）；协作真实 `ReviewB2StagingService`/`ReviewB2ArchiveVault`/`ReviewB2InputLedger`。夹具：`mkdtemp(b2-handoff-)`（`:10-11`）；手工构造 ZIP 字节（本地头/中心目录/EOCD，CRC32 真算，`:14-39`）。本轮 `NOT_RUN`。

## 2. 用例清单

1 describe、**1 test**（`:41-69`）：

1. 全链：`saveAndStage`（物理归档 key `native-picked`）→ `getOrCreate` 后未确认前候选 `[]` → `ledger.decide`（accepted/application/student-1/真实 principal）→ 候选 1 条；断言 `candidateKind`、`confirmingReceiptHash`、`sourceLedgerHash`、`rawSha256`、`proposalHash` 64 hex、**无 `caseId`/`sourceIdentity` 字段**；重开 ledger 实例（磁盘持久）→ 候选 `toEqual` 原值（稳定）；`staging.revoke` 后再取 → throw `B2_OWNER_INVALID_OR_REVOKED`。

## 3. 真实断言

- `'caseId' in proposed[0] === false`、`'sourceIdentity' in proposed[0] === false`——“不是 ApplyMaterial/SourceIdentity”的字段级实证（`:61-62`）。
- 未确认先为空数组（`:49`）——“确认回执”前置。
- 重开 ledger（新实例）后 `toEqual`——磁盘账本决定候选，进程内状态无关。
- revoke 后授权断言抛错（`:67-68`）——首尾 `assertStillGranted` 的尾端生效。

## 4. 未覆盖与脆弱点

**未覆盖**：`B2_HANDOFF_SOURCE_MISMATCH`、`B2_HANDOFF_LEGACY_BINDING_UNVERIFIABLE`（`/1` schema）、`B2_HANDOFF_UNVERIFIED_ENTRY`、`B2_HANDOFF_RECEIPT_NOT_FOUND` 四个拒绝分支。

**脆弱点**：手工 ZIP 二进制夹具与 `ReviewB2ArchiveVault` 的解析耦合；`decide` 的 principal 授权形状依赖 ledger 契约。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 describe、1 test、真实 vault/ledger | 已证实 | `:40`；三真实类实例化 |
| 候选 input-only、无 caseId/sourceIdentity | 已证实 | `:56-62` |
| 确认回执前置 | 已证实 | `:49` |
| 磁盘账本稳定性 | 已证实 | `:63-65` |
| 授权撤销拒 | 已证实 | `:66-68` |
| 四类拒绝分支 | 未知 | 未覆盖 |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 被测分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 正常候选组装 | #1 | `:54-62` | covered |
| 未确认为空 | #1 | `:49` | covered |
| 持久稳定性 | #1 | `:63-65` | covered |
| 授权撤销 | #1 | `:66-68` | covered |
| 四类 throw | — | — | unknown |

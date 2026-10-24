---
path: apps/electron/src/main/lib/review/review-import-handoff-v3-b2.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b1a8e05ffb49cf26888b5252700eb508cca4e3b4
sha256: daf7449cafc5c4633902b3bd040d7ce954ec70f3219b1b30920d9302f0e956c4
lines: 78
kind: source
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-import-handoff-v3-b2.ts

## 1. 结论与边界

Dev-B→Dev-C 的 proposal-only 适配器（文件头 `:1-6`）：产出**不可变材料 INPUT 身份**候选；明确不是 ApplyMaterial、不是 SourceIdentity、不是 CurrentCase 写入——C 侧 Main 消费者必须独立复核 owner、当前案卷 revision、原始字节/解析块、来源注册表、Subject 与 principal/policy ACL。纯函数（对 vault/staging/ledger 的只读检查）。

不做的事：不写任何案卷/材料状态；不替代 C 侧复核；不解析字节。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `B2ApplyMaterialCandidate` | interface | `:13-30` | `{candidateKind:'input-only-unapplied'; archiveId; archiveSha256; entryIndex; entryName; rawSha256; proposedVersionKey; caseCandidateId; ownerId; subjectId; role; inputRevision; sourceLedgerHash; confirmingReceiptHash; proposalHash}`（`proposalHash` 是不可信提案信封摘要，非 C 权威回执，`:28` 注释） |
| `proposeB2MaterialCandidates` | function | `:31-78` | `(ctx, vault, staging, ledger, archiveId) => B2ApplyMaterialCandidate[]` |

内部：`hash`（`:12`，sha256 hex）。

## 3. 内部逻辑与关键流程

`proposeB2MaterialCandidates` 顺序（全部 fail-closed throw）：

1. `staging.assertStillGranted(ctx)` 首尾各一次（`:38/:76`）——授权窗口贯穿全程。
2. `vault.inspect` + `ledger.snapshot` 双读；`archiveSha256`/`manifestSha256` 与 ledger 记录不符 → `B2_HANDOFF_SOURCE_MISMATCH`（`:41-44`）。
3. **legacy 门**（`:45-49`）：`schemaVersion !== 'review-v3-b2-input-ledger/2'` → `B2_HANDOFF_LEGACY_BINDING_UNVERIFIABLE`——旧 `/1` 回执 hash 不封存确认的 Subject/role，必须 Main 重新确认，不能因 ledger SHA 合法就当已验证（注释）。
4. 逐 accepted 文件（`:51-57`）：来源回执须同 index、accepted、`rawSha256` 一致，且 `rawSha256/candidateVersionKey/role/subjectId` 均非空，否则 `B2_HANDOFF_UNVERIFIED_ENTRY`。
5. **确认回执**（`:58-63`）：`mutations.findLast(entryIndex 匹配且 accepted)`；缺失或 `revision>current.revision` 或 `confirmedRole/confirmedSubjectId/confirmedRawSha256` 与文件不符 → `B2_HANDOFF_RECEIPT_NOT_FOUND`。
6. 组装 payload（含 `inputRevision`、`sourceLedgerHash`、`confirmingReceiptHash`）+ `proposalHash=hash(JSON)`（`:64-74`）；返回 `structuredClone(result)`（防外部持引用篡改，`:77`）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/**/*.{ts,tsx}`（排除测试）：由 Dev-C 侧导入预览/交接入口（`review-import-checkpoint-v3-b2` 链路）调用；直接测试 `review-import-handoff-v3-b2.test.ts`。出向：`review-intake-adapter-v3-b2.{B2MainContext,ReviewB2StagingService}`、`review-import-checkpoint-v3-b2.ReviewB2ArchiveVault`、`review-import-ledger-v3-b2.{ReviewB2InputLedger,B2InputRole}`、`node:crypto`。

## 5. 数据 I/O、读写与副作用

只读 vault/ledger + 授权断言；输出新数组（克隆）。无写盘/网络/日志。

## 6. 分支、失败、取消与恢复

四类 throw（SOURCE_MISMATCH/LEGACY_BINDING_UNVERIFIABLE/UNVERIFIED_ENTRY/RECEIPT_NOT_FOUND）；无异步、无取消/恢复。

## 7. 权限与权威状态

- 候选是**不可信提案**（`proposalHash` 注释）；权威复核在 C 侧 Main（文件头逐项列举）。
- legacy `/1` 账本一律拒绝自动候选（“不能因 ledger SHA 合适就看起来已验证”，`:45-47`）。
- 授权窗口由 `staging.assertStillGranted` 首尾夹持。

## 8. 修改影响面

改候选形状 → 影响 C 侧 ApplyMaterial 消费者与 checkpoint 链路；`B2InputRole`/ledger schema 联动 `review-import-ledger-v3-b2`。

## 9. 测试证据

本轮 `NOT_RUN`。直接测试 `review-import-handoff-v3-b2.test.ts`（详见其手册）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| proposal-only、非权威回执 | 已证实 | 文件头、`:28` |
| legacy /1 拒绝自动候选 | 已证实 | `:45-49` |
| 回执三重比对（role/subject/hash） | 已证实 | `:58-63` |
| 首尾授权断言+克隆返回 | 已证实 | `:38/:76/:77` |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `B2ApplyMaterialCandidate` | 2 | `:13-30` | covered |
| 来源不匹配/legacy 门 | 3 | `:41-49` | covered |
| 逐条校验+确认回执 | 3 | `:51-63` | covered |
| 组装/克隆 | 3 | `:64-77` | covered |

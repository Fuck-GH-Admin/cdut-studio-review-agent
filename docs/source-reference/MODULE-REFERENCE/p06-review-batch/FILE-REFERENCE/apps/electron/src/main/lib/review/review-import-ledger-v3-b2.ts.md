---
path: apps/electron/src/main/lib/review/review-import-ledger-v3-b2.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 273b8ea71ed739f01238c5bcf1f57be7a39a6502
sha256: 742164b4338fa7534e70ea001d9e40beaa94ae8b72f13b99f4fbde9d13898932
lines: 368
kind: source
package: p06-review-batch
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-import-ledger-v3-b2.ts

## 1. 结论与边界

V3 Dev-B：**逐条持久的 ImportBatch 输入回执账本**（运行时代码），不是第二套 CaseStore（文件头 `apps/electron/src/main/lib/review/review-import-ledger-v3-b2.ts:1-11`）：不可变归档字节/中心条目由 `ReviewB2ArchiveVault` 独立核验；接受回执**仅表示**「输入候选已确认，等待后续可信 ApplyMaterial 命令」，绝不标记 CurrentCase Material/ReviewRun/Decision 已应用；Main 身份与评审授权的唯一来源是宿主 Main 进程，**绝不把本类方法暴露为通用 Renderer IPC**。

边界：归档核验委托 `./review-import-checkpoint-v3-b2`（`ReviewB2ArchiveVault`，`:20`）；授权门/暂存委托 `./review-intake-adapter-v3-b2`（`ReviewB2StagingService`，`:19`）；存储 `<configDir>/review-v3-b2-input-ledgers/<archiveId>/ledger.json`。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 形状/签名 | 说明 |
| --- | --- | --- | --- | --- |
| `B2InputFileStatus` | 类型 | 27-28 | `'pending'\|'needs-user-confirmation'\|'accepted'\|'skipped'\|'rejected'` | 条目状态 |
| `B2InputRole` | 类型 | 29 | `'application'\|'supporting'` | 角色 |
| `B2InputFile` | 接口 | 30-41 | 含 `candidateVersionKey?`（注释 `:39`：非 CurrentCase material ID） | 条目 |
| `B2InputDecision` | 接口 | 42-50 | `{entryIndex, status, role?, subjectId?, rawSha256?, reason?}`（rawSha256 须匹配真实字节 `:47`） | 决策 |
| `B2InputMutation` | 接口 | 51-67 | `/2` 收据固化 `confirmedRole/confirmedSubjectId/confirmedRawSha256/decisionReason`（`:61-66`） | 回执 |
| `B2InputBatchLedger` | 接口 | 68-81 | `schemaVersion:'/1'\|'/2'`、`revision===mutations.length`、`ledgerHash` | 账本 |
| `B2InputAuthority` | 接口 | 82-88 | `{principalId, authorize(ctx,principalId,decision)}` | 授权器 |
| `ReviewB2InputLedger` | 类 | 94-368 | 见 §3 | 核心 |

内部：`hash`（`:22`）、`archiveIdFormat=/^[a-f0-9]{40}$/`（`:23`）、`shaFormat`（`:24`）、`localId=/^[a-zA-Z0-9._:-]{1,128}$/`（`:25`）、`fail`（`:26`，抛 `B2_LEDGER_<name>`）、`digestLedger`（`:89-90`）、`keyForSource`（`:91-92`，`'candidate-version-'+hash(archiveSha256,archiveId,index,rawSha256)[:40]`）。

## 3. 内部逻辑与关键流程

### 3.1 校验器 `verify`（`:112-211`）

- 信封字段：schemaVersion/kind/ids/owner/revision/files 长度=归档回执数/`revision===mutations.length`（`:113-121`）。
- 文件行：index 对应原始回执、entryName/compressedSha256 一致、状态/角色白名单、subjectId 过 `localId`、`candidateVersionKey` 前缀（`:124-146`）；**归档未接受的条目**状态必须保持原值且四字段全 null（`:135-137`）；**归档已接受的条目**rawSha256 不可变，accepted 时必须带 role/subjectId/正确 key，非 accepted 时三字段清空（`:138-144`）。
- 回执链：requestId 唯一、payloadHash/receiptHash 过 `shaFormat`、`revision===i+1`、`previousHash` 链接（首条 `GENESIS`）、只能终结「归档已接受且未终结」的条目（`:150-159`）；`/2` 固化字段一致性（accepted：confirmed* 必须等于文件行且 decisionReason=null；非 accepted：confirmed* 全 null 且 decisionReason=非空串=文件行 reason，`:164-183`）；**收据哈希自校验** `hash(unsigned)===receiptHash`（`:185-186`）。
- 终态重放（`:192-208`）：无终结回执的归档-接受条目必须停在 `needs-user-confirmation` 且 reason=原始；有终结回执的条目状态必须=终态，accepted 的 reason 必须是 `'input-only, not applied to CurrentCase'`、非 accepted 必须非空。
- 最后 `ledgerHash===digestLedger(plain)`（`:209-210`）。

### 3.2 读写（`:212-259`）

- `read`（`:212-227`）：目录内存在 `ledger-<20hex>.tmp` → `B2_LEDGER_RECOVERY_REQUIRED`（注释：被杀写者可能留 tmp，不能因锁被别的进程清掉就推断事务完成，`:214-218`）；`ledger.json` 非普通文件或 `nlink!==1` → `FILE_UNSAFE`（防硬链接，`:221`）；解析失败 `CORRUPT`；读必过 `verify`。
- `write`（`:228-242`）：mkdir 0700；tmp=`ledger-<randomBytes(10).hex>.tmp` 写 `wx` 0600 → `fsync(file)` → `renameSync` → `fsync(dir)`（`:230-238`）；finally 清残留 tmp。
- `initial`（`:243-259`）：初始账本 `/2`、`revision:0`；归档-接受条目转 `needs-user-confirmation`（保留 rawSha256），其余沿原状态；role/subjectId/candidateVersionKey 全 null；`mutations:[]`。

### 3.3 API

- `getOrCreate`（`:264-278`）：`checkedArchive`（`archiveVault.inspect` 校验字节+清单+owner，`:109-111`）→ `input.lock`（`openSync 'wx' 0600`，占用即 `LOCKED`）→ 读或建 → `structuredClone` 返回；finally 关锁删锁。
- `decide`（`:284-352`）：前置 `assertStillGranted`（`:288`）；参数校验 `DECISION_INVALID`/`CONFIRMATION_INCOMPLETE`（accepted 必须带 role+subjectId+rawSha256，`:289-296`）；`authority.authorize` 失败 `AUTH_UNAVAILABLE`（`:297`）；锁内：无账本 `NOT_STARTED`、`/1` 账本 `LEGACY_SCHEMA_UNPINNED`（`:306`，只读审计不许再变更）；**同 requestId 幂等**——payloadHash 相同返回原回执、不同 `REQUEST_COLLISION`（`:307-312`）；CAS `revision!==expectedRevision` → `REVISION_CONFLICT`（`:313`）；条目须「归档已接受且 needs-user-confirmation」否则 `ENTRY_NOT_CONFIRMABLE`（`:316-319`）；accepted 的 rawSha256 须匹配原始 `SOURCE_MISMATCH`（`:320`）；非 accepted 必须给 reason 且不得带 role/subjectId `REJECTION_REASON_REQUIRED`（`:321-322`）；构造新文件行（accepted 的 reason 恒为 `'input-only, not applied to CurrentCase'`，`:325`）与回执（`previousHash` 链接、`receiptHash=hash(unsigned)`，`:331-341`）；`assertStillGranted` 再验后 `write`（`:348-349`）。
- `snapshot`（`:354-367`）：同锁读（`NOT_STARTED`/`LOCKED`），`structuredClone` 返回。

## 4. 调用者与调用链

入向：`apps/electron/src/main/lib/review/review-import-handoff-v3-b2.ts`（`proposeB2MaterialCandidates` 接收 ledger，测试 `review-import-ledger-v3-b2.test.ts:257` 体现）；直接测试 `review-import-ledger-v3-b2.test.ts:10`。出向：`node:crypto`/`node:fs`/`node:path`（`:12-17`）、`../config-paths`（`:18`）、`./review-intake-adapter-v3-b2`（`:19`）、`./review-import-checkpoint-v3-b2`（`:20`）。注释红线：不暴露为 Renderer IPC（`:9-10`）。

## 5. 数据 I/O、读写与副作用

- 磁盘：`<configDir>/review-v3-b2-input-ledgers/<archiveId>/ledger.json`（0600、dir 0700）；tmp+双 fsync+rename（`:228-242`）；跨进程 `input.lock`（`wx` 独占）。
- 幂等：`getOrCreate`/`decide`（requestId 重放返回原回执）；并发：`input.lock` 全互斥（getOrCreate/decide/snapshot 共用）。
- 副作用：无日志/网络。恢复：孤儿 tmp 阻断并要求人工 `RECOVERY_REQUIRED`（不自动续事务）。

## 6. 分支、失败、取消与恢复

错误码（`B2_LEDGER_` 前缀）：`ARCHIVE_ID_INVALID`/`ROOT_UNSAFE`/`DIR_UNSAFE`/`CORRUPT`/`FILE_UNSAFE`/`RECOVERY_REQUIRED`/`LOCKED`/`NOT_STARTED`/`DECISION_INVALID`/`CONFIRMATION_INCOMPLETE`/`AUTH_UNAVAILABLE`/`LEGACY_SCHEMA_UNPINNED`/`REQUEST_COLLISION`/`REVISION_CONFLICT`/`ENTRY_NOT_CONFIRMABLE`/`SOURCE_MISMATCH`/`REJECTION_REASON_REQUIRED`。`/1` 账本只读（`LEGACY_SCHEMA_UNPINNED` + handoff 拒绝 `B2_HANDOFF_LEGACY_BINDING_UNVERIFIABLE`，测试 `:254-258`）。tamper 检测：重算 ledgerHash 也过不了收据链/终态重放校验（测试 `:121-141`）。

## 7. 权限与权威状态

- 授权：`B2InputAuthority.authorize`（Main 提供）+ `staging.assertStillGranted`（owner 吊销即失效）；`decidedBy=principalId` 记账。
- 权威：`ReviewB2ArchiveVault` 检查点（原始字节/状态）；账本是输入侧版本化状态（`revision`），永不成为 ReviewBatchAttempt（`:76` 注释）；`candidateVersionKey` 不是 CurrentCase material ID（`:39`）。

## 8. 修改影响面

改回执/校验规则影响 `review-import-handoff-v3-b2.ts` 移交与测试夹具（test 手工构造收据链）；schemaVersion 演进需保持 `/1` 只读兼容（`:161-163` 注释）。

## 9. 测试证据

直接测试 `apps/electron/src/main/lib/review/review-import-ledger-v3-b2.test.ts`（281 行、10 用例；NOT_RUN）：初始状态+拒绝子不可变（`:75-84`）；SOURCE_MISMATCH/AUTH_UNAVAILABLE/CAS/幂等重放/REQUEST_COLLISION/REVISION_CONFLICT（`:90-119`）；重算 ledgerHash 的 4 种篡改全 CORRUPT（`:136-140`）；重复终结回执 CORRUPT（`:142-160`）；锁不可绕过/不可清他人锁（`:162-173`）；孤儿 tmp → RECOVERY_REQUIRED（`:174-187`）；`/2` 固化 4 种篡改 CORRUPT + 重放一致（`:193-215`）；skipped reason 收据绑定（`:217-234`）；`/1` 只读 + handoff 拒绝（`:253-258`）；跨 owner/吊销/换代/篡改（`:260-280`）。未覆盖：`ROOT_UNSAFE`/`DIR_UNSAFE`/`FILE_UNSAFE` 分支、`ARCHIVE_ID_INVALID`、`CONFIRMATION_INCOMPLETE` 细项、并发锁竞争实测。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 导出+类方法与全错误码 | 已证实 | `:27-368` |
| 收据链 hash 链接+终态重放校验 | 已证实 | `:150-210` |
| `/2` 固化字段、`/1` 只读 | 已证实 | `:161-183/:306` |
| tmp+双 fsync+rename、input.lock | 已证实 | `:228-242/:268-277` |
| requestId 幂等（同体返回原回执） | 已证实 | `:307-312` + test:101-103 |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `verify` 全校验 | §3.1 | 112-211 | covered |
| `read`/`write`/`initial` | §3.2 | 212-259 | covered |
| `getOrCreate`/`decide`/`snapshot` | §3.3 | 264-367 | covered |
| 测试断言（10 用例） | §9 | test:70-280 | covered |
| ROOT_UNSAFE 等少见分支 | §9 | — | partial |
| 运行行为 | §10 | — | unknown（NOT_RUN） |

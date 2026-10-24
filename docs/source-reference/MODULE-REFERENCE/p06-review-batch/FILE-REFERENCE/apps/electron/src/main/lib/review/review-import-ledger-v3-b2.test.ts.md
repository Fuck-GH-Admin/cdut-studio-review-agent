---
path: apps/electron/src/main/lib/review/review-import-ledger-v3-b2.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: dd9d9f693f1f79d55c994bca0dad4ca111d85cdc
sha256: 3d9793112559d73dc63875d26440df084fb2de59537fc97d0fbbe793209f2851
lines: 281
kind: test
package: p06-review-batch
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-import-ledger-v3-b2.test.ts

## 1. 测试目标

`review-import-ledger-v3-b2.ts` 的**持久输入回执账本**（describe `:69`「B-IN-01/02: durable source-only ImportBatch input status ledger」）：归档拒绝条目不可变、CAS/幂等/碰撞、收据链重放防篡改、锁与孤儿 tmp、`/2` 固化字段、`/1` 只读保护、跨 owner/吊销/换代。真实文件系统 + 手工 ZIP 字节（`:28-50` CRC32 自造存储），无 mock。

## 2. 用例清单

10 个 test（`:70/:86/:121/:142/:162/:174/:188/:217/:235/:260`）。夹具：`fixture(label)`（`:51-65`）建 staging+`ReviewB2ArchiveVault`+ledger，`saveAndStage` 一个含 `apply.txt`/`../escape.txt`（恶意穿越）/`evidence.txt` 的合成 ZIP；`trusted` 授权器（`:16-17`）；`confirm()` 决策工厂（`:66-68`）。用例独立（各 fixture 独立目录）。

1. `:70-85` 归档拒绝子保持不可变、接受子从 needs-user-confirmation 开始。
2. `:86-120` 源哈希+Principal 校验 CAS、精确重放、同键异体拒绝。
3. `:121-141` 收据重放检测不可能的终态文件状态（即使编辑者重算 ledgerHash）。
4. `:142-161` 同一文件的重复终结回执不能作为独立导入决策被接受。
5. `:162-173` snapshot 读方不能绕过写者 input.lock 或清他人锁。
6. `:174-187` 孤儿事务 tmp 阻断重启而非静默完成回执。
7. `:188-216` v2 回执跨重启固化 accepted 的 Subject/role/原始哈希。
8. `:217-234` v2 skipped 理由与回执绑定，重算 ledgerHash 不能替换。
9. `:235-259` 遗留 v1 接收回执可审计读取但不能静默移交或变更。
10. `:260-281` 不允许跨 case、owner 换代吊销与文件系统篡改。

## 3. 真实断言

- `:73-84`：kind `'import'`、revision 0、三文件状态 `['needs-user-confirmation','rejected','needs-user-confirmation']`、拒绝子 `rawSha256` null、`candidateVersionKey` 全 null、重开实例 `toEqual` 一致、对拒绝子 decide 抛 `B2_LEDGER_ENTRY_NOT_CONFIRMABLE`、snapshot revision 0。
- `:90-119`：错 rawSha 抛 `B2_LEDGER_SOURCE_MISMATCH`；authorize:false 抛 `B2_LEDGER_AUTH_UNAVAILABLE`；首次 decide revision 1、key 匹配 `/^candidate-version-/`、reason 含 `'not applied'`、未决子不动；重放 `receipt/ledger` 均 `toEqual`；同 requestId 异体抛 `B2_LEDGER_REQUEST_COLLISION`；错 revision 抛 `B2_LEDGER_REVISION_CONFLICT`；第二笔 revision 2 且 `previousHash===首笔 receiptHash`、mutations 2；对已终结子再决定抛 `ENTRY_NOT_CONFIRMABLE`。
- `:136-140`：4 种篡改（状态回退/伪接受/伪理由/改拒绝理由）重算 ledgerHash 后 snapshot 均抛 `B2_LEDGER_CORRUPT`，恢复原件后 revision 1。
- `:160`：重复终结回执（自造 receiptHash 链）抛 `CORRUPT`。
- `:168-172`：外部写 `input.lock` 后 snapshot/getOrCreate 抛 `B2_LEDGER_LOCKED`、锁内容不被清、删锁后 snapshot 等于 before。
- `:180-186`：孤儿 tmp → snapshot/getOrCreate/decide 均抛 `B2_LEDGER_RECOVERY_REQUIRED`、tmp 内容保留、删后恢复。
- `:191-215`：初始 `/2`；回执 `confirmedRole==='supporting'`/`confirmedSubjectId==='subject-1'`/`confirmedRawSha256` 等于原始/`decisionReason` null；4 种固化字段篡改均 `CORRUPT`；新实例重放 `receipt` 相等、revision 1。
- `:223-233`：skipped 回执 confirmed* 全 null、`decisionReason` 为理由；改文件行理由重算哈希 → `CORRUPT`。
- `:253-258`：改 `/1` 后 snapshot 可读（revision 不变）、decide 抛 `B2_LEDGER_LEGACY_SCHEMA_UNPINNED`、`proposeB2MaterialCandidates` 抛 `B2_HANDOFF_LEGACY_BINDING_UNVERIFIABLE`。
- `:263-279`：跨 owner snapshot 抛 `B2_ARCHIVE_OWNER_SCOPE_MISMATCH`；revoke 后 decide 抛 `B2_OWNER_INVALID_OR_REVOKED`；换代（generation 2）snapshot revision 0、decide 回执 `ownerGeneration===2`；改 subjectId 篡改 → `CORRUPT`。

## 4. 未覆盖与脆弱点

未覆盖：`ROOT_UNSAFE`/`DIR_UNSAFE`/`FILE_UNSAFE`/`ARCHIVE_ID_INVALID`/`CONFIRMATION_INCOMPLETE`/`INVALID` 参数分支、真实并发锁竞争（单线程模拟）。「编辑者重算 ledgerHash」模型 = 主动篡改者（不是误操作）。`zip()` 自造最小 ZIP 依赖 `ReviewB2ArchiveVault` 解析宽容度（跨文件契约）。无 mock；全部真实 fs。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 10 用例行号与断言文本 | 已证实 | `:70-281` 逐条核对 |
| 篡改检测矩阵（4+4+2 种） | 已证实 | `:136-140/:208-211/:229` |
| 运行结果 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| initial/拒绝子不可变 | §3 | test:70-85 | covered |
| decide CAS/幂等/碰撞/链 | §3 | test:86-120 | covered |
| 终态重放/重复终结防篡改 | §3 | test:121-161 | covered |
| 锁/孤儿 tmp | §3 | test:162-187 | covered |
| /2 固化 + /1 只读 | §3 | test:188-259 | covered |
| owner/吊销/换代/篡改 | §3 | test:260-281 | covered |
| 少见错误分支/真并发 | §4 | — | unknown（无断言） |
| 实际运行 | §5 | — | unknown（NOT_RUN） |

---
path: apps/electron/src/main/lib/review/review-import-checkpoint-v3-b2.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: bd6d6cd21e796f7309e68c3899cff4f22ba12066
sha256: db69d54a060707f14988742af901b845fc645c0d819040c9d47b8b91d470d409
lines: 341
kind: test
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-import-checkpoint-v3-b2.test.ts

## 1. 测试目标

两个 describe：`B2 durable input checkpoint is not a CurrentCase writer`（`:40`）与 `B2 R18 restart reauthorization handshake never promotes old ZIP into Case`（`:254`）。验证 fsync 耐久检查点、篡改/伪装检测、owner 范围与撤销、符号链接/孤儿/容量锁防护、解压策略锁定（decodeProfile）、以及 R18 重启重授权握手（新候选≠旧 ACK、历史拒绝不升格）。被测：`ReviewB2ArchiveVault` 全方法 + `ReviewB2StagingService` 授权。夹具：`mkdtemp(review-v3-zip-durable-)`（`:8-9`）；手工 ZIP（CRC32 真算，`:10-36`）。本轮 `NOT_RUN`。

## 2. 用例清单

2 describe、**20 test**：

### 2.1 检查点非 CurrentCase 写者（10，`:40-252`）
| # | 行 | 断言要点 |
| --- | --- | --- |
| 1 | `:41-61` | fsync ZIP 存活新实例：`checkpointState==='bytes-durable-needs-confirmation'`、preview 回执 `needs-user-confirmation`、`inspect` 全等；新 ownerGeneration=2 的 `prepareRestage` → `needs-main-revalidation`、**restage 无 `physicalArchiveKey`**、字节相等；重放 `saveAndStage` 产生新候选（`ownerGeneration:2`） |
| 2 | `:62-69` | 同 requestId 异字节 → `B2_ARCHIVE_REQUEST_ID_COLLISION`，原 checkpoint 不变 |
| 3 | `:70-77` | archive.zip 篡改 → `CHECKPOINT_INTEGRITY`（无静默复活） |
| 4 | `:78-88` | 跨 owner → `OWNER_SCOPE_MISMATCH`；`revoke` 后 `inspect` → `B2_OWNER_INVALID_OR_REVOKED` |
| 5 | `:89-104` | 符号链接 archive.zip 指外部文件 → `RECOVERY_REQUIRED`（拒读外部文件；隔离目录防污染） |
| 6 | `:106-118` | 伪造子摘要+重算无密 JSON checksum → `CHECKPOINT_INTEGRITY`（“unkeyed 校验和不能修复伪造”，测试名） |
| 7 | `:119-132` | 伪造 rejected 状态压制原接受文件 → `CHECKPOINT_INTEGRITY` |
| 8 | `:133-146` | 篡改 decodeLimits 放宽 → `CHECKPOINT_INTEGRITY`（不能回溯升格被拒子项） |
| 9 | `:147-160` | 严格策略（maxEntryBytes:3）下子项 `BOMB_OR_SIZE_LIMIT` 拒绝；重启后仍 `rejected`；restage 无物理键 |
| 10 | `:162-175` | 同归档重试不能改历史策略/子项：无策略/异策略 → `DECODE_PROFILE_CONFLICT`；同策略重放 checkpoint 全等、receipt 仍 rejected |
| 11 | `:176-190` | 显式默认值策略与缺省等价（decodeProfile canonical）：checkpoint/preview 全等 |
| 12 | `:191-208` | 容量锁被他 PID 占用 → `CAPACITY_LOCKED`、锁文件无损、无孤儿写入；释放后同输入成功 |
| 13 | `:209-226` | legacy /1：`inspect` 可读（schema /1）；`saveAndStage` 拒 `LEGACY_PROFILE_UNPINNED`；`prepareRestage` 仍 `needs-main-revalidation` 且无物理键 |
| 14 | `:228-238` | 删 checkpoint.json 造孤儿：再存 → `RECOVERY_REQUIRED`；archive.zip 字节保留；`capacity.lock` 不存在 |
| 15 | `:239-250` | 根目录是符号链接 → `UNSAFE_ROOT`（写前拒绝，不跟进链接） |

（实测 test 计数 20：第一个 describe 15 个、第二个 5 个。）

### 2.2 R18 重启重授权握手（5，`:254-341`）
| # | 行 | 断言要点 |
| --- | --- | --- |
| 16 | `:255-277` | 新 generation+重选原件：`candidate-restaged-awaiting-owner-assignment`、`priorReceiptsPreserved:true`、`businessWriteAllowed:false`、checkpoint 全等、preview.extracted==历史 receipts、**candidateId 全新**、`ownerGeneration` 新、回执 `needs-user-confirmation`、`role:'unassigned'` |
| 17 | `:278-293` | generation 0/1（原/旧）→ `REVALIDATION_REQUIRES_FRESH_OWNER_GENERATION`；撤销 owner → `B2_OWNER_INVALID_OR_REVOKED` |
| 18 | `:294-310` | 改字节/改 requestId/空物理键 → `RESELECTED_ORIGINAL_MISMATCH`；`materialIds` 空、历史 receipts 不变 |
| 19 | `:311-322` | 锁定压缩策略存活重选：candidates 0、extracted 仍 `BOMB_OR_SIZE_LIMIT` rejected、`decodeLimits` 保持 |
| 20 | `:323-340` | legacy /1 重选：`inspect` 可读；`recoverAfterMainPicker` 拒 `LEGACY_PROFILE_UNPINNED` |

## 3. 真实断言

- #6/#7/#8 是三类伪造攻击的实证（重算 checksum 不能修复、压制接受、放宽策略）——对应 `readVerified` 的真实字节复验语义。
- #16 断言 `preview.extracted === fileReceipts`（历史回执钉住）与 candidateId 不同（新候选≠旧 ACK）。
- #12 断言锁文件内容不变（`held-by-other-pid`）。
- 所有篡改用例都手工重算 `manifestSha256`（无密 checksum）后再验——证明校验不止 JSON 自校验。

## 4. 未覆盖与脆弱点

**未覆盖**：`MAX_ARCHIVE_STORAGE_BYTES` 超限；`CHECKPOINT_LOCKED`（archiveId 级 write.lock）；`recoverAfterMainPicker` 的 `RECOVERY_RECEIPT_DRIFT`；`OWNER_GENERATION_STALE`（prepareRestage 负增长分支）；多进程真实并发。

**脆弱点**：篡改用例依赖 checkpoint.json 内部结构（`fileReceipts[0]` 等）；隔离目录注释说明 symlink 用例曾污染共享容量根（`:91-92`）；#12 用锁文件模拟他 PID（非真进程）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 describe、20 test、真实磁盘/ZIP | 已证实 | `:40/:254`；`grep -c test(`=20 |
| checkpoint≠写者、重启需重授权 | 已证实 | #1/#16 |
| 伪造三类拒绝 | 已证实 | #6/#7/#8 |
| 策略锁定/等价重试 | 已证实 | #10/#11/#19 |
| owner/撤销/范围防线 | 已证实 | #4/#17 |
| symlink/孤儿/容量锁/unsafe root | 已证实 | #5/#12/#14/#15 |
| legacy /1 只读不可重放 | 已证实 | #13/#20 |
| 两个容量/锁错误码 | 未知 | 未覆盖 |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 被测分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| `saveAndStage` 幂等/冲突/策略/锁 | #1/#2/#10-#12 | 多处 | covered |
| `readVerified` 完整性 | #3/#6-#8 | 多处 | covered |
| `prepareRestage` | #1/#9/#13 | 多处 | covered |
| `recoverAfterMainPicker` | #16-#20 | `:255-341` | covered |
| `inspect` | #4/#14 | 多处 | covered |
| 容量超限/write.lock/DRIFT/STALE | — | — | unknown |

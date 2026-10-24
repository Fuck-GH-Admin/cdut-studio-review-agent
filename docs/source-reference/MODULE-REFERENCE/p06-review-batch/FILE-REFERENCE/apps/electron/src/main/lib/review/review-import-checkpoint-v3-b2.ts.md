---
path: apps/electron/src/main/lib/review/review-import-checkpoint-v3-b2.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 35b4d9e757b5b1530c7ca0407c405e8513b5caf7
sha256: e276187fbd6714128710a45da442f39d73f53170483f5f85823083a3951afe66
lines: 322
kind: source
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-import-checkpoint-v3-b2.ts

## 1. 结论与边界

B2 耐久**原始 ZIP** 检查点（文件头 `:1-8`），与 CurrentCase/Run/Batch 分离：持久归档**永远不是**已信任安装的 MaterialVersion——重启后须由新认证的 Main owner 用新 token/generation 重新 staging。对 Dev-C 合同：调用方必须供认证的 `B2MainContext` 与可信 Native-picker `physicalArchiveKey`；本 vault 无公开 IPC。运行时模块，含 fsync 级原子落盘、容量锁与恢复握手。

不做的事：不做材料安装/业务写入（`businessWriteAllowed:false`）；不做 ZIP 解码（`review-zip-intake-v3-b2.decodeReviewB2Zip`）；不替代 Main 授权。

## 2. 导出与关键符号

| 符号 | 类型/类 | 行 | 说明 |
| --- | --- | --- | --- |
| `B2ArchiveCheckpoint` | interface | `:32-48` | schema `/1`（legacy）或 `/2`；含 `stagedOwnerGeneration`（审计用，**重启后不可复用为 token**，`:37`）、`fileReceipts`、`decodeLimits?`（/2 锁定解压策略，`:44`）、`checkpointState:'bytes-durable-needs-confirmation'`、`manifestSha256` |
| `B2RestageIntent` | interface | `:49-55` | `restage:{requestId;bytes}` + `status:'needs-main-revalidation'`（恢复字节无 Main 颁发物理键，须重新授权，`:51-52`） |
| `ReviewB2ArchiveVault` | class | `:58-322` | 检查点库 |

内部：`sha256/code`（`:20-21`，错误统一 `B2_ARCHIVE_*`）、`idPattern`（`:22`）、`MAX_ARCHIVE_STORAGE_BYTES=1GB`（`:23`）、`decodeProfile`（`:25-31`，canonical 有效 ZIP 策略——对象属性顺序/默认拼写不能绕过重试身份）、`sealedDigest`（`:56-57`）、`id/directory/safeArchiveDirectory`（`:61-78`）、`usedBytes/withCapacityLock`（容量锁）、`readVerified`（`:81-186`，读+完整性校验）、`saveAndStage`（`:192-253`）、`prepareRestage`（`:255-268`）、`recoverAfterMainPicker`（`:276-317`）、`inspect`（`:319-321`，只读探针，**非正式 Material 状态**）。

## 3. 内部逻辑与关键流程

### 3.1 `readVerified`（`:81-186`）

checkpoint.json + archive.zip 存在性、schema 1/2、archiveId/requestId/ownerId 匹配、字节长度+`sha256(archive)` 匹配、`sealedDigest` 校验 manifest、generation/物理键摘要/requestId/fileReceipts 形状（任一不符 `CHECKPOINT_INTEGRITY`）。**真实子字节复验**（`:158-184`）：按 `/2` 的 `decodeLimits` 或 legacy 无策略重解包；receipts 逐条比对 index/entryName/compressedSha256；`BOMB_OR_SIZE_LIMIT` 的历史拒绝**保持拒绝**（/1 未存策略也不能推断曾接受，`:175-180`）。返回克隆对象+字节。

### 3.2 `saveAndStage`（`:192-253`）

- 首尾 `assertStillGranted`；`withCapacityLock` 从配额检查到 rename 持有根租约（“独立 ZIP 不能同时看到同一剩余预算”，`:195-196`）。
- 已有 checkpoint：`archiveSha256` 不同 → `REQUEST_ID_COLLISION`；legacy /1 或无 decodeLimits → `LEGACY_PROFILE_UNPINNED`；`decodeProfile` 不同 → `DECODE_PROFILE_CONFLICT`（`:202-208`）。
- 新建：先解码（中心校验**在写入前**，`:188`）；超 1GB → `CAPACITY_EXCEEDED`；`mkdir 0o700` + `write.lock`（`wx`，失败 `CHECKPOINT_LOCKED`）；已有残留 `archive.zip`/`checkpoint.json` → `RECOVERY_REQUIRED`（部分落盘永不静默接受，`:189-190`）；写序：zip tmp→fsync→rename→manifest tmp→fsync→rename（`:230-244`，tmp 随机名 finally 清理）。
- 结束：返回 checkpoint 克隆 + `stageReviewB2TrustedZip` 预览。

### 3.3 恢复握手（`:255-317`）

- `prepareRestage`：`ctx.ownerGeneration < stagedOwnerGeneration` → `OWNER_GENERATION_STALE`；返回**仅** restage 字节，不带旧授权（`:254` 注释）。
- `recoverAfterMainPicker`：须**新鲜 owner generation**（`<=` 旧值 → `REVALIDATION_REQUIRES_FRESH_OWNER_GENERATION`）；/2+decodeLimits 必备；重选原件逐项匹配（requestId/物理键/长度/sha256/Buffer 相等）否则 `RESELECTED_ORIGINAL_MISMATCH`；按历史策略重解包，receipts 全等否则 `RECOVERY_RECEIPT_DRIFT`；staging 后返回 `{status:'candidate-restaged-awaiting-owner-assignment', businessWriteAllowed:false, priorReceiptsPreserved:true}`——新候选 ID 绝不是旧 MaterialVersion/业务 ACK（`:269-275` 注释）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/**/*.{ts,tsx}`（排除测试）：`review-import-handoff-v3-b2`（`ReviewB2ArchiveVault.inspect`，`:9/:39`）；Dev-C 导入预览/恢复链路（`review-intake-adapter-v3-b2` 同 ctx）；直接测试 `review-import-checkpoint-v3-b2.test.ts`。出向：`review-intake-adapter-v3-b2.{B2MainContext,ReviewB2StagingService}`、`review-zip-staging-v3-b2.stageReviewB2TrustedZip`、`review-zip-intake-v3-b2.decodeReviewB2Zip`、`config-paths`、`node:fs/crypto`。

## 5. 数据 I/O、读写与副作用

- **磁盘**：`review-v3-b2-intake-archives/{archiveId}/`（`0o700`）内 `archive.zip`+`checkpoint.json`（`0o600`）；fsync+rename 两段提交；`write.lock` 短期互斥。
- **副作用**：无日志/网络；容量上界 1GB；部分落盘→`RECOVERY_REQUIRED`。
- **并发**：`write.lock`（wx）+ 容量锁（withCapacityLock）；跨进程锁语义依赖文件系统（推断）。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 错误码 |
| --- | --- | --- |
| 身份/目录非法 | `:62-67` | `IDENTITY_INVALID`/`ID_INVALID` |
| 完整性任何不符 | `:141-183` | `CHECKPOINT_INTEGRITY` |
| 同 requestId 异字节 | `:204` | `REQUEST_ID_COLLISION` |
| legacy 未锁策略 | `:205-206/:285-286` | `LEGACY_PROFILE_UNPINNED` |
| 解压策略漂移 | `:207-208` | `DECODE_PROFILE_CONFLICT` |
| 超容量/锁占用/残留 | `:212/:217/:219` | `CAPACITY_EXCEEDED`/`CHECKPOINT_LOCKED`/`RECOVERY_REQUIRED` |
| owner generation 陈旧/不新鲜 | `:257-258/:283-284` | `OWNER_GENERATION_STALE`/`REVALIDATION_REQUIRES_FRESH_OWNER_GENERATION` |
| 重选原件不符/回执漂移 | `:296/:308` | `RESELECTED_ORIGINAL_MISMATCH`/`RECOVERY_RECEIPT_DRIFT` |
| 取消 | 无 | 无 AbortSignal |
| 恢复 | `:255-317` | 双握手（prepareRestage + recoverAfterMainPicker），绝不自动恢复授权 |

## 7. 权限与权威状态

- **非 Material 权威**：checkpoint 只是“字节已耐久待确认”（`checkpointState`）；安装需业务层另行确认。
- owner generation/token 生命周期：staged generation 仅审计；重启必须新认证 owner+新 picker 字节重授权（文件头、`:37/:51-52/:269-275`）。
- 历史拒绝不回溯升格（`BOMB_OR_SIZE_LIMIT` 保守保持，`:178-180`）；重解包锁定历史策略（`:297-298`）。

## 8. 修改影响面

改 checkpoint schema/校验 → 影响 handoff 候选生成与恢复链路；`decodeProfile` 口径影响重试身份；容量/锁语义影响并发导入。

## 9. 测试证据

本轮 `NOT_RUN`。直接测试 `review-import-checkpoint-v3-b2.test.ts`（详见其手册）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| checkpoint≠Material 权威、重启须重授权 | 已证实 | 文件头、`:269-280` |
| fsync 两段提交+部分落盘 RECOVERY_REQUIRED | 已证实 | `:187-244` |
| 真实字节/CRC 复验 + 历史拒绝保守保持 | 已证实 | `:158-184` |
| decodeProfile 锁定防策略漂移 | 已证实 | `:25-31/:207-208` |
| 恢复双握手+businessWriteAllowed:false | 已证实 | `:255-317` |
| 跨进程锁语义 | 推断 | 文件锁依赖 OS |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `B2ArchiveCheckpoint`/`B2RestageIntent` | 2 | `:32-55` | covered |
| `readVerified` | 3.1 | `:81-186` | covered |
| `saveAndStage` | 3.2 | `:192-253` | covered |
| `prepareRestage`/`recoverAfterMainPicker` | 3.3 | `:255-317` | covered |
| `inspect` | 2 | `:319-321` | covered |

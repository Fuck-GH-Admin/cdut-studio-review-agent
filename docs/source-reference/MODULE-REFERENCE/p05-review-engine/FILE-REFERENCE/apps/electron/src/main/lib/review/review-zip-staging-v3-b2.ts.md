---
path: apps/electron/src/main/lib/review/review-zip-staging-v3-b2.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 38d87196e49b73c62b6019ff2b1dceac3f02b175
sha256: 4e8c5655ab2093058c28399886708dff7a1446fcb3e9192887618e7159644843
lines: 99
kind: source
package: p05-review-engine
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-zip-staging-v3-b2.ts

## 1. 结论与边界

B2 ZIP → import-candidate 的 **Main 侧适配器**（文件头 `apps/electron/src/main/lib/review/review-zip-staging-v3-b2.ts:1-7`）：只接受 Main 校验过的归档字节 + Main 签发的物理归档键，把 ZIP 内文件逐个暂存为待确认候选并生成逐文件回执。明确声明"**ZIP 是候选文件集合，不是 ReviewBatchAttempt**"（`:6`）；staging 不建 Case（`:84`）。

边界：不解压到文件系统（解码在内存，`decodeReviewB2Zip`）；不做 Subject/role 归属确认（回执状态 `needs-user-confirmation`）；Renderer 不得伪造 `physicalArchiveKey` 调用（`:3-5`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `B2TrustedZipInput` | interface（export） | `:15-21` | `{ physicalArchiveKey; requestId; bytes: Uint8Array }` | requestId 重试键：同 id 不同字节必失败（`:18-19`） |
| `B2ZipImportPreview` | interface（export） | `:22-31` | `{ archiveSha256; archivePhysicalKeyDigest; extracted; candidates; receipts; importBatchKind:'import'; checkpoint:'staging-only' }` | 结果形状 |
| `stageReviewB2TrustedZip` | function（export） | `:32-99` | `(ctx, staging, archive, limits?) => B2ZipImportPreview` | 唯一入口 |
| `sha` | const（内部） | `:14` | `(value) => hex` | sha256(utf8) |

依赖：`B2MainContext`（`:29`）/`B2MaterialCandidate`（`:48`）/`B2ImportReceipt`（`:65`）/`ReviewB2StagingService`（`:79`）（`apps/electron/src/main/lib/review/review-intake-adapter-v3-b2.ts`，名称↔行号按实际 `export` 行）、`decodeReviewB2Zip`/`B2ZipLimits`（`review-zip-intake-v3-b2.ts:114`）。

## 3. 内部逻辑与关键流程

`stageReviewB2TrustedZip`（`apps/electron/src/main/lib/review/review-zip-staging-v3-b2.ts:32-99`）按序：

1. `staging.assertStillGranted(ctx)`（`:38`）——授权检查在入口。
2. 输入校验（`:39-42`）：`physicalArchiveKey` 非空 ≤256、`requestId` 非空 ≤128，否则 `throw Error('B2_ZIP_TRUSTED_INPUT_INVALID')`。
3. `decodeReviewB2Zip(archive.bytes, limits)`（`:43`）→ 失败即抛（`B2_ZIP_*`）。
4. `staging.claimArchiveRequest(ctx, requestId, physicalArchiveKey, decoded.archiveSha256)`（`:44-45`）——同 requestId 不同归档字节由服务层拒绝（`B2_REQUEST_ID_COLLISION`，见测试 §9）。
5. 计算 `archivePhysicalKeyDigest = sha(JSON([ownerId, ownerGeneration, caseCandidateId, physicalArchiveKey, archiveSha256]))`（`:46-49`）——**归档版本命名空间化**，不同版本绝不别名（`:67-68` 注释）。
6. 逐 extracted receipt 循环（`:52-93`）：
   - 每轮先 `assertStillGranted`（`:53`）；
   - `stableRequest = 'zip-' + sha(JSON([requestId, index, entryName])).slice(0,40)`（`:55-57`）；
   - 未被 accepted 的条目 → 只记 receipt（`status/reason` 原样，`:58-65`）；
   - accepted 条目：`sourceKey = 'zip-' + sha(JSON([archivePhysicalKeyDigest, index, entryName]))`（`:69-71`）→ `staging.grant` → `staging.stage(..., { fileName: entryName 尾段, physicalSourceKey, bytes, role:'unassigned', subjectId:null })`（`:72-78`）→ receipt `status:'needs-user-confirmation'`（`:80-85`）；
   - `stage` 抛 `B2_MATERIAL_INVALID`（正则精确匹配 `:87`）→ 记 `rejected` receipt 继续；其他错误原样上抛。
7. 返回 preview（`:94-98`）。

## 4. 调用者与调用链

- **入向**：`apps/electron/src/main/lib/review/review-import-checkpoint-v3-b2.ts`（生产检查点流程）、测试 `review-zip-staging-v3-b2.test.ts`（4 用例）、`review-v3-t02-staged-source-preview.test.ts`（T02 预览用例用其暂存）。
- **出向**：`review-intake-adapter-v3-b2` 的 `assertStillGranted/claimArchiveRequest/grant/stage`（`:38/:44/:72-73/:53`）；`review-zip-intake-v3-b2` 的 `decodeReviewB2Zip`（`:43`）；`node:crypto` 的 `createHash`（`:8/:14`）。

## 5. 数据 I/O、读写与副作用

- 输入：Main 校验字节 + 物理键；输出：内存 preview。
- 写入：经 `staging.stage()` 落到暂存存储（`ReviewB2StagingService` 内部，跨批文件；测试 `store.read(ctx, candidateId)` 可读回 `:56` 证明字节落存储）；`claimArchiveRequest` 记录 requestId 幂等占位。
- 副作用：无网络；不写 CurrentCase（文件头 `:3`）。
- 幂等：同 requestId + 同字节重复调用返回相同 candidateId（测试 `:59-67` 证实）；同 id 不同字节 → `B2_REQUEST_ID_COLLISION`。

## 6. 分支、失败、取消与恢复

- 显式失败：`B2_ZIP_TRUSTED_INPUT_INVALID`（`:41`）；`decodeReviewB2Zip` 的 `B2_ZIP_*` 全家（见 intake 手册）；`B2_REQUEST_ID_COLLISION`（服务层）；`B2_OWNER_INVALID_OR_REVOKED`（revoke 后，测试 `:82-88`）。
- 逐文件失败隔离：`B2_MATERIAL_INVALID` 只否决该条目（`:86-92`），其余继续；**其他异常整体中断**（`:87` rethrow）。
- 无取消机制（无 AbortSignal）；失败恢复：修正输入后以**新 requestId** 重发（旧 requestId 被占位）。

## 7. 权限与权威状态

- 信任边界在入参：`physicalArchiveKey` 必须来自可信 Native picker/drop 句柄（`:17-18` 注释），本文件不验证其来源（调用方 Main 适配层职责）。
- `ctx`（senderId/frameId/ownerId/ownerGeneration/caseCandidateId，`review-intake-adapter-v3-b2.ts:29`）贯穿 digest 计算（`:46-49`）与 staging 调用——Owner 授权以 `staging.assertStillGranted/claimArchiveRequest` 为权威。
- 候选一律 `role:'unassigned', subjectId:null`（`:77`）——归属确认权在用户，不产生 Case。

## 8. 修改影响面

- 改 digest/键构造 → 幂等与别名语义（跨版本命名空间）；影响 `review-import-checkpoint-v3-b2.ts` 恢复逻辑。
- 改 receipt 状态/字段 → `B2ImportReceipt` 消费方（导入 UI/检查点）与 2 个测试文件。
- `decodeReviewB2Zip` 行为变化 → 本文件 receipts 与 §9 测试。

## 9. 测试证据

**直接测试 `review-zip-staging-v3-b2.test.ts`（4 用例，bun:test，NOT_RUN）**，夹具为测试内合成 zip 字节 + 真实 `ReviewB2StagingService`：

1. `:40-58` 好文件暂存待确认/坏路径独立拒绝：断言 `importBatchKind==='import'`、`checkpoint==='staging-only'`（`:46-47`）、`candidates` 2 个、回执序列 `['needs-user-confirmation','rejected','needs-user-confirmation']`（`:49-51`）、候选 `role==='unassigned'`/`subjectId===null`/`rawSha256` 64hex（`:52-55`）、`store.read` 含真实字节（`:56`）。
2. `:59-67` 同 zip+request 重试幂等（同 candidateId `:64`）；同 request 改字节 → `toThrow('B2_REQUEST_ID_COLLISION')`（`:65-67`）。
3. `:69-81` 同 requestId 换不相交条目集原子拒绝（`:76-79`），旧暂存字节不变（`:80`）。
4. `:82-88` revoke 后拒绝摄入（`B2_OWNER_INVALID_OR_REVOKED`），不动 CurrentCase。

未覆盖：`physicalArchiveKey` 超长分支、`stage` 抛非 `B2_MATERIAL_INVALID` 的 rethrow 路径。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 导出 + sha 内部；主流程与逐文件隔离分支 | 已证实 | 逐行读 `:1-99` |
| 幂等/改字节拒绝/revoke 拒绝 | 已证实 | 测试 `:59-88` 断言 |
| digest 命名空间化防跨版本别名 | 已证实 | `:46-49`、`:67-71` |
| `claimArchiveRequest`/`stage` 服务层实现 | 推断 | 行为由测试断言佐证，`review-intake-adapter-v3-b2.ts` 未逐行读 |
| `physicalArchiveKey` 来源校验 | 未知 | 注释声明可信来源（`:17`），实证在 Native 适配层（跨批） |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `stageReviewB2TrustedZip` 全流程 | §3/§6 | `:32-99` | covered |
| `B2TrustedZipInput`/`B2ZipImportPreview`/`sha` | §2 | `:14-31` | covered |
| 幂等/隔离/revoke | §5/§9 | 测试行号 | covered（NOT_RUN） |
| 调用链 | §4 | 两侧行号 | covered |
| staging 服务内部 | §10 | — | unknown（跨批） |

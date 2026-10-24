---
path: apps/electron/src/main/lib/review/review-v3-t09-asset-registration.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: aa2d2a6ffdc436cfa13f62182ac5b661835af24a
sha256: f538db14367322e0230dc8cdde33ea2f706cf201cc5b1afc52183b00fa7140d4
lines: 81
kind: source
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-t09-asset-registration.ts

## 1. 结论与边界

T09 学生回件附件的真实登记（文件头 `:1-8`，OFF-05）：Main IPC 与测试共用同一真实写入路径（不伪造 deps）；原生 V3 / 模板 V2 两种案卷共用展示名与材料槽契约；临时文件只作中转、finally 即时清理，权威原件留在材料存储。运行时模块。

不做的事：不解析离线包（`review-v3-t09-offline-codec`）；不发凭据（`offline-issuer`）；不定义补件槽语义（Main 从案卷读取，不接受 Renderer 自选，`:30` 注释）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `T09AssetRegistrationResult` | interface | `:20-23` | `{versionId; revision}` |
| `T09AssetRegistrationInput` | interface | `:25-33` | `{caseId; displayName; bytes; materialSlotId?; authorizeAtCommit?}` |
| `registerT09StudentAsset` | function | `:41-81` | `(input) => Promise<T09AssetRegistrationResult>` |

内部：`LOCAL_ACTOR`（`:18`，`local-reviewer/local/reviewer`）；`safeTempName`（`:36-39`，非 `[A-Za-z0-9._-]` 替换 `_`、截 120、空回退 `offline-asset.bin`）。

## 3. 内部逻辑与关键流程

1. 校验：`displayName` 非空（“离线附件缺少原文件名”）；`bytes` 是非空 `Uint8Array`（“离线附件为空”）（`:42-43`）。
2. `readAggregate` 必须存在（“案卷不存在”）（`:44-45`）。
3. 临时文件 `t09AssetTempRoot()/{uuid}-{safeTempName(displayName)}` 写字节（`:47-48`）。
4. `input.authorizeAtCommit?.()`（`:50`）——提交前独立断言一次。
5. **双通道**：原生 V3（`isNativeWorkspaceCaseV3`）→ `registerNativeWorkspaceMaterialV3(caseId, tempPath, 'evidence', LOCAL_ACTOR, authorizeAtCommit, materialSlotId, {fileName: displayName})`（`:51-56`），然后从聚合按 `documentId` 找 active 版本（找不到“附件已登记但找不到对应原件版本”）（`:57-60`）；V2 → `registerMaterial`（`requestId=t09-asset-{uuid无连字符}`、`expectedRevision` 快照、payload sourcePath/role evidence/可选槽/displayName），`authorizeAtCommit` 传入事务（`:62-72`）；失败抛 message/“未返回版本记录”（`:73-74`）。
6. 返回 `{versionId, revision}`（`:60/:77`）；finally `unlinkSync(tempPath)`，清理失败不掩盖写入结果（`:78-80`）。

注意：`authorizeAtCommit` 在 V2 通道经 `registerMaterial` 第 3 参传入；原生通道既独立调用（`:50`）又传入 `registerNativeWorkspaceMaterialV3`（`:53`）——与 native 模块自身的双调行为叠加，一次登记该回调可触发 2-3 次（静态推断，未实测）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/**/*.{ts,tsx}`（排除测试）：`registerT09StudentAsset` 由 `review-v3-t09-main-service`（OFF-05 导入处理）调用；`t09AssetTempRoot` 自 `review-v3-t09-main-service.ts` 导入（`:16`，Main 拥有临时根目录）。出向：`case-store-v2.readAggregate`、`native-workspace-case-v3.{isNativeWorkspaceCaseV3,registerNativeWorkspaceMaterialV3}`、`material-service.registerMaterial`、`node:crypto/fs/path`。

## 5. 数据 I/O、读写与副作用

写临时文件（`t09AssetTempRoot()` 下，finally 删）；材料事务写物理原件与聚合；无网络/日志。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 缺文件名/空字节/案卷缺失 | `:42-45` | throw |
| 找不到版本/事务失败 | `:59/:73-74/:76` | throw |
| 清理失败 | `:79` | 静默 |
| 取消/恢复 | 无 | 无 AbortSignal；中断遗留临时文件（无清理钩子，推断） |

## 7. 权限与权威状态

actor 固定 `LOCAL_ACTOR`；`materialSlotId` 必须由 Main 从案卷读取（`:30` 注释）；`authorizeAtCommit` 是 Main 提交点断言钩子。权威原件在材料存储，展示名保留用户原名（`:27` 注释）。

## 8. 修改影响面

改登记路径 → 影响 T09 OFF-05 导入与测试；双通道联动 `native-workspace-case-v3`/`material-service`（`registerMaterial` 第 3 参 `authorizeAtCommit` 契约）。

## 9. 测试证据

本轮 `NOT_RUN`。直接测试 `review-v3-t09-asset-registration.test.ts`（详见其手册）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 真实写入路径、双通道、临时文件中转 | 已证实 | `:41-80` |
| 展示名保留、槽位 Main 供给 | 已证实 | `:27-31/:55/:70` |
| `authorizeAtCommit` 多次触发 | 推断 | `:50/:53/:72` 叠加 native 双调 |
| 中断遗留临时文件 | 推断 | 无清理钩子 |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 输入/结果类型 | 2 | `:20-33` | covered |
| `safeTempName` | 3 | `:36-39` | covered |
| `registerT09StudentAsset` 双通道 | 3 | `:41-81` | covered |

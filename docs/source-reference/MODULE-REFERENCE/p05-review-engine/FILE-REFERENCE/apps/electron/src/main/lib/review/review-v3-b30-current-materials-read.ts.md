---
path: apps/electron/src/main/lib/review/review-v3-b30-current-materials-read.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a26143b485b5a6d51622927916d781da25ac0fad
sha256: 31891a875e6472bc39e32418d91988feba402a4b1c2299108d5e439b8b8e6730
lines: 97
kind: source
package: p05-review-engine
author: docs-r07-author-nb-30-20261023
reviewer: p04-review-case-core
status: authored
evidence: static
---
# apps/electron/src/main/lib/review/review-v3-b30-current-materials-read.ts

## 1. 结论与边界

Dev-B R30：把既有 B2 Staging 变成**完整当前源清单**（`B30SourceInventory`），供未来 C Main 认证读取端口使用。枚举**全部**暂存记录，不是首个申请或首个 ZIP（`apps/electron/src/main/lib/review/review-v3-b30-current-materials-read.ts:1-5`）；「源清单不是 Case」（`:4`）。唯一导出函数 `readB30AllCurrentMaterials` **全程无 await**——注释 `:47-48`：旧 grant/Owner/epoch 不得穿过 IPC hop 而不被 C 在响应边界复查。

边界：不产生权威 Main 身份（`authoritativeMainIdentityIssuedByB:false`，`:13,86`）；`scopeIdentitySha256` 是不透明标识，不携带 Principal/session/frame/Picker 键给 Renderer（`:16-17`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `B30SourceInventory` | interface | 11-27 | `{schemaVersion:'review-v3-b30-complete-source-inventory/1'; candidateOnly:true; publicationAllowed:false; schoolPolicyVerified:false; authoritativeMainIdentityIssuedByB:false; caseCandidateId; ownerId; ownerGeneration; scopeIdentitySha256; allStagedCount; applicationCount; unassignedCount; archivedZipEntryCount; sources[]{candidateId,materialId,documentVersionId,rawSha256,byteLength,fileName,role,subjectId,archiveDerived,rawBytesRechecked:true}}` | ZIP 条目只是分组辅助，每条仍是独立原件（`:19-20`） |
| `readB30AllCurrentMaterials` | function | 50-97 | `(readCurrentScope:()=>B20MainReadScope\|null, staging:ReviewB2StagingService) => B30SourceInventory` | 同步函数 |

内部：`scopeValid`（`:28-37`，8 字段形状+非负安全整数）、`same`（`:38-43`，8 字段相等）、`fail`（`:10`，`Error('B_R30_'+reason)`）。

## 3. 内部逻辑与关键流程

`readB30AllCurrentMaterials`（`:50-97`）：

1. `:54-55` `readCurrentScope()` 非 `scopeValid` → `B_R30_C_MAIN_SCOPE_NOT_INSTALLED`。
2. `:56` `staging.assertStillGranted(start)`（B2 侧校验授权）。
3. `:57-59` `listScopedCandidateIds`：非数组/超 500/有重复 → `B_R30_INCOMPLETE_STAGING_REGISTRY`。
4. `:61-79` 逐 id：`getCandidate` + `read` 真实字节；候选归属（caseCandidateId/ownerId/ownerGeneration）不符、`status!=='accepted'`、rawSha256 非 64hex、`byteLength` 不符、**真实字节 sha256 ≠ 声明 rawSha256**（`:68-69`）→ `B_R30_PHYSICAL_BYTES_OR_CURRENT_OWNER_CONFLICT`；入列（`archiveDerived = physicalSourceKey.startsWith('zip-')`，`:76`）。
5. `:80-83` 二次 `readCurrentScope()` 与 start 八字段相等，否则 `B_R30_SCOPE_CHANGED_DURING_SOURCE_READ`；再 `assertStillGranted(end)`。
6. `:84-96` 组装：`scopeIdentitySha256=sha256(JSON([principalId,sessionId,senderId,frameId,ownerId,ownerGeneration,caseCandidateId,authorityEpoch]))`（`:89-92`，8 元不透明摘要）+ 三种计数。

## 4. 调用者与调用链

出向：`node:crypto`、`./review-intake-adapter-v3-b2`（`ReviewB2StagingService` 运行时 + `B2MaterialCandidate` 类型）、`./review-v3-b1-b2-main-read-bundle-v3-b`（B20MainReadScope 类型）（`:6-8`）。

入向（检索=符号名+模块名，全冻结树）：

- **产品链（主进程）**：`apps/electron/src/main/lib/review/review-v3-main-local-product-intake.ts:21,220`（`readB30AllCurrentMaterials(current,staging)`）← 该模块 `installC11LocalNativeProductIntake()`（`:237`）由 `apps/electron/src/main/index.ts:191,949` 装配；IPC 面 `LOCAL_PRODUCT_*_V3`（preload `:4839-4843`）。
- 类型 `B30SourceInventory`：`review-v3-b33-currentity-snapshot.ts:13,25`、renderer `components/review-v3-dev-b/review-v3-product-workflow.ts:7,24`（type-only）。
- 测试：`review-v3-b30-current-materials-read.test.ts:3,20,36,43,46`（本批）、`review-v3-b33-currentity-snapshot.test.ts:3,20`（批外）。

## 5. 数据 I/O、读写与副作用

只读：经 `staging.read(start,id)` 读物理字节做 sha256 重核（`:63,68-69`），不写盘、不发网络。副作用=抛错；无状态保留。同步无 await（`:47` 约定）。

## 6. 分支、失败、取消与恢复

- 失败=throw（4 个 `B_R30_` 码 + B2 抛出的 `B2_OWNER_INVALID_OR_REVOKED` 等透传）。
- 无取消概念（同步）。「恢复」= 上层重新安装 scope 后重读；两次 scope 比对（`:80-83`）保证读取中原子性幻觉不被接受。
- `rawBytesRechecked:true` 字面量表示逐条重读哈希（`:25,77`）。

## 7. 权限与权威状态

权限链：`readCurrentScope()` 由**C 已安装的可信 Main 运行时**提供（`:44-46` 注释：不得是渲染层函数体或调用者自批）；`staging.assertStillGranted` 前后各一次（`:56,83`）。权威否定：`candidateOnly:true/publicationAllowed:false/schoolPolicyVerified:false/authoritativeMainIdentityIssuedByB:false`（`:12-14`）。

## 8. 修改影响面

- 改枚举/校验 → 影响产品链 `review-v3-main-local-product-intake.ts:220`（LOCAL_PRODUCT_CURRENT_V3 等 IPC 背后）与 B33 稳定快照（`buildB33StableCurrentity` 消费 inventory）。
- `scopeIdentitySha256` 元组口径（`:89-92`）是 B33 `readVersion` 的组成部分（`review-v3-b33-currentity-snapshot.ts:160`），改动破坏前后快照可比性。
- 测试：本批 `review-v3-b30-current-materials-read.test.ts` + 批外 `review-v3-b33-currentity-snapshot.test.ts`。

## 9. 测试证据

直接测试 `review-v3-b30-current-materials-read.test.ts`（49 行，3 `test(`，真实 `ReviewB2StagingService`、无 mock）：①枚举 3 暂存（1 picker + 2 zip）→ `allStagedCount:3`、`applicationCount:1`、`archivedZipEntryCount:2`、candidateId 去重 3、`rawBytesRechecked` 全 true、两个 false 字面量；②读取中 epoch 变更 → `toThrow('B_R30_SCOPE_CHANGED_DURING_SOURCE_READ')`（scope getter 第 2 次返回 `{...scope,authorityEpoch:4}`）；③`readCurrentScope` 返回 null → `B_R30_C_MAIN_SCOPE_NOT_INSTALLED`；`revoke(scope)` 后 → `B2_OWNER_INVALID_OR_REVOKED`。**NOT_RUN**：未执行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全量枚举 + 逐条真实字节哈希重核 | 已证实 | `:61-79` |
| 无 await、前后双 scope 比对 | 已证实 | `:47,80-83` |
| 产品入口（main install → IPC） | 已证实 | `review-v3-main-local-product-intake.ts:21,220,237`、`main/index.ts:949` |
| ZIP 条目独立原件语义 | 已证实 | `:19-20,76` |
| 4 错误分支有直接测试 | 已证实（断言存在）/NOT_RUN | 测试 `:11-48` |
| `physicalSourceKey.startsWith('zip-')` 前缀判定的覆盖 | 推断 | `:76`；B2 侧 key 命名未读 |
| Renderer 具体展示 | 未知 | 仅 type 引用 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `B30SourceInventory` | §2 | 11-27 | covered |
| `scopeValid`/`same` | §2, §3 | 28-43 | covered |
| 主流程 6 步/4 错误码 | §3, §6 | 50-97 | covered |
| 产品链 | §4 | 消费方 | covered |

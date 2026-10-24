---
path: apps/electron/src/main/lib/sync-types.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 53b397b42da02053a3c44fec5a06334f2bbb1d50
sha256: fd0f621bbb53f4567fce2863e1d9f6051b0372b1f5813f324b7f454583683f7c
lines: 93
kind: source
package: p01-app-shell
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/sync-types.ts

## 1. 结论与边界

同步体系的纯类型定义（93 行，头注释 `:1-5`）：同步信封/拉取响应/文件同步状态/清单条目/工作区同步状态。**纯类型文件，无运行代码**。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `SyncOperation` | 类型（导出） | 8 | `'create'\|'update'\|'delete'` | 操作类型 |
| `SyncEntityType` | 类型（导出） | 11 | `'workspace'\|'skill'\|'file'` | 实体类型 |
| `SyncEnvelope` | 接口（导出） | 14-35 | `{id 幂等键, workspaceId, entityType, entityId, operation, payload, occurredAt, seq?, retryCount, lastError?}` | seq=服务端单调递增（同毫秒精确排序，`:29`） |
| `SyncPullResponse` | 接口（导出） | 38-44 | `{envelopes, lastOccurredAt, lastSeq, hasMore?}` | hasMore=服务端分页（`:42`） |
| `FileSyncStatus` | 类型（导出） | 47-52 | `synced\|syncing\|cloud-only\|local-only\|conflict` | 5 态 |
| `FileManifestEntry` | 接口（导出） | 55-62 | `{name, path, isDirectory, size, modifiedAt, sha256}` | 清单条目 |
| `SyncedFileEntry` | 接口（导出） | 65-73 | FileManifestEntry+`syncStatus, remoteModifiedAt?` | FileBrowser 用 |
| `WorkspaceSyncState` | 接口（导出） | 76-87 | `{workspaceId, lastFullSyncAt, lastIncrementalSyncAt, lastSeq 游标, pendingOutgoing, pendingIncoming, isSyncing, conflictCount, lastError?}` | 工作区同步态 |
| `SyncStateIndex` | 接口（导出） | 90-93 | `{version, workspaces: WorkspaceSyncState[]}` | 索引 |

导出合计 9（全类型）。`lastSeq` 游标语义（`:80-81`）：解决同毫秒丢数据。

## 3. 内部逻辑与关键流程

无（不适用，依据：纯类型声明）。

## 4. 调用者与调用链

入向（全冻结树检索 `sync-types`，3 文件）：`lib/sync-dead-letter.ts:8`（`SyncEnvelope`）、`lib/sync-manager.ts:19`（`SyncEnvelope`/`SyncStateIndex`/`WorkspaceSyncState`/`SyncPullResponse`）、`lib/file-sync-service.ts:17`（`FileManifestEntry`/`FileSyncStatus`/`SyncedFileEntry`）。出向：无。

## 5. 数据 I/O、读写与副作用

无（不适用，依据：纯类型）。

## 6. 分支、失败、取消与恢复

无（不适用）。

## 7. 权限与权威状态

无（不适用）。字段语义（幂等键/seq 游标）是同步协议契约。

## 8. 修改影响面

3 个消费方的同步实现（死信/管理器/文件同步）；`SyncEnvelope` 是客户端-服务端线协议形状，改动需两端同步。

## 9. 测试证据

直接测试：**无**（全冻结树检索 `sync-types` 无测试命中；检索范围=baseline/source 全树）。间接：sync-manager 等的测试（跨批）经类型间接使用。

`NOT_RUN`：本轮未运行任何测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 9 个类型/字段语义（幂等键/seq/hasMore） | 已证实 | `:1-93` 全文逐行 |
| 3 个消费方 | 已证实 | 全树检索（§4） |
| 服务端协议实现 | 边界（跨批/远端） | 字段注释 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 9 个导出类型 | §2 | 8-93 | covered |

---
path: apps/electron/src/main/lib/storage-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 42a31adb4df9f3b6e1f6954bbcff4861add7504a
sha256: e8f0562289a7385df53f7a16d4feeaa7eada20a6ef6173b4dbbd83d26518678e
lines: 699
kind: source
package: p01-app-shell
author: docs-r07-author-extra-01-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/storage-service.ts

## 1. 结论与边界

**存储管理服务**（699 行）：磁盘用量统计（7 类目录/文件类别）+ 孤儿数据检测与清理（会话/SDK/工作区/外置 blob）+ 归档清理 + 临时文件清理；供设置面板「磁盘管理」Tab 与启动自动清理调用（模块注释 `:1-6`）。

边界：删除均为不可恢复 fs 操作（无回收站）；孤儿判定的活跃集来自 `agent-session-manager`/`agent-workspace-manager` 索引（域外）；blob 引用集用正则扫描（非 JSON 解析，注释 `:149-158` 单向安全论证）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `StorageCategoryKey` | 导出类型 | 27-34 | 7 字面量（agent-sessions/sdk-config/workspaces/conversations/attachments/session-blobs/temp-files） | |
| `StorageCategory` | 导出接口 | 36-44 | label/key/bytes/count/hasOrphans/orphanBytes/orphanCount | |
| `StorageStats` | 导出接口 | 46-50 | `{categories, totalBytes, calculatedAt}` | |
| `CleanupOptions` | 导出接口 | 52-56 | `{categories, orphansOnly, archivedBeforeDays}` | |
| `CleanupResult` | 导出接口 | 58-62 | `{freedBytes, deletedCount, errors}` | |
| `calculateStorageStats` | 导出函数 | 441-456 | `(): Promise<StorageStats>` | 7 类并行统计 |
| `cleanupTempFiles` | 导出函数 | 460-494 | `(): Promise<CleanupResult>` | 预览/安装临时文件 |
| `cleanupStorage` | 导出函数 | 665-699 | `(options) => Promise<CleanupResult>` | 分发清理 |
| `getDirSize`/`safeUnlink`/`safeRmDir` | 内部函数 | 76-127 | 递归统计/删除（跳过 `SKIP_DIRS`，上限 `MAX_FILE_SCAN=100_000`） | |
| `collectReferencedBlobHashes` | 内部函数 | 159-179 | 会话 JSONL 正则收集 blob 引用 | |
| `walkBlobFiles` | 内部函数 | 182-206 | blob 目录遍历（跳 `.tmp-`） | |
| 7 个 `calc*Category` | 内部函数 | 208-439 | 逐类统计 | |
| `cleanupOrphan*`×4/`cleanupArchivedSessions` | 内部函数 | 496-663 | 孤儿/归档清理 | |

导出计数：`export` **8 条**（`:27`、`:36`、`:46`、`:52`、`:58`、`:441`、`:460`、`:665`），与源码逐条一致。

## 3. 内部逻辑与关键流程

- **统计**（`calculateStorageStats`，`:441-456`）：7 类并行（agent-sessions/sdk-config/workspaces/conversations/attachments/session-blobs/temp-files）。
- **blob 引用集**（`:159-179`）：正则 `"hash"\s*:\s*"sha256:([0-9a-f]{64})"` 扫全部会话 `.jsonl`（注释 `:149-158`：误匹配只会多保、绝不会误删在用数据的**单向安全**；⚠️ 不加缓存——追加写不改目录 mtime，基于 mtime 的缓存会漏新引用删活数据）。
- **session-blobs 类**（`:208-231`）：**先收集引用集再判孤儿**（注释 `:212`「顺序不能反」）；`walkBlobFiles` 跳 `.tmp-`；孤儿=文件名（hash）不在引用集。
- **孤儿口径**：agent-sessions=会话 `.jsonl` 文件名 id ∉ 活跃 id（`:233-265`）；sdk-config=projects/*/`*.jsonl` 的 sdkId ∉ 活跃 sdk id（含 forkSource，`:136-143`）+ file-history 目录 + 其他子目录计入（`:267-349`）；workspaces=slug 目录下条目 ∉ 活跃 id/slug，**元目录豁免**（workspace-files/skills/skills-inactive/.claude-plugin，`:370-375`）。
- **清理分发**（`cleanupStorage`，`:665-699`）：temp-files 无条件；`orphansOnly` → 4 个 `cleanupOrphan*`；`archivedBeforeDays>0` → 仅 agent-sessions/sdk-config 走 `cleanupArchivedSessions`。
- **孤儿清理安全序**：`cleanupOrphanSessionBlobs`（`:581-593`）注释 `:579`「先建引用集、再删，反过来会删掉在用数据」；删除均为 `safeUnlink`/`safeRmDir`（失败返回 0 不抛，`:109-127`）。
- **归档清理**（`:630-663`）：`archived && updatedAt ≤ cutoff` 的会话删消息 JSONL + SDK file-history（`rmSync`）。
- **防阻塞**：`SKIP_DIRS`（node_modules/.git 等 16 项）+ `MAX_FILE_SCAN=100_000` 全局文件计数上限（`:66-74`、`:81-98`）。

## 4. 调用者与调用链

- 入向（全冻结树 `grep storage-service|calculateStorageStats|cleanupStorage`，apps+packages 全类型）：
  - `apps/electron/src/main/ipc.ts:345` import；`STORAGE_IPC_CHANNELS.GET_STATS/CLEANUP/CLEANUP_TEMP`（`:6677-6687`）；启动自动清理（`settings.autoCleanupArchivedDays>0` 时清理归档会话，`:6749-6756`）。
  - 渲染：`StorageSettings.tsx`/`DataManagementSettings.tsx`（设置面板）经 preload。
  - **直接测试**：`storage-service.test.ts`（159 行，**6 test**，同批）。
- 出向：`./config-paths`（6 个目录函数）、`./agent-session-manager.listAgentSessions`、`./agent-workspace-manager.listAgentWorkspaces`、`./blob-store.blobRootDir`、`electron.app.getPath('temp')`、`node:fs/os/path`（`:8-23`）。

## 5. 数据 I/O、读写与副作用

- 磁盘读：7 类目录递归统计；会话 JSONL 全文（引用集）。
- 磁盘删：孤儿文件/目录（`unlinkSync`/`rmSync recursive+force`）、归档会话消息+file-history、临时文件。
- 副作用：console 日志；无网络；无持久状态（统计即时计算）。

## 6. 分支、失败、取消与恢复

- 单项删除失败：`safe*` 返回 0 继续；目录级失败记 `errors[]` 不中断（如 `:513-515`）。
- **删除不可恢复**（无备份/回收站，照实记录 §10）；「在用保留」由引用集/活跃集保证（`cleanupStorage({orphansOnly})`）。
- 取消：无（async 顺序执行）；恢复不适用。
- 边界：`getDirSize` 达 100k 文件上限截断计数（`:88`）；`conversations`/`attachments`/`temp-files` 无孤儿概念（`hasOrphans:false`）。

## 7. 权限与权威状态

- 无 sender/role 检查；IPC 三通道直通（`ipc.ts:6677-6687` 无入参授权）——删除面为**用户数据**，权威判定=本地索引活跃集 + blob 引用集。
- 启动自动清理仅在 `settings.autoCleanupArchivedDays > 0` 时执行（用户 opt-in，`:6749`）。

## 8. 修改影响面

- IPC `storage:*` 三通道 + 设置面板两组件 + 启动清理。
- `blob-store`/`agent-session-manager`/`agent-workspace-manager` 的索引与目录约定改动直接影响孤儿口径。
- 会话 JSONL 中 blob 引用的序列化格式（`"hash":"sha256:…"`）是引用集契约。
- 测试：`storage-service.test.ts`（6 用例）覆盖 blob 统计/清理安全序，改动需同步。

## 9. 测试证据

- 直接测试：`storage-service.test.ts`（159 行，bun:test，**6 test**，NOT_RUN）。mock 边界：`mock.module('electron', …)` 整体替换 electron（`:7-21`）；真实 fs 临时目录 + `PROFER_CONFIG_DIR` + 查询串模块隔离（`:29-38`）；`createSessionWithExternalizedPayload` 走**真实写入路径**造被引用 blob（400k 字符外置化，`:46-54`）；`writeOrphanBlob` 手写孤儿（`:57-63`）。
- 断言摘要：①被引用 blob 计入且 `orphanCount=0`、`bytes=400_000`（`:78-80`）；②混孤儿只计孤儿（count=3/orphanCount=2，`:90-92`）；③空 blob 全 0（`:97-99`）；④清理孤儿**在用保留**（`existsSync(usedPath)=true`/`orphanPath=false`，`:115-118`）；⑤只有被引用时一个不删（`:127-130`）；⑥清理后孤儿归零（`:141-142`）。
- 未覆盖：agent-sessions/sdk-config/workspaces/temp-files 四类孤儿清理、`cleanupArchivedSessions`、`MAX_FILE_SCAN` 截断、errors 聚合。
- `NOT_RUN`：未运行 bun test/产品测试/typecheck/build/GUI/真实清理；测试断言≠已运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 导出与 7 类统计 | 已证实 | `:27-62`、`:441-456` |
| 引用集单向安全+禁缓存论证 | 已证实 | `:149-158` |
| 先引用集后删的安全序 | 已证实 | `:212`、`:579-590` |
| 孤儿口径三类+元目录豁免 | 已证实 | `:233-398`、`:496-628` |
| 归档清理 opt-in（autoCleanupArchivedDays） | 已证实 | `:630-663`、`ipc.ts:6749` |
| SKIP_DIRS/100k 上限 | 已证实 | `:66-74` |
| 6 用例断言（含在用保留安全断言） | 已证实 | `storage-service.test.ts:72-143` |
| 删除不可恢复 | 已证实 | `safeUnlink/safeRmDir` 直删（`:109-127`） |
| 真实清理行为/大目录表现 | 未知 | NOT_RUN |
| 测试通过与否/运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `getDirSize`/`safe*` | §3 | 76-127 | covered |
| `collectReferencedBlobHashes`/`walkBlobFiles` | §3 | 149-206 | covered |
| 7 类统计 | §3 | 208-456 | covered |
| `cleanupTempFiles` | §3 | 460-494 | covered |
| 4 孤儿清理/归档清理 | §3/§6 | 496-663 | covered |
| `cleanupStorage` 分发 | §3 | 665-699 | covered |
| blob 统计/清理测试 | §9 | — | covered |
| 其余四类清理 | §9 | — | partial（无测试） |
| 运行验证 | §10 | — | unknown（NOT_RUN） |

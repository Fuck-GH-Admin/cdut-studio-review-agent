---
path: apps/electron/src/main/lib/file-sync-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f3cbc765568156e538ffe0452a943d484c4e9693
sha256: 9cf3cd718e49e29f7852a57c40879e696dab247093cb8a247efaa286c64adc2f
lines: 301
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/file-sync-service.ts

## 1. 结论与边界

团队工作区文件同步（头注 :1-8）：清单拉取（不全量下载）、按需下载、上传队列、冲突检测与备份（Phase 2：备份旧版+保留远程，:246 注释）。

边界：鉴权 `getTeamAuth`；存储根 `getWorkspaceFilesDir(slug)`。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `fetchFileManifest` | fn | 46-59 | 拉远程清单，失败回空数组 |
| `buildFileStatusList` | fn | 64-111 | 本地/远程合并状态（synced/conflict/local-only/cloud-only） |
| `downloadFile` | fn | 139-164 | 按需下载（mkdir 父目录+写盘） |
| `uploadFile` | fn | 170-204 | FormData+sha256 上传 |
| `backupConflictedFile` | fn | 210-227 | `.conflict-{ts}` 备份 |
| `resolveConflict` | fn | 233-246 | keep-local→上传 / keep-remote→备份+下载 |
| `getFileSyncStatus` | fn | 252-276 | 单文件状态 |

内部：`authedFetch`（:20-31，Bearer+undiciFetch）、`sha256File`（:34-37）、`walkDir`（:114-134，跳过隐藏（`.context` 除外））。

## 3. 内部逻辑与关键流程

1. **状态判定**（:64-111）：双侧存在→本地 sha256 对比远程（读失败→conflict）；仅本地→local-only；仅远程→cloud-only。
2. **上传**（:170-204）：本地读→sha256→`formData.append('file', Blob)`+`sha256` 字段→POST `/v1/workspaces/{id}/files/upload`；失败 throw `上传失败: HTTP …`。
3. **冲突**（:210-246）：备份为 `*.conflict-{Date.now()}`；keep-remote 先备份再下载覆盖。
4. **`getFileSyncStatus`**（:252-276）：双无→`synced`（:261，语义=无需同步）；双有→hash 比对。

## 4. 调用者与调用链

入向：工作区文件面板 IPC（`ipc.ts` 侧全树 grep）。出向：`./auth-service`、`./config-paths`、`./sync-types`、`undici`（:15）。

## 5. 数据 I/O、读写与副作用

网络 fetch（manifest/download/upload）；本地读写/复制/删除（`node:fs` 同步 API）；console 日志。

## 6. 分支、失败、取消与恢复

manifest 失败→空数组（不抛）；download/upload 失败→throw；备份失败→null+日志；无自动重试/取消。

## 7. 权限与权威状态

- 鉴权权威：全部请求 Bearer 团队 token（:25-28）；未登录 throw `未登录`。
- 冲突权威：不静默覆盖——备份旧版后才接受远程（:246 注释 Phase 2）。
- 无 sender/role 检查（主进程服务）。

## 8. 修改影响面

团队工作区文件同步 UI/Agent 工作目录共享。**无专属测试文件**（全树检索 file-sync-service.test = 0）。

## 9. 测试证据

直接测试：**无**。间接：`agent-workspace-manager` 测试族触及文件系统但不覆盖同步逻辑。NOT_RUN（无真实网络）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 导出/内部符号行号如 §2 | 已证实 | 逐条 |
| 状态四态/冲突备份语义 | 已证实（代码） | :64-111/:210-246 |
| 与远端契约正确性 | 未知 | 无测试、无真实服务 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `fetchFileManifest`/`buildFileStatusList` | §3.1 | 46-111 | covered |
| `downloadFile`/`uploadFile` | §3.2 | 139-204 | covered |
| 冲突备份/解决 | §3.3 | 210-246 | covered |
| `getFileSyncStatus` | §3.4 | 252-276 | covered |
| 全部行为 | — | — | unknown（无测试） |

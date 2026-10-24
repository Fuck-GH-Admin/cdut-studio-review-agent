---
path: apps/electron/src/main/lib/team-file-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 524a6a5a83f9426dd0db9c58202b3d5ff479edfd
sha256: 95c355ca2d86f1766c592b9c12dc70fe5929348b43e3e2ef527c952fd26dc041
lines: 637
kind: source
package: p03-integrations
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/team-file-service.ts

## 1. 结论与边界

团队文件服务（637 行）：用户**主动**上传/下载/删除团队工作区文件，"无后台同步"（`:4`）。本地侧维护两类数据：①下载缓存（工作区 files 目录或私有缓存）；②**本地来源映射**（`~/.cdutai/team-file-local-sources.json`，登记上传原件路径——删除/清理时保护原件，`:86-88`）。

不做的事：无后台同步/无自动上传；不定义服务端契约。

## 2. 导出与关键符号

**类型**：`TeamFileManifestEntry:14-27`（含 `fileId` 稳定身份 `:21-22`、`syncStatus`）、`TeamFileApiResult:520`、`TeamTrashEntry:521`、`FileSearchOptions:548`、`FileSearchResult:554`。

**文件操作**：`uploadFile:315-369`（octet-stream+X-Filename；成功后登记来源或写缓存，失败清理映射 `:344-352`）、`downloadFile:372-400`（原件优先→缓存校验命中→网络下载→**sha256 不符拒缓存** `:393`）、`deleteRemoteFile:403-421`（成功后清缓存树+来源树）、`moveRemoteFile:424-454`（同步移动来源映射+本地缓存）、`createRemoteDirectory:457`、`renameRemoteFile:584-637`（单键+目录递归更新映射 `:606-631`）。

**清单/元数据**：`fetchFileManifest:483-518`（**null=拉取失败 vs []=真没文件**，失败保留本地列表 `:479-481`；syncStatus 计算 `:497-514`，私有缓存不标 synced `:504-505`）、`getFileMetadata:525`/`patchFileMetadata:526`/`getFileTags:527`/`getFileStatuses:528`/`setFilePreference:529`/`getFileActivities:530`/`listTrashEntries:531`/`restoreTrashEntry:532`/`purgeTrashEntry:533`、`isFileLocal:536`/`getLocalFilePath:542`、`searchFiles:563-581`。

**内部关键**：`getSafePath:159-165`（**路径穿越防护**，`..`/绝对路径→null）、`getSafePrivateCachePath:172`（同路径冲突隔离区）、`isProtectedLocalSource:226`、`writeLocalCache:231-242`（**绝不覆盖上传原件** `:233`）、`rememberLocalSource:244`/`forgetLocalSource(:63)/forgetLocalSourceTree(:71)`/`moveLocalSourceTree:136`、`removeLocalCacheTree:89-106`（递归删除但保护原件，空目录才删）、`moveLocalCache:109-134`（工作区内安全检查 `:116-117`+空父目录清理）、`matchesExpectedSha256:180`、`getOriginalLocalFile:214`（按 teamAccountId 归属校验 `:215-220`）、`teamFileFetch:287-313`（401 刷新重试一次，仅当 token 真变化 `:311`）。

## 3. 内部逻辑与关键流程

上传：fetch→成功→(sourcePath ? 登记来源 : 写缓存)；来源登记失败不影响远端成功（`:347-350`）。下载：原件（归属+sha 校验）→缓存（sha 校验）→网络（sha 校验拒错版 `:392-393`）→写缓存。清单：拉取→按条目计算 localExists/syncStatus。移动/重命名：远端成功后同步本地映射与缓存。

## 4. 调用者与调用链

团队文件 UI（main IPC 层）；出向 `undici`、`./auth-service`（getTeamAuth/getAuthStatus/refreshAuthToken）、`./config-paths`（getConfigDir/getWorkspaceFilesDir）。

## 5. 数据 I/O、读写与副作用

HTTP（上传/下载/清单/元数据/回收站/搜索）+ 本地 fs（缓存读写/来源映射 JSON/递归清理/重命名移动）。

## 6. 分支、失败、取消与恢复

全函数 try/catch 静默降级（返回 false/null/错误对象）；sha256 不符→拒缓存/拒复用（宁可重下载）；401→刷新重试一次；manifest 失败→null（调用方保留旧列表）。

## 7. 权限与权威状态

- **原件保护红线**（`:86-88`/`:233`）："清理由团队下载产生的缓存，但绝不删除用户登记的原始本地源文件"。
- **路径安全**（`:116-117`/`:159-165`）：一切本地路径过 `getSafePath` 穿越防护。
- **不覆盖原件**（`:233-236`）：同路径冲突隔离到私有缓存。
- **归属校验**（`:215-220`）：`uploadedBy`≠当前账号不复用原件。
- **不缓存错版**（`:392-393`）：清单与下载间远端变更宁可返回 null。

## 8. 修改影响面

改缓存/映射逻辑影响 synced 状态与原件安全；`getSafePath` 是全部本地写的闸；manifest null/[] 语义是 UI 防清空关键。

## 9. 测试证据

无直接测试（同批无 team-file-service.test.ts）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（含照实记录）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件导出/安全红线/缓存语义 | 已证实 | 637 行全读 |
| `moveLocalCache:111-112` 用 `require('node:fs')` 函数内重引入（与顶部 import 并存）——照实记录（风格不一） | 已证实 | `:111-112` |
| `removeLocalCacheTree` 的 `remove` 递归对目录**空才删**（`:99`）——目录删不净时残留空壳 | 已证实 | `:99` |
| 服务端契约/幂等语义 | 未知 | 不在冻结树 |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全部导出（类型+15 函数） | §2 | covered |
| 上传/下载/清单/移动链 | §3 | covered |
| 5 条安全红线 | §7 | covered |
| 测试/服务端 | §9/§10 | unknown |

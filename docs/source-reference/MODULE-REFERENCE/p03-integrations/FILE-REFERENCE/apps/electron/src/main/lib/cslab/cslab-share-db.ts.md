---
path: apps/electron/src/main/lib/cslab/cslab-share-db.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c52cfab4b9273061c3a103c170b1c6bc943887ef
sha256: 98fe90a9918eee3b775b606df6749c204534bac31af337959ae2a844e4d2ff20
lines: 466
kind: source
package: p03-integrations
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-share-db.ts

## 1. 结论与边界

**CSLab 局域网共享盘观测库（node:sqlite）**（`cslab-share-db.ts:1-9` 注释）：每实验室独立 `db/share_watch.sqlite`，与 central_meta 隔离；`share_sources`（源配置/水位/扫描状态，**WebDAV 密码仅存密文** `:5`）+`share_candidates`（逐文件生命周期含租约证据与重试退避 `:6`）。**红线：本模块只做持久化，不做任何网络/文件系统探测**（`:8`）。

## 2. 导出与关键符号（16 条）

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CsLabShareDatabase`/`CsLabShareSourceRow`/`CsLabShareCandidateRow` | interface（export） | `:39-78` | 句柄/源行/候选行 |
| `getShareDbPath` | function（export） | `:125-128` | assertLabId+`db/share_watch.sqlite` |
| `getShareDatabase` | function（export） | `:130-145` | 连接缓存+建库（WAL/busy_timeout 5s `:83-84`） |
| `closeAllShareDatabases`/`closeShareDatabase` | function（export） | `:147-169` | 全关/单实验室关（**避免误伤其它实验室** `:158`） |
| `listShareSourceRows`/`getShareSourceRow`/`upsertShareSourceRow`/`updateShareSourceStatus`/`deleteShareSourceRow` | function（export） | `:263-352` | 源 CRUD；status patch 的 message null=显式清除（`:327-343`）；删除连带 candidates（`:350`） |
| `upsertShareCandidateRow`/`listShareCandidateRows`/`getShareCandidateRow`/`findPublishedCandidateBySha`/`countShareCandidates`/`toShareCandidate` | function（export） | `:356-466` | 候选 CRUD+按 sha 查已发布 |

内部：`SqliteStatement/Database/Module`（`:23-37`）、`SCHEMA_SQL`（`:82-123`，两表+三索引含 `UNIQUE(source_id, rel_path)` `:121`）、`connections` Map（`:80`）、行映射/枚举归一（`asKind/asStatus/asCandidateState/asLeaseType/asEvidence` 全部回退默认值 `:182-219`）。

## 3. 内部逻辑与关键流程

1. 连接（`:130-145`）：缓存命中复用；`require('node:sqlite')` 建库 exec schema。
2. 源 upsert（`:283-320`）：`ON CONFLICT(id) DO UPDATE`；include JSON 序列化（`:310`）；secretCipher 直存（密文，`:5`）。
3. 候选 upsert（`:356-398`）：`ON CONFLICT(source_id, rel_path)`——**同路径唯一**。
4. 查询：list 按 lab（可选 source、updated_at DESC `:400-415`）；`findPublishedCandidateBySha`（`:428-439`）。

## 4. 调用者与调用链

入向：`cslab-share-watcher`（同批 1159 行的持久化面）。出向：`./cslab-paths`、`node:sqlite`、`@profer/shared` 类型。

## 5. 数据 I/O、读写与副作用

读写 `db/share_watch.sqlite`（WAL）；连接缓存。红线：无网络/文件探测（`:8`）。

## 6. 分支、失败、取消与恢复

枚举归一回退默认（`:182-219`）；close catch 忽略（进程退出/重复关闭 `:151-153/:165-167`）。不适用取消/恢复。

## 7. 权限与权威状态

红线：只持久化不探测（`:8`）；密码密文存储（`:5`）；每实验室隔离（`:4`）。

## 8. 修改影响面

改 schema/映射 → 共享盘 watcher 状态机；唯一索引变更为候选生命周期语义。

## 9. 测试证据

无独立测试文件（经 `cslab-share-watcher.test.ts`（同批 341 行）间接覆盖持久化行为——见其测试手册）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 16 导出+schema+映射全链 | 已证实 | 逐行读 `:1-466` |
| node:sqlite 行为 | 未知 | Node 内建 |
| watcher 消费细节 | 未知 | 同批 watcher 手册 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 16 导出+schema | §2/§3 | `:39-466` | covered |
| 测试 | §9 | 间接 | covered（NOT_RUN） |

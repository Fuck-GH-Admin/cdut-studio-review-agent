---
path: apps/electron/src/main/lib/cslab/cslab-hpc-db.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5bc48493ceb0ff92408d724696018b531b665c1a
sha256: 51edd9bec55aff44f7bdc2ee37fb3e2989393b88d56e2d4933d7a9d30b88f5bf
lines: 401
kind: source
package: p03-integrations
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# apps/electron/src/main/lib/cslab/cslab-hpc-db.ts

## 1. 结论与边界

CSLab **超算作业上下文库**（node:sqlite，`apps/electron/src/main/lib/cslab/cslab-hpc-db.ts:1-8`）：每实验室独立 `db/hpc_jobs.sqlite`——`hpc_profiles`（集群档案，**口令只存密文**）+ `hpc_jobs`（JobContext 含确定性 UUID，是「关掉应用数天后重水合」的**唯一事实源**）。**红线**（`:8`）：本模块只做持久化，**不发起任何网络请求**。

边界：连接按 dbPath 缓存单例；schema WAL+busy_timeout 5000（`:73-75`）；uuid 唯一索引 `(lab_id, uuid)`（`:117`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `CsLabHpcDatabase` | interface | 36-39 | `{dbPath; raw}` | |
| `CsLabHpcBastionRecord` | interface | 41-47 | 跳板机（口令密文） | |
| `CsLabHpcProfileRow`/`CsLabHpcJobRow` | interface | 49-71 | 行模型（JobRow 含确定性 uuid+artifacts） | |
| `getHpcDbPath` | function | 122-125 | `db/hpc_jobs.sqlite` | |
| `getHpcDatabase` | function | 127-143 | 单例缓存+建库执行 schema | |
| `closeAllHpcDatabases` | function | 145-155 | 进程退出路径 | |
| `closeHpcDatabase` | function | 158-167 | 只关指定实验室（「避免误伤」，`:157`） | |
| `listHpcProfileRows`/`getHpcProfileRow`/`upsertHpcProfileRow`/`deleteHpcProfileRow` | function | 211-294 | 档案 CRUD（upsert ON CONFLICT） | |
| `upsertHpcJobRow`/`getHpcJobRow`/`listHpcJobRows`/`listActiveHpcJobRows`/`findHpcJobByRemoteId` | function | 296-373 | 作业 CRUD+非终态扫描 | |
| `toHpcJob` | function | 375-393 | Row→`CsLabHpcJob`（schedulerJobName 改名） | |

内部：`SqliteStatement/SqliteDatabase/SqliteModule`（结构化类型，`:21-33`）、`connections`（`:72`）、`SCHEMA_SQL`（`:74-118`）、`asScheduler/asState`（`:169-187`，非法→'slurm'/'UNKNOWN'）、`parseBastion`（`:189-205`，JSON 容错）、`rowToProfile/rowToJob`（`:207-246`，artifacts JSON 解析失败→[]）。

## 3. 内部逻辑与关键流程

- `getHpcDatabase`（`:127-143`）：缓存→mkdir→`require('node:sqlite')` 懒加载→exec schema→缓存返回。
- `listActiveHpcJobRows`（`:355-368`）：`state NOT IN (COMPLETED/FAILED/TIMEOUT/CANCELLED)`——重水合扫描输入（`:354` 注释）。
- upsert 双表均 `ON CONFLICT DO UPDATE`（保留 submitted_at 等不可变字段）。

## 4. 调用者与调用链

出向：`node:path/fs/sqlite`、`@profer/shared`（4 类型）、`./cslab-paths`（assertLabId/resolveLabDir）（`:10-19`）。入向（rg 全冻结树）：`main/index.ts:218`（closeAllHpcDatabases，进程退出）、`cslab-manager.ts:32`（closeHpcDatabase）、`cslab-hpc.ts:48`（多符号）、`cslab-hpc.test.ts:28,185,215-216`（动态 import）、`cslab/index.ts:45` 转发。

## 5. 数据 I/O、读写与副作用

SQLite 文件读写（WAL）；mkdir；无网络（红线）。

## 6. 分支、失败、取消与恢复

close 吞异常（进程退出/重复关闭）；JSON 解析失败→空值降级；无异步/取消（全同步 API）。

## 7. 权限与权威状态

本文件不适用（无权限代码）；红线即口径（`:8`）：只持久化不联网；「口令只存密文」（`:5`）是安全权威声明。

## 8. 修改影响面

- schema/行模型是 hpc 重水合唯一事实源（cslab-hpc 依赖）。
- `closeHpcDatabase` 的「避免误伤」语义（`:157`）。

## 9. 测试证据

`cslab-hpc.test.ts`（本批 266 行，动态 import 断言）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 只持久化不联网红线 | 已证实 | `:8` |
| 口令只存密文 | 已证实 | `:5,45,62` |
| uuid 唯一索引+非终态扫描 | 已证实 | `:117,355-368` |
| 单例连接缓存 | 已证实 | `:72,127-143` |
| 真实 SQLite 并发（WAL） | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 13+ 导出 | §2 | 36-393 | covered |
| schema/连接 | §3 | 72-143 | covered |
| CRUD/扫描 | §3 | 211-393 | covered |

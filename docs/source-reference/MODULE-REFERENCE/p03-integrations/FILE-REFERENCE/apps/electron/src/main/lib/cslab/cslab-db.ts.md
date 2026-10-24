---
path: apps/electron/src/main/lib/cslab/cslab-db.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: cf5226459e265e29202284011a2bb3da5e83e417
sha256: cef684d005bfd960775267e40943778b3fb20f72d8fdc830c3b1ce2948bce795
lines: 1178
kind: source
package: p03-integrations
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-db.ts

## 1. 结论与边界

CSLab **中心元数据库**（`apps/electron/src/main/lib/cslab/cslab-db.ts`，1178 行）：`central_meta.sqlite` 的连接管理、事务、实体/边/表格/胶囊/稿件/文献/Zotero 注解全量 CRUD 与 lab 修订号。cslab 其它模块（dataset-store/demo/capsule 等）的数据底座。

## 2. 导出与关键符号

`export` 共 **62**，按语义分 8 组：

**A. 连接/事务（`:36-343`）**：`CsLabDatabase`（`:36`）、`getCsLabDatabase(dbPath)`（`:272-287`，按路径缓存连接）、`closeCsLabDatabase`（`:289`）、`closeAllCsLabDatabases`（`:300`）、`withTransaction<T>(db, work)`（`:307-343`，事务包装）。

**B. 实体（`:41-433`）**：`CsLabEntityRecord`（`:41`）、`upsertEntity`（`:344`）、`getEntityByUri`（`:380`）、`findEntityBySha`（`:387`）、`listEntities`（`:401`）、`findEntityByTitle`（`:409`）、`countEntities`（`:423`，按层计数）。

**C. 边（`:434-481`）**：`insertEdge`（`:434`）、`CsLabEdgeRow`（`:449`）、`listEdgesTo`/`listEdgesFrom`（`:456`/`:468`）。

**D. lab 状态/修订（`:482-513`）**：`nextLabRevision`（`:482`，自增）、`getLabRevision`（`:493`）、`setLabState`/`getLabState`（`:500`/`:506`，KV）。

**E. 表格（`:58-546`）**：`CsLabTableRecord`（`:58`）、`upsertTable`（`:515`）、`getTable`（`:530`）。

**F. 胶囊（`:547-662`）**：`upsertCapsule`（`:547`）、`getCapsule`（`:581`）、`listCapsules`（`:601`）、`deleteCapsule`（`:620`）、`deleteCapsulesByManuscript`（`:624`）、`CsLabCapsuleRevisionRow`/`listCapsuleRevisionRows`（`:628`/`:636`）。

**G. 稿件（`:67-732`）**：`CsLabManuscriptRecord`（`:67`）、`upsertManuscript`（`:663`）、`getManuscriptRecord`（`:685`）、`listManuscriptRecords`（`:700`）。

**H. 文献/Zotero（`:76-1178`）**：`CsLabLiteratureSourceRecord`（`:76`）、`CsLabZoteroAnnotationRecord`（`:90`）、`CsLabZoteroCollectionRecord`（`:106`）、`upsertLiteratureSource`（`:733`）、`getLiteratureSource`（`:766`）、`listLiteratureSources`（`:773`）、`findLiteratureByZoteroKey`（`:783`）、`findLiteratureBySha`（`:794`）、`deleteLiteratureSource`（`:805`）、`findEntityByShaAndLayer`（`:810`）、`upsertZoteroAnnotation`（`:826`）及后续 Zotero 集合/查询（`:826-1178` 区段）。

| `CsLabProtocolRecord` | interface | `:952-963` | 协议记录 |
| `CsLabRunRecord` | interface | `:964-975` | 运行记录 |
| `upsertProtocol` | 函数 | `:1021-1047` | 写协议记录 |
| `getProtocolRecord` | 函数 | `:1048-1054` | 读协议记录 |
| `listProtocolRecords` | 函数 | `:1055-1061` | 列协议记录 |
| `upsertRun` | 函数 | `:1062-1106` | 写运行记录 |
| `getRunRecord` | 函数 | `:1107-1113` | 读运行记录 |
| `listRunRecords` | 函数 | `:1114-1131` | 列运行记录 |
| `findMaxRunBatchNo` | 函数 | `:1132-1144` | 最大批次号 |
| `decodeRunLinks` | 函数 | `:1145-1164` | 运行链接解码 |
| `deleteEntity` | 函数 | `:1165-1168` | 删实体 |
| `deleteEdge` | 函数 | `:1169-…` | 删边 |
| `countAnnotationsForItem` | 函数 | `:902-908` | 条目注释数 |
| `countZoteroAnnotations` | 函数 | `:895-901` | Zotero 注释数 |
| `listZoteroAnnotations` | 函数 | `:863-894` | Zotero 注释列表 |
| `upsertZoteroCollection` | 函数 | `:909-932` | 写 Zotero 集合 |
| `listZoteroCollections` | 函数 | `:933-951` | 列 Zotero 集合 |
## 3. 内部逻辑与关键流程

- **连接缓存**（`:272-287`）：按 `dbPath` 复用单一连接；`close*` 显式释放。
- **`withTransaction`**（`:307-343`）：BEGIN/COMMIT/ROLLBACK 包装，`work` 抛错回滚重抛。
- **`nextLabRevision`**（`:482-491`）：lab 修订自增（demo/dataset-store 用作 `revision` 字段）。
- 各 `upsert*` 为 `INSERT OR REPLACE` 风格幂等写。

## 4. 调用者与调用链

- 消费方：`cslab-dataset-store`/`cslab-demo`/`cslab-capsule`/`cslab-canvas-sync`/文献与 Zotero 同步。
- 出向：SQLite 驱动（better-sqlite3 系）。

## 5. 数据 I/O、读写与副作用

**SQLite 读写**（`central_meta.sqlite`）；连接缓存为模块级状态；无网络。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 事务内抛错 | `:307-343` | ROLLBACK 重抛 |
| 查无记录 | 各 `get*` | `null` |
| `findEntityByTitle` 等 | `:409` | 无命中 `null` |

## 7. 权限与权威状态

无身份维度；`revision`（`nextLabRevision`）是 lab 级因果版本；`locked`（实体记录字段）为只读标记。

## 8. 修改影响面

- 表结构（entities/edges/tables/capsules/manuscripts/literature/zotero）与全 cslab 耦合。
- `nextLabRevision` 自增语义影响并发写一致性。
- 连接缓存泄露（忘 close）影响进程退出。

## 9. 测试证据

`cslab-db.test.ts`（88 行）直接覆盖（见该测试手册）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 62 导出、8 组 CRUD | 已证实 | `grep -n "^export"` 全表 |
| 事务回滚语义 | 已证实 | `:307-343` |
| 连接缓存/释放 | 已证实 | `:272-305` |
| 表结构 DDL | 推断 | 各 upsert 字段（DDL 段未逐行列） |
| SQLite 实际行为 | 未知 | 未运行 |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 组 | 行 | 状态 |
| --- | --- | --- |
| A 连接/事务 | `:36-343` | covered |
| B 实体 | `:41-433` | covered |
| C 边 | `:434-481` | covered |
| D 状态/修订 | `:482-513` | covered |
| E 表格 | `:515-546` | covered |
| F 胶囊 | `:547-662` | covered |
| G 稿件 | `:663-732` | covered |
| H 文献/Zotero | `:733-1178` | covered |

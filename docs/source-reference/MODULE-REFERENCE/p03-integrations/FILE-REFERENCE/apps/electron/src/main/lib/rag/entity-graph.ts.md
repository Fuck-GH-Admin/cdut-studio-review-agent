---
path: apps/electron/src/main/lib/rag/entity-graph.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 73ab3b08ba2e4cc9245ea7451c29212463f7004c
sha256: df23c54302b41ec9c12c83cb243db23e4253a77ccd5b7a29c1eed85c9f40184f
lines: 140
kind: source
package: p03-integrations
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# apps/electron/src/main/lib/rag/entity-graph.ts

## 1. 结论与边界

轻量跨文档**二分实体图**（`apps/electron/src/main/lib/rag/entity-graph.ts:1-12`）：纯内存抽取工作区切片高基数键（学号/工号、寝室号、班级名），建「实体→切片」倒排索引；种子切片经共享标识符执行**跨文档关系 Join**，召回关联切片，解决「A 文档有班级无角色、B 有角色无班级」的实体孤岛（传统向量/关键词 RAG 失效场景）。**严格红线**（`:11`）：纯本地、零数据库、零磁盘写。

边界：`JOIN_KINDS` 仅 `id/room`（班级名基数太低仅作过滤维度，`:47-48`）；桥接上限缺省 3（`:111`）；仅桥接**其它文档**切片（`:122`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `EntityKind` | type | 15 | `'id'\|'room'\|'class'` |
| `EntityMention` | interface | 18-24 | `{kind; value; key}`（key=`kind:value`） |
| `EntityIndex` | interface | 27-35 | `{mentions; chunkEntities; canonical}` 只读倒排 |
| `RelationalBridgeResult` | interface | 38-43 | `{bridgeIndices; sharedKeys}` |
| `extractEntityMentions` | function | 54-71 | 三正则抽取+去重 |
| `buildEntityIndex` | function | 74-91 | 切片→倒排索引 |
| `findRelationalBridges` | function | 104-137 | 跨文档 Join |

内部：`JOIN_KINDS`（`:47-48`）、三正则（`ID_PATTERN` 10-12 位数字/`ROOM_PATTERN` 楼栋寝室/`CLASS_PATTERN` 中文班级，`:50-52`）、`normalizeEntityValue`（`:55-57`，空白/破折号/大小写归一）。

## 3. 内部逻辑与关键流程

- `extractEntityMentions`（`:54-71`）：三正则 matchAll→`(kind,value)` 去重。
- `buildEntityIndex`（`:74-91`）：三向映射（key→chunk 集合/chunk→key 集合/key→canonical 展示值）。
- `findRelationalBridges`（`:104-137`）：种子键收集（仅 JOIN_KINDS）→按 key 找候选切片→排除种子自身/**同文档**→`maxBridges` 截断→sharedKeys 证据注释。

## 4. 调用者与调用链

出向：无（零 import 纯函数）。入向（检索=符号名+模块名，全冻结树）：`rag/workspace-rag-service.ts:23,249,430`（buildEntityIndex/findRelationalBridges/EntityIndex，**唯一生产链**）+ `entity-graph.test.ts`（本批 3 test）。`extractEntityMentions`/3 类型**零外部引用**（仅内部+测试）。

## 5. 数据 I/O、读写与副作用

本文件不适用——依据：纯内存计算（红线 `:11`）。

## 6. 分支、失败、取消与恢复

无异常路径（空文本→[]）；maxBridges 早退；无异步。

## 7. 权限与权威状态

本文件不适用（无权限代码）；红线即口径（`:11`）：纯本地零磁盘写。

## 8. 修改影响面

三正则/JOIN_KINDS 是实体 Join 契约；测试 `entity-graph.test.ts`（3 test）。

## 9. 测试证据

`rag/entity-graph.test.ts`（本批 42 行/3 test，断言见该篇）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 红线（纯内存零写） | 已证实 | `:11` |
| 班级仅过滤不 Join | 已证实 | `:47-48` |
| 跨文档才桥接 | 已证实 | `:122` |
| 3 类型+extractEntityMentions 零外部引用 | 已证实（检索式见 §4，全冻结树） | caller 图 |
| 真实实体语料 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 7 导出 | §2 | 15-137 | covered |
| 抽取/索引/Join | §3 | 54-137 | covered |

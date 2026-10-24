---
path: apps/electron/src/main/lib/context-rag/conversation-index.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1335043b213b056a9a19da874024c58864469022
sha256: e6dcf0a597318f83816bc957d4d4dbb938bc25be71b8b7c819da13afc29f7472
lines: 329
kind: source
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/context-rag/conversation-index.ts

## 1. 结论与边界

**会话历史增量索引**（RAG 索引模式专用）：纯内存 Map 缓存（零 SQLite/零向量库/零额外磁盘写）；按 JSONL 字节偏移增量读取只解析新增行；图谱边与 Leiden 社群按 chunk 增量阈值重建控制成本；只读会话 JSONL 绝不修改（`apps/electron/src/main/lib/context-rag/conversation-index.ts:1-9`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ConversationIndexEntry` | 接口 | 52-65 | 缓存项（byteOffset/carry/turnState/chunkState/edges/communities/重建计数） |
| `ConversationSearchCorpus` | 接口 | 68-72 | chunks+docFreq+avgLength |
| `getConversationIndex` | 函数 | 223-297 | 获取/增量更新索引 |
| `getConversationSearchCorpus` | 函数 | 300-323 | 检索语料（含未闭合段） |
| `invalidateConversationIndex` | 函数 | 326-329 | 失效缓存 |

常量：MAX_CHUNKS=5000、EDGE_REBUILD_DELTA=5、COMMUNITY_REBUILD_DELTA=20、MAX_GRAPH_EDGES=2000、MAX_TERMS_PER_CHUNK=120、MAX_ENTITY_SCAN_CHARS=4000、MAX_ENTITIES_PER_CHUNK=60（`:31-43`）；实体正则族 PATH/ERROR/VERSION/NUMERIC_ID/IDENTIFIER（`:45-49`）。

## 3. 内部逻辑与关键流程

- `getConversationIndex`：文件不存在→空索引；size<byteOffset（截断）→**清空状态从零重读**（`:247-257`）；size 相同直接 refreshGraph；否则 `readNewBytes` 增量读+carry 半行缓存（`:264-266`）→坏行跳过（`:274-276`）→增量轮次/切块→trim 后若丢片则图谱整体重建（`:285-291`）。
- `buildConversationEdges`（`:126-185`）：相邻 0.8/共享实体 1.0/概念共现 0.5，去重+2000 边封顶。
- `refreshGraph`（`:188-217`）：边 5 片增量、社群 20 片增量重建（`buildHierarchicalCommunities` 来自 `../study/hierarchical-graphrag`——**跨目录依赖登记**）。

## 4. 调用者与调用链

入向：`conversation-retrieval.ts:23-27`。出向：`../config-paths`、`../study/hierarchical-graphrag`、`./conversation-chunks`、node:fs。

## 5. 数据 I/O 与副作用

只读会话 JSONL（openSync/readSync 区间读 `:93-104`）；内存缓存。

## 6. 分支、失败、取消与恢复

statSync 失败返回现有 entry（`:240-244`）；坏行跳过；截断自动重建。

## 7. 权限与权威状态

只读红线（`:8`）。

## 8. 修改影响面

阈值常量影响长会话成本/召回；`getAgentSessionMessagesPath` 路径契约。

## 9. 测试证据

无专属测试（glob `**/conversation-index*test*` 零命中——检索层测试间接覆盖）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 导出+增量/重建/图谱边 | 已证实 | `:1-329` 逐行 |
| hierarchical-graphrag 内部 | 未知 | 非本批 |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全部导出/增量链 | §2/§3 | covered |
| 测试/运行 | §9/§10 | unknown（NOT_RUN） |

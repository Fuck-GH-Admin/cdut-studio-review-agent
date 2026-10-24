---
path: apps/electron/src/main/lib/study/hierarchical-graphrag-retriever.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c99425446cd361e593d34a7711b54055c9db0890
sha256: f99a2d5d1c4b4ae813b8a023bd20a9bef203e0634f5db7fb2fb9d4033bf35f19
lines: 407
kind: source
package: p03-integrations
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# apps/electron/src/main/lib/study/hierarchical-graphrag-retriever.ts

## 1. 结论与边界

**分层认知检索器与粒度分析**（`apps/electron/src/main/lib/study/hierarchical-graphrag-retriever.ts:1-15`）：在经典混合检索（hybrid-retriever.ts **保持 100% 不动**）之外单开分层图谱检索——全域切块为图节点，融合知识图谱边+有界共现边，Leiden 三层社群（L0 考点/L1 章节/L2 课程宏观思想）。检索策略：常规 query=「词法+社群归属」打分；**宏观意图 query**（思想/演变/概述/全局/总结/主线/体系，`:37`）追加 L2 社群摘要条目（`community::L2::n`）。**严格红线**（`:10-13`）：纯本地内存零 SQLite；只读既有索引与图谱缓存；**绝不伪造原文**；异常兜底 `SEARCH_FAILED`。

边界：共现边硬上限 2000（防组合爆炸，`:34`）；摘录 500 字符；宏观条目「摘要即社群 summary，绝不编造」（`:373`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `HierarchicalGraphRagRetriever` | class | 232-347 | `invalidate/search`（会话指纹缓存） |
| `getHierarchicalGraphRagRetriever` | function | 401-406 | 单例 |

内部：参数常量（`:31-39`）、STOP_WORDS/tokenize（`:42-72`，与 hybrid-retriever 同方案本地实现）、`readGraphEdges`（`:76-82`，knowledge-graph.json）、`sectionOrder/createEdgeCollector`（`:85-104`，无向去重）、`buildChunkEdges`（`:112-157`：三边源=知识图谱 1.0/同文档相邻 0.8/跨文档共现 0.5（稀有概念 2-8 命中才连））、`splitSentences/buildExcerpt`（`:162-198`，句级打分+时序还原+80 字下限回退）、`CommunityIndex/buildCommunityIndex`（`:203-229`）、`scoreChunk`（`:351-370`：`lexical×0.7+communityBoost×0.3`，标题命中全权重/正文 0.6）、`buildMacroCommunityItems`（`:375-393`，score=`0.5+relevance×0.5`）。

## 3. 内部逻辑与关键流程

`search`（`:297-333`）：空查询→`EMPTY_QUERY`；空切块/词元→`success:true, items:[]`；打分排序截 topK（钳 MAX_STUDY_RETRIEVAL_TOP_K）→摘录→宏观意图追加 L2 条目在前；**try/catch 兜底 `SEARCH_FAILED`**（`:329-332`）。缓存按 `getStudyIndexFingerprint` 失效（`:258-279`）。

## 4. 调用者与调用链

出向：`node:path`、`@profer/shared`（3 类型）、`../config-paths`、`../safe-file`、`./study-document-indexer`（4 符号）、`./hierarchical-graphrag`（buildHierarchicalCommunities/2 类型）（`:16-27`）。入向（检索=符号名+模块名，全冻结树）：`study/study-retrieval-router.ts:14,35`（getHierarchicalGraphRagRetriever，**唯一产品链** ← main/ipc.ts:174、study-tools.ts:21、study-benchmark-server.ts:34）；class 零外部直接引用（经单例）。间接测试：批外 `study-retrieval-router.test.ts`（4 test）。⚠ 前缀碰撞：与 `hierarchical-graphrag.ts` 共享模块名前缀。

## 5. 数据 I/O、读写与副作用

只读 knowledge-graph.json+会话索引；内存缓存；console.warn。**零磁盘写**（红线）。

## 6. 分支、失败、取消与恢复

异常→`SEARCH_FAILED`（红线兜底）；空查询/空索引→空结果；无异步/取消（全同步）。

## 7. 权限与权威状态

本文件不适用（无权限代码）；红线即口径（`:10-13`）：绝不伪造原文、异常安全兜底。

## 8. 修改影响面

- 三边源权重/打分公式影响分层检索排序。
- hybrid-retriever 不动约束（`:4` 注释）是兼容契约。
- 测试：间接 study-retrieval-router.test（4 test）。

## 9. 测试证据

无同名测试；间接批外 `study-retrieval-router.test.ts`（4 test）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 红线（纯本地/不伪造/兜底） | 已证实 | `:10-13,329-332` |
| 三边源+2000 上限 | 已证实 | `:112-157` |
| 宏观意图 L2 追加 | 已证实 | `:323-326,375-393` |
| 打分 0.7/0.3 权重 | 已证实 | `:369` |
| 真实课程检索质量 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 导出 | §2 | 232-406 | covered |
| 边构建/聚类/打分 | §2/§3 | 112-370 | covered |
| 宏观意图 | §3 | 323-393 | covered |

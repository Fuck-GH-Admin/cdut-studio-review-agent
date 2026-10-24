---
path: apps/electron/src/main/lib/study/hybrid-retriever.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5d33053674861ab012a25fcd8d8272bd2cfd0639
sha256: 17ef456bf48cf60634ec3070ebe34732a01fdec7a85309284fc96791ac7c3515
lines: 372
kind: source
package: p03-integrations
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/study/hybrid-retriever.ts

## 1. 结论与边界

速课堂**经典混合检索引擎**（`apps/electron/src/main/lib/study/hybrid-retriever.ts`，372 行）：词面+语义混合检索（`searchHybrid`），`study-retrieval-router` 的 classic 引擎实现。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `GlobalStudyRetriever` | class | `:252-368` | 检索器（`searchHybrid` 等方法） |
| `getGlobalStudyRetriever` | 函数 | `:369-372` | 单例获取 |

## 3. 内部逻辑与关键流程

`GlobalStudyRetriever.searchHybrid(sessionId, query, options)`：词面（BM25 系）+语义相似度混合打分→topK 截断（`options.topK`）→`StudySearchKnowledgeResult`。内部含分块索引读取与打分融合（`:252-368` 区段）。

## 4. 调用者与调用链

- 调用者：`study-retrieval-router`（classic/回退）、`study-tools`。
- 出向：study 索引存储（`study-document-indexer` 系）。

## 5. 数据 I/O、读写与副作用

读索引（内存/文件）；无网络。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 空会话/空查询 | `:252-368` | 空结果/`EMPTY_QUERY`（router.test 锁定） |
| topK | — | 截断 |

## 7. 权限与权威状态

无身份语义；检索结果为证据来源。

## 8. 修改影响面

- 打分融合口径影响检索质量；单例生命周期影响缓存。

## 9. 测试证据

`study-retrieval-router.test.ts` 间接（空结果/EMPTY_QUERY）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 个导出、混合检索 | 已证实 | `:252-372` |
| 打分融合细节 | 推断 | 类体结构核对 |
| 检索质量 | 未知 | 未运行 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `GlobalStudyRetriever`/单例 | `:252-372` | covered |

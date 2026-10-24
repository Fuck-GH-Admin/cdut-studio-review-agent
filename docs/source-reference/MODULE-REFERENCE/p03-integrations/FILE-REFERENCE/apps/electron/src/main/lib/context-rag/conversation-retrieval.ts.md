---
path: apps/electron/src/main/lib/context-rag/conversation-retrieval.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8decf51b831512da3fe2bf1b470ba940ca9e90e5
sha256: 5a02a47ec026fd7adb0bddbe9706b0f2239a8605668d7ac9c02b0f82d2e60515
lines: 452
kind: source
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/context-rag/conversation-retrieval.ts

## 1. 结论与边界

**会话历史双引擎检索**（RAG 索引模式专用）：复用两类检索思想但**不修改速课堂任何实现**（`:4`）——经典混合（BM25+主题覆盖+图谱 1-Hop+RRF+句级显著性剪枝）与 GraphRAG（Leiden 三层社群+词法×社群打分+宏观意图摘要）；两链路召回后二次 RRF 融合组装 `<conversation_evidence>`（`apps/electron/src/main/lib/context-rag/conversation-retrieval.ts:1-9`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ConversationEvidenceItem` | 接口 | 41-48 | |
| `ConversationRetrievalResult` | 接口 | 51-62 | evidence+macroSummaries+recentTurns+stats |
| `searchClassicHybrid` | 函数 | 127-159 | BM25+语义覆盖+图谱 1-Hop→RRF 取 12 候选 |
| `searchGraphRag` | 函数 | 225-251 | 词法×社群打分+宏观意图 level-2 摘要（最多 2 条） |
| `retrieveConversationContext` | 函数 | 295-379 | 双引擎+二次 RRF 融合（top 6、预算 4000 字） |
| `buildIndexedContextPrompt` | 函数 | 421-452 | 最终 prompt：evidence+recent_context+working_memory+当前消息 |

常量：BM25 k1 1.5/b 0.75、RRF_K 60、CANDIDATE_K 12、FINAL_TOP_K 6、EVIDENCE_CHAR_BUDGET 4000、EXCERPT 500、RECENT_TURN_PAIRS 1、WORKING_MEMORY 2000、MACRO_INTENT_WORDS（`:29-38`）。

## 3. 内部逻辑与关键流程

- 经典混合（`:127-159`）：scoreBm25（`:73-89`）+scoreSemantic（title 1.0/body 0.6 覆盖率，`:91-103`）+图谱 1-Hop（seed 各 top5，`:142-151`）→RRF。
- GraphRAG（`:225-251`）：`scoreGraphRag`=词法 0.7+社群 boost 0.3（`:197-222`）；宏观意图词命中→level-2 摘要。
- `retrieveConversationContext`（`:295-379`）：**最近一轮固定经 `<recent_context>` 注入故从证据排除**（`:293` 注释；排除窗口含当前 openTurn 防自命中 `:313-317`）；证据组装 `buildExcerpt`（句级显著性剪枝按原序拼接，`:261-289`）受 4000 预算。
- `buildIndexedContextPrompt`：evidence 块（含信任提示注释 `:407`）+recent_context+working_memory（`.context/todo.md` 截 2000，`:381-394`）+当前消息；console.log 统计（`:447-449`）。

## 4. 调用者与调用链

入向：会话上下文编排（非本批）。出向：`./conversation-chunks`、`./conversation-index`、`../study/hierarchical-graphrag` 类型、node:fs。

## 5. 数据 I/O 与副作用

读 `.context/todo.md`（工作记忆）；console.log。

## 6. 分支、失败、取消与恢复

空 query/空语料→空证据保 recent（`:320-333`）；工作记忆读失败→空（`:391-393`）。

## 7. 权限与权威状态

不修改速课堂实现声明（`:4`）；evidence 注释引导引用 msg: 锚点（`:407`）。

## 8. 修改影响面

权重/预算常量影响召回质量；prompt 组装格式与模型侧解析契约。

## 9. 测试证据

`conversation-retrieval.test.ts`（5 用例，另篇）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 导出+双引擎+融合链 | 已证实 | `:1-452` 逐行 |
| 检索质量效果 | 推断 | 算法自述 |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全部导出/融合链 | §2/§3 | covered |
| 测试/运行 | §9/§10 | unknown（NOT_RUN） |

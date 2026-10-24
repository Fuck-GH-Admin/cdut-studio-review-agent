---
path: apps/electron/src/main/lib/context-rag/conversation-chunks.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 75eac764301350a3b00c41491a722ee116619291
sha256: 2e7678264be1de3f1374a9aeecb27e3f63e92d8dbe6dcf110b9f5e10ee952719
lines: 521
kind: source
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/context-rag/conversation-chunks.ts

## 1. 结论与边界

**会话历史切块引擎**（RAG 索引模式专用）：解析 `~/.cdutai/agent-sessions/{id}.jsonl` 的 SDKMessage 为「用户提问→助手回复+工具活动/结果」完整轮次；按相邻轮次主题漂移合并 800~1500 字语义段；输出带 message UUID 锚点、工具摘要/结果摘要的可检索切片。设计红线：纯本地零依赖、绝不修改原始 JSONL、不采信/不编造原文之外内容、thinking 块不入索引（`apps/electron/src/main/lib/context-rag/conversation-chunks.ts:1-13`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ConversationToolResult` | 接口 | 54-58 | |
| `ConversationTurn` | 接口 | 61-69 | 轮次（userText/assistantText/toolSummary/toolResults/messageIds/timestamp） |
| `ConversationChunk` | 接口 | 72-85 | 切片（chunkId/turnStart-End/content/termFreq/length） |
| `MutableTurn`/`ConversationTurnState`/`ConversationChunkState` | 类型 | 88-103 | 状态结构（openTurn/pendingTurns/similarities） |
| `tokenizeConversationText` | 函数 | 108-121 | 中文单字+bigram、英文/数字 ≥2 词、过滤停用词 |
| `appendMessagesToTurnState` | 函数 | 282-320 | 增量消费 SDKMessage 更新轮次 |
| `finalizeOpenTurn` | 函数 | 323-327 | openTurn 收尾（查询时最近上下文） |
| `getRecentTurns` | 函数 | 330-336 | 最近 N 轮（含未闭合） |
| `renderTurnText` | 函数 | 339-354 | 单轮纯文本（带 msg: 锚点） |
| `buildChunksFromTurns` | 函数 | 458-461 | 一组轮次→单语义段 |
| `appendTurnsToChunkState` | 函数 | 474-499 | 增量切块（主题漂移合并） |
| `getSearchChunks` | 函数 | 502-504 | 正式切片+未闭合段 |
| `trimChunkState` | 函数 | 507-511 | 超限丢最旧 25% |
| `rebuildChunkState` | 函数 | 514-521 | 从零重建（截断恢复） |

常量：MIN 800/MAX 1500/HARD_MAX 1800、DRIFT_K=0.6、WINDOW_RADIUS=2、TOOL_RESULT 600/TURN_TOOL 1200/SUMMARY 240（`:17-32`）、STOP_WORDS（`:35-40`）。

## 3. 内部逻辑与关键流程

- 轮次解析：user 文本→closeOpenTurn+新轮（`:285-293`）；tool_result 归属当前轮（`:294-298`）；assistant 文本追加+tool_use 摘要+id→name 映射（`:302-318`）。
- 切块：`jaccard` 相似度+`isDrift`（滑动窗口均值-K·std，`:371-380`）；shouldCut=漂移且 ≥800 字，或溢出 1500；超 1800 单轮 `splitOversizedTurn` 按句边界拆（绝不截断句子，`:419-455`）；chunkId=`conv-{sid}-{t0}-{t1}[-pN]-{fnv1a}`（`:404/:442`）。
- 工具结果截断双层（单条 600/单轮 1200，`:240-249`）。

## 4. 调用者与调用链

入向：`conversation-index.ts:19-28`、`conversation-retrieval.ts:14-21`、两测试文件。出向：`@profer/shared` 类型。

## 5. 数据 I/O 与副作用

无（纯函数；JSONL 读取在 index 层）。

## 6. 分支、失败、取消与恢复

无 throw；空内容轮次丢弃（hasTurnContent，`:251-253`）。

## 7. 权限与权威状态

红线注释 `:9-12`（不修改原文、不编造、thinking 不入索引）。

## 8. 修改影响面

常量口径影响索引质量与检索命中；chunkId 算法是图谱/检索稳定契约。

## 9. 测试证据

`conversation-chunks.test.ts`（6 用例，另篇）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 14 导出+切块算法+红线 | 已证实 | `:1-521` 逐行 |
| 漂移阈值效果 | 推断 | 算法自述 |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全部导出/算法 | §2/§3 | covered |
| 测试/运行 | §9/§10 | unknown（NOT_RUN） |

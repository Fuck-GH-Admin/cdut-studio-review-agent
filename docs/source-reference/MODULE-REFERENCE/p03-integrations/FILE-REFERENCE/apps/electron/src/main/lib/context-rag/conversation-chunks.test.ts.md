---
path: apps/electron/src/main/lib/context-rag/conversation-chunks.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1876534e1506a1a713c6c8143546b85e2d95f227
sha256: c6e94fe9cfb4e63bc911cadf0409eca694345513ff9a469a8b9c88e6b969c654
lines: 178
kind: test
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/context-rag/conversation-chunks.test.ts

## 1. 测试目标

会话切块引擎测试（`:1-10` import 被测 `appendMessagesToTurnState/appendTurnsToChunkState/getRecentTurns/getSearchChunks`，**被测文件本批另篇**）。mock 边界：无 mock——构造 SDKMessage 形态字面量（userMessage/assistantMessage/toolResultMessage 工厂 `:12-50`）。

## 2. 用例清单

2 describe、6 test：

- `会话历史轮次解析`（`:56`）3：`:57` 用户-助手-工具结果归属同一轮+锚点、`:83` 工具结果超长单条截断+单轮总量受限、`:98` openTurn 参与最近轮次。
- `会话语义段切块`（`:114`）3：`:115` 多轮短对话合并 800~1800 字语义段、`:142` 单轮超长按句边界拆分不截断句子、`:165` pending 轮次参与检索。

## 3. 真实断言

- `:70-80` turns 1 个、userText/assistantText、toolSummary 含 `[tool: Read: src/a.ts]`、toolResults 归属 `{toolName:'Read'}`、messageIds `['u1','a1','r1']`、openTurn='继续'。
- `:93-95` 单条 ≤601、单轮总量 ≤1201（对应 600/1200 常量+省略号）。
- `:133-138` 已闭合 chunk ≥800 字、全部 ≤1800、chunkId 前缀 conv-session-1-。
- `:158-161` 超长拆多片、每片 ≤1800 且以「。」结尾（不截断句子）。
- `:174-176` 检索切片含当前段。

## 4. 未覆盖与脆弱点

未覆盖：主题漂移切段判定（isDrift）、trimChunkState、rebuildChunkState、FNVI chunkId 稳定性。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 用例锚点与断言文本 | 已证实 | `:56-177` |
| 运行结果 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| 轮次解析/截断/切块/超长拆分 | §3 | covered |
| 漂移切段/trim/rebuild | §4 | unknown（未覆盖） |
| 实际运行 | §5 | unknown（NOT_RUN） |

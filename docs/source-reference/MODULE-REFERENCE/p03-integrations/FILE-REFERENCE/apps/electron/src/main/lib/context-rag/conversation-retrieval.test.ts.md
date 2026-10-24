---
path: apps/electron/src/main/lib/context-rag/conversation-retrieval.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: bf8b1ad7d61af2fb70f46cba6d65c5335f19a625
sha256: 5528d8560380e1e5638626ccbf3c08d58c89544b0b3d25637668df230161b122
lines: 129
kind: test
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/context-rag/conversation-retrieval.test.ts

## 1. 测试目标

双引擎检索测试（`:1-9`）：被测 `retrieveConversationContext`（本批另篇）。mock 边界：无 mock——手工构造 4 轮会话 entry（`buildEntry` `:28-69`：4 chunk+L1/L2 社群+1 条边）。

## 2. 用例清单

1 describe、5 test（Given/When/Then 命名）：

1. `:72` 缓存提问→命中相关轮次且排除最近一轮。
2. `:84` 当前消息已落盘为 openTurn→最近上下文保留上一完整轮。
3. `:106` 宏观意图→返回 level-2 社群摘要。
4. `:114` 空 query→不返证据但保留最近上下文。
5. `:122` 证据总字符数≤4000 预算。

## 3. 真实断言

- `:76-81` evidence>0、首条命中 chunks[1]、**无 turnEnd===3**（最近轮排除）、recentTurns 1 且为「继续刚才的文件。」。
- `:100-103` recentTurns='部署脚本放在哪里？'（上一完整轮）、**证据无 turnEnd≥2**（openTurn+最近轮都排除）。
- `:110-111` macroSummaries 含「项目主线」。
- `:118-119` 空证据+recent 保留。
- `:126-127` 总字符 ≤4000。

## 4. 未覆盖与脆弱点

未覆盖：buildIndexedContextPrompt 组装、working_memory 注入、buildExcerpt 句级剪枝细节、classic/graph 候选统计字段。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 用例锚点与断言文本 | 已证实 | `:71-128` |
| 运行结果 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| 排除语义/宏观摘要/空 query/预算 | §3 | covered |
| prompt 组装/工作记忆 | §4 | unknown（未覆盖） |
| 实际运行 | §5 | unknown（NOT_RUN） |

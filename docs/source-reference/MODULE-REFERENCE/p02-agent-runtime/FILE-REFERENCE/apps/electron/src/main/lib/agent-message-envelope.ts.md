---
path: apps/electron/src/main/lib/agent-message-envelope.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: eb32891fc7068c71eda56541689dd4a811fc3031
sha256: d4d5712a9b087d2cf659c80fa92145cc665738f8e01ea2084ce3ea5655cf93f5
lines: 64
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-message-envelope.ts

## 1. 结论与边界

当轮消息封装（Context Sandwich，头注释 :1-7）：`<USER_REQUEST>` 只承载用户正文；附件/划词/RAG/工具提示进 `<SYSTEM_CONTEXT>`——防用户请求边界被材料覆盖（提示注入面防护）。

## 2. 导出与关键符号

导出 4 条（`export` :12/:20/:34/:49）：`ExtractedUserBlocks`（:12-17，pureText/contextBlocks）、`extractInjectedUserBlocks(userMessage)`（:20-32）、`AgentContextEnvelopeInput`（:34-41）、`buildAgentContextEnvelope(input)`（:49-64）。内部：`INJECTED_USER_BLOCK_PATTERN`（:10，匹配 attached_files/quoted_file/quoted_context 三标签，反向引用 `\1` 闭合）。

## 3. 内部逻辑与关键流程

`extractInjectedUserBlocks`（:20-32）：正则替换三类块→contextBlocks（按出现顺序），正文压缩空行（:29）。`buildAgentContextEnvelope`（:49-64）：顺序固定 metadata→`<SYSTEM_CONTEXT>`（合并抽取块+注入块，空块过滤 :52-53）→`<USER_REQUEST>`（仅 pureText）；无 contextBlocks 时不注入 SYSTEM_CONTEXT（:58）。

## 4. 调用者与调用链

入向（子agent 交叉核）：生产 `lib/agent-orchestrator.ts:135`（buildAgentContextEnvelope 调用 :1578/:3985）；测试 `agent-message-envelope.test.ts:2`。出向：**零 import**（纯字符串/正则）。

## 5. 数据 I/O、读写与副作用

无（纯函数）。

## 6. 分支、失败、取消与恢复

三块抽取+空块过滤+空 SYSTEM_CONTEXT 短路；无 throw。不适用取消/恢复。

## 7. 权限与权威状态

提示注入防护边界：结构化块绝不进 USER_REQUEST（:47 注释）。

## 8. 修改影响面

orchestrator 消息组装（两处调用）；模型输入形态。需同步测试 `agent-message-envelope.test.ts`（6 用例）。

## 9. 测试证据

`agent-message-envelope.test.ts`（批内，2 describe/6 用例，NOT_RUN）：剥离三块保留正文（:18-23）、quoted_file 抽取（:26-29）、分域严格（:33-59，含顺序断言 metadata<SYSTEM_CONTEXT<USER_REQUEST :57-58）、无块不注入（:61-64）、空 USER_REQUEST 不编造（:66-73）、普通 XML 不误剥（:75-80）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 4 条；零 import；分域顺序固定 | 已证实 | :10-64 |
| 提示注入防护语义 | 已证实 | :47；测试 :49-58 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 导出+三分支 | §2/§3 | :10-64 | covered |
| 测试 | §9 | — | covered（NOT_RUN） |

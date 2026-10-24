---
path: apps/electron/src/main/lib/agent-prompt-utils.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 61f8f6fbd925abda34107f6021084489865adc9c
sha256: 66d550f8001f31fcba50ea7fecc8b48bc4478749d80e6210befed3fb32382f78
lines: 285
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-prompt-utils.ts

## 1. 结论与边界

Prompt 构建纯函数集（头注释 :1-4，自 orchestrator 提取）：上下文注入（记忆策略「打碎 ReAct 历史累乘」:139-142）、Session 恢复 prompt、被引用会话 prompt。历史检索为轻量词元倒排（中文单字+bigram/英文词 :63-77）。

## 2. 导出与关键符号

导出 8 条（`export` :12/:18/:21/:26/:144/:213/:235/:247）：

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `MAX_CONTEXT_MESSAGES=20` | `:12` | 历史候选扫描上限 |
| `DEFAULT_SESSION_TITLE`/`DEFAULT_MODEL_ID='claude-sonnet-4-6'` | `:18-21` | |
| `extractSDKToolSummary(content)` | `:26-41` | tool_use 块→`[tool: name: keyParam]`，单条 200 字符截断（:15/:38-40） |
| `buildContextPrompt(sessionId, msg, sessionHint?, retrievalQuery?)` | `:144-203` | 见 §3 |
| `buildRecoveryPrompt(sessionId, msg, sessionHint)` | `:213-233` | `<session_recovery>` 自引用（读历史恢复后继续） |
| `escapeContextAttr(value)` | `:235-241` | XML 属性转义（&"/<>） |
| `buildReferencedSessionsPrompt(currentSessionId, mentioned?, workspaceId?)` | `:247-285` | 见 §3 |

内部常量：`RECENT_TURN_PAIRS=1`（:44）、`HISTORY_RELEVANCE_THRESHOLD=0.2`/`HISTORY_MIN_MATCHED_TERMS=2`/`MAX_RELEVANT_TURNS=2`（:47-53）、停用词表（:56-61）；内部函数：`contextTokenize`（:64-77）、`toConversationTurns`（:97-125，user→assistant 配对）、`renderTurnLine`（:128-134）、`sessionHistoryDisplayPath`（:206-208）、`getSessionCliCommandPrefix`（:243-245，`"$PROFER_CLI"` 或 `profer`）。

## 3. 内部逻辑与关键流程

- `buildContextPrompt`（:144-203）：无历史→原文（:151-157）；紧邻 1 对轮（:159）+`<session_info>` 提示读全史（:163-166）；历史检索（:168-196）：候选末 20 轮、词元覆盖率≥0.2 且命中≥2 词、取 top2 按原序注入 `<relevant_history>`（含「不代表本轮请求」声明 :191）；console.log 注入统计（:198-201）。
- `buildReferencedSessionsPrompt`（:247-285）：去重过滤（:252）；跳过自身/archived/跨 workspace（:259-263）；**探索分支边界**（:267-274）：`<exploration_delta>` 声明只看 fork 后内容，先 `session export --after-message`、禁止全量导出；外层提示 Grep 定位再局部读（:284）。

## 4. 调用者与调用链

入向（子agent 交叉核）：生产 `lib/agent-orchestrator.ts:162-170`（buildRecoveryPrompt :739、buildReferencedSessionsPrompt :1501/:3950、buildContextPrompt :1599）+`lib/cdut/yanhu/yanhu-pi-runtime.ts:33`（DEFAULT_MODEL_ID）。备注：extractSDKToolSummary/escapeContextAttr 除 import 外 orchestrator 无符号命中（疑似未用或类型期使用，照实记录）。**否定**：无 agent-prompt-utils.test.ts（glob 仅源）。出向：`./agent-session-manager`（:7）、`./config-paths`（:8）、`@profer/shared` 类型。

## 5. 数据 I/O、读写与副作用

读会话消息/元数据（getAgentSessionSDKMessages/getAgentSessionMeta）；console.log 两处。无写。

## 6. 分支、失败、取消与恢复

空历史三短路（:151/:154/:157）；检索阈值过滤（:183）；引用会话四过滤（:252/:259-263）。不适用取消/恢复。

## 7. 权限与权威状态

注入边界：`<relevant_history>` 声明非本轮请求（:191）；探索分支只看 fork 后内容（:269-272）——防上下文越权。

## 8. 修改影响面

orchestrator prompt 组装（三处调用）；记忆策略行为。无直接测试（否定已证）。

## 9. 测试证据

无直接测试（glob `agent-prompt-utils*.ts` 仅源文件）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 8 条；记忆策略+检索阈值 | 已证实 | :44-203 |
| 探索分支边界声明 | 已证实 | :267-274 |
| extractSDKToolSummary/escapeContextAttr orchestrator 是否实用 | 未知（仅 import 命中） | §4 |
| 无直接测试 | 已证实（否定） | 全树 glob |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 8 导出+检索/引用链 | §2/§3 | :12-285 | covered |
| 测试 | §9 | — | unknown |

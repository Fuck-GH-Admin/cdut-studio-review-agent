---
path: apps/electron/src/main/lib/review/pi-review-agent-client.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b34e732be4a8ad843139257f7edfd61d5f71c2e6
sha256: cb4b4bd596817927a8c9838664a5a15c3641ba80ab012a1b655629953d19d758
lines: 202
kind: source
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/pi-review-agent-client.ts

## 1. 结论与边界

把审核语义请求交给项目 Pi Agent 运行时的客户端（头注 :1：不单独实现模型 HTTP 协议）。每个审核语义调用用**独立临时 Pi transcript**，执行后删除避免幽灵会话（:76）；内建超时、取消、工具终止判定、失败兜底（工具已执行但无摘要 → 人工兜底 JSON；纯文本超时/上游失败 → 待办兜底）、图像失败降级纯文本重试。

边界：不校验审核业务结果（在 `pi-case-review-service`）；SDK 加载可注入（测试 fake）；会话/权限由 Pi 运行时承担（`permissionMode:'bypassPermissions'` :144）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `PiReviewModelClientOptions` | interface | 15-26 | `{channel, apiKey, model, baseUrl?, timeoutMs?, cwd, piAgentDir, query, abort?, loadSdk?}` | 构造选项 |
| `createPiReviewModelClient` | fn | 77-201 | `(options) => ReviewModelClient` | 唯一导出函数 |

内部：`textFromMessage`（:28-36）、`isVisionCompatibilityFailure`（:38-41）、`imageFailureReason`（:43-47）、`hasStructuredJson`（:49-58）、`REVIEW_TOOL_RESULT_FALLBACK`/`REVIEW_TIMEOUT_FALLBACK`（:60-69，两个兜底 JSON）、`isRecoverableReviewServiceFailure`（:71-74）、`runPi`（:81-183）。

## 3. 内部逻辑与关键流程

1. **协议/模型解析**（:78-79）：`provider==='ollama' ? 'ollama-chat' : 'openai-chat'`；`configuredModel` 按 id 忽略大小写匹配渠道模型（透传 `context1m/contextWindow/maxTokens`，:141-143）。
2. **`runPi`**（:81-183）：
   - 入口即查 `signal.aborted` → `审核已取消`（:82）；加载 SDK（`options.loadSdk ?? 动态 import('@earendil-works/pi-coding-agent')`，:83）。
   - 工具注册 `buildPiReviewToolDefinitions`（:86-105，自 `pi-review-executor`）；`onToolResult` 回调维护 `completedReviewToolAttempt` 与 `completedReviewToolKeys`（接受 `results[].data.toolKey/toolKeys`，:89-101），终止条件：给 `requiredToolKeys` 时须全部到齐（:102-103），否则要求本批全部 item `ok`（:104）。
   - 独立会话：`sessionId='review-'+randomUUID()`、`sessionDir=mkdtempSync(tmpdir()/cdut-pi-review-)`（:106-107）。
   - 超时：`deadlineAt = complete() 里 now + timeoutMs ?? 150_000`（:190）；`setTimeout` 到点 → `timedOut=true`、`stop()`（abort 会话）并以 `Pi 审核 Agent 超时（…ms）` 拒绝（:114-118）；`onRuntimeRegistered` 在已取消/超时时补 stop（:110）。
   - 取消：`signal` 的 `abort` 事件 → stop + `AbortError('审核已取消')`（:119-125）。
   - 流式消费（:128-165）：`options.query({…permissionMode:'bypassPermissions', systemPrompt:request.system, toolProfile:'customTools', maxTurns:24, thinkingLevel:'off', images…})`；每条消息先查取消/超时（:155-156），`assistant` 文本累积（:157-158），`result` 且 subtype≠success → throw `Pi 审核 Agent 未完成：…`（:159-162）。
   - 结果裁决（:166-169）：无文本但工具已执行 → `REVIEW_TOOL_RESULT_FALLBACK`；无文本无工具 → throw `没有返回可用的结构化结果`；工具已执行但文本无 JSON → fallback。
   - 错误裁决（:170-177）：工具已执行且非取消 → fallback；**纯文本**（无图）且有终止工具且非取消且错误属可恢复服务失败（超时/5xx/网络，:71-74）→ `REVIEW_TIMEOUT_FALLBACK`；否则重抛。
   - `finally`：移除监听、清定时器、`rmSync(sessionDir)`（:178-182）。
3. **`complete` 包装**（:188-200）：先按带图跑；失败且非 `retryWithoutImages===false` 且（有图且错误属视觉兼容失败 :38-41）→ 拼「图像请求降级」提示（图像事实待人工核对）后**无图重试**，返回 `{content, imagesDropped:true, imageFailureReason}`（:194-198）；否则原样抛。

## 4. 调用者与调用链

入向：`run-async-service.ts:14`（生产唯一），调用点 `:52` `createPiReviewModelClient({…})` 组装 `ReviewModelClient`（`assembleReviewClient` :33）；`pi-review-agent-client.test.ts:4`（8 处构造）。出向：`./pi-review-executor` `ReviewModelClient` 类型 + `buildPiReviewToolDefinitions`（:8-9）；`../adapters/pi-agent-adapter` 类型 `PiAgentQueryOptions`（:7）；`node:crypto/fs/os/path`（:2-5）。

## 5. 数据 I/O、读写与副作用

- 磁盘：`mkdtempSync` 建临时 transcript 目录并在 `finally` `rmSync` 删除（:107/:181）；不落业务数据。
- 运行时副作用：`options.query`（Pi Agent 运行时会话）、`options.abort(sessionId)`（取消上游会话，:109）、`setTimeout`。
- 副作用最小化：每次调用独立会话、用完即删（:76 注释）。

## 6. 分支、失败、取消与恢复

- 取消：`signal.aborted` 检查于入口/流中/事件（:82/:155/:119-125）；取消后抛 `AbortError`，不走 fallback（:171 排除）。
- 超时：`Pi 审核 Agent 超时（…ms）`（:117/:156）；纯文本且可恢复时降级为 `REVIEW_TIMEOUT_FALLBACK`（明确「不作推定」，:65-69）。
- 视觉兼容失败：带图请求失败（错误信息匹配 image/vision/多模态/HTTP 4xx-5xx/timeout/网络，:38-41）→ 无图重试并声明「图像内容未核验」（:43-47/:196-198）；`retryWithoutImages:false` 或无图 → 原样抛（:194-195）。
- 恢复语义：无自动重试（除图像降级一次）；fallback JSON 把缺项留给人工（:60-69）。

## 7. 权限与权威状态

- 会话权限：`permissionMode:'bypassPermissions'`（:144）——Pi 运行时侧的工具权限放开，但工具集合由 `buildPiReviewToolDefinitions` 白名单固定（见 executor 篇）。
- 兜底 JSON 明确「已接受的事实和检查以系统记录为准；未接受或缺少证据的项目需人工核对」（:61-62）与「缺失事实和语义检查均保持人工确认或补件，不作推定」（:66）——权威不因模型失败而转移。
- 无 sender/role 概念（Main 侧绑定在 `pi-case-review-service`/assignment 层）。

## 8. 修改影响面

- 改终止判定（requiredToolKeys/全部 ok）影响 `submit_checks` 提前结束行为与 `pi-review-agent-client.test.ts`。
- fallback/降级文案是产品可见输出（进入 `submitPiReviewResultV2` 解析路径），改动影响下游解析与测试断言。
- `run-async-service.ts` 的异步审核管线依赖其返回形状 `{content, imagesDropped?, imageFailureReason?}`。

## 9. 测试证据

直接测试 `pi-review-agent-client.test.ts`（8 个 test 声明，含 1 个 `test.each`×3 参数 = 10 运行用例 / 1 describe；`loadSdk` fake `{defineTool}`、`query` 手写异步生成器（真实 SDK/网络无）；NOT_RUN）：
1. `:7-38` 批量内检查被拒 → `terminateHint` `undefined`（不提前结束）、`content==='{"ok":true}'`。
2. `:40-64` `requiredToolKeys` 两键：`terminateHints` `toEqual([undefined, true])`（全到齐才终止）。
3. `:66-92` 非终止工具（record_observations）不误判 → `rejects.toThrow('没有返回可用的结构化结果')`。
4. `:94-110` 超时（query 直接抛）→ 兜底 `opinion` 含 `'本轮未得到可核验的模型结论'`。
5. `:112-140` `test.each` 三种失败（502/内部错误/超时）：带图失败 → 无图重试，`imagesDropped:true`、`imageFailureReason` 含 `'带图请求失败'`、第二次 prompt 含 `'图像事实一律待人工核对'`、observedImages 为 `[有图, 无图]`。
6. `:142-158` `retryWithoutImages:false` → 原错重抛，observedImages 仅一次带图。
7. `:160-199` ollama → `protocol==='ollama-chat'`、`toolProfile==='review'`、`agentRuntime==='pi'`、customTools 仅注入工具、images 透传、`onToolCall` 记录。
8. `:201-215` query 永不返回（15ms 超时）→ <500ms 结束、`abort` 被调、兜底 opinion 同 4。

未覆盖：`REVIEW_TOOL_RESULT_FALLBACK`（工具执行后无摘要）分支、`assistant.error` 抛错分支、`result` subtype≠success 分支、真实 SDK 加载；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出/内部符号行号如 §2 | 已证实 | :15-201 |
| 独立临时 transcript 用后即删 | 已证实 | :106-107/:181 |
| 终止判定（requiredToolKeys 优先） | 已证实 | :102-104；测试 :40-64 |
| 图像降级只发生一次且显式声明 | 已证实 | :194-198；测试 :112-158 |
| 超时/可恢复失败 → 不作推定兜底 | 已证实 | :65-74/:174-176 |
| 生产唯一调用者 run-async-service | 已证实 | :14/:52 |
| 真实 Pi SDK 行为（defineTool/query 流） | 未知 | 测试 fake；NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `createPiReviewModelClient`/`runPi` 主链 | §3 | 77-201 | covered |
| 终止判定三态 | §3.2 | 86-105 | covered（测） |
| 超时/取消/错误裁决 | §6 | 108-177 | covered（测） |
| 图像降级 | §3.3 | 188-199 | covered（测） |
| `REVIEW_TOOL_RESULT_FALLBACK` 分支 | §9 | 166-173 | partial（未测） |
| `assistant.error`/`result` 失败分支 | §9 | 31/159-162 | unknown（未测） |

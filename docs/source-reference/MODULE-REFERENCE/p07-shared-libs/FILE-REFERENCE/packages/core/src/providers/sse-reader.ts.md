---
path: packages/core/src/providers/sse-reader.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ccf03cf0dc87eeb6506cf0aaadc87010951ae14e
sha256: b3f6694613bc3bdd3868174c6d72aed16c0f4d61658b02420d2742e84d256a08
lines: 490
kind: source
package: p07-shared-libs
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/core/src/providers/sse-reader.ts

## 1. 结论与边界

**共享 SSE 流式读取器**（`packages/core/src/providers/sse-reader.ts:1-11`）：封装所有供应商通用的 SSE 解析（fetch+错误检查、ReadableStream/TextDecoder、行分割与 `data:` 前缀、`[DONE]` 哨兵、`adapter.parseSSELine()` 委托供应商解析、事件回调分发、tool use 累积）。另含非流式标题请求 `fetchTitle`（`:435-490`）。

关键语义：

- **首字节前自动重试**（`:65-69`）：仅在「尚未向 UI 发出任何事件」时重试；一旦流式输出开始绝不重试（防内容重复）。覆盖网络错、瞬时 HTTP（408/425/429/5xx）、200 后首事件前中断。
- **思考块必须含签名原样回传**（`:50-55`）：签名缺失会被 DeepSeek v4 等以 `"content[].thinking must be passed back"` 拒绝。

## 2. 导出与关键符号

`export` 共 **5 个**（3 interface + 2 函数）。

| 符号 | 行 | 形状 | 说明 |
| --- | --- | --- | --- |
| `StreamSSEOptions` | `:18-33` | `{request, adapter, onEvent, signal?, timeoutMs?=30000, idleTimeoutMs?=120000, fetchFn?}` | 输入 |
| `StreamUsage` | `:36-42` | 5 个可选 token 计数 | 用量 |
| `StreamSSEResult` | `:45-63` | `{content, reasoning, thinkingBlocks, toolCalls, stopReason?, usage?}` | 输出 |
| `streamSSE` | `:162-199` | `(options) => Promise<StreamSSEResult>` | 流式主入口 |
| `fetchTitle` | `:444-490` | `(request, adapter, fetchFn?) => Promise<string\|null>` | 非流式标题（失败返回 `null`） |

内部：`MAX_SSE_RETRIES=5`（`:72`）、`MAX_SSE_RETRY_WAIT_MS=30_000`（`:75`）、`SSE_RETRY_MAX_DELAY_MS=8_000`（`:78`）、`HTTPError`（`:81-89`）、`ProviderStreamError`（`:92-97`）、`StreamIdleTimeoutError`（`:207-212`）、`getSSERetryDelayMs`（`:105-112`）、`isRetriableError`（`:120-126`）、`sleepWithAbort`（`:129-145`）、`normalizeToolCallOutputIndex`（`:201-205`）、`runStreamAttempt`（`:215-433`）。

## 3. 内部逻辑与关键流程

### 3.1 `streamSSE` 重试环（`:162-199`）

`for(attempt=1;;)`：`trackedOptions.onEvent` 置 `hasEmitted` 标志（`:170-176`）。catch 中五条退出：用户取消（`signal.aborted`/`AbortError`）不重试（`:182-184`）；`hasEmitted` 直接抛（`:186`）；`!isRetriableError || attempt>=5` 抛（`:188`）；退避预算耗尽（`delay<=0`）抛（`:191`）；否则 `sleepWithAbort` 后重试（`:195-196`）。退避为指数+±20% jitter（1/2/4/8/8s cap），累计受 30s 预算限制（`:105-112`）。

`isRetriableError`（`:120-126`）：`ProviderStreamError`/`StreamIdleTimeoutError` **不重试**；`HTTPError` 仅 408/425/429/≥500 可重试；无状态码（网络错/空体）视为瞬时可重试。

### 3.2 `runStreamAttempt` 单次流（`:215-433`）

1. **首字节超时**（`:223-227`）：`setTimeout + AbortController`（不用 `AbortSignal.timeout()`——那是绝对超时会截断长回复，`:218-222` 注释）；收到响应头即 `clearTimeout`（`:244`）。
2. `fetchFn` POST（支持注入代理，`:229-241`）；`!response.ok` → `HTTPError`（含 300 字符截断文本，`:247-250`）；空响应体 → Error（`:252-254`）。
3. **用量合并 `mergeUsage`**（`:263-287`）：input 类（input/cacheRead/cacheWrite）取**最后非空值**、output/reasoning 取**最大值**（provider 常回传累计值，`:260`）；`usageSeen` 决定输出 `usage` 还是 `undefined`（`:432`）。
4. **SSE 帧解析**：空行分帧、同帧多行 `data:` 用 `\n` 连接（`:301-302`）；`processLine`（`:368-380`）兼容 CRLF、跳过 `:` 注释/心跳、剥离冒号后单空格、只收集 `data` 字段；`[DONE]` 哨兵跳过（`:309`）。
5. **事件分发 `dispatchPendingEvent`**（`:305-365`）：`adapter.parseSSELine(data)` 后逐事件——`chunk` 累积 `content`；`reasoning`/`reasoning_signature`/`reasoning_block_start/stop` 管理 `thinkingBlocks`（签名累加，`:323-333`）；`tool_call_start/delta` 维护 `pendingToolCalls`（未知 tool id → `ProviderStreamError`，`:353`；`finalArguments` 覆盖或拼接 delta，`:354`）；`done` 记 `stopReason`；`usage` 合并；`error` → 抛 `ProviderStreamError`（`:360-361`）；每事件 `onEvent`（`tool_call_start` 同名重复不重发，`:339`）。
6. **读取循环**（`:382-409`）：`Promise.race(reader.read(), idleTimeout)`——空闲超时抛 `StreamIdleTimeoutError`（`:388`）；流结束 flush decoder、处理残行、派发尾帧（`:400-403`）；异常 `reader.cancel()` 后重抛（`:404-406`）；`finally` 释放锁（`:408`）。
7. **工具调用收尾**（`:412-429`）：`args` `JSON.parse`（失败 → `ProviderStreamError`「参数不是完整 JSON」，`:422`）；有工具调用无 `stopReason` 时推断 `'tool_use'`（`:427-429`）；最后 `onEvent({type:'done',stopReason})`（`:431`）。

### 3.3 `fetchTitle`（`:444-490`）

非流式 POST → `adapter.parseTitleResponse(data)`；**任何失败返回 `null`**（`:474`、`:488`），全程 console 日志（含 body 预览 200/500 字符截断，`:450-484`）。

## 4. 调用者与调用链

- 消费方：各 provider 适配器（`packages/core/src/providers/` 的 Anthropic/DeepSeek/OpenAI 兼容等）经 `streamSSE` 发流式请求。
- 出向：`./types.ts`（`ProviderAdapter`/`ProviderRequest`/`StreamEventCallback`/`ThinkingBlock`/`ToolCall`）。

## 5. 数据 I/O、读写与副作用

- **网络**：`fetchFn` POST（可注入代理）；`fetchTitle` 亦然。
- **副作用**：`console.log/warn/error`（重试与标题链路日志）。
- **无** 文件/持久化。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 用户取消 | `:182-184` | 抛 AbortError，不重试 |
| 已发事件后出错 | `:186` | 抛（防重复） |
| 4xx 永久错 | `:122-123` | 抛（不重试） |
| 瞬时错 | `:190-196` | 指数退避重试（≤5 次/30s 预算） |
| 首字节超时 | `:224`、`:244` | 超时 abort→可重试；正常响应即清除 |
| 流空闲超时 | `:388` | `StreamIdleTimeoutError`（不重试） |
| 未知工具 id | `:353` | `ProviderStreamError` |
| 工具参数非 JSON | `:421-423` | `ProviderStreamError` |
| 流内 `error` 事件 | `:360-361` | `ProviderStreamError` |
| `fetchTitle` 任一失败 | `:474`、`:488` | 返回 `null` |

## 7. 权限与权威状态

无身份语义。`thinkingBlocks` 的签名完整性是协议权威要求（`:50-55`）。

## 8. 修改影响面

- 重试语义（`hasEmitted` 门禁）是 UI 不重复的关键；放宽会推送重复内容。
- `mergeUsage` 的 last/max 口径与 provider 回传语义耦合。
- `parseSSELine` 事件类型集（chunk/reasoning/tool_*/done/usage/error）是 adapter 合同。
- 无存储迁移。

## 9. 测试证据

- `sse-reader.test.ts`（147 行）直接覆盖（见该测试手册）。
- **NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 个导出 | 已证实 | `:18`、`:36`、`:45`、`:162`、`:444` |
| 首字节前重试、发事件后不重试 | 已证实 | `:167-198` |
| 首字节超时用 setTimeout 而非 AbortSignal.timeout | 已证实 | `:218-227` |
| usage last/max 合并口径 | 已证实 | `:263-287` |
| tool_use 无 stopReason 推断 | 已证实 | `:427-429` |
| `fetchTitle` 失败返 null | 已证实 | `:474`、`:488` |
| 各 adapter 实现 | 未知 | 不在本批 |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 5 个导出 | 2 | — | covered |
| 重试环 | 3.1 | `:162-199` | covered |
| `runStreamAttempt` | 3.2 | `:215-433` | covered |
| `fetchTitle` | 3.3 | `:444-490` | covered |
| 失败/取消 | 6 | — | covered |
| 测试证据 | 9 | — | covered |

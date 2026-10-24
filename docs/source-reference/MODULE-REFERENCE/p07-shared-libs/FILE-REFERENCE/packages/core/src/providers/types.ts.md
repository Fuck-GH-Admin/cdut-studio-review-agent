---
path: packages/core/src/providers/types.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 752cb007973e54f43ce6432287bf1bd3d4a941cf
sha256: 97b9300c009c1be59b4a6c5ce3c3318b7deb3d41a53fb5698006baafaaacb772
lines: 315
kind: source
package: p07-shared-libs
author: docs-r07-author-models-20261023
reviewer: p07-shared-libs
status: authored
evidence: static
---

# packages/core/src/providers/types.ts

## 1. 结论与边界

`ProviderAdapter` 接口及其全部请求/事件/工具形状的**纯类型契约**：四个适配器（Anthropic、OpenAI Chat、OpenAI Responses、Google）与 SSE 驱动 `sse-reader.ts` 共同依赖它。运行时零逻辑——文件内只有 `interface`/`type` 与注释，没有函数、常量或副作用。

不做的事：不实现任何协议（四个 `*-adapter.ts`）；不做 SSE 读取（`sse-reader.ts`）；不做 URL 拼接（`url-utils.ts`）；不定义 `ChatMessage`/`FileAttachment`/`ProviderType`（来自 `@profer/shared`，`packages/core/src/providers/types.ts:9`）。

## 2. 导出与关键符号

导出 24 条：20 个 `interface`、4 个 `type`（含 1 个联合类型别名 `ContinuationMessage`、1 个 `StreamEvent` 联合、1 个函数类型 `ImageAttachmentReader`、1 个回调类型 `StreamEventCallback`）。无 class/const/function。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `ImageAttachmentData` | interface | `:14-19` | `{ mediaType: string; data: string }` | 已读入内存的 base64 图片 |
| `ImageAttachmentReader` | type | `:27` | `(attachments?: FileAttachment[]) => ImageAttachmentData[]` | **由 Electron 层注入**，core 不碰文件系统 |
| `ToolParameterProperty` | interface | `:32-36` | `{ type: string; description?; enum?: string[] }` | JSON Schema 属性 |
| `ToolDefinition` | interface | `:39-50` | `{ name; description; parameters: { type:'object'; properties; required? } }` | 供应商无关工具定义 |
| `ToolCall` | interface | `:53-62` | `{ id; name; arguments: Record<string, unknown>; metadata? }` | 模型返回的工具调用；`metadata` 承载 Google `thoughtSignature` |
| `ToolResult` | interface | `:65-74` | `{ toolCallId; content; isError?; generatedAttachments? }` | 回传下一轮的工具结果 |
| `ThinkingBlock` | interface | `:86-89` | `{ thinking: string; signature?: string }` | Anthropic thinking 块；签名缺失会被服务端拒 |
| `ContinuationMessage` | type（联合） | `:99-107` | `{role:'assistant'; content; reasoning?; thinkingBlocks?; toolCalls} \| {role:'tool'; results}` | 工具循环续接消息 |
| `StreamChunkEvent` | interface | `:112-115` | `{ type:'chunk'; delta }` | 正文增量 |
| `StreamReasoningEvent` | interface | `:118-121` | `{ type:'reasoning'; delta }` | 推理增量 |
| `StreamReasoningSignatureEvent` | interface | `:124-127` | `{ type:'reasoning_signature'; signature }` | Anthropic 签名增量 |
| `StreamReasoningBlockStartEvent` | interface | `:130-132` | `{ type:'reasoning_block_start' }` | thinking 块开始 |
| `StreamReasoningBlockStopEvent` | interface | `:135-137` | `{ type:'reasoning_block_stop' }` | thinking 块结束 |
| `StreamErrorEvent` | interface | `:140-143` | `{ type:'error'; error }` | 流式错误（reader 会抛 `ProviderStreamError`） |
| `StreamDoneEvent` | interface | `:146-150` | `{ type:'done'; stopReason?: 'end_turn'\|'tool_use'\|string }` | 结束事件 |
| `StreamUsageEvent` | interface | `:159-171` | `{ type:'usage'; inputTokens?; outputTokens?; cacheReadTokens?; cacheWriteTokens?; reasoningTokens? }` | 供应商未回传时字段缺省 |
| `StreamToolCallStartEvent` | interface | `:174-180` | `{ type:'tool_call_start'; toolCallId; toolName; metadata? }` | 工具调用开始 |
| `StreamToolCallDeltaEvent` | interface | `:183-195` | `{ type:'tool_call_delta'; toolCallId; toolIndex?; argumentsDelta; finalArguments?; metadata? }` | `finalArguments` 存在时**替换**已累积参数 |
| `StreamEvent` | type（联合） | `:198-208` | 上述 10 个事件的联合 | reader 的唯一输入形状 |
| `StreamEventCallback` | type | `:211` | `(event: StreamEvent) => void` | `onEvent` 回调 |
| `ProviderRequest` | interface | `:216-223` | `{ url: string; headers: Record<string,string>; body: string }` | `body` 已序列化 |
| `StreamRequestInput` | interface | `:228-251` | `{ baseUrl; apiKey; modelId; history; userMessage; systemMessage?; attachments?; readImageAttachments; thinkingEnabled?; tools?; continuationMessages? }` | 流式请求入参；`readImageAttachments` **必填** |
| `TitleRequestInput` | interface | `:259-272` | `{ baseUrl; apiKey; modelId; prompt; systemPrompt?; maxTokens? }` | 非流式轻量补全（标题/记忆审核） |
| `ProviderAdapter` | interface | `:283-315` | `providerType` + `buildStreamRequest`/`parseSSELine`/`buildTitleRequest`/`parseTitleResponse` | 四适配器共同实现 |

## 3. 内部逻辑与关键流程

纯类型文件，无执行流程。以下是**契约语义**（由注释与消费方实现共同确定）：

1. `readImageAttachments` 是 core 与平台的分界线（`:21-27`）：core 层不依赖 Electron/Node fs（`:6`）。
2. `parseSSELine` 的输入是**已去掉 `data:` 前缀**的 JSON 字符串（`:295-301`）；返回事件数组，可为空。
3. `tool_call_delta.toolCallId` 允许为空串（`:185-186`），由 reader 按 `toolIndex`/`metadata`/`currentToolCallId` 关联——`sse-reader.ts:346-355` 实现了这个回退链。
4. `finalArguments` 是「完整参数兜底」（`:191-192`），reader 在 `sse-reader.ts:354` 用 `event.finalArguments !== undefined ? event.finalArguments : pending.args + event.argumentsDelta` 实现替换语义。
5. `ThinkingBlock.signature` 的必需性来自协议（`:76-85` 注释）：无签名回传会被 Anthropic 原生与 DeepSeek v4 拒绝。
6. `StreamUsageEvent` 各字段可缺省（`:152-158`），调用方应回退启发式估算——本文件不提供估算实现。

## 4. 调用者与调用链

入向（类型导入；`grep -rn "ProviderAdapter\|StreamRequestInput\|ProviderRequest\|StreamEvent"` 覆盖 `apps/`、`packages/`）：

| 调用者 | 位置 | 用到什么 |
| --- | --- | --- |
| `anthropic-adapter.ts` | `:27-36` | `ProviderAdapter`/`ProviderRequest`/`StreamRequestInput`/`StreamEvent`/`TitleRequestInput`/`ImageAttachmentData`/`ToolDefinition`/`ContinuationMessage` |
| `openai-adapter.ts` | `:14-23` | 同上（无 `ContinuationMessage` 以外的差异） |
| `openai-responses-adapter.ts` | `:10-19` | `ContinuationMessage`/`ImageAttachmentData`/`ProviderAdapter`/`ProviderRequest`/`StreamEvent`/`StreamRequestInput`/`TitleRequestInput`/`ToolDefinition` |
| `google-adapter.ts` | `:13-22` | 同上 |
| `sse-reader.ts` | `:311`、`:483` | 通过 `ProviderAdapter` 调 `parseSSELine`/`parseTitleResponse` |
| `yanhu-pi-runtime.ts` | `:138` | `adapter: ProviderAdapter` 字段 |
| `yanhu-browser-tools.ts` | `:11` | `import type { ToolDefinition }` |
| `yanhu-context-pruning.ts` | `:11` | `ContinuationMessage`、`ToolResult` |
| `yanhu-context-pruning.test.ts`、`yanhu-browser-tools.test.ts` | `:10` | `ContinuationMessage` |
| `index.ts`（registry） | `:9` | `ProviderAdapter` |

出向：`@profer/shared` 的 `ChatMessage`/`FileAttachment`/`ProviderType`（`:9`）。无运行时调用。

**注册表覆盖缺口（重要，照实记录）**：`ProviderType` 联合有 **23** 个成员（`packages/shared/src/types/channel.ts:13-36`），而 `adapterRegistry` 只有 **18** 个键（`packages/core/src/providers/index.ts:30-49`）。未注册的 5 个是 `opencode-go-openai`、`zhipu-coding-team`、`ark-coding-plan`、`qwen-anthropic`、`openai-codex`。`getAdapter()` 对它们会抛 `不支持的供应商: <provider>…`（`packages/core/src/providers/index.ts:60-62`）。调用点是否兜住取决于各自实现：`conversation-title-service.ts:92` 在 `try` 内、`:118-121` 捕获后返回 `null`；`agent-orchestrator.ts:432`/`:438` 在调 `getAdapter`（`:476`）之前对 `xai`/`openai-codex` 走专用分支，因此 `openai-codex` 不会到达注册表。其余 provider 的兜底未逐一核对（见 §10）。

## 5. 数据 I/O、读写与副作用

- 无 I/O、无磁盘、无网络、无缓存、无全局状态。
- 全部为编译期类型；`import type` 语义（消费方均用 `import type`），打包后不产生运行时代码。
- 副作用：无（无顶层语句）。

## 6. 分支、失败、取消与恢复

不适用，依据：本文件无控制流、无函数体。类型层面的「失败」由消费方表达——`parseSSELine` 返回空数组、`parseTitleResponse` 返回 `null`、`StreamErrorEvent` 由 reader 抛 `ProviderStreamError`（`sse-reader.ts:360-361`）。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role/actor 检查，也无配置读取。
权威状态：`ProviderAdapter` 是「适配器必须提供什么」的唯一权威；具体协议行为由四个实现类决定。`apiKey` 在 `StreamRequestInput.apiKey`（`:232`）中是**明文**，本文件只声明形状，不负责保管。

## 8. 修改影响面

- 四个适配器 + `sse-reader.ts` + registry（`packages/core/src/providers/index.ts:9`）全部实现/消费本契约；改任一字段都会牵动 5 个文件。
- 改 `StreamEvent` 联合 → `sse-reader.ts:312-364` 的分派与 `apps/electron` 侧 `onEvent` 消费；`sse-reader.test.ts` 与四个适配器测试需同步。
- 改 `StreamRequestInput`（如把 `readImageAttachments` 改为可选）→ 所有 `buildStreamRequest` 实现与 `yanhu-pi-runtime.ts:294-310` 的调用点。
- 改 `ToolCall.metadata`/`StreamToolCallStartEvent.metadata` → Google `thoughtSignature` 与 OpenAI Responses `itemId`/`outputIndex` 的续接路径（`google-adapter.ts:183-185`、`openai-responses-adapter.ts:135-140`）。
- `packages/core/src/index.ts` 通过 `export * from './providers/index.ts'`（`:6`）间接导出本文件全部类型，故改类型会扩散到所有 `@profer/core` 消费者。

## 9. 测试证据

- 无本文件的直接测试（纯类型，无运行断言）。
- 间接：`usage-parsing.test.ts` 使用 `StreamEvent` 做类型收窄（`:15-17` 的 `Extract<StreamEvent, {type:'usage'}>`），并在四适配器上断言 usage 事件形状；`sse-reader.test.ts` 覆盖 `StreamEvent` 的实际分派；`openai-responses-adapter.test.ts` 断言 `tool_call_start`/`tool_call_delta` 的字段（含 `metadata`、`finalArguments`）。
- 未覆盖：类型层面无法断言；`generatedAttachments`、`cacheWriteTokens`、`reasoning_block_start/stop` 无任何测试引用（已 `grep` 全仓，仅出现在本文件与 `sse-reader.ts`）。
- `NOT_RUN`：本轮未执行 typecheck/测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 24 条导出，全部为 interface/type，无运行时代码 | 已证实 | `packages/core/src/providers/types.ts:14-315`；`grep -cE '^export '` = 24 |
| `ProviderType` 23 个成员，注册表仅 18 个；5 个未注册会抛错 | 已证实 | `packages/shared/src/types/channel.ts:13-36`；`packages/core/src/providers/index.ts:30-62` |
| 未注册 provider 在所有调用点都被兜住 | 未知 | 只核了 `conversation-title-service.ts:92`/`:118-121` 与 `agent-orchestrator.ts:432`/`:438`/`:476` |
| 四个适配器均 `implements ProviderAdapter` | 已证实 | `anthropic-adapter.ts:294`、`openai-adapter.ts:196`、`openai-responses-adapter.ts:242`、`google-adapter.ts:205` |
| `readImageAttachments` 必填，是平台注入点 | 已证实 | `:27`、`:244` |
| `finalArguments` 语义是替换而非追加 | 已证实 | `:191-192`；`sse-reader.ts:354` |
| `toolCallId` 空串由 reader 关联 | 已证实 | `:185-186`；`sse-reader.ts:346-350` |
| `generatedAttachments`/`cacheWriteTokens` 无测试引用 | 已证实 | 全仓 `grep` 仅本文件与 `sse-reader.ts` 提及 `cacheWriteTokens` |
| 打包后无运行时代码 | 推断 | 全部 `import type` + 纯类型声明；未做构建验证 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 24 条导出逐项 | §2 | `:14-315` | covered |
| 平台注入边界 | §3、§7 | `:21-27`、`:244` | covered |
| 事件联合与 reader 契约 | §3、§6 | `:198-208`；`sse-reader.ts:312-364` | covered |
| 续接/工具/思考形状 | §3 | `:86-107`、`:174-195` | covered |
| 调用者/实现者 | §4 | 跨文件 | covered |
| 修改影响面 | §8 | 跨文件 | covered |
| 构建产物/运行时擦除 | §10 | — | unknown（未构建） |

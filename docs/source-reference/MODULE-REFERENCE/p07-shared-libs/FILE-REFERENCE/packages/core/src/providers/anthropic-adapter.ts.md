---
path: packages/core/src/providers/anthropic-adapter.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 72bef8a307d3f8669b5b41a8a0f386aa41abe5f1
sha256: 69fe59701ee44fcd41993ce042f9f9d0e35174a855c7cd795b1e3f03dd31e51c
lines: 540
kind: source
package: p07-shared-libs
author: docs-r07-author-models-20261023
reviewer: p07-shared-libs
status: authored
evidence: static
---

# packages/core/src/providers/anthropic-adapter.ts

## 1. 结论与边界

Anthropic Messages 协议的**纯逻辑适配器**：把统一消息/工具/思考开关转换成 Anthropic 请求体，把 SSE 行解析成统一 `StreamEvent`，并提供非流式「标题/轻量补全」请求构建与响应取文。运行时模块，但**自身不发请求、不读磁盘、不写盘**——`ProviderRequest` 交给 `sse-reader.ts` 的 `streamSSE`/`fetchTitle` 执行。

不做的事：不做 URL 策略的唯一权威（委托 `url-utils.ts`，见 §3.1 与 §8 的口径差异）；不判断 provider 是否被审核白名单允许（`review-model-gateway.ts:157`）；不管理渠道/密钥（`channel-manager` 解密后把明文 `apiKey` 传入）；不持久化 thinking 签名（历史消息不回传 thinking，见 §3.2）；不做重试/超时（由 `streamSSE` 的调用方控制）。

## 2. 导出与关键符号

导出仅 1 条：`AnthropicAdapter` 类（`anthropic-adapter.ts:294`）。内部接口/函数均不导出。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `AnthropicAdapter` | class（export） | `:294-540` | `implements ProviderAdapter`；`constructor(providerType: ProviderType = 'anthropic')`（`:300-302`） | 唯一导出；`providerType` 决定 URL 策略、鉴权头、思考协议 |
| `providerType` | 字段 | `:295` | `readonly ProviderType` | 由构造参数固定 |
| `activeBlockType` | 私有字段 | `:298` | `string \| null` | **可变实例状态**，跨 `parseSSELine` 调用保留 |
| `normalizeUrl`（内部） | method | `:305-307` | `(baseUrl) => string` | 委托 `normalizeAnthropicProviderUrl` |
| `buildHeaders`（内部） | method | `:316-339` | `(apiKey) => Record<string,string>` | 四类鉴权分支 |
| `buildStreamRequest` | method | `:341-421` | `(input: StreamRequestInput) => ProviderRequest` | 主路径 |
| `parseSSELine` | method | `:423-496` | `(jsonLine: string) => StreamEvent[]` | 解析失败返回 `[]`，不抛 |
| `buildTitleRequest` | method | `:498-514` | `(input: TitleRequestInput) => ProviderRequest` | 非流式 |
| `parseTitleResponse` | method | `:516-539` | `(responseBody: unknown) => string \| null` | 先 text 块，再 thinking 块 |
| `toAnthropicUsageEvent`（内部） | function | `:113-131` | `(usage?) => StreamEvent \| null` | 无任何有限数字时返回 `null` |
| `buildImageBlocks`（内部） | function | `:147-156` | `(ImageAttachmentData[]) => AnthropicContentBlock[]` | base64 图片块 |
| `buildMessageContent`（内部） | function | `:163-174` | `(text, images) => string \| AnthropicContentBlock[]` | 无图返回纯字符串 |
| `toAnthropicMessages`（内部） | function | `:189-217` | `(input) => AnthropicMessage[]` | 过滤 system；历史附件也转图块 |
| `toAnthropicTools`（内部） | function | `:222-228` | `(tools) => Array<Record<string, unknown>>` | `parameters` → `input_schema` |
| `appendContinuationMessages`（内部） | function | `:241-290` | `(messages, contMsgs, thinkingEnabled) => void` | 原地 push；块序 thinking→text→tool_use |
| `AnthropicContentBlock`/`AnthropicMessage`/`AnthropicSSEEvent`/`AnthropicTitleResponse`（内部） | interface | `:44-64`、`:67-70`、`:73-110`、`:134-140` | — | 仅本文件使用的协议形状 |

## 3. 内部逻辑与关键流程

### 3.1 URL 与请求体 `buildStreamRequest`（`:341-421`）

1. `url = normalizeUrl(baseUrl)`（`:342`）→ `normalizeAnthropicProviderUrl`（`url-utils.ts:245-264`）：`ollama` 与 minimax/xiaomi/xiaomi-token-plan/qwen-anthropic/zhipu-coding/zhipu-coding-team/ark-coding-plan/deepseek/kimi-api/kimi-coding 走 `normalizeVersionedAnthropicBaseUrl`（缺 `/vN` 就补 `/v1`，`url-utils.ts:131-138`）；其余（含 `anthropic`、`anthropic-compatible`）走 `normalizeAnthropicBaseUrl`（去尾部 `/messages`，仅根路径补 `/v1`，`url-utils.ts:103-118`）。最终请求地址是 `${url}/messages`（`:417`）。
2. `messages = toAnthropicMessages(input)`（`:343`，详见 §3.2）。
3. `capability = detectThinkingCapability(providerType, modelId)`（`:344`）。
4. `max_tokens` 四分支（`:348-358`）：`minimax` → 2048；未开思考 → 8192；`manual-only` → `16384 + 16384 = 32768`；其余 → 32000。`manualThinkingBudget=16384`（`:348`）保证 `budget_tokens < max_tokens`。**调用方无法覆盖**：`StreamRequestInput` 没有 `maxTokens` 字段（`packages/core/src/providers/types.ts:228-251`），值由 providerType/thinkingEnabled 硬编码决定。
5. 请求体骨架 `{model, max_tokens, messages, stream:true}`（`:360-365`）。
6. 思考字段（`:373-392`）：
   - `effort-based-max`：开 → `thinking={type:'enabled'}` + `output_config={effort:'max'}`；关 → `thinking={type:'disabled'}`（`:373-379`）。
   - 其余且开思考：`adaptive-only`/`adaptive-preferred` → `{type:'adaptive',display:'summarized'}`；`manual-only` → `{type:'enabled',budget_tokens:16384}`（`:380-391`）。
   - `mode==='none'`（kimi-api/kimi-coding/zhipu-coding/minimax）**永不发** thinking 字段；关闭思考时也不发（`:380` 的 `if` 只处理开启）。
7. `systemMessage` 存在时写顶层 `body.system`（`:394-396`）；`tools` 非空转 `input_schema`（`:399-401`）。
8. 续接消息在 `body` 构造**之后**追加到同一个 `messages` 数组（`:404-406`）。因为 `messages` 与 `body.messages` 是同一引用，`JSON.stringify(body)`（`:408`）发生在追加之后，所以续接块确实进入请求体；顺序上没问题，但**阅读时容易误判**为「先序列化后追加」。
9. 调试开关 `PROMA_DEBUG_REQUEST` 打印前 4000 字符（`:411-414`）。用 `globalThis.process` 探测，避免 core 直接依赖 Node 类型（`:411`）。

### 3.2 消息转换 `toAnthropicMessages`（`:189-217`）

- 历史：`filter(msg => msg.role !== 'system')`（`:196`），assistant → `assistant`，其余 → `user`（`:198`）；历史 user 消息若带 `attachments`，同样调 `readImageAttachments` 转多模态（`:201-204`）。
- 当前用户消息追加在最后（`:210-214`），图片来自 `input.attachments`。
- **历史 assistant 消息不回传 thinking 块**（`:181-188` 注释）：签名不持久化，回传无签名 thinking 会被 Anthropic 原生/DeepSeek v4 拒绝；thinking 只在本次 send 的续接消息里回传。

### 3.3 续接块 `appendContinuationMessages`（`:241-290`）

- assistant 分支：`thinkingEnabled` 为真时，优先按 `thinkingBlocks` 逐块重建（带 `signature` 才写入，`:251-261`）；否则若有扁平 `reasoning` 降级成单个无签名 thinking 块（`:262-264`）。随后 `content` 非空加 `text` 块（`:267-269`），再逐个 toolCall 加 `tool_use`（`:270-277`）。
- tool 分支：转成 **user role** 的 `tool_result` 块数组（`:279-288`），`is_error` 缺省 false。
- `thinkingEnabled=false` 时不回传任何 thinking 块（`:250`），避免服务端判定思考仍激活。

### 3.4 鉴权头 `buildHeaders`（`:316-339`）

| providerType | 头 |
| --- | --- |
| `kimi-coding`、`zhipu-coding`（`:321-325`） | `Authorization: Bearer` + `User-Agent`（无 `x-api-key`） |
| `xiaomi-token-plan`（`:326-330`） | 同上 |
| `minimax`（`:331-334`） | `Authorization: Bearer`（无 UA、无 x-api-key） |
| 其余（`:335-338`） | 同时带 `x-api-key` 与 `Authorization: Bearer` |

三类都带 `anthropic-version: 2023-06-01` 与 `content-type: application/json`（`:317-320`）。UA 来自 `getProferUserAgent()`（`user-agent.ts:21-25`），产品名硬编码为 `Proma/<version>`，注释明确「不可改为 Profer，否则渠道 UA 白名单校验失败」。

### 3.5 SSE 解析 `parseSSELine`（`:423-496`）

整体 `try/catch`，任何异常（含 JSON 解析失败）返回 `[]`（`:424`、`:493-495`）。按 `event.type` 分支：

| 事件 | 产出 | 行 |
| --- | --- | --- |
| `message_start` | `usage`（来自 `message.usage`） | `:435-438` |
| `content_block_start` | 记录 `activeBlockType`；`tool_use` → `tool_call_start`（id/name 缺省空串）；`thinking` → `reasoning_block_start` | `:441-452` |
| `content_block_stop` | 仅当 `activeBlockType==='thinking'` 产出 `reasoning_block_stop`，随后清空 | `:454-461` |
| `content_block_delta` + `thinking_delta` | `reasoning` | `:465-466` |
| `content_block_delta` + `signature_delta` | `reasoning_signature` | `:467-469` |
| `content_block_delta` + `input_json_delta` | `tool_call_delta`，`toolCallId:''`（由 reader 关联） | `:470-476` |
| `content_block_delta` + `text` | `chunk` | `:477-480` |
| `message_delta` | `done`（有 `stop_reason` 时）+ `usage`（顶层累计） | `:484-490` |

调试开关 `PROMA_DEBUG_SSE` 打印前 400 字符（`:429-432`）。

### 3.6 标题/轻量补全（`:498-539`）

`buildTitleRequest`：`max_tokens = input.maxTokens ?? 300`（`:504`），`messages` 只有一条 user prompt（`:505`），`systemPrompt` 存在则写顶层 `system`（`:507`）。**不带 `stream` 字段**（非流式）。
`parseTitleResponse`：`content` 为空返回 `null`（`:518`）；优先 `type==='text'` 的块（`:521-522`）；否则从第一个 `thinking` 块取**最后一行**，若以 `- ` 开头则去掉前缀（`:525-536`）；都没有返回 `null`。

## 4. 调用者与调用链

**构造**：`getAdapter(provider)`（`packages/core/src/providers/index.ts:58-64`）每次调用 `createAdapter()` **新建实例**（`:63`）；注册表把 **8 个** provider 映射到 `AnthropicAdapter`：`anthropic`（`:31`）、`anthropic-compatible`（`:32`）、`kimi-api`（`:37`）、`kimi-coding`（`:38`）、`zhipu-coding`（`:40`）、`minimax`（`:41`）、`xiaomi`（`:45`）、`xiaomi-token-plan`（`:46`）。注意 `zhipu`（非 coding）在 `:39` 映射到 `OpenAIAdapter`，**不是**本类。`packages/core/src/index.ts:6` 再导出。

入向（真实调用点）：

| 调用者 | 位置 | 用到什么 |
| --- | --- | --- |
| `yanhu-pi-runtime.ts` | `:200` `getAdapter(channel.provider)`；`:294` `buildStreamRequest`；`:308-310` `streamSSE({adapter})` | **唯一真实走流式**的调用方（CDUT 研学运行时，多轮工具循环） |
| `conversation-title-service.ts` | `:92` `getAdapter`；`:93` `buildTitleRequest`；`fetchTitle` | 会话标题 |
| `lightweight-completion.ts` | `:86-87` | 长期记忆审核等一次性轻量补全（复用标题通道） |
| `agent-orchestrator.ts` | `:476-477` | 标题生成（另见 `:432`/`:438` 对 xai/openai-codex 的专用分支） |
| `cdut-ai-class-manager.ts` | `:563-564` | 一次性 JSON 补全 |
| `retrospective-service.ts` | `:261-263`、`:302` | 借 `buildTitleRequest` 拿 URL/头后改写 body，再用 `parseTitleResponse` |
| `packages/core/src/providers/sse-reader.ts` | `:311` `adapter.parseSSELine(data)`；`:483` `adapter.parseTitleResponse(data)` | SSE 驱动与非流式取文 |
| `usage-parsing.test.ts` | `:9`、`:22` | 直接单测（见 §9） |

出向：`url-utils.normalizeAnthropicProviderUrl`（`:37`、`:306`）、`thinking-capability.detectThinkingCapability`（`:38`、`:344`）、`user-agent.getProferUserAgent`（`:39`、`:323`/`:328`）。

动态调用：无反射/字符串拼装；已用 `grep -rn "AnthropicAdapter\|buildStreamRequest\|parseSSELine\|buildTitleRequest"` 覆盖 `apps/`、`packages/`。

## 5. 数据 I/O、读写与副作用

- **输入**：`StreamRequestInput`（`packages/core/src/providers/types.ts:228-251`）——`baseUrl`/明文 `apiKey`/`modelId`/`history`/`userMessage`/`systemMessage`/`attachments`/`readImageAttachments`/`thinkingEnabled`/`tools`/`continuationMessages`。
- **输出**：`ProviderRequest{url, headers, body}`（`packages/core/src/providers/types.ts:216-223`），`body` 是已 `JSON.stringify` 的字符串（`:408`）。
- **磁盘**：本文件不读不写；图片 base64 由注入的 `readImageAttachments` 提供（`packages/core/src/providers/types.ts:27`，Electron 层实现）。
- **网络**：不发起；由 `streamSSE`/`fetchTitle` 执行。
- **可变状态**：`activeBlockType`（`:298`）是实例级状态。`getAdapter` 每次新建实例（`packages/core/src/providers/index.ts:63`），单次请求内安全；但 `yanhu-pi-runtime.ts:200` 在整轮工具循环中**复用同一个 adapter 实例**，若某次流在 thinking 块中途中断（无 `content_block_stop`），`activeBlockType` 会残留到下一轮，导致下一轮首个 `content_block_stop` 误报 `reasoning_block_stop`（推断，基于 `:454-461` 的清空时机）。
- **副作用**：仅两个调试 `console.log`（`:413`、`:431`），默认关闭；不写日志文件、不发遥测。
- **原子性/幂等**：纯函数式构建，无事务概念；重复调用同输入产生相同 `ProviderRequest`。

## 6. 分支、失败、取消与恢复

- `parseSSELine` 的失败是**静默**的：非法 JSON 返回 `[]`（`:493-495`），调用方无法区分「空事件」与「解析失败」。`streamSSE` 侧是否会因此丢事件，见 `sse-reader.ts:311` 上下文（本文件不负责）。
- `parseTitleResponse` 未对 `responseBody` 为 `null`/非对象做防护：`data.content` 会抛 `TypeError`（`:517-518`）。该异常被 `fetchTitle` 的 `try/catch` 吞掉并返回 `null`（`sse-reader.ts:486-489`）；**直接调用方（`retrospective-service.ts:302`）需自行保证响应形状**。
- 无取消/超时/重试逻辑；`StreamRequestInput` 不含 `AbortSignal`。
- 无恢复/检查点概念：每次 `buildStreamRequest` 从传入的 `history`+`continuationMessages` 重建请求。
- 不可恢复点：thinking 签名只在本次响应流中抓到，进程崩溃后无法重建（`:181-188` 注释明确）。

## 7. 权限与权威状态

- 无权限分支，依据：本文件无 sender/role/actor 检查，也不读配置；`apiKey` 由调用方以明文传入（`packages/core/src/providers/types.ts:232`），本文件只把它放进请求头（`:316-339`），不落盘、不打印。
- 权威状态：模型 ID、baseUrl、是否开思考由调用方决定；思考**协议形态**的权威是 `thinking-capability.ts`（`:344`），本文件只是执行者。
- 安全相关：`buildHeaders` 对 kimi-coding/zhipu-coding/xiaomi-token-plan/minimax 不发 `x-api-key`（`:321-334`），减少密钥暴露面；其余渠道双头并存（`:335-338`）——若上游日志记录头，会同时出现两处密钥，属既定实现。

## 8. 修改影响面

- `packages/core/src/providers/index.ts:31-46`：注册表按 provider 选择本类；改构造参数语义会影响 9 个 provider 的鉴权/URL/思考行为。
- `yanhu-pi-runtime.ts:294`：唯一流式调用方；改 `StreamRequestInput` 字段或事件形状会直接影响 CDUT 研学的多轮工具循环。
- `sse-reader.ts:311`、`:483`：`parseSSELine`/`parseTitleResponse` 的契约消费者；改返回形状会影响所有 SSE 驱动。
- `conversation-title-service.ts:93`、`lightweight-completion.ts:87`、`agent-orchestrator.ts:477`、`cdut-ai-class-manager.ts:564`、`retrospective-service.ts:263`：都依赖 `buildTitleRequest` 的「URL+鉴权头+body 骨架」；`retrospective-service` 还会**改写 body 后**复用，改骨架字段会静默破坏它。
- `thinking-capability.ts:61-107`：改能力判定会改变本文件发出的 `thinking`/`output_config` 字段；`usage-parsing.test.ts` 断言 usage 形状。
- **口径差异（照实记录）**：本文件用 `normalizeAnthropicProviderUrl(...) + '/messages'`（`:342`、`:417`），而 `url-utils.ts:274-289` 的 `resolveAnthropicMessagesUrl` 对 `anthropic-compatible` 是「原样返回用户填写的完整端点」。同一 baseUrl 下两者结果可能不同（例如 `anthropic-compatible` + `https://gw.example.com`：本文件得 `.../v1/messages`，`resolveAnthropicMessagesUrl` 得 `https://gw.example.com`）。`resolveAnthropicMessagesUrl` 的消费者是 `pi-model-registry.ts:24`，与本文件不是同一条链路，故不构成同一请求内的矛盾，但**改任一侧前需确认调用方**。
- 需同步的测试：`usage-parsing.test.ts`（usage 事件）、`url-utils.test.ts`（URL 规范化）、`sse-reader.test.ts`（SSE 驱动）。

## 9. 测试证据

- 直接测试：**无** `anthropic-adapter.test.ts`。已检索 `packages/core/src/providers/*.test.ts`：只有 `usage-parsing.test.ts`、`url-utils.test.ts`、`sse-reader.test.ts`、`openai-adapter.test.ts`、`openai-responses-adapter.test.ts`、`index.test.ts`。
- 间接：`usage-parsing.test.ts:21-51`（test 名「Anthropic：message_start 提供 input/cache，message_delta 提供 output」）用 `new AnthropicAdapter()` 调 `parseSSELine`：
  - `usage-parsing.test.ts:24-41` `message_start` 带 `input_tokens:1200`、`cache_read_input_tokens:300`、`cache_creation_input_tokens:50`，`:37-41` 断言 `usageEvent(start)` `toMatchObject({inputTokens:1200, cacheReadTokens:300, cacheWriteTokens:50})`；
  - `usage-parsing.test.ts:43-50` `message_delta` 带 `stop_reason:'end_turn'` 与 `usage:{output_tokens:640}`，`:50` 断言 `usageEvent(delta)` `toMatchObject({outputTokens:640})`。
- 未覆盖（本文件角度）：`buildStreamRequest` 全部（URL/鉴权四分支/max_tokens 四分支/thinking 三模式/工具/续接块顺序）、`buildTitleRequest`、`parseTitleResponse`（含 thinking 兜底与 `- ` 前缀）、`content_block_start/stop` 的 `activeBlockType` 行为、`input_json_delta`、`signature_delta`、图片块、历史附件、`PROMA_DEBUG_*`。
- `NOT_RUN`：本轮未执行 `bun test`/typecheck/build；以上均为静态阅读，不代表通过。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 唯一导出是 `AnthropicAdapter` 类，其余符号文件内私有 | 已证实 | `anthropic-adapter.ts:294`；`grep -cE '^export '` = 1 |
| 请求地址 = 规范化 baseUrl + `/messages` | 已证实 | `:342`、`:417`；`url-utils.ts:245-264` |
| 鉴权四分支：kimi/zhipu-coding、xiaomi-token-plan、minimax、其余双头 | 已证实 | `:321-338` |
| `max_tokens` 四分支取值 2048/8192/32768/32000 | 已证实 | `:348-358` |
| thinking 三模式字段与 `none` 永不发送 | 已证实 | `:373-392`；`thinking-capability.ts:61-107` |
| 历史 assistant 消息不回传 thinking 块 | 已证实 | `:181-188`、`:195-207` |
| `parseSSELine` 任何异常返回 `[]` | 已证实 | `:424`、`:493-495` |
| `parseTitleResponse` 对 `null` 响应体不做防护 | 已证实 | `:517-518`；被 `sse-reader.ts:486-489` 兜住 |
| 复用同一 adapter 实例时 `activeBlockType` 可能跨轮残留 | 推断 | `:298`、`:454-461`；`yanhu-pi-runtime.ts:200` 复用实例 |
| `detectThinkingCapability` 各分支的模型前缀是真实字面量、分支全部可达 | 已证实（`git show \| hexdump -C` 原始字节） | `thinking-capability.ts:67` `deepseek-v4`、`:88` `claude-mythos-preview`、`:93` `claude-opus-4-7`、`:99`/`:100` `claude-opus-4-6`/`claude-sonnet-4-6`；`:105-106` 为普通 Claude 回退 manual-only。曾一度在工具显示层看到空前缀/不可达的假象（模型 ID 显示被替换），已按原始字节更正，不再保留该错误结论 |
| `resolveAnthropicMessagesUrl` 与本文件 URL 策略不同 | 已证实 | `url-utils.ts:274-289` vs `:342`/`:417` |
| 真实渠道对 `adaptive`/`display:'summarized'` 的接受度 | 未知 | 未运行网络；仅静态读取字段构造 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 导出清单（1 条）+ 内部符号表 | §2 | `:294`、`:113-290` | covered |
| URL 规范化与 `/messages` | §3.1、§8 | `:342`、`:417`；`url-utils.ts:245-264` | covered |
| max_tokens 四分支 | §3.1 | `:348-358` | covered |
| thinking 三模式 + none | §3.1 | `:373-392` | covered |
| 消息转换/历史附件 | §3.2 | `:189-217` | covered |
| 续接块顺序与签名 | §3.3 | `:241-290` | covered |
| 鉴权四分支 | §3.4 | `:316-339` | covered |
| SSE 全事件表 | §3.5 | `:423-496` | covered |
| 标题构建/取文 | §3.6 | `:498-539` | covered |
| 调用者/链路 | §4 | 跨文件 | covered |
| 测试断言与缺口 | §9 | `usage-parsing.test.ts:21-51` | covered（仅 usage） |
| 真实上游行为/并发残留 | §10 | — | unknown / 推断 |

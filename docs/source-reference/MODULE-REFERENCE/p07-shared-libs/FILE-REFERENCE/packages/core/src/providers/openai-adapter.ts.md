---
path: packages/core/src/providers/openai-adapter.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3a72aef88e642e5a6eca72ca281ce41bdbbf0f54
sha256: deb6dbd9628ce8b46beaac9031c4872d9d8a9d17fb2fa41c66fb9937491ae857
lines: 336
kind: source
package: p07-shared-libs
author: docs-r07-author-models-20261023
reviewer: p07-shared-libs
status: authored
evidence: static
---

# packages/core/src/providers/openai-adapter.ts

## 1. 结论与边界

OpenAI **Chat Completions** 协议适配器：把统一历史转成 `messages`（唯一支持 `system` 独立 role 的适配器），构建 `/chat/completions` 请求，解析 `choices[0].delta` 的文本/推理/工具增量与流末 `usage`。运行时模块，自身不发请求、不读写磁盘。

不做的事：不做 Responses 协议（`openai-responses-adapter.ts`）；不做 Anthropic/Google 形状；不做 URL 策略（委托 `url-utils.ts:194-206`）；不重试、不超时（由 `sse-reader.streamSSE` 与调用方控制）。

## 2. 导出与关键符号

导出仅 1 条：`OpenAIAdapter` 类（`openai-adapter.ts:196`）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `OpenAIAdapter` | class（export） | `:196-336` | `implements ProviderAdapter`；`constructor(providerType: ProviderType = 'openai')`（`:199-201`） | 唯一导出 |
| `buildStreamRequest` | method | `:203-237` | `(input: StreamRequestInput) => ProviderRequest` | 主路径 |
| `parseSSELine` | method | `:239-308` | `(jsonLine) => StreamEvent[]` | 异常返回 `[]` |
| `buildTitleRequest` | method | `:310-330` | `(input: TitleRequestInput) => ProviderRequest` | 非流式 |
| `parseTitleResponse` | method | `:332-335` | `(body: unknown) => string \| null` | 取 `choices[0].message.content` |
| `OpenAIContentBlock`/`OpenAIToolCall`/`OpenAIMessage`/`OpenAIChunkData`/`OpenAITitleResponse`（内部） | interface | `:29-78` | — | 协议形状 |
| `buildImageBlocks`（内部） | function | `:85-90` | `(ImageAttachmentData[]) => OpenAIContentBlock[]` | `data:<mime>;base64,<data>` |
| `buildMessageContent`（内部） | function | `:95-106` | `(text, images) => string \| OpenAIContentBlock[]` | 无图返回纯字符串 |
| `toOpenAIMessages`（内部） | function | `:114-148` | `(input) => OpenAIMessage[]` | system 前置；历史附件；assistant reasoning |
| `toOpenAITools`（内部） | function | `:153-162` | `(tools) => Array<Record<string, unknown>>` | `{type:'function',function:{...}}` |
| `appendContinuationMessages`（内部） | function | `:167-192` | `(messages, contMsgs) => void` | assistant 带 `tool_calls`；tool 逐条结果 |

## 3. 内部逻辑与关键流程

### 3.1 请求构建 `buildStreamRequest`（`:203-237`）

1. `url = resolveOpenAIChatCompletionsUrl(baseUrl, providerType)`（`:204`）→ 三条分支（`url-utils.ts:194-206`）：`ollama` 去尾部 `/v1` 后拼 `/v1/chat/completions`；`custom` **原样使用**用户填写的完整端点（`trimTrailingUrlPathSlash`）；其他若有 `/chat/completions` 后缀则原样，否则 `normalizeBaseUrl + '/chat/completions'`。
2. `apiKey = providerType === 'ollama' ? (input.apiKey || 'ollama') : input.apiKey`（`:205`）——ollama 空 key 兜底为字面量 `'ollama'`（本地免鉴权占位）。
3. `messages = toOpenAIMessages(input)`（`:206`）。
4. **续接消息在 body 构造之前**追加（`:209-211`），注释明确「必须在构造 bodyObj 之前完成，避免隐式修改已赋值的 messages 引用」。这与 Anthropic 适配器相反（后者在 body 之后追加，靠同一引用生效）——两处顺序不同但结果都正确，阅读时不要互相套用。
5. body：`{model, messages, stream:true}`（`:213-217`）。
6. `stream_options = {include_usage:true}` **仅非 ollama**（`:220-222`），注释说明 ollama 兼容端点不识别该字段会报错。
7. `tools` 非空转 `{type:'function',function:{name,description,parameters}}`（`:225-227`）。
8. 头只有 `Authorization: Bearer <key>` 与 `content-type`（`:231-234`），无 `anthropic-version`、无 UA。

### 3.2 消息转换 `toOpenAIMessages`（`:114-148`）

- `systemMessage` 作为**独立 system role** 前置（`:119-121`）——本文件是唯一这样做的适配器。
- 历史逐条：`system` 跳过（`:125`）；assistant → `assistant`，其余 → `user`（`:127`）。
- 历史 user 带附件 → 多模态（`:130-132`）；**历史 assistant 带 `reasoning` → 写入 `reasoning_content`**（`:133-134`）；其他直接 `content`（`:135-137`）。
- 当前用户消息最后追加（`:141-145`）。

### 3.3 SSE 解析 `parseSSELine`（`:239-308`）

整体 `try/catch`，异常返回 `[]`（`:240`、`:305-307`）。按顺序：

1. `delta.content` → `chunk`（`:245-247`）。
2. `delta.reasoning_content` → `reasoning`（`:250-252`）——注释点名 DeepSeek 等供应商。
3. `delta.tool_calls` 逐项（`:255-276`）：有 `function.name` 时发 `tool_call_start`，`toolCallId = tc.id || 'tc_<index>'`，`metadata` 仅在 `index` 存在时给 `{toolIndex}`（`:257-264`）；有 `function.arguments` 时发 `tool_call_delta`，`toolCallId: tc.id || ''`（后续增量不带 id，靠 reader 关联），并带 `toolIndex`（`:265-274`）。
4. `finish_reason === 'tool_calls'` → `done` + `stopReason:'tool_use'`（`:279-282`）。**其它 finish_reason（`stop`/`length` 等）不产出 `done`**——与 Responses 适配器不同。
5. `chunk.usage` 存在且至少一个有限数字 → `usage`，映射 `prompt_tokens`/`completion_tokens`/`prompt_tokens_details.cached_tokens`/`completion_tokens_details.reasoning_tokens`（`:285-302`）。

### 3.4 标题/轻量补全（`:310-335`）

`buildTitleRequest`：URL 与 key 处理同流式（`:311-312`）；`systemPrompt` 存在时前置 system 消息（`:314-316`）；body 为 `{model, messages, max_tokens: input.maxTokens ?? 300}`（`:324-328`），**无 `stream`、无 `stream_options`**。
`parseTitleResponse`：`data.choices?.[0]?.message?.content ?? null`（`:334`）；对 `null` 响应体不做防护（`data.choices` 会抛 `TypeError`），由 `fetchTitle` 的 catch 兜住（`sse-reader.ts:486-489`）。

## 4. 调用者与调用链

构造：`getAdapter(provider)`（`packages/core/src/providers/index.ts:58-64`）每次新建实例；注册表把 `openai`/`zhipu`/`ollama`/`doubao`/`qwen`/`custom` 映射到 `OpenAIAdapter`（`packages/core/src/providers/index.ts:33`、`:39`、`:42-44`、`:47`），`deepseek` 映射到 `OpenAIAdapter('deepseek')`（`:36`）。

入向：

| 调用者 | 位置 | 用到什么 |
| --- | --- | --- |
| `yanhu-pi-runtime.ts` | `:200`、`:294`、`:308-310` | 唯一真实流式调用方（研学多轮工具循环） |
| `conversation-title-service.ts` | `:92-93` | `buildTitleRequest` + `fetchTitle` |
| `lightweight-completion.ts` | `:86-87` | 同上（长期记忆审核等） |
| `agent-orchestrator.ts` | `:476-477` | 标题生成；`:432`/`:438` 对 `xai`/`openai-codex` 有专用分支（不经本类） |
| `cdut-ai-class-manager.ts` | `:563-564` | 一次性 JSON 补全 |
| `retrospective-service.ts` | `:261-263`、`:302` | 借 `buildTitleRequest` 拿 URL/头后改写 body |
| `sse-reader.ts` | `:311`、`:483` | `parseSSELine`/`parseTitleResponse` |
| `openai-adapter.test.ts` | `:2` | 直接单测（ollama 两条） |
| `usage-parsing.test.ts` | `:11`、`:56`、`:98` | 直接单测（usage 两条） |

出向：`url-utils.resolveOpenAIChatCompletionsUrl`（`:24`、`:204`、`:311`）。

无动态/反射调用；已 `grep -rn "OpenAIAdapter\|buildStreamRequest\|parseSSELine"` 覆盖 `apps/`、`packages/`。

## 5. 数据 I/O、读写与副作用

- 输入/输出同 `types.ts` 的 `StreamRequestInput`/`ProviderRequest`。
- 无磁盘、无缓存、无全局状态、无日志（**本文件无任何 `console`**，与 Anthropic 适配器的两个调试开关不同）。
- 无实例可变状态：类只有 `readonly providerType`（`:197`），可安全跨请求复用（对比 `GoogleAdapter.toolCallCounter`、`AnthropicAdapter.activeBlockType`）。
- 副作用：无。

## 6. 分支、失败、取消与恢复

| 分支 | 行 | 结果 |
| --- | --- | --- |
| `providerType==='ollama'` 空 key | `:205`、`:312` | key 变 `'ollama'` |
| `providerType==='ollama'` | `:220` | 不发送 `stream_options` |
| `custom` 完整端点 | `url-utils.ts:199-201` | 原样使用，**不补** `/chat/completions` |
| `finish_reason==='tool_calls'` | `:280-282` | `done`+`tool_use` |
| 其它 `finish_reason` | 无分支 | 不产出 `done`；由 reader 依 toolCalls 推断或由调用方按流结束处理 |
| 非法 JSON / 异常 | `:305-307` | 返回 `[]`（静默） |
| `usage` 全字段缺失 | `:287-293` | 不产出 usage 事件 |

无取消/超时/重试/恢复逻辑；`StreamRequestInput` 无 `AbortSignal`。

## 7. 权限与权威状态

- 无权限分支，依据：无 sender/role 检查、无配置读取；`apiKey` 明文进 `Authorization` 头（`:232`），不落盘不打印。
- 权威状态：模型 ID/URL/key 由调用方给定；`ollama` 的 `'ollama'` 占位是**本文件的既定约定**（`:205`），不是渠道配置值。
- 安全点：`custom` 端点原样使用意味着用户填什么就请求什么（`url-utils.ts:199-201`），本文件不做 host 白名单。

## 8. 修改影响面

- `packages/core/src/providers/index.ts:33`、`:36`、`:39`、`:42-44`、`:47`：注册表决定哪些 provider 落到本类；改构造默认值会影响这些 provider。
- `yanhu-pi-runtime.ts:294-310`：唯一流式调用方；改请求体形状（如 `stream_options`）会直接影响研学链路。
- `sse-reader.ts:311`：`toolIndex`/空 `toolCallId` 的关联契约在 `sse-reader.ts:346-355`；改 `toolIndex` 字段名会破坏多工具并发累积。
- `retrospective-service.ts:263-302`：**改写 body 后**复用 `buildTitleRequest`，改 body 骨架字段会静默破坏它（该文件读 `req.url`/`req.headers` 后替换 body）。
- 五个标题类调用方（§4）都依赖 `max_tokens` 缺省 300（`:327`）；改默认值会改变标题长度行为。
- 需同步的测试：`openai-adapter.test.ts:5-18`、`:20-30`（ollama URL/key）、`usage-parsing.test.ts:53-66`、`:100-104`。

## 9. 测试证据

- 直接测试 `packages/core/src/providers/openai-adapter.test.ts`（2 个 `test(`）：
  - `openai-adapter.test.ts:5-18` ollama 根地址：`new OpenAIAdapter('ollama').buildStreamRequest({baseUrl:'http://127.0.0.1:11434', apiKey:'', modelId:'qwen3:8b', ...})`（构造 `:6-13`）；`:15` 断言 `request.url === 'http://127.0.0.1:11434/v1/chat/completions'`、`:16` 断言 `Authorization === 'Bearer ollama'`、`:17` 断言 body `toMatchObject({model:'qwen3:8b', stream:true})`。
  - `openai-adapter.test.ts:20-30` `/v1` 不重复拼接：`buildTitleRequest({baseUrl:'http://127.0.0.1:11434/v1', apiKey:'local-key', modelId:'llama3.2', prompt:'title'})`（构造 `:21-26`）；`:28` 断言 url 为 `.../v1/chat/completions`、`:29` 断言 `Authorization === 'Bearer local-key'`。
- 间接 `usage-parsing.test.ts`：
  - `usage-parsing.test.ts:53-66` 流末 chunk `usage:{prompt_tokens:800, completion_tokens:120, prompt_tokens_details:{cached_tokens:64}}`（载荷 `:55-60`）→ `:61-65` 断言 `usageEvent` `toMatchObject({inputTokens:800, outputTokens:120, cacheReadTokens:64})`。
  - `usage-parsing.test.ts:100-104` 只有 `choices[0].delta.content` 时 `:103` 断言 `usageEvent` 为 `undefined`。
- 未覆盖：`system` role 前置、历史附件多模态、assistant `reasoning_content`、工具 `tool_call_start/delta`（含 `tc_<index>` 兜底与 `toolIndex`）、`finish_reason` 非 `tool_calls` 的行为、`stream_options` 的 ollama 排除、`custom` 原样端点、`parseTitleResponse`、`reasoningTokens` 映射。
- `NOT_RUN`：本轮未执行 `bun test`/typecheck/build。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 唯一导出 `OpenAIAdapter` | 已证实 | `openai-adapter.ts:196`；`grep -cE '^export '` = 1 |
| ollama 空 key 兜底为字面量 `'ollama'` | 已证实 | `:205`、`:312`；测试 `openai-adapter.test.ts:16` 断言 `Authorization === 'Bearer ollama'` |
| `stream_options.include_usage` 仅非 ollama 发送 | 已证实 | `:220-222` |
| `system` 作为独立 role（唯一适配器如此） | 已证实 | `:118-121`；对比 `anthropic-adapter.ts:394-396`、`google-adapter.ts:238-242` |
| 续接消息在 body 构造**之前**追加 | 已证实 | `:208-211` |
| 非 `tool_calls` 的 `finish_reason` 不产 `done` | 已证实 | `:279-282` 只有 `=== 'tool_calls'` 分支 |
| `parseTitleResponse` 对 null 体不防护 | 已证实 | `:333-334`；被 `sse-reader.ts:486-489` 兜住 |
| 无实例可变状态，可安全复用 | 已证实 | `:197` 仅 `readonly providerType` |
| `custom` 端点原样使用 | 已证实 | `url-utils.ts:199-201` |
| 真实上游对缺 `done` 的处理 | 未知 | 未运行；依赖 `sse-reader` 与调用方 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 导出清单 + 内部符号 | §2 | `:196`、`:29-192` | covered |
| URL 三策略/ollama key | §3.1 | `:204-205`；`url-utils.ts:194-206` | covered |
| body/stream_options/tools | §3.1 | `:213-227` | covered |
| 消息转换（system/reasoning/附件） | §3.2 | `:114-148` | covered |
| SSE 全分支 | §3.3 | `:239-308` | covered |
| 标题通道 | §3.4 | `:310-335` | covered |
| 调用者/影响面 | §4、§8 | 跨文件 | covered |
| 测试断言与缺口 | §9 | `openai-adapter.test.ts`、`usage-parsing.test.ts` | covered |
| 上游 finish_reason 实况 | §10 | — | unknown |

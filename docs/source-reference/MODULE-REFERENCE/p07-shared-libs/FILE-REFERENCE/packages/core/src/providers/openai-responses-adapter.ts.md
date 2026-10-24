---
path: packages/core/src/providers/openai-responses-adapter.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0dc274ae139e2618dd2dd24afe83f0bce6f434cb
sha256: 5df3f2936a179c247b828c158925b3a7b84aeea2fb6bf17ecdf25aff67e092b3
lines: 437
kind: source
package: p07-shared-libs
author: docs-r07-author-models-20261023
reviewer: p07-shared-libs
status: authored
evidence: static
---

# packages/core/src/providers/openai-responses-adapter.ts

## 1. 结论与边界

OpenAI **Responses API**（`/v1/responses`）适配器：把统一历史转成 `input` 条目数组，构建 `/responses` 请求，解析 Responses 的细粒度事件（`response.output_text.delta`、`response.function_call_arguments.*`、`response.completed` 等）。运行时模块，自身不发请求、不读写磁盘。

不做的事：不做 Chat Completions（`openai-adapter.ts`）；不实现工具执行；不判断 provider 是否允许（`packages/core/src/providers/index.ts:34-35` 把 `openai-responses`/`xai` 映射到本类）；不重试/超时。

## 2. 导出与关键符号

导出仅 1 条：`OpenAIResponsesAdapter` 类（`openai-responses-adapter.ts:242`）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `OpenAIResponsesAdapter` | class（export） | `:242-437` | `implements ProviderAdapter`；`constructor(providerType: ProviderType = 'openai-responses')`（`:245-247`） | 唯一导出 |
| `buildStreamRequest` | method | `:249-279` | `(input) => ProviderRequest` | 主路径 |
| `parseSSELine` | method | `:281-410` | `(jsonLine) => StreamEvent[]` | `switch(event.type)`；异常返回 `[]` |
| `buildTitleRequest` | method | `:412-431` | `(input) => ProviderRequest` | 非流式 |
| `parseTitleResponse` | method | `:433-436` | `(body) => string \| null` | `output_text` 优先，回退 `output[]` |
| `ResponsesInputTextPart`/`ResponsesInputImagePart`/`ResponsesContentPart` | type/interface（内部） | `:24-35` | `input_text`/`output_text`/`input_image` | 内容部件 |
| `ResponsesMessageInputItem`/`ResponsesFunctionCallInputItem`/`ResponsesFunctionCallOutputInputItem`/`ResponsesInputItem` | interface/type（内部） | `:37-59` | — | `input` 条目联合 |
| `ResponsesTool`（内部） | interface | `:61-67` | `{type:'function';name;description;parameters;strict:false}` | 工具定义 |
| `ResponsesStreamItem`/`ResponsesStreamData`/`ResponsesTitleResponse`（内部） | interface | `:69-104` | — | 流事件形状 |
| `buildInputImageParts`（内部） | function | `:108-114` | `(images) => ResponsesInputImagePart[]` | `data:<mime>;base64,` + `detail:'auto'` |
| `buildUserContent`（内部） | function | `:116-123` | `(text, images) => string \| ResponsesContentPart[]` | 无图返回纯字符串 |
| `splitResponsesToolCallId`（内部） | function | `:125-128` | `(id) => {callId, itemId?}` | 按 `\|` 拆分 |
| `buildResponsesToolCallId`（内部） | function | `:130-133` | `(item, outputIndex?) => string` | `call_id\|item.id` 或 `call_<index>` |
| `buildResponsesToolCallMetadata`（内部） | function | `:135-140` | `(item, outputIndex?) => Record \| undefined` | `{itemId, outputIndex}` |
| `toResponsesInput`（内部） | function | `:142-170` | `(input) => ResponsesInputItem[]` | system 前置；assistant 只保留 content |
| `toResponsesTools`（内部） | function | `:172-180` | `(tools) => ResponsesTool[]` | 扁平结构 + `strict:false` |
| `appendContinuationMessages`（内部） | function | `:182-212` | `(items, contMsgs) => void` | `function_call`/`function_call_output` |
| `collectOutputText`（内部） | function | `:214-222` | `(items?) => string \| null` | 拼接 `output_text` 与 `refusal` |
| `mapResponsesStatusToStopReason`（内部） | function | `:224-238` | `(status?) => string \| undefined` | `incomplete→max_tokens`、`failed/cancelled→error`、`completed→undefined` |

## 3. 内部逻辑与关键流程

### 3.1 请求构建 `buildStreamRequest`（`:249-279`）

1. `url = resolveOpenAIResponsesUrl(baseUrl, providerType)`（`:250`）→ `url-utils.ts:213-218`：已以 `/responses` 结尾则原样，否则 `normalizeBaseUrl + '/responses'`。
2. body 骨架 `{model, input: toResponsesInput(input), stream:true}`（`:251-255`）。
3. `tools` 非空 → 扁平工具数组（`:257-259`），每项 `{type:'function',name,description,parameters,strict:false}`。
4. **reasoning 仅在 `thinkingEnabled && (providerType==='xai' || modelId==='gpt-6-astra')` 时发送**，值为 `{effort:'medium'}`（`:261-265`）；关闭时不发，注释说明 Astra 不支持 `none/minimal`。
5. 续接消息追加到 `bodyObj.input` 的**同一数组引用**（`:267-269`），`JSON.stringify` 在 `:277` 之后，故进入请求体。
6. 头：`Authorization: Bearer` + `content-type`（`:272-276`）。

### 3.2 `input` 构造 `toResponsesInput`（`:142-170`）

- `systemMessage` → `{role:'system', content}` 前置（`:146-148`）。
- 历史 `system` 跳过（`:151`）；assistant **只保留 content**（空 content 则整条跳过，`:152-157`），不回传 reasoning。
- 历史 user 带附件 → `buildUserContent` 多模态（`:159-160`）；否则纯字符串（`:161-163`）。
- 当前用户消息最后追加（`:166-167`）。
- 注意顺序：`buildUserContent` 先放 `input_text` 再放图片（`:119-122`），与 Anthropic/Google 的「图先文后」相反。

### 3.3 续接与 ID 编码（`:125-140`、`:182-212`）

- toolCallId 采用 `call_id|item.id` 复合编码（`:130-133`）；续接时 `splitResponsesToolCallId` 拆回（`:125-128`），`function_call` 条目带可选 `id: itemId`（`:195`）。
- `tool_call_start` 的 `metadata` 为 `{itemId?, outputIndex?}`（`:135-140`），供 reader 按 output_index 关联增量。
- assistant 续接：`content` 非空加消息条目，再逐个 toolCall 加 `function_call`（参数 `JSON.stringify`）（`:187-200`）。
- tool 续接：逐结果加 `function_call_output`（`:201-209`），`call_id` 同样先拆分。

### 3.4 SSE 解析 `parseSSELine`（`:281-410`）

`switch(event.type)`：

| 事件 | 产出 | 行 |
| --- | --- | --- |
| `response.output_text.delta`、`response.refusal.delta` | `chunk`（refusal 也当正文） | `:287-290` |
| `response.reasoning_summary_text.delta`、`response.reasoning_text.delta` | `reasoning` | `:292-295` |
| `response.reasoning_summary_part.done` | `reasoning` + `'\n\n'` | `:297-299` |
| `response.output_item.added`（`function_call`） | `tool_call_start`；若 item 已带 `arguments` 再补一条 `tool_call_delta`（`toolCallId:''`） | `:301-318` |
| `response.function_call_arguments.delta` | `tool_call_delta`（`toolCallId:''`，带 `outputIndex`） | `:320-329` |
| `response.function_call_arguments.done` | `tool_call_delta`，`argumentsDelta:''` + `finalArguments` | `:331-341` |
| `response.output_item.done`（`function_call`） | 补发 `tool_call_start`（reader 按 ID 去重）+ `finalArguments` delta | `:343-363` |
| `response.completed` / `response.incomplete` | `done`（仅当 `mapResponsesStatusToStopReason` 返回非空）+ `usage` | `:365-389` |
| `response.failed` | `error`（`code: message` 形式）+ `done`/`error` | `:391-398` |
| `error` | `error` + `done`/`error` | `:400-403` |

`completed` 故意不设 `stopReason`（`:224-229` 注释）：有工具调用时由 reader 依 toolCalls 推断 `tool_use`；无工具调用时 Chat 流程不依赖 `end_turn`。`incomplete` → `max_tokens`，`failed`/`cancelled` → `error`。

### 3.5 标题/轻量补全（`:412-436`）

`buildTitleRequest`：`input:[{role:'user',content:prompt}]` + `max_output_tokens = input.maxTokens ?? 50`（`:418-419`）；`systemPrompt` → **顶层 `instructions`**（`:421`）；无 `stream` 字段。
`parseTitleResponse`：`data.output_text?.trim() || collectOutputText(data.output) || null`（`:435`）；`collectOutputText` 拼接所有 `output_text` 与 `refusal` 后 trim，空则 `null`（`:214-222`）。

## 4. 调用者与调用链

构造：`getAdapter('openai-responses')` / `getAdapter('xai')`（`packages/core/src/providers/index.ts:34-35`），每次新建实例（`packages/core/src/providers/index.ts:63`）。

入向：

| 调用者 | 位置 | 用到什么 |
| --- | --- | --- |
| `yanhu-pi-runtime.ts` | `:200`、`:294`、`:308-310` | 唯一真实流式调用方 |
| `conversation-title-service.ts` | `:92-93` | 标题 |
| `lightweight-completion.ts` | `:86-87` | 轻量补全 |
| `agent-orchestrator.ts` | `:476-477` | 标题；`:438` 对 `openai-codex` 另有分支 |
| `cdut-ai-class-manager.ts` | `:563-564` | 一次性 JSON 补全 |
| `retrospective-service.ts` | `:261-263`、`:302` | 改写 body 后复用 |
| `sse-reader.ts` | `:311`、`:483` | 解析 |
| `openai-responses-adapter.test.ts` | `:2-3` | 直接单测（9 个，见 §9） |
| `usage-parsing.test.ts` | `:12`、`:68-83` | usage 断言 |

出向：`url-utils.resolveOpenAIResponsesUrl`（`:20`、`:250`、`:413`）。无动态调用。

## 5. 数据 I/O、读写与副作用

- 输入/输出同 `types.ts` 契约。
- 无磁盘、无缓存、无日志、无遥测、无全局状态。
- 无实例可变状态（只有 `readonly providerType`，`:243`），可跨请求复用；与 Google 的计数器、Anthropic 的 `activeBlockType` 不同。
- 幂等：同输入产生相同 `ProviderRequest`。
- 副作用：无。

## 6. 分支、失败、取消与恢复

| 分支 | 行 | 结果 |
| --- | --- | --- |
| `thinkingEnabled` 且（`xai` 或 `gpt-6-astra`） | `:263-265` | `reasoning:{effort:'medium'}` |
| 其他情况 | 无分支 | 不发 reasoning |
| `output_item.done` 只发一次（无 added） | `:343-362` | 补发 start + finalArguments，仍可恢复参数 |
| `completed` | `:228-229` | 不产 `done`（`mapResponsesStatusToStopReason` 返回 undefined） |
| `incomplete` | `:230-231` | `done` + `max_tokens` |
| `failed`/`cancelled` 状态 | `:232-234` | `done` + `error` |
| `response.failed` 事件 | `:391-398` | `error` + `done/error` |
| 顶层 `error` 事件 | `:400-403` | `error` + `done/error` |
| 非法 JSON/异常 | `:407-409` | 返回 `[]`（静默） |

无取消/超时/重试/恢复；无 `AbortSignal`。`response.failed` 与 `error` 会经 `sse-reader.ts:360-361` 抛 `ProviderStreamError`。

## 7. 权限与权威状态

- 无权限分支，依据：无 sender/role 检查、无配置读取。
- 权威状态：`providerType` 由构造参数决定（`:245-247`），影响 URL 解析与 reasoning 分支；模型 ID/key 由调用方给定。
- 安全点：`Bearer` 头（`:274`），不落盘不打印；无 host 白名单。

## 8. 修改影响面

- `packages/core/src/providers/index.ts:34-35`：注册表 `openai-responses`/`xai` 两个 provider 都落到本类；改构造默认值会影响两者。
- `yanhu-pi-runtime.ts:294-310`：流式消费方；`input` 条目形状变化会影响研学链路。
- `sse-reader.ts:334-355`：`metadata.outputIndex` 是本适配器多工具并发累积的关键；`tool_call_start` 的 `toolCallId` 复合编码（`call_id|item_id`）必须与续接侧 `splitResponsesToolCallId`（`:125-128`）保持一致，改任一侧会断开工具结果回传。
- `sse-reader.ts:339`：reader 对「同 ID 同 name 的重复 start」去重，正是为本适配器 `added` + `done` 双发设计（`:345-346` 注释）。
- 五个标题类调用方依赖 `max_output_tokens` 缺省 50（`:419`）与 `instructions` 字段（`:421`）。
- 需同步的测试：`openai-responses-adapter.test.ts:28-167`（9 个用例）、`usage-parsing.test.ts:68-77`。

## 9. 测试证据

直接测试 `packages/core/src/providers/openai-responses-adapter.test.ts`（9 个 `test(`），逐条真实断言：

| # | 用例行段 | 断言行 | 真实断言 |
| --- | --- | --- | --- |
| 1 | `:28-44` | `:40-43` | xAI + `thinkingEnabled:true`：`request.url === 'https://api.x.ai/v1/responses'`、`headers.Authorization === 'Bearer xai-test-key'`、`body.model === 'grok-4.6'`、`body.reasoning` `toEqual({effort:'medium'})` |
| 2 | `:46-67` | `:57-66` | 基础输入：`url === 'https://api.openai.com/v1/responses'`、`Authorization === 'Bearer sk-test'`、`body.model === 'gpt-5.1'`、`body.stream === true`、`body.input` 深等于 `[{role:'system',...},{role:'assistant',...},{role:'user',...}]` 三条 |
| 3 | `:69-73` | `:70-73` | `response.output_text.delta` → `[{type:'chunk',delta:'hi'}]` |
| 4 | `:75-99` | `:87-98` | `output_item.added` → `tool_call_start{toolCallId:'call_1|fc_1',toolName:'search',metadata:{itemId:'fc_1',outputIndex:0}}`；`function_call_arguments.delta` → `tool_call_delta{toolCallId:'',argumentsDelta:'{"query":"Proma"}',metadata:{outputIndex:0}}` |
| 5 | `:101-122` | `:117-122` | 两工具交错（`output_index` 0/1 交替经 `createSSEFetch` 注入）：`streamSSE` 结果 `stopReason==='tool_use'`，`toolCalls` 深等于两个完整参数对象（含 metadata） |
| 6 | `:124-140` | `:137-139` | `arguments.done` 携带完整参数：`toolCalls` 只保留最终 `{query:'Proma'}`（`finalArguments` 替换增量） |
| 7 | `:142-156` | `:153-155` | 仅 `output_item.done`：仍能恢复 `{query:'Proma'}` |
| 8 | `:158-163` | `:159-162` | `response.completed` 单发 → `parseSSELine` 返回 `[]`（不提前固定 stopReason） |
| 9 | `:165-167` | `:166` | `parseTitleResponse({output_text:' 简短标题 '})` `toBe('简短标题')`（trim） |

夹具：`:5` 单例 `adapter`；`:7-17` `createSSEFetch` 用 `ReadableStream` 构造 `data: <json>\n\n` 帧；`:19-25` `buildRequest()` 固定 `https://api.openai.com/v1/responses`。

间接：`usage-parsing.test.ts:68-77`（test「OpenAI Responses：response.completed 的 usage 被解析」）在 `:76` 断言 `response.completed` 的 `usage:{input_tokens:900,output_tokens:210}` → `usageEvent(events)` `toMatchObject({inputTokens:900, outputTokens:210})`。

未覆盖：`response.refusal.delta`、`reasoning_summary_part.done` 的 `'\n\n'`、`incomplete`/`failed`/顶层 `error` 分支、`parseTitleResponse` 的 `collectOutputText` 回退、图片 `input_image` 与 `detail:'auto'`、续接 `function_call`/`function_call_output`、`strict:false` 工具形状。
`NOT_RUN`：本轮未执行测试/typecheck/build。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 唯一导出 `OpenAIResponsesAdapter` | 已证实 | `openai-responses-adapter.ts:242`；`grep -cE '^export '` = 1 |
| reasoning 只在 xai 或 `gpt-6-astra` 且开思考时发送 | 已证实 | `:263-265`；测试 `:28-44` |
| `completed` 不产 `done` | 已证实 | `:228-229`；测试 `packages/core/src/providers/openai-responses-adapter.test.ts:158-162` |
| `finalArguments` 替换增量 | 已证实 | `:331-341`；`sse-reader.ts:354`；测试 `:137-139`、`:153-155` |
| toolCallId 复合编码 `call_id\|item_id` | 已证实 | `:130-133`、`:125-128`；测试 `:87-98`、`:117-122` |
| `input` 顺序为先文本后图片 | 已证实 | `:119-122`；对比 `anthropic-adapter.ts:169-172` |
| 无实例可变状态 | 已证实 | `:243` 仅 `readonly providerType` |
| `refusal` 被当作正文 chunk | 已证实 | `:287-290` |
| 真实 Responses 端点对 `strict:false` 的接受度 | 未知 | 未运行网络 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 导出 + 内部符号 | §2 | `:242`、`:24-238` | covered |
| URL/body/tools/reasoning | §3.1 | `:249-279` | covered |
| input 构造 | §3.2 | `:142-170` | covered |
| 续接与 ID 编码 | §3.3 | `:125-140`、`:182-212` | covered |
| SSE 事件全表 | §3.4 | `:281-410` | covered |
| 标题通道 | §3.5 | `:412-436` | covered |
| 调用者/影响面 | §4、§8 | 跨文件 | covered |
| 测试 9 用例 | §9 | `openai-responses-adapter.test.ts:28-167` | covered |
| 未覆盖分支 | §9 | `:287-403` | partial |

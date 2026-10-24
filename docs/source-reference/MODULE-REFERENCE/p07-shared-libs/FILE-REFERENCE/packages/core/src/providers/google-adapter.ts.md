---
path: packages/core/src/providers/google-adapter.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 98730cbd646ba1c81ddca58d49ca3b2483bd010e
sha256: 6380d3169737b1ff94208850371f1f324dc9f56edc950f32f29fe58118067cae
lines: 356
kind: source
package: p07-shared-libs
author: docs-r07-author-models-20261023
reviewer: p07-shared-libs
status: authored
evidence: static
---

# packages/core/src/providers/google-adapter.ts

## 1. 结论与边界

Google Generative AI（Gemini）适配器：把统一历史转成 `contents`（assistant → `model`），构建 `:streamGenerateContent?alt=sse` 请求，解析 `candidates[0].content.parts` 的文本/思考/函数调用，并映射 `usageMetadata`。运行时模块，自身不发请求、不读写磁盘。

不做的事：不做 Anthropic/OpenAI 形状；不管理 API Key（**Key 直接拼进 URL 查询串**，见 §5）；不做重试/超时；不实现 Gemini 的 `thoughtSignature` 签发（只做透传）。

## 2. 导出与关键符号

导出仅 1 条：`GoogleAdapter` 类（`google-adapter.ts:205`）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `GoogleAdapter` | class（export） | `:205-356` | `implements ProviderAdapter`；**无构造参数**，`providerType = 'google' as const`（`:206`） | 唯一导出 |
| `toolCallCounter` | 私有字段 | `:209` | `number`，初值 0 | **可变实例状态**，用于生成 `name_N` 形式 toolCallId |
| `buildStreamRequest` | method | `:211-261` | `(input) => ProviderRequest` | 每次调用先把计数器重置为 0（`:212`） |
| `parseSSELine` | method | `:263-329` | `(jsonLine) => StreamEvent[]` | 异常返回 `[]` |
| `buildTitleRequest` | method | `:331-350` | `(input) => ProviderRequest` | 非流式 |
| `parseTitleResponse` | method | `:352-355` | `(body) => string \| null` | 取 `parts[0].text` |
| `GooglePart`/`GoogleContent`/`GoogleStreamData`/`GoogleTitleResponse`（内部） | interface | `:28-79` | — | 协议形状 |
| `buildImageParts`（内部） | function | `:86-93` | `(ImageAttachmentData[]) => GooglePart[]` | `inline_data{mime_type,data}` |
| `buildMessageParts`（内部） | function | `:98-104` | `(text, images) => GooglePart[]` | 无图时仅 `[{text}]` |
| `toGoogleContents`（内部） | function | `:113-150` | `(input) => GoogleContent[]` | 过滤 system；assistant reasoning → thought part |
| `toGoogleTools`（内部） | function | `:155-163` | `(tools) => [{functionDeclarations:[...]}]` | 单元素数组包裹 |
| `appendContinuationMessages`（内部） | function | `:168-201` | `(contents, contMsgs) => void` | 含 `thoughtSignature` 透传与 `name` 还原 |

## 3. 内部逻辑与关键流程

### 3.1 请求构建 `buildStreamRequest`（`:211-261`）

1. `this.toolCallCounter = 0`（`:212`）——**每个流式请求重置**，保证 `name_0` 从 0 开始。
2. `url = normalizeBaseUrl(input.baseUrl)`（`:213`）：只去尾部斜杠，**不补 `/v1beta`**（`:213` + `url-utils.ts:166-168`），版本段在最终 URL 里硬编码。
3. `contents = toGoogleContents(input)`（`:214`）。
4. `generationConfig` 仅在 `thinkingEnabled` 时非空：`{thinkingConfig:{includeThoughts:true, thinkingBudget:16384}}`（`:222-227`）；关闭时不传 `thinkingConfig`，交给模型默认（`:219-221` 注释）。**流式 body 不含 `maxOutputTokens`**（对比标题通道 `:337` 的 `maxOutputTokens ?? 50`），输出长度由服务端默认值决定。
5. `body.contents`（`:229-231`）；`generationConfig` 非空才挂（`:234-236`）；`systemMessage` → `systemInstruction.parts[0].text`（`:238-242`）；`tools` → `functionDeclarations`（`:245-247`）。
6. **续接消息在 body 构造之后**追加到同一个 `contents` 引用（`:250-252`），`JSON.stringify(body)` 在 `:259`，因此续接内容确实进入请求体（与 Anthropic 相同的「同引用」模式）。
7. 最终 URL：`${url}/v1beta/models/${modelId}:streamGenerateContent?alt=sse&key=${apiKey}`（`:255`）；头只有 `content-type`（`:256-258`）——**无 Authorization**。

### 3.2 消息转换 `toGoogleContents`（`:113-150`）

- 历史过滤 `system`（`:118`），assistant → `model`（`:120`）。
- 历史 user 带附件 → `inline_data` parts（`:123-126`）。
- **历史 assistant 带 `reasoning` → 两个 part：`{text: reasoning, thought:true}` + `{text: content}`**（`:129-137`），注释说明 Gemini 思考模型要求历史里含 thought 标记。
- 其余 `[{text: content}]`（`:139`）。
- 当前用户消息最后追加（`:143-147`）。

### 3.3 续接块 `appendContinuationMessages`（`:168-201`）

- assistant → `role:'model'`；`content` 非空先加 text part（`:175-177`）；每个 toolCall 加 `functionCall:{name,args}`，若 `tc.metadata.thoughtSignature` 存在则**原样透传**到 part（`:182-185`）。
- tool → `role:'user'`，逐结果 `functionResponse`（`:189-198`）。`name` 由 `toolCallId.replace(/_\d+$/, '')` 还原（`:194`），依赖 §3.5 的 `name_N` 命名约定；若工具名本身以 `_<数字>` 结尾会被截断（推断，见 §10）。

### 3.4 SSE 解析 `parseSSELine`（`:263-329`）

1. **先处理 `usageMetadata`**（`:269-286`），在 `parts` 缺失提前返回之前——注释明确「可能出现在无 parts 的末 chunk 中」。映射 `promptTokenCount`/`candidatesTokenCount`/`cachedContentTokenCount`/`thoughtsTokenCount` → `inputTokens`/`outputTokens`/`cacheReadTokens`/`reasoningTokens`，任一有限数字才发。
2. `parts` 缺失 → `return events`（`:288-289`）。
3. 逐 part（`:292-323`）：
   - `functionCall` → 先 `tool_call_start`（`toolCallId = `${fc.name}_${this.toolCallCounter++}``，`metadata` 仅在 `thoughtSignature` 存在时给 `{thoughtSignature}`），再 `tool_call_delta`（`argumentsDelta = JSON.stringify(fc.args || {})`，**一次性给全量参数**），`continue`（`:294-312`）。
   - 无 `text` 跳过（`:314`）。
   - `thought:true` → `reasoning`；否则 → `chunk`（`:316-322`）。
4. 异常返回 `[]`（`:326-328`）。

### 3.5 标题/轻量补全（`:331-355`）

`buildTitleRequest`：`contents:[{role:'user',parts:[{text:prompt}]}]` + `generationConfig.maxOutputTokens = input.maxTokens ?? 50`（`:336-337`）；`systemPrompt` → `systemInstruction`（`:339-341`）；URL 为 `...:generateContent?key=...`（`:344`），**无 `alt=sse`、无 stream**。
`parseTitleResponse`：`candidates?.[0]?.content?.parts?.[0]?.text ?? null`（`:354`）——只取**第一个** part；若首 part 是 thought 且无 text，会返回 `null`。

## 4. 调用者与调用链

构造：`getAdapter('google')`（`packages/core/src/providers/index.ts:48` → `new GoogleAdapter()`）；每次新建实例（`packages/core/src/providers/index.ts:63`）。`packages/core/src/providers/index.test.ts:9-11` 专门断言 `getAdapter('google')` 两次不是同一实例，注释理由为「避免工具计数器跨请求污染」。

入向：

| 调用者 | 位置 | 用到什么 |
| --- | --- | --- |
| `yanhu-pi-runtime.ts` | `:200`、`:294`、`:308-310` | 唯一真实流式调用方 |
| `conversation-title-service.ts` | `:92-93` | 标题 |
| `lightweight-completion.ts` | `:86-87` | 轻量补全 |
| `agent-orchestrator.ts` | `:476-477` | 标题 |
| `cdut-ai-class-manager.ts` | `:563-564` | 一次性 JSON 补全 |
| `retrospective-service.ts` | `:261-263`、`:302` | 改写 body 后复用 |
| `sse-reader.ts` | `:311`、`:483` | 解析 |
| `usage-parsing.test.ts` | `:10`、`:70-96` | 直接单测 usage |

出向：`url-utils.normalizeBaseUrl`（`:23`、`:213`、`:332`）。无动态调用。

## 5. 数据 I/O、读写与副作用

- 输入/输出同 `types.ts` 契约；`body` 已序列化。
- 无磁盘、无缓存、无日志、无遥测。
- **API Key 出现在 URL 查询串**（`:255`、`:344`），这是 Google API 的既定鉴权方式；后果：Key 可能进入代理日志/崩溃转储/错误消息。`channel-manager.ts:1016`、`:1813` 的连接测试也采用同样的 `?key=` 形式（口径一致）。
- 实例可变状态：`toolCallCounter`（`:209`）。同一实例被两条并发流共用时，`name_N` 会交错、`toolCallId` 可能碰撞（推断，依据 `:212` 的重置时机与 `:296` 的自增）。
- 无原子性/幂等概念（纯构建）。

## 6. 分支、失败、取消与恢复

| 分支 | 行 | 结果 |
| --- | --- | --- |
| `thinkingEnabled` 真 | `:222-227` | 传 `thinkingConfig`（`includeThoughts:true`、`thinkingBudget:16384`） |
| `thinkingEnabled` 假 | 无分支 | 不传 `thinkingConfig` |
| `parts` 缺失但有 `usageMetadata` | `:269-289` | 仍产出 usage（先处理再早退） |
| `functionCall` | `:294-312` | start + 一次性 delta |
| `thought:true` | `:316-318` | `reasoning` |
| 非法 JSON/异常 | `:326-328` | 返回 `[]`（静默） |
| `usageMetadata` 全空 | `:271-277` | 不产 usage |

无取消/超时/重试/恢复；无 `AbortSignal`。

## 7. 权限与权威状态

- 无权限分支，依据：无 sender/role 检查、无配置读取。
- 权威状态：`providerType` 硬编码 `'google'`（`:206`），不受调用方影响；模型 ID 与 key 由调用方给定。
- 安全点：Key 走 URL（§5）；本文件不做 host 白名单，`baseUrl` 由渠道配置决定。

## 8. 修改影响面

- `packages/core/src/providers/index.ts:48`：注册表 `['google', () => new GoogleAdapter()]`；改构造签名会破坏该行。
- `yanhu-pi-runtime.ts:294-310`：流式消费方；改 `contents`/`systemInstruction` 形状会影响研学链路。
- `sse-reader.ts:346-355`：Google 的 `tool_call_delta` 不带 `toolIndex`/`metadata.outputIndex`，靠 `currentToolCallId` 关联（因 start 紧邻 delta 发出）；若改成本文件先发 delta 后发 start，会触发 `sse-reader.ts:353` 的「收到未知工具调用参数」。
- `google-adapter.ts:194` 的 `name` 还原依赖 `name_N` 约定；改 `:296` 的 ID 格式会同时破坏续接。
- 五个标题类调用方依赖 `maxOutputTokens` 缺省 50（`:337`）。
- 需同步的测试：`usage-parsing.test.ts:79-98`、`packages/core/src/providers/index.test.ts:9-11`。

## 9. 测试证据

- 无 `google-adapter.test.ts`（已检索 `packages/core/src/providers/*.test.ts`）。
- 间接 `usage-parsing.test.ts:79-98`（test「Google：无 parts 但带 usageMetadata 的末 chunk 仍产出 usage」）：`:81-91` 调 `new GoogleAdapter().parseSSELine({candidates:[], usageMetadata:{promptTokenCount:700, candidatesTokenCount:180, cachedContentTokenCount:20, thoughtsTokenCount:30}})`，`:92-97` 断言 `usageEvent(events)` `toMatchObject({inputTokens:700, outputTokens:180, cacheReadTokens:20, reasoningTokens:30})`。该用例正是「无 parts 的末 chunk」场景。
- 间接 `packages/core/src/providers/index.test.ts:9-11`：`:10` 断言 `expect(getAdapter('google')).not.toBe(getAdapter('google'))`。
- 未覆盖：`buildStreamRequest` 全部（URL/thinkingConfig/systemInstruction/tools/续接/thoughtSignature）、`functionCall` 的 `name_N` 生成与参数序列化、`thought` → reasoning、`chunk`、`buildTitleRequest`、`parseTitleResponse` 的首 part 取值、`toolCallCounter` 行为。
- `NOT_RUN`：本轮未执行测试/typecheck/build。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 唯一导出 `GoogleAdapter`；`providerType` 硬编码 `'google'` | 已证实 | `google-adapter.ts:205-206`；`grep -cE '^export '` = 1 |
| URL 硬编码 `/v1beta/models/<model>:streamGenerateContent?alt=sse&key=` | 已证实 | `:255` |
| API Key 在 URL 查询串，非 Authorization 头 | 已证实 | `:255-258`、`:344-347` |
| `thinkingConfig` 仅开启时发送，预算 16384 | 已证实 | `:222-227` |
| usage 先于 `parts` 早退处理 | 已证实 | `:269-289` |
| `toolCallCounter` 每请求重置、解析时自增 | 已证实 | `:212`、`:296` |
| toolCallId 为 `name_N`，续接按 `_\d+$` 还原 name | 已证实 | `:296`、`:194` |
| 工具名以 `_<数字>` 结尾会被误截断 | 推断 | `:194` 的正则无转义/白名单 |
| 同一实例并发两条流会导致 ID 交错 | 推断 | `:209`、`:212`、`:296`；`index.test.ts:9-11` 只保证不同实例 |
| `baseUrl` 已含 `/v1beta` 会重复拼接 | 推断 | `:213` 只 trim 斜杠；`PROVIDER_DEFAULT_URLS.google` 无 `/v1beta`（`packages/shared/src/types/channel.ts:47`） |
| 真实 Gemini 对 `thinkingBudget:16384` 的接受度 | 未知 | 未运行网络 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 导出 + 内部符号 | §2 | `:205`、`:28-201` | covered |
| URL/body/thinkingConfig/systemInstruction | §3.1 | `:211-261` | covered |
| contents 转换（model/thought/附件） | §3.2 | `:113-150` | covered |
| 续接与 thoughtSignature | §3.3 | `:168-201` | covered |
| SSE 全分支 | §3.4 | `:263-329` | covered |
| 标题通道 | §3.5 | `:331-355` | covered |
| Key 在 URL 的安全面 | §5、§7 | `:255`、`:344` | covered |
| 调用者/影响面 | §4、§8 | 跨文件 | covered |
| 测试断言与缺口 | §9 | `usage-parsing.test.ts:79-98`、`index.test.ts:9-11` | covered |
| 工具名截断/并发/重复版本段 | §10 | — | 推断 |

---
path: packages/core/src/providers/openai-responses-adapter.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d81990ef39b65f45e00c1c36bea1341ebf36278b
sha256: e84d1c3ffda86bced1ebba8e120a7122baa5e69040e07b5356f00a4e7ae23ab7
lines: 168
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-05-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---

# packages/core/src/providers/openai-responses-adapter.test.ts

## 1. 测试目标

`OpenAIResponsesAdapter` 的 xAI Responses 端点/推理档位、`/responses` `input` 请求形、SSE 事件解析（文本 delta/工具事件/多工具参数交错/finalArguments 兜底）与 `parseTitleResponse`。bun:test；流式路径用**真流式桩**（`createSSEFetch` 构造 ReadableStream Response，`:7-17`）驱动 `streamSSE`。**边界（已证实）**：被测实现 `openai-responses-adapter.ts`/`sse-reader.ts` 不在本批 scope——断言逐条读，源码行为未在本批回源。

## 2. 用例清单

共 **10 个 `test(`**（计数核对）：

| 行 | 用例 | 设置 | 动作 | 依赖顺序 |
| --- | --- | --- | --- | --- |
| `:28` | xAI 开思考→x.ai Responses endpoint + reasoning effort | `new OpenAIResponsesAdapter('xai')`，baseUrl `https://api.x.ai/v1`、thinkingEnabled | `buildStreamRequest` | 独立 |
| `:46` | 基础输入→`/responses` + input 格式 | history 1 条 assistant、systemMessage | `buildStreamRequest` | 独立 |
| `:69` | 文本 delta→chunk | `response.output_text.delta` | `parseSSELine` | 独立 |
| `:75` | 工具调用事件→工具事件 | `output_item.added`(function_call)+`function_call_arguments.delta` | `parseSSELine`×2 | 独立 |
| `:101` | 多工具参数交错→按 output_index 分别累积 | 7 事件流（2 工具交错 delta + completed） | `streamSSE` | 独立 |
| `:124` | done 事件 finalArguments 替换增量兜底 | delta+`function_call_arguments.done` | `streamSSE` | 独立 |
| `:142` | 仅 `output_item.done` 也能恢复参数 | 单 done 事件 | `streamSSE` | 独立 |
| `:158` | completed 不提前固定 stopReason | `response.completed` | `parseSSELine` | 独立 |
| `:165` | 标题响应 trim | `{output_text:' 简短标题 '}` | `parseTitleResponse` | 独立 |

（`test(` 计数=10；`:75` 内含 2 个 parseSSELine 调用断言两事件。）

## 3. 真实断言

- `:40-43`：url `https://api.x.ai/v1/responses`、`Authorization: Bearer xai-test-key`、`body.model==='grok-4.6'`、`body.reasoning` toEqual `{effort:'medium'}`。
- `:57-66`：url `/responses`、`model:'gpt-5.1'`、`stream:true`、`input` toEqual `[{role:'system',content:'你是 Proma'},{role:'assistant',content:'历史回复'},{role:'user',content:'你好'}]`（system/assistant/user 序）。
- `:70-72`：`parseSSELine` 输出 `[{type:'chunk',delta:'hi'}]`。
- `:87-98`：`tool_call_start`（`toolCallId:'call_1|fc_1'`、`toolName:'search'`、`metadata:{itemId:'fc_1',outputIndex:0}`）与 `tool_call_delta`（**`toolCallId:''`**、`argumentsDelta`、`metadata:{outputIndex:0}`）。
- `:117-121`：`result.stopReason==='tool_use'`；`toolCalls` toEqual 两条（`id:'call_1|fc_1'` args `{query:'Proma'}`、`id:'call_2|fc_2'` args `{path:'README.md'}`，含 metadata）——**多工具交错按 output_index 分别累积**。
- `:137-139`：finalArguments `{query:'Proma'}` 替换增量 `{query:'partial'}` 后单条 toolCalls。
- `:153-155`：仅 `output_item.done` 恢复 `arguments:'{"query":"Proma"}'`。
- `:159-162`：`response.completed` → `[]`（不提前定 stopReason）。
- `:166`：`parseTitleResponse({output_text:' 简短标题 '})==='简短标题'`。

## 4. 未覆盖与脆弱点

- 未覆盖：`response.output_text.done`、错误事件（`response.failed`）、非 function_call 的 output_item、`buildTitleRequest`。
- 脆弱点：`toolCallId` 拼接格式 `call_1|fc_1`、delta 事件 toolCallId 空串等契约字面被断言锁定。
- mock 边界：fetch 由 `createSSEFetch` 真流式桩替换（`:7-17`）；`streamSSE`/adapter 为真实实现（域外）。
- 断言≠已运行：**本轮 NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 10 用例、断言逐条、桩结构 | 已证实 | 全 168 行逐行读 |
| 被断言的 adapter/streamSSE 行为在实现中成立 | 未知（域外未回源） | 实现文件不在本批 scope |
| 测试通过状态 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 10 用例 | §2/§3 | 28-167 | covered |
| 域外边界/未覆盖 | §1/§4/§5 | — | covered（如实标注） |

---
path: apps/electron/src/main/lib/cdut/cdut-ai-class-manager.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 096ec48c7a7339aec3a04ac25eb83d090d771dd1
sha256: 8db53b3923b037ea357ff54c90a41f2dc601b892801f02657991dd7afea7c26f
lines: 158
kind: test
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cdut/cdut-ai-class-manager.test.ts

## 1. 测试目标

针对 `apps/electron/src/main/lib/cdut/cdut-ai-class-manager.ts` 的两个单元：①`oneShotJsonCompletion` 的渠道继承/错误分支与超时常量（文件头注释 `apps/electron/src/main/lib/cdut/cdut-ai-class-manager.test.ts:3-5`）；②`inspectCompletionResponse` 的协议感知响应解析。不测工作区/会话/演示课堂/图谱生成/费用估算（见 §4）。

框架：`bun:test`（`describe/expect/it`，`:7`）。导入被测符号 `ONE_SHOT_COMPLETION_TIMEOUT_MS`、`inspectCompletionResponse`、`oneShotJsonCompletion`（`:8-12`）。

## 2. 用例清单

共 2 个 `describe`、12 个 `it`（`:15/:19/:28` + `:43/:52/:61/:75/:94/:103/:117/:136/:151`）。依赖顺序：全部独立，无 beforeEach/afterEach、无共享状态、无顺序依赖。

`describe('cdut-ai-class-manager 静默模型编排')`（`:14`）：

1. `:15-17` 默认超时时间配置为 90 秒——设置：无；动作：读常量；断言：见 §3。
2. `:19-26` 显式传入不存在的渠道 ID 时应抛出明确中文错误——设置：`channelId:'non-existent-channel-id-xyz'`、`modelId:'test-model'`；动作：调 `oneShotJsonCompletion('sys','user',…)`；断言：reject 文案。
3. `:28-39` 外部取消信号（pre-aborted signal）应立即抛出生成已取消——设置：`AbortController` 先 `abort()`；动作：带 `signal` 调用；断言：**reject 文案仍是「渠道不存在或已被删除」**（`:38`，注释解释渠道校验早于请求）。

`describe('inspectCompletionResponse 协议感知解析')`（`:42`），用例命名采用 Given/When/Then：

4. `:43-50` OpenAI Chat 空正文且 `finish_reason=length` → `text:null`、`finishReason:'length'`。
5. `:52-59` `content=null` → 不抛、`text:null`、`finishReason:'stop'`。
6. `:61-73` 内容块数组（对象+字符串）→ 拼接正文与字符数。
7. `:75-92` 三思考字段（`reasoning_content/reasoning/thinking`）→ 只计 `reasoningChars`。
8. `:94-101` `finish_reason=content_filter` → 原样透出。
9. `:103-115` Anthropic `thinking`+`text` 混合 → 只返回 text 块、识别 `max_tokens`。
10. `:117-134` Google 含 `thought:true` 片段 → 只取非思考正文。
11. `:136-149` Responses 响应 → `output_text` 与 `output[]` 兜底双路径。
12. `:151-157` `data` 为 `null`/字符串/空对象 → 统一空正文不抛（循环 3 输入）。

## 3. 真实断言

- `:16` `expect(ONE_SHOT_COMPLETION_TIMEOUT_MS).toBe(90_000)`。
- `:25` `.rejects.toThrow('渠道不存在或已被删除')`（对应实现 `apps/electron/src/main/lib/cdut/cdut-ai-class-manager.ts:546`）。
- `:38` `.rejects.toThrow('渠道不存在或已被删除')`——用例名声称验证「生成已取消」，断言并未触及该文案（实现 `:641/:695` 的 `'生成已取消。'` 无断言覆盖）。
- `:48-49` `result.text` 为 `null`、`result.finishReason` 为 `'length'`。
- `:57-58` `text:null`、`finishReason:'stop'`。
- `:71-72` `text` 为 `'{"a":1}尾部'`、`textChars` 为 `9`。
- `:90-91` `text:null`、`reasoningChars` 为 `9`（'思考一'+'思考二'+'思考三' 各 3 字符）。
- `:100` `finishReason` 为 `'content_filter'`。
- `:112-114` `text` 为 `'{"questions":[]}'`、`finishReason` 为 `'max_tokens'`、`reasoningChars` 为 `6`（'长篇思考过程' 6 字符）。
- `:132-133` `text` 为 `'{"a":1}'`、`finishReason` 为 `'MAX_TOKENS'`（google 分支透传原始大小写）。
- `:146-148` direct `text:'{"a":1}'`（trim 后）、fallback `text:'{"b":2}'`、fallback `finishReason:'max_output_tokens'`。
- `:154-155` 循环内 `text:null`、`textChars` 为 `0`。

## 4. 未覆盖与脆弱点

- **未覆盖**（冻结树检索：`apps/**`、`packages/**` 全部 `.test.ts` 中仅本文件引用 `cdut-ai-class-manager` 符号）：`ensureAiClassWorkspace`/`listAiClassSessions`/`createAiClassSession`/`ensureDemoAiClassSession` 全链（含 in-flight 去重与演示小说降级）/`deleteAiClassSession` 磁盘清理与路径守卫/`estimateGraphGenerationCost` 公式/`generateKnowledgeGraph` 三档模式与降级链/`coerceEdges` 校验/`readCachedGraphEdges`/`oneShotJsonCompletion` 的超时熔断、扩容重试、HTTP 错误矩阵（401/403 优先、重试回抛 firstFailure）、代管鉴权分支、四协议请求体注入——均无断言。
- 用例 3（`:28-39`）标题与断言错位：名不副实（实测断言只覆盖渠道校验先于请求）；`'生成已取消。'` 路径实际不可断言于该用例。
- 脆弱点：用例 2/3 依赖真实 `channel-manager` 列表中不存在 `'non-existent-channel-id-xyz'`（无 mock）；若测试环境预置同名渠道，用例将走到网络请求路径而行为改变。`getSettings()` 被真实调用（实现 `:538`），当前因显式传参不影响结果，属隐式环境耦合。
- `inspectCompletionResponse` 用例只覆盖每协议主干分支，未测：google `candidates` 缺失、openai-responses `output` 内多段混合、anthropic 非 text/thinking 块类型、openai-chat `content` 为纯字符串等分支。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 12 个 `it` 数量与行号 | 已证实 | `apps/electron/src/main/lib/cdut/cdut-ai-class-manager.test.ts:15-157` 逐条核对 |
| 上列每条断言文本 | 已证实 | §3 引用行逐一核对 |
| 用例 3 断言与标题错位 | 已证实 | `:28` 标题 vs `:38` 断言 |
| 测试无 mock/无 fixture/无 hook | 已证实 | 全文件无 `mock`/`spy`/`beforeEach`/fixture 目录引用 |
| 依赖真实渠道列表不含固定 id | 推断 | 无 mock 代码；行为依赖运行环境（NOT_RUN 未验证） |
| 测试实际运行结果 | 未知 | 本轮 NOT_RUN，不声明通过 |

## 6. 覆盖表

| 被测符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `ONE_SHOT_COMPLETION_TIMEOUT_MS` | §3 | test:16 | covered |
| `oneShotJsonCompletion` 渠道不存在分支 | §3 | test:19-26 | covered |
| `oneShotJsonCompletion` 取消/超时/重试/HTTP/鉴权 | §4 | — | unknown（无断言） |
| `inspectCompletionResponse` openai-chat 主干 | §3 | test:43-101 | covered |
| `inspectCompletionResponse` anthropic/google/responses | §3 | test:103-149 | covered |
| `inspectCompletionResponse` 畸形输入 | §3 | test:151-157 | covered |
| 工作区/会话/演示/图谱/费用函数 | §4 | — | unknown（本文件不测） |
| 实际运行 | §5 | — | unknown（NOT_RUN） |

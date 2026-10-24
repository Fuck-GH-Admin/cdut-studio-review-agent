---
path: packages/core/src/providers/usage-parsing.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 794cd52658614144da6d4c783eb5a88aff945efb
sha256: 82e8871a6f8e279d63239bd50b26e9b14b21b99f8be7467fb5e5ac5debf724ff
lines: 105
kind: test
package: p07-shared-libs
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/core/src/providers/usage-parsing.test.ts

## 1. 测试目标

**四适配器真实 usage 解析**（`packages/core/src/providers/usage-parsing.test.ts:1-6`）：Anthropic `message_start`/`message_delta`、OpenAI Chat 尾 chunk、OpenAI Responses `response.completed`、Google `usageMetadata`（含无 parts 末 chunk）。

## 2. 用例清单

1 describe / 5 test。夹具：四个**真实适配器**实例（`AnthropicAdapter`/`GoogleAdapter`/`OpenAIAdapter`/`OpenAIResponsesAdapter`）；`usageEvent` 辅助提取（`:16-18`）。

| # | 名称 | 动作 | 断言 | 行 |
| --- | --- | --- | --- | --- |
| 1 | Anthropic：start 给 input/cache、delta 给 output | 两帧 `parseSSELine` | start 帧 `{inputTokens:1200, cacheReadTokens:300, cacheWriteTokens:50}`；delta 帧 `{outputTokens:640}` | `:21-51` |
| 2 | OpenAI Chat 流末尾 chunk | 尾 chunk（`prompt_tokens_details.cached_tokens`） | `{inputTokens:800, outputTokens:120, cacheReadTokens:64}` | `:53-66` |
| 3 | OpenAI Responses `response.completed` | 该事件 | `{inputTokens:900, outputTokens:210}` | `:68-77` |
| 4 | Google 无 parts 但带 usageMetadata | 空 candidates + usageMetadata | `{inputTokens:700, outputTokens:180, cacheReadTokens:20, reasoningTokens:30}` | `:79-98` |
| 5 | 无 usage 字段不产出事件 | 普通 chunk | `usageEvent(events)===undefined` | `:100-104` |

## 3. 真实断言

- `expect(usageEvent(start)).toMatchObject({ inputTokens: 1200, cacheReadTokens: 300, cacheWriteTokens: 50 })`（`:37-41`）。
- `expect(usageEvent(events)).toMatchObject({ inputTokens: 700, outputTokens: 180, cacheReadTokens: 20, reasoningTokens: 30 })`（`:92-97`）。

## 4. 未覆盖与脆弱点

- 未覆盖：`streamSSE` 的 `mergeUsage` 合并（本文件只测单帧解析）；usage 数值为 0/负数的边界。
- 脆弱点：断言绑定四适配器的字段映射（`prompt_tokens→inputTokens` 等）。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 四适配器 usage 映射 | 已证实 | `:21-98` |
| 无 usage 不产事件 | 已证实 | `:100-104` |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 适配器 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| Anthropic | 1 | `:21-51` | covered |
| OpenAI Chat | 2 | `:53-66` | covered |
| OpenAI Responses | 3 | `:68-77` | covered |
| Google | 4 | `:79-98` | covered |
| 无 usage | 5 | `:100-104` | covered |

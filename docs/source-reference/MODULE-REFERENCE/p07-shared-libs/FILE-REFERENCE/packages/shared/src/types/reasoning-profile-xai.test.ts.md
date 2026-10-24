---
path: packages/shared/src/types/reasoning-profile-xai.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: bb16f2a5e9086a6dc65baedc00dbd3cde403c747
sha256: 08049794c273598ac02fade1493107e4e20effd7dfcc4a8169a425588d75da17
lines: 19
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/shared/src/types/reasoning-profile-xai.test.ts

## 1. 测试目标

xAI Grok 的 reasoning profile：`inferReasoningTransport('xai')` 与 `grok-4.6` 的 Responses 编码。被测逻辑见同组 `reasoning-profile.ts.md`。

## 2. 用例清单

1 个 describe（`xAI Grok reasoning profile`）+ **1 个 `test()`**（`:5-18`）：grok-4.6/openai-responses 解析。

## 3. 真实断言

- `:8` `inferReasoningTransport('xai')` `toBe('openai-responses')`。
- `:9-10` `profile.id` `toBe('grok-4.6')`、`levels` `toEqual(['off','low','medium','high','xhigh'])`。
- `:11-17` `effortMap` `toMatchObject({off:'none',low:'low',medium:'medium',high:'high',xhigh:'xhigh'})`（**toMatchObject=子集匹配**，非全等）。

## 4. 未覆盖与脆弱点

- 未覆盖：grok 其余 transport、`normalize`（复用 `normalizeOpenAIStandardLevel` 无专属断言）、`resolveReasoningProfile` 的 xai 负例。
- **NOT_RUN**：本轮未执行本文件。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 用例与断言如 §3 | 已证实 | 逐行读 `:1-19` |
| 通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| grok-4.6 responses 编码 + xai transport | 1 | covered |
| 其余 | — | unknown |

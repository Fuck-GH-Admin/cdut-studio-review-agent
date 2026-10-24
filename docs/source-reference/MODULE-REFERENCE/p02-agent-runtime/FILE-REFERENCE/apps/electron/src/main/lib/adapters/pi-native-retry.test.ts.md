---
path: apps/electron/src/main/lib/adapters/pi-native-retry.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 63bbba54c0e306146d6bb198e573ecd2b754964b
sha256: f1e2aa2e39dac39856b4012a391da6dd4ad678ab49d972f9083c527cd9719d15
lines: 87
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/adapters/pi-native-retry.test.ts

## 1. 测试目标

Pi native retry **错误分类器与重试循环**——被测符号 `isRetryableAssistantError`/`retryAssistantCall`/`AssistantMessage` 来自 **`@earendil-works/pi-ai/compat`**（`apps/electron/src/main/lib/adapters/pi-native-retry.test.ts:2`），不在本批任何源文件（跨文件归属：断言对象是 SDK compat 层 + Profer 引入的 `pi-coding-agent@0.82.1.patch` 扩展的分类行为，此处仅登记）。无 mock（假 AssistantMessage 构造器）。

## 2. 用例清单

1 describe、9 test（`:13-86`）：

1. `:14` OpenAI Responses 终止事件断流→retryable。
2. `:20` OpenAI 兼容断流→retryable。
3. `:26` 上游 JSON 损坏→retryable。
4. `:32`（test.each 2）本地化摘要过载→retryable。
5. `:39` 经真实 retryAssistantCall 循环重试摘要过载成功。
6. `:52`（test.each 6）传输中断文案→retryable。
7. `:63` Failed to fetch 经真实循环重试成功。
8. `:76` 无关键的 stream-ended 文案→**不** retryable。
9. `:82` 429 insufficient_quota→**不** retryable。

## 3. 真实断言

- `:17/:23/:29/:36/:60` `isRetryableAssistantError(...)` 为 `true`；`:79/:85` 为 `false`。
- `:48-49/:72-73` `calls` 为 `2` 且 `result.stopReason` 为 `'stop'`（真实循环 `retryAssistantCall`，maxRetries 1）。

## 4. 未覆盖与脆弱点

未覆盖：分类器正则全文（SDK 内部）、maxRetries>1 的 backoff 时序、`PiNativeRetryOutcome` 映射（属 `pi-retry-control.ts`，另篇）。断言绑定 SDK 行为——SDK 升级可能翻转（test 标题即锚定版本语义）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 9 用例行号与断言文本 | 已证实 | `:13-86` |
| 被测符号=SDK compat（跨文件归属） | 已证实 | `:2` import |
| 分类器内部实现 | 未知 | SDK 未读 |
| 运行结果 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| 分类 6 组文案+真循环 2 例 | §3 | covered |
| 分类器内部/ backoff | §4 | unknown |
| 实际运行 | §5 | unknown（NOT_RUN） |

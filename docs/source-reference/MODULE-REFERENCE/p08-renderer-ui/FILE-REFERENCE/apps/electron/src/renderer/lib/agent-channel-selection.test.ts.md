---
path: apps/electron/src/renderer/lib/agent-channel-selection.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a6ca3df8ffa0c50d17b1ca3ae996574091b38cb3
sha256: 90e123608ed4eb51e406c4eb35964d28be0ab6a5c49874a2043eef680032dad3
lines: 94
kind: test
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/agent-channel-selection.test.ts

## 1. 测试目标

渠道追加与模型解析（Pi OpenAI 优先/兼容保留）。不运行（`NOT_RUN`）。

## 2. 用例清单

10 用例，2 describe：
- `nextAgentChannelIdsAfterModelSelect`（:19，4 用例）：Pi 加渠道（:20）/已存不变（:24）/追加新 Pi 渠道（:29）/Pi 默认入可选（:34）。
- `resolveAgentModelSelection`（:40，7 用例）：Pi 选 OpenAI 协议（:47）/Ollama 可选（:54）/**多可选优先 OpenAI**（:61）/保留当前选择（:68）/**无 OpenAI 回退 Anthropic**（:78）/无白名单保留当前（:85）。

## 3. 真实断言

toEqual/toBe 级（选择结果）。

## 4. 未覆盖与脆弱点

mock 边界：Channel fixture。`NOT_RUN`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 10 用例/主题如 §2 | 已证实 | 逐段读 |
| 通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 分支 | 用例 | 状态 |
| --- | --- | --- |
| 追加/解析/回退 | 10 用例 | covered |

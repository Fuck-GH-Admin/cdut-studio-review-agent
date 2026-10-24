---
path: apps/electron/src/renderer/lib/agent-running-indicator.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 07967e4fa5be5f739a02d172f88567196ee9f448
sha256: 3d1fe360e93207a064a18ecea6e94ef5e86bcc3d27fb6b10e40e574878619de1
lines: 36
kind: test
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/agent-running-indicator.test.ts

## 1. 测试目标

`shouldShowAgentRunningIndicator`（测自 `./agent-running-indicator`，**源文件不属本批**）：运行指示显隐。不运行（`NOT_RUN`）。

## 2. 用例清单

3 用例（:15/:22/:30），1 describe（:14）：
1. 运行中无错误→显示。
2. STREAM_ERROR 到达→隐藏。
3. 终态助手错误已可见→隐藏。

## 3. 真实断言

- :15-20：运行中无错误 `shouldShowAgentRunningIndicator` toBe true。
- :22-28：STREAM_ERROR 已到 toBe false。
- :30-34：终态助手错误可见 toBe false。

## 4. 未覆盖与脆弱点

被测源不属 nb-117（测试归属分离）。mock 边界：SDKMessage fixture。`NOT_RUN`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 用例/主题如 §2 | 已证实 | 逐段读 |
| 通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 分支 | 用例 | 状态 |
| --- | --- | --- |
| 显/隐二路 | 3 用例 | covered |

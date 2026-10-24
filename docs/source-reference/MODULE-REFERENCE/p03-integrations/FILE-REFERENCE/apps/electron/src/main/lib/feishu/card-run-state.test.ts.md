---
path: apps/electron/src/main/lib/feishu/card-run-state.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4e56617a7921dbf5eb6f58165767607f9a2cd8d2
sha256: e79e4b05199ff77680d43530938e41410b26fb6949fbf4948ed267509b73a597
lines: 43
kind: test
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/feishu/card-run-state.test.ts

## 1. 测试目标

飞书流式卡片运行状态测试（`:18`）：被测 `createInitialState/reduce`（本批另篇）。mock 边界：无 mock——`assistant()` 工厂构造 `_partial` 累计快照（`:5-16`）。

## 2. 用例清单

1 describe、2 test：

1. `:19` 累计 partial 快照只保留最新内容不重复拼接（同 uuid 三次快照）。
2. `:34` 同一 assistant 的 final 快照替换最后一个 partial 而非追加。

## 3. 真实断言

`:26-31` blocks 长度 1+内容为最后一次快照全文+streaming true；`:40-41` blocks 长度 1+final 内容。

## 4. 未覆盖与脆弱点

未覆盖：tool_use/tool_result 链、result 终态/error 分支、markInterrupted/markIdleTimeout、thinking 累积、meta.model。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 用例锚点与断言文本 | 已证实 | `:18-42` |
| 运行结果 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| 快照替换核心语义 | §3 | covered |
| 工具/终态分支 | §4 | unknown（未覆盖） |
| 实际运行 | §5 | unknown（NOT_RUN） |

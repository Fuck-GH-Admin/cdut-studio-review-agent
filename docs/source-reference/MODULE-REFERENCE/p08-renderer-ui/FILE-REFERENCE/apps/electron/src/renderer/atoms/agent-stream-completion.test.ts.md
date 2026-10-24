---
path: apps/electron/src/renderer/atoms/agent-stream-completion.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f42dc312b9ff6774e5abe37c56851d025036a35f
sha256: 824003e4e456a8b3a130a70f1e84f1a17e519e29bd97102b39ba7d724f641989
lines: 35
kind: test
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/agent-stream-completion.test.ts

## 1. 测试目标

`@/lib/agent-stream-state-cleanup`（`AgentStreamState` 类型自 `./agent-atoms`，源均不属本批）：终态收敛与代次隔离。不运行（`NOT_RUN`）。

## 2. 用例清单

3 用例（:17/:28/:32），1 describe（:16）：
1. 匹配终态事件→清 running/stopping/未完工具（:17-26，toMatchObject）。
2. **旧代次完成不能动新 run**（:28-30，startedAt 300 vs 200→false）。
3. legacy 无 startedAt 忽略（:32-34）。

## 3. 真实断言

`:19-25`/`:29`/`:33`（toBe/toMatchObject）。

## 4. 未覆盖与脆弱点

被测实现属 lib 层（批外）；类型自 agent-atoms（批外）。`NOT_RUN`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 用例/断言如 §2-3 | 已证实 | 逐行读 |
| 通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 分支 | 用例 | 状态 |
| --- | --- | --- |
| 终态/代次隔离/legacy | #1-#3 | covered |

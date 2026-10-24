---
path: apps/electron/src/main/lib/agent-headless-runner-registry.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 367fe4d7058fa9a3b6fa3060c1d98a9b4a974f1c
sha256: f7b24583075aebcf96921abd989ef25777a04dd9c10357c538ac96f3e899493d
lines: 49
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-headless-runner-registry.test.ts

## 1. 测试目标

停止终态语义与 completion 单一路由转发。不运行（`NOT_RUN`）。

## 2. 用例清单

3 用例（:6/:10/:17），1 describe（:5）。
1. user 停止（:6-8）：`getAgentStopCompletionOptions('user')` toEqual `{stoppedByUser:true}`。
2. delegation_cancel（:10-15）：`{stoppedByUser:false, resultSubtype:'delegation_cancelled'}`。
3. 预标 cancelled 时 onComplete 跳过收尾但 renderer 仍收完整 payload（:17-48）：callbackPayloads 0（:46）、rendererPayloads toEqual `[[messages, opts]]`（:47）。

## 3. 真实断言

`:7`/`:11-14`/`:46-47`（toEqual/toHaveLength 如 §2）。

## 4. 未覆盖与脆弱点

未覆盖：runRegistered/stopRegistered 未初始化抛错、set 注入。mock 边界：假 callbacks/forward（记录式）。`NOT_RUN`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 用例/断言如 §2-3 | 已证实 | 逐行读 |
| 通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 分支 | 用例 | 状态 |
| --- | --- | --- |
| stop 语义二分支/转发单路由 | #1-#3 | covered |
| 未初始化抛错 | — | unknown |

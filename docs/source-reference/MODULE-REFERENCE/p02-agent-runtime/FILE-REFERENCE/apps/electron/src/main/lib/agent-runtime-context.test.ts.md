---
path: apps/electron/src/main/lib/agent-runtime-context.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3ba95cd3a3d51e1aba0ac0bc6512bc13f39c023e
sha256: 1f1e69a30a586cb9e58892cf56aeb979ba289f8c934f7e72b80ca1d0f32ade99
lines: 29
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-runtime-context.test.ts

## 1. 测试目标

`AgentRuntimeContextStore`：按需列出、非法输入忽略、clear 释放。不运行（`NOT_RUN`）。

## 2. 用例清单

3 用例（:5/:15/:22），1 describe（:4）。
1. list 过滤（:5-13）：`list(['terra-session'])` toEqual 精确快照（含 updatedAt 100）。
2. 非法 contextWindow（0）忽略（:15-20）：list []。
3. clear 后排除（:22-28）：list []。

## 3. 真实断言

`:10-12`/`:19`/`:27`（toEqual）。

## 4. 未覆盖与脆弱点

未覆盖：负数/NaN 输入。mock 边界：纯内存。`NOT_RUN`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 用例/断言如 §2-3 | 已证实 | 逐行读 |
| 通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 分支 | 用例 | 状态 |
| --- | --- | --- |
| list/非法/clear | #1-#3 | covered |

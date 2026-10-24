---
path: apps/electron/src/main/lib/agent-workspace-events.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3576a611353f90c6d6bd6308cb0f5973ee8c05c5
sha256: bff5674369cc2b9d2616a8b25f5aed8d4cd5761f6ae7fbc231ed15611c4ba1c6
lines: 30
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-workspace-events.test.ts

## 1. 测试目标

广播存活守卫与空列表安全。不运行（`NOT_RUN`）。

## 2. 用例清单

2 用例（:17/:27），1 describe（:16）；fixture `makeWindow`（:5-14）。
1. 只发存活窗口（:17-25）：alive 收 `[WORKSPACES_CHANGED]`、destroyed 收 []。
2. 空列表不抛（:27-29）：`not.toThrow()`。

## 3. 真实断言

`:23-24`/`:28`（toEqual/not.toThrow）。

## 4. 未覆盖与脆弱点

未覆盖：无。mock 边界：假窗口。`NOT_RUN`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 用例/断言如 §2-3 | 已证实 | 逐行读 |
| 通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 分支 | 用例 | 状态 |
| --- | --- | --- |
| 存活守卫/空列表 | #1/#2 | covered |

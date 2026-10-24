---
path: apps/electron/src/renderer/lib/agent-plan-mode.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d9da647e88e34c281992dc8b697564ea89ff8e59
sha256: 5235e40f420a2a59f4983885a27bc359436eab2228fea78b93ac16ecb3c8793c
lines: 42
kind: test
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/agent-plan-mode.test.ts

## 1. 测试目标

计划阶段解析与集合更新。不运行（`NOT_RUN`）。

## 2. 用例清单

6 用例（:5/:12/:16/:20/:28/:36），1 describe（:4）：
1. EnterPlanMode→进入（:5）。
2. **ExitPlanMode 不直接标记离开**（:12）。
3. 普通工具无变化（:16）。
4. 进入只增目标会话（:20）。
5. 离开只移除（:28）。
6. 无变化复用原集合（:36）。

## 3. 真实断言

- :5-10：EnterPlanMode toEqual {active:true, source:'tool'}。
- :12-14：ExitPlanMode toBeNull（不直退契约）。
- :16-18：普通工具 toBeNull。
- :20-26/:28-34：集合更新 toEqual 仅增/仅减目标会话。
- :36-40：无变化 toBe 原集合（引用复用）。

## 4. 未覆盖与脆弱点

mock 边界：纯函数。`NOT_RUN`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 用例/主题如 §2 | 已证实 | 逐段读 |
| 通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 分支 | 用例 | 状态 |
| --- | --- | --- |
| 解析/集合 | 6 用例 | covered |

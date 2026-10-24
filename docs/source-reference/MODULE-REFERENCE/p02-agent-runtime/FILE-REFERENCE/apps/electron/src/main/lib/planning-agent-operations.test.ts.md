---
path: apps/electron/src/main/lib/planning-agent-operations.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: fd8eabb0e329671c8fcf0a34f6600f910a1688ae
sha256: cef32baa0a76c139246a516b176cf4a5b568ef98356d6bdc0b90d992df8e8808
lines: 90
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/planning-agent-operations.test.ts

## 1. 测试目标

workspace 路由（本地 SQLite vs Team Server）、并发校验、双广播。不运行（`NOT_RUN`）。

## 2. 用例清单

5 用例（:49/:60/:69/:73/:84），1 describe（:48）。fixture：mock.module planning-manager(:20)/team-planning-service(:34)/planning-events(:41)，被测模块动态 import(:46)。
1. 本地 Todo 读写+Agent 操作广播（:49-58）。
2. 团队 Todo 走 Team Server 且不越工作区（:60-67）。
3. **更新缺 expectedUpdatedAt 拒覆盖**（:69-71，并发校验）。
4. 本地日程读写+广播（:73-82）。
5. 团队日程 Team Server+隔离（:84-88）。

## 3. 真实断言

各用例 toBe/toHaveBeenCalledWith/toEqual 级（路由目标与广播调用断言）。

## 4. 未覆盖与脆弱点

未覆盖：deletePlanningCalendarEvent 拒绝分支。mock 边界：mock 三个依赖模块（planning-manager/team-planning-service/planning-events），真实 operations 层。`NOT_RUN`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 用例/主题如 §2 | 已证实 | 逐行读 |
| 通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 分支 | 用例 | 状态 |
| --- | --- | --- |
| 本地/团队路由+并发校验 | #1-#5 | covered |
| delete 拒绝 | — | unknown |

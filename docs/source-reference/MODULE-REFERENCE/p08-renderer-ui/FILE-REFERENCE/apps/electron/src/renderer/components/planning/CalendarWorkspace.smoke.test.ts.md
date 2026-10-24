---
path: apps/electron/src/renderer/components/planning/CalendarWorkspace.smoke.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 42e9db647a8d8331ecb6345efe55541f816d8154
sha256: c3020859dbab396adf50e1378f0ceb8c2441514a8774482148243180e1979b97
lines: 80
kind: test
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/planning/CalendarWorkspace.smoke.test.ts

## 1. 测试目标

日程冒烟测试（describe `:38`，“已完成 todo 仍显示在日历——本次改动核心”）：验证 `buildWeekView` 对 completed/open/无 dueAt todo 的周视图归位。纯内存（周锚点 2026-08-03 当地时区周一）。本轮 `NOT_RUN`。

## 2. 用例清单

1 describe、**4 test**（`:38-79`）：

1. `:39-48` completed+dueAt（周二 14:00）→ 进入对应日期（id/status 断言）。
2. `:50-58` open+dueAt → 正常进入（无回归）。
3. `:60-66` 无 dueAt（open/completed 各一）→ **均不进周视图**（`toEqual([])`）。
4. `:68-79` 同日 open+completed → **互不覆盖**（两 id 都保留）。

夹具：`makeTodo`（`:17-30`，缺省 Todo 全字段）；`collectTodos`（`:32-37`，聚合 allDayTodos+timedSegments）。

## 3. 真实断言

- #1/#4 是“completed 不消失/不互斥”核心回归（本次改动口径）。
- #3 用 `toEqual([])` 全空断言。
- 周锚点固定（时间确定性）。

## 4. 未覆盖与脆弱点

**未覆盖**：`buildWeekView` 其余入参（日程/提醒数组传空）；跨周边界；时区非本地；CalendarWorkspace 组件 UI。

**脆弱点**：`collectTodos` 只聚 allDay+timed todo 两种槽。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 describe、4 test、纯内存 | 已证实 | `:38`；`grep -c test(`=4 |
| completed 保留/无 dueAt 不进 | 已证实 | `:39-79` |
| 组件 UI | 未知 | 未覆盖 |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 被测分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| completed 归位 | #1 | `:39-48` | covered |
| open 回归 | #2 | `:50-58` | covered |
| 无 dueAt | #3 | `:60-66` | covered |
| 同日共存 | #4 | `:68-79` | covered |

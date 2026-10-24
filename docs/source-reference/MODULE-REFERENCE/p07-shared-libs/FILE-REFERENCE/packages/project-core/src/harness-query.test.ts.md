---
path: packages/project-core/src/harness-query.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b26dbe080d87ef1b256656bb5b2633a2528b4736
sha256: 37e29f6e945b93fa153f7b4724919909cc6e30481f3aba97479deca91e4bfca2
lines: 59
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-47-20261023
reviewer: p07-shared-libs
status: authored
evidence: static
---

# packages/project-core/src/harness-query.test.ts

## 1. 测试目标

Harness 查询三函数：焦点选择优先级、blocked 事实、verify 仅显式标记。不运行（`NOT_RUN`）。

## 2. 用例清单

5 用例（:14/:23/:33/:46/:50），1 describe（:13）。fixture：`node()`（:5-7）/`graph()`（:9-11）。
1. in_progress 优先最旧（:14-21）：`toMatchObject({kind:'in_progress', task:{id:'running-earlier'}})`。
2. previous_focus 仅仍 ready（:23-31）：prior 给 'previous_focus'；missing 回退 'ready' 取 'other'。
3. 排除 failed/cancelled/循环，报 blocked（:33-44）：`kind:'blocked'`；`getHarnessBlockedTasks` ids `['waiting','cycle-a','cycle-b']`；unmetDependencies `[{id:'failed',status:'failed'}]`。
4. graphless 仅空图（:46-48）。
5. verify 仅显式标记+artifact 去重（:50-58）：`toEqual({taskId:'verify', artifacts:['dist/a.txt'], explicitCriteria:['bun test target','readback output'], required:true})`。

## 3. 真实断言

如 §2 各行（toMatchObject/toEqual）。纯函数直断言。

## 4. 未覆盖与脆弱点

未覆盖：previous_focus 依赖缺失态、blocked 空列表分支。mock 边界：纯 fixture。`NOT_RUN`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 用例/断言如 §2-3 | 已证实 | 逐行读 |
| 通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 被测函数 | 用例 | 状态 |
| --- | --- | --- |
| `selectHarnessFocus` | #1/#2/#3/#4 | covered |
| `getHarnessBlockedTasks` | #3 | covered |
| `getTaskVerificationContext` | #5 | covered |

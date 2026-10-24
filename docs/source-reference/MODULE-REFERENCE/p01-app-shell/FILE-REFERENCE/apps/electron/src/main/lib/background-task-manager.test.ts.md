---
path: apps/electron/src/main/lib/background-task-manager.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a5e4a17368e7899d605a6ba53a4352f9d000928d
sha256: 59401ae178042d7f2780930984292e0aa7effe5b6fbb59bcdf1273ebfd9a083d
lines: 38
kind: test
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/background-task-manager.test.ts

## 1. 测试目标

直接测试 `background-task-manager.ts` 的 `BackgroundTaskManager`（1 个 describe `:7`）：访问控制/阻塞查询/幂等停止。3 个 `test(`。

## 2. 用例清单

| # | 行 | Given-When-Then + 真实断言 |
| --- | --- | --- |
| 1 | `:8-20` | tmpdir 写输出文件+登记→`getOutput('s1') resolves.toMatchObject({output:'hello', isComplete:true, status:'completed'})`；跨会话 `getOutput('s2') rejects.toThrow('不存在或不属于当前会话')` |
| 2 | `:22-30` | running→30ms 后停→阻塞查询 `resolves.toMatchObject({isComplete:true, status:'stopped'})` |
| 3 | `:32-37` | 重复 markStopped→两次 `status toBe('stopped')`（幂等） |

## 3. 真实断言

`toMatchObject`/`toThrow`/`toBe`。真实 fs（tmpdir）；无 mock 框架。

## 4. 未覆盖

- readOutput 2MB 尾部截断；getOutput 30s 钳制；forgetSession/clear；upsert 合并保留分支。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 个 `test(`、断言如 §2 | 已证实 | 文件全读（38 行） |
| 跨会话拒绝断言 | 已证实 | 用例 1 |
| 实际执行结果 | 未知 | `NOT_RUN` |

## 6. 覆盖表

| 被测行为 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 访问控制/阻塞/幂等 | §2 | `:8-37` | covered |
| §4 边缘 | — | — | unknown |

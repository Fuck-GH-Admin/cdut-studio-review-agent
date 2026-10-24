---
path: apps/electron/src/main/lib/goal-session-service.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1979a7af7a740e3c924fa2f2522389e0519f6d22
sha256: 83e90342aa1e3a17201fa70922854a4b46d788576a4118fbed5125386f559099
lines: 175
kind: test
package: p02-agent-runtime
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/goal-session-service.test.ts

## 1. 测试目标

直接测试 `GoalSessionService` 的桥接语义：运行上下文、防伪完成、调度控制、恢复幂等、Todo 联动、权限闸。11 项（1 个 `test.each(['pi'])` + 10 个 `test(`），1 个 `describe('Goal 会话桥接')`（`:39`）。

不测试：controller 状态机内部（goal-controller.test 侧）。

## 2. 用例清单

夹具 `harness()`（`:7-37`）：内存 deps（messages/events/archives/todoWrites/saved 计数捕获）+ 可换 `run`/`busy`/`permissionError`。`tick()` 15ms 异步推进（`:5`）。

| # | 行 | 设置 | 动作 | 真实断言 |
| --- | --- | --- | --- | --- |
| 1 | `:40-57`（test.each 'pi'） | run 捕获 input | start | `:50` `agentRuntime` 'pi'；`:51` `isolatedRuntimeSession` `not.toBe(true)`；`:52` `suppressUserMessagePersistence` true；`:53` `permissionModeOverride` undefined；`:54` `goalRunId` `toBeString()`；`:55` 首消息 type 'user'；`:56` 状态 'completed' |
| 2 | `:59-69` | tool_result 文本含 `<goal_result>…假证据…` | start | `:67` 状态 `not.toBe('completed')`（文本协议不作报告） |
| 3 | `:71-79` | outcome stopped | start | `:77` `runs` `toBe(1)`；`:78` 状态 'stopped'（不再调度） |
| 4 | `:81-91` | 报告 complete + outcome failed | start | `:89` `not.toBe('completed')` |
| 5 | `:93-104` | 完成一轮后 restore ×2 | restore | `:102-103` 消息数/todoWrites 数不变（幂等） |
| 6 | `:106-117` | blocked 报告 | start | `:111` `blockedTodoId` 'todo'；`:113` blocked 事件数 >0；`:114` 全部事件 `blockedTodoId==='todo'` |
| 7 | `:119-127` | 两个 Goal | start ×2 | `:124` archives[0].id 旧 id；`:125` `history.length` >0 |
| 8 | `:129-142` | 空白证据/无终态两模式 | start ×2 | `:138` 状态 'failed'；`:139` `consecutiveFailures` `toBe(3)` |
| 9 | `:144-157` | blocked 后 clear | clear | `:153` get undefined；`:154` history[0].id；`:155` `blockedTodoId` 'todo'；`:156` todoWrites 末 `{id:'todo',status:'completed'}` |
| 10 | `:159-165` | deny('计划模式…') | start | `:162` `rejects.toThrow('计划模式')`；`:163` 消息 0；`:164` get undefined |
| 11 | `:167-174` | busy=true | start | `:172` `iteration` `toBe(0)`（不耗轮次） |

## 3. 真实断言

`toBe`/`toBeString`/`not.toBe`/`toMatchObject`/`toEqual`/`rejects.toThrow(文案)`/计数比较。无快照测试。

## 4. 未覆盖

- `update` 路径（validateGoalUpdatePatch 联动）。
- `stopAll`、`publishedRevision` 闸的直接断言（用例 6 间接覆盖不发旧快照）。
- `collectGoalRunUsage` 数值守卫（负值→0）。
- claude runtime 参数（test.each 仅 'pi'——原生 claude 分支未列）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 11 项断言如 §2（10 个 `test(` + 1 个 `test.each`） | 已证实 | 文件全读 |
| 防伪完成（用例 2/4/8）与调度控制（3/11） | 已证实 | 断言原文 |
| 实际执行结果 | 未知 | `NOT_RUN` |

## 6. 覆盖表

| 被测行为 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 上下文/控制输入隐藏 | §2 用例 1 | `:40-57` | covered |
| 文本协议不作报告 | §2 用例 2 | `:59-69` | covered |
| stopped 阻调度 | §2 用例 3 | `:71-79` | covered |
| 报告/终态双闸 | §2 用例 4/8 | `:81-91`/`:129-142` | covered |
| 恢复幂等 | §2 用例 5 | `:93-104` | covered |
| Todo 联动 | §2 用例 6/9 | `:106-117`/`:144-157` | covered |
| 归档 | §2 用例 7 | `:119-127` | covered |
| 权限闸 | §2 用例 10 | `:159-165` | covered |
| 忙时不耗轮次 | §2 用例 11 | `:167-174` | covered |
| §4 边缘 | — | — | unknown（未覆盖） |

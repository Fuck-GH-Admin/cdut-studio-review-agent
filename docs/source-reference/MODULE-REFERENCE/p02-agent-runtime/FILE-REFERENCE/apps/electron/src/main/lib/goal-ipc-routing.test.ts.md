---
path: apps/electron/src/main/lib/goal-ipc-routing.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 801c1399cbb85585c5b1e438245db8b64b42fcb3
sha256: 6fdbcc2810a2013cadf89332009d3672e32cf4031edcb4a5ed736658ec4281f3
lines: 77
kind: test
package: p02-agent-runtime
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/goal-ipc-routing.test.ts

## 1. 测试目标

**执行真实 IPC 注册源码**（`:5` 注释："模拟 Electron transport，验证主进程真实路由而非重复实现"）：从 `../ipc.ts` 按边界字符串抽取 Goal 注册片段（`:7-9`，`START_GOAL` 起至 `// ===== Agent 队列消息 =====` 止），Bun.Transpiler 转译后 `new Function` 注入 mock deps 执行。验证：sender guard 覆盖、Stop 与 Goal owner 的停机协调、内部审核会话保护、非法输入不触服务。5 个 `test(`，1 个 `describe('Goal IPC 控制路由')`（`:48`）。

不测试：真实 Electron ipcMain；goal-session-service 逻辑（mock）。

## 2. 用例清单

夹具 `harness(goalOwner)`（`:13-46`）：mock ipcMain 收集 handlers + `calls` 顺序记录；`assertSensitiveAgentIpcSender`→push 'guard'；`assertOrdinaryAgentSession` 对 'owned-review' throw（`:23-25`）；goalSessionService/feishuBridgeManager/stopAgentAndWait/isGoalRunActive 全 mock。**抽取失败即抛**（`:9`，注册边界不存在时测试自毁）。

| # | 行 | 设置 | 真实断言 |
| --- | --- | --- | --- |
| 1 | `:49-54` | — | invoke UPDATE_GOAL + GET_GOAL_HISTORY → `calls` `toEqual(['guard','update','guard','history'])` |
| 2 | `:55-59` | goalOwner=true | STOP_AGENT → `calls` `toEqual(['guard','mirror-stop','goal-stop'])`（只停明确目标） |
| 3 | `:60-64` | 'owned-review' | STOP_AGENT `rejects.toThrow('内部审核会话')`；`calls` `toEqual(['guard'])`（不中止后台） |
| 4 | `:65-69` | goalOwner=false | STOP_AGENT → `calls` `toEqual(['guard','mirror-stop','ordinary-stop','goal-stop'])`（普通运行+等待 Goal 都停） |
| 5 | `:70-76` | 非法输入 | START_GOAL('')/UPDATE_GOAL(null)/GET_GOAL_HISTORY(123) 全 `rejects.toThrow()`；`calls` `toEqual(['guard','guard','guard'])`（服务零调用） |

## 3. 真实断言

`toEqual`（调用顺序数组——**顺序即路由语义**）+ `rejects.toThrow(文案)`。独特手法：对真实 ipc.ts 源码片段执行（不是重实现）。

## 4. 未覆盖

- 其余 Goal 通道（PAUSE/RESUME/CLEAR）未列。
- `isGoalRunActive` 为 false 且无普通运行的 stop 分支细节。
- 抽取片段对 ipc.ts 重构的脆弱性（边界字符串耦合，`:7-8`）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 个 `test(`、断言如 §2 | 已证实 | 文件全读 |
| 真实源码执行手法 | 已证实 | `:6-11` |
| 实际执行结果 | 未知 | `NOT_RUN` |
| ipc.ts 该片段的完整 handler 集 | 未知 | ipc.ts 不在本批 |

## 6. 覆盖表

| 被测行为 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| guard 覆盖 | §2 用例 1/5 | `:49-54`/`:70-76` | covered |
| owner 停机协调 | §2 用例 2/4 | `:55-69` | covered |
| 内部会话保护 | §2 用例 3 | `:60-64` | covered |
| §4 边缘 | — | — | unknown（未覆盖） |

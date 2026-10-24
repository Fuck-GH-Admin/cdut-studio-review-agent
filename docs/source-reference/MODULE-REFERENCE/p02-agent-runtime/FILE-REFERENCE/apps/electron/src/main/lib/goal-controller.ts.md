---
path: apps/electron/src/main/lib/goal-controller.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1388454bed1555c8685e94e55d57a83f5f9f81ab
sha256: 8db75b2f186229091981dca070526415b9d00c84b29f23e92bbd2e34536bd3b1
lines: 345
kind: source
package: p02-agent-runtime
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/goal-controller.ts

## 1. 结论与边界

Goal **状态机与调度器**（单类 `GoalController`）：轮次调度、generation/epoch 围栏（fence）、deadline 预算闸、停止/暂停收敛、revision 单调发布。依赖注入（`GoalControllerDependencies:12-30`）：runTurn/stopTurn/时钟/调度器/定时器全部可换（测试即用可控时钟审计）。

不做的事：不碰消息/Todo/持久化（goal-session-service deps）；不裁决续跑逻辑（evaluateGoalContinuation）。

## 2. 导出与关键符号

`GoalController`（`:44-345`）唯一导出（class）。

**内部类型**：`TimerHandle:10`；`GoalControllerDependencies:12-30`（runTurn 携带 `onRuntimeSessionId` 回调、`stopTimeoutMs?`）；`Runtime:32-40`（state/schedule/deadline/**generation/scheduleEpoch**/activeRun/stopping）；`RETRY_DELAY_MS=250:42`。

**公开 API**：`get:63`/`list:64`、`restore:67-83`（hydrate，运行中拒重水合 `:68`，active/stopping 降级 paused/app_restart `:73-74`，清残留 owner `:75`）、`start:85-100`（同会话互斥：运行中 throw `:87`、未完成 throw `:88`）、`pause:102-104`/`stop:106-108`（`requestStop` 二态）、`resume:110-125`（5 态白名单 `:113`、预算不足→budget_limited+throw `:115-118`、清 failures `:121`）、`update:128-145`（owner 空闲 + 严格预算校验 `:133`）、`patch:147-153`（blockedTodoId 专用）、`clear:155-162`（运行中拒 `:158`，emit cleared 终态）、`stopAll:164-174`（进程退出：active→paused/app_restart）。

**私有**：`requestStop:176-191`（generation 围栏 `:179`、stopping→目标态收敛 `:189` 三条件）、`waitForStop:193-203`（stopTurn 与 `stopTimeoutMs`（默认 5s `:60`）竞速）、`scheduleNext:205-214`（**scheduleEpoch 围栏** `:209`）、`runTurn:216-258`（守卫 `:217`、canRun 忙→250ms 重排 `:218`、预算闸 `:219-220`、deadline 定时器 `:228-231`、异常→finishTurn failed `:253-257`）、`finishTurn:260-323`（elapsedMs 净执行累计 `:264-265`、fence 丢弃迟到结果 `:273-278`、`evaluateGoalContinuation` 裁决 `:279-288`、deferred 回退 iteration/elapsed `:290-295`、history 截 `GOAL_HISTORY_LIMIT` `:313`、continue→再排 `:322`）、`assertOwnerFree:325`、`transition:326-330`、`require:331-335`、`cancelPending:336-340`、`emit:341-344`（revisions 记账）。

## 3. 内部逻辑与关键流程

**围栏体系**（防并发/迟到污染）：`generation`（生命周期代数：start/resume/stop 递增）+ `scheduleEpoch`（调度批次）+ `activeRun.runId`（运行实例）三层判等（`:209`/`:217`/`:229`/`:241`/`:254`/`:261`/`:273`）。迟到的 turn 结果/deadline/回调全部被围栏丢弃（finishTurn `:273-278` 只清 owner 不改状态机）。

**预算与时长**：`goalBudgetReason` 前置闸（`:219`）+ deadline 定时器后置兜底（`:228-231`，到点 requestStop budget_limited）；`elapsedMs` 用 `baseElapsedMs + 本轮净时长`（`:264-265`），deferred 回退不计时（`:291`）。

**停止收敛**：`requestStop` 置 stopping→cancelPending→无 run 直接过渡，有 run 则 stopping 态等 `waitForStop`（5s 超时也算收敛）→三条件核验后过渡目标态（`:189`）。

## 4. 调用者与调用链

`goal-session-service`（构造注入）；出向：`./goal-loop` 5 符号（`:2-7`）、`@profer/shared` 类型。

## 5. 数据 I/O、读写与副作用

无 I/O；副作用=emit（onStateChange 回调）与定时器/调度器（默认 setTimeout/clearTimeout `:56-59`）。

## 6. 分支、失败、取消与恢复

- **deferred**（`:290-295`）：iteration 回退、elapsed 不计、250ms 后重排——"未获宿主所有权"的延后恢复。
- **runTurn 异常**（`:253-257`）：围栏内→finishTurn(outcome:'failed') 计失败。
- **stop 超时**（`waitForStop`）：5s 后仍收敛；owner 未释放期间 resume/clear/update 被 `assertOwnerFree` 拒（测试 `:274-298`）。
- **restore 运行中**（`:68`）：throw 防丢活跃 owner。

## 7. 权限与权威状态

- **owner 释放权威**（`:325`）：activeRun 在场即锁 update/clear/resume。
- **revision 单调权威**（`:341-343`）：每次 emit 更新 revisions；start 用 `max+1`（`:91`）保同会话跨代单调。
- **resume 白名单**（`:113`）：仅 paused/blocked/failed/stopped/budget_limited 5 态。
- 进程退出不判死刑（stopAll→paused/app_restart，`:170`）。

## 8. 修改影响面

围栏条件改动影响并发安全（大量测试锁定）；`stopTimeoutMs` 默认 5s；`RETRY_DELAY_MS` 250ms；history 截尾联动 GOAL_HISTORY_LIMIT；deps 接口是 session-service 契约。

## 9. 测试证据

直接测试 `goal-controller.test.ts`（26 项：25 `test(` + 1 `test.each` 3 例）：调度循环/runtimeSession 复用/终态后开新/不隐式替换/历史与契约落账/restore 降级/stopAll 暂停（`:12-170`）+ 审计边界 16 项（可控时钟围栏语义，`apps/electron/src/main/lib/goal-controller.test.ts:201-464`）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 单类全成员、围栏体系、预算闸 | 已证实 | 文件全读 |
| deferred 不计时/回退 iteration | 已证实 | `:290-295` + 测试 `:254-259` |
| stop 超时 5s 收敛 | 已证实 | `:60`、`:193-203` + 测试 `:274-298` |
| revision 单调 | 已证实 | `:91`、`:341-343` + `apps/electron/src/main/lib/goal-controller.test.ts:355-366` |
| 真实 setTimeout 行为 | 未知 | 测试全用注入时钟（诚实边界） |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全 API + 私有方法 | §2 | covered |
| 围栏/预算/停止收敛 | §3 | covered |
| owner/revision 权威 | §7 | covered |
| 26 测试项 | §9 | covered |

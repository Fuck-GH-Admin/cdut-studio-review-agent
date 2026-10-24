---
path: apps/electron/src/main/lib/goal-controller.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c0f9262f70d01852fe1cf66629b0c247f83386f6
sha256: 390d95586522679f2e825079fe02f0dd7b698b8a6d1a07be7737df71ef7f28c9
lines: 465
kind: test
package: p02-agent-runtime
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/goal-controller.test.ts

## 1. 测试目标

直接测试 `GoalController`（goal-controller.ts）：调度循环、runtimeSessionId 复用、同会话互斥、历史/契约落账、restore 降级、stopAll 暂停；以及**审计边界**围栏语义（generation/scheduleEpoch/owner 迟到污染防护、预算闸、停止收敛）。26 项（25 个 `test(` + 1 个 `test.each(['blocked','failed','stopped'])` 3 例），2 个 describe（`:11` 基础 7 项、`:200` 审计边界 19 项）。全部注入调度/时钟，不调真实 runtime。

## 2. 用例清单

**describe 1（`:11-171`）**：`deferred()` Promise 工厂（`:5-9`）；调度注入 `queueMicrotask`。

| # | 行 | 真实断言 |
| --- | --- | --- |
| 1 | `:12-30` | `runs` `toEqual(['run-1'])` → continue 后再跑（length>1）→ stop 后 status 'stopped' |
| 2 | `:32-57` | 首轮 `runtimeSessionIds[0]` undefined；`onRuntimeSessionId` 回报后 state `toMatchObject{runtimeSessionId:'goal-runtime-1',runtimeSessionFile:'…jsonl'}`；次轮 `runtimeSessionIds[1]` 复用 |
| 3 | `:58-80` | completed 后可开新（goals `toEqual(['第一个目标','第二个目标'])`） |
| 4 | `:82-105` | 二次 start throw '正在运行'、`runCount` 1 |
| 5 | `:107-124` | history `toHaveLength(1)` + `[0]` `toMatchObject{iteration:1,status:'complete',…usage:{totalTokens:15}}` + `usage` `toEqual` |
| 6 | `:126-155` | restore 把 active 降 'paused'/'app_restart'，completed 保留；paused 可 resume 跑起来 |
| 7 | `:157-170` | stopAll → 'paused'/'app_restart' |

**describe 2「审计边界」（`:200-465`）**：`controlledGoalHarness`（`:174-198`）可控时钟/调度/定时器 + events 捕获。

| # | 行 | 真实断言 |
| --- | --- | --- |
| 8 | `:201-207` | restore 不 emit（events `toEqual([])`）且 stopping 降 paused |
| 9 | `:209-216`（test.each 3 例） | blocked/failed/stopped 均不可被 start 替换（rejects）、resume 后 iteration 1 |
| 10 | `:218-230` | 预算耗尽 resume `rejects.toThrow('预算')` 且 'budget_limited'、runs 0；update 扩预算后恢复可跑 |
| 11 | `:232-240` | 最后轮 complete 优先（status 'completed'）且 `elapsedMs` `toBe(5)`（暂停时间不计） |
| 12 | `:242-252` | canRun 忙：iteration 0 + delay>0；空闲后 iteration 1 |
| 13 | `:254-259` | deferred `toMatchObject{iteration:0,consecutiveFailures:0,history:[],elapsedMs:0}` |
| 14 | `:261-272` | 异常 3 轮→'failed'/iteration 3/consecutiveFailures 3/history 3 条；stopped 后 `scheduled.size` 0 |
| 15 | `:274-298` | stop 超时（5s 定时器触发）→'stopped'，owner 未释放期间 resume/clear/update 全 throw；迟到 turn 结果不改变状态；clear 后新 start 不受旧 stop 干扰（id/revision 不变） |
| 16 | `:300-316` | stopTurn 抛错仍收敛 'paused'；暂停后 `report('late')` 不改 revision；resume 成功 |
| 17 | `:318-333` | 旧 pause await 晚返回不把 resumed Goal 重新暂停（最终 'active'） |
| 18 | `:335-343` | update 严格校验：NaN/1.5/空 goal 全 throw；resume 后 consecutiveFailures 0 |
| 19 | `:345-353` | 活跃 owner 时 restore throw |
| 20 | `:355-366` | 旧 scheduler 回调重复触发无效（iteration 1）；revision 跨替换单调（`next.revision` > 前值） |
| 21 | `:368-381` | 同 callback 重复触发不并发（count 1、iteration 1） |
| 22 | `:383-395` | hydrate 清残留 owner（activeRunId undefined）；迟到 deadline 不停恢复后的运行（'active'） |
| 23 | `:397-411` | token 预算耗尽→'budget_limited'（usage 记账）；扩容后 completed 且 `usage.totalTokens` 20 |
| 24 | `:413-431` | stop 迟到返回在 clear/新 start 后不发旧状态（events 长度不变、id 为新） |
| 25 | `:433-449` | deadline 触发带 runId 的取消（`stopped` `toEqual([runId])`）→'budget_limited'、`elapsedMs` 精确 2h |
| 26 | `:451-464` | 旧 runtime callback/旧 scheduler callback 不污染替换后的 Goal（id/iteration 0/runtimeSessionId undefined） |

## 3. 真实断言

`toEqual`/`toMatchObject`/`toBe`/`toBeString`/`toThrow`/`rejects.toThrow`/`toHaveLength`/计数比较。无快照测试；全注入时钟（诚实边界：不测真实 setTimeout）。

## 4. 未覆盖

- `update` 合法路径的 emits 细节。
- `patch`（blockedTodoId）路径。
- `stopTimeoutMs` 自定义值。
- schedule 的真实时序行为（queueMicrotask 代替）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 26 项断言如 §2（25 个 `test(` + 1 个 `test.each`） | 已证实 | 文件全读 |
| 围栏语义（15/17/20/21/22/24/26）锁定 | 已证实 | 断言原文 |
| 实际执行结果 | 未知 | `NOT_RUN` |

## 6. 覆盖表

| 被测行为 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 调度/互斥/历史/restore/stopAll | §2 用例 1-7 | `:12-170` | covered |
| 围栏（迟到/重复/替换） | §2 用例 15-26 | `:274-464` | covered |
| 预算闸/停止收敛/deferred | §2 用例 10-14 | `:218-272` | covered |
| §4 边缘 | — | — | unknown（未覆盖） |

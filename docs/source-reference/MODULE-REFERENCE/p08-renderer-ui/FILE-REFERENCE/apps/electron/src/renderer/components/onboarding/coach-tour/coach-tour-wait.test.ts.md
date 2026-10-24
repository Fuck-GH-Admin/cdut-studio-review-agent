---
path: apps/electron/src/renderer/components/onboarding/coach-tour/coach-tour-wait.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0d48137ec6aa537441546dafcdcd5a1a4b86e3e5
sha256: 81fe44c8ee29001f8f2c7a8d16646cf7862fcf13e0f260879198280e0cbc13e3
lines: 74
kind: test
package: p08-renderer-ui
author: docs-r07-author-extra-01-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/onboarding/coach-tour/coach-tour-wait.test.ts

## 1. 测试目标

`coach-tour-wait`（同批深读）三个纯函数的判定语义：Agent 回合状态转移（先 running 后 idle、后台抑制、终态稳定）、快发快回基线兜底（Agent/桌宠）不误判。框架 `bun:test`；无 mock、无 hook 测试。

## 2. 用例清单

用例计数：`test(` **13**（reduceAgentTurn 5：`:9,13,17,21,25`；agentWaitShouldCompleteByBaseline 5：`:33,39,45,51,55`；petWaitShouldCompleteByBaseline 3：`:63,67,71`），`it(` 0——与源码计数一致。

| # | describe | 用例 | 依赖顺序 |
| --- | --- | --- | --- |
| 1 | reduceAgentTurn | 未观察到 running 时 idle 不得判定完成（`:9-11`） | 独立 |
| 2 | reduceAgentTurn | 观察到 running 后进入运行态（`:13-15`） | 独立 |
| 3 | reduceAgentTurn | running 回 idle 且无后台任务→完成（`:17-19`） | 独立 |
| 4 | reduceAgentTurn | 后台任务仍在飞不得判定完成（`:21-23`） | 独立 |
| 5 | reduceAgentTurn | 完成态保持稳定（`:25-27`） | 独立 |
| 6 | agent 基线 | startedAt 前移→完成（`:33-37`） | 独立 |
| 7 | agent 基线 | 同回合内容增长→完成（`:39-43`） | 独立 |
| 8 | agent 基线 | 未发送（无变化）不误判（`:45-49`） | 独立 |
| 9 | agent 基线 | 缺失流式状态不误判（`:51-53`） | 独立 |
| 10 | agent 基线 | 回合更新但内容更短仍完成（`:55-59`） | 独立 |
| 11 | pet 基线 | 晚于基线的完成时间→完成（`:63-65`） | 独立 |
| 12 | pet 基线 | 完成时间相同不误判（`:67-69`） | 独立 |
| 13 | pet 基线 | 从未完成（null）不误判（`:71-73`） | 独立 |

装置：`baseline = {startedAt: 1000, contentLen: 500}`（`:31`）。

## 3. 真实断言

（逐条引用 expect 行）

1. `reduceAgentTurn('awaiting-send', false, false)` `toBe('awaiting-send')`（`:10`）。
2. `('awaiting-send', true, false)` `toBe('running')`（`:14`）。
3. `('running', false, false)` `toBe('done')`（`:18`）。
4. `('running', false, true)` `toBe('running')`（`:22`）。
5. `('done', true, false)` `toBe('done')`（`:26`）。
6. `agentWaitShouldCompleteByBaseline(baseline, {startedAt:2000, contentLen:300})` `toBe(true)`（`:35-36`）。
7. `(baseline, {startedAt:1000, contentLen:800})` `toBe(true)`（`:41-42`）。
8. `(baseline, {startedAt:1000, contentLen:500})` `toBe(false)`（`:47-48`）。
9. `(baseline, {})` `toBe(false)`（`:52`）。
10. `(baseline, {startedAt:3000, contentLen:10})` `toBe(true)`（`:57-58`）。
11. `petWaitShouldCompleteByBaseline(1000, 2000)` `toBe(true)`（`:64`）。
12. `(1000, 1000)` `toBe(false)`（`:68`）。
13. `(1000, null)` `toBe(false)`（`:72`）。

## 4. 未覆盖与脆弱点

- 未覆盖：`useCoachTourWait` hook 本体（五 effect/轮询/超时表）、`backgroundWaiting` 在基线兜底中的组合、phase='running' 的基线路径。
- 脆弱点：基线语义以「进入步骤时刻」为锚（用例 6/7/10 刻画三种时序），若 hook 的基线快照时机改变，纯函数用例仍绿但整体行为可能回归——需集成验证（NOT_RUN）。
- 纯函数测试，无真实 Agent/桌宠交互。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 13 test/0 it 计数 | 已证实 | 全文件 `test(`/`it(` 机械计数 |
| 断言逐条如 §3 | 已证实 | `coach-tour-wait.test.ts:10-72` |
| 无 mock/纯函数 | 已证实 | 全文仅 import `bun:test` 与被测函数（`:1-6`） |
| 测试通过与否 | 未知 | NOT_RUN（本轮未执行 bun test） |
| hook 集成行为 | 未知 | 无用例（§4） |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `reduceAgentTurn` 五态 | §2/§3 | 9-27 | covered |
| `agentWaitShouldCompleteByBaseline` 五态 | §2/§3 | 33-59 | covered |
| `petWaitShouldCompleteByBaseline` 三态 | §2/§3 | 63-73 | covered |
| `useCoachTourWait` hook | §4 | — | unknown |
| 运行结果 | §5 | — | unknown（NOT_RUN） |

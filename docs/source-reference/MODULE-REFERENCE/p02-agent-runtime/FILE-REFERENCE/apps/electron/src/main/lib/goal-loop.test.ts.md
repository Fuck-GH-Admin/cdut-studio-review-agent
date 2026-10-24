---
path: apps/electron/src/main/lib/goal-loop.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d7d12152a0919e99f818c2f9d0bd68dbba55c4bb
sha256: 6a159fe7cccc2254cd1bc242e72a876ef5baabfc0f4daa9710d5866d6608cd19
lines: 165
kind: test
package: p02-agent-runtime
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/goal-loop.test.ts

## 1. 测试目标

直接测试 goal-loop.ts 8 个导出：命令/契约解析、prompt 组装、续跑裁决全分支、协议解析防欺骗、进程退出语义。16 个 `test(`，1 个 `describe('goal loop')`（`:13`）。纯函数直调，无 mock/无 IO。

## 2. 用例清单

| # | 行 | 被测 | 真实断言 |
| --- | --- | --- | --- |
| 1 | `:14-22` | parseGoalCommand | 7 个 `toEqual`（start/status/pause/resume/stop/clear/not_goal） |
| 2 | `:24-31` | 契约行标记 | `toEqual{type:'start', contract:{verification,constraints,stopWhen}}`（@verify/@constraint/@stop 三行） |
| 3 | `:33-37` | 非法命令 | `/goal`→'invalid'；`/goal maybe` `toEqual{type:'invalid',reason:'未知的 Goal 命令：maybe'}`；只有标记无目标→'invalid' |
| 4 | `:39-53` | buildGoalIterationPrompt | `toContain` ×9（目标/verify/stop/第 3 轮/上轮摘要/update_goal/逐项/无进展）+ `not.toContain('<goal_result>')`（协议示例不出现在 prompt）+ `not.toContain('预算耗尽前务必收敛')`（文案已换） |
| 5 | `:55-59` | 缺契约 prompt | `toContain('验收标准')`（要求拟定验收面） |
| 6 | `:61-65` | pauseGoalForProcessExit | `toMatchObject{status:'paused',stopReason:'app_restart',updatedAt:2000}` |
| 7 | `:67-75` | parseGoalIterationResult | 混杂文本取真报告 `toEqual{status:'complete',summary:'已交付',evidence:['bun test 全绿']}` |
| 8 | `:77-86` | 坏块/示例跳过 | status 'continue' + summary 含 '解析失败'；无标记 `toEqual{status:'continue',summary:'没有任何标记',evidence:[]}` |
| 9 | `:88-100` | createGoalState | `toMatchObject{status:'active',iteration:0,limits:DEFAULT_GOAL_LIMITS}` + id `toBeString()` |
| 10 | `:102-109` | 续跑 | `toEqual{action:'continue',consecutiveFailures:0}` |
| 11 | `:111-118` | complete 有证据 | `toEqual{action:'complete',consecutiveFailures:0}` |
| 12 | `:120-139` | 失败/超时 | `action` 'failed'（连续失败到顶）；`limit_reached`（超 maxDurationMs） |
| 13 | `:141-145` | 最后轮优先 | 有证据 complete→'complete'；空白证据→'limit_reached'（不冒充） |
| 14 | `:147-152` | token 耗尽/stopped/deferred | 'limit_reached'/'stopped'/`toEqual{action:'deferred',consecutiveFailures:2}`（失败计数不因 deferred 改变） |
| 15 | `:154-158` | 失败记账 | 无证据 continue→'failed'；complete+空证据→'failed' |
| 16 | `:160-164` | stopGoalForProcessExit | `toMatchObject{status:'stopped',stopReason:'process_exit'}` |

（共 16 个 `test(`，上表逐一对位；部分用例含多断言。）

## 3. 真实断言

`toEqual`（全等）/`toMatchObject`/`toContain`/`not.toContain`/`toBe`/`toBeString`。无快照测试。

## 4. 未覆盖

- `parseGoalIterationResult` 的尾 2000 字截断长度。
- `buildGoalIterationPrompt` token 预算行/近 3 轮轨迹行的逐字输出。
- `goalBudgetReason` 三分支独立断言（经裁决间接覆盖）。
- 契约字段超长/多行的解析边界。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 16 个 `test(`、断言如 §2 | 已证实 | 文件全读 |
| 协议防欺骗（用例 7/8）与防伪完成（13/15） | 已证实 | 断言原文 |
| 实际执行结果 | 未知 | `NOT_RUN` |

## 6. 覆盖表

| 被测行为 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 命令/契约解析 | §2 用例 1-3 | `:14-37` | covered |
| prompt 组装 | §2 用例 4/5 | `:39-59` | covered |
| 进程退出双语义 | §2 用例 6/16 | `:61-65`/`:160-164` | covered |
| 协议解析 | §2 用例 7/8 | `:67-86` | covered |
| 状态工厂 | §2 用例 9 | `:88-100` | covered |
| 续跑裁决全分支 | §2 用例 10-15 | `:102-158` | covered |
| §4 边缘 | — | — | unknown（未覆盖） |

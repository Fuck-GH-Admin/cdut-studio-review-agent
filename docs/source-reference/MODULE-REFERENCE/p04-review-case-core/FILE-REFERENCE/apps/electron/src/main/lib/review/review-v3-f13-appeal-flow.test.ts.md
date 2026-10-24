---
path: apps/electron/src/main/lib/review/review-v3-f13-appeal-flow.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: cb9c24cbaef8f1a8aa60df08b0592e2b314f0380
sha256: 6ebe126a01c07cec15cf87354b853ab998ac24ec7dee32248722e56da31a2e81
lines: 114
kind: test
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-f13-appeal-flow.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

验证 F13 独立申诉业务提案：提交同时规划独立任务与复审阶段且原决定不变；身份未绑定/原决定人/伪造 agent 来源承办一律拒绝；维持原判关闭任务但不生成第二业务决定；新证据必须经核验 Run、改判追加独立人新决定且保留原决定；撤回限原申诉人并保留任务历史；取消任务/结案申诉不可重复复审。

## 2. 用例清单

共 6 个 `it(`（`review-v3-f13-appeal-flow.test.ts:38-113`，单一 `describe`）。夹具（`:7-35`）：`student`/`originalReviewer`/`independent` 三 actor；`finalDecision`（`finality:'final'`）；`decidedCase()`（`stage:'decided'`、`submitter` 绑定 student、`doc-1` active、`revision:4`）；`submittedCase(evidence)` 先真实调 `planF13AppealSubmission` 组装在途案卷。

| # | 用例（行） | 动作 | 真实断言 |
| --- | --- | --- | --- |
| 1 | 申诉提交同时规划独立任务与复审阶段，原决定保持不变（`:39`） | `planF13AppealSubmission`（statement 带空白） | `statement` 去空白；`appeal.reviewTaskId===reviewTask.id`；`assigneeActorId===independent.actorId`；`assigneeRole==='reviewer'`；`caseStage==='awaiting-review'`；`decisions` `toEqual([finalDecision])` |
| 2 | 不允许身份未绑定、原决定人或伪造学校角色承办申诉（`:52`） | actorId 换人；reviewer=原决定人；`actorSource:'agent'`；删 submitter | 四次 `toThrow`：`'提交人'`/`'原决定人'`/`'Main 核实'`/`'身份未绑定'` |
| 3 | 维持原判会关闭复审任务但不生成第二个业务决定（`:65`） | `planF13AppealReview` maintain | `resolution==='maintain-original'`；`status==='upheld'`；`amendment` `toBeUndefined()`；`tasks[0].status==='completed'`；`caseStage==='decided'`；`summary` 含 `'核验事实'` |
| 4 | 新证据必须核验；改判追加独立人的新决定并保留原决定（`:78`） | 缺 `verifiedRunId`；未指派 reviewer；正常 amend | `toThrow('新证据')`；`toThrow('未指派')`；`amendment.amendsDecisionId===finalDecision.id`；`basedOnRunId==='run-2'`；`appeal.reviewDecisionId==='decision-2'`；`decisions` `toEqual([finalDecision])` |
| 5 | 撤回只能由原申诉人进行，保留原决定和复审任务历史（`:91`） | 他人撤回；本人撤回 | 他人 `toThrow()`；`status==='withdrawn'`；`tasks[0].status==='cancelled'`；`caseStage==='decided'`；聚合内 `appeals[0].status` 仍 `'submitted'`（不改原对象）；`decisions` 不变 |
| 6 | 被取消的任务或已经关闭的申诉不能重复复审（`:102`） | 任务置 cancelled；申诉置 withdrawn | `toThrow('有效的独立复审任务')`；`toThrow('已结案')` |

## 3. 真实断言

逐条见上表（`:18-22,30-35,44-48,56-61,67-72,79-85`）。mock 边界：聚合/actor 内存对象（`as unknown as CaseAggregateV2`）；`planF13*` 与 T05 层均为真实纯函数；无 IO。

## 4. 未覆盖与脆弱点

未覆盖：`afterClosingAppeal` 多在途申诉、round 累计、ID 冲突分支、`assertTrustedHuman` 空 actorId。错误断言为子串（`'提交人'`/`'Main 核实'` 等），文案改动会误报。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 个用例 | 已证实 | `grep it(`；`:39,52,65,78,91,102` |
| 原决定不变（三处断言） | 已证实 | `:222,261,272` |
| 独立性/绑定拒绝 | 已证实 | `:52-60` |
| 新证据核验门槛 | 已证实 | `:78-80` |
| 撤回不改原对象 | 已证实 | `:71` |
| 多在途/round 分支 | 未知 | 无用例 |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 提交规划 | 1 | 39-51 | covered |
| 四路拒绝 | 2 | 52-63 | covered |
| 维持原判 | 3 | 65-76 | covered |
| 新证据+改判 | 4 | 78-89 | covered |
| 撤回 | 5 | 91-100 | covered |
| 不可重复复审 | 6 | 102-113 | covered |
| 多在途/round | 无 | — | unknown |

---
path: apps/electron/src/main/lib/review/review-v3-t05-main-service.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a62d6e3c4cb18c0d5edc2eec4e31b573f0b5c16c
sha256: feba623e8127f650172fff68ae0b32dee98aa14b1aa1df75db862e99f7f37301
lines: 115
kind: test
package: p04-review-case-core
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-t05-main-service.test.ts

## 1. 测试目标

T05 可信阶段事务的边界测试（文件头 `:1`）：渲染层只能声明角色、actor 由 Main 派生且不提权；技术预审/CanonicalPlan 不走业务阶段；无 Run/待确认/执行失败/未结补件的准备度；有效处置结掉待确认但不掩盖其它阻断；旧 Run 处置不沿用；RUN-05 partially-completed 不得通过阶段；RUN-07/02 诊断 Run 隔离。被测：`review-v3-t05-main-service.{deriveT05LocalActor,t05DecisionReadiness,isLocalBusinessCase,t05ActionEligibility,isT05DiagnosticRun}`（内存夹具，不落盘）。

夹具（`:15-21`）：`aggregate(overrides)` 合成对象（`caseV2` 含 `id:'case-t05', revision:3, stage:'submitted'`），`as never` 断言；run 对象手工构造。`PROFER_CONFIG_DIR` 临时目录声明在 `:7-9`（实际无文件读写）。本轮 `NOT_RUN`：未执行测试。

## 2. 用例清单

1 个 describe、**10 个 test**：

| # | test 行 | 设置/动作 | 断言 |
| --- | --- | --- | --- |
| 1 | `:24-29` | `deriveT05LocalActor` 三态 | `undefined→actorId:'local-reviewer'`；`{role:'teacher'}→role:'teacher'`；`{role:'superadmin'}→role:'reviewer'`（不提权） |
| 2 | `:31-35` | `isLocalBusinessCase` | 无计划 `true`；`d2RuntimePlan` `false`；`canonicalPlan` `false` |
| 3 | `:37-39` | `t05DecisionReadiness(aggregate, undefined)` | `toMatchObject({readiness:'blocked'})` |
| 4 | `:41-51` | checks：compliant + awaiting-confirmation + execution-failed | `readiness:'blocked'`；`blockers.length>=2`（两类都报） |
| 5 | `:53-59` | supplements `[{status:'responded'}]` | `readiness:'blocked'`；blockers join 含“补件” |
| 6 | `:61-77` | dispositions：c1 `human-confirmed-compliant`、c2 `supplement-requested`；checks c1 awaiting-confirmation、c2 awaiting-supplement、c3 execution-failed | `blocked`；blockers 含“待确认或待补件”与“执行失败” |
| 7 | `:79-85` | 处置 `runId:'run-old'`、run 为 `run-new` | `readiness:'blocked'`（旧处置不结新 Run 的待确认） |
| 8 | `:87-93` | run completed + `coverage.plannedChecks:1` + 1 compliant | `readiness:'ready'` |
| 9 | `:95-107` | `status:'partially-completed'` + `inputManifest.hash:'h'` + 覆盖齐 + compliant | `readiness:'ready'` 但 `allowed['stage-pass']===false`；reasons join 含“完整结束”；`allowed['return-for-supplement']===true` |
| 10 | `:109-114` | `isT05DiagnosticRun` | `run-tpl-1:true`、`run-diag-1:true`、`run-pi-1:false`、`run@rev3:true` |

## 3. 真实断言

- #1 的 `superadmin` 降级是“绝不按渲染层自称提权”的直接断言（`:28`）。
- #4 断言 `blockers.length>=2` 而非精确计数——防实现合并文案导致漏报（`:50` 注释“必须同时报出两类阻断”）。
- #6 断言两种 blocker 文案并存：`human-confirmed-compliant` 只结 c1，`supplement-requested` 不算 resolving（c2 仍“待确认或待补件”），c3 仍“执行失败”。
- #9 的 `allowed['return-for-supplement']===true` 是“不能通过≠不能退回”的边界断言（`:105-106` 注释）。
- #10 断言四类 run id 的诊断判定（`run@rev` 占位也是诊断）。

## 4. 未覆盖与脆弱点

**未覆盖**：`readT05StageCapability`、`recordT05StageDecision`、`registerT05LocalBusinessConfirmation`、`readT05TaskSummary`（业务模式/确认登记在 `review-v3-t05-business-mode.test.ts`）；`partially-read`/unread 文档阻断；`effectiveRuleIds` 覆盖缺失（business-mode 测试 #10）；`not-executed`；`return-to-previous-stage` 的 runReasons。

**脆弱点**：run 夹具的 `checks` 字段高度裁剪（无 `ruleId`/`target`），依赖实现的可选字段容忍；#4/#6 的 blockers 文案子串断言（“待确认或待补件”“执行失败”“补件”“完整结束”）；`as never` 断言绕过类型检查。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 describe、10 test、纯内存 | 已证实 | `:23`；无 saveRunV2/fs 读写 |
| 角色不提权 | 已证实 | `:24-29` |
| CanonicalPlan 无确认即非业务（经 `isLocalBusinessCase`） | 已证实 | `:31-35` |
| 多类阻断并报、不互相掩盖 | 已证实 | `:41-77` |
| 旧 Run 处置不沿用 | 已证实 | `:79-85` |
| RUN-05 partially-completed 只能拒绝/退回 | 已证实 | `:95-107` |
| 诊断 Run 隔离 | 已证实 | `:109-114` |
| 写路径（capability/decision） | 未知 | 未覆盖 |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 源函数/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| `deriveT05LocalActor` | #1 | `:24-29` | covered |
| `isLocalBusinessCase` | #2 | `:31-35` | covered |
| `t05DecisionReadiness` 无 Run | #3 | `:37-39` | covered |
| 待确认/执行失败 | #4 | `:41-51` | covered |
| 未结补件 | #5 | `:53-59` | covered |
| 处置 resolving 语义 | #6 | `:61-77` | covered |
| 处置 runId 绑定 | #7 | `:79-85` | covered |
| ready 路径 | #8 | `:87-93` | covered |
| `t05ActionEligibility` partially-completed | #9 | `:95-107` | covered |
| `isT05DiagnosticRun` | #10 | `:109-114` | covered |
| capability/写入函数 | — | — | unknown |

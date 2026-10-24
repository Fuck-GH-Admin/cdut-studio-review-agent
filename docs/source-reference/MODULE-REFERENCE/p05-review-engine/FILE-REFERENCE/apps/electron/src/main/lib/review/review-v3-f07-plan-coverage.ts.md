---
path: apps/electron/src/main/lib/review/review-v3-f07-plan-coverage.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d786ffc15c7c8ec3b1edc65a2573c83f82758803
sha256: c92267d6bb3ab1eb60ec055f65c7ceb4b227ed5a930c71853bdf99023493cd37
lines: 171
kind: source
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-f07-plan-coverage.ts

## 1. 结论与边界

F07：**冻结 PlanBinding × 确定性结果的一对一覆盖适配**（头注 :1-7）。不创建 Plan/Run、不写持久化、不接受 Renderer 结果；Main 先核实已发布模板/当前原件/计划指纹/来源身份，再传入既有 T04 产物。结果中的 `not-executed` 是诚实缺项标记，不代表实际执行过。

边界：求值在 `review-v3-t04-rules-scoring`；材料账本经 `coverage-ledger.buildDocumentLedger`；落账由 Main 消费。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `F07ReconciledPlan` | interface | 20-27 | `{checks, coverage, allClearVerdictAllowed, blockers, expectedCheckIds}` |
| `reconcileF07PublishedPlan` | fn | 29-171 | 唯一函数导出 |

内部：`Binding`（:15）、`keyOf`（:16-17，`[checkKey,targetKey,objectKey,subjectId]` JSON）、`checkIdOf`（:18，`'t04:'+keyOf`）。

## 3. 内部逻辑与关键流程

输入（:29-39）：`plan/bindings/results/documents/verifiedSources/caseId/recordedAt`。流程：
1. **配对**（:42-57）：按 `keyOf` 建 byBinding/byProposal；proposal 与 binding 的 checkKey×targetKey×objectKey 不一致 → blocker `执行结果声称的 Check×target×object 与配对绑定不一致`（:51-54，注释 :50 不能以同名规则或前三元组猜主体）。
2. **计划一致性**（:58-69）：plan 内重复 key → `冻结计划存在重复的完整检查绑定`（:64）；空计划 → `空计划没有任何可核实检查，不得宣称全部符合`（:65）；bindings 集合与 plan 不一致 → `编译规则绑定与冻结计划不一致`（:66-68）。
3. **来源核验**（:71-85+）：文档版本身份重复 → blocker（:74）；`verifiedSources` 逐条要求 caseId 匹配、文档 active、parseRevision 匹配（:77-80），失败 → `来源引用不属于当前案卷、已失效或解析版本不匹配`；同版本多定位 → `同一原件版本出现多个来源定位，需核实具体落点`（:82-84）。
4. **逐 binding 生成 CheckResult**（中段 :86-152）：唯一 `checkId`（`t04:[…]`）；proposal 缺失/指纹不符/重复 → `not-executed`（诚实缺项，测试 :89-105）；RUN-36：无来源的 compliant 降级 `awaiting-confirmation`（reason 含 `缺少可核验来源`，测试 :72-74）；来源只附实际核实且被该项使用的（`sourceRefs` 过滤）；`not-applicable` 来自 proposal。
5. **汇总**（:153-170）：`pending`（awaiting-*）/`violations`（non-compliant）计数进 blockers（:156-158）；无适用完成检查 → `没有实际适用并完成的检查，不得宣称全部符合`（:156）；`coverage` = documentLedger + plannedChecks（plan.bindings.length）+ completedChecks（排除 not-executed/execution-failed）+ effectiveVerdicts（compliant/non-compliant）+ pendingChecks（:159-165）；`allClearVerdictAllowed = blockers.length===0`（:168）。

## 4. 调用者与调用链

入向（生产）：`review-v3-main-template-run.ts:24`（`reconcileF07PublishedPlan`，T04 运行收尾适配）。测试：`review-v3-f07-plan-coverage.test.ts:8`。出向：`./review-v3-t04-published-plan` 类型（:11）、`./review-v3-t04-rules-scoring` `toT04CheckResult`（:12/:…）、`./coverage-ledger buildDocumentLedger`（:13）。

## 5. 数据 I/O、读写与副作用

纯函数：无磁盘/网络/日志；输出新对象。

## 6. 分支、失败、取消与恢复

无 throw；全部异常经 `blockers[]` 与 `not-executed/awaiting-confirmation` 状态表达（fail-closed：不能「宣称全部符合」）。无取消/恢复概念。

## 7. 权限与权威状态

- 来源权威：`verifiedSources` 由 Main 核验（注释 :35「不是模型引用」）；未知/失效引用阻止 `allClearVerdictAllowed`（:77-84）。
- 执行权威：proposal 只能按完整 Binding 身份配对（:50-54）；`planFingerprint` 不符 → `not-executed`（不伪装已执行）。
- 缺项权威：`not-executed` 是诚实标记（头注 :6-7）；RUN-36 无来源 compliant 降级待确认。
- 无 sender/role 检查；`allClearVerdictAllowed` 注释明确「不能代替角色/任务授权」（:23）。

## 8. 修改影响面

- `checkId` 格式（`t04:[…]`）与 `toT04CheckResult` 一致，是下游按 id 对账键。
- 改 blocker 判定影响 `review-v3-main-template-run` 的全符合资格。
- 同步测试：`review-v3-f07-plan-coverage.test.ts`（5 用例）。

## 9. 测试证据

直接测试 `review-v3-f07-plan-coverage.test.ts`（5 用例 / 1 describe；`binding/rule/planOf/bound/proposal/document/source/checked` 纯夹具 :10-44；NOT_RUN）：
1. `:47-54` 同 check/target/object 两主体 → 两个唯一 checkId、coverage `{plannedChecks:2, completedChecks:2, effectiveVerdicts:2, pendingChecks:0}`、subjectIds `['alice','bob']`、各 1 条 sourceRefs、`allClearVerdictAllowed` true。
2. `:56-66` 缺一结果 → 状态 `['compliant','not-executed']`、coverage planned 2/completed 1/pending 1、`allClearVerdictAllowed` false。
3. `:68-87` 无来源 compliant → sourceRefs `[]`、status `awaiting-confirmation`、reason 含 `'缺少可核验来源'`（RUN-36）；引用未核实版本 → blockers 含 `'来源 v2 未通过'`、allClear false；parseRevision 不匹配 → sourceRefs 空、allClear false。
4. `:89-105` `planFingerprint='stale'` → `not-executed`；同 binding 双结果（compliant/non-compliant）→ `not-executed` 且 allClear false（不任选）。
5. `:107-118` 合法 compliant→allClear true；awaiting→pendingChecks 1；全部 not-applicable→allClear false；`usage:'unread'` 原件→allClear false。

未覆盖：blockers 文案（重复绑定/空计划/绑定不一致/文档身份重复/多定位）、`expectedCheckIds` 输出断言、`execution-failed` 计数；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出/内部符号行号如 §2 | 已证实 | :15-18/:20-29 |
| not-executed 诚实缺项、不任选重复结果 | 已证实 | :89-105 |
| RUN-36 无来源降级 | 已证实 | 测试 :72-74 |
| 来源 Main 核验语义 | 已证实 | 注释 :35/:50 + :77-84 |
| 唯一生产调用者 template-run:24 | 已证实 | grep |
| 全部 blockers 文案分支 | 未知（未测） | §9 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 配对/计划一致性 | §3.1-3.2 | 42-69 | covered（部分未测） |
| 来源核验 | §3.3 | 71-85 | covered |
| 逐 binding 生成/RUN-36 | §3.4 | 86-152 | covered |
| 汇总/allClear | §3.5 | 153-170 | covered |
| blockers 全文案 | §9 | 64-84/156-158 | partial |

---
path: apps/electron/src/main/lib/review/batch-automation-service.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 24b3a1fbd7c1e9d121bf4f30ea81137f7684fdc7
sha256: be516a594e41c251343af4056216591512e41d2fa011221432554661144e23ec
lines: 398
kind: test
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/batch-automation-service.test.ts

## 1. 测试目标

“C 阶段：显式授权的自动通过与退回”（describe `:111`）：默认辅助模式/未确认/缺全局授权不得自动执行；授权后自动通过+自动补件走原 V2 单案事务且重放不重复生效；auto-return 绝不自动通过；授权撤销即时生效；证据缺失/伪造指针/旧输入/人工门槛/未确认政策不得冒充自动通过；补件闭环回流后不沿用旧运行；system `batch-auto:` 身份不能绕过事务门槛；门的本轮读取与规则覆盖负例；混合分流；多补件全闭环；完整链路定稿与不可重复执行。被测：`runBatchAutomation`、`finalizeCompletedBatch`（`batch-automation-service`）、`checkAutoBatchAction`（`batch-automation-gates`）、`batch-store` 队列/绑定/回执、`stage-workflow` 补件闭环。

夹具：`PROFER_CONFIG_DIR` 仓库 `work/tmp/test-batch-auto-<时间戳>`（`:16-18`）；`createTemplate`（`:24-53`）造 published 模板 `batch-auto-test@1`（auto-check 单阶段、`autoPassPolicy.enabled`、`policyRefs` 指向 published `auto-policy@1`（含 confirmed rule `proof-rule`，onFail supplement））；`createCase(status, withSource)`（`:55-90`）建聚合+真实 Run（`computeRunInputHash`、1 条 check、coverage plannedChecks:1）；`makeBatch`（`:92-109`）建批并标记 done+绑定 Run（BATCH-01）。本轮 `NOT_RUN`。

## 2. 用例清单

1 describe、**15 test**：

| # | test 行 | 断言要点 |
| --- | --- | --- |
| 1 | `:112-120` | 默认 assist 拒“尚未启用”；`configureBatchAutomation` 未确认拒“确认”；关全局授权开 auto-approve 拒“全局”；decisions 0 |
| 2 | `:122-145` | auto-approve：`applied=2/blocked=0`；pass 案 `decided`+`pass`+actor `system`+末回执 `RecordWorkspaceBusinessDecision`；return 案 `awaiting-supplement`+`return`+要素含“证明申请资格”；重跑 `applied=0` 不重复；`finalizeCompletedBatch` 拒“仍待补件” |
| 3 | `:147-154` | auto-return 绝不自动通过（`applied=0`、decisions 0） |
| 4 | `:156-166` | 撤销全局授权后 `blocked=1`、无决定 |
| 5 | `:168-175` | 无来源证据 `blocked=1` |
| 6 | `:177-201` | 补件回复后 `requeueCaseAfterSupplement===[]`；`resolveSupplementV2` 满足后工作台命令自身回流（`cases[0].status==='queued'`）且再调 `requeue` 仍 `[]`（幂等）；再自动化 `applied=0`、pass 决定 0（不沿用旧运行） |
| 7 | `:203-217` | 伪造 `fabricated-doc` 指针 `blocked=1` |
| 8 | `:219-235` | 输入变更后 `applied=0/failed=1`、无决定 |
| 9 | `:237-253` | 批次授权改回 assist 后，伪造 `batch-auto:{id}:{rev}` system actor 直调 `decideWorkspaceCaseV2` → `AGENT_DECISION_DISABLED`、decisions 0 |
| 10 | `:255-270` | 直接门：`run.coverage.documents=[]` → `gate.allowed=false`、reason 含“全部有效材料” |
| 11 | `:272-288` | 直接门：规则两条、checks 重复同条（计数凑齐）→ `gate.allowed=false` |
| 12 | `:290-311` | 混合 4 案：`applied=2/blocked=1/failed=0`；pass→pass、可补正→return、人工问题/无来源无决定；`automationReceipts` applied 2 条 |
| 13 | `:313-342` | 多补件：首满足后 `stage` 仍 `awaiting-supplement`、`cases[0].status==='done'`；第二满足后 `reviewing`+`queued` |
| 14 | `:344-386` | 完整链路：`runBatchQueue` 两案 dispatch 顺序 `[first, second]`、全 done、决定 0；自动化 `applied=2`；逐案 `decided`+`finality:'final'`+actor `system`；`finalizeCompletedBatch`→`finalized`、快照 2 条决策；重复定稿拒“批次状态不允许”；重跑队列拒“重开”；决定各 1 条 |
| 15 | `:388-397` | 未形成正式决定拒“未完成正式审批”；自动化后可定稿；定稿后 `runBatchAutomation` 拒“只有已完成” |

## 3. 真实断言

- #2 断言 actor `actorSource==='system'` 与回执类型名；#6 断言“工作台命令本身回流”（`resolveSupplementV2` 后 `cases[0].status` 变化，`:196-197` 注释“The workflow command itself requeues”）。
- #9 直接构造 `batch-auto:${encodeURIComponent(batchId)}:${revision}` 系统 actor 试图绕过——断言事务门槛 `AGENT_DECISION_DISABLED`（`workspace-business-service-v2.assertAutomatedWorkspaceDecision`）。
- #10/#11 为 `checkAutoBatchAction` 直接单测（门的负例）。
- #14 断言 `readFinalizedSnapshot` 的 `decisions` 数组长度 2、`finality:'final'`。
- 夹具全部走真实存储（`createAggregate/saveRunV2/saveBatchStateV2`），Run 哈希真算（`:72`）。

## 4. 未覆盖与脆弱点

**未覆盖**：`conflict` 回执路径（VERSION_CONFLICT/STALE_INPUT 映射）；`appendReceipt` revision 防陈旧；同批次并发 throw（`:37`）；`boundRun` 缺绑定整批 throw（`:46-49`）；return 补件要素长度/上限；`autoPassPolicy.conditions` 拒绝；semantic 缺来源拒绝。

**脆弱点**：#14 的 `runCase` 返回既有 Run 的 `runId`（`:359`）——绑定的是夹具 Run 而非执行器新 Run；文案断言多（“尚未启用”“仍待补件”“全部有效材料”等）；`work/tmp` 目录与其它测试文件并行时隔离依赖唯一时间戳。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 describe、15 test、真实存储夹具 | 已证实 | `:111`；`grep -c test(`=15 |
| 默认/未确认/缺授权不得自动 | 已证实 | `:112-120` |
| 事务化自动通过/补件且幂等 | 已证实 | `:122-145` |
| auto-return 不自动通过 | 已证实 | `:147-154` |
| 撤权即时生效 | 已证实 | `:156-166` |
| 伪造指针/旧输入拒 | 已证实 | `:203-217`、`:219-235` |
| system 身份不能绕过门槛 | 已证实 | `:237-253` |
| 门的读取/规则覆盖负例 | 已证实 | `:255-288` |
| 多补件全闭环才回流 | 已证实 | `:313-342` |
| 定稿链路与不可重复执行 | 已证实 | `:344-397` |
| conflict/并发分支 | 未知 | 未覆盖 |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 被测分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 授权/配置门 | #1 | `:112-120` | covered |
| 自动 pass/return+幂等 | #2 | `:122-145` | covered |
| auto-return 边界 | #3 | `:147-154` | covered |
| 撤权/证据/伪造/旧输入 | #4/#5/#7/#8 | `:156-235` | covered |
| 补件闭环回流 | #6/#13 | `:177-201`、`:313-342` | covered |
| 事务门槛 | #9 | `:237-253` | covered |
| `checkAutoBatchAction` 负例 | #10/#11 | `:255-288` | covered |
| 混合分流 | #12 | `:290-311` | covered |
| 队列→自动化→定稿 | #14/#15 | `:344-397` | covered |
| conflict/并发/绑定缺失 | — | — | unknown |

---
path: apps/electron/src/main/lib/review/workspace-business-service-v2.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1be52a832c6d6126a9f75f299a1b4557ac41a2cb
sha256: c011bb957f5e35188e6c63684f37f5bea2fbdb0fd98ca2a888110296975acd94
lines: 258
kind: test
package: p04-review-case-core
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/workspace-business-service-v2.test.ts

## 1. 测试目标

“三栏单案的 V2 业务闭环事务”回归（describe `:53`）：处置/认定只能写当前权威 Run（RUN-14）、未处理项阻断决定、处置后决定持久化、人工符合结论的语义、有未处理项仍可驳回、输入变更拒旧处置、补件不作废审核但阻断通过、补件回复致 Run 过期、事项认定历史与最终分数派生。

被测：`workspace-business-service-v2.{recordWorkspaceDispositionV2,recordWorkspaceSubjectAdjudicationV2,openWorkspaceSupplementV2,decideWorkspaceCaseV2,isWorkspaceRunStaleV2}`；协作 `case-store-v2.{createAggregate,readAggregate,submitCommand}`、`run-service-v2.computeRunInputHash`、`run-store-v2.saveRunV2`、`template-store`、`stage-workflow.respondSupplementV2`、`@profer/shared.assessDecisionReadiness`。

夹具（`:16-51`）：`PROFER_CONFIG_DIR` 临时目录；`ensureTestTemplate` 自建并发布 `workspace-test@1`（单阶段 review/reviewer）；`seed(subjects?)` 建聚合（stage `reviewing`）+ 持久化 `run-${caseId}`（`inputManifest.hash=computeRunInputHash(...)`、1 条 `non-compliant` check、`pendingChecks:1`）；actor `reviewer-1/local/reviewer`。本轮 `NOT_RUN`：未执行测试。

## 2. 用例清单

1 个 describe、**8 个 test**：

| # | test 行 | 设置/动作 | 断言要点 |
| --- | --- | --- | --- |
| 1 | `:54-83` RUN-14 | seed；存更新 run-2；对旧 run 处置、对新 run 处置、对旧 run 认定 | 旧处置 `ok:false`、`code:'STALE_INPUT'`、message 含“当前轮审核运行”；新 run 处置 `ok:true`；旧 run 认定 `STALE_INPUT` |
| 2 | `:85-113` 未处理→阻断→处置→决定 | 直接 `pass` 决定；`false-positive` 处置；再决定 | 首次 `DEPENDENCY_UNRESOLVED`；处置 `dispositions[0]=={actorSource:'local', inputHash:run.hash}`；决定 `ok:true`、`stage==='decided'`、`result==='pass'`、`decisions.at(-1).basedOnRunId===run.id` |
| 3 | `:115-134` 人工符合 | check 改 `awaiting-confirmation`；`human-confirmed-compliant` 处置 | `entity.disposition==='human-confirmed-compliant'`、`receipt.summary` 含“人工确认本项符合” |
| 4 | `:136-148` 未处理仍可驳回 | `reject` 决定 | `ok:true`、`result==='reject'`、`stage==='decided'`、reason 含“驳回” |
| 5 | `:150-162` 输入变更拒旧处置 | submitCommand 改 `caseFields.applicant`；旧 run 处置 | `STALE_INPUT` |
| 6 | `:164-192` 补件不作废审核 | 2-check run；开补件；再处置另一待办 | `stage==='awaiting-supplement'`、supplement `open`、首条 disposition `supplement-requested`、`isWorkspaceRunStaleV2===false`；`assessDecisionReadiness` 有 `open-supplement` blocker、`ready:false`；另一处置 `ok:true` |
| 7 | `:194-207` 回复致过期 | 开补件后 `respondSupplementV2`（note only） | `isWorkspaceRunStaleV2(replied.aggregate, run.id)===true` |
| 8 | `:209-257` 认定历史与分数 | 2 subjects；处置后：subject-a accepted → modified（finalFields level/declaredScore 4）→ subject-b rejected → `partial-pass` 决定 | 2 条认定、`supersedesAdjudicationId===accepted.id`；`finalScores=== [{subject-a,'4',run.id},{subject-b,'0',run.id}]` |

## 3. 真实断言

- #1 的 message 子串“当前轮审核运行”直接对应源码文案（`workspace-business-service-v2.ts:107`）。
- #2 断言 `dispositions[0].inputHash` 与 run 一致，实证处置绑定输入哈希。
- #4 证明 `reject` 不走就绪门（有未处理项仍成功）。
- #6 用 `assessDecisionReadiness`（shared）交叉验证 `open-supplement` blocker——两个服务的口径一致。
- #8 的 `finalScores` 用 `toEqual` 精确数组断言（含 `value:'4'`/`'0'` 字符串与 `basisRunId`）。
- 夹具的 run 哈希由 `computeRunInputHash` 真算（`:43`），非硬编码，stale 判定走真实算法。

## 4. 未覆盖与脆弱点

**未覆盖**：`assertAutomatedWorkspaceDecision` 全部分支（agent 开关、`batch-auto:` 校验、理由/要素一致性）；`openWorkspaceSupplementV2` 的 `material-slot:` 分支与拒绝路径；`acknowledgeWorkspaceMaterialV2`（本文件未测，workspace-service 测试间接覆盖）；`recordWorkspaceSubjectAdjudicationV2` 的 finalFields 越界拒绝、非 `item` subject、`modified` 缺 finalFields；`finalScoresFor` 的手工确认观测回退；`isWorkspaceRunStaleV2` 的顺序回退；`decideWorkspaceCaseV2` 的 D2/CanonicalPlan 拒绝、`return` 结果分支、`partial-pass` 缺 modified/rejected 拒绝、案卷已结束拒绝。

**脆弱点**：

- `seed()` 的 run 是 `non-compliant` + `pendingChecks:1`（`:45-46`），与 `coverage.plannedChecks:1` 组合决定了 #2 必须先处置才能通过；若 `t05ActionEligibility`/`assessDecisionReadiness` 的口径变化，#2/#6 会连带失败。
- #8 依赖 `finalScores` 顺序按 subjects 顺序（`:31-43` flatMap），若改为按 id 排序会红。
- 大量 `if (!x.ok) throw` 的流式夹具，失败时报错点分散。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 test、真实聚合+Run 持久化 | 已证实 | `seed` `:32-51`、`saveRunV2` |
| RUN-14 旧 Run 只读 | 已证实 | `:63-82` |
| 处置绑定 runId+inputHash | 已证实 | `:100-101` |
| reject 不受就绪门限制 | 已证实 | `:136-148` |
| 补件请求不废 Run、回复才废 | 已证实 | `:181`、`:206` |
| 认定追加+supersedes 链 | 已证实 | `:237-238` |
| partial-pass 分数按认定派生（modified 4 / rejected 0） | 已证实 | `:253-256` |
| 自动化代批门 | 未知 | 未覆盖 |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 源函数/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| `recordWorkspaceDispositionV2` | #1/#2/#3/#6 | 多处 | covered |
| `recordWorkspaceSubjectAdjudicationV2` | #1/#8 | `:77-82`、`:223-245` | covered |
| `openWorkspaceSupplementV2` | #6/#7 | `:172-206` | covered（finding 分支） |
| `decideWorkspaceCaseV2` | #2/#4/#8 | 多处 | covered（pass/reject/partial-pass） |
| `isWorkspaceRunStaleV2` | #6/#7 | `:181`、`:206` | covered |
| `acknowledgeWorkspaceMaterialV2` | — | — | unknown（间接） |
| `assertAutomatedWorkspaceDecision` | — | — | unknown |
| 材料槽补件/return 决定 | — | — | unknown |

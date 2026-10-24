---
path: apps/electron/src/main/lib/review/review-v3-t05-business-mode.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f286d1753bbb30f35efe66c261d5124c2a30d65f
sha256: 94de6d9b0d6205121c4664b8b22fae0c3ceeba97698e09b2eb1b5bedfd307454
lines: 160
kind: test
package: p04-review-case-core
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-t05-business-mode.test.ts

## 1. 测试目标

R01 D2/D3 架构裁决的直接反证（文件头 `:2-8`）：CanonicalPlan 不再因“有计划”自动具业务许可（需 Main 确认，fail closed）；D2 技术预审永不能形成正式业务决定；non-compliant 不能仅凭 Run completed 通过；覆盖不足/执行失败/未执行阻断通过但允许退回/拒绝。被测：`review-v3-t05-main-service.{resolveT05BusinessMode,t05ActionEligibility,registerT05LocalBusinessConfirmation,clearT05LocalBusinessConfirmations}`；协作 `run-store-v2.saveRunV2`、`run-service-v2.computeRunInputHash`。

夹具（`:22-65`）：`PROFER_CONFIG_DIR` 临时目录（D3 要求 Run 在 RunStore 可查，故 `saveRunV2` 持久化真实 Run 而非内存对象，`:22` 注释）；`afterEach` 清确认登记；run 的 `inputManifest.hash` 用 `computeRunInputHash` 真算（`:51`）；`coverage.plannedChecks=checks.length`（`:60`）。本轮 `NOT_RUN`：未执行测试。

## 2. 用例清单

2 个 describe、**11 个 test**：

### 2.1 D2 可信业务模式（`:67-103`，5）

| # | 行 | 设置 | 断言 |
| --- | --- | --- | --- |
| 1 | `:68-70` | 无计划 | `resolveT05BusinessMode` `toMatchObject({mode:'local-business'})` |
| 2 | `:72-75` | `d2RuntimePlan:{id:'d2'}` | `mode==='technical-pre-review'` |
| 3 | `:77-83` | `canonicalPlan:{fingerprint:'fp-1'}` 无确认 | `mode==='technical-pre-review'`、reason 含“尚未经 Main 确认” |
| 4 | `:85-92` | 登记确认（fp-1/tpl-arch/1/local-organizer）+ canonicalPlan fp-1 | `mode==='local-business'` |
| 5 | `:94-102` | 确认 fp-1 但 canonicalPlan fp-2 | `technical-pre-review`、reason 含“指纹” |

### 2.2 D3 按动作适格判定（`:105-159`，6）

| # | 行 | 设置 | 断言 |
| --- | --- | --- | --- |
| 6 | `:106-112` | run=undefined | `stage-pass:false`、`final-reject:false`、`return-for-supplement:true`；blockers 含“有效审核运行” |
| 7 | `:114-120` | 1 条 compliant check | `readiness:'ready'`、`stage-pass/final-reject/return-to-previous-stage` 全 true |
| 8 | `:122-130` | 1 条 `non-compliant` | `readiness:'blocked'`、`nonCompliant` 含 `'headcount'`、`stage-pass:false`；`final-reject:true`、`return-for-supplement:true` |
| 9 | `:132-139` | non-compliant + `waived` 处置（绑定 run.id） | `ready`、`stage-pass:true` |
| 10 | `:141-148` | `effectiveRuleIds:['r1','r2']` 但只有 r1 的 check | `coverage.missing===['r2']`、`stage-pass:false` |
| 11 | `:150-159` | `execution-failed` + `not-executed` | `stage-pass:false`、`final-reject:true`；blockers 含“执行失败”“未执行” |

## 3. 真实断言

- #3/#5 断言 reason 中文子串，区分“无确认”与“指纹不符”两种 fail-closed 原因。
- #6 断言无 Run 时**只有**补件动作被允许（三布尔精确值）。
- #8 证明“21 人超限（non-compliant）不能仅凭 Run completed 通过”——`readiness:'blocked'` 且 `nonCompliant` 列表记录 checkId。
- #9 的 `waived` 处置带 `runId: persisted.id`，实证处置必须绑定 run 才生效。
- #10 断言 `coverage.missing` 精确数组 `['r2']`。
- run 夹具持久化后由 `t05ActionEligibility` 走 `isWorkspaceRunStaleV2`/hash 真实判定（`runUsable` 依赖 `inputManifest.hash`，`:303`）。

## 4. 未覆盖与脆弱点

**未覆盖**：`registerT05LocalBusinessConfirmation` 的 `school-authorized` 拒绝与缺指纹拒绝；确认的 templateId/templateVersion 不匹配分支（`:127-130`）；`readiness` 的文档 unread/待确认/未结补件阻断（在 `review-v3-t05-main-service.test.ts` 覆盖）；`partially-completed` 的 `completed` 判定；`return-to-previous-stage` 的 reasons。

**脆弱点**：夹具 `coverage.plannedChecks=checks.length`（`:60`）恒满足覆盖门，#10 才用 `effectiveRuleIds` 制造缺失；若覆盖门实现改口径（如改用 completedChecks），#10 会红。`caseFixture` 用 `as unknown as ReviewCaseV2`（`:31-36`），字段缺失不被类型检查。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 describe、11 test、Run 真实持久化 | 已证实 | `:67`、`:105`；`saveRunV2` `:63` |
| CanonicalPlan fail-closed（无确认→技术预审） | 已证实 | `:77-83` |
| 确认匹配才 local-business | 已证实 | `:85-92` |
| non-compliant 未解释阻断通过、可拒绝/退回 | 已证实 | `:122-130` |
| waived 例外放行 | 已证实 | `:132-139` |
| effectiveRuleIds 覆盖缺失阻断 | 已证实 | `:141-148` |
| execution-failed/not-executed 阻断通过 | 已证实 | `:150-159` |
| 确认登记拒绝分支 | 未知 | 未覆盖 |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 源分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| `resolveT05BusinessMode` 无计划 | #1 | `:68-70` | covered |
| d2RuntimePlan | #2 | `:72-75` | covered |
| canonicalPlan 无确认 | #3 | `:77-83` | covered |
| canonicalPlan 确认匹配 | #4 | `:85-92` | covered |
| 指纹不符 | #5 | `:94-102` | covered |
| 模板不符 | — | — | unknown |
| `registerT05LocalBusinessConfirmation` 拒绝分支 | — | — | unknown |
| `t05ActionEligibility` 无 Run/合规/非合规/豁免/覆盖/失败 | #6-#11 | `:105-159` | covered |

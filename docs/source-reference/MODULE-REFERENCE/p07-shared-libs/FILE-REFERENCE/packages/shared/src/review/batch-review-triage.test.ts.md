---
path: packages/shared/src/review/batch-review-triage.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d47e84f591d1083437a50923973103a10e64569a
sha256: a12c8cf623de245d29dd5440c81f44dbb36ecb36004344a1a48553c27510235e
lines: 196
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/review/batch-review-triage.test.ts

## 1. 测试目标

验证 `packages/shared/src/review/batch-review-triage.ts` 的分流/归组/草稿三组纯函数：auto-* 只是候选（`requiresBusinessGate`）、无效运行不入自动处理、保守归组（同 ruleId+status+归一化原因才合并）、草稿逐案资格重推导。被测函数经相对导入（`:3`）。bun:test（`describe/expect/test`，`:1`）。不运行，本篇只读断言（NOT_RUN）。

夹具（`:5-33`）：`batch`（templateId `'t'`、templateVersion `2`、policyVersionLock `[{policyVersionId:'policy',version:3}]`）；`check()` 默认 `checkId:'check-1', ruleId:'rule-1', target:{scope:'case',subjectIds:[]}, status:'compliant', reason:'检查符合', executedBy:'semantic'`；`run()` 默认有效运行（`id:'run-1', caseId:'c1'`、inputManifest hash `'input-hash'` 且 policyVersions 对齐、`status:'completed'`、checks 1、coverage `{documents:[{documentVersionId:'doc-1',status:'read'}], plannedChecks:1, completedChecks:1, effectiveVerdicts:1, pendingChecks:0}`）；`item()` 默认 `{caseId:'c1', entryStatus:'done', caseStage:'reviewing'}`。运行边界：纯共享函数，mock 无、真实 Main 无——全部内存对象。

## 2. 用例清单

共 **20 个 `test(`**（3 个 `describe`）：

| # | 行 | 用例（原文标题节选） | 设置 | 动作 | 依赖顺序 |
| --- | --- | --- | --- | --- | --- |
| 1 | 36 | 所有检查符合只是可通过候选 | 默认 item | `triageBatchCase` | 独立 |
| 2 | 42 | 尚未执行/执行中不误判 | entryStatus queued/running/paused | 3 次 triage | 独立 |
| 3 | 48 | 已决定/补件中不重复动作 | caseStage decided/awaiting-supplement | 2 次 triage | 独立 |
| 4 | 53 | 无有效规则/结果/读取不能认定无异常 | 5 种坏 run（空 coverage、unread、completedChecks=0、`status:'partially-completed'`、run undefined） | 5 次 triage | 独立 |
| 5 | 61 | 模板/政策版本不匹配 | templateVersion:1、policy version:2、caseId:'other-case' | 3 次 triage | 独立 |
| 6 | 67 | 明确不符合/需确认不能自动 | checks non-compliant / awaiting-confirmation | 2 次 triage | 独立 |
| 7 | 72 | 只有明确补件检查才产生可退回候选 | awaiting-supplement 有 reason / 空 reason | 2 次 triage | 独立 |
| 8 | 77 | 未执行/失败检查与业务违规分离 | entryStatus failed、checks not-executed / execution-failed | 3 次 triage | 独立 |
| 9 | 83 | 需人工最终认定的阶段保持人工 | caseStage awaiting-final / awaiting-rating | 2 次 triage | 独立 |
| 10 | 88 | 未知阶段按人工处理 | caseStage 'unknown-future-stage' | triage | 独立 |
| 11 | 94 | 同规则同状态相同根因合并 | 两案 3 checks（「缺少证明。」/「缺少证明」），c2 run id 'run-2' | `groupBatchIssues` | 独立 |
| 12 | 106 | 同规则不同原因不盲目合并 | 「证书过期」vs「获奖等级不符」 | `groupBatchIssues` | 独立 |
| 13 | 112 | 不同规则/状态不合并 | 3 checks（rule-1×2 状态不同 + rule-2） | `groupBatchIssues` | 独立 |
| 14 | 121 | 回归：manifest 版本不符不入组 | 外层 2、manifest templateVersion:1 | triage + group | 独立 |
| 15 | 130 | 哈希缺失/检查不完整/未读不入组 | 5 个坏 run（hash 空、planned 2/completed 1、unread、not-executed、effectiveRuleIds:[]） | 循环 triage + group | 独立 |
| 16 | 145 | 已决定/补件中运行不产生问题组 | caseStage decided/awaiting-supplement | `groupBatchIssues` | 独立 |
| 17 | 151 | 未完成/版本不匹配运行不入组 | entryStatus queued、c2 templateVersion:1 | `groupBatchIssues` | 独立 |
| 18 | 160 | 仅当前有效组生成草稿 | 两案 awaiting-supplement 同因；c2 run id 'r2' | `prepareBatchIssueActionDraft` | 依赖 11 的 groupKey 生成模式 |
| 19 | 173 | 部分案卷可处理时不计入不可执行范围 | c2 另有 non-compliant 检查（planned 2） | draft + `['c2']` 过滤 | 独立 |
| 20 | 188 | 不允许用无效版本的组构造草稿 | manifest templateVersion:999 | group + draft('nonexistent') | 独立 |

## 3. 真实断言

（引用 `expect` 行；均为 `packages/shared/src/review/batch-review-triage.test.ts`）

- `:38-39` `expect(actual.route).toBe('auto-pass-candidate')`、`expect(actual.requiresBusinessGate).toBe(true)`。
- `:43-45` 三个 entryStatus → `.route).toBe('pending')`。
- `:49-50` decided → `'already-decided'`、awaiting-supplement → `'awaiting-supplement'`。
- `:54-58` 5 例 `.route).toBe('technical-exception')`。
- `:62-64` 3 例不匹配 → `'technical-exception'`。
- `:68-69` → `'manual-review'`。
- `:73` 有 reason → `'auto-return-candidate'`；`:74` 空 reason → `'manual-review'`。
- `:78-80` failed/not-executed/execution-failed → `'technical-exception'`。
- `:84-85` → `'manual-review'`。
- `:89` 未知 stage → `'manual-review'`。
- `:101-103` `groups` 长度 1、`groups[0].caseIds` toEqual `['c1','c2']`、`occurrences` 长度 3。
- `:109` 两组；`:118` 三组。
- `:126-127` invalid route `'technical-exception'` 且 `groupBatchIssues([invalid])` 长度 0。
- `:140-141` 坏 run → route `'technical-exception'` 且 group `toEqual([])`。
- `:147-148` 两种终态 → group `toEqual([])`。
- `:154` → `toEqual([])`。
- `:165-170` draft `action` toBe `'supplement-draft'`、`eligibleCount` 2、cases 顺序 `['c1','c2']`、c2 行 `runId:'r2'`、`inputHash:'input-hash'`、`findingKeys` toEqual `['c2-ch']`。
- `:183-185` `eligibleCount` 1、c2 `eligible` false、`selectedCaseIds:['c2']` 时 `eligibleCount` 0。
- `:193-194` 无效组 → `[]` 且 `prepareBatchIssueActionDraft([invalid],'nonexistent')` toBeNull。

## 4. 未覆盖与脆弱点

- `human-review-draft` 动作路径（组 status 非 awaiting-supplement）无直接用例（`:238,245` 实现分支）。
- `groupBatchIssues` 的三键排序（`:203-204`）无断言。
- `prepareBatchIssueActionDraft` 中 `inputs.find(...)!`/`related[0]!` 的非空断言边界（重复 caseId）无用例。
- 脆弱点：用例 4/15 同时改多个字段构造坏输入，命中分支顺序依赖实现（如用例 4 第一例 `plannedChecks:0` 命中 `:73` 而非 `:77`）；`normalizedCause` 只测了句号差异，其它标点/大小写/空白折叠无独立用例。
- 真实断言均为路由/数组形状断言，无 explanation 文案断言（改文案不红）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 20 个 test、3 describe、夹具四件套 | 已证实 | `:5-33,35,93,159` 及各 test 行 |
| auto-pass 必带 requiresBusinessGate=true | 已证实 | `:38-39` |
| 无效运行 0 组回归（manifest 版本） | 已证实 | `:121-128` |
| 归并含标点归一（「。」） | 已证实 | `:94-104` |
| 草稿逐案 runId/inputHash/findingKeys | 已证实 | `:165-170` |
| 测试通过与否 | 未知 | NOT_RUN |
| bun:test 在本仓的隔离语义 | 未知 | 未运行、未读 runner 配置 |

## 6. 覆盖表

| 被测分支（源码行） | 手册章节 | 用例 # | 状态 |
| --- | --- | --- | --- |
| `triageBatchCase` auto-pass（:134） | §2/§3 | 1 | covered |
| pending/终态（:98-112） | §2/§3 | 2,3 | covered |
| `validateBatchRun` 各段（:61-85） | §2/§3 | 4,5,15 | covered |
| manual-review 分支（:104-133） | §2/§3 | 6,9,10 | covered |
| auto-return（:123-129） | §2/§3 | 7 | covered |
| `groupBatchIssues`（:167-205） | §2/§3 | 11-17 | covered |
| `prepareBatchIssueActionDraft`（:230-264） | §2/§3 | 18-20 | covered |
| human-review-draft 路径 | §4 | — | partial |
| 排序规则 | §4 | — | unknown |

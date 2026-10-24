---
path: apps/electron/src/main/lib/review/f03-policy-resolution.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3cafef0db20bd216e3c3f7087a941b5ffe2409ed
sha256: 5428b9d7e17712dd36fdcf118940adac456711a26bef5917576f6a814b88b75a
lines: 117
kind: test
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/f03-policy-resolution.test.ts

## 1. 测试目标

“F03 多政策来源与人工优先关系”（describe `:18`）：同名相反限额不能被上传顺序覆盖；相同语义去重计一次但保留全部来源；具名裁定绑定完整候选（限额变化后旧裁定失效）；不同 ID 须显式 claimKey（不凭标题/严格程度猜测）；有效期须可信业务日期；未确认规则不能被裁定擅自提权；部分/拆分 claimKey 不得绕开同名冲突。被测：`resolveF03PolicyRules`（`f03-policy-resolution`）。纯内存（`policy(policyId,id,cap,patch)` 构造器）。本轮 `NOT_RUN`。

## 2. 用例清单

1 describe、**7 test**：

| # | test 行 | 断言要点 |
| --- | --- | --- |
| 1 | `:19-33` | school/faculty 相反限额 + 无关 notice：rules 3 条 id 唯一、conflicts 1（candidates `['faculty','school']` 按身份排序）、`originalRuleId==='cap'` 的两条均 `confirmation==='conflict' && execution==='manual'`、`deadline` 仍 `deterministic`；**输入顺序颠倒后 `candidatesHash` 相同** |
| 2 | `:35-45` | 同语义（cap 10/10）：rules 1 条、conflicts 0、`sourceRefIds` 并集 `['faculty:clause-9','school:clause-1']`、`policySources` 两份全列 |
| 3 | `:47-65` | 具名裁定（claimKey `same-rule-id:cap`+首决 hash+owner-01）：选 school（`policyVersionId==['school@1']`）、excluded `['faculty']`、conflicts 0；**cap 改 7 后旧裁定失效**（conflicts 1、全 manual）；`confirmedBy:''` 无效（conflicts 1） |
| 4 | `:67-79` | 不同 ID（R01/F12）无 claims → 无冲突（各走 individual）；显式同一 claimKey → 冲突 `['activity-cap']`、id `['F12','R01']` 保留、全 `conflict` |
| 5 | `:81-89` | 无 asOfDate：带区间规则全 `manual`；`asOfDate:'2026-10-21'` 只留 `['current']`；`2026-02-30` throw `F03_AS_OF_DATE_INVALID`；区间倒置（12-31→01-01）→ `manual` |
| 6 | `:91-102` | 未确认候选不能被裁定提权（selected 是 unconfirmed）：conflicts 1、全 `manual` |
| 7 | `:104-116` | 部分配置 claimKey（只配 school）/拆分 claimKey（两不同 key）→ 均被拉回 `['same-rule-id:cap']` 冲突 |

## 3. 真实断言

- #1 的顺序不变性（`:31-32`）验证 `candidatesHash` 的 canonical 确定性。
- #3 三连断言（生效/失效/匿名）覆盖裁定生命周期。
- #5 断言 `2026-02-30` 被 `dateOnly` 拒（真实日历校验）。
- #6 断言 selected 必须是 confirmed 候选（`:177-180` 语义）。

## 4. 未覆盖与脆弱点

**未覆盖**：`F03_DUPLICATE_POLICY_RULE`/`F03_RULE_ID_COLLISION` throw；重复 ID 的 `f03-` 改名细节（#1 只验 originalRuleId）；非 policy 来源（template/workspace）；`unconfirmed semantic` 保持 semantic 的分支（#6 全部期望 manual，未构造 semantic+unconfirmed）。

**脆弱点**：构造器默认 `execution:'deterministic'`+`onFail:'reject'`；hash 断言依赖 canonical 排序。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 describe、7 test、纯内存 | 已证实 | `:18`；`grep -c test(`=7 |
| 上传顺序不决定效力 | 已证实 | `:19-33` |
| 同语义合并保留全来源 | 已证实 | `:35-45` |
| 裁定绑定候选指纹、变更即失效 | 已证实 | `:47-65` |
| 不同 ID 须显式 claimKey | 已证实 | `:67-79` |
| 可信日期语义 | 已证实 | `:81-89` |
| 未确认不提权 | 已证实 | `:91-102` |
| 防绕冲突（部分/拆分） | 已证实 | `:104-116` |
| 两个 throw/ID 改名/非 policy 来源 | 未知 | 未覆盖 |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 被测分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 冲突+顺序不变 | #1 | `:19-33` | covered |
| 同语义合并 | #2 | `:35-45` | covered |
| 具名裁定 | #3/#6 | `:47-65`、`:91-102` | covered |
| claimKey 分组 | #4/#7 | `:67-79`、`:104-116` | covered |
| 日期适用 | #5 | `:81-89` | covered |
| 重复/碰撞 throw、ID 改名 | — | — | unknown |

---
path: apps/electron/src/main/lib/review/review-v3-t04-published-plan.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c7d85447467b469036053bb726d7ed4c20ab1a4b
sha256: a3ff75fac29017eba2f475a0f287f5da96ecc3948751aa3c3f7eb67df144a098
lines: 144
kind: test
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-t04-published-plan.test.ts

## 1. 测试目标

T04 R01 编译契约（describe :56）：已发布模板 → 不可变 Plan + 类型化规则 → 求值状态正确；FieldSpec.max 不冒充政策检查；材料/约束/规则伪造拒止；多政策冲突不静默双收；决策期槽位语义。求值经 `evaluateT04Plan`（`review-v3-t04-rules-scoring`）。

## 2. 用例清单

10 用例 / 1 describe。夹具：`template()`（:9-24，published、number 字段 peopleCount max20 单位人、1 材料槽 plan minCount1）、`peopleRule()`（:25-31，deterministic/confirmed）、`clause()`（:32-38，field-maximum 20 人）、`target()`（:39-43）、`compile()`（:44-51，phase submission）、`statuses()`（:52-54，规则 id→状态）。纯函数，无 I/O。

| # | 用例 | 行 | 要点 |
| --- | --- | --- | --- |
| 1 | 18 compliant/21 non-compliant（无硬编码分支） | 57-71 | 确定性 |
| 2 | 未知数值待确认非 0 | 72-75 | |
| 3 | 确认空槽缺件/未确认空槽待确认 | 76-83 | |
| 4 | FieldSpec.max 不生成政策检查 | 84-88 | |
| 5 | 仅显式确认确定性规则获类型化操作 | 89-98 | 4 个 invalid |
| 6 | 伪造材料版本/字段/重复规则拒止 | 99-108 | |
| 7 | 单位缺失/不匹配保持待确认 | 109-116 | |
| 8 | 同 claimKey 双政策不静默双收 | 117-126 | |
| 9 | 规则/约束/来源变化 → 摘要变化 | 127-135 | |
| 10 | decision 槽 submission 不适用、decision 期缺件 | 136-143 | |

## 3. 真实断言

- 1：`statuses(pass)` `toEqual({…:'compliant', required-material-plan:'compliant'})`、fail 的人数规则 `non-compliant`、`plan.templateVersion==='1'`、bindings 长度 2、checkKey 唯一、两指纹 `not.toBe`、同输入 plan `toEqual` 相同（:60-70）。
- 2：`toBe('awaiting-confirmation')`（:73-74）。
- 3：确认空槽 `awaiting-supplement`、未确认 `awaiting-confirmation`、空 sourceVersionIds 透传（:78-82）。
- 4：无 clause 时人数规则 `awaiting-confirmation`、材料规则 `compliant`（:86-87）。
- 5：`execution:'manual'`/`confirmation:'unconfirmed'`/clause 模板版本 2/draft 模板 → 均 `toThrow('T04_PUBLISHED_PLAN_INVALID')`（:90-97）。
- 6：`toThrow('Material version not in target')`、字段不存在 `T04_PUBLISHED_PLAN_INVALID`、重复规则同前（:102-107）。
- 7：单位删/改 → 均 `awaiting-confirmation`（:112-115）。
- 8：双 claim（20 vs 19，同 key）→ 两规则 proposals `every(status==='awaiting-confirmation')`（:122-125）。
- 9：换 source/换上限 → fingerprint 变；换规则文本 → `bindingLedgerHash` 变（:129-134）。
- 10：submission 期 `not-applicable`、decision 期编译 → `awaiting-supplement`（:138-142）。

## 4. 未覆盖与脆弱点

- 未覆盖：`asOfDate` 合法/非法路径、`phase:'decision'` 的 binding applicability 全组合、groupBy 分组封顶组合、`T04PublishedConstraint.claimKey` 与 `resolveT04PolicyClaims` 的 `decisions` 裁决路径。
- 脆弱点：`statuses()` 覆盖 `evaluateT04Plan` 部分分支；夹具 key `section-eligibility-count` 与 `required-material-plan` 耦合 id 生成规则。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 10 用例断言如 §3 | 已证实 | 本文件逐行 |
| FieldSpec.max ≠ 政策检查被断言 | 已证实 | :84-88 |
| 冲突政策不双收被断言 | 已证实 | :117-126 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 编译+求值主路径/确定性 | §3 | 57-71 | covered |
| 未知/空槽/单位 | §3 | 72-83/109-116 | covered |
| 伪造拒止（4+3） | §3 | 89-108 | covered |
| 冲突/指纹/decision 槽 | §3 | 117-143 | covered |
| asOfDate/有效期 | §4 | — | unknown（未测） |

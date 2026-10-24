---
path: apps/electron/src/main/lib/review/workspace-rule-compiler.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1ad32ad961011d1ef833db01a7f9f852cdac5d40
sha256: 1adcd2a73177d427f2f6775c446d60c404d45e187217f03be934958cfa1855ca
lines: 42
kind: test
package: p04-review-case-core
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/workspace-rule-compiler.test.ts

## 1. 测试目标

`compileWorkspaceRule` 的纯函数单测：约束结构化程度 → `execution` 的映射（deterministic/manual/semantic）、`when` 适用条件不替代审核要求、未确认规则恒人工、`max-score` 的组级上限计算。被测对象仅 `workspace-rule-compiler.ts`。

夹具（`:5-8`）：固定 `RulePack`（`confirmed:true`、`id:'pack-1'`、`documentId:'rules-doc'`、`version:'v1'`）与 `outline(id, constraint?)` 构造器（category“分值”、anchors 空、`generatedBy:'ai'`）。无 I/O、无 mock。本轮 `NOT_RUN`：未执行测试。

## 2. 用例清单

1 个 describe、**5 个 test**：

| # | test 行 | 输入 | 断言 |
| --- | --- | --- | --- |
| 1 | `:11-15` | `score-value`+`appliesWhen{category:'竞赛'}`；`score-value` 无条件；`date-range` 有起止 | execution 依次 `deterministic`、`manual`、`deterministic` |
| 2 | `:17-20` | `required-evidence[certificate]`；`mutual-exclusion` | 依次 `deterministic`、`manual` |
| 3 | `:22-29` | `amount-limit:180`、`date-range`、`score-value+appliesWhen{category:'contest'}` | `amount.when=={field:'amount',op:'exists'}`；`date.when=={field:'activityDate',op:'exists'}`；`fixed.when=={field:'category',op:'eq',value:'contest'}` |
| 4 | `:31-34` | `confirmed:false` 的 `max-score:8`；confirmed 无 constraint | 依次 `manual`、`semantic` |
| 5 | `:36-41` | `max-score:8`（confirmed） | `execution==='deterministic'`、`targetScope==='group'`、`calculation.cap==={value:'8',unit:'point'}` |

## 3. 真实断言

- #1/#2/#4 只断言 `execution` 字符串；#3 断言 `when` 的完整对象（`toEqual`）；#5 断言 `execution`/`targetScope`/`calculation.cap`。
- #4 的两行证明两条独立规则：未确认强制 manual（与约束种类无关）、确认且无约束走 semantic。
- 未断言 `id/policyVersionId/requirement/sourceRefIds/priority/onFail/onUnknown/semanticOutputEnum/workspaceConstraint` 的形状。

## 4. 未覆盖与脆弱点

**未覆盖**：`level-mapping`/`required-evidence` 的 `when`；`max-score` 的 `calculation.valueFrom/aggregate/allocation`；非 number `value` 的降级（`max-score`/`score-value`/`amount-limit` 的 typeof 兜底）；`score-value` 的 `when` 缺省形状（`{field:'title',op:'exists'}`）；`confirmed && execution==='semantic'` 时 `semanticOutputEnum` 的附加。

**脆弱点**：`outline()` 夹具把 `summary` 固定为“测试规则”，`requirement` 拼接（`${title}：${summary}`）未断言；若拼接规则变化不影响本测试。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 test、纯函数无 I/O | 已证实 | `:1-3`；文件仅 import 类型与被测函数 |
| `appliesWhen` 是 deterministic 的前置 | 已证实 | `:12-13` |
| 互斥约束降 manual | 已证实 | `:19` |
| `when` 不替代审核要求（金额/日期存在性 + 固定分条件） | 已证实 | `:22-29` |
| `max-score` 组级 cap | 已证实 | `:36-40` |
| 其余 RuleSpec 字段形状 | 未知 | 未断言 |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 源分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| `!confirmed→manual` | #4 | `:32` | covered |
| `max-score` | #4、#5 | `:32`、`:36-40` | covered |
| `score-value` 有/无条件 | #1、#3 | `:12-13`、`:25-28` | covered |
| `date-range` | #1、#3 | `:14`、`:24-27` | covered |
| `amount-limit` | #3 | `:23-26` | covered（when） |
| `required-evidence` | #2 | `:18` | covered |
| `mutual-exclusion` 兜底 | #2 | `:19` | covered |
| 无 constraint → semantic | #4 | `:33` | covered |
| `level-mapping` | — | — | unknown |

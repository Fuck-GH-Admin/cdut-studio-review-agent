---
path: apps/electron/src/main/lib/review/review-v3-t04-rules-scoring.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e268d02021b12b40e80a5d2a8bb31255769f220b
sha256: 235e63d330e2d2d46d055c352ed6a803e46394d883abab46a21a66d500f8ce5c
lines: 184
kind: test
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-t04-rules-scoring.test.ts

## 1. 测试目标

T04 真实确定性计算（describe :19，D04-D07）与多政策/Plan 适配（describe :138，D09）：分组封顶计分、尾差分配、加权、金额限额、日期边界、下限、分组/互斥、三态条件、政策冲突具名裁决、Plan 绑定一致性、固定分值等值。

## 2. 用例清单

13 用例 / 2 describe。夹具 `makeRule`（:9-14）、`item`（:15-17，`unknown[]` 控制 confirmed）；纯函数。

| # | describe | 用例 | 行 |
| --- | --- | --- | --- |
| 1 | D04-D07 | D04 同事件择高+cap 分配+可重跑 | 20-33 |
| 2 | 同上 | A07 groupBy 分组独立封顶 | 34-50 |
| 3 | 同上 | A07 尾差对账（明细和==总分） | 51-65 |
| 4 | 同上 | D05 加权/显式 0/缺失非 0 | 66-78 |
| 5 | 同上 | D06 金额精确/cap/未知币种 | 79-93 |
| 6 | 同上 | D07 纯日期含首尾/非法日期 | 94-102 |
| 7 | 同上 | A07 下限 gte/0/未知 | 103-111 |
| 8 | 同上 | 分组未知键不合并+互斥 | 112-129 |
| 9 | 同上 | 三态条件/例外 | 130-136 |
| 10 | D09 | 冲突限额只挡其 claim，具名裁决选一 | 141-150 |
| 11 | 同上 | 同 ruleId 跨政策不能绕过裁决 | 152-165 |
| 12 | 同上 | 同 checkKey 跨目标独立求值 | 166-177 |
| 13 | 同上 | 固定分值等值比较 | 178-183 |

## 3. 真实断言

- 1：result `'10.00'`、allocation `{s1:'6.00',s2:'0.00',s3:'4.00'}`、重跑 `toEqual` 相同、含未确认去重键 → `awaiting-confirmation`（:28-32）。
- 2：result `'17.00'`、groupResults `[['["A"]','10.00'],['["B"]','7.00']]`、allocation `{a1:'6.00',a2:'4.00',b1:'7.00',b2:'0.00'}`、未知组键 → pending、reverse 输入 `toEqual` 相同（:43-49）。
- 3：result `'0.01'`、allocation `['0.01','0.00']`、`reduce(decimalT04)==decimalT04(result)`、precision 7 → pending、混合单位 → pending（:55-64）。
- 4：`87.75`/`73.50`（bonus=0 显式参与）、缺项 → pending 且 result null（:73-77）。
- 5：result `'180.00'`、`knownSubtotal '200.00'`、`excess '20.00'`；未知币种 → pending 但 knownSubtotal `'200.00'`；`decimalT04('0.1')+decimalT04('0.2')===decimalT04('0.3')`、`formatT04(decimalT04('2.345'),2)==='2.35'`（:84-92）。
- 6：首尾 compliant、`2024-12-31`/`2026-01-01` non-compliant、`2025-02-30`/带时区 → pending（:97-101）。
- 7：20 compliant、0 non-compliant、null pending、非法 minimum → pending（:106-110）。
- 8：`partition.groups` `[['["A"]',['a1','a2']],['["B"]',['b1']]]`、`unknownItems:['unknown']`；互斥同组 `non-compliant`、异组 `compliant`、未知 `pending`（:121-128）。
- 9：`all+not` → `'true'`、`any` 未知 → `'unknown'`、例外未知 → pending（:132-135）。
- 10：blocked.ruleIds `['faculty@1::b','school@1::a']`、selected `['date']`；具名决定后 blocked 0、selected `['a','date']`、excluded[0].ruleId `'b'`（:144-149）。
- 11：同 id 跨政策 blocked `['faculty@2::cap','school@1::cap']`；仅 selectedRuleId 仍 blocked 1；补 `selectedPolicyVersionId` 后选 `school@1`、excluded `faculty@2`（:159-164）。
- 12：两目标状态 `['compliant','non-compliant']`、checkKey `'cap'`、`toT04CheckResult(...).executedBy==='deterministic'`（:174-176）。
- 13：`score-value` 编译后 3 → `non-compliant`、4 → `compliant`（:181-182）。

## 4. 未覆盖与脆弱点

- 未覆盖：`level-mapping` 操作、`material-min-count`（在 published-plan 测试间接）、`formatT04` half-even/truncate、`evaluateT04Plan` 有效期（asOfDate）分支、`T04_BINDING_SET_MISMATCH` throw。
- 脆弱点：数值格式字符串断言（`'10.00'` 等）耦合 `formatT04` 默认 half-up/precision 2；`test.each` 无。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 13 用例断言如 §3 | 已证实 | 本文件逐行 |
| 尾差对账/分组封顶/未知≠0 被数值断言 | 已证实 | 用例 1-5 |
| 具名裁决语义被断言 | 已证实 | 用例 10-11 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| group-score（择高/cap/去重/尾差/groupBy） | §3 | 28-64 | covered |
| weighted/amount/dateRange/minimum | §3 | 73-110 | covered |
| partition/mutual-exclusion/conditionT04 | §3 | 121-135 | covered |
| resolveT04PolicyClaims 两场景 | §3 | 144-164 | covered |
| evaluateT04Plan 目标独立/toT04CheckResult | §3 | 174-176 | covered |
| level-mapping/有效期/MISMATCH | §4 | — | unknown（未测） |

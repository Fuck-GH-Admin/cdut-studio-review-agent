---
path: apps/electron/src/main/lib/review/review-v3-f07-plan-coverage.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0233e8ba3e0ce14ea04eeb72fa579df078bc15d2
sha256: b618d07326e0cab43fbc8e0109e6d902ba407e7bea14e3c380734a6a6c6890da
lines: 119
kind: test
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-f07-plan-coverage.test.ts

## 1. 测试目标

F07 冻结计划 × 真实检查结果（describe :46）：同 check×target×object 多主体的唯一 checkId、缺项 `not-executed`、RUN-36 无来源降级、指纹/重复回件不伪装已执行、allClear 判定。

## 2. 用例清单

5 用例 / 1 describe。夹具：`binding/rule/planOf/bound/proposal/document/source/checked`（:10-44，纯函数，`case-1`/`v1`/`frozen-1` 固定）。

| # | 用例 | 行 |
| --- | --- | --- |
| 1 | 共享 check/target/object 两主体→两唯一 checkId | 47-54 |
| 2 | 缺一结果→保留分母+not-executed | 56-66 |
| 3 | 来源只附已核实且被使用者 | 68-87 |
| 4 | 指纹不同/重复回件不伪装 | 89-105 |
| 5 | 合法/待定/全不适用/未读分别判定 | 107-118 |

## 3. 真实断言

- 1：coverage `{plannedChecks:2, completedChecks:2, effectiveVerdicts:2, pendingChecks:0}`、checkId 集 size 2、subjectIds `['alice','bob']`、每项 sourceRefs 1、`allClearVerdictAllowed` true（:49-53）。
- 2：状态 `['compliant','not-executed']`、coverage `{planned:2, completed:1, pending:1}`、allClear false（:63-65）。
- 3：无来源 → sourceRefs `[]`、status `awaiting-confirmation`、reason 含 `'缺少可核验来源'`（:71-74，RUN-36）；引用 `v2` 未核实 → blockers 含 `'来源 v2 未通过'`、allClear false（:76-78）；parseRevision 不匹配 → sourceRefs 空、allClear false（:85-86）。
- 4：`planFingerprint='stale'` → `not-executed`（:96）；同 binding 双结果 → `not-executed` 且 allClear false（:103-104）。
- 5：compliant→allClear true（:109）；awaiting→pendingChecks 1（:110）；not-applicable→allClear false（:111）；`usage:'unread'`→allClear false（:117）。

## 4. 未覆盖与脆弱点

- 未覆盖：blockers 文案（重复绑定/空计划/绑定不一致/文档身份重复/多定位）、`expectedCheckIds`、`execution-failed`。
- 脆弱点：`proposal` 夹具 outcome.sourceRefIds 与 verifiedSources 双通道来源语义靠断言组合覆盖。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 用例断言如 §3 | 已证实 | 本文件逐行 |
| not-executed 诚实缺项/RUN-36 降级被固定 | 已证实 | 用例 2/3 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 唯一 checkId/覆盖装配 | §3 | 49-53 | covered |
| 缺项 not-executed | §3 | 63-65 | covered |
| 来源核验/RUN-36 | §3 | 71-86 | covered |
| 指纹/重复回件 | §3 | 96-104 | covered |
| allClear 四态 | §3 | 109-117 | covered |
| blockers 其余文案 | §4 | — | unknown（未测） |

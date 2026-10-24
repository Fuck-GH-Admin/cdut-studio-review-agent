---
path: apps/electron/src/main/lib/review/source-current-validity-v3.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d332db50b28b6cf6ba011dd89fc4f829deb03096
sha256: 623adcc257da331c5e388b07fd860c5efb8b3563b7e11ca5b7ccd0ddddf45bf0
lines: 78
kind: test
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/source-current-validity-v3.test.ts

## 1. 测试目标

C1 / ARCH-003（describe :38）：材料退役时历史保留、当前确认撤销并留审计；无出处确认 fail-closed；旧写者读侧守卫拦截。被测 `revokeCurrentSourceValidity`/`currentSourceValidityBlockers`（`source-current-validity-v3`）+ `computeRunInputHash`（指纹变化验证）。

## 2. 用例清单

3 用例 / 1 describe。夹具 `fixture()`（:7-36）：`emptyAggregate` + old/new 两文档 + 两条 confirmed 观察/链接（user 确认）；纯内存，无 I/O/mock。

| # | 用例 | 行 | 场景 |
| --- | --- | --- | --- |
| 1 | 归档保留原件/值但撤销当前确认与链接 | 39-61 | reason 'archive' |
| 2 | 无出处当前确认在退役时 fail-closed | 62-72 | reason 'replace' |
| 3 | 无撤销元数据的旧写者被读侧守卫拦 | 73-77 | 仅 blockers |

## 3. 真实断言

- 1：blockers 含 `observation:obs-old`/`evidence:link-old`（:43-44）；revoke 后 obs-old `{confirmed:false, sourceRefs:[{documentVersionId:'old'}], value:{kind:'number',value:4}}`（值/引用保留，:46-48）；obs-new 不受影响（:49）；link-old `rejected`、link-new `confirmed`（:50-51）；`sourceValidityRevocations[0]` `toMatchObject({reason:'archive', documentVersionId:'old', previouslyConfirmedObservationIds:['obs-old'], previouslyConfirmedEvidenceLinkIds:['link-old']})`（:52-55）；blockers `toEqual([])`（:56）；`computeRunInputHash` 前后 `not.toBe`（:57-58）；重复 revoke `toHaveLength(1)`（:59-60）。
- 2：`unattributed` 观察 `confirmed:false` 且 `previouslyConfirmedObservationIds` 含 `'unattributed'`（:70-71）。
- 3：blockers 含 `observation:obs-old`（:76）。

## 4. 未覆盖与脆弱点

- 未覆盖：`stale-source`（跨案/parseRevision）、reason 其他取值、多版本同时退役、`evidence:` blocker 于 revoke 前后的对照（用例 1 只在 revoke 前查）。
- 脆弱点：`computeRunInputHash` 作为变化探针依赖其字段集；fixture 以 `as unknown as ReviewCaseV2` 绕类型。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 用例断言如 §3 | 已证实 | 本文件逐行 |
| 历史保留/审计/fail-closed 被固定 | 已证实 | 用例 1-3 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| revoke 主链（观察/链接/审计/幂等） | §3 | 43-60 | covered |
| 无出处 fail-closed | §3 | 62-72 | covered |
| 读侧守卫 | §3 | 73-77 | covered |
| 跨案引用/stale | §4 | — | unknown（未测） |

---
path: apps/electron/src/main/lib/review/pi-review-prompt-contract.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: bed1ab7c07d69c2e241badd0ad18f11c182b3e1a
sha256: da96224b027876e04f008c44c7b2303f5c8fe0596b1d20f7ac0394325f3e27fb
lines: 33
kind: test
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/pi-review-prompt-contract.test.ts

## 1. 测试目标

`piObservationFieldContract` 的字段契约文本（describe :4）：无字段禁自造 fieldKey、有字段逐条列 key/kind/作用域、不增删字段。纯函数。

## 2. 用例清单

3 用例 / 1 describe（:4-33）：

| # | 用例 | 行 | 设置 |
| --- | --- | --- | --- |
| 1 | 无字段要求 observations 为空并禁自造 | 5-9 | `{fields:[]}` |
| 2 | 有字段逐条列 key/kind/作用域 | 11-23 | 三字段（默认/case/sectionId） |
| 3 | 契约即模板真值不增删 | 25-32 | 单字段 |

## 3. 真实断言

- 1：`toContain('observations 必须省略或为 []')`、`toContain('不要为对象键、场景、条件、材料名')`（:7-8）。
- 2：`toContain('studentName | text | subject')`、`'academicYear | text | case（subjectId 必须是 case-abc）'`、`'awardDate | date | subject（subjectId 必须属于本案、匹配分项） | sectionId=awards'`、`'禁止添加任何未列出的 fieldKey'`（:19-22）。
- 3：`- ` 开头行 `toHaveLength(1)` 且含 `onlyOne`（:29-31）。

## 4. 未覆盖与脆弱点

- 未覆盖：label 含 `|`、object/rows/attachment kind、`scope` 缺省显示（用例 2 第一字段已隐含 subject 缺省）。
- 脆弱点：格式串精确断言（`' | '` 分隔）；`as never` 绕过类型（:18/:28）。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 用例断言如 §3 | 已证实 | 本文件逐行 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 无字段分支 | §3 | 7-8 | covered |
| 有字段分支（scope/sectionId） | §3 | 19-22 | covered |
| 不增删字段 | §3 | 29-31 | covered |
| 特殊 kind 展示 | §4 | — | unknown（未测） |

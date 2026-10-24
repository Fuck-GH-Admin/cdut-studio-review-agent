---
path: apps/electron/src/main/lib/review/field-validation.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 038e6123d6458e24db7826053aec173649aa472a
sha256: 718417c51016a17d69470b5a3563490f0ec0affbc444d72222e3dd59f9ac1dc3
lines: 38
kind: test
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/field-validation.test.ts

## 1. 测试目标

G03 字段类型/作用域校验（模板 schema 驱动）：未知 key 拒、subject 字段不入 case 作用域、非法数字/日期/枚举拒、合法值通过。

## 2. 用例清单

4 用例 / 1 describe（`字段校验（G03）` :15）。夹具 template（5 字段含 internal scope:subject，:6-14）；纯函数 `validateFieldValuesV2`（`application-service`）。

| # | 用例 | 行 |
| --- | --- | --- |
| 1 | 未知 key 拒绝 | 17-20 |
| 2 | subject 字段写 case 作用域拒绝 | 22-26 |
| 3 | 非法数字/日期/枚举类型拒绝 | 28-32 |
| 4 | 合法值通过 | 34-37 |

## 3. 真实断言

- 1：`issues[0].reason` 含 `不在模板中`。
- 2：case 作用域写 `internalNote` → 含 `不在模板中`；subject 作用域 → `[]`（作用域过滤 `(spec.scope ?? 'case')===scope` 的行为锚）。
- 3：`arrayContaining([stringContaining('有限数'), stringContaining('ISO'), stringContaining('枚举')])`。
- 4：`{name:'张三', score:'8', applyDate:'2026-10-05', level:'national-1'}` → `[]`（数值字符串兼容）。

## 4. 未覆盖与脆弱点

- 未覆盖：必填缺失（`必填字段缺失`）、`rawFieldTypeIssue` 各类型、boolean/multi/rows/object/attachment。
- 脆弱点：夹具 `as unknown as TemplateVersion`。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 用例断言如 §3 | 已证实 | 本文件逐行 |
| 作用域/类型门禁被固定 | 已证实 | 用例 1-4 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| 未知 key/作用域不符 | §3 | covered |
| number/date/enum 校验 | §3 | covered |
| 必填/rawFieldTypeIssue 全类型 | §4 | unknown（未测） |

---
path: apps/electron/src/main/lib/review/review-v3-t09-visibility.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6f5eb09641a701e3b259ec04ec8487a7ca4630e9
sha256: a720bc66fd0a76916ee1e68bc1f1c74249d4933ba02996e9a6aab35ba922fd71
lines: 42
kind: test
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-t09-visibility.test.ts

## 1. 测试目标

T09 学生导出权限回归（文件头 `:1`）：只有匹配的已发布模板才能把字段变 public——Main 边界，不是渲染层声明。被测：`t09PublishedStudentVisibility`（`review-v3-t09-main-service`）+ `projectForRole`（`offline-roundtrip`）。纯内存夹具（聚合 caseFields 三字段：applicant public/internalNote internal/neverDeclared 未声明）。

## 2. 用例清单

1 describe、**2 test**：

| # | test 行 | 断言要点 |
| --- | --- | --- |
| 1 | `:30-36` | 已发布匹配模板下投影：`fields==={applicant:'visible'}`（精确相等）；`internalNote`/`neverDeclared` 均不存在（`not.toHaveProperty`） |
| 2 | `:37-41` | `status:'draft'`、`version:1`（版本不符）、`undefined` 三种模板输入均 throw `T09_PUBLIC_TEMPLATE_NOT_PUBLISHED`（不回退渲染层声明） |

## 3. 真实断言

- #1 用 `toEqual` 精确对象断言 + 两条 `not.toHaveProperty`——即使案卷数据齐备（“even with populated case data”），internal 与未声明字段也被剔除。
- #2 三种拒绝都断言具体错误名（`T09_PUBLIC_TEMPLATE_NOT_PUBLISHED`）。
- 聚合夹具刻意含 `neverDeclared` 字段值，验证“模板未声明即不可见”。

## 4. 未覆盖与脆弱点

**未覆盖**：`projectForRole` 的 judge 角色投影；`fieldVisibility` 显式传入路径（`issueT09StudentPackage` 的 `fieldVisibility ?? {}`）；模板 fields 缺失/空数组。

**脆弱点**：夹具用 `as unknown as` 绕过类型；断言依赖 `offline-roundtrip.projectForRole` 的字段收集语义。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 test、纯内存 | 已证实 | `:29` |
| 仅 public 字段导出；internal/未声明剔除 | 已证实 | `:30-36` |
| 未发布/版本不符/无模板一律拒绝 | 已证实 | `:37-41` |
| judge 投影/空模板 | 未知 | 未覆盖 |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 被测分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| `t09PublishedStudentVisibility` 正常 | #1 | `:30-36` | covered |
| 三类模板拒绝 | #2 | `:37-41` | covered |
| `projectForRole` student 过滤 | #1 | `:32-35` | covered |
| judge 投影 | — | — | unknown |

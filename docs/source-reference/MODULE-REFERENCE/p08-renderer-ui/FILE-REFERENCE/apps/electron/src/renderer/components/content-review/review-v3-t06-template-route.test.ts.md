---
path: apps/electron/src/renderer/components/content-review/review-v3-t06-template-route.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c0842ae18e58bbf643e307d4dbd6a39257f87988
sha256: b880e32f8e83118e8197d90fe5c9b97eacc12055c8c844764f3a362d15130a43
lines: 46
kind: test
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-v3-t06-template-route.test.ts

## 1. 测试目标

`review-v3-t06-template-route.ts` 的模板建议与申请人提取（连带 `review-v3-t06-physical-intake` 的 preview/plan，同批）。红线对应：不静默猜模板、不把文件夹名当身份。

## 2. 用例清单

**3 个 `test()`**：混合业务逐案建议不同模板并 plan 成功（`:17-30`）、**未知/含糊目录不静默猜模板**（`:32-41`）、**只认显式申请人标注**（`:43-45`）。

## 3. 真实断言

- `:21-22` 两组分别命中 `venue-application`/`public-mail`；`:28-29` plan 无错误且 request 模板序列正确。
- `:34` '其他材料' → `toBeUndefined()`；`:39-40` 缺模板决策→`request` undefined 且 errors 含「模板」。
- `:44-45` 'G02-T01_申请人=张三' → '张三'；'公共邮箱申请' → `undefined`。

## 4. 未覆盖与脆弱点

未覆盖：`t06RequiredCaseFields/t06RequiredSubmissionSlots`、评分并列场景。**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 用例断言如 §3 | 已证实 | 逐行读 `:1-46` |
| 通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| 路由建议/拒绝猜测/申请人提取 | 3 | covered |

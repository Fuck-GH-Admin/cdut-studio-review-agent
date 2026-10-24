---
path: apps/electron/src/renderer/components/content-review/review-v3-t09-offline-form.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2842da085792c2e24d32039807c3a330aa3a1df5
sha256: c0cc4a1b85ec2f0b7249c86bc04317a1c08da652dbf71525b9d4c844dc328657
lines: 23
kind: test
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-v3-t09-offline-form.test.ts

## 1. 测试目标

`review-v3-t09-offline-form.ts` 的离线表单渲染与 **script 注入防护**（describe `T09 离线回件文件界面` `:5`）。被测逻辑见同组手册。

## 2. 用例清单

**1 个 `test()`**（`:6-22`）：学生补件任务渲染无需联网表单，材料文本不能注入 script。

## 3. 真实断言

`:15-21` 含「保存回件文件」/`.cdutreply`；**不含注入原文 `</script><script>alert(1)</script>`**；内联脚本可被 `new Script()` 编译不抛；`<script\b` 计数恰 2。

## 4. 未覆盖与脆弱点

未覆盖：judge 评分表单、附件编码/超限、保存链（需浏览器 crypto）。**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 用例断言如 §3 | 已证实 | 逐行读 `:1-23` |
| 通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| 渲染/注入防护 | 1 | covered |
| judge 型/保存链 | — | unknown |

---
path: apps/electron/src/renderer/components/content-review/review-v3-t08-suggestion.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 58d5edfa813f372e434d625dcbf5b60874ef88a0
sha256: f287272a1586c9c9996e5024690f27bbf30f5eb8915d665169081603f70b5322
lines: 35
kind: test
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-v3-t08-suggestion.test.ts

## 1. 测试目标

`review-v3-t08-suggestion.ts` 的字段目标/类型化草稿/更新负载（**不执行自然语言散文** `:26`）。被测逻辑见同组手册。

## 2. 用例清单

**2 个 `test()`**：仅暴露真实模板字段且保 scope（`:16-24`）、要求真实类型化值（`:26-35`）。

## 3. 真实断言

- `:18` 目标序列 `['实验室申请 · 人数','案卷 · 备注']`；`:19` number 负载 `toThrow('Main 的模板类型')`（text-only 限制）；`:20-21` text 负载正确；`:22` 模板版本 2 → `[]`；`:23` readOnly → `[]`。
- `:27-33` 0/18 通过、21 超 max、'十八人' 非数字、空串拒、boolean 'false'、'2026-02-30' 非真实日期各 `toThrow`；`:34` 类型不匹配 `toThrow('类型')`。

## 4. 未覆盖与脆弱点

未覆盖：enum/multi/date 合法分支、subject 负载正例。**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 用例断言如 §3 | 已证实 | 逐行读 `:1-35` |
| 通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| 目标/解析/负载 | 2 | covered |

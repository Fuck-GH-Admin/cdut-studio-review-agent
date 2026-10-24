---
path: apps/electron/src/main/lib/review/rule-section-scope.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 670050f8ce99865c3462012e9b86dc68c6f9b73e
sha256: c3dc76d130e67a846e3c8a43a761a111721a07b5cb13de56e99dc1763853537a
lines: 24
kind: test
package: p05-review-engine
author: docs-r07-author-nb-47-20261023
reviewer: p05-review-engine
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/rule-section-scope.test.ts

## 1. 测试目标

验证 `subjectsForRule`：分项规则只收所属分项事项、未限定分项作用于整案卷。不运行（`NOT_RUN`）。

## 2. 用例清单

2 用例（:18/:23），1 describe（:17）。fixture：双事项 study-a/service-a（:5-8）、`rule(sectionId?)` 工厂（:10-15）。
1. `rule('study')` → `['study-a']`（:19-21）。
2. `rule()` → `['study-a','service-a']`（:24-26）。

## 3. 真实断言

`:20-21`/`:25-26`：`expect(subjectsForRule(...).map(s=>s.id)).toEqual([...])`。

## 4. 未覆盖与脆弱点

未覆盖：无事项/多分项同 id。mock 边界：纯函数字面量。`NOT_RUN`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 用例/断言如 §2-3 | 已证实 | 逐行读 |
| 通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 分支 | 用例 | 状态 |
| --- | --- | --- |
| 有 sectionId 过滤 | #1 | covered |
| 无 sectionId 全量 | #2 | covered |

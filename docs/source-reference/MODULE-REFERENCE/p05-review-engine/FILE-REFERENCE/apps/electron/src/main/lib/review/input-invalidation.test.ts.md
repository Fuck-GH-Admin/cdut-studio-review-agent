---
path: apps/electron/src/main/lib/review/input-invalidation.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d130e7add6e6a04c5398e812dcf13cb92150b4a0
sha256: 44fb0937979b5c6689ac82da15c7f37186fa536f375e6f20032b354518f47e20
lines: 29
kind: test
package: p05-review-engine
author: docs-r07-author-nb-47-20261023
reviewer: p05-review-engine
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/input-invalidation.test.ts

## 1. 测试目标

验证 `invalidateDerivedReviewInputs` 三分支：新增材料清 items 保留 outline、领域包变化清 outline+confirmed、无关变化返回原引用。不运行（`NOT_RUN`）。

## 2. 用例清单

3 用例（:13/:19/:25），1 describe（:12）。fixture `baseCase`（:5-10，含 rulePacks[0].outline 一项）。
1. `applicationMaterialsChanged:true`（:13-18）：`next.items` toEqual([])、`next.rulePacks[0]?.outline` toHaveLength(1)。
2. `domainPackChanged:true`（:19-25）：items []、outline []、`confirmed` toBe(false)。
3. 空 changes（:26-29）：`expect(...).toBe(baseCase)`（同一引用）。

## 3. 真实断言

`:15-17`/`:21-24`/`:28`（toEqual/toHaveLength/toBe 如 §2）。

## 4. 未覆盖与脆弱点

未覆盖：`subjectDocumentsChanged` 单独分支（与 applicationMaterials 同 itemsChanged 语义）。mock 边界：纯函数+字面量 fixture（`as unknown as ReviewCase` :10）。`NOT_RUN`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 用例/断言如 §2-3 | 已证实 | 逐行读 |
| 通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 分支 | 用例 | 状态 |
| --- | --- | --- |
| itemsChanged | #1 | covered |
| domainPackChanged | #2 | covered |
| 无变化原引用 | #3 | covered |

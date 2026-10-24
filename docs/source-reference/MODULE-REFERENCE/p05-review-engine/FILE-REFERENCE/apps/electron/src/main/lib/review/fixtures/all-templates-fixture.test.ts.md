---
path: apps/electron/src/main/lib/review/fixtures/all-templates-fixture.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a0169feff2e3155a8e3edb359b1a2500a5d6f0d1
sha256: c148709196c9d8964abead01d63d4fd3540fb34471eca547f8ff7527d0337e12
lines: 50
kind: test
package: p05-review-engine
author: docs-r07-author-nb-47-20261023
reviewer: p05-review-engine
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/fixtures/all-templates-fixture.test.ts

## 1. 测试目标

N4/R02：六模板依赖完整可发布、seed 幂等、发布后全部 published、政策含虚构声明。不运行（`NOT_RUN`）。

## 2. 用例清单

4 用例（:17/:31/:39/:46），1 describe（:16）；`PROFER_CONFIG_DIR` 隔离（:11-13）。
1. 发布后 validateTemplate error 清零（:17-30）：fixtures 长度=BUILTIN_TEMPLATES_V2 长度；逐模板 `validateTemplate(...).filter(error)` toEqual([])。
2. 六政策六模板 published（:31-38）：`getPolicy(...).status`/`getTemplate(...).status` 均 `published'`。
3. 重复 seed 幂等（:39-45）：`policyRefs` toHaveLength(1)。
4. 虚构声明（:46-51）：`policy.content` toContain('虚构演示')、`origin.kind==='owner-statement'`。

## 3. 真实断言

`:24`/`:28`/`:35-36`/`:43`/`:49-50`（toEqual/toBe/toHaveLength/toContain 如 §2）。

## 4. 未覆盖与脆弱点

未覆盖：`publishAllTemplateFixtures` 失败分支、旧草稿升级路径。mock 边界：真实 policy/template-store。`NOT_RUN`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 用例/断言如 §2-3 | 已证实 | 逐行读 |
| 通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 被测函数 | 用例 | 状态 |
| --- | --- | --- |
| build/seed/publish 三函数 | #1-#4 | covered |
| 失败/升级分支 | — | unknown |

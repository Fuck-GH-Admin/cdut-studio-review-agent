---
path: apps/electron/src/main/lib/review/boot-check.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0e5510c3a6c7a740149b1bdf9788032070f991b1
sha256: a28a9c08d966ac3d2692c71acb4422cccd22e8f7a1cda8ebafd110480e7dd917
lines: 51
kind: test
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/boot-check.test.ts

## 1. 测试目标

M5 启动引导：首次注入默认模板并提示发布、二次启动幂等、V1 案卷列入可迁移、内置草稿不覆盖用户改动。

## 2. 用例清单

4 用例 / 1 describe（`runBootCheckV2（M5）` :13）。`PROFER_CONFIG_DIR` 隔离（:10-11）；真 `template-store`/`ensureBuiltinTemplateDrafts`；无 mock。

| # | 用例 | 行 |
| --- | --- | --- |
| 1 | 首启注入默认模板并提示发布 | 15-22 |
| 2 | 二启幂等（不再注入） | 24-27 |
| 3 | V1 案卷无 v2 文件列入可迁移 | 29-36 |
| 4 | 内置草稿已存在不覆盖 | 38-50 |

## 3. 真实断言

- 1：`templatesSeeded ≥ ALL_DEFAULT_TEMPLATES_V2.length`、`templatesPublished ≥ 1`（注释：综测 v3 播种时自动技术发布）、notes 无 `尚无已发布模板`。
- 2：`templatesSeeded === 0`。
- 3：造 `case-mig-1/case.json` → `migratableCases` 含 `case-mig-1`、note 含 `可迁移`。
- 4：用户改名 `用户改过的名字` 后再次 ensure → 名称不变（只允许编辑 draft 模板，注释 :41-42）。

## 4. 未覆盖与脆弱点

- 未覆盖：`filterMigratable`、无发布模板 note 分支、grant 修复分支。
- 脆弱点：`editable!` 非空断言依赖默认模板含 draft（:43-45）。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 用例断言如 §3 | 已证实 | 本文件逐行 |
| 幂等/不覆盖被固定 | 已证实 | 用例 2/4 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| runBootCheckV2 注入/统计/可迁移 | §3 | covered |
| ensureBuiltinTemplateDrafts 不覆盖 | §3 | covered |
| filterMigratable/无发布 note | §4 | unknown（未测） |

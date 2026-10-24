---
path: apps/electron/src/main/lib/review/template-asset-contract.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 00064f1719312c295150d1f1c4a8007bf7fcca52
sha256: 05cad30d2341c01d49e912130b3238eed01bc450939a29d3ce05aca665e21b39
lines: 69
kind: test
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/template-asset-contract.test.ts

## 1. 测试目标

模板资产契约回归（TAR-01/02/10/11/14/18）：D4 派生身份与场景保真、联合 rule ID 碰撞报错、政策 ID 路径边界。

## 2. 用例清单

3 用例 / 3 describe。夹具：`PROFER_CONFIG_DIR` 隔离（:14-16）；真实 `review-d4-catalog`（loadD4UnifiedCatalog/Workspace）与 `policy-store`（savePolicyDraft/getPolicy）；mock 边界：无 mock。

| describe | 用例（行） | 核心断言 |
| --- | --- | --- |
| TAR-01/02 | 派生 ID 与场景保真（19-40） | `demo.templateId===D4_DEMO_TEMPLATE_ID_PREFIX+entry.templateId`、`isDerivedDemoTemplateId` true、`derivedDemoTemplateId('g01-archive-utilization')==='d4demo-g01-archive-utilization'`（:23-26）；`sourceNote` 含 `D4_DERIVED_DEMO:`（:27）；sections 数=显式引用数（:30）且每个 section.id 在引用集（:33）；场景保留可核对文本 `【适用场景：`（:35-39） |
| TAR-14 | 联合 rule ID 碰撞（44-55） | `a-b`+`a`/`b-c` 拼接碰撞 → `validateTemplate` error 含 `规则 ID 冲突`（:53）；单分项无碰撞（:54） |
| TAR-18 | 政策 ID 路径边界（59-68） | `['../outside','a/b','has.dot','']` 均 `savePolicyDraft` `toThrow()` 且 `getPolicy` undefined（:64-66） |

## 3. 真实断言

如 §2 表内（逐条读自源文件 :23-39/:53-54/:64-66）。未见弱断言。

## 4. 未覆盖与脆弱点

- 未覆盖：TAR-10/11（标题含于 TAR-01/02 组内但无独立用例）、policy-store 其他入口（getPolicy 合法路径）。
- 脆弱点：依赖 `BUILTIN_TEMPLATES_V2[0]` 与 D4 目录内容（资产耦合）；`canonicalContentHash` 真实计算。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 用例断言如 §2 | 已证实 | 本文件逐行 |
| 真链路（D4 目录/policy-store） | 已证实 | §2 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| demoTemplateFromD4 派生/场景 | §2 | covered |
| validateTemplate rule ID 冲突 | §2 | covered |
| savePolicyDraft 路径守卫 | §2 | covered |
| TAR-10/11 独立断言 | §4 | unknown（未单测） |

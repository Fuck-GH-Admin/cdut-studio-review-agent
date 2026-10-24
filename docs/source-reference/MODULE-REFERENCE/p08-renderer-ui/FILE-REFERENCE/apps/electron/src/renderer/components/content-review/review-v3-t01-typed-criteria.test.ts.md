---
path: apps/electron/src/renderer/components/content-review/review-v3-t01-typed-criteria.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 763cf39f9f63bde242edd5b1fec2b024a1a195fd
sha256: b7744a52641310e3d5aa8c5bb21b6b5fb9dee1634f3fb1f92c009c8d378c0de9
lines: 96
kind: test
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-v3-t01-typed-criteria.test.ts

## 1. 测试目标

**T01 作者确认数值规则合同**（`apps/electron/src/renderer/components/content-review/review-v3-t01-typed-criteria.test.ts:21`）：A15 上限是声明式规则（非表单最大值/臆造政策）、签认可序列化来源版本化 T04 交接、边界改动失效重签、规则可复用非硬编码实验室、拒绝悬空字段/矛盾执行/未知数值/缺条款。

## 2. 用例清单

1 describe / 5 test。

| # | 名称 | 断言要点 | 行 |
| --- | --- | --- | --- |
| 1 | A15 声明式规则 | 数值规则形态断言（非表单 max/臆造政策） | `:22-34` |
| 2 | 签认可序列化 T04 交接 | `collectT01ConfirmedNumericChecks` 交接形状（来源版本化） | `:35-53` |
| 3 | 边界改动失效重签 | 改数值→旧签认清空 | `:54-66` |
| 4 | 规则可复用非硬编码 | 无关案卷级数值字段可复用 | `:67-80` |
| 5 | 拒四类非法 | 悬空字段/矛盾 execution/未知数值/缺条款全拒 | `:81-95` |

## 3. 真实断言

（`:22-95` 断言组——形态/交接/失效/复用/拒绝五面。）

## 4. 未覆盖与脆弱点

- 未覆盖：`collectT01RequiredMaterials` 分支。
- 脆弱点：`createT01Scenario` 夹具依赖（business-presets）。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 用例覆盖签认合同 | 已证实 | `:22-95` |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 面 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 声明式规则 | 1 | `:22-34` | covered |
| T04 交接 | 2 | `:35-53` | covered |
| 失效/复用 | 3-4 | `:54-80` | covered |
| 拒非法 | 5 | `:81-95` | covered |

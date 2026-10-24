---
path: apps/electron/src/renderer/components/content-review/review-v3-t01-business-presets.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: bb260efc247bcf01a51512ba7adf2c1b643da01e
sha256: dd0b083e91cf3de73e0de59d728501d203ed9b45f312f34ae2a5ba0eb6afdea3
lines: 79
kind: test
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-v3-t01-business-presets.test.ts

## 1. 测试目标

**T01 可配置业务模板**（`apps/electron/src/renderer/components/content-review/review-v3-t01-business-presets.test.ts:7`）：六大标准类+独立 A15 实验室可复用、laboratory 组织/无评分/初审→终审、无字段或计划不能试填、21 人是 T04 不合规检查不是表单 max、judging 不虚构评审等级、样例无开发者可录入且未审核、试填不改模板。

## 2. 用例清单

1 describe / 7 test。

| # | 名称 | 断言要点 | 行 |
| --- | --- | --- | --- |
| 1 | 六标准类+独立 A15 可复用 | 种子断言 | `:8-22` |
| 2 | laboratory 组织/无评分/两轮 | 形态断言 | `:23-36` |
| 3 | 缺字段/计划不能试填 | 拒 | `:37-43` |
| 4 | **21 人是 T04 非合规检查非表单 max** | 不被表单上限拒绝 | `:44-55` |
| 5 | judging 不虚构评审等级 | 评分但无假等级 | `:56-62` |
| 6 | 样例无开发者可录入、未审核 | 形态断言 | `:63-72` |
| 7 | 试填不改已起草模板 | 不变性 | `:73-78` |

（源文件 8 个 `test`，`:8-78`。）

## 3. 真实断言

（`:8-78` 断言组——场景形态/试填语义。）

## 4. 未覆盖与脆弱点

- 未覆盖：`conditionValue` 全分支。
- 脆弱点：7 场景种子内容断言。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 用例覆盖场景/试填语义 | 已证实 | `:8-78` |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 面 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 场景种子 | 1-2 | `:8-36` | covered |
| 试填语义 | 3-7 | `:37-78` | covered |

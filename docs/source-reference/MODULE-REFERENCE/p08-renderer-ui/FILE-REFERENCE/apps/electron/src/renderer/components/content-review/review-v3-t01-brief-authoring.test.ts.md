---
path: apps/electron/src/renderer/components/content-review/review-v3-t01-brief-authoring.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 39a954b4db6637b21f217811291df20cce063dfa
sha256: a185ee45574539a81840d554314be9311d2bcdc7e90a6bdf84f6fdf7a2f97953
lines: 98
kind: test
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-v3-t01-brief-authoring.test.ts

## 1. 测试目标

**T01 显式语言起草与诚实不确定性**（`apps/electron/src/renderer/components/content-review/review-v3-t01-brief-authoring.test.ts:8`）：A15 简报→无年份组织草案+人数上限+两轮本地审核；标签行识别；普通段落不误提取；主观要求不落规则；自由简报留 questions；重复起草不动种子；显式下界不声称 T04。

## 2. 用例清单

1 describe / 9 test。

| # | 名称 | 断言要点 | 行 |
| --- | --- | --- | --- |
| 1 | A15 完整简报→组织草案 | 无年份、人数上限、两轮审核 | `:9-38` |
| 2 | 行首不同标签识别 | 各标签正确归类 | `:39-46` |
| 3 | 普通中文段落不误提取 | 无冒号行不产字段 | `:47-62` |
| 4 | 未知主观要求不落规则 | 进 questions 不成政策规则 | `:63-68` |
| 5 | 自由简报留 questions | 可编辑草案+questions | `:69-74` |
| 6 | 重复起草不动七个种子 | 种子不变 | `:75-81` |
| 7 | 显式下界是草案检查 | 不声称 T04 执行 | `:82-95` |

## 3. 真实断言

（`:9-95` 断言组——七面。）

## 4. 未覆盖与脆弱点

- 未覆盖：`sourceKey`/`numericKind` 边界。
- 脆弱点：简报文案夹具与解析口径强耦合。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 9 用例覆盖起草诚实性 | 已证实 | `:9-95` |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 面 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| A15/标签/段落 | 1-3 | `:9-62` | covered |
| 诚实不确定性 | 4-7 | `:63-95` | covered |

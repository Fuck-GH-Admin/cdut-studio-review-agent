---
path: apps/electron/src/renderer/components/content-review/review-v3-f13-appeal-history.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 895a21003ec59323f1caedbdf7e6149fc802e906
sha256: 37c31d3c889f35a761e76cc2b6106a4c5b9d1778847ed70d318317b9117ac5ce
lines: 44
kind: test
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-v3-f13-appeal-history.test.ts

## 1. 测试目标

**F13 申诉历史读模型**（`apps/electron/src/renderer/components/content-review/review-v3-f13-appeal-history.test.ts:17`）：追溯原/更正决定+失效证据；旧 upheld/overturned 不自动认定；待处理不虚构更改。

## 2. 用例清单

1 describe / 3 test（`it`）。夹具 `fixture()`（`:5-15`）：d1(reject)/d2(amends d1)/task-1/appeal-1(overturned)/doc-1(active:false)。

| # | 名称 | 断言 | 行 |
| --- | --- | --- | --- |
| 1 | 追溯原决定/更正/任务/失效证据 | `original.id==='d1'`、`amendment.id==='d2'`、`originalSuperseded===true`、`reviewTask.id==='task-1'`、`outcomeLabel` 含「已追加更正」、`warnings` 含「部分证据已被后续材料版本取代」 | `:18-26` |
| 2 | 旧 upheld/overturned 不自动认定 | 去掉 resolution/reviewDecisionId→`outcomeLabel` 含「人工核对」、warning 含「upheld/overturned」 | `:28-34` |
| 3 | 待处理不虚构更改 | `status:'submitted'`→`outcomeLabel==='尚无最终复审结论'`、`originalSuperseded===false` | `:36-43` |

## 3. 真实断言

- `expect(entry?.originalSuperseded).toBe(true)`（`:22`）。
- `expect(legacy?.warnings.some((warning) => warning.includes('upheld/overturned'))).toBe(true)`（`:33`）。
- `expect(pending?.outcomeLabel).toBe('尚无最终复审结论')`（`:41`）。

## 4. 未覆盖与脆弱点

- 未覆盖：withdrawn/maintain-original 分支、回执匹配。
- 脆弱点：warning 文案片段断言。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 用例覆盖追溯/不推断/不虚构 | 已证实 | `:18-43` |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 面 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 追溯链 | 1 | `:18-26` | covered |
| 不推断法律含义 | 2 | `:28-34` | covered |
| 待处理语义 | 3 | `:36-43` | covered |

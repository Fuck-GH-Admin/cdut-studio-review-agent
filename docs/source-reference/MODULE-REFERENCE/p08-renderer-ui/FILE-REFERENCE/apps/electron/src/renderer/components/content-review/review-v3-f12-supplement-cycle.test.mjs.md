---
path: apps/electron/src/renderer/components/content-review/review-v3-f12-supplement-cycle.test.mjs
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: af8f130e80ea443d9e782a507d949fa7796d1811
sha256: a5a779b2c6cd37a27e83d7f6c55e67073364990b3ba0818af561bb0094aec88a
lines: 55
kind: test
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-v3-f12-supplement-cycle.test.mjs

## 1. 测试目标

**F12 合并补件与再审核门控**（`apps/electron/src/renderer/components/content-review/review-v3-f12-supplement-cycle.test.mjs:12`）：同要素合并不丢独立进度、全核结才放行、快照只展示新增、无基线不谎称新增。

## 2. 用例清单

1 describe / 4 test（**node:test + assert/strict**，`.mjs`）。夹具 `request/aggregate/document`（`:5-10`）。

| # | 名称 | 断言 | 行 |
| --- | --- | --- | --- |
| 1 | 同要素合并、进度不丢 | 3 清单项；「证明原件」`{requestIds:['sup-1','sup-2'], unresolvedRequestIds:['sup-2']}`；`awaitingVerification==1`、`awaitingReply==1`、`readyForReview===false` | `:13-26` |
| 2 | 全核结才放行 | satisfied+responded→false（回复未核验）；satisfied+cancelled→true；**仅 cancelled→false（无 satisfied）**；stage `awaiting-supplement`→`readyForReview:false`+`stageStillAwaitingSupplement:true` | `:28-39` |
| 3 | 快照只展示新增有效版本 | 基线 `['old']`、文档 old/new/inactive→`verifiedAsAddedAfterRequest===true`、只 `['new']` | `:41-48` |
| 4 | 无基线不谎称新增 | 无基线→`verifiedAsAddedAfterRequest===false`、`['old']` 全量 | `:50-54` |

## 3. 真实断言

- `assert.deepEqual(cycle.checklist.find((item) => item.title === '证明原件'), { title: '证明原件', requestIds: ['sup-1', 'sup-2'], unresolvedRequestIds: ['sup-2'] })`（`:20-22`）。
- `assert.equal(blocked.stageStillAwaitingSupplement, true)`（`:38`）。
- `assert.equal(candidates.verifiedAsAddedAfterRequest, false)`（`:52`）。

## 4. 未覆盖与脆弱点

- 未覆盖：`insufficient`→awaitingReply 分流细节。
- 脆弱点：要素合并 trim/小写口径（`' 证明原件 '` 归一）。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 用例覆盖合并/门控/快照 | 已证实 | `:13-54` |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 面 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 合并展示 | 1 | `:13-26` | covered |
| 再审核门控 | 2 | `:28-39` | covered |
| 快照基线 | 3-4 | `:41-54` | covered |

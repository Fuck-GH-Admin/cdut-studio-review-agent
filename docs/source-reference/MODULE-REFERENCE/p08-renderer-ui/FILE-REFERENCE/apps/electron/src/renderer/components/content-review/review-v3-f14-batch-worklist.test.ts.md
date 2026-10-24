---
path: apps/electron/src/renderer/components/content-review/review-v3-f14-batch-worklist.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5cef0f509f4ece7c926995e736e7cad0316be2d7
sha256: 849039ea2a2a70f021a262fa21b7f428191c73bab5157b0f18fe54ecef84173e
lines: 65
kind: test
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-v3-f14-batch-worklist.test.ts

## 1. 测试目标

**F14 百案名册与工作台队列**（`apps/electron/src/renderer/components/content-review/review-v3-f14-batch-worklist.test.ts:5`）：100 案名册精确绑定、并发 6 上限、可见范围选择、最新 Run 选取（`review-v3-t06-batch-intake` 的 `parseBatchManifest`/`previewBatchAssignment`/`buildBatchSummaryCsv` 一并断言）。

## 2. 用例清单

1 describe / 4 test。

| # | 名称 | 断言要点 | 行 |
| --- | --- | --- | --- |
| 1 | 100 案清单精确绑定 | `parsed.errors==[]`；103 行（98 ready/4 duplicate/1 unassigned）；**错名不绕过人工核对**（排除重复行后 `name-conflict`、ready 99） | `:6-26` |
| 2 | 历史查询并发 6 | `maximum===6`；结果顺序 `index*2` 稳定 | `:28-39` |
| 3 | 可见范围选择+CSV | 增选 `['case-1','case-50','case-2','case-3']`；减选剩 `['case-50','case-3']`；CSV 101 行、含 `"case-100"` | `:41-54` |
| 4 | 最新 Run 按业务结束时间 | 无 `completedAt` 的 `newest` 胜出（不依赖 Main 排序）；空→`undefined` | `:56-64` |

## 3. 真实断言

- `expect(assigned.filter((row) => row.status === 'ready')).toHaveLength(98)`（`:18`）。
- `expect(maximum).toBe(6)`（`:37`）。
- `expect(latestBatchRun(runs)?.id).toBe('newest')`（`:62`）。

## 4. 未覆盖与脆弱点

- 未覆盖：`mapWithConcurrency` 任务抛错传播。
- 脆弱点：名册 CSV 解析口径（`parseBatchManifest` 在 t06 模块，不在本批）。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 用例覆盖名册/并发/选择/排序 | 已证实 | `:6-64` |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 面 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 名册绑定 | 1 | `:6-26` | covered |
| 并发 | 2 | `:28-39` | covered |
| 选择/CSV | 3 | `:41-54` | covered |
| 最新 Run | 4 | `:56-64` | covered |

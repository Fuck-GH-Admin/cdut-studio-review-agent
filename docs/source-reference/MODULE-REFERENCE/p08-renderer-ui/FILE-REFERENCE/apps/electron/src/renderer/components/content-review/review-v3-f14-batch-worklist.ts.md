---
path: apps/electron/src/renderer/components/content-review/review-v3-f14-batch-worklist.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8d41fc259bf9c52d22b05b194165acac6cbadd28
sha256: 22459b0eb46275dfefc7cc16b682fc99436d9bae3be65eedfd78c091f88b9788
lines: 34
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-v3-f14-batch-worklist.ts

## 1. 结论与边界

**F14 工作台纯逻辑**（`apps/electron/src/renderer/components/content-review/review-v3-f14-batch-worklist.ts:1`）：限制案卷历史读取并发、保持可见范围操作准确性。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `mapWithConcurrency` | 函数 | `:3-17` | `(items, concurrency, task) => Promise<R[]>` 限并发 map |
| `latestBatchRun` | 函数 | `:19-22` | 按业务结束时间取最新 run |
| `selectVisibleBatchCases` | 函数 | `:25-34` | 全选只作用于可见范围（`:24` 注释） |

## 3. 内部逻辑与关键流程

- `mapWithConcurrency`（`:3-17`）：`workerCount = min(items.length, max(1, floor(concurrency)||1))`（`:14`）；worker 池消费共享 cursor；结果按索引回填（顺序稳定）。
- `latestBatchRun`（`:19-22`）：`reduce` 按 `completedAt ?? startedAt` 取最大（**不依赖 Main 返回排序**——test 锁定）。
- `selectVisibleBatchCases`（`:25-34`）：`Set(selected)` + 对 `visible` 增删——**筛选外选择不丢失**（`:24`）。

## 4. 调用者与调用链

- 消费方：BatchPanel（批量名册/历史查询）。
- 出向：无（纯函数）。

## 5. 数据 I/O、读写与副作用

纯函数；无 I/O。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 非有限/0 并发 | `:14` | 钳到 1 |
| 空历史 | `:19-22` | `undefined` |

## 7. 权限与权威状态

「不依赖 Main 排序」（`:19-22`）是结果权威口径；可见范围选择语义（`:24`）防误全选。

## 8. 修改影响面

- 并发钳制口径影响批量性能；`latestBatchRun` 时间字段契约（`startedAt/completedAt`）。

## 9. 测试证据

`review-v3-f14-batch-worklist.test.ts`（65 行，4 用例）直接覆盖。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 个导出 | 已证实 | `:3-34` |
| 并发钳制/可见范围语义 | 已证实 | `:14`、`:24-34` |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 3 个导出 | `:3-34` | covered |

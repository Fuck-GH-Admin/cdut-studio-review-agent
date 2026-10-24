---
path: packages/project-core/src/task-tool-names.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7ffb3929d71262123639a23c66b0e5ae0c3f8718
sha256: 7438071164ceb9f5150d9d101f405bc68c5918bb891268acb2283466fc9cbadc
lines: 23
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-47-20261023
reviewer: p07-shared-libs
status: authored
evidence: static
---

# packages/project-core/src/task-tool-names.test.ts

## 1. 测试目标

任务工具名归一：SDK 前缀名与历史裸名兼容。不运行（`NOT_RUN`）。

## 2. 用例清单

2 用例（:10/:17），1 describe（:9）；经 `./index` 引 4 函数（:2-7）。
1. SDK 前缀名（:10-15）：`normalizeTaskGraphToolName('mcp__task-graph__proma_task_create')==='proma_task_create'`；三判定 true（含 `mcp__task_graph__` 下划线变体）。
2. 裸名兼容（:17-22）：`TaskCreate`/`TaskUpdate` true、`proma_task_update` true、`mcp__automation__create_automation` false。

## 3. 真实断言

`:11-14`/`:18-21`（toBe 如 §2）。

## 4. 未覆盖与脆弱点

未覆盖：畸形名/空串。mock 边界：纯函数。`NOT_RUN`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 用例/断言如 §2-3 | 已证实 | 逐行读 |
| 通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 被测函数 | 用例 | 状态 |
| --- | --- | --- |
| 4 函数 | #1/#2 | covered |

---
path: packages/benchmark-multihop/src/dataset.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9dd2a0b9eaa8e56fc47c4d444c58e75d910446fa
sha256: b1bee4fdfd1f0f2ba5c72fcc6ff1151b0c786f2ec6a9d036122663929b86ac90
lines: 45
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# packages/benchmark-multihop/src/dataset.test.ts

## 1. 测试目标

内置样例**自洽性**（文件头 `packages/benchmark-multihop/src/dataset.test.ts:1-3`）：50 题四大题型齐备、证据标题均可命中语料。

## 2. 用例清单

1 describe、5 test（`:10/:14/:19/:30/:39`）。无夹具/无 mock（纯常量断言）。用例独立。

1. `:10-12` 自洽性校验无误。
2. `:14-17` 语料与题量符合设计。
3. `:19-28` 四大题型齐备。
4. `:30-37` 每条证据标题都能回溯到语料 key。
5. `:39-44` null query 无证据，其余题型至少两条证据。

## 3. 真实断言

- `:11` `expect(validateEmbeddedSample()).toEqual([])`。
- `:15-16` `corpus.length` 为 `18`、`queries.length` 为 `50`。
- `:24-27` 四题型计数均 `toBeGreaterThan(0)`。
- `:34` 对全部 `evidence.title`（`normalizeText` 归一）`titleIndex.has(...)` 为 true。
- `:41-42` null 题型 `evidence_list.length` 为 `0`；其余 `toBeGreaterThanOrEqual(2)`。

## 4. 未覆盖与脆弱点

未覆盖：查询/答案内容正确性（人工设计面）、`EMBEDDED_SAMPLE` 的 evidence.title 回填一致性（`:34` 间接经 normalizeText 相等覆盖）、null 题型答案语义。无 mock；依赖 `metrics.normalizeText`（跨模块断言工具）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 用例行号与断言文本 | 已证实 | `:10-44` |
| 运行结果 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| validateEmbeddedSample/计数/题型/回溯/证据数 | §3 | test:10-44 | covered |
| 内容正确性 | §4 | — | unknown（人工面） |
| 实际运行 | §5 | — | unknown（NOT_RUN） |

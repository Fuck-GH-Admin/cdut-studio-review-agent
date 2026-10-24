---
path: apps/electron/src/main/lib/review/case-timeline.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5e5ab358ee7b65ffe0dfc8a44f1c03794df2d3b9
sha256: 4ec18479905b931bb34b5c3f51c3d145efd42194d44e094e0562298f10e69f48
lines: 48
kind: test
package: p04-review-case-core
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/case-timeline.test.ts

## 1. 测试目标

验证案卷时间线的跨模块投影（RUN-32）：`buildCaseTimeline`/`summarizeTimelineSources`（`apps/electron/src/main/lib/review/case-timeline.ts:77-130`）的外部来源纳入、Run 归属保留、缺口报告与去重（`apps/electron/src/main/lib/review/case-timeline.test.ts:13`「案卷时间线跨模块投影（RUN-32）」）。

## 2. 用例清单

1 describe / 3 test。夹具：`aggregate`（单条 `ReviewLocalSubmit` 回执，`:5-9`）、`runs`（`run-1` completed，`:11`）。无 mock、无 IO（纯函数）。

| # | 名称 | 设置 | 动作 | 断言要点 | 行 |
| --- | --- | --- | --- | --- | --- |
| 1 | 纳入 T07 评分轮次、批次快照/outbox、离线回执与报告交接，并保留 Run 归属 | 五类 extra 全供（round-2 带 runId、judge-1） | `buildCaseTimeline(aggregate, runs, undefined, extra)` | source 包含 `t07-rating`/`batch-outbox`/`t09-offline`/`report-handoff`；rating 的 `runId==='run-1'`、`operatorLabel==='judge-1'`；倒序 `entries[0].source==='report-handoff'` | `:14-31` |
| 2 | 未提供的外部账本不被伪造，覆盖摘要明确缺口 | 不供 extra | `buildCaseTimeline(aggregate, runs)` + `summarizeTimelineSources()` | 所有条目 source ∈ {receipt, run}；覆盖表 `t07-rating.provided===false`、`receipt.provided===true` | `:33-39` |
| 3 | 同一来源同一 id 只投影一次 | 同 id `snap-1` 两条（frozen/reopened） | `buildCaseTimeline` | `batch-snapshot` 条目恰好 1 | `:41-47` |

**依赖顺序**：三用例独立，无共享可变状态。

## 3. 真实断言

- 用例 1：`expect(rating?.runId).toBe('run-1')`（`:27`）；`expect(entries[0]?.source).toBe('report-handoff')`（`:30`）。
- 用例 2：`expect(entries.every((entry) => entry.source === 'receipt' || entry.source === 'run')).toBe(true)`（`:35`）；`expect(coverage.find((item) => item.source === 't07-rating')?.provided).toBe(false)`（`:37`）。
- 用例 3：`expect(entries.filter((entry) => entry.source === 'batch-snapshot')).toHaveLength(1)`（`:46`）。

## 4. 未覆盖与脆弱点

- 未覆盖：`filterOperator` 过滤、`operatorOf` 的 system/mock/school/unknown 分派、`agent` 短码截取、receipt 无 actor 的旧记录标注、排序 tie-break 的 source/action 次序。
- 脆弱点：用例 1 的 `entries[0]` 依赖排序 tie-break；aggregate 用 `as unknown as CaseAggregateV2` 强转（`:9`），形状变化不会编译报错。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 用例断言与被测函数语义对应 | 已证实 | 只读核对本文件与 `case-timeline.ts` |
| 测试实际通过 | 未知 | NOT_RUN |
| 多来源同刻时间戳的稳定排序 | 未知 | 未构造同刻场景 |

## 6. 覆盖表

| 被测行为 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 五类外部来源+Run 归属+倒序 | 1 | `:14-31` | covered |
| 缺口不伪造+覆盖摘要 | 2 | `:33-39` | covered |
| 去重 | 3 | `:41-47` | covered |
| `filterOperator`/`operatorOf` 分派 | — | — | unknown（未覆盖） |

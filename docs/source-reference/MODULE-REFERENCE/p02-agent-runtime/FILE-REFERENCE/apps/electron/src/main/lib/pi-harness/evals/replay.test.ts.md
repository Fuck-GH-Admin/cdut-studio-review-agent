---
path: apps/electron/src/main/lib/pi-harness/evals/replay.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8313777a95a50412b50254c38c7f28d00cf67827
sha256: 7fb1a921fe9e0b1770a6c75a6efd1fa9577eb5abc90707d617b4527f94696a09
lines: 35
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/pi-harness/evals/replay.test.ts

## 1. 测试目标

`evaluatePiHarnessFixture`（`evals/replay.ts:30`）：稳定 fixture 语料 + 每例确定性通过 + 零自主迁移。bun:test；读 `evals/fixtures/*.json`（**域外数据**，`:7-11`）。

## 2. 用例清单

**2 个静态 `test(`**（机械 grep 核），其中第 2 个在 for 循环按 6 个 fixture 动态生成=**运行时 7 个用例**（如实记录）：

| 行 | 用例 | 要点 |
| --- | --- | --- |
| `:14` | fixture 语料清单锁定 | 6 名称精确 `toEqual`（失败无 mutation/手动压缩零副作用/冲突新根/原生重试压缩同 Turn/用户停止只暂停/已验证只记 shadow 候选） |
| `:25` | ×6 动态 | 双跑 `first` `toEqual(second)`、零 failures、passed=true、`taskTransitions` `toBe(0)` |

## 3. 真实断言

`:15-22` 6 名称数组；`:29-32` 一致/`failures` `toEqual([])`/`passed` `toBe(true)`/`taskTransitions` `toBe(0)`。

## 4. 未覆盖与脆弱点

fixtures 内容为域外数据（未在本批 scope 逐条核）；expected 可选字段=部分断言。断言≠已运行：**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 静态/7 运行用例、断言 | 已证实 | 全 35 行 |
| fixtures 数据正确性 | 边界 | 域外 |
| 测试通过状态 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 静态用例（7 运行） | §2/§3 | 14-34 | covered |

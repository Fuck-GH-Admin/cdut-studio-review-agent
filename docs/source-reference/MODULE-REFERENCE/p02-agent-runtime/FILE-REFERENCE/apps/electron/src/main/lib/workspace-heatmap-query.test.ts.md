---
path: apps/electron/src/main/lib/workspace-heatmap-query.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1b6b2cd38a39c2cf42b1d6169e47d65126b7738a
sha256: f2cc40f251052320673eb2f99d4ad711180f0a22a0aabc10727156be48d02d8a
lines: 42
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/workspace-heatmap-query.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

工作区热力图查询 facade：普通工作区筛选会话后复用既有聚合服务（DTO 口径一致）；缺失/团队工作区返回空数组。

## 2. 用例清单

共 2 个 `test(`（`apps/electron/src/main/lib/workspace-heatmap-query.test.ts:34,38`）。mock（`:14-29`）：`agent-session-manager`/`agent-workspace-manager`/`workspace-heatmap-service` 三模块 mock——聚合 mock 内嵌断言（workspaceId 必须 `'personal-1'`、selectedSessions 必须恰好 session-1/2 的 DTO）。

| # | 用例（行） | 真实断言 |
| --- | --- | --- |
| 1 | 普通工作区筛选复用（`:34`） | `loadWorkspaceHeatmapDaily('personal-1')` `toEqual(heatmap)`（mock 内校验 DTO 映射含 archived 字段、剔除他工作区 session-3） |
| 2 | 缺失/团队返回空（`:38`） | `loadWorkspaceHeatmapDaily('missing')` `toEqual([])`；`'team-1'` `toEqual([])` |

## 3. 真实断言

逐条见上表（`:35,39-40`）。mock 边界：三依赖模块 mock（`mock.module`）；facade 逻辑真实。

## 4. 未覆盖与脆弱点

未覆盖：`getWorkspaceHeatmapDaily` 聚合算法（文件外）、空会话列表场景。mock 内断言使 DTO 契约依赖 mock 书写。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 个用例 | 已证实 | `grep test(` |
| DTO 筛选口径 | 已证实 | `:14-29`（mock 内断言） |
| 团队/缺失空数组 | 已证实 | `:39-40` |
| 聚合算法 | 未知 | 文件外 |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 筛选+复用 | 1 | 34-36 | covered |
| 空数组分支 | 2 | 38-41 | covered |
| 聚合算法 | 无 | — | unknown |

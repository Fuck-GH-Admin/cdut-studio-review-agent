---
path: apps/electron/src/main/lib/cslab/cslab-plot-history.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 206638c1b52e85c45720563a784a8fc9dd9aa424
sha256: 2be059f3da0d17fcdfef02db998a95d0c41a924afbc311ee15a7a754c39c1bca
lines: 93
kind: test
package: p03-integrations
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-plot-history.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

CSLab 绘图撤销快照（`:1-3`）：绘图不存在时快照返回 null；v1→v2 覆盖后凭 token 回滚恢复 v1；已消费令牌二次回滚返回 null（一次性）；非法令牌（路径穿越）被拒且不触碰文件。

## 2. 用例清单

共 4 个 `test(`（`apps/electron/src/main/lib/cslab/cslab-plot-history.test.ts:37,43,66,80`）。夹具：`PROFER_CONFIG_DIR` 临时根 + `createLab` 真实实验室（`:15-20`）；`createPlotDocument`（`@profer/shared`）造文档。

| # | 用例（行） | 真实断言 |
| --- | --- | --- |
| 1 | 不存在→null（`:37`） | `createPlotUndoSnapshot` `toBeNull()` |
| 2 | 覆盖后回滚恢复 v1（`:43`） | token `toBeTruthy()`；覆盖后 `loadPlot` title `'金红石 v2'`；restore 后 title `'金红石 v1'`；重读 `'金红石 v1'` |
| 3 | 令牌一次性（`:66`） | 首次 restore→`'金红石 v3'`；二次 `toBeNull()` |
| 4 | 非法令牌拒（`:80`） | `undoToken:'../../etc/passwd'` → `toBeNull()`；前后 `loadPlot` title 相等（不触碰文件） |

## 3. 真实断言

逐条见上表（`:40,49-63,75-77,89-91`）。mock 边界：无 mock；真实临时根+真实 sqlite（`createLab`）+真实文件快照（`savePlot/loadPlot/createPlotUndoSnapshot/restorePlotUndoSnapshot` 全真实实现）。

## 4. 未覆盖与脆弱点

未覆盖：HISTORY_LIMIT 20 份修剪、`plot.labId` 不符分支、快照损坏分支。afterAll 注释：Windows 下 SQLite 句柄可能延迟释放（`:28-29`）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 个用例 | 已证实 | `grep test(`；`:37-92` |
| null/回滚/一次性/防穿越 | 已证实 | `:40-91` |
| 修剪/跨 lab 分支 | 未知 | 未覆盖 |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 快照 null | 1 | 37-41 | covered |
| 回滚恢复 | 2 | 43-64 | covered |
| 一次性消费 | 3 | 66-78 | covered |
| 非法令牌 | 4 | 80-92 | covered |
| 修剪/跨 lab | 无 | — | unknown |

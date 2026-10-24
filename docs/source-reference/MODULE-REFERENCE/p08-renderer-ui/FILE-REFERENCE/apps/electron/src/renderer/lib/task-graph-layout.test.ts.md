---
path: apps/electron/src/renderer/lib/task-graph-layout.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 205270932e0595b3e42c3b37d7d2ab36a8d25278
sha256: 2ca50b3fd98798bbf776fcbf3f91bd2842c0fd8de56687d25cc2ab812f46c8f4
lines: 116
kind: test
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/task-graph-layout.test.ts

## 1. 测试目标

验证 `computeTaskGraphLayout` 的四条布局不变量：最长依赖路径作左→右主线、支线贴最近主线锚点下方、fork 探索不进依赖主线、无关任务进 unlinked 泳道，以及与 task-map 插入序无关（task-graph-layout.test.ts:33）。工厂 `node()`/`graph()` 构造 `TaskNode`/`TaskGraph`（:5-27）。框架 `bun:test`（:1）。本轮 `NOT_RUN`，纯静态阅读。

## 2. 用例清单

机械计数 `test(`=5、`it(`=0、`test.each(`=0，共 5 个用例（单 describe）：

1. `keeps the longest dependency path as a left-to-right mainline`（task-graph-layout.test.ts:34-46）
2. `keeps branches below their nearest mainline anchor`（:48-66）
3. `keeps forked exploration off the dependency mainline`（:68-86）
4. `moves disconnected work into an unlinked lane below the execution flow`（:88-101）
5. `does not depend on task-map insertion order`（:103-115）

## 3. 真实断言

task-graph-layout.test.ts:42 `expect(layout.mainline).toEqual(['plan','implement','verify'])`；:43-45 x 严格递增与同 y（`toBeLessThan`/`toBe`）；:59-61 支线 x 相等（`research.x === plan.x`）且 y 递增；:64-65 `branchEdge?.x1` `toBe(plan.x + 130)`、`y1` `toBe(plan.y + 100)`（节点宽 260/2 = 130、高 100）；:84 主线仍为三节点、:85 `explore-a.y > plan.y`；:98 `layout.unlinkedLane?.count` `toBe(2)`、:99-100 泳道 y 关系；:113-114 反序输入 `second.mainline`/`second.positions` 与 first 全等（`toEqual`）。

## 4. 未覆盖与脆弱点

未覆盖空图分支（task-graph-layout.ts:200）、环状依赖、多锚点分桶 tie-break、`routeEdge` 横向路由分支（:180-191）与 `edges` 的 `d` 路径串。脆弱点：:64-65 的 130/100 与 `TASK_GRAPH_NODE_WIDTH/HEIGHT` 常量耦合；:23 `graph()` 工厂把 dependsOn 同时写入 edges，与源码 :78 的反向补边叠加，测试图形状强依赖该约定。无动态调用。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 用例与断言行真实存在 | 已证实 | task-graph-layout.test.ts:34-115 机械计数 |
| 测试运行结果 | 未知 | NOT_RUN（断言≠运行） |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 主线选取/坐标序 | §2/§3 | task-graph-layout.test.ts:34-46 | covered |
| 支线下挂+边端点 | §3 | :48-66 | covered |
| fork 隔离 | §3 | :68-86 | covered |
| unlinked 泳道 | §3 | :88-101 | covered |
| 确定性（插入序无关） | §3 | :103-115 | covered |
| 空图/环/横向路由 | §4 | — | unknown |

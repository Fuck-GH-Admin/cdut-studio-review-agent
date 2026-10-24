---
path: apps/electron/src/renderer/lib/task-graph-layout.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 921249c3b820490cecc867e24f4198cb1d6106ed
sha256: 7eb75d999bc564e06992b12dce9709c19dd65f3fdb3055009aa121a646d1f547
lines: 277
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/task-graph-layout.ts

## 1. 结论与边界

任务图稳定布局求解（277 行）：最长近期依赖路径为主线（左→右），支线贴在最近主线锚点下方，无关任务移入下方 unlinked 泳道网格（task-graph-layout.ts:194-197 注释）。输入 `TaskGraph`，输出坐标/边路由/画布尺寸的 `TaskGraphLayout`。确定性纯函数，不渲染。

## 2. 导出与关键符号

常量 3 个：`TASK_GRAPH_NODE_WIDTH = 260`（task-graph-layout.ts:3）、`TASK_GRAPH_NODE_HEIGHT = 100`（:4）、`TASK_GRAPH_CANVAS_PADDING = 70`（:5）；类型 4 个：`TaskGraphNodePosition`（:13-17）、`TaskGraphEdgeRoute`（:19-28）、`TaskGraphUnlinkedLane`（:30-34）、`TaskGraphLayout`（:36-43）；函数 1 个：`computeTaskGraphLayout(graph: TaskGraph): TaskGraphLayout`（:198-277）。内部符号：间距常量 `MAINLINE_GAP_X=84`（:7）、`BRANCH_GAP_Y=24`（:8）、`UNLINKED_LANE_GAP_Y=76`（:9）、`UNLINKED_GRID_GAP_X=44`（:10）、`UNLINKED_GRID_GAP_Y=28`（:11）、接口 `DirectedRelation`（内部，:45-49）、`PathScore`（内部，:51-54）、函数 `compareNodes`（内部，:56-58）、`comparePathScores`（内部，:60-64）、`collectRelations`（内部，:66-84）、`buildAdjacency`（内部，:86-99）、`selectMainline`（内部，:101-123）、`findMainlineAnchor`（内部，:125-149）、`routeEdge`（内部，:151-192）。

## 3. 内部逻辑与关键流程

按执行顺序：

1. `compareNodes`（:57）：`createdAt` 差 → `id.localeCompare` 稳定排序。`comparePathScores`（:61-63）：路径长降序 → `latestUpdatedAt` 降序 → ids 串 localeCompare 平局决出。
2. `collectRelations`（:67-83）：`Map` 按 `dependency|fork:from:to` 去重（:70-71）；跳过缺节点/自环（:69）；每节点 `dependsOn` → 有向依赖 `dep→node`（:75），`forkFrom` → fork 边（:76）；`graph.edges` 反向补边 `edge.to→edge.from`（:78），`graph.edges`/`forkEdges` 全部纳入（:78-79）；结果确定性排序（:81-83）。
3. `buildAdjacency`（:90-98）：children/parents 邻接表，各列表排序。
4. `selectMainline`（:102-122）：节点排序后取无父节点为根（:103），无根则全节点起步（:104）；`walk` 递归带 seen 集防环（:108-110），自底向上择最优子路径（`comparePathScores`，:112-113），拼接 `[id, ...child.ids]` 并取 `latestUpdatedAt` max（:115-117）；起点候选排序取胜者（:120-122），空图返回 `[]`。
5. `findMainlineAnchor`（:130-148）：BFS 沿 parents 上溯至主线节点，记录 `{index, depth}`（:139）；排序 `depth` 升序 → `index` 降序取首（:147），无锚返回 null。
6. `routeEdge`（:155-191）：任一端无坐标 → null（:157）；按中心偏移决定竖/横路由（:163）；竖向 `M x1 y1 C x1 midY, x2 midY, x2 y2` 贝塞尔（:176），横向同理（:190）。
7. `computeTaskGraphLayout`（:198-277）：nodeIds 确定性排序（:199）；空图 → 零尺寸布局（:200）；主线只取非 fork 关系（:204，注释：fork 是探索血缘不夺主线）；主线节点横排 `x = 70 + i*(260+84)`、`y = 70`（:211-217）；非主线节点按 `findMainlineAnchor(allParents)` 分桶到锚点下方 `y = anchor.y+100+24+row*(100+24)`（:221-248），无锚进 `unlinkedIds`（:224-227）；unlinked 泳道 `y = bottom+76`，列数 `max(1, ceil(sqrt(n*1.8)))` 网格排布（:251-264）；`orderedPositions` 按 nodeIds 序（:266），`right` 取最大 `x+260`（:267），边由全关系路由并过滤 null（:268）；返回 `width = right+70`、`height = bottom+70`、`unlinkedLane` 条件展开（:269-276）。

## 4. 调用者与调用链

- 入向（冻结树 grep）：`apps/electron/src/renderer/components/agent/ProjectGraphPanel.tsx:31-33` import 三常量、`:58-60` 别名 `NODE_W/NODE_H/CANVAS_PAD`、`:520` `React.useMemo(... computeTaskGraphLayout(graph) ...)`；测试 `task-graph-layout.test.ts:3`。无其它引用（检索范围：baseline 全树 grep `computeTaskGraphLayout|TASK_GRAPH_NODE_WIDTH|TASK_GRAPH_CANVAS_PADDING`）。
- 出向：类型 `TaskGraph`/`TaskNode`（`@profer/project-core`，types.ts:70/17）。无运行时调用、无 DOM/IO。

## 5. 数据 I/O、读写与副作用

纯函数：每次调用新建局部 Map（:209 等），无模块级状态、无副作用；输入 `graph` 只读不改。

## 6. 分支、失败、取消与恢复

空图 → `{positions:[],edges:[],mainline:[],width:0,height:0}`（:200）；缺节点/自环关系跳过（:69）；环由 walk 的 seen 集与 anchor BFS 的 seen 集防护（:109-110、:131-143）；无父节点时全节点作起步（:104）；`routeEdge` 缺坐标返回 null 被过滤（:157、:268）；unlinked 为空则无 `unlinkedLane` 字段（:250-273）；无 throw、无取消语义。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。

## 8. 修改影响面

坐标/间距/路由变更直接影响 `ProjectGraphPanel.tsx:58-60`（常量消费）与 `:520` 的画布渲染；`TASK_GRAPH_NODE_WIDTH/HEIGHT` 被边路由（:159-191）与画布尺寸（:267-275）共同依赖，改动需全局校验；需同步 `task-graph-layout.test.ts` 5 用例（含 `+130`/`+100` 硬编码坐标断言）。

## 9. 测试证据

`NOT_RUN`（本轮未运行测试，纯静态阅读）。测试文件 `task-graph-layout.test.ts`，机械计数 `test(`=5（`it(`=0、`test.each(`=0）。真实断言：task-graph-layout.test.ts:42-45（主线序与 x 递增/同 y）、:59-65（支线同 x、y 递增、边起点 = x+130/y+100）、:84-85（fork 不进主线）、:98-100（unlinkedLane.count=2 同行 y 相等）、:113-114（插入序无关）。断言≠运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 布局全流程（关系收集→主线→支线→泳道→路由） | 已证实 | task-graph-layout.ts:198-277 全文 |
| fork 不夺主线、确定性排序 | 已证实 | :204 注释 + :81-83/:199 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| computeTaskGraphLayout 主流程 | §3 | task-graph-layout.ts:198-277 | covered |
| collectRelations | §3 | :66-84 | covered |
| selectMainline | §3/§6 | :101-123 | covered |
| findMainlineAnchor | §3 | :125-149 | covered |
| routeEdge | §3/§6 | :151-192 | covered |
| 支线/泳道排布 | §3 | :219-264 | covered |
| 导出常量/类型 | §2 | :3-43 | covered |

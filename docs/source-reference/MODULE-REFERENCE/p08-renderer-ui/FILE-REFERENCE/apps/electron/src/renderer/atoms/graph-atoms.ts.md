---
path: apps/electron/src/renderer/atoms/graph-atoms.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: fe3fe46991648b543ae89189103ddc8e402e6b77
sha256: cd54a2c1c9411985b82602501845084cabf3ffa9239fed27d2e18da772acd721
lines: 162
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/graph-atoms.ts

## 1. 结论与边界

Graph 数据 Jotai atoms（162 行，头注释 `:1-13`）：**三源架构**——持久化图（JSONL 重放）始终为 baseline + 流式 TaskItem overlay（设计决策 2026-07-15，消除流式/持久切换的图突变）。按 sessionId 切片持久化，避免会话间污染。

**边界**：图派生/摘要在 `@profer/project-core`（`deriveGraph`/`generateSummary`，跨批）；TaskItem 聚合在 `@/components/agent/task-progress`（`aggregateTaskItems`/`isTaskProgressTool`，跨批）；IPC getGraph 写入方=AgentView/useGraphData（跨批）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `persistedGraphAtomFamily` | atomFamily（导出） | 37-39 | `(sessionId) => atom<TaskGraph \| null>` | IPC 回退层（流式结束加载的持久图） |
| `currentGraphAtom` | 派生 atom（导出） | 122-155 | `TaskGraph \| null` | 当前会话图派生 |
| `currentGraphSummaryAtom` | 派生 atom（导出） | 158-162 | `GraphSummary \| null` | `generateSummary(currentGraph)` |

内部：`mergeRealTimeIntoGraph`（`:50-109`，纯函数）。导出合计 3。

## 3. 内部逻辑与关键流程

1. **mergeRealTimeIntoGraph(baseGraph, taskItems)**（`:50-109`，纯函数不改输入）：
   - 空 taskItems → 原样返回（`:51`）；`realtimeGraph = deriveGraph(taskItems)`（`:53`）。
   - 已有节点（`:58-69`）：`status`/`subject` 覆盖（subject 仅不同才写 `:64`）、`description` 仅 rtNode 定义且不同才写（`:65-66`）、`dependsOn` **合并只增不删**（Set 去重，`:67`）、`updatedAt=now`。
   - 新节点直接采用 deriveGraph 结果（`:72`）。
   - 边重建（`:77-91`）：baseline 边 + `dependsOn` 去重补依赖边 + `forkFrom` 存在时补 forkEdge（均查重）。
   - `dependedBy` 全局 reconcile（`:94-106`）：先清空再按 edges 反向填充，保证与 edges 一致。
2. **currentGraphAtom**（`:122-155`）：无 sessionId → null（`:123-124`）；取 `agentStreamingStatesAtom` 的会话态与 `persistedGraphAtomFamily(sessionId)`（`:126-128`）。
   - `state.running`（流式中，`:131-150`）：baseline = persistedGraph ?? 空图（`:132-137`）；`toolActivities.filter(isTaskProgressTool)`（`:138-142`）→ `aggregateTaskItems(taskActivities, false)`（`:144`）非空 → merge，否则返回 baseline（`:149`）。
   - 非流式：**直接返回 persistedGraph（可为 null）**（`:152-154`）。关键注释（`:118-120`）：null 是正常的——useGraphData 的 IPC getGraph 异步补上；若兜底空图，`atomGraph ?? ipcGraph` fallback 将永远走不到 ipcGraph。
3. **currentGraphSummaryAtom**（`:158-162`）：graph 为 null → null；否则 `generateSummary(graph)`。

## 4. 调用者与调用链

入向（全冻结树检索 `graph-atoms`，3 文件）：`components/agent/GraphQuestionInput.tsx:22`（`currentGraphAtom`）、`components/agent/AgentView.tsx:125`（`persistedGraphAtomFamily`）、`components/agent/ProjectGraphPanel.tsx:26`（两者）。
出向：`jotai`/`jotai/utils`、`@profer/project-core`（`:17-25`）、`./agent-atoms`（`agentStreamingStatesAtom`/`ToolActivity`/`currentAgentSessionIdAtom`，`:26-27`）、`@/components/agent/task-progress`（`:28`）。均跨批。

## 5. 数据 I/O、读写与副作用

无直接磁盘/网络（不适用）。状态=persistedGraphAtomFamily（内存，IPC 写入方跨批）+ 派生计算；`Date.now()` 作 updatedAt（`:55`/`:108`）。

## 6. 分支、失败、取消与恢复

- 分支：空 taskItems 短路（`:51`）；running/非流式二分（`:131`）；无 sessionId → null（`:123-124`）；fallback 链语义（`:118-120`）。
- 无 throw（不适用，依据：全文无 throw）。
- 恢复：persistedGraph 即 IPC 回退层（`:31-33` 注释）；null → useGraphData 异步补。

## 7. 权限与权威状态

无权限分支（不适用）。权威=持久化 baseline + 实时 overlay 的合成（overlay 覆盖 status/subject，`:60` 注释"更当前"）；`aggregateTaskItems` 第二参数 `false` 的语义在跨批实现（〔未知〕，不杜撰）。

## 8. 修改影响面

- 3 个消费方（图问答输入/AgentView/项目图面板）的图显示；merge 语义变化影响流式期间的图稳定性（`:10-12` 注释的"散掉"根因）。
- `persistedGraphAtomFamily` 按会话切片是防污染设计（`:34-36` 注释）；改全局单值会复现"任务图到处飞"。
- 需同步关注：`@/components/agent/task-progress`、`@profer/project-core`（跨批）接口。

## 9. 测试证据

直接测试：**无**（全冻结树检索 `graph-atoms` 无测试命中；检索范围=baseline/source 全树）。间接线索：批外 `task-progress.test` 等（测 `aggregateTaskItems`/`deriveGraph`，非本文件）。`mergeRealTimeIntoGraph` 为内部纯函数，无直接断言。

`NOT_RUN`：本轮未运行任何测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 三源架构/merge 规则/fallback 链语义 | 已证实 | `:1-162` 全文逐行 |
| 3 个调用方 | 已证实 | 全树检索（§4） |
| `aggregateTaskItems(taskItems, false)` 第二参语义 | 未知 | 跨批实现，不杜撰 |
| `deriveGraph`/`generateSummary` 行为 | 边界（跨批） | `:17-25` |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `persistedGraphAtomFamily` | §2/§8 | 37-39 | covered |
| `mergeRealTimeIntoGraph` 全规则 | §3.1 | 50-109 | covered |
| `currentGraphAtom`（running/非流式/null） | §3.2/§6 | 122-155 | covered |
| `currentGraphSummaryAtom` | §3.3 | 158-162 | covered |

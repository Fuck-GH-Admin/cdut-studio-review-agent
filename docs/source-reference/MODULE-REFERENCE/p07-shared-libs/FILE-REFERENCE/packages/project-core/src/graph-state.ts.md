---
path: packages/project-core/src/graph-state.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e63d5da48f3612eafee199ba1a4c0b93bafbf8ad
sha256: edd63b6ae034a11bbad013121bc223bee6878e0449cefc0baae1aeb7ccfc7492
lines: 480
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-47-20261023
reviewer: p07-shared-libs
status: authored
evidence: static
---

# packages/project-core/src/graph-state.ts

## 1. 结论与边界

JSONL 事件重放构建 TaskGraph 状态（头注释 :1-11）：纯函数、幂等、按 timestamp 排序冲突后胜。8 事件类型全量重放 + 全局 reconcile（dependedBy 反向引用修复）。浏览器安全（无 Pi/Electron/模型/持久化依赖）。

## 2. 导出与关键符号

导出 9 条（`export` :51/:74/:371/:380/:391/:399/:445/:452/:473）：

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `buildGraphFromEvents(events)` | `:51-69` | 排序后逐事件 applyEvent，末尾 reconcileDependedBy（:62）；updatedAt=末事件时间戳（:64-66） |
| `applyEvent(graph, event)` | `:74-366` | 不可变更新（nodes 浅拷贝+edges/forkEdges 深拷贝 :75-78） |
| `createEmptyGraph()` | `:371-373` | 空图 |
| `isTaskReady(node, graph)` | `:380-386` | pending 且全部依赖 completed |
| `getReadyTasks(graph)` | `:391-393` | 全部 ready 节点 |
| `topologicalSort(graph)` | `:399-438` | Kahn 算法（注释 :397） |
| `serializeEvent/deserializeEvent` | `:445-468` | JSONL 行往返；deserialize 形状校验（type/timestamp/taskId/payload :455-462），坏行返 null（:465-467） |
| `parseEventsFromJsonl(jsonl)` | `:473-480` | 多行解析，过滤 null |

内部符号：`reconcileDependedBy`（:31-46，从 edges 重建全部 dependedBy，修复乱序丢失）。

## 3. 内部逻辑与关键流程

`applyEvent` 8 分支（:80-363）：
1. `task_created`（:81-125）：forkFrom 三级回退（显式→description→subject :85）；artifact description 优先（:86-87）；abandonReason 存在→status 初始 'cancelled'（:94）；加依赖边+dependedBy（:108-118）；fork 边（:121-123）。
2. `task_updated`（:127-203）：结构化 dependsOn（含 []）/description 标记为权威完整列表、subject 兜底合并（:135-143 注释「Agent 移除依赖时边也消失」）；显式替换清理旧边+dependedBy（:146-162）；否则合并去重（:164-168）；fork 边先清后加（:194-201）。
3. `task_status_changed`（:205-245）：缺 created 事件时容错建节点并从已有 edges 恢复依赖（:214-242，防孤立节点）。
4. `task_dependency_added`（:247-284）：缺节点时 fallback 创建（:250-263）；重复跳过（:267）；目标不存在也先加边（:273-274，reconcile 补反向）。
5. `task_artifact_added`（:286-297）：去重追加。
6. `task_session_linked`（:299-318）：已关联跳过（:304-307）；协作委派记 delegationId+childSessionId（:312-314）。
7. `task_abandon_annotated`（:320-336）：纯附加幂等（:322 注释）；非 completed 置 cancelled（:331-332，completed 保留）。
8. `task_deleted`（:338-362）：真删除+清全部悬挂引用与边（:342-359）；与 abandon/cancelled 语义区分（:340-341 注释）。

## 4. 调用者与调用链

入向（全树检索+只读子agent交叉核）：包内 `graph-query.ts:23`（getReadyTasks/topologicalSort）/`:181`（re-export topologicalSort as getExecutionPlan）、`harness-query.ts:10`、`index.ts:65-75`（聚合）。经 index 的生产消费：`pi-harness/orchestrator-bridge.ts:4`、`pi-harness/governor.ts:2`、`pi-harness/graph-focus-packet.ts:3`（getReadyTasks）、`pi-harness/evals/replay.ts:1`（buildGraphFromEvents）、`main/lib/agent-session-manager.ts:115-119`（parseEventsFromJsonl/serializeEvent）、`main/lib/project-graph-service.ts:13-41`（serializeEvent/getReadyTasks）；仅测试：`task-graph-event-converter.test.ts:2`、`project-core.test.ts:8-42`。出向：`./types`（类型）、`./graph-parser`（:21，调用 :85-93/:131-138/:172-173）。

## 5. 数据 I/O、读写与副作用

无 I/O、无副作用（纯函数；序列化为字符串转换）。幂等性由测试断言（abandon 重放两次相同 :383）。

## 6. 分支、失败、取消与恢复

- 失败：`deserializeEvent` 坏行返 null（:465-467，容错跳过）；applyEvent 无 throw（缺节点分支均容错）。
- 不适用「取消/恢复」：纯重放函数；cancelled 是数据状态非执行状态。

## 7. 权限与权威状态

无权限分支。权威语义：事件序列是唯一事实源；timestamp 排序后胜（:55）；dependsOn 显式列表为完整权威（:135-136 注释）。

## 8. 修改影响面

- graph-query/project-graph-service/project-core.test.ts（70 用例覆盖本文件重放语义）。
- 事件类型/payload 改动需同步 `types.ts`、`graph-parser.ts`、消费方渲染层。
- 需同步测试：`project-core.test.ts`（graph-state/graph-state·abandon/graph-state·deleted 三组 describe）。

## 9. 测试证据

`packages/project-core/src/project-core.test.ts`（批内，70 用例，NOT_RUN）：graph-state 组（:147-351）空图/重放/meta 一致/fork 边替换/元数据合并/独立任务/ready/拓扑/序列化往返；abandon 组（:353-415）写入+cancelled/completed 保留/幂等/不存在 no-op/序列化/source=agent；deleted 组（:417-486）删除清理/不存在 no-op/幂等/重放/与枯枝共存/序列化。mock 边界：纯函数字面量 fixture。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 9 条；8 事件分支+reconcile | 已证实 | :31-480 |
| 幂等（abandon/deleted 重放） | 已证实 | 测试 :383/:448 |
| task_deleted 真删除语义 | 已证实 | :338-362 |
| 入向完整清单（pi-harness/主进程/渲染层） | 已证实 | §4（子agent 交叉核） |
| graph-parser 实现 | 未知（批外文件，未在本批 18 文件清单；索引导出 :21） | :21 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `buildGraphFromEvents`/`applyEvent` 8 分支 | §3 | :51-366 | covered |
| ready/拓扑/序列化 | §2 | :371-480 | covered |
| `reconcileDependedBy` | §2/§3 | :31-46 | covered |
| 入向清单 | §4 | — | covered（子agent 交叉核） |
| 测试 | §9 | — | covered（NOT_RUN） |

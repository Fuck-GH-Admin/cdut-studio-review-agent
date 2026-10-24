---
path: packages/project-core/src/types.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c0e4c1fa39ccf04e3d69e66c1e35e4df91813254
sha256: 79a509b17343de740e03753d3a9f96e9a69844d73c1671d3500a157c9781ea70
lines: 384
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-47-20261023
reviewer: p07-shared-libs
status: authored
evidence: static
---

# packages/project-core/src/types.ts

## 1. 结论与边界

project-core 的全部类型契约（33 个 type/interface，纯声明无 import）：任务图（TaskNode/TaskGraph/边/8 事件 payload）、Project 元数据、DAG/力导向布局、Graph 查询摘要、SDK 事件提取输入、回溯放弃结果。

## 2. 导出与关键符号

33 个导出（`export` 逐条核 :11-371，行号见下）：
- 核心图：`TaskStatus`（:11，pending/in_progress/completed/failed/cancelled）、`ReviewStatus`（:14）、`TaskNode`（:17-58，含 sdkSessionId/delegationId/usage/forkFrom/abandon 三字段 :39-57）、`TaskUsage`（:61-67）、`TaskGraph`（:70-78）、`GraphEdge`（:82-86）、`ForkEdge`（:90-96，reason?）。
- 事件：`GraphEventType`（:102-110，8 值）、`GraphEvent`（:121-129，discriminated union）、`GraphEventPayload`（:132）、8 个 payload 接口（:142-200）：TaskCreated（subject/description/dependsOn/forkFrom?）、TaskUpdated（可选字段）、TaskStatusChanged（oldStatus?/newStatus）、TaskDependencyAdded/TaskArtifactAdded/TaskSessionLinked（sessionId/childSessionId?）、TaskAbandonAnnotated（reason/confidence/evidenceTurns/source:'retrospective'|'agent' :183-192，retrospective 已停用保留兼容 :190）、TaskDeleted（source?:'user'|'agent' :194-200，语义区分注释 :195-198）。
- Project：`SessionType`（:205）、`ProjectStatus`（:208）、`ProjectMeta`（:211-226）。
- 布局：`LayoutLevel/LayoutResult`（:231-246）、`ForceLayoutOptions`（:251-264，默认参数注释：iterations 300/斥力 5000/弹簧 0.01/边长 200/DAG 方向 0.1/向心 0.05）、`NodePosition`（:267-271）、`ForceLayoutResult`（:274-283）、`ForkEdgeLayout`（:286-303）、`TaskItemInput`（:308-313）。
- 查询/提取：`GraphSummary`（:318-329，含 recentCancelled 用于打断提醒 :327-328）、`RecentCompletedTask`（:332-336）、`ExtractGraphInput`（:341-350）、`UnmappedAbandonment`（:355-368）、`RetrospectiveResult`（:371-384，skipped 原因 no-new-turns/llm-failed/parse-failed :382-383）。

## 3. 内部逻辑与关键流程

不适用，依据：纯类型声明无运行时代码。

## 4. 调用者与调用链

入向（子agent 交叉核）：包内 `graph-state.ts:13-20`、`harness-query.ts:9`、`project-meta.ts:9`、`graph-query.ts:10-22`、`index.ts:9-42`（聚合 33 类型）；经 index 类型消费（生产约 24 处）：pi-harness 系（reconciler/telemetry/governor/graph-focus-packet/evals/types/goal-controller/verification-evaluator）、`adapters/pi-builtin-tools.ts:15`、`task-graph-event-converter.ts:1`、`retrospective-service.ts:18`、`project-graph-service.ts:13-41`、渲染层（graph-atoms/ProjectGraphPanel/AgentView/task-graph-events/task-graph-layout）、`preload/index.ts:1107-1116`、`ipc.ts:4417`。出向：无 import。

## 5. 数据 I/O、读写与副作用

不适用，依据：纯声明。

## 6. 分支、失败、取消与恢复

不适用，依据：类型。

## 7. 权限与权威状态

类型即契约权威：`TaskDeletedPayload.source` 语义区分（删除/放弃/取消 :195-198）、`TaskAbandonAnnotatedPayload.source`（agent 恒 confidence 1/:187-188）。

## 8. 修改影响面

全部 project-core 消费面（30 importer）+ 渲染层；payload 形状改动需同步 graph-parser/graph-state/事件转换器。

## 9. 测试证据

无独立测试（经 `project-core.test.ts`/`harness-query.test.ts` 的字面量 fixture 间接使用）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 33 导出+8 事件 union | 已证实 | :11-371 |
| 消费面（包内 6 直接+约 24 聚合） | 已证实 | §4 子agent 交叉核 |
| 运行时行为 | 不适用 | 纯类型 |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 33 类型 | §2/§7 | :11-371 | covered |

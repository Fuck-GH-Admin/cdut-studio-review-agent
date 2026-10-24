---
path: apps/electron/src/main/lib/task-graph-event-converter.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 46a9de6832ed3b71caec3d9993b70e77c398e6d4
sha256: 6927743f8c2f46361d1cbb2061b614d4dbdffa7aeba2c221de01036666af0cae
lines: 255
kind: source
package: p01-app-shell
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/task-graph-event-converter.ts

## 1. 结论与边界

原生 Task 工具调用 → 可持久化 Graph 事件转换器（255 行）：TaskCreate/TaskUpdate 结果解析为 `task_created`/`task_session_linked`/`task_status_changed`/`task_updated`/`task_deleted`/`task_abandon_annotated` 事件；含 auto-link（forkFrom/dependsOn 兜底）、delegation 三事件、完成拦截。

**边界**：`parseDependsOn`/`parseAbandon`/`isStructuredTaskGraphTool` 在 `@profer/project-core`（跨批，语义未知不杜撰）；`loadGraph` 在 `project-graph-service`（跨批）；事件消费方=graph 归并（跨批）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `TaskToolInvocation` | 接口（导出） | 9-15 | `{toolUseId, toolName, input, result?, executionResult?}` | 输入形状 |
| `TaskGraphEventConversion` | 接口（导出） | 17-20 | `{events: GraphEvent[], nextCurrentTaskId?}` | 输出形状 |
| `TaskGraphAutoLinkContext` | 接口（导出） | 22-27 | `{currentTaskId, lastCompletedTaskId, completionBlockedByRunningDelegations?}` | auto-link 上下文 |
| `nativeTaskToolToGraphEvents` | 函数（导出） | 77-153 | `(invocation, sessionId, timestamp, autoLinkContext) => TaskGraphEventConversion` | 主转换 |
| `isTaskCompletionBlocked` | 函数（导出） | 156-160 | `(result) => boolean` | `JSON.completionBlocked===true` |
| `structuredTaskToolCurrentTaskId` | 函数（导出） | 163-170 | `(invocation) => string \| undefined` | 当前任务 id |
| `resolveRecentAutoLinkTaskId` | 异步函数（导出） | 173-191 | `(sessionId) => Promise<string \| null>` | 最近任务兜底 |
| `structuredTaskAutoLinkEvent` | 异步函数（导出） | 194-221 | `(invocation, timestamp, context) => Promise<GraphEvent \| undefined>` | 结构化工具 auto-link |
| `delegationToGraphEvents` | 函数（导出） | 224-231 | `(parentTaskId, delegation, invocation, timestamp) => GraphEvent[]` | delegation 三事件 |
| `isDelegateAgentTool` | 函数（导出） | 234-236 | `(toolName) => boolean` | `'delegate_agent'` 或 `*__delegate_agent` |
| `delegationLinkFromResult` | 函数（导出） | 238-255 | `(result) => {delegationId, childSessionId} \| null` | JSON 双格式解析 |

内部：`TASK_STATUSES`（`:29-31`，5 态）、`textFromResult`（`:33-44`）、`parseCreatedTask`（`:46-60`）、`taskIdFromInput`（`:62-65`）、`stringArray`/`stringValue`（`:67-74`）。导出合计 11。

## 3. 内部逻辑与关键流程

1. **TaskCreate**（`:83-116`）：`parseCreatedTask(result)` 先 JSON（`task.id` string|number，`:50-56`）后 legacy 正则 `Task\s*#(\d+)`（`:58-59`），无结果回退 `toolUseId`（`:85`）；subject input 优先 → created.subject → `'未命名任务'`（`:86`）；依赖三级：显式 `dependsOn` ?? `parseDependsOn(description)` ?? 无 forkFrom 时 `[lastCompletedTaskId]` ?? `[]`（`:88-94`）；forkFrom：显式 ?? 无显式关系时 `currentTaskId`（`:95`）；发 `task_created`（payload 含 dependsOn/forkFrom）+`task_session_linked`（sessionId）；`nextCurrentTaskId=taskId`（`:113`）。
2. **TaskUpdate**（`:117-153`）：`status==='deleted'` → `task_deleted`（source:'agent'，`:119-123`）；`status ∈ TASK_STATUSES` → `task_status_changed`——**completed 且 `completionBlockedByRunningDelegations` 时拦截不发完成事件**（`:133`，防 live 子会话未完抢先完成，`:25` 注释）；subject/description/dependsOn 有变化 → `task_updated`（**显式空数组 dependsOn 可清边**，`stringArray` 对 `[]` 返回 `[]` 非 undefined，`:137-143`）；`parseAbandon(description)` 或 `input.abandonReason` → `task_abandon_annotated`（`{confidence:1, evidenceTurns:[], source:'agent'}`，`:144-151`）。
3. **isTaskCompletionBlocked**（`:156-160`）：JSON 里 `completionBlocked===true`。
4. **structuredTaskToolCurrentTaskId**（`:163-170`）：`proma_task_create` 走 parseCreatedTask；否则 `taskIdFromInput`。
5. **resolveRecentAutoLinkTaskId**（`:173-191`）：`loadGraph(sessionId)` 失败 → null（降级不破坏 run，`:178-180`）；优先最近 updatedAt 的 completed 任务，回退最近更新任意任务（`:181-190`）。
6. **structuredTaskAutoLinkEvent**（`:194-221`）：仅 `isStructuredTaskGraphTool` 且**无显式关系**时（`:199`）；`currentTaskId` 优先 → `task_updated{forkFrom}`（`:204-207`）；否则 `lastCompletedTaskId` → `task_updated{dependsOn:[linkTarget]}`（`:208-217`）。
7. **delegationToGraphEvents**（`:224-231`）：taskId=`delegation:<id>` 三事件——created（`forkFrom=parentTaskId`）、session_linked（含 childSessionId）、in_progress。
8. **delegationLinkFromResult**（`:238-255`）：JSON 双格式（嵌套 `delegation.{delegationId,childSessionId}` 或平铺）；catch → null。

## 4. 调用者与调用链

入向（全冻结树检索 `task-graph-event-converter`，2 文件）：`lib/agent-orchestrator.ts:88`（多符号 import 块）；批内测试 `task-graph-event-converter.test.ts:11`。出向：`@profer/project-core`（类型+`isStructuredTaskGraphTool`/`parseAbandon`/`parseDependsOn`）、`./project-graph-service`（`loadGraph`）、`./command-execution` 类型（`:14`）。

## 5. 数据 I/O、读写与副作用

- 读盘：`loadGraph`（仅 `resolveRecentAutoLinkTaskId`，异常→null）。
- 事件为纯内存数据；无写（持久化在消费方）。

## 6. 分支、失败、取消与恢复

- 分支密集（§3）；`loadGraph` 异常→null 降级（`:178-180`）；`parseCreatedTask` JSON 失败→legacy 正则（`:57`）；`delegationLinkFromResult` 失败→null。
- completed 拦截（`:133`）是刻意的防抢先完成语义。
- 无 throw（导出函数不抛）。

## 7. 权限与权威状态

无权限分支（不适用）。权威=事件时间线（timestamp 调用方传入）；auto-link 的 currentTaskId/lastCompletedTaskId 来自 orchestrator 上下文（跨批）。

## 8. 修改影响面

agent-orchestrator 的任务图事件流；事件形状是 graph 归并的输入契约；`delegation:` 前缀 taskId 格式被下游图渲染/查询依赖（跨批）；TASK_STATUSES 5 态是状态机契约。

## 9. 测试证据

直接测试：`task-graph-event-converter.test.ts`（批内，2 describe/9 test，详见其手册）。未覆盖：`resolveRecentAutoLinkTaskId` 的 loadGraph 两分支（测试未触达）、`structuredTaskToolCurrentTaskId`、`delegationLinkFromResult` 非 JSON 分支细节。

`NOT_RUN`：本轮未运行 bun test，断言≠已运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 11 导出/三级依赖/拦截/清边/auto-link/三事件 | 已证实 | `:1-255` 全文逐行 |
| 调用方=agent-orchestrator:88（+批内测试） | 已证实 | 全树检索（§4） |
| `parseDependsOn`/`parseAbandon`/`isStructuredTaskGraphTool` 语义 | 未知 | 跨批 project-core，不杜撰 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 3 接口/内部 5 函数 | §2 | 9-74 | covered |
| TaskCreate/TaskUpdate 全分支 | §3.1-3.2 | 83-153 | covered |
| `isTaskCompletionBlocked`/`structuredTaskToolCurrentTaskId` | §3.3-3.4 | 156-170 | covered |
| `resolveRecentAutoLinkTaskId`/`structuredTaskAutoLinkEvent` | §3.5-3.6 | 173-221 | covered |
| delegation 三事件/链接解析 | §3.7-3.8 | 224-255 | covered |

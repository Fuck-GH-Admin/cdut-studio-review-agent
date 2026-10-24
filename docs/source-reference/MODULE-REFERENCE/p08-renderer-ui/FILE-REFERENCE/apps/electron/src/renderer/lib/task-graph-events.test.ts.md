---
path: apps/electron/src/renderer/lib/task-graph-events.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ce72355eeb75a707b0ea1e1d91e87c845827b27a
sha256: 7f064f01bee92bdd031ff867bf51a3dbab4447ca6c4ac1b43714c3656abf3618
lines: 145
kind: test
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/task-graph-events.test.ts

## 1. 测试目标

验证 `taskActivityToGraphEvents` 对 TaskCreate/TaskUpdate 工具活动的 `GraphEvent` 转换：事件序列形状、时间戳透传、subject 元数据保留、依赖/放弃标记解析、状态与删除事件、空 update 抑制（task-graph-events.test.ts:19）。工具活动工厂 `activity()` 用 `toolUseId='tool-1'`、`done:true` 默认值（:5-17）。框架 `bun:test`（:1）。本轮 `NOT_RUN`，纯静态阅读。

## 2. 用例清单

机械计数：`test(`=7、`test.each(`=1（参数数组 5 个状态，:96-110）、`it(`=0，声明 8 处、运行态 12 例（7 + 5）：

1. `TaskCreate emits created and session-linked events with one timestamp`（task-graph-events.test.ts:20-39）
2. `TaskCreate preserves subject metadata semantics for persistence`（:41-53）
3. `description-only TaskUpdate forwards metadata, dependency, and abandonment`（:55-81）
4. `combines subject and description in one update event`（:83-94）
5. `test.each(['pending','in_progress','completed','failed','cancelled'])` → `emits status_changed for %s without fabricated oldStatus`（:96-110，5 例）
6. `deleted emits only task_deleted when no update fields exist`（:112-123）
7. `does not emit an empty update event`（:125-131）
8. `preserves explicit empty structured dependencies as a replacement update`（:133-144）

## 3. 真实断言

task-graph-events.test.ts:28 `expect(result.nextCurrentTaskId).toBe('t1')`；:29-38 `toEqual` 两事件全量（含 `timestamp: 1234`、`dependsOn: ['t0']`、`sessionId: 'session-1'`）；:49-52 created 事件 subject 保留 `@dependsOn` 文本、依赖仍解析 `['t0']`；:63-80 四事件序列（updated + `task_dependency_added`×2 + `task_abandon_annotated` reason='更换方案'）；:88-93 单事件 `taskId: '7'`；:103-108 `payload: { newStatus: status }`（无 oldStatus）；:117-122 `task_deleted` 单事件 `source: 'agent'`；:126-130 `toEqual([])`；:138-143 `payload: { dependsOn: [] }`。

## 4. 未覆盖与脆弱点

未覆盖 `prevTaskId` 顺序依赖推断分支（task-graph-events.ts:131-133）与 `enrichDescription` 的结构化 forkFrom/abandonReason 注入（:60-75）直接用例；未覆盖 `taskId` 提取失败短路（:161）与 `taskId ?? toolUseId` 回退（:113）。脆弱点：全量 `toEqual` 断言绑定事件字段顺序无关但形状全等，源码增删 payload 字段会连带改测试。无动态调用。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 声明 8 处/运行态 12 例与断言行真实存在 | 已证实 | task-graph-events.test.ts:20-144 机械计数 |
| 测试运行结果 | 未知 | NOT_RUN（断言≠运行） |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| TaskCreate 事件组装 | §2/§3 | task-graph-events.test.ts:20-53 | covered |
| TaskUpdate 元数据/依赖/放弃 | §3 | :55-94 | covered |
| 5 状态 status_changed | §2/§3 | :96-110 | covered |
| deleted/空 update/空 dependsOn | §3 | :112-144 | covered |
| prevTaskId 推断/工具 UseId 回退 | §4 | — | unknown |

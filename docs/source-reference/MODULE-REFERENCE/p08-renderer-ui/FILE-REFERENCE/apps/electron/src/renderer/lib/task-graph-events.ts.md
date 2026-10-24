---
path: apps/electron/src/renderer/lib/task-graph-events.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e088da0f465234bd3fa935a910f798ce267c2078
sha256: 42d0d62218acd945ae0d65500687a12acb642d5863f109c5a3cb654b4f0ee95f
lines: 244
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/task-graph-events.ts

## 1. 结论与边界

渲染层任务图事件转换器（244 行）：把 agent 工具活动（`ToolActivity` 的 TaskCreate/TaskUpdate）翻译成 `GraphEvent` 序列 + `nextCurrentTaskId`（task-graph-events.ts:104-244）。含 Phase D 结构化参数桥接（把 dependsOn/forkFrom/abandonReason 注入 description 标记行，:41-79）与同 turn 顺序依赖启发式（:81-102）。纯转换，不做图状态归约（归约在 project-core 的 `buildGraphFromEvents`，域外）。

## 2. 导出与关键符号

类型 1 个：`TaskGraphEventConversion`（task-graph-events.ts:6-9，`events: GraphEvent[]` + 可选 `nextCurrentTaskId`）；函数 1 个：`taskActivityToGraphEvents(activity, sessionId, timestamp, prevTaskId?): TaskGraphEventConversion`（:104-244）。内部符号：`TASK_STATUSES` 常量集（内部，:11-17，5 种 TaskStatus）、`taskIdFromInput`（内部，:19-23）、`stringArrayFromInput`（内部，:26-32）、`stringFromInput`（内部，:35-39）、`enrichDescription`（内部，:46-79）、`inferSequentialDependency`（内部，:91-102）。

## 3. 内部逻辑与关键流程

按执行顺序：

1. `taskIdFromInput`（:20-22）：`input.taskId ?? task_id ?? id`，string|number 转字符串，否则 undefined。
2. `stringArrayFromInput`（:27-31）：数组 → `map(String).filter(非空)`，非数组 → `[]`；`stringFromInput`（:36-38）：非空字符串 → 值，否则 null。
3. `enrichDescription`（:47-78）：结构化 dependsOn 缺失部分（`parseDependsOn(description)` 去重后）注入 `dependsOn: ...` 行（:50-57）；forkFrom 无已有标记则注入 `forkFrom: ...`（:60-66）；abandonReason 同理注入 `abandon: ...`（:69-75）；无行则原样返回（:77），否则标记行拼接在 description 前（:78）。
4. `inferSequentialDependency`（:96-101）：已有依赖→不推断；无 prevTaskId→不推断；否则返回 `[prevTaskId]`（注：第一个参数 `_currentTaskId` 未使用，:92）。
5. `taskActivityToGraphEvents` TaskCreate 分支（:111-156）：`parseTaskCreateResult(activity.result)` 取 `taskId = parsed?.id ?? activity.toolUseId`（:113）；subject 取 input.subject 字符串 → parsed.subject → `'未命名任务'`（:114-116）；description 取 input 或 `''`（:117-119）并 `enrichDescription`（:122）；dependsOn 先 description 标记后 subject 标记（:125-128）；空且有 prevTaskId 则启发式推断（:131-133）；返回 `task_created`（payload subject/description/dependsOn）+ `task_session_linked`（payload sessionId）两事件与 `nextCurrentTaskId: taskId`（:135-155）。
6. 非 TaskUpdate 工具 → `{ events: [] }` 短路（:158）；taskId 提取失败 → `{ events: [] }` 短路（:160-161）。
7. 状态事件（:164-179）：`status === 'deleted'` → `task_deleted`（payload `{ source: 'agent' }`，:165-171）；`status` 在 TASK_STATUSES → `task_status_changed`（payload `{ newStatus }`，:172-179）。
8. `task_updated`（:181-205）：subject/description 任一存在或 `input.dependsOn !== undefined` 时生成（:194）；payload 条件展开，dependsOn 仅在 `Array.isArray` 时写入（:200-202）；description 先过 `enrichDescription`（:189-191）。
9. 依赖解析（:208-213）：description 标记 > 结构化参数 > subject 标记；`status !== 'deleted'` 时逐条发 `task_dependency_added`（:215-224）。
10. 放弃标注（:227-241）：`parseAbandon(description) ?? 结构化 abandonReason`；存在则发 `task_abandon_annotated`（payload `{ reason, confidence: 1, evidenceTurns: [], source: 'agent' }`）。
11. 返回 `{ events, nextCurrentTaskId: taskId }`（:243）。

## 4. 调用者与调用链

- 入向（冻结树 grep）：仅测试 `task-graph-events.test.ts:3` 及其 8 处调用（:21、:42、:57、:84、:99、:113、:126、:134）。否定结论：冻结树无生产调用点（检索范围：baseline 全树 grep `task-graph-events|taskActivityToGraphEvents`，含 packages/与 main/）。注意：主进程存在平行实现 `apps/electron/src/main/lib/task-graph-event-converter.ts`（自身接口 `TaskGraphEventConversion` :17，由 agent-orchestrator.ts:88 使用），是独立孪生而非本模块调用者。
- 出向：`@profer/project-core` —— `isTaskCreateTool`/`isTaskUpdateTool`（task-tool-names.ts:26,30）、`parseDependsOn`/`parseForkFrom`/`parseAbandon`（graph-parser.ts:31,81,91）、类型 `GraphEvent`/`TaskStatus`（types.ts:121,11）；`@/atoms/agent-atoms` 类型 `ToolActivity`（agent-atoms.ts:25）；`@/components/agent/task-progress` 的 `parseTaskCreateResult`（task-progress.ts:70）。无动态调用。

## 5. 数据 I/O、读写与副作用

纯转换函数：无模块级状态、无 I/O、无 DOM/窗口/事件订阅副作用；所有返回值为新建对象，输入 `activity` 不被修改。

## 6. 分支、失败、取消与恢复

非任务工具/缺 taskId → `{events: []}`（:158、:161）；status 不在 5 状态且非 deleted → 不发状态事件（:172 条件）；deleted 抑制 `task_dependency_added`（:215）；数值 taskId 字符串化（:21，测试 task-graph-events.test.ts:90 `'7'`）；`task_updated` 在 dependsOn 非数组时仍发事件但 payload 不含 dependsOn 键（:194 与 :202 条件不一致的静态行为）；无 throw、无取消语义。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查（`payload.source: 'agent'` 为事件来源标记，非鉴权）。

## 8. 修改影响面

事件契约由 `packages/project-core/src/types.ts:121-129` 的 `GraphEvent` 联合定义，消费归约在 `graph-state.ts` 的 `applyEvent`（:74 起）；修改事件形状需同步 project-core 类型/归约、主进程孪生 `task-graph-event-converter.ts`（含其 test）与 `task-graph-events.test.ts`；当前冻结树无渲染层生产调用点，接入方变更需重新检索。

## 9. 测试证据

`NOT_RUN`（本轮未运行测试，纯静态阅读）。测试文件 `task-graph-events.test.ts`，机械计数 `test(`=7、`test.each(`=1（参数 5 个状态，:96-110）、`it(`=0，声明 8 处 / 运行态 12 例。真实断言：task-graph-events.test.ts:28-38（created+session_linked 全量 toEqual）、:49-52（subject 保留标记文本）、:63-80（updated+2 依赖+abandon）、:90（taskId `'7'`）、:104-108（5 状态 status_changed 无 oldStatus）、:118-122（deleted 单事件）、:130（空 update 无事件）、:139-143（空 dependsOn 替换式 update）。断言≠运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全部分支的事件组装与短路 | 已证实 | task-graph-events.ts:104-244 全文 |
| enrichDescription/推断启发式 | 已证实 | task-graph-events.ts:46-102 |
| dependsOn 非数组时 task_updated payload 形状 | 已证实 | :194/:202 静态比对 |
| 运行验证 | 未知 | NOT_RUN |
| 生产接入点 | 未知 | 冻结树无引用，未来接入方不可预判 |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| taskActivityToGraphEvents · TaskCreate | §3 | task-graph-events.ts:111-156 | covered |
| · 短路（非任务/缺 id） | §6 | :158-161 | covered |
| · 状态/删除事件 | §3/§6 | :164-179 | covered |
| · task_updated/依赖/放弃 | §3 | :181-241 | covered |
| enrichDescription | §3 | :46-79 | covered |
| inferSequentialDependency | §3 | :91-102 | partial |
| taskIdFromInput/string* helpers | §3 | :19-39 | covered |

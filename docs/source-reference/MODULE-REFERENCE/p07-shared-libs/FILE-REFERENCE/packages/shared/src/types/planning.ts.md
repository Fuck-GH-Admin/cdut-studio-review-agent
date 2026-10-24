---
path: packages/shared/src/types/planning.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 48897f698b50c13368be31275a5fd6c77c2b3bda
sha256: 08fd0769291259495f745a73811af7d853c0e3420d04eb379a2f3ebea34918c2
lines: 302
kind: source
package: p07-shared-libs
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# packages/shared/src/types/planning.ts

## 1. 结论与边界

本地任务与日程（Planning）契约（`:1`）：Todo 与日程**分别持久化**、分组独立存储（`:5`）、Automation 保持独立。10 个枚举/常量 + 22 个接口 + `PLANNING_IPC_CHANNELS` 25 键。

不做的事：不持久化（服务层 SQLite/Team Server）；提醒调度器在 main（`planning-reminder-scheduler`）。

## 2. 导出与关键符号

**枚举/常量（`:3-16`）**：`TodoStatus`（open/completed）、`TodoPriority`（low/medium/high）、`PlanningGroupScope`（todo/calendar，`:5` 注释：同名分组允许分别存在）、`PlanningReminderTargetType`、`PlanningReminderStatus`、`PlanningReminderOrigin`（`manual`/`todo_due_at`，`:9` 注释：改期安全同步）、`PLANNING_CONFLICT_ERROR:13`（**错误文案常量**："日程已被其他窗口修改，请重新加载后再试"，跨窗口并发冲突按文案识别 `:12`）、`PlanningChangeResource:16`（6 值）、`PlanningChange:18-20`。

**实体**：`PlanningGroup:22-31`、`PlanningTag:33-39`、`TodoSessionLink:43-47`（Agent 会话去重关联 `:42`）、`PlanningReminder:49-61`（独立持久化 `:41`）、`ActivePlanningReminder:64-68`（+目标摘要）、`Todo:70-92`（团队协作字段 `assigneeId?/createdBy?/updatedBy?/version?` 个人 SQLite 保持未定义 `:72`；`sessionLinks` 仅 Agent 成功写入 `:86`）、`CalendarEvent:94-114`（+`todoId?` 联动）。

**查询/输入**：`TodoListQuery:117-123`、`CalendarEventListQuery:126-130`、`CreatePlanningReminderInput:132-134`、`CreateTodoInput:136-149`（`sessionId?` 自动写关联 `:144`）、`StartTodoAgentInput:151-159`（`expectedUpdatedAt` 原子校验防跨窗口旧稿启动 `:155`）、`StartTodoAgentResult:161-164`、`TodoAgentSessionActivation:167-170`、`UpdateTodoInput:172-186`（`dueAt/groupId/workspaceId` 可 `null` 清除；`expectedUpdatedAt?` 拒旧稿 `:183`）、`CreateCalendarEventInput:188-201`、`UpdateCalendarEventInput:203-218`、`CreatePlanningGroupInput:220-227`、`UpdatePlanningGroupInput:229-238`（`scope` 仅作选择器不能移组 `:233`）、`CreatePlanningTagInput:240-245`、`UpdatePlanningTagInput:247-253`、`CreatePlanningReminderRequest:255-258`、`SnoozePlanningReminderInput:261-264`、`PlanningAgentOperation:267-272`（Pi 改数据后会话反馈）。

**IPC**：`PLANNING_IPC_CHANNELS:274-302`（25 键 `planning:*`，键值全符 kebab，无例外）：Todo 5、日程 4、分组 4、标签 4、提醒 3（`LIST_ACTIVE_REMINDERS`/`ACKNOWLEDGE_REMIND`/`SNOOZE_REMIND`）、事件 4（`REMINDER_DUE`/`OPEN_WINDOW`/`CHANGED`/`AGENT_OPERATION`）、`START_TODO_AGENT:278`（原子确认归属并建会话）、`TODO_AGENT_SESSION_READY:279`。

## 3. 内部逻辑与关键流程

纯声明，但注释承载三条并发/一致性契约：①**乐观锁**：`expectedUpdatedAt` 在 `StartTodoAgentInput:155`（原子校验）与 Update 输入 `:183`/`:216`（拒跨窗口旧稿）；②**跨窗口冲突**：`PLANNING_CONFLICT_ERROR` 按文案识别（`:12`——照实记录：文案字符串是识别契约，改文案破坏识别）；③**资源级失效**：`PlanningChange`（`:15` 注释：避免全窗口重拉快照）。

## 4. 调用者与调用链

preload Planning 段（`preload/index.ts:3848-3888`：21 invoke + 4 on 桥）；main `planning-*` 服务与 `planning-reminder-scheduler`（`main/index.ts:230`、`:1058`/`:1259`）；独立规划窗口（`planning-window`，`OPEN_WINDOW` 单例 `:298`）；Team Server 路由（多 Input 注释"团队模式时由主进程路由到 Team Server"）。出向：`./agent` 的 `AgentSessionMeta`（`:163`/`:169`，`import()` 内联类型）。

## 5. 数据 I/O、读写与副作用

纯类型 + 1 字符串常量；无 I/O。持久化权威：个人 SQLite / Team Server（双轨，`:72` 注释）。

## 6. 分支、失败、取消与恢复

不适用。失败语义：冲突按 `PLANNING_CONFLICT_ERROR` 文案识别（`:12`）；`SnoozePlanningReminderInput.minutes` 承载改期；`status: 'acknowledged'|'completed'` 承载提醒生命周期。

## 7. 权限与权威状态

- 乐观锁权威：`expectedUpdatedAt`（`:155`/`:183`/`:216`）——主进程原子校验。
- 团队协作字段权威：`assigneeId` 等由 Team Server 托管，个人记录未定义（`:72`）。
- `UpdatePlanningGroupInput.scope` 是选择器而非移动语义（`:233`）。
- `TodoSessionLink` 仅 Agent 成功写入（`:86`）——写权限归属声明。

## 8. 修改影响面

改字段影响规划窗口/提醒调度/Agent Todo 链；`PLANNING_CONFLICT_ERROR` 文案改动会破坏冲突识别（`:12`）；通道改名需同步 preload `:3848-3888`/main 注册（25 键）；`import('./agent')` 内联依赖 agent.ts 的 `AgentSessionMeta`。

## 9. 测试证据

无直接测试（检索 `PlanningReminder`/`PLANNING_IPC_CHANNELS` 于 `*.test.ts` 为 0 命中）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（含矛盾）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全部导出（10 枚举/常量 + 22 接口 + 25 通道） | 已证实 | 文件全读 |
| 乐观锁/冲突文案/资源级失效三契约 | 已证实 | `:12`、`:15`、`:155`、`:183` |
| 团队/个人双轨字段语义 | 已证实 | `:72`、`:96` |
| **矛盾**：`TodoListQuery.limit`/`CalendarEventListQuery.limit` 无上限约束（类型层） | 已证实 | `:119`、`:128` |
| **孤儿注释**：`:41`"提醒本体独立持久化…"挂在 `TodoSessionLink` 之前，语义属 `PlanningReminder:49` | 已证实 | `:41-42` |
| 冲突识别按文案的实际实现 | 未知 | 服务层不在本批 |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全部导出 | §2 | covered |
| 并发/一致性契约 | §3 | covered |
| 权威/乐观锁 | §7 | covered |
| 消费者/影响面 | §4/§8 | covered |
| 测试/矛盾/未知 | §9/§10 | covered |

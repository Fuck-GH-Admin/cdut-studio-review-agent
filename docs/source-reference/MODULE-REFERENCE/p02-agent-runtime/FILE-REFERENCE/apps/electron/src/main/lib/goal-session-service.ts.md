---
path: apps/electron/src/main/lib/goal-session-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 40a21afd171b8fe3b1f0cb5a5b6f9021b6ffe8f1
sha256: 0870ecb12e8d39279bcede786ba5b807a3a0ce39e59d761302660b1d9da7679a
lines: 233
kind: source
package: p02-agent-runtime
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/goal-session-service.ts

## 1. 结论与边界

**会话级 Goal 接线中枢**（`:54`）：生命周期（start/pause/resume/stop/update/clear）、消息投影（结果落会话记录）、Todo 联动、运行归属——经 `Dependencies` 依赖注入（15 个回调，`:11-27`）桥接 GoalController 与会话/存储/Todo/发布。核心红线（`:29`）："Goal 只读取当前轮 runtime usage；**消息正文永远不能成为控制协议**"。

不做的事：不含状态机（goal-controller）/循环 prompt（goal-loop）/校验（goal-update-validation）/存储（goal-store）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `collectGoalRunUsage` | `:30-43` | 从消息尾向前找 `type:'result'` 带 usage 的消息；`inputTokens = input_tokens+cache_read+cache_creation`（`:38`）、output、total；数值守卫（非有限/负→0，`:35-37`） |
| `GoalSessionService` | `:55-233` | class（见 §3） |

内部：`GoalSession:8`/`GoalPatch:9` 类型；`resultKey:45-47`（`goal:id:iteration:status` 去重键）；`stableUuid:49-52`（sha256 派生确定性 UUID v5 形制，`:51` 版本位 5/变体位 a）。

### `GoalSessionService` 成员

构造（`:63-108`）：建 `GoalController` 并注入 `canRun`（会话空闲）、`runTurn`（核心轮次执行，见 §3.1）、`stopTurn`、`onStateChange`。状态：`projecting/todoHandled/publishedRevision/archived` 集合 + `restored`。

公开 API：`restore:110-116`（幂等，一次保存）、`get:118`/`list:119`/`history:120-124`（当前+归档合并去重）、`start:126-142`、`pause:144`/`resume:145-149`（权限闸）/`stop:150`、`update:151-159`（validateGoalUpdatePatch+落 `/goal update` 用户记录+publish）、`clear:160-167`（运行中拒绝 `:163`、归档+关 Todo）、`stopAll:168`。

私有：`archive:170-174`（按 id 幂等）、`appendUser:176-178`（合成 user 消息入历史）、`onStateChange:180-203`（防重入投影 `projecting` 集合 `:184`、saveStates、**revision 单调发布闸** `:199-201`）、`persistVisibleResult:205-217`（终态结果消息落会话：5 终态标签 `:213`、确定性 uuid 防重复 `:212`、`_goalResultKey` 标记）、`syncTodo:219-232`（blocked 建/更 Todo、completed 关闭，`todoHandled` 幂等）。

## 3. 内部逻辑与关键流程

### 3.1 `runTurn`（`:66-104`）——单轮执行与结果判定

1. 会话缺渠道→throw（`:68`）；权限错误→`{status:'blocked'}`（`:69-70`）。
2. `deps.run` 携带：`userMessage: state.goal`、`internalPrompt: buildGoalIterationPrompt(...)`、`suppressUserMessagePersistence:true`、`triggeredBy:'goal'`、`goalIteration/goalRunId`、`onRuntimeMessage`（过滤 `isReplay`，`:88`）、`reportGoalResult`（经 `normalizeGoalToolResult`，`:90`）、`onRunOutcome`（`:91`）。
3. 异常且会话仍忙→`{status:'continue', outcome:'deferred'}`（`:94-95` 注释：未获宿主所有权的自动轮次延后，不标失败）；否则 rethrow。
4. 判定序（`:98-103`）：stopped→continue/stopped；failed→continue/failed；**无 outcome→failed（"运行没有产生终态，不能采信完成报告" `:101`）；无 report→failed（"未提交有效 update_goal 报告" `:102`）**；否则 `{...report, usage, outcome: report.outcome ?? 'success'}`。

### 3.2 结果投影与发布（`onStateChange:180-203`）

防重入（`resultKey` 集合）→ `persistVisibleResult`（合成 assistant 结果消息，标签 已完成/需要输入/执行失败/预算已耗尽/已停止 `:213`）+ `syncTodo` → saveStates → **revision 闸**（只发 controller 当前快照、不覆盖 UI 旧值，`:196` 注释）。

## 4. 调用者与调用链

Agent 会话侧（会话服务/goal-ipc 路由）经 deps 注入；出向：`./goal-controller`、`./goal-loop`（buildGoalIterationPrompt）、`./goal-tools`（normalizeGoalToolResult）、`./goal-update-validation`、`@profer/shared` 类型。

## 5. 数据 I/O、读写与副作用

自身无 I/O；经 deps 写消息（appendMessages）、存状态（saveStates）、归档、Todo 增改、发布。副作用语义集中于 §3.2 投影链。

## 6. 分支、失败、取消与恢复

| 分支 | 行 | 结果 |
| --- | --- | --- |
| 运行异常+会话忙 | `:94-95` | deferred 延后（恢复语义） |
| 用户停止 | `:99` | stopped 终态 |
| 运行失败/无终态/无报告 | `:100-102` | failed（防伪完成） |
| clear 运行中 | `:163` | throw |
| start 有未完成 Goal | `:132` | throw（`:133` 已完成则归档开新） |

## 7. 权限与权威状态

- **权限闸**：start/resume 在 `permissionError` 时 throw（`:129-130`/`:146-147`），runTurn 时 blocked（`:69-70`）。
- **防伪完成**：无 outcome/无 report 即 failed（`:101-102`）；消息正文不作控制协议（`:29`）。
- **用户意图记录**：start/update 合成 `/goal` 用户消息（`:140`/`:156`）。
- publishedRevision 单调闸（`:199-201`）防旧快照覆盖。

## 8. 修改影响面

runTurn 判定序改动影响伪完成防线；deps 15 回调形状是会话侧契约；`stableUuid` 派生规则改动会破坏去重（历史消息重复落盘）。

## 9. 测试证据

直接测试 `goal-session-service.test.ts`（11 项：1 `test.each(['pi'])` + 10 `test(`）：上下文复用与控制输入隐藏、工具文本协议不作报告、stopped 阻再调度、报告完成但运行失败不误判、恢复幂等、blocked Todo 不发旧快照、归档旧 Goal、空白证据/无终态不改回成功（consecutiveFailures→3）、clear 归档关 Todo、Plan 拒绝不启动、会话忙不耗轮次。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出、runTurn 判定序、投影链 | 已证实 | 文件全读 |
| 防伪完成双闸（outcome/report） | 已证实 | `:101-102` + 测试 `:129-142` |
| deferred 恢复语义 | 已证实 | `:94-95` |
| revision 单调发布闸 | 已证实 | `:196-201` |
| `stableUuid` 版本位 5/变体位 a 的 RFC 形制合规性 | 推断 | `:51`（形近 v5 但非标准命名空间） |
| goal-loop/goal-controller 内部 | 未知 | 兄弟文件（同批另册） |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 2 导出 + class 全成员 | §2 | covered |
| runTurn 判定序 | §3.1 | covered |
| 投影/发布链 | §3.2 | covered |
| 权限/防伪 | §7 | covered |
| 11 测试断言 | §9 | covered |

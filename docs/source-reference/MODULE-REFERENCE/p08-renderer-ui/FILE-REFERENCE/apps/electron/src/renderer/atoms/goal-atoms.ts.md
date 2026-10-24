---
path: apps/electron/src/renderer/atoms/goal-atoms.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3e9a57dcf1042805b5e344cbab2b8eac488958b8
sha256: 74dd6a872dc53b8dd1294309f6d709e799b5cdebf2bb9605d8945160da2f8ea2
lines: 108
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/goal-atoms.ts

## 1. 结论与边界

Agent Goal 状态的 Jotai 归并与操作层（108 行）：会话→Goal 状态映射 + 严格归并规则（revision 单调/tombstone 防复活）+ 水合 + 状态操作矩阵 + 替换启动流程。纯内存状态机（依赖 `@profer/shared.getGoalBudgetExhaustedReasons` 判预算，跨批）。

**边界**：Goal 的 API 实现（getGoal/stopGoal/clearGoal/startGoal）由调用方注入（`GoalStartAPI` `:80-85`）；持久化/主进程同步在 useGlobalAgentListeners 等（跨批）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `agentGoalsAtom` | atom（导出） | 6 | `Map<sessionId, AgentGoalState>` | 会话→Goal 映射 |
| `mergeAgentGoalAtom` | 写 atom（导出） | 12-38 | `(event: AgentGoalEvent) => boolean` | 归并（返回是否接受） |
| `hydrateAgentGoalsAtom` | 写 atom（导出） | 41-46 | `(goals: AgentGoalState[]) => void` | 水合（只填未观察会话） |
| `agentGoalAtomFamily` | atomFamily（导出） | 48-51 | 按 sessionId 读/写单个 Goal | 写走 merge |
| `goalEditorAtomFamily` | atomFamily（导出） | 53 | `AgentGoalState \| null` | 编辑器草稿（会话隔离） |
| `goalHistoryAtomFamily` | atomFamily（导出） | 54 | `AgentGoalState[] \| null` | 历史列表 |
| `goalActionPendingAtomFamily` | atomFamily（导出） | 55 | `boolean` | 操作在飞 |
| `goalReplacementAtomFamily` | atomFamily（导出） | 56-60 | `{previous, goal, contract?} \| null` | 替换确认态 |
| `GOAL_STATUS_LABELS` | 常量（导出） | 62-65 | 8 状态中文标签 | 执行中/正在停止/已暂停/已完成/等待处理/执行失败/已停止/预算已耗尽 |
| `getGoalActions` | 函数（导出） | 67-78 | `(goal) => {canPause, canStop, canEdit, canResume, budgetEditRequired}` | 操作矩阵 |
| `startGoalWithReplacement` | 异步函数（导出） | 88-108 | `(api, sessionId, input, confirmedGoalId?) => {state?, confirmation?}` | 确认式替换启动 |

内部：`goalSnapshotsAtom`（`:9`）、`retiredGoalIdsAtom`（`:10`，tombstone）、`GoalStartAPI` 类型（`:80-85`）。导出合计 11。

## 3. 内部逻辑与关键流程

1. **mergeAgentGoalAtom**（`:12-38`）归并规则（顺序即裁决）：
   - `!incoming || incoming.sessionId !== event.sessionId` → false（null 不携带 owner，`:14-15`）。
   - retired（tombstone）含 `incoming.id` → false（`:17-18`）。
   - 同 id（`:20-24`）：`previous.stopReason==='cleared'` → false；previous 有 revision 时 `incoming.revision` 必须 **>** previous.revision 否则 false（`:22-23`）；previous 无 revision 时仅当 incoming 也无 revision 且 `updatedAt` 更大才过（`:24`）。
   - 异 id（新 owner，`:25-29`）：`incoming.startedAt < previous.startedAt` → false；相等且 previous 未 cleared/未 completed → false（防旧 Goal 高 revision 抢占）；否则把 previous.id 记入 retired（`:29`，防复活）。
   - 接受后：snapshot 更新（`:32`）；`stopReason==='cleared'` 从 agentGoalsAtom **删除**（`:34`，snapshot 保留）；否则 set（`:35`）。
2. **hydrateAgentGoalsAtom**（`:41-46`）：只填 snapshot/当前都未观察到的会话（`:43`）——list 请求后到达的 live 状态优先（`:40` 注释）。
3. **getGoalActions**（`:67-78`）：`ownerBusy = !!activeRunId`（`:68`）；`running = status∈{active,stopping} || ownerBusy`（`:69`）；`budgetEditRequired = status==='budget_limited' || getGoalBudgetExhaustedReasons(goal).length>0`（`:70`）；`canPause` 仅 active；`canStop = active || (paused && !ownerBusy)`（`:73`）；`canEdit = !running`；`canResume = !running && !budgetEditRequired && status∈{paused,blocked,failed,stopped}`（`:75`）。
4. **startGoalWithReplacement**（`:88-108`）：`confirmedGoalId` 与现存不符 → throw `'当前 Goal 已变化，请重新确认替换'`（`:95`）；existing 未 completed：无确认 → 返回 `{confirmation: existing}`（`:97`）；`stopping` 或（`activeRunId` 且非 active）→ throw `'Goal 正在停止，请等待结束后重试'`（`:98`）；active → `stopGoal` 后复核 id（不符 throw `:102`）与状态（仍 active/stopping/有 activeRunId → throw `:103`）；然后 `clearGoal`（`:105`）；最后 `startGoal`（`:107`）。注释（`:87`）：确认绑定具体 owner，替换必须完成 stop → archive/clear → start，失败不继续。

## 4. 调用者与调用链

入向（全冻结树检索 `goal-atoms`，4 文件）：
- `hooks/useGlobalAgentListeners.ts:11`（`agentGoalsAtom`/`hydrateAgentGoalsAtom`/`mergeAgentGoalAtom`）。
- `components/agent/AgentView.tsx:24`（`agentGoalAtomFamily`/`getGoalActions`/`GOAL_STATUS_LABELS`/`goalEditorAtomFamily`/`goalReplacementAtomFamily`/`startGoalWithReplacement`）。
- `components/agent/GoalStatusBar.tsx:9`（import 块）。
- 批外测试 `components/agent/GoalStatusBar.test.tsx:6`（`mergeAgentGoalAtom`）。
- 批内测试 `goal-atoms.test.ts`。
出向：`jotai`/`jotai/utils`、`@profer/shared`（`getGoalBudgetExhaustedReasons` `:3` + 类型 `:4`）。

## 5. 数据 I/O、读写与副作用

无磁盘/网络（不适用）。状态=3 个内存 atom/family；写操作经注入 API（`:80-85`）产生外部副作用（跨批实现）。

## 6. 分支、失败、取消与恢复

- 归并全分支见 §3.1（返回 boolean，不 throw）。
- `startGoalWithReplacement` 3 个 throw 点（`:95`/`:98`/`:102`/`:103` 共 4 处 throw 语句、3 种文案）：已变化/正在停止；失败即中止（不继续 clear/start，`:87` 注释）。
- 恢复/防复活：tombstone（`retiredGoalIdsAtom`）挡迟到事件与水合（`goalSnapshotsAtom` 保留 cleared 版本，`:8` 注释）。

## 7. 权限与权威状态

无 sender/role 检查（不适用）。权威状态=归并裁决（revision/startedAt/tombstone 组成的事件序权威）；owner 语义（`activeRunId`）控制操作矩阵（`:68-75`）。

## 8. 修改影响面

- 4 个消费方的 Goal UI（监听/视图/状态条/测试）；归并规则变化影响事件乱序/迟到的正确性。
- `getGoalActions` 矩阵是 UI 按钮契约；`GoalStartAPI` 形状是注入契约（AgentView 实现侧跨批）。
- 需同步修改的测试：`goal-atoms.test.ts`（批内 15 用例）、`GoalStatusBar.test.tsx`（批外）。

## 9. 测试证据

直接测试：`atoms/goal-atoms.test.ts`（批内，3 describe/15 test，详见其手册）：归并 7（revision 单调/跨 session 拒绝/水合不覆盖 live/clear tombstone/legacy 无 revision/编辑器隔离）、操作 4（可恢复矩阵/owner 占用/预算耗尽）、替换 4（确认/stop→clear→start 顺序/completed 直启/守卫拒绝）。批外 `GoalStatusBar.test.tsx:6` 用 `mergeAgentGoalAtom`（间接）。
未覆盖：`hydrateAgentGoalsAtom` 部分分支、`goalHistoryAtomFamily`/`goalActionPendingAtomFamily`。

`NOT_RUN`：本轮未运行 bun test，断言≠已运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 归并规则全分支/操作矩阵/替换守卫顺序 | 已证实 | `:1-108` 全文逐行 |
| 4 个调用方 | 已证实 | 全树检索（§4） |
| `getGoalBudgetExhaustedReasons` 判定细节 | 边界（跨批 shared） | `:3`/`:70` |
| GoalStartAPI 后端实现 | 边界（跨批） | `:80-85` |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `agentGoalsAtom`/两内部 atom | §2/§3.1 | 6-10 | covered |
| `mergeAgentGoalAtom` 全规则 | §3.1 | 12-38 | covered |
| `hydrateAgentGoalsAtom` | §3.2 | 41-46 | covered |
| 4 个 atomFamily | §2 | 48-60 | covered |
| `GOAL_STATUS_LABELS` | §2 | 62-65 | covered |
| `getGoalActions` 矩阵 | §3.3/§7 | 67-78 | covered |
| `startGoalWithReplacement` | §3.4/§6 | 88-108 | covered |

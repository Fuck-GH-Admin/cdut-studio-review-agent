---
path: apps/electron/src/renderer/atoms/goal-atoms.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6bb16f55804c7ef3fcb43b80d1be21d5570bd4c9
sha256: 84689837cce9ba1bcbfc98662fc534ea57761e16a459e73e7414c3df2e3ec9c4
lines: 158
kind: test
package: p08-renderer-ui
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/goal-atoms.test.ts

## 1. 测试目标

`goal-atoms` 的归并/操作/替换契约（158 行，bun:test，3 describe/15 test）：①事件归并规则（revision 单调、tombstone 防复活、水合不覆盖 live）；②`getGoalActions` 操作矩阵；③`startGoalWithReplacement` 确认/守卫/执行顺序。mock 边界：用 `jotai/vanilla` 的 `createStore()` 驱动真实 atom；替换流程注入**手写假 API**（`api()` 工厂 `:113-123`，记录 `calls`，非 mock.module）。

## 2. 用例清单

前置：fixture `goal(patch)`（`:9-14`，默认 `id:'goal-a', sessionId:'session-a', status:'paused', iteration:2, startedAt:100, updatedAt:200, revision:2` + limits 全字段）。依赖顺序：无（各用例独立 store/假 API）。

**describe `'Goal 状态归并'`（`:16-82`，7 test）**：
| # | 用例 | 行 | 断言要点 |
| --- | --- | --- | --- |
| 1 | 拒绝旧 revision 和重复事件，即使其时间戳更晚 | 17-24 | revision 4+updatedAt 999 → set false；重复事件 false；当前对象引用保持 |
| 2 | 旧 goal 的高 revision/迟到停止不能覆盖新 owner | 26-33 | goal-b 接管后，goal-a 的 revision 99 事件被拒，family 仍返回 goal-b |
| 3 | 拒绝跨 session 快照及无 owner 的 null 事件 | 35-41 | 两次 set false；`agentGoalsAtom.size` toBe(1) |
| 4 | 水合不能覆盖 live 变更或删除其他 session | 43-50 | live 保留；session-b 被水合填入 |
| 5 | clear 保留 tombstone，迟到 hydrate/同 owner 事件不得复活 | 52-63 | cleared 后 family undefined；hydrate/高 revision 均不复活；goal-b 接管后 goal-a 的 cleared 事件不抢 |
| 6 | legacy 无 revision 仅按时间向前，不能覆盖已版本化状态 | 65-73 | updatedAt 150 被拒（保持 200）；已版本化（revision 1）后无 revision 事件被拒 |
| 7 | 编辑器按会话隔离，不影响 Goal 快照 | 75-81 | editor-a 写入不影响 editor-b（null）；`agentGoalsAtom.size` toBe(0) |

**describe `'Goal 状态操作'`（`:84-110`，4 test）**：
| # | 用例 | 行 | 断言要点 |
| --- | --- | --- | --- |
| 8 | blocked/failed/stopped/paused 可恢复，active/stopping/completed 不可 | 85-92 | canResume 矩阵 |
| 9 | 停止超时/deadline 后仍有 owner 时不能恢复/编辑 | 94-98 | `{canResume:false, canEdit:false}`（paused/stopped/budget_limited + activeRunId） |
| 10 | active owner 仍可暂停/停止 | 100-102 | `{canPause:true, canStop:true, canEdit:false, canResume:false}` |
| 11 | 预算耗尽必须先编辑；运行中不可编辑 | 104-109 | budget_limited → `{canResume:false, canEdit:true, budgetEditRequired:true}`；paused+iteration 20（超 maxIterations 20？fixture limits.maxIterations=20）canResume false；active/stopping 矩阵 |

**describe `'Goal 替换流程'`（`:112-157`，4 test）**：
| # | 用例 | 行 | 断言要点 |
| --- | --- | --- | --- |
| 12 | 未完成目标先请求确认 | 125-131 | 6 状态均返回 `confirmation.id==='goal-a'`；`calls` toEqual `[]` |
| 13 | 确认 active owner 后 stop→clear→start | 133-137 | `calls` toEqual `['stop','clear','start']` |
| 14 | completed/不存在可直接开始 | 139-145 | `calls` toEqual `['start']` |
| 15 | 确认后 owner 已改变/stopping/busy 拒绝 | 147-157 | 三例 `rejects.toThrow('已变化'/'正在停止')`；`calls` 均 `[]` |

声明合计 **15 test / 0 it**（机械计数）。

## 3. 真实断言

逐条见 §2 表。关键精确断言：`:21-23`（`toBe(false)` ×2 + family 引用 `toBe(current)`）、`:69`（`updatedAt` toBe(200)）、`:72`（`revision` toBe(1)）、`:128-129`（`confirmation?.id` toBe + `calls` toEqual `[]`）、`:136`（`['stop','clear','start']` 顺序）、`:149`/`:152`/`:155`（`rejects.toThrow` 文案断言）。

## 4. 未覆盖与脆弱点

- **未覆盖**：`goalHistoryAtomFamily`/`goalActionPendingAtomFamily`；`hydrateAgentGoalsAtom` 对已有 snapshot 会话的跳过细节之外的形态；`startGoalWithReplacement` 中 `stopGoal` 后 `stopped.id !== existing.id` 分支（`:102`）无专门用例（用例 15 覆盖入口守卫）。
- **脆弱点**：用例 11 的 `paused+iteration 20` 依赖 `getGoalBudgetExhaustedReasons`（跨批 shared）对 `limits.maxIterations:20` 的实际判定（断言 canResume false 是**真实 shared 规则**驱动）；假 API 的 `stopGoal` 返回 `stopped` 状态（`:119`）是手写语义。
- 断言≠运行：本轮 `NOT_RUN`，bun test 未执行，通过状态未知。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 describe/15 用例设置/动作/断言如上 | 已证实 | `:1-158` 全文逐行 |
| 声明计数 15 test/0 it | 已证实（机械计数） | grep `test(`/`it(` |
| 替换流程为注入假 API（无 mock.module） | 已证实 | `:113-123` 工厂 |
| 真实运行结果 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 归并 7 场景 | §2.1/§3 | 17-81 | covered |
| getGoalActions 矩阵 4 | §2.2/§3 | 85-109 | covered |
| 替换流程 4 | §2.3/§3 | 125-157 | covered |
| history/pending family、stop 复核分支 | §4 | - | unknown（未覆盖） |

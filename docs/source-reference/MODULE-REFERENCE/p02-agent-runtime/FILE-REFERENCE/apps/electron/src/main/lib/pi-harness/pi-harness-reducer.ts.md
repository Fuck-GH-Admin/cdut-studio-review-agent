---
path: apps/electron/src/main/lib/pi-harness/pi-harness-reducer.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: dabf78fc3b056417b3fe107071951a37e1f5d047
sha256: 2cfe7a087bcb912c08cfce9469b6fc13bb0499780329101eaba37bf5e94add0d
lines: 164
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/pi-harness/pi-harness-reducer.ts

## 1. 结论与边界

**Harness 事件归并器**：把 append-only 事件流归并为 `PiHarnessSnapshot`（纯函数，无 I/O）。跨会话/重复事件记 diagnostics 不中断（`pi-harness-reducer.ts:37-46`）。依赖 `./types`（**域外** 194 行背景件：createEmptyPiHarnessSnapshot 等）。

## 2. 导出与关键符号

`export` 逐条核：1 个导出 + 2 内部。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `replayPiHarnessEvents` | 函数 | `:28` | `(sessionId, events, diagnostics=[]): PiHarnessSnapshot` |
| `EMPTY_AUTONOMY_USAGE`（内部） | 常量 | `:10` | 自主用量零值 |
| `mergeUsage`（内部） | 函数 | `:16` | Partial 合并（`next ?? previous ?? 0`） |

## 3. 内部逻辑与关键流程

replay 主循环（`:37-161`）11 类事件分支：
- **守卫**：sessionId 不符→diagnostic `invalid_event` 跳过（`:38-41`）；eventId 重复→`duplicate_event` 跳过（`:42-45`）。
- `goal_created`（`:49-61`）：建 goal（state:'active'，policy 直存）；`task_focus_changed`（`:62-69`）改 activeTaskId；`turn_started`（`:70-81`）建 turn（'starting'）；`turn_state_changed`（`:82-93`）合并 usage、settled/interrupted/failed 记 endedAt；`tool_fact_recorded`（`:94-96`）入 facts；`verification_state_changed`（`:97-105`）整替 verificationByTask（evidence 拷贝）；`autonomy_budget_consumed`（`:106-121`）按 kind 累计 taskTransitions/repairAttempts/equivalentVerificationRuns/cost；`goal_paused`/`goal_settled`（`:122-138`）改状态+暂停原因；`governor_candidate_recorded`（`:139-154`）指纹去重入候选表；`manual_candidate_continued`（`:155-159`）指纹去重入手动表。

## 4. 调用者与调用链

- 入向：`pi-harness-store.ts:5`（load/copy 时归并，本批）、`evals/replay.ts:2`（本批）。
- 出向：`./types`（域外）。

## 5. 数据 I/O、读写与副作用

无（返回新 snapshot；入参 diagnostics 合并）。

## 6. 分支、失败、取消与恢复

守卫双分支记 diagnostics；无抛错；无取消。

## 7. 权限与权威状态

状态权威=事件流（append-only 归并）；`manual_candidate_continued` 仅记录用户点击（域外 types:128 注释互证）。

## 8. 修改影响面

store 加载/eval 回放/bridge 校验的统一状态来源；usage 合并语义被 store/bridge 测试锁定。

## 9. 测试证据

`NOT_RUN`。直接测试：无专属文件（检索 nb-56 8 测试文件）；间接：`pi-harness-store.test.ts` 5 用例（归并断言含 usage/诊断码序列）、`orchestrator-bridge.test.ts`（状态断言）、`evals/replay.test.ts`（fixture 归并）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 11 类事件归并/守卫/usage 合并 | 已证实 | `:1-164` 全文 + 间接测试互证 |
| `./types` 形状 | 边界 | 域外（已读背景：194 行） |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/域 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+2 内部+11 分支 | §2/§3 | 10-163 | covered |

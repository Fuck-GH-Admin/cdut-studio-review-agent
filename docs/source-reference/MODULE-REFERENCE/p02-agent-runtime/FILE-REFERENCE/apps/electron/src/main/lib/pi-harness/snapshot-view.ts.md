---
path: apps/electron/src/main/lib/pi-harness/snapshot-view.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7112cdc7f05d10e50d33e95fb793376e3b60a27f
sha256: 5f159eb406f0208d1c5fac964afcf4da9cb63645cf664f3745e7ff6739a1d6cb
lines: 93
kind: source
package: p02-agent-runtime
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/pi-harness/snapshot-view.ts

## 1. 结论与边界

内部快照 → **renderer 安全视图**的投影器（`:28-32` 注释红线："ToolFact subject、哈希、指纹、事件 ID、诊断绝不跨界"）。对应 shared 侧 `PiHarnessSnapshotView`（p07 types 手册 `pi-harness.ts` 篇）。

不做的事：不改快照；不透传内部字段；无持久化。

## 2. 导出与关键符号

| 符号 | 行 | 行为 |
| --- | --- | --- |
| `toPiHarnessSnapshotView` | `:33-93` | `(snapshot: PiHarnessSnapshot) => PiHarnessSnapshotView` 纯投影 |

内部：`latest:4-6`（时间戳降序取首）、`latestGoal:8-10`（goals 按 updatedAt 取最新）、`toTurnView:12-26`（turn→execution 视图：state + 可选 endedAt/endReason/usage 6 字段平铺）。

## 3. 内部逻辑与关键流程

投影四步：

1. **assurance 播种**（`:37-42`）：`verificationByTask` 每项→task 视图的 `assurance{state,reason,updatedAt}`（**evidenceFactIds 不带出**）。
2. **execution 取最新**（`:44-54`）：按 `activeTaskId` 归属、`endedAt ?? startedAt` 时间戳取每任务最新 turn → `execution`（`toTurnView`）。
3. **lastFactSummary**（`:56-61`）：facts 按时间降序取每任务首条 `fact.summary`（`:56` 注释：摘要只含工具名/路径/类别，正文与哈希不外带）。
4. **shadowCandidate**（`:63-80`）：candidates 按时间升序、taskId 缺省回落 `goal.activeTaskId`；**`canManuallyContinue` 仅当** `action==='ready_task' && blockedReason==='shadow_mode' && 指纹未在 manuallyContinued 里`（`:67-69`）；action 归一为 `'ready_task'|'required_verification'` 二值（`:74`）。

返回 `{sessionId, goal?{state,activeTaskId?,pauseReason?}, tasks}`；`goal.pauseReason` 取 `goalPauseReasons[goal.id]`（`:88`）。

## 4. 调用者与调用链

main→renderer 快照 IPC 投影口（preload `getPiHarnessEventsPath` 族/Agent 视图）；出向：`@profer/shared`（`PiHarnessSnapshotView`）、`./types`。`pi-harness.ts`（shared）契约对手。

## 5. 数据 I/O、读写与副作用

纯函数；无 I/O、无副作用。

## 6. 分支、失败、取消与恢复

不适用。边界分支：turn 无 `activeTaskId` 跳过（`:46`）；candidate 无 taskId 且无 goal→跳过（`:64-65`）；canManuallyContinue 仅 true 时输出该键（`:77`，消费方 `?.canManuallyContinue` 判 undefined）。

## 7. 权限与权威状态

- **脱敏边界**（`:28-32`、`:56`）：subject/哈希/指纹/事件 ID/诊断不过界；`manuallyContinuedCandidateFingerprints` 只用于判定不出内容（测试 `:55-56` 断言指纹/事件 ID 不出现在序列化中）。
- **manual 续跑授权语义**（`:67-69` + `apps/electron/src/main/lib/pi-harness/types.ts:128`）：仅"未消费的 ready_task/shadow_mode 候选"可手动继续；已消费指纹不再出。

## 8. 修改影响面

改投影字段影响 renderer Agent 视图与安全边界（加字段需安全复核）；`canManuallyContinue` 判定条件改动影响手动续跑闸。

## 9. 测试证据

直接测试 `snapshot-view.test.ts`（2 个 `test(`）：全字段投影 + 序列化不含 secret-command-hash/secret-fingerprint/internal-event/evidenceFactIds（`:21-40`）；`canManuallyContinue` 仅未消费 ready_task 出 true、消费后 undefined 且指纹/事件 ID 不外泄（`:42-57`）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 投影四步/脱敏边界 | 已证实 | 文件全读 + 2 测试断言 |
| `canManuallyContinue` 三条件 | 已证实 | `:67-69` + 测试 `:48-56` |
| `latestGoal` 多 goal 时"最新"口径 | 已证实 | `:8-10`（updatedAt 降序） |
| 实际 IPC 调用点脱敏一致性 | 未知 | 调用点不在本批 |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 1 导出 + 3 助手 | §2 | covered |
| 投影四步 | §3 | covered |
| 脱敏/授权 | §7 | covered |
| 2 测试断言 | §9 | covered |
| 未知 | §10 | covered |

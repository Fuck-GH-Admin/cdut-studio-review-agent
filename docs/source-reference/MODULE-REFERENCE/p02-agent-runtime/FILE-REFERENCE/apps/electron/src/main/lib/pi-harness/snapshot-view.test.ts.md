---
path: apps/electron/src/main/lib/pi-harness/snapshot-view.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2c27a7bb035d3d35b00bd10af063b7aaddfd1dbb
sha256: e3c9690509fc70667bc172c2132e05f293b8fca2afc0093744892edc0e7759cb
lines: 58
kind: test
package: p02-agent-runtime
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/pi-harness/snapshot-view.test.ts

## 1. 测试目标

直接测试 `toPiHarnessSnapshotView`（snapshot-view.ts）的**投影正确性与脱敏边界**：内部 ledger 字段（命令哈希/指纹/事件 ID/evidenceFactIds）不跨界；`canManuallyContinue` 仅未消费 ready_task 候选暴露。2 个 `test(`，1 个 `describe('Pi Harness snapshot view')`（`:20`）。

不测试：IPC 层、store 重放。

## 2. 用例清单

夹具 `snapshot()`（`:5-18`）：`createEmptyPiHarnessSnapshot('session')` 基底 + goal（paused/activeTaskId=task，`:7-11`）+ pauseReason 'user_stop'（`:12`）+ turn（interrupted/usage，`:13`）+ verificationByTask（pending，evidenceFactIds `['secret-fact-id']`，`:14`）+ fact（`subject.commandHash='secret-command-hash'`、`fingerprint='secret-fingerprint'`，`:15`）+ governorCandidate（required_verification/shadow_mode，`fingerprint='internal-fingerprint'`，`:16`）。无 mock/无 IO。

| # | 行 | 设置 | 动作 | 真实断言 |
| --- | --- | --- | --- | --- |
| 1 | `:21-40` | 全字段夹具 | `toPiHarnessSnapshotView` | `:23` `toMatchObject{sessionId:'session', goal:{state:'paused',activeTaskId:'task',pauseReason:'user_stop'}, tasks.task:{assurance:{state:'pending',reason:'缺少测试'}, execution:{state:'interrupted',endReason:'user_stop',modelCalls:1}, lastFactSummary:'Bash test success', shadowCandidate:{action:'required_verification',blockedReason:'shadow_mode'}}}`；`:36-39` `JSON.stringify(view)` `not.toContain` ×4（'secret-command-hash'/'secret-fingerprint'/'internal-event'/'evidenceFactIds'） |
| 2 | `:42-57` | 候选改 ready_task | 投影→消费→再投影 | `:48` shadowCandidate `toMatchObject{action:'ready_task',blockedReason:'shadow_mode',canManuallyContinue:true}`；`:52` push 消费指纹后 `:54` `canManuallyContinue` `toBeUndefined()`；`:55-56` 序列化 `not.toContain` 'ready-fingerprint'/'internal-ready-event' |

## 3. 真实断言

`toMatchObject`（结构+值）+ `not.toContain`（脱敏字符串）+ `toBeUndefined`（闸门关闭）。无快照测试。

## 4. 未覆盖

- 多 goal 时 `latestGoal` 的 updatedAt 选择。
- candidate 无 taskId 回落 `goal.activeTaskId` 分支（夹具恒带 taskId）。
- turn 无 `activeTaskId` 跳过分支。
- `required_verification` 非 shadow_mode 的 canManuallyContinue 假值路径（隐含在条件里，无显式断言）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 个 `test(`、断言如 §2 | 已证实 | 文件全读 |
| 脱敏四断言 + 消费后指纹不外泄 | 已证实 | `:36-39`、`:54-56` |
| 实际执行结果 | 未知 | `NOT_RUN`（本轮未跑 bun test） |

## 6. 覆盖表

| 被测行为 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 全字段投影 | §2 用例 1 | `:23-34` | covered |
| 脱敏边界 | §2 用例 1 | `:36-39` | covered |
| canManuallyContinue 开 | §2 用例 2 | `:48-50` | covered |
| canManuallyContinue 关+脱敏 | §2 用例 2 | `:52-56` | covered |
| §4 边缘分支 | — | — | unknown（未覆盖） |

---
path: packages/shared/src/types/pi-harness.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e93fb254a1175a412e62e1adf166a54250da1cbb
sha256: 1898532fbe7d38b6242f338b539fc776fb3ce0ce4a654d990cb0f75c5530bc09
lines: 58
kind: source
package: p07-shared-libs
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# packages/shared/src/types/pi-harness.ts

## 1. 结论与边界

Pi Host Harness 的**渲染层安全视图**契约（`:1-6` 注释："Sanitized, renderer-safe"）：刻意排除 ToolFact subjects、命令哈希、事件 ID 与原始 ledger 诊断——**投影权威在主进程**。6 个类型（3 状态枚举 + 4 视图接口，其中 1 个输入接口）。

不做的事：不暴露 harness 内部账本；不做投影逻辑（主进程 `pi-harness` 投影层负责）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 形状 |
| --- | --- | --- | --- |
| `PiHarnessAssuranceViewState` | type | `:8` | `'not_required'\|'pending'\|'verified'\|'failed'\|'waived'` |
| `PiHarnessExecutionViewState` | type | `:9` | `'starting'\|'running'\|'compacting'\|'retrying'\|'settled'\|'interrupted'\|'failed'` |
| `PiHarnessGoalViewState` | type | `:10` | `'active'\|'paused'\|'settled'\|'cancelled'` |
| `PiHarnessTurnView` | interface | `:12-22` | `{state; endedAt?; endReason?; modelCalls?; inputTokens?; outputTokens?; retries?; compactions?; durationMs?}` |
| `PiHarnessShadowCandidateView` | interface | `:24-30` | `{action:'required_verification'\|'ready_task'; reason; blockedReason?; canManuallyContinue?}`（`:28` 注释：仅未消费的 ready_task/shadow_mode 候选为 true） |
| `PiHarnessManualContinueInput` | interface | `:33-36` | `{sessionId; taskId}`（`:32` 注释：renderer 只能提名图任务，主进程重验） |
| `PiHarnessTaskView` | interface | `:38-48` | `{taskId; assurance?{state,reason,updatedAt}; execution?; lastFactSummary?; shadowCandidate?}` |
| `PiHarnessSnapshotView` | interface | `:50-58` | `{sessionId; goal?{state,activeTaskId?,pauseReason?}; tasks:Record<string,PiHarnessTaskView>}` |

## 3. 内部逻辑与关键流程

纯声明。安全投影语义（`{:1-6` 注释）：渲染层拿到的是视图而非事实源；`PiHarnessManualContinueInput` 的"主进程重验"（`:32`）意味着 renderer 提名不可伪造权威。

## 4. 调用者与调用链

preload `getPiHarnessEventsPath` 相关桥（`preload/index.ts` Pi 段）与 Agent 视图（harness 快照 UI）；主进程 `lib/pi-harness/` 投影层产出这些视图（`pi-harness-store` 等）。出向：无 import。

## 5. 数据 I/O、读写与副作用

纯类型，无 I/O。

## 6. 分支、失败、取消与恢复

不适用。状态枚举本身承载失败/中断语义（`'failed'`/`'interrupted'`/`'compacting'`/`'retrying'`），裁决在主进程状态机。

## 7. 权限与权威状态

**安全边界契约**：ToolFact subjects/命令哈希/事件 ID/ledger 诊断不出本层（`:4-5`）；`canManuallyContinue` 与 manual-continue 由主进程重验（`:28`、`:32`）。renderer 消费的是"只读投影"。

## 8. 修改影响面

增删状态值影响 Agent 视图渲染分支与主进程投影映射；把内部字段加进视图会破坏安全边界（注释红线），需安全复核。

## 9. 测试证据

无直接契约断言，但 **`apps/electron/src/renderer/lib/pi-harness-view-model.test.ts` 消费本视图类型**（`:2` import type + `:5`/`:24`/`:32`/`:35` 5 处引用；主根 grep 复核 1 文件命中，之前"0 命中"为检索失误）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 导出、形状如 §2 | 已证实 | 文件全读 |
| 安全投影边界（排除 4 类内部数据） | 已证实 | `:1-6` 注释 |
| manual-continue 主进程重验 | 已证实（注释语义） | `:32` |
| 投影层实际是否泄露内部字段 | 未知 | 投影实现不在本批 |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 8 导出全量 | §2 | covered |
| 安全边界/权威 | §3/§7 | covered |
| 消费者/影响面 | §4/§8 | covered |
| 测试/未知 | §9/§10 | covered |

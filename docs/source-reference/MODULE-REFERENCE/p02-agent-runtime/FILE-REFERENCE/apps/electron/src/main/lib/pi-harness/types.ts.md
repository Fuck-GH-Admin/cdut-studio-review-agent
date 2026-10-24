---
path: apps/electron/src/main/lib/pi-harness/types.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 271492e93ed7c39d3f7c53d46a0d60fe52087912
sha256: 0b02cc2111cd2d08546f28d5196663d01fa436ba494205bddfa364c1495329ad
lines: 194
kind: source
package: p02-agent-runtime
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/pi-harness/types.ts

## 1. 结论与边界

Pi Host Harness **内部追加型执行控制事件契约**（`:1`："Internal, append-only execution-control events"）：事件版本常量、状态枚举、Goal/Turn/ToolFact/Verification 实体、11 型事件联合、快照与诊断类型 + 1 个工厂函数。是 pi-harness 全家（store/reducer/telemetry/snapshot-view/tool-facts/verification-evaluator）的类型地基。

不做的事：不持久化（`pi-harness-store` 负责 JSONL）；不投影（`snapshot-view` 负责 renderer 安全视图）；不含遥测聚合（`telemetry.ts`）。

## 2. 导出与关键符号

**常量/枚举**：`PI_HARNESS_EVENT_VERSION = 1`（`:3`）；`PiHarnessGoalState:5`（active/paused/settled/cancelled）；`PiHarnessTurnState:6-13`（7 态含 compacting/retrying）；`AssuranceState:14`（not_required/pending/verified/failed/waived）。

**实体**：

| 符号 | 行 | 要点 |
| --- | --- | --- |
| `PiHarnessPolicySnapshot` | `:17-21` | `governorMode: 'shadow'`（**字面量单值**，`:16` 注释：首版只观察、绝不创建后续模型轮次）、`permissionMode`、`maxFocusChars` |
| `PiTurnUsage` | `:23-30` | modelCalls/inputTokens/outputTokens/retries/compactions/durationMs |
| `PiGoalAutonomyUsage` | `:32-37` | taskTransitions/repairAttemptsByTask/equivalentVerificationRuns/estimatedCostUsd? |
| `PiHarnessGoal` | `:39-49` | +policy+autonomyUsage |
| `PiHarnessTurn` | `:51-60` | goalId/activeTaskId?/state/startedAt/endedAt?/endReason?/usage? |
| `ToolFact` | `:62-74` | {id,goalId,turnId,taskId?,kind,timestamp,toolName,outcome:'success'\|'failure'\|'unknown',subject:Record,summary,fingerprint} |
| `VerificationState` | `:76-82` | taskId/state/reason/evidenceFactIds[]/updatedAt |
| `PiHarnessEvent` | `:92-145` | 11 型联合（`PiHarnessEventBase:84-90` 公共 version/eventId/timestamp/sessionId/goalId）：goal_created/task_focus_changed/turn_started/turn_state_changed/tool_fact_recorded/verification_state_changed/governor_candidate_recorded/**manual_candidate_continued**（`:128` 注释"仅记录用户点击，绝不授予自主执行"）/autonomy_budget_consumed/goal_paused/goal_settled |
| `PiHarnessDiagnostic` | `:147-151` | code: invalid_json/invalid_event/unsupported_version/duplicate_event |
| `GovernorCandidateRecord` | `:153-163` | action/reason/blockedReason?/estimatedPromptChars/fingerprint |
| `PiHarnessSnapshot` | `:165-179` | 快照全景 + 3 个指纹/候选注释（`:171` 防无变化循环、`:173` 用户点选≠自主、`:175` 渲染前脱敏） |
| `createEmptyPiHarnessSnapshot` | `:181-194` | 空快照工厂（9 个字段初始化） |

## 3. 内部逻辑与关键流程

纯声明 + 1 纯工厂。事件联合的判别字段：`type` + 可选 `turnId`/`taskId` 约定（如 `tool_fact_recorded` 必带 `turnId`、payload 内嵌 `ToolFact`）。注释级红线：`manual_candidate_continued` 仅记录点击（`:128`）；`governorMode:'shadow'` 只观察（`:16`）。

## 4. 调用者与调用链

`pi-harness-store`（JSONL 读写/parse，全批兄弟）、`pi-harness-reducer`（`replayPiHarnessEvents`）、`telemetry.ts`/`snapshot-view.ts`/`tool-facts.ts`/`verification-evaluator.ts`（均 import 本文件类型）；preload `PiHarnessSnapshotView`（shared 侧投影类型）对应本文件 `PiHarnessSnapshot` 的净化版。

## 5. 数据 I/O、读写与副作用

纯类型 + 纯工厂；无 I/O。

## 6. 分支、失败、取消与恢复

不适用。失败/取消语义由枚举承载（turn `failed`/`interrupted`、goal `cancelled`、event `goal_paused`）。

## 7. 权限与权威状态

三条权威注释（照实）：`:16` shadow 观察不自主；`:128` manual 续跑不授权；`:171-175` 指纹数组防重复循环、用户选择≠自主、`governorCandidates` 渲染前脱敏。事件 `version` 字段（`:85`）是格式版本权威。

## 8. 修改影响面

改事件联合/实体影响 store 序列化（JSONL append-only 兼容性）、reducer 重放、telemetry 聚合、snapshot 投影；`PI_HARNESS_EVENT_VERSION` 升版需迁移（diagnostics 的 `unsupported_version` 拒绝旧版本——见 store 侧）。

## 9. 测试证据

间接测试：`snapshot-view.test.ts`/`telemetry.test.ts`/`verification-evaluator.test.ts` 均以本文件类型构造夹具（`createEmptyPiHarnessSnapshot:2`、`PiHarnessEvent` 工厂 `telemetry.test.ts:14-20`）。无直接断言本文件。`NOT_RUN`：本轮未执行测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全部导出（1 常量 + 3 枚举 + 10 接口 + 1 事件联合 `PiHarnessEvent:92` + 1 工厂，合计 16 个 `^export`） | 已证实 | 文件全读（§2 表 16 项全列） |
| 三条权威注释（shadow/manual/脱敏） | 已证实 | `:16`、`:128`、`:171-175` |
| 11 型事件判别结构 | 已证实 | `:92-145` |
| 事件 JSONL 兼容策略 | 未知 | store 实现不在本批 |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全部导出 | §2 | covered |
| 事件判别/权威红线 | §3/§7 | covered |
| 消费者/影响面 | §4/§8 | covered |
| 测试/未知 | §9/§10 | covered |

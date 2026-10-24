---
path: apps/electron/src/main/lib/pi-harness/telemetry.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5b7464e771ca9fbe36502586e4f42a3028926697
sha256: 7baa1efbfae22676795290e38e249cb5a68e7d05529fc9a6644b905901388245
lines: 274
kind: source
package: p02-agent-runtime
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/pi-harness/telemetry.ts

## 1. 结论与边界

Pi Harness **本地诊断遥测聚合**（`:36-39` 注释："Local-only diagnostic summary，刻意排除 prompts、tool input、命令/输出正文、路径、fact subject、渲染层数据"）。把快照（+可选事件流）确定性重放为可导出统计：用量/自主度/候选/验证覆盖/安全计数/分 Goal 明细。`serializePiHarnessTelemetry` 提供稳定 JSON。

不做的事：不调度、不改 ledger、不外发遥测、不调模型（`:123-127` 注释）；不做持久化。

## 2. 导出与关键符号

| 符号 | 行 | 形状 |
| --- | --- | --- |
| `PI_HARNESS_TELEMETRY_VERSION = 1` | `:14` | 遥测格式版本 |
| `PiHarnessGoalTelemetry` | `:19-34` | 分 Goal：state/turnCount/6 项用量/estimatedCostUsd?/autonomy 3 项/candidateCount/paused |
| `PiHarnessTelemetry` | `:40-74` | 总表：goals/turns 状态计数+total、usage(+cost)、autonomy、candidates(byBlockedReason 4 值)、verification(CountBy 5 态 + tracked/requiredTasks/coverageRatio/falseVerified)、**safety 5 项**（`:63-72`）、byGoal |
| `collectPiHarnessTelemetry` | `:129-269` | `({snapshot, graph, events?}) => PiHarnessTelemetry` 纯聚合 |
| `serializePiHarnessTelemetry` | `:272-274` | `JSON.stringify(…,null,2)+'\n'` 稳定导出 |

内部：`usageOf:76-85`（缺省全 0）、`emptyStateCounts:87-89`、`sumRecord:91-93`、`candidateBlockedReason:95-100`（3 已知 + 'other'）、`hasNoChangeFailedValidation:102-114`、`latestPauseTimestamp:116-121`；类型 `CountBy:16`、`CandidateBlockedReason:17`。

## 3. 内部逻辑与关键流程

聚合四循环 + 两个安全统计：

1. **Goal 循环**（`:153-176`）：per-goal 用量求和（`usageOf` 缺省 0）、autonomy `sumRecord`、cost 可选透传、`paused` 布尔。
2. **Turn 循环**（`:178-188`）：总用量累加。
3. **Autonomy 归并**（`:190-196`）：跨 goal 求和 + `usage.estimatedCostUsd` 累加。
4. **验证对账**（`:198-213`）：stored 计数；graph 里 `getTaskVerificationContext(task).required` 的任务逐个用 `evaluateVerification` **重算**，`verified` 存量但重算非 verified → `falseVerified++`（`:206-209`）；`coverageRatio = verified/requiredTasks`（无 required→1）。
5. **候选统计**（`:215-222`）：action 二分 + blockedReason 4 分桶。
6. **安全项**：`duplicateNoChangeFailedVerificationCandidates`（`:259-261`，`hasNoChangeFailedValidation`：required_verification 候选在最近 verification_command 失败后无成功 file_mutation = 无变化循环，`:102-114`）；`blockedNoChangeFailedVerificationLoops`（`:224-236`，failed 态任务同判定）；`pauses`/`turnsStartedAfterPause`（`:237-242`，暂停后新 turn 供人工审计）；`sidecarDiagnostics`（`:265`）。

## 4. 调用者与调用链

`session-telemetry.ts`（`collectSessionPiHarnessTelemetry` 包装）；诊断导出/回归 diff（`:271` 注释）。出向：`@profer/project-core`（`getTaskVerificationContext`/`TaskGraph`）、`./verification-evaluator`、`./types`。

## 5. 数据 I/O、读写与副作用

纯聚合；无 I/O、无副作用（`:123-127` 注释四不：不调度/不改 ledger/不外发/不调模型）。

## 6. 分支、失败、取消与恢复

不适用。统计口径分支：coverageRatio 空分母→1（`:211`）；cost 缺省→不透传（`:169`）；events 缺省→[]（边界诊断丢失，`:126-127` 注释）。

## 7. 权限与权威状态

- **脱敏边界**（`:36-39`）：排除 prompts/tool input/命令正文/路径/subject/渲染数据——只有计数与哈希级指标。
- **safety 语义权威**（`:63-72`）：duplicate 目标恒 0（`:64`）、blocked=Governor 应挡且在挡（`:66`）、暂停后 turn 只供人工审计不计自主成功（`:69`）。
- `falseVerified` 重算以 `evaluateVerification` 为权威（`:207`）。

## 8. 修改影响面

改统计口径影响诊断导出与安全审计（loop breaker 目标值）；`evaluateVerification` 行为变 → falseVerified 连动；`PiHarnessTelemetry` 形状是导出契约（`version` 升版需迁移）。

## 9. 测试证据

直接测试 `telemetry.test.ts`（3 个 `test(`）：用量/成本归 Goal + 序列化不含 commandHash（`:23-35`）；falseVerified 与 no-change-loop 计数（`:37-56`）；暂停后 turn 计数（`:58-66`）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 导出、聚合流程、safety 5 项语义 | 已证实 | 文件全读 |
| 脱敏边界（四不+排除清单） | 已证实 | `:36-39`、`:123-127` |
| falseVerified 重算 | 已证实 | `:206-209` + 测试 `:55` |
| `hasNoChangeFailedValidation` 与 blocked-loop 判定的口径差异（候选 vs 任务视角） | 已证实 | `:102-114` vs `:224-236` |
| `estimatedCostUsd` 会计口径 | 未知 | 只累加 goal.autonomyUsage，来源不在本批 |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 5 导出全量 | §2 | covered |
| 聚合四循环+safety | §3 | covered |
| 脱敏/安全权威 | §7 | covered |
| 3 测试断言 | §9 | covered |
| 未知 | §10 | covered |

---
path: apps/electron/src/main/lib/review/review-pi-admission.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f4a6369170dcfc2839b398b144afa07a9d1577d5
sha256: 58763939f76efffe41c14074528b74b1d60cfc83b9140b49fd9f10144304e200
lines: 204
kind: source
package: p05-review-engine
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-pi-admission.ts

## 1. 结论与边界

P03-S02：已准备的直接 Pi 评审轮次的 **Main 侧受理缝**（admission seam）（`apps/electron/src/main/lib/review/review-pi-admission.ts:1-10`）。**不是**第二 runner/任务存储；调用方提供既有 `agent-service.runAgent()` 作为 `execute`，Agent Promise 在受理 ACK 返回后仍由 Main 持有。**不暴露 IPC**：会话归属/桌面/Pocket 守卫须在外部入口先存在。

## 2. 导出与关键符号

`export` 共 **3 个**（2 type + 1 函数）。

| 符号 | 类型 | 行 | 形状 | 说明 |
| --- | --- | --- | --- | --- |
| `ReviewAdmissionReceipt` | 导出 type | `:20-25` | `{caseId, sessionId, runId, assignmentId}`（Readonly） | 受理回执 |
| `OwnedReviewExecutor` | 导出 type | `:27` | `(input: AgentSendInput, onRunOwned: () => void) => Promise<void>` | 执行器合同 |
| `admitPreparedPiReviewTurn` | 导出函数 | `:65-204` | `(input, binding: PiReviewBinding, execute) => Promise<ReviewAdmissionReceipt>` | 唯一受理入口 |

另有导出 `isPiReviewRunAdmitted(caseId, runId)`（`:42-45`，导出函数——注意第 4 个导出）：检查进程内 `admittedByCase` 且 `isCurrent`。**修正计数：`export` 共 4 个**。

内部状态（`:30-32`）：`runningAssignments: Set`（进程内重复受理栅栏）、`admittedByCase: Map`（进程内已验证 ACK；注释强调**不是**替代持久运行账本）；辅助 `forgetAdmitted`（`:34-39`）、`isCurrent`（`:47-53`，比对 `getPiReviewBindingForSession` 的四元组）、`closeIfCurrent`（`:55-58`，失败终态 `finishPiReviewRunV2(binding,{status:'failed',error})`）。

## 3. 内部逻辑与关键流程

### 3.1 受理前门禁（`:70-88`）

1. 轮次一致性（`:70-73`）：`input.sessionId===binding.sessionId && input.agentRuntime==='pi' && input.triggeredBy==='user' && input.uuid`，否则 reject「审核受理参数与可信 Pi 用户轮次不一致」。
2. 指派有效性（`:74-81`）：`getRunV2(...).status==='running'` 且 `isCurrent(binding)` 且 `findActivePiReviewAssignment(sessionId)` 的 id/turnId/activeRunId 与 binding 一致，否则 reject「审核指派已失效」。注释（`:75-76`）：绑定查询与权限检查语义不同——只有受理需要证明 V2 run 仍在 running。
3. 拒绝外部 `onRunOutcome`（`:82-84`）：「审核收尾必须由 Main 统一绑定」。
4. 重复受理栅栏（`:85-87`）：`runningAssignments.has(assignmentId)` → reject「不得重复启动」；通过后立即 add（`:88`）。

### 3.2 执行与所有权（`:90-149`）

`admitted` Promise 由 `onRunOwned` 回调 resolve（`:186-192`）：若未 `finished`/未 `owned` 且 `isCurrent` → `owned=true`、`admittedByCase.set`、resolve 回执。`execute(...)` 的 Promise 链收尾（`:193-202`）：成功 `finishExecution()`、失败 `finishExecution(error)`、末层 `.catch` 防御（`:196-201`）。

`finishExecution`（`:117-149`）：置 `finished`；四类异常收尾——执行错误、未获执行权、终态写失败、已报终态但 V2 仍 running（「Agent 未产生可信的完成回调」，`:117-128`）；`finally` 中 `revokeAssignment`（先进程内隔离再落盘，`:133-138`）并释放两道栅栏（`:141-142`）；未获执行权时 reject admission（`:144-147`）。

### 3.3 `onRunOutcome` 终态回调（`:156-185`）

仅当 `ownsThisRun` 且 V2 状态仍 running/queued 才落盘：`finishPiReviewRunV2(binding, outcome)` 后复读确认终态，否则抛「V2 终态未成功持久化，不能视为已完成」（`:163-169`）；迟到回调不重开终态（`:161-163` 注释）。落盘失败 → 记 `terminalWriteFailure` + 立即 `revokeAssignment` + `forgetAdmitted`（`:172-183`，注释：旧磁盘 running 在窗口内不再有授权效力）。

### 3.4 日志纪律（`:101-105`）

`reportSettlementError` 显式诊断，**绝不**记录 `input.userMessage`/模型转写/凭据；持久写失败不得报成功（`:102-103`）。

## 4. 调用者与调用链

- 外部入口（会话归属/桌面/Pocket 守卫在彼处）；`execute` 由调用方注入（agent-service `runAgent`）。
- 出向：`pi-case-review-service`（`finishPiReviewRunV2`/`getPiReviewBindingForSession`）、`review-agent-assignment`（`findActivePiReviewAssignment`/`revokeAssignment`）、`run-store-v2.getRunV2`。
- 测试：`review-owned-session.p03.test.ts`（98 行）覆盖 P03 会话归属（间接）；本文件无专属测试（全树检索 `admitPreparedPiReviewTurn` 测试命中 0）。

## 5. 数据 I/O、读写与副作用

- **读**：V2 run 状态、指派、绑定。
- **写**：`finishPiReviewRunV2`（终态）、`revokeAssignment`（撤销）。全部经既有服务，非自建账本。
- **进程内状态**：两个栅栏（`Set`/`Map`）。
- **副作用**：`console.error` 诊断。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 轮次参数不一致 | `:70-73` | reject |
| 指派失效 | `:74-81` | reject |
| 外部 onRunOutcome | `:82-84` | reject |
| 重复受理 | `:85-87` | reject |
| 执行器 reject | `:195` | `finishExecution(error)` → 终态 failed |
| 未获执行权 | `:122-123` | failed + admission reject |
| 终态写失败 | `:124-125`、`:172-183` | failed + 立即撤销指派 |
| 无可信完成回调 | `:126-128` | failed「Agent 未产生可信的完成回调」 |
| 撤销/收尾再抛 | `:137-138`、`:129-130` | 诊断日志，不吞 |

**恢复**：进程内栅栏在 `finally` 必释放（`:140-143`）；`revokeAssignment` 落盘失败仍进程内隔离（`:133-135` 注释）。

## 7. 权限与权威状态

- 不认证调用方（无 IPC）；前置守卫（会话归属/桌面/Pocket）在外部入口。
- 「持久 running 不等于授予执行权」（`:41`、`:63` 注释）——受理以指派+绑定+running 三证为准。
- Main 统一绑定收尾，拒绝外部 `onRunOutcome`（`:82-84`）。

## 8. 修改影响面

- 收尾语义（四类异常）与 `pi-case-review-service.finishPiReviewRunV2` 的终态集耦合。
- 两道栅栏的释放顺序（`:141-142`）是防泄漏关键；改动会引入悬挂受理。
- `isPiReviewRunAdmitted` 消费方依赖其「进程内+isCurrent」语义。

## 9. 测试证据

- **无直接测试**（全树检索 `admitPreparedPiReviewTurn`/`isPiReviewRunAdmitted` 测试命中 0）。
- 间接：`review-owned-session.p03.test.ts`（P03 会话归属合同）、`review-feishu-owner-boundary.p05.test.ts`（Owner 边界）。
- **NOT_RUN**：未运行测试/构建/GUI。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 个导出（3+`isPiReviewRunAdmitted`） | 已证实 | `:20`、`:27`、`:42`、`:65` |
| 四类异常收尾全路径 | 已证实 | `:117-149` |
| 迟到回调不重开终态 | 已证实 | `:161-169` |
| 落盘失败立即撤销+隔离 | 已证实 | `:172-183` |
| 无直接测试 | 已证实 | 全冻结树检索 |
| 外部入口的守卫实现 | 未知 | 注释所指会话/桌面/Pocket 守卫未逐行读 |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 个导出 | 2 | — | covered |
| 门禁四条 | 3.1 | `:70-88` | covered |
| 执行/所有权/收尾 | 3.2 | `:90-149` | covered |
| 终态回调 | 3.3 | `:156-185` | covered |
| 失败分支 | 6 | — | covered |
| 权限边界 | 7 | — | covered |
| 测试证据 | 9 | — | covered（无直接测试） |

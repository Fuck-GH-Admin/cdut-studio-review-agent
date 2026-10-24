---
path: apps/electron/src/main/lib/review/review-v3-a24-bounded-technical-batch.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 89287c34a37955bdc3d65282a2bed2c18a99f76f
sha256: e897de793b453259ea83f0ed57fd2cd260acca5e2703eeb08ee0bf0956b646f0
lines: 215
kind: source
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-a24-bounded-technical-batch.ts

## 1. 结论与边界

Dev-A R24：有界、Main 内部隐藏/批次 Case 调度（文件头 `:1-10`）：队列作业**只存在于本进程**，不是持久 provider 意图——崩溃即丢队列；调用方须先检查 A22 每案耐久 spool 再做**显式、新授权**的重提。活跃作业经 A22 协调器持久化，**重启绝不自动重放**。不是学校批次定稿器、不是图 DAG 规划器、不是 C Run 写者。运行时类 + 协程池。

不做的事：不持久化队列；不自动重放/静默重试；不做 Run 写入。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `A24ScheduledCase` | interface | `:16-19` | `{caseId; request: A22BackgroundRequest}` |
| `A24CaseResult` | type | `:20-24` | `{outcome:'technical'; task}` 或 `{outcome:'not-started'\|'recovery-required'; reason}` |
| `A24BatchResult` | interface | `:25-31` | `{version:'v3-dev-a-bounded-batch/1'; results; started; completed; notStarted}` |
| `A24BatchProgress` | interface | `:33-42` | 轮询视图（**不是 C Batch ACK**，`:32`） |
| `A24BoundedTechnicalBatchScheduler` | class | `:47-215` | Main/worker 所有单实例（非 IPC 单例，`:46`） |

内部：`deny`（`:43-45`，`C0ContractError('RECOVERY_REQUIRED','A24_BATCH: '+why)`）；状态 `busy/stopped/active/jobs/finished/cursor/started/cancelledCases`（`:48-55`）。

## 3. 内部逻辑与关键流程

### 3.1 构造与进度（`:56-83`）

构造器校验：coordinator 须有 `run`；`maxConcurrentCases` 1-16、`maxBatchCases` 1-128 安全整数，否则 `CONTRACT_INVALID('Bounded trusted technical batch limits required')`。`progress()`：active 经 `coordinator.inspect`、queued 过滤已取消、finished 克隆返回；state = idle/running/stopping。

### 3.2 停止（`:88-111`）

- `stopCase`：非运行中/已完成 → false；否则记 `cancelledCases`，活跃则 `coordinator.stop`（失败吞掉——“原始 A22 spool 保持可观察供手工恢复”，`:97`）。**停止后完成的 Provider 绝不算成功**（`:86`）。
- `stop`：停全部（`stopped=true`+逐个 `coordinator.stop`）；停止不证明已发出的 Provider 请求被撤销（`:103`）。

### 3.3 `runBatch`（`:112-214`）

1. 准入：忙/空/超限/已 abort → deny；逐项校验 caseId/requestId 唯一、`sequence.modes` 非空且只含 `hidden`/`batch`（“untrusted hidden/batch mode”）（`:114-129`）。
2. **快照队列意图**（`structuredClone`，`:130-134`）：任何 await 前拷贝，渲染层漂浮请求不能改运行中的批次。
3. `take` 协程池（`min(maxConcurrentCases, n)`，`:192-195`）：JS 同步游标取号保证进程内索引唯一（`:149`）；取消中的案卷 → `not-started: CASE_CANCELLED_BEFORE_PROVIDER_DISPATCH`；`coordinator.run` 回执的 caseId/requestId 不符 → deny；**停止/未决/取消的任务绝不记成功**（含迟到终回调，`:172-176`）→ `recovery-required`；异常 → `recovery-required`（“绝不静默重试未知 Provider 请求或换案卷”，`:183`）。
4. 未取到的结果补 `not-started: BATCH_STOPPED_BEFORE_PHYSICAL_DISPATCH`；返回 `started/completed/notStarted`；finally 移除 abort 监听、清 active、`busy=false`，保留 finished 供 UI 到下次显式批次（`:207-213`）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/**/*.{ts,tsx}`（含测试）：`review-v3-a25-c11-local-execution-ports.ts`（消费方）；`review-v3-r23-r24-concentrated.test.ts`（R23/R24 集中测试，不在本批文件清单）。出向仅 `@profer/shared.C0ContractError` 与 `review-v3-background-technical-coordinator` 类型。

## 5. 数据 I/O、读写与副作用

纯进程内状态（Map/Set/数组）；无磁盘写（持久在 A22）；副作用：经 coordinator 执行 Provider 请求。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 准入失败族 | `:114-127` | deny → `C0ContractError(RECOVERY_REQUIRED)` |
| 构造非法 | `:65-66` | `CONTRACT_INVALID` |
| 回执不匹配 | `:166-168` | deny |
| 停止/取消/未决 | `:169-176` | recovery-required（不记成功） |
| Provider 异常 | `:182-186` | recovery-required（不静默重试） |
| AbortSignal | `:144-146` | abort→stop() |
| 恢复 | 语义 | 崩溃丢队列；A22 spool 供显式重提；重启不自动重放 |

## 7. 权限与权威状态

- 隐藏/批次模式白名单（`hidden`/`batch`，`:125`）；bounded 限制强制。
- 停止/取消绝不冒充成功（`:86/:172-176`）；回执不匹配 fail-closed。
- `A24BatchProgress` 明示非 C Batch ACK。

## 8. 修改影响面

改调度语义 → 影响 Dev-A 后台技术批次与 A22 协调器契约（`run/stop/inspect`）；对 UI 只出进度视图。

## 9. 测试证据

本轮 `NOT_RUN`。直接测试 `review-v3-r23-r24-concentrated.test.ts`（R23/R24 集中测试，属冻结树但不在本批 18 文件清单，未逐行读）；`progress/stopCase` 语义本轮仅有静态阅读依据。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 队列非持久、崩溃丢、重启不重放 | 已证实 | 文件头、`:5-7` |
| bounded 限制 fail-closed | 已证实 | `:61-67/:114-116` |
| 停止/取消不记成功 | 已证实 | `:86/:169-176` |
| 不静默重试 | 已证实 | `:183-186` |
| 快照防运行中篡改 | 已证实 | `:130-134` |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 五类型 | 2 | `:16-45` | covered |
| 构造/progress | 3.1 | `:56-83` | covered |
| stopCase/stop | 3.2 | `:88-111` | covered |
| runBatch | 3.3 | `:112-214` | covered |

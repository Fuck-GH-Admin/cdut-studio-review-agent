---
path: apps/electron/src/main/lib/agent-goal-runtime-bridge.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3c3b70ca4038ccf1b0f2f81140c72c14160f2a81
sha256: 1e885c5fe6781bc96a5675bf18a8450ab7c4b6f707120a07b59a2d4df4720ab8
lines: 193
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-goal-runtime-bridge.test.ts

## 1. 测试目标

Goal bridge 消息回调/onRunOutcome 契约、Goal owner 锁与 busy 拒绝、preflight 停止语义、onRunStarted→external_run_started。**无独立源文件**：用 `Bun.Transpiler` 动态编译 `agent-service.ts`（切出 runAgent :24-25）与 `agent-orchestrator.ts`（切出 AgentOrchestrator :26/:56）真实源码切片测试。不运行（`NOT_RUN`）。

## 2. 用例清单

用例数 7：`${runtime}` 循环 describe（:84，单 runtime `for (const runtime of ['pi'] as const)`×4 用例）+3 独立（:166/:172/:184）。
1. 正常上下文传递+消息回调不依赖 isolatedRuntimeSession（:85-104）：input.agentRuntime/goalRunId/suppressUserMessagePersistence 断言（:94-97）、received/outcomes（:102-103）。
2. 错误吸收→failed、停止覆盖错误、busy 不发假终态（:106-127）：`AgentRunAlreadyActiveError`、outcomes 0（busy）/1（终态）、status stopped/failed 按 mode（:124）。
3. Goal owner 登记/停止边界（:129-149）：isGoalRunActive true/false、aborted、completed false、收尾后全清（:147-148）。
4. preflight/setup await 中停止→stopped（:151-164）：stoppedByUser true、endReason 'stopped_by_user'（:160-161）。
5. query bridge 共用+顺序（:166-170）：resumeOptions 含 `onRuntimeMessage: input.onRuntimeMessage` 且先于 isolatedRuntimeSession 展开（:168-169，源码切片字符串断言）。
6. onRunStarted 才建立前端运行态（:172-182）：events toEqual external_run_started 全字段（:181）。
7. 普通 run 不成 Goal owner（:184-190）：isGoalRunActive false、busy 拒、aborted 0。

## 3. 真实断言

如 §2（toBe/toEqual/rejects.toBeInstanceOf/toHaveLength/indexOf 比较）。

## 4. 未覆盖与脆弱点

脆弱点：测试依赖**源码切片**（readFileSync+Transpiler :24-26）——源重构可能使切片失败；fixture stub 键名出现 `exitPlanService`（:70，非 import）。mock 边界：P0 guards/normalizeAgentEndReason/runOutcome 用真模块，orchestrator 用编译切片。`NOT_RUN`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 用例计数（单 runtime 循环 4+3） | 已证实 | :84-190 |
| 断言要点如 §2-3 | 已证实 | 逐行读 |
| 通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| 消息回调/终态/owner 锁/preflight | #1-#4（×2 runtime） | covered |
| query bridge/onRunStarted/普通 run | #5-#7 | covered |

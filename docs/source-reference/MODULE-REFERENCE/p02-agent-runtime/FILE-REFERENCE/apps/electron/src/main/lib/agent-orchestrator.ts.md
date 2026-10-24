---
path: apps/electron/src/main/lib/agent-orchestrator.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c5fa9b22991d8162bc1f3c8f45d16e2f850e7879
sha256: 292fb67098040c978e77b535f310254f68e74d8a84d19725c71cd3829c64f935
lines: 4051
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-orchestrator.ts

## 1. 结论与边界

Agent 编排器（4051 行，p02 核心）：会话运行编排——并发锁、工具权限（canUseTool）、提示词装配、重试循环、Goal/协作/队列、终态上报。唯一生产实例化在 `agent-service.ts:55`。

## 2. 导出与关键符号

导出 3 条（`export` :220/:247/:286）：

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `SessionCallbacks` | `:220-243` | onError/onComplete（终态字段：stoppedByUser/startedAt/resultSubtype/resultErrors/backgroundTasksPending/endReason/endReasonLabel）/onTitleUpdated/onRunOwned?/onRunStarted? |
| `serializeErrorDetail` | `:247` | 递归串行化 error/cause（诊断） |
| `AgentOrchestrator` | `:286-4051` | 核心类（见 §3） |

类公开方法（子agent 交叉核）：sendMessage:940、isActive、generateTitle、regenerateTitle、stop、stopAndWait、isGoalRunActive、stopGoalRunAndWait、beginDeletion、endDeletion、rewindSession、stopAll、updateSessionPermissionMode、queueMessage 等。

## 3. 内部逻辑与关键流程（状态机+关键点抽读）

- **状态字段**（:288-320 抽读）：`activeSessions`（运行令牌 Map，owner finally 释放）、`goalRunOwners`、`queuedMessageUuids`（防重）、`stoppedBySessions`、`sessionPermissionModes`（运行时切换）、`runCompletions`（仅 owner finally resolve）、`activePresetPolicies`（队列跟随运行时预设不盲信中途切换）、`deletingSessions`（删除期禁重入）、`nonPersistingGoalSessions`（Goal turn 不入 transcript）。
- **关键调用点**（子agent 交叉核）：getAdapter :476；startPiHarnessRun :1623；buildPiBuiltinTools :1665（注册图片/皮肤/预览工具）；exitPlanService.handleExitPlanMode :1736 / clearSessionPending :3574；permissionService.createCanUseTool :1745；askUserService :1753/:1908；**validateToolInput :1842**（参数拦截）；**estimateTokenCount/阈值 :1859-1860**（大文件写拦截）；prepareRuntimeSkills :2023；**buildSystemPrompt :2070**；**resolvePiThinkingLevel :2196**；retry 循环 :2350-3495（retry-utils 12 符号）。
- 出向 40+ 模块（import :17-210+lazy require：pi-case-review-service :1438/:3711、channel-manager :2434、`@earendil-works/pi-coding-agent` :1664）。

## 4. 调用者与调用链

入向（子agent 交叉核）：**唯一生产实例化** `lib/agent-service.ts:55`（`new AgentOrchestrator(adapter, eventBus)`）+值 import :35（serializeErrorDetail :370/:501）；类型消费 `agent-run-outcome.ts:4`（inline import 类型环）；测试 `agent-goal-runtime-bridge.test.ts:5`（type+:26 源文本静态断言）、`agent-orchestrator-permission-wiring.p06.test.ts:15`（new :39/:59）、`review-background-reuse.probe.test.ts:17`。注意：`agent-orchestrator.test.ts` **不 import 本模块**（名不副实，测 pi-additional-directories-prompt）。packages/ 无代码引用。

## 5. 数据 I/O、读写与副作用

会话 JSONL 持久化（agent-session-manager）；工具执行；模型调用；IPC 事件总线。

## 6. 分支、失败、取消与恢复

并发锁拒绝（busy→AgentRunAlreadyActiveError 系）；重试循环（budget 60s/5 次）；stop/Goal stop 语义（headless-runner-registry 单路由）；删除期禁重入。

## 7. 权限与权威状态

canUseTool 权限门（permission-service+validator+estimator 三拦截）；activePresetPolicies 权威（队列不盲信中途切换）；运行令牌 owner finally 释放。

## 8. 修改影响面

全 Agent 运行链（agent-service 唯一直接消费；40+ 模块被其编排）。需同步测试：permission-wiring.p06/bridge/goal 系。

## 9. 测试证据

无专属直接测试（`agent-orchestrator.test.ts` 不 import 本模块——名不副实照实记录）；间接：`agent-goal-runtime-bridge.test.ts`（源文本切片）、`agent-orchestrator-permission-wiring.p06.test.ts`（实例化）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 3 条+公开方法面+状态字段 | 已证实 | :220-320 抽读+导出图谱 |
| 关键调用点（validator/estimator/prompt/thinking） | 已证实 | §3 子agent 交叉核 |
| 4051 行逐行语义（run 循环细节） | 推断（导出段+状态机+调用点级） | 大纲+抽读 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 3 导出+状态机+关键点 | §2/§3 | :220-4051 | covered（抽读级） |
| run 循环细节 | §10 | :2350-3495 | 推断 |
| 测试 | §9 | — | partial（间接） |

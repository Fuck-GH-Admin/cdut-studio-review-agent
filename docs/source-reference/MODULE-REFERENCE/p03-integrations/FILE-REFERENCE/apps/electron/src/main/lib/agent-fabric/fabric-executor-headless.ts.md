---
path: apps/electron/src/main/lib/agent-fabric/fabric-executor-headless.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 83baff847bb18add722b8f7ae069a443bdc50e36
sha256: 82bafafb8d184159b17b702884c4804a974a7093bf85e0da1f3a4b5b5911e6ef
lines: 179
kind: source
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-fabric/fabric-executor-headless.ts

## 1. 结论与边界

**Headless 执行器适配**（设计文档 §13）：把 Gateway 的 TaskExecutor 端口接到 `agent-headless-runner-registry`（避免与 orchestrator 循环依赖）；每任务创建真实 Agent 会话（可审计），会话转录挂为日志产物；权限=无人值守沿用 `permissionModeOverride:'bypassPermissions'`，高风险审批转发 Phase 2/4 补齐（`apps/electron/src/main/lib/agent-fabric/fabric-executor-headless.ts:1-14`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `HeadlessExecutorDeps` | 接口 | 32-34 | `{config}` |
| `createHeadlessTaskExecutor` | 函数 | 91-179 | `(deps): TaskExecutor`（start/cancel） |

内部：`SUMMARY_CHAR_LIMIT=4000`（`:30`）、`buildTaskPrompt`（`:37-61`，目标+约束+文件+notes+收尾指令「不得声称未实际运行的命令/测试」`:58`）、`buildTaskResult`（`:64-89`，summary 取最后 assistant 截 4000；`session-transcript-{id}` LOG 产物+evidence 引用）、`runningSessions` Map（taskId→sessionId，`:93`）。

## 3. 内部逻辑与关键流程

`start`（`:96-166`）：channelId 缺失→fail（`:105-108`）→`createAgentSession`（pi 通道，`:112-120`）→事件总线→`reporter.progress`（只转发结构化摘要，`:123-132`）→`runRegisteredHeadlessAgent`（bridge 来源；onError→fail、stoppedByUser→fail「执行被用户停止」、onComplete→complete(buildTaskResult)，`:134-158`）→finally 清理。`cancel`（`:168-177`）：`stopRegisteredAgent(sessionId,'delegation_cancel')` 失败退 `stopAgent`。

## 4. 调用者与调用链

入向：`agent-fabric-service.ts:23`。出向：`../agent-headless-runner-registry`、`../agent-service`、`../agent-session-manager`、`../settings-service`、`./fabric-config`、`@profer/{shared,agent-fabric}`。

## 5. 数据 I/O 与副作用

创建真实 Agent 会话；事件订阅。

## 6. 分支、失败、取消与恢复

全链 try/catch→reporter.fail（`:159-160`）；无渠道 fail 早退；cancel 双路兜底。

## 7. 权限与权威状态

`bypassPermissions` 为既有先例沿用（`:11-13` 注释，照实记录）；任务→会话可审计。

## 8. 修改影响面

buildTaskPrompt 改动影响任务执行行为；会话创建参数受 settings/配置覆盖。

## 9. 测试证据

无专属测试（glob 零命中）；fabric-server.test 用 FakeExecutor（不覆盖本适配器）。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出+start/cancel 全链 | 已证实 | `:1-179` 逐行 |
| 真实 headless 执行 | 未知 | NOT_RUN（模型/多进程） |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全部导出/流程 | §2/§3 | covered |
| 测试/运行 | §9/§10 | unknown（NOT_RUN） |

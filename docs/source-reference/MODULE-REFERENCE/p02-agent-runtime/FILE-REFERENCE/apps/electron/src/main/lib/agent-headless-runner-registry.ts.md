---
path: apps/electron/src/main/lib/agent-headless-runner-registry.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2e421d4f6e94deaffcbc172c3e4eb3af62d00150
sha256: cdc7665f69e070595e06c2c54712006932921aee971470fe644e0cb526b44c80
lines: 89
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-headless-runner-registry.ts

## 1. 结论与边界

Headless Runner 注册表（头注释 :1-7）：解耦主进程内置工具与 AgentOrchestrator 防循环依赖；agent service 注入 runner、orchestrator 注入 stopper，其余模块经注册表间接调用。

## 2. 导出与关键符号

导出 11 条（`export` :13/:15/:25/:32/:37/:40/:53/:66/:70/:74/:84）：

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `AgentStopSource` | `:13` | 'user'\|'delegation_cancel'（注释 :12：仅 UI/IPC 发起算 user） |
| `HeadlessAgentCompletionOptions` | `:15-23` | 终态字段（endReason 等） |
| `HeadlessAgentRunCallbacks` | `:25-30` | onError/onComplete/onTitleUpdated/source? |
| `HeadlessAgentRunner`/`AgentStopper` | `:32-37` | 函数类型 |
| `getAgentStopCompletionOptions(source)` | `:40-47` | delegation_cancel→{stoppedByUser:false, resultSubtype:DELEGATION_CANCELLED_RESULT_SUBTYPE}；否则 {stoppedByUser:source==='user'} |
| `forwardHeadlessAgentCompletion(input)` | `:53-61` | **单一路由**：callbacks.onComplete 后无条件 forwardToRenderer（注释 :50-52：调用方跳过收尾也不得阻断 renderer completion） |
| `setHeadlessAgentRunner`/`setAgentStopper` | `:66-72` | 注入 |
| `runRegisteredHeadlessAgent`/`stopRegisteredAgent` | `:74-89` | 未初始化抛错（:79/:86）；stop 默认 source 'user'（:84） |

## 3. 内部逻辑与关键流程

模块级可变单槽 runner/stopper（:63-64）；转发函数双投递（:59-60）；stop 映射终态字段（:44-46）。不适用取消/恢复。

## 4. 调用者与调用链

入向（子agent 交叉核）：生产 `agent-collaboration-tools.ts:26-30`（run/stop）、`agent-orchestrator.ts:90`（set×2）、`agent-service.ts:38`（forward+set+type）、`agent-fabric/fabric-executor-headless.ts:24`（run/stop）；测试 `agent-headless-runner-registry.test.ts:3`。出向：`@profer/shared` 类型、`./agent-end-reason`（DELEGATION_CANCELLED_RESULT_SUBTYPE :45）。

## 5. 数据 I/O、读写与副作用

无 I/O；模块级状态（注入槽）。

## 6. 分支、失败、取消与恢复

未初始化 throw（:79/:86）；stop source 二分支（:44-46）。

## 7. 权限与权威状态

`AgentStopSource` 语义权威（:12：delegation_cancel 不算用户打断）；转发不拦截（:50-52）。

## 8. 修改影响面

协作工具/orchestrator/agent-service/fabric 链；终态语义。需同步测试（3 用例）。

## 9. 测试证据

`agent-headless-runner-registry.test.ts`（批内，1 describe/3 用例，NOT_RUN）：user 停止保用户语义（:6-8）、delegation_cancel 不归用户（:10-15，resultSubtype 'delegation_cancelled'）、预标 cancelled 时 onComplete 跳过收尾但 renderer 仍收完整 payload（:17-48，callbackPayloads 0/rendererPayloads 1）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 11 条；单一路由转发 | 已证实 | :53-61 |
| stop 语义二分支 | 已证实 | :40-47；测试 :6-15 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 11 导出+转发+stop 语义 | §2/§3 | :13-89 | covered |
| 测试 | §9 | — | covered（NOT_RUN） |

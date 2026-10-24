---
path: packages/agent-fabric/src/task.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3269181747073d91ecac8785f2630558b66ef681
sha256: effad25de250417b467876c34e02932d6b6c3425a2e4dca3dc0fdc661118f4e2
lines: 248
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# packages/agent-fabric/src/task.ts

## 1. 结论与边界

Task 与 Task Policy **契约 + 校验**（运行时代码）：Task 是系统统一派工单位（Hermes/Profer 会话/本地 Agent 均同构，`packages/agent-fabric/src/task.ts:1-10`）；上下文显式传递——子任务不因 parentTaskId 自动继承父会话消息/权限/凭据，敏感内容只走受控引用（artifactIds），禁 key/token/环境变量入 payload。

边界：状态迁移规则在 `state-machine.ts`（`:15` 注释）；策略收窄由 `task-graph.ts` 的 `narrowPolicy` 强制（`:93` 注释）；错误类型来自 `./protocol`（`ProtocolError`/`ProtocolErrorCode`，`:13`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 形状/签名 | 说明 |
| --- | --- | --- | --- | --- |
| `TaskStatus` | 常量对象 | 17-32 | 14 状态（created…expired） | 状态枚举 |
| `TaskStatusValue` | 类型 | 34 | 联合 | |
| `ApprovalMode` | 常量对象 | 44-47 | `forward_to_user`/`auto_deny` | **无 auto_approve**（`:42` 注释） |
| `WorkspaceMode` | 常量对象 | 57-61 | `read-shared`/`isolated-writer`/`single-writer` | 并发模式 |
| `WORKSPACE_MODE_RESTRICTIVENESS` | 常量 | 66-70 | 0/1/2 | 子任务只能不变或更受限 |
| `RetryClass` | 常量对象 | 73-78 | 4 类（safe-to-retry…not-retryable） | 崩溃重试分类 |
| `WriteIntent` | 接口 | 84-89 | `{paths, conflictStrategy:'fail'\|'queue'}` | 写意图 |
| `TaskPolicy` | 接口 | 95-109 | 审批/委派/超时/工作区/能力/重试/预算 | **子任务只能继承或收窄**（`:92`） |
| `TaskContext` | 接口 | 114-119 | `{files?, artifactIds?, notes?}` | 显式上下文 |
| `TaskRequest` | 接口 | 121-140 | 含 `targetAgentId`（只允许 Agent Registry 解析，`:127-130`） | 请求 |
| `TaskLease` | 接口 | 142-147 | `{leaseId, acquiredByInstanceId, expiresAt, heartbeatAt}` | 租约 |
| `AgentTask` | 接口 | 150-160 | 请求+状态+租约+`pendingApprovalId/pendingInputRequestId` | 任务实体 |
| `validateTaskRequest` | 导出函数 | 196-248 | `(request): void`，不合法抛 `ProtocolError` | 唯一函数导出 |

内部：`FORBIDDEN_INLINE_KEY_PATTERNS`（`:168-176`，7 个正则：api-key/secret/token/password/credential/private-key/env）、`scanForForbiddenKeys`（`:178-193`，递归扫描键名）。

## 3. 内部逻辑与关键流程

`validateTaskRequest`（`:196-248`）逐条：

1. `taskId`/`objective`/`workspaceId` 非空（`:197-205`，`VALIDATION_FAILED`）；三 ID（requester/orchestrator/target）必填（`:206-211`）。
2. policy 边界：`maxDelegationDepth/maxChildren` 不能负、`timeoutSeconds` 必须正（`:214-219`）；`allowDelegation=false` 时深度/子数必须 0（`:220-225`）；`read-shared` 禁写意图（`:226-231`）；非 read-shared **必须**声明 `writeIntent.paths` 非空（`:232-237`）——均为 `POLICY_VIOLATION`。
3. 敏感扫描：对 `request.context` 递归；命中任一禁键模式即抛 `SENSITIVE_INLINE_CONTENT`，message 列命中路径、`details.hits` 附证据（`:239-247`）。

## 4. 调用者与调用链

入向：agent-fabric 包内（`./capabilities`/`./protocol` 类型依赖本文件；具体调度器消费方未逐一读——本批仅此 1 文件属 agent-fabric，推断-包内共享契约）。出向：`./capabilities`（`CapabilityValue` 类型，`:12`）、`./protocol`（`:13`）。

## 5. 数据 I/O、读写与副作用

无（纯类型+纯校验函数；无 I/O）。

## 6. 分支、失败、取消与恢复

失败即抛 `ProtocolError`（错误码三族：`VALIDATION_FAILED`/`POLICY_VIOLATION`/`SENSITIVE_INLINE_CONTENT`）；无取消/恢复概念（校验为一次性纯函数）。

## 7. 权限与权威状态

契约级权限声明（非运行时守卫）：审批归原始用户（`forward_to_user`）或默认拒绝（`auto_deny`）——**不存在 auto_approve**（`:38-43`）；target 解析只允许 Agent Registry（payload 自带 URL 绕过注册/认证/授权是协议违规，`:127-130`）；能力白名单在调用方 grant 基础上收窄（`:104-105`）。实际守卫实现位于 state-machine/task-graph 等（未读，非本批）。

## 8. 修改影响面

改 `TaskPolicy`/状态枚举影响 agent-fabric 调度全链（state-machine/task-graph/协议层，均非本批）；改敏感键模式影响所有 task payload 的验收面。

## 9. 测试证据

无专属测试（冻结树 glob `agent-fabric/src/*test*` 中 `task.test` 零命中——声明范围：冻结树全路径 glob）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 13 导出+校验分支+错误码 | 已证实 | `:17-248` |
| 无 auto_approve/策略只能收窄/Registry 解析红线 | 已证实 | `:38-47/:91-93/:127-130` |
| 敏感键 7 模式与递归扫描 | 已证实 | `:168-193` |
| 消费方（调度器）清单 | 推断 | 包内共享契约，未逐一读 |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 全部 13 导出 | §2 | 17-160 | covered |
| `validateTaskRequest` 全分支 | §3 | 196-248 | covered |
| 敏感扫描 | §3 | 168-193 | covered |
| 测试/运行 | §9/§10 | — | unknown（NOT_RUN） |

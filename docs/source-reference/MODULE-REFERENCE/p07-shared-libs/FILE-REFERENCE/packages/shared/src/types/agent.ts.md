---
path: packages/shared/src/types/agent.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1a12871417743d1654291c5d09801558d5066aba
sha256: 1f046b8fce2527b3f9a68775f255e20d74272338be5e0465858ba6f5a1ea4848
lines: 2662
kind: source
package: p07-shared-libs
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/shared/src/types/agent.ts

## 1. 结论与边界

Agent 子系统**核心类型总集**（`packages/shared/src/types/agent.ts`，2662 行）：会话/消息/SDK 消息/工具/权限模式/能力/执行与队列，以及 **11 组 IPC 通道常量**（Agent/Auth/Sync/Team/Skill/FileSync/SSE 等）。`export` 共 **163 个**（108 interface + 34 type + 16 const + 5 function）。

## 2. 导出与关键符号

按语义分 7 组（行段为组内范围）：

**A. 模型与快速模式（`:12-138`）**：模型 ID 相关 type/const（`:12-122`）、`CODEX_FAST_MODE_MODEL_IDS`（`:122-129`）、`isCodexFastModeSupportedModel`（`:131-138`）。

**B. 会话/消息/SDK（`:140-945`）**：`AgentSessionMeta`、`AgentSessionList`、消息族（用户/助手/工具/系统）、`SDKMessage`/`SDKUserMessage`、`GetTaskOutputResult`、`TypedError`、执行/队列/中断形状等（主体 interface 群）。

**C. 会话判别（`:947-960`）**：`isReviewOwnedAgentSession`（`:947-952`，`owner?.kind==='review-case'` 语义）、`isVisibleAgentSession`（`:954-960`，非草稿且无 owner）。

**D. 权限模式（`:1931-1980`）**：`ProferPermissionMode`（`auto/bypassPermissions/plan`）、`PROFER_PERMISSION_MODES`（`:1931`）、`PROFER_DEFAULT_PERMISSION_MODE='bypassPermissions'`（`:1935`）、`PROFER_PERMISSION_MODE_CONFIG`（`:1945-1962`，各档说明）、`PROFER_PERMISSION_MODE_ORDER`（`:1964`）、`isProferPermissionMode`（`:1966`）、`migratePermissionMode`（`:1971`，历史值归一化）。

**E. 工具/技能/能力（`:960-1930` 群）**：工具调用形状、Skill/MCP 相关、`AgentEffort` 等。

**F. IPC 通道常量（`:2022-2608`）**：`AGENT_IPC_CHANNELS`（`:2022`，主通道群）、`AUTH_IPC_CHANNELS`（`:2431`）、`SYNC_IPC_CHANNELS`（`:2449`）、`TEAM_IPC_CHANNELS`（`:2459`）、`SKILL_MARKETPLACE_IPC_CHANNELS`（`:2482`）、`GLOBAL_SKILL_IPC_CHANNELS`（`:2491`）、`SKILL_MASTER_IPC_CHANNELS`（`:2508`）、`FILE_SYNC_IPC_CHANNELS`（`:2520`）、`TEAM_FILE_IPC_CHANNELS`（`:2528`）、`TEAM_MEMORY_IPC_CHANNELS`（`:2579`）、`SSE_IPC_CHANNELS`（`:2608`）。

**G. 杂项 type（散布）**：状态枚举/联合（34 个 type）。

## 3. 内部逻辑与关键流程

5 个函数语义（其余为纯声明）：

- `isCodexFastModeSupportedModel(modelId)`（`:131-138`）：白名单 `CODEX_FAST_MODE_MODEL_IDS` 命中判定。
- `isReviewOwnedAgentSession`/`isVisibleAgentSession`（`:947-960`）：会话归属/可见性判别（被 `review-owned-session.p03.test` 等断言的判别源）。
- `isProferPermissionMode(mode)`（`:1966`）：三档校验。
- `migratePermissionMode(mode)`（`:1971`）：历史持久化值→现行三档归一化。

## 4. 调用者与调用链

消费方：Agent runtime/Manager/IPC 注册/preload/渲染层；会话判别被 remote-service/agent-session-manager 等复用。出向：无（自足常量/类型）。

## 5. 数据 I/O、读写与副作用

纯声明+5 纯函数；无 I/O。

## 6. 分支、失败、取消与恢复

`migratePermissionMode`（`:1971`）对历史值归一化不抛错；`isProferPermissionMode` 单判定。无其它分支。

## 7. 权限与权威状态

`ProferPermissionMode` 三档（`bypassPermissions` 为默认，`:1935`）是权限语义源头；`PROFER_PERMISSION_MODE_CONFIG`（`:1945-1962`）携带各档描述。权威判定在 runtime/主进程。

## 8. 修改影响面

- 11 组 IPC 通道是全应用跨进程契约；改名需同步主进程注册与 preload。
- 会话判别函数被多处复用（Pocket 过滤/事件发布等）；`migratePermissionMode` 改动影响历史配置迁移。

## 9. 测试证据

- 会话判别被 `review-owned-session.p03.test.ts` 等间接断言；`PROFER_DEFAULT_PERMISSION_MODE` 被 `agent-preset-policy.test.ts` 间接引用。
- 本文件**无专属测试文件**在本批 scope。
- **NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 163 个导出（108 interface/34 type/16 const/5 function） | 已证实 | `grep -n "^export"` 全表 + 分类计数 |
| 权限三档、默认 `bypassPermissions` | 已证实 | `:1931-1964` |
| 会话判别语义 | 已证实 | `:947-960` |
| 11 组 IPC 通道 | 已证实 | `:2022-2608` |
| runtime/主进程实现 | 未知 | 不在本批 |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 组 | 行段 | 状态 |
| --- | --- | --- |
| A 模型/快模式 | `:12-138` | covered |
| B 会话/消息/SDK | `:140-945` | covered |
| C 会话判别 | `:947-960` | covered |
| E 工具/Skill/能力 | `:960-1930` | covered |
| D 权限模式 | `:1931-1980` | covered |
| F IPC 11 组 | `:2022-2608` | covered |
| G 杂项 type | 散布 | covered |

---
path: apps/electron/src/main/lib/agent-ordinary-pending-access.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a0579994773af5eb536adcc0604fa21c23953b6e
sha256: f7dcaa929269ae205c6703445d190f937954127850f0283c5078fa558824ca57
lines: 22
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-ordinary-pending-access.ts

## 1. 结论与边界

pending 请求的**普通 UI 访问过滤/守卫**（22 行薄文件）：渲染层快照只给普通会话，内部审核 prompt 保持私有；变更类操作前校验请求归属（`agent-ordinary-pending-access.ts:3,15`）。纯函数，无 I/O。

## 2. 导出与关键符号

`export` 逐条核：2 个导出函数，0 类型/常量。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `filterOrdinaryPendingRequests` | 函数 | `:4` | `<T extends {sessionId}>(requests: readonly T[]): T[]` | 过滤掉审核归属会话的请求 |
| `assertOrdinaryPendingRequestId` | 函数 | `:16` | `(requestId, requests): void` | 变更前校验；requestId 不存在时**静默通过**（见 §10） |

## 3. 内部逻辑与关键流程

- `filterOrdinaryPendingRequests`（`:4-13`）：逐请求 `assertOrdinaryAgentSession(request.sessionId)`，抛出即剔除（try/catch 吞掉返 false，`:6-11`）。
- `assertOrdinaryPendingRequestId`（`:16-22`）：`find(requestId)`；命中才 `assertOrdinaryAgentSession(pending.sessionId)`；**未命中直接返回（不抛）**——注释称"validate BEFORE mutating"（`:15`），但不存在的 requestId 不会被拦截（照实记录，§10）。

## 4. 调用者与调用链

- 入向（本文件被 ipc.ts 消费，冻结树 grep）：`apps/electron/src/main/ipc.ts`（import `:333`；`GET_PENDING_REQUESTS` 用 filterOrdinaryPendingRequests `:4381-4383`；`PERMISSION_RESPOND`/`ASK_USER_RESPOND`/`EXIT_PLAN_MODE_RESPOND` 用 assertOrdinaryPendingRequestId `:4010,4305,4327`——行号为 ipc.ts 侧，ipc.ts 属 nb-05 已深读批）。
- 出向：`./agent-session-manager` 的 `assertOrdinaryAgentSession`（`agent-session-manager.ts:660-664`，已读：按 `isReviewOwnedOrDeletedAgentSessionId` 判定，抛“内部审核会话不可通过普通 Agent 入口访问”）。
- 测试：无直接测试（检索=nb-49 本批 10 个测试文件 + 全树 `*.test.ts` grep 本文件名 0 命中）。

## 5. 数据 I/O、读写与副作用

无 I/O、无副作用（纯过滤/断言）。

## 6. 分支、失败、取消与恢复

filter 分支（抛→剔除）；assert 分支（命中且非普通→抛；未命中→静默通过）。无取消路径。

## 7. 权限与权威状态

权限语义=“普通会话 vs 审核归属会话”隔离（fail-closed 于 assertOrdinaryAgentSession）；pending 归属权威=Main 侧 pending 列表（入参）。本文件不校验调用方身份（由 ipc.ts 守卫层负责）。

## 8. 修改影响面

改动影响 ipc.ts 三处 respond 通道与 GET_PENDING_REQUESTS 快照的隐私边界；`assertOrdinaryAgentSession` 语义变化连动本文件。

## 9. 测试证据

`NOT_RUN`。直接测试：无（检索范围如 §4）。间接：`goal-ipc-routing.test.ts`（nb-05 批）以 mock 断言“内部审核会话”隔离语义（不同函数，间接）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出语义、过滤吞异常、断言只查命中项 | 已证实 | `:1-22` 全文 |
| **未命中 requestId 静默通过**（与注释“校验后再变更”的强保证不完全一致） | 已证实（照实记录） | `:20-21` |
| 审核会话判定语义 | 已证实 | `agent-session-manager.ts:660-664`（跨文件已读） |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/域 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 导出 | §2/§3 | 4-22 | covered |
| 调用链/权限 | §4/§7 | — | covered |

---
path: apps/electron/src/renderer/contexts/session-context.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 754156594a07249e6ddc004a904e6515ac6549b9
sha256: d9009d9a4f37a56fcaee14b3ff6404a80fb1ab24faf1d12acc7539062e891a3b
lines: 60
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-04-20261024
reviewer: docs-r07-qa-extra-04-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/contexts/session-context.tsx

## 1. 结论与边界

两组轻量 React Context：Chat 模式的 `conversationId` 与 Agent 模式的 `sessionId`，避免逐层 props 透传（`apps/electron/src/renderer/contexts/session-context.tsx:1-5`）。纯 Context，无其它状态。

边界：不管理会话数据（只传 id 字符串）；不做鉴权。

## 2. 导出与关键符号

`export` 逐条核对：5 个函数（接口/常量导出 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `ConversationProvider` | 函数（导出） | 13-25 | `({conversationId, children}) => React.ReactElement` | Chat 会话 id Provider |
| `useConversationId` | 函数（导出） | 27-31 | `() => string` | 硬消费：Provider 外 throw |
| `useConversationIdOptional` | 函数（导出） | 34-36 | `() => string \| null` | 软消费：Provider 外返回 null（注释 `:33`：ModelSelector 等双模式组件用） |
| `AgentSessionProvider` | 函数（导出） | 42-54 | `({sessionId, children}) => React.ReactElement` | Agent 会话 id Provider |
| `useAgentSessionId` | 函数（导出） | 56-60 | `() => string` | 硬消费：Provider 外 throw |

内部：`ConversationContext`（`:11`）、`AgentSessionContext`（`:40`），均 `createContext<string \| null>(null)`。

## 3. 内部逻辑与关键流程

- `useConversationId`（`apps/electron/src/renderer/contexts/session-context.tsx:27-31`）：值为 falsy → `throw new Error('useConversationId 必须在 ConversationProvider 内使用')`。
- `useAgentSessionId`（`:56-60`）：同构，错误文案 `useAgentSessionId 必须在 AgentSessionProvider 内使用`。
- `useConversationIdOptional`（`:34-36`）：直接 `useContext`，不抛错。
- 两个 Provider 均直接透传 id（`:20-24`、`:49-53`）。

## 4. 调用者与调用链

入向（冻结树 grep）：

- `AgentSessionProvider`：`apps/electron/src/renderer/components/agent/AgentView.tsx:143`（import）、`AgentView.tsx:3355`（挂载 `<AgentSessionProvider sessionId={sessionId}>`，`AgentView.tsx:3635` 闭合）。
- `useConversationId`/`useConversationIdOptional`：`apps/electron/src/renderer/hooks/useConversationSettings.ts:10`（import）、`useConversationSettings.ts:58,91,100,109`（硬消费）/`useConversationSettings.ts:67`（软消费）；`apps/electron/src/renderer/components/shared/ModelSelector.tsx:30,147`（软消费）。
- `useAgentSessionId`：**全冻结树 0 调用**（检索排除定义文件）。
- `ConversationProvider`：**全冻结树 0 挂载**（`<ConversationProvider` JSX 0 命中）——即硬消费 `useConversationId()` 的 4 个调用点（useConversationSettings.ts:58,91,100,109；另 `useConversationIdOptional` 软消费 2 处：useConversationSettings.ts:67、ModelSelector.tsx:147）在无 Provider 环境下按源码会 throw（运行时可达性未知，见 §10）。

出向：`react`。

## 5. 数据 I/O、读写与副作用

无：纯 Context 透传 id 字符串。

## 6. 分支、失败、取消与恢复

| 分支 | 行 | 行为 |
| --- | --- | --- |
| `useConversationId` 无 Provider/空值 | 28-30 | throw 固定文案 |
| `useAgentSessionId` 无 Provider/空值 | 57-59 | throw 固定文案 |
| `useConversationIdOptional` 无 Provider | 35 | 返回 null |

无异步/恢复语义；throw 后由 React 错误边界（若有）承接。

## 7. 权限与权威状态

本文件不适用，依据：无 sender/role/IPC。id 的权威来源是调用方（会话状态 atoms/路由）。

## 8. 修改影响面

- 改 Provider/Hook 契约影响 `useConversationSettings.ts`、`ModelSelector.tsx`、`AgentView.tsx`。
- 若补挂 `ConversationProvider`，将直接改变 `useConversationId()` 4 个调用点的可达性（当前按源码会 throw）。

## 9. 测试证据

**无直接测试**：冻结树 `*.test.ts`/`*.test.tsx` 对本文件 0 命中（检索范围：冻结树 apps/ 与 packages/，不含 docs）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI。测试断言仅指静态读到的 expect 行——本文件没有。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 个导出 | 已证实 | `grep -c '^export'`=5，`:13,27,34,42,56` |
| 两个 throw 文案 | 已证实 | `:29,:58` |
| `AgentSessionProvider` 1 处挂载 | 已证实 | `AgentView.tsx:3355` |
| `ConversationProvider` 0 挂载 | 已证实（检索：`<ConversationProvider` 全树 JSX 0 命中） | — |
| `useAgentSessionId` 0 调用 | 已证实（检索：全树 0 命中，排除定义文件） | — |
| `useConversationId()` 4 调用点在无 Provider 下的运行时后果 | 推断（按源码 throw）；实际可达路径未读 | `useConversationSettings.ts:58,91,100,109` |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 两个 Provider | §2,§3 | 13-25,42-54 | covered |
| 两个硬 Hook 的 throw | §3,§6 | 27-31,56-60 | covered |
| 软 Hook | §3 | 34-36 | covered |
| 零挂载/零调用否定结论 | §4,§10 | — | covered |
| 测试 | §9 | — | unknown |

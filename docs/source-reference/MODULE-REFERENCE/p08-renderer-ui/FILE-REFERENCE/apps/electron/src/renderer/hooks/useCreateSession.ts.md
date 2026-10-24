---
path: apps/electron/src/renderer/hooks/useCreateSession.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 41b832fea092f1f437801f1b61c6713ffa665783
sha256: 12bae2b14c8b0d32eb37b8b34ab2636e34c1f208d12f1946ad0498bb1e950a03
lines: 95
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-05-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/hooks/useCreateSession.ts

## 1. 结论与边界

**共享创建 Chat/Agent 会话 hook**（95 行，从 LeftSidebar 提取供 WelcomeView 与侧边栏共用，注释 `:1-5`）。`draft` 选项=草稿会话（不显示侧边栏，首条消息后转正）。

## 2. 导出与关键符号

1 导出：`useCreateSession(): {createChat, createAgent}`（`:38`）。选项 `CreateSessionOptions`（draft/channelId/modelId 覆盖，`:22-29`）。

## 3. 内部逻辑与关键流程

- `createChat`（`:53-71`）：`createConversation(undefined, selectedModel.modelId, channelId)`→prepend conversations→`openSession('chat',…)`→`setActiveView('conversations')`→draft 入集。
- `createAgent`（`:73-92`）：`createAgentSession(undefined, options?.channelId??agentChannelId, workspaceId, options?.modelId??agentModelId)`→prepend agentSessions→openSession('agent'…）→draft 入集。两者失败均 console.error+返回 undefined（不抛）。

## 4. 调用者与调用链

- 入向：WelcomeView（nb-113 批）、LeftSidebar、GlobalShortcuts（new-session）等。
- 出向：`useOpenSession`（本批）、conversation/agent/draft atoms、`window.electronAPI.createConversation/createAgentSession`。

## 5. 数据 I/O、读写与副作用

IPC 创建会话；写 conversations/agentSessions/draftSessionIds；经 openSession 写 Tab。

## 6. 分支、失败、取消与恢复

创建失败→日志+undefined；draft 标记后置（创建成功后入集）。

## 7. 权限与权威状态

无权限分支，依据：经主进程 API 创建；渠道/模型默认值来源=agentChannelId/agentModelId atoms。

## 8. 修改影响面

全部新建会话入口；draft 生命周期入口（与 draftSessionIdsAtom 消费方耦合）。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批该文件无 test）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 双创建路径/覆盖优先级/draft 语义 | 已证实 | `:1-95` 全文 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+2 动作 | §2/§3 | 22-94 | covered |

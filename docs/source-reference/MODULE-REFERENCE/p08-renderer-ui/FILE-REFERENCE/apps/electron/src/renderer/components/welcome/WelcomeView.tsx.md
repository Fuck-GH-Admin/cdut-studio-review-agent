---
path: apps/electron/src/renderer/components/welcome/WelcomeView.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 889a4ecaf9cc22dafffe4e295b2f44741ddfea18
sha256: 75fabb61c388e5c028084e87a7faa8170f2854dccecfdce2e2185ebab806a254
lines: 92
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-05-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/welcome/WelcomeView.tsx

## 1. 结论与边界

**主区域空状态启动器**（92 行，`:1-10`）：无标签页时 ①优先复用现有会话（打开最近一个）②否则创建 draft 会话（不显示在侧边栏，发首条消息后转正）。渲染=过渡 spinner。

## 2. 导出与关键符号

1 导出：`WelcomeView`（`:22`）。状态：`initRef`（防重复初始化）、`latestRef`（高频值收 ref 防 effect 依赖污染，`:31-46` 注释）。

## 3. 内部逻辑与关键流程

初始化 effect（`:48-84`）：`agentSettingsReady` 才跑→`initRef` 单次→`listAgentSessions()`→找 `!archived&&!draft&&workspaceId 匹配&&!drafts` 的会话（`:65-67`）→有则 `openTab`+`upsertAgentSession`+`activateTabWithSideEffects`（统一激活入口同步当前会话/工作区/前台所有权，`:77-79` 注释）；无则 `createAgent({draft:true})`（`:82`）。catch→console.error。

## 4. 调用者与调用链

- 入向：主区 TabContent（无标签页分支，域外）。
- 出向：agent/tab/draft atoms、`@/lib/agent-session-list`/`tab-activation`、`useCreateSession`、`window.electronAPI.listAgentSessions`。

## 5. 数据 I/O、读写与副作用

读会话列表（IPC）；写 tabsAtom/agentSessionsAtom；可能创建 draft 会话（写主进程）。

## 6. 分支、失败、取消与恢复

复用/创建双分支；initRef 防重复；latestRef 防 stale closure；加载失败仅日志（`:83`）。

## 7. 权限与权威状态

无权限分支，依据：启动器逻辑。

## 8. 修改影响面

空状态进会话路径；draft 生命周期入口。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批无该文件测试）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 复用条件/激活副作用/draft 创建 | 已证实 | `:1-92` 全文 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+init effect | §2/§3 | 22-91 | covered |

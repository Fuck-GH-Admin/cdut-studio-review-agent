---
path: apps/electron/src/renderer/hooks/useOpenSession.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e5561f1b3bc7e8c663904dcdfe15e3c0fb1b28ed
sha256: 2e44745d01a2852bfb4c7c3e8eca90350e57a5886f0eae0bc2692e0858ebf2cd
lines: 149
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-05-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/hooks/useOpenSession.ts

## 1. 结论与边界

**统一"打开/聚焦会话 Tab"hook**（149 行，注释 `:1-6`）：封装 openTab+setTabs+activeTabId+appMode+currentXxxId 全链同步。**chat 入口已移除兼容旧调用直接 return**（`:55-58`）。

## 2. 导出与关键符号

1 导出：`useOpenSession(): (type, sessionId, title, parentSessionId?) => void`（`:37`）。

## 3. 内部逻辑与关键流程

- 门禁（`:60-72`）：agent/browser 走授权路径——`openAuthorized` 内校验 `!sessionMeta||isReviewOwnedAgentSession||!isAgentWorkspaceIdVisible` 拒绝（`:71-72`）；未知 ID 先 `resolveOrdinaryTabSession`（Main 授权查证）再开（`:136-144`，注释保留归档会话重开）。
- `openAuthorized`（`:70-135`）：lineage parent 三级取序（传入>sessionMeta.parent>explorationParent，`:73-75`）→openTab→MRU 提升（agent）→关自动化表单→视图 conversations→agent 分支：appMode/currentSessionId 同步+清未读角标+**`clearAgentCompletionState` 消费持久化"标记未读"防绿标复活**（`:102-108`）→workspaceId 同步（列表无→拉单条 meta 兜底 `:118-128`）；非 agent 分支：scratch 模式清双 currentId（`:130-134`）。

## 4. 调用者与调用链

- 入向：useCreateSession/useEnterCdutAiClass（本批）等所有开会话入口。
- 出向：tab/app-mode/active-view/automation/conversation/agent atoms、`@/lib/agent-tab-access`（resolveOrdinaryTabSession）、`@/lib/agent-session-list`、`window.electronAPI.clearAgentCompletionState/getAgentSessionMeta/updateSettings`。

## 5. 数据 I/O、读写与副作用

IPC（清完成态/拉 meta/更新 settings）；写 Tab/MRU/双模式/当前会话与工作区/未读集。

## 6. 分支、失败、取消与恢复

chat 短路/授权拒绝静默返回/未知 ID 异步授权/归档 meta 兜底；IPC 失败 console.error。

## 7. 权限与权威状态

**打开权权威=三重门禁**（review-owner 拒/不可见工作区拒/未知 ID 须 Main 授权，`:60-72`）；完成态消费=幂等 IPC（`:102-104`）。

## 8. 修改影响面

全部会话打开路径的 Tab/模式/当前态同步；与 agent-tab-access 门禁、绿标语义耦合。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批该文件无 test）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 三重门禁/lineage 取序/绿标消费 | 已证实 | `:1-149` 全文 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+openAuthorized | §2/§3 | 37-148 | covered |

---
path: apps/electron/src/renderer/components/cdut-science/agent-window/ScienceAgentWindowView.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5dbcaae28d140c3c1e9d30793319c8f080cab9c3
sha256: 7dff22b765c83711f89e209e528f8fc1c0b6cb3132e9139fb03442e42908e06b
lines: 669
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-science/agent-window/ScienceAgentWindowView.tsx

## 1. 结论与边界

CDUT Science 科学助理独立窗口（头注释 :2-10）：与主窗口共享 preload+Pi Agent 内核；五职责=水合绑定会话/复用 AgentView/接收上下文预填输入框（**不自动发送**）/科学快捷动作/会话菜单（重命名/置顶/AI 重生成标题/删除确认）。

## 2. 导出与关键符号

导出 1 条（`export` :108）：`ScienceAgentWindowView`（:108-，props labId/windowId/focusSessionId）。

## 3. 内部逻辑与关键流程

（头+大纲级+caller，669 行）：electronAPI 链（子agent 交叉核）：createAgentSession:157/bindSessionLab:158/getLabSnapshot:184/listAgentSessions:187/getAgentWindowContext:206/onAgentContext:219/updateAgentSessionTitle:315/togglePinAgentSession:325/regenerateAgentSessionTitle:340/deleteAgentSession:363；AgentView `variant="cs-lab"` 挂载（:635）；WindowControls 仅 Windows（:457）。

## 4. 调用者与调用链

入向（子agent 交叉核）：`renderer/main.tsx:1092` 动态 import→:1102 挂载（URL 参数 :1088-1091）；窗口入口链 main.tsx:142（`window=science-agent`）→:1086-1107；窗口 URL 由 `main/lib/cslab/cslab-window-manager.ts:119` 拼（windowId :37）；触发方 `CsLabWorkspaceView.tsx:1901` openAgentWindow；`agent-service.ts:166` 排除活跃流绑定（restoreActiveStreams=false）。出向：AgentView、`@profer/shared`（AgentSessionMeta/CsLabAgentContext）、agentComposerInjectionAtom 等。

## 5. 数据 I/O、读写与副作用

会话创建/管理 IPC；上下文接收（onAgentContext）。

## 6. 分支、失败、取消与恢复

上下文预填不自动发送（:7）；删除确认（:9）。不适用取消/恢复。

## 7. 权限与权威状态

独立窗口与主窗共享内核（:4）；活跃流绑定排除（agent-service:166）防双流。

## 8. 修改影响面

- 消费面：科学助理独立窗口。
- 依赖面：cslab-window-manager 窗口参数、AgentView。
- 需同步测试：无专属。

## 9. 测试证据

无专属测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 1 条；窗口链+五职责 | 已证实 | :2-10+caller 交叉核 |
| 窗口实现逐行 | 推断（头+大纲级） | :108-668 |
| 通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+窗口链 | §2/§4 | :108-669 | covered |

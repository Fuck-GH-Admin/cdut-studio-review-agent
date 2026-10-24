---
path: apps/electron/src/renderer/lib/agent-completion-presence.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6dd932fec94fe459c2db4473c6a8c402c3973df3
sha256: f1f79e3fe643a42f2a831c090f029ac7c271c053f0843821a82c52730deae663
lines: 42
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/agent-completion-presence.ts

## 1. 结论与边界

Agent 完成「在看」判定（42 行）：**窗口失焦即使当前 Tab 也不算在看**（:8/:24-26，与角标清除端语义对齐）。

## 2. 导出与关键符号

导出 4 条（`export` :3/:12/:17/:37）：`AgentCompletionPresenceInput`（:3-10）、`AgentCompletionMarkers`（:12-14）、`isAgentSessionActiveForCompletion`（:17-34）、`getAgentCompletionMarkers`（:37-42，`markUnviewedCompleted=!isActive`）。

## 3. 内部逻辑与关键流程

失焦短路 false（:26）；activeTab 存在→agent/browser+sessionId 匹配（:29-31）；否则 currentAgentSessionId 匹配（:33）。

## 4. 调用者与调用链

入向：Agent 完成事件处理链。出向：`@/atoms/tab-atoms` 类型。

## 5-7. 数据/分支/权限

纯函数；失焦语义=权限边界（:8）。

## 8. 修改影响面

- 消费面：完成角标。
- 依赖面：TabItem 形状。
- 需同步测试：`agent-completion-presence.test.ts`（72 行）。

## 9. 测试证据

`agent-completion-presence.test.ts`（批内）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 4 条；失焦语义 | 已证实 | :24-26 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 导出 | §2/§3 | :17-42 | covered |

---
path: apps/electron/src/main/lib/agent-workspace-events.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6ad4b62e2f3ae67603acdf00ca107e7e6ce73993
sha256: cd5b7746e921215d6ec9c1d7ddb1e92a680659d4101b65313ea32505b24f8d65
lines: 19
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-workspace-events.ts

## 1. 结论与边界

工作区列表变更广播（19 行）：向存活渲染窗口发 `WORKSPACES_CHANGED`。

## 2. 导出与关键符号

导出 2 条（`export` :5/:13）：`AgentWorkspaceEventWindow`（:5-10，isDestroyed/webContents.send 结构接口）、`broadcastAgentWorkspaceChange(windows)`（:13-18）。

## 3. 内部逻辑与关键流程

逐窗口 isDestroyed 守卫后 send（:14-17）。不适用取消/恢复/权限：纯广播。

## 4. 调用者与调用链

入向（子agent 交叉核）：**生产 0 处**——全树检索（模块名+符号名）仅命中本文件与其测试；仅测试 `agent-workspace-events.test.ts:3`。出向：`@profer/shared`（AGENT_IPC_CHANNELS :3，调用 :17）。

## 5-7. 数据/分支/权限

无 I/O；isDestroyed 单分支；不适用。

## 8. 修改影响面

工作区列表刷新链。需同步测试（30 行）。

## 9. 测试证据

`agent-workspace-events.test.ts`（批内，30 行，断言细节见姊妹手册）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 2 条 | 已证实 | :5-18 |
| 生产消费者 0（仅测试） | 已证实（否定） | 全树检索（§4） |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 导出 | §2/§3 | :5-18 | covered |

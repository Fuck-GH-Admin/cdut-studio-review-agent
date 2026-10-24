---
path: apps/electron/src/renderer/hooks/useBackgroundTasks.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c3e3c757405619981abe9414e2183c6459d09531
sha256: 0dd1d37e27575c875210a41bc8561065d8a26dea51fa2efe45bde3ff8baa95fe
lines: 121
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-05-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/hooks/useBackgroundTasks.ts

## 1. 结论与边界

**后台任务管理 hook**（121 行，注释 `:1-8`）：按会话隔离的 Agent/Shell 后台任务列表增删改+停止（IPC）。数据源=`backgroundTasksAtomFamily(sessionId)`。

## 2. 导出与关键符号

1 导出：`useBackgroundTasks(sessionId): UseBackgroundTasksResult`（`:39`）——tasks/addTask/updateTaskProgress/removeTask/stopTask（接口 `:17-32`）。

## 3. 内部逻辑与关键流程

- `addTask`（`:47-58`）：toolUseId 去重（`:51-53`）+elapsedSeconds 归零。
- `updateTaskProgress`（`:65-72`）：按 toolUseId 更新 elapsedSeconds（task_progress 事件驱动）。
- `removeTask`（`:79-84`）：filter。
- `stopTask`（`:92-112`）：`window.electronAPI.stopTask({sessionId, taskId, type})`→成功后按 toolUseId 移除（`:101-105`）；失败 console.error+**rethrow**（`:106-108`）。

## 4. 调用者与调用链

- 入向：后台任务面板（域外）。
- 出向：agent-atoms（backgroundTasksAtomFamily）、`window.electronAPI.stopTask`。

## 5. 数据 I/O、读写与副作用

IPC 停任务；写会话级任务列表 atom。

## 6. 分支、失败、取消与恢复

重复添加忽略；停止失败 rethrow（调用方处理）。

## 7. 权限与权威状态

任务停止权威=主进程 stopTask；列表状态为渲染侧投影。

## 8. 修改影响面

后台任务面板交互；与 useGlobalAgentListeners 的任务事件写入面（同 atom family）联动。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批该文件无 test）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 去重/停止链/rethrow | 已证实 | `:1-121` 全文 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+4 动作 | §2/§3 | 17-120 | covered |

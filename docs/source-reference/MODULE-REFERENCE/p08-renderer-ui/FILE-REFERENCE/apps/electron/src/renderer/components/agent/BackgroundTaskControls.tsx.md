---
path: apps/electron/src/renderer/components/agent/BackgroundTaskControls.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: da0005fca69edcaf2cf35b1b8dd863328ed7fa50
sha256: 151d2ec3f5a4bd519f7346453cf58b3050c29288bb6227eb82c04a65dafd1c72
lines: 119
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/BackgroundTaskControls.tsx

## 1. 结论与边界

后台任务控制容器：`ActiveTasksBar` 的宿主 + 停止确认对话框 + 任务输出查看对话框。任务状态存 jotai（`backgroundTasksAtomFamily(sessionId)`）；停止/读输出经 IPC。空任务不渲染。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `BackgroundTaskControls` | function 组件 | `:23-119` | `({sessionId}) => ReactElement \| null` |

内部状态：`tasks`（atom）、`pendingStop/stopping`、`outputTask/output/outputLoading/outputError`（`:25-30`）；`readOutput`（`:32-49`）、`stopTask`（`:51-64`）、`handleTaskClick`（`:66-69`）。

## 3. 内部逻辑与关键流程

### 3.1 读输出（`:32-49`）

先显任务缓存输出再 `window.electronAPI.getTaskOutput({sessionId,taskId})`；结果写回 atom（`output` 回填）；`status!=='running'` 时 toast 状态+summary；失败置 `outputError`；finally 关 loading。

### 3.2 停止（`:51-64`）

`stopTask({sessionId,taskId,type})` 成功 → 从 atom 移除 + toast“后台任务已停止” + 关确认框；失败 toast 错误；`stopping` 期间按钮禁用、防关框（`:84`）。

### 3.3 点击导航（`:66-69`）

`document.querySelector('[data-tool-use-id="…"]')`（`CSS.escape` 转义）→ `scrollIntoView(smooth/center)`。

### 3.4 渲染（`:71-118`）

空任务 null；`ActiveTasksBar`（onTaskStop 置 pendingStop、onTaskOutput=readOutput）；停止 AlertDialog（描述优先 `intent`，回退“将请求 Runtime 停止 Shell/Agent 任务 id”；Action `preventDefault` 后手动 stopTask）；输出 Dialog（标题 intent/类型；loading aria-live、error role=alert、`<pre>` 展示或“暂无可用输出”）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：Agent 会话视图。出向：`@/atoms/agent-atoms`、`./ActiveTasksBar`、`@profer/ui`（AlertDialog/Dialog）、`window.electronAPI.{getTaskOutput,stopTask}`、`sonner`。

## 5. 数据 I/O、读写与副作用

IPC 读输出/停任务；atom 写；toast；DOM 滚动。无持久化。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 空任务 | `:71` | null |
| 读输出失败 | `:44-45` | 错误显示在对话框 |
| 停止失败 | `:59-60` | toast（任务保留列表） |
| stopping 中 | `:84/:93-94` | 禁用交互防误关 |

## 7. 权限与权威状态

停止是破坏性动作 → AlertDialog 二次确认（描述明示将请求 Runtime 停止）；输出状态由 Runtime 权威（toast 同步非 running 状态）。

## 8. 修改影响面

改交互 → 影响后台任务管理；`BackgroundTask`/IPC 契约联动。

## 9. 测试证据

本轮 `NOT_RUN`。无直接测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 停止二次确认+失败保留列表 | 已证实 | `:51-64/:84-100` |
| 输出读取回填 atom | 已证实 | `:38-43` |
| CSS.escape 转义点击导航 | 已证实 | `:67` |
| 运行表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `BackgroundTaskControls` 全流程 | 2/3 | `:23-119` | covered |

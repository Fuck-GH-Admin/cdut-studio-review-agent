---
path: apps/electron/src/renderer/hooks/useGlobalAgentListeners.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7f589fafd259f06e7c004282e8f72807d5f22fe1
sha256: 8ced2f5e0b6bb3eb9c9f72c523a185c2606cec7da344d5e5cbc96632a9808432
lines: 1842
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-05-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/hooks/useGlobalAgentListeners.ts

## 1. 结论与边界

**全局 Agent IPC 监听器**（1842 行，头注释 `:1-8`）：应用顶层挂载永不销毁；将流式事件/权限请求/AskUser 写入 atoms；`useStore()` 直操避免 React 订阅。次级窗口须 `restoreActiveStreams:false`（防抢主流，`:363-369`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `UseGlobalAgentListenersOptions` | 接口 | `:363` | restoreActiveStreams? |
| `useGlobalAgentListeners(options)` | Hook | `:371` | 主体单 effect（`:375-1841`） |
| `payloadToLegacyEvents`（内部） | 函数 | `:126` | Phase1 兼容层：AgentStreamPayload→旧 AgentEvent[]（Phase2 将移除，`:121-124`） |
| 常量 | `:91-94` | | WRITE_TOOLS 5 个（自动定位）、GIT_MUTATING_SUBCOMMANDS（diff 刷新识别） |
| 工具 | `:96-119` | | getParentDir/cyrb53（字符串 hash）/uniqueTruthyPaths |

## 3. 内部逻辑与关键流程

- **Goal**（`:378-407`）：启动水合+onGoalEvent 合并/终态 toast（completed/blocked/failed/budget_limited）；注释锁定"Goal 不证明 run 状态"（`:394-395`）。
- **批处理器**（`:419-447`）：liveMessageBatcher（按 session 合并防唤醒完整渲染）+streamStateBatcher（文本/thinking 高频合并、控制事件先 flush，`:966-991`）。
- **外部 run**（`:472-557`）：`external_run_started` 不抢占前台（不切 Tab/模式）；单条 upsert 防整体覆盖冲掉父会话（#985 注释 `:491-495`）；未知 ID 走 Main 授权。
- **流事件**（`:729-1335`）：未知 ID 排队（4096 上限防内存滞留 `:1351-1355`）+授权后按序放行；`run_complete/run_error` 跳过（终态由专用 IPC 承担，`:736-741`）；profer_event 分支（preview_requested 正式预览链 `:780-828`、preview_inspection、image_generation、session_updated 带 revision 防回退 `:860`、session_deleted 撤销+closeTab 级联 `:885-902`）；sdk_message 直积 liveMessages（prompt_suggestion/thinking_tokens 排除 `:917-922`）。
- **写工具链**（`:1011-1182`）：WRITE_TOOLS tool_start→自动定位+最近修改标记+autoPreview；tool_result→非 Git 文件变更记录+每轮首写切 changes 面板+diff 刷新+unseen 标记；git 突变 Bash 完成→全量失效 diff 缓存。
- **权限/AskUser/Plan**（`:1204-1322`）：三队列入队/出队（跨端残留清理 `:1237-1246`）+阻塞通知（提示音+导航）；plan_mode 双源更新。
- **STREAM_COMPLETE**（`:1414-1629`）：批处理 flush→`isCurrentAgentStreamCompletion` 竞态核（防迟到终态）→通知（**仅正常完成播音**，历史误导修复注释 `:1436-1442`）→settle 流状态→未查看完成标记（仅非激活）→stoppedByUser 标记→中断 chip→toast→finalize（后台任务等待态不收尾 `:1564-1566`）。
- **恢复闸门**（`:1379-1411`）：`AgentStreamRestoreGate` 暂存恢复窗口内终态（防刷新后残留 spinner，`:1376-1378`）。
- **其它**（`:1673-1823`）：标题更新/会话更新（均带授权兜底）/Todo 会话跨窗口交接（`:1707-1735`）/15s 修剪最近修改/窗口聚焦外部修改检测（cyrb53 hash LRU 100，`:1756-1822`）。
- cleanup（`:1825-1840`）：全订阅/定时器/focus 移除。

## 4. 调用者与调用链

- 入向：main.tsx/次级窗口根（restoreActiveStreams=false）。
- 出向：agent/tab/preview/notification atoms 族、`@/lib/*`（agent-tab-access/agent-stream-state-cleanup/agent-stream-restore-gate/session-update-batcher 等）、preview-opener（本组 nb-113 批）、`window.electronAPI.onAgentStream*/restoreActiveAgentStreams/listGoals/...`。

## 5. 数据 I/O、读写与副作用

十余路 IPC 订阅；写 40+ atoms；桌面通知/提示音；git 缓存失效；预览打开；间隔定时器。

## 6. 分支、失败、取消与恢复

未知 ID 排队授权/撤销即断（revoked 全链短路）/终态竞态三重核（isCurrentAgentStreamCompletion+restoreGate+isNewStreamRunning）/恢复闸门延后派发。

## 7. 权限与权威状态

**事件准入权威=Main 授权**（未知 ID 排队+ensureOrdinaryWorkTabOwner，`:1343-1369`）；终态权威=专用 IPC+竞态核；Goal 不得清流状态（`:394-395` 注释锁定）。

## 8. 修改影响面

Agent 流式渲染/权限交互/通知/预览/文件变更跟踪全链的事件底座；批处理与竞态语义变更影响面极大。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批该文件无 test）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 事件路由矩阵/三重竞态核/批处理/授权门禁 | 已证实 | `:1-1842` 全文（分段逐段） |
| Phase1 兼容层将移除（注释计划） | 推断 | `:121-124` |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 导出+事件矩阵+收尾链 | §2/§3 | 90-1841 | covered |

---
path: apps/electron/src/renderer/lib/agent-stream-state-cleanup.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0e6818cdff247d837060a367379a31400acfd1d6
sha256: 5771193c0de10927f37a0539dada0a4ff2083ec9add1b8f7cde194287e58fefe
lines: 76
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/agent-stream-state-cleanup.ts

## 1. 结论与边界

**流式状态清理/收敛纯函数集**（76 行）：四个函数负责 run 终态归属判定、乐观假运行回滚、STREAM_COMPLETE 终态收敛、后台完成态压缩。边界：不监听 IPC、不写 store；调用方（useGlobalAgentListeners/AgentView）负责派发与原子写入。

## 2. 导出与关键符号

导出 4 个函数、0 常量、0 独立类型：`isCurrentAgentStreamCompletion`（`agent-stream-state-cleanup.ts:6`，类型谓词 `state is AgentStreamState`）、`rollbackRejectedAgentRunState`（`:18`）、`settleCompletedAgentStreamState`（`:34`）、`compactCompletedBackgroundStreamState`（`:58`）。内部符号：无（类型 `AgentStreamState` 来自 `@/atoms/agent-atoms`，`:1`）。

## 3. 内部逻辑与关键流程

- `isCurrentAgentStreamCompletion`（`agent-stream-state-cleanup.ts:6-12`）：`:10` state 缺失或既非 running 也非 backgroundWaiting → false；`:11` `state.startedAt == null` → true（占位无起始时间，放行），否则要求 `completion.startedAt != null && state.startedAt <= completion.startedAt`。
- `rollbackRejectedAgentRunState`（`:18-27`）：展开 state，把 running/backgroundWaiting/stopping/isCompacting/compactInFlight 五把锁全部置 false，其余字段原样保留。
- `settleCompletedAgentStreamState`（`:34-52`）：`:38` 计算 `hasUnfinishedTools`；返回 running=false、backgroundWaiting=backgroundTasksPending、stopping/isCompacting/compactInFlight=false，`:48-50` 有未完成工具时逐一补 `done: true`，否则原数组引用。
- `compactCompletedBackgroundStreamState`（`:58-76`）：`:61` state 缺失或 running/backgroundWaiting → 原样返回；`:63` 无 `inputTokens` → undefined（整体移除）；`:65-75` 重建对象只保留 running:false、空 content、空 toolActivities 与 6 个用量字段（inputTokens/outputTokens/cacheReadTokens/cacheCreationTokens/contextWindow/model）。

## 4. 调用者与调用链

- 入向：`apps/electron/src/renderer/hooks/useGlobalAgentListeners.ts:84` import 三函数；`:1427`、`:1465` `isCurrentAgentStreamCompletion` 守卫；`:1467` `settleCompletedAgentStreamState`；`:1582` `compactCompletedBackgroundStreamState`。`apps/electron/src/renderer/components/agent/AgentView.tsx:67` import、`:2828` `rollbackRejectedAgentRunState`。测试：`agent-stream-state-cleanup.test.ts:3`、`agent-stream-completion.test.ts:3`、`agent-autosend-turn.test.ts:5`。
- 出向：仅类型 import（`:1`），无运行时调用。
- 动态调用：未知；检索方式——冻结树 grep 四个函数名（*.ts/*.tsx），无 import()/require()，preload 桥无引用。

## 5. 数据 I/O、读写与副作用

全部纯函数：不读写模块级状态/缓存，无事件订阅/DOM/toast/窗口副作用；输入 state 对象不被就地修改（展开拷贝）。

## 6. 分支、失败、取消与恢复

失败/恢复路径完整：① 前端乐观进入运行态但 IPC 同步拒绝（如渠道已删除）→ `rollbackRejectedAgentRunState` 撤销假运行、释放全部输入锁（`:14-16`）；② 主进程确认真实结束（STREAM_COMPLETE）→ `settleCompletedAgentStreamState` 收敛可输入终态，强制释放压缩 UI 锁（`:44-47` 注释：compact_boundary 非所有失败路径都有，不释放会永久禁用输入）；③ 旧 run 的 completion → `isCurrentAgentStreamCompletion` 返回 false 丢弃（`:4`），不触发通知/标记/关闭新 run；④ 后台已完成会话 → `compactCompletedBackgroundStreamState` 释放瞬时状态、保留用量，运行中/软空闲原样保留（`:55-56`）。边界：`backgroundTasksPending` 决定 backgroundWaiting（`:42`）；未完成工具统一补 done（`:48-50`）；inputTokens 缺失整体移除（`:63`）。无 throw、无异步、无取消机制（纯同步）。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。权威注释：只有 STREAM_COMPLETE 才代表主进程运行锁已释放，错误消息/result 不能替代（`agent-stream-state-cleanup.ts:31-32`）。

## 8. 修改影响面

`useGlobalAgentListeners.ts` 流式完成/错误收尾（通知、未查看标记、消息重载、finalize）、`AgentView.tsx:2828` 启动拒绝回滚、`agent-autosend-turn` 边界判定；改动会波及输入锁释放与迟到终态过滤。

## 9. 测试证据

`NOT_RUN`（本轮未运行测试，纯静态阅读）。直接证据：`agent-stream-state-cleanup.test.ts` 6 个 test（grep `test(` 计数=6），如 `:17-23` expect 五锁全 false、`:37-44` expect 收敛+done 补齐、`:63` expect undefined、`:74-84` expect 保留用量、`:91-92` expect 原引用。间接：`agent-stream-completion.test.ts:19-33`、`agent-autosend-turn.test.ts:62`。断言≠运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 四函数收敛/回滚/过滤语义 | 已证实 | `agent-stream-state-cleanup.ts:6-76` |
| IPC 调用点时序 | 已证实 | `useGlobalAgentListeners.ts:1427,1465,1467,1582` |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| isCurrentAgentStreamCompletion | §3/§6 | 6-12 | covered |
| rollbackRejectedAgentRunState | §3/§6 | 18-27 | covered |
| settleCompletedAgentStreamState | §3/§6 | 34-52 | covered |
| compactCompletedBackgroundStreamState | §3/§6 | 58-76 | covered |

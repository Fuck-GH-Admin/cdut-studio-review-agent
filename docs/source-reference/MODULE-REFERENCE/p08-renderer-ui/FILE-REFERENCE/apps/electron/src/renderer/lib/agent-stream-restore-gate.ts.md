---
path: apps/electron/src/renderer/lib/agent-stream-restore-gate.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 231130376037fce70c1f81272b293c4a0546c244
sha256: e0aba01f02afb86adba5471bce6cec25d382118147ca4b3025d2236bd30faf65
lines: 44
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/agent-stream-restore-gate.ts

## 1. 结论与边界

**刷新恢复窗口的终态闸门**（44 行，class `AgentStreamRestoreGate`）：把恢复窗口内先于 running 占位到达的终态 IPC 暂存，占位写入后（`settle()`）按原顺序派发，避免被 `isCurrentAgentStreamCompletion` 竞态保护当迟到终态丢弃、刷新后残留 spinner（`agent-stream-restore-gate.ts:2-13`）。边界：只管时序、不判 run 归属；已有流式状态的会话不暂存（`:12-13`）。

## 2. 导出与关键符号

导出 1 个类、0 函数、0 常量、0 独立类型：`class AgentStreamRestoreGate`（`agent-stream-restore-gate.ts:15`）。类成员：构造器注入 `hasStreamState(sessionId)`（`:19`）、`defer(sessionId, dispatch): boolean`（`:26`）、`settle(): void`（`:34`）、getter `pendingCount: number`（`:41`，仅测试与诊断用，`:40`）。内部状态字段：`settled`（`:16`）、`deferred: Array<() => void>`（`:17`）。

## 3. 内部逻辑与关键流程

- `defer`（`agent-stream-restore-gate.ts:26-31`）：`settled` 为 true → 返回 false（立即派发）；`hasStreamState(sessionId)` 为 true → 返回 false（已有状态可过竞态保护）；否则 push 进 `deferred` 并返回 true（调用方必须立刻返回不再执行终态处理，`:24`）。
- `settle`（`:34-38`）：置 `settled=true`，`splice(0)` 取出全部暂存后逐个执行 `dispatch()`，之后到达的终态一律立即派发（`:33`）。
- `pendingCount`（`:41-43`）：返回 `deferred.length`，只读。

## 4. 调用者与调用链

- 入向：`apps/electron/src/renderer/hooks/useGlobalAgentListeners.ts:85` import、`:1379` 构造（hasStreamState 查 `agentStreamingStatesAtom`）；`settle()` 于 `:1402`（占位写入后）、`:1406`（恢复失败 catch）、`:1410`（次级窗口不参与重连时立即放行）；`defer()` 于 `:1634`（handleStreamComplete 前）、`:1668`（handleStreamError 前）。
- 出向：无 import，纯内存队列。
- 动态调用：未知；检索方式——冻结树 grep `agent-stream-restore-gate|AgentStreamRestoreGate`（*.ts/*.tsx），仅 useGlobalAgentListeners 与本批测试文件，无 import()/require()。

## 5. 数据 I/O、读写与副作用

实例级状态（非模块级）：`settled` 布尔 + `deferred` 回调数组。无全局缓存/注册表；无 DOM/toast/窗口副作用；副作用仅是执行被暂存的终态回调（通知、标记、消息重载、finalize 由回调方实现）。

## 6. 分支、失败、取消与恢复

恢复路径完整闭环（结合 `useGlobalAgentListeners.ts:1372-1411`）：① 恢复窗口内终态到达 → `defer` 暂存（无流式状态时）；② IPC 返回写入 running 占位后 `settle()` 放行（`:1402`）；③ `restoreActiveAgentStreams()` reject → catch 中 `settle()` 放行（`:1406`），闸门不永久阻塞；④ 次级窗口直接 `settle()`（`:1410`）。分支：已 settle → defer 恒 false（`:27`）；已有流式状态 → 不暂存立即派发（`:28`）；`settle()` 重复调用不重复执行已放行回调（`splice` 清空，`:36`）。无 throw 路径；失败恢复由调用方 catch 保证。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。权威约定：STREAM_COMPLETE 仍是运行锁唯一权威（模块注释 `agent-stream-restore-gate.ts:7-8` 转述竞态保护语义）。

## 8. 修改影响面

`useGlobalAgentListeners.ts` 流式完成/错误处理的刷新恢复时序；改动 defer/settle 语义会导致刷新后终态丢失（残留 spinner）或收尾副作用延迟。

## 9. 测试证据

`NOT_RUN`（本轮未运行测试，纯静态阅读）。直接证据：`agent-stream-restore-gate.test.ts` 5 个 test（grep `test(` 计数=5），如 `:15-17` expect defer=true 且 pendingCount=1、`:28-30` expect false 立即派发、`:44-51` settle 按序派发、`:61` 重复 settle 不重复。断言≠运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| defer/settle 暂存与放行语义 | 已证实 | `agent-stream-restore-gate.ts:26-38` |
| 三个 settle 调用点的恢复闭环 | 已证实 | `useGlobalAgentListeners.ts:1402,1406,1410` |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| AgentStreamRestoreGate 类 | §2/§3 | 15-44 | covered |
| defer 分支 | §6 | 26-31 | covered |
| settle 恢复路径 | §6 | 34-38 | covered |
| pendingCount | §2 | 41-43 | covered |

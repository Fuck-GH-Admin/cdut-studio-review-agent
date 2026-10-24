---
path: apps/electron/src/main/lib/pi-background-task-manager.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 67c41cd5363de8830cb7c0e742a6a38d6d64cbe5
sha256: 9224e029246e7d4847d258bb05118c874b3806ae7f6f28459580c9052c61fea4
lines: 127
kind: source
package: p01-app-shell
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/pi-background-task-manager.ts

## 1. 结论与边界

Pi 长命服务的 TaskOutput/TaskStop 适配层（127 行，注释 `:21`）：按 `sessionId/taskId` 双键维护后台任务输出与状态，提供阻塞式取输出与带身份校验的停止。**ownership 仍完全由 runtime registry 负责**（`:21` 注释），本类不自证进程归属。

**边界**：不启动进程（进程由 adapters 层创建并 attach）；不做持久化（内存 Map；重启恢复依赖 `hydrate` 从 registry 注入）；不实现进程监控（`process-monitor`/`runtime-process-registry` 跨批）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `PiBackgroundTaskStatus` | 类型（导出） | 5 | `'running'\|'completed'\|'failed'\|'stopped'` | 4 状态枚举 |
| `PiBackgroundTaskManager` | 类（导出） | 22-125 | 见下 | 任务管理器 |
| `piBackgroundTaskManager` | 常量（导出） | 127 | `new PiBackgroundTaskManager()` | 模块单例 |

类方法（`:22-125`）：`begin`（`:25-32`）、`attachProcess`（`:34-40`）、`append`（`:42-48`）、`complete`（`:50-56`）、`hydrate`（`:59-77`）、`getOutput`（`:91-106`）、`stop`（`:108-120`）、`clear`（`:122-124`）；内部 `ensureTask`（`:79-89`）。内部接口 `PiBackgroundTask`（`:7-17`）+ 常量 `MAX_OUTPUT_CHARS = 2*1024*1024`（`:19`）。

## 3. 内部逻辑与关键流程

1. **begin**（`:25-32`）：按 sessionId 建二级 Map（`:26-30`）；置 `{status:'running', output:'', updatedAt:Date.now()}`（`:31`）。同 id 重复 begin 会覆盖既有任务（照实：无 has 检查）。
2. **attachProcess**（`:34-40`）：任务缺失静默 return（`:36`）；记录 `pid/startTime`（`:37-38`）。
3. **append**（`:42-48`）：缺失静默 return；Buffer 按 utf8 转字符串拼接（`:45`）；超过 `MAX_OUTPUT_CHARS` → `slice(-MAX_OUTPUT_CHARS)` 截尾保最新（`:46`）。
4. **complete**（`:50-56`）：`status: Exclude<PiBackgroundTaskStatus,'running'>` + 可选 summary；缺失静默 return。
5. **hydrate**（`:59-77`）：`record.status === 'exited' || !record.likelyService` → return（`:60`）；同 id 已存在不覆盖（`:66`）；恢复为 `status:'running', output:''`（`:67-76`）——**历史输出不可恢复**（注释 `:58`："输出正文只能恢复后续新产生的增量"，不虚构历史输出）。
6. **ensureTask**（`:79-89`，内部）：内存缺失时 `listOwnedRuntimeProcesses(sessionId)` 按 `id===taskId` 找 record 并 hydrate 后回读（`:82-86`）；仍无 → `undefined`。
7. **getOutput**（`:91-106`）：无任务 → throw `后台任务不存在或不属于当前会话: ${taskId}`（`:93`）；`deadline = now + clamp(timeoutMs ?? 5000, 0..30000)`（`:94`）；`block` 且 running 时 50ms 轮询至终态或 deadline（`:96-99`）；返回 `{output, isComplete: status!=='running', status, summary?}`（`:100-105`）。
8. **stop**（`:108-120`）：无任务 → throw 同上（`:110`）；非 running → 静默 return（`:111`）；registry 内找 `id===taskId && status==='running'` 的 record（`:112-113`）；**守卫一**：`!record?.pid || record.startTime === undefined` → throw `'后台任务尚未确认真实进程，拒绝停止'`（`:114`）；**守卫二**：`!(await isSameProcess(pid, startTime))` → throw `'后台任务进程已变化或已退出，拒绝停止'`（`:115`）；`terminateProcessTreeGracefully` 失败 → throw `后台任务停止失败: …`（`:116-117`）；成功 → `markOwnedRuntimeProcessExited` + `complete('stopped', result.message)`（`:118-119`）。
9. **clear**（`:122-124`）：清空全部任务。

## 4. 调用者与调用链

入向（全冻结树检索 `piBackgroundTaskManager`/`PiBackgroundTaskManager`）：
- `lib/adapters/pi-agent-adapter.ts:107`（import 单例）：`pi-agent-adapter.ts:1812`/`pi-agent-adapter.ts:1817`/`pi-agent-adapter.ts:2252`/`pi-agent-adapter.ts:2253` append、`pi-agent-adapter.ts:1823`/`pi-agent-adapter.ts:2257` attachProcess、`pi-agent-adapter.ts:1831`/`pi-agent-adapter.ts:2264` complete、`pi-agent-adapter.ts:2298` begin、`pi-agent-adapter.ts:3502` getOutput、`pi-agent-adapter.ts:3507` stop。
- `lib/adapters/pi-powershell-tool.ts:11`（import 单例）：`pi-powershell-tool.ts:266` begin、`pi-powershell-tool.ts:273-274` append、`pi-powershell-tool.ts:278` attachProcess、`pi-powershell-tool.ts:282` complete（按 aborted/timedOut/errorKind/exitCode 映射 stopped/failed/completed）。
- 批内测试 `pi-background-task-manager.test.ts:2`（类直测）。
出向：`./process-monitor`（`isSameProcess`、`terminateProcessTreeGracefully`，`:2`）、`./runtime-process-registry`（`listOwnedRuntimeProcesses`/`markOwnedRuntimeProcessExited`/`RuntimeProcessRecord`，`:3`）、类型 `GetTaskOutputResult`（`@profer/shared` `:1`）。均为跨批实现，未深读。

## 5. 数据 I/O、读写与副作用

- 状态：内存 `Map<sessionId, Map<taskId, PiBackgroundTask>>`（`:23`），进程重启即失；恢复入口=hydrate/ensureTask（`:59-89`）。
- 副作用：经 `stop` 操作真实进程树（`terminateProcessTreeGracefully` `:116`）并写 runtime registry（`markOwnedRuntimeProcessExited` `:118`）。
- 输出截尾（`:46`）是唯一数据丢失点（保留最新 2MB）。
- 无磁盘/网络直接调用（registry 的持久化在跨批实现）。

## 6. 分支、失败、取消与恢复

- throw 点 5 处（`:93`/`:110`/`:114`/`:115`/`:117`）、4 种文案（`:93` 与 `:110` 同文案）；中文错误文案直接面向调用方。
- 静默分支：attachProcess/append/complete 任务缺失（`:36`/`:44`/`:52`）；stop 非 running（`:111`）；hydrate 条件不合（`:60`）。
- 恢复路径：hydrate 从 registry 恢复活跃服务（running+空输出，不虚构历史输出）；ensureTask 在查询/停止时按需回填。
- 不可恢复点：历史输出（重启后丢失）；`clear()` 全清。

## 7. 权限与权威状态

- 任务归属（ownership）由 runtime registry 限定（`:21` 注释 + `listOwnedRuntimeProcesses(sessionId)` `:82`/`:112`），**会话隔离**靠 sessionId 双键（`:23`）。
- stop 的进程身份校验=pid+startTime 双守卫（`:114-115`，`isSameProcess` 防误杀复用 PID）。
- 无 sender/role 检查（不适用，依据：本文件无 Electron IPC 权限面；权限收口在 adapters/IPC 层）。

## 8. 修改影响面

- 影响 `pi-agent-adapter.ts`（6 个调用点段）与 `pi-powershell-tool.ts` 的后台任务输出/停止语义（TaskOutput/TaskStop 用户可见行为）。
- `PiBackgroundTaskStatus` 枚举与 `GetTaskOutputResult` 形状是跨模块契约（`@profer/shared`）。
- throw 文案是用户可见文本；stop 守卫语义（拒绝停止的两类错误）影响 UI 错误展示。
- 需同步修改的测试：`pi-background-task-manager.test.ts`（批内 4 用例）。

## 9. 测试证据

直接测试：`apps/electron/src/main/lib/pi-background-task-manager.test.ts`（批内，4 test，详见该文件手册）：sessionId+taskId 隔离与跨会话 throw、block 轮询等到终态、hydrate 恢复 running+空输出（不虚构历史）、`likelyService:false` 不恢复。fixture 为 `RuntimeProcessRecord` 全字段样板（测试内 status:'running' 给定态）。

未覆盖：stop 的三重守卫分支无测试（`:110-117`）；2MB 截尾无测试；getOutput 的 30s 上限/50ms 轮询节奏无断言。

`NOT_RUN`：本轮未运行 bun test；断言≠已运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 类全部方法/分支/守卫/截尾/hydrate 语义 | 已证实 | `:1-127` 全文逐行 |
| 入向=pi-agent-adapter/pi-powershell-tool 各调用点 | 已证实 | 全树检索（§4） |
| ownership 由 registry 负责 | 已证实（注释+实现引用） | `:21`、`:82`、`:112` |
| `isSameProcess`/`terminateProcessTreeGracefully`/registry 内部行为 | 边界（跨批未深读） | `:2-3` 引入 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `PiBackgroundTaskStatus`/`PiBackgroundTask`/`MAX_OUTPUT_CHARS` | §2 | 5-19 | covered |
| `begin`/`attachProcess`/`append`/`complete` | §3.1-3.4 | 25-56 | covered |
| `hydrate`/`ensureTask` | §3.5-3.6/§6 | 59-89 | covered |
| `getOutput` | §3.7 | 91-106 | covered |
| `stop`（三守卫） | §3.8/§7 | 108-120 | covered |
| `clear`/单例 | §3.9/§2 | 122-127 | covered |

---
path: apps/electron/src/main/lib/process-handle.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f642ac349947541adba72a85f749a836e585f1ca
sha256: 5c32af813aa6f7523e2a42d963c8179a0d250123465b6c8c4a7d7e871a199ad8
lines: 66
kind: source
package: p01-app-shell
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/electron/src/main/lib/process-handle.ts

## 1. 结论与边界

统一进程归属句柄（主进程，纯适配层）：把持久化 `RuntimeProcessRecord` 映射成 runtime-neutral 的 `ProcessHandle`，并提供完成/归属判定（文件头 `apps/electron/src/main/lib/process-handle.ts:7-10`）。关键语义：`shellPid` 是 Profer 直接启动的 launcher，`pid` 只有 process-monitor 以命令/cwd/端口/startTime 确认后才表示实际服务进程，二者不可混（`:7-9`）。

边界：不做进程探测/监控（`runtime-process-registry`/process-monitor）；不持久化；不改旧 registry 格式（`:35` 注释）。

## 2. 导出与关键符号

`export` 逐条核对：3 类型 + 2 接口 + 3 函数 = 8 个导出。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `ProcessHandleRuntime` | 类型（导出） | 3 | `'pi' \| 'claude'` | |
| `ProcessHandleLauncher` | 类型（导出） | 4 | `'bash' \| 'powershell' \| 'wsl' \| 'claude'` | |
| `ProcessHandleStatus` | 类型（导出） | 5 | `'starting' \| 'running' \| 'exited' \| 'killed' \| 'failed'` | |
| `ProcessHandle` | 接口（导出） | 11-26 | `{id, sessionId, runtime, launcher, shellPid?, pid?, startTime?, cwd, command, status, exitCode?, signal?, startedAt, endedAt?}` | 句柄 |
| `ProcessHandleExit` | 接口（导出） | 28-33 | `{status?: 'exited'\|'killed'\|'failed', exitCode?, signal?, endedAt?}` | 完成入参 |
| `processHandleFromRuntimeRecord` | 函数（导出） | 36-51 | `(record: RuntimeProcessRecord) => ProcessHandle` | 适配 |
| `completeProcessHandle` | 函数（导出） | 53-62 | `(handle, exit = {}) => ProcessHandle` | 完成 |
| `isProcessHandleOwnedBySession` | 函数（导出） | 64-66 | `(handle, sessionId) => boolean` | 归属判定 |

无内部函数。

## 3. 内部逻辑与关键流程

1. `processHandleFromRuntimeRecord`（`:36-51`）：逐字段透传；`shellPid/pid/startTime` 仅在 record 有值时出现（spread 条件，`:42-44`）；`status==='pending'` → `'starting'`（`:47`）；`startedAt=launchedAt`（`:48`）；`status==='exited'` 时 `endedAt=lastObservedAt`（`:49`）。
2. `completeProcessHandle`（`:53-62`）：`status = exit.status ?? (exit.signal ? 'killed' : 'exited')`（`:54`，有 signal 默认视为 killed）；`endedAt = exit.endedAt ?? Date.now()`（`:60`）。
3. `isProcessHandleOwnedBySession`（`:64-66`）：`sessionId` 相等 **且** `runtime==='pi'` 才算本会话所有。

## 4. 调用者与调用链

入向（全树检索，证实）：`ipc.ts:327`（import）；`:3377-3378`（列表过滤：`processHandleFromRuntimeRecord(record)` 后 `isProcessHandleOwnedBySession(handle, input.sessionId)`）、`:3419-3420`（单条查询同判定）。`completeProcessHandle` **全树无生产调用点**（仅 `process-handle.test.ts:42,47` 使用；检索范围=apps+packages 全 `*.ts/*.tsx` 排除本文件与测试）。

出向：类型 `RuntimeProcessRecord`（`./runtime-process-registry`，`:1`）。

## 5. 数据 I/O、读写与副作用

纯函数/纯类型：无 I/O、无全局状态、无副作用（依据：全文读）。并发/幂等：不可变入参返回新对象（`completeProcessHandle` 用 spread `:56`）。

## 6. 分支、失败、取消与恢复

| 分支 | 触发 | 行 |
| --- | --- | --- |
| pending→starting | record.status | 47 |
| exited 附 endedAt | record.status | 49 |
| 可选字段条件出现 | undefined 透传 | 42-44 |
| signal→killed 默认 | exit.status 缺省 | 54 |
| 归属=sessionId+pi | 双条件 | 64-66 |

无异常路径（无 throw）；无取消/恢复概念，依据：纯映射。

## 7. 权限与权威状态

`isProcessHandleOwnedBySession` 是归属过滤（`:64-66`）：只有 runtime==='pi' 的句柄按会话归属过滤（claude 句柄不纳入，推断为产品边界：Pi 会话只管 Pi 进程）。无 sender/role 检查，依据：本文件无 Electron sender 校验；IPC 侧权限在 `ipc.ts` 各 handler。

## 8. 修改影响面

- `ipc.ts:3377-3378,3419-3420` 两处（进程列表/查询 IPC）。
- `ProcessHandle`/`ProcessHandleExit` 被渲染层（preload 类型）间接消费；改形状影响 UI 进程面板。
- `RuntimeProcessRecord` 来自 `runtime-process-registry`：改其字段需同步 `:36-51`。
- 需同步的测试：`process-handle.test.ts`（4 用例，本批）。

## 9. 测试证据

直接测试：`apps/electron/src/main/lib/process-handle.test.ts`（本批，4 用例，逐条见该手册）。真实断言：pending/running/exited 映射（测试 `:28-30`）、shellPid/pid/startTime 保留（`:35-37`）、signal→killed + exitCode→exited（`:43-49`）、归属双条件（`:54-55`）。

未覆盖：`runtime:'claude'` 句柄、`failed` 状态、`exit.status==='failed'`。

NOT_RUN：本轮未运行任何测试/typecheck/构建；断言均为静态读取。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 导出 + 行号/签名 | 已证实 | `:3-66` 逐行读 |
| 映射/完成/归属三分支逻辑 | 已证实 | `:36-66` |
| ipc.ts 两处调用 | 已证实 | `ipc.ts:327,3377-3378,3419-3420` |
| completeProcessHandle 无生产调用 | 已证实 | 全树检索（§4 范围） |
| claude 句柄不纳入归属的产品意图 | 推断 | `:65` 双条件 |
| 运行期行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 8 导出 | §2 | 见表 | covered |
| record→handle 映射 | §3.1 | 36-51 | covered |
| complete 语义 | §3.2 | 53-62 | covered |
| 归属判定 | §3.3, §7 | 64-66 | covered |
| 调用链 | §4 | - | covered |
| 运行期行为 | §9-10 | - | unknown（NOT_RUN） |

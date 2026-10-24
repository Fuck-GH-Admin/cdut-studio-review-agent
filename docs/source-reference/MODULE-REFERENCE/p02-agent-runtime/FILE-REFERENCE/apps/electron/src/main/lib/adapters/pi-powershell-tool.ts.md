---
path: apps/electron/src/main/lib/adapters/pi-powershell-tool.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ad5cdd4c1e697e4cc61702ea22362c51d33ae703
sha256: 0c8770c579d430309b2523b5a61863e4579879c90a26b8f5a51cab6c835a9210
lines: 289
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/adapters/pi-powershell-tool.ts

## 1. 结论与边界

Pi 的 **Windows 原生 PowerShell 工具**（运行时代码）：仅在 Windows 系统组件存在时定义工具；Bash/Git Bash/WSL 不受影响（`apps/electron/src/main/lib/adapters/pi-powershell-tool.ts:236`）。执行层非零退出码保留给调用方、不把 stderr 丢失为 Node 异常；超时/中止时终止直接子进程及 Windows 进程树，close 事件丢失也会在 grace period 后结束工具调用（`:93-95`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `DEFAULT_TIMEOUT_SECONDS` | 导出常量 | 16 | `30` | 默认超时 |
| `PowerShellInvocation`/`PowerShellExecutionResult`/`ExecutePowerShellOptions` | 导出接口 | 21-46 | 结果 extends `CommandExecutionResult`+`output` | 契约 |
| `getWindowsPowerShellPath` | 导出函数 | 49-57 | `(env?, pathExists?): string \| null` | SystemRoot 绝对路径解析 |
| `createPowerShellInvocation` | 导出函数 | 59-64 | `(executable, command)` | `-NoLogo -NoProfile -NonInteractive -ExecutionPolicy Bypass -Command` |
| `terminateWindowsProcessTree` | 导出函数 | 80-91 | `(pid, spawnProcess?)` | `taskkill /T /F` 后台+吞错 |
| `executePowerShellCommand` | 导出异步函数 | 97-222 | `(command, options): Promise<PowerShellExecutionResult>` | 执行引擎 |
| `createWindowsPowerShellToolDefinition` | 导出函数 | 237-289 | `(sdk, cwd, runtimeEnv, options?, sessionId?): ToolDefinition \| undefined` | 工具定义 |

内部：`MAX_TIMEOUT_SECONDS=600`、`MAX_OUTPUT_CHARS=100_000`、`TERMINATION_GRACE_MS=5_000`（`:17-19`）、`clampTimeout`（`:66-69`，1..600 floor）、`appendOutput`（`:71-74`，截断）、`formatPowerShellResult`（`:224-234`，超时/中止/退出码后缀）。

## 3. 内部逻辑与关键流程

- 路径解析（`:49-57`）：`SystemRoot|SYSTEMROOT|WINDIR|windir` → `System32\WindowsPowerShell\v1.0\powershell.exe`，不存在返回 null（**不回退 PATH**）。
- `executePowerShellCommand`（`:97-222`）：spawn 失败→`errorKind:'spawn_error'` 结果（`:116-134`）；`buildResult`（`:146-159`，output=stdout||stdout+stderr）；`stop` 防重入（`:168-181`，`stopping` 标志防重复强杀 pid 复用）；win32 时 `terminateProcessTree`（默认 `terminateWindowsProcessTree`）；`terminationGraceHandle` 兜底 settle（`:178-180`）；timeout→`timedOut=true`、abort→`aborted=true`（`:182-189`）；signal 已 aborted 立即 onAbort（`:191-195`）；`child.on('error')`→spawn_error、`close`→finish（`:207-220`）。
- 工具定义（`:237-289`）：非 win32 或系统组件缺失→undefined；TypeBox 参数 `{command, timeout?}`（`:258-261`）；execute 注册 `registerPendingPiRuntimeProcess`/`piBackgroundTaskManager` 生命周期（begin/append/attachProcess/complete，`:264-282`）；complete 状态映射：aborted|timedOut→'stopped'、errorKind|非零→'failed'、否则 'completed'（`:282`）。

## 4. 调用者与调用链

入向：`apps/electron/src/main/lib/adapters/pi-agent-adapter.ts`、`apps/electron/src/main/lib/execution-service.ts`（import 检索）。出向：`node:child_process`、`node:fs`、`node:path`(win32)、`typebox`、`@earendil-works/pi-agent-core`/`pi-coding-agent`（类型）、`../agent-runtime-env`、`../command-execution`、`../runtime-process-registry`、`../pi-background-task-manager`（均不在本批）。

## 5. 数据 I/O 与副作用

spawn `powershell.exe` 子进程（cwd/env 来自 options）；写进程注册表+后台任务管理器（内存）；taskkill 子进程。无文件写。

## 6. 分支、失败、取消与恢复

- spawn_error→错误结果不抛；超时/中止→进程树终止+grace settle；`stop` 防重入（`:169-172`）；taskkill 失败不影响直接 kill（`:78-79` 注释）。
- 测试注入点：`spawnProcess`/`platform`/`terminateProcessTree`/`pathExists` 均可注入（`:38-41`，mock 边界=这些注入点）。

## 7. 权限与权威状态

工具仅 Windows 定义（`:249` 平台门禁）；命令执行权限由上层 permissionMode 管（本文件无鉴权）。

## 8. 修改影响面

改执行语义影响 PowerShell 工具全部会话；进程注册/后台任务契约与 `../runtime-process-registry` 同步。

## 9. 测试证据

直接测试 `apps/electron/src/main/lib/adapters/pi-powershell-tool.test.ts`（188 行；NOT_RUN）：路径解析不回退 PATH（test:14-24）、参数快照（test:26-31）、win32 真实执行 3 例 `test.skipIf(platform!=='win32')`（test:33-66）、mock 子进程全链（test:68-168）、工具定义命名/参数（test:170-187）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 9 导出（QA N-NB54-02 计数校正）+执行/终止/防重入逻辑 | 已证实 | `:16-289` |
| win32 门禁+不回退 PATH | 已证实 | `:249/:49-57` + test:14-24 |
| Windows 进程树终止可靠性 | 推断 | `:77-78` 注释（taskkill 行为未实测） |
| 真实执行 | 未知 | NOT_RUN（win32 skipIf 用例未跑） |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全部 9 导出+分支 | §2/§3 | covered |
| 测试断言 | §9 | covered |
| 真实执行/运行 | §10 | unknown（NOT_RUN） |

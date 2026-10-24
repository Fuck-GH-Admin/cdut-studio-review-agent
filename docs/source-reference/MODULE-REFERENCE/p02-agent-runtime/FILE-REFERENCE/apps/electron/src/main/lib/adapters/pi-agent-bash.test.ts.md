---
path: apps/electron/src/main/lib/adapters/pi-agent-bash.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7c0bf331e8abf2b88daec4e9ce087d440ea2fa18
sha256: 644d163a7f660c257f8ca78710d97d58a031c0735b89ce43882000699d323128
lines: 329
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/adapters/pi-agent-bash.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

受控 Bash 执行器（`pi-agent-adapter.ts` 导出）：WSL 路径/参数构造、工作目录/Shell 预检、本地/WSL 执行的结构化结果（流回调/输出上限/超时/预中止/参数证据）、`waitForLocalBashProcess` 的 stdio 排空/宽限/截止。

## 2. 用例清单

共 18 个 `test(`（`apps/electron/src/main/lib/adapters/pi-agent-bash.test.ts:22-307`，单一 `describe('Pi WSL Bash')`）。夹具 `fakeChild`（`:6-19`，EventEmitter+PassThrough+kill 计数）。

| # | 用例（行） | 关键断言 |
| --- | --- | --- |
| 1 | Windows 路径→挂载 Linux 路径（`:22`） | `buildWslBashArgs` `toEqual(['--distribution','Ubuntu-24.04','--cd','/mnt/c/Users/alice/Workspace/project','--exec','bash','-lc','pwd'])` |
| 2 | Linux 路径不变（`:40`） | `windowsPathToWslPath` 原样 |
| 3 | cwd 被删→重建（`:44`） | `ensureBashWorkingDirectory` 注入 exists/mkdir；`created` `toEqual(['/Users/alice/.cdutai/session-1'])` |
| 4 | 空 cwd（`:55`） | `toThrow('Bash 工作目录为空')` |
| 5 | 无 shell 路径（`:59`） | `requireLocalBashShellPath(undefined)` 抛 `code:'shell_not_found'` + 消息含 `'未找到可用的 Bash'` |
| 6 | shell 缺失（`:71`） | `executeLocalBashCommand` → `{exitCode:null,errorKind:'shell_not_found',errorCode:'ENOENT'}`，stderr 含 `'profer-bash'`（win32 早退） |
| 7 | cwd 不可用（`:87`） | `working_directory_error`/`ENOENT`/cwd 证据 |
| 8 | WSL spawn 错误（`:104`） | `emit('error',EACCES)` → `{errorKind:'spawn_error',errorCode:'EACCES',stderr:'permission denied'}` |
| 9 | exit 无 close（`:125`） | 两流 end 后 `resolves.toBe(7)` |
| 10 | 继承 stdio 不关（`:140`） | drain grace ≥20ms 后 settle 0 |
| 11 | 本地双流非零（`:153`） | stdout/stderr 各 `'out'/'err'`、流回调一致、`exitCode:7`、`signal:null`、`timedOut/aborted:false`、`shell/cwd` 证据、`truncated:false` |
| 12 | 输出超限（`:181`） | `maxOutputBytes:5` → stdout `'67890'`/stderr `'fghij'`（保尾）+ `truncated:true` |
| 13 | 超时杀进程组（`:195`） | `timeoutMs:25`+`sleep 1` → `signal:'SIGKILL'`、`timedOut:true`、`durationMs<500` |
| 14 | 预中止不 spawn（`:211`） | `onSpawn` 不触发、`aborted:true` |
| 15 | WSL 非零+回调（`:231`） | `onSpawn([4242])`、双流、`toMatchObject` 结构化结果（`shell:'bash'`、`cwd:'C:\\workspace'`） |
| 16 | WSL 预中止（`:269`） | 不 spawn、`aborted:true`、空输出 |
| 17 | WSL 超时强结（`:288`） | launcher 不 close → `timedOut:true`、`child.killed:true` |
| 18 | 退出后持续输出到截止（`:307`） | drain deadline(80ms) 到期 settle 0；`60≤elapsed<200` |

## 3. 真实断言

逐条见上表。mock 边界：WSL 用 `fakeChild`/`spawnProcess` 注入（`:107-108,138`）；本地用例为**真实 `/bin/bash` 子进程**（win32 早退 `:72,88,154`）；`waitForLocalBashProcess` 用 EventEmitter 假子进程。

## 4. 未覆盖与脆弱点

未覆盖：WSL env 导出/`buildWslCommand`、`createControlledLocalBashOperations` 整体、`tacoFilterCommandOutput`、`classifyLocalBashFailure` 全分支、并发执行。计时断言（≥20/60、<200/500）依赖机器时序（潜在脆弱点）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 18 个用例 | 已证实 | `grep test(` |
| 路径/预检/错误分类 | 已证实 | `:22-123` |
| 结构化结果+回调 | 已证实 | `:153-267` |
| 截止/强结/超时 | 已证实 | `:195-229,288-328` |
| 真实 WSL 语义 | 未知 | mock 子进程 |
| 计时断言稳定性 | 未知 | 未运行 |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| WSL 路径/参数 | 1,2 | 22-42 | covered |
| 预检 | 3-5 | 44-69 | covered |
| 启动失败分类 | 6-8 | 71-123 | covered |
| stdio 排空 | 9,10,18 | 125-151,307-328 | covered |
| 本地执行/截断/超时/中止 | 11-14 | 153-229 | covered |
| WSL 执行/中止/强结 | 15-17 | 231-305 | covered |
| 其余导出 | 无 | — | unknown |

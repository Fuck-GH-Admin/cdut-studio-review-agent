---
path: apps/electron/src/main/lib/command-execution.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 03c9518f14aee302d69ab2cfc4dec047c2b63e94
sha256: aaa4f601870708da803bb2478531f332ea2dbc333e589207a84af4050973fd11
lines: 71
kind: source
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/command-execution.ts

## 1. 结论与边界

**命令执行共享类型与工具**（71 行）：结构化 exec 请求/结果形状+失败构造（spawn 前/中失败的稳定语义分类 `:27`）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `CommandExecutionErrorKind` | `:1-4` | 'shell_not_found'\|'working_directory_error'\|'spawn_error' |
| `StructuredExecRequest` | `:6-14` | command/cwd/shell/env?/timeoutMs?/signal?/maxOutputBytes? |
| `CommandExecutionResult` | `:16-31` | stdout/stderr/exitCode/signal/timedOut/aborted/durationMs/truncated/**errorKind?/errorCode?** |
| `CommandExecutionFailureInput` | `:33-40` | 失败输入 |
| `commandExecutionErrorCode` | `:42-48` | 取 error.code 或 cause.code，兜底 'UNKNOWN' |
| `createCommandExecutionFailure` | `:50-65` | 失败结果工厂 |
| `CommandExecutionCallbacks` | `:67-71` | onStdout/onStderr/onSpawn 流回调 |

## 3. 内部逻辑与关键流程

纯类型+两工厂函数。

## 4. 调用者与调用链

`execution-service.ts`（同批）等 shell 执行层。

## 5. 数据 I/O、读写与副作用

纯函数。

## 6. 分支、失败、取消与恢复

errorCode 双层取值（直接/cause）。

## 7. 权限与权威状态

**稳定语义分类契约**（`:27`）：pre-spawn/spawn 失败分类供上层决策。

## 8. 修改影响面

改类型影响执行服务契约（execution-service 联动）。

## 9. 测试证据

无直接测试（execution-service.test 间接）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件 | 已证实 | 71 行全读 |
| 实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；实效 unknown。

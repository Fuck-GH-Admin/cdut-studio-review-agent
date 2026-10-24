---
path: apps/electron/src/main/lib/execution-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0f27c9a84063f85ba8c5ab34bddde22c215a2cb5
sha256: 5b64641d83abcb5b3557eec2179ebe4533abcb1a6e32e012df09d965f8c3d340
lines: 165
kind: source
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/execution-service.ts

## 1. 结论与边界

**Pi/Claude 共用最小执行契约**（165 行）："Pi 用 createPiExecutionService；Claude 注入自己的 SDK-backed execute，只复用句柄/取消/结果归档，不接管 Claude SDK 的 process lifecycle"（`:92-95`）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `ExecutionRequest`/`ExecutionSnapshot`/`ExecutionService` | `:8-14`/`:16-19`/`:21-25` | 扩展 StructuredExecRequest+句柄三方法（execute/cancel/get） |
| `PiExecutionServiceOptions` | `:32-35` | 可注入 execute（Claude 复用点） |
| `createExecutionService` | `:97-161` | 主实现：句柄生命周期（starting→running→exited/failed/killed `:128`）+abort 转发+结果归档（active/completed 双 Map） |
| `createPiExecutionService` | `:163-165` | Pi 别名 |

内部：`launcherFor:37-43`（wsl/powershell/bash 判定）、`isPowerShellRequest:45`、`createPiExecutor:49-90`（三路分派：PowerShell/WSL（缺 runtimeEnv 失败 `:66-72`）/本地 bash）。

## 3. 内部逻辑与关键流程

execute：随机 handleId→AbortController（外部 signal 转发 `:120-121`）→注入/默认 executor→状态归一（aborted/timedOut/signal→killed、errorKind→failed `:128`）→finally 归档。

## 4. 调用者与调用链

Pi shell 工具/Claude SDK 执行层；出向 pi-agent-adapter/pi-powershell-tool/command-execution/process-handle。

## 5. 数据 I/O、读写与副作用

子进程执行（adapter 层）；内存 Map。

## 6. 分支、失败、取消与恢复

executor throw→createCommandExecutionFailure（spawn_error）归一；cancel 走 AbortController。

## 7. 权限与权威状态

**runtime-neutral 契约**（`:92-95`）：不接管 SDK 生命周期只归档；launcher 判定单一裁决。

## 8. 修改影响面

改状态归一影响进程面板；注入点是 Claude 复用契约。

## 9. 测试证据

`execution-service.test.ts`（同批，2 个 `test(`）：注入 executor 结果保留+pid、取消 killed 快照。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（照实记录）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件/共用契约/状态归一 | 已证实 | 165 行全读（主根自读兜底） |
| 行为锁定 | 已证实 | 测试 2 用例 |
| **照实**：`:109` `request.sessionId ?? ''`（类型必填却兜底空串） | 已证实 | `:109` |
| adapter 实现 | 未知 | 不在本批 |
| 实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；测试 §9。

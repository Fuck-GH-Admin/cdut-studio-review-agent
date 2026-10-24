---
path: apps/electron/src/main/lib/agent-runtime-env.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9b1de4308bef1dfbd9916294628ed59a354177b7
sha256: ae7d704417d37592850a979ed8e9fe32951fb8e20ef8de8d060d7b36ef806e6d
lines: 282
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-runtime-env.ts

## 1. 结论与边界

Agent 运行时 env 组装（Bash 工具的 PATH/代理/Windows shell 环境）：环境加载 shell 与执行 shell 分离（:78-87 注释：macOS zsh 不得隐式带入 Bash 工具）；`shellPath` 仅是执行器、**不覆盖 env.SHELL**（:278-279 注释）。

## 2. 导出与关键符号

导出 8 条（`export` :6/:8/:16/:61/:73/:88/:203/:229）：

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `AgentRuntimeShellKind` | `:6` | 'posix'\|'git-bash'\|'wsl' |
| `AgentRuntimeEnv` | `:8-14` | env+shellKind?/shellPath?/wslCommand?/wslDistro? |
| `BuildAgentRuntimeEnvOptions` | `:16-25` | proxyUrl/runtimeStatus/bundledCliPath/processEnv/platform/pathDelimiter/pathExists/shellPreference（后 5 个为可注入依赖） |
| `prependPathEntry` | `:61-71` | 前置 PATH 项去重（win32 大小写不敏感 :53-59） |
| `dirnameForPlatform` | `:73-75` | win32 用 win32.dirname |
| `resolvePosixShellPath` | `:88-103` | /bin/bash、/usr/bin/bash+PATH 拼 bash 候选，返回首个存在者（注释 :85-86：防 GUI PATH 致 ENOENT） |
| `mergeRuntimeEnv(base, override)` | `:203-227` | 大小写感知合并（`CASE_INSENSITIVE_MERGE_KEYS` :28-39：path/proxy/shell 系先删后写） |
| `buildAgentRuntimeEnv(options)` | `:229-282` | 主组装（见 §3） |

内部：`collectProxyEnv`（:105-128，双写大小写键 :108-111）、`getWslCommandPath`（:130-143，System32/Sysnative 候选+`wsl.exe` 兜底）、`collectWindowsShellEnv`（:145-201，见 §3）。

## 3. 内部逻辑与关键流程

`buildAgentRuntimeEnv`（:229-282）：PROFER_CLI（:237-239）→PATH 双前置（bundledCli 目录+Bun 目录 :247-257，注释 :242-243：Pi 每次 Bash 合并 env 不能只靠主进程 PATH）→代理（:262）→win32 分支（:264-274）/posix（:280-281）。
`collectWindowsShellEnv`（:145-201）：偏好 git-bash 可用→用之（:156-162）；wsl 可用→wsl.exe+可选 PROFER_WSL_DISTRO（:164-173）；auto/fallback 优先 Git Bash>WSL（:177-198）；都不可用→空 env（:200）。写 PROFER_WINDOWS_SHELL/CLAUDE_CODE_SHELL/SHELL 三键。

## 4. 调用者与调用链

入向（子agent 交叉核）：生产 `lib/agent-orchestrator.ts:179`（buildAgentRuntimeEnv :2062，processEnv=mergeRuntimeEnv(process.env, piShellSnapshot.env) :2065→piRuntimeEnv→adapter runtimeEnv :2189、shellPath :2068、proxy 判定 :2420）、`lib/adapters/pi-agent-adapter.ts:73`（mergeRuntimeEnv :1639/:2303）、`lib/adapters/pi-powershell-tool.ts:7-8`（:112）、`lib/execution-service.ts:2`（type-only）；测试 `agent-runtime-env.test.ts:3`。出向：`node:fs`（existsSync）、`node:path`、`@profer/shared`（RuntimeStatus）、`./config-paths`（getBundledCliPath :234）。

## 5. 数据 I/O、读写与副作用

无磁盘写；existsSync 探测；纯 env 对象组装。

## 6. 分支、失败、取消与恢复

Windows shell 偏好/可用性矩阵（:155-200）；合并大小写二分支（:214-219）。不适用取消/恢复。

## 7. 权限与权威状态

shell 语义权威（:78-87）：Bash 工具必须用 bash 执行，不随用户 login shell 漂移。

## 8. 修改影响面

orchestrator/adapter/powershell-tool 的 spawn env；需同步测试 `agent-runtime-env.test.ts`（92 行）。

## 9. 测试证据

`agent-runtime-env.test.ts`（批内，92 行，断言细节见手册 `agent-runtime-env.test.ts.md`）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 8 条；shell 分离边界 | 已证实 | :78-87/:276-281 |
| Windows 三 shell 矩阵 | 已证实 | :145-201 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 8 导出+组装链 | §2/§3 | :61-282 | covered |
| 测试 | §9 | — | covered（NOT_RUN，姊妹手册） |

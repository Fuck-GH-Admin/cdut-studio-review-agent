---
path: apps/electron/src/main/lib/shell-snapshot.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 479f11337926efed57fc415e0801b2b53d0ac443
sha256: 4c8820229601ee7eba91bd5dd7cc5190c17f7505c45b13c7eebaa08ac5c2ce6a
lines: 228
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/shell-snapshot.ts

## 1. 结论与边界

Shell 环境快照：按 `{sessionId,cwd,shell}` 捕获净化后的环境、PATH 条目与关键命令路径（bash/sh/bun/node/git/tr），持久化为 JSON 并可复用/重建。敏感变量（API key/token/密码/私钥/Cookie/Bearer/Webhook 正则 + 代理变量黑名单）**永不入快照**（`:50-59,80-87`）。

## 2. 导出与关键符号

`export` 逐条核对：1 个 type + 4 个接口 + 6 个函数 = 11 个导出（类/常量导出 0；`:62` `__setShellSnapshotRootForTest` 计入函数）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ShellKind` | type（导出） | 7 | bash/zsh/sh/powershell/cmd/git-bash/wsl |
| `ShellDescriptor` | 接口（导出） | 9-14 | `{kind,path,login,source:'detected'\|'configured'\|'fallback'}` |
| `ShellSnapshot` | 接口（导出） | 16-29 | `{id,sessionId,cwd,shell,env,pathEntries,commandPaths,envHash,createdAt,capturedAt,source,version:1}` |
| `CaptureShellSnapshotOptions` | 接口（导出） | 31-42 | 全可注入（platform/processEnv/shell/source/persist/snapshotRoot/now/getLoginEnv） |
| `GetShellSnapshotOptions` | 接口（导出） | 44-46 | +`rebuild?` |
| `__setShellSnapshotRootForTest` | 函数（导出） | 62-64 | 测试根注入 |
| `sanitizeShellEnvironment` | 函数（导出） | 80-87 | 净化（undefined/黑名单/敏感正则剔除） |
| `captureShellSnapshot` | 函数（导出） | 135-174 | 捕获+可持久化 |
| `persistShellSnapshot` | 函数（导出） | 189-202 | 原子写（tmp+rename） |
| `getOrCreateShellSnapshot` | 函数（导出） | 204-224 | 复用/校验/重建 |
| `rebuildShellSnapshot` | 函数（导出） | 226-228 | 强制重建 |
| `COMMANDS`/`SENSITIVE_ENV_KEY`/`EXCLUDED_ENV_KEYS` | 内部 | 49-59 | 命令清单/敏感正则（API[_-]?KEY、TOKEN、PASSWORD、SECRET、PRIVATE[_-]?KEY、CREDENTIAL、COOKIE、BEARER、WEBHOOK）/显式黑名单（ANTHROPIC_*、AWS_SECRET_ACCESS_KEY、GITHUB_TOKEN、代理三变量） |
| `snapshotPath`/`getEnvValue`/`inferShell`/`pathEntriesFor`/`resolveCommandPath`/`stableHash`/`isSnapshot` | 内部 | 70-187 | sha256({sessionId,cwd,shell}) 文件名；大小写不敏感 env 取值；平台 shell 推断；PATH 拆分；命令路径探测（win32 补 .exe/.cmd/.bat）；稳定 hash（env 键排序）；快照形状校验 |

## 3. 内部逻辑与关键流程

### 3.1 捕获（`captureShellSnapshot`，`:135-174`）

shell 未给则 `inferShell`（win32→powershell System32 路径 `fallback`；POSIX→`SHELL` env 或 darwin `/bin/zsh`/else `/bin/sh`，`:89-104`）。非 win32 且 `shell.login`：`getLoginEnv ?? getShellEnv(shell.path)` 合并后净化、`source='login-shell'`；失败降级 `process.env` 并 warn（`:142-150`）。`pathEntries`（平台分隔符）→ `commandPaths`（6 命令逐一探测）→ payload + `envHash=stableHash`（排除 id/时间戳，env 键排序，`:121-133`）→ `persist!==false` 时持久化。

### 3.2 持久化（`:189-202`）

`<root>/<sha256({sessionId,cwd,shell})>.json`；**tmp+rename 原子写**（`:191-195`）；失败 warn+清 tmp+返回 false（内存快照继续用）。

### 3.3 复用/重建（`:204-228`）

非 rebuild：读 JSON → `isSnapshot` 形状校验 + `sessionId/cwd` 匹配 + `envHash===stableHash(parsed)`（完整性）→ 复用；任何异常走重建（首次/旧版/损坏都不阻断 Agent turn，`:213-215` 注释）；重建失败返回 `undefined`（执行层回退临时环境，`:220-223`）。

## 4. 调用者与调用链

入向：shell 执行层环境装配（pi-agent-bash/执行器消费 `shell`/`env`/`commandPaths`）；测试：`shell-snapshot.test.ts`（85 行，本批）。出向：`node:crypto/fs/path`、`./config-paths.ts:4`、`./shell-env.ts:5`（`getShellEnv`）。

## 5. 数据 I/O、读写与副作用

- 写：`<configDir>/shell-snapshots/<hash>.json`（原子写）；读：同。
- 子进程：login shell env 提取（经 `getShellEnv`，可注入）。
- 副作用：`console.warn`；不改 `process.env`。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| login shell 失败 | 降级 process.env | 147-149 |
| 持久化失败 | false+内存继续 | 197-201 |
| 快照缺失/损坏/hash 失配 | 重建 | 208-216 |
| 重建失败 | `undefined`（回退临时环境） | 220-223 |
| rebuild | 强制重建 | 226-228 |

## 7. 权限与权威状态

- 敏感变量权威=净化层（正则+黑名单双过滤，`:80-87`）——快照**不含**密钥/代理凭据。
- 完整性权威=`envHash` 稳定 hash 校验（`:211-212`）。

## 8. 修改影响面

改净化/探测影响 shell 执行环境与安全；改 hash 算法导致旧快照失效重建（兼容有版本字段）。

## 9. 测试证据

直接测试：`shell-snapshot.test.ts`（85 行，详见其手册）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 敏感净化（正则+黑名单） | 已证实 | `:50-59,80-87` |
| 原子写 | 已证实 | `:191-195` |
| envHash 完整性校验 | 已证实 | `:121-133,211-212` |
| 降级/回退语义 | 已证实 | `:147-149,213-223` |
| 真实 login shell | 未知 | 可注入/未运行 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 净化/推断/探测 | §2,§3.1 | 49-119 | covered |
| 捕获 | §3.1 | 135-174 | covered |
| 持久化 | §3.2 | 189-202 | covered |
| 复用/重建 | §3.3 | 204-228 | covered |
| 断言 | §9,§10 | — | 见测试手册 |

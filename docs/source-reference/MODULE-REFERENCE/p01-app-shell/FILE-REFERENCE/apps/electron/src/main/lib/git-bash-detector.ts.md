---
path: apps/electron/src/main/lib/git-bash-detector.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 09e063aec9886987ffd83eb0b99bda329b91b46c
sha256: 2061ecbc46238fbd96aa490d8ba1ccb683590238935c4229d584e31400a734cd
lines: 198
kind: source
package: p01-app-shell
author: docs-r07-author-extra-01-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/git-bash-detector.ts

## 1. 结论与边界

**Windows Git Bash 环境检测**（198 行）：按「常见安装路径 → 注册表 → PATH」三级策略定位 `bash.exe` 并解析版本，返回 `GitBashStatus` 供运行时初始化（shell 推荐：Git Bash > WSL）使用。

边界：只检测 bash.exe 可执行文件与版本，不检测 WSL（`detectWsl` 域外）、不执行任何 bash 脚本；非 Windows 平台直接返回不可用。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `detectGitBash` | 导出函数 | 128-198 | `(): Promise<GitBashStatus>` | 唯一导出（async 但内部全同步） |
| `getCommonGitBashPaths` | 内部函数 | 26-55 | `(): string[]` | 候选路径清单（调用时读 `process.env`） |
| `verifyBashPath` | 内部函数 | 63-86 | `(bashPath): string\|null` | 存在性 + `--version` 解析 |
| `findBashInPath` | 内部函数 | 93-116 | `(): string\|null` | `where bash` 取路径 |

导出计数：`export` 1 条（`:128`），与源码一致。

## 3. 内部逻辑与关键流程

- **平台门禁**（`:130-137`）：`process.platform !== 'win32'` → 返回 `{available:false, path:null, version:null, error:'非 Windows 平台'}`。
- **策略 1 常见路径**（`:139-151`）：`getCommonGitBashPaths()` 顺序：`$SCOOP/apps/git/current/{bin,usr/bin}/bash.exe`（`:33-38`）→ `$LOCALAPPDATA/scoop/apps/git/current/{bin,usr/bin}/bash.exe`（`:39-44`）→ `ProgramFiles\Git\{bin,usr\bin}\bash.exe` 与 x86 硬编码两条（`:46-52`；`ProgramFiles` 缺省 `C:\Program Files`，`:30`）。逐个 `verifyBashPath`，命中即返回。注释（`:24`）：调用时读 env 以确保 `loadWindowsEnv()` 后路径完整。
- **策略 2 注册表**（`:153-173`）：`getGitForWindowsInstallPath()`（域外 `windows-env.ts:57-65`，`reg query` HKLM→HKCU `SOFTWARE\GitForWindows\InstallPath`）→ 候选 `<install>/bin/bash.exe`、`<install>/usr/bin/bash.exe` 逐个验证。
- **策略 3 PATH**（`:175-188`）：`findBashInPath()`（`where bash` 输出按行拆，优先含 `git`（忽略大小写）的路径，否则取第一个，`:101-112`）再 `verifyBashPath`。
- **verifyBashPath**（`:63-86`）：`existsSync` 失败→null；`execSync('"path" --version', {timeout:5000})` 输出匹配 `/version\s+(\S+)/`，取第一捕获组并截掉 `(` 后缀（如 `5.2.15(1)-release` → `5.2.15`，`:75-79`）；无匹配或任何异常→null。
- **全部失败**（`:190-197`）：`console.warn` + `{available:false, path:null, version:null, error:'未找到 Git Bash 环境，请安装 Git for Windows'}`。
- 命中路径均打 `console.log`（`:143`、`:164`、`:180`，标注来源策略）。

## 4. 调用者与调用链

- 入向（全冻结树 `grep git-bash-detector|detectGitBash`，apps+packages 全文件类型）：
  - `apps/electron/src/main/lib/runtime-init.ts:17` import；`:108` 缓存增量重检（`gitBashMissing ? await detectGitBash() : cached.shell!.gitBash`）；`:229` 全量初始化 `const gitBashStatus = await detectGitBash()`（仅 win32 且未 skipShellDetection，`:226-228`）。
- 出向：`node:child_process.execSync`（`:15`）、`node:fs.existsSync`（`:16`）、`node:path.join`（`:17`）、`@profer/shared` 类型 `GitBashStatus`（`:18`）、`./windows-env` 的 `getGitForWindowsInstallPath`（`:19`）。
- 动态调用：无字符串拼接模块调用；`execSync` 的命令字面量已列（`"bash" --version`、`where bash`）。

## 5. 数据 I/O、读写与副作用

- 输入：无参数（读 `process.env.SCOOP/LOCALAPPDATA/ProgramFiles`、`process.platform`）；输出 `GitBashStatus`。
- 磁盘读：`existsSync` 路径探测；不写盘。
- 网络：无。
- 副作用：`execSync` 同步子进程（`bash --version` 最多 5s、`where bash` 最多 5s，阻塞主线程）；`reg query`（经 `windows-env`，同样 execSync）；console 日志。

## 6. 分支、失败、取消与恢复

- 三级策略依次短路，命中即返回（`:140-188`）。
- `verifyBashPath`/`findBashInPath` 全部 try/catch → 失败返回 null，不抛（`:83-85`、`:113-115`）；`detectGitBash` 本身无 throw 路径。
- 取消：无（同步）；`execSync` 超时 5000ms 由 Node 抛错→catch→null。
- 恢复/重试：无状态、无缓存；每次调用全量重跑（`runtime-init` 侧负责缓存与增量重检节奏，域外）。
- 不可恢复点：无；「未找到」即最终状态（返回 error 文案）。

## 7. 权限与权威状态

- 无权限分支，依据：本文件无 sender/role 检查；结果只被主进程运行时初始化消费。
- 权威状态：`GitBashStatus.available` 以「能执行 `--version` 且解析出版本」为唯一判据（`:63-86`），版本字符串解析自 stdout 正则，非结构化接口。

## 8. 修改影响面

- 消费方：`runtime-init.ts:108/229`（shell 环境检测与推荐策略 `git-bash` 优先，`runtime-init.ts:231-235`）；改返回形状影响 `ShellEnvironmentStatus`（`@profer/shared`）。
- 候选路径/注册表键变化影响新装 Git 的识别（`windows-env.ts:57-65` 配套）。
- `verifyBashPath` 的版本正则对非常规 `bash --version` 输出（无 `version` 关键词）返回 null → 整条路径判不可用。

## 9. 测试证据

- 直接测试：**无**。检索范围：冻结树全文件 `grep git-bash-detector|detectGitBash`，仅 `runtime-init.ts` 消费，无 `*.test.ts` 引用。
- 间接证据：无。
- `NOT_RUN`：未运行任何测试；Windows 实机检测 NOT_RUN（本机非 Windows，检测路径未执行）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 三级检测顺序与每级候选路径 | 已证实 | `:26-55`、`:128-188` |
| 非 win32 短路返回 | 已证实 | `:130-137` |
| 版本解析正则与截断规则 | 已证实 | `:74-80` |
| 5s execSync 超时、异常→null | 已证实 | `:68-72`、`:83-85` |
| 调用者仅 runtime-init 两处 | 已证实 | 全冻结树检索（§4 范围） |
| `where bash` 多行优先含 'git' | 已证实 | `:101-112` |
| Windows 真机实际检出 | 未知 | NOT_RUN |
| `loadWindowsEnv()` 时序影响 | 推断 | 仅注释（`:24`）说明，shell-env 实现域外 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `detectGitBash` 主流程 | §3 | 128-198 | covered |
| `getCommonGitBashPaths` | §3 | 26-55 | covered |
| `verifyBashPath` | §3/§6 | 63-86 | covered |
| `findBashInPath` | §3 | 93-116 | covered |
| 三策略短路/失败路径 | §3/§6 | 139-197 | covered |
| 注册表策略 | §3 | 153-173 | covered（依赖域外实现） |
| 真机检出效果 | §10 | — | unknown（NOT_RUN） |

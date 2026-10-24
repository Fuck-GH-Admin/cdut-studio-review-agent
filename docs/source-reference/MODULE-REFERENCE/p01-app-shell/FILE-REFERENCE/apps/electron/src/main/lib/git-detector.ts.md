---
path: apps/electron/src/main/lib/git-detector.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b848eb24828269e1e9ec1ca59ef2246d0d2ee785
sha256: 3ea0abbec906a864ebc67762b93ac50eb1793beaf3e667ea36956f0b8f46cf14
lines: 319
kind: source
package: p01-app-shell
author: docs-r07-author-extra-01-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/git-detector.ts

## 1. 结论与边界

**Git 运行时检测**（319 行）：定位 git 可执行文件（PATH→注册表→包管理器→内置 MinGit）、获取版本、查询任意目录的 Git 仓库状态（分支/脏工作区/remote），另有 Windows Git Bash 路径检测 `detectGitBashWindows`。

边界：不做 diff/提交等仓库操作（`git-diff-service.ts` 负责）；`getGitRepoStatus` 只读元信息；不含 WSL/Node/Bun 检测（`runtime-init` 组合其他 detector）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `findGitPath` | 导出函数 | 18-107 | `(): string\|null` | 定位 git 可执行文件 |
| `detectGitRuntime` | 导出函数 | 140-174 | `(): Promise<GitRuntimeStatus>` | Git 可用性+版本 |
| `getGitRepoStatus` | 导出函数 | 213-247 | `(dirPath: string): Promise<GitRepoStatus\|null>` | 目录仓库状态 |
| `detectGitBashWindows` | 导出函数 | 254-319 | `(): string\|null` | Windows bash.exe 路径 |
| `getGitVersion` | 内部函数 | 115-133 | `(gitPath): string\|null` | `spawnSync git --version` 解析 |
| `runGitCommand` | 内部函数 | 183-205 | `(args, cwd): string\|null` | `spawnSync('git', ...)`，10s 超时 |

导出计数：`export` 4 条（`:18`、`:140`、`:213`、`:254`），与源码一致。

## 3. 内部逻辑与关键流程

- **findGitPath**（`:18-107`）：
  1. `where git`（win32）/`which git`（其余），5s 超时，取第一行且 `existsSync` 通过即返回（`:20-32`）；异常→落入 Windows 兜底（`:33-35`）。
  2. 仅 win32 追加候选（`:38-104`）：注册表 `getGitForWindowsInstallPath()` 的 `<root>/{cmd,bin}/git.exe`（`:42-48`）；scoop `$SCOOP/apps/git/current/{cmd,bin}/git.exe` + `$SCOOP/shims/git.exe`（`:55-61`）；`$LOCALAPPDATA/scoop/...`（`:62-67`）；Chocolatey `C:\ProgramData\chocolatey\bin\git.exe`（`:70-72`）；官方安装器 `ProgramFiles\Git\{cmd,bin}\git.exe` + x86 两条（`:74-80`）。
  3. 内置 MinGit（`:88-103`）：`require('electron').app.isPackaged` → `process.resourcesPath/bin/git/cmd/git.exe`，否则 `__dirname/../../resources/bin/git/cmd/git.exe`（`:90-93`）；require 抛错（非 Electron）回退 `process.cwd()/resources/bin/git/cmd/git.exe`（`:97-103`）。
  4. 全无 → null（`:106`）。
- **getGitVersion**（`:115-133`）：`spawnSync(gitPath, ['--version'], {timeout:5000})`；status 0 且有 stdout → 正则 `/git version (\d+\.\d+\.\d+)/` 取版本，无匹配则返回整个 trim 后的 stdout（`:125-126`）；否则 null。
- **detectGitRuntime**（`:140-174`）：无路径 → `{available:false, version:null, path:null, error:'未找到 Git。请安装 Git 后重试。'}`（`:145-153`）；有路径无版本 → `{available:false, version:null, path:gitPath, error:'Git 已找到但无法执行'}`（`:157-165`）；成功 → `{available:true, version, path, error:null}`（`:167-173`）。
- **runGitCommand**（`:183-205`）：`spawnSync('git', args, {cwd, timeout:10000, env:{...process.env, GIT_TERMINAL_PROMPT:'0'}})`；status 0 → `stdout.trim()`，否则/异常 → null。**注意用裸 `git`（PATH 解析），不是 `findGitPath()` 的结果**。
- **getGitRepoStatus**（`:213-247`）：目录不存在 → null（`:215-217`）；`rev-parse --is-inside-work-tree` ≠ `'true'` → `{isRepo:false, branch:null, hasChanges:false, remoteUrl:null}`（`:220-229`）；否则依次 `rev-parse --abbrev-ref HEAD`（分支）、`status --porcelain`（非空即 `hasChanges=true`，`:235-236`）、`config --get remote.origin.url`（`:239`）；null 命令输出各自回退为 null/false。
- **detectGitBashWindows**（`:254-319`）：非 win32 → null（`:255-257`）；候选顺序：注册表 `<root>/{bin,usr/bin}/bash.exe`（`:261-268`）→ scoop 两条+LOCALAPPDATA（`:273-286`）→ 官方安装器 3 条（`:288-293`）；逐个 `existsSync` 命中返回（`:295-299`）；最后 `where bash` 取第一行（`:301-316`）。

## 4. 调用者与调用链

- 入向（全冻结树 `grep git-detector'|findGitPath|detectGitRuntime|getGitRepoStatus|detectGitBashWindows`，apps+packages 全文件类型）：
  - `runtime-init.ts:16` import `detectGitRuntime, getGitRepoStatus`；`:83` 全量检测、`:222`（skipGitDetection 分支旁）、`:332` `export { getGitRepoStatus } from './git-detector'`（转出口）。
  - `apps/electron/src/main/ipc.ts:132` 从 `./lib/runtime-init` import `getGitRepoStatus`；`:1376` 在 `IPC_CHANNELS.GET_GIT_REPO_STATUS`（`git:get-repo-status`，`packages/shared/src/types/runtime.ts:368`）handler 中 `return getGitRepoStatus(dirPath)`（入参仅做 `typeof dirPath === 'string'` 校验，`:1371-1374`，**无路径授权检查**）。
  - `environment-checker.ts:9` import `detectGitRuntime`；`:87` 环境体检并发项。
  - `pi-checkpoint-git.ts:4` import `findGitPath`；`:42` 缓存解析 `cachedGitPath = findGitPath()`。
  - `pi-execution-ledger.integration.test.ts:6` import `detectGitBashWindows`；`:8-9` 仅作测试环境 shell 选择（win32→`detectGitBashWindows()`，否则 `/bin/bash`），**不对其行为做断言**（间接）。
  - 渲染链路：`preload/index.ts:295/2134` `getGitRepoStatus` 桥接 → `useGlobalAgentListeners.ts:645` `window.electronAPI.getGitRepoStatus(dirPath)`。
- 出向：`child_process.execSync/spawnSync`、`fs.existsSync`、`path.join`（`:7-9`）、`./windows-env.getGitForWindowsInstallPath`（`:11`）、`@profer/shared` 类型（`:10`）。

## 5. 数据 I/O、读写与副作用

- 输入：`findGitPath`/`detectGitRuntime`/`detectGitBashWindows` 无参（读 `process.env`/`process.platform`）；`getGitRepoStatus(dirPath)`。
- 磁盘：仅 `existsSync` 探测；不写盘。
- 网络：无（git 命令只在本地仓库执行，`GIT_TERMINAL_PROMPT=0` 禁止交互提示，`:193`）。
- 副作用：同步子进程（`execSync`/`spawnSync`，5s/10s 超时，阻塞主线程）；console 日志（`:141`、`:146`、`:158`、`:167`）。

## 6. 分支、失败、取消与恢复

- `findGitPath`：命令失败/超时 → catch 静默（`:33-35`）；每个候选 `existsSync` 门禁；全部失败→null。
- `getGitVersion`：status≠0 / 无 stdout / 异常 → null（`:128-132`）。
- `getGitRepoStatus`：每个 git 子命令失败单独回退（分支 null、hasChanges=false、remoteUrl null）；命令执行异常（runGitCommand catch）同样回退 null（`:200-204`）。
- 取消：无（全部同步 API）。
- 恢复：无状态无缓存；每次调用全量执行。不可恢复点：无——最坏返回 null/`available:false`。
- 边界：`getGitRepoStatus` 目录不存在返回 `null`，而「非仓库」返回结构化 `isRepo:false`（`:215-229`），调用方需区分两种「空」。

## 7. 权限与权威状态

- 本文件无 sender/role 检查；`getGitRepoStatus` 的 IPC handler（`ipc.ts:1370-1377`）也**没有路径授权**（对比 `git:get-unstaged-changes` 等有 `ensurePathAllowed`）——任何 renderer 传入的绝对路径都会被 `git` 读取元信息（照实记录，已在 §10 标注）。
- 权威状态：`GitRuntimeStatus`/`GitRepoStatus`（`@profer/shared` 类型）由本文件实测产生（存在性+可执行性），`runtime-init` 另做磁盘缓存（域外）。

## 8. 修改影响面

- `runtime-init.ts`：运行时状态缓存与增量重检（`:83`、`:108` 附近 shell 分支）；`getGitRepoStatus` 经 `runtime-init.ts:332` 转出口供 `ipc.ts` 使用。
- IPC `git:get-repo-status` 返回形状 `GitRepoStatus|null`（`preload/index.ts:295`、`useGlobalAgentListeners.ts:645`）。
- `pi-checkpoint-git.ts:42` 依赖 `findGitPath` 结果执行 git（改解析逻辑影响 Pi 检查点 git 操作）。
- `pi-execution-ledger.integration.test.ts:8-9` 在 win32 上依赖 `detectGitBashWindows` 找测试 shell。
- 需同步修改的测试：`pi-execution-ledger.integration.test.ts`（仅环境装配）。

## 9. 测试证据

- 直接测试：**无专属测试文件**（检索范围：冻结树全文件 `grep git-detector'|findGitPath|detectGitRuntime|getGitRepoStatus|detectGitBashWindows`）。
- 间接证据：`pi-execution-ledger.integration.test.ts`（93 行，bun:test，NOT_RUN）在模块加载时调用 `detectGitBashWindows()` 选 shell（`:6-9`），无关于本文件行为的断言。
- 未覆盖：4 个导出的全部分支（路径候选、版本解析、repo 状态三分支）均无测试。
- `NOT_RUN`：未运行 bun test/产品测试/typecheck/build/GUI/Windows 实机；测试断言≠已运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 导出签名/返回形状 | 已证实 | `:18-319` |
| findGitPath 候选顺序（PATH→注册表→scoop/choco→官方→MinGit） | 已证实 | `:20-104` |
| runGitCommand 用裸 `git` 而非 findGitPath 结果 | 已证实 | `:185` 对比 `:143` |
| `git:get-repo-status` handler 无路径授权 | 已证实 | `ipc.ts:1370-1377` |
| MinGit require 失败回退 cwd 路径 | 已证实 | `:88-103` |
| 版本解析兜底返回整段 stdout | 已证实 | `:125-126` |
| Windows 真机候选命中情况 | 未知 | NOT_RUN |
| runtime-init 磁盘缓存交互 | 推断 | 调用点已核，缓存实现域外未逐行读 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `findGitPath` 全候选分支 | §3/§6 | 18-107 | covered |
| `getGitVersion` | §3 | 115-133 | covered |
| `detectGitRuntime` 三态 | §3/§6 | 140-174 | covered |
| `getGitRepoStatus` 分支 | §3/§6 | 213-247 | covered |
| `detectGitBashWindows` 候选链 | §3 | 254-319 | covered |
| `runGitCommand` | §3/§5 | 183-205 | covered |
| IPC 无授权面 | §7 | ipc.ts:1370-1377 | covered |
| 真机/运行行为 | §10 | — | unknown（NOT_RUN） |

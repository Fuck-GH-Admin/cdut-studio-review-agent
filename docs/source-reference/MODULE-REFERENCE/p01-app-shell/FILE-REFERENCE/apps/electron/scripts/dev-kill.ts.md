---
path: apps/electron/scripts/dev-kill.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0d7ac4017a03a399ce6da96e9769fbdd2b7d2c4e
sha256: 6cdfa1f8318eb3a94026fd502735cebb4aab67ae7398e7c4f63def2b4240d71d
lines: 198
kind: source
package: p01-app-shell
author: docs-r07-author-extra-02-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/scripts/dev-kill.ts

## 1. 结论与边界

跨平台清理残留 electronmon/Electron 开发进程的脚本（198 行，替代 Windows 不支持的 pkill，`apps/electron/scripts/dev-kill.ts:1-4`）：先杀 supervisor 再杀 Electron 树，最后清开发版 userData 的 Chromium 单实例锁；`--vite` 时额外清理 5174 端口残留（仅应在 concurrently 拉起 dev:vite 前跑一次，勿在 dev:electron 内跑以免误杀本次 vite，`:8-10`）。边界：只杀「当前仓库工作区内」的进程（按命令行包含 workspace 路径过滤），绝不按所有 node.exe/Profer.exe 宽泛匹配（`:6`）；不清理正式版目录。

## 2. 导出与关键符号

无导出（CLI）。参数：`--vite`（`process.argv.includes('--vite')`，`:19`）。内部常量：`isWin`（`:18`）、`VITE_PORT = 5174`（内部，`:21`，注释绑定 vite.config.ts 的 server.port）。

内部函数：
- `kill(pattern)`（内部，`:23-35`）：Windows `taskkill /F /IM <pattern>`，Unix `pkill -f '<pattern>'`；异常吞掉。
- `killStaleElectronmon()`（内部，`:42-68`）：仅 Windows；PowerShell CIM 查 `node.exe` 且 CommandLine 含当前 cwd 且匹配 `[\\/]electronmon[\\/]bin[\\/]cli\.js`，收集 PID 后 `taskkill /F /T` 逐个杀树；PowerShell 不可用静默降级。
- `killStaleVite(port)`（内部，`:76-115`）：Windows `netstat -ano | findstr :<port>` 取 PID 逐杀；Unix `lsof -ti:<port>` 取 PID 后用 `ps -p <pid> -o command=` 过滤命令行含 `vite` 才 `kill`（避免误杀同端口其它 node 服务，`:102-104`）。怪癖：源注释 `:74`「仅当监听进程是 vite/node 时才杀」仅由 Unix 分支兑现；Windows `findstr :<port>` 为子串匹配（如 `:51740` 可误命中 `:5174`）且不校验进程名直接 `taskkill`（`:76-90`）。
- `killStaleElectron()`（内部，`:122-159`）：Windows CIM 查 `electron.exe` 且命令行含 `resolve(cwd,'../..')` 工作区路径，`taskkill /F /T`；Unix `ps -axo pid=,command=` 匹配命令行含 workspace 且 `/Electron.app/Contents/MacOS/Electron` 才 `kill`（`:152`）。
- `clearDevSingletonLock()`（内部，`:168-189`）：按平台取 appData（win=APPDATA / darwin=~/Library/Application Support / linux=XDG_CONFIG_HOME|~/.config），经 `resolveDevUserDataPath(appData, false, process.env)`（`src/main/lib/dev-instance.ts:32`）得开发版 userData，仅删 `SingletonLock`/`SingletonCookie`/`SingletonSocket` 三个固定文件。

## 3. 内部逻辑与关键流程

1. 顶层执行序列（`:191-198`，注释明确顺序语义）：`killStaleElectronmon()` → `kill(isWin ? 'electronmon.exe' : 'electronmon \\.')` → `killStaleElectron()` → `clearDevSingletonLock()` → 若 `killVite` 则 `killStaleVite(VITE_PORT)`。
2. 状态变化：系统进程表被清理；开发版 userData 三锁文件被删。注释（`:195-196`）：进程清理后必须清单实例锁，否则 Electron 启动即 app.quit() → concurrently -k 级联退出。
3. 返回值：无（脚本体无显式退出码，异常均被吞，恒 exit 0——各函数 try/catch 全覆盖）。

## 4. 调用者与调用链

- 入向（真实调用点）：`apps/electron/package.json:10`（`dev`：`bun run scripts/dev-kill.ts --vite && concurrently …`）；`:15`（`"dev:kill": "bun run scripts/dev-kill.ts"`）；`:16`（`dev:electron` 链首 `bun run dev:kill && …`）。
- 出向：`child_process.execFileSync/execSync`（taskkill/pkill/powershell/ps/lsof/kill）、`node:fs`（existsSync/rmSync）、`node:os.homedir`、`node:path`；`../src/main/lib/dev-instance`（resolveDevUserDataPath，`dev-instance.ts:32`）。

## 5. 数据 I/O、读写与副作用

- 读：进程表（CIM/ps/netstat/lsof）、环境变量（APPDATA/XDG_CONFIG_HOME）、dev userData 文件存在性。
- 写：删除三个固定锁文件（`SingletonLock/SingletonCookie/SingletonSocket`，`:177-185`）；进程终止（taskkill /F [/T]、kill）。
- 原子性/幂等：锁文件 `rmSync(force:true)` 幂等；进程清理重复执行无害。锁：不持锁，仅清理 Chromium 单实例锁残留（`:161-167` 注释解释 taskkill /F 强杀后锁残留导致下次启动失败）。
- 副作用：无日志输出（stdio ignore 为主）、无网络。

## 6. 分支、失败、取消与恢复

- 平台分支：isWin 贯穿 kill/killStaleElectronmon/killStaleVite/killStaleElectron 各自实现。
- 短路：`killStaleElectronmon` 非 Windows return（`:43`）；`clearDevSingletonLock` 的 appData 为空 return（`:175`）；`--vite` 缺省不跑端口清理（`:198`）。
- 失败处理：全部 try/catch 静默吞（`:32-34, 61-67, 89, 107-109, 112-114, 139-141, 156-158, 182-188`）——设计原则「清理失败不阻塞 dev 启动」（`:187`）。无用户可见错误文案；无 throw。
- 失败后状态：残留进程/锁文件可能仍在，交由 Electron/supervisor 兜底（`:66-67, 140` 注释）。恢复：dev 启动链重跑。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。权威状态：「谁算残留进程」的判定权威 = 命令行包含 workspace 路径（Windows CIM Contains($workspace)，`:50, 129`；Unix command.includes(workspace)，`:152`）；dev userData 路径权威 = `resolveDevUserDataPath`（`dev-instance.ts:32`），严格限定不触碰正式版目录（`:166`）。

## 8. 修改影响面

- 开发链：`dev`/`dev:kill`/`dev:electron`（`apps/electron/package.json:10,15,16`）→ `bun run dev` 整体可用性（单实例锁清理与 concurrently -k 级联退出问题，`:163-166`）。
- vite 端口约定：`VITE_PORT=5174` 与 `apps/electron/vite.config.ts` 的 server.port 联动（`:20` 注释）；但 vite.config.ts:5 实取 `resolveDevVitePort`（`apps/electron/src/main/lib/dev-instance.ts:52-57`，`PROFER_VITE_PORT` 合法时 1024-65535 覆盖端口）——`--vite` 清理仍固定只打 5174，端口被覆盖时不会清理实际端口（怪癖）。
- `src/main/lib/dev-instance.ts` 的 userData 解析语义（改动影响锁文件删除目标）。

## 9. 测试证据

`NOT_RUN`（本轮未运行任何脚本/测试，纯静态阅读）。无直接测试（全树 grep `dev-kill` 于 *.test.ts 零命中）。间接证据：无（`packaging-guards.test.ts` 等不覆盖本文件）。测试断言≠运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 五个内部函数职责、执行顺序、全吞异常设计 | 已证实 | `apps/electron/scripts/dev-kill.ts:1-198` 全文 |
| 被调 resolveDevUserDataPath 真实存在 | 已证实 | `src/main/lib/dev-instance.ts:32` |
| CIM 匹配串在真实 Windows 进程表上的效果 | 未知 | 需 Windows 实跑，NOT_RUN |
| Unix 路径 `killStaleElectron` 的 Electron.app 匹配对 Linux 的适用性 | 推断 | 正则面向 macOS Electron.app 路径（`:152`），Linux 布局未在代码区分 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| kill（双平台） | §2/§3 | 23-35 | covered |
| killStaleElectronmon | §2/§3/§6 | 42-68 | covered |
| killStaleVite（--vite / 5174 / vite 过滤） | §2/§3 | 76-115 | covered |
| killStaleElectron（win CIM / Unix ps） | §2/§3/§7 | 122-159 | covered |
| clearDevSingletonLock（三锁文件） | §2/§3/§5 | 168-189 | covered |
| 顶层执行序列 | §3 | 191-198 | covered |

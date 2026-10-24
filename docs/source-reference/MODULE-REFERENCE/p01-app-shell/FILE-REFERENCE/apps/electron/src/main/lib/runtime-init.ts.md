---
path: apps/electron/src/main/lib/runtime-init.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b819c85bce31da6fb6257e6671232e400092a830
sha256: 534f1bcd2a7c28cb762bb1616a25b4112ba3678337c55bc59a7e875aa6fc6655
lines: 335
kind: source
package: p01-app-shell
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/electron/src/main/lib/runtime-init.ts

## 1. 结论与边界

运行时初始化协调器（主进程）：协调 shell 环境加载（macOS）、Node/Bun/Git 检测、Windows Shell（Git Bash/WSL）检测，带 24h 磁盘缓存与增量重检（文件头 `apps/electron/src/main/lib/runtime-init.ts:1-10,23-30`）。检测实现在各 detector 模块，本文件只编排+缓存。

边界：不实现探测（node-detector/bun-finder/git-detector/git-bash-detector/wsl-detector/shell-env）；不消费运行时状态（ipc/orchestrator 只读）；缓存路径解析在 config-paths。

## 2. 导出与关键符号

`export` 逐条核对：4 个函数导出 + 4 个再导出 = 8 行 export。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `initializeRuntime` | 函数（导出） | 160-290 | `(options: RuntimeInitOptions = {}) => Promise<RuntimeStatus>` | 主初始化 |
| `getRuntimeStatus` | 函数（导出） | 297-299 | `() => RuntimeStatus \| null` | 内存缓存读 |
| `isRuntimeInitialized` | 函数（导出） | 306-308 | `() => boolean` | 初始化标志 |
| `reinitializeRuntime` | 函数（导出） | 316-329 | `(options?) => Promise<RuntimeStatus>` | 强制重检 |
| `getGitRepoStatus` | 再导出（导出） | 332 | from `./git-detector` | |
| `detectNodeRuntime` | 再导出（导出） | 333 | from `./node-detector` | |
| `detectBunRuntime` | 再导出（导出） | 334 | from `./bun-finder` | |
| `loadShellEnv` | 再导出（导出） | 335 | from `./shell-env` | |

内部符号：`runtimeStatusCache`（`:24`）、`isInitialized`（`:27`）、`CACHE_TTL_MS`（`:30`，24h）、`getRuntimeCachePath`（`:33-35`，`resolveConfigDir()/runtime-cache.json`）、`loadCachedRuntime`（`:38-131`）、`saveCachedRuntime`（`:134-145`）。

## 3. 内部逻辑与关键流程

### 3.1 缓存加载 `loadCachedRuntime`（`:38-131`）

无缓存文件→null（`:41`）；`_cachedAt` 超 24h→null（`:47-50`）；node/bun/git 任一缓存路径失效→null（`:52-65`）；**增量重检**：缓存中 unavailable 的 bun/git/node 逐个快速重检，发现即改缓存标 `needsRewrite`（`:67-99`）；Windows 下 shell 不完整时重检 Git Bash/WSL 并按 git-bash 优先推荐（`:101-119`）；有改动写回（`:121-123`）。异常→warn+null（`:127-130`）。

### 3.2 `initializeRuntime`（`:160-290`）

1. `forceRefresh` = 任一 skip* 选项（`:164`）。
2. **先 `loadShellEnv()`**（macOS 打包环境 PATH 短，必须在读缓存前，`:166-176`）。
3. 非 force 时尝试缓存恢复；`cached.envLoaded` 用本次实测覆盖旧值（`:179-189`）。
4. 依次 detect node/bun/git（skip 时给 `{available:false,error:'已跳过…'}` 形状，`:193-222`）；Windows detect Git Bash/WSL + 推荐（git-bash 优先，`:227-256`）。
5. 组 `RuntimeStatus`（`:259-266`）→ 内存缓存 + 非 force 时写盘（`:269-275`）→ 日志。

### 3.3 `reinitializeRuntime`（`:316-329`）

清内存标志/缓存（`:317-318`）→ **删磁盘缓存文件**（`:321-327`，确保「刷新」按钮生效，防旧 shell 信息复用）→ `initializeRuntime(options)`。

## 4. 调用者与调用链

入向（全树检索，证实）：

- `initializeRuntime`：`main/index.ts:197`（import）、`:930`（启动 `safeAwait('initializeRuntime', …)`）。
- `getRuntimeStatus`：`ipc.ts:132,1355`（IPC 查询）、`agent-orchestrator.ts:126,1072,2044`（任务前置检查）；渲染侧 `AboutSettings.tsx:171` 经 `window.electronAPI.getRuntimeStatus`。
- `reinitializeRuntime`：`ipc.ts:132,1363`（刷新 handler）。
- `isRuntimeInitialized`：**全树无调用点**（检索范围 apps+packages `*.ts/*.tsx`）。

出向：`./shell-env`、`./node-detector`、`./bun-finder`、`./git-detector`（`detectGitRuntime`/`getGitRepoStatus`）、`./git-bash-detector`、`./wsl-detector`、`./config-paths` `resolveConfigDir`、`node:fs`/`node:path`。

## 5. 数据 I/O、读写与副作用

- 读写：`runtime-cache.json`（读 `:43`、写 `:139` 直写非原子、删 `:324`）。
- 副作用：`console.log/warn/error` 诊断；各 detector 的进程探测（子进程/命令探测在其模块）。
- 并发/幂等：模块级单飞无锁；`initializeRuntime` 并发调用会双探测（推断）；缓存 TTL 24h；`envLoaded` 每次实测覆盖（`:183`）。

## 6. 分支、失败、取消与恢复

| 分支 | 触发 | 行 | 结果 |
| --- | --- | --- | --- |
| 缓存过期/路径失效 | TTL/existsSync | 47-65 | 全量重检 |
| 增量重检 | 缓存中 unavailable | 67-119 | 发现则改缓存 |
| skip 选项 | options.skip* | 164, 194-222 | 对应项 `available:false` |
| shell 加载失败 | loadShellEnv 抛错 | 173-175 | envLoaded=false 继续 |
| shell 检测失败 | detect 抛错 | 253-255 | 继续（shell undefined） |
| 缓存读写失败 | fs 抛错 | 127-130, 141-144 | 降级重检/仅 warn |
| 强制重检 | reinitializeRuntime | 316-329 | 删缓存后全量 |

无取消机制（检测流程一次性）；恢复=reinitializeRuntime。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查；运行时状态权威=探测结果+磁盘缓存（`getRuntimeStatus` 只读暴露）；测试容错不在本文件（sandbox 判定在 pi-file-checkpoint，另一文件）。

## 8. 修改影响面

- 启动链：`main/index.ts:930`（App 启动顺序；`:181` 注释要求在其前完成某些操作）。
- IPC：`ipc.ts:1355/1363`（状态查询/刷新）→ AboutSettings UI。
- 任务链：`agent-orchestrator.ts:1072,2044`（运行时前置检查）。
- `RuntimeStatus`/`RuntimeInitOptions` 来自 `@profer/shared`；改形状需同步 detector 返回值与 UI。
- 需同步的测试：无（0 test，§9）。

## 9. 测试证据

直接测试：**无**。全树 `*.test.*`/`*.spec.*` 检索 `runtime-init`/`initializeRuntime`/`getRuntimeStatus`/`reinitializeRuntime` 0 命中。间接证据：无。

真实断言：不适用。未覆盖：缓存 TTL/增量重检/Windows 分支/reinitialize 删缓存。

NOT_RUN：本轮未运行任何测试/typecheck/构建/真实运行时探测。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 函数+4 再导出及行号 | 已证实 | `:160-335` 逐条读 |
| 缓存/增量重检/forceRefresh 逻辑 | 已证实 | `:38-145, 160-290` |
| reinitialize 删盘缓存 | 已证实 | `:321-327` |
| 调用链（index/ipc/orchestrator） | 已证实 | §4 行号 |
| isRuntimeInitialized 无调用点 | 已证实 | 全树检索 |
| 并发 initializeRuntime 双探测 | 推断 | 无锁 |
| 各 detector 内部行为 | 未知 | 非本批文件 |
| 运行期行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/职责 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 8 导出 | §2 | 见表 | covered |
| loadCachedRuntime/saveCachedRuntime | §3.1 | 38-145 | covered |
| initializeRuntime 全分支 | §3.2, §6 | 160-290 | covered |
| reinitializeRuntime | §3.3 | 316-329 | covered |
| 调用链 | §4 | - | covered |
| detector 内部/运行期 | §10 | - | unknown（非本批/NOT_RUN） |

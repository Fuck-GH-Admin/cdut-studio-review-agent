---
path: apps/electron/scripts/memory-archive-backup.mjs
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 461a5e8c833e2b1e44bc1fe5fbb42e74f5a89365
sha256: 9d58705e321cf32a6afea3528026f5f2b58bf167a63284aaac637e6767243e5c
lines: 74
kind: source
package: p01-app-shell
author: docs-r07-author-extra-03-20261024
reviewer: docs-r07-qa-extra-03-20261024
status: authored
evidence: static
---

# apps/electron/scripts/memory-archive-backup.mjs

## 1. 结论与边界

Node CLI 脚本（74 行，运行时工具，非打包进 App 的模块）：把工作区主题记忆目录 `<workspace-files>/.context/memory-archive/` 整目录复制到同级 `memory-archive-backup/<YYYYMMDD-HHmmss>/` 时间戳快照，并按名字排序轮转只保留最近 `keep` 份（默认 14）（`memory-archive-backup.mjs:3-7`）。文件头注释自述"供 automation 定时任务调用，作为 Pi 可写专属记忆目录的版本化兜底"（`memory-archive-backup.mjs:7`）。

边界：不做内容级增量/差异（每次 `cpSync` 全量递归复制，`memory-archive-backup.mjs:53`）；不读、不校验、不索引记忆正文；不修改源目录；不做跨机器/远程备份；无网络。**重要边界**：备份源根路径硬编码 `~/.profer/...`（`memory-archive-backup.mjs:42`），与应用运行时 memory-archive 权威路径不一致，见 §5。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| （导出） | — | — | — | `export` 0 命中（全文件检索）；纯脚本，无模块导出 |
| `DEFAULT_KEEP` | 常量（内部） | 19 | `14` | 默认保留快照数 |
| `parseArgs` | 函数（内部） | 21-27 | `(argv) => {slug, keep}` | 取第一个非 `--` 开头参数为 slug；`--keep N` 解析，非正整数回退 `DEFAULT_KEEP` |
| `timestampDir` | 函数（内部） | 29-32 | `(date = new Date()) => string` | 本地时间 `YYYYMMDD-HHmmss` 零填充 |
| `run` | 函数（内部） | 34-72 | `() => void` | 主流程：参数校验→备份→轮转 |
| `run()` | 顶层调用 | 74 | — | 模块加载即执行 |

注：`resolve` 自 `node:path` 导入但全文件未使用（`memory-archive-backup.mjs:16`）。

## 3. 内部逻辑与关键流程

1. `parseArgs`（`memory-archive-backup.mjs:21-27`）：`argv.slice(2)` 中第一个不以 `--` 开头的参数作为 `slug`；`--keep` 后一位经 `Number()` 转换，`Number.isInteger(keep) && keep > 0` 才生效，否则回退 `DEFAULT_KEEP`（`:26`）。
2. `run` 开头（`:34-40`）：`slug` 缺失 → `console.error` 打印中文用法并 `process.exitCode = 1` 后 `return`（进程随后自然退出，非 `process.exit`）。
3. 路径构建（`:42-44`）：`contextDir = join(homedir(), '.profer', 'agent-workspaces', slug, 'workspace-files', '.context')`；`srcDir = <contextDir>/memory-archive`；`backupRoot = <contextDir>/memory-archive-backup`。
4. 源存在性（`:46-49`）：`!existsSync(srcDir)` → 日志"源目录不存在，跳过"并 `return`（**exitCode 保持 0**，跳过不是失败）。
5. 备份（`:50-54`）：`mkdirSync(backupRoot, {recursive: true})`；`dest = join(backupRoot, timestampDir())`；`cpSync(srcDir, dest, {recursive: true})` 全量递归复制；成功日志打印 `dest`。
6. 轮转（`:56-69`）：`readdirSync(backupRoot)` 过滤 `statSync(p).isDirectory() && /^\d{8}-\d{6}$/.test(name)`（`:58-61`），`.sort()` 字典序（时间戳格式可比，`:62`）；`while (snapshots.length > keep)` 从最旧端 `shift()` 并 `rmSync(..., {recursive: true, force: true})`（`:64-68`）。
7. 收尾（`:71`）：打印 `Math.min(snapshots.length, keep)/keep`（注意此处 `snapshots` 已被 shift 消耗，打印的是轮转后剩余数）。

## 4. 调用者与调用链

- 入向：**全冻结树无调用者**。检索 `grep -rn "memory-archive-backup"` 于冻结树全部文本文件（排除 .git）仅命中本文件自身。注释所称"automation 定时任务"（`memory-archive-backup.mjs:7`）在树内没有任何调度登记（package.json scripts、CI、文档均无引用）——推断为人工或树外 cron 调用（推断）。
- 出向：仅 Node 内置——`node:os` `homedir`、`node:path` `join`/`resolve`、`node:fs` `existsSync`/`mkdirSync`/`cpSync`/`readdirSync`/`rmSync`/`statSync`（`memory-archive-backup.mjs:15-17`）。无项目内模块依赖，与主进程代码零耦合。

## 5. 数据 I/O、读写与副作用

- 读：`~/.profer/agent-workspaces/<slug>/workspace-files/.context/memory-archive/`（存在性 `:46` + 递归读取用于复制 `:53`）。
- 写：`<contextDir>/memory-archive-backup/<YYYYMMDD-HHmmss>/` 全量副本（`:50-53`）；删除：轮转旧快照目录（`:67`）。
- 原子性：无。`cpSync` 递归复制中断会留下部分副本（推断，基于 fs 语义）；无 tmp+rename、无 fsync。幂等：同一秒重复运行得到同一 `timestampDir` 目标名，`cpSync` 对已存在目标的行为未在本文件处理（未知，未实测）。
- 副作用：本地磁盘 IO、控制台日志（`memory-archive-backup.mjs:47,54,68,71`）。无进程/窗口/通知/遥测/网络。
- **路径根差异（照实记录）**：本脚本硬编码 `~/.profer`（`:42`）；而应用内 memory-archive 权威路径由 `getWorkspaceMemoryArchivePath` 给出 = `resolveWorkspaceFilesDir(slug)/.context/memory-archive`（`agent-workspace-manager.ts:1325-1327`），其中 `resolveWorkspaceFilesDir` = `join(getConfigDir(), 'agent-workspaces', slug, 'workspace-files')`（`config-paths.ts:522-524`），`getConfigDir()` 默认 `~/.cdutai`（正式）/`~/.cdutai-dev`（开发），可被 `PROFER_CONFIG_DIR` 覆盖（`config-paths.ts:33-46`、`config-paths.ts:58-59`、`config-paths.ts:80`）。`config-paths.ts:68-71` 明示"从旧 Proma/Profer 目录的迁移已随品牌切换移除……不读取也不迁移 ~/.proma 或 ~/.profer 数据"。因此按文档用法运行本脚本时，除非用户机器上存在旧 `~/.profer` 遗留树，否则大概率走"源目录不存在，跳过"分支（推断，未实测）。

## 6. 分支、失败、取消与恢复

| 分支 | 行 | 行为 |
| --- | --- | --- |
| 缺 slug | :36-40 | stderr 中文用法 + `exitCode = 1`，不写盘 |
| 源目录不存在 | :46-49 | 日志跳过，`return`，退出码 0 |
| `--keep` 非法/缺失 | :25-26 | 回退 `DEFAULT_KEEP=14` |
| cpSync/readdirSync/statSync 抛错 | — | 无 try/catch（仅 `:178` 一类脚本风格外的保护不存在于本文件）；未捕获异常 → Node 打印栈并非零退出（推断） |
| 轮转删除 | :64-68 | `rmSync` 带 `force: true`，目标缺失不报错 |

失败后状态：已复制的部分快照目录留在 `backupRoot`（推断）；无重试、无回滚、无恢复路径；不可恢复点为 `rmSync` 删除旧快照（删除即失）。取消（SIGINT）中途行为未处理（未知）。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role/actor 检查，Node CLI 进程继承调用用户对 `~/.profer` 的文件系统读写权限。权限权威不在本文件；轮转"该删谁"的权威仅为目录名时间戳正则与 `keep` 参数（`memory-archive-backup.mjs:60,64`）。

## 8. 修改影响面

- 树内无调用方（§4 否定检索），修改不破坏任何编译单元；影响面仅限人工/树外自动化使用者的备份产物布局。
- 改 `:42` 路径常量 → 备份源/目标根整体改变；改时间戳格式 `:29-32` → 与 `:60` 轮转正则、字典序假设必须同步改；改 `keep` 语义 → 轮转数变化。
- 与应用内 memory-archive 读写者（`agent-workspace-manager.ts:1325-1327`、`memory-archive-search.ts:139` 等）无代码耦合，路径对齐问题见 §5。
- 无测试需要同步（§9）。

## 9. 测试证据

- 直接测试：**无**。全冻结树检索 `memory-archive-backup`（排除 .git，全部文本文件）仅命中本文件自身，无 `.test.` 文件、无 CI 引用。
- 本文件不是测试；无断言。`NOT_RUN`：本轮未执行该脚本、未运行 Node/产品测试/GUI；所有行为为静态阅读所得。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 备份→轮转主流程、keep 默认 14、缺 slug exitCode=1、源缺失跳过 | 已证实 | `memory-archive-backup.mjs:19-71` |
| 全冻结树无调用者 | 已证实 | 全树 grep（排除 .git）仅命中自身 |
| 脚本固定 `~/.profer` 与应用 `~/.cdutai[-dev]/PROFER_CONFIG_DIR` 权威根不一致 | 已证实 | `memory-archive-backup.mjs:42` vs `config-paths.ts:58-59,522-524`、`agent-workspace-manager.ts:1325-1327` |
| 按文档用法运行大概率"源目录不存在"跳过 | 推断 | §5 路径差异推演，未实测 |
| `cpSync` 中断留部分副本、同秒重跑目标重名行为 | 推断/未知 | fs 语义推断；重名覆盖行为未实测 |
| 注释所称 automation 定时任务的实际调度方 | 未知 | 树内无登记，树外不可见 |
| SIGINT/kill 中途状态 | 未知 | 未处理亦未实测 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `DEFAULT_KEEP` | §2、§3.1 | 19 | covered |
| `parseArgs` | §2、§3.1 | 21-27 | covered |
| `timestampDir` | §2、§3.5 | 29-32 | covered |
| `run` 全流程 | §3.2-3.7 | 34-72 | covered |
| 缺 slug 分支 | §6 | 36-40 | covered |
| 源缺失分支 | §6 | 46-49 | covered |
| 轮转删除 | §3.6、§6 | 56-69 | covered |
| 未用 `resolve` 导入 | §2 注 | 16 | covered |
| 同秒重跑/中断恢复 | §6、§10 | — | unknown |
| 调用方 | §4 | — | covered（否定+检索范围） |

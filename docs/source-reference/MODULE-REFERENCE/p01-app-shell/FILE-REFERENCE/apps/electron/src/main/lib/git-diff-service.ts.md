---
path: apps/electron/src/main/lib/git-diff-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ddb3355aa34322715a68387c15598c8b6adb2ba2
sha256: 04bf28304605223ee9a5a2e5ece464b1999ae338578f9ab1a34bcef41376bb97
lines: 870
kind: source
package: p01-app-shell
author: docs-r07-author-extra-01-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/git-diff-service.ts

## 1. 结论与边界

**Git 工作区变更服务**（870 行，异步 spawn + 进程级信号量 + 仓库级缓存）：为 Diff 面板提供多仓库变更列表、单文件 diff/新旧内容、未追踪文件内容、文件还原、worktree 列表与 worktree 全量变更；带路径安全校验（root 内约束）、大文件跳过、换行归一化。

边界：只做 git 读与 `restore` 还原，不做 commit/push/fetch 除 `getWorktreeChanges` 内的 `fetch origin main`（`:760`）；不做路径授权（授权在 `ipc.ts` 的 `ensurePathAllowedWithWorktree` 完成）；不解析 diff 内容为结构化（返回文本由渲染层展示）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `invalidateGitDiffCache` | 导出函数 | 322-331 | `(changedPath?: string): void` | 定向/全量缓存失效 |
| `getUnstagedChanges` | 导出函数 | 404-472 | `(dirPath, sessionPath?, workspaceFilesPath?, extraPaths?): Promise<UnstagedChangesResult>` | 工作树相对 HEAD 变更（含 staged） |
| `normalizeGitRoot` | 导出函数 | 485-488 | `(p: string): string` | 仓库根归一化（win32 小写+正斜杠） |
| `findAllGitRoots` | 导出函数 | 526-544 | `(baseDir): Promise<string[]>` | 向上+向下搜所有仓库根 |
| `getFileDiff` | 导出函数 | 555-565 | `(dirPath, filePath, gitRoot?): Promise<string>` | 单文件 unified diff |
| `getDiffContents` | 导出函数 | 570-632 | `(dirPath, filePath, gitRoot?, baseRef?): Promise<{oldContent,newContent}\|null>` | 旧版(git ref)+新版(磁盘) |
| `getUntrackedContent` | 导出函数 | 640-659 | `(dirPath, filePath, gitRoot?): Promise<string>` | 未追踪文件全文 |
| `revertFile` | 导出函数 | 664-675 | `(dirPath, filePath, gitRoot?): Promise<void>` | `git restore --staged --worktree` |
| `getMainRepoRoot` | 导出函数 | 686-696 | `(somePath): Promise<string\|null>` | worktree→主仓库根 |
| `listWorktrees` | 导出函数 | 701-746 | `(repoPath): Promise<WorktreeInfo[]>` | `git worktree list --porcelain` 解析 |
| `getWorktreeChanges` | 导出函数 | 751-870 | `(worktreePath, baseBranch='origin/main'): Promise<UnstagedChangesResult>` | worktree 全量变更（commit+未提交+新文件） |
| `AsyncSemaphore` | 内部类 | 22-48 | FIFO 信号量，上限 `MAX_CONCURRENT_GIT_COMMANDS=6` | 进程级并发闸 |
| `runGitProcess` | 内部函数 | 156-215 | `(args, cwd, options?): Promise<string\|null>` | spawn git，10s SIGTERM→1s SIGKILL |
| `runGitCommand` | 内部函数 | 220-222 | 同上（经信号量） | 限流包装 |
| `normalizeLineEndings` | 内部函数 | 60-62 | CRLF→LF | 仅 diff 比较用 |
| `normalizeSafePath` | 内部函数 | 113-144 | `(root, filePath): string\|null` | root 内约束（拒绝 `..`/越界） |
| `toChangeCandidate` | 内部函数 | 77-105 | `(input): ChangeCandidate\|null` | 文件/目录候选（文件缺失按文件匹配） |
| `computeSource` | 内部函数 | 229-257 | → `ChangeSource` | session/workspace 归属（both/session/workspace/none） |
| `parseNumstat` | 内部函数 | 263-284 | → `Map<path,{additions,deletions}>` | rename 取新路径为 key |
| `scanGitRoot` | 内部函数 | 334-373 | `→ CachedRepoScan\|null` | 3 命令并行扫描 |
| `getCachedRepoScan` | 内部函数 | 376-395 | revision 校验+in-flight 去重 | 见 §5 |
| `findAllGitRootsDown` | 内部函数 | 491-523 | `(dirPath, maxDepth): string[]` | 向下搜 `.git`（深度 3） |
| `findGitRoot` | 内部函数 | 547-550 | `→ string\|null` | 取第一个根 |
| 常量 | 内部 | 16,19 | `MAX_FILE_SIZE_BYTES=10MiB`、`MAX_CONCURRENT_GIT_COMMANDS=6` | 大文件跳过/并发上限 |
| 缓存态 | 内部 | 301-303 | `repoRevisions`/`repoScanCache`/`inFlightRepoScans` 三个 Map | 仓库级缓存 |

导出计数：`export` 11 条（`:322`、`:404`、`:485`、`:526`、`:555`、`:570`、`:640`、`:664`、`:686`、`:701`、`:751`），与源码逐条一致。

## 3. 内部逻辑与关键流程

### 3.1 git 子进程执行（`:156-222`）
`runGitProcess` spawn `git -c core.quotePath=false ...args`，`GIT_TERMINAL_PROMPT=0`（`:159-166`）；stdout/stderr 累积；**10s 超时先 SIGTERM，1s 后 SIGKILL 并 `finish(null)`**（`:187-196`，防止占死全局信号量）；close code 0 → `stdout.trim()`，否则 `console.error` + null（`:198-205`）；spawn error → null（`:207-210`）；外层 try/catch 兜底 `resolve(null)`（`:211-213`）。`runGitCommand` 经 `gitCommandSemaphore.run`（上限 6 并发，FIFO 等待，`:22-48`）。

### 3.2 路径安全（`:113-144`）
`normalizeSafePath(root, filePath)`：root 用 `realpathSync` 解析（失败用 `resolve`）；绝对路径必须 `realpathSync` 后落在 `root+sep` 内，返回相对段（`:123-132`）；相对路径拒绝含 `..` 的输入（`:134`），`resolve`+`realpath` 后必须在 root 内或等于 root（`:135-142`）；不安全返回 null。各公开函数对 null 统一拒绝：`getFileDiff` 返回 `''`（`:559-562`）、`getDiffContents` 返回 null（`:575-579`、`:597-601`）、`getUntrackedContent` 返回 `''`（`:643-647`）、`revertFile` **throw** `不安全的路径`（`:667-670`）。

### 3.3 变更扫描与缓存（`:286-395`）
- `scanGitRoot`（`:334-373`）：并行 `diff HEAD --name-status`、`diff HEAD --numstat`、`ls-files --others --exclude-standard`；**任一命令 null（git 不可用/超时）→ 返回 null，不缓存**（`:340-341`，注释：避免长期显示空 Diff）。name-status 解析：`^([MDAT])\t(.+)$` → D=deleted，其余=modified；`^([RC])\d*\t...\t(.+)$` rename/copy → modified 且取新路径（`:347-359`）；numstat 缺失记 0/0（`:362`）。
- `getCachedRepoScan`（`:376-395`）：`normalizeGitRoot` 归一后按 revision 比对命中（`:378-380`）；同 revision 的 in-flight promise 直接复用（`:382-383`）；扫描完成后**仅当 revision 未变才写缓存**（`:387-388`，阻止失效前启动的扫描覆盖新结果）；null 结果转 `{files:[],untrackedFiles:[]}` 但不入缓存（`:386`）。
- `invalidateGitDiffCache`（`:322-331`）：传 `changedPath` 时只失效「同属或互为祖先/后代」的仓库（`isSameOrDescendant` 双向判断，`:309-314`、`:327`）；不传全量失效；每个受影响 root revision+1 并删缓存（`:328-330`）。
- `normalizeGitRoot`（`:485-488`）：`resolve` 后反斜杠转正斜杠，win32 再转小写（注释 `:481-483`：否则定向失效会静默 miss）。

### 3.4 getUnstagedChanges（`:404-472`）
候选=`[dirPath, sessionPath, workspaceFilesPath, ...extraPaths]` 过滤非空（`:411-413`）→ `toChangeCandidate`：文件→`fileOnly:true`（searchPath=父目录，matchPath=自身），目录→子树匹配，**statSync 失败（文件已删）仍按文件精确匹配**（`:96-103`）→ 对每个候选 `findAllGitRoots` 收集去重仓库根（`:418-424`）→ 无根返回 `{isGitRepo:false, ...}`（`:426-428`）→ 并行 `getCachedRepoScan`（`:443`）→ 按候选过滤（`isUnderAnyCandidate`，`:434-440`）→ 每条附 `computeSource`（session/workspace 前缀判断，`:229-257`）→ 返回 `{isGitRepo:true, files, untrackedFiles, gitRootNames:[basename...]}`（`:466-471`）。

### 3.5 仓库根发现（`:491-550`）
`findAllGitRoots`：`rev-parse --show-toplevel`（quiet）向上（`:530-535`）+ `findAllGitRootsDown(baseDir, 3)` 向下（跳过点目录与 `node_modules`，遇 `.git` 即收不下钻，`:491-523`）；均 `normalizeGitRoot` 去重。`findGitRoot` 取第一个根（`:547-550`）。

### 3.6 内容读取（`:555-659`）
- `getFileDiff`：`git diff -- <safePath>`（**未暂存+已暂存合并语义由 git 决定，实际为工作树 vs index**；`:563`），空/失败→`''`。
- `getDiffContents`：无 git root → 纯磁盘预览，`oldContent:''`（`:574-595`）；有 root → 旧版 `git show <ref>:<path>`（`baseRef` 缺省 `HEAD`，`:604-613`），新版读磁盘；**两侧均 `normalizeLineEndings` CRLF→LF**（`:594`、`:631`，注释 `:52-58`：否则 Windows 下整文件全删全增）；磁盘文件 >10MiB 跳过读取保持空串并 warn（`:585-587`、`:621-623`）。
- `getUntrackedContent`：`root = gitRoot || findGitRoot(dirPath) || dirPath`（`:642`），>10MiB 返回 `''`（`:651-653`）。

### 3.7 还原与 worktree（`:664-870`）
- `revertFile`：`git restore --staged --worktree -- <path>`；无 root throw `未找到 Git 仓库`（`:666`）；命令 null throw `还原失败: ...`（`:672-674`）。
- `getMainRepoRoot`：`rev-parse --path-format=absolute --git-common-dir` → 父目录即主仓库根（`:686-696`，worktree 场景安全校验用）。
- `listWorktrees`：`worktree list --porcelain` 按空行分块解析 `worktree/HEAD/branch/detached/prunable`（`:709-743`）；**prunable 或路径不存在的条目跳过**（`:733`）；HEAD 截 7 位（`:723`）；isMain = 归一化后等于主仓库根（`:734`）。
- `getWorktreeChanges`：`fetch origin main --quiet`（`:760`，失败继续）→ `diff <baseBranch>...HEAD`（已 commit 未合并，`A` 记为 `untracked`，`:787`）→ `diff HEAD`（未提交，与前者按 path 合并累加行数，`:833-847`）→ `ls-files --others` 未追踪（已入 map 的跳过，`:857-861`）。

## 4. 调用者与调用链

- 入向（全冻结树 `grep git-diff-service + 11 导出名`，apps+packages 全文件类型）：
  - `apps/electron/src/main/ipc.ts:138` import 9 个符号；handler（均经 `normalizeFileAccessOptions`/`ensurePathAllowedWithWorktree` 授权，例外见下）：
    - `git:get-unstaged-changes`（`ipc.ts:1381-1397`）：`ensurePathAllowed(dirPath)` + session/workspace/extra 逐个 `isPathAllowed` 过滤后传入。
    - `git:get-file-diff`（`:1400-1412`）、`git:get-untracked-content`（`:1415-1427`）、`git:get-diff-contents`（`:1455-1467`）、`git:revert-file`（`:1430-1444`）：`ensurePathAllowedWithWorktree(dirPath)`（+`gitRoot`），revert 后 `invalidateGitDiffCache(filePath)`（`:1442`）。
    - `git:invalidate-diff-cache`（`:1447-1452`）：**无路径校验**直接 `invalidateGitDiffCache(changedPath)`。
    - `git:list-worktrees`（`:1470-1476`）：注释明确「不涉及文件内容，跳过路径安全检查」。
    - `git:get-worktree-changes`（`:1479-1491`）：`ensurePathAllowedWithWorktree(worktreePath)`。
    - `ipc.ts:872/890/908`：`getAccessRootMainRepo`/`ensurePathAllowedWithWorktree` 内部用 `getMainRepoRoot` 做 worktree 放行判定（`ipc.ts:881-916`）。
  - `apps/electron/src/main/lib/agent-workspace-manager.ts:24` import `findAllGitRoots, normalizeGitRoot`；`:1763`、`:1781` 调用。
  - 渲染链路（经 preload `apps/electron/src/preload/index.ts:298-312`、`:2138-2166`）：`DiffChangesList.tsx:147-148`（getWorktreeChanges/getUnstagedChanges）、`:176`（revertFile）、`DiffTabContent.tsx:676/725`（getDiffContents）、`WorktreeSelector.tsx:73`（listWorktrees）、`useGlobalAgentListeners.ts:1138/1186/1774`（invalidateGitDiffCache：Agent 写文件定向失效、git 突变/窗口聚焦全量失效）。
- 出向：`child_process.spawn`（`:8`）、`fs`（`:9`）、`path`（`:10`）、`@profer/shared` 类型与 `normalizePathForCompare`（`:11-13`）。

## 5. 数据 I/O、读写与副作用

- 输入：路径字符串 + 可选 gitRoot/baseRef/baseBranch；输出：结构化变更对象/diff 文本（IPC 序列化）。
- 磁盘读：`readFileSync` 旧/新内容（≤10MiB）、`statSync`/`readdirSync`/`existsSync`/`realpathSync`；**唯一写**=`revertFile` 的 `git restore`（改 index+工作树，`:671`）。
- 网络：`getWorktreeChanges` 内 `git fetch origin main`（`:760`）；其余命令纯本地。
- 缓存：仓库级 `repoScanCache`（revision 制）+ `inFlightRepoScans` 去重（`:301-303`）；失效入口 `invalidateGitDiffCache`。
- 并发：进程级信号量限 6 个 git 子进程（`:19`、`:22-48`）；FIFO 唤醒（`:37`）。
- 副作用：git 子进程、console 日志、`revertFile` 的工作区变更；无遥测/通知。

## 6. 分支、失败、取消与恢复

- git 命令失败：统一 `null`（不抛），调用侧按 null 回退（diff→`''`、扫描→空结果不缓存）；错误日志可 `quiet` 抑制（`:202`、`:208`）。
- 超时：10s SIGTERM→1s SIGKILL→resolve(null)（`:187-196`）；信号量 finally 释放（`:43-46`），不会泄漏名额。
- 路径不安全：读接口回退空值、`revertFile` 抛错（§3.2）。
- `revertFile` 失败：throw 中文错误串（`:666`、`:673`），IPC 层不捕获 → 渲染侧 Promise reject（`DiffChangesList.tsx:176` 有待 catch，域外）。
- 取消：无 AbortController；SIGKILL 是唯一强杀路径。
- 恢复：`scanGitRoot` 失败不缓存（`:340-341`），下次调用重扫即恢复；in-flight 去重 + revision 防旧写新（`:387-388`）。
- 不可恢复点：无持久化状态；`revertFile` 已执行的 `restore` 不可撤销（git 语义）。

## 7. 权限与权威状态

- 本文件不做权限判定（无 sender/role），只做**路径安全**（root 内约束，§3.2）；授权由 `ipc.ts` 的 `isPathAllowed`/`ensurePathAllowedWithWorktree`（含 worktree→主仓库回溯，`ipc.ts:881-916`）负责。
- 例外（照实记录）：`git:list-worktrees`（`ipc.ts:1469-1476`）与 `git:invalidate-diff-cache`（`:1446-1452`）不做路径授权；`listWorktrees` 注释声明仅读 worktree 元信息。
- 权威状态：变更状态以 git 输出为权威（name-status/numstat/ls-files）；`hasChanges`/`status` 由 git 产生，`source`（session/workspace/none/both）由本文件路径前缀推导（`:229-257`）。

## 8. 修改影响面

- IPC 面：`git:get-unstaged-changes`/`get-file-diff`/`get-untracked-content`/`revert-file`/`invalidate-diff-cache`/`get-diff-contents`/`list-worktrees`/`get-worktree-changes`（`packages/shared/src/types/runtime.ts:370-381`、`:413`）；改动签名需同步 `preload/index.ts:298-312` 与渲染组件（`DiffChangesList/DiffTabContent/WorktreeSelector`）。
- `agent-workspace-manager.ts:1763/1781` 依赖 `findAllGitRoots`/`normalizeGitRoot` 的去重语义。
- `normalizeGitRoot` 归一规则（win32 小写）若变，`invalidateGitDiffCache` 定向失效与 `agent-workspace-manager` 的根匹配都会受影响（注释 `:481-483`）。
- 存储：无持久化；缓存为进程内存，重启即清。
- 测试：无直接测试（见 §9）；改动后需人工回归 Diff 面板（NOT_RUN）。

## 9. 测试证据

- 直接测试：**无**。检索范围：冻结树全文件 `grep git-diff-service + 11 导出名`，无 `*.test.ts` 命中。
- 间接证据：无（渲染组件断言未在本批范围）。
- 未覆盖：全部 11 导出无测试；`normalizeSafePath` 的 `..`/symlink 分支、信号量饱和、缓存失效竞态均未测。
- `NOT_RUN`：未运行 bun test/产品测试/typecheck/build/Electron-GUI；测试断言≠已运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 11 导出签名与行为 | 已证实 | `:322-870` 逐行 |
| 信号量上限 6、FIFO、finally 释放 | 已证实 | `:19`、`:22-48` |
| 超时 SIGTERM→SIGKILL→null | 已证实 | `:187-196` |
| 扫描失败不缓存、revision 防旧写新 | 已证实 | `:340-341`、`:387-388` |
| 定向失效双向祖先判断 | 已证实 | `:309-314`、`:327` |
| `..` 拒绝与 realpath 约束 | 已证实 | `:113-144` |
| CRLF 归一化动机（全删全增） | 已证实 | `:52-62` |
| `git:list-worktrees`/`invalidate-diff-cache` 无路径授权 | 已证实 | `ipc.ts:1446-1452`、`:1469-1476` |
| `getFileDiff` 的 git diff 具体比较基准（worktree vs index） | 推断 | 依 `git diff` 默认语义，命令行 `:563` 未加 `HEAD` |
| 渲染侧 revert 失败提示行为 | 未知 | 调用点已核，组件实现域外 |
| 并发饱和/大仓库真实表现 | 未知 | NOT_RUN |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `AsyncSemaphore`/`runGitProcess`/`runGitCommand` | §3.1 | 22-48,156-222 | covered |
| `normalizeSafePath`/`toChangeCandidate` | §3.2/§3.4 | 77-144 | covered |
| 缓存三 Map/`getCachedRepoScan`/`invalidateGitDiffCache` | §3.3 | 286-395 | covered |
| `getUnstagedChanges` | §3.4 | 404-472 | covered |
| `normalizeGitRoot`/`findAllGitRoots*`/`findGitRoot` | §3.5 | 485-550 | covered |
| `getFileDiff`/`getDiffContents`/`getUntrackedContent` | §3.6 | 555-659 | covered |
| `revertFile`/`getMainRepoRoot` | §3.7 | 664-696 | covered |
| `listWorktrees`/`getWorktreeChanges` | §3.7 | 701-870 | covered |
| `computeSource`/`parseNumstat` | §3.4/§3.3 | 229-284 | covered |
| IPC 授权边界 | §7 | ipc.ts:1381-1491 | covered |
| 运行/并发/竞态实际表现 | §10 | — | unknown（NOT_RUN） |

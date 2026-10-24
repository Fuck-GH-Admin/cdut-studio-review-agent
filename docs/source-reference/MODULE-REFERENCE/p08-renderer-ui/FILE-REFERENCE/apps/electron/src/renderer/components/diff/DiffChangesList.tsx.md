---
path: apps/electron/src/renderer/components/diff/DiffChangesList.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b50b6f86c645ecd597273cce871e3caa34ae6235
sha256: e927265f157b948cabbfed9bbd11743138cb47ab392fcb79a864ad84493391e9
lines: 562
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-04-20261024
reviewer: docs-r07-qa-extra-04-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/components/diff/DiffChangesList.tsx

## 1. 结论与边界

代码改动文件列表（React.memo）：显示工作树相对 HEAD 的改动文件，按 Git 仓库（gitRoot）分组、目录折叠、文件名搜索、来源 badge、hover 还原；支持 worktree/分支切换（内联 `WorktreeSelector`）、未追踪文件分组、以及**非 Git 目录**中 Agent 写入文件的「本轮/更早」分组（`apps/electron/src/renderer/components/diff/DiffChangesList.tsx:1-5`）。

边界：

- 不渲染 diff 内容（点击经 `onFileClick`/`onPlainFileClick` 抛给调用方开 DiffTabContent）。
- Git 读取/还原经 IPC（主进程执行）；本组件只做列表 UI 与状态编排。
- worktree 的 baseBranch 固定 `'origin/main'`（`:90`），不可配。

## 2. 导出与关键符号

`export` 逐条核对：1 个（const 组件 1；函数/接口/类导出 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `DiffChangesList` | 组件（导出，`React.memo`） | 69-402 | 13 props（见 §2.1） | 列表本体 |
| `FileRow` | 内部组件 | 405-484 | `({file,onClick,onRevert,isSelected?,isUnseen?,dirPath})` | 已追踪文件行 |
| `UntrackedFileRow` | 内部组件 | 487-524 | `({file,onClick})` | 未追踪行（「新文件」badge） |
| `NonGitFileRow` | 内部组件 | 527-562 | `({change,onClick?})` | 非 Git 变更行（「新建/已编辑」badge） |
| `FileGroup` | 内部接口 | 21-30 | `{gitRoot;dirName;files;totalAdditions;totalDeletions;sources}` | 分组结构 |
| `DiffChangesListProps` | 内部接口 | 32-59 | 见 §2.1 | props |
| `SOURCE_CONFIG` | 内部常量 | 62-67 | `Record<string,{color,label}>` | session/workspace/both/none badge |

### 2.1 props（`apps/electron/src/renderer/components/diff/DiffChangesList.tsx:32-59`）

`dirPath`（Git 仓库根）、`sessionId`（路径授权）、`sessionPath?`/`workspaceFilesPath?`（badge/IPC 参数）、`onFileClick(filePath, isUntracked, gitRoot?)`、`refreshVersion?`（版本递增触发刷新）、`selectedFilePath?`（高亮）、`extraPaths?`、`workspaceSlug?`/`worktreeRepoPaths?`（WorktreeSelector）、`nonGitFileChanges?: SessionFileChange[]`（默认 `[]`）、`currentFileChangeRunId?`（本轮/更早划分）、`onPlainFileClick?`。

## 3. 内部逻辑与关键流程

### 3.1 Worktree 选择与缓存键（`apps/electron/src/renderer/components/diff/DiffChangesList.tsx:85-99`）

`agentSelectedWorktreeAtom` 按 session 存选中路径；`diffCacheKey = `${sessionId}:worktree:${path}`` 或 `${sessionId}:session`（`:88`）；`worktreeMode = {path, baseBranch:'origin/main'}`（`:90`）；`handleWorktreeSelect` 写 atom（`worktree?.path ?? null`，`:93-99`）。

### 3.2 Diff 数据缓存与拉取（`:101-168`）

- 初始 state 从 `agentDiffDataAtom[diffCacheKey]` 取缓存（避免空数组闪「没有代码改动」，`:101-109`）；`hasFetched` 区分 loading 与真·空（`:108-109`）。
- 缓存键切换 effect（`:116-123`，eslint-disable 注明只随 key 重置）：`fetchSeqRef += 1`（作废在途请求）+ 从新 key 的缓存重置四项 state。
- `fetchChanges`（`:142-164`）：`!dirPath && !worktreeMode` 短路（`:143`）；`requestId = ++fetchSeqRef.current`；worktree 模式走 `getWorktreeChanges(path, baseBranch, sessionId)`，否则 `getUnstagedChanges(dirPath, sessionPath, workspaceFilesPath, extraPaths, sessionId)`（`:146-148`）；**乱序响应丢弃**（`requestId !== fetchSeqRef.current` 即 return，`:149,160`）；成功写 state + 回存缓存 atom（`:154-158`）；catch 仅 `setIsGitRepo(true)+setHasFetched(true)`（`:161-162`，失败当空列表展示）。
- effect `[fetchChanges, refreshVersion]` 触发（`:166-168`）；窗口聚焦刷新统一在 `useGlobalAgentListeners`（注释 `:170`）。

### 3.3 未查看文件（`:125-140`）

`agentDiffUnseenFilesAtom`（session → Set<path>）；`markFileAsSeen(absPath)` 从 Set 删除（不在集合保持原引用，`:133`）。

### 3.4 还原（`:172-181`）

`handleRevert(filePath, gitRoot)`：`window.confirm('确定要还原 … 的所有变更吗？此操作不可撤销。')`（`:174`）→ `revertFile({dirPath, filePath, gitRoot, sessionId})` → `fetchChanges()`；失败 `window.alert('还原失败：…')`（`:179`）。

### 3.5 搜索/分组派生（`:183-238`）

- `toggleDir`（`:184-194`）：`collapsedDirs` Set 按 gitRoot 翻转。
- `fileGroups` memo（`:197-218`）：搜索（`filePath.toLowerCase().includes(q)`）→ 按 `gitRoot || ''` 分组（完整路径做 key 防同名目录冲突，`:199`）；`dirName = basename(gitRoot) || '/'`；组内累加 additions/deletions；`sources = Set(f.source)`。
- `nonGitFileGroups`（`:221-227`）：搜索过滤 + `groupSessionFileChanges(filtered, currentFileChangeRunId)` 得 `{current, earlier}`。
- `filteredUntrackedFiles`（`:229-233`）；`isEmpty`/`hasAnyChanges`/`shouldShowSearch`（`:235-237`）；`shouldShowWorktreeSelector = Boolean(workspaceSlug || (worktreeRepoPaths?.length ?? 0) > 0)`（`:238`）。

### 3.6 渲染（`:240-401`）

1. WorktreeSelector（`:243-251`）：空 diff/非 Git 空态也保留（注释 `:242`）。
2. 搜索框（`:254-283`）：计数 = 匹配 Git 文件 + 未追踪 + 非 Git 本轮/更早（`:269`）；清除按钮。
3. 非 Git 场景（`:290-321`）：「本轮改动」/「更早改动」两组 `NonGitFileRow`，点击 `onPlainFileClick?.(path)`。
4. 空态：非 Git 无变更「当前目录不是 Git 仓库」（`:285-289`）；Git 无变更 `hasFetched ? '没有代码改动' : '加载中…'`（`:322-326`）；搜索无匹配「没有匹配的文件」（`:327-331`）。
5. 文件组（`:332-381`）：目录 bar（折叠 chevron、来源 badge `SOURCE_CONFIG[src] ?? none`、`N changed files`/`+n`/`-n`，`:339-362`）；组内 `FileRow`（key `${gitRoot}:${filePath}`；`absPath = ${gitRoot||dirPath}/${filePath}` 斜杠归一，`:366`；选中匹配 absPath 或 filePath 双口径，`:371`；点击 `markFileAsSeen(absPath)` + `onFileClick(filePath, false, gitRoot)`，`:373`；`onRevert`，`:374`）。
6. 未追踪组（`:384-397`）：`UntrackedFileRow`，点击 `onFileClick(filePath, true, gitRoot)`。

`FileRow`（`:405-484`）：未查看圆点（`:438`）、`(已删除)` 标（`:446-448`）、tooltip 显 fullPath（`:455`）、+/− 行数 hover 隐藏让位操作钮（`:458-466`）、hover 还原钮 `Undo2`（`stopPropagation`，`:469-481`）。`UntrackedFileRow`：「新文件」amber badge（`:519-521`）。`NonGitFileRow`：`getFileBaseName`（注释 `:534`：Windows 反斜杠路径 split('/') 切不开）、`kind==='created'` → 「新建」emerald / 「已编辑」blue（`:554-559`）。

## 4. 调用者与调用链

入向（冻结树 grep）：`apps/electron/src/renderer/components/agent/SidePanel.tsx:36`（import）、`SidePanel.tsx:615`（渲染，传 dirPath/sessionId/onFileClick/refreshVersion/basePaths 等）。无测试引用（见 §9）。

出向：`./WorktreeSelector`、`@/lib/session-file-changes`（`groupSessionFileChanges`/`SessionFileChange`）、`@/atoms/agent-atoms`（`agentDiffUnseenFilesAtom`/`agentDiffDataAtom`/`agentSelectedWorktreeAtom`）、`@profer/shared`（`ChangedFileEntry`/`ChangeSource`/`UntrackedFileEntry`/`WorktreeInfo`）、`@/components/file-browser/FileTypeIcon`、`window.electronAPI.getWorktreeChanges|getUnstagedChanges|revertFile`（IPC）。

## 5. 数据 I/O、读写与副作用

- 读（IPC）：`getUnstagedChanges(dirPath, sessionPath, workspaceFilesPath, extraPaths, sessionId)` / `getWorktreeChanges(path, 'origin/main', sessionId)`。
- 写（IPC）：`revertFile({dirPath, filePath, gitRoot, sessionId})` —— **磁盘写**（git 还原，不可撤销）。
- Atom 读写：`agentDiffDataAtom`（diff 结果缓存）、`agentSelectedWorktreeAtom`（worktree 选择）、`agentDiffUnseenFilesAtom`（未查看集合）。
- 副作用：`window.confirm`/`window.alert`（原生对话框，`:174,179`）。
- 并发：`fetchSeqRef` 单调序号丢弃乱序响应（`:112-113,144,149,160`）；缓存键切换作废在途请求（`:117`）。

## 6. 分支、失败、取消与恢复

| 分支 | 行 | 行为 |
| --- | --- | --- |
| `!dirPath && !worktreeMode` | 143 | 不发请求 |
| 乱序响应 | 149,160 | 丢弃 |
| fetch 异常 | 159-163 | 当空列表（isGitRepo=true, hasFetched=true） |
| 还原确认框取消 | 174 | 直接 return |
| 还原失败 | 178-180 | alert 提示，列表不刷新 |
| 非 Git 无变更 | 285-289 | 「当前目录不是 Git 仓库」 |
| loading vs 空 | 322-326 | 「加载中…」/「没有代码改动」 |
| 搜索无匹配 | 327-331 | 「没有匹配的文件」 |

- 失败后状态：fetch 失败显示空列表（可 `refreshVersion`/重挂载重试）；还原失败无状态变化。
- 恢复：刷新信号（refreshVersion 递增）重跑 `fetchChanges`。不可恢复点：`revertFile` 成功后原变更不可撤销（用户确认文案明示 `:174`）。

## 7. 权限与权威状态

- 无渲染层 sender/role 检查；`sessionId` 是传给主进程 Git IPC 的**路径授权上下文**（props 注释 `:35`）。
- worktree 选择权威在 `agentSelectedWorktreeAtom`（session 级，本组件读写）；diff 数据权威在主进程 Git，渲染缓存于 `agentDiffDataAtom`。
- 还原是破坏性写操作，UI 阻断点=确认框（`:174`）；主进程侧授权未在本文件体现（未读）。

## 8. 修改影响面

- 改 `onFileClick`/`onPlainFileClick` 契约影响 `SidePanel.tsx:615` 的打开逻辑（diff/纯预览双路）。
- 改 IPC 签名（getUnstagedChanges/getWorktreeChanges/revertFile）需同步 preload/主进程 git 服务。
- 改 `agentDiffDataAtom` 缓存结构影响跨组件 diff 数据共享（`agent-atoms.ts:432` 注释提及 SWR 模式）。
- 改分组/搜索规则影响用户可见列表组织。

## 9. 测试证据

**无直接测试**：冻结树 `*.test.ts`/`*.test.tsx` 对 `DiffChangesList` 0 命中（检索范围：冻结树 apps/ 与 packages/，不含 docs）。间接：`session-file-changes` 的 `groupSessionFileChanges` 若有测试（`apps/electron/src/renderer/lib/session-file-changes.ts` 为纯函数库）不覆盖本组件装配（未见组件级引用）。

`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实 Git 操作。测试断言仅指静态读到的 expect 行——本文件没有。

缺口（静态判断）：乱序丢弃、还原确认/失败、分组聚合、搜索计数均无自动化断言。维护者验证：改动文件列表中点击/搜索/还原；切 worktree 看列表变化。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 仅 1 个导出（React.memo 组件） | 已证实 | 全文 `export` 逐条核（仅 `:69`） |
| 乱序响应按 fetchSeqRef 丢弃 | 已证实 | `:112-113,144,149,160` |
| 还原 confirm + alert 失败 | 已证实 | `:173-181` |
| worktree baseBranch 固定 origin/main | 已证实 | `:90` |
| 缓存初值防「没有代码改动」误闪 | 已证实 | `:101-109` |
| 选中匹配 absPath/filePath 双口径 | 已证实 | `:371` |
| 非 Git 本轮/更早按 runId 划分 | 已证实 | `:221-227` |
| 唯一调用点 SidePanel | 已证实（检索） | `SidePanel.tsx:36,615` |
| 主进程 Git/revert 授权细节 | 未知 | 文件外，未读实现 |
| 运行表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| worktree 选择/缓存键 | §3.1 | 85-99 | covered |
| fetchChanges 全分支 | §3.2,§6 | 142-168 | covered |
| 缓存重置 effect | §3.2 | 116-123 | covered |
| markFileAsSeen | §3.3 | 125-140 | covered |
| handleRevert | §3.4,§6 | 172-181 | covered |
| 搜索/分组 memo | §3.5 | 197-238 | covered |
| 渲染（selector/搜索/空态/分组/未追踪） | §3.6 | 240-401 | covered |
| `FileRow`/`UntrackedFileRow`/`NonGitFileRow` | §3.6 | 405-562 | covered |
| 测试 | §9 | — | unknown |

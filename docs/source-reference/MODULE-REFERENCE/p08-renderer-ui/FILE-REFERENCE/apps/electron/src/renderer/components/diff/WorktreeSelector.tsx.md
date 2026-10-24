---
path: apps/electron/src/renderer/components/diff/WorktreeSelector.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f095a4abb015958c0a7787d20c6144755a916bb0
sha256: 07eb1d8b5421ecfc58ec6041b2c5d0db2787bfc986d2b047a8c188728fd19f34
lines: 185
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-04-20261024
reviewer: docs-r07-qa-extra-04-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/components/diff/WorktreeSelector.tsx

## 1. 结论与边界

改动列表顶部的 worktree/分支选择器：从 workspace 配置与显式 repo 路径聚合仓库，拉各仓库的非主 worktree 列表（分支+HEAD），支持选择某个 worktree 或回“会话改动”，带手动刷新与点击外部收起（`apps/electron/src/renderer/components/diff/WorktreeSelector.tsx:1-34`）。

边界：

- 不做 git 操作本身（列 worktree 经 IPC，主进程执行）；不决定 diff baseRef 的消费（选择结果经 `onSelect` 抛给调用方）。
- 主 worktree（`isMain`）不出现在列表（`:74`）；某仓库失败静默跳过（`:78-80`）。
- 无任何非空 worktree 时整体不渲染（`:111`）。

## 2. 导出与关键符号

`export` 逐条核对：1 个函数（类/接口/常量导出 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `WorktreeSelector` | 函数（导出） | 28-185 | `({sessionId, workspaceSlug?, repoPaths?, selectedPath, onSelect}) => React.ReactElement` | 选择器组件 |
| `WorktreeSelectorProps` | 内部接口 | 7-13 | `{sessionId; workspaceSlug?; repoPaths?: string[]; selectedPath: string\|null; onSelect: (WorktreeInfo\|null)=>void}` | props；`onSelect(null)`=会话改动 |
| `RepoWorktrees` | 内部接口 | 15-18 | `{repo: WorkspaceWorktreeRepo; worktrees: WorktreeInfo[]}` | 按仓库分组 |
| `normalizePathKey` | 内部函数 | 20-22 | `(filePath) => string` | 转发 `normalizePathForCompare`（去重键） |
| `getPathBasename` | 内部函数 | 24-26 | `(filePath) => string` | 规范化后取末段，空则原路径 |

## 3. 内部逻辑与关键流程

`fetchWorktrees`（`apps/electron/src/renderer/components/diff/WorktreeSelector.tsx:40-88`）：

1. `setIsLoading(true)`；`workspaceSlug` 有值则 `getWorktreeRepos(workspaceSlug)` 按 `normalizePathKey(repoPath)` 入 `repoMap`（`:45-50`）。
2. `repoPaths` 中未在 map 的路径合成仓库项 `{name: getPathBasename(repoPath), repoPath, worktreesPath: '', priority: 0}`（`:52-62`，键重复跳过 `:55`）。
3. 无仓库 → `setRepoWorktrees([])` 返回（`:65-68`）。
4. 逐仓库 `listWorktrees(repo.repoPath, sessionId)`，`filter(!wt.isMain)` 后非空才入结果（`:71-77`）；单仓库失败 catch 空跳过（`:78-80`）。
5. 整体失败 → `setRepoWorktrees([])`（`:83-84`）；`finally setIsLoading(false)`（`:85-87`）。依赖 `[workspaceSlug, repoPaths, sessionId]`，组件挂载即跑（`:90-92`）。

派生（`:106-109`）：`allWorktrees`（flatMap）、`selectedWorktree`（`wt.path === selectedPath` 精确匹配）、`displayLabel`（分支名或「会话改动」）、`hasMultipleRepos`（仓库数 >1）。

渲染（`:113-184`）：头部触发按钮（`:116-128`，选中时高亮 `:122`）+ 刷新按钮（`e.stopPropagation()` + `fetchWorktrees`，`:129-138`，`isLoading` 时图标旋转）；下拉（`isOpen`，`:141-182`）：「会话改动」项 `onSelect(null)`（`:143-154`，`!selectedPath` 时高亮 `:150`）、多仓库时渲染仓库名分组头（`:157-161`）、每 worktree 按钮显示分支+`wt.head`（`:162-178`，`selectedPath === wt.path` 高亮 `:171`）。收起：外层 `mousedown` 监听（仅 `isOpen` 时挂，`:94-104`）。

## 4. 调用者与调用链

入向（冻结树 grep）：`apps/electron/src/renderer/components/diff/DiffChangesList.tsx:16`（import）、`DiffChangesList.tsx:244`（内联渲染，`DiffChangesList.tsx:238` `shouldShowWorktreeSelector = Boolean(workspaceSlug || (worktreeRepoPaths?.length ?? 0) > 0)` 决定挂载）。`SidePanel.tsx:148` 注释：选取逻辑已下沉至 DiffChangesList。无测试引用（见 §9）。

出向：`window.electronAPI.getWorktreeRepos(workspaceSlug)`/`listWorktrees(repoPath, sessionId)`（IPC）、`@profer/shared`（`WorktreeInfo`/`WorkspaceWorktreeRepo`/`normalizePathForCompare`）、`lucide-react`、`@/lib/utils`。

## 5. 数据 I/O、读写与副作用

- 读：两条 IPC（repo 配置、worktree 列表）；无写盘、无状态持久化。
- 状态：`repoWorktrees`/`isOpen`/`isLoading`/`dropdownRef` 全部组件内。
- 副作用：`document` 级 `mousedown` 监听（开下拉时挂、关即卸）；选择经 `onSelect` 抛出（调用方写入 diff 视图状态）。
- 并发：`fetchWorktrees` 可重复触发（刷新按钮），无竞态令牌——后发覆盖先发（最终 `setRepoWorktrees(results)` 以最后一次为准）。

## 6. 分支、失败、取消与恢复

| 分支 | 行 | 行为 |
| --- | --- | --- |
| 单仓库 `listWorktrees` 失败 | 78-80 | 静默跳过该仓库 |
| 整体异常/无仓库 | 65-68,83-84 | `repoWorktrees=[]` |
| 无非主 worktree | 111 | 渲染 `<></>`（整控件消失） |
| 点击外部 | 95-98 | `setIsOpen(false)` |
| `!selectedPath` | 108,150 | 显示「会话改动」并高亮 |

- 失败后状态：列表为空（可刷新重试，无自动重试）。
- 取消：无 AbortController；卸载后 promise settle 只触发 state 更新（React 忽略）。不可恢复点：无。

## 7. 权限与权威状态

无渲染层权限分支，依据：本文件无 sender/role 检查。worktree 数据权威在主进程（`listWorktrees` 按 `sessionId` 查询）；`selectedPath` 的权威由调用方（DiffChangesList）持有并下传。

## 8. 修改影响面

- 改 `onSelect`/props 形状需同步 `DiffChangesList.tsx:244` 的调用（及其 baseRef 传递链，见 `DiffChangesList.tsx:148` 注释）。
- 改 IPC 名称/参数需同步 preload 与主进程 `agent-workspace-manager.ts` 的 worktreeRepos 配置实现（`apps/electron/src/main/lib/agent-workspace-manager.ts:1748` 注释提示 repoPath 易失效）。
- 改「非主 worktree 过滤」影响用户可见列表范围。

## 9. 测试证据

**无直接测试**：冻结树 `*.test.ts`/`*.test.tsx` 对 `WorktreeSelector` 0 命中（检索范围：冻结树 apps/ 与 packages/，不含 docs）。间接：无。

`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI。测试断言仅指静态读到的 expect 行——本文件没有。

缺口（静态判断）：fetch 聚合/去重、单仓失败跳过、空列表隐藏、下拉交互均无自动化断言。维护者验证：带 worktree 的 workspace 打开改动列表，切换分支条目并刷新。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 仅 1 个导出 | 已证实 | 全文 `export` 逐条核（仅 `:28`） |
| `isMain` worktree 被过滤 | 已证实 | `:74` |
| 单仓失败静默跳过 | 已证实 | `:78-80` |
| 空列表渲染空片段 | 已证实 | `:111` |
| `onSelect(null)`=会话改动 | 已证实 | `:12,143-147` |
| 唯一调用点 DiffChangesList | 已证实（检索） | `DiffChangesList.tsx:16,244` |
| 合成仓库项（worktreesPath:''/priority:0）语义 | 已证实 | `:56-61` |
| 主进程 listWorktrees 失败语义 | 未知 | 文件外，未读实现 |
| 运行表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `fetchWorktrees` 全流程 | §3 | 40-88 | covered |
| repoMap 合成/去重 | §3 | 43-62 | covered |
| 点击外部收起 | §3,§6 | 94-104 | covered |
| 派生值 | §3 | 106-109 | covered |
| 头部/刷新/下拉渲染 | §3 | 113-184 | covered |
| 失败分支 | §6 | 78-84 | covered |
| 测试 | §9 | — | unknown |

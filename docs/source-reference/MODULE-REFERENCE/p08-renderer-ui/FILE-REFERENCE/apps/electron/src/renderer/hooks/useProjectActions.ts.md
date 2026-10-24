---
path: apps/electron/src/renderer/hooks/useProjectActions.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 42dd1930561cd91a790ef4d9bb363334578ccdf5
sha256: c6a60ae598f826d45e6b2e086ef4e85799d412c3ee7df28ea9c410302f616254
lines: 79
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/hooks/useProjectActions.ts

## 1. 结论与边界

项目切换/创建的共享 hook（运行时）：把底层 workspace 语义收敛为产品 UI 的“项目”动作，提供可见工作区列表、`selectProject` 切换与 `createProject` 创建（文件头注释 `apps/electron/src/renderer/hooks/useProjectActions.ts:1-6`）。

边界：不渲染任何 UI；不做工作区删除/重命名/归档（无此动作）；设置持久化只发 IPC 不做本地校验；团队工作区可见性由 `product-feature-flags` 决定，本文件不复制该规则（`:16` 只调用）。

## 2. 导出与关键符号

`export` 逐条核对：1 个函数导出（`UseProjectActionsResult` 为未导出内部接口）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `useProjectActions` | 函数（导出） | 31-79 | `() => UseProjectActionsResult` | 主 hook |
| `UseProjectActionsResult` | 接口（内部） | 19-29 | `{workspaces, allWorkspaces, currentWorkspaceId, selectProject, createProject}` | 返回形状（含 JSDoc 语义） |
| `selectProject` | 闭包（内部，返回） | 41-51 | `(workspaceId, opts?: {resetView?: boolean}) => void` | 切换 |
| `createProject` | 闭包（内部，返回） | 53-76 | `(name) => Promise<AgentWorkspace \| null>` | 创建 |
| `createInFlightRef` | ref（内部） | 39 | `boolean` | 并发护栏 |

## 3. 内部逻辑与关键流程

### 3.1 列表派生（`:32-38`）

`allWorkspaces` = `agentWorkspacesAtom` 全量（`:32`）；`workspaces` = `getVisibleAgentWorkspaces(allWorkspaces)` memo（`:33-36`）。可见性规则在 `apps/electron/src/renderer/lib/product-feature-flags.ts:16-27`：`archived` 隐藏、`slug==='default'` 隐藏、团队工作区受 `TEAM_WORKSPACE_UI_ENABLED`（冻结树内为 `false`，`product-feature-flags.ts:9`）控制。

### 3.2 `selectProject`（`:41-51`）

1. 在 `allWorkspaces` 查找（`:43`）；未找到或不可见（`getVisibleAgentWorkspaces([workspace]).length` 为 0）→ return（`:44`）。
2. 已是当前 → return（无副作用，`:45`）。
3. `setCurrentWorkspaceId`（`:46`）；`opts?.resetView !== false` 时 `setActiveView('conversations')`（`:47`，即默认重置视图，显式 `resetView:false` 保持）。
4. `window.electronAPI.updateSettings({agentWorkspaceId}).catch(console.error)`（`:48`，fire-and-forget）。

### 3.3 `createProject`（`:53-76`）

1. `name.trim()` 空 → 返回 null（无 toast，`:55-56`）；`createInFlightRef` 在飞 → 返回 null（无提示，`:57-58`），成功进入后置 true（`:58`）。
2. 成功路径（`:60-66`）：`window.electronAPI.createAgentWorkspace(trimmed)`（`:61`）→ 新工作区插入列表头部（`:62`）→ 设为当前（`:63`）→ `setActiveView('conversations')`（`:64`）→ `updateSettings` 持久化（`:65`）→ 返回 workspace。
3. 失败（`:67-70`）：`const msg = error instanceof Error ? error.message : '创建失败'` 后 `toast.error(msg)`（`:68-69`）并返回 null。
4. `finally` 复位护栏（`:71-73`）。

## 4. 调用者与调用链

入向（全树 `*.ts/*.tsx` 检索，证实）：

- `components/agent/WorkspaceSelector.tsx:24`（import）、`:29`（取全部 5 项）。
- `components/agent/CollapsedWorkspacePopover.tsx:17`（import）、`:29`（workspaces/currentWorkspaceId/selectProject/createProject）。
- `components/agent-skills/AgentSkillsView.tsx:43`（import）、`:71`（workspaces/currentWorkspaceId/selectProject）。

出向：`@/atoms/agent-atoms`（`agentWorkspacesAtom`/`currentAgentWorkspaceIdAtom`，`:12-14`）、`@/atoms/active-view`（`:15`）、`@/lib/product-feature-flags`（`:16`）、`@profer/shared` 类型（`:17`）、`window.electronAPI.createAgentWorkspace`（preload `apps/electron/src/preload/index.ts:911` 声明、`:2953` 实现桥）、`updateSettings`（`preload/index.ts:609` 声明、`:2540` 实现桥）、`sonner` toast（`:10`）。

## 5. 数据 I/O、读写与副作用

- 写（内存）：`agentWorkspacesAtom`（插入头部 `:62`）、`currentAgentWorkspaceIdAtom`（`:46,:63`）、`activeViewAtom`（`:47,:64`）。
- 写（IPC/持久化）：`updateSettings({agentWorkspaceId})` 两次（`:48,:65`，失败仅 `console.error`，对用户静默）；`createAgentWorkspace(name)` 建实体（`:61`，失败 toast）。
- 不直接读盘/网络；主进程侧行为不在本文件。
- 幂等/并发：`selectProject` 同 id 短路（`:45`）；`createProject` 用 ref 防重入（`:39,:56-58,:72`）。

## 6. 分支、失败、取消与恢复

| 分支 | 触发 | 行 | 用户可见结果 |
| --- | --- | --- | --- |
| 切换 no-op | id 不存在/不可见 | 44 | 无 |
| 切换 no-op | 已是当前 | 45 | 无 |
| 创建 null | 空名 | 55-56 | 无提示 |
| 创建 null | 在飞重入 | 57-58 | 无提示 |
| 创建失败 | IPC 抛错 | 67-70 | toast.error(消息) |
| 设置持久化失败 | updateSettings reject | 48, 65 | 仅 console.error |

无可取消/无恢复路径，依据：两个动作均为一次性同步编排 + 单次 IPC；`createAgentWorkspace` 成功但 `updateSettings` 失败时工作区已入列表而设置未持久化（`:62-65` 顺序），重启后当前工作区回退（推断，主进程行为未读）。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查；工作区实体权威在主进程（`createAgentWorkspace` IPC），本文件只是发起方；可见性过滤是产品开关不是权限。

## 8. 修改影响面

- 直接调用方 3 处（§4）：`WorkspaceSelector`/`CollapsedWorkspacePopover`/`AgentSkillsView`。改返回形状会同时破坏 3 个组件。
- `updateSettings` 的 `agentWorkspaceId` 是跨端持久化字段，改动键名需同步主进程 settings 读取方与 `active-tab-side-effects.ts:78`（同键写入）。
- 插入头部的顺序（`:62`）被 WorkspaceSelector 列表渲染依赖。
- 需同步的测试：无（0 test，§9）。

## 9. 测试证据

直接测试：**无**。全树 `*.test.ts`/`*.test.tsx`/`*.spec.ts` 检索 `useProjectActions` 0 命中。间接证据：无（无其它测试引用本 hook）。

真实断言：不适用。未覆盖：切换短路、创建在飞护栏、失败 toast、设置持久化失败静默。

NOT_RUN：本轮未运行任何测试/typecheck/构建/GUI/真实 IPC；以上行为均为冻结源码静态可见。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出 + 返回形状 5 字段 | 已证实 | `:19-31, 78` |
| selectProject 短路/重置视图/持久化 | 已证实 | `:41-51` |
| createProject 护栏/toast/finally | 已证实 | `:53-76` |
| 可见性规则（archived/default/team） | 已证实 | `product-feature-flags.ts:9,16-27` |
| 3 个调用方及行号 | 已证实 | 各文件 import/调用行 |
| preload 侧 API 存在 | 已证实 | `preload/index.ts:609,911,2540,2953` |
| 设置持久化失败后重启回退 | 推断 | 由 `:48,:65` fire-and-forget 推断 |
| 主进程 createAgentWorkspace 实现细节 | 未知 | 不在本批范围 |
| 运行期行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `useProjectActions` 导出 | §2 | 31-79 | covered |
| `UseProjectActionsResult` | §2 | 19-29 | covered |
| 列表派生+可见性 | §3.1 | 32-36 | covered |
| `selectProject` 全分支 | §3.2, §6 | 41-51 | covered |
| `createProject` 全分支 | §3.3, §6 | 53-76 | covered |
| IPC 出向 | §4, §5 | 48, 61, 65 | covered |
| 主进程行为 | §6, §10 | - | unknown（超出本批） |
| 运行期行为 | §9 | - | unknown（NOT_RUN） |

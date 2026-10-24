---
path: apps/electron/src/renderer/components/app-shell/left-sidebar/use-left-sidebar.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 23362ffec136254d235088773d295cb38c789275
sha256: 04ff0869f0024d95506dfa6569798d47c855f5c8127f3b8af10e94bf31d5b1e9
lines: 1952
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-01-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/app-shell/left-sidebar/use-left-sidebar.ts

## 1. 结论与边界

**左栏全部状态与业务逻辑 hook**（1952 行）：`useLeftSidebar()` 聚合会话/项目（工作区）/标签页/归档/拖拽/删除/迁移/渐进渲染等状态与 handler，返回约 150 项供 `LeftSidebar` → `rail.tsx`/`expanded-sidebar.tsx`/`sidebar-dialogs.tsx` 消费；`SidebarModel` 类型即返回值类型（`:1952`）。

边界：不渲染 UI（主组件只组装）；持久化/删除/重命名等均经 `window.electronAPI` 由主进程执行；权限判定（AI 速课堂锁定）是**渲染层 UI 门禁**（纵深防御），不是安全边界；会话树/分组算法在 `session-tree.ts`/`sidebar-utils.ts`（域外）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `useLeftSidebar` | 导出函数 | 132-1950 | `(): SidebarModel` | 唯一 hook；返回值约 150 键（`:1809-1949`） |
| `SidebarModel` | 导出类型 | 1952 | `ReturnType<typeof useLeftSidebar>` | 唯一类型导出 |

内部关键状态/回调（按主题）：

| 对象 | 行 | 说明 |
| --- | --- | --- |
| `activeViewRef` | 136-137 | render 期写 ref，供 `[]` 注册的导航 consumer 读最新视图 |
| `agentDraftIds` | 159-171 | markdown/html 草稿 + AskUser 答案草稿并集 |
| 导航注册 `navigationController.register` | 176-240 | 键盘/手柄左栏 roving focus（优先级 20） |
| `pendingDeleteId`/`pendingDeleteWorkspaceId`/`moveTargetId` | 243-248 | 三类确认弹窗状态 |
| `expandedExtraCountMap`/`collapsedWorkspaceIds`/`expandedRelatedParentIds` | 250-254 | 展开/折叠（折叠**刻意不持久化**） |
| `dragProjectId`/`projectDropIndicator` | 256-257 | 项目拖拽排序 |
| `workspaceSwitchTs` | 289-295 | 切换高亮时间戳（render 内检测差异，setTimeout 0 延迟 setState） |
| `setWorkspacesStable` | 297-305 | 内容等价时保留旧引用防级联重渲染 |
| `lockedWorkspaceIds`/`isAiClassWorkspaceLocked`/`handleAiClassLockedInteract` | 317-330 | AI 速课堂锁定（§7） |
| `accountCaps` | 333-338 | 账号能力（free 限 1 团队工作区）；`getAccountCapabilities` 静默吞错 |
| `progressiveCount` | 354-370 | 渐进渲染 40 条起步 + requestIdleCallback 补 40/次，硬上限 1000 |
| `cleanupMapAtoms(id)` | 413-498 | 会话删除/归档的客户端状态清理（§5） |
| `refreshArchivedCounts`/`refreshSidebarLists` | 599-633 | 归档计数 + 按视图拉列表（含未读恢复 `completedButUnconfirmed`） |
| `handleConfirmDelete` | 838-922 | 删除对话/Agent 会话（树级）与失败恢复 |
| `createAgentSessionInWorkspace` | 925-963 | 建会话（null=全局独立） |
| `handleSelectProject` | 972-1009 | 打开项目草稿会话（竞态 ref 保护） |
| `handleConfirmDeleteWorkspace` | 1026-1150 | 删项目级联（会话/Tab/自动化/状态清理+回退默认项目） |
| 项目拖拽五 handler | 1172-1272 | dragStart/Over/Leave/Drop/End（Drop 持久化排序） |
| `handleCreateProject`(+KeyDown) | 1285-1315 | 新建项目（Enter 提交/Esc 取消/输入法组合守卫） |
| `handleSelectAgentSession` | 1318-1348 | 打开会话/探索分支子 Tab + 清未读 |
| `handleMarkUnread` | 1351-1363 | 持久化 `completedButUnconfirmed` + 恢复绿标 |
| `handleToggleWorkspaceArchive` | 1389-1463 | 收纳/取出（仅可见性，§5） |
| `handleTogglePinAgent`/`handleToggleArchiveAgent` | 1524-1622 | 置顶/归档 + 委派子会话级联同步 |
| `closeArchivedAgentTabs` | 1504-1521 | 归档关 Tab + cleanupMapAtoms |
| `handleSessionMoved` | 1634-1649 | 迁移回调（关 Tab 同步回退激活 Tab） |
| `sortedWorkspaces` | 1657-1679 | default→recent→name 三种排序（recent 排除 draft/归档会话） |
| `agentGlobalSessionTrees`/`agentProjectGroups`/`agentSessionGroups` | 1682-1757 | 三类列表派生数据 |
| `handleRailModeSwitch` | 1765-1807 | chat/agent 模式切换（回开最近会话/已有 Tab） |

导出计数：`export` 2 条（`:132` 函数、`:1952` 类型），与源码一致。

## 3. 内部逻辑与关键流程

- **导航 roving focus**（`:176-240`）：`[data-profer-navigation-item]` 链（排除 `mode`）；`previous/next` 边界行为——最顶再 ↑ 进 mode 按钮，其余边界 `return false` 让焦点穿出左栏（注释 `:202-204`）；`confirm`→click；`planning`/`agent-skills` 的 right=进入（已激活只移交焦点，防 toggle 回对话），left=仅已激活时返回；`project` 的 left/right 收折子树（`:231-237`）。
- **草稿标记**（`:159-171`）：三个 Map（agent markdown/html、chat）+ AskUser 答案草稿（`requests[0]` 有 answers 非空）→ `agentDraftIds` Set。
- **列表刷新**（`:610-633`）：`listConversations/listAgentSessions(includeArchived= viewMode==='archived')` + `listAgentWorkspaces` + `getArchivedCounts`；启动恢复把 `completedButUnconfirmed` 会话加回未读 Set（幂等，`:616-628`）；触发点=挂载/视图切换/窗口 focus（`:645-656`）/团队同步事件（`:659-664`）/工作区变更广播（`:668-673`）/登录登出（`:677-679`）。
- **渐进渲染**（`:354-370`）：初始 40 条；`requestIdleCallback` 每次 +40（timeout 300ms）；`progressiveCount >= 1000` 停止；`mode-viewMode` 切换重置。
- **删除对话/会话**（`:838-922`）：agent 模式先 `collectDelegatedDeletionSessionIds`（含委派子会话树，域外算法）→ `removeDeletedClientState()`（成组关 Tab：循环 `closeTab` 后一次 `setTabs/setActiveTabId/mru`，注释 `:845-847` 防删除事务失败误关；再清 draft/`cleanupMapAtoms`/展开态/消息缓存）→ `deleteAgentSession` 失败时**树级删除 stopAndWait 失败不删任何持久化数据**，重拉列表恢复侧栏（`:893-901`）；chat 模式先清客户端状态再删，后端报错也本地移除（`:915-918`）。
- **删除项目**（`:1026-1150`）：`canDeleteWorkspace`（非 default 且总数>1，`:1015-1018`）→ `deleteAgentWorkspace` → 清每会话 `cleanupMapAtoms`/draft/消息缓存/自动化条目 → 关全部 Tab（`closeTab` 级联清浏览器 Tab）→ `syncActiveTabSideEffects` → 重拉 workspaces+sessions → 清展开/折叠态 → 若删的是当前项目回退 default 项目并写设置 → toast（`:1120-1122`）；失败 toast + finally 清 pending/deleting。
- **项目拖拽排序**（`:1172-1272`）：dragOver 以 y 比例 0.5 判 before/after（`:1192-1199`）；Drop 重排**仅 visible 子集**（`:1250-1254` 隐射回全量）、`reorderAgentWorkspaces` 持久化，失败回滚旧顺序 + toast（`:1259-1266`）。
- **收纳/取出工作区**（`:1389-1463`）：只切 `archived` 可见性——注释 `:1383-1388` 明确会话/记忆/Skills/MCP/定时任务全部保留、`listAgentWorkspaces()` 仍全量、桥接/飞书入口不受影响；收纳时关其全部会话 Tab（含浏览器 Tab `hideAgentBrowser`，`:1413-1448`）、toast 提示「定时任务仍会继续运行但产物会话不再显示」（`:1403-1411`）；收纳当前项目则切回 default/首个未归档（`:1451-1456`）。
- **置顶/归档级联**（`:1524-1622`）：`getSyncableDelegatedChildren` 得委派子会话，逐个同步置顶/归档，级联后重拉列表；失败且级联过则重拉恢复（`:1561-1570`、`:1609-1620`）；归档成功 `closeArchivedAgentTabs`（`:1599-1601`）。
- **模式切换**（`:1765-1807`）：优先回开最近 id（仍在列表中）→ 已有同模式 Tab → 最近非归档非草稿会话 → `setMode`。
- **排序**（`:1657-1679`）：`recent` 按项目内最新会话 `updatedAt`（排除 draft/归档，注释 `:1660-1661`：防点项目刷新草稿时间）；`name` 用 `workspaceNameCollator`；`default` 原序。

## 4. 调用者与调用链

- 入向（全冻结树 `grep use-left-sidebar|useLeftSidebar|SidebarModel`，apps+packages 全类型）：
  - `apps/electron/src/renderer/components/app-shell/LeftSidebar.tsx:19` import、`:33` `const s = useLeftSidebar()`（主组件 65 行，仅组装）。
  - `left-sidebar/expanded-sidebar.tsx`、`rail.tsx`、`sidebar-dialogs.tsx`、`types.ts` 经 props 解构消费返回值（`SidebarModel`）。
- 出向（依赖面）：jotai atoms（conversation/agent/tab/theme/settings/cdut 等 8 组 import，`:12-129`）；`window.electronAPI` 约 25 个方法（createAgentSession/deleteAgentSession/togglePinAgentSession/toggleArchiveAgentSession/updateAgentWorkspace/reorderAgentWorkspaces/createAgentWorkspace/deleteAgentWorkspace/ensureProjectDraftAgentSession/listAgentWorkspaces/listAgentSessions/getArchivedCounts/getWorkspaceCapabilities/getAccountCapabilities/updateSettings/getUserProfile/setAgentCompletionState/regenerateAgentSessionTitle/updateAgentSessionTitle/hideAgentBrowser/team.onWorkspacesSynced/onAgentWorkspacesChanged 等）；域外模块 `./sidebar-utils`、`./session-tree`（`buildAgentSessionTrees`/`collectDelegatedDeletionSessionIds`/`getDirectRelatedChildren`/`getSyncableDelegatedChildren`/`hasPinnedVisibleParent`）、`./navigation-items.focusEnterableViewItem`、`@/hooks/useOpenSession`、`@/hooks/useSyncActiveTabSideEffects`、`@/lib/exploration-tab`、`@/lib/navigation-controller`、`@/lib/agent-session-list`、`@/lib/product-feature-flags.getVisibleAgentWorkspaces`、`@/lib/cdut-ai-class.isAiClassWorkspace`、`@/components/diff/DiffTabContent.clearPreviewCacheForSession`。

## 5. 数据 I/O、读写与副作用

- 磁盘：**无直接**；全部持久化经 `window.electronAPI`（settings、会话/工作区索引在主进程）。
- `cleanupMapAtoms(id)`（`:413-498`）= 删除/归档终态清理：20+ 个 Map/Set atom 条目（含 AskUser 答案按 requestId 逐个删，`:455-471`）；待发附件先 `URL.revokeObjectURL` + `window.__pendingAgentFileData.delete`（`:476-483`）；**atomFamily 显式 `.remove(id)` 8 个**（`:487-495`：`agentSessionStreamingStateAtomFamily`/`liveMessagesAtomFamily`/`agentSessionDraftAtomFamily`/`agentSessionDraftHtmlAtomFamily`/`agentPendingFilesAtomFamily`/`backgroundTasksAtomFamily`/`sessionPersistedPermissionModeAtom`/`sessionExistsAtom`），同段另有 `store.set(tabMinimapCacheAtom, deleteKey)`（`:494`，**set 语义按键删除**，非 remove；与 8 个 remove 合计 9 项缓存清理操作）；注释：Jotai string key 强引用 Map 不 remove 永不释放。`clearPreviewCacheForSession`。
- 缓存/全局状态：jotai store；`sessionExistsAtom.remove` 等家族缓存释放。
- 副作用：toast（sonner）约 20 处；`window.electronAPI.updateSettings({agentWorkspaceId})`（切换项目即写设置，`:930`、`:982`、`:1296`）；`hideAgentBrowser`（收纳时）；`requestIdleCallback` 渲染调度；60s 相对时间 tick（`:373-376`）。
- 并发/竞态：`projectSelectionRequestRef`（`:978`、`:1002`）防快速切换项目时旧草稿会话覆盖；`setWorkspacesStable` 防级联重渲染；归档/删除 Tab 更新成组（`:845-854`）。

## 6. 分支、失败、取消与恢复

- 删除会话失败：树级删除失败**不删持久化数据**，重拉列表恢复侧栏（`:893-901`）；chat 删除后端报错仍本地移除（`:915-918`）。
- 项目排序失败：回滚旧顺序 + toast（`:1262-1266`）。
- 置顶/归档级联失败：重拉列表恢复（`:1561-1570`、`:1609-1620`）。
- `getAccountCapabilities`/`getWorkspaceCapabilities` 失败静默（`:337`、`:533` catch console.error）。
- `handleCreateProjectKeyDown`：`isComposing` 时 Enter 不提交（`:1307`）；Esc 取消。
- 取消：无 AbortController；弹窗 pending 状态即取消机制（`setPendingDeleteId(null)`）。
- 重启恢复：未读绿标经 `completedButUnconfirmed` 持久化恢复（`:616-628`）；折叠态不持久化（`:251` 注释）。

## 7. 权限与权威状态

- **AI 速课堂锁定**（渲染层 UI 门禁，纵深防御，非安全边界）：`cdutAccount.status !== 'active'` 时 `isAiClassWorkspace(w)`（slug 名匹配，`cdut-ai-class.ts:11-16`）的工作区入 `lockedWorkspaceIds`（`:317-320`）；拦截点：①`handleSelectProject`（`:973-977`）、②`handleSelectAgentSession`（`:1320-1324`，注释「即便 UI 层被绕过也绝不打开」）、③拖拽 dragOver（`:1183-1186`）与 Drop 落点（`:1224-1228`）拒绝；渲染侧 `isAiClassWorkspaceLocked`（`:322-326`）+ 点击拉起 `handleAiClassLockedInteract`（`:328-330`）→ `cdutAiClassLockPromptAtom`。
- 产品可见性：`getVisibleAgentWorkspaces`（`product-feature-flags.ts:26-30`）过滤团队/隐藏工作区；`archivedWorkspaces` 排除 `type==='team'`（`:1377-1381`，团队工作区由 `TEAM_WORKSPACE_UI_ENABLED` 另行控制）。
- 权威状态：会话/项目元数据权威在主进程索引；hook 状态是渲染副本，靠 focus/事件重拉同步（§3 列表刷新）。

## 8. 修改影响面

- 消费组件：`LeftSidebar.tsx`（65 行组装）、`rail.tsx`、`expanded-sidebar.tsx`、`sidebar-dialogs.tsx`、`types.ts`（均域外，返回值键变化需同步）。
- IPC 面：§4 列出的约 25 个 `electronAPI` 方法；返回形状由 `@profer/shared` 类型约束。
- `cleanupMapAtoms` 是多面板状态一致性的关键：新增 per-session atom 需同步加入清理（否则删除会话后残留）。
- 共享算法：`session-tree.ts`（树/委派收集）、`sidebar-utils.ts`（分组/排序/折叠工具）改动直接影响本 hook 输出。
- 测试：**无专属测试**（检索范围：冻结树 `*.test.ts(x)` 引用检索 0 命中；`dark-mode-guards.test.ts` 仅按路径列 FeatureTour 白名单，不涉本文件）。

## 9. 测试证据

- 直接测试：**无**。全冻结树 `*.test.ts`/`*.test.tsx` 引用检索（`use-left-sidebar|useLeftSidebar|SidebarModel`）0 命中。
- 间接证据：无（`dark-mode-guards.test.ts` 为样式守卫脚本测试，不含本文件行为断言）。
- 未覆盖：全部 handler/派生数据无测试；删除失败恢复、级联置顶/归档、拖拽排序、渐进渲染均未测。
- `NOT_RUN`：未运行 bun test/产品测试/typecheck/build/Electron-GUI；测试断言≠已运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出、返回值 ~150 键 | 已证实 | `:132`、`:1809-1949`、`:1952` |
| AI 速课堂三类拦截点（选择/拖拽） | 已证实 | `:973-977`、`:1320-1324`、`:1183-1228` |
| 收纳只切可见性、资源全保留 | 已证实 | `:1383-1388` 注释 + `:1389-1463` 实现 |
| 删除树级失败不删持久化数据+重拉恢复 | 已证实 | `:893-901` |
| atomFamily 显式 remove 8 个 + tabMinimapCache set 键删（共 9 项缓存清理）防泄漏 | 已证实 | `:487-495` |
| 排序 recent 排除 draft/归档会话 | 已证实 | `:1663-1667` |
| 渐进渲染 40/40/上限 1000 | 已证实 | `:354-370` |
| 无专属测试 | 已证实 | 全冻结树 test 引用检索（§9 范围） |
| `session-tree`/`sidebar-utils` 算法细节 | 未知 | 域外文件，仅按调用点记 |
| 运行时渲染/交互行为 | 未知 | NOT_RUN |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 导航 roving focus | §3 | 176-240 | covered |
| 草稿/AskUser 标记 | §3 | 159-171 | covered |
| 列表刷新/未读恢复 | §3 | 599-679 | covered |
| 渐进渲染 | §3 | 354-370 | covered |
| `cleanupMapAtoms` | §5 | 413-498 | covered |
| 删除对话/会话+恢复 | §3/§6 | 838-922 | covered |
| 建会话/选项目（竞态 ref） | §3 | 925-1009 | covered |
| 删项目级联 | §3 | 1026-1150 | covered |
| 拖拽排序 | §3/§6 | 1172-1272 | covered |
| 新建项目 | §3 | 1285-1315 | covered |
| 选会话/未读/迁移 | §3 | 1318-1363,1634-1649 | covered |
| 收纳/取出 | §3 | 1389-1463 | covered |
| 置顶/归档级联 | §3/§6 | 1524-1622 | covered |
| 排序/派生列表 | §3 | 1657-1757 | covered |
| 模式切换 | §3 | 1765-1807 | covered |
| AI 速课堂锁定 | §7 | 317-330,973-977,1183-1228,1320-1324 | covered |
| 运行/交互行为 | §10 | — | unknown（NOT_RUN） |

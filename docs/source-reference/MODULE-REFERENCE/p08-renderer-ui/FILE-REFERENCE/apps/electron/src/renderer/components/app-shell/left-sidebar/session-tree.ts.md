---
path: apps/electron/src/renderer/components/app-shell/left-sidebar/session-tree.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e840db548340237e2dc7eaeccf7d89f19dedd630
sha256: df5bf5ab0064e86238a848bb3dfe8e6e207e7781adc3474ad338c932eb0b7b24
lines: 253
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/app-shell/left-sidebar/session-tree.ts

## 1. 结论与边界

关联会话树构建与状态聚合（文件头 `:1-6`）：关联会话识别、树构建、状态优先级聚合、子会话计数、可见性判断。**纯函数，不依赖 React/atom**。

## 2. 导出与关键符号

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `AgentSessionTreeItem` | `:11-14` | `{session; childSessions[]}` |
| `ACTIVE_SESSION_STATUSES` | `:16-20` | {blocked, running, completed} |
| `PROJECT_SESSION_EXPAND_STEP=10` | `:23` | “显示更多”每次展开数 |
| `ACTIVE_SESSION_STATUS_PRIORITY` | `:25-30` | blocked 0 < running 1 < completed 2 < idle 3 |
| `isDelegatedChildSession` | `:33-35` | parentSessionId && sourceDelegationId |
| `isExplorationChildSession` | `:38-40` | explorationParentSessionId && explorationSourceMessageId（**独立血缘，不参与委派删除级联**，`:37`） |
| `getRelatedParentSessionId` | `:42-46` | 委派→parent；探索→explorationParent |
| `buildAgentSessionTrees` | `:48-78` | 树构建 |
| `getDelegatedChildStatus` | `:80-91` | 状态聚合（时序窗口修复见 §3） |
| `getRelatedChildStatus`/`getSessionTreeStatus` | `:93-121` | 父行状态聚合 |
| `DelegationSummary`/`getDelegationSummary` | `:123-141` | running 只采用持久化 delegationStatus（`:129-133`：终态不伪装完成） |
| `RelatedSessionSummary`/`getRelatedSessionSummary` | `:143-172` | 标签三态+`showCount`（仅纯委派显示 x/y——探索分支看“跑出结论”非“看了没看”，`:145-151`） |
| `treeContainsSessionId`/`collectTreeSessionIds` | `:174-186` | 树内查找/收集 |
| `getDirectDelegatedChildren`/`getDirectRelatedChildren` | `:188-208` | 直接子查询（后者同 workspace 过滤） |
| `collectDelegatedDeletionSessionIds` | `:211-231` | 删除级联收集（**防御环**，`:210`——visited 集） |
| `hasPinnedVisibleParent` | `:233-241` | 父 pinned 且未归档同 workspace |
| `getSyncableDelegatedChildren` | `:243-253` | 可同步子（非 archived/非 draft/不在草稿集） |

## 3. 内部逻辑与关键流程

### 3.1 树构建（`:48-78`）

父存在且**同 workspaceId** 才归并为子（`:55-63` 注释：委派树不得跨项目归并，异常 workspaceId 保持可见根节点防“被合并进另一个项目”）；否则作根。

### 3.2 状态聚合（`:80-121`）

- `getDelegatedChildStatus`：实时 blocked/running 直接返回；**持久化 delegationStatus==='running' 时不让“completed 指示先到、delegationStatus 后更”的时序窗口误显示已完成**（`:85-88`）。
- `getSessionTreeStatus`：子只上聚合 blocked/running（“已完成未查看”是后台结果不保持绿标，`:109-111`）；父 blocked/running 优先、completed 次之、否则 idle。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：`left-sidebar/` 列表渲染与删除/同步链路；直接测试 `session-tree.test.ts`。出向：类型 `@profer/shared`/`@/atoms/agent-atoms`。

## 5. 数据 I/O、读写与副作用

无（纯函数模块；仅类型 import，运行时零副作用）。

## 6. 分支、失败、取消与恢复

环防御（`:224-227`）；跨 workspace 不归并（`:60-63`）；状态时序窗口（`:85-90`）。

## 7. 权限与权威状态

- 探索/委派血缘分离（删除级联只走委派）。
- running 只认持久化 delegationStatus（防终态伪装）。
- showCount 口径如实（不与时间/菜单抢位）。

## 8. 修改影响面

改树/聚合 → 影响侧栏会话行状态与删除级联；`AgentSessionMeta` 契约联动 shared。

## 9. 测试证据

本轮 `NOT_RUN`。直接测试 `session-tree.test.ts`（详见其手册）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 血缘分离/跨项目不归并 | 已证实 | `:37-40/:55-63` |
| 时序窗口修复 | 已证实 | `:85-90` |
| 删除级联防环 | 已证实 | `:210-231` |
| 运行表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 类型/常量族 | 2 | `:11-30` | covered |
| 识别/树构建 | 3.1 | `:33-78` | covered |
| 状态/汇总族 | 3.2 | `:80-172` | covered |
| 查询/级联/过滤 | 2 | `:174-253` | covered |

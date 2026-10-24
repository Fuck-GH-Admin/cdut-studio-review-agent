---
path: apps/electron/src/renderer/components/app-shell/left-sidebar/sidebar-dialogs.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f3152fe00c2f56a3f19a4f5cfc5b150886d8d72c
sha256: f3883c72d2f7ae4eb1f0761d3a778905eb24f6994d90434502b66f6dc31e5968
lines: 121
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/app-shell/left-sidebar/sidebar-dialogs.tsx

## 1. 结论与边界

侧边栏弹窗（文件头 `:1-6`）：删除会话/删除项目/迁移会话三个弹窗（标题注释称“四个弹窗”，实际渲染 3 个——照实并记），经 hook 返回值 `SidebarModel` 读状态；**collapsed/expanded 共享同一实例**（避免 Radix Portal 双实例叠遮罩）。纯装配（逻辑在 hook）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `SidebarDialogs` | function 组件 | `:22-121` | `({s: SidebarModel})` 三弹窗装配 |

## 3. 内部逻辑与关键流程

### 3.1 删除会话确认（`:43-73`）

`pendingDeleteId` 驱动；描述按 `pendingDeleteDelegatedChildCount` 分支——**含协作子会话时明示“同时永久删除 N 个协作子会话”**（`:58-60`）；Enter 直接确认（弹窗内 keydown）；Action destructive。

### 3.2 删除项目确认（`:76-108`）

描述明示全量删除范围（**“会话、自动任务、MCP、Skills、工作区文件和本地项目目录。附加目录和附加文件只会移除引用，不会删除原始文件”**，`:94`）；`deletingWorkspaceId` 期间禁用按钮+“删除中...”；Enter 防重入；`onCloseAutoFocus` 阻止焦点回跳。

### 3.3 迁移会话（`:111-118`）

`MoveSessionDialog`（`@/components/agent/`）：`moveTargetId` 驱动；传 workspaces/currentWorkspaceId/`onMoved=handleSessionMoved`。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：`LeftSidebar` 外层（唯一实例）。出向：`./use-left-sidebar`（SidebarModel）、`@profer/ui`（AlertDialog 族）、`@/components/agent/MoveSessionDialog`。

## 5. 数据 I/O、读写与副作用

无直接 I/O（动作在 hook handler）。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 协作子会话>0 | `:58-60` | 描述明示连带删除 |
| 删除中 | `:79-104` | 禁用/防关/防重入 |
| 取消 | 各 onOpenChange | 清 pending 状态 |

## 7. 权限与权威状态

**破坏性操作全量披露**（删除项目范围/附加资源只移除引用不删原文件）；子会话连带删除明示。

## 8. 修改影响面

改弹窗 → 影响删除/迁移交互；hook handler 契约联动。

## 9. 测试证据

本轮 `NOT_RUN`。本批清单中无直接测试文件；`bun test`/typecheck/GUI 均未运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 共享单实例（防双遮罩） | 已证实 | 文件头 |
| 破坏性范围全披露 | 已证实 | `:58-60/:94` |
| “四个弹窗” vs 实渲染 3 个 | 已证实（并记） | 文件头 vs `:40-119` |
| 运行表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `SidebarDialogs` 三弹窗 | 2/3 | `:22-121` | covered |

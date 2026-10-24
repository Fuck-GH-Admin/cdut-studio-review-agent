---
path: apps/electron/src/renderer/components/app-shell/left-sidebar/expanded-sidebar.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2900f74d751462eb6320dce130e3bb7fda3ab770
sha256: 3ce07c5ed91f1ebdc61d3d6c1864fb09f41be9c42defdb0b5740106355943896
lines: 674
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/app-shell/left-sidebar/expanded-sidebar.tsx

## 1. 结论与边界

展开态完整侧边栏（文件头 `:1-4`）：从 LeftSidebar 抽离的展开态视图，经 `SidebarModel` 读状态/handler。单组件 `ExpandedSidebar`（`:24-674`），渲染区块化。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ExpandedSidebar` | function 组件 | `:24-674` | `({s: SidebarModel})` |

## 3. 内部逻辑与关键流程

渲染区块（自上而下，`:113-673`）：

1. **macOS 红绿灯避让留白**（`:119`，留白自身可拖拽——同 rail 口径）。
2. **Header**（`:122`）：Logo+Welcome+收起按钮。
3. **顶级开关区**（`:146`）：Agent 顶级开关 + 下方同级 CDUT 专区开关。
4. 新对话/新会话 + 搜索按钮（`:207`）。
5. **自动任务入口**（`:230`）：任务中心入口在置顶区上方、**不参与置顶列表层级**。
6. **Agent 技能入口**（`:239`）：Skills/MCP 能力中心，仅 Agent 模式可见。
7. **已归档入口**（`:251`）：紧随技能（Agent）/自动任务（Chat）之下、会话列表之上。 **archivedUnread 红点语义**（NB103-SEM-02）：后台静默归档未读时点亮红点（Mail 红点标记），点开归档视图即灭（读后清零口径）。
8. **会话列表**（`:284-`）：置顶+对话历史——①全局独立会话（不指定工作区，`:357`）；②项目列表（`:434`：收纳工作区入口/项目排序切换（`getNextWorkspaceSortMode` 三态循环）/新建项目）。
9. **归档视图**（`:578-`）：标题栏+单列表布局。
10. **底部**（`:655`）：用户资料+设置入口。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：`LeftSidebar`（展开分支）。出向：`./use-left-sidebar`（SidebarModel）、`./session-items`/`./navigation-items`/`./sidebar-utils`/`./session-tree`、`@profer/ui`。

## 5. 数据 I/O、读写与副作用

无直接 I/O；全部动作经 SidebarModel handler 由 hook 执行。本文件仅渲染区块。

## 6. 分支、失败、取消与恢复

模式（Agent/Chat）区块显隐；归档视图/列表视图切换；排序三态；无异步。

## 7. 权限与权威状态

区块层级口径如实（自动任务不参与置顶层级/已归档位置）。

## 8. 修改影响面

改视图 → 影响侧边栏主交互面；session-items/rail 共享数据源。

## 9. 测试证据

本轮 `NOT_RUN`。本批清单中无直接测试文件；`bun test`/typecheck/GUI 均未运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 区块化结构/层级口径 | 已证实 | `:113-673` 注释 |
| 红绿灯避让同 rail | 已证实 | `:119` |
| 运行表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `ExpandedSidebar` 十区块 | 2/3 | `:24-674` | covered |

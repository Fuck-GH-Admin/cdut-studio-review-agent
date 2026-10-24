---
path: apps/electron/src/renderer/components/app-shell/left-sidebar/session-items.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 211a810aa6418613724700830fba3d21a8ebc2c3
sha256: b6cf3f1bc5d192a23ac6c066a78a5fe21f55776851196da7411d22d5e312fa1a
lines: 1479
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/app-shell/left-sidebar/session-items.tsx

## 1. 结论与边界

侧边栏列表项子组件（文件头 `:1-8`）：从 LeftSidebar.tsx 整体平移的 **React.memo 列表项**（逻辑保持不变）——safe-tooltip/操作按钮组（时间、置顶、归档、三点菜单）、对话行 `ConversationItem`、Agent 会话行 `AgentSessionItem`/`RelatedChildSessionItem`、项目分组 `AgentProjectGroupItem`。纯展示+回调透传。

## 2. 导出与关键符号

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `AgentProjectGroup` | `:78-82` | 项目分组数据 |
| `SessionItemActionsProps`/操作按钮组 | `:85-` | 时间/置顶/归档/三点菜单（hover 切换） |
| `PINNED_SESSION_MAX_HEIGHT` | `:76` | 置顶区约 6 行高（`PINNED_SESSION_VISIBLE_LIMIT=6`×32px，超内部滚动） |
| `ConversationItem`/`AgentSessionItem`/`RelatedChildSessionItem`/`AgentProjectGroupItem` | 文件尾段 | 各行组件（React.memo） |

内部常量（`:57-75`）：`PROJECT_SESSION_PREVIEW_LIMIT=5`、`RENAME_SHORTCUT_OPTIONS={exclusive:true}`、`PROJECT_TITLE_DOUBLE_CLICK_DELAY_MS=500`（Electron 无系统双击间隔，保守窗口防慢双击误开项目）、`PROJECT_SESSION_RECENT_WINDOW_MS=3 天`、`PROJECT_SESSION_EXPAND_STEP=10`。

## 3. 内部逻辑与关键流程

### 3.1 重命名快捷键独占模式（`:59-66`，关键注释）

同一活跃会话可同时挂两处（顶部「当前会话」+项目列表/置顶区）；非独占时 registry 逐个执行 handler → **两行同时进编辑态**；独占只执行最后注册（DOM 更靠后的行）。

### 3.2 `SafeTooltip`（`:100-173`）

**Radix Popper 初始 (0,0) 闪现修复**：操作按钮默认 hidden hover 才显，Content 首挂而 trigger 未布局时浮层先落视口左上角再跳位——打开后延迟渲染 Content 让 Popper 完成定位；trigger rect 为 0 不开。

### 3.3 操作区（`:174-`）

默认显示相对更新时间，hover 切换「置顶/归档/三点菜单」按钮组。

### 3.4 关键语义补录（NB103-SEM-01 六项，源证逐条核对）

- **locked 安全态**（`:631/:760-788`）：未登录特区账户的 AI 速课堂会话**禁止一切查看/交互**——`aria-disabled`、`draggable` 禁用、不渲染右键/操作按钮/MiniMap（`disableMiniMap||menuOpen||!!locked` 门控 hover 预览，`:672`）、点击转登录引导弹窗、**阻断一切内容泄露**；重命名快捷键同样锁（`:707`）。
- **图标语义族**（`:14` import 族）：Clock=自动任务来源、GitFork=探索分支、GitBranch=委派、Globe=活动浏览器、Loader2=标题重生成、Lock=锁定。
- **`getSessionLeftAccent` 状态条三色**（`:573-595`）：blocked→orange / running→blue / completed→green（配对 left-accent 背景/文字映射）。
- **归档二次确认**（`:196`）：`archiveConfirming` 态 **3000ms 超时复位防误触**。
- **`SessionMiniMapPopover` hover 预览**（`:378/:554`）：`useSessionMiniMapHover(600, …)` 600ms 延迟；**菜单打开时关闭防遮挡**。
- **AgentProjectGroupItem 折叠策略**：**活跃会话（blocked/running/completed）全展示不受 5 条/3 天限制**；排序 blocked>running>completed、置顶最顶；选中会话不可见时临时插入；hiddenCount+"显示更多"（每次 +10，`PROJECT_SESSION_EXPAND_STEP`）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：`expanded-sidebar.tsx` 会话列表/置顶区。出向：`@profer/ui`、`./sidebar-utils`/`./session-tree`、快捷键 registry。

## 5. 数据 I/O、读写与副作用

无直接 I/O；操作经 props 回调由 hook/父级执行。本文件仅列表项展示。

## 6. 分支、失败、取消与恢复

hover 显隐/双击窗口/独占注册；无异步。

## 7. 权限与权威状态

修复口径如实（Popper 闪现/双行编辑/双击窗口均注释根因）。

## 8. 修改影响面

改行组件 → 影响会话列表交互全貌；与 expanded-sidebar 共享。

## 9. 测试证据

本轮 `NOT_RUN`。本批清单中无直接测试文件；`bun test`/typecheck/GUI 均未运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 独占注册防双行编辑 | 已证实 | `:59-66` |
| SafeTooltip 防 (0,0) 闪现 | 已证实 | `:100-106` |
| 置顶区限高/双击窗口 | 已证实 | `:68-76` |
| 运行表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 常量/独占口径 | 2/3.1 | `:57-76` | covered |
| `SafeTooltip`/操作区 | 3.2-3.3 | `:85-` | covered |
| 四类行组件 | 2 | 尾段 | covered |

---
path: apps/electron/src/renderer/components/app-shell/SearchDialog.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 35317dbff4bb8da72c1f3d0071dcaa77c8807010
sha256: 6dad0205b86789a93c34da00be895ea40661fcfa90694dd909bcb1d83bf3a9e4
lines: 662
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/app-shell/SearchDialog.tsx

## 1. 结论与边界

全局搜索 Dialog（文件头 `:1-15`）：浮动搜索面板——手动触发（点按钮/输入框 Enter）、标题+消息内容统一渲染（匹配高亮）、键盘导航（↑↓ 选择/Enter 打开/Esc 关闭）、同时搜 Chat 和 Agent。**为什么手动触发**（`:10-11`）：历史变多后自动搜索每次按键扫全量 JSONL、主进程 IO 阻塞卡顿；手动触发只在意图确认时执行一次。**Enter 双语义**（`:13-15`）：已有结果且有选中→打开会话；否则（首搜/改词）→触发搜索。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `SearchDialog` | 组件 | `:213-662` | 主组件（`searchDialogOpenAtom` 驱动） |

内部：`TitleResult`/`ContentResult`（`:48-68`，统一格式+`isContentResult` 判别）；`HighlightText`/`HighlightSnippet`（`:75-124`，高亮/预计算位置 snippet）；`SearchResultIcon`/`SearchResultRow`（`:125-212`）。

## 3. 内部逻辑与关键流程

### 3.1 可见性过滤（`:228-257`）

`hiddenAgentSessionIds`：draft 会话 + 非默认 workspace 且不在可见 workspace 集的会话——搜索结果不外泄隐藏项目内容。

### 3.2 查询与竞态（`:259-330`）

`query`（实时输入）/`committedQuery`（**提交后才用于结果与高亮**）双态；`searchTokenRef` 请求 token 作废旧结果（防竞态）；IME `isComposingRef` 防输入法回车误触发；`handleClearQuery` 清空三态。

### 3.3 结果与导航（`:129-212`/尾部）

`SearchResultRow`（标题/内容两类、高亮、键盘选中态）；Enter 双语义判定（有选中→`openSession`；无→触发搜索）；Esc 关闭；工作区名映射（`workspaceNameMap`/`getAgentWorkspaceName`）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：`LeftSidebar`（`renderSearchDialog` 门控单实例）。出向：`@/atoms`（searchDialogOpen/sessions/workspaces/channels）、`useOpenSession`/`useCreateSession`、搜索 IPC（主进程 JSONL 扫描）。

## 5. 数据 I/O、读写与副作用

搜索经 IPC（主进程扫 JSONL）；atom 读写。无持久化。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| Enter 双语义 | 文件头/尾部 | 有选中打开 vs 触发搜索 |
| 旧请求返回 | `searchTokenRef` | 作废 |
| IME 组合中 | `isComposingRef` | 不误触发 |
| 隐藏会话 | `:243-257` | 过滤不出现在结果 |

## 7. 权限与权威状态

手动触发理由如实（IO 卡顿根因）；隐藏项目内容不进搜索结果（可见性过滤）。

## 8. 修改影响面

改搜索 → 影响全局检索体验；双实例约束见 types.ts/LeftSidebar 注释。

## 9. 测试证据

本轮 `NOT_RUN`。本批清单中无直接测试文件；`bun test`/typecheck/GUI 均未运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 手动触发根因/双语义 | 已证实 | 文件头 |
| 请求竞态/IME 防护 | 已证实 | `searchTokenRef`/`isComposingRef` |
| 隐藏内容过滤 | 已证实 | `:243-257` |
| 运行表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 类型/高亮/行组件 | 2 | `:47-212` | covered |
| 过滤/查询/竞态 | 3.1-3.2 | `:228-330` | covered |
| 结果导航/双语义 | 3.3 | `:331-662` | covered |

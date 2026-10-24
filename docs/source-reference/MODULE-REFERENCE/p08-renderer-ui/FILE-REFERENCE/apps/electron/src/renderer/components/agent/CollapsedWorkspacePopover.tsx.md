---
path: apps/electron/src/renderer/components/agent/CollapsedWorkspacePopover.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 926ccdd8d49c4ac16069f4b081173b89ee93ed64
sha256: de6e764b45fb4ec82b9a8457c0670642c689ea62da44afe119ffc3f845f48e78
lines: 179
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/CollapsedWorkspacePopover.tsx

## 1. 结论与边界

折叠态侧栏的项目快速切换弹层（文件头 `:1-11`）：悬停折叠侧栏 Agent 模式按钮弹出——项目列表点击即切换 + 顶部 `+` inline 新建。**不含重命名/删除/拖拽等低频操作**；切换/创建经 `useProjectActions` 与展开态共享（行为一致）；悬停控制复用 ContextUsageBadge 的 cancelClose/scheduleClose 模式。React 受控 Popover。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CollapsedWorkspacePopover` | function 组件 | `:26-179` | `({children}) => ReactElement`（children 为触发器） |
| `HOVER_CLOSE_DELAY` | const（内部） | `:20` | 150ms（与项目其他 hover popover 一致） |

内部：`open/creating/newName/createInputRef/closeTimerRef` 状态；`cancelClose/scheduleClose`（`:34-44`）；`handleSelect/handleStartCreate/handleCreate/handleCreateKeyDown/handleContentMouseLeave`（`:53-93`）。

## 3. 内部逻辑与关键流程

- **悬停生命周期**：触发器 mouseEnter 开、mouseLeave 150ms 延迟关；`onClickCapture` 立即关（避免切模式后滞留，`:107-112`）；内容区 enter 取消关、leave 仅非 creating 时调度关（新建输入中不关，`:89-93`）；卸载清理定时器（`:46`）。
- **inline 新建**：`+` 进入 creating（rAF 聚焦输入）；Enter 提交（**`isComposing` 防中文输入法回车误交**，`:80`）、Escape/blur 取消；空名取消；`createProject(trimmed)` 成功关弹层。maxLength 50。
- **列表**：`workspaces`（useProjectActions）当前项高亮；点击 `selectProject`+关。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：折叠侧栏 Agent 模式按钮包裹。出向：`@profer/ui/primitives/popover`、`@/hooks/useProjectActions`（workspaces/currentWorkspaceId/selectProject/createProject）、`lucide-react`、`@/lib/utils.cn`。

## 5. 数据 I/O、读写与副作用

经 hook 切换/新建项目（上游持久化不在本组件）；本地定时器/focus。无直接 I/O。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| creating 中 hover 离开 | `:90-91` | 不关闭 |
| 空名/Escape/blur | `:69-72/:83-86/:168` | 取消新建 |
| Enter+isComposing | `:80` | 忽略（中文输入法） |
| createProject 返回空 | `:75` | 保持弹层 |

## 7. 权限与权威状态

无权限语义；项目数据经 `useProjectActions` 单一口径（与展开态共享）。

## 8. 修改影响面

改切换/新建 → 影响折叠态导航；`useProjectActions` 契约联动。

## 9. 测试证据

本轮 `NOT_RUN`。无直接测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 悬停 150ms 延迟关/新建态不关 | 已证实 | `:34-46/:89-93` |
| isComposing 防误交 | 已证实 | `:80` |
| 与展开态共享动作 | 已证实 | `:29`、文件头 |
| 运行表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 组件全流程 | 2/3 | `:26-179` | covered |

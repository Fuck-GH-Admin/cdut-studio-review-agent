---
path: apps/electron/src/renderer/components/planning/PlanningGroupManager.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: dc47deec555287663f0b2eb952a260172e5f0190
sha256: ece717d35c29865f09ccb9f9e79696b66047f4dcd2846261f3e2252c5b458ed4
lines: 168
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/planning/PlanningGroupManager.tsx

## 1. 结论与边界

轻量分组管理器（`:26-29`）：不单独占页面，只在当前工作流中提供新建/重命名/删除；**删除仅解除关联，目标 Todo 或日程本身不被删除**。受控（CRUD 经 props 回调），触发器由嵌入位置注入（`:13` 保证 Todo/日程入口视觉语境一致）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `PlanningGroupManager` | function 组件 | `:30-168` | `{scope(todo/日程); groups; trigger; itemLabel; getUsageCount; hasAssociatedItems?; showDeletionCount=true; onCreate; onRename; onDelete; onCreated?}`（Props `:11-24`） |

内部状态：`open/creating/newName/renamingId/renameName/pendingDeletion/savingAction`（`'create'\|'rename'\|'delete'` 互斥锁）；`renameInputRef`（rAF 自动选中重命名输入，`:41-44`）；`title` 按 scope（“Todo 分组/日程分组”）。

## 3. 内部逻辑与关键流程

- `closeManager`：关 Popover 时清全部编辑态（`:46-53`）。
- `createGroup/createGroup…`（`:55-`）：名空/`savingAction` 占用即忽略；savingAction 互斥防并发双提交。
- 标签行内重命名（Enter 确/Escape 取）；删除走 AlertDialog（描述披露“仅解除关联 + 使用计数”）；`hasAssociatedItems`/`showDeletionCount` 控制披露粒度。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：PlanningView（Todo/日程分组入口）。出向：`@profer/ui`（Popover/Dropdown/AlertDialog 族）、`@profer/shared`（PlanningGroup/Scope）。

## 5. 数据 I/O、读写与副作用

无直接 I/O（CRUD 经 props）；rAF 定时（卸载清理）。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 空名/占用锁 | `:56` | 忽略 |
| onDelete false | — | 保留对话框可重试 |
| 关闭 | `:46-53` | 清编辑态 |

## 7. 权限与权威状态

删除语义如实（仅解除关联不删计划项，`:28` 注释+确认框披露）。

## 8. 修改影响面

改管理器 → 影响分组 CRUD；`PlanningGroup` 契约联动 shared。

## 9. 测试证据

本轮 `NOT_RUN`。无直接测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 仅解除关联语义 | 已证实 | `:28` |
| savingAction 互斥 | 已证实 | `:36/:55-57` |
| 运行表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `PlanningGroupManager` | 2/3 | `:30-168` | covered |

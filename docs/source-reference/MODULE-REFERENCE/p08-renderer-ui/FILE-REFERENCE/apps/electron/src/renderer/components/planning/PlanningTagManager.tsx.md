---
path: apps/electron/src/renderer/components/planning/PlanningTagManager.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ac0877e35259e38704d4708a1ec024957bb5c0a1
sha256: 2b49e5b27ef8677807e888e00a3c04506a78a8db2d3fef311d88af9aa00d34ac
lines: 65
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/planning/PlanningTagManager.tsx

## 1. 结论与边界

日程标签就地管理器（`:19`）：**删除标签只解除关联，不删除 Todo 或日程**。Popover 列表 + 新建/重命名/删除（AlertDialog 二次确认）。受控（数据/动作经 props）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `PlanningTagManager` | function 组件 | `:20-65` | `{tags; getUsageCount; onCreate; onRename; onDelete; onCreated?}` |

内部状态：`open/newName/renaming/renameName/pendingDeletion/busy`（`:21-26`）；`create/rename/remove`（`:28-49`，均 busy 防重入、finally 复位）。

## 3. 内部逻辑与关键流程

- 新建行：输入（Enter 提交）+Plus 按钮（空名/忙禁用）。
- 标签行：`#name`+使用计数+三点菜单（重命名→行内编辑（autoFocus、Enter 确/Escape 取）；删除→置 pendingDeletion+关 Popover）。
- 删除确认描述明示：“会解除 N 个 Todo 或日程的关联；**计划项本身不会删除**”（`:63`）；Action `preventDefault` 手动 remove（busy 中禁用/“删除中…”）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：PlanningView（标签管理）。出向：`@profer/ui`（Popover/Dropdown/AlertDialog/Input/Button）、`@profer/shared.PlanningTag`。

## 5. 数据 I/O、读写与副作用

无直接 I/O（CRUD 经 props 回调）。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 空名/忙 | `:30/:38` | 忽略 |
| onDelete 返回 false | `:48` | 保留对话框可重试 |
| busy 中关框 | `:63` | 禁止 |

## 7. 权限与权威状态

删除语义如实（只解除关联不删计划项，描述+注释双披露）。

## 8. 修改影响面

改管理器 → 影响标签 CRUD 交互；`PlanningTag` 契约联动 shared。

## 9. 测试证据

本轮 `NOT_RUN`。无直接测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 只解除关联语义 | 已证实 | `:19/:63` |
| busy 防重入 | 已证实 | `:28-49` |
| 运行表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `PlanningTagManager` | 2/3 | `:20-65` | covered |

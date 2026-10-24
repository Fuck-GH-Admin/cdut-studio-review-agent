---
path: apps/electron/src/renderer/components/agent/MoveSessionDialog.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 960ae57f9d3baf02963cdc1bcd19921b2ef567b5
sha256: d78620f5fef05bfee953af99bd8edfe57b9468602d79f44fe94d1ec9fc1f2144
lines: 156
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/MoveSessionDialog.tsx

## 1. 结论与边界

**会话迁移到另一工作区对话框**（`apps/electron/src/renderer/components/agent/MoveSessionDialog.tsx:1-37`）：选择目标工作区→确认迁移。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `MoveSessionDialog` | 组件 | `:38-156` | 迁移对话框 |

## 3. 内部逻辑与关键流程

工作区列表选择→确认→调用迁移动作（经 agent API）→关闭。错误显示。

## 4. 调用者与调用链

- 消费方：会话列表（迁移入口）。
- 出向：agent API（迁移命令）。

## 5. 数据 I/O、读写与副作用

IPC 迁移命令；无本地写。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 迁移失败 | — | 错误显示 |
| 取消 | — | 关闭 |

## 7. 权限与权威状态

无身份语义；迁移经 API（主进程校验）。

## 8. 修改影响面

迁移 API 契约；工作区列表数据源。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 个导出 | 已证实 | `:38-156` |
| 迁移实际行为 | 未知 | 不在本批 |
| 测试实际通过 | 未知 | 无测试 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `MoveSessionDialog` | `:38-156` | covered |

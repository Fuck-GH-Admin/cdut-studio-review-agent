---
path: apps/electron/src/renderer/components/app-shell/PanelHeader.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: dbf4631725faedf33df33837f94716583cc6b4d4
sha256: 8b7afa348217b8aee451ef430478aa159c4e84a86177b0424ca5276bc76df5e8
lines: 25
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/app-shell/PanelHeader.tsx

## 1. 结论与边界

面板通用头部（文件头 `:1-4`）：标题 + 可选操作按钮。纯展示。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `PanelHeaderProps` | interface | `:9-16` | `{title; actions?; className?}` |
| `PanelHeader` | function 组件 | `:18-25` | 左标题右操作布局 |

## 3. 内部逻辑与关键流程

静态 JSX（flex 两端对齐、底边框）；`actions` 非空才渲染右侧容器。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：app-shell 各 Panel。

## 5. 数据 I/O、读写与副作用

无 I/O：纯展示（标题 + 可选 actions 插槽），不订阅 atom、无副作用、无 DOM 事件。

## 6. 分支、失败、取消与恢复

actions 非空才渲染右侧按钮容器（`:22`）。无其它运行时分支；无失败/取消/恢复语义。

## 7. 权限与权威状态

无权限语义；actions 内容的能力语义由调用方注入的按钮自行承担。

## 8. 修改影响面

改本组件 → 影响全部面板头部（标题行/操作区排版）；被 NavigatorPanel 等直接引用。

## 9. 测试证据

本轮 `NOT_RUN`。本批清单中无直接测试文件；`bun test`/typecheck/GUI 均未运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 纯展示 | 已证实 | `:18-25` |
| 运行表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `PanelHeader`/Props | 2/3 | `:9-25` | covered |

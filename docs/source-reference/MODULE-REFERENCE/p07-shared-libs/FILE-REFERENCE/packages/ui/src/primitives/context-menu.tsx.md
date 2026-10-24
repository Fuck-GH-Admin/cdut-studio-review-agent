---
path: packages/ui/src/primitives/context-menu.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 433d1921766a3c911ee201909ffa3e5a4685d8d3
sha256: 68ef13c9c22ebed188f84593ae4f9ddd84e55867ff2cd65d4bd71fb0fe506585
lines: 201
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-47-20261023
reviewer: p07-shared-libs
status: authored
evidence: static
---

# packages/ui/src/primitives/context-menu.tsx

## 1. 结论与边界

右键菜单 15 件套（Radix `@radix-ui/react-context-menu` shadcn 封装）：6 个纯转发（Root/Trigger/Group/Portal/Sub/RadioGroup，:8-18）+9 个样式化部件。

## 2. 导出与关键符号

导出 15 条（`export` :185-201）：`ContextMenu/Trigger/Content/Item/CheckboxItem/RadioItem/Label/Separator/Shortcut/Group/Portal/Sub/SubContent/SubTrigger/RadioGroup`。关键实现：
- `ContextMenuSubTrigger`（:20-39）：`inset?: boolean` 扩展（:22-24），inset→pl-8（:30），尾部 ChevronRight（:36）。
- `ContextMenuSubContent`（:41-55）/`ContextMenuContent`（:57-73）：`Z_LAYER.menu`（:48/:65）+动效类；Content 套 Portal（:61-71）并限高 `max-h-[--radix-context-menu-content-available-height]`（:66）。
- `ContextMenuItem`（:75-97）、`CheckboxItem`（:99-121，Check 图标）、`RadioItem`（:123-143，Circle 图标）、`Label`（:145-155，inset）、`Separator`（:157-167）、`Shortcut`（:169-183，纯 span）。

## 3. 内部逻辑与关键流程

forwardRef+cn 透传模式统一；`inset` 为唯一 props 扩展分支。不适用「取消/恢复/权限」：依据=纯展示。

## 4. 调用者与调用链

入向（3，全生产）：`cdut-science/CsLabPreparationView.tsx:34`、`cdut-science/agent-window/ScienceAgentWindowView.tsx:36`、`app-shell/left-sidebar/session-items.tsx:27`。出向：react、`@radix-ui/react-context-menu`、lucide（Check/ChevronRight/Circle）、`../lib/cn`、`../lib/z-layers`（Z_LAYER）。

## 5. 数据 I/O、读写与副作用

无。

## 6. 分支、失败、取消与恢复

inset 二分支（:30/:91/:155）；无 throw。不适用。

## 7. 权限与权威状态

不适用，依据：纯展示；菜单项权限由调用方控制渲染。

## 8. 修改影响面

3 个消费组件；`Z_LAYER.menu` 层级契约。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 15 条；6 转发+9 样式化 | 已证实 | :8-201 |
| 3 使用点 | 已证实 | §4 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 15 导出+inset 分支 | §2/§3 | :8-201 | covered |
| 测试 | §9 | — | unknown |

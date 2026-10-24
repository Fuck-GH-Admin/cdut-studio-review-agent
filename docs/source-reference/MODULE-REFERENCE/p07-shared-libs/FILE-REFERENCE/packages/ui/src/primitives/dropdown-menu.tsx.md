---
path: packages/ui/src/primitives/dropdown-menu.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2d2e8a2bc8b36cd7a5765ce49329e8b460d2c294
sha256: f5c4be2dedcb536337411ec8eb939ff89d287eb5607d3bc2a68c6d58be59ce7b
lines: 204
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-47-20261023
reviewer: p07-shared-libs
status: authored
evidence: static
---

# packages/ui/src/primitives/dropdown-menu.tsx

## 1. 结论与边界

下拉菜单 15 件套（Radix `@radix-ui/react-dropdown-menu` shadcn 封装）：6 纯转发（Root/Trigger/Group/Portal/Sub/RadioGroup，:8-18）+9 样式化部件。结构与 `context-menu.tsx` 同构。

## 2. 导出与关键符号

导出 15 条（`export` :188-204）：`DropdownMenu/Trigger/Content/Item/CheckboxItem/RadioItem/Label/Separator/Shortcut/Group/Portal/Sub/SubContent/SubTrigger/RadioGroup`。要点：
- `DropdownMenuSubTrigger`（:20-40）：`inset?: boolean`（:22-24），ChevronRight 尾图标（:36）。
- `DropdownMenuSubContent`（:42-58）/`DropdownMenuContent`（:60-78）：`Z_LAYER.menu`+动效类+`origin-[--radix-dropdown-menu-content-transform-origin]`（:51/:69 附近）。
- `DropdownMenuItem`（:80-97，inset）、`CheckboxItem`（:99-121，Check）、`RadioItem`（:123-143，Circle fill-current）、`Label`（:145-161，inset）、`Separator`（:163-173）、`Shortcut`（:175-186，纯 span）。

## 3. 内部逻辑与关键流程

forwardRef+cn 统一；inset 唯一 props 扩展分支（:30/:91/:155）。不适用「取消/恢复/权限」：依据=纯展示。

## 4. 调用者与调用链

入向（13，全生产）：代表 5：`cdut-science/CsLabPreparationView.tsx:41`、`cdut-science/agent-window/ScienceAgentWindowView.tsx:43`、`file-browser/FileBrowser.tsx:49`、`file-browser/DefaultAppMenuItem.tsx:9`、`planning/PlanningGroupManager.tsx:8`。出向：react、`@radix-ui/react-dropdown-menu`、lucide（Check/ChevronRight/Circle）、`../lib/cn`、`../lib/z-layers`。

## 5. 数据 I/O、读写与副作用

无。

## 6. 分支、失败、取消与恢复

inset 二分支；无 throw。不适用。

## 7. 权限与权威状态

不适用，依据：纯展示。

## 8. 修改影响面

13 个消费组件；Z_LAYER.menu 层级契约。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 15 条；与 context-menu 同构 | 已证实 | :8-204 |
| 13 使用点 | 已证实 | §4 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 15 导出+inset 分支 | §2/§3 | :8-204 | covered |
| 测试 | §9 | — | unknown |

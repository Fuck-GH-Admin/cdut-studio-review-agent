---
path: packages/ui/src/primitives/popover.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f93687ec3f8743a0d5ee5517f52ae7f621efc63d
sha256: 0667fddfe33fd53eb3304c004dbdec9f7fc8558bd1fdedcf2c6fb4099ffdc0a1
lines: 44
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-47-20261023
reviewer: p07-shared-libs
status: authored
evidence: static
---

# packages/ui/src/primitives/popover.tsx

## 1. 结论与边界

Popover 气泡（Radix `@radix-ui/react-popover`）：4 件套，Content 带 Portal+Z_LAYER.menu+动效。

## 2. 导出与关键符号

导出 4 条（`export` :44）：`Popover/PopoverAnchor/PopoverTrigger`（:8-14，纯转发）、`PopoverContent`（:16-42，forwardRef；align/sideOffset props 默认值 + `w-72` 圆角阴影 :31、`Z_LAYER.menu` :32、zoom/fade/slide 动效 :33-35）。

## 3. 内部逻辑与关键流程

PopoverContent 套 Portal（:24-41）；其余透传。不适用「取消/恢复/权限」：依据=纯展示。

## 4. 调用者与调用链

入向（18，全生产）：代表 5：`planning/CalendarWorkspace.tsx:19`、`planning/PlanningView.tsx:23`、`planning/PlanningGroupManager.tsx:7`、`planning/PlanningTagManager.tsx:6`、`ai-elements/InputToolbarOverflow.tsx:20`。包内：`todo-date-picker.tsx:6`。出向：react、`@radix-ui/react-popover`、`../lib/cn`、`../lib/z-layers`。

## 5. 数据 I/O、读写与副作用

无。

## 6-7. 分支/权限

不适用，依据：纯展示。

## 8. 修改影响面

18 个消费点（planning 系为主）+包内 1。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 4 条 | 已证实 | :44 |
| 18 使用点 | 已证实 | §4 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 导出 | §2 | :8-44 | covered |

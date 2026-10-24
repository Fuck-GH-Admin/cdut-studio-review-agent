---
path: packages/ui/src/primitives/input.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e687d8ce8ba31603178b57e608a04cf2cbb8ea81
sha256: 3c1fa6b5bf0ec17397ac87a320a2073dff0b8fcb77671cdd2049c50f7997f414
lines: 32
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-47-20261023
reviewer: p07-shared-libs
status: authored
evidence: static
---

# packages/ui/src/primitives/input.tsx

## 1. 结论与边界

文本输入框（纯 HTML+cn，无 Radix）：hairline 边框+hover/focus 态样式。

## 2. 导出与关键符号

导出 1 条（`export` :32）：`Input`（forwardRef，HTMLInputElement props）。

## 3. 内部逻辑与关键流程

单组件 cn 透传（:26 附近）；disabled 焦点样式类。不适用「取消/恢复/权限」：依据=纯展示受控输入。

## 4. 调用者与调用链

入向（21，全生产）：代表 5：`cdut-zone/AiClassSessionPickerModal.tsx:20`、`cdut-zone/CdutZoneView.tsx:34`、`planning/CalendarWorkspace.tsx:14`、`planning/PlanningView.tsx:18`、`planning/PlanningGroupManager.tsx:6`。包内：`todo-date-picker.tsx:5`。出向：react、`../lib/cn`。

## 5. 数据 I/O、读写与副作用

无。

## 6-7. 分支/权限

不适用，依据：纯展示。

## 8. 修改影响面

21 个消费点+包内 1；表单视觉契约（与 select.tsx trigger 同款样式注释）。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 1 条 | 已证实 | :32 |
| 21 使用点 | 已证实 | §4 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| Input | §2 | :32 | covered |

---
path: packages/ui/src/primitives/sheet.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 002ad41b74c4e575d9939a4323ce65e62df351d5
sha256: b26ea04ddcccbfdafc5b2f334b397a17f53e77af23b6a02003d4c6a79b2dfbf2
lines: 155
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-47-20261023
reviewer: p07-shared-libs
status: authored
evidence: static
---

# packages/ui/src/primitives/sheet.tsx

## 1. 结论与边界

侧滑抽屉 10 件套：Radix `@radix-ui/react-dialog` 底座（`SheetPrimitive`，:2——与 dialog.tsx 同底座但**不 import ./dialog**，无代码级组合）；四向滑出（sheetVariants :35-53）。

## 2. 导出与关键符号

导出 10 条（`export` :144-155）：`Sheet/SheetPortal/SheetOverlay/SheetTrigger/SheetClose/SheetContent/SheetHeader/SheetFooter/SheetTitle/SheetDescription`。要点：
- 4 纯转发（Root/Trigger/Close/Portal，:10-16）。
- `SheetOverlay`（:18-33）：`bg-overlay/40 backdrop-blur-sm`+`Z_LAYER.dialog`（:24-26 注释：需高于 AppShell 内容区）。
- `sheetVariants`（cva，:35-53）：side=top/bottom/left/right 四分支滑入滑出动效，默认 `right`（:50-51）。
- `SheetContent`（:61-90）：`hideClose?: boolean` 扩展（:58）；**Windows 特例**（:65-69）：`side==='right' && detectIsWindows()` 时隐藏关闭按钮（避免与窗口控制按钮重叠，注释 :65-67）；`data-browser-blocking`（:77）。
- `SheetHeader/Footer/Title/Description`（:92-142）。

## 3. 内部逻辑与关键流程

`shouldHideClose = hideClose || (side==='right' && isWindows)`（:69，`useMemo(detectIsWindows)` :68）；其余 forwardRef+cn。不适用「取消/恢复/权限」：依据=纯展示。

## 4. 调用者与调用链

入向（3，全生产）：`cdut-zone/CdutFeatureSheet.tsx:21`、`agent-skills/SkillDetailSheetFrame.tsx:2`、`agent-skills/McpDetailSheet.tsx:8`。出向：react、`@radix-ui/react-dialog`（:2）、cva、lucide（X）、`../lib/cn`、`../lib/platform`（detectIsWindows :7）、`../lib/z-layers`。

## 5. 数据 I/O、读写与副作用

无。

## 6. 分支、失败、取消与恢复

side 四分支（:41-46）、hideClose/Windows 双条件（:69）；无 throw。关闭语义：Esc/遮罩（隐藏关闭按钮时，注释 :66）。

## 7. 权限与权威状态

不适用，依据：纯展示。

## 8. 修改影响面

3 个消费组件；`Z_LAYER.dialog` 契约（与 dialog.tsx 同层）；Windows 平台行为差异。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 10 条；sheetVariants 四向 | 已证实 | :10-155 |
| Windows 右侧抽屉隐藏关闭按钮 | 已证实 | :65-69 |
| 与 dialog.tsx 同 Radix 底座无 import | 已证实 | :2 |
| 3 使用点 | 已证实 | §4 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 10 导出+sheetVariants | §2 | :10-155 | covered |
| Windows/hideClose 分支 | §3/§6 | :65-69 | covered |
| 测试 | §9 | — | unknown |

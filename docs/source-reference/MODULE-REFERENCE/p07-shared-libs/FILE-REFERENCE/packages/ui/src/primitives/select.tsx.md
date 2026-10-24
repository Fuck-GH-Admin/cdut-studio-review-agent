---
path: packages/ui/src/primitives/select.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a960e6aa8c100cb2defcd0ab29fd8d179f665250
sha256: 5b3544d5749cd9577a404ce7272c6b4e6008fbf0457b031bce666a63e4db92a6
lines: 168
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-47-20261023
reviewer: p07-shared-libs
status: authored
evidence: static
---

# packages/ui/src/primitives/select.tsx

## 1. 结论与边界

下拉选择 10 件套（Radix `@radix-ui/react-select` shadcn 封装）：3 纯转发（Root/Group/Value :8-12）+7 样式化。Trigger 与 Input 同款表单视觉契约（:21 注释）。

## 2. 导出与关键符号

导出 10 条（`export` :157-167）：`Select/SelectGroup/SelectValue/SelectTrigger/SelectContent/SelectLabel/SelectItem/SelectSeparator/SelectScrollUpButton/SelectScrollDownButton`。要点：
- `SelectTrigger`（:14-39）：hairline+hover/focus 双层光晕（:22-26），ChevronDown 旋转动效（:34-36）。
- `SelectScrollUpButton/DownButton`（:41-74）：ChevronUp/Down。
- `SelectContent`（:76-109）：Portal+`Z_LAYER.menu`（:86 附近）+动效。
- `SelectItem`（:123-143）：Check 选中图标（:137）。
- `SelectLabel`（:111-121）、`SelectSeparator`（:145-155）。

## 3. 内部逻辑与关键流程

forwardRef+cn 统一。不适用「取消/恢复/权限」：依据=纯展示受控组件。

## 4. 调用者与调用链

入向（14，全生产）：代表 5：`planning/CalendarWorkspace.tsx:15`、`planning/PlanningView.tsx:21`、`settings/UsageSettings.tsx:31`、`settings/FeishuSettings.tsx:20`、`settings/StorageSettings.tsx:24`。出向：react、`@radix-ui/react-select`、lucide（Check/ChevronDown/ChevronUp）、`../lib/cn`、`../lib/z-layers`。

## 5. 数据 I/O、读写与副作用

无。

## 6-7. 分支/权限

不适用，依据：纯展示。

## 8. 修改影响面

14 个消费组件；表单视觉契约（与 input.tsx 对齐）。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 10 条 | 已证实 | :8-167 |
| 14 使用点 | 已证实 | §4 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 10 导出 | §2/§3 | :8-167 | covered |

---
path: packages/ui/src/primitives/label.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e8ecdeb1d3b7eb623cbcd293888a196790987eee
sha256: 7d40ccdffb473b506758b0a6bac21b6fe6909af83ba0dd79eaef4f31fd47ab63
lines: 24
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-47-20261023
reviewer: p07-shared-libs
status: authored
evidence: static
---

# packages/ui/src/primitives/label.tsx

## 1. 结论与边界

表单标签（Radix `@radix-ui/react-label` + cva）。

## 2. 导出与关键符号

导出 1 条（`export` :24）：`Label`（forwardRef，LabelPrimitive.Root + cva 样式）。

## 3. 内部逻辑与关键流程

单组件样式透传。不适用「取消/恢复/权限」：依据=纯展示。

## 4. 调用者与调用链

入向（5，全生产）：`settings/UsageSettings.tsx:40`、`content-review/NativeManualItemDialog.tsx:15`、`content-review/BatchPanel.tsx:9`、`content-review/CreateCaseDialog.tsx:29`、`automation/AutomationFormView.tsx:17`。出向：react、`@radix-ui/react-label`、cva、`../lib/cn`。

## 5-7. 数据/分支/权限

不适用，依据：纯展示组件，无 I/O、无分支逻辑、无权限字段。

## 8. 修改影响面

- 消费面：5 个渲染组件（settings/UsageSettings、content-review/NativeManualItemDialog、content-review/BatchPanel、content-review/CreateCaseDialog、automation/AutomationFormView）的表单标签视觉直接依赖本件；改动样式类会同时影响设置页与内容审核建案表单的标签观感。
- 依赖面：`@radix-ui/react-label` 的无障碍语义（label/for 关联）与 cva 样式契约；`../lib/cn` 合并规则若变更需同步核对。
- 需同步测试：无（本批无组件测试；唯一相关为 `ui-workspace-contract.test.ts` 的路径契约，不覆盖 label）。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 1 条 | 已证实 | :24 |
| 5 使用点 | 已证实 | §4 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| Label | §2 | :24 | covered |

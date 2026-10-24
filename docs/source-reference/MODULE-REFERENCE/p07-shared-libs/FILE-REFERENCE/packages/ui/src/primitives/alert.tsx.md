---
path: packages/ui/src/primitives/alert.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4a3d875605320f7320afa41ec657c4c1a1e32fe6
sha256: 9a910af4adf94364616e3e32021fdbdeeb123a89e36d27dd1dba883705f91e78
lines: 59
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-47-20261023
reviewer: p07-shared-libs
status: authored
evidence: static
---

# packages/ui/src/primitives/alert.tsx

## 1. 结论与边界

shadcn 风格 Alert 展示组件（纯 HTML+cva，无 Radix）：`role="alert"` 的容器+标题+描述三件套。纯展示无状态。

## 2. 导出与关键符号

导出 3 条（`export` :59）：`Alert`（:22-33，forwardRef div，`role="alert"` :28，variant= default/destructive 经 `alertVariants` :6-20）、`AlertTitle`（:35-45，h5）、`AlertDescription`（:47-57，div）。`alertVariants`（:6，未导出）：cva，variant 二值，默认 default。

## 3. 内部逻辑与关键流程

三组件均 `cn(...)+{...props}` 透传（:29/:41/:53）；svg 布局由基础类控制（:7 `[&>svg~*]:pl-7` 等）。不适用「取消/恢复/权限」：依据=纯展示无异步/无权限字段。

## 4. 调用者与调用链

入向（子agent检索+作者核）：仅 `apps/electron/src/renderer/components/settings/AboutSettings.tsx:15`（Alert/AlertDescription）。出向：react、`class-variance-authority`、`../lib/cn`。

## 5. 数据 I/O、读写与副作用

无（渲染纯函数组件）。

## 6. 分支、失败、取消与恢复

variant 二分支（:11-14）；无 throw。不适用取消/恢复。

## 7. 权限与权威状态

不适用，依据：无权限字段/无 IPC。

## 8. 修改影响面

仅 AboutSettings 消费；改 variant 影响其警示样式。

## 9. 测试证据

无直接测试（全树 `*.test.*` 无 alert primitives import；`ui-workspace-contract.test.ts` 仅按钮路径契约）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 3 条；role=alert；variant 二值 | 已证实 | :6-59 |
| 仅 1 个使用点 | 已证实 | §4 检索 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 3 导出+alertVariants | §2/§3 | :6-59 | covered |
| 测试 | §9 | — | unknown（无测试） |

---
path: packages/ui/src/primitives/collapsible.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8a8dbb1b4d64588a6ba5d3defec1bfe971951b05
sha256: 30b10d77df45e3cab9cf38d248efd813f7de8d010b79761005e6ffa02c7bf98f
lines: 16
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-47-20261023
reviewer: p07-shared-libs
status: authored
evidence: static
---

# packages/ui/src/primitives/collapsible.tsx

## 1. 结论与边界

Collapsible 折叠容器：shadcn 式整体转发 Radix `@radix-ui/react-collapsible`，无样式加工（16 行）。

## 2. 导出与关键符号

导出 3 条（`export` :16）：`Collapsible`/`CollapsibleTrigger`/`CollapsibleContent`（:8-14，直接别名 `CollapsiblePrimitive.*`，无 forwardRef/无 cn）。

## 3. 内部逻辑与关键流程

无逻辑（纯转发）。不适用「取消/恢复/权限/失败」：依据=无状态包装。

## 4. 调用者与调用链

入向（2，全生产）：`apps/electron/src/renderer/components/ai-elements/reasoning.tsx:24`、`apps/electron/src/renderer/components/content-review/RuleOutlineList.tsx:5`。出向：`@radix-ui/react-collapsible`。

## 5. 数据 I/O、读写与副作用

无。

## 6-7. 分支/权限

不适用，依据：纯转发。

## 8. 修改影响面

2 个消费组件；改转发方式需保持 Radix 契约。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 3 条纯转发 | 已证实 | :8-16 |
| 2 使用点 | 已证实 | §4 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 3 导出 | §2 | :8-16 | covered |

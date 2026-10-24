---
path: packages/ui/src/primitives/badge.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7580e6578f02304cdc8c90a12df026c45b1b4283
sha256: 4cf51bc22e99025d2622727e5301985fc6f5f5d07e747850c507f892ae7e36fe
lines: 36
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-47-20261023
reviewer: p07-shared-libs
status: authored
evidence: static
---

# packages/ui/src/primitives/badge.tsx

## 1. 结论与边界

Badge 标签组件（纯 HTML+cva）：四 variant（default/secondary/destructive/outline，:10-18）。纯展示。

## 2. 导出与关键符号

导出 2 条（`export` :26/:36）：`BadgeProps`（interface，:26-28，HTMLAttributes+VariantProps）、`Badge`（:30-34，函数组件 div）+ `badgeVariants`（:6-24，导出供外部复用）。

## 3. 内部逻辑与关键流程

单组件四 variant 选择（:32）；不适用「取消/恢复/权限」：依据=纯展示。

## 4. 调用者与调用链

入向（4，全生产）：`bulletin/BulletinDialog.tsx:16`、`settings/ReleaseNotesViewer.tsx:11`、`settings/AboutSettings.tsx:23`、`agent/SDKMessageRenderer.tsx:44`（均 apps/electron/src/renderer/components/）。出向：react、cva、`../lib/cn`。

## 5. 数据 I/O、读写与副作用

无。

## 6. 分支、失败、取消与恢复

variant 四分支；无 throw。

## 7. 权限与权威状态

不适用，依据：纯展示。

## 8. 修改影响面

4 个消费组件；`badgeVariants` 若被外部使用（含 alert-dialog 系按钮样式不在本件）。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 2 条（Badge/badgeVariants）+ BadgeProps | 已证实 | :26/:36 |
| 4 使用点 | 已证实 | §4 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| Badge/badgeVariants/BadgeProps | §2/§3 | :6-36 | covered |
| 测试 | §9 | — | unknown |

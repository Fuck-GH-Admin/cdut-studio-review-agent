---
path: packages/ui/src/primitives/separator.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ddeb2e18b52cf9e827934140c41f9fad1c092421
sha256: 4a6f67d165fda22af511d6094b6b527d105d7decb8fea32c7399538e9d473380
lines: 31
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-47-20261023
reviewer: p07-shared-libs
status: authored
evidence: static
---

# packages/ui/src/primitives/separator.tsx

## 1. 结论与边界

分隔线（Radix `@radix-ui/react-separator`）：horizontal/vertical 两向样式。

## 2. 导出与关键符号

导出 1 条（`export` :31）：`Separator`（forwardRef，orientation 默认 "horizontal"，shrink-0 类+方向分支 :20-25 附近）。

## 3. 内部逻辑与关键流程

orientation 二分支样式。不适用「取消/恢复/权限」：依据=纯展示。

## 4. 调用者与调用链

入向（3，全生产）：`settings/primitives/SettingsCard.tsx:10`（apps 侧另有同名 primitives 目录，勿与本包混淆）、`diff/MarkdownEditorToolbar.tsx:30`、`diff/TableBubbleMenu.tsx:17`。出向：react、`@radix-ui/react-separator`、`../lib/cn`。

## 5-7. 数据/分支/权限

不适用，依据：纯展示。

## 8. 修改影响面

- 消费面：3 个消费组件（settings/primitives/SettingsCard、diff/MarkdownEditorToolbar、diff/TableBubbleMenu）的分隔线视觉依赖本件；注意 `settings/primitives/SettingsCard.tsx` 位于 apps 侧同名 `primitives` 目录，与本包目录命名冲突，重构/检索时勿混淆。
- 依赖面：`@radix-ui/react-separator` 的 orientation 语义（horizontal/vertical 两向样式分支）；`shrink-0` 布局类在 flex 容器中的收缩行为。
- 需同步测试：无（本批无组件测试）。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 1 条 | 已证实 | :31 |
| 3 使用点 | 已证实 | §4 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| Separator | §2 | :31 | covered |

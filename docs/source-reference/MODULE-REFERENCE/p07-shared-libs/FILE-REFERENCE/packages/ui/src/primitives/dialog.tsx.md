---
path: packages/ui/src/primitives/dialog.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c5887392e69d3028c4f3927279782f3d899ba1a2
sha256: 227dbf1df26c553864ee17d36d4055bf66cb1c085c4618e8f9d5fc3cb70d1706
lines: 138
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-47-20261023
reviewer: p07-shared-libs
status: authored
evidence: static
---

# packages/ui/src/primitives/dialog.tsx

## 1. 结论与边界

对话框 10 件套（Radix `@radix-ui/react-dialog` shadcn 封装）：`DialogContent` 带 Portal+Overlay+关闭按钮；被 40 处使用（含包内 `mermaid-block/MermaidBlock.tsx:30`）。

## 2. 导出与关键符号

导出 10 条（`export` :127-138）：`Dialog/DialogPortal/DialogOverlay/DialogTrigger/DialogClose/DialogContent/DialogHeader/DialogFooter/DialogTitle/DialogDescription`。要点：
- `DialogPortal`（:21-24）、`DialogOverlay`（:26-37，`bg-overlay/40 backdrop-blur-sm` :31+动效）。
- `DialogContent`（:39-101）：Portal+Overlay 组合（:43-46），`Z_LAYER.dialog`、圆角/阴影（:52-56 附近），关闭按钮 X（lucide，:80 附近）+sr-only「Close」。
- `DialogHeader/Footer`（:92-113 附近）、`DialogTitle`（:102-113）、`DialogDescription`（:115-125）。

## 3. 内部逻辑与关键流程

统一 forwardRef+cn；DialogContent 组合 Portal/Overlay/Close 三件。不适用「取消/恢复/权限」：依据=纯展示；受控 open 由调用方管理。

## 4. 调用者与调用链

入向（40，全生产）：apps/electron/src/renderer/components/ 39 处+`packages/ui/src/mermaid-block/MermaidBlock.tsx:30`；代表：`cdut-science/CsLabRenameLabDialog.tsx:17`、`file-browser/FilePreviewDialog.tsx:19`、`migration/MigrationImportDialog.tsx:17`、`bulletin/BulletinDialog.tsx:15`、`cdut-zone/AiClassKnowledgeTree.tsx:41`。包内入向：`command.tsx:7`。出向：react、`@radix-ui/react-dialog`、lucide（X）、`../lib/cn`、`../lib/z-layers`。
- **现存观察**：`settings/SettingsDialog.tsx:10` 绕过本封装直接 import `@radix-ui/react-dialog`（重构需注意，照实记录）。

## 5. 数据 I/O、读写与副作用

无。

## 6. 分支、失败、取消与恢复

无业务分支。Esc/遮罩关闭属 Radix 语义（未单测）。

## 7. 权限与权威状态

不适用，依据：纯展示。

## 8. 修改影响面

40 个消费点+包内 command；`Z_LAYER.dialog` 契约（与 sheet.tsx 同层）。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 10 条；DialogContent 三件组合 | 已证实 | :39-138 |
| 40 使用点（含包内 1） | 已证实 | §4 检索 |
| SettingsDialog 绕过封装直用 Radix | 已证实（现存观察） | SettingsDialog.tsx:10 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 10 导出 | §2/§3 | :21-138 | covered |
| 测试 | §9 | — | unknown |

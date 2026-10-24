---
path: packages/ui/src/primitives/button.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b074c88495f6aca25903b2c156fa5df2b91be27f
sha256: 3833d9afb93aebaa08374c9315b2409ac6717a707eb269400bf9b4e94795a051
lines: 63
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-47-20261023
reviewer: p07-shared-libs
status: authored
evidence: static
---

# packages/ui/src/primitives/button.tsx

## 1. 结论与边界

Button 基础按钮（cva + Radix `Slot` asChild 支持）：base 类含按下回弹/聚焦双层光晕（:8-9 注释「Linear/Vercel/Conductor 立体片状质感」）。纯展示+透传事件。

## 2. 导出与关键符号

导出 2 条（`export` :43/:63）：`ButtonProps`（interface，:43-46）、`Button`（:48-62，forwardRef button，`asChild` 时经 `Slot` 渲染 :52-55）+ `buttonVariants`（:7-41）。variant：default/destructive/outline/secondary/ghost/link（cva 内）；size：default/sm/lg/icon（同段）。

## 3. 内部逻辑与关键流程

`asChild` 分支（:51-56）：true 用 Slot 包裹（子元素接管渲染），false 渲染 button 元素。disabled 样式类（:9）。不适用「取消/恢复/权限」：依据=纯展示组件。

## 4. 调用者与调用链

入向（116，全生产渲染，均 apps/electron/src/renderer/components/）：最广使用的原语；代表：`cdut-science/CsLabAgentGuards.tsx:11`、`file-browser/FileBrowser.tsx:31`、`file-browser/office-preview/OfficePreview.tsx:5`、`file-browser/FilePreviewDialog.tsx:20`、`bulletin/BulletinDialog.tsx:17`。包内入向：`alert-dialog.tsx:8`（buttonVariants）、`todo-date-picker.tsx:4`。出向：react、`@radix-ui/react-slot`、cva、`../lib/cn`。

## 5. 数据 I/O、读写与副作用

无（渲染纯函数）。

## 6. 分支、失败、取消与恢复

asChild 二分支（:51-56）；无 throw。

## 7. 权限与权威状态

不适用，依据：无权限字段；禁用态为受控样式（:9 disabled 类）。

## 8. 修改影响面

116 个渲染消费点+2 个包内消费者；改 base 类影响全应用按钮观感（注意 focus-visible/deprecated 类如 `focus:ring` 系与 tailwind 版本契约）。

## 9. 测试证据

无直接渲染测试；`apps/electron/scripts/ui-workspace-contract.test.ts:32` 以字符串断言 `@profer/ui/primitives/button` 解析到 `src/primitives/button.tsx`（路径契约，非组件行为）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 2 条+buttonVariants；asChild 分支 | 已证实 | :43-63 |
| 116 使用点（计数）+包内 2 | 已证实 | §4 子agent检索+抽查吻合 |
| Slot 渲染语义 | 推断 | Radix 契约，未单测 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| Button/ButtonProps/buttonVariants | §2/§3 | :7-63 | covered |
| asChild 分支 | §3 | :51-56 | covered |
| 测试 | §9 | — | partial（路径契约） |

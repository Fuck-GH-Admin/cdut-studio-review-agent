---
path: apps/electron/src/renderer/components/shared/AttachmentPreviewItem.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 031a0a88359997cc3ffcb54cd89adbe8f68d70e5
sha256: 96f63cd96371c954bc64a55b0323437de9f9bb69a385163c8bf6e09795f03ff1
lines: 139
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/shared/AttachmentPreviewItem.tsx

## 1. 结论与边界

附件预览卡片（文件头 `:1-8`，对标 Cherry Studio AttachmentPreview）：图片=紧凑缩略图+圆角（点击开 Lightbox）；非图片=teal 标签+文件名截断；hover 显示关闭按钮。纯展示+回调。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `AttachmentPreviewItem` | function 组件 | `:33-139` | `{filename; mediaType; previewUrl?; onRemove; onClick?; className?}` |

内部：`isImage`（`:27-29`，`image/` 前缀）；`handleRemoveClick`（stopPropagation 防冒泡到行点击）；`handleRemoveKeyDown`（stopPropagation）。

## 3. 内部逻辑与关键流程

- **图片分支**（`isImage && previewUrl`）：72×72 缩略图（`object-cover`）点击→`ImageLightbox` 大图；右上角 hover 关闭钮（半透明圆钮）。
- **文件分支**：teal 标签（`#37a5aa` 系）+Paperclip+文件名 `max-w-[200px] truncate`；**Tooltip 显示完整名**（CSS truncate 仅视觉截断，`:95-96` 注释）；`onClick` 时容器可聚焦（`role=button/tabIndex=0`、Enter/Space 触发）；右侧 hover 关闭钮。
- 关闭按钮均 `stopPropagation`（不触发 onClick）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：输入区附件列表。出向：`@profer/ui`（ImageLightbox/Tooltip）、`lucide-react`、`@/lib/utils.cn`。

## 5. 数据 I/O、读写与副作用

无 I/O（previewUrl 由调用方给 blob/data URL）。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 图片+URL | `:50-88` | 缩略图+Lightbox |
| 其余 | `:91-137` | teal 标签 |
| 无 onClick | `:105-115` | 不可聚焦（无假按钮语义） |

## 7. 权限与权威状态

无障碍口径：可点击才有 role=button/tabIndex；Tooltip 全名可查。

## 8. 修改影响面

改卡片 → 影响附件展示/移除交互。

## 9. 测试证据

本轮 `NOT_RUN`。无直接测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 双分支/stopPropagation | 已证实 | `:50-137` |
| 全名 Tooltip 口径 | 已证实 | `:95-96` |
| 运行表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `AttachmentPreviewItem` | 2/3 | `:33-139` | covered |

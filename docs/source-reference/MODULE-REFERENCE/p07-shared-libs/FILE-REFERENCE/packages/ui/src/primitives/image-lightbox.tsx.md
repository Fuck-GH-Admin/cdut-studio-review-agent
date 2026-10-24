---
path: packages/ui/src/primitives/image-lightbox.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 843b4d7ca6555351c7bcafb13a629a080a2d4955
sha256: cf65ed5683baa5ff7812e3f1551246ebd6d5a9f006759356af0791cc926b7b42
lines: 127
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-47-20261023
reviewer: p07-shared-libs
status: authored
evidence: static
---

# packages/ui/src/primitives/image-lightbox.tsx

## 1. 结论与边界

图片预览弹窗（类 macOS Quick Look，头注释 :1-8）：全屏遮罩+居中大图+下载按钮；滚轮缩放（useSmoothZoom）、拖拽平移、点击遮罩/Esc 关闭。直接用 Radix dialog 底座（未复用 `./dialog`）。

## 2. 导出与关键符号

导出 1 条（`export` :30）：`ImageLightbox({src, alt?, open, onOpenChange, onSave?}): React.ReactElement | null`（props 接口 :17-28 未导出；src 为 data URL 或普通 URL）。

## 3. 内部逻辑与关键流程

- 平滑缩放（:38）：`useSmoothZoom({minZoom:0.5, maxZoom:5})` 提供 zoom/pan/bindRef/reset/onPanMouseDown；open/src 变化重置 zoom=1（:40-42）。
- 空 src 短路（:44）：`if (!src) return null`。
- 遮罩（:52-59）：黑 80%+md blur（注释 :49-51：预览语义强于普通 Dialog 的 40%/sm），`Z_LAYER.lightbox`。
- 内容层（:61-75）：`data-browser-blocking`（:62）；点击背景关闭（`e.target === e.currentTarget`，:72-74）；sr-only Title/Description（:77-82）。
- 大图（:85-94）：`transform: translate(pan) scale(zoom)`（origin 0 0，:90）、`draggable={false}`、onMouseDown 拖拽平移。
- 关闭按钮（:97-106，X）、下载按钮（:109-122，onSave 存在才渲染，Download 图标）。
- 不适用「权限」：依据=纯展示；不适用「恢复」：状态全在 useSmoothZoom 内存中。

## 4. 调用者与调用链

入向（4，全生产）：`ai-elements/message.tsx:33`、`shared/AttachmentPreviewItem.tsx:13`、`agent/agent-renderable-image.tsx:14`、`agent/SDKMessageRenderer.tsx:21`。出向：react、`@radix-ui/react-dialog`（直接用 :47-125）、lucide（Download/X）、`../lib/cn`、`../lib/z-layers`、`../hooks/use-smooth-zoom`（:15）。

## 5. 数据 I/O、读写与副作用

无文件 I/O；src 为调用方传入的 URL/data URL（下载经 onSave 回调由调用方实现）。

## 6. 分支、失败、取消与恢复

src 空短路（:44）、onSave 可选渲染（:109）、背景点击关闭（:72-74）。取消：Esc/关闭按钮属 Radix 语义。

## 7. 权限与权威状态

不适用，依据：纯展示。

## 8. 修改影响面

4 个消费组件（agent 消息图/附件预览）；useSmoothZoom 契约。

## 9. 测试证据

无直接测试（use-smooth-zoom 手册见 nb-39 批）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 1 条；空 src 短路/背景关闭/可选下载 | 已证实 | :30-127 |
| useSmoothZoom 缩放平移语义 | 已证实（契约） | :38-42/:90-91 |
| 4 使用点 | 已证实 | §4 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| ImageLightbox 全分支 | §2/§3 | :17-127 | covered |
| useSmoothZoom 实现 | §3/§10 | :38 | unknown（属 hooks） |
| 测试 | §9 | — | unknown |

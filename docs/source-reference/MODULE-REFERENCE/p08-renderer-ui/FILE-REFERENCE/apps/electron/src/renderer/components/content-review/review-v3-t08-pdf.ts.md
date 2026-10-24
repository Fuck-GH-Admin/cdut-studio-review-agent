---
path: apps/electron/src/renderer/components/content-review/review-v3-t08-pdf.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: fa3c5edc3c280f2e946b58a6570724cfb49ab1a1
sha256: 32cee8c4faa715d6ff3641be5db8208744073f8a2218f81d59cd422dc6103b9f
lines: 153
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-v3-t08-pdf.ts

## 1. 结论与边界

**T08 真实 A4 PDF 生成**（`:1-9` 注释）：**从已按受众过滤的报告**出图；用 Electron Chromium canvas——**无远程服务、无服务端文件权限、不依赖 Latin-only 标准 PDF 字体**。语义红线：报告以页面图像绘制**保中文**（无捆绑 CJK 字体的机器），**真实多页 PDF 但不可检索文本**（`:6-8`）；L 后续可换 Main printToPDF 取可选中字形（`:8`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `T08PdfPage` | interface（export） | `:11-15` | width/height/jpeg |
| `encodeT08ImagePdf` | function（export） | `:23-79` | 低层 PDF 组装器（**与 canvas 分离使页流可测** `:22`） |
| `renderT08ReportPdf` | function（export） | `:91-153` | Markdown→逐页 PDF（§3） |

内部：`fromJpegDataUrl`（仅 JPEG data URL，否则抛 `:81-88`）、A4 尺寸常量（595.28×841.89 `:19-20`）。

## 3. 内部逻辑与关键流程

1. `encodeT08ImagePdf`（`:23-79`）：PDF-1.4 结构（Catalog/Pages/每页 3 对象：Page+DCTDecode 图像 XObject+内容流）；空页拒（`:24`）；无效图像拒（`:46`）；xref/trailer 正确拼装（`:65-71`）。
2. `renderT08ReportPdf`（`:91-153`）：canvas 2 倍缩放（`:92-95`）；标题（≤72 字符）/页码（`:111-114`）；逐行渲染——标题级 4 档字号（`:127`）；**逐字测量换行**（`:144-147`）；页满翻页（`flush` 内 `:133-139`）；JPEG 0.90 量化出图（`:119`）。

## 4. 调用者与调用链

入向：`ReviewV3T08ReportPanel.reportBundle`（nb-86 手册）。出向：DOM canvas（Electron 渲染进程）。

## 5. 数据 I/O、读写与副作用

canvas 绘制；无网络/磁盘。

## 6. 分支、失败、取消与恢复

空页/无效图/无 canvas 上下文/JPEG 非法均抛（`:24/:46/:97/:83`）。不适用取消/恢复。

## 7. 权限与权威状态

红线：仅用已受众过滤报告（`:2`）；本地 canvas 零外部依赖（`:3-5`）；图像页如实提示不可选中（消费方文案）。

## 8. 修改影响面

- 改 `encodeT08ImagePdf` 布局/xref → PDF 兼容性（2 测试锁定）。
- 改排版参数（字号/边距/行高 `:100/:127`）→ 报告视觉与分页。
- 改出图量化（0.90 `:119`）→ 文件体积与清晰度。
- 替换为 Main printToPDF（`:8` 计划）→ 可检索文本能力。
- 改 fromJpegDataUrl 限制（`:81-88`）→ 支持的画布导出格式面。

## 9. 测试证据

**直接测试 `review-v3-t08-pdf.test.ts`（2 用例，NOT_RUN）**：双页 PDF 字节结构（头/Count 2/MediaBox/2 图像流/2 页对象/Length 4 流/startxref 偏移指向 `xref\n`）、空输入拒。render 侧无测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 导出+2 内部+组装/排版全链 | 已证实 | 逐行读 `:1-153` |
| 测试 2 用例断言 | 已证实 | 测试文件；NOT_RUN |
| 真实阅读器兼容 | 未知 | 外部查看器 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 组装器/渲染器 | §2/§3 | `:23-153` | covered |
| 测试 | §9 | 测试文件 | covered（NOT_RUN） |

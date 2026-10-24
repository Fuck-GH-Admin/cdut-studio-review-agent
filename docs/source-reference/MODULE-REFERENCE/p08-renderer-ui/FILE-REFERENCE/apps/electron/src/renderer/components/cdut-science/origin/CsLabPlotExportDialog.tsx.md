---
path: apps/electron/src/renderer/components/cdut-science/origin/CsLabPlotExportDialog.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f2a68998224f73c6a167ecee80e5f65725849fcc
sha256: e8ad468235a69384858ceb27ee525abfa0fc937dab15ec9592c3a6676f1649a9
lines: 150
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-science/origin/CsLabPlotExportDialog.tsx

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

出版图导出对话框（150 行，头注 :1-3）：格式（svg/pdf/png/tiff）×DPI（300/600/1200）×透明背景；**6400 万像素上限**前置校验。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CsLabPlotExportDialogProps` | interface | 10-16 | open/labId/document/onClose/onToast |
| `CsLabPlotExportDialog` | 组件 | 23-150 | 导出对话框 |

内部：`FORMATS`（:18-23）。

## 3. 内部逻辑与关键流程

像素数=round(w/25.4×dpi)×round(h/25.4×dpi)；`tooLarge = pixels > 64_000_000`（:39）→按钮 disabled+红字提示+`handleExport` 前置拒（toast `导出像素数超过 6400 万`）；导出→`exportPlot`（png/tiff 带 transparent）→成功 toast 含落盘路径→close；失败 toast error。预设行显示 mm×px。

## 4. 调用者与调用链

入向：Origin 编辑器导出入口。出向：`./cslab-plot-export`（exportPlot）、`@profer/shared`（JOURNAL_PRESETS/类型）、lucide 图标。

## 5. 数据 I/O、读写与副作用

经 exportPlot→主进程落盘；无直接 I/O。

## 6. 分支、失败、取消与恢复

超限拒；导出异常→toast；busy 防重入；无重试。

## 7. 权限与权威状态

- 资源保护：6400 万像素上限（防 OOM，:39/:53-56）；文件名取 `document.title || document.id`。无 sender/role 检查。

## 8. 修改影响面

出版图导出 UI：Origin 编辑器导出入口（svg/pdf/png/tiff × DPI × 透明背景）。
- 波及面：`exportPlot`→主进程落盘链、toast 反馈、文件名生成。
- 回归关注：6400 万像素上限双重校验（按钮禁用+导出前置拒）不弱化。
- 无专属测试文件（全树检索确认）；回归须靠导出人工验证。

## 9. 测试证据

直接测试：无。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出/行号 | 已证实 | 逐行核对 |
| 超限拒/busy 语义 | 已证实 | :39-60 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `CsLabPlotExportDialog` | §3 | 23-150 | covered（未测） |

---
path: apps/electron/src/renderer/components/cdut-science/origin/cslab-plot-export.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: db1e01219a1492a694d0594805ebcd430f380bb5
sha256: a1c9ef04b98cc6affc6534a8d13301e593b5e4ce9b34b4385a51044b94960eba
lines: 57
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-science/origin/cslab-plot-export.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

CSLab 渲染进程侧出版图导出（57 行，头注 :1-3）：PNG/TIFF 先本地高分辨率栅格化为 dataURL，再调主进程 `cslab.exportFigure` 落盘。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `rasterizePlot` | fn | 22-38 | canvas 高分辨率 PNG dataURL |
| `exportPlot` | fn | 43-57 | 经 electronAPI 主进程导出 |

内部：`pixelSize`（:12-19，mm→px @dpi，最小 1px）。

## 3. 内部逻辑与关键流程

`rasterizePlot`：canvas 建→透明则 clearRect→preset（`JOURNAL_PRESETS[document.presetId] ?? default`）→`buildPlotRenderModel`→`drawPlotToCanvas`→`toDataURL('image/png')`；getContext 失败 throw `无法创建绘图画布`。`exportPlot`：仅 png/tiff 预栅格化；`exportFigure({labId,plot,options:{…,rasterDataUrl}})`。

## 4. 调用者与调用链

入向：`CsLabPlotExportDialog`（导出按钮）。出向：`./canvas-plot-renderer`、`./cslab-plot-render-model`、`@profer/shared`（JOURNAL_PRESETS/类型）、`window.electronAPI.cslab.exportFigure`。

## 5. 数据 I/O、读写与副作用

Canvas 离屏渲染；主进程落盘（经 IPC）。

## 6. 分支、失败、取消与恢复

画布不可建→throw；导出错误上抛（对话框 catch 转 toast）；无重试。

## 7. 权限与权威状态

- 导出精度权威：DPI×mm 尺寸换算显式（:12-19）；矢量格式（svg/pdf）不走栅格化。无 sender/role 检查。

## 8. 修改影响面

出版图导出链：`CsLabPlotExportDialog` 导出按钮→栅格化→主进程落盘。
- 波及面：`drawPlotToCanvas`/`buildPlotRenderModel` 依赖；`cslab.exportFigure` IPC 契约（rasterDataUrl 仅 png/tiff）。
- 回归关注：mm→px @dpi 换算精度、矢量格式不走栅格化、画布不可建显式 throw。
- 无专属测试文件（全树检索确认）；回归须靠导出人工验证。

## 9. 测试证据

直接测试：无。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出/内部符号/行号 | 已证实 | 逐行核对 |
| 栅格化/主进程落盘语义 | 已证实（代码） | :22-57 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `rasterizePlot`/`exportPlot` | §3 | 22-57 | covered（未测） |

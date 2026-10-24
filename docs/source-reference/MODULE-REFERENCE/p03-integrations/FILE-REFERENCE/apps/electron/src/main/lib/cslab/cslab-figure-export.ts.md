---
path: apps/electron/src/main/lib/cslab/cslab-figure-export.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4b1e13725d70a2f34fc37f91bb7d96502febc5bd
sha256: a54e7f04d4f32b5f570e371ff276fc49438f7729a6039246e7438da5cc3dba4d
lines: 224
kind: source
package: p03-integrations
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# apps/electron/src/main/lib/cslab/cslab-figure-export.ts

## 1. 结论与边界

CSLab **出版图导出**（主进程，`apps/electron/src/main/lib/cslab/cslab-figure-export.ts:1-9`）：SVG=共享纯函数直接生成；PNG/TIFF=**离屏 BrowserWindow** 渲染截图；PDF=离屏窗口+printToPDF 矢量。零新增依赖；**所有离屏窗口 finally 强制销毁**（`:8`）。

边界：像素上限 64M（仅位图路径校验，SVG/PDF 矢量不校验，`:183-185`）；离屏窗口沙箱加固（`nodeIntegration:false/contextIsolation:true/sandbox:true`，`:119-124`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `pdfPageSizeInches` | function | 29-35 | mm→inch（3 位小数） | printToPDF pageSize 单位 |
| `pdfViewportPx` | function | 41-52 | 96 CSS px/in 向下取整 | **防亚像素空白分页**（`:38-40` 注释） |
| `exportPlotToFile` | function | 178-224 | async `(plot, options, targetPath) => CsLabPlotExportResult` | 四格式分发+写文件 |

内部：`MAX_PIXELS=64M`（`:21`）、`resolveSize`（`:23-27`）、`pixelSize`（`:54-62`，超限抛错）、`svgForPlot`（`:64-67`，JOURNAL_PRESETS 回退 default）、`htmlForSvg`（`:69-82`，base64 data URL）、`waitForWindowReady`（`:84-97`，15s 超时+did-fail-load 收口）、`settleFontsAndPaint`（`:99-106`，fonts.ready+80ms）、`withOffscreenWindow`（`:108-138`，先绑监听再导航防事件早到、loadURL 失败由 ready 收口防双重 rejection、finally destroy）、`rasterizePlot`（`:140-159`，rasterDataUrl 快路径）、`renderPdf`（`:161-176`）。

## 3. 内部逻辑与关键流程

`exportPlotToFile`（`:178-224`）：尺寸解析→仅 png/tiff 做像素上限校验→四分发：

- svg：纯函数渲染字符串。
- pdf：视口按 96 CSS DPI 排版**绝不按导出 DPI 写死**（`:162-164` 注释——防 600DPI 内容被纸张横向切多页）；零边距 printToPDF。
- png：rasterizePlot（渲染进程位图快路径校验失败抛「位图数据无效」）。
- tiff：png 后 `encodeTiffRgb`（解码失败抛「PNG 位图解码失败」）。

## 4. 调用者与调用链

出向：`node:fs`、`electron`（BrowserWindow/nativeImage）、`@profer/shared`（3 类型+JOURNAL_PRESETS/renderPlotSvg）、`./cslab-tiff`（encodeTiffRgb）（`:11-19`）。入向（rg 全冻结树）：`cslab-science.ts:40`（exportPlotToFile，**唯一产品调用**）；`cslab-science.test.ts:151`（pdfPageSizeInches/pdfViewportPx 动态 import 断言）。

## 5. 数据 I/O、读写与副作用

`fs.writeFile`（输出文件）；Electron 离屏窗口生命周期（强制销毁）；无网络。

## 6. 分支、失败、取消与恢复

抛错：像素超限/位图无效/PNG 解码失败/窗口加载失败或超时；**finally destroy 保证无窗口泄漏**；无 AbortSignal（窗口销毁即恢复）。

## 7. 权限与权威状态

本文件不适用（无权限代码）；打印口径（96 CSS px/in、零边距，`:38-40,162-164`）是 PDF 输出权威声明。

## 8. 修改影响面

- 视口取整/像素上限改动影响出版图导出质量（空白分页/内存）。
- 离屏沙箱参数是安全面。
- 测试：cslab-science.test（间接）。

## 9. 测试证据

无同名测试；间接 `cslab-science.test.ts:151`（2 函数断言）。**NOT_RUN**（GUI/离屏渲染不运行）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| finally 强制销毁+沙箱加固 | 已证实 | `:8,119-138` |
| PDF 96 CSS DPI 口径防切页 | 已证实 | `:38-40,162-164` |
| 仅位图校验 64M 上限 | 已证实 | `:183-185` |
| 事件时序/双重 rejection 收口 | 已证实 | `:127-133` |
| 真实导出渲染效果 | 未知 | NOT_RUN（GUI） |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 3 导出 | §2 | 29-224 | covered |
| 离屏生命周期 | §3 | 84-138 | covered |
| 四格式分发 | §3 | 178-224 | covered |

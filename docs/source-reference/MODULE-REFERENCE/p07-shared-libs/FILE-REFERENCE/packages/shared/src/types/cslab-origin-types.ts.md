---
path: packages/shared/src/types/cslab-origin-types.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9e649af2268dc62405db3b7a19582b7e38271642
sha256: 146df77983c5c63539b83f8558d3e1aed69faf8f9b359e05bb8a2fc410816fc1
lines: 249
kind: source
package: p07-shared-libs
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# packages/shared/src/types/cslab-origin-types.ts

## 1. 结论与边界

CSLab **出版级绘图契约**（Origin 级，`:1-5`）：绘图文档/期刊预设/峰拟合/平滑/导出参数。"渲染逻辑在 utils 与渲染进程"——纯数据形状。无 import、无运行时代码。

不做的事：不渲染（utils/渲染层）；不计算拟合（科学引擎侧消费 `CsLabFitRequest`）；晶体/体数据在 `cslab-vesta-types.ts`。

## 2. 导出与关键符号

32 个导出（全类型）：

| 族 | 符号（行） | 要点 |
| --- | --- | --- |
| 期刊预设 | `CsLabJournalPresetId:7-13`（default/nature/science/aps/acs/advanced-materials 6 值）、`CsLabPlotPreset:111-122`（单双栏 mm/字号/线宽/边距） |
| 轴/系列 | `CsLabPlotAxisScale:15`（linear/log10/log2/**reciprocal**）、`CsLabPlotTickDirection:17`、`CsLabPlotLineStyle:19`、`CsLabPlotMarker:21`、`CsLabPlotAxisBreak:23-27`（wave/slash）、`CsLabPlotAxisConfig:29-42`（含 breaks/镜像刻度）、`CsLabPlotSeries:44-58`（`yAxis: 0\|1` 双 Y 轴 `:53`、`facet?`） |
| 图层/画布 | `CsLabPlotAnnotation:60-71`（text/arrow/band/line）、`CsLabPlotLayer:73-84`（双 Y 轴元组 `:78`、瀑布 `stackOffset?` `:83`）、`CsLabPlotFacets:86-89`、`CsLabPlotLegend:91-95`、`CsLabPlotDocument:97-109`（`sizeMm` 由预设单双栏决定 `:102`） |
| 峰拟合 | `CsLabPeakProfileName:124`、`CsLabPeakSpec:126-133`（`locked?` 不参与优化 `:131`）、`CsLabBaselineKind:135`（5 值含 asls）、`CsLabFitRequest:137-147`、`CsLabFittedPeak:149-157`（含 `areaFraction`）、`CsLabFitResult:159-169`（rSquared/rmse/converged/warnings） |
| 平滑 | `CsLabSmoothRequest:171-179`（savgol/moving-average/fft-lowpass；`cutoff` 相对 Nyquist `:177`） |
| 导出 | `CsLabPlotExportFormat:181`（svg/pdf/png/tiff）、`CsLabPlotExportDpi:183`（**300\|600\|1200 字面量联合**）、`CsLabPlotExportOptions:185-194`（`rasterDataUrl` 复用预渲染 `:192`）、`CsLabPlotExportResult:196-203` |
| 事件/布局 | `CsLabPlotSummary:205-210`、`CsLabPlotUpdateSource:213`（agent/user）、`CsLabPlotUpdatedEvent:216-223`（`undoToken?` 撤销令牌 `:221`）、`CsLabPlotRect:226-231`、`CsLabPlotLayout:233-239`（mm+px 双坐标） |
| 科学文本 | `CsLabScientificToken:241-244`（normal/sub/sup/italic）、`CsLabScientificText:246-249` |

## 3. 内部逻辑与关键流程

纯声明。族谱：`CsLabPlotPreset`（尺寸来源）→ `CsLabPlotDocument.sizeMm`；`CsLabPlotLayer` 含轴/系列/注解三要素；`CsLabPlotUpdatedEvent.undoToken` 与 cslab.ts 的 `UNDO_PLOT_UPDATE` 通道（`:172`）配套（Agent 写回可撤销，`CsLabPlotUndoResult` 在 cslab.ts `:1278`）。

## 4. 调用者与调用链

- `cslab.ts:8` type-import `CsLabPlotDocument`（用点 `:1281`）；渲染层绘图编辑器（`plot-*` 组件）与 utils 渲染；科学引擎（`FIT_PEAKS`/`SMOOTH_SERIES`/`SAVE_PLOT`/`EXPORT_FIGURE` 通道的输入输出，cslab.ts `:151-157`）。
- 出向：无 import（全文件 0 import）。被 `packages/shared/src/types/index.ts:116` `export *` 转发。

## 5. 数据 I/O、读写与副作用

纯类型，无 I/O。

## 6. 分支、失败、取消与恢复

不适用。失败语义：`CsLabFitResult.converged/warnings`（`:167-168`）；撤销：`undoToken` + `UNDO_PLOT_UPDATE` 链。

## 7. 权限与权威状态

- `CsLabPlotUpdateSource`（`:213`）区分 Agent/user 写回（`:219` 注释：缺省视为 user，兼容旧事件）——审计权威字段。
- `CsLabPeakSpec.locked`（`:131`）是拟合优化的参数锁定权。
- `rasterDataUrl`（`:192`）渲染进程预渲染复用——渲染权威在渲染层。

## 8. 修改影响面

改字段影响绘图编辑器/科学引擎/导出链；`CsLabPlotDpi` 字面量联合改动会影响导出 UI 与引擎；`CsLabPlotDocument` 改动牵连 cslab.ts `:1281`（跨文件契约点）。

## 9. 测试证据

无直接契约断言（`CsLabFitRequest` 于 `*.test.ts` 为 0 命中，属实）；`CsLabPlotDocument` **被 `apps/electron/src/main/lib/cslab/cslab-science.test.ts` 消费**（`:10` import type + `:77` 夹具构造；主根 grep 复核）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 32 导出全类型、0 import | 已证实 | 文件全读 |
| `undoToken` 撤销链契约 | 已证实 | `:221` + cslab.ts `:172`/`:1278` |
| DPI 三值字面量联合 | 已证实 | `:183` |
| 期刊预设实际数值（单双栏 mm） | 未知 | 值在预设数据侧，本文件只给形状 |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 32 导出全量 | §2 | covered |
| 族谱/撤销链 | §3 | covered |
| 权威边界 | §7 | covered |
| 消费者/影响面 | §4/§8 | covered |
| 测试/未知 | §9/§10 | covered |

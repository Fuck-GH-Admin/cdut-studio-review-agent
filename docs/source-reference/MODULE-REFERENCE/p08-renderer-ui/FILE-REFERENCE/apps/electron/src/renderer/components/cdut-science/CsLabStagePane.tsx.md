---
path: apps/electron/src/renderer/components/cdut-science/CsLabStagePane.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8253460ab189d9195dc1c50e3826780e718f9e66
sha256: fd4d283f1f44b67b160f529329214b92f47e78aff66e37dc9796b8db99e41d94
lines: 298
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-science/CsLabStagePane.tsx

## 1. 结论与边界

单个科研窗格（头注释 :2-6）：**窗格只接收资产拖拽（CSLAB_ASSET_MIME）；单元格拖拽必须下沉给 TipTap**，否则抢走胶囊投递（拖拽边界契约）。

## 2. 导出与关键符号

导出 1 条（`export` :95）：`CsLabStagePane`（:95-，StageGrid 回调面全量接收）。内部：viewType 分派链（:130-144 标题解析/:177-193 渲染分派）。

## 3. 内部逻辑与关键流程

viewType 八态分派（:177-193）：table→CsLabDatasetView、pdf→CsLabPdfViewer、dag→CsLabDagCanvas、mol→VestaCrystalPane 系、figure→CsLabFigureView、origin-plot→CsLabOriginPlotPane、manuscript→CsLabManuscriptEditor；非 empty 显示标题栏（:195）。拖拽过滤（hasDragType :43-45）。

## 4. 调用者与调用链

入向：`CsLabStageGrid.tsx`（逐 pane 挂载）。出向：8 个内容视图组件（:36-42）、`@profer/shared`（canvasTitleFromRelPath :33）、`./cslab-dnd`。

## 5-7. 数据/分支/权限

纯分派渲染；拖拽 MIME 门（§1 契约）；不适用取消/恢复。

## 8. 修改影响面

- 消费面：StageGrid 舞台。
- 依赖面：八内容视图组件。
- 需同步测试：无专属。

## 9. 测试证据

无专属测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 1 条；八态分派+拖拽边界 | 已证实 | :2-6/:177-193 |
| 各视图内部 | 未知（批内外组件） | :36-42 |
| 通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+分派 | §2/§3 | :95-298 | covered |

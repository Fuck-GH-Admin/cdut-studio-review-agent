---
path: apps/electron/src/renderer/components/cdut-science/origin/cslab-plot-render-model.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 842017d3eb7dc3c5538103c6013871c5369d95ff
sha256: f0c9497556a93d48092d8f88baae0de65913da85745df6bf21b5221ee254478e
lines: 112
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-science/origin/cslab-plot-render-model.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

Origin 绘图渲染模型（112 行，头注 :1-5）：绘图文档→像素坐标轴/曲线/图例模型，供 Canvas 交互与命中测试复用。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CsLabPlotSeriesModel` | interface | 13-19 | layer/series/边界/points |
| `CsLabPlotRenderModel` | interface | 21-28 | layout/scale/尺寸/plotRect/series |
| `dataBounds` | fn | 30-47 | 轴范围（min/max 显式优先；log 轴 y 跳过 ≤0） |
| `buildPlotRenderModel` | fn | 49-92 | 模型构建（scale=min(w/…,h/…)） |
| `hitTestPlot` | fn | 95-112 | 20px 内最近曲线点 |

## 3. 内部逻辑与关键流程

`dataBounds`（:30-47）：显式 min+max 直用；否则扫有限值（log 轴 y 排除非正）；全非有限→`[0,1]`；max≤min→`[min,min+1]`。`buildPlotRenderModel`（:49-92）：跳过不可见层/series；左右轴分别定界（`yAxis===1` 用右轴）；点坐标=plotRect 内 fraction×scale（y 翻转）；`axisFraction` 返回 null 的点跳过。`hitTestPlot`：遍历全部点取 ≤20px 最近（无命中 null）。

## 4. 调用者与调用链

入向：`canvas-plot-renderer`（drawPlotToCanvas/pixelToData）、Origin 编辑器命中测试。出向：`@profer/shared`（`computePlotLayout`/`axisFraction`，:14）。

## 5. 数据 I/O、读写与副作用

纯函数。

## 6. 分支、失败、取消与恢复

无 throw；非有限值跳过；空层回退 `layers[0]`。

## 7. 权限与权威状态

- 坐标正确性权威：log 轴非正值排除（:39）；null fraction 点不画（不伪造坐标）。无 sender/role 检查。

## 8. 修改影响面

绘图渲染/ROI 框选/峰拾取。无专属测试。

## 9. 测试证据

直接测试：无。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 导出/行号 | 已证实 | 逐行核对 |
| 边界/翻转/命中语义 | 已证实（代码） | :30-112 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `dataBounds` | §3 | 30-47 | covered（未测） |
| `buildPlotRenderModel` | §3 | 49-92 | covered（未测） |
| `hitTestPlot` | §3 | 95-112 | covered（未测） |

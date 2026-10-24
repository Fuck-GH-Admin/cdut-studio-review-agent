---
path: apps/electron/src/renderer/components/cdut-science/origin/canvas-plot-renderer.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e4306601e483abdb06ef16d3dcc7b2ca7ec14889
sha256: 17d23089f187f91d3b33d7298bad25b3939d91cf122fcca046164db1d891a55c
lines: 279
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-science/origin/canvas-plot-renderer.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

Origin 绘图 Canvas 渲染器（279 行，头注 :1-5）：CSS 像素坐标系绘制（dpr 变换由调用方负责）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `drawPlotToCanvas` | fn | 107-252 | 全图渲染（轴/曲线/图例/标题） |
| `pixelToData` | fn | 255-279 | 像素→数据坐标（ROI 框选） |

内部：`PT_TO_PX=96/72`（:12）、`drawScientificText`（:14-41，上下标分 token 绘制）、`axisTicks`（:43-55，log 轴指数刻度 8 个上限）、`drawAxis`（:57-105，三向刻度+科学计数标签）。

## 3. 内部逻辑与关键流程

1. **`drawPlotToCanvas`**（:107-252）：dpr setTransform→清屏（非透明填白）→边框→三轴（右轴仅有右 series 时画）→clip 内画曲线（dash 样式四态、<2 点跳过）→图例（series id 去重）→轴标题（单位括注）→标题。
2. **`pixelToData`**（:255-279）：可见层+首个 series 定界；fraction 越界→null；x 用显式轴范围优先。
3. **记录的实现怪癖**（照实）：`pixelToData` 的 y 计算三元双分支完全相同（:274-276，`entry.yBounds` 恒为数字，条件永真），实际恒走 `entry.yBounds` 线性映射。

## 4. 调用者与调用链

入向：Origin 编辑器画布组件、`cslab-plot-export.rasterizePlot`。出向：`@profer/shared`（`formatMetric`/`niceTicks`/`parseScientificText`/`axisFraction`，:7-12）、`./cslab-plot-render-model`。

## 5. 数据 I/O、读写与副作用

Canvas 绘制；无 I/O。

## 6. 分支、失败、取消与恢复

无 layer→早退；fraction null 点跳过；不抛。

## 7. 权限与权威状态

- 科学绘图正确性：log 轴刻度/上下标/单位括注如实渲染；非有限点不画。无 sender/role 检查。

## 8. 修改影响面

交互画布/出版图底稿：Origin 编辑器画布渲染、`rasterizePlot` 栅格化、ROI 框选坐标换算。
- 波及面：`pixelToData` 供框选/拾峰；绘制辅助（科学文本/刻度）影响轴标签正确性。
- 回归关注：log 轴刻度、上下标绘制、非有限点跳过、`pixelToData` y 三元同分支怪癖（行为不变仅代码冗余，已记录）。
- 无专属测试文件（全树检索确认）；回归须靠像素级渲染人工验证。

## 9. 测试证据

直接测试：无。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出/内部符号/行号 | 已证实 | 逐行核对 |
| 渲染/坐标语义 | 已证实（代码） | :107-279 |
| `pixelToData` y 三元同分支怪癖 | 已证实（记录） | :274-276 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `drawPlotToCanvas` | §3.1 | 107-252 | covered（未测） |
| `pixelToData` | §3.2 | 255-279 | covered（未测） |
| 轴/科学文本辅助 | §2 | 14-105 | covered（未测） |

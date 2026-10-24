---
path: apps/electron/src/renderer/atoms/cslab-origin-atoms.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e39ee9060fc89a14abd61e813af8a3e8eaec32f2
sha256: e9cd0093933225614e58f2b499268fd098102bc381b223842c00a90653ce392b
lines: 28
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/cslab-origin-atoms.ts

## 1. 结论与边界

CSLab Origin 级绘画面板状态（28 行）。

## 2. 导出与关键符号

导出 6 条（`export` :8/:16/:19/:22/:25/:28）：`CsLabPlotSelection`（ROI 四点数据坐标 :8-13）、`cslabPlotDocumentAtom`、`cslabPlotSelectionAtom`、`cslabFitBusyAtom`、`cslabFitResultAtom`、`cslabFitDrawerOpenAtom`。

## 3-7. 不适用

纯原子声明（无逻辑分支）——依据：28 行全文。

## 8. 修改影响面

- 消费面：OriginPlotPane（含 PlotControls 注入源）。
- 依赖面：CsLabPlotDocument/CsLabFitResult 类型。
- 需同步测试：无专属。

## 9. 测试证据

无专属测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 6 条 | 已证实 | :8-28 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 6 导出 | §2 | :8-28 | covered |

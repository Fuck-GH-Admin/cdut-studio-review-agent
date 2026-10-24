---
path: apps/electron/src/renderer/atoms/cslab-vesta-atoms.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c2134c2e935585cddfc74da3a8674a6da4c06ea1
sha256: 301907de9fc8cc0b42d41eb1c26e38f78765282669ca426a55cf8589f72a1b69
lines: 44
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/cslab-vesta-atoms.ts

## 1. 结论与边界

CSLab VESTA 级晶体工作台状态（44 行）。

## 2. 导出与关键符号

导出 10 条（`export` :13/:20/:23/:26/:29/:32/:35/:38/:41/:44）：`CsLabSupercellState`（na/nb/nc :13-17）、`cslabCrystalAnalysisAtom`、`cslabSupercellAtom`（默认 1,1,1）、`cslabPxrdPatternAtom`、`cslabPolyhedraAtom`、`cslabIsoPositiveAtom`/`cslabIsoNegativeAtom`（等值面双相）、`cslabIsosurfaceBackendAtom`（'webgpu'|'cpu'|null）、`cslabIsosurfaceBusyAtom`、`cslabIsosurfaceErrorAtom`。

## 3-7. 不适用

纯原子声明（无逻辑分支）——依据：44 行全文。

## 8. 修改影响面

- 消费面：VestaCrystalPane（PXRD/多面体/等值面）。
- 依赖面：shared 晶体类型。
- 需同步测试：无专属。

## 9. 测试证据

无专属测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 10 条 | 已证实 | :13-44 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 10 导出 | §2 | :13-44 | covered |

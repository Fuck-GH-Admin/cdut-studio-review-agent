---
path: apps/electron/src/renderer/atoms/cslab-atoms.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 23076cdb9b1a007b3966d6b198dde78c3a95d8bf
sha256: fbd0f7da7b10c6aa5944a947132b093a81981c1a8b51c6ca3d2fd570c21060ea
lines: 336
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/cslab-atoms.ts

## 1. 结论与边界

CSLab 工作台全量状态原子集（336 行，59 导出）：窗格/抽屉/资产/工具/HPC/分享/晶体全状态源。nb-99 全组件状态依赖面的「形状权威」。

## 2. 导出与关键符号（按组）

- **类型**：`CsLabPaneViewType`（re-export :45）、`CsLabClientAuthState`（:48）、`CsLabPaneId`/`CsLabSplitLayout`/`CsLabDatasetDisplayMode`（:97-99）、`CsLabPaneState`（:101）、`CsLabDrawerMode`（:236-255，**18 态** asset/capsule/ingest/lineage/selection/plot/formula/brain/zotero/runs/notes/tools/share/hpc/fit/symmetry/pxrd/isosurface）、`CsLabPdfSelection`（:256）、`CsLabDrawerState`（:265）、`CsLabToast`（:297）。
- **常量**：`CSLAB_PANE_IDS`（:125，四 pane）。
- **窗格族**：cslabPanesAtom（:146）/cslabActivePaneIdAtom（:149）/cslabSplitLayoutAtom（:152，持久化）/cslabPaneTables/Manuscripts/Literature/Canvases/Mol/Plots（:158-183）/cslabPaneLoadingAtom（:203）。
- **工作台**：cslabAuthAtom（:60）/cslabTelemetryAtom（:69）/cslabNodesAtom（:74）/cslabLogsAtom（:79）/cslabLabsAtom（:84）/**cslabActiveLabIdAtom**（:87，atomWithStorage 'cslab-active-lab-id'）/cslabSnapshotAtom（:90）/cslabAssetsAtom（:93）。
- **抽屉/拖拽**：cslabDrawerAtom（:277）/cslabDrawerNormalWidthAtom（:286，默认 380）/cslabDrawerWideWidthAtom（:289，默认 520）/cslabAssetRailCollapsedAtom（:283）/cslabAssetDragAtom（:208）/cslabTileTargetAtom（:211）/cslabStaleCapsulesAtom（:292）。
- **域族**：plots（:188/:191）、zotero（:194）、工具（:197/:200/:234/:333）、手稿/协议/运行/笔记/画布（:214-231）、ingest（:295）、toast（:305）、share（:310-316）、hpc（:319-325）、原子选择（:328）、runSeed（:336）。

## 3. 内部逻辑与关键流程

纯声明+空工厂（emptyPanes 等）；宽度原子被 SlideDrawer 消费（380/520 与 DRAWER_WIDTH 一致）。

## 4. 调用者与调用链

入向：nb-99 全 17 组件（WorkspaceView 30+ 引用等）。出向：jotai/jotai-utils、`@profer/shared` 类型。

## 5-7. 数据/分支/权限

纯状态声明；持久化 2 键（active-lab-id/drawer 宽度）。

## 8. 修改影响面

- 消费面：CSLab 工作台全部组件。
- 依赖面：shared 类型族。
- 需同步测试：无专属。

## 9. 测试证据

无专属测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 59 导出按组清单+行号 | 已证实 | 导出 grep（§2） |
| 18 态 drawer 枚举 | 已证实 | :236-255 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号组 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 59 导出（9 组） | §2 | :45-336 | covered（图谱级） |

---
path: apps/electron/src/renderer/components/cdut-science/CsLabWorkspaceView.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ded9791205592eb2773f0f8465a9876701b6e365
sha256: 08efb9f24e90b8a312f082d15d76048d6390082bc87085f4e5597f94b64004f6
lines: 2660
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-science/CsLabWorkspaceView.tsx

## 1. 结论与边界

CDUT Science 沉浸式科研工作台主容器（2660 行，头注释 :2-6）：顶栏+左侧六维资产导航+中央 1/4 分屏舞台+右侧上下文抽屉；文件摄取、资产拖拽定向投射、跨窗格拖拽胶囊、Word 导入/导出/同步。

## 2. 导出与关键符号

导出 1 条（`export` :211）：`CsLabWorkspaceView`（:211-，唯一导出）。

## 3. 内部逻辑与关键流程（装配图谱，caller 交叉核）

- **子组件装配**：SplitControls :1998、AssetRail :2057、StageGrid :2142（→StagePane→7 视图）、TileOverlay :2193（visible=!!assetDrag）、**SlideDrawer :2201-2543** 包裹右侧 12 分支面板（runs→RunTimeline :2221、notes :2236、tools→ToolsPanel :2249、share :2255、hpc :2270、selection :2285、plot→PlotDigitizerPanel :2321、formula :2330、brain :2334、zotero→ZoteroPanel :2348、ingest :2356、capsule :2470）；drawer 标题映射 :1779-1824。
- **electronAPI 50+ 处**（关键）：undoPlotUpdate:319、listAssets/listManuscripts/getLabSnapshot:347-349、start/stopCustomToolWatch:361/:363、loadPlot:385、readCanvas:598、getMolAsset:647、ingestFiles:1236、importDocx:1286、saveManuscript:1366/:1645、saveManuscriptAs:1414、exportDocx:1697、syncDocx:1736、**openAgentWindow:1901**、answerHpcMfa:2619/:2637。
- 出向：cslab-atoms 30+、useCsLabVault:99/:357、useCsLabEvents:109/:994、cslab-capsule-node、cslab-snapshot-registry:110/:1031。

## 4. 调用者与调用链

入向（子agent 交叉核）：唯一 `CdutScienceView.tsx:19` → :72（activeLabId 分支）；上溯 `MainArea.tsx:27/:337`。出向：见 §3。

## 5. 数据 I/O、读写与副作用

资产/手稿/画布/分子/文献/工具全量 IPC；快照；Word 链。

## 6. 分支、失败、取消与恢复

drawer 12 分支；undoPlotUpdate 撤销链；不适用取消/恢复。

## 7. 权限与权威状态

会话绑定唯一注入（ToolsPanel 契约上游）；拖拽投射边界（cslab-dnd MIME）。

## 8. 修改影响面

- 消费面：CSLab 工作台全交互面。
- 依赖面：30+ atoms、cslab IPC 族、8 个面板组件。
- 需同步测试：无专属（全树 0 命中）。

## 9. 测试证据

无专属测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 1 条；装配图谱+IPC 链 | 已证实 | caller 交叉核（§3/§4） |
| 2660 行逐行实现 | 推断（头+装配级） | 全文件结构 |
| 通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+装配图谱 | §2/§3 | :211-2543 | covered（装配级） |
| 业务逻辑实现 | §10 | 全文件 | 推断 |

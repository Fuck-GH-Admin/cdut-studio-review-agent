---
path: apps/electron/src/renderer/components/cdut-zone/AiClassKnowledgeTree.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 37bf78c628ac1ab94b6c95aaa98400e3a3e7bf86
sha256: 274ace0d8bf742c7021a4ccca8efb8aae418fcc076339f50afeb2837917b7cb2
lines: 974
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-zone/AiClassKnowledgeTree.tsx

## 1. 结论与边界

「资料树」**现代简约节点图**（974 行，本批最大件）：本地毫秒级解析即渲染卡片流+贝塞尔曲线（`:5`）；跨资料关联**恒定由用户点【开始生成】触发**（方案弹窗选模式），"绝不自动偷跑 Token"（`:6-7`）；全屏图谱 92% 视口（`:8`）；画布单一 SVG 坐标系（节点卡走 foreignObject）根除层错位（`:9-11`）。名为"树"实为平铺节点图（无折叠状态机——照实）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `AiClassKnowledgeTree` | `:767` | **唯一 export**：`({sessionId})`：布局/画布/聚焦卡/全屏/生成弹窗+生成 IPC+会话清理 |

内部全量（要点）：布局常量（`PAD/COL_W/NODE_W/NODE_H/ROW_H:54-60`、`SINGLE_MATRIX_THRESHOLD=6:64`、`SINGLE_COL_ROWS=14:66`、`MIN/MAX_SCALE:69-70`）；`RELATION_STYLE:73-78`（prerequisite/exercise/extension/reference 四型配色）；类型 `GraphNode:80`/`GraphColumn:91`/`GraphLayout:99`/`CrossEdgeGeometry:197`/`CameraState:289`/`StarMapCamera:302`（回调 ref 注释 `:304`）等；函数 `computeSingleDocColumns:112-133`（大章聚合或 14 行定长切列）、`computeLayout:141-184`（双模式矩阵布局）、`verticalCurve:188`、`computeCrossEdgeGeometry:216-273`（三场景弧线，t=0.5 中点，自述修旧算法三 Bug `:203-215`）、`copySectionPrompt:277-285`（"以此节提问"模板复制）、`clampScale:313`、`useStarMapViewport:319-414`（相机 hook：滚轮非被动监听/3px 拖拽阈值/锚点缩放）、`StarMapZoomControls:427`/`StarMapSurface:460`/`GraphCanvas:503-654`（四层 SVG：竖连线/跨边/节点卡/微标签）、`KnowledgeTreeLargeModal:668-754`（全屏弹窗）。

## 3. 内部逻辑与关键流程

**状态机**：selected/largeOpen 本地 useState；`modalOpen` 原子（**读值未用** 矛盾④）；全屏独立 query/selected。**生成态机**（跨会话共享原子 `:833`）：idle→updating→逐批 progress→false→600ms 清 progress。**IPC**：`cdutAiClass.onGraphProgress` 订阅（sessionId 过滤 `:794`）、`generateGraphRelations`（`:817`，sessionIdRef stale 守卫 `:818-826`，失败仅 warn `:822`）；`AiClassGraphGenerateModal` onConfirm→generate（`:970`）。**会话切换清理**（`:835-840`）：selected/graph/updating/progress 全复位（注释 `:832-834` 记旧 bug）。

## 4. 调用者与调用链

`AiClassView.tsx:39/367`；出向 study-atoms（5 原子）、`./AiClassGraphGenerateModal`、`@profer/shared`（KnowledgeGraph* 类型）、`@profer/ui` Dialog。

## 5. 数据 I/O、读写与副作用

IPC（进度订阅/生成请求）+atoms+剪贴板（copySectionPrompt）。

## 6. 分支、失败、取消与恢复

生成失败仅 console.warn（无 toast/重试，照实）；边端点缺失静默跳过（`:550`/`:623`）；空资料空态+双按钮禁用（`:853`/`:863`）；卸载不取消在途 generate（未覆盖清单）。

## 7. 权限与权威状态

- **"绝不自动偷跑 Token"**（`:6-7`/`:810`）：生成恒为用户显式触发（onConfirm）。
- **单一 SVG 坐标系契约**（`:9-11`）：节点卡 foreignObject 与连线同坐标系。
- 相机/布局为纯本地视图状态。

## 8. 修改影响面

改布局/几何影响图谱可读性；生成链联动 GraphGenerateModal/主进程；原子契约联动 study-atoms。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（矛盾照实记录，子agent 三段精读+字节核对）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件唯一导出/布局/相机/生成链 | 已证实 | 974 行全读（export 仅 1 处字节核对） |
| **①** 头注释 `:13`"聚焦节点走原子"与实际 useState 不符；**②** `:800`"100% 淡出"与 `:874` 渲染门槛冲突（无淡出效果） | 已证实 | `:13`/`:776`、`:800`/`:874` |
| **③** GraphNode/GraphColumn.docId 写后不读（孤儿字段）；**④** modalOpen 读值未用（孤儿变量） | 已证实 | `:82`/`:94`/`:778` 字节核对 |
| **⑤** `:110` 切列注释不完全准确（fallback 还覆盖顶层组<2）；**⑥** "跨资料边"命名含同列场景；**⑦** 提问模板文案三处不一；**⑨** 边几何每边重复计算两次 | 已证实 | `:110`/`:127`、`:196`/`:220-235`、`:276`/`:751`/`:281`、`:553`/`:625` |
| **⑧** 一致项照实（92% 视口/不偷跑 Token/t=0.5 中点） | 已证实 | `:8`/`:687`、`:810`、`:214`/`:232-233` |
| 主进程分批广播/study-atoms 持久化 | 未知 | 不在本批 |
| 渲染实效 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 唯一导出/内部全量/状态机 | §2/§3 | covered |
| Token 红线/坐标系契约 | §7 | covered |
| 9 矛盾 | §10 | covered |

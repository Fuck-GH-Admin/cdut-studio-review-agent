---
path: apps/electron/src/renderer/components/ai-elements/mindmap-canvas.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 88935e06ce39e289e9d20b5d05acf69e11f657f0
sha256: f989723f18e3640486d775b5a60ca0a7634a81475580474d2f099bea3d3d387b
lines: 691
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/ai-elements/mindmap-canvas.tsx

## 1. 结论与边界

思维导图**通用画布与全屏视窗**（691 行）：为「AI 速课堂导图 Tab」与「对话流 ```mindmap 块」共用渲染/视口引擎（`:2-8`）。双曲 Poincaré 布局（共享层 `layoutMindMap`）+用户拖拽覆盖；径向三次贝塞尔连线（互不相交）；滚轮锚点缩放/拖拽平移/自适应复位；全屏=点阵毛玻璃视窗+胶囊工具条+鸟瞰小地图+气泡自由拖拽。

## 2. 导出与关键符号（9 处 export，子agent 字节核实）

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `MINDMAP_ZOOM_MIN=0.2`/`MINDMAP_ZOOM_MAX=3` | `:25`/`:26` | 缩放钳制共用 |
| `MindMapPt` | `:31-34` | `{x,y}` |
| `MindMapScene` | `:37-42` | `{positions: Map, width, height, center}`（center=径向基准） |
| `buildMindMapScene` | `:61-118` | 布局→归一化→**拖拽覆盖画布内夹取**（`:104-105`）→圆心=根节点实际位置（`:110-111`） |
| `MindMapCanvas` | `:161-254` | SVG 连线层（pointer-events-none）+气泡层 |
| `ViewportApi` | `:256-271` | 视口契约（zoom/pan/zoomBy/fit/onWheel/beginPan…） |
| `useMindMapViewport` | `:278-412` | 视口 hook（zoom+pan **单一 state 原子更新** `:276` 设计注释） |
| `MindMapFullscreenModal` | `:445-691` | 全屏视窗（工具条/小地图/气泡拖拽） |

内部：`SCENE_PAD=56:29`、`edgeAnchor:138-149`（气泡边缘锚点，退化回 center）、`estimateNodeSize:155-158`、`MINI_W/H:435-436`。

## 3. 内部逻辑与关键流程

- **布局**（`:61-118`）：`layoutMindMap(root,{diskRadius:720,baseRadius:150})`→flatten→包围盒含气泡半尺寸（回退 {48,18}）→归一化（最小 360×280+pad）。
- **连线**（`:195-227`）：DFS 逐边→edgeAnchor 外缘→`buildBezierPath` 径向贝塞尔（scene.center 切线基准）。
- **视口**（`:278-412`）：fit/zoomBy（`computeAnchorZoomPan` 光标锚点）/滚轮 ×1.12/平移；首帧 fittedRef 自适应一次。
- **全屏模态**：滚轮**双保险**（回调 ref 原生 passive:false 监听 `:481-499`——Radix Portal 竞态注释 `:474-480`+React onWheel 兜底防双缩放 `:582-587`）；小地图反投影红框（`:555-563`）+拖拽平移；工具条（100%/缩放/fit/Eraser/Download/X，无回调按钮隐藏）；`DialogContent` 禁加 relative（`:567-568` 警告）。

## 4. 调用者与调用链

`MindMapBlock`（批内）、AiClassMindMapTab（cdut-zone，批外）；出向 `@profer/shared`（mindmap-engine 5 函数）、`@profer/ui` Dialog、overlay-atoms。

## 5. 数据 I/O、读写与副作用

纯渲染+DOM 测量（ResizeObserver/offsetWidth）；无持久化（拖拽覆盖由调用方持久化）。

## 6. 分支、失败、取消与恢复

禁用/非法尺寸静默 no-op；缺 position 跳过边/气泡；edgeAnchor 退化回 center；实测缺失回退估算。

## 7. 权限与权威状态

**单一 state 原子更新契约**（`:276`）：zoom/pan 合并防 React 18 批处理漂移（矛盾③指出 MindMapBlock 违反）；`DialogContent` 基类 fixed 不可覆盖（`:567-568`）。

## 8. 修改影响面

改布局/锚点影响导图可读性；视口契约联动两消费者；小地图几何与容器 padding 精确对应（`:545-546`）。

## 9. 测试证据

无直接测试（mindmap 无任何测试文件——照实）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（矛盾照实记录，子agent 精读+字节核对）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 9 导出/布局/连线/视口/全屏 | 已证实 | 691 行全读（export 逐行核实） |
| **①** `buildMindMapScene` options.scale 声明未读（孤儿参数）；**②** halfSizeOf 与 estimateNodeSize 逐字重复 | 已证实 | `:64`/`:45-48` vs `:155-158` |
| **④** 滚轮策略不一致（modal 原生 passive:false vs 气泡 React onWheel 可能连带滚页）；**⑤** 拖拽阈值 >2px vs >3px 不一；**⑦** 1.12 倍率逻辑三份重复 | 已证实 | `:488-496` vs MindMapBlock `:146`、`:513`、`:366`/`:492`/`:585` |
| **⑧** onPointerLeave 绑 onPointerUp（移出即触发点击语义怪癖）；**⑨** enabled 分支无调用方 | 已证实 | `:591`/`:333` |
| **⑩** message.tsx mermaid→MindMapBlock 改道核实为防御性设计（非误用） | 已证实 | `apps/electron/src/renderer/components/ai-elements/message.tsx:870-873` |
| shared mindmap-engine/Dialog 实现 | 未知 | 不在本批 |
| 渲染实效 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 9 导出/引擎接线 | §2/§3 | covered |
| 原子更新契约 | §7 | covered |
| 9 矛盾+澄清 | §10 | covered |

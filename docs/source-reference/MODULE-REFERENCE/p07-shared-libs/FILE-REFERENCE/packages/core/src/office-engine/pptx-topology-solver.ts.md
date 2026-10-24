---
path: packages/core/src/office-engine/pptx-topology-solver.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7376010b087ee7654688de99f3789ba2db27b872
sha256: 6d32238507396554c5fd07884850b70b31e7366cfe2526ed9a9e0323dcf56364
lines: 784
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/core/src/office-engine/pptx-topology-solver.ts

## 1. 结论与边界

PPTX **离散空间拓扑与阅读顺序重构求解器**（`packages/core/src/office-engine/pptx-topology-solver.ts:1-8`）四大能力：① 嵌套 `p:grpSp` 递归 2D 齐次仿射（3×3）展平（平移 a:off/子空间重映射 chOff·chExt→ext/旋转 rot/60000°/镜像 flipH·flipV）；② `p:timing` 动画因果序 + **Y-Band（0.04·H）** 空间阅读序重构；③ `p:cxnSp` 连接线拓扑→**mermaid flowchart** 合成；④ 文本框/表格（GFM）/图表/图片/演讲者备注提取。

边界：确定性求解；缩放防御（±64x 钳制、非有限回退单位矩阵，`:124-126`）；NaN/Inf 角点回退默认框（`:180-182`）——bbox 恒 [0,1] 有序。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `Matrix2D` | type | 48 | `[a,b,tx,c,d,ty]` 6 元 | 零外部引用 |
| `IDENTITY_MATRIX` | const | 50 | `[1,0,0,0,1,0]` | 零外部引用 |
| `multiplyMatrix2D` | function | 53-63 | 矩阵乘 | 零外部引用 |
| `applyMatrix2D` | function | 66-69 | 点变换 | 零外部引用 |
| `solvePptxTopology` | function | 663-784 | `(zip, options?) => OfficeDocumentLayoutAST` | 主入口 |

内部：`emuToPt/clamp01`（`:38-45`）、`buildRotationFlipMatrix`（`:74-95`，T·R·S·T⁻¹ 绕局部中心）、`buildGroupTransformMatrix`（`:102-140`，chOff/chExt 重映射+safeScale 防御）、`computeShapeNormalizedBBox`（`:145-196`，四角投影取 min/max）、`extractTxBodyContent`（`:217-277`，title/subTitle 占位→heading 1/2、buChar/buAutoNum→list）、`extractDrawingTable`（`:280-327`，GFM）、`collectShapesFromTree`（`:332-477`，grpSp 递归+sp/graphicFrame/pic/cxnSp 四类）、`extractTimingOrderMap`（`:482-496`，spTgt 首现序）、`sortSlideShapesDeterministically`（`:501-530`：title→subtitle→timing→Y-Band 0.04→X）、`buildMermaidFromConnectors`（`:535-580`，`flowchart LR`+标签消毒 32 字）、`resolveOrderedSlidePaths`（`:585-632`，sldIdLst+rels 有序，回退 slideN 数字序）、`extractSpeakerNotes`（`:634-660`，rels 找 notesSlide，跳过 sldNum/hdr/ftr/dt 占位）。

## 3. 内部逻辑与关键流程

`solvePptxTopology`（`:663-784`）：逐幻灯片（maxPages 截断）→ spTree 递归收集（IDENTITY 起点）→ timingMap→确定性排序→块落版（`p{slide}-b{idx}`，locLabel「幻灯片N·…」）→ Mermaid 合成块（```mermaid 围栏）→ 演讲者备注块（footer 型，bbox 固定 [0.05,0.88,0.95,0.98]）→ pages（含 `mermaidDiagrams` 字段）。presTitle=coreMeta.title||首页标题。

## 4. 调用者与调用链

出向：`./types.ts`（5 类型）、`./ooxml-zip-reader.ts`（9 符号）（`:10-28`）。入向（检索=符号名+模块名，全冻结树）：

- `solvePptxTopology`：`office-engine/index.ts:14,100`（唯一转发）→ main 5 文件产品链。
- `Matrix2D`/`IDENTITY_MATRIX`/`multiplyMatrix2D`/`applyMatrix2D`：**零外部引用**（仅模块内互用）。
- 测试：本批 `office-engine.test.ts` PPTX 用例（仿射 bbox `toBeCloseTo(100/960,2)`/Mermaid 边/演讲者备注）。

## 5. 数据 I/O、读写与副作用

纯内存；无 I/O；无副作用。

## 6. 分支、失败、取消与恢复

失败静默跳过（slideRoot null/无文本形状 continue）；防御钳制三处（safeScale/NaN 角点/标签消毒）；无异步/取消。

## 7. 权限与权威状态

本文件不适用（无权限代码）；EMU 换算（1pt=12700EMU，`:33`）与阅读序优先级（title>subtitle>timing>Y-Band，`:501-530`）是权威口径。

## 8. 修改影响面

- 仿射展平/排序规则改动→PPTX 全部 bbox 与 readingOrder。
- Mermaid 合成是 office-engine.test PPTX 用例锚（`S11["震源激发"] --> S12…`）。
- 4 矩阵导出零外部引用（裁剪候选，照实记录）。

## 9. 测试证据

间接 `office-engine.test.ts`（本批 PPTX 用例：仿射归一化数值/mermaid/备注）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 四大能力+确定性排序 | 已证实 | `:1-8,501-530` |
| 三处防御钳制（±64x/NaN/消毒） | 已证实 | `:124-126,180-182,542` |
| 4 矩阵导出零外部引用 | 已证实（检索式见 §4，全冻结树） | grep+子 agent |
| 真实 PPTX 版面保真度 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 5 导出 | §2 | 48-784 | covered |
| 仿射/防御 | §2/§3 | 74-196 | covered |
| 收集/排序/Mermaid/备注 | §3 | 332-784 | covered |

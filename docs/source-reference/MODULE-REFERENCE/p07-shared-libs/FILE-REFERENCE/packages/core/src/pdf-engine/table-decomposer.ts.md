---
path: packages/core/src/pdf-engine/table-decomposer.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: df3f45bbf6b649ed9861c809d38c9cbbb6ac847b
sha256: 500f7719e16e5db53fc34c80b460535cdc5de1bd15f533169d8be8b3e4aa9f5f
lines: 276
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-05-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---

# packages/core/src/pdf-engine/table-decomposer.ts

## 1. 结论与边界

Category C **表格空间网格重构**：三线表/跨列单元格 → 结构化矩阵 + GFM Markdown（`table-decomposer.ts:1-11`）。投影剖分 + 跨度合并。纯函数、无 I/O。本文件是矢量线段的**真实消费点**（列分界，非表区探测——对比 native-segmenter 注释）。

## 2. 导出与关键符号

`export` 逐条核：2 个导出（1 接口 + 1 函数）+ 8 个内部函数 + 1 内部接口。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `TableDecomposeInput` | 导出接口 | `:17` | region/glyphs/vectorLines/pageWidth/pageHeight/caption? | 表区输入 |
| `decomposeTable` | 导出函数 | `:212` | `(input): LayoutTableStructure` | 重构主入口 |
| `RowCluster`（内部） | 接口 | `:29` | glyphs/y0/y1 | 行簇 |
| `glyphInRegion`（内部） | 函数 | `:36` | 中心 ±1pt 容差 | `:39` |
| `medianFontSize`（内部） | 函数 | `:42` | 中位字号（空→10） | `:43-45` |
| `clusterRows`（内部） | 函数 | `:49` | Y 向聚类 | 容差 `max(中位字号*0.6,1)`（`:50`） |
| `bboxOf`（内部） | 函数 | `:74` | 外接矩形 | |
| `splitRowIntoGroups`（内部） | 函数 | `:89` | 行内 X 空白切组 | 间隙阈值入参 |
| `modeMax`（内部） | 函数 | `:107` | 众数（并列取大） | `:113` |
| `columnBandsFromLines`（内部） | 函数 | `:122` | 垂直线定列区间 | 见 §3 |
| `columnBandsFromBoxes`（内部） | 函数 | `:151` | X 投影定列区间 | 256 bin（`:157`） |
| `renderMarkdown`（内部） | 函数 | `:200` | GFM 渲染 | 缺格补空（`:202`） |

## 3. 内部逻辑与关键流程

`decomposeTable`（`:212-276`）：
1. `glyphInRegion` 过滤（`:213`，中心 ±1pt，`:36-40`）；
2. `clusterRows`（`:214`）；`gapThreshold = max(fontSize*0.9, 3)`（`:216`）；`splitRowIntoGroups`（`:218`）；
3. 列数 = `Math.max(1, modeMax(每行组数))`（`:221`，跨越单元格不掩盖真实列数，`:220` 注释与实现一致）；
4. 列分界：`columnBandsFromLines`（区域内**垂直**线 `!isHorizontal`（`:128`）、x 在区域 ±2（`:129`）、线长 ≥50% 区高（`:129`）、x 去重 3pt（`:137`）、带宽 >2（`:145`）、≥2 带否则 null（`:147`））**优先**，否则 `columnBandsFromBoxes`（仅"组数=列数"代表行的框，`:224-229`；256-bin X 投影（`:157-163`）、`minGap=max(3,2%W)`（`:166`）合并近邻带（`:179-185`）、空白中点为界（`:188-196`））（`:230-231`）；
5. 逐行逐组：按带重叠算 `columnIndex`（**首带**，`:245`）与 `colSpan`（重叠带数，`:246`）；`rowSpan` 恒 1（`:253`）；`isHeader=rowIndex===0`（`:255`）；`text=join('').trim()`（`:248`）；bbox 归一化（`:249`）；**跨列单元格文本只写 `rowMatrix` 首带格**（`:259`）；
6. `headers` 取 matrix 第 0 行按带补齐（`:264-265`）；`markdown=renderMarkdown(matrix,bandCount)`（`:272`，`---` 分隔行，`:204`）；`caption` 可选（`:274`）。

## 4. 调用者与调用链

- 入向：`pdf-engine.ts:75-81`（table 节点分支；实参 region=box.bbox、glyphs=group.glyphs、vectorLines=整页矢量线）。
- 出向：`@profer/shared` `normalizePointBBox`（`:14`）+ 类型（`:13`）+ `./types`（`:15`）。
- 测试：无直接单测（检索=全树 `*.test.ts`）；域外 `pdf-engine/__tests__/table-decomposer.test.ts` 2 用例（三线表+colSpan+GFM/垂直边框线优先列分界，断言体未逐行核）。

## 5. 数据 I/O、读写与副作用

无 I/O、无副作用；不改入参。

## 6. 分支、失败、取消与恢复

仅过滤/回退分支（lines bands → boxes bands；空 boxes→整区单带，`:155,186`）；无抛错、无取消。

## 7. 权限与权威状态

无权限分支，依据：纯函数。

## 8. 修改影响面

列分界/colSpan 策略影响 `LayoutTableStructure.markdown` 与 cells，直接决定表格在最终 Markdown 的呈现；`pdf-engine` 把 `structure.markdown` 作为 table 节点 text（`pdf-engine.ts:87`）。

## 9. 测试证据

`NOT_RUN`。直接测试：无。域外 2 用例（§4）。缺口：`modeMax` 并列取大、`columnBandsFromBoxes` 投影/合并、colSpan 计算无直接断言。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| §3 全流程/阈值/规则 | 已证实 | `:36-275` 逐行 |
| 跨列文本只入首带格（rowMatrix[columnIndex]） | 已证实 | `:259` |
| 矢量线仅用于列分界（非表区探测） | 已证实（跨文件对比） | `:122-148` 消费 vectorLines；native-segmenter 不消费 |
| 对真实三线表/复杂表的重构正确性 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/域 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 导出 + 9 内部 | §2 | 17-207 | covered |
| 重构 6 步 | §3 | 212-276 | covered |
| 测试 | §9 | — | covered（缺口如实） |

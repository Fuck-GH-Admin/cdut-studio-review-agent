---
path: packages/core/src/office-engine/xlsx-grid-solver.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a9750ca2123c297b86fbdc0c786a1e1b1a591a0f
sha256: 827713598d1c0bb6c33e07e04245600261d07d07da4e83f6873c21eaeccb1725
lines: 791
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/core/src/office-engine/xlsx-grid-solver.ts

## 1. 结论与边界

XLSX **离散网格分解与浮动锚点几何求解器**（`packages/core/src/office-engine/xlsx-grid-solver.ts:1-10`）：① 稀疏 DoK 网格+连通区域分割（≥2 空行/空列切独立数据表区块）；② 合并单元格语义传播+长表分块（每块 ≤40 行自动克隆表头上下文）；③ SST/日期格式/calcChain 公式依赖提取；④ ECMA-376 列宽字符像素换算（`Width_px = trunc((256w+trunc(128/MDW))/256×MDW)`）+ 1px=9525EMU 解析 `xdr:twoCellAnchor/oneCellAnchor` 图表坐标。

边界：缺 `xl/workbook.xml` 抛错（`:534-536`）；日期序列号 1900 闰年偏差修正（25569 锚点，`:152-155`）；calcChain 解析后 `void` 未消费（照实记录，`:767`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `colLettersToIndex` | function | 44-54 | `'AA'→26` | **零外部引用** |
| `indexToColLetters` | function | 57-66 | 反向 | **零外部引用** |
| `parseCellAddress` | function | 69-76 | `'$C$5'`→{row:4,col:2} | **零外部引用** |
| `formatRangeAddress` | function | 79-84 | `'A1:F20'` | **零外部引用** |
| `columnCharWidthToPx` | function | 90-94 | ECMA-376 公式 | **零外部引用** |
| `solveXlsxGrid` | function | 531-791 | `(zip, options?) => OfficeDocumentLayoutAST` | 主入口 |

内部：`clamp01`（`:39-41`）、`parseSharedStrings`（`:97-104`）、`isBuiltInDateNumFmt/isCustomDateFormatCode`（`:106-126`，14-22/27-36/45-47/50-58 内置日期段）、`parseDateStyleSet`（`:128-151`）、`formatExcelSerialDate`（`:153-171`）、`parseCalcChain`（`:175-190`）、`SparseCell/MergeRange/SheetGridModel`（`:192-216`）、`parseWorksheetGrid`（`:221-361`：cols 宽/sheetData 稀疏单元格（s/b/inlineStr/日期四态）/mergeCells 边界扩展）、`buildAxisOffsetsPx`（`:365-376`）、`partitionGridIntoRegions`（`:388-455`：行带→列区两段 ≥2 空隙切分）、`parseSheetDrawings`（`:462-532`：rels 找 drawing→twoCell/oneCellAnchor→px→归一 bbox）、主循环（`:581-756`：mergeLookup 传播、≤40 行分块克隆表头、GFM 表+行坐标列、`formulaDeps` 集合、图表 figure 块）。

## 3. 内部逻辑与关键流程

`solveXlsxGrid`（`:531-791`）：workbook.xml+rels 解析工作表有序清单（回退 sheetN 文件名序）→ 逐表：`parseWorksheetGrid`→轴偏移表（列宽/行高 px 累积）→ **mergeLookup**（子格→左上主格）→ `partitionGridIntoRegions`→区域分块（maxRowsPerBlock-1 数据行/块，首行表头**每块克隆**）→ GFM 表（`### SheetName (cellRef)` + 行坐标列 + 公式依赖注释 ≤6 条）→ bbox=区域像素/活跃区归一 → `parseSheetDrawings` 浮动图表块 → pages（`widthPt≥400/heightPt≥300`）。metadata 含 `sheetNames` 全清单。

## 4. 调用者与调用链

出向：`./types.ts`（3 类型）、`./ooxml-zip-reader.ts`（8 符号）（`:11-26`）。入向（检索=符号名+模块名，全冻结树）：

- `solveXlsxGrid`：`office-engine/index.ts:15,103`（唯一转发）→ main 5 文件产品链。
- 5 函数导出（坐标/列宽换算）：**零外部引用**（仅模块内自用）。
- 测试：本批 `office-engine.test.ts` XLSX 用例（SST/合并/cellRef/sheet-cell 锚/公式 `B3=AVERAGE(B2:B2)`/图表说明）。

## 5. 数据 I/O、读写与副作用

纯内存；无 I/O；无副作用。

## 6. 分支、失败、取消与恢复

抛 `Error`：缺 workbook.xml；空表/空区域静默跳过；解析降级三处（sheet 顺序回退/日期越界回退原文/to 锚缺省 4 列 10 行）；无异步/取消。

## 7. 权限与权威状态

本文件不适用（无权限代码）；ECMA-376 列宽公式与 1px=9525EMU（`:7-8,33`）是几何权威口径。

## 8. 修改影响面

- 分块/表头克隆语义是 office-engine.test XLSX 用例锚。
- 列宽公式改动→图表 bbox 全链。
- 5 函数导出零外部引用+calcChain 解析未消费（照实记录）。

## 9. 测试证据

间接 `office-engine.test.ts`（本批 XLSX 用例 10+ 断言）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 四大能力+确定性 | 已证实 | `:1-10`+全文 |
| ≥2 空隙切分+表头克隆 | 已证实 | `:388-455,655-665` |
| 日期 1900 偏差修正 | 已证实 | `:152-155` |
| 5 导出零外部引用 | 已证实（检索式见 §4，全冻结树） | grep+子 agent |
| `calcChainBySheet` 解析后未消费（`void`） | 已证实（照实记录） | `:177,767` |
| 真实 XLSX 保真度 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 6 导出 | §2 | 44-791 | covered |
| 网格/合并/日期/公式 | §2/§3 | 221-361 | covered |
| 分区/分块/GFM | §3 | 388-756 | covered |
| 浮动锚点 | §3 | 462-532 | covered |

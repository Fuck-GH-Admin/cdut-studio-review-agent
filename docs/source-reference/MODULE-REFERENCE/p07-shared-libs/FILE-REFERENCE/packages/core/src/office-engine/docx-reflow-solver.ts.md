---
path: packages/core/src/office-engine/docx-reflow-solver.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2d59b32930699f151c002aa71067b874df0dd2ee
sha256: 7e1e7f528510c6a91ed6ecafb1d3ff1f461fce570f3e0f92c1306d81fb5f623c
lines: 1124
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/core/src/office-engine/docx-reflow-solver.ts

## 1. 结论与边界

DOCX **确定性流式排版重排求解器**（`packages/core/src/office-engine/docx-reflow-solver.ts:1-10`）六大核心能力：① 样式继承链（`w:basedOn` 递归合并，带环路检测）；② Windows GDI 整数字距仿真+CJK 全角网格测量折行（`h_line = s*1.298*(w:line/240)`）；③ 跨页浮动表格分裂（`w:tbl`/`w:cantSplit`/`w:tblHeader` **虚拟表头克隆**）；④ OMML→LaTeX 递归转译；⑤ 脚注空间预留+显式分页感知；⑥ 归一化 bbox + `p{page}-b{idx}` 拓扑锚点。

边界：确定性求解（无 ML）；缺 `word/document.xml` 直接抛错（`:813-815`）；插图高度防御上限 4000pt（异常值丢弃，`:52`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `convertOmmlNodeToLatex` | function | 349-453 | `(node) => string` | 13 OMML 构造递归（f/sSup/sSub/sSubSup/rad/nary/d/m/eqArr…） |
| `measureGdiTextWidthPt` | function | 467-485 | `(text, fontSizePt) => number` | 96DPI 整像素舍入；CJK=全宽/空格 0.33/大写 0.65/其余 0.54 |
| `computeGdiLineHeightPt` | function | 489-504 | `(fontSizePt, lineTwips?, lineRule?)` | exact/atLeast/auto 三分支 |
| `solveDocxReflow` | function | 809-1124 | `(zip, options?) => OfficeDocumentLayoutAST` | 主入口 |

内部（选要）：`extractDrawingHeightPt`（`:58-84`，EMU extent/VML style 双路，4000pt 防御）、`isDrawingFlowDisplacing`（`:90-98`，behindDoc/wrapNone 浮动不占位）、`clamp01`（`:100-102`）、三接口（`:106-140`）、`detectHeadingLevelFromStyle`（`:142-155`，outlineLvl 优先+heading/标题 1-6 正则）、`parseStylesXml`（`:215-286`，docDefaults+basedOn 递归展开）、`parseNumberingXml`（`:288-321`）、`parseFootnotesXml`（`:323-347`，separator 剔除）、`parseSectionGeometry`（`:507-553`，A4 缺省）、`extractParagraphSegments`（`:567-713`，run 级粗斜体/分页符/drawing/footnote/OMML 收集）、`parseTableRows`（`:722-778`，cantSplit/tblHeader/显式行高）、`buildGfmTableMarkdown`（`:780-806`）。

## 3. 内部逻辑与关键流程

`solveDocxReflow`（`:809-1124`）：styles/numbering/footnotes 三注册表→body 流式走段：

- **段落**（`:902-1035`）：内联>样式>缺省三层属性合并；GDI 宽度→行数→行高；**插图段落用真实绘图高度替代 13pt 假想文本**（`:951-953` 注释——修复整页纵向坐标漂移）；widow/orphan 阈值翻页（`:956`）；块类型五分类（formula/figure/heading/list/caption 正则 `^(图|表|Fig…)\d+`，`:981-998`）；list 计数器 per `numId:ilvl` 递增。
- **表格**（`:1037-1110`）：`commitTableSlice` 切片落块（rowCount/columnCount）；投影高度超底→切片+翻页+**新页顶部虚拟克隆 `w:tblHeader` 表头行**（`:1090-1095`）。
- **翻页 flush**（`:836-881`）：页脚脚注先落块（`[^id]` Markdown+底部 bbox，高度 ≤ 页面 25%）；`maxPages` 截断（`:897`）。
- 标题回落：docTitle = coreMeta.title || 页标题 || 首个 heading（`:1112-1114`）。

## 4. 调用者与调用链

出向：`./types.ts`（5 类型）、`./ooxml-zip-reader.ts`（8 符号）（`:10-27`）。入向（检索=符号名+模块名，全冻结树）：

- `solveDocxReflow`：`office-engine/index.ts:13,97`（唯一入口转发）→ main 5 文件产品链（document-parse-tools/document-parser/file-preview-service/review/document-service/study-indexer）。
- `convertOmmlNodeToLatex`/`measureGdiTextWidthPt`/`computeGdiLineHeightPt`：**零外部引用**（前者仅递归自调+内部，后两者仅内部 :757-762/:941-943）。
- 测试：本批 `office-engine.test.ts`（3 test 之 DOCX 用例，间接经 parseOfficeBuffer）。

## 5. 数据 I/O、读写与副作用

纯内存（zip 文本进 AST 出）；`NumberingRegistry.counters` 为解析过程可变状态；无 I/O。

## 6. 分支、失败、取消与恢复

抛 `Error`：缺 `word/document.xml`；插图高度异常→丢弃（防御）；无异步/取消。

## 7. 权限与权威状态

本文件不适用（无权限代码）；GDI 行高公式与 EMU/Pt 换算（1pt=12700EMU，`:49`）是排版权威口径（`:1-10` 注释）。

## 8. 修改影响面

- GDI 度量/行高公式改动→全 DOCX 布局 bbox。
- 表格虚拟表头克隆/脚注预留是 office-engine.test DOCX 用例锚。
- 3 导出零外部引用（裁剪候选，照实记录）。

## 9. 测试证据

间接 `office-engine.test.ts`（本批 3 test，DOCX 用例 13 断言含 `\frac` LaTeX/继承样式/双锚点/剥锚）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 六大能力+确定性 | 已证实 | `:1-10`+全文 |
| 插图真实高度修复漂移 | 已证实 | `:951-953` |
| 虚拟表头克隆 | 已证实 | `:1090-1095` |
| 样式环路检测 | 已证实 | `:262-270` |
| 3 导出零外部引用 | 已证实（检索式见 §4，全冻结树） | grep+子 agent |
| 真实 Word 文档版面保真度 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 导出 | §2 | 349-1124 | covered |
| OMML 13 构造 | §2/§3 | 349-453 | covered |
| GDI 度量/行高 | §2/§3 | 454-504 | covered |
| 段落/表格/翻页 | §3 | 560-1124 | covered |

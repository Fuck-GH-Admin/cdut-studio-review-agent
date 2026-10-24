---
path: packages/core/src/pdf-engine/pdf-engine.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 479d597c7a58422a930a9794edb8d618a42cb9b3
sha256: b5149509622dc2b098ef366fd8d940062bfc59dd2f382cd04ef4a36dc1f15038
lines: 196
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-05-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---

# packages/core/src/pdf-engine/pdf-engine.ts

## 1. 结论与边界

PDF 解析**顶层调度管道（Pipeline Facade）**：唯一导出 `parsePdfDocument(buffer, options)` 串联 图元提取 → TrapDoc 过滤 → 几何分段 → Category D 对齐 → Category C 表格重构 → 学术增强 → Category B 最大悔标排序 → 双层序列化（`pdf-engine.ts:1-9` 注释与实现一致）。返回对外 `DocumentLayoutAST`。边界：**本文件不吞异常**（`pdf-engine.ts:8`）；调用方（document-parser 等）的回退行为属跨文件未深读；`academic-enricher.ts`（第 5 步）内部行为不在本批 scope。

## 2. 导出与关键符号

`export` 逐条核：1 个导出函数 + 私有 `processPage` + 私有接口 `PageProcessResult`。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `parsePdfDocument` | 导出函数 | `pdf-engine.ts:148` | `(buffer: Uint8Array \| ArrayBuffer, options?: PdfEngineOptions): Promise<DocumentLayoutAST>` | 管道入口 |
| `processPage`（内部） | 函数 | `pdf-engine.ts:34` | `(geometry: PdfPageGeometry): PageProcessResult` | 单页对齐+路由 |
| `PageProcessResult`（内部） | 接口 | `pdf-engine.ts:25` | page/orderedMainFlow/alignmentMs/maxRegretSortMs/tableParseMs | 单页中间统计 |

## 3. 内部逻辑与关键流程

`processPage`（`pdf-engine.ts:34-140`）按序：
1. `filterGhostGlyphs(geometry.glyphs,{pageWidth,pageHeight})`（`pdf-engine.ts:40-43`），得 `filteredCount`；
2. `segmentPageIntoBoxes({glyphs, vectorLines, pageWidth, pageHeight, pageNumber})`（`pdf-engine.ts:46-52`）；
3. `alignGlyphsToBoxes(cleanGlyphs, boxes.map(id+bbox))`（`pdf-engine.ts:56-59`，计时 `alignmentMs`）；
4. 逐 group 组节点（`pdf-engine.ts:67-113`）：box 缺失 `continue`（`pdf-engine.ts:69`）；文本归一 `replace(/\s+/g,' ').trim()`（`pdf-engine.ts:70`）；`pointBbox = group.bbox ?? box.bbox`（`pdf-engine.ts:71`）；`kindHint==='table'` 走 `decomposeTable({region:box.bbox, glyphs:group.glyphs, vectorLines, pageWidth, pageHeight})`（`pdf-engine.ts:75-81`），节点 `text=structure.markdown`、`confidence:0.85`（`pdf-engine.ts:87,90`）；**非表组 text 为空直接 `continue` 不进 nodes**（`pdf-engine.ts:99`）；其余节点 `confidence:0.9`（`pdf-engine.ts:108`）；两类节点 `readingStreamId/readingOrderIndex` 初值 0（`pdf-engine.ts:91-92,109-110`）；
5. `enrichAcademicNodes(nodes,{pageWidth,pageHeight,pageNumber})`（`pdf-engine.ts:116`，页眉页脚/脚注/公式/标题级别，实现域外）；
6. `mainFlow = nodes.filter(readingStreamId >= 0)`（`pdf-engine.ts:119`）→ `solveMaxRegretReadingOrder(mainFlow)`（`pdf-engine.ts:121`，原地写 `readingOrderIndex`）；
7. `detectColumnLayout(mainFlow)` + 逐节点 `node.readingStreamId = columnIndexOf(node, columns)`（`pdf-engine.ts:125-128`，**注意：此处把 readingStreamId 覆写为栏序号**）；
8. 组页对象：`blocks: nodes.map(toDocumentLayoutBlock)`（**含全部节点**，含页眉页脚），`trappedTokensFiltered`（`pdf-engine.ts:130-137`）。

`parsePdfDocument`（`pdf-engine.ts:148-196`）：`fileName` 缺省 `'document.pdf'`（`pdf-engine.ts:152`）→ `extractPdfGeometry(buffer,{maxPages: options.maxPages})`（`pdf-engine.ts:155`，**只传 maxPages；enableOcrBridge/ocrPort 无消费者**）→ 逐页 `processPage` 并累加指标（`pdf-engine.ts:164-172`）→ `orderedBlocks.forEach((node,index)=>node.readingOrderIndex=index)` **全局覆盖阅读序**（`pdf-engine.ts:175-177`）→ 组 AST（`pageCount` 取 `extraction.pageCount`，`pdf-engine.ts:181`；`outline:[]`、`markdown:''` 占位）→ `finalizeAstText(ast)` 收尾（`pdf-engine.ts:195`）。

## 4. 调用者与调用链

- 入向（生产 4 处，grep 全树）：`apps/electron/src/main/lib/document-parser.ts:154-155`、`document-parse-tools.ts:541,545`、`review/document-service.ts:350-352`、`study/study-document-indexer.ts:288,295`（均动态 import `@profer/core/pdf-engine`）。注释点名 document-parser 为异常回退承担者（`pdf-engine.ts:8`），其回退实现未深读=边界。
- 出向：同目录 `extractPdfGeometry`（`pdf-engine.ts:15`）、`filterGhostGlyphs`（`:16`）、`segmentPageIntoBoxes`（`:17`）、`alignGlyphsToBoxes`（`:18`）、`decomposeTable`（`:19`）、`enrichAcademicNodes`（`:20`）、`columnIndexOf/detectColumnLayout/solveMaxRegretReadingOrder`（`:21`）、`finalizeAstText`（`:22`）、`toDocumentLayoutBlock`（`:14`）+ `@profer/shared` `normalizePointBBox`（`:12`）。

## 5. 数据 I/O、读写与副作用

- 无磁盘/网络（纯内存 + 调用同批纯函数；提取器内部动态 import pdfjs 属其自身手册）。
- **原地写**：节点对象的 `readingStreamId`（`pdf-engine.ts:127`，主流节点=栏序号；非主流节点保留 enrich 所赋负值）与 `readingOrderIndex`（`pdf-engine.ts:175-177` 覆盖主流节点为全局序；**非主流节点保留初值 0**，因 `orderedBlocks` 只含主流）。
- `ast.markdown`/`ast.outline` 由 `finalizeAstText` 原地填充（默认 **含锚点**，见 document-serializer 手册）。

## 6. 分支、失败、取消与恢复

- 分支：box 缺失跳过（`pdf-engine.ts:69`）；table/非表（`pdf-engine.ts:73`）；空文本跳过（`pdf-engine.ts:99`）。
- 失败：**全文件无 try/catch**（已证实逐行）；任何阶段异常直接上抛，注释约定由调用方回退传统解析（`pdf-engine.ts:8`）。
- 取消/恢复：不适用，依据：单次同步计算管道无取消点。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/路径/角色检查；输入为调用方给定字节。

## 8. 修改影响面

- 管道顺序/阈值改动影响 4 个生产调用链的解析结果（document-parser / document-parse-tools / review document-service / study indexer）。
- `readingStreamId` 语义（栏序号）被 `document-serializer.getHumanLocation`（左/右/通栏判定）与页眉页脚排除逻辑消费；改动会连动序列化定位文案。
- 指标字段（metrics 五键）供调用方展示；`pageCount` 语义见 §10。

## 9. 测试证据

`NOT_RUN`：本轮未运行任何测试/typecheck/build。直接测试：无（检索范围=全树 `*.test.ts` 对 `parsePdfDocument` 在 pdf-engine 目录外无直接单测）。间接（域外、断言体未逐行核）：`pdf-engine/__tests__/pdf-engine.test.ts` 1 用例端到端"真实 PDF 字节输出结构完整 AST"；其余 `__tests__` 5 文件覆盖子算法（不在本批 scope）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 管道 8 步顺序、各阈值（0.85/0.9、空文本跳过、全局序覆盖） | 已证实 | `pdf-engine.ts:34-196` 逐行 |
| 无 try/catch、异常上抛由调用方回退 | 已证实（无 catch=本文件）/推断（回退行为） | `pdf-engine.ts:8` 注释+全文扫描；document-parser 未深读 |
| `readingStreamId` 被覆写为栏序号、非主流节点 `readingOrderIndex` 保留 0 | 已证实 | `pdf-engine.ts:119,125-128,175-177` |
| `enableOcrBridge` 无消费者、无 ocrPort 注入口 | 已证实 | `pdf-engine.ts:155`（唯一 options 消费点） |
| `pageCount` 取全文档页数，`maxPages` 截断时 `pages.length < pageCount` | 已证实 | `pdf-engine.ts:181` + `pdf-stream-extractor.ts:315`（跨文件核对） |
| 端到端对真实 PDF 的输出质量 | 未知 | NOT_RUN，无运行证据 |

## 11. 覆盖表

| 符号/域 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| parsePdfDocument | §2/§3 | 148-196 | covered |
| processPage 8 步 | §3 | 34-140 | covered |
| 调用链（4 生产点） | §4 | — | covered（下游回退=partial） |
| 副作用/失败/权限/影响面 | §5-§8 | — | covered |
| 测试 | §9 | — | covered（NOT_RUN+域外边界） |

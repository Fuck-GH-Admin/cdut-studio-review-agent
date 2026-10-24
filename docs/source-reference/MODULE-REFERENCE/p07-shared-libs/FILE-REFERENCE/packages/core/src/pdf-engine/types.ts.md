---
path: packages/core/src/pdf-engine/types.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: fd145cc909fb313707f75574a4b089914c618394
sha256: c12e5ff9512f43e1d313562276c54814f323b4c28d149f5f1c55959bcc997b4e
lines: 126
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-05-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---

# packages/core/src/pdf-engine/types.ts

## 1. 结论与边界

PDF 高精解析引擎的**内部数据类型层**：7 个接口 + 1 个纯转换函数 `toDocumentLayoutBlock`。纯类型/纯函数文件，无任何 I/O、无状态。坐标约定（`types.ts:7-10`）：`PointBBox` 为 72dpi 左上原点 y 向下；`NormalizedBBox` 为 0-1 归一化。边界：对外全要素 AST 契约在 `@profer/shared` 的 `types/pdf.ts`（`types.ts:4-5` 注释），本文件不定义对外契约。

## 2. 导出与关键符号

`export` 逐条核：8 个导出 = 7 接口 + 1 函数，0 常量。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `PdfGlyphItem` | 接口 | `types.ts:22` | char/fontName/fontSize/originX/originY/width/height/bbox/renderingMode/colorAlpha/isOutOfCanvas | 字符图元；`renderingMode` 注释 0-3 语义（`types.ts:31`）、`colorAlpha` 0-1（`types.ts:32`） |
| `VectorLine` | 接口 | `types.ts:37` | x0/y0/x1/y1/isHorizontal/thickness | 页面矢量线段（三线表边框探测用，`types.ts:36`） |
| `PdfPageGeometry` | 接口 | `types.ts:47` | pageNumber/width/height/glyphs/vectorLines | 单页几何图元集合 |
| `PdfGeometryExtractResult` | 接口 | `types.ts:56` | pages/pageCount/extractMs | 提取结果 |
| `LayoutCandidateBox` | 接口 | `types.ts:66` | id/bbox/kindHint/fontSize | 分段器产出的候选框（未绑字符） |
| `LayoutNode` | 接口 | `types.ts:78` | id/pageNumber/kind/text/bbox/pointBbox/confidence/readingStreamId/readingOrderIndex + 可选 fontSize/headingLevel/table/equation/footnoteRef/isOcrRecognized | Max-Regret 路由输入单元 |
| `PdfEngineOptions` | 接口 | `types.ts:100` | fileName?/maxPages?/enableOcrBridge? | 引擎配置；`enableOcrBridge` 注释称"需注入 ocrPort 才真正生效"（`types.ts:104`）——实际管道无消费者（见 §10） |
| `toDocumentLayoutBlock` | 函数 | `types.ts:109` | `(node: LayoutNode): DocumentLayoutBlock` | 内部节点→对外契约块，纯函数 |

## 3. 内部逻辑与关键流程

唯一函数 `toDocumentLayoutBlock`（`types.ts:109-126`）：必拷 8 字段（id/pageNumber/kind/text/bbox/readingOrderIndex/readingStreamId/confidence，`types.ts:110-119`）；5 个可选字段（headingLevel/table/equation/footnoteRef/isOcrRecognized）**仅在 `!== undefined` 时拷贝**（`types.ts:120-124`）。无分支外逻辑、无变异入参。

## 4. 调用者与调用链

- 入向：`toDocumentLayoutBlock` 被 `pdf-engine.ts:135`（`page.blocks`）与 `pdf-engine.ts:183`（`readingOrderedBlocks`）调用（同批主手册）。类型被 pdf-engine 全目录 import（如 `pdf-stream-extractor.ts:16`、`native-segmenter.ts:12`、`max-regret-router.ts:12`、`table-decomposer.ts:15`、`ocr-bridge.ts:12`）。
- 出向：仅 `@profer/shared` 类型（`types.ts:12-19`）+ `DocumentLayoutBlock` 契约。
- 测试：全树 `*.test.ts` grep `toDocumentLayoutBlock` 0 命中（否定结论，检索范围=冻结树全部测试文件）。

## 5. 数据 I/O、读写与副作用

无磁盘/网络/全局状态；纯内存结构定义与转换。无副作用（已证实）。

## 6. 分支、失败、取消与恢复

无条件分支（除可选字段 defined 判断 `types.ts:120-124`）、无抛错、无取消路径。`renderingMode`/`colorAlpha` 由上游提取器填值（见 `pdf-stream-extractor.ts` 手册）。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role/路径检查，纯类型与纯函数。

## 8. 修改影响面

改字段形状影响：引擎全部 11 个同目录模块、`pdf-engine.ts` 管道输出、下游 `@profer/shared` `DocumentLayoutBlock` 消费方（document-parser 等 4 个 parsePdfDocument 调用链）。`PdfEngineOptions` 增删字段影响 `parsePdfDocument` 全部调用点。

## 9. 测试证据

`NOT_RUN`：本轮未运行任何测试/typecheck/build。直接测试：无（检索范围如 §4）。间接：`pdf-engine/__tests__/pdf-engine.test.ts` 端到端产出含本文件结构（域外测试，断言体未逐行核，不在本批 scope）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 导出及字段形状、可选字段 defined 拷贝 | 已证实 | `types.ts:22-126` 逐行读 |
| `enableOcrBridge` 声明于选项但管道无消费者 | 已证实 | `types.ts:104-105` 声明；`pdf-engine.ts:155` 仅传 maxPages（跨文件核对） |
| 纯函数无副作用 | 已证实 | `types.ts:109-126` 无 I/O/变异 |
| `@profer/shared` 契约字段语义 | 边界 | shared types/pdf.ts 未深读 |

## 11. 覆盖表

| 符号/域 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 7 接口 | §2 | 22-106 | covered |
| toDocumentLayoutBlock | §2/§3 | 109-126 | covered |
| 调用链/影响面/测试缺口 | §4/§8/§9 | — | covered（缺口如实） |

---
path: packages/core/src/office-engine/types.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: cf777b1c0ec43d248b42997ab313e8b02f0a1599
sha256: 9ed497496b47d80b68e4d9503ec18e0ef396aaf55809e1e4220f32029bbce8ac
lines: 107
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/core/src/office-engine/types.ts

## 1. 结论与边界

Office 引擎**类型定义**（`packages/core/src/office-engine/types.ts:1-8`）：双平面确定性排版重排引擎契约——严格遵循 ECMA-376 与双平面平行拓扑：**平面 1**（几何 AST：真实页码/幻灯片序号/工作表序号 + 归一化 bbox `[x0,y0,x1,y1]`）；**平面 2**（高保真学术 Markdown：块前 `<span id="p{page}-b{idx}">` + `<!-- anchor: … -->` 双轨定位锚点）。

边界：107 行纯类型（零 import/零运行时）；单位契约（pt/EMU/归一化坐标）在此声明。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 形状 | 说明 |
| --- | --- | --- | --- | --- |
| `OfficeFormat` | type | 10 | `'docx'\|'xlsx'\|'pptx'` | |
| `OfficeBlockType` | type | 12-22 | 9 块类型（heading/paragraph/table/list/figure/formula/caption/header/footer） | |
| `OfficeLayoutBlock` | interface | 24-58 | `{id('p{page}-b{idx}'); pageNumber; type; text; markdown; bbox[0,1]; locLabel; readingOrder; sheetName?; cellRef?; headingLevel?(1-6); rowCount?; columnCount?; formulaDeps?}` | |
| `OfficePageLayout` | interface | 60-74 | `{pageNumber; widthPt; heightPt; title?; sheetName?; blocks[]; mermaidDiagrams?}` | 1pt=1/72inch |
| `OfficeDocumentLayoutAST` | interface | 76-88 | `{format; pageCount; pages[]; metadata{title?,author?,sheetNames?}}` | |
| `OfficeParseOptions` | interface | 90-101 | `{fileName?; maxPages?; maxRowsPerBlock?=40; includeAnchors?=true}` | |
| `OfficeParseResult` | interface | 103-107 | `{format; ast; markdown(带锚); cleanMarkdown(剥锚)}` | |

## 3. 内部逻辑与关键流程

本文件不适用——依据：纯类型声明（契约即注释，`:24,38,42` 等逐字段注释）。

## 4. 调用者与调用链

出向：无。入向（检索=符号名，全冻结树）：**全部为 office-engine 内部 type import**（docx-reflow/pptx-topology/xlsx-grid/office-serializer/ooxml-zip-reader/index）；外部零引用（electron main 只用函数不引这些类型）。**同名碰撞警示**：`apps/electron/src/renderer/components/file-browser/office-preview/silurus-bridge.ts:12` 本地 `OfficeFormat`（独立，OfficePreview 走 WASM 不引本引擎）。

## 5. 数据 I/O、读写与副作用

本文件不适用——依据：纯类型。

## 6. 分支、失败、取消与恢复

本文件不适用。

## 7. 权限与权威状态

本文件不适用（无权限代码）；双平面锚点契约（`:2-8`）是引擎与消费方的权威接口口径。

## 8. 修改影响面

字段改动联动三个 solver + serializer + main 5 个消费文件；`bbox` 归一化口径是平面 2 锚点的坐标基础。

## 9. 测试证据

无直接测试（经 `office-engine.test.ts` 3 test 间接覆盖形态）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 双平面契约+锚点格式 | 已证实 | `:2-8,24` |
| 7 类型全内部消费 | 已证实（检索式见 §4，全冻结树） | grep+子 agent |
| `OfficeFormat` 同名碰撞 | 已证实 | 子 agent 检索 |
| 真实文档形态覆盖 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 7 类型 | §2 | 10-107 | covered |

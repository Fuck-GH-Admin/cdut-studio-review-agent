---
path: packages/shared/src/types/pdf.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e083a32caf2cf4f9410659d99ec11b2c6ce6161d
sha256: ba9ac409848d4c66761c0b47b1a795c41dd0f068087521bdc2a109a3c8e72112
lines: 123
kind: source
package: p07-shared-libs
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# packages/shared/src/types/pdf.ts

## 1. 结论与边界

**全要素文档 AST 与 PDF 解析引擎输入输出契约**（`:1-10`）：对应设计文档 `.trae/documents/aaadddnext_gen_pdf_parser_plan.md`（顶层架构）与 `aaabbbnext_gen_pdf_parser_detailed_implementation.md`（工程规格）。定位："只描述数据形状，不引入任何解析逻辑"，供 `@profer/core` 引擎与主进程服务层（document-parser / review document-service）共享消费。

不做的事：不做解析/排版/Max-Regret 排序（引擎侧）；无常量（唯一函数是坐标换算）。

## 2. 导出与关键符号

9 导出（6 类型 + 1 函数 + 2 BBox 元组类型）：

| 符号 | 类型 | 行 | 形状 |
| --- | --- | --- | --- |
| `NormalizedBBox` | type（元组） | `:16` | `[x0,y0,x1,y1]` 归一化 0~1，左上原点（`:13-15`） |
| `PointBBox` | type（元组） | `:22` | 同朝向 PDF Points（72dpi）（`:19-21`） |
| `LayoutRegionKind` | type | `:25-35` | 10 值（title/section-heading/paragraph/table/figure/equation/header/footer/footnote/list-item，兼容 RT-DocLayout `:24`） |
| `LayoutTableCell` | interface | `:38-46` | `{rowIndex;columnIndex;rowSpan;colSpan;isHeader;text;bbox}` |
| `LayoutTableStructure` | interface | `:49-56` | `{rowCount;columnCount;headers[];cells[];markdown;caption?}` |
| `LayoutEquation` | interface | `:59-64` | `{equationId;latex;tag?(编号);bbox}` |
| `DocumentLayoutBlock` | interface | `:67-81` | AST 核心：`{id;pageNumber;kind;text;bbox;readingOrderIndex(Max-Regret 全局序);readingStreamId(分栏流);confidence;headingLevel?(1-6);table?;equation?;footnoteRef?;isOcrRecognized?}` |
| `DocumentLayoutPage` | interface | `:84-91` | `{pageNumber;width;height;columnCount(1-3);blocks[];trappedTokensFiltered(TrapDoc 幽灵字符计数)}` |
| `DocumentLayoutAST` | interface | `:94-108` | 根：`{fileName;pageCount;pages[];readingOrderedBlocks[];outline[];markdown;metrics{totalExtractionMs;alignmentMs;maxRegretSortMs;tableParseMs;trapDocFilteredCount}}` |
| `normalizePointBBox` | function（export） | `:113-123` | `(bbox:PointBBox,pageWidth,pageHeight) => NormalizedBBox`：除以尺寸并 `clamp01`；宽高 ≤0 时按 1 处理（`:114-115`） |

## 3. 内部逻辑与关键流程

`normalizePointBBox`（唯一运行时代码，纯函数）：`safeWidth/safeHeight` 防除零（`:114-115`）→ 逐分量 `/size` → `Math.min(1,Math.max(0,v))` 夹取（`:116`）。确定性、无副作用。

类型级流程语义：`DocumentLayoutBlock.readingOrderIndex`（Max-Regret 求解全局序 `:73`）与 `readingStreamId`（分栏逻辑流 `:74`）共同构成阅读顺序；`DocumentLayoutAST.metrics` 自带各阶段耗时（`:101-107`）。

## 4. 调用者与调用链

- `@profer/core` 解析引擎与主进程服务层（document-parser、review document-service，`:8-9` 注释）。
- 渲染层文档预览（AST→Markdown/block 渲染）。
- 出向：无 import。被 `packages/shared/src/types/index.ts:103` `export *` 转发。

## 5. 数据 I/O、读写与副作用

纯类型 + 1 纯函数；无 I/O、无副作用。

## 6. 分支、失败、取消与恢复

`normalizePointBBox` 的除零防护是唯一分支（`:114-115`）。失败语义在 AST：`trappedTokensFiltered`/`trapDocFilteredCount`（幽灵字符过滤计数 `:90`/`:106`）、`isOcrRecognized`（OCR 信道来源标记 `:80`）——解析降级以计数/标记承载，不抛错（类型层）。

## 7. 权限与权威状态

无权限语义。`confidence`（`:75`）与 `readingOrderIndex` 是引擎裁决结果的权威投影；`NormalizedBBox` 的 0~1 归一化是坐标权威约定。

## 8. 修改影响面

改字段影响引擎输出与服务层/渲染层三方契约；设计文档（`.trae/documents/…`，不在冻结树）是需求权威——改 AST 需对照规格；`normalizePointBBox` 是共用工具，改动影响所有坐标换算调用点。

## 9. 测试证据

无直接契约断言（`normalizePointBBox` 于 `*.test.ts` 为 0 命中，属实）；`DocumentLayoutAST` **被 2 个引擎测试消费**（`packages/core/src/office-engine/office-engine.test.ts`、`packages/core/src/pdf-engine/__tests__/pdf-engine.test.ts`；主根 grep -rl 复核=2）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 10 导出（7 类型 + 1 函数 + 2 元组）值如 §2 | 已证实 | 文件全读 |
| 除零防护 + clamp01 | 已证实 | `:113-123` |
| Max-Regret/TrapDoc 语义来自设计文档 | 已证实（注释） | `:5-6`、`:73`、`:90` |
| 引擎实际输出与契约一致 | 未知 | 引擎不在本批 |
| 设计文档细节 | 未知 | `.trae/documents/*` 不在冻结树 |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 10 导出全量 | §2 | covered |
| normalizePointBBox 行为 | §3 | covered |
| 流程语义/失败承载 | §3/§6 | covered |
| 消费者/影响面 | §4/§8 | covered |
| 测试/未知 | §9/§10 | covered |

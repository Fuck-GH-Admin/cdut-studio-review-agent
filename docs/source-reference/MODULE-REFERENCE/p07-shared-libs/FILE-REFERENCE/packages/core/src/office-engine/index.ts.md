---
path: packages/core/src/office-engine/index.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 422bc94c89774cc06f1de0212490a4da8d7a50fe
sha256: 6a2d87bc8c9c98ce45b2e5c19a3e02f4a90cc142f974cd6dfbeedcd37d9de4de
lines: 134
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/core/src/office-engine/index.ts

## 1. 结论与边界

`@profer/core/office-engine` **编排入口**（`packages/core/src/office-engine/index.ts:1-8`）：双平面流式重排与空间拓扑 Office 解析引擎，零外部重型依赖，支持 DOCX/PPTX/XLSX（含宏/模板变体）。平面 A（语义重排：GDI 度量分行/2D 仿射拍平/动画因果序/Mermaid/LaTeX/稀疏网格连接域切分）；平面 B（坐标规范化：1 pt = 12,700 EMUs 归一化 bbox + `p{page}-b{idx}` 锚点）。

边界：Node 专用（node:zlib，经 subpath 由 main 消费——根入口仅类型转发）；renderer 的 OfficePreview 走独立 silurus-bridge WASM **不引本引擎**。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `inferOfficeFormatFromExtension` | function | 42-70 | `(extOrPath?) => OfficeFormat\|undefined` | docx/pptx/xlsx 各 4-6 扩展名+裸名 |
| `parseOfficeBuffer` | function | 75-115 | `(buffer, formatOrHint?, options?) => OfficeParseResult` | 主入口（同步） |
| `parseOfficeDocument` | function | 121-127 | async 包装 `parseOfficeBuffer` | **零外部调用** |
| 6 模块 `export *` | — | 34-39 | types/ooxml/docx/pptx/xlsx/serializer | |

## 3. 内部逻辑与关键流程

`parseOfficeBuffer`（`:75-115`）：`OoxmlZipReader` 开包；fallbackFormat（显式三值>扩展名>options.fileName）；`detectOfficeFormatFromZip` 定型；三 solver 分发（docx/pptx/xlsx）；双序列化（`includeAnchors:true` 带锚 + `false` 净版）；`markdown` 按 `options.includeAnchors ?? true` 选带锚/净版，`cleanMarkdown` 恒净版（`:102-114`）。

## 4. 调用者与调用链

出向：6 个 office-engine 模块（`:10-32`）。入向（检索=符号名+subpath，全冻结树）：

- **main 5 文件**（产品链）：`document-parse-tools.ts:30-33,601-613,1132-1151`、`document-parser.ts:184-209`（动态 import）、`file-preview-service.ts:13,706,728`、`review/document-service.ts:367-375`（动态）、`study/study-document-indexer.ts:630-704`（动态）。
- `parseOfficeDocument`：**零外部调用**（仅 `:128` 定义/`:133` 自调——异步兼容包装无人用）。
- 测试：`office-engine.test.ts`（本批 3 test，`./index.ts` 入口）+ caller 端间接测试 5 文件（document-parse-tools 14/document-parser 13/file-preview-service 8/study-indexer 2/document-service 21）。
- preload/renderer/shared/cli 零引用（`packages/core/package.json:14` subpath export）。

## 5. 数据 I/O、读写与副作用

本文件无独立 I/O（编排转发）；OoxmlZipReader 读 Buffer（内存）。

## 6. 分支、失败、取消与恢复

失败由子模块抛出（solver/zip reader）；`detectedFormat` switch 三值全覆盖（`:92-101`）；无异步取消（async 包装无 AbortSignal）。

## 7. 权限与权威状态

本文件不适用（无权限代码）；双平面契约见 types.ts 手册 §7。

## 8. 修改影响面

- `includeAnchors`/双序列化口径影响 document-parse-tools/study-indexer 的 Markdown 产物。
- 三 solver 分发/格式推断是 main 文档解析链的总闸。
- 测试：本批 3 test + caller 端 58 test 间接。

## 9. 测试证据

直接测试 `packages/core/src/office-engine/office-engine.test.ts`（本批，409 行/3 test，断言见该篇）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 双平面编排+双序列化 | 已证实 | `:75-115` |
| 扩展名推断全覆盖（14 扩展+3 裸名） | 已证实 | `:42-70` |
| `parseOfficeDocument` 零外部调用 | 已证实（检索式见 §4，全冻结树） | grep+子 agent |
| main 5 文件产品链 | 已证实 | 子 agent 检索 |
| 真实 OOXML 文档解析 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 3 函数 + 6 转发 | §2 | 34-127 | covered |
| 编排主链 | §3 | 75-115 | covered（3 test 锚） |

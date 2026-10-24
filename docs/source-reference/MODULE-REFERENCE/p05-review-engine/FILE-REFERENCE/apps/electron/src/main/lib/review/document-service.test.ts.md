---
path: apps/electron/src/main/lib/review/document-service.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d0e36b7700e2ad928d8520f8c39de420b4caf9e2
sha256: b2e1c206d51799c3bfc144e288a41ca4d8f69dbd5909ecc5612e87a9f11eba0a
lines: 383
kind: test
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/document-service.test.ts

## 1. 测试目标

slugifyFileName / parseTextIntoBlocks / parseFileIntoSourceDocument（文件头 :1-14）：锚点稳定、markdown/CSV 行分类、SVG/PDF/PNG/JPG/EML/HTML/CSV 入口、F04 完整性、未知二进制不伪造。

## 2. 用例清单

21 用例 / 7 describe。真实文件（work/tmp 隔离 :25-32，注释「严禁落到系统 /tmp」）、手写最小 PDF（:157-181）、真实 PNG 字节（:183-187）；无 mock。

| describe | # | 要点（行） |
| --- | --- | --- |
| slugifyFileName | 3 | 中文保留/符号折叠/空→doc（35-53） |
| parseTextIntoBlocks | 3 | 两次 ID 全等 blk-报告-001..003（56-72）；markdown 三分类+原文保留（74-91）；CSV heading/table-cell+整行（93-107） |
| parseFileIntoSourceDocument | 2 | SVG imageAlt 含 `<text>` 两段+sizeBytes>0（110-131）；损坏 PDF failed+parseError 非空+0 块（133-143） |
| 文本类文件入口 | 3 | CSV parsed+table 坐标（155-169）；HTML 去 script/title、实体还原（171-183）；multipart EML 头+QP 正文、无 HTML 备用（185-216） |
| T02 | 3 | CSV 引号/换行/前导零真实单元格（219-228）；同名两原件 ID 不共享（230-245）；空 CSV partial 含「可用单元格」（247-252） |
| PDF 文本层 | 2 | 手写 PDF parsed+含 Hello（256-270）；空内容流 partial 含「扫描件」「OCR」+0 块（272-285） |
| 图片与未知二进制 | 5 | PNG 单 image 块+imageAssetPath+「视觉模型」（289-308）；JPG 同（310-319）；F04 损坏/伪装 PNG failed 含「图片文件损坏」（321-329）；F04 缺失文件 failed 含「图片原件不可读取」（331-335）；未知二进制 failed 0 块（337-345） |

## 3. 真实断言

要点如 §2 表（逐条读自源文件 :35-345）。代表性硬断言：`first[0].id==='blk-报告-001'`（:68）；table 坐标 `toEqual({sheet:'CSV',row:2,column:1})`（:164）；EML `Subject: 补充文件`（:232）；空流 PDF `parseError` 同时含 `扫描件` 与 `OCR`（:280-281）；PNG `imageAssetPath` 等于入参相对路径（:301）。

## 4. 未覆盖与脆弱点

- 未覆盖：DOCX/Excel/PPTX 分支（无用例）、`guessMimeType` 全表、PDF 高精引擎多页/表格。
- 脆弱点：`PDF_PARSE_TIMEOUT_MS=30s`（:153，首载 pdfjs）；F04 字节截断测试依赖 `inspectF04RasterOriginal` 行为。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 21 用例断言如 §2 | 已证实 | 本文件逐行 |
| 锚点稳定/不伪造/完整性拒绝被固定 | 已证实 | 用例族 |
| DOCX/Excel/PPTX 行为 | 未知（未测） | §4 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| slugify/parseTextIntoBlocks/CSV 单元格 | §2 | covered |
| SVG/PDF/PNG/JPG/HTML/EML/CSV 入口 | §2 | covered |
| F04 完整性三场景 | §2 | covered |
| DOCX/Excel/PPTX | §4 | unknown（未测） |

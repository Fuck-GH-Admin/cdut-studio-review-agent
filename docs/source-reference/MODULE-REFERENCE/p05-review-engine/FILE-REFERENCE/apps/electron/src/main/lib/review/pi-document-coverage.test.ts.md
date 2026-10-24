---
path: apps/electron/src/main/lib/review/pi-document-coverage.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6233167d5c1fee485de8d780201df25edae154fc
sha256: a30be7ea78560a8cc980b1cd85406491605cb2b78d3f7e9ee8540bfbd58784e6
lines: 183
kind: test
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/pi-document-coverage.test.ts

## 1. 测试目标

`finalizePiDocumentCoverage` 的材料覆盖账本口径（describe :27）：read/partially-read/unread 三档、解析失败与占位块、预览/人工回执/引用的权威分级。纯函数测试。

## 2. 用例清单

11 用例 / 1 describe。夹具 `document()`（:5-25，3 文本块、parsed、docx），`overrides` 换 parseStatus/blocks/mimeType/parseError/manualReadReceipt；无 mock/无磁盘。

| # | 用例 | 行 | 要点 |
| --- | --- | --- | --- |
| 1 | 部分块读取保留（无引用也记） | 28-41 | 1/3 → partially-read |
| 2 | 全块读+parsed → read | 43-52 | |
| 3 | partial 全读仍 partially-read | 54-63 | |
| 4 | failed 占位块不算读 | 65-82 | |
| 5 | failed 仅预览 → partially-read | 84-94 | |
| 6 | failed 旧 read 被纠正 unread | 96-105 | |
| 7 | 人工回执 → read | 107-119 | |
| 8 | 仅引用 partially-read；零记录 unread | 121-137 | |
| 9 | 无块+预览 → partially-read（reason=parseError） | 139-152 | |
| 10 | 扫描 PDF 全页预览 → read | 154-165 | |
| 11 | 图像块核对 read / 未核 unread | 167-182 | |

## 3. 真实断言

- 1：`toEqual({…status:'partially-read', reason:'本次审核通过材料工具读取了 1/3 个材料块'})`（:36-40）。
- 2：`toEqual({…status:'read'})`（:51）。
- 3：`toMatchObject` reason 含 `'解析状态为 partial'`（:62）。
- 4：`toEqual` unread，reason 精确 `'自动解析失败；读取空占位块不代表读取了原件，请重新解析或打开原件核验。解析原因：PDF 解析失败'`（:77-81）。
- 5：reason 含 `'未登记完整页面核验'`（:93）。
- 6：`toMatchObject` unread，reason 含 `'空占位块不代表读取了原件'`（:104）。
- 7：`toEqual` read，reason `'审核员已核对原件：已逐页核对扫描件'`（:118）。
- 8：cited → `toMatchObject partially-read`；无记录 → unread（:135-136）。
- 9：reason `'PDF 无文本层'`（:148-151）。
- 10：`toEqual` read（:164）。
- 11：`toEqual([{…status:'read'}]）`、`unread[0]?.status==='unread'`（:180-181）。

## 4. 未覆盖与脆弱点

- 未覆盖：`previous.status==='partially-read'` 沿用 reason、`fullyRepresentedImage` 的非 image 混合块、多文档混合、引用+读块组合文案。
- 脆弱点：多条精确 reason 文案断言（源文案改动即红）；夹具默认 `documentId/versionId` 固定（用例 11 复用 `doc-1-v1` 键名）。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 11 用例断言/行号如 §3 | 已证实 | 本文件逐行 |
| failed 占位块/人工回执/全预览口径被固定 | 已证实 | 用例 4/7/10 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 读块/全读/partial | §3 | 28-63 | covered |
| failed 两分支+纠正 | §3 | 65-105 | covered |
| 人工回执 | §3 | 107-119 | covered |
| 引用/零记录/无块预览 | §3 | 121-152 | covered |
| 全预览/图像块 | §3 | 154-182 | covered |
| partially-read 沿用 previous.reason | §4 | — | unknown（未测） |

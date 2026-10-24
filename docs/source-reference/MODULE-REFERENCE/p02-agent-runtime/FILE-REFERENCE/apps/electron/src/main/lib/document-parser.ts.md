---
path: apps/electron/src/main/lib/document-parser.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: fd18a368f90892a26dcaa6ae825c95a9863f3cd6
sha256: 03b3aa2a79c5be5158e16993aa3f13775c326744096515b9c82764c3134ff756
lines: 746
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/document-parser.ts

## 1. 结论与边界

文档解析服务（头注 :1-11）：各类办公文档提取纯文本。PDF 走 `@profer/core/pdf-engine` 高精解析（唯一路径，:83-86「引擎异常向上抛出…无文本层返回空串」）；DOC/WPS 走 word-extractor；OOXML/ODF 走 office-engine；RTF 内置 brace 感知解析器；文本直读。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `isSupportedDocumentExtension` | fn | 64-66 | 扩展名白名单 |
| `isDocumentAttachment` | fn | 73-75 | 非图片即可解析 |
| `extractTextFromFile` | fn | 88-140 | 按扩展名分发 |
| `DocxReviewImage/DocxReviewBlock/DocxReviewContent` | interface | 355-375 | DOCX 结构化审核块 |
| `XlsxReviewBlock/XlsxReviewContent` | interface | 377-388 | XLSX 定位单元格 |
| `extractXlsxReviewContent` | fn | 497-… | XLSX→定位块（限量 8 表×100 行×40 列，:390-392） |
| `extractDocxReviewContent` | fn | ~560-640 | DOCX→heading/paragraph/table-cell/image 块 |
| `extractTextFromAttachment` | fn | 734-746 | 附件相对路径→全文（IPC 层） |

内部：五组扩展名集合（:22-56）、`extractPdf`（:153-163）、`extractLegacyWord`（:168-176）、`extractOffice`（:182-216，非 ZIP 回退 legacy、ODF 读 content.xml）、`extractWpsOffice`（:221-230，失败给「另存为」指引）、`extractRichText`/`parseRtf`（:235-345，`RTF_SKIP_DESTINATIONS` 跳过元数据组+`skipDepth` 单值防泄漏，注释 :265-270）、xlsx 系列工具（:394-495，DOM 遍历/rel 解析/列名换算）、`extractSpreadsheetReviewContent`（xls 走 SheetJS）。

## 3. 内部逻辑与关键流程

1. **`extractTextFromFile`**（:88-140）：pdf→pdf-engine；legacy word→word-extractor；xls→`extractSpreadsheetReviewContent` 定位块拼接；office 宏/模板变体→office-engine；rtf→内置解析；文本→UTF-8 直读；**未知格式按文本尝试**（:137-139，warn 不抛）。
2. **`parseRtf`**（:262-345）：逐字符+depth；`\*`/已知 destination 记 skipDepth（单值而非栈，注释 :265-270 防「多次标记单次解除」泄漏正文）；`\uN` 按 uc 跳回退字符；\par/\line→\n、\tab/\cell→\t；收尾压缩空白。
3. **DOCX 结构化**（:560-640）：cheerio 遍历 heading/paragraph/list/table（表格行列坐标）、图片抽离；`formattedDocxText` 加粗→`**`。
4. **XLSX 结构化**（:497-…）：AdmZip+@xmldom 读 workbook/rels/sharedStrings；单元格→`{sheet,row,column,columnName,text}`（前导零字符串保留，测试 :155-162）。

## 4. 调用者与调用链

入向：`document-service.ts`（审核材料）、`study-document-indexer.ts`、`knowledge-item-service.ts`、`document-parse-tools.ts`（动态）等（全树 grep）。出向：`@profer/core/{pdf,office}-engine`、`word-extractor`、`cheerio`、`adm-zip`、`@xmldom/xmldom`、`xlsx`、`./config-paths`。

## 5. 数据 I/O、读写与副作用

只读文件；console 日志；无网络/写盘。

## 6. 分支、失败、取消与恢复

不支持/解析失败→throw（调用方标记失败）；RTF 空→`RTF 文档解析后内容为空…`；WPS 失败→另存指引；未知格式→文本兜底。

## 7. 权限与权威状态

- 诚实解析权威：引擎异常上抛不伪装（:83-86）；扫描件空串如实；RTF 空内容拒。
- 结构化权威：审核块带 sheet/row/column 定位（可溯源）。
- 无 sender/role 检查（路径由调用方授权）。

## 8. 修改影响面

审核材料文本提取、知识库索引、内核预处理上游。同测：`document-parser.test.ts`（13 用例）。

## 9. 测试证据

直接测试 `document-parser.test.ts`（13 用例 / 2 describe；JSZip 现造最小合法 OOXML；真 SheetJS 造 .xls；NOT_RUN）要点：
- 扩展名（2）：WPS/Office 导出全支持（:87-105）、大小写不敏感（:107-111）。
- 真实提取（11）：DOCX 审核块（heading/加粗 `**`/表格坐标，:115-128）；内置 Title 样式→heading 无警告（:130-138）；XLSX 坐标+前导零 `00123`（:140-148）；旧 XLS SheetJS 坐标（:150-158）；.docm 提取（:163-168）；.xlsm 内容嗅探路径（:173-178）；.ppsx 扩展名不卡白名单（:182-187）；RTF 提取（正文保留/`Riched20`/`generator` 不泄漏，:190-204）；RTF 多忽略分组（listtable/info 嵌套 `\*`，正文全留、`Acme`/`Bob`/`listtemplateid` 不泄漏，:206-220）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出/内部符号行号如 §2 | 已证实 | 逐条 |
| OOXML 嗅探/RTF 不泄漏/坐标保留 | 已证实 | 测试族逐条 |
| pdf-engine 内部行为 | 未知 | 属 @profer/core（他批） |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `extractTextFromFile` 分发 | §3.1 | 88-140 | covered |
| `parseRtf` skip 语义 | §3.2/§9 | 262-345 | covered |
| DOCX/XLSX 结构化 | §3.3-3.4/§9 | 355-640 | covered |
| `extractPdf`/legacy word | §2 | 153-176 | covered（间接） |

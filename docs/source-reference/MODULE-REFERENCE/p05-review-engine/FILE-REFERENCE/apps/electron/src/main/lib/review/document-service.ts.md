---
path: apps/electron/src/main/lib/review/document-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: aac01c327df1618dddac82173cc7713e838c7bf4
sha256: bbe179e985754ecd145e2319d37c428455ec3c61cd3903afe72ddd24e16bedb1
lines: 723
kind: source
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/document-service.ts

## 1. 结论与边界

文档解析与切块（纯函数，头注 :1-19）：原始文件文本 → 带稳定 ID 的 `ReviewDocumentBlock`；块 ID = `blk-`+slug+三位序号（同输入两次切块全等，是三栏联动唯一锚点）。格式策略：文本按行、CSV 表头+单元格、SVG `<text>`→imageAlt、PDF 高精引擎（真实页码/bbox/阅读顺序/表格）回退文本、DOCX 结构+嵌入图片落盘、Excel 单元格、PPTX 图片字节（T02）、图片单块+imageAssetPath+partial、不支持 → failed 不伪造。

边界：不读案卷状态；调用方 `review-ipc`/`case-import`/`review-v3-t02-*`/`material-service`。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `slugifyFileName` | fn | 48-58 | 中文保留、符号转 '-'、空→`doc` |
| `parseTextIntoBlocks` | fn | 79-117 | 按行切块（csv 首行 heading） |
| `parseCsvIntoCellBlocks` | fn | 118-138 | T02 单元格块（sheet/row/column） |
| `extractReviewableTextFile` | fn | 301-309 | html/eml 归一化 |
| `parseFileIntoSourceDocument` | fn | 466-723 | 文件入口（各格式分支） |

内部：`blockIdAt`（:53-55）、`classifyLine`（:60-64）、`extractSvgText`（:138-146）、`guessMimeType`（:149-193）、`htmlToReviewText`（:196-207）、`splitMimeEntity/mimeParameter/decodeQuotedPrintable/decodeMimeBytes/decodeMimeText/mimeTextParts/decodeMimeHeader/emlToReviewText`（:209-286）、`mapLayoutKindToReviewKind/mapLayoutBlockToReviewBlock`（:296-329）、`parsePdfLayoutBlocks`（:333-346）、`parseOfficeLayoutBlocks`（:350-410）、`toSourceDocument`（:422-435）、`TEXT/DOCUMENT/IMAGE_EXTENSIONS`（:25-39）。

> **r1 校订说明**：§2 行号经 `grep -n` 逐符号实测校订（NB17-N-01）；符号定位以符号名为准。

## 3. 内部逻辑与关键流程（parseFileIntoSourceDocument，:437-723）

1. **ID 统一**（:422-435）：`doc-{slug}-{uuid}`，块 ID `blk-{uuid}-{序号}`——注释 :428-429「同毫秒同名文件必须不共享身份；parseTextIntoBlocks 的确定性 ID 留给独立调用方」。
2. **图片**（:488-500）：`inspectF04RasterOriginal` 完整性检查（损坏/伪装 → failed，:489-490）；成功 → 单 image 块+imageAssetPath+`partial`（parseError「图片原件已收录；内容由视觉模型识别…」）。
3. **DOCX**（:502-547）：结构解析+嵌入图片写 `assetDirectory`（`{slug}-embedded-{n}`，:510-520）；未落盘图片计入 warnings（`N 张嵌入图片未保存为视觉材料…`）；无文本无图 → `partial DOCX 未提取到可审核文本或图片`（:532-533）；异常 → 纯文本回退 `partial DOCX 结构解析失败，已回退纯文本…`（:541-545），再失败 → failed（:546）。
4. **Excel**（:549-565）：单元格块（sheet/row/column）；空 → partial；异常 → 纯文本回退 partial。
5. **PDF**（:568-573）：`parsePdfLayoutBlocks`（@profer/core/pdf-engine，:333-346）成功 → parsed（真实页码/bbox）；失败/空回退。
6. **Office/PPTX**（:575-617）：T02 先取 PPTX 图片字节（`extractT02PptxImages`，:581-590）；`parseOfficeLayoutBlocks` 成功 → 版面块+物理图片锚点（`blk-{slug}-slide-{p}-img-{o}-{sha8}`，注释 :596-598「几何 figure 不暴露 r:embed，按数量配对会连错证据——保留 unlinked 并加物理锚点」）；演示文稿或未解析图 → partial（`演示文稿页需逐页视觉核验…`/`N 个图像块无可访问的视觉原件`，:601-610）；纯图 deck 也入册（:612-619）。
7. **文本回退**（:621-647）：`extractTextFromFile` 异常 → failed（原因保留）；空文本 → `partial {EXT} 未提取到文本内容（可能是扫描件或纯图片文档，需 OCR/视觉核验）…`（:634-640）；有文本 → partial（PDF：`块上的第 1 页只是文本回退占位，不能用于原件精确定位`；Office：`页码、图像及版式需查看原件核对`，:643-647）。
8. **不支持二进制**（:650-652）：failed `该格式暂不支持自动切块，请查看原件`。
9. **文本类/SVG/CSV**（:654-722）：读失败 failed；SVG 单 image 块+imageAlt；CSV `parseCsvIntoCellBlocks`（空 → partial）；文本按行（空 → partial）。

## 4. 调用者与调用链

入向（生产）：`review-ipc.ts:48`、`case-import.ts:15`、`review-v3-t02-visual-ocr.ts:16`、`review-source-version-adapter-v3-b2.ts:12`、`review-v3-t02-staged-source-preview.ts:15`（parseFileIntoSourceDocument）；`material-service.ts:20`（extractReviewableTextFile）。测试：`document-service.test.ts:24`。出向：`../document-parser`（:22）、`./source-index parseCsvRows`（:23）、`./review-v3-t02-pptx-visual-assets`（:24）、`./review-v3-f04-raster-integrity`（:25）、`@profer/core/pdf-engine|office-engine`（动态 import :336/:354）、`cheerio`（:20）。

## 5. 数据 I/O、读写与副作用

读文件；写嵌入图片到 `assetDirectory`（DOCX :517-519）；`console.warn/error`（多处）；无网络。

## 6. 分支、失败、取消与恢复

失败一律「零可读块 + parseStatus + 中文 parseError」不伪造（`placeholderBlocks()` 显式为空数组，注释 :477-481「空占位块会被能力库误当真实块，产生『已读 1/1』假进度」）；partial/parsed/failed 三态如实；无取消（async 一次性）。

## 7. 权限与权威状态

- 真实性权威：F04 栅格完整性（损坏/伪装/缺失 → failed，:488-490）；文本回退页码是占位必须标注（:643-645）；PPTX 物理图片锚点防「数量配对连错证据」（:596-598）。
- 稳定 ID 权威：块 ID 是三栏联动锚点（头注 :3-4）；同名文件不共享身份（:428-429）。
- 无 sender/role 检查。

## 8. 修改影响面

所有材料导入/解析路径（5 个生产消费方）；块 ID/状态语义被 `document-capability-library`、UI 高亮、AI 锚点引用依赖。同测：`document-service.test.ts`（21 用例）。

## 9. 测试证据

直接测试 `document-service.test.ts`（21 用例 / 7 describe；真实文件（work/tmp 隔离）、手写最小 PDF、真实 PNG/JPG 字节；NOT_RUN）要点：
- slugify（3）：中文保留/符号折叠/空→`doc`（:35-53）。
- parseTextIntoBlocks（3）：两次切块 ID 全等 `blk-报告-001..003`（:56-72）；markdown 三分类+原文保留（:74-91）；CSV 行分类+整行文本（:93-107）。
- 文件入口（2）：SVG `<text>`→imageAlt 含两段、sizeBytes>0（:110-131）；损坏 PDF → failed、parseError 非空、0 块（:133-143）。
- 文本入口（3）：CSV parsed+table 坐标 `{sheet:'CSV',row:2,column:1}`（:155-169）；HTML 提取正文/实体、去 script/title（:171-183）；multipart EML 提取头+QP 正文、不含 HTML 备用（:185-216）。
- T02（3）：CSV 引号换行/转义/前导零在真实单元格（:219-228）；同名两原件 ID 不共享（:230-245）；空 CSV → partial 含 `可用单元格`（:247-252）。
- PDF 文本层（2）：手写 PDF parsed+含 `Hello`（:256-270）；空内容流 → partial 含 `扫描件`/`OCR`、0 块（:272-285）。
- 图片与二进制（6）：PNG 单 image 块+imageAssetPath+`视觉模型`（:289-308）；JPG 同（:310-319）；F04 损坏/伪装 PNG → failed 含 `图片文件损坏`（:321-329）；F04 缺失文件 → failed 含 `图片原件不可读取`（:331-335）；未知二进制 failed 0 块（:337-345）。
未覆盖：DOCX/Excel/PPTX 分支、`guessMimeType` 全表；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 导出/内部符号存在性与行为 | 已证实 | 行号 r1 grep 实测校订；以符号名为准 |
| 不伪造块/失败如实三态 | 已证实 | :477-481 + 测试族 |
| 同名不共享身份 | 已证实 | :428-429 + 测试 :230-245 |
| PDF 回退页码占位标注 | 已证实 | :643-645 |
| DOCX/Excel/PPTX 分支行为 | 推断（读码）/未知（未测） | :502-619 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| slugify/parseTextIntoBlocks/parseCsvIntoCellBlocks | §2/§9 | 42-136 | covered |
| 图片/F04 | §3.2/§9 | 488-500 | covered |
| PDF/文本回退/不支持 | §3.5/§3.7-3.9/§9 | 568-573/621-652 | covered |
| DOCX/Excel/PPTX | §3.3-3.6 | 502-619 | partial（未测） |
| `extractReviewableTextFile`/MIME 族 | §2/§3 | 149-294 | covered（HTML/EML 测） |

---
path: apps/electron/src/main/lib/cslab/cslab-ooxml.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7584ac570da8464de528ae1f5e88cd10217ea3ec
sha256: 5f5f382811e2d11f15acc0a0ccc1295b31c914830e6ae54fbd9cd9bb9bb120c1
lines: 1146
kind: source
package: p03-integrations
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-ooxml.ts

## 1. 结论与边界

CSLab Word OOXML **无损引擎**（文件头 `apps/electron/src/main/lib/cslab/cslab-ooxml.ts:1-9`）。三个核心契约：①`exportManuscriptToDocx`——从 TipTap docJson 直接生成完整 docx 骨架（不经 Markdown 中转）；②`syncCapsulesToDocx`——存量 docx 外科手术：只重写 customXml 部件、`word/document.xml` **解压字节保持不变**并报告新增/删除/缺失绑定；③`importDocx`——结构化解析 document.xml，保留胶囊在正文中的原始位置。

## 2. 导出与关键符号

`export` 逐条核对：**1 个常量 + 11 个接口 + 3 个 type + 8 个函数 = 23 个导出**。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CSLAB_CUSTOM_XML_NS` | 常量（导出） | 17 | `urn:cdut:science:capsules` |
| `OoxmlCapsuleValue`/`OoxmlInspectResult`/`OoxmlSyncResult`/`OoxmlExportInput`/`OoxmlTextMarks` | 接口（导出） | 24-57 | 胶囊值/检查结果/同步结果（含 `documentXmlUnchanged`+四类 ID 报告）/导入输入/marks |
| `OoxmlCommentValue`/`OoxmlTrackMark`/`OoxmlCommentMark` | 接口（导出） | 60-78 | 批注/修订/批注标记 |
| `OoxmlImportInline` | type（导出） | 80-92 | `{kind:'text'\|'capsule'…}` 行内联合 |
| `suggestionIdToWordId` | 函数（导出） | 94-102 | 建议 ID→Word 数字 ID |
| `OoxmlImportBlock`/`OoxmlImportResult` | 接口（导出） | 110-122 | 导入块（heading/paragraph+inlines）/结果（含 `unreferencedCapsuleIds`） |
| `CommentPartsInput` | 接口（导出） | 643-651 | 三件套校验输入 |
| `assertCommentsParts` | 函数（导出） | 654-666 | **导出前自检**：comments Part/Relationship/Content-Type 三件套缺任一即抛（绝不产出 Word「需要修复」包） |
| `inspectDocx` | 函数（导出） | 686-706 | 列 customXml 部件+胶囊 ID+`hasDataBinding` |
| `syncCapsulesToDocx` | 函数（导出） | 723-803 | 外科手术同步 |
| `exportManuscriptToDocx` | 函数（导出） | 809-831 | 全新 docx 生成（含修订/批注部件） |
| `importDocx` | 函数（导出） | 1031-1090 | 结构化导入 |
| `CsLabOoxmlTask`/`CsLabOoxmlTaskResult` | type（导出） | 1094-1104 | Worker 契约（inspect/sync/export/import） |
| `executeOoxmlTask` | 函数（导出） | 1106-1118 | 进程内分派 |
| `runOoxmlTask` | 函数（导出） | 1120-1146 | **优先独立 Worker**（`cslab-ooxml-worker.cjs` 缺失时进程内降级）；30s 看门狗（`timer.unref()` 不阻止退出） |

内部关键：`CUSTOM_XML_PATH`/`CUSTOM_XML_PART_RE`/`CAPSULE_ID_RE`（`:20-21`，ID 白名单防注入）/`STORE_ITEM_ID:22`；`escapeXml/buildCustomXml/parseCustomXml`（`:124-192`）；DOM helpers 族（`elementChildren/localNameOf/findFirst/findChildren/getAttribute/collectText`，`:206-260`）；导出渲染族（`renderTextRun/readMarkInfo/renderCapsuleSdt/renderInlineNodes/renderParagraph/renderList/renderTable/renderBlockNode`，`:264-560`）；`buildDocumentXml/buildContentTypesXml/buildDocumentRelsXml/buildCommentsXml`（`:562-641`）；导入族（`readRunMarks/extractCapsuleIdFromSdt/parseCommentsXml/parseParagraphInlines/parseParagraphBlock/collectBlocks/collectBoundCapsuleIds`，`:833-1029`）。

## 3. 内部逻辑与关键流程

### 3.1 同步（`syncCapsulesToDocx`，`:723-803`）

筛选含 `<cs:capsules` 的 customXml 部件；无→抛 `该 docx 不含 CSLab customXml 胶囊存储…`（`:735-736`）。取 document.xml **前后字节**（`:738-740`）；`collectBoundCapsuleIds`（dataBinding xpath `@id` 解析，`:709-720`）；新旧对比产出 `updated/added/removed/missingDataBindingIds`；重写全部目标部件（label/unit 保留旧值）；重新解压比对 document.xml **逐字节相等**得 `documentXmlUnchanged`（`:782-790`）。

### 3.2 导出（`exportManuscriptToDocx`，`:809-831`）

`buildDocumentXml`（正文渲染+收集批注）→`assertCommentsParts` 三件套原子校验（`:816`）→JSZip 组包（[Content_Types]/_rels/document/styles/可选 comments/customXml+itemProps）。

### 3.3 导入（`importDocx`，`:1031-1090`）

customXml→胶囊表（首见优先）；document.xml→`collectBlocks`（段落/标题（`Heading 1-6` pStyle）/表格按行压平制表符文本（Phase 1，`:1016-1021`））；`parseParagraphInlines`：commentRangeStart/End 批注区间、sdt 胶囊（dataBinding xpath 提取 id）、`ins/del` 修订（track marks）、run 文本（t/delText/tab/br/cr）、hyperlink/smartTag 递归。**未引用胶囊追加段落**「未绑定的数据胶囊：…」（`:1053-1061`）；title 取首段截 40（`导入文稿` 兜底）。

### 3.4 Worker 契约（`:1094-1146`）

`runOoxmlTask`：worker 存在→`new Worker`+30s 看门狗（超时 `OOXML Worker 执行超时（30s）`）+message/error 均 terminate；缺失→`executeOoxmlTask` 进程内降级。

## 4. 调用者与调用链

入向：`cslab-manuscript.ts`（`runOoxmlTask export`，另存 docx）、Word 同步/导入 IPC；`cslab-ooxml-worker.ts`（Worker 入口）。测试：`cslab-ooxml.test.ts`（200 行，本批）。出向：`jszip`、`@xmldom/xmldom`、`node:worker_threads/fs/path`。

## 5. 数据 I/O、读写与副作用

内存 zip 解压/生成（DEFLATE）；Worker 线程 spawn；无磁盘直写（buffer 进出）。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| 无 CSLab customXml | 抛 | 735-736 |
| 三件套缺失 | 抛（`comments.xml 缺失或根节点不正确` 等三句） | 654-666 |
| comments.xml 损坏 | 空表容错（不让整篇导入失败，`:918`） | 916-962 |
| 未引用胶囊 | 追加「未绑定」段落 | 1053-1061 |
| Worker 超时/错误 | reject+terminate | 1126-1143 |
| worker 产物缺失 | 进程内降级 | 1122 |

## 7. 权限与权威状态

- 无损契约权威：document.xml 逐字节不变（同步后复核 `:782-790`）。
- 胶囊 ID 白名单 `CAPSULE_ID_RE`（`:20-21`）；XML 全量转义（`escapeXml`）。
- 三件套校验保证不产出坏包（`:651-653` 注释）。

## 8. 修改影响面

改渲染/解析影响 Word 往返保真（修订/批注/胶囊）；改同步影响存量文档兼容；影响 `cslab-ooxml.test.ts` 与 manuscript 另存。

## 9. 测试证据

直接测试：`cslab-ooxml.test.ts`（200 行，详见其手册）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型/真实 Word。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 三契约（export/sync/import） | 已证实 | `:1-9` |
| document.xml 字节不变复核 | 已证实 | `:782-790` |
| 三件套原子校验 | 已证实 | `:654-666,816` |
| 未引用胶囊显式报告 | 已证实 | `:1053-1061` |
| Worker 优先/降级/30s 看门狗 | 已证实 | `:1120-1146` |
| 真实 Word 打开行为 | 未知 | 未运行 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 类型/常量族 | §2 | 17-122,643-651 | covered |
| 构造/解析/DOM | §2 | 124-260 | covered |
| 导出渲染 | §2,§3.2 | 264-641,809-831 | covered |
| 同步 | §3.1 | 686-803 | covered |
| 导入 | §3.3 | 833-1090 | covered |
| Worker 契约 | §3.4 | 1094-1146 | covered |
| 真实 Word | §9,§10 | — | unknown |

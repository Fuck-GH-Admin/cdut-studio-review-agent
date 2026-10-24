---
path: apps/electron/src/main/lib/study/study-document-indexer.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: cf580b2e0713a43f3dd0f026117d526977587a8a
sha256: a5f5c3a3503b72b488e5d77fda8f7d7928a357de11574d6a9cf44de6bca31e30
lines: 1136
kind: source
package: p03-integrations
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/study/study-document-indexer.ts

## 1. 结论与边界

速课堂**文档索引器**（`apps/electron/src/main/lib/study/study-document-indexer.ts`，1136 行，本批最大）：资料导入（ingest）、大纲/分块索引、启停管理、检索块供给、prompt 全文路径。是检索（hybrid/graphrag）与工具（study-tools）的数据底座。

## 2. 导出与关键符号

`export` 共 **14**：

| 组 | 符号 | 行 |
| --- | --- | --- |
| 扩展名 | `isStudyDocumentExtension` | `:63` |
| 启停管理 | `readDisabledDocumentIds`（`:526`）、`isStudyDocumentEnabled`（`:537`）、`setStudyDocumentActive`（`:549`）、`setStudyDocumentsActive`（`:558`） | |
| 导入 | `ingestStudyDocuments`（`:574-779`，async）、`StudyRawDocumentInput`（`:780`）、`ingestStudyRawDocuments`（`:793-829`） | |
| 查询 | `listStudyDocuments`（`:830`，→`StudyDocumentOutline[]`）、`getStudyDocumentOutline`（`:927`） | |
| 检索供给 | `MAX_STUDY_RETRIEVAL_TOP_K=200`（`:849`）、`getStudyIndexFingerprint`（`:860`）、`StudyRetrievalChunk`（`:882`）、`listStudyRetrievalChunks`（`:896`） | |

（`buildStudyOutlineForPrompt` 为内部函数，被 `study-document-indexer.test` 直接断言。）

| `removeStudyDocument` | 函数 | `:933-946` | 移除学习文档 |
| `readStudySection` | 函数 | `:947-1032` | 读学习章节 |
| `readStudentCognition` | 函数 | `:1033-1044` | 读学生认知 |
| `serializeCognitionMarkdown` | 函数 | `:1045-1066` | 认知→Markdown |
| `writeStudentCognition` | 函数 | `:1067-1125` | 写学生认知 |
| `describeCognitionForPrompt` | 函数 | `:1126-…` | 认知→提示词描述 |
## 3. 内部逻辑与关键流程

- **导入**（`:574-829`）：文件/原始文本→解析（`markdown-normalizer`/`ocr-engine`）→分块（`propositional-chunker` 系）→索引落库；`StudyRawDocumentInput` 支持直喂文本。
- **启停**（`:526-573`）：按 sessionId 维护 disabled 集合；`setStudyDocumentsActive` 批量。
- **检索供给**（`:849-926`）：`listStudyRetrievalChunks` 供检索器打分；`getStudyIndexFingerprint` 索引指纹（缓存失效判断）；`MAX_STUDY_RETRIEVAL_TOP_K=200` 上限。
- **prompt 全文路径**（内部 `buildStudyOutlineForPrompt`）：每份资料直出 `document.md` 绝对路径（**不做 find/ls 探测**——测试断言 `'no find/ls probe'`）。

## 4. 调用者与调用链

- 消费方：`hybrid-retriever`/`hierarchical-graphrag-retriever`、`study-tools`、导入 UI。
- 出向：`markdown-normalizer`、`ocr-engine`、chunker 系（本批同组）。

## 5. 数据 I/O、读写与副作用

**文件读**（导入）+ **索引写**（会话级）；无网络。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 不支持扩展名 | `:63` | 过滤 |
| 图片文档 | — | `ocr-engine`（失败 null 跳过） |
| 空会话 outline | 测试 `:66-68` | `''` |

## 7. 权限与权威状态

无身份语义；索引指纹（`:860`）是缓存权威键。

## 8. 修改影响面

- 分块/归一/OCR 链耦合（本批同组文件）。
- `MAX_STUDY_RETRIEVAL_TOP_K`/指纹口径影响检索缓存。

## 9. 测试证据

`study-document-indexer.test.ts`（69 行，2 用例）覆盖 `buildStudyOutlineForPrompt` 全文路径。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 21 个导出、导入/索引/检索供给 | 已证实 | `grep -n "^export"` 全表 |
| 全文路径不探测（no find/ls probe） | 已证实（测试断言） | 测试 `:62` |
| `MAX_STUDY_RETRIEVAL_TOP_K=200` | 已证实 | `:849` |
| 导入各分支细节 | 推断 | 大函数结构核对 |
| 索引实际行为 | 未知 | 未运行 |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 扩展名/启停 | `:63-573` | covered |
| 导入 | `:574-829` | covered |
| 查询/检索供给 | `:830-927` | covered |
| prompt 全文路径 | 内部（测试覆盖） | covered |

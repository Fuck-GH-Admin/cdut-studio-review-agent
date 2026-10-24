---
path: apps/electron/src/main/lib/rag/workspace-rag-service.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9942fd3ebaf95d1091dcfcfaf5fd6d2363c1301e
sha256: 4e2bba520eb53ebe23f3d52721959b95a1450eaa6f7d1a3e5eea4e241b0c21f0
lines: 175
kind: test
package: p03-integrations
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# apps/electron/src/main/lib/rag/workspace-rag-service.test.ts

## 1. 测试目标

工作区静默 RAG 供给服务（`apps/electron/src/main/lib/rag/workspace-rag-service.test.ts:1-6`）：从 `.context/artifacts/*.index.json` 构建内存索引、BM25 检索精准度、`<document_evidence>` 真实锚点。被测 4 导出。夹具：tmpdir+`writeIndex` 落盘工厂（`:19-24`）+ `rosterIndex`（花名册 xlsx 第 3 页，`:26-64`）+ `dormIndex`（任职证明 docx 两页，`:66-93`）——**真实 MaterializedDocumentIndex 形态**。beforeEach/afterEach 清缓存（`:115-123`）。

## 2. 用例清单

共 **5 个 `test(`**（1 个 `describe`）：

| # | 行 | 用例 | 断言要点 | 依赖顺序 |
| --- | --- | --- | --- | --- |
| 1 | 125-128 | 无产物→不可用+不注入 | hasWorkspaceDocuments false、block '' | 独立 |
| 2 | 130-146 | 花名册→命中带真实锚点 | hits>0、fileId 'f3'、anchorId **'f3:p3-b1'**、locLabel 含 '工管2班'、sheetName；block 含 `<document_evidence>`/马晨超/**'#f3:p3-b1'**/闭合标签 | 独立 |
| 3 | 148-151 | 无关查询→不注入 | block '' | 独立 |
| 4 | 153-165 | 索引更新→指纹自动失效 | 二次写入后 '赵一鸣' 命中（缓存重建） | 独立 |
| 5 | 167-174 | 跨文档多维筛选→联合证据 | block 含 'Cross-document entity linkage'、两文件名 | 独立 |

## 3. 真实断言

逐条见 §2（关键锚）：`:126-127`；`:134-145` 9 断言（锚点 `#f3:p3-b1` 核心锚）；`:150`；`:157,164`；`:170-173` 4 断言（跨文档 linkage）。

## 4. 未覆盖与脆弱点

- 5200 预算截断/1200 摘要开窗无用例；anchoredText 路径（锚点行内化）无夹具（两夹具 anchoredText 均空走 cleanText）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 test、真实索引形态夹具 | 已证实 | `:26-93` |
| 真实锚点注入 | 已证实 | `:142` |
| 指纹失效重建 | 已证实 | `:153-165` |
| 跨文档联合证据 | 已证实 | `:170-173` |
| 测试通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 用例 | 状态 |
| --- | --- | --- | --- |
| hasWorkspaceDocuments/空守卫 | §2 | 1 | covered |
| searchWorkspaceRag+锚点 | §2 | 2 | covered |
| 无命中空串 | §2 | 3 | covered |
| 指纹缓存 | §2 | 4 | covered |
| 跨文档 Join | §2 | 5 | covered |
| 预算截断/锚点行内化 | §4 | — | unknown |

---
path: apps/electron/src/main/lib/rag/workspace-rag-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 419dda56af5b945c37ade257c31560ebf83acf56
sha256: 692e13537c246b7095e5ab4dcb04786937f104923d16ff4ebe3e2a9205571aa5
lines: 456
kind: source
package: p03-integrations
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# apps/electron/src/main/lib/rag/workspace-rag-service.ts

## 1. 结论与边界

**工作区静默 RAG 供给服务**（`apps/electron/src/main/lib/rag/workspace-rag-service.ts:1-14`）：把内核前置解析双态落盘的文档产物（`.context/artifacts/*.index.json`）切为带真实物理锚点（`f3:p3-b1`）的检索切片，纯内存 BM25 倒排；提问时前置检索 Top-K 组装极紧凑 `<document_evidence>` 块——**首轮即精准作答+可点击定位胶囊，消除工具调用爆炸**。**严格红线**（`:8-13`）：纯本地零 SQLite 零重库（全内存 Map）；零额外磁盘写（复用 .index.json）；复用 document-parse-tools 锚点**绝不重复解析原始文档**。

边界：BM25 参数 k1=1.5/b=0.75、Top-K=5、单切片 1200 字符/总预算 5200（`:26-35`）；无文档/无命中返回空串**绝不注入**（`:419`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `WorkspaceRagChunk` | interface | 73-91 | 切片（anchorId/locLabel/termFreq/length 等） |
| `WorkspaceRagHit` | interface | 94-98 | `{chunk; score; excerpt}` |
| `hasWorkspaceDocuments` | function | 223-226 | 指纹非 'empty' 判定 |
| `invalidateWorkspaceRag` | function | 229-232 | 缓存失效（指定/全部） |
| `searchWorkspaceRag` | function | 341-360 | BM25 Top-K 检索 |
| `formatDocumentEvidence` | function | 366-395 | `<document_evidence>` 组装（含跨文档 linkage 注释） |
| `buildDocumentEvidenceForMessage` | function | 405-456 | **一站式入口**（BM25+跨文档 Join） |

内部：`STOP_WORDS`（`:38-42` 中英停用词）、`tokenize`（`:47-63`：英文/希腊/中文单字+bigram；剥锚点标记）、`WorkspaceRagIndex`（`:100-107` 含 entityIndex）、`cache`（`:110` 按 cwd 指纹）、`bareBlockId`（`:113-117`）、`readArtifactIndices`（`:120-136`，损坏索引忽略+`upgradeStaleOfficeIndexIfNeeded` 静默升级）、`computeFingerprint`（`:139-157`，size+mtime 轻量指纹）、`buildInlineAnchoredContent`（`:162-183`，span 剥离+锚点行内化 `[#fN:pX-bY (cell)]`）、`buildChunksFromIndex`（`:186-219`）、`getIndex`（`:222-246`）、`buildExcerpt`（`:235-314`：短直通/共享键行聚合防截断漏尾部实体/命中词开窗）、`scoreQuery`（`:317-338`，标准 BM25）。

## 3. 内部逻辑与关键流程

`buildDocumentEvidenceForMessage`（`:405-456`）：文档/查询守卫→BM25 Top-K→**跨文档关系 Join**（findRelationalBridges，桥接切片 score=0 附加注入、excerpt 聚合共享键）→formatDocumentEvidence（预算 5200 截断、跨文档 linkage 注释 `:384-387`、教学注释「Trust this content 100%」`[:389]`）。

## 4. 调用者与调用链

出向：`node:fs/path`、`../document-parse-tools`（upgradeStaleOfficeIndexIfNeeded/2 类型）、`./entity-graph`（3 符号）（`:15-22`）。入向（检索=符号名+模块名，全冻结树）：`agent-orchestrator.ts:173,1541`（buildDocumentEvidenceForMessage，**唯一生产调用**）→ agent-service ← main/ipc.ts:323、main/index.ts:203。`searchWorkspaceRag`/`invalidateWorkspaceRag`/`hasWorkspaceDocuments`/`formatDocumentEvidence`/2 类型**零生产调用**（仅测试/内部）。测试：`workspace-rag-service.test.ts`（本批 5 test）。

## 5. 数据 I/O、读写与副作用

只读 .index.json（readdir/stat/readFileSync）；内存缓存 Map；**零磁盘写**（红线）。

## 6. 分支、失败、取消与恢复

损坏索引静默忽略；旧 Office 索引静默升级；无命中→空串；无异步/取消。

## 7. 权限与权威状态

本文件不适用（无权限代码）；红线即口径（`:8-13`）；`<document_evidence>` 教学注释（Trust 100%）是注入内容权威声明（`:389`）。

## 8. 修改影响面

- BM25/预算/锚点行内化改动影响 Agent 首轮证据质量。
- 跨文档 Join 集成（entity-graph）是实体孤岛解法。
- 测试：workspace-rag-service.test（5 test）。

## 9. 测试证据

`rag/workspace-rag-service.test.ts`（本批 175 行/5 test，断言见该篇）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 三红线（零库/零写/不重复解析） | 已证实 | `:8-13` |
| 跨文档 Join+桥接 score=0 注入 | 已证实 | `:427-450` |
| 空串不注入 | 已证实 | `:414-419` |
| 共享键行聚合防截断 | 已证实 | `:247-271` |
| 4 导出零生产调用（search/invalidate 等） | 已证实（检索式见 §4，全冻结树） | caller 图 |
| 真实工作区检索质量 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 7 导出 | §2 | 73-456 | covered |
| BM25/摘要/组装 | §3 | 235-456 | covered |
| 跨文档 Join | §3 | 405-456 | covered |

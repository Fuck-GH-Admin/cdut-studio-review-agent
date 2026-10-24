---
path: apps/electron/src/main/lib/cslab/cslab-literature-index.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f9dd6df22cc12573e5ee98a6488cf3e24a670da6
sha256: 0a001599b773b2b62172f52a26af9c438e9502f131e1eab9876b729272f0bd2e
lines: 407
kind: source
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-literature-index.ts

## 1. 结论与边界

实验室**跨文献分层索引**构建器（运行时代码）：PDF 文本提取（pdfjs 几何图元）→ 页内行重建 → 切块 → 相邻/共现边 → Leiden 分层社区 → 落盘 `db/graphrag-index.json`（文件头 `apps/electron/src/main/lib/cslab/cslab-literature-index.ts:1-9`）。三条红线：①文本只能来自 PDF 真实字符流，提取失败如实记录、不生成摘要替代原文；②索引缓存按文献 `updatedAt` 失效；③社群标题只由成员块标题派生。

边界：Leiden 社群构建委托 `apps/electron/src/main/lib/study/hierarchical-graphrag.ts` 的 `buildHierarchicalCommunities`；PDF 几何提取委托 `@profer/core/pdf-engine`（动态 import）；文献实体/缓冲委托 `cslab-literature.ts`；不注册 IPC、无网络调用（纯本地）。

## 2. 导出与关键符号

导出 6 项 = 4 函数 + 2 接口：

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `LiteratureChunk` | 导出接口 | 24 | `{id, literatureUri, title, page, text}` | 切块 |
| `LiteratureIndexFile` | 导出接口 | 32 | `{version:1, builtAt, fingerprint, literatureCount, chunks, communities, chunkCommunity}` | 索引文件（`chunkCommunity`: chunkId→L0 社区） |
| `tokenizeLiteratureText` | 导出函数 | 195 | `(text): string[]` | 英文词+汉字单/双字元，过滤停用词 |
| `readLiteratureIndex` | 导出异步函数 | 267 | `(labIdInput): Promise<LiteratureIndexFile \| null>` | 读索引（损坏/版本不符→null） |
| `getLiteratureIndexStatus` | 导出异步函数 | 280 | `(labIdInput): Promise<CsLabLiteratureIndexStatus>` | 状态（fingerprint 现算） |
| `buildLabLiteratureIndex` | 导出异步函数 | 309 | `(labIdInput, options?: BuildIndexOptions): Promise<{index, built, message}>` | 构建/复用索引 |

另导出 `BuildIndexOptions`（`:304`，`{force?}`）。内部：`textCachePath`（`:55`，`db/lit-text/<entityUuid>.json`）、`indexFilePath`（`:59`，`db/graphrag-index.json`）、`glyphsToPageText`（`:64-104`，字形坐标→行重建：y 容差 `max(2, fontSize*0.6)` 顺序聚合 O(n)、x 间距 `>max(4, fontSize*0.45)` 补空格）、`extractPageText`（`:106-123`，`extractPdfGeometry(buffer,{maxPages:300})` 限 300 页）、`loadOrExtractText`（`:125-154`，缓存命中条件 `uri 相同 && cached.updatedAt >= entity.updatedAt`，坏缓存重提取；提取失败 `console.warn` 返回 null——红线①）、`splitIntoChunks`（`:156-186`，句边界 `。！？!?；;`/换行切分，目标 900 字符 `CHUNK_TARGET_CHARS:21`，超长句硬切）、`STOP_WORDS`（`:188-193`，中英虚词）、`buildChunkEdges`（`:210-255`：同文献相邻块边权 0.8、术语共现（2-8 篇共现）边权 0.5，总量上限 `MAX_COOCCURRENCE_EDGES=2000:22`）、`computeFingerprint`（`:257-265`，`uri:updatedAt:sha256` 排序拼接 sha256）。

## 3. 内部逻辑与关键流程

`buildLabLiteratureIndex`（`apps/electron/src/main/lib/cslab/cslab-literature-index.ts:309-407`）：

1. `listLiteratureEntities(labId)` 为空 → `{index:null, built:false, message:'实验室中还没有文献'}`（`:312-315`）。
2. 复用判定（红线②）：`!options.force && existing.fingerprint === computeFingerprint(entities) && existing.literatureCount === entities.length` → `{index: existing, built:false, message:'索引已是最新'}`（`:318-327`）。
3. 逐实体 `loadOrExtractText` → 每页 `splitIntoChunks`，chunkId = `<uri>#p<page>-s<index>`（`:330-355`）；每 200 页/每 4 篇 `setImmediate` 让出事件循环（`:346-354`）。
4. chunks 为空：`extracted===0` → `'未能从文献中提取文本（可能为扫描版 PDF）'`，否则 `'文献没有可索引文本'`（`:358-364`）。
5. `buildChunkEdges` → `buildHierarchicalCommunities({nodes: chunks.map(id+title·页码), edges})`（`:366-374`）；`chunkCommunity` 只收 `level===0` 社区成员（红线③：标题由成员派生在 hierarchical-graphrag 内，本文件仅映射，`:376-381`）。
6. 落盘 tmp+rename（`:388-395`）：`{version:1, builtAt, fingerprint, literatureCount, chunks, communities, chunkCommunity}`。
7. 返回 message `'已索引 N 篇文献、M 个切块、K 个社群'`。

`readLiteratureIndex`（`:267-277`）：文件缺失/`version!==1`/chunks 非数组/JSON 抛错 → `null`。`getLiteratureIndexStatus`（`:280-302`）：fingerprint **现算**（不信任索引），无索引时 chunk/community 计数 0。

## 4. 调用者与调用链

入向：

- `apps/electron/src/main/lib/cslab/cslab-graphrag-router.ts:12-18`（`buildLabLiteratureIndex`/`getLiteratureIndexStatus`/`readLiteratureIndex`/`tokenizeLiteratureText` + 两类型）。
- `apps/electron/src/main/lib/cslab/index.ts:34` `export * from './cslab-literature-index'`。
- 测试：`apps/electron/src/main/lib/cslab/cslab-graphrag.test.ts:86/:163`（`buildLabLiteratureIndex`/`readLiteratureIndex`，见 `cslab-graphrag.test.ts.md`）。

出向：`node:crypto createHash`（`:11`）、`node:fs`（`:12`）、`node:path`（`:13`）、`@profer/shared` 类型（`:14`）、`../study/hierarchical-graphrag`（`buildHierarchicalCommunities`，`CommunityNode`/`WeightedEdge` 类型，`:15`）、`./cslab-paths`（assertLabId/resolveLabRelativePath，`:16`）、`./cslab-literature`（listLiteratureEntities/readLiteratureBuffer，`:17`）、`@profer/core/pdf-engine`（`extractPdfGeometry`，动态 import，`:108`）。无网络。

## 5. 数据 I/O、读写与副作用

- 读：`db/lit-text/<entityUuid>.json` 文本缓存；文献 PDF 缓冲（`readLiteratureBuffer`）；`db/graphrag-index.json`。
- 写：`db/lit-text/*.json`（mkdir+writeFile，`:146-148`）；`db/graphrag-index.json`（tmp+rename，`:392-395`）。
- 副作用：`console.warn` 提取失败（`:151`）；`setImmediate` 让出（`:346-354`）。
- 幂等：fingerprint 复用判定幂等；`force` 强制重建。无锁——并发 build 可重复工作（调用方 `cslab-graphrag-router` 用 `pendingIndexBuilds` 单飞保护，见该文件手册）。

## 6. 分支、失败、取消与恢复

- 无文献/无可索引文本/提取全失败：三类空结果 message（§3.1/§3.4）；提取失败单篇跳过（缓存里不落条目，下次重试，`:149-153`）。
- 缓存损坏：`loadOrExtractText` 捕获后重提取（`:133-135`）；索引文件损坏：`readLiteratureIndex` 返回 null → 触发重建。
- 超长文献：300 页上限（`:109`）；切块/边数量控制（900 字符/2000 边）。
- 取消：无 AbortSignal。恢复：重建即恢复；fingerprint 变化由调用方后台重建。

## 7. 权限与权威状态

- 无权限分支（无 sender/role）；路径安全经 `resolveLabRelativePath`（`textCachePath`/`indexFilePath`，`:55-60`）。
- 权威状态：PDF 字符流是文本唯一事实源（红线①，`:5-6`）；`db/lit-text/*.json` 与 `graphrag-index.json` 均为派生缓存（可删重建）；fingerprint（`computeFingerprint`）是失效判据权威。

## 8. 修改影响面

- 改 chunk 形状/id 约定（`<uri>#pN-sM`）→ 影响 `cslab-graphrag-router` 的 `chunkCommunity`/命中结构与 UI 展示。
- 改 `tokenizeLiteratureText` → 检索打分与测试锚点（`cslab-graphrag.test.ts:98-110` 检索断言）。
- 改边构建/社群调用 → 影响 `searchIndex` 社群加权（router `:137-146`）。
- 改 fingerprint 规则 → 复用判定与后台重建触发（router `:178-183`）。
- 需同步测试：`cslab-graphrag.test.ts` 5 用例。

## 9. 测试证据

无专属测试文件（冻结树 glob `**/cslab-literature-index*test*` 零命中）；直接断言在 `apps/electron/src/main/lib/cslab/cslab-graphrag.test.ts`（NOT_RUN）：

- `:85-96` 构建索引：`first.built===true`、`chunks.length>=3`、`communities.length>0`、`literatureCount===2`；二次 `second.built===false` 且 message `'索引已是最新'`（幂等复用）。
- `:134-184` 索引过期后台重建（断言在 router 手册 §9，动作经 `buildLabLiteratureIndex`）。
- 间接：`readLiteratureIndex` 轮询断言 `literatureCount===3`（test:168-176）。
- 未覆盖：`glyphsToPageText` 行重建、`extractPageText`（测试预写缓存绕过 PDF 提取，`cslab-graphrag.test.ts:53-59` 直接写 `db/lit-text/*.json`）、`splitIntoChunks` 边界、`tokenizeLiteratureText` 直接断言、共现边上限、fingerprint 计算、提取失败分支、300 页上限。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 导出与行号 | 已证实 | `:24-309` |
| 复用判定 fingerprint+literatureCount+force | 已证实 | `:318-327` |
| 提取失败不伪造文本（warn+null） | 已证实 | `:149-153` |
| chunkId 约定/边权 0.8 与 0.5/上限 2000 | 已证实 | `:338/:210-255/:22` |
| chunkCommunity 仅 L0 | 已证实 | `:376-381` |
| tmp+rename 落盘 | 已证实 | `:392-395` |
| `buildHierarchicalCommunities` 标题派生规则 | 推断 | 实现位于 `study/hierarchical-graphrag.ts`（非本批文件，未逐行读） |
| pdfjs 几何提取行为 | 未知 | `@profer/core/pdf-engine` 实现未读 |
| 运行结果 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `buildLabLiteratureIndex` 全流程 | §3 | 309-407 | covered |
| `readLiteratureIndex`/`getLiteratureIndexStatus` | §3 | 267-302 | covered |
| `tokenizeLiteratureText`/`splitIntoChunks`/`buildChunkEdges` | §2/§3 | 156-255 | covered |
| `glyphsToPageText`/`extractPageText`/`loadOrExtractText` | §2/§6 | 64-154 | covered |
| 测试断言（构建/幂等） | §9 | test:85-96 | covered |
| PDF 提取/行重建/切块边界 | §9 | — | partial（无直接断言） |
| 运行行为 | §10 | — | unknown（NOT_RUN） |

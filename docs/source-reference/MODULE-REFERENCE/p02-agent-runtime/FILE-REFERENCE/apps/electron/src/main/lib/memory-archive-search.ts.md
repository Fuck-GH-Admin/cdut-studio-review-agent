---
path: apps/electron/src/main/lib/memory-archive-search.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e257e85ed93a42a248d6b2fea6392b17dd4709ab
sha256: e31b7114d81131c2e9c2207f1b096ee634de96b4a4761cd7f117447a2318bbb5
lines: 333
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/memory-archive-search.ts

## 1. 结论与边界

memory-archive 全文检索（FTS5，头注释 :1-23）：用 Node 内置 `node:sqlite` FTS5（零原生依赖 :8）对主题 md 建索引，BM25 排序/摘要高亮/前缀检索。**中英文分词**（:11-16）：中文逐字、英文/数字/代码整块，存储查询同切分（防纯中文 miss）；**惰性索引+进程内缓存**（:18-22）：按 (path,mtime,size) 签名增量重建、命中后回读真实片段。

## 2. 导出与关键符号

导出 6 条（`export` :38/:67/:97/:139/:321/:331）：

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `MemoryArchiveSearchHit` | `:38-50` | 命中形状（相对路径/片段/分数） |
| `cutForMemoryIndex(text)` | `:67-95` | 分词（CJK_RE :65 逐字+整块英文） |
| `buildMemoryMatchExpression(query)` | `:97-102` | AND 聚合表达式 |
| `createMemoryArchiveSearcher(memoryArchivePath)` | `:139-319` | 搜索器工厂（惰性索引+缓存，见 §3） |
| `searchMemoryArchive(path, query, topK=5)` | `:321-329` | 便捷入口 |
| `fingerprintOfText(text)` | `:331-333` | 内容指纹 |

常量：MAX_TOP_K=20/MAX_SNIPPET_CHARS=1500（:31-32）、2MB/2000 文件上限（:34-36）。

## 3. 内部逻辑与关键流程

（大纲+头注释级，333 行）：扫描 md→签名比对（`isFileChanged` :110）→切分入库（FTS5）→BM25 查询→回读真实片段（行号→文件映射缓存）。`collectMarkdownFiles`（:117）、`toRelativePath`（:104）。

## 4. 调用者与调用链

入向（子agent 交叉核）：**生产 4**——`ipc.ts:428`（createMemoryArchiveSearcher :4270，classic 分支）、`memory-search-router.ts:8`（:32/:35）、`hippo-memory-service.ts:17`（cutForMemoryIndex :129/:158）、`adapters/pi-builtin-tools.ts:219-222`（require 懒加载 :221/:240）。出向：`node:sqlite`（:25，:158 内存库）、`node:crypto`/`node:fs`/`node:path`。

## 5. 数据 I/O、读写与副作用

读 md+内存 FTS5 缓存；不写磁盘（索引在内存）。

## 6. 分支、失败、取消与恢复

签名增量（:110）；读失败跳过。不适用取消/恢复。

## 7. 权限与权威状态

「100% 不动」契约（router 注释）：本模块为经典引擎权威；分词一致性（存储=查询）为正确性权威。

## 8. 修改影响面

记忆检索经典引擎；router 回退目标。无专属测试（清单内无）。

## 9. 测试证据

无专属测试文件（清单内无 memory-archive-search.test）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 6 条；分词/惰性索引契约 | 已证实 | :11-23/:31-102 |
| 搜索器实现逐行 | 推断（大纲+契约级） | :139-319 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 6 导出+分词/表达式 | §2 | :38-102 | covered |
| 搜索器内部 | §3/§10 | :139-319 | 推断 |

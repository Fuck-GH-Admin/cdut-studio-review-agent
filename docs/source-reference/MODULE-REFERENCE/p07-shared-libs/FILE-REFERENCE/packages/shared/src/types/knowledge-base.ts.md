---
path: packages/shared/src/types/knowledge-base.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 933e77798ec6b82595cd78a2d8f9837b0458ff1e
sha256: 900f61c77493f3d4ad946519ac874d26ab18cbe5049fcc09c6798e17d97053e1
lines: 91
kind: source
package: p07-shared-libs
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# packages/shared/src/types/knowledge-base.ts

## 1. 结论与边界

个人资料库（Personal Knowledge Base）共享契约（`:3-6` 注释：导入本地文档→本地解析→语义分块→本地存储→资料引用与 Chat/Agent 上下文检索）。9 个类型 + 1 个 IPC 通道常量（7 键）。

不做的事：不解析/不存储（主进程 knowledge 服务受控保存正文与原始副本，`:26` 注释）；不做检索算法。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 形状 |
| --- | --- | --- | --- |
| `KnowledgeItemKind` | type | `:11` | `'pdf'\|'word'\|'wps'\|'presentation'\|'spreadsheet'\|'markdown'\|'text'`（首期 7 类） |
| `KnowledgeItemOrigin` | type | `:14` | `'local'\|'arxiv'` |
| `ResearchMetadata` | interface | `:17-24` | `{arxivId?; doi?; authors?[]; abstract?; year?; categories?[]}`（`:16` 注释：仅研究资料，避免污染普通文档） |
| `KnowledgeItem` | interface | `:27-43` | `{id; title; kind; origin; originalFileName?; mediaType?; fileSize; importedAt; updatedAt; tags[]; research?; remoteId?; syncState:'synced'\|'failed'\|'local-only'; syncError?; lastSyncAttemptAt?}` |
| `KnowledgeReference` | interface | `:46-52` | `{itemId; title; kind; origin; importedAt}`（`:45` 注释：会话持久化轻量引用，**绝不能当普通会话附件**） |
| `KnowledgeLibraryIndex` | interface | `:54-57` | `{version:1; items[]}` |
| `KnowledgeSearchResult` | interface | `:59-65` | `{item; content; startIndex; endIndex; score}` |
| `KnowledgeImportItemResult` | interface | `:67-71` | `{filePath; item?; error?}` |
| `KnowledgeImportBatchResult` | interface | `:73-75` | `{results[]}` |
| `KnowledgeLibrarySnapshot` | interface | `:77-80` | `{items[]; totalItems}` |
| `KNOWLEDGE_IPC_CHANNELS` | const `as const` | `:82-91` | 7 键 `knowledge:*`：`IMPORT_ITEMS`/`LIST_ITEMS`/`GET_ITEM`/`DELETE_ITEM`/`SEARCH_ITEMS`/`GET_LIBRARY_SNAPSHOT`/`SHOW_ITEM_IN_FOLDER`（`:89` 注释：显示受控原始副本） |

## 3. 内部逻辑与关键流程

纯声明。语义要点：`KnowledgeItem.syncState` 三态承载同步结果；`KnowledgeReference` 与附件的区分（`:45`）是防止引用被附件管线处理的契约红线；`KnowledgeSearchResult` 带 `startIndex/endIndex` 片段定位。

## 4. 调用者与调用链

preload `knowledge` 命名空间（`preload/index.ts:2489-2497` 7 桥，`:2499` 附件文本提取走 `chat:extract-attachment-text`）；主进程 knowledge 服务（导入/解析/检索）；对话引用 UI 与 Agent 检索上下文。出向：无 import。

## 5. 数据 I/O、读写与副作用

纯类型，无 I/O（存储权威在主进程：正文与原始文件受控保存，`:26`）。

## 6. 分支、失败、取消与恢复

不适用（无控制流）。失败语义：`KnowledgeImportItemResult.error?` 逐条承载导入失败（批次不整体失败）；`syncState:'failed'` + `syncError` 承载同步失败。

## 7. 权限与权威状态

正文/原始文件的保存权威在主进程（`:26`）；`SHOW_ITEM_IN_FOLDER` 显示的是**受控副本**而非用户原文件（`:89`）；`KnowledgeReference` 的"不可当附件"（`:45`）是处理权归属声明。

## 8. 修改影响面

改字段影响导入 UI、引用渲染与 Agent 检索；`KnowledgeReference` 语义改动需同步会话持久化与附件管线；通道字符串与 preload `:2489-2497`/main 注册同步（`knowledge:<kebab>` 无例外）。

## 9. 测试证据

无直接测试（检索 `KnowledgeItem`/`KNOWLEDGE_IPC_CHANNELS` 于 `*.test.ts` 为 0 命中）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 11 导出、字段/常量值如 §2 | 已证实 | 文件全读 |
| 引用≠附件红线 | 已证实 | `:45` 注释 |
| 受控副本语义 | 已证实 | `:89` 注释 |
| 主进程实际受控保存/校验（如 config-paths 的 UUID 闸门） | 未知 | 服务实现不在本批 |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 11 导出全量 | §2 | covered |
| 语义红线/失败承载 | §3/§6 | covered |
| 权威/边界 | §7 | covered |
| 消费者/影响面 | §4/§8 | covered |
| 测试/未知 | §9/§10 | covered |

---
path: apps/electron/src/main/lib/knowledge-item-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 18f71650014596004b63b5dd6f2763ed50a05aa7
sha256: 3f39947862e4e260aa5fc0207bbc97b4cbef6fc81219ab9ae9e295e6600d24a3
lines: 340
kind: source
package: p01-app-shell
author: docs-r07-author-extra-01-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/knowledge-item-service.ts

## 1. 结论与边界

**通用个人资料库服务**（340 行）：资料导入（≤10 份/次，复制受控副本+抽取正文）、索引读写（`items-index.json` 原子写）、旧 Paperpipe 论文索引只读投影、受控读取/删除、关键词片段检索（通用 + Chat allowlist 专用）。

边界：不解析文档（`document-parser.ts` 负责抽取）；不做远端同步（注释 `:244`、`:269` 论文知识库已移除）；权限=allowlist 传参约束（`searchKnowledgeItemsForChat`），无 sender/role 判定；路径安全由 `config-paths` 的 UUID 正则保证。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `getKnowledgeItemStoredFilePath` | 导出函数 | 143-150 | `(itemId): string\|null` | 受控副本路径（仅 local 来源） |
| `resolveKnowledgeReferences` | 导出函数 | 157-171 | `(itemIds: string[]): KnowledgeReference[]` | 不可信 ID→轻量引用（**0 生产消费者**） |
| `listKnowledgeItems` | 导出函数 | 173-175 | `(): KnowledgeItem[]` | 全量（新索引+旧论文），updatedAt 降序 |
| `getKnowledgeLibrarySnapshot` | 导出函数 | 177-180 | `(): KnowledgeLibrarySnapshot` | `{items, totalItems}` |
| `importKnowledgeItems` | 导出函数 | 182-195 | `(filePaths: string[]): Promise<KnowledgeImportBatchResult>` | 批量导入（逐项容错） |
| `getKnowledgeItem` | 导出函数 | 237-249 | `(itemId): {meta, text}\|null` | 元信息+正文 |
| `deleteKnowledgeItem` | 导出函数 | 261-275 | `(itemId): {itemId, deleted: boolean}` | 删条目+目录 |
| `searchKnowledgeItems` | 导出函数 | 303-318 | `(query, allowedItemIds?, topK = 5): KnowledgeSearchResult[]` | 关键词片段检索 |
| `searchKnowledgeItemsForChat` | 导出函数 | 324-340 | `(query, allowedItemIds: string[], topK = 5): Promise<KnowledgeSearchResult[]>` | Chat allowlist 专用（**仅专属测试消费**） |
| `importOneKnowledgeItem` | 内部函数 | 197-235 | 单文件导入 | 复制+抽取+索引 |
| `kindForExtension`/`mediaTypeForExtension` | 内部函数 | 51-70 | 扩展名→kind/MIME | |
| `normalizeItem` | 内部函数 | 72-95 | 未知→`KnowledgeItem\|null` | 字段清洗/截断 |
| `readIndex`/`writeIndex` | 内部函数 | 97-107 | `items-index.json` 读/原子写 | 经 `safe-file` |
| `readLegacyPaperItems` | 内部函数 | 110-130 | 旧 `index.json` 只读投影 | `LegacyPaper` 形状（`:32-48`） |
| `allKnowledgeItems` | 内部函数 | 132-136 | 新索引 + 旧论文（按 id 去重） | |
| `itemTextPath` | 内部函数 | 138-140 | `<itemDir>/extracted.txt` | |
| `removeLegacyPaperFromIndex` | 内部函数 | 251-259 | 从旧 index.json 滤除 | |
| `keywords` | 内部函数 | 277-279 | 查询→≤12 个 ≥2 字符词 | |
| `scoreKnowledgeText` | 内部函数 | 281-301 | 片段+评分 | 无词面命中也返回开头窗口 |
| 常量 | 内部 | 22-26 | `INDEX_VERSION=1`、`MAX_IMPORT_ITEMS=10`、`MAX_ITEM_FILE_SIZE=100MB`、`MAX_RESULT_CHARS=12000`、`MAX_CHUNK_CHARS=1500` | |

导出计数：`export` 9 条（`:143`、`:157`、`:173`、`:177`、`:182`、`:237`、`:261`、`:303`、`:324`），与源码一致。

## 3. 内部逻辑与关键流程

- **索引读写**（`:97-107`）：`readIndex` 用 `readJsonFileSafe`（`safe-file.ts:39-90`：主文件→`.tmp`→`.bak` 三层容错，`.tmp` 有效会提升为主文件）；每条过 `normalizeItem`（`:72-95`：id/title 非空、kind 枚举、origin ∈ {local, arxiv}，title/originalFileName 500 截断、tags 去重 trim ≤30、`syncState` 归一 `local-only/synced/failed`）。`writeIndex` 用 `writeJsonFileAtomic`（tmp+rename+`.bak` 备份，`safe-file.ts:15-33`）。
- **旧论文投影**（`:110-130`）：读 `<knowledge-base>/index.json`（数组才处理），每条映射为 `kind:'pdf'`、`fileSize:0`、`research` 仅 `source==='arxiv'||arxivId` 时构造；**只读不迁移**（注释 `:109`）。
- **导入**（`:182-235`）：批量入参 1–10 否则 throw `一次最多导入 ${MAX_IMPORT_ITEMS} 份资料`（`:183-185`）；逐文件 try/catch，失败记 `{filePath, error}` 不中断（`:187-193`）。单文件（`:197-235`）：扩展名须 `kindForExtension` 命中 **且** `isSupportedDocumentExtension`（`document-parser.ts:75-77`）→ 否则 `暂不支持导入 … 格式`；存在/非空/≤100MB 校验（`:202-205`）；`extractTextFromFile` 抽正文，空文本 throw（`:207-208`）；`randomUUID()` 生成 id，`copyFileSync` 原件到 `<itemDir>/original<ext>`、`writeFileSync` 正文 `extracted.txt`（`:210-215`）；构造 `KnowledgeItem`（`origin:'local'`、`syncState:'local-only'`、title=去扩展名 basename 500 截断，`:218-230`）→ `index.items.unshift(item)` 头插 + `writeIndex`（`:231-233`）。
- **读取**（`:237-249`）：`allKnowledgeItems` 找 meta；新索引项读 `<itemDir>/extracted.txt`；旧论文读 `<knowledge-base>/papers/<id>/full.md`（注释 `:244`：本地缓存可参与片段检索，不再拉远端）；任何异常 → null。
- **删除**（`:261-275`）：新索引项 → `rmSync(resolveKnowledgeItemDir(id), {recursive, force})` + 索引滤除（`:263-266`）；否则旧论文条目存在 → `removeLegacyPaperFromIndex`（滤 `index.json` 写回，`:251-259`）；都无 → throw `资料不存在`（`:274`）。
- **引用解析**（`:157-171`）：去重后数量须 1–10 否则 throw `资料引用数量必须为 1–10 项`（`:159`）；逐 id 查 `allKnowledgeItems`，**不存在则静默跳过**（注释 `:164-165`：存在性由索引决定，不因正文缺失拒绝）；全空 throw `所选资料不存在或已删除`（`:169`）；`importedAt: Date.now()`（调用时刻，`:167`）。
- **检索**（`:277-318`、`:324-340`）：`keywords(query)` 小写按空白/中英标点切词、取 ≥2 字符去重前 12 个（`:277-279`）；`scoreKnowledgeText`（`:281-301`）：无词面命中也返回 `[0, 1500)` 开头窗口（注释 `:288-289`：附件资料不能因词面不匹配丢失），命中时从 `min(位置)-300` 起截 1500 字符，`score = 命中次数 + 标题命中*0.5`，无命中 score=0；累计 `MAX_RESULT_CHARS=12000` 后跳过后续（`:313`）；按 score 降序取 `min(topK, 20)`（`:317`）。`searchKnowledgeItems` 可选 allowlist（`allowedItemIds` 为 undefined 则全量，`:306-309`）；`searchKnowledgeItemsForChat` **必须** allowlist（空 allowlist 直接 `[]`，`:326`），且 `async`（内部无 await，签名兼容 Promise 调用方）。

## 4. 调用者与调用链

- 入向（全冻结树 `grep knowledge-item-service + 9 导出名`，apps+packages 全文件类型）：
  - `apps/electron/src/main/ipc.ts:8035-8079` 各 `KNOWLEDGE_IPC_CHANNELS` handler（动态 `require('./lib/knowledge-item-service')`）：`knowledge:import-items`（入参校验 1-10 项/路径 ≤4096，`:8036-8040`）、`knowledge:list-items`（`:8043-8046`）、`knowledge:get-library-snapshot`（`:8048-8051`）、`knowledge:get-item`/`delete-item`（itemId ≤160，`:8053-8063`）、`knowledge:search-items`（query ≤500、itemIds ≤10、topK 1-20，`:8065-8071`）、`knowledge:show-item-in-folder`（`getKnowledgeItemStoredFilePath` + `shell.showItemInFolder`，无副本 throw，`:8073-8079`）。通道值 `packages/shared/src/types/knowledge-base.ts:83-90`。
  - **`resolveKnowledgeReferences` 全冻结树 0 消费者**（检索范围：冻结树全文件、排除本文件；含测试）。
  - **`searchKnowledgeItemsForChat` 仅 `knowledge-item-service.test.ts:44`、`:56` 两处测试调用**（同上范围；0 生产调用）。
- 出向：`./config-paths`（`getKnowledgeBaseDir`/`getKnowledgeItemDir`/`getKnowledgeItemsIndexPath`/`resolveKnowledgeItemDir`，`:13-18`；`resolveKnowledgeItemDir` 强制 UUID 正则 + root 内约束，`config-paths.ts:1218-1229`）、`./document-parser`（`extractTextFromFile`/`isSupportedDocumentExtension`，`:19`）、`./safe-file`（`readJsonFileSafe`/`writeJsonFileAtomic`，`:20`）、`node:crypto`/`node:fs`/`node:path`（`:1-3`）、`@profer/shared` 类型（`:4-12`）。

## 5. 数据 I/O、读写与副作用

- 磁盘读：`items-index.json`、旧 `index.json`、`papers/<id>/full.md`、`extracted.txt`、原件。
- 磁盘写：导入时复制原件 + 写 `extracted.txt` + `items-index.json`（原子写 tmp+rename+`.bak`）；删除时 `rmSync` 整目录 + 索引写回；旧论文删除写回 `index.json`。
- 网络：**无**（注释明确 paperpipe 远端已移除，`:244`、`:269`）。
- 副作用：`config-paths` 侧目录自动创建（`getKnowledgeBaseDir`/`getKnowledgeItemsDir` mkdir，`config-paths.ts:1194-1215`）；`resolveKnowledgeItemDir` 不创建（读/删路径）。
- 并发：无锁；`unshift`+`writeIndex` 为读-改-写（并发导入可能互相覆盖，照实记录）。

## 6. 分支、失败、取消与恢复

- 导入失败逐项容错（`:187-193`）；单文件校验链（路径/扩展名/存在/空/100MB/解析空）各自 throw 中文错误（`:198-208`）。
- 读取失败→null（`:246-248`）；删除不存在→throw `资料不存在`（`:274`）。
- 崩溃恢复：`writeJsonFileAtomic`/`readJsonFileSafe` 的 `.tmp`/`.bak` 链（`safe-file.ts`）保证索引损坏可回退；已复制的 `original/extracted.txt` 若索引写失败成为孤儿目录（无自动清理，照实记录）。
- 取消：无（同步 fs + 单 await 的 `extractTextFromFile`）。
- 边界：`searchKnowledgeItemsForChat` 为 `async` 但内部同步（`:324-340`）；`scoreKnowledgeText` 无命中仍返回开头窗口（score 0）。

## 7. 权限与权威状态

- 无 sender/role 检查；安全模型：
  - 路径：itemId 必须 UUID（`config-paths.ts:1218-1228`，`resolveKnowledgeItemDir` throw `资料标识无效`）+ root 内约束；导入源路径来自 renderer（IPC 仅校验 ≤4096 字符，`ipc.ts:8036`）。
  - 数据最小化：`getKnowledgeItemStoredFilePath` 仅返回应用受控副本、不暴露用户源路径（注释 `:142`）；索引不记录原始绝对路径（测试断言，`knowledge-item-service.test.ts:33`）。
  - allowlist：`searchKnowledgeItemsForChat` 只对传入 id 集合检索（`:327-330`），注释 `:322-323` 明确不接受任意目录/remoteId。
- 权威状态：`items-index.json` 为权威元信息；旧 `index.json` 为遗留只读镜像（同 id 以新索引优先，`:132-136`）。

## 8. 修改影响面

- IPC `knowledge:import-items/list-items/get-item/delete-item/search-items/get-library-snapshot/show-item-in-folder`（`knowledge-base.ts:83-90`）+ preload + 资料库 UI（域外）。
- `KnowledgeItem`/`KnowledgeSearchResult`/`KnowledgeReference` 形状（`@profer/shared`）。
- `normalizeItem` 收紧会影响旧索引兼容读取；`scoreKnowledgeText` 改动影响 Chat 检索片段。
- 测试：`knowledge-item-service.test.ts`（4 用例）直接覆盖导入/删除/allowlist，改动需同步。

## 9. 测试证据

- 直接测试：`apps/electron/src/main/lib/knowledge-item-service.test.ts`（61 行，`bun:test`，**4 test**，NOT_RUN）。mock 边界：**真实 fs** + `mkdtempSync` 临时目录 + `PROFER_CONFIG_DIR` 重定向配置根（`:10-12`，`config-paths.resolveConfigDir` 尊重该覆盖，`config-paths.ts:57-60`）；模块隔离用动态 import 带 `?test=<timestamp>-<random>` 查询串（`:12`）；`afterEach` 删临时目录（`:15-18`）。
- 断言摘要：① 11 份导入 reject `一次最多导入 10 份资料` 且 `listKnowledgeItems()` 为空（`:22-23`）；② 导入后 `items-index.json` **不含源绝对路径**、含 `private-note.md`、`getKnowledgeItem(...).text` 含正文（`:33-35`）；③ 删除后 `getKnowledgeItem` 为 null 且 `searchKnowledgeItemsForChat` 返回 `[]`（`:43-44`）；④ allowlist 只含一份时搜索结果 id 只有允许项、内容不含 `forbidden-token`、被拒项正文仍可读（`:57-59`）。
- 未覆盖：`resolveKnowledgeReferences`（0 消费者）、旧论文投影/删除、`getKnowledgeLibrarySnapshot`、`getKnowledgeItemStoredFilePath`、100MB/空文本/不支持格式错误分支、并发写。
- `NOT_RUN`：未运行 bun test/产品测试/typecheck/build/GUI；测试断言≠已运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 9 导出签名与常量 | 已证实 | `:22-340` |
| 导入 1-10 限制/逐项容错/头插 | 已证实 | `:182-235` |
| 索引原子写+`.bak` 容错 | 已证实 | `safe-file.ts:15-90` |
| 旧论文只读投影、同 id 新索引优先 | 已证实 | `:110-136` |
| 无词面命中也返回开头窗口（score 0） | 已证实 | `:288-300` |
| `resolveKnowledgeReferences` 0 消费者 | 已证实 | 全冻结树检索（§4 范围） |
| `searchKnowledgeItemsForChat` 仅测试消费 | 已证实 | 同上（`knowledge-item-service.test.ts:44,56`） |
| 索引不记录源绝对路径 | 已证实 | 测试断言 `:33`（静态读） |
| 并发导入读-改-写竞态 | 推断 | 无锁实现（`:231-233`） |
| 测试通过与否 | 未知 | NOT_RUN |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `readIndex`/`writeIndex`/`normalizeItem` | §3/§5 | 72-107 | covered |
| `readLegacyPaperItems`/`allKnowledgeItems` | §3/§7 | 110-136 | covered |
| `getKnowledgeItemStoredFilePath` | §3/§7 | 143-150 | covered |
| `resolveKnowledgeReferences` | §3/§4 | 157-171 | covered |
| `importKnowledgeItems`/`importOneKnowledgeItem` | §3/§9 | 182-235 | covered |
| `getKnowledgeItem`/`deleteKnowledgeItem` | §3 | 237-275 | covered |
| `keywords`/`scoreKnowledgeText`/双检索 | §3/§6 | 277-340 | covered |
| 旧论文删除/`removeLegacyPaperFromIndex` | §3 | 251-275 | partial（无测试） |
| 并发写竞态 | §10 | 231-233 | unknown |
| 运行结果 | §10 | — | unknown（NOT_RUN） |

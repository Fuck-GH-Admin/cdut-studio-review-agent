---
path: apps/electron/src/main/lib/hippo-memory-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 489e6b27c84f68b059b22fbb774fda3baf00b86c
sha256: 69cc750d0d5c5c1f343886ec8848437bb493ce0f292539832a4e8c3dcc910873
lines: 195
kind: source
package: p01-app-shell
author: docs-r07-author-extra-01-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/hippo-memory-service.ts

## 1. 结论与边界

**海马体终身记忆检索服务**（195 行）：把 memory-archive 目录的 `.md` 文档建为「文档↔实体」共现图并缓存（带目录指纹失效），查询经 `cutForMemoryIndex` 切词→种子实体→个性化 PageRank→文档降序召回，返回与经典 FTS5 检索同形的 `MemoryArchiveSearchHit[]`。

边界：与经典引擎 `memory-archive-search.ts` 解耦（路由在 `memory-search-router.ts`）；不写索引文件（纯读+内存图）；不做权限判断；单例 `hippoMemoryService` 全进程共享缓存。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `HippoMemoryService` | 导出类 | 100-192 | 见下两行 | 检索服务 |
| `search` | 公开方法 | 153-186 | `(memoryArchivePath, query, topK = 5): Promise<MemoryArchiveSearchHit[]>` | 主检索入口 |
| `clearCache` | 公开方法 | 189-191 | `(): void` | 清图谱缓存（测试/显式刷新） |
| `hippoMemoryService` | 导出常量 | 195 | `new HippoMemoryService()` | 全进程单例 |
| `ensureGraph` | 私有方法 | 108-145 | `(archivePath, docs): GraphCacheEntry` | 建图/复用缓存 |
| `cache` | 私有字段 | 102 | `Map<string, GraphCacheEntry>` | 按 archivePath |
| `collectDocs` | 内部函数 | 56-77 | `(dir): DocEntry[]` | 递归收 `.md`（跳过点文件） |
| `fingerprintOfDocs` | 内部函数 | 80-82 | `(docs): string` | 数量+每文件 path/size/mtime |
| `extractSnippet` | 内部函数 | 85-98 | `(full, queryTokens): {content,startIndex,endIndex}` | 命中点前 150 字起 ≤1500 字符 |
| `DocEntry`/`GraphCacheEntry` | 内部接口 | 36-53 | 见源码 | 元信息/缓存项 |
| 常量 | 内部 | 21-33 | `MAX_FILES=2000`、`MAX_FILE_BYTES=2MiB`、`MAX_TOKENS_PER_DOC=200`、`MAX_SNIPPET_CHARS=1500`、`DOC_PREFIX='doc::'`、`PPR_ALPHA=0.15`、`PPR_MAX_ITER=15` | 内存守卫 |

导出计数：`export` 2 条（`:100` 类、`:195` 单例），与源码一致。

## 3. 内部逻辑与关键流程

- **collectDocs**（`:56-77`）：递归 `readdirSync(withFileTypes)`；跳过 `.` 开头（`:62`）；仅 `.md`（大小写不敏感，`:66`）且 `out.length < MAX_FILES`；`statSync` 失败/非文件/`size > 2MiB` 跳过（`:68-69`）；相对路径统一 `/` 归一（`:70`）；记录 size 与 `Math.floor(mtimeMs)`。
- **ensureGraph**（`:108-145`）：key=`resolve(archivePath)`；指纹一致直接返回缓存（`:111-112`）。重建：每文档建 `doc::<rel>` 节点（`isDoc=true`）并记 abs/rel 映射（`:119-122`）；读全文（失败 `continue`，该文档仍建点但无边，`:124-125`）；`cutForMemoryIndex(text)` 统计词频取 Top200 token（`:128-134`）；文档↔token 无向边权重=词频（`:136-139`）。写缓存（`:142-143`）。
- **search**（`:153-186`）：`collectDocs`（每次调用全量重扫目录）→ `ensureGraph`（指纹比对决定是否重建）→ `cutForMemoryIndex(query)` 得 queryTokens，种子=与图中实体节点交集（`:158-159`）；**种子为空 → 返回 `[]`**（`:160`）→ `computePersonalizedPageRank(seeds, 0.15, 15)`（`:162`）→ `limit = clamp(topK, 1, MAX_FILES)`（`:163`）→ 降序取前 limit（`:164`）→ 每条重读全文（失败 `continue`）`extractSnippet` 截片段（`:166-184`）→ `{relativePath, content, startIndex, endIndex, score, matchedTokens: seeds}`。
- **extractSnippet**（`:85-98`）：在原文找首个命中 token（先大小写敏感再小写回退，取最早位置，`:88-93`）；`start = max(0, hit-150)`（无命中取 0）、`end = min(len, start+1500)`（`:95-96`）。

## 4. 调用者与调用链

- 入向（全冻结树 `grep hippo-memory-service|hippoMemoryService|HippoMemoryService`，apps+packages 全文件类型）：
  - `apps/electron/src/main/lib/memory-search-router.ts:9` import `hippoMemoryService`；`:29` `hippoMemoryService.search(memoryArchivePath, query, topK)`（`engineType === 'hipporag'` 分支，异常回退 `searchMemoryArchive` 经典引擎，`memory-search-router.ts:27-33`）。
  - 无测试文件引用本模块（检索范围同上；`hippo-memory-graph.test.ts` 测的是图层）。
- 出向：`./memory-archive-search` 的 `cutForMemoryIndex` 与 `MemoryArchiveSearchHit` 类型（`:17`；切词实现 `memory-archive-search.ts:67-94`：中文逐字、非中文整块）；`./hippo-memory-graph` 的 `HippoMemoryGraph`（`:18`）；`node:fs`/`node:path`（`:15-16`）。

## 5. 数据 I/O、读写与副作用

- 输入：`memoryArchivePath`（绝对路径）、`query`、`topK`；输出 `MemoryArchiveSearchHit[]`。
- 磁盘读：`readdirSync`/`statSync`/`readFileSync`（建图时读每文档一次、召回时对命中文档再读一次）；**不写盘**。
- 网络：无。
- 缓存：`cache`（`Map<archivePath, {fingerprint, graph, docAbsPaths, docRelPaths}>`）；指纹=文档数+每文件 `rel:size:mtime`（`:80-82`），目录任何 .md 增删改（mtime/size 变化）都会触发重建；**缓存无上限条目数、无 TTL**（仅 `clearCache` 或进程退出释放）。
- 副作用：进程内存（图结构+两个 Map）；无日志（本文件无 console）。

## 6. 分支、失败、取消与恢复

- 种子无命中 → `[]`（`:160`）；空图 → PPR 返回空 Map → `[]`。
- 文件读取失败：建图阶段 `continue`（文档保留节点但无边，`:124-125`）；召回阶段 `continue` 跳过该命中（`:173`）——不抛错。
- 失败恢复：无持久状态；指纹机制保证目录变更后自动重建。
- 取消：无（async 但内部全同步 I/O，无 AbortSignal）。
- 边界：`collectDocs` 每次 `search` 全量重扫（大目录开销大）；`topK` 被 clamp 到 `[1, 2000]`（`:163`）；单文档 token 超 200 截断（`:132-134`）。

## 7. 权限与权威状态

- 无权限分支，依据：本文件无 sender/role 检查；`memoryArchivePath` 由调用方（路由→记忆配置）提供，本文件不做 root 内约束（与 `git-diff-service` 的 normalizeSafePath 不同，照实记录）。
- 权威状态：检索结果以目录内 `.md` 文件内容为权威；图与缓存是派生副本（指纹失效重建）。

## 8. 修改影响面

- 消费方：`memory-search-router.ts:29`（`hipporag` 引擎路径）；`MemoryArchiveSearchHit` 形状（`memory-archive-search.ts:52-56`）契约共享，改动需同步经典引擎返回形状。
- 切词依赖 `cutForMemoryIndex`（`memory-archive-search.ts:67-94`）：改其分词规则会同时改变建图 token 与查询种子（耦合点）。
- 常量（`MAX_FILES`/`MAX_FILE_BYTES`/`MAX_TOKENS_PER_DOC`）影响内存占用与召回覆盖。
- 测试缺口：无专属测试（§9）。

## 9. 测试证据

- 直接测试：**无**。检索范围：冻结树全文件 `grep hippo-memory-service|hippoMemoryService|HippoMemoryService`，仅 `memory-search-router.ts` 消费。
- 间接证据：`hippo-memory-graph.test.ts` 覆盖图层（§同批手册），不覆盖本文件的建图/指纹/切词/片段逻辑。
- 未覆盖：指纹失效重建、Top200 截断、片段截取、种子过滤、`clearCache`。
- `NOT_RUN`：未运行 bun test/产品测试/typecheck/build/GUI；测试断言≠已运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出（类+单例）与方法签名 | 已证实 | `:100-195` |
| 指纹失效=数量+path/size/mtime | 已证实 | `:80-82`、`:111-112` |
| 种子过滤与空种子返回 [] | 已证实 | `:158-160` |
| 建图读失败→节点无边、召回读失败→跳过 | 已证实 | `:124-125`、`:173` |
| 每次 search 全量 collectDocs | 已证实 | `:154` |
| 缓存无条目上限/TTL | 已证实 | `:102`、`:142-143`（仅 clearCache 清空） |
| 无路径授权约束 | 已证实 | 全文无 root 校验（对照 §7） |
| memoryArchivePath 来源（授权目录） | 未知 | 调用链上游（记忆配置）域外 |
| 大目录检索性能 | 未知 | NOT_RUN |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `collectDocs` | §3/§5 | 56-77 | covered |
| `fingerprintOfDocs`/缓存失效 | §3/§5 | 80-82,108-145 | covered |
| `ensureGraph` 建图 | §3 | 108-145 | covered |
| `search` 主流程 | §3/§6 | 153-186 | covered |
| `extractSnippet` | §3 | 85-98 | covered |
| `clearCache` | §2 | 189-191 | covered |
| 切词耦合 | §4/§8 | 129,158 | covered（跨文件） |
| 性能/真实检索质量 | §10 | — | unknown（NOT_RUN） |

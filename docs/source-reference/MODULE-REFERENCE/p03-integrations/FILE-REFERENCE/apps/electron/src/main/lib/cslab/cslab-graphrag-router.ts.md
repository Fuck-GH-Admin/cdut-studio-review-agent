---
path: apps/electron/src/main/lib/cslab/cslab-graphrag-router.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0d4898305cefb3486ae5ec5811d731150ad7b44c
sha256: a463866be7458512dd3ea8d68ba83ea4a139d70c416409083fd092d4f704f344
lines: 212
kind: source
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-graphrag-router.ts

## 1. 结论与边界

实验室**跨文献分层检索路由**（运行时代码）：复用 `study/hierarchical-graphrag.ts` 的 Leiden 分层社区，检索为**本地词法 BM25 近似 + 社群加权**，不引入向量库或外部服务（文件头 `apps/electron/src/main/lib/cslab/cslab-graphrag-router.ts:1-5`）。对外两个入口：`searchLabLiterature`（检索）与 `buildLiteratureIndex`（显式构建）。

边界：索引构建/读取委托 `cslab-literature-index.ts`；打分/摘要是本文件职责；无持久写（除触发索引重建）；无网络。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `searchLabLiterature` | 导出异步函数 | 170 | `(input: CsLabLiteratureSearchInput): Promise<CsLabLiteratureSearchResult>` | 检索入口 |
| `buildLiteratureIndex` | 导出异步函数 | 200 | `(labIdInput, force = false): Promise<CsLabLiteratureSearchResult>` | 显式构建入口 |

内部：常量 `DEFAULT_TOP_K=5`（`:23`）、`MAX_TOP_K=20`（`:24`）、`EXCERPT_MAX_CHARS=500`（`:25`）；`pendingIndexBuilds: Map<labId, Promise<void>>`（`:28`，单飞表）；`scheduleLiteratureIndexRebuild`（`:31-42`）、`buildExcerpt`（`:44-68`）、`computeDocumentFrequency`（`:70-80`）、`scoreChunk`（`:82-105`）、`searchIndex`（`:107-168`）。

## 3. 内部逻辑与关键流程

### 3.1 检索主流程 `searchLabLiterature`（`apps/electron/src/main/lib/cslab/cslab-graphrag-router.ts:170-198`）

1. `assertLabId(input.labId)`；query 去空白，空 → `{ok:false, hits:[], message:'请输入检索关键词'}`（`:173-174`）。
2. `readLiteratureIndex` 命中时核对 `getLiteratureIndexStatus().fingerprint`——不一致先用**旧索引即时响应**并 `scheduleLiteratureIndexRebuild`（单飞：`pendingIndexBuilds` 有 labId 即跳过，失败 `console.warn` 不影响检索，`:178-185` 与 `:31-42`）；无索引则**同步** `buildLabLiteratureIndex`，构建不出 → `{ok:false, message: built.message}`（`:186-190`）。
3. `searchIndex(index, {...input, labId, query})`；整段 try/catch，异常转 `{ok:false, message}`（`:191-197`）。

### 3.2 打分与排序 `searchIndex`（`:107-168`）

- 查询词化（`tokenizeLiteratureText`，词频进 `queryTerms` 权重）；无有效词 → `ok:false` `'请输入可检索的关键词'`（`:113-115`）。
- 范围：`input.literatureUri` 过滤 chunks（`:117-119`）；`computeDocumentFrequency` 在范围内统计 df（`:121`）。
- `scoreChunk`（`:82-105`）：BM25 近似——`queryWeight × (1+log(1+tf)) × idf`，`idf = log(1 + totalChunks/max(1,df))`；**标题命中额外 `+1.5×idf`**；tf=0 且标题无词跳过。
- 过滤 `score>0`、按分降序；无命中 → `ok:true` `'没有匹配的文献切块'`（`:128-133`）。
- 社群加权（`:135-146`）：取前 3 命中块的 L0 社区 id 集，同社区其余块 `score *= 1.1`，重排序。
- limit = `clamp(floor(topK ?? 5), 1, 20)`（`|| DEFAULT_TOP_K` 兜底非数与 0——topK=0 亦落默认 5，`:148-151`）；命中构造 `{chunkId, literatureUri, title, page, excerpt, score, communityId, communityTitle:'未聚类' 兜底}`（`:153-164`）。
- `buildExcerpt`（`:44-68`）：句切分后按 `命中词数/max(8, 句词数)` 排序拼接，达到 500 字符停（60% 即 300 字符可提前停），空回退原文截断。

### 3.3 显式构建 `buildLiteratureIndex`（`:200-212`）

`buildLabLiteratureIndex(labId, {force})` → 形如检索结果的 `{ok: !!index, builtAt, hits: [], message}`。

## 4. 调用者与调用链

入向（冻结树检索）：

- `apps/electron/src/main/lib/cslab/cslab-graphrag.test.ts:99/:129/:135/:165`（`searchLabLiterature`）。
- `apps/electron/src/main/lib/cslab/index.ts:35` `export * from './cslab-graphrag-router'`。
- IPC 路由层：`cslab-router.ts:155` 导入块含 `./cslab-graphrag-router`（检索经主路由分发，具体 handler 见 `cslab-router.ts.md`）。

出向：`@profer/shared` 类型（`:6-10`）、`./cslab-literature-index`（buildLabLiteratureIndex/getLiteratureIndexStatus/readLiteratureIndex/tokenizeLiteratureText + 类型，`:11-18`）、`./cslab-paths`（assertLabId，`:19`）。无网络/无磁盘直接写。

## 5. 数据 I/O、读写与副作用

- 读：`db/graphrag-index.json`（经 literature-index）；fingerprint 现算（读实体表）。
- 写：仅间接——`scheduleLiteratureIndexRebuild`/同步 build 触发 literature-index 落盘（`db/lit-text`、`graphrag-index.json`）。
- 副作用：`console.warn` 后台重建失败（`:36`）；无其它全局状态（`pendingIndexBuilds` 为进程内单飞表）。
- 幂等：检索只读；重建单飞去重。

## 6. 分支、失败、取消与恢复

- 空查询（两处文案不同：入口 `'请输入检索关键词'` `:174`、词化后 `'请输入可检索的关键词'` `:114`）；无命中（`ok:true` 空 hits）；构建失败（`ok:false` + built.message）。
- 索引过期：旧索引先响应 + 后台重建（`:178-185`）——**同步等待重建被显式避免**（测试锚定，`cslab-graphrag.test.ts:134-184`）。
- 异常全兜底转 message（`:191-197`）；无取消机制。

## 7. 权限与权威状态

- 无权限分支（无 sender/role）；`assertLabId` 唯一入口校验（`:171/:201`）。权威状态在 literature-index/实体表（本文件无状态权威）。

## 8. 修改影响面

- 改打分/社群加权 → 检索排序变化，测试 `cslab-graphrag.test.ts:98-127` 直接锚定命中次序/范围。
- 改「旧索引先响应」策略 → `:134-184` 用例（stale 立即返回 + 后台重建）将失败。
- 入口签名影响 `cslab-router.ts` 检索 handler 与渲染端检索面板。

## 9. 测试证据

直接测试：`apps/electron/src/main/lib/cslab/cslab-graphrag.test.ts`（185 行，1 describe、5 test；NOT_RUN）。断言（详见 `cslab-graphrag.test.ts.md`）：`:98-110` 检索命中——`ok`、`hits[0].title` 含 'Interfacial Impedance'、excerpt 非空、`communityId` 非空；`:112-127` 范围限定——`hits.every(literatureUri===target.uri)`；`:128-132` 空查询 `ok===false`；`:134-184` 过期索引——`stale.hits` 长度 0（旧索引即时响应）→ 轮询 40×50ms 至 `literatureCount===3`（`rebuilt===true`）→ `fresh.hits.length>0`。未覆盖：`buildExcerpt` 句选择细节、`scoreChunk` 标题加权数值、`buildLiteratureIndex` 显式入口、`scheduleLiteratureIndexRebuild` 失败分支、topK 边界（1/20/非数）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出与行号、打分公式（idf/tf/标题 +1.5×idf） | 已证实 | `:82-105/:170-212` |
| 社群加权前 3 命中社区 ×1.1 | 已证实 | `:135-146` |
| 过期索引旧结果先响应+单飞后台重建 | 已证实 | `:178-185/:28-42` |
| limit clamp(1,20)、默认 5 | 已证实 | `:148-151` |
| 两处空查询文案不一致 | 已证实 | `:174` vs `:114`（照实记录） |
| BM25 近似非精确 BM25 | 已证实 | `:3-4` 注释 + `:82-105` 公式 |
| 运行结果 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `searchLabLiterature` 全分支 | §3.1 | 170-198 | covered |
| `searchIndex`/`scoreChunk`/`buildExcerpt`/DF | §3.2 | 44-168 | covered |
| `scheduleLiteratureIndexRebuild` 单飞 | §3.1 | 28-42 | covered |
| `buildLiteratureIndex` | §3.3 | 200-212 | covered |
| 测试断言（命中/范围/空查询/过期重建） | §9 | test:98-184 | covered |
| 打分数值/摘录细节/topK 边界 | §9 | — | partial（无断言） |
| 运行行为 | §10 | — | unknown（NOT_RUN） |

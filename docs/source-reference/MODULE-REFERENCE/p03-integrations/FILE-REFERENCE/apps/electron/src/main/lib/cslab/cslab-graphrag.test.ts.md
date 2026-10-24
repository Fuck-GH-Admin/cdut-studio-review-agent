---
path: apps/electron/src/main/lib/cslab/cslab-graphrag.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6d4c6f78d2500d544e10f448e18f611cddeacc7a
sha256: 3ebcc425e4f54244aae1a69ff7eb018d322b61b569f570a97b226df38b3dab8f
lines: 185
kind: test
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-graphrag.test.ts

## 1. 测试目标

跨文献索引与检索测试，**不依赖真实 PDF**（文件头 `apps/electron/src/main/lib/cslab/cslab-graphrag.test.ts:1-4`）：通过预写 `db/lit-text/*.json` 文本缓存，验证 `cslab-literature-index.ts` 的切块/社群/幂等复用与 `cslab-graphrag-router.ts` 的检索排序、范围限定、空查询与过期索引后台重建。

## 2. 用例清单

1 个 `describe`、5 个 `test`（`:85/:98/:112/:128/:134`）。夹具（`beforeAll :16-72`）：临时配置根 + `createLab('文献智脑测试实验室')`；用 `getCsLabDatabase`+`upsertEntity` 直接登记 2 篇 lit 实体（`lit-a` 'Interfacial Impedance in Solid-State Batteries' 2 页、`lit-b` 'Raman Spectroscopy of Cathode Materials' 1 页）并**预写** `db/lit-text/<uuid>.json`（`updatedAt: now+1000` 保证缓存命中，`:53-59`）——绕过 PDF 提取。`afterAll :74-81`：`closeAllCsLabDatabases` + 清目录。用例顺序：1→2→3 依赖同一已建索引；4 独立；5 在末尾新增第 3 篇文献制造索引过期（顺序耦合）。

1. `:85-96` 构建索引：切块、社群与幂等复用——`buildLabLiteratureIndex` 两次。
2. `:98-110` 检索命中界面阻抗相关切块——`searchLabLiterature({labId, query:'interfacial impedance', topK:3})`。
3. `:112-127` 文献范围限定生效——`listAssets`（`cslab-iron-cage`）找 Raman 文献，`searchLabLiterature({query:'impedance', literatureUri})`。
4. `:128-132` 空查询返回可读错误——`query:'   '`。
5. `:134-184` 索引过期时先返回旧索引，并在后台完成重建——插入 `lit-c`（Perovskite）+ 预写缓存 → `searchLabLiterature({query:'photoluminescence'})` 立即返回 → 轮询 `readLiteratureIndex` 至 `literatureCount===3` → 再检索命中。

## 3. 真实断言

- `:89-94`：`first.built` true；`first.index?.chunks.length` ≥ 3（2 页切 ≥2 块 + 1 页 ≥1 块）；`first.index?.communities.length` > 0；`first.index?.literatureCount` 为 2。
- `:95-96`：`second.built` false；`second.message` 为 `'索引已是最新'`（fingerprint 复用）。
- `:103-108`：`result.ok` true；`result.hits.length` > 0；`result.hits[0]?.title` 含 `'Interfacial Impedance'`（查询词命中标题+正文，`scoreChunk` 标题加权）；`hits[0].excerpt.length` > 0；`hits[0].communityId.length` > 0（L0 社区映射存在）。
- `:117-125`：`target` truthy（Raman 文献存在）；`result.ok` true；`result.hits.every(hit => hit.literatureUri === target!.uri)` 为 true（范围过滤严格）。
- `:130-131`：空查询 `result.ok` false。
- `:166-168`：`stale.ok` true 且 `stale.hits` 长度为 0（`photoluminescence` 只在新文献，旧索引即时返回不等待）。
- `:170-178`：轮询 40 次×50ms，`index?.literatureCount === 3` 时 `rebuilt = true`；`:179` `expect(rebuilt).toBe(true)`（后台单飞重建完成）。
- `:181-182`：`fresh.hits.length` > 0（重建后命中）。

## 4. 未覆盖与脆弱点

- 未覆盖：`buildLiteratureIndex` 显式入口、`scoreChunk` 数值细节（tf/idf/标题 1.5 权重的精确分）、`buildExcerpt` 句选择、topK 边界（默认 5/上限 20/非数）、社群加权 ×1.1、`scheduleLiteratureIndexRebuild` 失败分支、`tokenizeLiteratureText` 直接断言、真实 PDF 提取链（`extractPageText`/`glyphsToPageText`——被 `lit-text` 缓存预写绕过，`:53-59`）。
- 脆弱点：用例 5 的后台重建断言依赖 2 秒轮询窗口（40×50ms）——慢机器可能 flaky（推断-静态）；用例 2 断言 `hits[0]` 依赖打分排序（若标题加权改动会失败——这正是锚点）；夹具 `updatedAt: now+1000` 隐含 `loadOrExtractText` 的 `cached.updatedAt >= entity.updatedAt` 判定（`cslab-literature-index.ts:131`）。
- 无 mock：真实 SQLite/文件系统；仅绕过 PDF 二进制解析。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 个 test、行号、断言文本 | 已证实 | `apps/electron/src/main/lib/cslab/cslab-graphrag.test.ts:85-184` |
| 夹具预写缓存绕过 PDF 提取 | 已证实 | `:53-59` + `cslab-literature-index.ts:125-154` 判定 |
| 用例 5 顺序耦合（末尾加文献） | 已证实 | `:134-184` 依赖前文索引状态 |
| 轮询 2s 窗口可能 flaky | 推断 | `:170-178` 静态结构 |
| 运行结果 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `buildLabLiteratureIndex` 构建/幂等复用 | §3 | test:85-96 | covered |
| `searchLabLiterature` 命中排序/范围/空查询 | §3 | test:98-132 | covered |
| 过期索引旧响应 + 后台重建 | §3 | test:134-184 | covered |
| 打分数值/摘录/topK 边界/显式构建入口 | §4 | — | unknown（无断言） |
| PDF 提取链（extractPageText/glyphsToPageText） | §4 | — | unknown（被绕过） |
| 实际运行 | §5 | — | unknown（NOT_RUN） |

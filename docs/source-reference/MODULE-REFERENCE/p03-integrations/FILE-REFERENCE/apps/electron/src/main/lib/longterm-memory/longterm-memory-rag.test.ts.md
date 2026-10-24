---
path: apps/electron/src/main/lib/longterm-memory/longterm-memory-rag.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: bee33c29781b4441154b695cf4a2815469bc6146
sha256: 4fb134b066193626b17913aae387c77a42b729170385d8ac596fe2013ae42290
lines: 161
kind: test
package: p03-integrations
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/longterm-memory/longterm-memory-rag.test.ts

## 1. 测试目标

`longterm-memory-rag.ts` 的静态单测：用临时目录 + 显式 `graphPath` 写真实 JSON 图，验证中文召回、权重排序、标签桥接、空查询、topK、上下文块格式、空图、高 `minScore` 下的标题/标签直通，以及无关查询不返回噪声。全部同步、无网络、无 Electron；写盘只用 `writeJsonFileAtomic`，不经过 store 写 API。本轮 `NOT_RUN`：未执行测试。

## 2. 用例清单

1 个 `describe('长期记忆 RAG 检索')`（`:58`），**10 个 `test`**。

**夹具**（`:16-56`）：

- `workDir` 由 `mkdtempSync(join(tmpdir(),'ltm-rag-'))` 创建；`graphPath = workDir/graph.json`。
- `beforeEach`：`invalidateLongTermMemoryIndex()` 清 RAG 索引，`await resetLongTermMemoryCache()` 清 store 缓存（`:47-52`）。
- `afterEach`：`rmSync(workDir,{recursive:true,force:true})`（`:54-56`）。
- `createNode` 默认 `tags:[]`、`weight:1`、`confidence:0.8`、`source:'auto_inferred'`、时间戳 `Date.now()`（`:19-40`）。
- `writeGraph` 直接 `writeJsonFileAtomic(graphPath,{version:1,updatedAt:Date.now(),nodes})`（`:42-45`）。

| # | test 行 | 设置 | 动作 | 真实断言 |
| --- | --- | --- | --- | --- |
| 1 | `:59-75` | 1 节点：标题“状态管理统一使用 Jotai”，内容“写 React 组件时所有状态必须使用 Jotai，严禁使用 useState。”，tags `['jotai','react']` | `searchLongTermMemory('帮我写个计数器组件',{graphPath})` | `hits.length===1`；`hits[0].node.id==='n1'`；`hits[0].score>0` |
| 2 | `:77-87` | 两节点同内容，weight 1/9，标题略不同 | 查询 `'Jotai 管理状态'` | `length===2`；`hits[0].node.id==='high'` |
| 3 | `:89-97` | 节点正文“状态管理请遵循团队统一约定。”，tag `['jotai']`，正文无 jotai | 查询 `'jotai 规范'` | `hits.map(h=>h.node.id)` 含 `'n1'` |
| 4 | `:99-105` | 1 节点 Jotai | 查询 `''`、`'   '`、`'的了和与'` | 三者 `toEqual([])` |
| 5 | `:107-118` | 3 节点 weight 9/6/3，同内容 | 查询 `'Jotai 管理状态'`，`topK:2` | `length===2`；`hits[0].score>=hits[1].score` |
| 6 | `:120-133` | 1 节点 confidence .85 | `buildLongTermMemoryBlock('写组件用什么状态管理',{graphPath})` | `startsWith('<user_longterm_memory>')`；`endsWith('</user_longterm_memory>')`；含 `[Coding Style]`；`length<=1400` |
| 7 | `:135-138` | `writeGraph([])` | `buildLongTermMemoryBlock('任意问题',{graphPath})` | `=== ''` |
| 8 | `:140-146` | 标题 `Jotai`，内容“状态管理规范。” | `search('jotai',{graphPath,minScore:5})` | id 列表含 `'n1'` |
| 9 | `:148-154` | 标题“常用工具 read_file”，内容“用户高频调用该工具。”，tag `['read_file']` | `search('read_file',{graphPath,minScore:5})` | id 列表含 `'n1'` |
| 10 | `:156-160` | 节点 Jotai/React | `search('量子力学与超导材料',{graphPath})` | `toEqual([])` |

## 3. 真实断言

- 断言都是 `searchLongTermMemory` 的返回数组/字段或 `buildLongTermMemoryBlock` 的字符串，没有 mock、spy、计时器。
- 用例 1 只断言 `score>0`，没有断言分数 ≥ `MIN_SCORE`（0.2），也没有断言是 BM25 还是直通使其进入；因此不能据此判断阈值行为。
- 用例 2 只断言高权重排第一，没有断言具体分差或 `weightBoost` 公式。
- 用例 3 只断言包含，不区分 BM25（tag 也进入 `buildDoc`）与标签桥接 bonus 的贡献。
- 用例 4 的 `'的了和与'`：`tokenizeLongTermMemoryText` 会为相邻汉字生成 bigram（`的了`、`了和`、`和与`，源 `:56-61`），所以 token 列表**不是空**；返回空是因为这些 token 不在文档词频中、BM25 为 0（源 `:224-225`）。测试名“纯停用词”描述的是输入字符，不是 tokenize 结果。
- 用例 5 断言 `score[0]>=score[1]`，排序相等也通过；没有断言前两条的具体 id。
- 用例 6 的 `length<=1400` 只覆盖“1 条短命中”的场景；源实现对第一条不检查预算（`:284`），多行/超长场景未测。
- 用例 8/9 用 `minScore:5` 远高于正常分数，证明直通；没有断言 `bypass` 标志（返回类型不含该字段）。

## 4. 未覆盖与脆弱点

**未覆盖**：

- `topK` 为 0/负数/NaN/Infinity；`minScore` 为 0/负数。
- 同分排序 tie-break；`avgLength=0`（空文档）；英文停用词/单字母；跨标点 bigram；标签 `includes` 子串误命中（如查询 `notjotai` 命中 tag `jotai`）。
- 索引 revision 碰撞：直接改 JSON 的 `content/tags` 但保持 `updatedAt` 与节点数；`invalidateLongTermMemoryIndex` 后的重建（beforeEach 有调用，但无专门断言）。
- 超长 content 的 excerpt 截断；`buildLongTermMemoryBlock` 多行预算边界/第一条超限。
- 并发：检索与 store 写同时发生、旧索引读到旧图。
- 中文单字 vs bigram 的 `meaningfulHit` 边界。

**脆弱点**：

- 用例 1 的召回依赖“组件”等词元恰好同时出现在查询与文档；换同义句可能失败，测试名“中文编码偏好”覆盖的是词面匹配，不是语义。
- 用例 4 的名称容易让人误以为验证了“停用词被完全过滤”；实际验证的是“无词频交集”。
- 用例 6 的 `length<=1400` 是当前单行场景的偶然成立，不是预算算法的完整证明。
- 测试直接用 `writeJsonFileAtomic` 写图，绕过 store 的归一化；因此图中的 `version/updatedAt` 与真实写路径不完全一致（真实写会更新 `graph.updatedAt`）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 个 describe、10 个 test | 已证实 | `:58`；`grep -c "test("`=10 |
| 测试使用临时目录，不触碰用户配置 | 已证实 | `:48-49`、`:55` |
| 直接写 JSON，不经过 store 写 API | 已证实 | `:42-45`；未 import store 写函数 |
| 用例 4 的查询仍产生 bigram token | 已证实 | 源 `:56-61`；输入 `:104` |
| 用例 8/9 靠直通通过高 minScore | 已证实 | 源 `:239-240`；测试 `:143`、`:151` |
| 索引 revision 不含内容哈希 | 已证实 | 源 `:98-104` |
| 外部改内容不改 updatedAt 会导致旧索引 | 推断 | revision 公式；未构造 |
| 真实分数/阈值边界 | 未知 | 测试只断言 `>0`/排序 |

## 6. 覆盖表

| 源符号/分支 | 测试用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 中文 bigram 召回 | #1 | `:59-75` | covered（词面） |
| weightBoost 排序 | #2 | `:77-87` | covered |
| 标签桥接 | #3 | `:89-97` | covered |
| 空查询 | #4 | `:99-105` | covered |
| 纯停用词输入 | #4 | `:104` | partial（实际测无词频交集） |
| topK + 降序 | #5 | `:107-118` | covered |
| 上下文块 header/footer/标签 | #6 | `:120-133` | covered |
| 空图 | #7 | `:135-138` | covered |
| 标题直通 | #8 | `:140-146` | covered |
| 标签直通 | #9 | `:148-154` | covered |
| 无关查询过滤 | #10 | `:156-160` | covered |
| topK/minScore 非法值 | — | — | unknown（未覆盖） |
| revision 碰撞/并发 | — | — | unknown（未覆盖） |

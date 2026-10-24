---
path: apps/electron/src/main/lib/longterm-memory/longterm-memory-rag.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: bffcb4430fb5b21df5b7408bc3bed6a473929ed1
sha256: 8a2a2dd3f34d7678ed1440cff75ffe5ce3445935b74714b1132c1f822b2ff280
lines: 296
kind: source
package: p03-integrations
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/longterm-memory/longterm-memory-rag.ts

## 1. 结论与边界

长期记忆的前置检索（Classic RAG）：纯内存 BM25（`k1=1.5,b=0.75`）+ 中英混合词元化（中文单字/相邻 bigram、英文/数字整词）+ 标签桥接 + 强命中直通，按图谱 revision 缓存索引，输出命中节点/分数/摘录，并可组装 `<user_longterm_memory>` 上下文块。运行时模块，含内存索引缓存与读盘（经 store），**零磁盘写入、零数据库**（文件头 `:13`）。

不做的事：不写图谱（`longterm-memory-store.ts`）；不做向量/嵌入/模型调用；不做跨进程共享索引；不做权限校验。索引只在本进程内存。

## 2. 导出与关键符号

导出 5 项：4 个 function、1 个 interface。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `tokenizeLongTermMemoryText` | function | `:50-63` | `(text:string)=>string[]` | 小写；英文/数字 ≥2 字整词（去停用词）；每个汉字单字（去停用词）+ 相邻 bigram |
| `LongTermMemorySearchOptions` | interface | `:193-197` | `{topK?; minScore?; graphPath?}` | 检索选项 |
| `searchLongTermMemory` | function | `:203-253` | `(query, options?) => LongTermMemoryHit[]` | 打分、直通、排序、topK、摘录 |
| `buildLongTermMemoryBlock` | function | `:261-291` | `(query, options?) => string` | 无命中空串；有命中拼 XML 块，预算 1400 字符 |
| `invalidateLongTermMemoryIndex` | function | `:294-296` | `()=>void` | 清空全部路径的索引缓存 |

关键内部符号：

| 符号 | 行 | 作用 |
| --- | --- | --- |
| `BM25_K1/BM25_B` | `:22-23` | `1.5/0.75` |
| `DEFAULT_TOP_K` | `:24` | `4` |
| `MIN_SCORE` | `:26` | `0.2` |
| `BLOCK_MAX_CHARS` | `:28` | `1400` |
| `EXCERPT_MAX_CHARS` | `:29` | `200` |
| `TAG_BRIDGE_BONUS/MAX_MATCHES` | `:31-32` | 每个标签 +0.5，最多 2 个 |
| `COVERAGE_BYPASS/TITLE_COVERAGE_BYPASS` | `:34-36` | `0.6/0.5` |
| `STOP_WORDS` | `:39-44` | 中英停用词集合 |
| `MemoryDoc/MemoryIndex` | `:67-79` | 文档词频、长度、标题词集；索引 revision/docs/docFreq/avgLength |
| `indexCache` | `:81` | `Map<graphPath, MemoryIndex>` |
| `buildDoc` | `:83-96` | 标题+内容+tags 建词频；标题单独建 `titleTerms` |
| `revisionOf` | `:98-104` | `${maxUpdatedAt}:${nodes.length}` |
| `getIndex` | `:106-129` | 读图→算 revision→缓存命中/重建 |
| `scoreBm25` | `:133-145` | 标准 BM25 累加 |
| `countMatchedTags` | `:148-163` | 标签整词包含或全部词元被查询覆盖 |
| `countOverlap` | `:165-171` | 集合交集计数 |
| `buildExcerpt` | `:174-191` | 选与查询重叠最高的句子，截 200 |

## 3. 内部逻辑与关键流程

### 3.1 词元化 `tokenizeLongTermMemoryText`（`:50-63`）

1. `lower = text.toLowerCase()`（`:51`）。
2. 英文/数字：`lower.match(/[a-z0-9]{2,}/g)`，逐词去停用词后 push（`:53-55`）。单字母英文（如 `a`、`C`）不会成为 token。
3. 汉字：`lower.match(/[\u4e00-\u9fa5]/g)` 取所有汉字（忽略标点/空格），逐字 push（若不在停用词），并对相邻汉字 push bigram（`:56-61`）。bigram **不排除停用词**，也不因标点断句——`"状态，管理"` 会产生 `状态`、`态管`、`管理`（跨逗号）。
4. 返回可能含重复 token；调用方 `scoreBm25` 按 queryTermsList 逐项累加，重复 query token 会重复计分（`search` 用 `queryTermsList`，`:224`）；`doc.termFreq` 是词频。

### 3.2 索引 `getIndex`（`:106-129`）

1. `graph = readLongTermMemoryGraph(graphPath)`（`:107`）——经 store 缓存/读盘；读路径可能恢复 `.tmp/.bak`。
2. `revision = revisionOf(graph.nodes, graph.updatedAt)`（`:108`）：取所有节点 `updatedAt` 与图 `updatedAt` 的最大值，拼节点数（`:98-104`）。
3. 缓存命中同 path 且 revision 相同 → 直接返回（`:109-110`）。
4. 否则 `docs = graph.nodes.map(buildDoc)`（`:112`），统计 `docFreq`、`totalLength`、`avgLength`（`:113-126`），写入 `indexCache`（`:127`）。
5. **revision 不含内容哈希**：若外部直接改 JSON 的 `content/tags` 但保持 `updatedAt` 和节点数不变，索引不会重建，检索仍用旧词频。store 自身的写都会更新 `updatedAt` 或图 `updatedAt`，正常路径不会触发；手工编辑/第三方写入是边界。
6. `indexCache` 无容量上限、无 TTL；不同 `graphPath` 各占一项，只有 `invalidateLongTermMemoryIndex` 或进程退出才清。

### 3.3 打分 `searchLongTermMemory`（`:203-253`）

1. `trimmed = query.trim()`；空 → `[]`（`:207-208`）。
2. `graphPath` 默认取配置路径；`topK = Math.max(1, options.topK ?? 4)`；`minScore = options.minScore ?? 0.2`（`:210-212`）。
   - `topK` 无上限；`topK=NaN` 时 `Math.max(1,NaN)=NaN`，`slice(0,NaN)` 返回空数组（未测试）。
   - `minScore` 可被调用方设为 0/负数；直通规则仍可让低分命中进入。
3. `index = getIndex(graphPath)`；空索引 → `[]`（`:214-215`）。
4. `queryTermsList = tokenize(trimmed)`；空 → `[]`（`:217-218`）；`queryTerms` 为 Set，`queryLower` 为小写原文（`:219-220`）。
5. 逐文档（`:223-244`）：
   - `bm25 = scoreBm25(index, doc, queryTermsList)`；`<=0` 直接跳过（`:224-225`）。因此**没有任何查询词命中的文档不会因标签/标题直通被召回**；标签桥接只对已有词频命中的文档加分。
   - `tagMatches = countMatchedTags(node, queryTerms, queryLower)`（`:227`）。
   - `weightBoost = 0.6 + 0.4*min(1, weight/10)`；`confidenceBoost = 0.7 + 0.3*confidence`（`:228-229`）。
   - `score = bm25*weightBoost*confidenceBoost + tagMatches*0.5`（`:230`）。
   - `queryCoverage = |queryTerms ∩ doc.termFreq| / |queryTerms|`；`titleCoverage = |queryTerms ∩ titleTerms| / |queryTerms|`（`:232-234`）。
   - `meaningfulHit = 存在长度≥2 且 doc.termFreq 含该 term`（`:236-238`）。中文单字不算实义命中；英文整词/中文 bigram 算。
   - `bypass = meaningfulHit && (tagMatches>0 || queryCoverage>=0.6 || titleCoverage>=0.5)`（`:239-240`）。
   - `!bypass && score < minScore` → 跳过；否则入 `scored`（`:242-243`）。
6. 按 score 降序排序（`:246`）；同分保持输入顺序（V8 稳定排序，源码未显式 tie-break）。
7. 取前 topK，返回 `{node: 深拷贝节点+tags, score, excerpt}`（`:248-252`）。

**BM25 细节**（`:133-145`）：`idf = log(1 + (N-df+0.5)/(df+0.5))`，恒正；`denominator = tf + 1.5*(1-0.75+0.75*len/avgLen)`；`score += idf * (tf*2.5)/denominator`。`avgLength=0` 时用 1（`:135`）。

**标签桥接**（`:148-163`）：标签小写 trim；若 `queryLower.includes(tagLower)` 计 1；否则标签词元全部出现在 `queryTerms` 计 1；最多计 2。空标签跳过。注意 `includes` 是子串匹配：查询 `"notjotai"` 会命中标签 `"jotai"`。

**摘录**（`:174-191`）：按 `。！？!?\n` 分句；每句 token 集合与 queryTerms 求交，取交集最大（`>`，同分取先出现）；无句子时用整段 content；超过 200 字截断加 `…`。

### 3.4 上下文块 `buildLongTermMemoryBlock`（`:261-291`）

1. `hits = searchLongTermMemory(query, options)`；空 → `''`（`:265-266`）。
2. 固定 header 4 行（`:268-273`）与 footer（`:274`）。
3. `length = header.length + footer.length + 2`（`:277`）。
4. 每条命中：`label = LONGTERM_MEMORY_CATEGORY_META[category].promptLabel`（`:279`；定义 `packages/shared/src/types/longterm-memory.ts:65-74`）；`content` 用节点原文截 200（`:280-282`），**不是** `hit.excerpt`；行格式 `- [label] content (confidence 0.00)`（`:283`）。
5. 预算判断：`lines.length > 0 && length + line.length + 1 > 1400` 才 break（`:284`）。第一条**无条件加入**，所以至少一行；单行通常远小于 1400，但预算不是硬保证（若 header+首行超限，仍会超）。
6. 无行 → `''`（`:288`）；否则 header + 行 + footer（`:290`）。

## 4. 调用者与调用链

### 4.1 入向

| 调用者 | 位置 | 用法 |
| --- | --- | --- |
| IPC `QUERY_TEST` | `longterm-memory-ipc.ts:16`（import）、`:80-83` | `searchLongTermMemory(input?.query ?? '', {topK: input?.topK})` |
| Agent 编排 | `agent-orchestrator.ts:174`（import）、`:1553-1560` | `buildLongTermMemoryBlock(runtimeUserMessage)`，命中块 push 进 `systemContextBlocks` |
| 测试 | `longterm-memory-rag.test.ts:13` | 直接调 `searchLongTermMemory` / `buildLongTermMemoryBlock` / `invalidateLongTermMemoryIndex` |

全冻结树检索未发现其它调用者；渲染层不直接 import。

### 4.2 出向

- `readLongTermMemoryGraph` ← `./longterm-memory-store`（`:18`）。
- `LONGTERM_MEMORY_CATEGORY_META` / 类型 ← `@profer/shared`（`:16`）。
- `getLongTermMemoryGraphPath` ← `../config-paths`（`:17`）。

### 4.3 链路

```
agent-orchestrator 构造上下文 (agent-orchestrator.ts:1553-1560)
  → buildLongTermMemoryBlock(runtimeUserMessage)
  → searchLongTermMemory → getIndex → readLongTermMemoryGraph
  → 命中块进入 <SYSTEM_CONTEXT>（不改静态 System Prompt）

renderer 检索测试 (longterm-memory-atoms.ts:152)
  → preload queryTest (preload/index.ts:4159-4160)
  → ipc QUERY_TEST (longterm-memory-ipc.ts:80-83)
  → searchLongTermMemory
```

## 5. 数据 I/O、读写与副作用

- **输入**：query 字符串、`topK/minScore/graphPath`。
- **输出**：`LongTermMemoryHit[]`（节点深拷贝 + tags 深拷贝、score、excerpt）或 XML 字符串。
- **磁盘**：不直接写；`readLongTermMemoryGraph` 读盘，且可能触发 store 的 `.tmp/.bak` 恢复写（`safe-file.ts:56-82`）。文件头“零额外磁盘写入”（`:13`）指本模块不建索引文件，不排除依赖的恢复写。
- **内存**：`indexCache` 按 path 缓存 `MemoryDoc`（含 node 引用）与 `docFreq`；图更新后旧索引对象被替换，旧对象由 GC 回收。
- **并发**：检索是同步函数，Node 单线程内不会与自身交错；但 `readLongTermMemoryGraph` 可能读到写队列 `rename` 前的旧图，导致一次检索用旧索引；下一次 revision 变化后重建。
- **幂等**：同一图同一 query 的结果确定（排序稳定、无随机）；`indexCache` 只是加速，不改变结果（除非 revision 碰撞）。
- **副作用**：无日志、无网络、无窗口操作。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 空 query | `:207-208` | `[]` |
| 空索引 | `:214-215` | `[]` |
| query 无 token | `:217-218` | `[]`（但中文停用词仍产生 bigram，见 §3.1） |
| 文档 BM25 为 0 | `:224-225` | 跳过，标签/标题直通也不救 |
| 直通条件成立 | `:239-240` | 即使 `score < minScore` 也保留 |
| 非直通且低分 | `:242` | 跳过 |
| 命中为空 | `:265-266` | 块返回 `''` |
| 单行超预算 | `:284` | 第一条仍加入；块可能超 1400 |
| 读图抛错 | `:107` | 异常向上抛；`agent-orchestrator.ts:1561-1563` 与 renderer atom 各自 catch |
| 取消 | 无 | 同步函数，无 AbortSignal |
| 恢复 | revision 变化即重建 | 外部编辑保持 `updatedAt`/节点数时不会重建（§3.2） |

## 7. 权限与权威状态

- **无权限分支**：本文件不接收 sender/role，不做访问控制；任何调用者都可传任意 `graphPath` 读取该路径下的图谱。
- **权威状态**：图谱文件是权威；索引是派生缓存，revision 由 `updatedAt + 节点数` 派生。索引不落盘，进程重启即空。
- **注入边界**：`buildLongTermMemoryBlock` 的注释声明只进入 `<SYSTEM_CONTEXT>`、不进入 `<USER_REQUEST>`、不改静态 System Prompt（`:257-259`）；实际调用点在 `agent-orchestrator.ts:1553-1560` 把块 push 到 `systemContextBlocks`。本文件不校验调用点是否遵守该约定。

## 8. 修改影响面

- 改 `tokenizeLongTermMemoryText` → 影响所有检索召回/分数与 `buildDoc`/`titleTerms`；测试 `:59-160` 的中文/英文/标签用例都会变。
- 改 `MIN_SCORE`/`COVERAGE_BYPASS`/`TITLE_COVERAGE_BYPASS`/boost → 影响注入哪些记忆；无配置项，改常量即全局生效。
- 改 `revisionOf` → 影响索引失效正确性；若改成内容哈希，需评估每次检索的哈希成本。
- 改 `buildLongTermMemoryBlock` 格式/预算 → 影响 `agent-orchestrator` 的上下文长度与模型行为；测试 `:120-133` 断言 header/footer/标签/长度。
- 改 `search` 返回形状 → 影响 IPC `QUERY_TEST`、renderer `longTermMemoryHitsAtom`、`LongTermMemoryView`。
- 无存储格式变更；无迁移。

## 9. 测试证据

本轮 `NOT_RUN`：未执行 `bun test`、typecheck、构建或 Electron/GUI。

直接测试：`apps/electron/src/main/lib/longterm-memory/longterm-memory-rag.test.ts`，1 个 `describe`、**10 个 `test`**（`:59,77,89,99,107,120,135,140,148,156`）。夹具：`mkdtempSync` 临时目录 + 显式 `graphPath`；`beforeEach` 清索引与 store 缓存（`:47-52`）；`afterEach` 删目录（`:54-56`）；`writeGraph` 直接用 `writeJsonFileAtomic` 写图（`:42-45`），**不经过 store 写 API**。

| # | 用例 | 设置/动作 | 真实断言 | 覆盖点/缺口 |
| --- | --- | --- | --- | --- |
| 1 | 中文编码偏好 | 1 节点，查询“帮我写个计数器组件” | `hits.length===1`、`id==='n1'`、`score>0`（`:72-74`） | 中文 bigram 召回；未断言具体分数/阈值 |
| 2 | 权重排序 | 两节点同内容，weight 1/9，查询“Jotai 管理状态” | `length===2`、`hits[0].id==='high'`（`:85-86`） | weightBoost；未断言分差 |
| 3 | 标签桥接 | 正文无 jotai、tag `jotai`，查询“jotai 规范” | id 列表含 `n1`（`:96`） | 标签计入 `buildDoc` + 桥接；未区分 bm25 与 bonus 贡献 |
| 4 | 空/纯停用词 | 查询 `''`、`'   '`、`'的了和与'` | 三者 `[]`（`:102-104`） | 前两者测空；第三者实际因 bigram 不匹配文档而空，**不是** tokenize 返回空 |
| 5 | topK | 3 节点 weight 9/6/3，`topK:2` | `length===2`、`score[0]>=score[1]`（`:116-117`） | topK 截断与降序；未断言具体 id |
| 6 | 上下文块格式 | 1 节点 confidence .85 | 以 `<user_longterm_memory>` 开头/结尾、含 `[Coding Style]`、`length<=1400`（`:129-132`） | header/footer/标签/预算（单行场景） |
| 7 | 空图 | `writeGraph([])` | `buildLongTermMemoryBlock` 返回 `''`（`:137`） | 空索引 |
| 8 | minScore 高 + 标题命中 | 标题 `Jotai`，`minScore:5` | 命中含 `n1`（`:145`） | 标题直通 |
| 9 | minScore 高 + 标签命中 | tag `read_file`，`minScore:5` | 命中含 `n1`（`:153`） | 标签直通 |
| 10 | 无关查询 | 节点 Jotai/React，查询“量子力学与超导材料” | `[]`（`:159`） | 低分过滤；未断言阈值边界 |

**未覆盖**：`topK` 非法值（0/负数/NaN/Infinity）、`minScore` 0/负数、同分 tie-break、`avgLength=0`、英文停用词/单字母、跨标点 bigram、标签 `includes` 子串误命中、索引 revision 碰撞、外部编辑不改 `updatedAt`、超长 content 的 excerpt、块多行预算边界、并发读写下旧索引、`invalidate` 后重建。测试全部直接写 JSON，不验证 store 写 API 产生的 `updatedAt` 变化。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 纯内存 BM25 + 标签桥接 + 直通 | 已证实 | `:133-145`、`:148-163`、`:239-243` |
| 中文单字+bigram、英文/数字 ≥2 整词 | 已证实 | `:50-63` |
| 索引 revision 只含 max(updatedAt) 与节点数 | 已证实 | `:98-104`、`:108-110` |
| 内容变更但 updatedAt/节点数不变时索引不失效 | 推断 | revision 公式；未构造实测 |
| BM25 为 0 的文档不会被标签/标题直通召回 | 已证实 | `:224-225` 在 `:227-243` 之前 |
| 第一条上下文行无条件加入，块可能超 1400 | 已证实 | `:284` 的 `lines.length > 0` 条件 |
| 标签 `includes` 是子串匹配，可能误命中 | 已证实 | `:153` |
| topK 无上限；NaN 会返回空 | 已证实/推断 | `:211`；`slice(0,NaN)` 语义为推断 |
| 本文件无写盘、无网络 | 已证实 | 无 fs/fetch import；仅 `readLongTermMemoryGraph` |
| 检索测试实际覆盖分数阈值边界 | 未知 | 测试只断言 `>0`/排序/包含，无精确分数 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `tokenizeLongTermMemoryText` | 3.1 | `:50-63` | covered |
| `STOP_WORDS` | 3.1 | `:39-44` | covered |
| `buildDoc` | 3.2 | `:83-96` | covered |
| `revisionOf` | 3.2、6 | `:98-104` | covered |
| `getIndex`/`indexCache` | 3.2、5 | `:106-129` | covered |
| `scoreBm25` | 3.3 | `:133-145` | covered |
| `countMatchedTags` | 3.3 | `:148-163` | covered |
| `buildExcerpt` | 3.3 | `:174-191` | covered |
| `searchLongTermMemory` | 3.3、6 | `:203-253` | covered |
| `buildLongTermMemoryBlock` | 3.4、6 | `:261-291` | covered |
| `invalidateLongTermMemoryIndex` | 2、3.2 | `:294-296` | covered |
| 10 个测试断言 | 9 | `:59-160` | covered（静态读） |
| 索引碰撞/外部编辑 | 3.2、10 | — | unknown（未构造） |
